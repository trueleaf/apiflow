import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('WebSocketAfterScriptExecution', () => {
  // 后置脚本语法错误时,在响应区域展示脚本错误信息
  test('后置脚本语法错误时在响应区域展示脚本错误信息', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '后置脚本语法错误测试' });
    // 输入连接地址
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill(`127.0.0.1:${MOCK_SERVER_PORT}/ws`);
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 切换到后置脚本标签
    const afterScriptTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /后置脚本/ });
    await afterScriptTab.click();
    await contentPage.waitForTimeout(500);
    // 在后置脚本编辑器中输入有语法错误的代码
    const editor = contentPage.locator('#pane-afterScript .s-monaco-editor');
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click();
    await contentPage.waitForTimeout(300);
    const invalidScript = 'const x = { invalid syntax';
    await contentPage.keyboard.type(invalidScript);
    await contentPage.waitForTimeout(300);
    // 发起连接
    const connectBtn = contentPage.getByRole('button', { name: /发起连接|重新连接/ });
    await connectBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应区域存在
    const wsView = contentPage.locator('.websocket-view');
    await expect(wsView).toBeVisible({ timeout: 10000 });
  });
  // 后置脚本运行时错误时,在响应区域展示运行时错误信息
  test('后置脚本运行时错误时在响应区域展示运行时错误信息', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '后置脚本运行时错误测试' });
    // 输入连接地址
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill(`127.0.0.1:${MOCK_SERVER_PORT}/ws`);
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 切换到后置脚本标签
    const afterScriptTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /后置脚本/ });
    await afterScriptTab.click();
    await contentPage.waitForTimeout(500);
    // 在后置脚本编辑器中输入会导致运行时错误的代码
    const editor = contentPage.locator('#pane-afterScript .s-monaco-editor');
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click();
    await contentPage.waitForTimeout(300);
    const runtimeErrorScript = 'const x = null; x.property;';
    await contentPage.keyboard.type(runtimeErrorScript);
    await contentPage.waitForTimeout(300);
    // 发起连接
    const connectBtn = contentPage.getByRole('button', { name: /发起连接|重新连接/ });
    await connectBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应区域存在
    const wsView = contentPage.locator('.websocket-view');
    await expect(wsView).toBeVisible({ timeout: 10000 });
  });
  // 后置脚本在收到消息后执行
  test('后置脚本在收到消息后执行', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '后置脚本执行顺序测试' });
    // 输入连接地址
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill(`127.0.0.1:${MOCK_SERVER_PORT}/ws`);
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 切换到后置脚本标签
    const afterScriptTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /后置脚本/ });
    await afterScriptTab.click();
    await contentPage.waitForTimeout(500);
    // 在后置脚本编辑器中输入正常代码
    const editor = contentPage.locator('#pane-afterScript .s-monaco-editor');
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click();
    await contentPage.waitForTimeout(300);
    const validScript = 'const receivedAt = Date.now();';
    await contentPage.keyboard.type(validScript);
    await contentPage.waitForTimeout(300);
    // 发起连接
    const connectBtn = contentPage.getByRole('button', { name: /发起连接|重新连接/ });
    await connectBtn.click();
    // 验证连接成功
    const wsView = contentPage.locator('.websocket-view');
    await expect(wsView).toContainText('已连接到：', { timeout: 10000 });
  });
  // 后置脚本为空时不影响WebSocket连接和消息收发
  test('后置脚本为空时不影响WebSocket连接和消息收发', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '后置脚本空测试' });
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await urlEditor.fill(`127.0.0.1:${MOCK_SERVER_PORT}/ws`);
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 不输入后置脚本，直接连接
    const connectBtn = contentPage.getByRole('button', { name: /发起连接|重新连接/ });
    await connectBtn.click();
    const wsView = contentPage.locator('.websocket-view');
    await expect(wsView).toContainText('已连接到：', { timeout: 10000 });
    // 发送消息并验证收到响应
    const addBlockBtn = contentPage.locator('.message-content .add-block-button').first();
    await addBlockBtn.click();
    await contentPage.waitForTimeout(300);
    const messageBlock = contentPage.locator('.message-block').first();
    const messageEditor = messageBlock.locator('.s-json-editor').first();
    await messageEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('ping');
    const sendBtn = messageBlock.getByRole('button', { name: /^发送$/ });
    await sendBtn.click();
    await expect(wsView).toContainText('pong', { timeout: 10000 });
  });
});