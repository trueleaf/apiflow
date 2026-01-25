import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('WebSocketMessageBlockUndo', () => {
  // 添加消息块后撤销删除
  test('添加消息块后撤销删除', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '消息块撤销测试' });
    // 默认显示消息内容标签页
    const messageTab = contentPage.locator('.ws-params .params-tabs .el-tabs__item').filter({ hasText: /消息内容/ });
    await messageTab.click();
    await contentPage.waitForTimeout(300);
    // 点击添加消息块按钮
    const addBlockBtn = contentPage.locator('.ws-params .message-content-wrap .add-block-btn, .ws-params .add-message-btn, .ws-params [class*="add"]').first();
    await expect(addBlockBtn).toBeVisible({ timeout: 5000 });
    await addBlockBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证消息块已添加
    const messageBlocks = contentPage.locator('.ws-params .message-block, .ws-params .message-item');
    const initialCount = await messageBlocks.count();
    expect(initialCount).toBeGreaterThanOrEqual(1);
    // 撤销添加操作
    const undoBtn = contentPage.locator('[data-testid="ws-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证消息块被移除
    const afterUndoCount = await messageBlocks.count();
    expect(afterUndoCount).toBeLessThan(initialCount);
  });
  // 修改消息内容后撤销恢复原值
  test('修改消息内容后撤销恢复原值', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '消息内容撤销测试' });
    // 切换到消息内容标签页
    const messageTab = contentPage.locator('.ws-params .params-tabs .el-tabs__item').filter({ hasText: /消息内容/ });
    await messageTab.click();
    await contentPage.waitForTimeout(300);
    // 点击添加消息块按钮
    const addBlockBtn = contentPage.locator('.ws-params .message-content-wrap .add-block-btn, .ws-params .add-message-btn, .ws-params [class*="add"]').first();
    await addBlockBtn.click();
    await contentPage.waitForTimeout(300);
    // 在消息编辑区输入内容
    const messageEditor = contentPage.locator('.ws-params .message-block .monaco-editor, .ws-params .message-editor, .ws-params [class*="message"] textarea').first();
    await expect(messageEditor).toBeVisible({ timeout: 5000 });
    await messageEditor.click();
    await contentPage.keyboard.type('{"action": "test"}');
    await contentPage.waitForTimeout(300);
    // 修改内容
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('{"action": "modified"}');
    await contentPage.waitForTimeout(300);
    // 撤销修改
    const undoBtn = contentPage.locator('[data-testid="ws-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证内容恢复为原始值
    const editorContent = await messageEditor.innerText();
    expect(editorContent).toContain('test');
  });
  // 删除消息块后撤销恢复
  test('删除消息块后撤销恢复', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '消息块删除撤销测试' });
    // 切换到消息内容标签页
    const messageTab = contentPage.locator('.ws-params .params-tabs .el-tabs__item').filter({ hasText: /消息内容/ });
    await messageTab.click();
    await contentPage.waitForTimeout(300);
    // 添加消息块
    const addBlockBtn = contentPage.locator('.ws-params .message-content-wrap .add-block-btn, .ws-params .add-message-btn, .ws-params [class*="add"]').first();
    await addBlockBtn.click();
    await contentPage.waitForTimeout(300);
    // 记录消息块数量
    const messageBlocks = contentPage.locator('.ws-params .message-block, .ws-params .message-item');
    const initialCount = await messageBlocks.count();
    // 删除消息块
    const deleteBtn = contentPage.locator('.ws-params .message-block .delete-btn, .ws-params .message-block [class*="delete"]').first();
    await deleteBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证消息块已删除
    const afterDeleteCount = await messageBlocks.count();
    expect(afterDeleteCount).toBeLessThan(initialCount);
    // 撤销删除
    const undoBtn = contentPage.locator('[data-testid="ws-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证消息块恢复
    const afterUndoCount = await messageBlocks.count();
    expect(afterUndoCount).toEqual(initialCount);
  });
});
