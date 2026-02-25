import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('WebSocketPreScriptExecution-Online', () => {
  test('在线模式前置脚本执行成功后可正常连接收发', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });

    // 创建WebSocket节点并填写连接地址
    await createNode(contentPage, { nodeType: 'websocket', name: '在线-前置脚本成功测试' });
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type(`ws://127.0.0.1:${MOCK_SERVER_PORT}/ws`);
    await contentPage.keyboard.press('Enter');

    // 写入可执行前置脚本
    const preScriptTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /前置脚本/ }).first();
    await preScriptTab.click();
    const preEditor = contentPage.locator('#pane-preScript .s-monaco-editor').first();
    await expect(preEditor).toBeVisible({ timeout: 5000 });
    await preEditor.click();
    await contentPage.keyboard.type('ws.request.queryParams.traceId = "online-pre-script";');

    // 发起连接并验证连接状态
    const connectBtn = contentPage.getByRole('button', { name: /发起连接|重新连接/ });
    await expect(connectBtn).toBeVisible({ timeout: 5000 });
    await connectBtn.click();
    const wsView = contentPage.locator('.websocket-view');
    await expect(wsView).toContainText('已连接到：', { timeout: 10000 });

    // 发送ping并验证收到pong
    const addBlockBtn = contentPage.locator('.message-content .add-block-button').first();
    await expect(addBlockBtn).toBeVisible({ timeout: 5000 });
    await addBlockBtn.click();
    const messageBlock = contentPage.locator('.message-block').first();
    await expect(messageBlock).toBeVisible({ timeout: 5000 });
    const messageEditor = messageBlock.locator('.s-json-editor').first();
    await messageEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('ping');
    const sendBtn = messageBlock.getByRole('button', { name: /^发送$/ });
    await expect(sendBtn).toBeVisible({ timeout: 5000 });
    await sendBtn.click();
    await expect(wsView).toContainText('pong', { timeout: 10000 });
  });

  test('在线模式前置脚本执行异常时写入错误消息并阻断连接', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });

    // 创建WebSocket节点并填写连接地址
    await createNode(contentPage, { nodeType: 'websocket', name: '在线-前置脚本异常测试' });
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type(`ws://127.0.0.1:${MOCK_SERVER_PORT}/ws`);
    await contentPage.keyboard.press('Enter');

    // 写入异常前置脚本
    const preScriptTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /前置脚本/ }).first();
    await preScriptTab.click();
    const preEditor = contentPage.locator('#pane-preScript .s-monaco-editor').first();
    await expect(preEditor).toBeVisible({ timeout: 5000 });
    await preEditor.click();
    await contentPage.keyboard.type('const test = { invalid syntax }');

    // 发起连接后校验错误消息展示
    const connectBtn = contentPage.getByRole('button', { name: /发起连接|重新连接/ });
    await expect(connectBtn).toBeVisible({ timeout: 5000 });
    await connectBtn.click();
    const wsView = contentPage.locator('.websocket-view');
    await expect(wsView).toBeVisible({ timeout: 10000 });
    await expect(wsView.locator('.status-data').filter({ hasText: /前置脚本执行失败/ }).first()).toBeVisible({ timeout: 10000 });

    // 连接失败后应回到可重连状态
    await expect(contentPage.getByRole('button', { name: /发起连接|重新连接/ })).toBeVisible({ timeout: 5000 });
  });
});
