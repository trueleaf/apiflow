import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('WebSocketNodeHistory', () => {
  // 新建节点首次打开历史下拉时应显示空态
  test('点击历史记录按钮打开历史下拉框', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: '历史记录测试' });
    const historyBtn = contentPage.locator('[data-testid="ws-params-history-btn"]');
    await historyBtn.click();
    const historyDropdown = contentPage.locator('.ws-params .history-dropdown');
    await expect(historyDropdown).toBeVisible({ timeout: 5000 });
    await expect(historyDropdown.locator('.history-empty')).toBeVisible({ timeout: 5000 });
  });
  // 保存一次后历史下拉中应至少出现一条记录
  test('保存后历史记录列表显示保存记录', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: '历史记录保存测试' });
    // 输入地址并保存，触发历史入库
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await urlEditor.fill('ws://127.0.0.1:8080/history-test');
    await contentPage.keyboard.press('Enter');
    const statusUrl = contentPage.locator('.ws-operation .status-wrap .url');
    await expect(statusUrl).toContainText('history-test', { timeout: 5000 });
    await contentPage.locator('[data-testid="websocket-operation-save-btn"]').click();
    // 打开历史并等待记录出现
    const historyBtn = contentPage.locator('[data-testid="ws-params-history-btn"]');
    await historyBtn.click();
    const historyDropdown = contentPage.locator('.ws-params .history-dropdown');
    await expect(historyDropdown).toBeVisible({ timeout: 5000 });
    await expect.poll(async () => {
      return await historyDropdown.locator('.history-item').count();
    }, { timeout: 10000 }).toBeGreaterThanOrEqual(1);
  });
  // 多次保存后历史下拉中应累积多条记录
  test('多次保存后历史记录列表显示多条记录', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: '多次保存历史测试' });
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    const statusUrl = contentPage.locator('.ws-operation .status-wrap .url');
    const saveBtn = contentPage.locator('[data-testid="websocket-operation-save-btn"]');
    // 连续保存两次不同 URL
    await urlEditor.fill('ws://127.0.0.1:8080/first');
    await contentPage.keyboard.press('Enter');
    await expect(statusUrl).toContainText('/first', { timeout: 5000 });
    await saveBtn.click();
    await urlEditor.fill('ws://127.0.0.1:8080/second');
    await contentPage.keyboard.press('Enter');
    await expect(statusUrl).toContainText('/second', { timeout: 5000 });
    await saveBtn.click();
    // 打开历史并校验至少两条
    const historyBtn = contentPage.locator('[data-testid="ws-params-history-btn"]');
    await historyBtn.click();
    const historyDropdown = contentPage.locator('.ws-params .history-dropdown');
    await expect(historyDropdown).toBeVisible({ timeout: 5000 });
    await expect.poll(async () => {
      return await historyDropdown.locator('.history-item').count();
    }, { timeout: 10000 }).toBeGreaterThanOrEqual(2);
  });
  // 选择历史记录并确认覆盖后应恢复到对应 URL
  test('选择历史记录后恢复到该状态', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: '历史记录恢复测试' });
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    const statusUrl = contentPage.locator('.ws-operation .status-wrap .url');
    const saveBtn = contentPage.locator('[data-testid="websocket-operation-save-btn"]');
    const firstUrl = 'ws://127.0.0.1:8080/first-state';
    // 依次保存两条不同状态
    await urlEditor.fill(firstUrl);
    await contentPage.keyboard.press('Enter');
    await expect(statusUrl).toContainText('first-state', { timeout: 5000 });
    await saveBtn.click();
    await urlEditor.fill('ws://127.0.0.1:8080/second-state');
    await contentPage.keyboard.press('Enter');
    await expect(statusUrl).toContainText('second-state', { timeout: 5000 });
    await saveBtn.click();
    // 选择较早一条历史，确认覆盖并验证 URL 已恢复
    const historyBtn = contentPage.locator('[data-testid="ws-params-history-btn"]');
    await historyBtn.click();
    const historyDropdown = contentPage.locator('.ws-params .history-dropdown');
    await expect(historyDropdown).toBeVisible({ timeout: 5000 });
    await expect.poll(async () => {
      return await historyDropdown.locator('.history-item').count();
    }, { timeout: 10000 }).toBeGreaterThanOrEqual(2);
    await historyDropdown.locator('.history-item').last().click();
    const confirmDialog = contentPage.locator('.cl-confirm-container').first();
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    await confirmDialog.locator('.el-button--primary').first().click();
    await expect(confirmDialog).toBeHidden({ timeout: 5000 });
    await expect(statusUrl).toContainText('first-state', { timeout: 10000 });
  });
  // 删除历史项确认后，列表数量应减少
  test('删除历史记录后列表更新', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: '历史记录删除测试' });
    // 先生成一条历史记录
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await urlEditor.fill('ws://127.0.0.1:8080/delete-test');
    await contentPage.keyboard.press('Enter');
    await contentPage.locator('[data-testid="websocket-operation-save-btn"]').click();
    // 打开历史并删除首条记录
    const historyBtn = contentPage.locator('[data-testid="ws-params-history-btn"]');
    await historyBtn.click();
    const historyDropdown = contentPage.locator('.ws-params .history-dropdown');
    await expect(historyDropdown).toBeVisible({ timeout: 5000 });
    const historyItems = historyDropdown.locator('.history-item');
    const initialCount = await historyItems.count();
    expect(initialCount).toBeGreaterThanOrEqual(1);
    await historyItems.first().locator('.delete-icon').click();
    const confirmDialog = contentPage.locator('.cl-confirm-container').first();
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    await confirmDialog.locator('.el-button--primary').first().click();
    await expect.poll(async () => {
      return await historyDropdown.locator('.history-item').count();
    }, { timeout: 10000 }).toBeLessThan(initialCount);
  });
  // 历史按钮二次点击应关闭下拉
  test('再次点击历史记录按钮关闭下拉框', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: '历史记录关闭测试' });
    const historyBtn = contentPage.locator('[data-testid="ws-params-history-btn"]');
    const historyDropdown = contentPage.locator('.ws-params .history-dropdown');
    await historyBtn.click();
    await expect(historyDropdown).toBeVisible({ timeout: 5000 });
    await historyBtn.click();
    await expect(historyDropdown).not.toBeVisible({ timeout: 5000 });
  });
  // 保存后的历史项应展示时间信息
  test('保存后历史记录项中包含时间信息', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: '历史记录时间测试' });
    // 保存一条记录后校验历史项时间文案
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await urlEditor.fill('ws://127.0.0.1:8080/time-test');
    await contentPage.keyboard.press('Enter');
    await contentPage.locator('[data-testid="websocket-operation-save-btn"]').click();
    const historyBtn = contentPage.locator('[data-testid="ws-params-history-btn"]');
    await historyBtn.click();
    const historyDropdown = contentPage.locator('.ws-params .history-dropdown');
    await expect(historyDropdown).toBeVisible({ timeout: 5000 });
    const historyItem = historyDropdown.locator('.history-item').first();
    await expect(historyItem).toContainText(/\d{2}:\d{2}|\d{4}|刚刚/, { timeout: 5000 });
  });
});

