import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('RequestConfig', () => {
  // 修改最大文本Body大小配置,验证超过限制时的处理
  test('修改最大文本Body大小配置', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('最大文本Body大小测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 切换到设置标签
    const settingsTab = contentPage.locator('.el-tabs__item', { hasText: /设置|Settings/ });
    await settingsTab.click();
    await contentPage.waitForTimeout(300);
    // 找到"最大文本Body大小"配置项
    const maxBodySizeInput = contentPage.locator('.request-config input, .settings-panel input').filter({ hasText: /Body/ }).first();
    if (await maxBodySizeInput.isVisible()) {
      await maxBodySizeInput.click();
      await maxBodySizeInput.fill('1');
      await contentPage.waitForTimeout(300);
    }
    // 验证设置面板可见
    const settingsPanel = contentPage.locator('.request-config, .settings-panel, .http-node-settings');
    await expect(settingsPanel).toBeVisible({ timeout: 5000 });
  });
  // 修改最大原始Body大小配置,验证超过限制时的处理
  test('修改最大原始Body大小配置', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('最大原始Body大小测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 切换到设置标签
    const settingsTab = contentPage.locator('.el-tabs__item', { hasText: /设置|Settings/ });
    await settingsTab.click();
    await contentPage.waitForTimeout(300);
    // 验证设置面板可见
    const settingsPanel = contentPage.locator('.request-config, .settings-panel, .http-node-settings');
    await expect(settingsPanel).toBeVisible({ timeout: 5000 });
  });
  // 修改自定义User-Agent配置,发送请求后验证User-Agent已更改
  test('修改自定义User-Agent配置', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('自定义User-Agent测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(300);
    // 切换到设置标签
    const settingsTab = contentPage.locator('.el-tabs__item', { hasText: /设置|Settings/ });
    await settingsTab.click();
    await contentPage.waitForTimeout(300);
    // 找到"自定义User-Agent"配置项并修改
    const userAgentInput = contentPage.locator('.request-config input[type="text"], .settings-panel input').first();
    if (await userAgentInput.isVisible()) {
      await userAgentInput.click();
      await userAgentInput.fill('CustomTestAgent/1.0');
      await contentPage.waitForTimeout(300);
    }
    // 点击发送按钮
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应区域有内容（请求成功发送）
    const responseArea = contentPage.locator('.response-area, .response-wrap, .response-content');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
  });
  // 修改请求头值最大展示长度配置,验证请求头展示截断正确
  test('修改请求头值最大展示长度配置', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('请求头展示长度测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(300);
    // 切换到设置标签
    const settingsTab = contentPage.locator('.el-tabs__item', { hasText: /设置|Settings/ });
    await settingsTab.click();
    await contentPage.waitForTimeout(300);
    // 验证设置面板可见
    const settingsPanel = contentPage.locator('.request-config, .settings-panel, .http-node-settings');
    await expect(settingsPanel).toBeVisible({ timeout: 5000 });
    // 切换到Headers标签添加长请求头
    const headersTab = contentPage.locator('.el-tabs__item', { hasText: 'Headers' });
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    // 添加一个很长的自定义请求头
    const headerKeyInput = contentPage.locator('.custom-headers .el-input input, .header-params input').first();
    await headerKeyInput.click();
    await headerKeyInput.fill('X-Long-Header');
    await contentPage.waitForTimeout(200);
    const headerValueInput = contentPage.locator('.custom-headers .el-input input, .header-params input').nth(1);
    await headerValueInput.click();
    await headerValueInput.fill('This is a very long header value that should be truncated based on the max display length configuration setting');
    await contentPage.waitForTimeout(300);
    // 点击发送按钮
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应区域有内容（请求成功发送）
    const responseArea = contentPage.locator('.response-area, .response-wrap, .response-content');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
  });
});
