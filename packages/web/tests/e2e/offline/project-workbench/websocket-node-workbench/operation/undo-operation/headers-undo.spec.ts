import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('WebSocketHeadersUndo', () => {
  // 添加Header后撤销恢复原值
  test('添加Header后撤销恢复原值', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: 'Header撤销测试' });
    // 切换到请求头标签页
    const headersTab = contentPage.locator('.ws-params .params-tabs .el-tabs__item').filter({ hasText: /请求头/ });
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    // 找到第一行Header的key输入框
    const headerKeyInput = contentPage.locator('.ws-params .editable-table .editable-cell').first();
    await expect(headerKeyInput).toBeVisible({ timeout: 5000 });
    await headerKeyInput.click();
    await contentPage.keyboard.type('X-Custom-Header');
    await contentPage.keyboard.press('Tab');
    await contentPage.keyboard.type('custom-value');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 验证Header已添加
    await expect(headerKeyInput).toContainText('X-Custom-Header');
    // 点击撤销按钮
    const undoBtn = contentPage.locator('[data-testid="ws-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证value被撤销
    const valueCell = contentPage.locator('.ws-params .editable-table .editable-row').first().locator('.editable-cell').nth(1);
    await expect(valueCell).toHaveText(/^\s*$/, { timeout: 5000 });
  });
  // 使用Ctrl+Z撤销Header编辑
  test('使用Ctrl+Z撤销Header编辑', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: 'Header快捷键撤销测试' });
    // 切换到请求头标签页
    const headersTab = contentPage.locator('.ws-params .params-tabs .el-tabs__item').filter({ hasText: /请求头/ });
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    // 找到第一行Header的key输入框
    const headerKeyInput = contentPage.locator('.ws-params .editable-table .editable-cell').first();
    await headerKeyInput.click();
    await contentPage.keyboard.type('Authorization');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 验证Header key已输入
    await expect(headerKeyInput).toContainText('Authorization');
    // 使用Ctrl+Z撤销
    await contentPage.keyboard.press('Control+z');
    await contentPage.waitForTimeout(300);
    // 验证key被撤销
    await expect(headerKeyInput).toHaveText(/^\s*$/, { timeout: 5000 });
  });
  // 修改Header值后撤销恢复原值
  test('修改Header值后撤销恢复原值', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: 'Header修改撤销测试' });
    // 切换到请求头标签页
    const headersTab = contentPage.locator('.ws-params .params-tabs .el-tabs__item').filter({ hasText: /请求头/ });
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    // 添加一个Header
    const headerKeyInput = contentPage.locator('.ws-params .editable-table .editable-cell').first();
    await headerKeyInput.click();
    await contentPage.keyboard.type('Content-Type');
    await contentPage.keyboard.press('Tab');
    await contentPage.keyboard.type('application/json');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 修改Header值
    const valueCell = contentPage.locator('.ws-params .editable-table .editable-row').first().locator('.editable-cell').nth(1);
    await valueCell.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('text/plain');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 验证值已修改
    await expect(valueCell).toContainText('text/plain');
    // 撤销修改
    const undoBtn = contentPage.locator('[data-testid="ws-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证值恢复为原始值
    await expect(valueCell).toContainText('application/json', { timeout: 5000 });
  });
});
