import { test, expect } from '../../../../../fixtures/electron.fixture';

test.describe('WebSocketNodeHistory', () => {
  // 点击历史记录按钮打开历史下拉框
  test('点击历史记录按钮打开历史下拉框', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '历史记录测试' });
    // 点击历史记录按钮
    const historyBtn = contentPage.locator('[data-testid="ws-params-history-btn"]');
    await historyBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证历史记录下拉框显示
    const historyDropdown = contentPage.locator('.ws-params .history-dropdown');
    await expect(historyDropdown).toBeVisible({ timeout: 5000 });
    // 新创建的节点应该显示"暂无历史记录"
    const emptyText = historyDropdown.locator('.history-empty');
    await expect(emptyText).toBeVisible({ timeout: 5000 });
  });
  // 保存后历史记录列表显示保存记录
  test('保存后历史记录列表显示保存记录', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '历史记录保存测试' });
    // 输入URL
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await urlEditor.fill('127.0.0.1:8080/history-test');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 保存接口
    const saveBtn = contentPage.locator('[data-testid="websocket-operation-save-btn"]');
    await saveBtn.click();
    await contentPage.waitForTimeout(1000);
    // 点击历史记录按钮
    const historyBtn = contentPage.locator('[data-testid="ws-params-history-btn"]');
    await historyBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证历史记录下拉框显示
    const historyDropdown = contentPage.locator('.ws-params .history-dropdown');
    await expect(historyDropdown).toBeVisible({ timeout: 5000 });
    // 验证有历史记录项
    const historyItems = historyDropdown.locator('.history-item');
    const itemCount = await historyItems.count();
    expect(itemCount).toBeGreaterThanOrEqual(1);
  });
  // 多次保存后历史记录列表显示多条记录
  test('多次保存后历史记录列表显示多条记录', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '多次保存历史测试' });
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    const saveBtn = contentPage.locator('[data-testid="websocket-operation-save-btn"]');
    // 第一次保存
    await urlEditor.fill('127.0.0.1:8080/first');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    await saveBtn.click();
    await contentPage.waitForTimeout(1000);
    // 第二次保存
    await urlEditor.fill('127.0.0.1:8080/second');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    await saveBtn.click();
    await contentPage.waitForTimeout(1000);
    // 点击历史记录按钮
    const historyBtn = contentPage.locator('[data-testid="ws-params-history-btn"]');
    await historyBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证历史记录有多条
    const historyDropdown = contentPage.locator('.ws-params .history-dropdown');
    const historyItems = historyDropdown.locator('.history-item');
    const itemCount = await historyItems.count();
    expect(itemCount).toBeGreaterThanOrEqual(2);
  });
  // 选择历史记录后恢复到该状态
  test('选择历史记录后恢复到该状态', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '历史记录恢复测试' });
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    const saveBtn = contentPage.locator('[data-testid="websocket-operation-save-btn"]');
    const firstUrl = '127.0.0.1:8080/first-state';
    // 第一次保存
    await urlEditor.fill(firstUrl);
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    await saveBtn.click();
    await contentPage.waitForTimeout(1000);
    // 修改URL后第二次保存
    await urlEditor.fill('127.0.0.1:8080/second-state');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    await saveBtn.click();
    await contentPage.waitForTimeout(1000);
    // 点击历史记录按钮
    const historyBtn = contentPage.locator('[data-testid="ws-params-history-btn"]');
    await historyBtn.click();
    await contentPage.waitForTimeout(500);
    // 选择第一条历史记录(通常是最新的,所以要选择第二条来恢复到第一次保存的状态)
    const historyDropdown = contentPage.locator('.ws-params .history-dropdown');
    const historyItems = historyDropdown.locator('.history-item');
    // 点击历史记录项
    await historyItems.last().click();
    await contentPage.waitForTimeout(300);
    // 确认覆盖对话框
    const confirmDialog = contentPage.locator('.el-message-box, .cl-confirm-dialog');
    if (await confirmDialog.isVisible()) {
      const confirmBtn = confirmDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
    }
    // 验证URL恢复到第一次保存的状态
    const statusUrl = contentPage.locator('.ws-operation .status-wrap .url');
    await expect(statusUrl).toContainText(firstUrl, { timeout: 5000 });
  });
  // 删除历史记录后列表更新
  test('删除历史记录后列表更新', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '历史记录删除测试' });
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    const saveBtn = contentPage.locator('[data-testid="websocket-operation-save-btn"]');
    // 保存一条记录
    await urlEditor.fill('127.0.0.1:8080/delete-test');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    await saveBtn.click();
    await contentPage.waitForTimeout(1000);
    // 打开历史记录
    const historyBtn = contentPage.locator('[data-testid="ws-params-history-btn"]');
    await historyBtn.click();
    await contentPage.waitForTimeout(500);
    const historyDropdown = contentPage.locator('.ws-params .history-dropdown');
    const historyItems = historyDropdown.locator('.history-item');
    // 记录当前历史记录数量
    const initialCount = await historyItems.count();
    expect(initialCount).toBeGreaterThanOrEqual(1);
    // 点击删除按钮
    const deleteIcon = historyItems.first().locator('.delete-icon');
    await deleteIcon.click();
    await contentPage.waitForTimeout(300);
    // 确认删除对话框
    const confirmDialog = contentPage.locator('.el-message-box, .cl-confirm-dialog');
    if (await confirmDialog.isVisible()) {
      const confirmBtn = confirmDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
    }
    // 验证历史记录数量减少
    const afterDeleteCount = await historyItems.count();
    expect(afterDeleteCount).toBeLessThan(initialCount);
  });
  // 再次点击历史记录按钮关闭下拉框
  test('再次点击历史记录按钮关闭下拉框', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '历史记录关闭测试' });
    // 点击历史记录按钮打开
    const historyBtn = contentPage.locator('[data-testid="ws-params-history-btn"]');
    await historyBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证下拉框显示
    const historyDropdown = contentPage.locator('.ws-params .history-dropdown');
    await expect(historyDropdown).toBeVisible({ timeout: 5000 });
    // 再次点击关闭
    await historyBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证下拉框隐藏
    await expect(historyDropdown).not.toBeVisible({ timeout: 5000 });
  });
});
