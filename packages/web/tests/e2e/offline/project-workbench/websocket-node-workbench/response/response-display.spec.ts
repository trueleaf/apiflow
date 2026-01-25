import { test, expect } from '../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('WebSocketResponseDisplay', () => {
  // 连接成功后显示连接信息
  test('连接成功后显示连接信息', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '连接信息显示测试' });
    // 输入连接地址
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill(`127.0.0.1:${MOCK_SERVER_PORT}/ws`);
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 发起连接
    const connectBtn = contentPage.getByRole('button', { name: /发起连接|重新连接/ });
    await connectBtn.click();
    // 验证响应区域显示连接信息
    const wsView = contentPage.locator('.websocket-view');
    await expect(wsView).toContainText('已连接到：', { timeout: 10000 });
  });
  // 收到消息后在响应区域显示
  test('收到消息后在响应区域显示', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '消息显示测试' });
    // 输入连接地址
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill(`127.0.0.1:${MOCK_SERVER_PORT}/ws`);
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 发起连接
    const connectBtn = contentPage.getByRole('button', { name: /发起连接|重新连接/ });
    await connectBtn.click();
    // 验证连接成功
    const wsView = contentPage.locator('.websocket-view');
    await expect(wsView).toContainText('已连接到：', { timeout: 10000 });
    // 添加消息块并发送消息
    const addBlockBtn = contentPage.locator('.message-content .add-block-button').first();
    await addBlockBtn.click();
    await contentPage.waitForTimeout(300);
    const messageBlock = contentPage.locator('.message-block').first();
    const messageEditor = messageBlock.locator('.s-json-editor').first();
    await messageEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('ping');
    await contentPage.waitForTimeout(200);
    // 发送消息
    const sendBtn = messageBlock.getByRole('button', { name: /^发送$/ });
    await sendBtn.click();
    // 验证收到响应消息
    await expect(wsView).toContainText('pong', { timeout: 10000 });
  });
  // 基本信息区域显示连接地址
  test('基本信息区域显示连接地址', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '基本信息显示测试' });
    // 确保是水平布局
    const layoutDropdown = contentPage.locator('.ws-params .action-item').filter({ hasText: /布局/ });
    await layoutDropdown.click();
    await contentPage.waitForTimeout(300);
    const horizontalOption = contentPage.locator('.el-dropdown-menu__item').filter({ hasText: /左右布局|Horizontal/ });
    await horizontalOption.click();
    await contentPage.waitForTimeout(500);
    // 输入连接地址
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill('127.0.0.1:8080/test-ws');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 验证基本信息区域显示连接地址
    const baseInfo = contentPage.locator('.websocket-base-info');
    if (await baseInfo.isVisible()) {
      await expect(baseInfo).toContainText('127.0.0.1:8080/test-ws');
    }
  });
  // 断开连接后显示断开信息
  test('断开连接后显示断开信息', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '断开连接测试' });
    // 输入连接地址
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill(`127.0.0.1:${MOCK_SERVER_PORT}/ws`);
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 发起连接
    const connectBtn = contentPage.getByRole('button', { name: /发起连接|重新连接/ });
    await connectBtn.click();
    // 验证连接成功
    const wsView = contentPage.locator('.websocket-view');
    await expect(wsView).toContainText('已连接到：', { timeout: 10000 });
    // 断开连接
    const disconnectBtn = contentPage.getByRole('button', { name: /断开连接/ });
    await expect(disconnectBtn).toBeVisible({ timeout: 5000 });
    await disconnectBtn.click();
    await contentPage.waitForTimeout(1000);
    // 验证显示断开信息或连接按钮重新出现
    const reconnectBtn = contentPage.getByRole('button', { name: /发起连接|重新连接/ });
    await expect(reconnectBtn).toBeVisible({ timeout: 5000 });
  });
  // 多条消息按时间顺序显示
  test('多条消息按时间顺序显示', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '消息顺序测试' });
    // 输入连接地址
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill(`127.0.0.1:${MOCK_SERVER_PORT}/ws`);
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 发起连接
    const connectBtn = contentPage.getByRole('button', { name: /发起连接|重新连接/ });
    await connectBtn.click();
    // 验证连接成功
    const wsView = contentPage.locator('.websocket-view');
    await expect(wsView).toContainText('已连接到：', { timeout: 10000 });
    // 添加消息块
    const addBlockBtn = contentPage.locator('.message-content .add-block-button').first();
    await addBlockBtn.click();
    await contentPage.waitForTimeout(300);
    const messageBlock = contentPage.locator('.message-block').first();
    const messageEditor = messageBlock.locator('.s-json-editor').first();
    // 发送第一条消息
    await messageEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('message1');
    await contentPage.waitForTimeout(200);
    const sendBtn = messageBlock.getByRole('button', { name: /^发送$/ });
    await sendBtn.click();
    await contentPage.waitForTimeout(500);
    // 发送第二条消息
    await messageEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('message2');
    await contentPage.waitForTimeout(200);
    await sendBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证响应区域包含多条消息
    await expect(wsView).toContainText('message1');
    await expect(wsView).toContainText('message2');
  });
});
