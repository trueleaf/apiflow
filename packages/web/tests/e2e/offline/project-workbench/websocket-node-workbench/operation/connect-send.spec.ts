import { test, expect } from '../../../../../fixtures/electron.fixture';

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
});



