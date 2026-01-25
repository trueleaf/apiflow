import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('WebSocketQueryParamsRedo', () => {
  // 撤销Query参数后重做恢复
  test('撤销Query参数后重做恢复', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: 'Query参数重做测试' });
    // 切换到Params标签页
    const paramsTab = contentPage.locator('.ws-params .params-tabs .el-tabs__item').filter({ hasText: 'Params' });
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 添加Query参数
    const queryKeyInput = contentPage.locator('.ws-params .editable-table .editable-cell').first();
    await queryKeyInput.click();
    await contentPage.keyboard.type('redoKey');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 验证参数已添加
    await expect(queryKeyInput).toContainText('redoKey');
    // 撤销
    const undoBtn = contentPage.locator('[data-testid="ws-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证参数已撤销
    await expect(queryKeyInput).toHaveText(/^\s*$/, { timeout: 5000 });
    // 重做
    const redoBtn = contentPage.locator('[data-testid="ws-params-redo-btn"]');
    await redoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证参数恢复
    await expect(queryKeyInput).toContainText('redoKey', { timeout: 5000 });
  });
  // 使用快捷键重做Query参数
  test('使用快捷键重做Query参数', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: 'Query快捷键重做测试' });
    // 切换到Params标签页
    const paramsTab = contentPage.locator('.ws-params .params-tabs .el-tabs__item').filter({ hasText: 'Params' });
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 添加Query参数
    const queryKeyInput = contentPage.locator('.ws-params .editable-table .editable-cell').first();
    await queryKeyInput.click();
    await contentPage.keyboard.type('shortcutKey');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 撤销
    await contentPage.keyboard.press('Control+z');
    await contentPage.waitForTimeout(300);
    // 重做
    await contentPage.keyboard.press('Control+y');
    await contentPage.waitForTimeout(300);
    // 验证参数恢复
    await expect(queryKeyInput).toContainText('shortcutKey', { timeout: 5000 });
  });
});
