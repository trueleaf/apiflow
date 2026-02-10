import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('WebSocketUrlInput', () => {
  // URL输入框支持输入WebSocket地址
  test('URL输入框支持输入WebSocket地址', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: 'URL输入测试' });
    // 在URL输入框中输入地址
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill('127.0.0.1:8080/websocket');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 验证地址显示在状态栏
    const statusUrl = contentPage.locator('.ws-operation .status-wrap .url');
    await expect(statusUrl).toContainText('127.0.0.1:8080/websocket');
  });
  // URL输入后刷新页面,地址保持不变
  test('URL输入后刷新页面地址保持不变', async ({ contentPage, clearCache, createProject, createNode, reload }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: 'URL持久化测试' });
    const testUrl = '127.0.0.1:9999/persistent-test';
    // 在URL输入框中输入地址
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill(testUrl);
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 点击保存按钮
    const saveBtn = contentPage.locator('[data-testid="websocket-operation-save-btn"]');
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    // 刷新页面
    await reload();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 15000 });
    await contentPage.waitForTimeout(1500);
    // 验证地址保持不变
    const statusUrl = contentPage.locator('.ws-operation .status-wrap .url');
    await expect(statusUrl).toContainText(testUrl);
  });
  // URL输入框支持变量替换
  test('URL输入框支持变量替换', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: 'URL变量替换测试' });
    // 打开变量维护页面添加变量
    const variableBtn = contentPage.locator('.ws-params .action-item').filter({ hasText: /变量/ });
    await variableBtn.click();
    await contentPage.waitForTimeout(500);
    const variableTab = contentPage.locator('[data-testid="project-nav-tab-variable"]');
    await expect(variableTab).toHaveClass(/active/, { timeout: 5000 });
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    // 在变量维护页面添加变量 WS_HOST = 127.0.0.1:8080
    const addPanel = variablePage.locator('.left');
    const nameFormItem = addPanel.locator('.el-form-item').filter({ hasText: /变量名称|Variable Name|Name/ });
    await nameFormItem.locator('input').first().fill('WS_HOST');
    const valueFormItem = addPanel.locator('.el-form-item').filter({ hasText: /变量值|Value/ });
    await valueFormItem.locator('textarea').first().fill('127.0.0.1:8080');
    const confirmAddBtn = addPanel.locator('.el-button--primary').filter({ hasText: /确认添加|Add|Confirm/ }).first();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    await expect(variablePage.locator('.right')).toContainText('WS_HOST', { timeout: 5000 });
    // 关闭变量页签返回WebSocket页面
    const closeBtn = variableTab.locator('[data-testid="project-nav-tab-close-btn"]').first();
    await closeBtn.click();
    await contentPage.waitForTimeout(300);
    // 在URL输入框中使用变量
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill('{{WS_HOST}}/ws');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 验证地址显示变量被替换后的值
    const statusUrl = contentPage.locator('.ws-operation .status-wrap .url');
    await expect(statusUrl).toContainText('127.0.0.1:8080/ws');
  });
  // URL输入框清空后,状态栏显示空地址
  test('URL输入框清空后状态栏显示空地址', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: 'URL清空测试' });
    // 输入地址
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill('127.0.0.1:8080/ws');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 使用全选+删除模拟用户清空操作，确保 contenteditable 触发正确的输入事件
    await urlEditor.click();
    await contentPage.keyboard.press('Control+A');
    await contentPage.keyboard.press('Backspace');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(800);
    // 验证状态栏不再包含之前地址（fullUrl 有 500ms 防抖）
    const statusUrl = contentPage.locator('.ws-operation .status-wrap .url');
    await expect(statusUrl).toContainText('ws://', { timeout: 10000 });
    await expect(statusUrl).not.toContainText('127.0.0.1:8080/ws', { timeout: 10000 });
  });
  // URL输入框输入地址后状态栏同步更新
  test('URL输入框输入地址后状态栏同步更新', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: 'URL状态栏同步测试' });
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    // 输入地址并触发格式化
    await urlEditor.fill('example.com:8080/ws-path');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(500);
    // 验证状态栏显示完整URL（包含自动添加的ws://前缀）
    const statusUrl = contentPage.locator('.ws-operation .status-wrap .url');
    await expect(statusUrl).toContainText('ws://example.com:8080/ws-path', { timeout: 5000 });
  });
});
