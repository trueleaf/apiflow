import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('WebSocketProtocolUndo', () => {
  // 切换协议后点击撤销按钮恢复原协议
  test('切换协议后点击撤销按钮恢复原协议', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '协议撤销按钮测试' });
    // 默认协议为WS
    const protocolSelect = contentPage.locator('.ws-operation .protocol-select .el-select');
    await expect(protocolSelect).toContainText('WS', { timeout: 5000 });
    // 切换为WSS
    await protocolSelect.click();
    const wssOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'WSS' });
    await wssOption.click();
    await contentPage.waitForTimeout(300);
    // 验证协议已变更为WSS
    await expect(protocolSelect).toContainText('WSS');
    // 点击撤销按钮
    const undoBtn = contentPage.locator('[data-testid="ws-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证协议恢复为WS
    await expect(protocolSelect).toContainText('WS');
    await expect(protocolSelect).not.toContainText('WSS');
  });
  // 使用Ctrl+Z快捷键撤销协议变更
  test('使用Ctrl+Z快捷键撤销协议变更', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '协议快捷键撤销测试' });
    // 默认协议为WS,切换为WSS
    const protocolSelect = contentPage.locator('.ws-operation .protocol-select .el-select');
    await protocolSelect.click();
    const wssOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'WSS' });
    await wssOption.click();
    await contentPage.waitForTimeout(300);
    // 验证协议为WSS
    await expect(protocolSelect).toContainText('WSS');
    // 使用快捷键撤销
    await contentPage.keyboard.press('Control+z');
    await contentPage.waitForTimeout(300);
    // 验证协议恢复为WS
    await expect(protocolSelect).toContainText('WS');
    await expect(protocolSelect).not.toContainText('WSS');
  });
  // 多次切换协议后逐步撤销
  test('多次切换协议后逐步撤销', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '协议多次撤销测试' });
    const protocolSelect = contentPage.locator('.ws-operation .protocol-select .el-select');
    // 初始为WS,切换为WSS
    await protocolSelect.click();
    const wssOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'WSS' });
    await wssOption.click();
    await contentPage.waitForTimeout(300);
    // 再切换回WS
    await protocolSelect.click();
    const wsOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^WS$/ }).first();
    await wsOption.click();
    await contentPage.waitForTimeout(300);
    // 验证当前为WS
    await expect(protocolSelect).not.toContainText('WSS');
    // 第一次撤销,恢复到WSS
    const undoBtn = contentPage.locator('[data-testid="ws-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(protocolSelect).toContainText('WSS');
    // 第二次撤销,恢复到初始WS
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(protocolSelect).toContainText('WS');
    await expect(protocolSelect).not.toContainText('WSS');
  });
  // 撤销协议变更后URL前缀同步恢复
  test('撤销协议变更后URL前缀同步恢复', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '协议撤销URL前缀测试' });
    // 填写URL地址
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await urlEditor.fill('127.0.0.1:8080/prefix-test');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 切换为WSS协议
    const protocolSelect = contentPage.locator('.ws-operation .protocol-select .el-select');
    await protocolSelect.click();
    const wssOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'WSS' });
    await wssOption.click();
    await contentPage.waitForTimeout(300);
    await expect(protocolSelect).toContainText('WSS', { timeout: 5000 });
    // 撤销协议变更
    const undoBtn = contentPage.locator('[data-testid="ws-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证协议恢复为WS（URL已填写场景下撤销协议仍能正确恢复）
    await expect(protocolSelect).not.toContainText('WSS', { timeout: 5000 });
  });
});
