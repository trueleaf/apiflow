import type { MainConfig } from '@src/types/config';

// 获取更新服务器地址
export const getUpdateUrl = (): string => {
  return process.env.UPDATE_URL || 'http://127.0.0.1/release';
};
// 主进程配置
export let mainConfig: MainConfig = {
  updateConfig: {
    url: 'http://127.0.0.1/release',
    autoUpdate: true,
    autoDownload: false,
    checkInterval: 4 * 60 * 60 * 1000,
    allowPrerelease: false,
    allowDowngrade: false,
  },
  minWidth: 1200,
  minHeight: 900,
  topbarViewHeight: 35,
};
