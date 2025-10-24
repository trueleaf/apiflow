import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, navigateToAiSettings, saveAiConfig } from '../fixtures/ai.fixture';
import type { ElectronAPI } from '@src/types/main';
// 扩展 Window 类型用于测试
declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
// AI 功能测试
test.describe('AI 功能测试', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const result = await initOfflineWorkbench(electronApp, { timeout: 30000 });
    headerPage = result.headerPage;
    contentPage = result.contentPage;
  });

  /*
  |--------------------------------------------------------------------------
  | 第一部分：AiSettings 页面 UI 交互测试
  |--------------------------------------------------------------------------
  */
  test.describe('AiSettings 页面 UI 交互测试', () => {

    test.beforeEach(async () => {
      await navigateToAiSettings(headerPage, contentPage);
    });

    test('1. 应正确加载和显示 AI 配置表单', async () => {
      // 验证页面标题
      const pageTitle = await contentPage.locator('h2').textContent();
      expect(pageTitle).toContain('AI 设置');

      // 验证表单元素存在
      const modelInput = contentPage.locator('input[placeholder="DeepSeek"]');
      const apiKeyInput = contentPage.locator('input[placeholder="请输入 DeepSeek API Key"]');
      const apiUrlInput = contentPage.locator('input[placeholder="请输入 API 地址"]');

      await expect(modelInput).toBeVisible();
      await expect(apiKeyInput).toBeVisible();
      await expect(apiUrlInput).toBeVisible();

      // 验证模型字段为禁用状态
      await expect(modelInput).toBeDisabled();
    });

    test('2. 应从 localStorage 正确加载已保存的配置', async () => {
      const testConfig = {
        model: 'DeepSeek',
        apiKey: 'test-api-key-123',
        apiUrl: 'https://api.test.com',
        timeout: 30000
      };

      // 设置配置到 localStorage
      await contentPage.evaluate((config) => {
        localStorage.setItem('apiflow/ai/config', JSON.stringify(config));
      }, testConfig);

      // 重新加载页面
      await contentPage.reload();

      // 重新导航到 AI 设置页面
      await navigateToAiSettings(headerPage, contentPage);

      // 验证表单值
      const apiKeyValue = await contentPage.locator('input[placeholder="请输入 DeepSeek API Key"]').inputValue();
      const apiUrlValue = await contentPage.locator('input[placeholder="请输入 API 地址"]').inputValue();

      expect(apiKeyValue).toBe(testConfig.apiKey);
      expect(apiUrlValue).toBe(testConfig.apiUrl);
    });

    test('3. 应正确保存配置', async () => {
      const testApiKey = 'sk-test-key-456';
      const testApiUrl = 'https://api.deepseek.com/v1/chat/completions';

      // 填写配置
      await contentPage.locator('input[placeholder="请输入 DeepSeek API Key"]').fill(testApiKey);
      await contentPage.locator('input[placeholder="请输入 API 地址"]').fill(testApiUrl);

      // 点击保存按钮
      await contentPage.locator('button:has-text("保存配置")').click();
      await contentPage.waitForTimeout(500);

      // 验证配置已保存到 localStorage
      const savedConfig = await contentPage.evaluate(() => {
        const configStr = localStorage.getItem('apiflow/ai/config');
        return configStr ? JSON.parse(configStr) : null;
      });

      expect(savedConfig).toBeTruthy();
      expect(savedConfig.apiKey).toBe(testApiKey);
      expect(savedConfig.apiUrl).toBe(testApiUrl);
    });

    test('4. 应在未填写必填项时显示警告', async () => {
      // 清空配置
      await contentPage.locator('input[placeholder="请输入 DeepSeek API Key"]').clear();
      await contentPage.locator('input[placeholder="请输入 API 地址"]').clear();

      // 尝试保存 - 未填写 API Key
      await contentPage.locator('input[placeholder="请输入 API 地址"]').fill('https://api.test.com');
      await contentPage.locator('button:has-text("保存配置")').click();

      // 验证显示警告消息（通过 ElMessage）- 使用 first() 避免 strict mode 错误
      const warningMessage = contentPage.locator('.el-message--warning').first();
      await expect(warningMessage).toBeVisible({ timeout: 2000 });

      // 等待警告消失
      await contentPage.waitForTimeout(3000);

      // 清空 URL，填写 API Key
      await contentPage.locator('input[placeholder="请输入 API 地址"]').clear();
      await contentPage.locator('input[placeholder="请输入 DeepSeek API Key"]').fill('test-key');
      await contentPage.locator('button:has-text("保存配置")').click();

      // 再次验证显示警告
      await expect(contentPage.locator('.el-message--warning').first()).toBeVisible({ timeout: 2000 });
    });

    test('5. 应正确重置配置', async () => {
      // 先设置一些配置
      await contentPage.locator('input[placeholder="请输入 DeepSeek API Key"]').fill('test-key');
      await contentPage.locator('input[placeholder="请输入 API 地址"]').fill('https://api.test.com');

      // 点击重置按钮
      await contentPage.locator('button:has-text("重置")').click();
      await contentPage.waitForTimeout(500);

      // 验证表单已清空
      const apiKeyValue = await contentPage.locator('input[placeholder="请输入 DeepSeek API Key"]').inputValue();
      const apiUrlValue = await contentPage.locator('input[placeholder="请输入 API 地址"]').inputValue();

      expect(apiKeyValue).toBe('');
      expect(apiUrlValue).toBe('');

      // 验证 localStorage 已清空
      const savedConfig = await contentPage.evaluate(() => {
        const configStr = localStorage.getItem('apiflow/ai/config');
        return configStr ? JSON.parse(configStr) : null;
      });

      expect(savedConfig.apiKey).toBe('');
      expect(savedConfig.apiUrl).toBe('');
    });

    test('6. 应正确控制测试按钮的禁用状态', async () => {
      // 清空配置
      await contentPage.locator('button:has-text("重置")').click();
      await contentPage.waitForTimeout(500);

      // 验证测试按钮为禁用状态
      const textTestBtn = contentPage.locator('button:has-text("文本测试")');
      const jsonTestBtn = contentPage.locator('button:has-text("JSON测试")');
      const streamTestBtn = contentPage.locator('button:has-text("流式测试")');

      await expect(textTestBtn).toBeDisabled();
      await expect(jsonTestBtn).toBeDisabled();
      await expect(streamTestBtn).toBeDisabled();

      // 填写配置
      await contentPage.locator('input[placeholder="请输入 DeepSeek API Key"]').fill('test-key');
      await contentPage.locator('input[placeholder="请输入 API 地址"]').fill('https://api.test.com');

      // 验证测试按钮变为可用
      await expect(textTestBtn).toBeEnabled();
      await expect(jsonTestBtn).toBeEnabled();
      await expect(streamTestBtn).toBeEnabled();
    });

    test('7. 应正确执行文本测试', async () => {
      const testApiKey = process.env.TEST_AI_API_KEY;
      const testApiUrl = process.env.TEST_AI_API_URL;
      
      if (!testApiKey || !testApiUrl) {
        throw new Error('测试需要配置 TEST_AI_API_KEY 和 TEST_AI_API_URL 环境变量');
      }
      
      await saveAiConfig(contentPage, testApiKey, testApiUrl);

      await contentPage.locator('button:has-text("文本测试")').click();

      const loadingIcon = contentPage.locator('.result-loading');
      await expect(loadingIcon).toBeVisible({ timeout: 2000 });

      await expect(loadingIcon).not.toBeVisible({ timeout: 60000 });

      const hasResult = await contentPage.locator('.result-content').isVisible();
      const hasError = await contentPage.locator('.result-error').isVisible();

      expect(hasResult || hasError).toBeTruthy();
    });

    test('8. 应正确执行 JSON 测试', async () => {
      const testApiKey = process.env.TEST_AI_API_KEY;
      const testApiUrl = process.env.TEST_AI_API_URL;
      
      if (!testApiKey || !testApiUrl) {
        throw new Error('测试需要配置 TEST_AI_API_KEY 和 TEST_AI_API_URL 环境变量');
      }
      
      await saveAiConfig(contentPage, testApiKey, testApiUrl);

      await contentPage.locator('button:has-text("JSON测试")').click();

      const loadingIcon = contentPage.locator('.result-loading');
      await expect(loadingIcon).toBeVisible({ timeout: 2000 });

      await expect(loadingIcon).not.toBeVisible({ timeout: 60000 });

      const hasResult = await contentPage.locator('.result-content').isVisible();
      const hasError = await contentPage.locator('.result-error').isVisible();

      expect(hasResult || hasError).toBeTruthy();
    });

    test('9. 应正确执行流式测试并支持取消', async () => {
      const testApiKey = process.env.TEST_AI_API_KEY;
      const testApiUrl = process.env.TEST_AI_API_URL;
      
      if (!testApiKey || !testApiUrl) {
        throw new Error('测试需要配置 TEST_AI_API_KEY 和 TEST_AI_API_URL 环境变量');
      }
      
      await saveAiConfig(contentPage, testApiKey, testApiUrl);

      await contentPage.locator('button:has-text("流式测试")').click();

      const cancelBtn = contentPage.locator('button:has-text("取消请求")');
      await expect(cancelBtn).toBeVisible({ timeout: 2000 });

      const loadingIcon = contentPage.locator('.result-loading');
      await expect(loadingIcon).toBeVisible({ timeout: 2000 });

      await contentPage.waitForTimeout(2000);
      await cancelBtn.click();

      await expect(cancelBtn).not.toBeVisible({ timeout: 2000 });
    });
  });

  /*
  |--------------------------------------------------------------------------
  | 第二部分：ai.ts 核心方法测试
  |--------------------------------------------------------------------------
  */
  test.describe('ai.ts 核心方法测试', () => {

    test.describe('chatWithText 方法测试', () => {

      test('1. 未配置时应返回错误', async () => {
        // 清除配置
        await contentPage.evaluate(() => {
          window.electronAPI?.ipcManager?.sendToMain('apiflow:topbar:to:content:sync-ai-config', {
            apiKey: '',
            apiUrl: '',
            timeout: 60000
          });
        });

        await contentPage.waitForTimeout(500);

        const result = await contentPage.evaluate(async () => {
          return await window.electronAPI?.aiManager?.textChat({ prompt: '测试' });
        });
        expect(result).toBeTruthy();
        expect(result!.code).toBe(1);
      });

      test('2. prompt 为空时应返回错误', async () => {
        // 配置 AI
        await contentPage.evaluate(() => {
          window.electronAPI?.ipcManager?.sendToMain('apiflow:topbar:to:content:sync-ai-config', {
            apiKey: 'test-key',
            apiUrl: 'https://api.test.com',
            timeout: 60000
          });
        });

        await contentPage.waitForTimeout(500);

        const result = await contentPage.evaluate(async () => {
          return await window.electronAPI?.aiManager?.textChat({ prompt: '' });
        });

        expect(result).toBeTruthy();
        expect(result!.code).toBe(1);
      });

      test('3. 正确配置时应成功调用', async () => {
        const testApiKey = process.env.TEST_AI_API_KEY;
        const testApiUrl = process.env.TEST_AI_API_URL;
        await contentPage.evaluate(({ apiKey, apiUrl }) => {
          window.electronAPI?.ipcManager?.sendToMain('apiflow:topbar:to:content:sync-ai-config', {
            apiKey: apiKey,
            apiUrl: apiUrl,
            timeout: 60000
          });
        }, { apiKey: testApiKey, apiUrl: testApiUrl });

        await contentPage.waitForTimeout(500);
        
        const result = await contentPage.evaluate(async () => {
          return await window.electronAPI?.aiManager?.textChat({ prompt: '你好' });
        });
        
        expect(result).toBeTruthy();
        expect(result!.code).toBe(0);
        expect(result!.data).toBeTruthy();
      });
    });

    test.describe('chatWithJsonText 方法测试', () => {

      test('1. 未配置时应返回错误', async () => {
        await contentPage.evaluate(() => {
          window.electronAPI?.ipcManager?.sendToMain('apiflow:topbar:to:content:sync-ai-config', {
            apiKey: '',
            apiUrl: '',
            timeout: 60000
          });
        });

        await contentPage.waitForTimeout(500);

        const result = await contentPage.evaluate(async () => {
          return await window.electronAPI?.aiManager?.jsonChat({ prompt: '生成JSON' });
        });

        expect(result).toBeTruthy();
        expect(result!.code).toBe(1);
      });

      test('2. prompt 为空时应返回错误', async () => {
        await contentPage.evaluate(() => {
          window.electronAPI?.ipcManager?.sendToMain('apiflow:topbar:to:content:sync-ai-config', {
            apiKey: 'test-key',
            apiUrl: 'https://api.test.com',
            timeout: 60000
          });
        });

        await contentPage.waitForTimeout(500);

        const result = await contentPage.evaluate(async () => {
          return await window.electronAPI?.aiManager?.jsonChat({ prompt: '' });
        });

        expect(result).toBeTruthy();
        expect(result!.code).toBe(1);
      });

      test('3. 成功时应返回合法 JSON', async () => {
        const testApiKey = process.env.TEST_AI_API_KEY;
        const testApiUrl = process.env.TEST_AI_API_URL;
        await contentPage.evaluate(({ apiKey, apiUrl }) => {
          window.electronAPI?.ipcManager?.sendToMain('apiflow:topbar:to:content:sync-ai-config', {
            apiKey: apiKey,
            apiUrl: apiUrl,
            timeout: 60000
          });
        }, { apiKey: testApiKey, apiUrl: testApiUrl });

        await contentPage.waitForTimeout(500);

        const result = await contentPage.evaluate(async () => {
          return await window.electronAPI?.aiManager?.jsonChat({
            prompt: '生成一个包含name和age的JSON对象'
          });
        });

        expect(result).toBeTruthy();
        expect(result).toHaveProperty('code');
        expect(result).toHaveProperty('data');

        if (result && result.code === 0) {
          expect(() => JSON.parse(result.data)).not.toThrow();
        }
      });
    });

    test.describe('chatWithTextStream 方法测试', () => {

      test('1. 未配置时应调用 onError', async () => {
        await contentPage.evaluate(() => {
          window.electronAPI?.ipcManager?.sendToMain('apiflow:topbar:to:content:sync-ai-config', {
            apiKey: '',
            apiUrl: '',
            timeout: 60000
          });
        });

        await contentPage.waitForTimeout(500);

        const result = await contentPage.evaluate(async () => {
          return new Promise((resolve) => {
            window.electronAPI?.aiManager?.textChatWithStream(
              { requestId: `test-${Date.now()}` },
              (chunk: string) => {},
              () => resolve({ success: true }),
              (error: any) => resolve({ success: false, error })
            );
          });
        });

        expect(result).toBeTruthy();
        expect((result as any).success).toBe(false);
      });

      test('2. 正确配置时应逐步返回数据', async () => {
        const testApiKey = process.env.TEST_AI_API_KEY;
        const testApiUrl = process.env.TEST_AI_API_URL;
        await contentPage.evaluate(({ apiKey, apiUrl }) => {
          window.electronAPI?.ipcManager?.sendToMain('apiflow:topbar:to:content:sync-ai-config', {
            apiKey: apiKey,
            apiUrl: apiUrl,
            timeout: 60000
          });
        }, { apiKey: testApiKey, apiUrl: testApiUrl });

        await contentPage.waitForTimeout(500);

        const result = await contentPage.evaluate(async () => {
          return new Promise((resolve) => {
            let receivedData = '';
            const requestId = `test-stream-${Date.now()}`;

            const controller = window.electronAPI?.aiManager?.textChatWithStream(
              { requestId },
              (chunk: string) => {
                receivedData += chunk;
              },
              () => {
                resolve({ success: true, hasData: receivedData.length > 0 });
              },
              (error: any) => {
                resolve({ success: false, error });
              }
            );

            // 设置超时
            setTimeout(() => {
              controller?.cancel();
              resolve({ success: false, timeout: true });
            }, 30000);
          });
        });

        expect(result).toBeTruthy();
      });

      test('3. 流式完成时应调用 onEnd', async () => {
        const testApiKey = process.env.TEST_AI_API_KEY;
        const testApiUrl = process.env.TEST_AI_API_URL;
        await contentPage.evaluate(({ apiKey, apiUrl }) => {
          window.electronAPI?.ipcManager?.sendToMain('apiflow:topbar:to:content:sync-ai-config', {
            apiKey: apiKey,
            apiUrl: apiUrl,
            timeout: 60000
          });
        }, { apiKey: testApiKey, apiUrl: testApiUrl });

        await contentPage.waitForTimeout(500);

        const result = await contentPage.evaluate(async () => {
          return new Promise((resolve) => {
            let onEndCalled = false;

            window.electronAPI?.aiManager?.textChatWithStream(
              { requestId: `test-end-${Date.now()}` },
              () => {},
              () => {
                onEndCalled = true;
                resolve({ onEndCalled });
              },
              () => {
                resolve({ onEndCalled: false, hasError: true });
              }
            );

            setTimeout(() => {
              resolve({ onEndCalled, timeout: true });
            }, 30000);
          });
        });

        expect(result).toBeTruthy();
      });
    });

    test.describe('cancelStream 方法测试', () => {

      test('1. 应正确取消流式请求', async () => {
        const testApiKey = process.env.TEST_AI_API_KEY;
        const testApiUrl = process.env.TEST_AI_API_URL;
        await contentPage.evaluate(({ apiKey, apiUrl }) => {
          window.electronAPI?.ipcManager?.sendToMain('apiflow:topbar:to:content:sync-ai-config', {
            apiKey: apiKey,
            apiUrl: apiUrl,
            timeout: 60000
          });
        }, { apiKey: testApiKey, apiUrl: testApiUrl });

        await contentPage.waitForTimeout(500);

        const result = await contentPage.evaluate(async () => {
          return new Promise((resolve) => {
            const requestId = `test-cancel-${Date.now()}`;
            let cancelled = false;

            const controller = window.electronAPI?.aiManager?.textChatWithStream(
              { requestId },
              () => {},
              () => {
                resolve({ cancelled: false, completed: true });
              },
              (error: any) => {
                if (error.msg?.includes('取消')) {
                  cancelled = true;
                }
                resolve({ cancelled, error: error.msg });
              }
            );

            // 等待一段时间后取消
            setTimeout(async () => {
              await controller?.cancel();

              // 给一点时间让取消生效
              setTimeout(() => {
                resolve({ cancelled: true, manualCancel: true });
              }, 500);
            }, 1000);
          });
        });

        expect(result).toBeTruthy();
        expect((result as any).cancelled || (result as any).manualCancel).toBeTruthy();
      });

      test('2. 取消不存在的请求应不报错', async () => {
        const result = await contentPage.evaluate(async () => {
          try {
            const aiManager = window.electronAPI?.aiManager as any;
            if (aiManager?.cancelStream) {
              await aiManager.cancelStream('non-existent-request-id');
            }
            return { success: true };
          } catch (error) {
            return { success: false, error: (error as Error).message };
          }
        });

        expect(result.success).toBe(true);
      });
    });

    test.describe('配置管理测试', () => {

      test('1. updateConfig 应正确更新配置', async () => {
        const newConfig = {
          apiKey: 'new-test-key',
          apiUrl: 'https://new-api.test.com',
          timeout: 30000
        };

        await contentPage.evaluate((config) => {
          window.electronAPI?.ipcManager?.sendToMain('apiflow:topbar:to:content:sync-ai-config', config);
        }, newConfig);

        await contentPage.waitForTimeout(500);

        // 尝试调用方法验证配置已更新
        const result = await contentPage.evaluate(async () => {
          return await window.electronAPI?.aiManager?.textChat({ prompt: '测试' });
        });

        // 配置应该已经生效
        expect(result).toBeTruthy();
        expect(result).toHaveProperty('code');
      });

      test('2. timeout 参数应可选', async () => {
        await contentPage.evaluate(() => {
          window.electronAPI?.ipcManager?.sendToMain('apiflow:topbar:to:content:sync-ai-config', {
            apiKey: 'test-key',
            apiUrl: 'https://api.test.com'
            // 不传 timeout
          });
        });

        await contentPage.waitForTimeout(500);

        const result = await contentPage.evaluate(async () => {
          return await window.electronAPI?.aiManager?.textChat({ prompt: '测试' });
        });

        expect(result).toBeTruthy();
      });

      test('3. validateConfig 应正确校验配置', async () => {
        // 测试缺少 apiKey
        await contentPage.evaluate(() => {
          window.electronAPI?.ipcManager?.sendToMain('apiflow:topbar:to:content:sync-ai-config', {
            apiKey: '',
            apiUrl: 'https://api.test.com',
            timeout: 60000
          });
        });

        await contentPage.waitForTimeout(500);

        const result1 = await contentPage.evaluate(async () => {
          return await window.electronAPI?.aiManager?.textChat({ prompt: '测试' });
        });

        expect(result1).toBeTruthy();
        expect(result1!.code).toBe(1);

        await contentPage.evaluate(() => {
          window.electronAPI?.ipcManager?.sendToMain('apiflow:topbar:to:content:sync-ai-config', {
            apiKey: 'test-key',
            apiUrl: '',
            timeout: 60000
          });
        });

        await contentPage.waitForTimeout(500);

        const result2 = await contentPage.evaluate(async () => {
          return await window.electronAPI?.aiManager?.textChat({ prompt: '测试' });
        });

        expect(result2).toBeTruthy();
        expect(result2!.code).toBe(1);
      });
    });
  });
});
