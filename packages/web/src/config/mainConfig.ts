import type { MainConfig } from '@src/types/config';

// 主进程配置
export const mainConfig: MainConfig = {
  updateConfig: {
    url: 'http://xxx.xxx.cn/electron/windows',
    autoUpdate: false,
  },
  minWidth: 1200,
  minHeight: 900,
  topbarViewHeight: 35,
};
