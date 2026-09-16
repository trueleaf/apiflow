import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('WebSocketNodeRequest', () => {
  // 连接后发送消息并验证响应
  test('连接并收发消息', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });

    // 新建WebSocket节点并填写连接地址
    await createNode(contentPage, { nodeType: 'websocket', name: 'WebSocket收发测试接口' });
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill(`ws://127.0.0.1:${MOCK_SERVER_PORT}/ws`);
    await expect(urlEditor).toHaveText(`ws://127.0.0.1:${MOCK_SERVER_PORT}/ws`);
    await contentPage.getByTestId('websocket-operation-save-btn').click();

    // 发起连接并等待连接状态
    const connectBtn = contentPage.getByRole('button', { name: /发起连接|重新连接/ });
    await expect(connectBtn).toBeVisible({ timeout: 5000 });
    await connectBtn.click();

    const wsView = contentPage.locator('.websocket-view');
    await expect(wsView).toContainText('已连接到：', { timeout: 10000 });

    // 新增消息块并发送ping
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

  // 连接后断开并验证状态切换
  test('连接后断开WebSocket连接并验证状态变化', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });

    await createNode(contentPage, { nodeType: 'websocket', name: 'WebSocket断开连接测试' });
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill(`ws://127.0.0.1:${MOCK_SERVER_PORT}/ws`);
    await expect(urlEditor).toHaveText(`ws://127.0.0.1:${MOCK_SERVER_PORT}/ws`);
    await contentPage.getByTestId('websocket-operation-save-btn').click();

    // 建立连接后断开
    const connectBtn = contentPage.getByRole('button', { name: /发起连接|重新连接/ });
    await expect(connectBtn).toBeVisible({ timeout: 5000 });
    await connectBtn.click();

    const wsView = contentPage.locator('.websocket-view');
    await expect(wsView).toContainText('已连接到：', { timeout: 10000 });

    const disconnectBtn = contentPage.getByRole('button', { name: /断开连接/ });
    await expect(disconnectBtn).toBeVisible({ timeout: 5000 });
    await disconnectBtn.click();

    await expect(wsView).toContainText(/断开连接|已断开/, { timeout: 10000 });
    await expect(contentPage.getByRole('button', { name: /发起连接|重新连接/ })).toBeVisible({ timeout: 5000 });
  });

  // 断开后重连并再次收发消息
  test('断开后重新连接WebSocket并收发消息', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });

    await createNode(contentPage, { nodeType: 'websocket', name: 'WebSocket重连测试' });
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill(`ws://127.0.0.1:${MOCK_SERVER_PORT}/ws`);
    await expect(urlEditor).toHaveText(`ws://127.0.0.1:${MOCK_SERVER_PORT}/ws`);
    await contentPage.getByTestId('websocket-operation-save-btn').click();

    // 首次连接
    const connectBtn = contentPage.getByRole('button', { name: /发起连接|重新连接/ });
    await expect(connectBtn).toBeVisible({ timeout: 5000 });
    await connectBtn.click();

    const wsView = contentPage.locator('.websocket-view');
    await expect(wsView).toContainText('已连接到：', { timeout: 10000 });

    // 断开后重新连接
    const disconnectBtn = contentPage.getByRole('button', { name: /断开连接/ });
    await expect(disconnectBtn).toBeVisible({ timeout: 5000 });
    await disconnectBtn.click();
    await expect(contentPage.getByRole('button', { name: /发起连接|重新连接/ })).toBeVisible({ timeout: 5000 });
    await contentPage.getByRole('button', { name: /发起连接|重新连接/ }).click();
    await expect(wsView).toContainText('已连接到：', { timeout: 10000 });

    // 重连后发送消息并验证pong
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
});

