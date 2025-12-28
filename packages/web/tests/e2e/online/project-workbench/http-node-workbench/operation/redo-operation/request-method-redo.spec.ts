import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

test.describe('RequestMethodRedo', () => {
  // 测试用例1: 切换请求方法两次后点击撤销按钮,再点击重做按钮,请求方法恢复到撤销前的状态
  test('切换请求方法两次后点击撤销按钮再点击重做按钮,请求方法恢复到撤销前的状态', async ({ contentPage, clearCache, createProject, loginAccount }) => {
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
    await fileNameInput.fill('请求方法重做按钮测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 初始请求方法为GET,切换为POST
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^POST$/ });
    await expect(postOption).toBeVisible({ timeout: 5000 });
    await postOption.click();
    await contentPage.waitForTimeout(300);
    // 再切换为PUT
    await methodSelect.click();
    const putOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^PUT$/ });
    await expect(putOption).toBeVisible({ timeout: 5000 });
    await putOption.click();
    await contentPage.waitForTimeout(300);
    // 验证请求方法为PUT
    await expect(methodSelect).toContainText('PUT', { timeout: 5000 });
    // 点击撤销按钮
    const undoBtn = contentPage.locator('[data-testid="http-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证撤销后请求方法为POST
    await expect(methodSelect).toContainText('POST', { timeout: 5000 });
    // 点击重做按钮
    const redoBtn = contentPage.locator('[data-testid="http-params-redo-btn"]');
    await redoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证重做后请求方法恢复为PUT
    await expect(methodSelect).toContainText('PUT', { timeout: 5000 });
  });
  // 测试用例2: 切换请求方法两次后按ctrl+z,再按ctrl+shift+z,请求方法恢复到撤销前的状态
  test('切换请求方法两次后按ctrl+z再按ctrl+shift+z,请求方法恢复到撤销前的状态', async ({ contentPage, clearCache, createProject, loginAccount }) => {
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
    await fileNameInput.fill('请求方法重做快捷键测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 初始请求方法为GET,切换为POST
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^POST$/ });
    await expect(postOption).toBeVisible({ timeout: 5000 });
    await postOption.click();
    await contentPage.waitForTimeout(300);
    // 再切换为PUT
    await methodSelect.click();
    const putOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^PUT$/ });
    await expect(putOption).toBeVisible({ timeout: 5000 });
    await putOption.click();
    await contentPage.waitForTimeout(300);
    // 验证请求方法为PUT
    await expect(methodSelect).toContainText('PUT', { timeout: 5000 });
    // 按ctrl+z快捷键撤销
    await contentPage.keyboard.press('Control+z');
    await contentPage.waitForTimeout(300);
    // 验证撤销后请求方法为POST
    await expect(methodSelect).toContainText('POST', { timeout: 5000 });
    // 按ctrl+shift+z快捷键重做
    await contentPage.keyboard.press('Control+y');
    await contentPage.waitForTimeout(300);
    // 验证重做后请求方法恢复为PUT
    await expect(methodSelect).toContainText('PUT', { timeout: 5000 });
  });
});
