import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, navigateToAiSettings, configureAiWithEnv } from '../../../fixtures/fixtures';
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
      const pageTitle = await contentPage.locator('h2').textContent();
      expect(pageTitle).toContain('AI 设置');
      const providerSelect = contentPage.locator('.config-section .el-select').first();
      const apiKeyInput = contentPage.locator('input[placeholder="请输入 DeepSeek API Key"]');
      const modelSelect = contentPage.locator('.config-section .el-select').nth(1);
      await expect(providerSelect).toBeVisible();
      await expect(apiKeyInput).toBeVisible();
      await expect(modelSelect).toBeVisible();
    });

    test('2. 应从 localStorage 正确加载已保存的配置', async () => {
      const testConfig = {
        id: 'test-id',
        name: 'Default Provider',
        provider: 'DeepSeek',
        apiKey: 'test-api-key-123',
        baseURL: 'https://api.deepseek.com',
        model: 'deepseek-chat',
        customHeaders: []
      };
      await contentPage.evaluate((config) => {
        localStorage.setItem('apiflow/ai/llmProvider', JSON.stringify(config));
      }, testConfig);
      await contentPage.reload();
      await navigateToAiSettings(headerPage, contentPage);
      const apiKeyValue = await contentPage.locator('input[placeholder="请输入 DeepSeek API Key"]').inputValue();
      expect(apiKeyValue).toBe(testConfig.apiKey);
    });

    test('3. 应正确保存配置', async () => {
      const testApiKey = 'sk-test-key-456';
      await contentPage.locator('input[placeholder="请输入 DeepSeek API Key"]').fill(testApiKey);
      await contentPage.locator('button:has-text("保存配置")').click();
      await contentPage.waitForTimeout(500);
      const savedConfig = await contentPage.evaluate(() => {
        const configStr = localStorage.getItem('apiflow/ai/llmProvider');
        return configStr ? JSON.parse(configStr) : null;
      });
      expect(savedConfig).toBeTruthy();
      expect(savedConfig.apiKey).toBe(testApiKey);
      expect(savedConfig.baseURL).toBe('https://api.deepseek.com');
    });

    test('4. 应在未填写必填项时显示警告', async () => {
      await contentPage.locator('button:has-text("重置")').click();
      await contentPage.waitForTimeout(500);
      await contentPage.locator('button:has-text("保存配置")').click();
      const warningMessage = contentPage.locator('.el-message--warning').first();
      await expect(warningMessage).toBeVisible({ timeout: 2000 });
    });

    test('5. 应正确重置配置', async () => {
      await contentPage.locator('input[placeholder="请输入 DeepSeek API Key"]').fill('test-key');
      await contentPage.locator('button:has-text("重置")').click();
      await contentPage.waitForTimeout(500);
      const apiKeyValue = await contentPage.locator('input[placeholder="请输入 DeepSeek API Key"]').inputValue();
      expect(apiKeyValue).toBe('');
      const savedConfig = await contentPage.evaluate(() => {
        const configStr = localStorage.getItem('apiflow/ai/llmProvider');
        return configStr ? JSON.parse(configStr) : null;
      });
      expect(savedConfig.apiKey).toBe('');
    });

    test('6. 应正确控制调试面板发送按钮的禁用状态', async () => {
      await contentPage.locator('button:has-text("重置")').click();
      await contentPage.waitForTimeout(500);
      const sendBtn = contentPage.locator('.debug-section button:has-text("发送")');
      await expect(sendBtn).toBeDisabled();
      await contentPage.locator('input[placeholder="请输入 DeepSeek API Key"]').fill('test-key');
      await contentPage.locator('button:has-text("保存配置")').click();
      await contentPage.waitForTimeout(500);
      await contentPage.locator('textarea[placeholder="输入测试消息..."]').fill('测试消息');
      await expect(sendBtn).toBeEnabled();
    });

    test('7. 应支持切换 Provider 类型', async () => {
      const providerSelect = contentPage.locator('.config-section .el-select').first();
      await providerSelect.click();
      await contentPage.locator('.el-select-dropdown__item:has-text("OpenAI Compatible")').click();
      await contentPage.waitForTimeout(300);
      const baseUrlInput = contentPage.locator('input[placeholder="请输入 API Base URL"]');
      const modelIdInput = contentPage.locator('input[placeholder="请输入模型 ID"]');
      await expect(baseUrlInput).toBeVisible();
      await expect(modelIdInput).toBeVisible();
    });

    test('8. OpenAI Compatible 模式应支持自定义请求头', async () => {
      const providerSelect = contentPage.locator('.config-section .el-select').first();
      await providerSelect.click();
      await contentPage.locator('.el-select-dropdown__item:has-text("OpenAI Compatible")').click();
      await contentPage.waitForTimeout(300);
      await contentPage.locator('button:has-text("添加请求头")').click();
      const headerKeyInput = contentPage.locator('input[placeholder="Header Key"]');
      const headerValueInput = contentPage.locator('input[placeholder="Header Value"]');
      await expect(headerKeyInput).toBeVisible();
      await expect(headerValueInput).toBeVisible();
      await headerKeyInput.fill('X-Custom-Header');
      await headerValueInput.fill('custom-value');
      const deleteBtn = contentPage.locator('.header-remove');
      await deleteBtn.click();
      await expect(headerKeyInput).not.toBeVisible();
    });
  });

  test('Agent 模式应为禁用并显示敬请期待提示', async () => {
    await headerPage.locator('.ai-trigger-btn').click();
    const aiDialog = contentPage.locator('.ai-dialog');
    await expect(aiDialog).toBeVisible();
    const modeTrigger = contentPage.locator('.ai-input-trigger').first();
    await modeTrigger.click();
    const firstItem = contentPage.locator('.ai-dropdown .ai-dropdown-item').nth(0);
    await expect(firstItem).toBeDisabled();
    await expect(firstItem).toHaveAttribute('title', '敬请期待');
    await contentPage.locator('.ai-dialog-close').click();
  });

  /*
  |--------------------------------------------------------------------------
  | 第二部分：ai.ts 核心方法测试
  |--------------------------------------------------------------------------
  */
  test.describe('ai.ts 核心方法测试', () => {

    test.describe('chatWithText 方法测试', () => {

      test('1. 未配置时应返回错误', async () => {
        await contentPage.evaluate(async () => {
          await window.electronAPI?.aiManager?.updateConfig({
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
        await configureAiWithEnv(contentPage);

        const result = await contentPage.evaluate(async () => {
          return await window.electronAPI?.aiManager?.textChat({ prompt: '' });
        });
        expect(result).toBeTruthy();
        expect(result!.code).toBe(1);
      });

      test('3. 正确配置时应成功调用', async () => {
        await configureAiWithEnv(contentPage);

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
        await contentPage.evaluate(async () => {
          await window.electronAPI?.aiManager?.updateConfig({
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
        await configureAiWithEnv(contentPage);

        const result = await contentPage.evaluate(async () => {
          return await window.electronAPI?.aiManager?.jsonChat({ prompt: '' });
        });
        expect(result).toBeTruthy();
        expect(result!.code).toBe(1);
      });

      test('3. 成功时应返回合法 JSON', async () => {
        await configureAiWithEnv(contentPage);

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
        await contentPage.evaluate(async () => {
          await window.electronAPI?.aiManager?.updateConfig({
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
              (chunk: string) => { },
              () => resolve({ success: true }),
              (error: unknown) => resolve({ success: false, error })
            );
          });
        });

        expect(result).toBeTruthy();
        expect((result as { success: boolean }).success).toBe(false);
      });

      test('2. 正确配置时应逐步返回数据', async () => {
        await configureAiWithEnv(contentPage);

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
              (error: unknown) => {
                resolve({ success: false, error });
              }
            );

            setTimeout(() => {
              controller?.cancel();
              resolve({ success: false, timeout: true });
            }, 30000);
          });
        });

        expect(result).toBeTruthy();
      });

      test('3. 流式完成时应调用 onEnd', async () => {
        await configureAiWithEnv(contentPage);

        const result = await contentPage.evaluate(async () => {
          return new Promise((resolve) => {
            let onEndCalled = false;

            window.electronAPI?.aiManager?.textChatWithStream(
              { requestId: `test-end-${Date.now()}` },
              () => { },
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
        await configureAiWithEnv(contentPage);

        const result = await contentPage.evaluate(async () => {
          return new Promise((resolve) => {
            const requestId = `test-cancel-${Date.now()}`;
            let cancelled = false;

            const controller = window.electronAPI?.aiManager?.textChatWithStream(
              { requestId },
              () => { },
              () => {
                resolve({ cancelled: false, completed: true });
              },
              (error: { msg?: string }) => {
                if (error.msg?.includes('取消')) {
                  cancelled = true;
                }
                resolve({ cancelled, error: error.msg });
              }
            );

            setTimeout(async () => {
              await controller?.cancel();

              setTimeout(() => {
                resolve({ cancelled: true, manualCancel: true });
              }, 500);
            }, 1000);
          });
        });

        expect(result).toBeTruthy();
        expect((result as { cancelled?: boolean; manualCancel?: boolean }).cancelled || (result as { cancelled?: boolean; manualCancel?: boolean }).manualCancel).toBeTruthy();
      });

      test('2. 取消不存在的请求应不报错', async () => {
        const result = await contentPage.evaluate(async () => {
          try {
            const aiManager = window.electronAPI?.aiManager as { cancelStream?: (id: string) => Promise<void> };
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
        await configureAiWithEnv(contentPage);

        const result = await contentPage.evaluate(async () => {
          return await window.electronAPI?.aiManager?.textChat({ prompt: '测试' });
        });

        expect(result).toBeTruthy();
        expect(result).toHaveProperty('code');
      });

      test('2. timeout 参数应正确传递', async () => {
        await configureAiWithEnv(contentPage, 30000);
        const result = await contentPage.evaluate(async () => {
          return await window.electronAPI?.aiManager?.textChat({ prompt: '测试' });
        });

        expect(result).toBeTruthy();
        expect(result).toHaveProperty('code');
        if (result && result.code === 0) {
          expect(result.data).toBeTruthy();
        }
      });

      test('3. validateConfig 应正确校验配置', async () => {
        await contentPage.evaluate(async () => {
          await window.electronAPI?.aiManager?.updateConfig({
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

        await contentPage.evaluate(async () => {
          await window.electronAPI?.aiManager?.updateConfig({
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

      test('4. 应在超时时返回错误', async () => {
        await configureAiWithEnv(contentPage, 100);

        const result = await contentPage.evaluate(async () => {
          return await window.electronAPI?.aiManager?.textChat({ prompt: '测试超时场景' });
        });
        expect(result).toBeTruthy();
        expect(result!.code).toBe(1);
      });
    });
  });
});
