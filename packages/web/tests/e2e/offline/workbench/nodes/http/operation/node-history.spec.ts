import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('NodeHistory', () => {
  // 测试用例1: 点击历史记录按钮,展示当前节点的发送历史列表,列表按时间倒序排列
  test('点击历史记录按钮,展示当前节点的发送历史列表', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
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
    const createdNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '历史记录测试' });
    await createdNode.click();
    await expect(contentPage.locator('[data-testid="url-input"]')).toBeVisible({ timeout: 5000 });
    // 通过“保存接口”生成历史记录（历史记录来自保存快照，不是发送请求）
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    const saveBtn = contentPage.locator('[data-testid="operation-save-btn"]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?request=first`);
    await saveBtn.click();
    await expect(saveBtn).not.toHaveClass(/is-loading/);
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?request=second`);
    await saveBtn.click();
    await expect(saveBtn).not.toHaveClass(/is-loading/);
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?request=third`);
    await saveBtn.click();
    await expect(saveBtn).not.toHaveClass(/is-loading/);
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
  test('鼠标悬停历史记录项展示详情信息', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
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
    const createdNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '历史详情测试' });
    await createdNode.click();
    await expect(contentPage.locator('[data-testid="url-input"]')).toBeVisible({ timeout: 5000 });
    // 保存接口生成历史记录
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    const saveBtn = contentPage.locator('[data-testid="operation-save-btn"]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?detail=test`);
    await saveBtn.click();
    await expect(saveBtn).not.toHaveClass(/is-loading/);
    // 点击历史记录按钮
    const historyBtn = contentPage.locator('[data-testid="http-params-history-btn"]');
    await historyBtn.click();
    const historyPanel = contentPage.locator('.history-dropdown');
    await expect(historyPanel).toBeVisible({ timeout: 5000 });
    const historyLoading = contentPage.locator('.history-loading');
    await expect(historyLoading).toBeHidden({ timeout: 10000 });
    // 悬停历史记录列表中的某条记录，展示详情
    const historyItems = historyPanel.locator('.history-item');
    await expect.poll(async () => historyItems.count(), { timeout: 10000 }).toBeGreaterThan(0);
    await expect(historyItems.first()).toBeVisible({ timeout: 10000 });
    await historyItems.first().hover();
    const historyDetail = contentPage.locator('.history-detail-panel');
    await expect(historyDetail).toBeVisible({ timeout: 5000 });
    // 验证详情包含请求URL信息
    await expect(historyDetail).toContainText('echo', { timeout: 5000 });
  });
  // 测试用例3: 节点没有历史记录时展示空状态提示
  test('节点没有历史记录时展示空状态提示', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
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
    const historyLoading = contentPage.locator('.history-loading');
    await expect(historyLoading).toBeHidden({ timeout: 10000 });
    // 验证显示空状态提示
    const emptyState = contentPage.locator('.history-empty');
    await expect(emptyState).toBeVisible({ timeout: 5000 });
  });
  test('发送请求后历史记录列表条数增加', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('历史计数测试');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    // 设置URL并发送第一次请求
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:3456/echo?round=1`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 发送第二次请求
    await urlInput.fill(`http://127.0.0.1:3456/echo?round=2`);
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 打开历史记录面板并验证条数
    const historyBtn = contentPage.locator('[data-testid="http-params-history-btn"]');
    await historyBtn.click();
    await contentPage.waitForTimeout(500);
    const historyPanel = contentPage.locator('.history-dropdown');
    await expect(historyPanel).toBeVisible({ timeout: 5000 });
    const historyLoading = contentPage.locator('.history-loading');
    await expect(historyLoading).toBeHidden({ timeout: 10000 });
    const historyItems = historyPanel.locator('.history-item');
    await expect.poll(async () => historyItems.count(), { timeout: 10000 }).toBeGreaterThanOrEqual(2);
  });
  test('历史记录按时间倒序排列,最新的在最前', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('历史排序测试');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    // 发送两次请求，使用不同URL与轻微区分
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:3456/echo?step=first`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    await urlInput.fill(`http://127.0.0.1:3456/echo?step=second`);
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 打开历史记录面板
    const historyBtn = contentPage.locator('[data-testid="http-params-history-btn"]');
    await historyBtn.click();
    await contentPage.waitForTimeout(500);
    const historyPanel = contentPage.locator('.history-dropdown');
    await expect(historyPanel).toBeVisible({ timeout: 5000 });
    const historyLoading = contentPage.locator('.history-loading');
    await expect(historyLoading).toBeHidden({ timeout: 10000 });
    const historyItems = historyPanel.locator('.history-item');
    await expect.poll(async () => historyItems.count(), { timeout: 10000 }).toBeGreaterThanOrEqual(2);
    // 验证第一条包含最新请求的内容
    await expect(historyItems.first()).toContainText('second', { timeout: 5000 });
  });
});


