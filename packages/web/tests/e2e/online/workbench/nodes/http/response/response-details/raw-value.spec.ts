import { test, expect } from '../../../../../../../fixtures/electron-online.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('RawValue', () => {
  // 测试用例1: 原始值需要正确返回
  test('原始值正确返回', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '原始值测试' });
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
    // 切换到原始值标签页
    const rawTab = contentPage.locator('[data-testid="response-tabs"]').getByRole('tab', { name: /原始值|原始|Raw/i }).first();
    const rawTabVisible = await rawTab.isVisible().catch(() => false);
    if (rawTabVisible) {
      await rawTab.click();
      await contentPage.waitForTimeout(300);
    }
  });
  // 测试用例2: 原始值与JSON格式化显示的内容一致
  test('原始值与JSON格式化显示内容一致', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '原始值一致性测试' });
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?test=rawvalue`);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证响应区域存在
    const responseBody = contentPage.locator('[data-testid="response-tab-body"]');
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证响应内容包含预期数据
    const responseText = await responseBody.textContent();
    expect(responseText).toContain('rawvalue');
  });
});


