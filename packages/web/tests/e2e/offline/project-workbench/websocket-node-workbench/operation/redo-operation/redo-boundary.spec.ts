import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('WebSocketRedoBoundary', () => {
  // 没有可重做的操作时重做按钮禁用
  test('没有可重做的操作时重做按钮禁用', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '重做边界测试' });
    // 新创建的节点没有操作历史,重做按钮应该禁用
    const redoBtn = contentPage.locator('[data-testid="ws-params-redo-btn"]');
    await expect(redoBtn).toHaveClass(/disabled/, { timeout: 5000 });
    // 记录当前URL值
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    const originalUrl = (await urlEditor.innerText()).trim();
    // 尝试按Ctrl+Shift+Z快捷键
    await contentPage.keyboard.press('Control+Shift+z');
    await contentPage.waitForTimeout(300);
    // 验证快捷键无响应,URL值不变
    await expect(urlEditor).toHaveText(originalUrl === '' ? /^\s*$/ : originalUrl, { timeout: 5000 });
  });
  // 撤销后进行新操作,重做历史被清空,重做按钮禁用
  test('撤销后进行新操作,重做历史被清空,重做按钮禁用', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '重做历史清空测试' });
    const protocolSelect = contentPage.locator('.ws-operation .protocol-select .el-select');
    // 切换为WSS
    await protocolSelect.click();
    const wssOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'WSS' });
    await wssOption.click();
    await contentPage.waitForTimeout(300);
    // 验证协议为WSS
    await expect(protocolSelect).toContainText('WSS');
    // 撤销
    const undoBtn = contentPage.locator('[data-testid="ws-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证协议恢复为WS
    await expect(protocolSelect).not.toContainText('WSS');
    // 此时重做按钮应该可用
    const redoBtn = contentPage.locator('[data-testid="ws-params-redo-btn"]');
    await expect(redoBtn).not.toHaveClass(/disabled/, { timeout: 5000 });
    // 输入新URL(进行新操作)
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await urlEditor.fill('new-operation:8080');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 验证重做按钮被禁用(重做历史被清空)
    await expect(redoBtn).toHaveClass(/disabled/, { timeout: 5000 });
  });
  // 连续重做到尽头后重做按钮禁用
  test('连续重做到尽头后重做按钮禁用', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '重做到尽头测试' });
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    // 输入URL
    await urlEditor.fill('test:8080/path');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 撤销
    const undoBtn = contentPage.locator('[data-testid="ws-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    // 重做
    const redoBtn = contentPage.locator('[data-testid="ws-params-redo-btn"]');
    await redoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证URL恢复
    await expect(urlEditor).toHaveText(/test:8080\/path/);
    // 验证重做按钮被禁用(已经重做到最新状态)
    await expect(redoBtn).toHaveClass(/disabled/, { timeout: 5000 });
  });
});
