import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('VariableCrud', () => {
  // 测试用例1: 新增string类型变量,输入变量名和值后保存成功
  test('新增string类型变量保存成功', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('变量CRUD测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 打开变量管理弹窗
    const variableBtn = contentPage.locator('.variable-btn, [data-testid="variable-btn"]').first();
    await variableBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证变量弹窗打开
    const variableDialog = contentPage.locator('.el-dialog, .variable-dialog').filter({ hasText: /变量|Variable/ });
    await expect(variableDialog).toBeVisible({ timeout: 5000 });
    // 点击新增变量按钮
    const addVariableBtn = variableDialog.locator('.el-button').filter({ hasText: /新增|添加|Add/ }).first();
    await addVariableBtn.click();
    await contentPage.waitForTimeout(300);
    // 输入变量名
    const variableNameInput = variableDialog.locator('input').filter({ hasNotText: /value/ }).first();
    await variableNameInput.fill('testString');
    // 输入变量值
    const variableValueInput = variableDialog.locator('input').nth(1);
    await variableValueInput.fill('hello world');
    await contentPage.waitForTimeout(200);
    // 保存变量
    const saveVariableBtn = variableDialog.locator('.el-button--primary').filter({ hasText: /保存|确定|Save|OK/ }).first();
    await saveVariableBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证变量添加成功
    await expect(variableDialog).toContainText('testString', { timeout: 5000 });
  });
  // 测试用例2: 新增number类型变量,输入变量名和数字值后保存成功
  test('新增number类型变量保存成功', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('数字变量测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 打开变量管理弹窗
    const variableBtn = contentPage.locator('.variable-btn, [data-testid="variable-btn"]').first();
    await variableBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证变量弹窗打开
    const variableDialog = contentPage.locator('.el-dialog, .variable-dialog').filter({ hasText: /变量|Variable/ });
    await expect(variableDialog).toBeVisible({ timeout: 5000 });
    // 点击新增变量按钮
    const addVariableBtn = variableDialog.locator('.el-button').filter({ hasText: /新增|添加|Add/ }).first();
    await addVariableBtn.click();
    await contentPage.waitForTimeout(300);
    // 选择变量类型为number
    const typeSelect = variableDialog.locator('.el-select').first();
    await typeSelect.click();
    await contentPage.waitForTimeout(200);
    const numberOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /number|数字/ }).first();
    await numberOption.click();
    await contentPage.waitForTimeout(200);
    // 输入变量名
    const variableNameInput = variableDialog.locator('input').first();
    await variableNameInput.fill('testNumber');
    // 输入数字值
    const variableValueInput = variableDialog.locator('input').nth(1);
    await variableValueInput.fill('12345');
    await contentPage.waitForTimeout(200);
    // 保存变量
    const saveVariableBtn = variableDialog.locator('.el-button--primary').filter({ hasText: /保存|确定|Save|OK/ }).first();
    await saveVariableBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证变量添加成功
    await expect(variableDialog).toContainText('testNumber', { timeout: 5000 });
  });
  // 测试用例3: 修改已存在变量的值,保存后变量值更新
  test('修改已存在变量的值保存后更新', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('变量修改测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 打开变量管理弹窗
    const variableBtn = contentPage.locator('.variable-btn, [data-testid="variable-btn"]').first();
    await variableBtn.click();
    await contentPage.waitForTimeout(300);
    const variableDialog = contentPage.locator('.el-dialog, .variable-dialog').filter({ hasText: /变量|Variable/ });
    await expect(variableDialog).toBeVisible({ timeout: 5000 });
    // 先新增一个变量
    const addVariableBtn = variableDialog.locator('.el-button').filter({ hasText: /新增|添加|Add/ }).first();
    await addVariableBtn.click();
    await contentPage.waitForTimeout(300);
    const variableNameInput = variableDialog.locator('input').first();
    await variableNameInput.fill('testVar');
    const variableValueInput = variableDialog.locator('input').nth(1);
    await variableValueInput.fill('old_value');
    const saveVariableBtn = variableDialog.locator('.el-button--primary').filter({ hasText: /保存|确定|Save|OK/ }).first();
    await saveVariableBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证变量添加成功
    await expect(variableDialog).toContainText('testVar', { timeout: 5000 });
    await expect(variableDialog).toContainText('old_value', { timeout: 5000 });
    // 点击编辑按钮
    const editBtn = variableDialog.locator('.edit-btn, [data-testid="edit-variable"]').first();
    await editBtn.click();
    await contentPage.waitForTimeout(300);
    // 修改变量值
    const editValueInput = variableDialog.locator('input').nth(1);
    await editValueInput.fill('new_value');
    // 保存修改
    const saveEditBtn = variableDialog.locator('.el-button--primary').filter({ hasText: /保存|确定|Save|OK/ }).first();
    await saveEditBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证变量值更新
    await expect(variableDialog).toContainText('new_value', { timeout: 5000 });
  });
  // 测试用例4: 删除变量后,变量从列表中移除
  test('删除变量后从列表中移除', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('变量删除测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 打开变量管理弹窗
    const variableBtn = contentPage.locator('.variable-btn, [data-testid="variable-btn"]').first();
    await variableBtn.click();
    await contentPage.waitForTimeout(300);
    const variableDialog = contentPage.locator('.el-dialog, .variable-dialog').filter({ hasText: /变量|Variable/ });
    await expect(variableDialog).toBeVisible({ timeout: 5000 });
    // 先新增一个变量
    const addVariableBtn = variableDialog.locator('.el-button').filter({ hasText: /新增|添加|Add/ }).first();
    await addVariableBtn.click();
    await contentPage.waitForTimeout(300);
    const variableNameInput = variableDialog.locator('input').first();
    await variableNameInput.fill('toDelete');
    const variableValueInput = variableDialog.locator('input').nth(1);
    await variableValueInput.fill('deleteMe');
    const saveVariableBtn = variableDialog.locator('.el-button--primary').filter({ hasText: /保存|确定|Save|OK/ }).first();
    await saveVariableBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证变量添加成功
    await expect(variableDialog).toContainText('toDelete', { timeout: 5000 });
    // 点击删除按钮
    const deleteBtn = variableDialog.locator('.delete-btn, [data-testid="delete-variable"]').first();
    await deleteBtn.click();
    await contentPage.waitForTimeout(300);
    // 确认删除
    const confirmDeleteBtn = contentPage.locator('.el-button--primary').filter({ hasText: /确定|确认|OK|Yes/ }).last();
    await confirmDeleteBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证变量已删除
    await expect(variableDialog).not.toContainText('toDelete', { timeout: 5000 });
  });
});
