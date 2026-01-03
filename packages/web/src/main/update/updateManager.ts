import { autoUpdater } from 'electron-updater'
import { ipcMain, app } from 'electron'
import type { UpdateInfo, ProgressInfo } from 'electron-updater'
import { UPDATE_IPC_EVENTS } from '@src/types/ipc/update'
import type { UpdateSettings } from '@src/types/update'
import { contentViewInstance } from '../main'
import * as fs from 'fs'
import * as path from 'path'
import * as yaml from 'js-yaml'

// UpdateManager类 - 管理应用更新逻辑
class UpdateManager {
  private isDownloading = false
  private currentSettings: UpdateSettings = {
    autoCheck: false,
    source: 'github',
    customUrl: '',
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
      console.log('[UpdateManager] 发现新版本:', info.version)
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
      this.isDownloading = false
      this.sendToRenderer(UPDATE_IPC_EVENTS.error, {
        code: 'UPDATE_ERROR',
        message: error.message,
        suggestion: '请检查网络连接或尝试切换更新源',
      })
    })

    autoUpdater.on('download-progress', (progress: ProgressInfo) => {
      console.log(`[UpdateManager] 下载进度: ${progress.percent.toFixed(2)}%`)
      this.sendToRenderer(UPDATE_IPC_EVENTS.downloadProgress, {
        percent: Math.round(progress.percent),
        bytesPerSecond: progress.bytesPerSecond,
        transferred: progress.transferred,
        total: progress.total,
      })
    })

    autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
      console.log('[UpdateManager] 更新下载完成:', info.version)
      this.isDownloading = false
      this.sendToRenderer(UPDATE_IPC_EVENTS.updateDownloaded, {
        version: info.version,
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
        if (this.isDownloading) {
          return { code: 1, msg: '正在下载中', data: null }
        }
        this.isDownloading = true
        await autoUpdater.downloadUpdate()
        return { code: 0, msg: '下载开始', data: null }
      } catch (error) {
        this.isDownloading = false
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
      // electron-updater 不支持取消下载，只能标记状态
      this.isDownloading = false
      return { code: 0, msg: '已取消', data: null }
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
