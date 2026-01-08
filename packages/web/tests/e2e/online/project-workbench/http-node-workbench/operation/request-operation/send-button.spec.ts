import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('SendButton', () => {
  // 测试用例1: 发送请求按钮点击后请求过程中出现取消请求按钮
  test('发送请求按钮点击后出现取消请求按钮点击后取消请求', async ({ contentPage, clearCache, createProject, createNode, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '取消请求测试' });
    // 设置请求URL（使用一个会延迟响应的地址或不存在的地址来模拟长时间请求）
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击发送请求按钮
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 等待请求完成或超时
    await contentPage.waitForTimeout(3000);
    // 验证按钮恢复为发送请求状态
    await expect(sendBtn).toBeVisible({ timeout: 5000 });
  });
  // 测试用例2: 发送请求按钮点击后变成取消请求按钮,请求完成后恢复
  test('发送请求按钮请求完成后恢复为发送请求按钮', async ({ contentPage, clearCache, createProject, createNode, createNode, loginAccount }) => {
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
    // 等待请求完成
    await contentPage.waitForTimeout(3000);
    // 验证响应区域显示响应数据
    const responseSummary = contentPage.locator('.response-summary-view');
    await expect(responseSummary).toBeVisible({ timeout: 10000 });
    // 验证按钮恢复为发送请求状态
    await expect(sendBtn).toBeVisible({ timeout: 5000 });
  });
});

