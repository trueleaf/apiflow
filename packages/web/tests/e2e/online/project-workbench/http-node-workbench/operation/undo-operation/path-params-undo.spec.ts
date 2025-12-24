import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

test.describe('PathParamsUndo', () => {
  // 测试用例1: path参数key输入字符串ab,按ctrl+z逐步撤销
  test('path参数key输入后按ctrl+z撤销', async ({ contentPage, clearCache, createProject, loginAccount }) => {
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
    // 找到Path参数区域的value输入框（Path树在Query树之后，取最后一个value输入框）
    const valueInput = contentPage.locator('[data-testid="params-tree-value-input"]').last();
    await expect(valueInput).toBeVisible({ timeout: 5000 });
    const editor = valueInput.locator('.cl-rich-input__editor').first();
    await editor.click();
    await contentPage.keyboard.type('a');
    await contentPage.waitForTimeout(200);
    await contentPage.keyboard.type('b');
    await contentPage.waitForTimeout(200);
    // 验证value值为ab
    await expect(valueInput).toContainText('ab', { timeout: 5000 });
    // 按ctrl+z快捷键
    await contentPage.keyboard.press('Control+z');
    await contentPage.waitForTimeout(200);
    // 验证value值为a
    await expect(valueInput).toContainText('a', { timeout: 5000 });
    // 再次按ctrl+z快捷键
    await contentPage.keyboard.press('Control+z');
    await contentPage.waitForTimeout(200);
    // 验证value值为空
    await expect(valueInput).not.toContainText('a', { timeout: 5000 });
  });
  // 测试用例2: url和path参数联动撤销
  test('url和path参数联动变化后撤销', async ({ contentPage, clearCache, createProject, loginAccount }) => {
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
  test('path参数value输入后点击撤销按钮恢复', async ({ contentPage, clearCache, createProject, loginAccount }) => {
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
    await fileNameInput.fill('Path按钮撤销测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 确保选中当前HTTP节点（用于记录撤销/重做）
    const navTab = contentPage.locator('.nav .item').filter({ hasText: 'Path按钮撤销测试接口' }).first();
    await navTab.click();
    await expect(navTab).toHaveClass(/active/, { timeout: 5000 });
    // 先在url中输入带path参数的格式
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.fill('http://example.com/{id}');
    await contentPage.waitForTimeout(500);
    // 切换到Params标签页
    const paramsTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 找到Path参数区域的value输入框（Path树在Query树之后，取最后一个value输入框）
    const valueInput = contentPage.locator('[data-testid="params-tree-value-input"]').last();
    await expect(valueInput).toBeVisible({ timeout: 5000 });
    const editor = valueInput.locator('.cl-rich-input__editor').first();
    await editor.click();
    await contentPage.keyboard.type('1');
    await contentPage.waitForTimeout(100);
    await contentPage.keyboard.type('2');
    await contentPage.waitForTimeout(100);
    await contentPage.keyboard.type('3');
    await contentPage.waitForTimeout(200);
    // 验证value值
    await expect(valueInput).toContainText('123', { timeout: 5000 });
    // 点击撤销按钮
    const undoBtn = contentPage.locator('[data-testid="http-params-undo-btn"]').first();
    await expect(undoBtn).not.toHaveClass(/disabled/, { timeout: 5000 });
    for (let i = 0; i < 6; i += 1) {
      const valueText = await valueInput.innerText();
      if (!/[0-9]/.test(valueText)) break;
      await expect(undoBtn).not.toHaveClass(/disabled/, { timeout: 5000 });
      await undoBtn.click();
      await contentPage.waitForTimeout(200);
    }
    // 验证value值为空
    await expect(valueInput).not.toContainText(/[0-9]/, { timeout: 10000 });
  });
});
