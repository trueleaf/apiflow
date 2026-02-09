import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('WebSocketNodeRequest', () => {
  // 测试用例1: 连接WebSocket服务器并发送消息后接收响应
  test('连接并收发消息', async ({ contentPage, clearCache, createProject, createNode }) => {
    // 清除缓存并创建项目
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 新增WebSocket节点
    await createNode(contentPage, { nodeType: 'websocket', name: 'WebSocket收发测试接口' });
    // 填写WebSocket连接地址
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill(`ws://127.0.0.1:${MOCK_SERVER_PORT}/ws`);
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 发起WebSocket连接
    const connectBtn = contentPage.getByRole('button', { name: /发起连接|重新连接/ });
    await expect(connectBtn).toBeVisible({ timeout: 5000 });
    await connectBtn.click();
    // 验证连接成功
    const wsView = contentPage.locator('.websocket-view');
    await expect(wsView).toContainText('已连接到：', { timeout: 10000 });
    // 添加消息块并填写消息内容
    const addBlockBtn = contentPage.locator('.message-content .add-block-button').first();
    await expect(addBlockBtn).toBeVisible({ timeout: 5000 });
    await addBlockBtn.click();
    await contentPage.waitForTimeout(300);
    const messageBlock = contentPage.locator('.message-block').first();
    await expect(messageBlock).toBeVisible({ timeout: 5000 });
    const messageEditor = messageBlock.locator('.s-json-editor').first();
    await messageEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('ping');
    await contentPage.waitForTimeout(200);
    // 发送消息并验证收到响应
    const sendBtn = messageBlock.getByRole('button', { name: /^发送$/ });
    await expect(sendBtn).toBeVisible({ timeout: 5000 });
    await sendBtn.click();
    await expect(wsView).toContainText('pong', { timeout: 10000 });
  });
  // 测试用例2: 连接WebSocket后手动断开连接并验证状态变化
  test('连接后断开WebSocket连接并验证状态变化', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: 'WebSocket断开连接测试' });
    // 填写WebSocket连接地址
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill(`ws://127.0.0.1:${MOCK_SERVER_PORT}/ws`);
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 发起WebSocket连接并验证连接成功
    const connectBtn = contentPage.getByRole('button', { name: /发起连接|重新连接/ });
    await expect(connectBtn).toBeVisible({ timeout: 5000 });
    await connectBtn.click();
    const wsView = contentPage.locator('.websocket-view');
    await expect(wsView).toContainText('已连接到：', { timeout: 10000 });
    // 点击断开连接按钮
    const disconnectBtn = contentPage.getByRole('button', { name: /断开连接/ });
    await expect(disconnectBtn).toBeVisible({ timeout: 5000 });
    await disconnectBtn.click();
    // 验证断开连接后显示断开消息，且发起连接按钮重新出现
    await expect(wsView).toContainText(/断开连接|已断开/, { timeout: 10000 });
    await expect(contentPage.getByRole('button', { name: /发起连接|重新连接/ })).toBeVisible({ timeout: 5000 });
  });
  // 断开后重新连接WebSocket并收发消息
  test('断开后重新连接WebSocket并收发消息', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: 'WebSocket重连测试' });
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill(`ws://127.0.0.1:${MOCK_SERVER_PORT}/ws`);
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 第一次连接
    const connectBtn = contentPage.getByRole('button', { name: /发起连接|重新连接/ });
    await connectBtn.click();
    const wsView = contentPage.locator('.websocket-view');
    await expect(wsView).toContainText('已连接到：', { timeout: 10000 });
    // 断开连接
    const disconnectBtn = contentPage.getByRole('button', { name: /断开连接/ });
    await expect(disconnectBtn).toBeVisible({ timeout: 5000 });
    await disconnectBtn.click();
    await expect(contentPage.getByRole('button', { name: /发起连接|重新连接/ })).toBeVisible({ timeout: 5000 });
    // 重新连接
    await contentPage.getByRole('button', { name: /发起连接|重新连接/ }).click();
    await expect(wsView).toContainText('已连接到：', { timeout: 10000 });
    // 重连后发送消息并验证收到响应
    const addBlockBtn = contentPage.locator('.message-content .add-block-button').first();
    await expect(addBlockBtn).toBeVisible({ timeout: 5000 });
    await addBlockBtn.click();
    await contentPage.waitForTimeout(300);
    const messageBlock = contentPage.locator('.message-block').first();
    const messageEditor = messageBlock.locator('.s-json-editor').first();
    await messageEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('hello');
    await contentPage.waitForTimeout(200);
    const sendBtn = messageBlock.getByRole('button', { name: /^发送$/ });
    await sendBtn.click();
    await expect(wsView).toContainText('pong', { timeout: 10000 });
  });
});



