import { invoke } from '@tauri-apps/api/core';

// 在受限的原生 JavaScript 运行时执行表达式
export const execCode = async (code: string, variables: Record<string, unknown>): Promise<{ code: number; data: unknown; msg: string }> => {
  try {
    const result = await invoke<{ data?: unknown }>('execute_script', {
      code: `({data: (0, eval)(${JSON.stringify(code)})})`,
      variables,
    });
    return { code: 0, data: result.data, msg: 'success' };
  } catch (error) {
    return { code: 1, data: null, msg: String(error) };
  }
};
