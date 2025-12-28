import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('RawParams', () => {
  // 测试用例1: raw text参数输入值以后,请求头自动添加contentType:text/plain,调用127.0.0.1:{环境变量中的端口}/echo,返回结果参数和请求头正确
  test('raw text参数输入值以后,请求头自动添加contentType:text/plain,调用echo接口返回结果参数和请求头正确', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/workbench.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Raw Text参数测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await expect(addFileDialog).toBeHidden({ timeout: 10000 });
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
    const rawRadio = contentPage.locator('.el-radio').filter({ hasText: 'raw' });
    await rawRadio.click();
    await contentPage.waitForTimeout(300);
    // 选择Text格式
    const rawTypeSelect = contentPage.getByTestId('raw-body-type-select');
    await rawTypeSelect.click();
    const textPlainOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^text$/ });
    await textPlainOption.click();
    await contentPage.waitForTimeout(300);
    // 输入纯文本内容
    const monacoEditor = contentPage.locator('.s-json-editor').first();
    await monacoEditor.click({ force: true });
    await contentPage.waitForTimeout(300);
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('This is plain text content');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证响应
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.locator('.s-json-editor').first();
    // 验证请求头自动包含Content-Type: text/plain
    await expect(responseBody).toContainText('text/plain', { timeout: 10000 });
    // 验证服务器接收到纯文本内容
    await expect(responseBody).toContainText('This is plain text content', { timeout: 10000 });
  });
  // 测试用例2: raw html参数输入值以后,请求头自动添加contentType:text/html,调用127.0.0.1:{环境变量中的端口}/echo,返回结果参数和请求头正确
  test('raw html参数输入值以后,请求头自动添加contentType:text/html,调用echo接口返回结果参数和请求头正确', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/workbench.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Raw HTML参数测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await expect(addFileDialog).toBeHidden({ timeout: 10000 });
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
    const rawRadio = contentPage.locator('.el-radio').filter({ hasText: 'raw' });
    await rawRadio.click();
    await contentPage.waitForTimeout(300);
    // 选择HTML格式
    const rawTypeSelect = contentPage.getByTestId('raw-body-type-select');
    await rawTypeSelect.click();
    const textHtmlOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^html$/ });
    await textHtmlOption.click();
    await contentPage.waitForTimeout(300);
    // 输入HTML内容
    const monacoEditor = contentPage.locator('.s-json-editor').first();
    await monacoEditor.click({ force: true });
    await contentPage.waitForTimeout(300);
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('<html><body>Hello World</body></html>');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证响应
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.locator('.s-json-editor').first();
    // 验证请求头自动包含Content-Type: text/html
    await expect(responseBody).toContainText('text/html', { timeout: 10000 });
    // 验证服务器接收到HTML内容
    await expect(responseBody).toContainText('html', { timeout: 10000 });
    await expect(responseBody).toContainText('body', { timeout: 10000 });
    await expect(responseBody).toContainText('Hello World', { timeout: 10000 });
  });
  // 测试用例3: raw xml参数输入值以后,请求头自动添加contentType:application/xml,调用127.0.0.1:{环境变量中的端口}/echo,返回结果参数和请求头正确
  test('raw xml参数输入值以后,请求头自动添加contentType:application/xml,调用echo接口返回结果参数和请求头正确', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/workbench.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Raw XML参数测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await expect(addFileDialog).toBeHidden({ timeout: 10000 });
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
    const rawRadio = contentPage.locator('.el-radio').filter({ hasText: 'raw' });
    await rawRadio.click();
    await contentPage.waitForTimeout(300);
    // 选择XML格式
    const rawTypeSelect = contentPage.getByTestId('raw-body-type-select');
    await rawTypeSelect.click();
    const xmlOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^xml$/ });
    await xmlOption.click();
    await contentPage.waitForTimeout(300);
    // 输入XML内容
    const monacoEditor = contentPage.locator('.s-json-editor').first();
    await monacoEditor.click({ force: true });
    await contentPage.waitForTimeout(300);
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('<?xml version="1.0"?><root><item>test</item></root>');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证响应
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.locator('.s-json-editor').first();
    // 验证请求头自动包含Content-Type: application/xml
    await expect(responseBody).toContainText('application/xml', { timeout: 10000 });
    // 验证服务器接收到正确的XML数据
    await expect(responseBody).toContainText('xml', { timeout: 10000 });
    await expect(responseBody).toContainText('root', { timeout: 10000 });
    await expect(responseBody).toContainText('item', { timeout: 10000 });
    await expect(responseBody).toContainText('test', { timeout: 10000 });
  });
  // 测试用例4: raw javascript参数输入值以后,请求头自动添加contentType:text/javascript,调用127.0.0.1:{环境变量中的端口}/echo,返回结果参数和请求头正确
  test('raw javascript参数输入值以后,请求头自动添加contentType:text/javascript,调用echo接口返回结果参数和请求头正确', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/workbench.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Raw JavaScript参数测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await expect(addFileDialog).toBeHidden({ timeout: 10000 });
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
    const rawRadio = contentPage.locator('.el-radio').filter({ hasText: 'raw' });
    await rawRadio.click();
    await contentPage.waitForTimeout(300);
    // 选择JavaScript格式
    const rawTypeSelect = contentPage.getByTestId('raw-body-type-select');
    await rawTypeSelect.click();
    const javascriptOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^javascript$/ });
    await javascriptOption.click();
    await contentPage.waitForTimeout(300);
    // 输入JavaScript代码
    const monacoEditor = contentPage.locator('.s-json-editor').first();
    await monacoEditor.click({ force: true });
    await contentPage.waitForTimeout(300);
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('var x = 123;');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证响应
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.locator('.s-json-editor').first();
    // 验证请求头自动包含Content-Type: text/javascript
    await expect(responseBody).toContainText('text/javascript', { timeout: 10000 });
    // 验证服务器接收到JavaScript代码
    await expect(responseBody).toContainText('var x = 123', { timeout: 10000 });
  });
  // 测试用例5: raw 参数(text,html,xml,json格式)无任何值,请求头不自动添加,调用127.0.0.1:{环境变量中的端口}/echo,返回结果参数和请求头正确
  test('raw参数无任何值时,请求头不自动添加Content-Type,调用echo接口返回正确', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/workbench.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Raw空值参数测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await expect(addFileDialog).toBeHidden({ timeout: 10000 });
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
    const rawRadio = contentPage.locator('.el-radio').filter({ hasText: 'raw' });
    await rawRadio.click();
    await contentPage.waitForTimeout(300);
    // 选择Text格式但不输入任何内容
    const rawTypeSelect = contentPage.getByTestId('raw-body-type-select');
    await rawTypeSelect.click();
    const textPlainOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^text$/ });
    await textPlainOption.click();
    await contentPage.waitForTimeout(300);
    // 不在编辑器中输入任何内容(保持为空)
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证响应
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.locator('.s-json-editor').first();
    // 验证请求成功返回
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证服务器接收到空的body
    await expect(responseBody).toContainText('body', { timeout: 10000 });
  });
});
