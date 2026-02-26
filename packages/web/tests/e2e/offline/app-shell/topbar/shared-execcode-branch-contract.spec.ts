import { test, expect } from '@playwright/test';
import { execCode as execCodeRenderer } from '@src/shared/execCode.renderer';
import { execCode as execCodeWeb } from '@src/shared/execCode.web';

test.describe('SharedExecCodeBranchContract', () => {
  // shared execCode 在 renderer 场景应根据运行环境正确选择 electron 或 web 分支
  test('renderer 分支在有无 electronAPI 时返回一致结果', async () => {
    const runtime = globalThis as unknown as {
      window?: {
        electronAPI?: {
          execCode?: (code: string, variables: Record<string, unknown>) => Promise<{ code: number; data: unknown; msg: string }>
        }
      }
    };
    const originWindow = runtime.window;
    // 模拟 Electron 桥接存在时，renderer 分支应优先调用 electronAPI.execCode
    runtime.window = {
      electronAPI: {
        execCode: async (_code: string, _variables: Record<string, unknown>) => ({ code: 0, data: 'electron-branch', msg: 'success' }),
      },
    };
    const electronResult = await execCodeRenderer('1 + 1', { value: 1 });
    expect(electronResult.code).toBe(0);
    expect(electronResult.data).toBe('electron-branch');
    // 移除桥接后，renderer 分支应回退到 web 实现
    runtime.window = {};
    const rendererFallbackResult = await execCodeRenderer('value + 2', { value: 3 });
    const webResult = await execCodeWeb('value + 2', { value: 3 });
    expect(rendererFallbackResult.code).toBe(0);
    expect(rendererFallbackResult.data).toBe(5);
    expect(rendererFallbackResult.code).toBe(webResult.code);
    expect(rendererFallbackResult.data).toBe(webResult.data);
    runtime.window = originWindow;
  });
});
