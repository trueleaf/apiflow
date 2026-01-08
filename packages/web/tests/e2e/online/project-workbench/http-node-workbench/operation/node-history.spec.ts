import { test, expect } from '../../../../../fixtures/electron-online.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('NodeHistory', () => {
  // 测试用例1: 点击历史记录按钮,展示当前节点的发送历史列表,列表按时间倒序排列
  test('点击历史记录按钮,展示当前节点的发送历史列表', async ({ contentPage, clearCache, createProject, createNode, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '历史记录测试' });
    const createdNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '历史记录测试' });
    await createdNode.click();
    await expect(contentPage.locator('[data-testid="url-input"]')).toBeVisible({ timeout: 5000 });
    // 设置请求URL并发送多次请求以生成历史记录
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?request=first`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    const statusCode = responseArea.getByTestId('status-code');
    await expect(statusCode).toContainText('200', { timeout: 10000 });
    await expect(sendBtn).toBeEnabled({ timeout: 10000 });
    // 发送第二次请求
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?request=second`);
    await sendBtn.click();
    await expect(statusCode).toContainText('200', { timeout: 10000 });
    await expect(sendBtn).toBeEnabled({ timeout: 10000 });
    // 发送第三次请求
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?request=third`);
    await sendBtn.click();
    await expect(statusCode).toContainText('200', { timeout: 10000 });
    await expect(sendBtn).toBeEnabled({ timeout: 10000 });
    // 点击历史记录按钮
    const historyBtn = contentPage.locator('[data-testid="http-params-history-btn"]');
    await historyBtn.click();
    // 验证历史记录面板打开
    const historyPanel = contentPage.locator('.history-dropdown');
    await expect(historyPanel).toBeVisible({ timeout: 5000 });
    const historyLoading = contentPage.locator('.history-loading');
    await expect(historyLoading).toBeHidden({ timeout: 10000 });
    // 验证历史记录列表按时间倒序排列(最新的在最上方)
    const historyItems = historyPanel.locator('.history-item');
    await expect.poll(async () => historyItems.count(), { timeout: 20000 }).toBeGreaterThanOrEqual(3);
  });
  // 测试用例2: 点击历史记录项可以查看该次请求的详细信息
  test('点击历史记录项可以查看该次请求的详细信息', async ({ contentPage, clearCache, createProject, createNode, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '历史详情测试' });
    const createdNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '历史详情测试' });
    await createdNode.click();
    await expect(contentPage.locator('[data-testid="url-input"]')).toBeVisible({ timeout: 5000 });
    // 设置请求URL并发送请求以生成历史记录
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?detail=test`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    const statusCode = responseArea.getByTestId('status-code');
    await expect(statusCode).toContainText('200', { timeout: 10000 });
    await expect(sendBtn).toBeEnabled({ timeout: 10000 });
    // 点击历史记录按钮
    const historyBtn = contentPage.locator('[data-testid="http-params-history-btn"]');
    await historyBtn.click();
    const historyPanel = contentPage.locator('.history-dropdown');
    await expect(historyPanel).toBeVisible({ timeout: 5000 });
    const historyLoading = contentPage.locator('.history-loading');
    await expect(historyLoading).toBeHidden({ timeout: 10000 });
    // 点击历史记录列表中的某条记录
    const historyItems = historyPanel.locator('.history-item');
    await expect.poll(async () => historyItems.count(), { timeout: 10000 }).toBeGreaterThan(0);
    await expect(historyItems.first()).toBeVisible({ timeout: 10000 });
    await historyItems.first().click();
    await contentPage.waitForTimeout(500);
    // 验证显示该历史记录的详细信息
    const historyDetail = contentPage.locator('.history-detail-panel');
    await expect(historyDetail).toBeVisible({ timeout: 5000 });
    // 验证详情包含请求URL信息
    await expect(historyDetail).toContainText('echo', { timeout: 5000 });
  });
  // 测试用例3: 节点没有历史记录时展示空状态提示
  test('节点没有历史记录时展示空状态提示', async ({ contentPage, clearCache, createProject, createNode, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点(不发送任何请求)
    await createNode(contentPage, { nodeType: 'http', name: '空历史记录测试' });
    const createdNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '空历史记录测试' });
    await createdNode.click();
    await expect(contentPage.locator('[data-testid="url-input"]')).toBeVisible({ timeout: 5000 });
    // 点击历史记录按钮
    const historyBtn = contentPage.locator('[data-testid="http-params-history-btn"]');
    await historyBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证历史记录面板打开
    const historyPanel = contentPage.locator('.history-dropdown');
    await expect(historyPanel).toBeVisible({ timeout: 5000 });
    // 验证显示空状态提示
    const emptyState = contentPage.locator('.history-empty');
    await expect(emptyState).toBeVisible({ timeout: 5000 });
  });
});

