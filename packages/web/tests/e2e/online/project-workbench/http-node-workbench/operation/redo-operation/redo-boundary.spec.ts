import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

test.describe('RedoBoundary', () => {
  // 测试用例1: 没有可重做的操作时,重做按钮置灰不可点击,ctrl+shift+z无反应
  test('没有可重做的操作时,重做按钮置灰不可点击', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*#\/workbench.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('重做边界测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 观察重做按钮的状态
    const redoBtn = contentPage.locator('[data-testid="http-params-redo-btn"]');
    // 验证重做按钮呈灰色禁用状态
    await expect(redoBtn).toHaveClass(/disabled/, { timeout: 5000 });
    // 记录当前url值
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    const originalUrl = (await urlInput.innerText()).trim();
    // 尝试按ctrl+shift+z快捷键
    await contentPage.keyboard.press('Control+Shift+z');
    await contentPage.waitForTimeout(300);
    // 验证ctrl+shift+z快捷键无响应,url值不变
    await expect(urlInput).toHaveText(originalUrl === '' ? /^\s*$/ : originalUrl, { timeout: 5000 });
  });
  // 测试用例2: 撤销后进行新操作,重做历史被清空,重做按钮置灰不可点击
  test('撤销后进行新操作,重做历史被清空,重做按钮置灰不可点击', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*#\/workbench.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('重做历史清空测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 初始请求方法为GET,切换为POST
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
    await postOption.click();
    await contentPage.waitForTimeout(300);
    // 验证请求方法为POST
    await expect(methodSelect).toContainText('POST', { timeout: 5000 });
    // 点击撤销按钮,请求方法恢复为GET
    const undoBtn = contentPage.locator('[data-testid="http-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证撤销后请求方法为GET
    await expect(methodSelect).toContainText('GET', { timeout: 5000 });
    // 此时重做按钮应该可用
    const redoBtn = contentPage.locator('[data-testid="http-params-redo-btn"]');
    await expect(redoBtn).not.toHaveClass(/disabled/, { timeout: 5000 });
    // 将请求方法切换为PUT(进行新操作)
    await methodSelect.click();
    const putOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'PUT' });
    await putOption.click();
    await contentPage.waitForTimeout(300);
    // 验证请求方法为PUT
    await expect(methodSelect).toContainText('PUT', { timeout: 5000 });
    // 观察重做按钮状态,进行新操作后重做历史栈被清空
    await expect(redoBtn).toHaveClass(/disabled/, { timeout: 5000 });
  });
});
