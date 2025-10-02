import type { MainConfig } from '@src/types/common';

// 主进程配置
export const mainConfig: MainConfig = {
  minWidth: 1200,
  minHeight: 900,
  topbarViewHeight: 35,
  useLocalFile: false, // 使用本地文件作为主进程加载内容
  onlineUrl: 'https://online.jobtool.cn', // 若useLocalFile为false则使用当前地址作为electron加载地址
  // AI配置
  aiConfig: {
    model: 'DeepSeek',
    apiKey: '',
    apiUrl: '',
  },
};
