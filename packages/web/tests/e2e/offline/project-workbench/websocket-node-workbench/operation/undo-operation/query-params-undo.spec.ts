import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('WebSocketQueryParamsUndo', () => {
  // 添加Query参数后撤销恢复原值
  test('添加Query参数后撤销恢复原值', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: 'Query参数撤销测试' });
    // 切换到Params标签页
    const paramsTab = contentPage.locator('.ws-params .params-tabs .el-tabs__item').filter({ hasText: 'Params' });
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 找到第一行Query参数的key输入框
    const queryKeyInput = contentPage.locator('.ws-params .editable-table .editable-cell').first();
    await expect(queryKeyInput).toBeVisible({ timeout: 5000 });
    await queryKeyInput.click();
    await contentPage.keyboard.type('testKey');
    await contentPage.keyboard.press('Tab');
    await contentPage.waitForTimeout(300);
    // 输入value
    await contentPage.keyboard.type('testValue');
    await contentPage.keyboard.press('Tab');
    await contentPage.waitForTimeout(300);
    // 点击撤销按钮恢复value输入
    const undoBtn = contentPage.locator('[data-testid="ws-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证value被撤销
    const valueCell = contentPage.locator('.ws-params .editable-table .editable-row').first().locator('.editable-cell').nth(1);
    await expect(valueCell).toHaveText(/^\s*$/, { timeout: 5000 });
  });
  // 使用Ctrl+Z撤销Query参数编辑
  test('使用Ctrl+Z撤销Query参数编辑', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: 'Query快捷键撤销测试' });
    // 切换到Params标签页
    const paramsTab = contentPage.locator('.ws-params .params-tabs .el-tabs__item').filter({ hasText: 'Params' });
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 找到第一行Query参数的key输入框
    const queryKeyInput = contentPage.locator('.ws-params .editable-table .editable-cell').first();
    await expect(queryKeyInput).toBeVisible({ timeout: 5000 });
    await queryKeyInput.click();
    await contentPage.keyboard.type('paramKey');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 使用Ctrl+Z撤销
    await contentPage.keyboard.press('Control+z');
    await contentPage.waitForTimeout(300);
    // 验证key被撤销
    await expect(queryKeyInput).toHaveText(/^\s*$/, { timeout: 5000 });
  });
  // 删除Query参数后撤销恢复
  test('删除Query参数后撤销恢复', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: 'Query删除撤销测试' });
    // 切换到Params标签页
    const paramsTab = contentPage.locator('.ws-params .params-tabs .el-tabs__item').filter({ hasText: 'Params' });
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 添加一个Query参数
    const queryKeyInput = contentPage.locator('.ws-params .editable-table .editable-cell').first();
    await queryKeyInput.click();
    await contentPage.keyboard.type('deleteKey');
    await contentPage.keyboard.press('Tab');
    await contentPage.keyboard.type('deleteValue');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 点击删除按钮
    const deleteBtn = contentPage.locator('.ws-params .editable-table .editable-row').first().locator('.delete-btn, .el-icon-delete, [class*="delete"]').first();
    await deleteBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证参数已删除(输入框应该是空的)
    await expect(queryKeyInput).toHaveText(/^\s*$/, { timeout: 5000 });
    // 撤销删除操作
    const undoBtn = contentPage.locator('[data-testid="ws-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证参数恢复
    await expect(queryKeyInput).toContainText('deleteKey', { timeout: 5000 });
  });
});
