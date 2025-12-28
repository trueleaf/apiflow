import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

test.describe('RequestUrlRedo', () => {
  // 测试用例1: 请求url中输入字符串ab,按ctrl+z撤销到a,再按ctrl+shift+z重做,url值为ab
  test('请求url输入后撤销再按ctrl+shift+z重做,url值恢复', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();/.*#\/workbench.*/
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('URL重做快捷键测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 在url输入框中输入字符
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.fill('');
    await contentPage.keyboard.type('a');
    await contentPage.waitForTimeout(300);
    await contentPage.keyboard.type('b');
    await contentPage.waitForTimeout(300);
    // 验证url值为ab
    await expect(urlInput).toHaveText('ab', { timeout: 5000 });
    // 按ctrl+z快捷键撤销
    await contentPage.keyboard.press('Control+z');
    await contentPage.waitForTimeout(300);
    // 验证撤销后url值
    const urlValueAfterUndo = (await urlInput.innerText()).trim();
    expect(urlValueAfterUndo.length).toBeLessThan(2);
    // 按ctrl+shift+z快捷键重做
    await contentPage.keyboard.press('Control+y');
    await contentPage.waitForTimeout(300);
    // 验证重做后url值恢复为ab
    await expect(urlInput).toHaveText('ab', { timeout: 5000 });
  });
  // 测试用例2: 请求url中输入字符串ab,点击撤销按钮撤销到a,再点击重做按钮,url值为ab
  test('请求url输入后点击撤销按钮再点击重做按钮,url值恢复', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();/.*#\/workbench.*/
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('URL重做按钮测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 在url输入框中输入字符
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.fill('');
    await contentPage.keyboard.type('a');
    await contentPage.waitForTimeout(300);
    await contentPage.keyboard.type('b');
    await contentPage.waitForTimeout(300);
    // 验证url值为ab
    await expect(urlInput).toHaveText('ab', { timeout: 5000 });
    // 点击撤销按钮
    const undoBtn = contentPage.locator('[data-testid="http-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证撤销后url值
    const urlValueAfterUndo = (await urlInput.innerText()).trim();
    expect(urlValueAfterUndo.length).toBeLessThan(2);
    // 点击重做按钮
    const redoBtn = contentPage.locator('[data-testid="http-params-redo-btn"]');
    await redoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证重做后url值恢复为ab
    await expect(urlInput).toHaveText('ab', { timeout: 5000 });
  });
});
