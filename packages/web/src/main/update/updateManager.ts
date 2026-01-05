import { autoUpdater } from 'electron-updater'
import { ipcMain, app } from 'electron'
import type { UpdateInfo } from 'electron-updater'
import { UPDATE_IPC_EVENTS } from '@src/types/ipc/update'
import type { UpdateSettings, DownloadState, DownloadProgress } from '@src/types/update'
import { contentViewInstance } from '../main'
import { DownloadManager } from './downloadManager'
import * as fs from 'fs'
import * as path from 'path'
import * as yaml from 'js-yaml'

// UpdateManager类 - 管理应用更新逻辑
class UpdateManager {
  private downloadManager: DownloadManager
  private latestUpdateInfo: UpdateInfo | null = null
  private currentSettings: UpdateSettings = {
    autoCheck: false,
    source: 'github',
    customUrl: '',
  }

  constructor() {
    this.downloadManager = new DownloadManager()
    this.setupDownloadCallbacks()
  }

  // 设置下载管理器回调
  private setupDownloadCallbacks() {
    this.downloadManager.setProgressCallback((progress: DownloadProgress) => {
      this.sendToRenderer(UPDATE_IPC_EVENTS.downloadProgress, progress)
    })

    this.downloadManager.setStateChangeCallback((state: DownloadState, error?: string) => {
      this.sendToRenderer(UPDATE_IPC_EVENTS.downloadStateChanged, { state, error })
      if (state === 'completed') {
        this.sendToRenderer(UPDATE_IPC_EVENTS.updateDownloaded, {
          version: this.latestUpdateInfo?.version || 'unknown',
        })
      } else if (state === 'error') {
        this.sendToRenderer(UPDATE_IPC_EVENTS.error, {
          code: 'DOWNLOAD_ERROR',
          message: error || '下载失败',
        })
      }
    })
  }

  // 初始化UpdateManager
  init(settings: UpdateSettings) {
    this.currentSettings = settings
    autoUpdater.autoDownload = false
    autoUpdater.forceDevUpdateConfig = !app.isPackaged
    // 开发环境允许版本降级更新
    if (!app.isPackaged) {
      autoUpdater.allowDowngrade = true
      console.log('[UpdateManager] 开发环境：已启用版本降级更新')
    }
    this.setUpdateSource(this.currentSettings.source, this.currentSettings.customUrl)
    this.generateDevUpdateConfig(this.currentSettings.source, this.currentSettings.customUrl)
    this.initAutoUpdaterEvent()
    this.registerIPCHandlers()
  }

  // 监听autoUpdater事件
  private initAutoUpdaterEvent() {
    autoUpdater.on('checking-for-update', () => {
      this.sendToRenderer(UPDATE_IPC_EVENTS.checkingForUpdate, {})
    })

    autoUpdater.on('update-available', (info: UpdateInfo) => {
      console.log('[UpdateManager] 发现新版本:', info.version);
      this.latestUpdateInfo = info
      this.sendToRenderer(UPDATE_IPC_EVENTS.updateAvailable, {
        version: info.version,
        releaseDate: info.releaseDate || '',
        releaseNotes: typeof info.releaseNotes === 'string' ? info.releaseNotes : '',
        fileSize: info.files?.[0]?.size,
      })
    })

    autoUpdater.on('update-not-available', (info: UpdateInfo) => {
      console.log('[UpdateManager] 当前已是最新版本:', info.version)
      this.sendToRenderer(UPDATE_IPC_EVENTS.updateNotAvailable, {
        version: info.version,
      })
    })

    autoUpdater.on('error', (error: Error) => {
      console.error('[UpdateManager] 更新出错:', error, this.currentSettings)
      this.sendToRenderer(UPDATE_IPC_EVENTS.error, {
        code: 'UPDATE_ERROR',
        message: error.message,
      })
    })
  }

  // 设置更新源
  private setUpdateSource(source: 'github' | 'custom', customUrl?: string) {
    console.log('[UpdateManager] 设置更新源:', source, customUrl || '')
    if (source === 'github') {
      autoUpdater.setFeedURL({
        provider: 'github',
        owner: 'trueleaf',
        repo: 'apiflow',
      })
    } else if (source === 'custom' && customUrl) {
      autoUpdater.setFeedURL({
        provider: 'generic',
        url: customUrl,
      })
    }
    this.generateDevUpdateConfig(source, customUrl)
  }

  // 生成开发环境更新配置文件
  private generateDevUpdateConfig(source: 'github' | 'custom', customUrl?: string) {
    if (app.isPackaged) {
      return
    }
    const configPath = path.join(app.getAppPath(), 'dev-app-update.yml')
    let config: Record<string, unknown>
    if (source === 'github') {
      config = {
        provider: 'github',
        owner: 'trueleaf',
        repo: 'apiflow',
      }
    } else if (source === 'custom' && customUrl) {
      config = {
        provider: 'generic',
        url: customUrl,
      }
    } else {
      return
    }
    try {
      const yamlContent = yaml.dump(config)
      fs.writeFileSync(configPath, yamlContent, 'utf-8')
      console.log('[UpdateManager] 已生成 dev-app-update.yml:', configPath)
    } catch (error) {
      console.error('[UpdateManager] 生成 dev-app-update.yml 失败:', error)
    }
  }

