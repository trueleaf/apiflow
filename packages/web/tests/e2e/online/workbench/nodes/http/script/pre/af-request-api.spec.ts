import { test, expect } from '../../../../../../../fixtures/electron-online.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('AfRequestApi', () => {
  // 前置脚本改写 URL 后应命中可用地址并返回成功响应
  test('使用af.request.prefix修改请求前缀', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 创建 HTTP 节点并写入初始无效地址
    await createNode(contentPage, { nodeType: 'http', name: 'af.request.prefix测试' });
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]').first();
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    await urlInput.click();
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('http://invalid-host.local/echo');
    // 写入前置脚本覆盖请求 URL
    await contentPage.locator('[data-testid="http-params-tab-prescript"]').click();
    const editor = contentPage.locator('.s-monaco-editor .monaco-editor textarea, .s-monaco-editor textarea, .s-monaco-editor').first();
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click({ force: true });
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type(`af.request.url = "http://127.0.0.1:${MOCK_SERVER_PORT}/echo";`);
    await contentPage.locator('[data-testid="operation-send-btn"]').click();
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 15000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 15000 });
    await expect(contentPage.locator('[data-testid="response-tabs"]')).toContainText('127.0.0.1', { timeout: 15000 });
  });
  // 前置脚本修改 path 后应命中新路径
  test('使用af.request.path修改请求路径', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 创建 HTTP 节点并配置原始 URL
    await createNode(contentPage, { nodeType: 'http', name: 'af.request.path测试' });
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]').first();
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    await urlInput.click();
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type(`http://127.0.0.1:${MOCK_SERVER_PORT}/original-path`);
    // 写入前置脚本覆盖请求路径
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
  // 前置脚本写入 headers 后响应回显应包含新增请求头
  test('使用af.request.headers修改请求头', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 创建 HTTP 节点并设置请求地址
    await createNode(contentPage, { nodeType: 'http', name: 'af.request.headers测试' });
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]').first();
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    await urlInput.click();
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 写入前置脚本新增请求头
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
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toContainText(/x-custom-header/i, { timeout: 15000 });
    await expect(responseTabs).toContainText('custom-value-123', { timeout: 15000 });
  });
  // 前置脚本修改 query 参数后回显应包含新值
  test('使用af.request.queryParams修改Query参数', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 创建 HTTP 节点并设置初始 query
    await createNode(contentPage, { nodeType: 'http', name: 'af.request.queryParams测试' });
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]').first();
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    await urlInput.click();
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?page=1`);
    // 写入前置脚本修改并新增 query 参数
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
  // 前置脚本修改 path 参数后回显应命中新路径值
  test('使用af.request.pathParams获取并修改Path参数', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 创建 HTTP 节点并配置路径参数 URL
    await createNode(contentPage, { nodeType: 'http', name: 'af.request.pathParams测试' });
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]').first();
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    await urlInput.click();
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo/users/{userId}`);
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
    // 写入前置脚本覆盖路径参数
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
  // 前置脚本修改 JSON body 后响应回显应体现字段变更
  test('使用af.request.body.json修改JSON body', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 创建 HTTP 节点并切换到 POST + JSON body
    await createNode(contentPage, { nodeType: 'http', name: 'af.request.body.json测试' });
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]').first();
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    await urlInput.click();
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
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
    // 写入前置脚本修改 JSON body 字段
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
  // 前置脚本修改 form-data 后响应回显应体现新值
  test('使用af.request.body.formdata修改formdata body', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 创建 HTTP 节点并切换到 POST + form-data
    await createNode(contentPage, { nodeType: 'http', name: 'af.request.body.formdata测试' });
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]').first();
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    await urlInput.click();
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    const methodSelect = contentPage.locator('[data-testid="method-select"]').first();
    await methodSelect.click();
    await contentPage.getByRole('option', { name: 'POST' }).click();
    await contentPage.locator('[data-testid="http-params-tab-body"]').click();
    await contentPage.locator('.el-radio', { hasText: /form-data/i }).first().click();
    // 写入前置脚本修改 form-data 字段
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
  // 前置脚本修改 method 后请求方法应被覆盖
  test('使用af.request.method修改请求方法', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 创建 HTTP 节点并设置默认请求地址
    await createNode(contentPage, { nodeType: 'http', name: 'af.request.method测试' });
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]').first();
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    await urlInput.click();
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 写入前置脚本将方法切到 PUT
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
  // 前置脚本 replaceUrl 后请求地址应整体替换
  test('使用af.request.replaceUrl替换整个URL', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 创建 HTTP 节点并写入初始无效地址
    await createNode(contentPage, { nodeType: 'http', name: 'af.request.replaceUrl测试' });
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]').first();
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    await urlInput.click();
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('http://invalid-host.local/invalid-path');
    // 写入前置脚本调用 replaceUrl
    await contentPage.locator('[data-testid="http-params-tab-prescript"]').click();
    const editor = contentPage.locator('.s-monaco-editor .monaco-editor textarea, .s-monaco-editor textarea, .s-monaco-editor').first();
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click({ force: true });
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type(`af.request.replaceUrl("http://127.0.0.1:${MOCK_SERVER_PORT}/echo?replaced=true&id=123");`);
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
  // 前置脚本临时变量应覆盖环境变量与全局变量
  test('前置脚本临时变量优先级高于环境变量和全局变量', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 新增同名全局变量
    await contentPage.locator('[data-testid="banner-tool-more-btn"]').click();
    await contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ }).click();
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    await variablePage.locator('.left input').first().fill('priorityVar');
    await variablePage.locator('.left textarea').fill('global-value');
    await variablePage.locator('.left .el-button--primary').click();
    await expect(variablePage.locator('.right .el-table')).toContainText('priorityVar', { timeout: 5000 });
    // 新增同名环境变量并设为当前环境
    await contentPage.locator('[data-testid="project-nav-env-trigger"]').click();
    await contentPage.locator('.env-action').filter({ hasText: /环境管理|Environment/ }).click();
    const envDialog = contentPage.locator('.env-manage-dialog');
    await expect(envDialog).toBeVisible({ timeout: 5000 });
    await envDialog.locator('.side-add-btn').click();
    const environmentItem = envDialog.locator('.env-list .env-item').first();
    await expect(environmentItem).toBeVisible({ timeout: 5000 });
    await environmentItem.click();
    await envDialog.locator('.table-add-btn').click();
    const firstVariableRow = envDialog.locator('.table-wrap tbody tr').first();
    await expect(firstVariableRow).toBeVisible({ timeout: 5000 });
    await firstVariableRow.locator('td').nth(1).locator('input').fill('priorityVar');
    await firstVariableRow.locator('td').nth(2).locator('input').fill('env-value');
    await envDialog.locator('.env-dialog-close').click();
    await expect(envDialog).toBeHidden({ timeout: 10000 });
    // 前置脚本设置同名临时变量并发送请求
    await createNode(contentPage, { nodeType: 'http', name: '前置脚本变量优先级测试' });
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]').first();
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    await urlInput.click();
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?priority={{priorityVar}}`);
    await contentPage.locator('[data-testid="http-params-tab-prescript"]').click();
    const editor = contentPage.locator('.s-monaco-editor .monaco-editor textarea, .s-monaco-editor textarea, .s-monaco-editor').first();
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click({ force: true });
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('af.variables.priorityVar = "request-value";');
    await contentPage.locator('[data-testid="operation-send-btn"]').click();
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 15000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 15000 });
    await expect(contentPage.locator('[data-testid="response-tabs"]')).toContainText('request-value', { timeout: 15000 });
  });
});
