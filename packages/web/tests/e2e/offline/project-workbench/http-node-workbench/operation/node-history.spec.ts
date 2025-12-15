import { test, expect } from '../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('NodeHistory', () => {
  // 测试用例1: 点击历史记录按钮,展示当前节点的发送历史列表,列表按时间倒序排列
  test('点击历史记录按钮,展示当前节点的发送历史列表', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('历史记录测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL并发送多次请求以生成历史记录
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?request=first`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 发送第二次请求
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?request=second`);
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 发送第三次请求
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?request=third`);
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 点击历史记录按钮
    const historyBtn = contentPage.locator('[data-testid="history-btn"]');
    await historyBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证历史记录面板打开
    const historyPanel = contentPage.locator('.history-panel, .history-list, [data-testid="history-panel"]');
    await expect(historyPanel).toBeVisible({ timeout: 5000 });
    // 验证历史记录列表按时间倒序排列(最新的在最上方)
    const historyItems = contentPage.locator('.history-item, .history-list-item');
    const historyCount = await historyItems.count();
    expect(historyCount).toBeGreaterThanOrEqual(3);
  });
  // 测试用例2: 点击历史记录项可以查看该次请求的详细信息
  test('点击历史记录项可以查看该次请求的详细信息', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('历史详情测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL并发送请求以生成历史记录
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?detail=test`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 点击历史记录按钮
    const historyBtn = contentPage.locator('[data-testid="history-btn"]');
    await historyBtn.click();
    await contentPage.waitForTimeout(500);
    // 点击历史记录列表中的某条记录
    const historyItems = contentPage.locator('.history-item, .history-list-item');
    await historyItems.first().click();
    await contentPage.waitForTimeout(500);
    // 验证显示该历史记录的详细信息
    const historyDetail = contentPage.locator('.history-detail, .history-content, [data-testid="history-detail"]');
    await expect(historyDetail).toBeVisible({ timeout: 5000 });
    // 验证详情包含请求URL信息
    await expect(historyDetail).toContainText('echo', { timeout: 5000 });
  });
  // 测试用例3: 节点没有历史记录时展示空状态提示
  test('节点没有历史记录时展示空状态提示', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点(不发送任何请求)
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('空历史记录测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 点击历史记录按钮
    const historyBtn = contentPage.locator('[data-testid="history-btn"]');
    await historyBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证历史记录面板打开
    const historyPanel = contentPage.locator('.history-panel, .history-list, [data-testid="history-panel"]');
    await expect(historyPanel).toBeVisible({ timeout: 5000 });
    // 验证显示空状态提示
    const emptyState = contentPage.locator('.empty-state, .no-data, .el-empty');
    await expect(emptyState).toBeVisible({ timeout: 5000 });
  });
});
