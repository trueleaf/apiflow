import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('PathParamsUndo', () => {
  // 测试用例1: path参数key输入字符串ab,按ctrl+z逐步撤销
  test('path参数key输入后按ctrl+z撤销', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Path参数撤销测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 先在url中输入带path参数的格式，触发path参数显示
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.fill('http://example.com/{id}');
    await contentPage.waitForTimeout(500);
    // 切换到Params标签页
    const paramsTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 找到Path参数区域的value输入框
    const pathSection = contentPage.locator('.path-params, .params-section').filter({ hasText: /Path|路径参数/ }).first();
    const valueInput = pathSection.locator('input').nth(1);
    await valueInput.click();
    await valueInput.pressSequentially('a', { delay: 100 });
    await contentPage.waitForTimeout(200);
    await valueInput.pressSequentially('b', { delay: 100 });
    await contentPage.waitForTimeout(200);
    // 验证value值为ab
    await expect(valueInput).toHaveValue('ab', { timeout: 5000 });
    // 按ctrl+z快捷键
    await contentPage.keyboard.press('Control+z');
    await contentPage.waitForTimeout(200);
    // 验证value值为a
    await expect(valueInput).toHaveValue('a', { timeout: 5000 });
    // 再次按ctrl+z快捷键
    await contentPage.keyboard.press('Control+z');
    await contentPage.waitForTimeout(200);
    // 验证value值为空
    await expect(valueInput).toHaveValue('', { timeout: 5000 });
  });
  // 测试用例2: url和path参数联动撤销
  test('url和path参数联动变化后撤销', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Path联动撤销测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 在url输入框输入带path参数的url
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.fill('http://example.com/users/{userId}/posts/{postId}');
    await contentPage.waitForTimeout(500);
    // 验证url已输入
    await expect(urlInput).toHaveText('http://example.com/users/{userId}/posts/{postId}', { timeout: 5000 });
    // 按ctrl+z快捷键撤销
    await contentPage.keyboard.press('Control+z');
    await contentPage.waitForTimeout(200);
    // 验证url恢复为空
    await expect(urlInput).toHaveText(/^\s*$/, { timeout: 5000 });
  });
  // 测试用例3: path参数value输入后点击撤销按钮恢复
  test('path参数value输入后点击撤销按钮恢复', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Path按钮撤销测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 先在url中输入带path参数的格式
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.fill('http://example.com/{id}');
    await contentPage.waitForTimeout(500);
    // 切换到Params标签页
    const paramsTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 找到Path参数区域的value输入框
    const pathSection = contentPage.locator('.path-params, .params-section').filter({ hasText: /Path|路径参数/ }).first();
    const valueInput = pathSection.locator('input').nth(1);
    await valueInput.click();
    await valueInput.fill('123');
    await contentPage.waitForTimeout(200);
    // 验证value值
    await expect(valueInput).toHaveValue('123', { timeout: 5000 });
    // 点击撤销按钮
    const undoBtn = contentPage.locator('.undo-btn, [data-testid="undo-btn"]').first();
    await undoBtn.click();
    await contentPage.waitForTimeout(200);
    // 验证value值为空
    await expect(valueInput).toHaveValue('', { timeout: 5000 });
  });
});
