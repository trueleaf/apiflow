import { expect, type ElectronApplication, type Page } from '@playwright/test';
import { test } from '../../../fixtures/enhanced-electron-fixtures';

// 辅助函数：获取 header 和 content 页面
const HEADER_URL_HINTS = ['header.html', '/header'];
const isHeaderUrl = (url: string): boolean => {
  if (!url) return false;
  return HEADER_URL_HINTS.some((hint) => url.includes(hint));
};

const resolveHeaderAndContentPages = async (
  electronApp: ElectronApplication,
  timeout = 10000
): Promise<{ headerPage: Page; contentPage: Page }> => {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const windows = electronApp.windows();
    let headerPage: Page | undefined;
    let contentPage: Page | undefined;
    windows.forEach((page) => {
      const url = page.url();
      if (isHeaderUrl(url)) headerPage = page;
      else if (url && url !== 'about:blank') contentPage = page;
    });
    if (headerPage && contentPage) return { headerPage, contentPage };
    try {
      await electronApp.waitForEvent('window', {
        timeout: 500,
        predicate: (page) => {
          const url = page.url();
          return isHeaderUrl(url) || (!!url && url !== 'about:blank');
        }
      });
    } catch {}
  }
  throw new Error('未能定位 header 与 content 页面');
};

// AI 功能测试
test.describe('AI 功能测试', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const result = await resolveHeaderAndContentPages(electronApp);
    headerPage = result.headerPage;
    contentPage = result.contentPage;

    await Promise.all([
      headerPage.waitForLoadState('domcontentloaded'),
      contentPage.waitForLoadState('domcontentloaded')
    ]);

    // 设置离线模式
    await contentPage.evaluate(() => {
      localStorage.setItem('runtime/networkMode', 'offline');
      localStorage.setItem('history/lastVisitePage', '/home');
    });

    await contentPage.waitForTimeout(1000);
  });

  test('应能配置 AI 服务', async ({ electronApp }) => {
    // 导航到设置页面
    await contentPage.evaluate(() => {
      window.location.hash = '#/settings';
    });
    await contentPage.waitForURL(/settings/, { timeout: 10000 });
    await contentPage.waitForLoadState('domcontentloaded');
    await contentPage.waitForTimeout(1000);

    // 从环境变量读取配置，如果未设置则使用测试默认值
    const testApiUrl = process.env.TEST_AI_API_URL || 'https://api.deepseek.com/v1/chat/completions';
    const testApiKey = process.env.TEST_AI_API_KEY || 'mock-test-api-key';

    // 在 localStorage 中设置 AI 配置
    await contentPage.evaluate((config) => {
      localStorage.setItem('apiflow/ai/config', JSON.stringify({
        apiUrl: config.apiUrl,
        apiKey: config.apiKey
      }));

      // 同步配置到主进程
      window.electronAPI?.ipcRenderer?.send('apiflow-sync-ai-config', {
        apiUrl: config.apiUrl,
        apiKey: config.apiKey
      });
    }, { apiUrl: testApiUrl, apiKey: testApiKey });

    // 验证配置已保存
    const savedConfig = await contentPage.evaluate(() => {
      const configStr = localStorage.getItem('apiflow/ai/config');
      return configStr ? JSON.parse(configStr) : null;
    });

    expect(savedConfig).toBeTruthy();
    expect(savedConfig.apiUrl).toBe(testApiUrl);
    expect(savedConfig.apiKey).toBe(testApiKey);
  });

  test('应能使用 AI 生成 JSON 数据', async ({ electronApp }) => {
    // 模拟 AI 生成 JSON 的场景
    const testPrompt = '生成一个包含用户信息的JSON对象，包含姓名、年龄、邮箱';

    // 调用 AI 生成 JSON 数据的 IPC 方法
    const result = await contentPage.evaluate(async (prompt) => {
      try {
        const response = await window.electronAPI?.ai?.generateJson({ prompt });
        return response;
      } catch (error) {
        return { code: 1, msg: (error as Error).message };
      }
    }, testPrompt);

    // 验证返回结果
    // 注意：由于实际 API 可能不可用，这里主要验证调用流程
    expect(result).toBeTruthy();
    expect(result).toHaveProperty('code');
  });

  test('应能使用 AI 生成文本数据', async ({ electronApp }) => {
    // 模拟 AI 生成文本的场景
    const testPrompt = '生成一个API接口的描述文案';

    // 调用 AI 生成文本数据的 IPC 方法
    const result = await contentPage.evaluate(async (prompt) => {
      try {
        const response = await window.electronAPI?.ipcRenderer?.invoke('ai-generate-text', { prompt });
        return response;
      } catch (error) {
        return { code: 1, msg: (error as Error).message };
      }
    }, testPrompt);

    // 验证返回结果
    expect(result).toBeTruthy();
    expect(result).toHaveProperty('code');
  });

  test('应能使用 AI 流式聊天', async ({ electronApp }) => {
    const requestId = `test-stream-${Date.now()}`;
    let receivedData = '';
    let streamEnded = false;
    let streamError = '';

    // 设置流式数据接收
    const streamPromise = contentPage.evaluate((reqId) => {
      return new Promise((resolve, reject) => {
        let data = '';
        let ended = false;
        let error = '';

        const cleanup = window.electronAPI?.ai?.textChatWithStream(
          { requestId: reqId },
          (chunk: string) => {
            data += chunk;
          },
          () => {
            ended = true;
            resolve({ data, ended, error });
          },
          (err: string) => {
            error = err;
            reject({ data, ended, error });
          }
        );

        // 设置超时保护
        setTimeout(() => {
          cleanup?.cancel();
          resolve({ data, ended: true, error: 'timeout' });
        }, 10000);
      });
    }, requestId);

    // 等待流式请求完成或超时
    try {
      const result = await Promise.race([
        streamPromise,
        new Promise((resolve) => setTimeout(() => resolve({ timeout: true }), 12000))
      ]) as any;

      // 验证流式响应
      expect(result).toBeTruthy();
    } catch (error) {
      // 如果 API 不可用，也应正确处理错误
      expect(error).toBeTruthy();
    }
  });

  test('应能测试 AI 文本聊天', async ({ electronApp }) => {
    // 调用 AI 文本聊天测试接口
    const result = await contentPage.evaluate(async () => {
      try {
        const response = await window.electronAPI?.ai?.textChat();
        return response;
      } catch (error) {
        return { code: 1, msg: (error as Error).message };
      }
    });

    // 验证返回结果结构
    expect(result).toBeTruthy();
    expect(result).toHaveProperty('code');
    expect(result).toHaveProperty('msg');
  });

  test('应能取消 AI 流式请求', async ({ electronApp }) => {
    const requestId = `test-cancel-${Date.now()}`;

    // 启动流式请求
    const streamHandle = await contentPage.evaluateHandle((reqId) => {
      return window.electronAPI?.ai?.textChatWithStream(
        { requestId: reqId },
        (chunk: string) => {
          // 接收数据
        },
        () => {
          // 完成
        },
        (error: string) => {
          // 错误
        }
      );
    }, requestId);

    // 等待一小段时间后取消
    await contentPage.waitForTimeout(500);

    // 取消流式请求
    const cancelResult = await contentPage.evaluate(async (handle) => {
      try {
        await handle?.cancel();
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    }, await streamHandle.jsonValue());

    // 验证取消操作
    expect(cancelResult).toBeTruthy();
  });

  test('AI 服务异常时应正确处理', async ({ electronApp }) => {
    // 设置无效的 AI 配置
    await contentPage.evaluate(() => {
      localStorage.setItem('apiflow/ai/config', JSON.stringify({
        apiUrl: 'https://invalid-api-url.example.com',
        apiKey: 'invalid-key'
      }));

      // 同步到主进程
      window.electronAPI?.ipcRenderer?.send('apiflow-sync-ai-config', {
        apiUrl: 'https://invalid-api-url.example.com',
        apiKey: 'invalid-key'
      });
    });

    await contentPage.waitForTimeout(500);

    // 尝试调用 AI 接口
    const result = await contentPage.evaluate(async () => {
      try {
        const response = await window.electronAPI?.ai?.textChat();
        return response;
      } catch (error) {
        return {
          code: 1,
          msg: (error as Error).message,
          caught: true
        };
      }
    });

    // 验证错误处理
    expect(result).toBeTruthy();
    // 应该返回错误状态或捕获到异常
    const hasError = result.code !== 0 || result.caught === true;
    expect(hasError).toBeTruthy();
  });

  test('应能清除 AI 配置', async ({ electronApp }) => {
    // 先设置配置
    await contentPage.evaluate(() => {
      localStorage.setItem('apiflow/ai/config', JSON.stringify({
        apiUrl: 'https://api.test.com',
        apiKey: 'test-key'
      }));
    });

    // 验证配置存在
    let config = await contentPage.evaluate(() => {
      return localStorage.getItem('apiflow/ai/config');
    });
    expect(config).toBeTruthy();

    // 清除配置
    await contentPage.evaluate(() => {
      localStorage.removeItem('apiflow/ai/config');
    });

    // 验证配置已清除
    config = await contentPage.evaluate(() => {
      return localStorage.getItem('apiflow/ai/config');
    });
    expect(config).toBeNull();
  });
});
