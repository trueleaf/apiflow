import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';

test.describe('HTTP节点 - User-Agent测试', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const result = await initOfflineWorkbench(electronApp);
    headerPage = result.headerPage;
    contentPage = result.contentPage;

    await createProject(contentPage, 'UserAgent测试项目');
    await createSingleNode(contentPage, {
      name: 'Test UserAgent',
      type: 'http'
    });
  });

  test('发送请求时应包含默认User-Agent', async () => {
    // 设置URL为测试服务器echo接口
    const urlInput = contentPage.locator('[data-testid="url-input"]');
    await urlInput.fill('http://localhost:3100/echo');

    // 发送请求
    const sendBtn = contentPage.locator('button:has-text("发送请求")').first();
    await sendBtn.click();

    // 等待响应区域显示
    await expect(contentPage.locator('.response-meta .status-code')).toContainText('200', { timeout: 10000 });

    // 检查响应内容中是否包含 user-agent
    const responsePreview = contentPage.locator('.response-preview');
    await expect(responsePreview).toBeVisible();
    
    // 验证包含 user-agent 字段
    await expect(responsePreview).toContainText('user-agent', { ignoreCase: true });
    // 验证包含默认值
    await expect(responsePreview).toContainText('https://github.com/trueleaf/apiflow');
  });
});
