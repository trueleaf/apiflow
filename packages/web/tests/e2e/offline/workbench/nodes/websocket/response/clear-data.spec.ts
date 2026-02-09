import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('WebSocketClearData', () => {
  // 点击清空数据按钮后,消息列表清空
  test('点击清空数据按钮后消息列表清空', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await createNode(contentPage, { nodeType: 'websocket', name: '清空数据测试' });
    // 输入连接地址
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill(`127.0.0.1:${MOCK_SERVER_PORT}/ws`);
    await contentPage.keyboard.press('Enter');
    // 发起连接
    const connectBtn = contentPage.getByRole('button', { name: /发起连接|重新连接/ });
    await connectBtn.click();
    // 验证连接成功
    const wsView = contentPage.locator('.websocket-view');
    await expect(wsView).toContainText('已连接到：', { timeout: 10000 });
    // 添加消息块并发送消息
    const addBlockBtn = contentPage.locator('.message-content .add-block-button').first();
    await addBlockBtn.click();
    const messageBlock = contentPage.locator('.message-block').first();
    const messageEditor = messageBlock.locator('.s-json-editor').first();
    await messageEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('test message');
    const sendBtn = messageBlock.getByRole('button', { name: /^发送$/ });
    await sendBtn.click();
    // 验证消息已显示
    const messageItems = wsView.locator('.websocket-message .message-content').filter({ hasText: 'test message' });
    await expect.poll(async () => await messageItems.count(), { timeout: 10000 }).toBeGreaterThan(0);
    // 点击清空历史按钮（图标按钮无文案）
    const clearBtn = wsView.locator('.clear-icon').first();
    await expect(clearBtn).toBeVisible({ timeout: 5000 });
    await clearBtn.click();
    // 验证消息列表已清空
    await expect(messageItems).toHaveCount(0, { timeout: 5000 });
    await expect(wsView.locator('.el-empty')).toBeVisible({ timeout: 5000 });
  });
  // 清空数据后,缓存也被清空
  test('清空数据后缓存也被清空', async ({ contentPage, clearCache, createProject, createNode, reload }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await createNode(contentPage, { nodeType: 'websocket', name: '缓存清空测试' });
    // 输入连接地址
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill(`127.0.0.1:${MOCK_SERVER_PORT}/ws`);
    await contentPage.keyboard.press('Enter');
    // 发起连接
    const connectBtn = contentPage.getByRole('button', { name: /发起连接|重新连接/ });
    await connectBtn.click();
    // 验证连接成功
    const wsView = contentPage.locator('.websocket-view');
    await expect(wsView).toContainText('已连接到：', { timeout: 10000 });
    // 添加消息块并发送消息
    const addBlockBtn = contentPage.locator('.message-content .add-block-button').first();
    await addBlockBtn.click();
    const messageBlock = contentPage.locator('.message-block').first();
    const messageEditor = messageBlock.locator('.s-json-editor').first();
    await messageEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('cache test');
    const sendBtn = messageBlock.getByRole('button', { name: /^发送$/ });
    await sendBtn.click();
    const cacheMessageItems = wsView.locator('.websocket-message .message-content').filter({ hasText: 'cache test' });
    await expect.poll(async () => await cacheMessageItems.count(), { timeout: 10000 }).toBeGreaterThan(0);
    // 点击清空数据按钮
    const clearBtn = wsView.locator('.clear-icon').first();
    await expect(clearBtn).toBeVisible({ timeout: 5000 });
    await clearBtn.click();
    await expect(cacheMessageItems).toHaveCount(0, { timeout: 5000 });
    await expect(wsView.locator('.el-empty')).toBeVisible({ timeout: 5000 });
    // 刷新页面验证缓存已清空
    await reload();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 验证消息列表为空或不包含之前的消息
    const wsViewAfter = contentPage.locator('.websocket-view');
    await expect(wsViewAfter.locator('.websocket-message .message-content').filter({ hasText: 'cache test' })).toHaveCount(0, { timeout: 5000 });
    await expect(wsViewAfter.locator('.el-empty')).toBeVisible({ timeout: 5000 });
  });
  // 未连接状态下清空按钮不可用或隐藏
  test('未连接状态下响应区域显示空状态', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await createNode(contentPage, { nodeType: 'websocket', name: '空状态测试' });
    // 不进行连接,直接验证响应区域状态
    const wsView = contentPage.locator('.websocket-view');
    await expect(wsView).toBeVisible({ timeout: 5000 });
    await expect(wsView.locator('.el-empty')).toBeVisible({ timeout: 5000 });
    await expect(wsView.locator('.el-empty')).toContainText(/点击发起连接|建立WebSocket连接/, { timeout: 5000 });
  });
  // 连接错误后显示错误信息
  test('连接错误后显示错误信息', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await createNode(contentPage, { nodeType: 'websocket', name: '连接错误测试' });
    // 输入一个不存在的连接地址
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill('127.0.0.1:59999/invalid');
    await contentPage.keyboard.press('Enter');
    // 尝试发起连接
    const connectBtn = contentPage.getByRole('button', { name: /发起连接|重新连接/ });
    await connectBtn.click();
    // 验证显示连接失败或错误信息
    const wsView = contentPage.locator('.websocket-view');
    await expect(wsView).toBeVisible({ timeout: 10000 });
    const errorItem = wsView.locator('.websocket-message .status-info').filter({ hasText: /错误/ }).first();
    await expect(errorItem).toBeVisible({ timeout: 10000 });
    // 连接失败后按钮应该变回"发起连接"或"重新连接"
    const reconnectBtn = contentPage.getByRole('button', { name: /发起连接|重新连接/ });
    await expect(reconnectBtn).toBeVisible({ timeout: 10000 });
  });
  // 连接成功后收发消息再清空后消息列表为空但连接仍保持
  test('清空数据后连接状态保持不变', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await createNode(contentPage, { nodeType: 'websocket', name: '清空后连接状态测试' });
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await urlEditor.fill(`ws://127.0.0.1:${MOCK_SERVER_PORT}/ws`);
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 连接WebSocket
    const connectBtn = contentPage.getByRole('button', { name: /发起连接|重新连接/ });
    await connectBtn.click();
    const wsView = contentPage.locator('.websocket-view');
    await expect(wsView).toContainText('已连接到：', { timeout: 10000 });
    // 发送消息
    const addBlockBtn = contentPage.locator('.message-content .add-block-button').first();
    await addBlockBtn.click();
    await contentPage.waitForTimeout(300);
    const messageBlock = contentPage.locator('.message-block').first();
    const messageEditor = messageBlock.locator('.s-json-editor').first();
    await messageEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('test-clear');
    const sendBtn = messageBlock.getByRole('button', { name: /^发送$/ });
    await sendBtn.click();
    await expect(wsView).toContainText('pong', { timeout: 10000 });
    // 点击清空数据按钮
    const clearBtn = contentPage.locator('.websocket-view .clear-btn, .websocket-view [data-testid="ws-clear-btn"]').first();
    await clearBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证断开连接按钮仍然可见（连接未断开）
    const disconnectBtn = contentPage.getByRole('button', { name: /断开连接/ });
    await expect(disconnectBtn).toBeVisible({ timeout: 5000 });
  });
});
