import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('WebSocketUrlRedo', () => {
  // 逐字符输入后撤销再点击重做按钮恢复
  test('逐字符输入后撤销再点击重做按钮恢复', async ({ contentPage, clearCache, createProject, createNode }) => {
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
    // 逐字符输入URL
    await urlEditor.click();
    await urlEditor.pressSequentially('a', { delay: 100 });
    await contentPage.waitForTimeout(200);
    await urlEditor.pressSequentially('b', { delay: 100 });
    await contentPage.waitForTimeout(200);
    await expect(urlEditor).toHaveText('ab', { timeout: 5000 });
    // 撤销到a
    const undoBtn = contentPage.locator('[data-testid="ws-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(urlEditor).toHaveText('a', { timeout: 5000 });
    // 点击重做按钮恢复到ab
    const redoBtn = contentPage.locator('[data-testid="ws-params-redo-btn"]');
    await redoBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(urlEditor).toHaveText('ab', { timeout: 5000 });
  });
  // 逐字符输入后撤销再使用Ctrl+Y重做
  test('逐字符输入后撤销再使用Ctrl+Y重做', async ({ contentPage, clearCache, createProject, createNode }) => {
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
    // 逐字符输入
    await urlEditor.click();
    await urlEditor.pressSequentially('a', { delay: 100 });
    await contentPage.waitForTimeout(200);
    await urlEditor.pressSequentially('b', { delay: 100 });
    await contentPage.waitForTimeout(200);
    await expect(urlEditor).toHaveText('ab', { timeout: 5000 });
    // 使用Ctrl+Z撤销到a
    await contentPage.keyboard.press('Control+z');
    await contentPage.waitForTimeout(300);
    await expect(urlEditor).toHaveText('a', { timeout: 5000 });
    // 使用Ctrl+Y重做恢复到ab
    await contentPage.keyboard.press('Control+y');
    await contentPage.waitForTimeout(300);
    await expect(urlEditor).toHaveText('ab', { timeout: 5000 });
  });
  // 逐字符输入多个字符后多次撤销再逐步重做
  test('逐字符输入多个字符后多次撤销再逐步重做', async ({ contentPage, clearCache, createProject, createNode }) => {
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
    // 逐字符输入abc
    await urlEditor.click();
    await urlEditor.pressSequentially('a', { delay: 100 });
    await contentPage.waitForTimeout(200);
    await urlEditor.pressSequentially('b', { delay: 100 });
    await contentPage.waitForTimeout(200);
    await urlEditor.pressSequentially('c', { delay: 100 });
    await contentPage.waitForTimeout(200);
    await expect(urlEditor).toHaveText('abc', { timeout: 5000 });
    // 连续撤销三次到空
    const undoBtn = contentPage.locator('[data-testid="ws-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(urlEditor).toHaveText('ab', { timeout: 5000 });
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(urlEditor).toHaveText('a', { timeout: 5000 });
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(urlEditor).toHaveText(/^\s*$/, { timeout: 5000 });
    // 逐步重做恢复
    const redoBtn = contentPage.locator('[data-testid="ws-params-redo-btn"]');
    await redoBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(urlEditor).toHaveText('a', { timeout: 5000 });
    await redoBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(urlEditor).toHaveText('ab', { timeout: 5000 });
    await redoBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(urlEditor).toHaveText('abc', { timeout: 5000 });
  });
});
