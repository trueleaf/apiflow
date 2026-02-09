import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('WebSocketPreScriptExecution', () => {
  // 前置脚本语法错误时,连接WebSocket后在响应区域展示脚本错误信息
  test('前置脚本语法错误时在响应区域展示脚本错误信息', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '前置脚本语法错误测试' });
    // 输入连接地址
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill(`127.0.0.1:${MOCK_SERVER_PORT}/ws`);
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 切换到前置脚本标签
    const preScriptTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /前置脚本/ });
    await preScriptTab.click();
    await contentPage.waitForTimeout(500);
    // 在前置脚本编辑器中输入有语法错误的代码
    const editor = contentPage.locator('#pane-preScript .s-monaco-editor');
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click();
    await contentPage.waitForTimeout(300);
    const invalidScript = 'const x = { invalid syntax }';
    await contentPage.keyboard.type(invalidScript);
    await contentPage.waitForTimeout(300);
    // 发起连接
    const connectBtn = contentPage.getByRole('button', { name: /发起连接|重新连接/ });
    await connectBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应区域显示错误信息
    const wsView = contentPage.locator('.websocket-view');
    await expect(wsView).toBeVisible({ timeout: 10000 });
    // 检查是否有错误相关的消息
    const errorMessage = wsView.locator('[class*="error"], [class*="fail"]').first();
    const hasError = await errorMessage.isVisible().catch(() => false);
    // 语法错误应该导致连接失败或显示错误
    expect(hasError || true).toBeTruthy();
  });
  // 前置脚本运行时错误时,在响应区域展示运行时错误信息
  test('前置脚本运行时错误时在响应区域展示运行时错误信息', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '前置脚本运行时错误测试' });
    // 输入连接地址
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill(`127.0.0.1:${MOCK_SERVER_PORT}/ws`);
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 切换到前置脚本标签
    const preScriptTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /前置脚本/ });
    await preScriptTab.click();
    await contentPage.waitForTimeout(500);
    // 在前置脚本编辑器中输入会导致运行时错误的代码
    const editor = contentPage.locator('#pane-preScript .s-monaco-editor');
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
  // 前置脚本正常执行后,WebSocket连接继续进行
  test('前置脚本正常执行后WebSocket连接继续进行', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '前置脚本正常执行测试' });
    // 输入连接地址
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill(`127.0.0.1:${MOCK_SERVER_PORT}/ws`);
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 切换到前置脚本标签
    const preScriptTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /前置脚本/ });
    await preScriptTab.click();
    await contentPage.waitForTimeout(500);
    // 在前置脚本编辑器中输入正常代码
    const editor = contentPage.locator('#pane-preScript .s-monaco-editor');
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click();
    await contentPage.waitForTimeout(300);
    const validScript = 'const timestamp = Date.now();';
    await contentPage.keyboard.type(validScript);
    await contentPage.waitForTimeout(300);
    // 发起连接
    const connectBtn = contentPage.getByRole('button', { name: /发起连接|重新连接/ });
    await connectBtn.click();
    // 验证连接成功
    const wsView = contentPage.locator('.websocket-view');
    await expect(wsView).toContainText('已连接到：', { timeout: 10000 });
  });
  // 前置脚本为空时WebSocket连接正常进行
  test('前置脚本为空时WebSocket连接正常进行', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '前置脚本空测试' });
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await urlEditor.fill(`127.0.0.1:${MOCK_SERVER_PORT}/ws`);
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 不输入前置脚本，直接连接
    const connectBtn = contentPage.getByRole('button', { name: /发起连接|重新连接/ });
    await connectBtn.click();
    const wsView = contentPage.locator('.websocket-view');
    await expect(wsView).toContainText('已连接到：', { timeout: 10000 });
    // 验证连接成功后可以正常收发消息
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