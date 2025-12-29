import { test, expect } from '../../../fixtures/electron-online.fixture';
import fs from 'fs';
import path from 'path';

const MOCK_SERVER_PORT = 3456;

test.describe('Variable', () => {
  test('打开变量管理页面,显示新增变量表单和变量列表', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const variableOption = contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ });
    await variableOption.click();
    await contentPage.waitForTimeout(500);
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const addVariableForm = variablePage.locator('.left');
    await expect(addVariableForm).toBeVisible();
    const variableList = variablePage.locator('.right');
    await expect(variableList).toBeVisible();
  });

  test('新增string类型变量成功,变量列表中显示新增的变量', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const variableOption = contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ });
    await variableOption.click();
    await contentPage.waitForTimeout(500);
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const nameInput = variablePage.locator('.left input').first();
    await nameInput.fill('testString');
    const valueTextarea = variablePage.locator('.left textarea');
    await valueTextarea.fill('hello world');
    const addBtn = variablePage.locator('.left .el-button--primary');
    await addBtn.click();
    await contentPage.waitForTimeout(500);
    const variableTable = variablePage.locator('.right .el-table');
    await expect(variableTable).toContainText('testString');
    await expect(variableTable).toContainText('hello world');
    await expect(variableTable).toContainText('string');
  });

  test('新增number类型变量成功', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const variableOption = contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ });
    await variableOption.click();
    await contentPage.waitForTimeout(500);
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const nameInput = variablePage.locator('.left input').first();
    await nameInput.fill('testNumber');
    const typeSelect = variablePage.locator('.left .el-select');
    await typeSelect.click();
    const numberOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'number' });
    await numberOption.click();
    await contentPage.waitForTimeout(300);
    const numberInput = variablePage.locator('.left .el-input-number input');
    await numberInput.fill('123');
    const addBtn = variablePage.locator('.left .el-button--primary');
    await addBtn.click();
    await contentPage.waitForTimeout(500);
    const variableTable = variablePage.locator('.right .el-table');
    await expect(variableTable).toContainText('testNumber');
    await expect(variableTable).toContainText('123');
    await expect(variableTable).toContainText('number');
  });

  test('新增boolean类型变量成功', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const variableOption = contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ });
    await variableOption.click();
    await contentPage.waitForTimeout(500);
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const nameInput = variablePage.locator('.left input').first();
    await nameInput.fill('testBoolean');
    const typeSelect = variablePage.locator('.left .el-select');
    await typeSelect.click();
    const booleanOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'boolean' });
    await booleanOption.click();
    await contentPage.waitForTimeout(300);
    const trueRadio = variablePage.locator('.left .el-radio').first();
    await trueRadio.click();
    const addBtn = variablePage.locator('.left .el-button--primary');
    await addBtn.click();
    await contentPage.waitForTimeout(500);
    const variableTable = variablePage.locator('.right .el-table');
    await expect(variableTable).toContainText('testBoolean');
    await expect(variableTable).toContainText('true');
    await expect(variableTable).toContainText('boolean');
  });

  test('新增重复变量名显示错误提示', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const variableOption = contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ });
    await variableOption.click();
    await contentPage.waitForTimeout(500);
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const nameInput = variablePage.locator('.left input').first();
    await nameInput.fill('duplicateVar');
    const valueTextarea = variablePage.locator('.left textarea');
    await valueTextarea.fill('first value');
    const addBtn = variablePage.locator('.left .el-button--primary');
    await addBtn.click();
    await contentPage.waitForTimeout(500);
    await nameInput.fill('duplicateVar');
    await valueTextarea.fill('second value');
    await addBtn.click();
    await contentPage.waitForTimeout(500);
    const errorMessage = contentPage.locator('.el-message--error');
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
  });

  test('删除变量成功,变量从列表中移除', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const variableOption = contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ });
    await variableOption.click();
    await contentPage.waitForTimeout(500);
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const nameInput = variablePage.locator('.left input').first();
    await nameInput.fill('toBeDeleted');
    const valueTextarea = variablePage.locator('.left textarea');
    await valueTextarea.fill('delete me');
    const addBtn = variablePage.locator('.left .el-button--primary');
    await addBtn.click();
    await contentPage.waitForTimeout(500);
    const variableTable = variablePage.locator('.right .el-table');
    await expect(variableTable).toContainText('toBeDeleted');
    const deleteBtn = variablePage.locator('.right .el-table .el-button').filter({ hasText: /删除|Delete/ });
    await deleteBtn.click();
    const confirmBtn = contentPage.locator('.el-message-box .el-button--primary');
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    await expect(variableTable).not.toContainText('toBeDeleted');
  });

  test('编辑变量成功,变量值更新', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const variableOption = contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ });
    await variableOption.click();
    await contentPage.waitForTimeout(500);
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const nameInput = variablePage.locator('.left input').first();
    await nameInput.fill('toBeEdited');
    const valueTextarea = variablePage.locator('.left textarea');
    await valueTextarea.fill('original value');
    const addBtn = variablePage.locator('.left .el-button--primary');
    await addBtn.click();
    await contentPage.waitForTimeout(500);
    const editBtn = variablePage.locator('.right .el-table .el-button').filter({ hasText: /编辑|Edit/ });
    await editBtn.click();
    await contentPage.waitForTimeout(300);
    const editDialog = contentPage.locator('.el-dialog').filter({ hasText: /修改变量|Edit/ });
    await expect(editDialog).toBeVisible({ timeout: 5000 });
    const editValueTextarea = editDialog.locator('textarea');
    await editValueTextarea.fill('updated value');
    const confirmBtn = editDialog.locator('.el-button--primary');
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    const variableTable = variablePage.locator('.right .el-table');
    await expect(variableTable).toContainText('updated value');
  });

  test('在请求Body中使用变量,发送请求后变量被正确替换', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const variableOption = contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ });
    await variableOption.click();
    await contentPage.waitForTimeout(500);
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const nameInput = variablePage.locator('.left input').first();
    await nameInput.fill('testVar');
    const valueTextarea = variablePage.locator('.left textarea');
    await valueTextarea.fill('variable_value');
    const addBtn = variablePage.locator('.left .el-button--primary');
    await addBtn.click();
    await contentPage.waitForTimeout(500);
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
    await postOption.click();
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    const jsonRadio = contentPage.locator('.el-radio').filter({ hasText: 'json' });
    await jsonRadio.click();
    await contentPage.waitForTimeout(300);
    const jsonTip = contentPage.locator('.json-tip');
    if (await jsonTip.isVisible()) {
      const hideTipBtn = jsonTip.locator('.no-tip');
      await hideTipBtn.click();
      await expect(jsonTip).toBeHidden({ timeout: 5000 });
    }
    const monacoEditor = contentPage.locator('.s-json-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('{"value": "{{testVar}}"}');
    await contentPage.waitForTimeout(300);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('variable_value', { timeout: 10000 });
  });

  test('在请求URL中使用变量,发送请求后变量被正确替换', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const variableOption = contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ });
    await variableOption.click();
    await contentPage.waitForTimeout(500);
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const nameInput = variablePage.locator('.left input').first();
    await nameInput.fill('baseUrl');
    const valueTextarea = variablePage.locator('.left textarea');
    await valueTextarea.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}`);
    const addBtn = variablePage.locator('.left .el-button--primary');
    await addBtn.click();
    await contentPage.waitForTimeout(500);
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('URL变量测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill('{{baseUrl}}/echo');
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('/echo', { timeout: 10000 });
  });

  test('在请求Headers中使用变量,发送请求后变量被正确替换', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const variableOption = contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ });
    await variableOption.click();
    await contentPage.waitForTimeout(500);
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const nameInput = variablePage.locator('.left input').first();
    await nameInput.fill('authToken');
    const valueTextarea = variablePage.locator('.left textarea');
    await valueTextarea.fill('Bearer test-token-123');
    const addBtn = variablePage.locator('.left .el-button--primary');
    await addBtn.click();
    await contentPage.waitForTimeout(500);
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Headers变量测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    const headersTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    const keyInput = contentPage.locator('[data-testid="params-tree-key-autocomplete"] input, [data-testid="params-tree-key-input"] input').first();
    await keyInput.click();
    await keyInput.fill('Authorization');
    const valueInput = contentPage.locator('[data-testid="params-tree-value-input"] .ProseMirror').first();
    await valueInput.click();
    await contentPage.keyboard.type('{{authToken}}');
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('Bearer test-token-123', { timeout: 10000 });
  });

  test('在请求Params(Path/Query)中使用变量,发送请求后变量被正确替换', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const variableOption = contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ });
    await variableOption.click();
    await contentPage.waitForTimeout(500);
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const nameInput = variablePage.locator('.left input').first();
    const valueTextarea = variablePage.locator('.left textarea');
    const addBtn = variablePage.locator('.left .el-button--primary');
    await nameInput.fill('pathUserId');
    await valueTextarea.fill('user_12345');
    await addBtn.click();
    await contentPage.waitForTimeout(300);
    await nameInput.fill('queryKey');
    await valueTextarea.fill('q');
    await addBtn.click();
    await contentPage.waitForTimeout(300);
    await nameInput.fill('queryValue');
    await valueTextarea.fill('hello_query');
    await addBtn.click();
    await contentPage.waitForTimeout(500);
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Params变量测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo/users/{id}`);
    await contentPage.waitForTimeout(500);
    const paramsTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    const pathValueInputs = contentPage.locator('.query-path-params .cl-params-tree').last().locator('[data-testid="params-tree-value-input"]');
    await pathValueInputs.first().click();
    await contentPage.keyboard.type('{{pathUserId}}');
    await contentPage.waitForTimeout(200);
    const queryKeyInput = contentPage.locator('.query-path-params').getByPlaceholder(/输入参数名称自动换行/).first();
    await queryKeyInput.click();
    await queryKeyInput.fill('{{queryKey}}');
    await contentPage.waitForTimeout(200);
    const queryValueInput = contentPage.locator('.query-path-params [contenteditable="true"]').first();
    await queryValueInput.click();
    await queryValueInput.fill('{{queryValue}}');
    await contentPage.waitForTimeout(200);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('/echo/users/user_12345', { timeout: 10000 });
    await expect(responseBody).toContainText('userId', { timeout: 10000 });
    await expect(responseBody).toContainText('user_12345', { timeout: 10000 });
    await expect(responseBody).toContainText('q=hello_query', { timeout: 10000 });
  });

  test('在公共请求头(Common Header)中使用变量,发送请求后变量被正确替换', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const variableOption = contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ });
    await variableOption.click();
    await contentPage.waitForTimeout(500);
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const nameInput = variablePage.locator('.left input').first();
    const valueTextarea = variablePage.locator('.left textarea');
    const addBtn = variablePage.locator('.left .el-button--primary');
    await nameInput.fill('commonHeaderKey');
    await valueTextarea.fill('var');
    await addBtn.click();
    await contentPage.waitForTimeout(300);
    await nameInput.fill('commonHeaderValue');
    await valueTextarea.fill('common-header-value');
    await addBtn.click();
    await contentPage.waitForTimeout(500);
    {
      const closeActiveTabBtn = contentPage.locator('.tab-list .item.active [data-testid="project-nav-tab-close-btn"]');
      if (await closeActiveTabBtn.count()) {
        await closeActiveTabBtn.first().click();
      } else {
        await contentPage.keyboard.press('ControlOrMeta+w');
      }
    }
    await expect(variablePage).toBeHidden({ timeout: 5000 });

    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('公共请求头变量测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);

    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const commonHeaderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /设置公共请求头/ });
    await commonHeaderItem.click();
    await contentPage.waitForTimeout(500);
    const commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('X-Apiflow-{{commonHeaderKey}}');
    await valueInputs.first().click();
    await contentPage.keyboard.type('{{commonHeaderValue}}');
    const confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    await confirmBtn.click();
    await contentPage.waitForTimeout(800);
    {
      const closeActiveTabBtn = contentPage.locator('.tab-list .item.active [data-testid="project-nav-tab-close-btn"]');
      if (await closeActiveTabBtn.count()) {
        await closeActiveTabBtn.first().click();
      } else {
        await contentPage.keyboard.press('ControlOrMeta+w');
      }
    }
    await expect(commonHeaderPage).toBeHidden({ timeout: 5000 });

    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('x-apiflow-var', { timeout: 10000 });
    await expect(responseBody).toContainText('common-header-value', { timeout: 10000 });
  });

  test('在Cookie值中使用变量,发送请求后变量被正确替换', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const variableOption = contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ });
    await variableOption.click();
    await contentPage.waitForTimeout(500);
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const nameInput = variablePage.locator('.left input').first();
    const valueTextarea = variablePage.locator('.left textarea');
    const addBtn = variablePage.locator('.left .el-button--primary');
    await nameInput.fill('cookieValue');
    await valueTextarea.fill('cookie_value_123');
    await addBtn.click();
    await contentPage.waitForTimeout(500);
    {
      const closeActiveTabBtn = contentPage.locator('.tab-list .item.active [data-testid="project-nav-tab-close-btn"]');
      if (await closeActiveTabBtn.count()) {
        await closeActiveTabBtn.first().click();
      } else {
        await contentPage.keyboard.press('ControlOrMeta+w');
      }
    }
    await expect(variablePage).toBeHidden({ timeout: 5000 });

    await moreBtn.click();
    const cookieItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /Cookie管理|Cookies/ });
    await cookieItem.click();
    await contentPage.waitForTimeout(500);
    const cookiePage = contentPage.locator('.cookies-page');
    await expect(cookiePage).toBeVisible({ timeout: 5000 });
    const addCookieBtn = cookiePage.locator('.el-button--primary').filter({ hasText: /新增 Cookie/ });
    await addCookieBtn.click();
    const dialog = contentPage.locator('.el-dialog').filter({ hasText: /新增 Cookie/ });
    await expect(dialog).toBeVisible({ timeout: 5000 });
    const cookieNameInput = dialog.locator('.el-form-item').filter({ hasText: /名称/ }).locator('input');
    await cookieNameInput.fill('var_cookie');
    const cookieValueInput = dialog.locator('.el-form-item').filter({ hasText: /值/ }).locator('textarea');
    await cookieValueInput.fill('{{cookieValue}}');
    const cookieDomainInput = dialog.locator('.el-form-item').filter({ hasText: /域名/ }).locator('input');
    await cookieDomainInput.fill('127.0.0.1');
    const cookiePathInput = dialog.locator('.el-form-item').filter({ hasText: /路径/ }).locator('input');
    await cookiePathInput.fill('/echo');
    const saveBtn = dialog.locator('.el-button--primary').filter({ hasText: /保存/ });
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    await expect(dialog).not.toBeVisible({ timeout: 5000 });
    {
      const closeActiveTabBtn = contentPage.locator('.tab-list .item.active [data-testid="project-nav-tab-close-btn"]');
      if (await closeActiveTabBtn.count()) {
        await closeActiveTabBtn.first().click();
      } else {
        await contentPage.keyboard.press('ControlOrMeta+w');
      }
    }
    await expect(cookiePage).toBeHidden({ timeout: 5000 });

    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Cookie变量测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('var_cookie=cookie_value_123', { timeout: 10000 });
  });

  test('在Raw Body中使用变量,发送请求后变量被正确替换', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const variableOption = contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ });
    await variableOption.click();
    await contentPage.waitForTimeout(500);
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const nameInput = variablePage.locator('.left input').first();
    const valueTextarea = variablePage.locator('.left textarea');
    const addBtn = variablePage.locator('.left .el-button--primary');
    await nameInput.fill('rawBodyVar');
    await valueTextarea.fill('raw_variable_value');
    await addBtn.click();
    await contentPage.waitForTimeout(500);

    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Raw变量测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
    await postOption.click();
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    const rawRadio = contentPage.locator('.el-radio').filter({ hasText: 'raw' });
    await rawRadio.click();
    await contentPage.waitForTimeout(300);
    const rawTypeSelect = contentPage.getByTestId('raw-body-type-select');
    await rawTypeSelect.click();
    const rawTextOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^text$/ });
    await rawTextOption.click();
    await contentPage.waitForTimeout(300);
    const monacoEditor = contentPage.locator('.s-json-editor').first();
    await monacoEditor.click({ force: true });
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('{{rawBodyVar}}');
    await contentPage.waitForTimeout(300);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('raw_variable_value', { timeout: 10000 });
  });

  test('在Urlencoded Body中使用变量,发送请求后变量被正确替换', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const variableOption = contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ });
    await variableOption.click();
    await contentPage.waitForTimeout(500);
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const nameInput = variablePage.locator('.left input').first();
    const valueTextarea = variablePage.locator('.left textarea');
    const addBtn = variablePage.locator('.left .el-button--primary');
    await nameInput.fill('urlencodedVar');
    await valueTextarea.fill('urlencoded_value');
    await addBtn.click();
    await contentPage.waitForTimeout(500);

    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Urlencoded变量测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
    await postOption.click();
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    const urlencodedRadio = contentPage.locator('.el-radio').filter({ hasText: 'urlencoded' });
    await urlencodedRadio.click();
    await contentPage.waitForTimeout(300);
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('v');
    await valueInputs.first().click();
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('{{urlencodedVar}}');
    await contentPage.waitForTimeout(300);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('urlencoded_value', { timeout: 10000 });
  });

  test('在Form-Data Body中使用变量,发送请求后变量被正确替换', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const variableOption = contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ });
    await variableOption.click();
    await contentPage.waitForTimeout(500);
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const nameInput = variablePage.locator('.left input').first();
    const valueTextarea = variablePage.locator('.left textarea');
    const addBtn = variablePage.locator('.left .el-button--primary');
    await nameInput.fill('formDataVar');
    await valueTextarea.fill('formdata_value');
    await addBtn.click();
    await contentPage.waitForTimeout(500);

    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('FormData变量测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
    await postOption.click();
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    const formdataRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^form-data$/i }).locator('.el-radio');
    await formdataRadio.click();
    await contentPage.waitForTimeout(300);
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('v');
    await valueInputs.first().click();
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('{{formDataVar}}');
    await contentPage.waitForTimeout(300);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('formdata_value', { timeout: 10000 });
  });

  test('在Binary(变量模式)中使用变量,发送请求后rawBody等于文件内容', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const testContent = 'test binary content';
    const testFilePath = path.join(process.cwd(), 'temp', `variable-binary-${Date.now()}.txt`);
    const testDir = path.dirname(testFilePath);
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    fs.writeFileSync(testFilePath, testContent);

    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const variableOption = contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ });
    await variableOption.click();
    await contentPage.waitForTimeout(500);
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const nameInput = variablePage.locator('.left input').first();
    const valueTextarea = variablePage.locator('.left textarea');
    const addBtn = variablePage.locator('.left .el-button--primary');
    await nameInput.fill('binaryFilePath');
    await valueTextarea.fill(testFilePath);
    await addBtn.click();
    await contentPage.waitForTimeout(500);

    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Binary变量测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
    await postOption.click();
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    const binaryRadio = contentPage.locator('.body-params .el-radio', { hasText: /binary/i });
    await binaryRadio.click();
    await contentPage.waitForTimeout(300);
    const binaryWrap = contentPage.locator('.binary-wrap');
    const varModeRadio = binaryWrap.locator('.el-radio', { hasText: /变量模式/ });
    await varModeRadio.click();
    await contentPage.waitForTimeout(300);
    const varInput = contentPage.locator('.var-mode .el-input input');
    await varInput.fill('{{binaryFilePath}}');
    await contentPage.waitForTimeout(300);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    const responseText = (await responseBody.textContent()) || '';
    const jsonStartIndex = responseText.indexOf('{');
    const jsonEndIndex = responseText.lastIndexOf('}');
    expect(jsonStartIndex).toBeGreaterThanOrEqual(0);
    expect(jsonEndIndex).toBeGreaterThan(jsonStartIndex);
    const jsonText = responseText.slice(jsonStartIndex, jsonEndIndex + 1).replace(/\u00A0/g, ' ');
    const parsed = JSON.parse(jsonText) as { rawBody?: string };
    expect(parsed.rawBody).toBe(testContent);

    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  test('新增any类型变量执行JavaScript表达式,动态时间戳', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const variableOption = contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ });
    await variableOption.click();
    await contentPage.waitForTimeout(500);
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const nameInput = variablePage.locator('.left input').first();
    await nameInput.fill('timestamp');
    const typeSelect = variablePage.locator('.left .el-select');
    await typeSelect.click();
    const anyOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'any' });
    await anyOption.click();
    await contentPage.waitForTimeout(300);
    const monacoEditor = variablePage.locator('.left .monaco-editor');
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('Date.now()');
    await contentPage.waitForTimeout(300);
    const addBtn = variablePage.locator('.left .el-button--primary');
    await addBtn.click();
    await contentPage.waitForTimeout(500);
    const variableTable = variablePage.locator('.right .el-table');
    await expect(variableTable).toContainText('timestamp');
    await expect(variableTable).toContainText('any');
  });
  test('使用不存在的变量时保留原始文本', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('不存在变量测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
    await postOption.click();
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    const jsonRadio = contentPage.locator('.el-radio').filter({ hasText: 'json' });
    await jsonRadio.click();
    await contentPage.waitForTimeout(300);
    const jsonTip2 = contentPage.locator('.json-tip');
    if (await jsonTip2.isVisible()) {
      const hideTipBtn = jsonTip2.locator('.no-tip');
      await hideTipBtn.click();
      await expect(jsonTip2).toBeHidden({ timeout: 5000 });
    }
    const monacoEditor = contentPage.locator('.s-json-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('{"value": "{{notExistVar}}"}');
    await contentPage.waitForTimeout(300);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('{{notExistVar}}', { timeout: 10000 });
  });
});
