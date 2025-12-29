import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

test.describe('RequestUrlUndo', () => {
  // 测试用例1: 请求url中输入字符串ab,点击撤销按钮,url值为a,再次点击撤销按钮,url值为空
  test('输入字符串后点击撤销按钮逐步撤销', async ({ contentPage, clearCache, createProject, loginAccount }) => {
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
    await fileNameInput.fill('URL撤销测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 在url输入框输入字符
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.pressSequentially('a', { delay: 100 });
    await contentPage.waitForTimeout(200);
    await urlInput.pressSequentially('b', { delay: 100 });
    await contentPage.waitForTimeout(200);
    // 验证当前url值为ab
    await expect(urlInput).toHaveText('ab', { timeout: 5000 });
    // 点击撤销按钮
    const undoBtn = contentPage.locator('[data-testid="http-params-undo-btn"]').first();
    await undoBtn.click();
    await contentPage.waitForTimeout(200);
    // 验证url值为a
    await expect(urlInput).toHaveText('a', { timeout: 5000 });
    // 再次点击撤销按钮
    await undoBtn.click();
    await contentPage.waitForTimeout(200);
    // 验证url值为空
    await expect(urlInput).toHaveText(/^\s*$/, { timeout: 5000 });
  });
  // 测试用例2: 请求url中输入字符串ab,按ctrl+z,url值为a,再次按ctrl+z,url值为空
  test('输入字符串后按ctrl+z快捷键逐步撤销', async ({ contentPage, clearCache, createProject, loginAccount }) => {
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
    await fileNameInput.fill('URL快捷键撤销测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 在url输入框输入字符
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.pressSequentially('a', { delay: 100 });
    await contentPage.waitForTimeout(200);
    await urlInput.pressSequentially('b', { delay: 100 });
    await contentPage.waitForTimeout(200);
    // 验证当前url值为ab
    await expect(urlInput).toHaveText('ab', { timeout: 5000 });
    // 按ctrl+z快捷键
    await contentPage.keyboard.press('Control+z');
    await contentPage.waitForTimeout(200);
    // 验证url值为a
    await expect(urlInput).toHaveText('a', { timeout: 5000 });
    // 再次按ctrl+z快捷键
    await contentPage.keyboard.press('Control+z');
    await contentPage.waitForTimeout(200);
    // 验证url值为空
    await expect(urlInput).toHaveText(/^\s*$/, { timeout: 5000 });
  });
  // 测试用例3: 请求url中输入中文字符串,点击撤销按钮,url值为空
  test('输入中文字符串后撤销', async ({ contentPage, clearCache, createProject, loginAccount }) => {
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
    await fileNameInput.fill('中文URL撤销测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 在url输入框输入中文字符
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.fill('你好');
    await contentPage.waitForTimeout(200);
    // 验证当前url值为你好
    await expect(urlInput).toHaveText('你好', { timeout: 5000 });
    // 按ctrl+z快捷键撤销
    await contentPage.keyboard.press('Control+z');
    await contentPage.waitForTimeout(200);
    // 验证url值为空
    await expect(urlInput).toHaveText(/^\s*$/, { timeout: 5000 });
  });
  // 测试用例4: 请求url中输入字符a,粘贴test.demo.com,撤销后url值为a
  test('输入字符后粘贴内容再撤销', async ({ contentPage, clearCache, createProject, loginAccount }) => {
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
    await fileNameInput.fill('粘贴撤销测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 在url输入框输入字符a
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.pressSequentially('a', { delay: 100 });
    await contentPage.waitForTimeout(200);
    // 模拟粘贴操作
    await urlInput.fill('atest.demo.com');
    await contentPage.waitForTimeout(200);
    // 验证当前url值
    await expect(urlInput).toHaveText('atest.demo.com', { timeout: 5000 });
    // 按ctrl+z快捷键撤销
    await contentPage.keyboard.press('Control+z');
    await contentPage.waitForTimeout(200);
    // 验证url值恢复为a
    await expect(urlInput).toHaveText('a', { timeout: 5000 });
    // 再次按ctrl+z快捷键
    await contentPage.keyboard.press('Control+z');
    await contentPage.waitForTimeout(200);
    // 验证url值为空
    await expect(urlInput).toHaveText(/^\s*$/, { timeout: 5000 });
  });
});
