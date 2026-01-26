import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('WebSocketUrlRedo', () => {
  // 撤销URL变更后点击重做按钮恢复
  test('撤销URL变更后点击重做按钮恢复', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const nodeId = await createNode(contentPage, { nodeType: 'websocket', name: 'URL重做按钮测试' });
    const createdNode = contentPage.locator(`[data-test-node-id="${nodeId}"]`).first();
    await expect(createdNode).toBeVisible({ timeout: 5000 });
    await createdNode.click();
    await expect(contentPage.locator('.ws-operation')).toBeVisible({ timeout: 5000 });
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    // 输入URL
    const testUrl = 'ws://127.0.0.1:8080/redo-test';
    await urlEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type(testUrl);
    await contentPage.keyboard.press('Enter');
    await contentPage.locator('.ws-operation').click();
    await contentPage.waitForTimeout(300);
    // 验证URL已输入
    await expect(urlEditor).toHaveText(new RegExp(testUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    // 撤销
    const undoBtn = contentPage.locator('[data-testid="ws-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证URL已撤销
    await expect(urlEditor).toHaveText(/^\s*$/, { timeout: 5000 });
    // 点击重做按钮
    const redoBtn = contentPage.locator('[data-testid="ws-params-redo-btn"]');
    await redoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证URL恢复
    await expect(urlEditor).toHaveText(new RegExp(testUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), { timeout: 5000 });
  });
  // 使用Ctrl+Y快捷键重做URL变更
  test('使用Ctrl+Y快捷键重做URL变更', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const nodeId = await createNode(contentPage, { nodeType: 'websocket', name: 'URL快捷键重做测试' });
    const createdNode = contentPage.locator(`[data-test-node-id="${nodeId}"]`).first();
    await expect(createdNode).toBeVisible({ timeout: 5000 });
    await createdNode.click();
    await expect(contentPage.locator('.ws-operation')).toBeVisible({ timeout: 5000 });
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    // 输入URL
    await urlEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('ws://192.168.1.1:9000/ws');
    await contentPage.keyboard.press('Enter');
    await contentPage.locator('.ws-operation').click();
    await contentPage.waitForTimeout(300);
    // 撤销
    await contentPage.keyboard.press('Control+z');
    await contentPage.waitForTimeout(300);
    // 验证URL已撤销
    await expect(urlEditor).toHaveText(/^\s*$/, { timeout: 5000 });
    // 使用Ctrl+Y重做
    await contentPage.keyboard.press('Control+y');
    await contentPage.waitForTimeout(300);
    // 验证URL恢复
    await expect(urlEditor).toHaveText(/192\.168\.1\.1:9000\/ws/, { timeout: 5000 });
  });
  // 使用Ctrl+Shift+Z快捷键重做URL变更
  test('使用Ctrl+Shift+Z快捷键重做URL变更', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const nodeId = await createNode(contentPage, { nodeType: 'websocket', name: 'URL Ctrl+Shift+Z重做测试' });
    const createdNode = contentPage.locator(`[data-test-node-id="${nodeId}"]`).first();
    await expect(createdNode).toBeVisible({ timeout: 5000 });
    await createdNode.click();
    await expect(contentPage.locator('.ws-operation')).toBeVisible({ timeout: 5000 });
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    // 输入URL
    await urlEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('ws://localhost:3000/socket');
    await contentPage.keyboard.press('Enter');
    await contentPage.locator('.ws-operation').click();
    await contentPage.waitForTimeout(300);
    // 撤销
    await contentPage.keyboard.press('Control+z');
    await contentPage.waitForTimeout(300);
    // 使用Ctrl+Shift+Z重做
    await contentPage.keyboard.press('Control+Shift+z');
    await contentPage.waitForTimeout(300);
    // 验证URL恢复
    await expect(urlEditor).toHaveText(/localhost:3000\/socket/, { timeout: 5000 });
  });
  // 多次撤销后逐步重做
  test('多次撤销后逐步重做', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const nodeId = await createNode(contentPage, { nodeType: 'websocket', name: 'URL多次重做测试' });
    const createdNode = contentPage.locator(`[data-test-node-id="${nodeId}"]`).first();
    await expect(createdNode).toBeVisible({ timeout: 5000 });
    await createdNode.click();
    await expect(contentPage.locator('.ws-operation')).toBeVisible({ timeout: 5000 });
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    // 第一次输入
    await urlEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('ws://host1:8080/path1');
    await contentPage.keyboard.press('Enter');
    await contentPage.locator('.ws-operation').click();
    await contentPage.waitForTimeout(300);
    // 第二次输入
    await urlEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('ws://host2:8080/path2');
    await contentPage.keyboard.press('Enter');
    await contentPage.locator('.ws-operation').click();
    await contentPage.waitForTimeout(300);
    // 连续撤销两次
    const undoBtn = contentPage.locator('[data-testid="ws-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证恢复到初始空值
    await expect(urlEditor).toHaveText(/^\s*$/, { timeout: 5000 });
    // 第一次重做
    const redoBtn = contentPage.locator('[data-testid="ws-params-redo-btn"]');
    await redoBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(urlEditor).toHaveText(/host1:8080\/path1/);
    // 第二次重做
    await redoBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(urlEditor).toHaveText(/host2:8080\/path2/);
  });
});
