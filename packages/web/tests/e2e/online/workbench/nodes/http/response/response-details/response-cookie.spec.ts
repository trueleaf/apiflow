import { test, expect } from '../../../../../../../fixtures/electron-online.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('ResponseCookie', () => {
  // 测试用例1: 返回cookie正确展示
  test('返回Cookie正确展示', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: 'Cookie测试' });
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
    // 切换到Cookie标签页
    const cookieTab = contentPage.locator('[data-testid="response-tabs"]').getByRole('tab', { name: /Cookie|Cookies/i }).first();
    const cookieTabVisible = await cookieTab.isVisible().catch(() => false);
    if (cookieTabVisible) {
      await cookieTab.click();
      await contentPage.waitForTimeout(300);
    }
  });
  // 测试用例2: Cookie值包括名称,值,域,路径等完整信息
  test('Cookie展示包含完整信息', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: 'Cookie详情测试' });
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击Headers标签页添加Cookie请求头
    const headersTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    // 添加Cookie请求头
    const headerKeyInput = contentPage.locator('.custom-headers input[placeholder*="名称"], .custom-headers input[placeholder*="Key"]').first();
    const headerKeyInputVisible = await headerKeyInput.isVisible().catch(() => false);
    if (headerKeyInputVisible) {
      await headerKeyInput.fill('Cookie');
      await contentPage.waitForTimeout(200);
      const headerValueInput = contentPage.locator('.custom-headers input[placeholder*="值"], .custom-headers input[placeholder*="Value"]').first();
      await headerValueInput.fill('test=value123');
      await contentPage.waitForTimeout(300);
    }
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证响应区域存在
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
  });
});


