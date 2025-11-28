// 更新检查结果
export type CheckUpdateResult = {
  success: boolean;
  hasUpdate: boolean;
  currentVersion: string;
  newVersion?: string;
  releaseNotes?: string;
  releaseDate?: string;
  error?: string;
};
// 下载结果
export type DownloadResult = {
  success: boolean;
  message?: string;
  error?: string;
};
// 下载进度
export type UpdateProgress = {
  percent: number;
  bytesPerSecond: number;
  transferred: number;
  total: number;
};
// 更新状态
export type UpdateStatus = {
  checking: boolean;
  downloading: boolean;
  downloaded: boolean;
  currentVersion: string;
  newVersion: string | null;
  downloadProgress: number;
};
// 版本信息
export type VersionInfo = {
  version: string;
  releaseDate: string;
  releaseNotes: string;
};
