import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('SendButton', () => {
  // 测试用例1: 发送请求按钮点击后请求过程中出现取消请求按钮
  test('发送请求按钮点击后出现取消请求按钮点击后取消请求', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '取消请求测试' });
    // 设置请求URL为延迟接口，确保进入可取消状态
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/delay/10000`);
    // 点击发送请求按钮
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    const cancelBtn = contentPage.locator('[data-testid="operation-cancel-btn"]');
    await expect(cancelBtn).toBeVisible({ timeout: 5000 });
    await cancelBtn.click();
    await expect(contentPage.locator('[data-testid="operation-send-btn"]')).toBeVisible({ timeout: 5000 });
    await expect(cancelBtn).toBeHidden({ timeout: 5000 });
  });
  // 测试用例2: 发送请求按钮点击后变成取消请求按钮,请求完成后恢复
  test('发送请求按钮请求完成后恢复为发送请求按钮', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '请求状态测试' });
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 获取发送按钮初始状态
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await expect(sendBtn).toBeVisible({ timeout: 5000 });
    // 点击发送请求按钮
    await sendBtn.click();
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.locator('.s-json-editor').first();
    await expect(responseBody).toContainText('"method": "GET"', { timeout: 10000 });
    // 验证按钮恢复为发送请求状态
    await expect(sendBtn).toBeVisible({ timeout: 5000 });
  });
  // 测试用例3: 延迟请求过程中点击取消请求后恢复发送按钮
  test('延迟请求过程中点击取消请求后恢复发送按钮', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await createNode(contentPage, { nodeType: 'http', name: '延迟请求取消测试' });
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/delay/10000`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    const cancelBtn = contentPage.locator('[data-testid="operation-cancel-btn"]');
    await expect(cancelBtn).toBeVisible({ timeout: 5000 });
    await cancelBtn.click();
    await contentPage.waitForTimeout(500);
    await expect(contentPage.locator('[data-testid="operation-send-btn"]')).toBeVisible({ timeout: 5000 });
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?afterCancel=1`);
    await contentPage.locator('[data-testid="operation-send-btn"]').click();
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    await expect(responseArea.locator('.s-json-editor').first()).toContainText('afterCancel', { timeout: 10000 });
  });
});


