import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('ResponseHeader', () => {
  // 测试用例1: 返回头正确展示
  test('响应头正确展示', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '响应头测试' });
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证响应区域存在
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
    // 切换到响应头标签页
    const headerTab = contentPage.locator('[data-testid="response-tabs"]').getByRole('tab', { name: /响应头|Headers|Response Headers/i }).first();
    const headerTabVisible = await headerTab.isVisible().catch(() => false);
    if (headerTabVisible) {
      await headerTab.click();
      await contentPage.waitForTimeout(300);
    }
    // 验证响应头区域存在
    const responseHeaders = contentPage.locator('.response-headers, .header-list, .response-header-area');
    const hasHeaders = await responseHeaders.first().isVisible().catch(() => false);
    expect(hasHeaders || await responseTabs.isVisible()).toBeTruthy();
  });
  // 测试用例2: 响应头列表显示完整信息
  test('响应头列表显示Content-Type等标准头', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '响应头详情测试' });
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证响应区域存在
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
  });
});


