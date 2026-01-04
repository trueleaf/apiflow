// 更新源类型
export type UpdateSource = 'github' | 'custom'

// 更新状态类型
export type UpdateStatus = 
  | 'idle'           // 空闲状态
  | 'checking'       // 正在检查更新
  | 'available'      // 发现新版本
  | 'downloading'    // 正在下载
  | 'paused'         // 下载已暂停
  | 'downloaded'     // 下载完成
  | 'error'          // 发生错误

// 下载状态类型
export type DownloadState = 'idle' | 'downloading' | 'paused' | 'cancelled' | 'completed' | 'error'

// 下载进度信息类型
export type DownloadProgress = {
  percent: number              // 下载百分比 0-100
  bytesPerSecond: number       // 下载速度（字节/秒）
  transferred: number          // 已下载字节数
  total: number                // 总字节数
}

// 下载任务信息
export type DownloadTask = {
  url: string                  // 下载URL
  filePath: string             // 最终文件路径
  tempPath: string             // 临时文件路径
  expectedSha512?: string      // 期望的SHA512校验值
  state: DownloadState         // 下载状态
  progress: DownloadProgress   // 下载进度
  error?: string               // 错误信息
  startTime?: number           // 开始时间戳
  resumable: boolean           // 是否支持断点续传
}

// 更新信息
export type UpdateInfo = {
  version: string              // 新版本号
  releaseDate: string          // 发布日期
  releaseNotes: string         // 更新说明
  fileSize?: number            // 文件大小（字节）
}

// 下载进度信息
export type UpdateProgress = {
  percent: number              // 下载百分比 0-100
  bytesPerSecond: number       // 下载速度（字节/秒）
  transferred: number          // 已下载字节数
  total: number                // 总字节数
}

// 更新设置
export type UpdateSettings = {
  autoCheck: boolean           // 是否启动时自动检查更新
  source: UpdateSource         // 更新源类型
  customUrl: string            // 自定义更新源URL
  lastCheckTime?: number       // 上次检查时间戳
}

// 更新错误信息
export type UpdateError = {
  code?: string                // 错误代码
  message: string              // 错误消息
  suggestion?: string          // 建议操作
}

// 检查更新结果
export type CheckUpdateResult = {
  hasUpdate: boolean           // 是否有更新
  currentVersion: string       // 当前版本
  latestVersion?: string       // 最新版本
  updateInfo?: UpdateInfo      // 更新信息
  error?: UpdateError          // 错误信息
}

// 下载状态变化事件数据
export type DownloadStateChangedData = {
  state: DownloadState
  error?: string
}
