import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('VariableUsage', () => {
  // 测试用例1: 在url中使用{{ 变量名 }}语法,发送请求时变量被正确替换
  test('在url中使用变量语法发送请求时变量被正确替换', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: 'URL变量替换测试接口' });
    // 打开变量管理页签并创建变量
    const variableBtn = contentPage.locator('[data-testid="http-params-variable-btn"]').first();
    await variableBtn.click();
    await contentPage.waitForTimeout(300);
    const variableTab = contentPage.locator('[data-testid="project-nav-tab-variable"]');
    await expect(variableTab).toHaveClass(/active/, { timeout: 5000 });
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const addPanel = variablePage.locator('.left');
    const nameFormItem = addPanel.locator('.el-form-item').filter({ hasText: /变量名称|Variable Name|Name/ });
    await nameFormItem.locator('input').first().fill('baseUrl');
    const valueFormItem = addPanel.locator('.el-form-item').filter({ hasText: /变量值|Value/ });
    await valueFormItem.locator('textarea').first().fill(`http://localhost:${MOCK_SERVER_PORT}`);
    const confirmAddBtn2 = addPanel.locator('.el-button--primary').filter({ hasText: /确认添加|Add|Confirm/ }).first();
    await confirmAddBtn2.click();
    await contentPage.waitForTimeout(500);
    await expect(variablePage.locator('.right')).toContainText('baseUrl', { timeout: 5000 });
    // 切回HTTP节点页签
    const httpTab = contentPage.locator('.nav .item').filter({ hasText: 'URL变量替换测试接口' }).first();
    await httpTab.click();
    await contentPage.waitForTimeout(300);
    // 在url中使用变量
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.fill('{{baseUrl}}/echo');
    await contentPage.waitForTimeout(200);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseTab = contentPage.locator('[data-testid="http-params-tab-response"]');
    await responseTab.click();
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
    const responseEditor = responseTabs.locator('.s-json-editor').first();
    await expect(responseEditor).toBeVisible({ timeout: 10000 });
    await expect(responseTabs).toContainText('/echo', { timeout: 10000 });
  });
  // 测试用例2: 在query参数value中使用变量,发送请求时变量被正确替换
  test('在query参数中使用变量发送请求时变量被正确替换', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: 'Query变量替换测试接口' });
    // 打开变量管理页签并创建变量
    const variableBtn = contentPage.locator('[data-testid="http-params-variable-btn"]').first();
    await variableBtn.click();
    await contentPage.waitForTimeout(300);
    const variableTab = contentPage.locator('[data-testid="project-nav-tab-variable"]');
    await expect(variableTab).toHaveClass(/active/, { timeout: 5000 });
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const addPanel = variablePage.locator('.left');
    const nameFormItem = addPanel.locator('.el-form-item').filter({ hasText: /变量名称|Variable Name|Name/ });
    await nameFormItem.locator('input').first().fill('userId');
    const valueFormItem = addPanel.locator('.el-form-item').filter({ hasText: /变量值|Value/ });
    await valueFormItem.locator('textarea').first().fill('12345');
    const confirmAddBtn2 = addPanel.locator('.el-button--primary').filter({ hasText: /确认添加|Add|Confirm/ }).first();
    await confirmAddBtn2.click();
    await contentPage.waitForTimeout(500);
    await expect(variablePage.locator('.right')).toContainText('userId', { timeout: 5000 });
    // 切回HTTP节点页签
    const httpTab = contentPage.locator('.nav .item').filter({ hasText: 'Query变量替换测试接口' }).first();
    await httpTab.click();
    await contentPage.waitForTimeout(300);
    // 设置URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.fill(`http://localhost:${MOCK_SERVER_PORT}/echo?id={{userId}}`);
    await contentPage.waitForTimeout(200);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseTab = contentPage.locator('[data-testid="http-params-tab-response"]');
    await responseTab.click();
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
    const responseEditor = responseTabs.locator('.s-json-editor').first();
    await expect(responseEditor).toBeVisible({ timeout: 10000 });
    await expect(responseTabs).toContainText('12345', { timeout: 10000 });
  });
  // 测试用例3: 在header参数value中使用变量,发送请求时变量被正确替换
  test('在header参数中使用变量发送请求时变量被正确替换', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: 'Header变量替换测试接口' });
    // 打开变量管理页签并创建变量
    const variableBtn = contentPage.locator('[data-testid="http-params-variable-btn"]').first();
    await variableBtn.click();
    await contentPage.waitForTimeout(300);
    const variableTab = contentPage.locator('[data-testid="project-nav-tab-variable"]');
    await expect(variableTab).toHaveClass(/active/, { timeout: 5000 });
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const addPanel = variablePage.locator('.left');
    const nameFormItem = addPanel.locator('.el-form-item').filter({ hasText: /变量名称|Variable Name|Name/ });
    await nameFormItem.locator('input').first().fill('authToken');
    const valueFormItem = addPanel.locator('.el-form-item').filter({ hasText: /变量值|Value/ });
    await valueFormItem.locator('textarea').first().fill('Bearer xyz123');
    const confirmAddBtn2 = addPanel.locator('.el-button--primary').filter({ hasText: /确认添加|Add|Confirm/ }).first();
    await confirmAddBtn2.click();
    await contentPage.waitForTimeout(500);
    await expect(variablePage.locator('.right')).toContainText('authToken', { timeout: 5000 });
    // 切回HTTP节点页签
    const httpTab = contentPage.locator('.nav .item').filter({ hasText: 'Header变量替换测试接口' }).first();
    await httpTab.click();
    await contentPage.waitForTimeout(300);
    // 设置URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.fill(`http://localhost:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(200);
    // 切换到Headers标签页
    const headersTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    // 添加Authorization header
    const headerInfo = contentPage.locator('.header-info');
    const customHeaderTree = headerInfo.locator('.cl-params-tree').last();
    const headerKeyInput = customHeaderTree.locator('[data-testid="params-tree-key-autocomplete"] input').first();
    await headerKeyInput.click();
    await headerKeyInput.fill('Authorization');
    await contentPage.waitForTimeout(200);
    const headerValueWrap = customHeaderTree.locator('[data-testid="params-tree-value-input"]').first();
    const headerValueEditor = headerValueWrap.locator('.cl-rich-input__editor').first();
    await headerValueEditor.click();
    await contentPage.keyboard.type('{{authToken}}');
    await contentPage.waitForTimeout(200);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseTab = contentPage.locator('[data-testid="http-params-tab-response"]');
    await responseTab.click();
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
    const responseEditor = responseTabs.locator('.s-json-editor').first();
    await expect(responseEditor).toBeVisible({ timeout: 10000 });
    await expect(responseTabs).toContainText('Bearer xyz123', { timeout: 10000 });
  });
  // 测试用例4: 在body json中使用变量,发送请求时变量被正确替换
  test('在body json中使用变量发送请求时变量被正确替换', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: 'Body变量替换测试接口' });
    // 打开变量管理页签并创建变量
    const variableBtn = contentPage.locator('[data-testid="http-params-variable-btn"]').first();
    await variableBtn.click();
    await contentPage.waitForTimeout(300);
    const variableTab = contentPage.locator('[data-testid="project-nav-tab-variable"]');
    await expect(variableTab).toHaveClass(/active/, { timeout: 5000 });
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const addPanel = variablePage.locator('.left');
    const nameFormItem = addPanel.locator('.el-form-item').filter({ hasText: /变量名称|Variable Name|Name/ });
    await nameFormItem.locator('input').first().fill('userName');
    const valueFormItem = addPanel.locator('.el-form-item').filter({ hasText: /变量值|Value/ });
    await valueFormItem.locator('textarea').first().fill('John');
    const confirmAddBtn2 = addPanel.locator('.el-button--primary').filter({ hasText: /确认添加|Add|Confirm/ }).first();
    await confirmAddBtn2.click();
    await contentPage.waitForTimeout(500);
    await expect(variablePage.locator('.right')).toContainText('userName', { timeout: 5000 });
    // 切回HTTP节点页签
    const httpTab = contentPage.locator('.nav .item').filter({ hasText: 'Body变量替换测试接口' }).first();
    await httpTab.click();
    await contentPage.waitForTimeout(300);
    // 切换请求方法为POST
    const methodSelector = contentPage.locator('[data-testid="method-select"]').first();
    await methodSelector.click();
    await contentPage.waitForTimeout(200);
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' }).first();
    await postOption.click();
    await contentPage.waitForTimeout(300);
    // 设置URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.fill(`http://localhost:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(200);
    // 切换到Body标签页
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择JSON类型
    const jsonRadio = contentPage.locator('.el-radio').filter({ hasText: /json/i });
    await jsonRadio.click();
    await contentPage.waitForTimeout(300);
    // 输入JSON body
    const bodyEditor = contentPage.locator('.s-json-editor').first();
    const editorTarget = contentPage.locator('.s-json-editor .monaco-editor textarea, .s-json-editor textarea, .s-json-editor .monaco-editor, .s-json-editor').first();
    await editorTarget.click({ force: true });
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('{"name": "{{userName}}"}');
    await contentPage.waitForTimeout(200);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseTab = contentPage.locator('[data-testid="http-params-tab-response"]');
    await responseTab.click();
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
    const responseEditor = responseTabs.locator('.s-json-editor').first();
    await expect(responseEditor).toBeVisible({ timeout: 10000 });
    await expect(responseTabs).toContainText('John', { timeout: 10000 });
  });
  // 测试用例5: 在URL路径分段中使用变量,发送请求时变量被正确替换
  test('在URL路径分段中使用变量发送请求时变量被正确替换', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await createNode(contentPage, { nodeType: 'http', name: '路径变量替换测试接口' });
    const variableBtn = contentPage.locator('[data-testid="http-params-variable-btn"]').first();
    await variableBtn.click();
    await contentPage.waitForTimeout(300);
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const addPanel = variablePage.locator('.left');
    const nameFormItem = addPanel.locator('.el-form-item').filter({ hasText: /变量名称|Variable Name|Name/ });
    await nameFormItem.locator('input').first().fill('userIdPath');
    const valueFormItem = addPanel.locator('.el-form-item').filter({ hasText: /变量值|Value/ });
    await valueFormItem.locator('textarea').first().fill('user_12345');
    const confirmAddBtn = addPanel.locator('.el-button--primary').filter({ hasText: /确认添加|Add|Confirm/ }).first();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const httpTab = contentPage.locator('.nav .item').filter({ hasText: '路径变量替换测试接口' }).first();
    await httpTab.click();
    await contentPage.waitForTimeout(300);
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://localhost:${MOCK_SERVER_PORT}/echo/users/{{userIdPath}}`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
    await expect(responseTabs).toContainText('/echo/users/user_12345', { timeout: 10000 });
  });
  // 测试用例6: 更新变量值后再次发送请求生效最新变量值
  test('更新变量值后再次发送请求生效最新变量值', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await createNode(contentPage, { nodeType: 'http', name: '变量更新重发测试接口' });
    const variableBtn = contentPage.locator('[data-testid="http-params-variable-btn"]').first();
    await variableBtn.click();
    await contentPage.waitForTimeout(300);
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const addPanel = variablePage.locator('.left');
    const nameFormItem = addPanel.locator('.el-form-item').filter({ hasText: /变量名称|Variable Name|Name/ });
    await nameFormItem.locator('input').first().fill('switchVar');
    const valueFormItem = addPanel.locator('.el-form-item').filter({ hasText: /变量值|Value/ });
    await valueFormItem.locator('textarea').first().fill('first_value');
    const confirmAddBtn = addPanel.locator('.el-button--primary').filter({ hasText: /确认添加|Add|Confirm/ }).first();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const httpTab = contentPage.locator('.nav .item').filter({ hasText: '变量更新重发测试接口' }).first();
    await httpTab.click();
    await contentPage.waitForTimeout(300);
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://localhost:${MOCK_SERVER_PORT}/echo?switch={{switchVar}}`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    let responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toContainText('first_value', { timeout: 10000 });
    await variableBtn.click();
    await contentPage.waitForTimeout(300);
    const table = variablePage.locator('.right .el-table').first();
    const row = table.locator('.el-table__row').filter({ hasText: 'switchVar' }).first();
    const editBtn = row.locator('button').filter({ hasText: /编辑|Edit/ }).first();
    await editBtn.click();
    await contentPage.waitForTimeout(300);
    const editDialog = contentPage.locator('.el-dialog').filter({ hasText: /修改变量|Edit/ });
    await expect(editDialog).toBeVisible({ timeout: 5000 });
    await editDialog.locator('textarea').first().fill('second_value');
    const confirmEditBtn = editDialog.locator('.el-button--primary').filter({ hasText: /确定|OK|Confirm/ }).first();
    await confirmEditBtn.click();
    await contentPage.waitForTimeout(500);
    await httpTab.click();
    await contentPage.waitForTimeout(300);
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toContainText('second_value', { timeout: 10000 });
  });
  // 测试用例7: URL和Header混合使用变量发送请求正确替换
  test('URL和Header混合使用变量发送请求正确替换', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await createNode(contentPage, { nodeType: 'http', name: 'URLHeader混合变量测试接口' });
    const variableBtn = contentPage.locator('[data-testid="http-params-variable-btn"]').first();
    await variableBtn.click();
    await contentPage.waitForTimeout(300);
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const addPanel = variablePage.locator('.left');
    let nameFormItem = addPanel.locator('.el-form-item').filter({ hasText: /变量名称|Variable Name|Name/ });
    let valueFormItem = addPanel.locator('.el-form-item').filter({ hasText: /变量值|Value/ });
    let confirmAddBtn = addPanel.locator('.el-button--primary').filter({ hasText: /确认添加|Add|Confirm/ }).first();
    await nameFormItem.locator('input').first().fill('hostVar');
    await valueFormItem.locator('textarea').first().fill('127.0.0.1');
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(300);
    nameFormItem = addPanel.locator('.el-form-item').filter({ hasText: /变量名称|Variable Name|Name/ });
    valueFormItem = addPanel.locator('.el-form-item').filter({ hasText: /变量值|Value/ });
    confirmAddBtn = addPanel.locator('.el-button--primary').filter({ hasText: /确认添加|Add|Confirm/ }).first();
    await nameFormItem.locator('input').first().fill('tokenVar');
    await valueFormItem.locator('textarea').first().fill('Bearer mix_token');
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const httpTab = contentPage.locator('.nav .item').filter({ hasText: 'URLHeader混合变量测试接口' }).first();
    await httpTab.click();
    await contentPage.waitForTimeout(300);
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://{{hostVar}}:${MOCK_SERVER_PORT}/echo?scene=mix`);
    const headersTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    const headerInfo = contentPage.locator('.header-info');
    const customHeaderTree = headerInfo.locator('.cl-params-tree').last();
    const headerKeyInput = customHeaderTree.locator('[data-testid="params-tree-key-autocomplete"] input').first();
    await headerKeyInput.click();
    await headerKeyInput.fill('Authorization');
    const headerValueWrap = customHeaderTree.locator('[data-testid="params-tree-value-input"]').first();
    const headerValueEditor = headerValueWrap.locator('.cl-rich-input__editor').first();
    await headerValueEditor.click();
    await contentPage.keyboard.type('{{tokenVar}}');
    await contentPage.waitForTimeout(300);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
    await expect(responseTabs).toContainText('Bearer mix_token', { timeout: 10000 });
    await expect(responseTabs).toContainText('scene=mix', { timeout: 10000 });
  });
});


