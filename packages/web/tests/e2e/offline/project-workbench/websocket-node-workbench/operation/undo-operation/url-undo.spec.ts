import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('WebSocketUrlUndo', () => {
  // 输入URL后点击撤销按钮恢复原值
  test('输入URL后点击撤销按钮恢复原值', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const nodeId = await createNode(contentPage, { nodeType: 'websocket', name: 'URL撤销按钮测试' });
    const createdNode = contentPage.locator(`[data-test-node-id="${nodeId}"]`).first();
    await expect(createdNode).toBeVisible({ timeout: 5000 });
    await createdNode.click();
    await expect(contentPage.locator('.ws-operation')).toBeVisible({ timeout: 5000 });
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    // 记录初始值
    const initialValue = (await urlEditor.innerText()).trim();
    // 输入新URL
    await urlEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('ws://127.0.0.1:8080/test');
    await contentPage.keyboard.press('Enter');
    await contentPage.locator('.ws-operation').click();
    await contentPage.waitForTimeout(300);
    // 验证URL已变更
    await expect(urlEditor).toHaveText(/127\.0\.0\.1:8080\/test/);
    // 点击撤销按钮
    const undoBtn = contentPage.locator('[data-testid="ws-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证URL恢复为初始值
    await expect(urlEditor).toHaveText(initialValue === '' ? /^\s*$/ : initialValue, { timeout: 5000 });
  });
  // 使用Ctrl+Z快捷键撤销URL变更
  test('使用Ctrl+Z快捷键撤销URL变更', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const nodeId = await createNode(contentPage, { nodeType: 'websocket', name: 'URL快捷键撤销测试' });
    const createdNode = contentPage.locator(`[data-test-node-id="${nodeId}"]`).first();
    await expect(createdNode).toBeVisible({ timeout: 5000 });
    await createdNode.click();
    await expect(contentPage.locator('.ws-operation')).toBeVisible({ timeout: 5000 });
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    // 记录初始值
    const initialValue = (await urlEditor.innerText()).trim();
    // 输入新URL
    await urlEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('ws://192.168.1.1:9000/ws');
    await contentPage.keyboard.press('Enter');
    await contentPage.locator('.ws-operation').click();
    await contentPage.waitForTimeout(300);
    // 验证URL已变更
    await expect(urlEditor).toHaveText(/192\.168\.1\.1:9000\/ws/);
    // 使用快捷键撤销
    await contentPage.keyboard.press('Control+z');
    await contentPage.waitForTimeout(300);
    // 验证URL恢复为初始值
    await expect(urlEditor).toHaveText(initialValue === '' ? /^\s*$/ : initialValue, { timeout: 5000 });
  });
  // 连续输入多次后可以逐步撤销
  test('连续输入多次后可以逐步撤销', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const nodeId = await createNode(contentPage, { nodeType: 'websocket', name: 'URL多次撤销测试' });
    const createdNode = contentPage.locator(`[data-test-node-id="${nodeId}"]`).first();
    await expect(createdNode).toBeVisible({ timeout: 5000 });
    await createdNode.click();
    await expect(contentPage.locator('.ws-operation')).toBeVisible({ timeout: 5000 });
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
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
    // 验证当前为第二次输入的值
    await expect(urlEditor).toHaveText(/host2:8080\/path2/);
    // 第一次撤销,恢复到第一次输入的值
    const undoBtn = contentPage.locator('[data-testid="ws-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(urlEditor).toHaveText(/host1:8080\/path1/);
    // 第二次撤销,恢复到初始空值
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(urlEditor).toHaveText(/^\s*$/, { timeout: 5000 });
  });
  // 没有可撤销操作时撤销按钮禁用
  test('没有可撤销操作时撤销按钮禁用', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const nodeId = await createNode(contentPage, { nodeType: 'websocket', name: 'URL撤销按钮禁用测试' });
    const createdNode = contentPage.locator(`[data-test-node-id="${nodeId}"]`).first();
    await expect(createdNode).toBeVisible({ timeout: 5000 });
    await createdNode.click();
    await expect(contentPage.locator('.ws-operation')).toBeVisible({ timeout: 5000 });
    // 新创建的节点没有操作历史,撤销按钮应该禁用
    const undoBtn = contentPage.locator('[data-testid="ws-params-undo-btn"]');
    await expect(undoBtn).toHaveClass(/disabled/, { timeout: 5000 });
    // 输入URL后撤销按钮应该可用
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await urlEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('ws://test:8080/path');
    await contentPage.keyboard.press('Enter');
    await contentPage.locator('.ws-operation').click();
    await contentPage.waitForTimeout(300);
    await expect(undoBtn).not.toHaveClass(/disabled/, { timeout: 5000 });
    // 撤销后按钮应该再次禁用
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(undoBtn).toHaveClass(/disabled/, { timeout: 5000 });
  });
});
