import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('VariableUsage', () => {
  // URL 中使用变量后发送请求应完成变量替换
  test('在url中使用变量语法发送请求时变量被正确替换', async ({ contentPage, clearCache, createProject, createNode, reload }) => {
    await clearCache();
    await reload();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    const nodeId = await createNode(contentPage, { nodeType: 'http', name: 'URL变量替换测试接口' });
    // 打开变量页并新增 baseUrl 变量
    const variableBtn = contentPage.locator('[data-testid="http-params-variable-btn"]').first();
    await variableBtn.click();
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const addPanel = variablePage.locator('.left');
    await addPanel.locator('.el-form-item').filter({ hasText: /变量名称|Variable Name|Name/ }).locator('input').first().fill('baseUrl');
    await addPanel.locator('.el-form-item').filter({ hasText: /变量值|Value/ }).locator('textarea').first().fill(`http://127.0.0.1:${MOCK_SERVER_PORT}`);
    await addPanel.locator('.el-button--primary').filter({ hasText: /确认添加|Add|Confirm/ }).first().click();
    await expect(variablePage.locator('.right')).toContainText('baseUrl', { timeout: 5000 });
    // 回到 HTTP 节点并使用变量地址发起请求
    const createdNode = contentPage.locator(`[data-test-node-id="${nodeId}"]`).first();
    await createdNode.click();
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]').first();
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    await urlInput.fill('{{baseUrl}}/echo');
    await contentPage.locator('[data-testid="operation-send-btn"]').click();
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
    await expect(responseTabs).toContainText('/echo', { timeout: 10000 });
  });
  // Query 参数中使用变量后发送请求应完成变量替换
  test('在query参数中使用变量发送请求时变量被正确替换', async ({ contentPage, clearCache, createProject, createNode, reload }) => {
    await clearCache();
    await reload();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    const nodeId = await createNode(contentPage, { nodeType: 'http', name: 'Query变量替换测试接口' });
    // 打开变量页并新增 userId 变量
    const variableBtn = contentPage.locator('[data-testid="http-params-variable-btn"]').first();
    await variableBtn.click();
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const addPanel = variablePage.locator('.left');
    await addPanel.locator('.el-form-item').filter({ hasText: /变量名称|Variable Name|Name/ }).locator('input').first().fill('userId');
    await addPanel.locator('.el-form-item').filter({ hasText: /变量值|Value/ }).locator('textarea').first().fill('12345');
    await addPanel.locator('.el-button--primary').filter({ hasText: /确认添加|Add|Confirm/ }).first().click();
    await expect(variablePage.locator('.right')).toContainText('userId', { timeout: 5000 });
    // 回到 HTTP 节点并在 URL Query 位置使用变量
    await contentPage.locator(`[data-test-node-id="${nodeId}"]`).first().click();
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]').first();
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?id={{userId}}`);
    await contentPage.locator('[data-testid="operation-send-btn"]').click();
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
    await expect(responseTabs).toContainText('12345', { timeout: 10000 });
  });
  // Header 参数中使用变量后发送请求应完成变量替换
  test('在header参数中使用变量发送请求时变量被正确替换', async ({ contentPage, clearCache, createProject, createNode, reload }) => {
    await clearCache();
    await reload();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    const nodeId = await createNode(contentPage, { nodeType: 'http', name: 'Header变量替换测试接口' });
    // 打开变量页并新增 authToken 变量
    const variableBtn = contentPage.locator('[data-testid="http-params-variable-btn"]').first();
    await variableBtn.click();
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const addPanel = variablePage.locator('.left');
    await addPanel.locator('.el-form-item').filter({ hasText: /变量名称|Variable Name|Name/ }).locator('input').first().fill('authToken');
    await addPanel.locator('.el-form-item').filter({ hasText: /变量值|Value/ }).locator('textarea').first().fill('Bearer xyz123');
    await addPanel.locator('.el-button--primary').filter({ hasText: /确认添加|Add|Confirm/ }).first().click();
    await expect(variablePage.locator('.right')).toContainText('authToken', { timeout: 5000 });
    // 回到 HTTP 节点并在 Header 中写入变量表达式
    await contentPage.locator(`[data-test-node-id="${nodeId}"]`).first().click();
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]').first();
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    const headersTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await headersTab.click();
    const customHeaderTree = contentPage.locator('.header-info .cl-params-tree').last();
    const headerKeyInput = customHeaderTree.locator('[data-testid="params-tree-key-autocomplete"] input').first();
    await headerKeyInput.click();
    await headerKeyInput.fill('Authorization');
    const headerValueEditor = customHeaderTree.locator('[data-testid="params-tree-value-input"]').first().locator('.cl-rich-input__editor').first();
    await headerValueEditor.click();
    await contentPage.keyboard.type('{{authToken}}');
    await contentPage.locator('[data-testid="operation-send-btn"]').click();
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
    await expect(responseTabs).toContainText('Bearer xyz123', { timeout: 10000 });
  });
  // JSON Body 中使用变量后发送请求应完成变量替换
  test('在body json中使用变量发送请求时变量被正确替换', async ({ contentPage, clearCache, createProject, createNode, reload }) => {
    await clearCache();
    await reload();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    const nodeId = await createNode(contentPage, { nodeType: 'http', name: 'Body变量替换测试接口' });
    // 打开变量页并新增 userName 变量
    const variableBtn = contentPage.locator('[data-testid="http-params-variable-btn"]').first();
    await variableBtn.click();
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const addPanel = variablePage.locator('.left');
    await addPanel.locator('.el-form-item').filter({ hasText: /变量名称|Variable Name|Name/ }).locator('input').first().fill('userName');
    await addPanel.locator('.el-form-item').filter({ hasText: /变量值|Value/ }).locator('textarea').first().fill('John');
    await addPanel.locator('.el-button--primary').filter({ hasText: /确认添加|Add|Confirm/ }).first().click();
    await expect(variablePage.locator('.right')).toContainText('userName', { timeout: 5000 });
    // 回到 HTTP 节点，设置 POST + JSON Body，并写入变量
    await contentPage.locator(`[data-test-node-id="${nodeId}"]`).first().click();
    const methodSelector = contentPage.locator('[data-testid="method-select"]').first();
    await methodSelector.click();
    await contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' }).first().click();
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]').first();
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    const jsonRadio = contentPage.locator('.el-radio').filter({ hasText: /json/i }).first();
    await jsonRadio.click();
    const editorTarget = contentPage.locator('.s-json-editor .monaco-editor textarea, .s-json-editor textarea, .s-json-editor .monaco-editor').first();
    await editorTarget.click({ force: true });
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('{"name":"{{userName}}"}');
    await contentPage.locator('[data-testid="operation-send-btn"]').click();
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
    await expect(responseTabs).toContainText('John', { timeout: 10000 });
  });
  // URL 路径分段中使用变量后应完成路径替换
  test('在URL路径分段中使用变量发送请求时路径参数被正确替换', async ({ contentPage, clearCache, createProject, createNode, reload }) => {
    await clearCache();
    await reload();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    const nodeId = await createNode(contentPage, { nodeType: 'http', name: '路径变量替换测试' });
    // 打开变量页并新增 pathSegment 变量
    const variableBtn = contentPage.locator('[data-testid="http-params-variable-btn"]').first();
    await variableBtn.click();
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const addPanel = variablePage.locator('.left');
    await addPanel.locator('.el-form-item').filter({ hasText: /变量名称|Variable Name|Name/ }).locator('input').first().fill('pathSegment');
    await addPanel.locator('.el-form-item').filter({ hasText: /变量值|Value/ }).locator('textarea').first().fill('users');
    await addPanel.locator('.el-button--primary').filter({ hasText: /确认添加|Add|Confirm/ }).first().click();
    await expect(variablePage.locator('.right')).toContainText('pathSegment', { timeout: 5000 });
    // 回到 HTTP 节点并在 URL 路径段中引用变量
    await contentPage.locator(`[data-test-node-id="${nodeId}"]`).first().click();
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]').first();
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo/{{pathSegment}}`);
    await contentPage.locator('[data-testid="operation-send-btn"]').click();
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
    await expect(responseTabs).toContainText('users', { timeout: 10000 });
  });
  // 变量更新后重发请求应使用新值
  test('修改变量值后重新发送请求使用更新后的值', async ({ contentPage, clearCache, createProject, createNode, reload }) => {
    await clearCache();
    await reload();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    const nodeId = await createNode(contentPage, { nodeType: 'http', name: '变量更新重发测试' });
    // 打开变量页并新增 apiVer 初始值
    const variableBtn = contentPage.locator('[data-testid="http-params-variable-btn"]').first();
    await variableBtn.click();
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const addPanel = variablePage.locator('.left');
    await addPanel.locator('.el-form-item').filter({ hasText: /变量名称|Variable Name|Name/ }).locator('input').first().fill('apiVer');
    await addPanel.locator('.el-form-item').filter({ hasText: /变量值|Value/ }).locator('textarea').first().fill('v1');
    await addPanel.locator('.el-button--primary').filter({ hasText: /确认添加|Add|Confirm/ }).first().click();
    await expect(variablePage.locator('.right')).toContainText('apiVer', { timeout: 5000 });
    // 回到 HTTP 节点发送第一次请求，断言使用 v1
    await contentPage.locator(`[data-test-node-id="${nodeId}"]`).first().click();
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]').first();
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?ver={{apiVer}}`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
    await expect(responseTabs).toContainText('v1', { timeout: 10000 });
    // 通过删除旧变量并新增同名变量，确保请求重新取到新值
    const variableTabNav = contentPage.locator('[data-testid="project-nav-tab-variable"]');
    await variableTabNav.click();
    const table = variablePage.locator('.right .el-table').first();
    const row = table.locator('.el-table__row').filter({ hasText: 'apiVer' }).first();
    await row.locator('button').filter({ hasText: /删除|Delete/ }).first().click();
    const deleteDialog = contentPage.locator('.cl-confirm-container');
    await expect(deleteDialog).toBeVisible({ timeout: 5000 });
    await deleteDialog.locator('.el-button--primary').first().click();
    await expect(deleteDialog).toBeHidden({ timeout: 5000 });
    await expect(table.locator('.el-table__row').filter({ hasText: 'apiVer' })).toHaveCount(0, { timeout: 5000 });
    await addPanel.locator('.el-form-item').filter({ hasText: /变量名称|Variable Name|Name/ }).locator('input').first().fill('apiVer');
    await addPanel.locator('.el-form-item').filter({ hasText: /变量值|Value/ }).locator('textarea').first().fill('v2');
    await addPanel.locator('.el-button--primary').filter({ hasText: /确认添加|Add|Confirm/ }).first().click();
    await expect(variablePage.locator('.right')).toContainText('apiVer', { timeout: 5000 });
    await contentPage.locator(`[data-test-node-id="${nodeId}"]`).first().click();
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?ver={{apiVer}}`);
    await sendBtn.click();
    await expect(responseTabs).toContainText('v2', { timeout: 10000 });
  });
  // 同一请求里 URL 与 Header 同时使用变量应都被替换
  test('同一请求中URL和Header同时使用不同变量均被正确替换', async ({ contentPage, clearCache, createProject, createNode, reload }) => {
    await clearCache();
    await reload();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    const nodeId = await createNode(contentPage, { nodeType: 'http', name: '多变量组合测试' });
    // 打开变量页并新增 queryTag 与 headerVal
    const variableBtn = contentPage.locator('[data-testid="http-params-variable-btn"]').first();
    await variableBtn.click();
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const addPanel = variablePage.locator('.left');
    await addPanel.locator('.el-form-item').filter({ hasText: /变量名称|Variable Name|Name/ }).locator('input').first().fill('queryTag');
    await addPanel.locator('.el-form-item').filter({ hasText: /变量值|Value/ }).locator('textarea').first().fill('multi-test');
    await addPanel.locator('.el-button--primary').filter({ hasText: /确认添加|Add|Confirm/ }).first().click();
    await addPanel.locator('.el-form-item').filter({ hasText: /变量名称|Variable Name|Name/ }).locator('input').first().fill('headerVal');
    await addPanel.locator('.el-form-item').filter({ hasText: /变量值|Value/ }).locator('textarea').first().fill('Bearer combo-abc');
    await addPanel.locator('.el-button--primary').filter({ hasText: /确认添加|Add|Confirm/ }).first().click();
    await expect(variablePage.locator('.right')).toContainText('queryTag', { timeout: 5000 });
    await expect(variablePage.locator('.right')).toContainText('headerVal', { timeout: 5000 });
    // 回到 HTTP 节点并分别在 URL 与 Header 引用变量
    await contentPage.locator(`[data-test-node-id="${nodeId}"]`).first().click();
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]').first();
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?tag={{queryTag}}`);
    const headersTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await headersTab.click();
    const customHeaderTree = contentPage.locator('.header-info .cl-params-tree').last();
    const headerKeyInput = customHeaderTree.locator('[data-testid="params-tree-key-autocomplete"] input').first();
    await headerKeyInput.click();
    await headerKeyInput.fill('X-Multi-Token');
    const headerValueEditor = customHeaderTree.locator('[data-testid="params-tree-value-input"]').first().locator('.cl-rich-input__editor').first();
    await headerValueEditor.click();
    await contentPage.keyboard.type('{{headerVal}}');
    await contentPage.locator('[data-testid="operation-send-btn"]').click();
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
    await expect(responseTabs).toContainText('multi-test', { timeout: 10000 });
    await expect(responseTabs).toContainText('Bearer combo-abc', { timeout: 10000 });
  });
});



