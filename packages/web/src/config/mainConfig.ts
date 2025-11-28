import type { MainConfig } from '@src/types/config';

// 主进程配置
export let mainConfig: MainConfig = {
  updateConfig: {
    url: 'http://xxx.xxx.cn/electron',
    autoUpdate: false,
    autoDownload: false,
    checkInterval: 4 * 60 * 60 * 1000,
    allowPrerelease: false,
    allowDowngrade: false,
  },
  minWidth: 1200,
  minHeight: 900,
  topbarViewHeight: 35,
};
