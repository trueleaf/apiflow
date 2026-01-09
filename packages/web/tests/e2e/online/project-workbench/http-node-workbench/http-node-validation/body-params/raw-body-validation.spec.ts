import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('RawBodyValidation', () => {
  // 测试用例1: 调用echo接口验证text格式参数是否正常返回,content-type是否设置正确
  test('调用echo接口验证text格式参数是否正常返回,content-type是否设置正确', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: 'Raw Text测试接口' });
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 选择POST方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
    await postOption.click();
    // 点击Body标签页
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择Raw类型
    const rawRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^raw$/i }).locator('.el-radio');
    await rawRadio.click();
    await contentPage.waitForTimeout(300);
    // 选择Text格式
    const rawTypeSelect = contentPage.locator('.raw-type .el-select');
    await rawTypeSelect.click();
    await contentPage.waitForTimeout(300);
    const textOption = contentPage.locator('.el-select-dropdown__item:visible').filter({ hasText: 'text' });
    await textOption.click();
    await contentPage.waitForTimeout(300);
    // 输入纯文本内容
    const rawTextarea = contentPage.locator('.raw-textarea textarea, .raw-editor textarea, [data-testid="raw-body-input"]');
    const rawTextareaCount = await rawTextarea.count();
    if (rawTextareaCount > 0) {
      await rawTextarea.fill('Hello World, this is plain text content.');
    } else {
      const rawEditor = contentPage.locator('.raw-wrap .s-json-editor').first();
      await rawEditor.click({ force: true });
      await contentPage.keyboard.type('Hello World, this is plain text content.');
    }
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    // 验证Content-Type包含text/plain
    await expect(responseBody).toContainText('text/plain', { timeout: 10000 });
    // 验证纯文本内容正确发送
    await expect(responseBody).toContainText('Hello World', { timeout: 10000 });
  });

  // 测试用例2: 调用echo接口验证html格式参数是否正常返回,content-type是否设置正确
  test('调用echo接口验证html格式参数是否正常返回,content-type是否设置正确', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: 'Raw HTML测试接口' });
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 选择POST方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
    await postOption.click();
    // 点击Body标签页
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择Raw类型
    const rawRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^raw$/i }).locator('.el-radio');
    await rawRadio.click();
    await contentPage.waitForTimeout(300);
    // 选择HTML格式
    const rawTypeSelect = contentPage.locator('.raw-type .el-select');
    await rawTypeSelect.click();
    await contentPage.waitForTimeout(300);
    const htmlOption = contentPage.locator('.el-select-dropdown__item:visible').filter({ hasText: 'html' });
    await htmlOption.click();
    await contentPage.waitForTimeout(300);
    // 输入HTML内容
    const rawTextarea = contentPage.locator('.raw-textarea textarea, .raw-editor textarea, [data-testid="raw-body-input"]');
    const rawTextareaCount = await rawTextarea.count();
    if (rawTextareaCount > 0) {
      await rawTextarea.fill('<html><body><h1>Test</h1></body></html>');
    } else {
      const rawEditor = contentPage.locator('.raw-wrap .s-json-editor').first();
      await rawEditor.click({ force: true });

      await contentPage.keyboard.type('<html><body><h1>Test</h1></body></html>');
    }
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    // 验证Content-Type包含text/html
    await expect(responseBody).toContainText('text/html', { timeout: 10000 });
    // 验证HTML标签完整
    await expect(responseBody).toContainText('html', { timeout: 10000 });
    await expect(responseBody).toContainText('body', { timeout: 10000 });
    await expect(responseBody).toContainText('h1', { timeout: 10000 });
    await expect(responseBody).toContainText('Test', { timeout: 10000 });
  });

  // 测试用例3: 调用echo接口验证xml格式参数是否正常返回,content-type是否设置正确
  test('调用echo接口验证xml格式参数是否正常返回,content-type是否设置正确', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: 'Raw XML测试接口' });
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 选择POST方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
    await postOption.click();
    // 点击Body标签页
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择Raw类型
    const rawRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^raw$/i }).locator('.el-radio');
    await rawRadio.click();
    await contentPage.waitForTimeout(300);
    // 选择XML格式
    const rawTypeSelect = contentPage.locator('.raw-type .el-select');
    await rawTypeSelect.click();
    await contentPage.waitForTimeout(300);
    const xmlOption = contentPage.locator('.el-select-dropdown__item:visible').filter({ hasText: 'xml' });
    await xmlOption.click();
    await contentPage.waitForTimeout(300);
    // 输入XML内容
    const rawTextarea = contentPage.locator('.raw-textarea textarea, .raw-editor textarea, [data-testid="raw-body-input"]');
    const rawTextareaCount = await rawTextarea.count();
    if (rawTextareaCount > 0) {
      await rawTextarea.fill('<?xml version="1.0"?><root><name>test</name></root>');
    } else {
      const rawEditor = contentPage.locator('.raw-wrap .s-json-editor').first();
      await rawEditor.click();
      await contentPage.keyboard.type('<?xml version="1.0"?><root><name>test</name></root>');
    }
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    // 验证Content-Type包含application/xml
    await expect(responseBody).toContainText('application/xml', { timeout: 10000 });
    // 验证XML结构完整
    await expect(responseBody).toContainText('xml', { timeout: 10000 });
    await expect(responseBody).toContainText('root', { timeout: 10000 });
    await expect(responseBody).toContainText('name', { timeout: 10000 });
    await expect(responseBody).toContainText('test', { timeout: 10000 });
  });

  // 测试用例4: 调用echo接口验证javascript格式参数是否正常返回,content-type是否设置正确
  test('调用echo接口验证javascript格式参数是否正常返回,content-type是否设置正确', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: 'Raw JavaScript测试接口' });
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 选择POST方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
    await postOption.click();
    // 点击Body标签页
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择Raw类型
    const rawRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^raw$/i }).locator('.el-radio');
    await rawRadio.click();
    await contentPage.waitForTimeout(300);
    // 选择JavaScript格式
    const rawTypeSelect = contentPage.locator('.raw-type .el-select');
    await rawTypeSelect.click();
    await contentPage.waitForTimeout(300);
    const jsOption = contentPage.locator('.el-select-dropdown__item:visible').filter({ hasText: 'javascript' });
    await jsOption.click();
    await contentPage.waitForTimeout(300);
    // 输入JavaScript代码
    const rawTextarea = contentPage.locator('.raw-textarea textarea, .raw-editor textarea, [data-testid="raw-body-input"]');
    const rawTextareaCount = await rawTextarea.count();
    if (rawTextareaCount > 0) {
      await rawTextarea.fill('function hello() { return "world"; }');
    } else {
      const rawEditor = contentPage.locator('.raw-wrap .s-json-editor').first();
      await rawEditor.click({ force: true });

      await contentPage.keyboard.type('function hello() { return "world"; }');
    }
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    // 验证Content-Type包含application/javascript
    await expect(responseBody).toContainText('text/javascript', { timeout: 10000 });
    // 验证代码内容完整
    await expect(responseBody).toContainText('function', { timeout: 10000 });
    await expect(responseBody).toContainText('hello', { timeout: 10000 });
    await expect(responseBody).toContainText('world', { timeout: 10000 });
  });
});


