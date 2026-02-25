import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('WebSocketAutoSend-Online', () => {
  test('在线模式开启自动发送后连接成功可自动收发消息', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    test.setTimeout(120000);
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });

    // 创建 WebSocket 节点并填写连接地址
    await createNode(contentPage, { nodeType: 'websocket', name: '在线-自动发送链路测试' });
    const wsUrlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(wsUrlEditor).toBeVisible({ timeout: 5000 });
    await wsUrlEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type(`ws://127.0.0.1:${MOCK_SERVER_PORT}/ws`);
    await contentPage.keyboard.press('Enter');
    await expect(contentPage.locator('.ws-operation .status-wrap .url')).toContainText(`ws://127.0.0.1:${MOCK_SERVER_PORT}/ws`, { timeout: 10000 });

    // 打开自动发送配置，开启快捷入口并设置发送内容
    const messageTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /消息内容/ }).first();
    await expect(messageTab).toBeVisible({ timeout: 5000 });
    await messageTab.click();
    const configButton = contentPage.locator('.message-content .config-button').first();
    await expect(configButton).toBeVisible({ timeout: 5000 });
    await configButton.click();
    const configPopover = contentPage.locator('.config-popover:visible').first();
    await expect(configPopover).toBeVisible({ timeout: 5000 });
    const autoSendQuickCheckbox = configPopover.locator('.quick-operations .el-checkbox').filter({ hasText: /自动发送/ }).first();
    await autoSendQuickCheckbox.click();
    const autoSendContentEditor = configPopover.locator('.config-content-editor .s-json-editor .monaco-editor').first();
    await expect(autoSendContentEditor).toBeVisible({ timeout: 5000 });
    await autoSendContentEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('ping');
    const saveConfigButton = configPopover.locator('.config-actions .el-button--primary').first();
    await saveConfigButton.click();

    // 在顶部控制条勾选自动发送并发起连接
    const autoSendControl = contentPage.locator('.message-content .config-controls .el-checkbox').filter({ hasText: /自动发送/ }).first();
    await expect(autoSendControl).toBeVisible({ timeout: 5000 });
    await autoSendControl.click();
    const connectButton = contentPage.getByRole('button', { name: /发起连接|重新连接/ }).first();
    await expect(connectButton).toBeVisible({ timeout: 5000 });
    await connectButton.click();

    // 自动发送应触发服务端回包，并在响应面板出现 pong
    const wsView = contentPage.locator('.websocket-view');
    await expect(wsView).toContainText('pong', { timeout: 15000 });
    await expect(contentPage.getByRole('button', { name: /断开连接/ }).first()).toBeVisible({ timeout: 10000 });
  });
});
