import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('RequestUrlValidation', () => {
  // 测试用例1: 验证localhost格式的url,调用echo接口,能正确请求,并且显示正确的url地址
  test('验证localhost格式的url能正确请求并显示正确的url地址', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: 'localhost格式URL测试接口' });
    // 设置请求URL为localhost格式
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://localhost:${MOCK_SERVER_PORT}/echo`);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证响应中包含host信息，确认localhost被正确解析
    await expect(responseBody).toContainText('host', { timeout: 10000 });
    await expect(responseBody).toContainText('127.0.0.1', { timeout: 10000 });
    // 验证响应中包含请求的URL信息
    await expect(responseBody).toContainText('/echo', { timeout: 10000 });
  });
  // 测试用例2: 验证127.0.0.1这样的ip url,调用echo接口,能正确请求,并且显示正确的url地址
  test('验证127.0.0.1格式的ip url能正确请求并显示正确的url地址', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: 'IP格式URL测试接口' });
    // 设置请求URL为IP格式
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证响应中包含host信息，确认IP地址被正确解析
    await expect(responseBody).toContainText('host', { timeout: 10000 });
    await expect(responseBody).toContainText('127.0.0.1', { timeout: 10000 });
    // 验证响应中包含请求的URL信息
    await expect(responseBody).toContainText('/echo', { timeout: 10000 });
  });
});


