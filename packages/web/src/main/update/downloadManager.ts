import got from 'got'
import type { Progress, Response } from 'got'
import { createWriteStream, createReadStream, promises as fsPromises } from 'fs'
import { pipeline } from 'stream/promises'
import * as path from 'path'
import * as crypto from 'crypto'
import { app } from 'electron'
import type { UpdateInfo as ElectronUpdateInfo } from 'electron-updater'
import type { Readable } from 'stream'
import type { DownloadState, DownloadProgress, DownloadTask } from '@src/types/update'

// DownloadManager类 - 管理文件下载
export class DownloadManager {
  private currentTask: DownloadTask | null = null
  private downloadStream: Readable | null = null
  private progressCallback?: (progress: DownloadProgress) => void
  private stateChangeCallback?: (state: DownloadState, error?: string) => void
  private downloadDir: string

  constructor() {
    this.downloadDir = path.join(app.getPath('userData'), 'pending-updates')
    this.ensureDownloadDir()
  }

  // 确保下载目录存在
  private async ensureDownloadDir() {
    try {
      await fsPromises.mkdir(this.downloadDir, { recursive: true })
    } catch (error) {
      console.error('[DownloadManager] 创建下载目录失败:', error)
    }
  }

  // 设置进度回调
  setProgressCallback(callback: (progress: DownloadProgress) => void) {
    this.progressCallback = callback
  }

  // 设置状态变化回调
  setStateChangeCallback(callback: (state: DownloadState, error?: string) => void) {
    this.stateChangeCallback = callback
  }

  // 开始下载
  async startDownload(updateInfo: ElectronUpdateInfo, baseUrl?: string): Promise<void> {
    if (this.currentTask && this.currentTask.state === 'downloading') {
      throw new Error('已有下载任务正在进行')
    }

    // 获取第一个文件信息
    const fileInfo = updateInfo.files?.[0]
    if (!fileInfo || !fileInfo.url) {
      throw new Error('无效的更新文件信息')
    }

    // 处理 URL：如果是相对路径，拼接 baseUrl
    let url = fileInfo.url
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (!baseUrl) {
        throw new Error('相对路径需要提供 baseUrl')
      }
      // 确保 baseUrl 以 / 结尾
      const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
      url = `${normalizedBaseUrl}${url}`
      console.log(`[DownloadManager] 拼接完整URL: ${url}`)
    }
    const fileName = path.basename(url.split('?')[0]) // 移除查询参数
    const filePath = path.join(this.downloadDir, fileName)
    const tempPath = `${filePath}.download`

    // 检查是否有未完成的下载
    let downloadedBytes = 0
    try {
      const stats = await fsPromises.stat(tempPath)
      downloadedBytes = stats.size
      console.log(`[DownloadManager] 发现未完成的下载，已下载: ${downloadedBytes} 字节`)
    } catch {
      // 文件不存在，从头开始下载
    }

    this.currentTask = {
      url,
      filePath,
      tempPath,
      expectedSha512: fileInfo.sha512,
      state: 'downloading',
      progress: {
        percent: 0,
        bytesPerSecond: 0,
        transferred: downloadedBytes,
        total: fileInfo.size || 0,
      },
      startTime: Date.now(),
      resumable: false,
    }

    this.notifyStateChange('downloading')

