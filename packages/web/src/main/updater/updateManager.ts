import electronUpdater from 'electron-updater';
import type { AppUpdater, UpdateInfo, ProgressInfo } from 'electron-updater';
import { app } from 'electron';
import type { WebContentsView } from 'electron';
const { autoUpdater } = electronUpdater;
import { mainConfig, getUpdateUrl } from '@src/config/mainConfig';
import { IPC_EVENTS } from '@src/types/ipc';
import type { CheckUpdateResult, DownloadResult, UpdateStatus } from '@src/types/updater';

export class UpdateManager {
  private autoUpdater: AppUpdater = autoUpdater;
  private checkTimer: NodeJS.Timeout | null = null;
  private contentView: WebContentsView | null = null;
  private isDownloading = false;
  private isChecking = false;
  private downloadedVersion: string | null = null;
  private updateInfo: UpdateInfo | null = null;
  private currentDownloadProgress = 0;
  constructor() {
    this.configureAutoUpdater();
    this.registerAutoUpdaterEvents();
  }
  // 初始化
  init(contentView: WebContentsView): void {
    this.contentView = contentView;
    if (mainConfig.updateConfig.autoUpdate) {
      this.startAutoCheck();
    }
  }
  // 配置 autoUpdater
  private configureAutoUpdater(): void {
    this.autoUpdater.setFeedURL({
      provider: 'generic',
      url: getUpdateUrl(),
      channel: 'latest'
    });
    console.log(123, getUpdateUrl())
    if (process.platform === 'darwin' || process.platform === 'linux') {
      this.autoUpdater.autoDownload = false;
    } else if (process.platform === 'win32') {
      this.autoUpdater.autoDownload = mainConfig.updateConfig.autoDownload;
      this.autoUpdater.autoInstallOnAppQuit = true;
    }
    this.autoUpdater.allowPrerelease = mainConfig.updateConfig.allowPrerelease;
    this.autoUpdater.allowDowngrade = mainConfig.updateConfig.allowDowngrade;
    if (!app.isPackaged) {
      this.autoUpdater.forceDevUpdateConfig = true;
    }
  }
  // 注册 autoUpdater 事件
  private registerAutoUpdaterEvents(): void {
    this.autoUpdater.on('checking-for-update', () => {
      this.isChecking = true;
      this.sendToRenderer('checking');
    });
    this.autoUpdater.on('update-available', (info: UpdateInfo) => {
      this.isChecking = false;
      this.updateInfo = info;
      this.sendToRenderer('updateAvailable', {
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: info.releaseNotes || ''
      });
    });
    this.autoUpdater.on('update-not-available', () => {
      console.log('No update available');
      this.isChecking = false;
      this.sendToRenderer('updateNotAvailable');
    });
    this.autoUpdater.on('download-progress', (progress: ProgressInfo) => {
      this.currentDownloadProgress = progress.percent;
      this.sendToRenderer('downloadProgress', {
        percent: progress.percent,
        bytesPerSecond: progress.bytesPerSecond,
        transferred: progress.transferred,
        total: progress.total
      });
    });
    this.autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
      this.isDownloading = false;
      this.downloadedVersion = info.version;
      this.currentDownloadProgress = 100;
      this.sendToRenderer('downloadCompleted', {
        version: info.version,
        downloadedAt: Date.now()
      });
    });
    this.autoUpdater.on('error', (error: Error) => {
      this.isChecking = false;
      this.isDownloading = false;
      this.handleUpdateError(error);
    });
  }
  // 检查更新
  async checkForUpdates(): Promise<CheckUpdateResult> {
    if (this.isChecking) {
      return {
        success: false,
        hasUpdate: false,
        currentVersion: app.getVersion(),
        error: '正在检查更新中，请稍候'
      };
    }
    try {
      let result = await this.autoUpdater.checkForUpdates();
      if (!result) {
        return {
          success: false,
          hasUpdate: false,
          currentVersion: app.getVersion(),
          error: '无法获取更新信息'
        };
      }
      let hasUpdate = result.updateInfo.version !== app.getVersion();
      return {
        success: true,
        hasUpdate,
        currentVersion: app.getVersion(),
        newVersion: result.updateInfo.version,
        releaseNotes: result.updateInfo.releaseNotes as string || '',
        releaseDate: result.updateInfo.releaseDate
      };
    } catch (error) {
      this.isChecking = false;
      return {
        success: false,
        hasUpdate: false,
        currentVersion: app.getVersion(),
        error: (error as Error).message
      };
    }
  }
  // 启动定时检查
  startAutoCheck(): void {
    let checkInterval = mainConfig.updateConfig.checkInterval || 4 * 60 * 60 * 1000;
    this.checkForUpdates().catch(() => {
      // 静默失败
    });
    this.checkTimer = setInterval(() => {
      this.checkForUpdates().catch(() => {
        // 定时检查失败时静默处理
      });
    }, checkInterval);
  }
  // 停止定时检查
  stopAutoCheck(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
  }
  // 下载更新
  async downloadUpdate(): Promise<DownloadResult> {
    if (this.downloadedVersion === this.updateInfo?.version) {
      return {
        success: true,
        message: `版本 ${this.downloadedVersion} 已下载，无需重复下载`
      };
    }
    if (this.isDownloading) {
      return {
        success: false,
        message: '正在下载中，请稍候'
      };
    }
    if (!this.updateInfo) {
      return {
        success: false,
        error: '没有可下载的更新'
      };
    }
    this.isDownloading = true;
    this.currentDownloadProgress = 0;
    try {
      await this.autoUpdater.downloadUpdate();
      return { success: true };
    } catch (error) {
      this.isDownloading = false;
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }
  // 取消下载
  cancelDownload(): { success: boolean } {
    return { success: false };
  }
  // 安装更新
  quitAndInstall(): void {
    if (!this.downloadedVersion) {
      throw new Error('没有可安装的更新');
    }
    this.autoUpdater.quitAndInstall(false, true);
  }
  // 获取更新状态
  getUpdateStatus(): UpdateStatus {
    return {
      checking: this.isChecking,
      downloading: this.isDownloading,
      downloaded: !!this.downloadedVersion,
      currentVersion: app.getVersion(),
      newVersion: this.updateInfo?.version || null,
      downloadProgress: this.currentDownloadProgress
    };
  }
  // 检查是否有已下载的更新
  hasDownloadedUpdate(): boolean {
    return !!this.downloadedVersion;
  }
  // 发送状态到渲染进程
  private sendToRenderer(eventType: string, data?: unknown): void {
    if (!this.contentView) return;
    let fullEventName = IPC_EVENTS.updater.mainToRenderer[eventType as keyof typeof IPC_EVENTS.updater.mainToRenderer];
    if (!fullEventName) {
      console.error(`Unknown updater event type: ${eventType}`);
      return;
    }
    this.contentView.webContents.send(fullEventName, data);
  }
  // 错误处理
  private handleUpdateError(error: Error): void {
    let errorType: 'network' | 'permission' | 'checksum' | 'unknown' = 'unknown';
    let userMessage = '';
    if (error.message.includes('net::')) {
      errorType = 'network';
      userMessage = '网络连接失败，请检查网络设置';
    } else if (error.message.includes('EACCES')) {
      errorType = 'permission';
      userMessage = '权限不足，请以管理员身份运行';
    } else if (error.message.includes('sha512')) {
      errorType = 'checksum';
      userMessage = '更新文件校验失败，请重新下载';
    } else {
      userMessage = `更新失败: ${error.message}`;
    }
    this.sendToRenderer('error', {
      message: userMessage,
      code: errorType
    });
  }
}
