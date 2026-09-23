import { isTauri } from '@tauri-apps/api/core';

// 根据运行环境选择表达式执行器
export const execCode = async (code: string, variables: Record<string, unknown>): Promise<{ code: number; data: unknown; msg: string }> => {
  const executor = isTauri() ? await import('./execCode.tauri') : await import('./execCode.web');
  return executor.execCode(code, variables);
};
