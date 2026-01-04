/**
 * 更新功能 IPC 事件名称定义
 *
 * 命名规则: apiflow:update:{action}
 */

export const UPDATE_IPC_EVENTS = {
  // 渲染进程 -> 主进程
  checkForUpdates: 'apiflow:update:check-for-updates',
  downloadUpdate: 'apiflow:update:download-update',
  quitAndInstall: 'apiflow:update:quit-and-install',
  cancelDownload: 'apiflow:update:cancel-download',
  pauseDownload: 'apiflow:update:pause-download',
  resumeDownload: 'apiflow:update:resume-download',
  getDownloadState: 'apiflow:update:get-download-state',
  setAutoCheck: 'apiflow:update:set-auto-check',
  setUpdateSource: 'apiflow:update:set-update-source',
  syncSettings: 'apiflow:update:sync-settings',
  testConnection: 'apiflow:update:test-connection',

  // 主进程 -> 渲染进程
  checkingForUpdate: 'apiflow:update:checking-for-update',
  updateAvailable: 'apiflow:update:update-available',
  updateNotAvailable: 'apiflow:update:update-not-available',
  downloadProgress: 'apiflow:update:download-progress',
  updateDownloaded: 'apiflow:update:update-downloaded',
  downloadStateChanged: 'apiflow:update:download-state-changed',
  error: 'apiflow:update:error',
} as const