  // 注册IPC处理器
  private registerIPCHandlers() {
    // 检查更新
    ipcMain.handle(UPDATE_IPC_EVENTS.checkForUpdates, async () => {
      try {
        const result = await autoUpdater.checkForUpdates()
        return {
          code: 0,
          msg: '检查更新成功',
          data: { updateInfo: result?.updateInfo },
        }
      } catch (error) {
        return {
          code: 1,
          msg: error instanceof Error ? error.message : '检查更新失败',
          data: null,
        }
      }
    })

    // 下载更新
    ipcMain.handle(UPDATE_IPC_EVENTS.downloadUpdate, async () => {
      try {
        console.log('[UpdateManager] 开始下载更新')
        if (!this.latestUpdateInfo) {
          return { code: 1, msg: '请先检查更新', data: null }
        }
        const taskState = this.downloadManager.getTaskState()
        if (taskState && taskState.state === 'downloading') {
          return { code: 1, msg: '正在下载中', data: null }
        }
        // 传递 baseUrl（仅在使用自定义源时需要）
        const baseUrl = this.currentSettings.source === 'custom' ? this.currentSettings.customUrl : undefined
        await this.downloadManager.startDownload(this.latestUpdateInfo, baseUrl)
        return { code: 0, msg: '下载开始', data: null }
      } catch (error) {
        return {
          code: 1,
          msg: error instanceof Error ? error.message : '下载更新失败',
          data: null,
        }
      }
    })

    // 退出并安装
    ipcMain.handle(UPDATE_IPC_EVENTS.quitAndInstall, async () => {
      try {
        autoUpdater.quitAndInstall(false, true)
        return { code: 0, msg: '正在安装', data: null }
      } catch (error) {
        return {
          code: 1,
          msg: error instanceof Error ? error.message : '安装更新失败',
          data: null,
        }
      }
    })

    // 取消下载
    ipcMain.handle(UPDATE_IPC_EVENTS.cancelDownload, async () => {
      try {
        await this.downloadManager.cancelDownload()
        return { code: 0, msg: '已取消', data: null }
      } catch (error) {
        return {
          code: 1,
          msg: error instanceof Error ? error.message : '取消失败',
          data: null,
        }
      }
    })

    // 暂停下载
    ipcMain.handle(UPDATE_IPC_EVENTS.pauseDownload, async () => {
      try {
        await this.downloadManager.pauseDownload()
        return { code: 0, msg: '已暂停', data: null }
      } catch (error) {
        return {
          code: 1,
          msg: error instanceof Error ? error.message : '暂停失败',
          data: null,
        }
      }
    })

    // 恢复下载
    ipcMain.handle(UPDATE_IPC_EVENTS.resumeDownload, async () => {
      try {
        await this.downloadManager.resumeDownload()
        return { code: 0, msg: '已恢复', data: null }
      } catch (error) {
        return {
          code: 1,
          msg: error instanceof Error ? error.message : '恢复失败',
          data: null,
        }
      }
    })

    // 获取下载状态
    ipcMain.handle(UPDATE_IPC_EVENTS.getDownloadState, async () => {
      try {
        const state = this.downloadManager.getTaskState()
        return { code: 0, msg: '获取成功', data: state }
      } catch (error) {
        return {
          code: 1,
          msg: error instanceof Error ? error.message : '获取失败',
          data: null,
        }
      }
    })

    // 同步设置
    ipcMain.handle(UPDATE_IPC_EVENTS.syncSettings, async (_, settings: UpdateSettings) => {
      try {
        this.currentSettings = settings
        this.setUpdateSource(settings.source, settings.customUrl)
        // 如果启用了自动检查，立即检查更新
        if (settings.autoCheck) {
          this.checkForUpdates()
        }
        return { code: 0, msg: '同步成功', data: null }
      } catch (error) {
        return {
          code: 1,
          msg: error instanceof Error ? error.message : '同步失败',
          data: null,
        }
      }
    })

    // 设置自动检查
    ipcMain.handle(UPDATE_IPC_EVENTS.setAutoCheck, async (_, autoCheck: boolean) => {
      this.currentSettings.autoCheck = autoCheck
      return { code: 0, msg: '设置成功', data: null }
    })

    // 设置更新源
    ipcMain.handle(UPDATE_IPC_EVENTS.setUpdateSource, async (_, source: 'github' | 'custom', customUrl?: string) => {
      try {
        this.currentSettings.source = source
        if (customUrl) {
          this.currentSettings.customUrl = customUrl
        }
        this.setUpdateSource(source, customUrl)
        return { code: 0, msg: '设置成功', data: null }
      } catch (error) {
        console.error('[UpdateManager] 设置更新源失败:', error)
        return {
          code: 1,
          msg: error instanceof Error ? error.message : '设置更新源失败',
          data: null,
        }
      }
    })

    // 测试连接
    ipcMain.handle(UPDATE_IPC_EVENTS.testConnection, async (_, url: string) => {
      try {
        // 尝试访问更新源URL来测试连接
        const testUrl = url.endsWith('/') ? `${url}latest.yml` : `${url}/latest.yml`
        const response = await fetch(testUrl, { method: 'GET' })
        return {
          code: response.ok ? 0 : 1,
          msg: response.ok ? '连接成功' : `HTTP ${response.status}`,
          data: null,
        }
      } catch (error) {
        return {
          code: 1,
          msg: error instanceof Error ? error.message : '连接失败',
          data: null,
        }
      }
    })
  }

  // 检查更新
  async checkForUpdates() {
    try {
      await autoUpdater.checkForUpdates()
    } catch (error) {
      console.error('[UpdateManager] 检查更新失败:', error)
    }
  }

  // 向渲染进程发送消息
  private sendToRenderer(event: string, data: unknown) {
    if (contentViewInstance && !contentViewInstance.webContents.isDestroyed()) {
      contentViewInstance.webContents.send(event, data)
    }
  }

  // 清理资源
  destroy() {
    autoUpdater.removeAllListeners()
  }
}

export const updateManager = new UpdateManager()
