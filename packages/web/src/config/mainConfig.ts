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
  // AI配置
  aiConfig: {
    modelName: 'DeepSeek',
    apiKey: '',
    apiUrl: 'https://api.deepseek.com/chat/completions',
    maxTokens: 2000,
    timeout: 60000,
  },
};
