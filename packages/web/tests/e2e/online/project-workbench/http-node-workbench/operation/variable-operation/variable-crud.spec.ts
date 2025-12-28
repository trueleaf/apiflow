import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

test.describe('VariableCrud', () => {
  // 测试用例1: 新增string类型变量,输入变量名和值后保存成功
  test('新增string类型变量保存成功', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('变量CRUD测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 打开变量管理页签
    const variableBtn = contentPage.locator('[data-testid="http-params-variable-btn"]').first();
    await variableBtn.click();
    await contentPage.waitForTimeout(300);
    const variableTab = contentPage.locator('[data-testid="project-nav-tab-variable"]');
    await expect(variableTab).toHaveClass(/active/, { timeout: 5000 });
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const addPanel = variablePage.locator('.left');
    const nameFormItem = addPanel.locator('.el-form-item').filter({ hasText: /变量名称|Variable Name|Name/ });
    await nameFormItem.locator('input').first().fill('testString');
    const valueFormItem = addPanel.locator('.el-form-item').filter({ hasText: /变量值|Value/ });
    await valueFormItem.locator('textarea').first().fill('hello world');
    const confirmAddBtn2 = addPanel.locator('.el-button--primary').filter({ hasText: /确认添加|Add|Confirm/ }).first();
    await confirmAddBtn2.click();
    await contentPage.waitForTimeout(500);
    await expect(variablePage.locator('.right')).toContainText('testString', { timeout: 5000 });
  });
  // 测试用例2: 新增number类型变量,输入变量名和数字值后保存成功
  test('新增number类型变量保存成功', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('数字变量测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 打开变量管理页签
    const variableBtn = contentPage.locator('[data-testid="http-params-variable-btn"]').first();
    await variableBtn.click();
    await contentPage.waitForTimeout(300);
    const variableTab = contentPage.locator('[data-testid="project-nav-tab-variable"]');
    await expect(variableTab).toHaveClass(/active/, { timeout: 5000 });
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const addPanel = variablePage.locator('.left');
    const typeFormItem = addPanel.locator('.el-form-item').filter({ hasText: /值类型|Type/ });
    await typeFormItem.locator('.el-select').first().click();
    await contentPage.waitForTimeout(200);
    const numberOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'number' }).first();
    await numberOption.click();
    await contentPage.waitForTimeout(200);
    const nameFormItem = addPanel.locator('.el-form-item').filter({ hasText: /变量名称|Variable Name|Name/ });
    await nameFormItem.locator('input').first().fill('testNumber');
    const valueFormItem = addPanel.locator('.el-form-item').filter({ hasText: /变量值|Value/ });
    await valueFormItem.locator('input').first().fill('12345');
    const confirmAddBtn2 = addPanel.locator('.el-button--primary').filter({ hasText: /确认添加|Add|Confirm/ }).first();
    await confirmAddBtn2.click();
    await contentPage.waitForTimeout(500);
    await expect(variablePage.locator('.right')).toContainText('testNumber', { timeout: 5000 });
  });
  // 测试用例3: 修改已存在变量的值,保存后变量值更新
  test('修改已存在变量的值保存后更新', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('变量修改测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 打开变量管理页签
    const variableBtn = contentPage.locator('[data-testid="http-params-variable-btn"]').first();
    await variableBtn.click();
    await contentPage.waitForTimeout(300);
    const variableTab = contentPage.locator('[data-testid="project-nav-tab-variable"]');
    await expect(variableTab).toHaveClass(/active/, { timeout: 5000 });
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const addPanel = variablePage.locator('.left');
    const nameFormItem = addPanel.locator('.el-form-item').filter({ hasText: /变量名称|Variable Name|Name/ });
    await nameFormItem.locator('input').first().fill('testVar');
    const valueFormItem = addPanel.locator('.el-form-item').filter({ hasText: /变量值|Value/ });
    await valueFormItem.locator('textarea').first().fill('old_value');
    const confirmAddBtn2 = addPanel.locator('.el-button--primary').filter({ hasText: /确认添加|Add|Confirm/ }).first();
    await confirmAddBtn2.click();
    await contentPage.waitForTimeout(500);
    await expect(variablePage.locator('.right')).toContainText('testVar', { timeout: 5000 });
    await expect(variablePage.locator('.right')).toContainText('old_value', { timeout: 5000 });
    const table = variablePage.locator('.right .el-table').first();
    const row = table.locator('.el-table__row').filter({ hasText: 'testVar' }).first();
    const editBtn = row.locator('button').filter({ hasText: /编辑|Edit/ }).first();
    await editBtn.click();
    await contentPage.waitForTimeout(300);
    const editDialog = contentPage.locator('.el-dialog').filter({ hasText: /修改变量|Edit/ });
    await expect(editDialog).toBeVisible({ timeout: 5000 });
    await editDialog.locator('textarea').first().fill('new_value');
    const confirmEditBtn = editDialog.locator('.el-button--primary').filter({ hasText: /确定|OK|Confirm/ }).first();
    await confirmEditBtn.click();
    await contentPage.waitForTimeout(500);
    await expect(variablePage.locator('.right')).toContainText('new_value', { timeout: 5000 });
  });
  // 测试用例4: 删除变量后,变量从列表中移除
  test('删除变量后从列表中移除', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('变量删除测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 打开变量管理页签
    const variableBtn = contentPage.locator('[data-testid="http-params-variable-btn"]').first();
    await variableBtn.click();
    await contentPage.waitForTimeout(300);
    const variableTab = contentPage.locator('[data-testid="project-nav-tab-variable"]');
    await expect(variableTab).toHaveClass(/active/, { timeout: 5000 });
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const addPanel = variablePage.locator('.left');
    const nameFormItem = addPanel.locator('.el-form-item').filter({ hasText: /变量名称|Variable Name|Name/ });
    await nameFormItem.locator('input').first().fill('toDelete');
    const valueFormItem = addPanel.locator('.el-form-item').filter({ hasText: /变量值|Value/ });
    await valueFormItem.locator('textarea').first().fill('deleteMe');
    const confirmAddBtn2 = addPanel.locator('.el-button--primary').filter({ hasText: /确认添加|Add|Confirm/ }).first();
    await confirmAddBtn2.click();
    await contentPage.waitForTimeout(500);
    await expect(variablePage.locator('.right')).toContainText('toDelete', { timeout: 5000 });
    const table = variablePage.locator('.right .el-table').first();
    const row = table.locator('.el-table__row').filter({ hasText: 'toDelete' }).first();
    const deleteBtn = row.locator('button').filter({ hasText: /删除|Delete/ }).first();
    await deleteBtn.click();
    await contentPage.waitForTimeout(300);
    const confirmDialog = contentPage.locator('.el-message-box').first();
    const confirmDeleteBtn = confirmDialog.locator('.el-button--primary').first();
    await confirmDeleteBtn.click();
    await contentPage.waitForTimeout(500);
    await expect(variablePage.locator('.right')).not.toContainText('toDelete', { timeout: 5000 });
  });
});
