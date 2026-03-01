import { test, expect } from '../../../../../fixtures/electron-online.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('Variable', () => {
  test('打开变量管理页面显示新增表单与变量列表', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 从工具栏更多菜单进入变量管理页
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const variableOption = contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ });
    await variableOption.click();
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    await expect(variablePage.locator('.left')).toBeVisible({ timeout: 5000 });
    await expect(variablePage.locator('.right')).toBeVisible({ timeout: 5000 });
  });
  test('新增 string 类型变量成功', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 新增 string 变量并校验列表展示
    await contentPage.locator('[data-testid="banner-tool-more-btn"]').click();
    await contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ }).click();
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    await variablePage.locator('.left input').first().fill('testString');
    await variablePage.locator('.left textarea').fill('hello world');
    await variablePage.locator('.left .el-button--primary').click();
    const variableTable = variablePage.locator('.right .el-table');
    await expect(variableTable).toContainText('testString', { timeout: 5000 });
    await expect(variableTable).toContainText('hello world', { timeout: 5000 });
    await expect(variableTable).toContainText('string', { timeout: 5000 });
  });
  test('新增 number 和 boolean 类型变量成功', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 依次新增 number 与 boolean 类型变量
    await contentPage.locator('[data-testid="banner-tool-more-btn"]').click();
    await contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ }).click();
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    await variablePage.locator('.left input').first().fill('testNumber');
    await variablePage.locator('.left .el-select').click();
    await contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'number' }).click();
    await variablePage.locator('.left .el-input-number input').fill('123');
    await variablePage.locator('.left .el-button--primary').click();
    await variablePage.locator('.left input').first().fill('testBoolean');
    await variablePage.locator('.left .el-select').click();
    await contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'boolean' }).click();
    await variablePage.locator('.left .el-radio').first().click();
    await variablePage.locator('.left .el-button--primary').click();
    const variableTable = variablePage.locator('.right .el-table');
    await expect(variableTable).toContainText('testNumber', { timeout: 5000 });
    await expect(variableTable).toContainText('123', { timeout: 5000 });
    await expect(variableTable).toContainText('number', { timeout: 5000 });
    await expect(variableTable).toContainText('testBoolean', { timeout: 5000 });
    await expect(variableTable).toContainText('true', { timeout: 5000 });
    await expect(variableTable).toContainText('boolean', { timeout: 5000 });
  });
  test('新增 null 和 any 类型变量成功', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 新增 null 变量与 any(JavaScript表达式)变量
    await contentPage.locator('[data-testid="banner-tool-more-btn"]').click();
    await contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ }).click();
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const nameInput = variablePage.locator('.left input').first();
    const typeSelect = variablePage.locator('.left .el-select').first();
    const addBtn = variablePage.locator('.left .el-button--primary');
    await nameInput.fill('nullVar');
    await typeSelect.click();
    await contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^null$/ }).click();
    await addBtn.click();
    await nameInput.fill('timestamp');
    await typeSelect.click();
    await contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^any$/ }).click();
    const monacoEditor = variablePage.locator('.left .monaco-editor').first();
    const monacoCount = await monacoEditor.count();
    if (monacoCount > 0) {
      await monacoEditor.click();
      await contentPage.keyboard.press('ControlOrMeta+a');
      await contentPage.keyboard.type('Date.now()');
    }
    await addBtn.click();
    const variableTable = variablePage.locator('.right .el-table');
    await expect(variableTable).toContainText('nullVar', { timeout: 5000 });
    await expect(variableTable).toContainText('null', { timeout: 5000 });
    await expect(variableTable).toContainText('timestamp', { timeout: 5000 });
    await expect(variableTable).toContainText('any', { timeout: 5000 });
  });
  test('重复变量名与空变量名会提示错误', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 校验空名称与重复名称两个错误分支
    await contentPage.locator('[data-testid="banner-tool-more-btn"]').click();
    await contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ }).click();
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const addBtn = variablePage.locator('.left .el-button--primary');
    await addBtn.click();
    await expect(variablePage.locator('.el-form-item__error').first()).toBeVisible({ timeout: 3000 });
    const nameInput = variablePage.locator('.left input').first();
    const valueTextarea = variablePage.locator('.left textarea');
    await nameInput.fill('duplicateVar');
    await valueTextarea.fill('first value');
    await addBtn.click();
    await nameInput.fill('duplicateVar');
    await valueTextarea.fill('second value');
    await addBtn.click();
    await expect(contentPage.locator('.el-message--error')).toBeVisible({ timeout: 3000 });
  });
  test('编辑与删除变量成功', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 先新增变量，再完成编辑与删除闭环
    await contentPage.locator('[data-testid="banner-tool-more-btn"]').click();
    await contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ }).click();
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    await variablePage.locator('.left input').first().fill('editDeleteVar');
    await variablePage.locator('.left textarea').fill('origin');
    await variablePage.locator('.left .el-button--primary').click();
    const targetRow = variablePage.locator('.right .el-table__body-wrapper tr').filter({ hasText: 'editDeleteVar' }).first();
    await targetRow.locator('.el-button').filter({ hasText: /编辑|Edit/ }).first().click();
    const editDialog = contentPage.locator('.el-dialog').filter({ hasText: /修改变量|Edit/ });
    await expect(editDialog).toBeVisible({ timeout: 5000 });
    await editDialog.locator('textarea').fill('updated');
    await editDialog.locator('.el-button--primary').click();
    const variableTable = variablePage.locator('.right .el-table');
    await expect(variableTable).toContainText('updated', { timeout: 5000 });
    await targetRow.locator('.el-button').filter({ hasText: /删除|Delete/ }).first().click();
    const confirmBtn = contentPage.locator('.cl-confirm-footer-right .el-button--primary');
    await expect(confirmBtn).toBeVisible({ timeout: 5000 });
    await confirmBtn.click();
    await expect(variableTable).not.toContainText('editDeleteVar', { timeout: 5000 });
  });
  test('在 URL 与 Body 使用变量时可正确替换，未知变量保留原文本', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 创建变量并在请求里验证替换与未知变量保留
    await contentPage.locator('[data-testid="banner-tool-more-btn"]').click();
    await contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ }).click();
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    await variablePage.locator('.left input').first().fill('baseUrl');
    await variablePage.locator('.left textarea').fill(`http://127.0.0.1:${MOCK_SERVER_PORT}`);
    await variablePage.locator('.left .el-button--primary').click();
    await createNode(contentPage, { nodeType: 'http', name: '变量替换测试节点' });
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]').first();
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    await urlInput.click();
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('{{baseUrl}}/echo');
    const methodSelect = contentPage.locator('[data-testid="method-select"]').first();
    await methodSelect.click();
    await contentPage.getByRole('option', { name: 'POST' }).click();
    await contentPage.locator('[data-testid="http-params-tab-body"]').click();
    await contentPage.locator('.el-radio').filter({ hasText: 'json' }).first().click();
    const jsonTip = contentPage.locator('.json-tip');
    const jsonTipVisible = await jsonTip.isVisible().catch(() => false);
    if (jsonTipVisible) {
      await jsonTip.locator('.no-tip').click();
      await expect(jsonTip).toBeHidden({ timeout: 5000 });
    }
    const jsonEditor = contentPage.locator('.s-json-editor').first();
    await jsonEditor.click();
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('{"resolved":"{{baseUrl}}","unresolved":"{{notExistVar}}"}');
    await contentPage.locator('[data-testid="operation-send-btn"]').click();
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
    await expect(responseTabs).toContainText(`127.0.0.1:${MOCK_SERVER_PORT}`, { timeout: 10000 });
    await expect(responseTabs).toContainText('{{notExistVar}}', { timeout: 10000 });
  });
});
