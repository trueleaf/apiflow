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
    const addBlockBtn = contentPage.locator('.ws-params .message-content .add-block-button');
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
    const nodeId = await createNode(contentPage, { nodeType: 'websocket', name: '消息内容撤销测试' });
    const createdNode = contentPage.locator(`[data-test-node-id="${nodeId}"]`).first();
    await expect(createdNode).toBeVisible({ timeout: 5000 });
    await createdNode.click();
    await expect(contentPage.locator('.ws-operation')).toBeVisible({ timeout: 5000 });
    // 切换到消息内容标签页
    const messageTab = contentPage.locator('.ws-params .params-tabs .el-tabs__item').filter({ hasText: /消息内容/ });
    await messageTab.click();
    await contentPage.waitForTimeout(300);
    // 点击添加消息块按钮
    const addBlockBtn = contentPage.locator('.ws-params .message-content .add-block-button');
    await addBlockBtn.click();
    await contentPage.waitForTimeout(300);
    // 在消息编辑区输入内容
    const messageEditor = contentPage.locator('.ws-params .message-block .monaco-editor').first();
    const viewLines = contentPage.locator('.ws-params .message-block .monaco-editor .view-lines').first();
    await expect(messageEditor).toBeVisible({ timeout: 5000 });
    await messageEditor.click();
    const testText = 'test content';
    await contentPage.keyboard.insertText(testText);
    await contentPage.waitForTimeout(500);
    // 验证内容已输入
    await expect.poll(async () => (await viewLines.innerText()).replace(/\u00a0/g, ' ')).toContain(testText);
    // 全选并输入新内容
    await contentPage.keyboard.press('Control+A');
    const modifiedText = 'modified content';
    await contentPage.keyboard.insertText(modifiedText);
    await contentPage.waitForTimeout(500);
    // 验证新内容已输入
    await expect.poll(async () => (await viewLines.innerText()).replace(/\u00a0/g, ' ')).toContain(modifiedText);
    await expect.poll(async () => (await viewLines.innerText()).replace(/\u00a0/g, ' ')).not.toContain(testText);
    // 点击空白区域让编辑器失焦，避免撤销仅影响编辑器输入
    await contentPage.locator('.ws-operation .status-wrap').click();
    await contentPage.waitForTimeout(200);
    // 撤销后应恢复为原始值
    const undoBtn = contentPage.locator('[data-testid="ws-params-undo-btn"]');
    await expect(undoBtn).not.toHaveClass(/disabled/, { timeout: 5000 });

    for (let i = 0; i < 60; i += 1) {
      const text = (await viewLines.innerText()).replace(/\u00a0/g, ' ')
      if (text.includes(testText) && !text.includes(modifiedText)) {
        break
      }
      await undoBtn.click()
      await contentPage.waitForTimeout(120)
    }

    await expect.poll(async () => (await viewLines.innerText()).replace(/\u00a0/g, ' ')).toContain(testText)
    await expect.poll(async () => (await viewLines.innerText()).replace(/\u00a0/g, ' ')).not.toContain(modifiedText)
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
    const addBlockBtn = contentPage.locator('.ws-params .message-content .add-block-button');
    await addBlockBtn.click();
    await contentPage.waitForTimeout(300);
    await addBlockBtn.click();
    await contentPage.waitForTimeout(300);
    // 记录消息块数量
    const messageBlocks = contentPage.locator('.ws-params .message-block, .ws-params .message-item');
    const initialCount = await messageBlocks.count();
    expect(initialCount).toBeGreaterThanOrEqual(2);
    // 删除消息块
    const deleteBtn = contentPage.locator('.ws-params .message-block').first().locator('.right-controls .el-button--danger');
    await expect(deleteBtn).toBeVisible({ timeout: 5000 });
    await deleteBtn.click();
    // 验证消息块已删除
    await expect(messageBlocks).toHaveCount(initialCount - 1);
    // 撤销删除
    const undoBtn = contentPage.locator('[data-testid="ws-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证消息块恢复
    await expect(messageBlocks).toHaveCount(initialCount);
  });
});
