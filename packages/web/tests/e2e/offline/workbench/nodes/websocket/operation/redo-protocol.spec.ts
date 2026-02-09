import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('WebSocketProtocolRedo', () => {
  // 撤销协议变更后点击重做按钮恢复
  test('撤销协议变更后点击重做按钮恢复', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '协议重做按钮测试' });
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
    // 点击重做按钮
    const redoBtn = contentPage.locator('[data-testid="ws-params-redo-btn"]');
    await redoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证协议恢复为WSS
    await expect(protocolSelect).toContainText('WSS');
  });
  // 使用快捷键重做协议变更
  test('使用快捷键重做协议变更', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '协议快捷键重做测试' });
    const protocolSelect = contentPage.locator('.ws-operation .protocol-select .el-select');
    // 切换为WSS
    await protocolSelect.click();
    const wssOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'WSS' });
    await wssOption.click();
    await contentPage.waitForTimeout(300);
    // 撤销
    await contentPage.keyboard.press('Control+z');
    await contentPage.waitForTimeout(300);
    // 验证协议恢复为WS
    await expect(protocolSelect).not.toContainText('WSS');
    // 使用Ctrl+Y重做
    await contentPage.keyboard.press('Control+y');
    await contentPage.waitForTimeout(300);
    // 验证协议恢复为WSS
    await expect(protocolSelect).toContainText('WSS');
  });
  // 连续切换协议后多步撤销再逐步重做恢复到每个中间状态
  test('连续切换协议后多步撤销再逐步重做恢复', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '多步协议撤销重做测试' });
    const protocolSelect = contentPage.locator('.ws-operation .protocol-select .el-select');
    // 初始状态应为WS
    await expect(protocolSelect).not.toContainText('WSS');
    // 第一次切换：WS → WSS
    await protocolSelect.click();
    const wssOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'WSS' });
    await wssOption.click();
    await contentPage.waitForTimeout(300);
    await expect(protocolSelect).toContainText('WSS');
    // 第二次切换：WSS → WS
    await protocolSelect.click();
    const wsOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^WS$/ });
    await wsOption.click();
    await contentPage.waitForTimeout(300);
    await expect(protocolSelect).not.toContainText('WSS');
    // 撤销第二次切换，恢复到WSS
    const undoBtn = contentPage.locator('[data-testid="ws-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(protocolSelect).toContainText('WSS');
    // 撤销第一次切换，恢复到初始WS
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(protocolSelect).not.toContainText('WSS');
    // 重做第一次切换，恢复到WSS
    const redoBtn = contentPage.locator('[data-testid="ws-params-redo-btn"]');
    await redoBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(protocolSelect).toContainText('WSS');
    // 重做第二次切换，恢复到WS
    await redoBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(protocolSelect).not.toContainText('WSS');
  });
});
