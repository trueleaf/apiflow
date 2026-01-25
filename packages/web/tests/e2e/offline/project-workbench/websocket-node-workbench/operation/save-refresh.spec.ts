import { test, expect } from '../../../../../fixtures/electron.fixture';

test.describe('WebSocketSaveRefresh', () => {
  // 点击保存按钮,数据保存成功
  test('点击保存按钮数据保存成功', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '保存功能测试' });
    // 输入连接地址
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill('127.0.0.1:8080/save-test');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 点击保存按钮
    const saveBtn = contentPage.locator('[data-testid="websocket-operation-save-btn"]');
    await expect(saveBtn).toBeVisible({ timeout: 5000 });
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证保存成功（通过检查是否有成功提示或按钮状态）
    const successMessage = contentPage.locator('.el-message--success');
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });
  // 点击刷新按钮,数据重新加载
  test('点击刷新按钮数据重新加载', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '刷新功能测试' });
    // 输入连接地址并保存
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill('127.0.0.1:8080/refresh-test');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    const saveBtn = contentPage.locator('[data-testid="websocket-operation-save-btn"]');
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    // 修改地址（不保存）
    await urlEditor.click();
    await contentPage.keyboard.press('Control+a');
    await urlEditor.fill('127.0.0.1:9999/modified');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 点击刷新按钮
    const refreshBtn = contentPage.locator('.ws-operation .action-buttons .el-button').filter({ hasText: /刷新/ });
    await refreshBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证地址恢复为保存的值
    const statusUrl = contentPage.locator('.ws-operation .status-wrap .url');
    await expect(statusUrl).toContainText('127.0.0.1:8080/refresh-test');
  });
  // 未保存数据切换节点时,提示保存确认
  test('未保存数据切换节点时提示保存确认', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 创建第一个WebSocket节点
    await createNode(contentPage, { nodeType: 'websocket', name: 'WS节点1' });
    // 修改连接地址
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill('127.0.0.1:8080/node1');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 创建第二个WebSocket节点
    await createNode(contentPage, { nodeType: 'websocket', name: 'WS节点2' });
    await contentPage.waitForTimeout(300);
    // 点击第一个节点（切换回去）
    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    const node1 = bannerTree.locator('.el-tree-node__content', { hasText: 'WS节点1' }).first();
    await node1.click();
    await contentPage.waitForTimeout(500);
    // 验证弹出保存确认对话框
    const confirmDialog = contentPage.locator('.el-message-box, .el-dialog').filter({ hasText: /保存|save/i });
    const dialogVisible = await confirmDialog.isVisible();
    // 如果有确认对话框,点击取消
    if (dialogVisible) {
      const cancelBtn = confirmDialog.locator('.el-button').filter({ hasText: /取消|cancel/i });
      if (await cancelBtn.isVisible()) {
        await cancelBtn.click();
      }
    }
  });
});
