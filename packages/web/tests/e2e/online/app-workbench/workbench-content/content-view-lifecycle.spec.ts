import { test, expect } from '../../../../fixtures/electron-online.fixture';

test('contentViewLifecycle 错误页 state 保持 failed', async ({ contentPage, clearCache }) => {
  await clearCache();

  const fallbackUrl = 'app://index.html';
  const failUrl = `http://127.0.0.1:1/?t=${Date.now()}`;

  // 初始化生命周期并触发一次必失败的加载
  await contentPage.evaluate(async ({ fallbackUrl, failUrl }) => {
    const api = (window as unknown as {
      electronAPI?: {
        ipcManager?: {
          invoke?: (channel: string, payload?: unknown) => Promise<unknown>;
        };
      };
    }).electronAPI;

    if (!api?.ipcManager?.invoke) {
      throw new Error('ipcManager.invoke 不存在');
    }

    await api.ipcManager.invoke('apiflow:test:content-view-lifecycle:init-and-load', {
      fallbackUrl,
      url: failUrl,
      config: {
        loadTimeout: 15000,
        maxRetries: 0,
        retryDelay: 0,
      },
    });
  }, { fallbackUrl, failUrl });

  // 等待错误页渲染完成（按钮可见）
  await expect(contentPage.getByRole('button', { name: 'Retry' })).toBeVisible({ timeout: 20000 });
  await expect(contentPage.getByRole('button', { name: 'Use Local Version' })).toBeVisible({ timeout: 20000 });

  // 校验错误页展示期间 state 仍然是 failed
  const loadStateAfterFail = await contentPage.evaluate(async () => {
    const api = (window as unknown as {
      electronAPI?: {
        contentViewGetLoadState?: () => Promise<{
          state: 'idle' | 'loading' | 'loaded' | 'failed';
          failureInfo: {
            errorCode: number;
            errorDescription: string;
            validatedURL: string;
            timestamp: number;
          } | null;
          currentUrl: string;
        }>;
      };
    }).electronAPI;

    if (!api?.contentViewGetLoadState) return null;
    return await api.contentViewGetLoadState();
  });

  expect(loadStateAfterFail?.state).toBe('failed');
  expect(loadStateAfterFail?.currentUrl).toBe(failUrl);
  expect(loadStateAfterFail?.failureInfo).not.toBeNull();
  expect(loadStateAfterFail?.failureInfo?.validatedURL).toContain('http://127.0.0.1:1');

  // 点击“Use Local Version”，验证降级后的 URL 与状态
  await contentPage.getByRole('button', { name: 'Use Local Version' }).click();
  await contentPage.waitForURL(/app:\/\/index\.html/i, { timeout: 20000 });

  const loadStateAfterFallback = await contentPage.evaluate(async () => {
    const api = (window as unknown as {
      electronAPI?: {
        contentViewGetLoadState?: () => Promise<{
          state: 'idle' | 'loading' | 'loaded' | 'failed';
          failureInfo: {
            errorCode: number;
            errorDescription: string;
            validatedURL: string;
            timestamp: number;
          } | null;
          currentUrl: string;
        }>;
      };
    }).electronAPI;

    if (!api?.contentViewGetLoadState) return null;
    return await api.contentViewGetLoadState();
  });

  expect(loadStateAfterFallback?.currentUrl).toBe(fallbackUrl);
  expect(loadStateAfterFallback?.state).toBe('loaded');
});
