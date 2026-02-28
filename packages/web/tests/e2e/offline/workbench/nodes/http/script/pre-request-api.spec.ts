import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('AfRequestApi', () => {
  // 前置脚本修改 path 后，请求应命中新的路径
  test('使用af.request.path修改请求路径', async ({ contentPage, clearCache, createProject, createNode, reload }) => {
    await clearCache();
    await reload();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 创建HTTP节点并配置原始URL
    await createNode(contentPage, { nodeType: 'http', name: 'af.request.path测试' });
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]').first();
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/original-path`);
    // 编写前置脚本覆盖请求路径
    await contentPage.locator('[data-testid="http-params-tab-prescript"]').click();
    const editor = contentPage.locator('.s-monaco-editor .monaco-editor textarea, .s-monaco-editor textarea, .s-monaco-editor').first();
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click({ force: true });
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('af.request.path = "/echo";');
    await contentPage.locator('[data-testid="operation-send-btn"]').click();
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 15000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 15000 });
    await expect(contentPage.locator('[data-testid="response-tabs"]')).toContainText('/echo', { timeout: 15000 });
  });
  // 前置脚本写入 headers 后，响应回显应包含新增请求头
  test('使用af.request.headers修改请求头', async ({ contentPage, clearCache, createProject, createNode, reload }) => {
    await clearCache();
    await reload();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 创建HTTP节点并设置请求地址
    await createNode(contentPage, { nodeType: 'http', name: 'af.request.headers测试' });
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]').first();
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 编写前置脚本新增自定义请求头
    await contentPage.locator('[data-testid="http-params-tab-prescript"]').click();
    const editor = contentPage.locator('.s-monaco-editor .monaco-editor textarea, .s-monaco-editor textarea, .s-monaco-editor').first();
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click({ force: true });
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('af.request.headers["X-Custom-Header"] = "custom-value-123";');
    await contentPage.locator('[data-testid="operation-send-btn"]').click();
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 15000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 15000 });
    await expect(contentPage.locator('[data-testid="response-tabs"]')).toContainText(/x-custom-header/i, { timeout: 15000 });
    await expect(contentPage.locator('[data-testid="response-tabs"]')).toContainText('custom-value-123', { timeout: 15000 });
  });
  // 前置脚本修改 queryParams 后，请求参数应变更
  test('使用af.request.queryParams修改Query参数', async ({ contentPage, clearCache, createProject, createNode, reload }) => {
    await clearCache();
    await reload();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 创建HTTP节点并写入初始query
    await createNode(contentPage, { nodeType: 'http', name: 'af.request.queryParams测试' });
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]').first();
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?page=1`);
    // 编写前置脚本修改与新增query参数
    await contentPage.locator('[data-testid="http-params-tab-prescript"]').click();
    const editor = contentPage.locator('.s-monaco-editor .monaco-editor textarea, .s-monaco-editor textarea, .s-monaco-editor').first();
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click({ force: true });
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('af.request.queryParams["page"] = "999";\naf.request.queryParams["newParam"] = "newValue";');
    await contentPage.locator('[data-testid="operation-send-btn"]').click();
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 15000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 15000 });
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toContainText('999', { timeout: 15000 });
    await expect(responseTabs).toContainText('newParam', { timeout: 15000 });
    await expect(responseTabs).toContainText('newValue', { timeout: 15000 });
  });
  // 前置脚本修改 pathParams 后，请求路径参数应变更
  test('使用af.request.pathParams修改Path参数', async ({ contentPage, clearCache, createProject, createNode, reload }) => {
    await clearCache();
    await reload();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 创建HTTP节点并设置路径参数URL
    await createNode(contentPage, { nodeType: 'http', name: 'af.request.pathParams测试' });
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]').first();
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo/users/{userId}`);
    await contentPage.locator('[data-testid="http-params-tab-params"]').click();
    const pathParamsArea = contentPage.locator('.query-path-params');
    await expect(pathParamsArea).toBeVisible({ timeout: 5000 });
    const pathParamsInputs = contentPage.locator('.query-path-params .cl-params-tree').last().locator('[data-testid="params-tree-value-input"]');
    const userIdInput = pathParamsInputs.first();
    const userIdInputVisible = await userIdInput.isVisible({ timeout: 500 }).catch(() => false);
    if (userIdInputVisible) {
      await userIdInput.click();
      await contentPage.keyboard.type('123');
    }
    // 编写前置脚本覆盖路径参数
    await contentPage.locator('[data-testid="http-params-tab-prescript"]').click();
    const editor = contentPage.locator('.s-monaco-editor .monaco-editor textarea, .s-monaco-editor textarea, .s-monaco-editor').first();
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click({ force: true });
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('af.request.pathParams["userId"] = "999";');
    await contentPage.locator('[data-testid="operation-send-btn"]').click();
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 15000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 15000 });
    await expect(contentPage.locator('[data-testid="response-tabs"]')).toContainText('999', { timeout: 15000 });
  });
  // 前置脚本修改 body.json 后，响应回显应体现变更字段
  test('使用af.request.body.json修改JSON body', async ({ contentPage, clearCache, createProject, createNode, reload }) => {
    await clearCache();
    await reload();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 创建HTTP节点并切换到POST + JSON
    await createNode(contentPage, { nodeType: 'http', name: 'af.request.body.json测试' });
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]').first();
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    const methodSelect = contentPage.locator('[data-testid="method-select"]').first();
    await methodSelect.click();
    await contentPage.getByRole('option', { name: 'POST' }).click();
    await contentPage.locator('[data-testid="http-params-tab-body"]').click();
    await contentPage.locator('.el-radio', { hasText: /json/i }).first().click();
    const jsonEditor = contentPage.locator('.s-json-editor .monaco-editor textarea, .s-json-editor textarea, .s-json-editor .monaco-editor').first();
    await expect(jsonEditor).toBeVisible({ timeout: 5000 });
    await jsonEditor.click({ force: true });
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('{"username":"olduser","email":"old@test.com"}');
    // 编写前置脚本修改JSON body
    await contentPage.locator('[data-testid="http-params-tab-prescript"]').click();
    const editor = contentPage.locator('.s-monaco-editor .monaco-editor textarea, .s-monaco-editor textarea, .s-monaco-editor').first();
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click({ force: true });
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('af.request.body.json.username = "newuser";\naf.request.body.json.newField = "addedValue";');
    await contentPage.locator('[data-testid="operation-send-btn"]').click();
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 15000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 15000 });
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toContainText('newuser', { timeout: 15000 });
    await expect(responseTabs).toContainText('newField', { timeout: 15000 });
    await expect(responseTabs).toContainText('addedValue', { timeout: 15000 });
  });
  // 前置脚本修改 body.formdata 后，响应回显应体现新值
  test('使用af.request.body.formdata修改formdata body', async ({ contentPage, clearCache, createProject, createNode, reload }) => {
    await clearCache();
    await reload();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 创建HTTP节点并切换到POST + form-data
    await createNode(contentPage, { nodeType: 'http', name: 'af.request.body.formdata测试' });
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]').first();
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    const methodSelect = contentPage.locator('[data-testid="method-select"]').first();
    await methodSelect.click();
    await contentPage.getByRole('option', { name: 'POST' }).click();
    await contentPage.locator('[data-testid="http-params-tab-body"]').click();
    await contentPage.locator('.el-radio', { hasText: /form-data/i }).first().click();
    // 编写前置脚本修改form-data字段
    await contentPage.locator('[data-testid="http-params-tab-prescript"]').click();
    const editor = contentPage.locator('.s-monaco-editor .monaco-editor textarea, .s-monaco-editor textarea, .s-monaco-editor').first();
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click({ force: true });
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('af.request.body.formdata["fieldname"] = "newvalue-from-script";');
    await contentPage.locator('[data-testid="operation-send-btn"]').click();
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 15000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 15000 });
    await expect(contentPage.locator('[data-testid="response-tabs"]')).toContainText('newvalue-from-script', { timeout: 15000 });
  });
  // 前置脚本修改 method 后，请求方法应变更
  test('使用af.request.method修改请求方法', async ({ contentPage, clearCache, createProject, createNode, reload }) => {
    await clearCache();
    await reload();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 创建HTTP节点并设置请求地址
    await createNode(contentPage, { nodeType: 'http', name: 'af.request.method测试' });
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]').first();
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 编写前置脚本将方法改为PUT
    await contentPage.locator('[data-testid="http-params-tab-prescript"]').click();
    const editor = contentPage.locator('.s-monaco-editor .monaco-editor textarea, .s-monaco-editor textarea, .s-monaco-editor').first();
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click({ force: true });
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('af.request.method = "PUT";');
    await contentPage.locator('[data-testid="operation-send-btn"]').click();
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 15000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 15000 });
    await expect(contentPage.locator('[data-testid="response-tabs"]')).toContainText('PUT', { timeout: 15000 });
  });
  // 前置脚本替换整个 URL 后，请求应使用新地址
  test('使用af.request.url替换整个URL', async ({ contentPage, clearCache, createProject, createNode, reload }) => {
    await clearCache();
    await reload();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 创建HTTP节点并写入初始无效URL
    await createNode(contentPage, { nodeType: 'http', name: 'af.request.url测试' });
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]').first();
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    await urlInput.fill('http://invalid-host.local/invalid-path');
    // 编写前置脚本替换完整URL
    await contentPage.locator('[data-testid="http-params-tab-prescript"]').click();
    const editor = contentPage.locator('.s-monaco-editor .monaco-editor textarea, .s-monaco-editor textarea, .s-monaco-editor').first();
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click({ force: true });
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type(`af.request.url = "http://127.0.0.1:${MOCK_SERVER_PORT}/echo?replaced=true&id=123";`);
    await contentPage.locator('[data-testid="operation-send-btn"]').click();
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 15000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 15000 });
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toContainText('/echo', { timeout: 15000 });
    await expect(responseTabs).toContainText('replaced', { timeout: 15000 });
    await expect(responseTabs).toContainText('true', { timeout: 15000 });
    await expect(responseTabs).toContainText('123', { timeout: 15000 });
  });
});
