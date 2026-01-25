import { test, expect } from '../../../../../fixtures/electron.fixture';

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
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(1000);
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
    // 打开变量面板添加变量
    const variableBtn = contentPage.locator('.ws-params .action-item').filter({ hasText: /变量/ });
    await variableBtn.click();
    await contentPage.waitForTimeout(500);
    // 在变量面板添加变量 WS_HOST = 127.0.0.1:8080
    const variablePanel = contentPage.locator('.variable-dialog, .variable-panel, [data-testid="variable-dialog"]');
    await expect(variablePanel).toBeVisible({ timeout: 5000 });
    const keyInput = variablePanel.locator('input[placeholder*="键"], input[placeholder*="key"], [data-testid="variable-key-input"]').first();
    const valueInput = variablePanel.locator('[contenteditable="true"], input[placeholder*="值"], input[placeholder*="value"], [data-testid="variable-value-input"]').first();
    if (await keyInput.isVisible()) {
      await keyInput.fill('WS_HOST');
      await valueInput.click();
      await contentPage.keyboard.type('127.0.0.1:8080');
    }
    // 关闭变量面板
    await contentPage.keyboard.press('Escape');
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
    // 清空地址
    await urlEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.press('Backspace');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 验证状态栏只显示协议
    const statusUrl = contentPage.locator('.ws-operation .status-wrap .url');
    const urlText = await statusUrl.textContent();
    expect(urlText?.trim()).toMatch(/^wss?:\/\/$/);
  });
});