    try {
      await this.performDownload(downloadedBytes)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      this.handleError(errorMsg)
      throw error
    }
  }

  // 执行下载
  private async performDownload(startBytes: number) {
    if (!this.currentTask) return

    const headers: Record<string, string> = {}
    
    // 如果有已下载的数据，尝试断点续传
    if (startBytes > 0) {
      headers['Range'] = `bytes=${startBytes}-`
      console.log(`[DownloadManager] 尝试断点续传，起始位置: ${startBytes}`)
    }

    try {
      const downloadStream = got.stream(this.currentTask.url, {
        headers,
        timeout: {
          request: 30000, // 30秒请求超时
        },
      })
      
      this.downloadStream = downloadStream

      // 监听响应
      downloadStream.on('response', (response: Response) => {
        if (response.statusCode === 206) {
          // 服务器支持断点续传
          this.currentTask!.resumable = true
          console.log('[DownloadManager] 服务器支持断点续传')
        } else if (response.statusCode === 200) {
          // 服务器不支持断点续传，重新下载
          console.log('[DownloadManager] 服务器不支持断点续传，从头开始下载')
          this.currentTask!.resumable = false
          this.currentTask!.progress.transferred = 0
          startBytes = 0
        } else {
          throw new Error(`下载失败: HTTP ${response.statusCode}`)
        }
      })

      // 监听下载进度
      downloadStream.on('downloadProgress', (progress: Progress) => {
        if (!this.currentTask) return

        const transferred = startBytes + (progress.transferred || 0)
        const total = startBytes + (progress.total || 0)
        const percent = total > 0 ? Math.round((transferred / total) * 100) : 0

        this.currentTask.progress = {
          percent,
          bytesPerSecond: Math.round(progress.percent ? transferred / ((Date.now() - this.currentTask.startTime!) / 1000) : 0),
          transferred,
          total,
        }

        if (this.progressCallback) {
          this.progressCallback(this.currentTask.progress)
        }
      })

      // 创建写入流（追加模式用于断点续传）
      const fileStream = createWriteStream(this.currentTask.tempPath, {
        flags: startBytes > 0 ? 'a' : 'w',
      })

      // 开始下载
      await pipeline(downloadStream, fileStream)

      // 下载完成，验证文件
      await this.verifyAndComplete()

    } catch (error) {
      // 用户主动暂停或取消，静默处理，不抛出错误
      if (this.currentTask?.state === 'paused') {
        console.log('[DownloadManager] 下载已暂停')
        return
      }
      if (this.currentTask?.state === 'cancelled') {
        console.log('[DownloadManager] 下载已取消')
        return
      }
      // 真正的下载错误，抛出异常
      console.error('[DownloadManager] 下载出错:', error)
      throw error
    }
  }

  // 验证并完成下载
  private async verifyAndComplete() {
    if (!this.currentTask) return

    console.log('[DownloadManager] 验证文件完整性...')

    // 验证 SHA512
    if (this.currentTask.expectedSha512) {
      const actualSha512 = await this.calculateSha512(this.currentTask.tempPath)
      if (actualSha512 !== this.currentTask.expectedSha512) {
        throw new Error('文件校验失败，SHA512不匹配')
      }
      console.log('[DownloadManager] SHA512 校验通过')
    }

    // 重命名临时文件为最终文件
    await fsPromises.rename(this.currentTask.tempPath, this.currentTask.filePath)

    this.currentTask.state = 'completed'
    this.currentTask.progress.percent = 100
    this.notifyStateChange('completed')

    console.log('[DownloadManager] 下载完成:', this.currentTask.filePath)
  }

  // 计算文件的 SHA512
  private async calculateSha512(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha512')
      const stream = createReadStream(filePath)

      stream.on('data', (chunk) => hash.update(chunk))
      stream.on('end', () => resolve(hash.digest('base64')))
      stream.on('error', reject)
    })
  }

  // 暂停下载
  async pauseDownload(): Promise<void> {
    if (!this.currentTask) {
      throw new Error('没有正在进行的下载任务')
    }
    
    if (this.currentTask.state === 'completed' || this.currentTask.state === 'cancelled') {
      throw new Error('下载任务已结束')
    }
    
    if (this.currentTask.state === 'paused') {
      console.log('[DownloadManager] 下载已经处于暂停状态')
      return
    }

    // 先设置状态，再销毁流，避免pipeline抛出Premature close错误
    this.currentTask.state = 'paused'

    if (this.downloadStream) {
      this.downloadStream.destroy()
      this.downloadStream = null
    }

    this.notifyStateChange('paused')
    console.log('[DownloadManager] 下载已暂停')
  }

  // 恢复下载
  async resumeDownload(): Promise<void> {
    if (!this.currentTask) {
      throw new Error('没有可恢复的下载任务')
    }
    
    if (this.currentTask.state !== 'paused') {
      throw new Error(`当前状态为 ${this.currentTask.state}，无法恢复下载`)
    }

    this.currentTask.state = 'downloading'
    this.notifyStateChange('downloading')
    console.log('[DownloadManager] 恢复下载，起始位置:', this.currentTask.progress.transferred)

    try {
      await this.performDownload(this.currentTask.progress.transferred)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      this.handleError(errorMsg)
      throw error
    }
  }

  // 取消下载
  async cancelDownload(): Promise<void> {
    if (!this.currentTask) {
      throw new Error('没有下载任务')
    }

    // 先设置状态，再销毁流，避免pipeline抛出Premature close错误
    this.currentTask.state = 'cancelled'

    if (this.downloadStream) {
      this.downloadStream.destroy()
      this.downloadStream = null
    }

    this.notifyStateChange('cancelled')

    // 清理临时文件
    try {
      await fsPromises.unlink(this.currentTask.tempPath)
      console.log('[DownloadManager] 已清理临时文件')
    } catch (error) {
      console.warn('[DownloadManager] 清理临时文件失败:', error)
    }

    this.currentTask = null
    console.log('[DownloadManager] 下载已取消')
  }

  // 获取当前任务状态
  getTaskState(): DownloadTask | null {
    return this.currentTask ? { ...this.currentTask } : null
  }

  // 获取下载的文件路径
  getDownloadedFilePath(): string | null {
    if (this.currentTask?.state === 'completed') {
      return this.currentTask.filePath
    }
    return null
  }

  // 清理已完成的下载
  async cleanupCompleted(): Promise<void> {
    if (this.currentTask?.state === 'completed') {
      try {
        await fsPromises.unlink(this.currentTask.filePath)
        console.log('[DownloadManager] 已清理下载文件')
      } catch (error) {
        console.warn('[DownloadManager] 清理下载文件失败:', error)
      }
      this.currentTask = null
    }
  }

  // 处理错误
  private handleError(errorMsg: string) {
    if (this.currentTask) {
      this.currentTask.state = 'error'
      this.currentTask.error = errorMsg
    }
    this.notifyStateChange('error', errorMsg)
    console.error('[DownloadManager] 下载错误:', errorMsg)
  }

  // 通知状态变化
  private notifyStateChange(state: DownloadState, error?: string) {
    if (this.stateChangeCallback) {
      this.stateChangeCallback(state, error)
    }
  }
}
