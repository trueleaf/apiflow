import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('WebSocketProtocolSwitch', () => {
  // 切换到WS协议后,协议选择器显示WS
  test('切换到WS协议后协议选择器显示WS', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: 'WS协议切换测试' });
    // 点击协议选择器
    const protocolSelect = contentPage.locator('.ws-operation .protocol-select .el-select');
    await expect(protocolSelect).toBeVisible({ timeout: 5000 });
    await protocolSelect.click();
    await contentPage.waitForTimeout(300);
    // 选择WS协议
    const wsOption = contentPage.locator('.el-select-dropdown:visible .el-select-dropdown__item').filter({ hasText: /^WS$/ }).first();
    await wsOption.click();
    await contentPage.waitForTimeout(300);
    // 验证协议选择器显示WS
    const selectedValue = protocolSelect.locator('.el-select__selected-item:not(.is-hidden)');
    await expect(selectedValue).toContainText('WS');
  });
  // 切换到WSS协议后,协议选择器显示WSS
  test('切换到WSS协议后协议选择器显示WSS', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: 'WSS协议切换测试' });
    // 点击协议选择器
    const protocolSelect = contentPage.locator('.ws-operation .protocol-select .el-select');
    await expect(protocolSelect).toBeVisible({ timeout: 5000 });
    await protocolSelect.click();
    await contentPage.waitForTimeout(300);
    // 选择WSS协议
    const wssOption = contentPage.locator('.el-select-dropdown:visible .el-select-dropdown__item').filter({ hasText: /^WSS$/ }).first();
    await wssOption.click();
    await contentPage.waitForTimeout(300);
    // 验证协议选择器显示WSS
    const selectedValue = protocolSelect.locator('.el-select__selected-item:not(.is-hidden)');
    await expect(selectedValue).toContainText('WSS');
  });
  // 切换协议后刷新页面,协议保持不变
  test('切换协议后刷新页面协议保持不变', async ({ contentPage, clearCache, createProject, createNode, reload }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '协议持久化测试' });
    // 点击协议选择器
    const protocolSelect = contentPage.locator('.ws-operation .protocol-select .el-select');
    await expect(protocolSelect).toBeVisible({ timeout: 5000 });
    await protocolSelect.click();
    await contentPage.waitForTimeout(300);
    // 选择WSS协议
    const wssOption = contentPage.locator('.el-select-dropdown:visible .el-select-dropdown__item').filter({ hasText: /^WSS$/ }).first();
    await wssOption.click();
    await contentPage.waitForTimeout(500);
    // 点击保存按钮
    const saveBtn = contentPage.locator('[data-testid="websocket-operation-save-btn"]');
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    // 刷新页面
    await reload();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(1000);
    // 验证协议仍然为WSS
    const selectedValue = contentPage.locator('.ws-operation .protocol-select .el-select .el-select__selected-item:not(.is-hidden)');
    await expect(selectedValue).toContainText('WSS');
  });
  // 切换协议后,连接地址的协议前缀同步更新
  test('切换协议后连接地址的协议前缀同步更新', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '协议前缀同步测试' });
    // 输入连接地址
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill('127.0.0.1:8080/ws');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 验证初始状态为ws://
    const statusUrl = contentPage.locator('.ws-operation .status-wrap .url');
    await expect(statusUrl).toContainText('ws://');
    // 切换到WSS协议（不会自动改写已输入的URL，需要重新输入触发格式化）
    const protocolSelect = contentPage.locator('.ws-operation .protocol-select .el-select');
    await protocolSelect.click();
    await contentPage.waitForTimeout(300);
    const wssOption = contentPage.locator('.el-select-dropdown:visible .el-select-dropdown__item').filter({ hasText: /^WSS$/ }).first();
    await wssOption.click();
    await contentPage.waitForTimeout(300);
    // 重新输入无协议前缀的地址，验证会按WSS格式化
    await urlEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('127.0.0.1:8080/ws');
    await contentPage.keyboard.press('Enter');
    await expect(statusUrl).toContainText('wss://', { timeout: 10000 });
  });
});
