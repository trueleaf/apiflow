import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('RequestMethodUndo', () => {
  // 测试用例1: 切换请求方法两次,点击撤销按钮,请求方法恢复到上一次的状态
  test('切换请求方法后点击撤销按钮恢复', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('请求方法撤销测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证初始请求方法为GET
    const methodSelector = contentPage.locator('[data-testid="method-select"]').first();
    await expect(methodSelector).toContainText('GET', { timeout: 5000 });
    // 切换请求方法为POST
    await methodSelector.click();
    await contentPage.waitForTimeout(200);
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' }).first();
    await postOption.click();
    await contentPage.waitForTimeout(300);
    await expect(methodSelector).toContainText('POST', { timeout: 5000 });
    // 切换请求方法为PUT
    await methodSelector.click();
    await contentPage.waitForTimeout(200);
    const putOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'PUT' }).first();
    await putOption.click();
    await contentPage.waitForTimeout(300);
    await expect(methodSelector).toContainText('PUT', { timeout: 5000 });
    // 点击撤销按钮
    const undoBtn = contentPage.locator('[data-testid="http-params-undo-btn"]').first();
    await undoBtn.click();
    await contentPage.waitForTimeout(200);
    // 验证请求方法恢复为POST
    await expect(methodSelector).toContainText('POST', { timeout: 5000 });
    // 再次点击撤销按钮
    await undoBtn.click();
    await contentPage.waitForTimeout(200);
    // 验证请求方法恢复为GET
    await expect(methodSelector).toContainText('GET', { timeout: 5000 });
  });
  // 测试用例2: 切换请求方法两次,按ctrl+z,请求方法恢复到上一次的状态
  test('切换请求方法后按ctrl+z快捷键恢复', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('请求方法快捷键撤销测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证初始请求方法为GET
    const methodSelector = contentPage.locator('[data-testid="method-select"]').first();
    await expect(methodSelector).toContainText('GET', { timeout: 5000 });
    // 切换请求方法为POST
    await methodSelector.click();
    await contentPage.waitForTimeout(200);
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' }).first();
    await postOption.click();
    await contentPage.waitForTimeout(300);
    await expect(methodSelector).toContainText('POST', { timeout: 5000 });
    // 切换请求方法为PUT
    await methodSelector.click();
    await contentPage.waitForTimeout(200);
    const putOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'PUT' }).first();
    await putOption.click();
    await contentPage.waitForTimeout(300);
    await expect(methodSelector).toContainText('PUT', { timeout: 5000 });
    // 按ctrl+z快捷键
    await contentPage.keyboard.press('Control+z');
    await contentPage.waitForTimeout(200);
    // 验证请求方法恢复为POST
    await expect(methodSelector).toContainText('POST', { timeout: 5000 });
    // 再次按ctrl+z快捷键
    await contentPage.keyboard.press('Control+z');
    await contentPage.waitForTimeout(200);
    // 验证请求方法恢复为GET
    await expect(methodSelector).toContainText('GET', { timeout: 5000 });
  });
});


