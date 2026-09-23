import { isTauri } from '@tauri-apps/api/core';

// 在业务模块读取平台能力前初始化桌面服务
export const initializePlatform = async () => {
  if (!isTauri()) return;
  const { createTauriApi } = await import('./tauri/api');
  window.desktopAPI = await createTauriApi();
};
