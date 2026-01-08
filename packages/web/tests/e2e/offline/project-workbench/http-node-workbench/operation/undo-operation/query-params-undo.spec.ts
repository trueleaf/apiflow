import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('QueryParamsUndo', () => {
  // 测试用例1: query参数key输入字符串ab,按ctrl+z逐步撤销
  test('query参数key输入后按ctrl+z撤销', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Query参数撤销测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 切换到Params标签页
    const paramsTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 找到Query参数区域的key输入框
    const keyInput = contentPage.getByPlaceholder('输入参数名称自动换行').first();
    await keyInput.click();
    await keyInput.pressSequentially('a', { delay: 100 });
    await contentPage.waitForTimeout(200);
    await contentPage.locator('[data-testid="url-input"]').click();
    await contentPage.waitForTimeout(200);
    await keyInput.click();
    await keyInput.pressSequentially('b', { delay: 100 });
    await contentPage.waitForTimeout(200);
    await contentPage.locator('[data-testid="url-input"]').click();
    await contentPage.waitForTimeout(200);
    // 验证key值为ab
    await expect(keyInput).toHaveValue('ab', { timeout: 5000 });
    // 按ctrl+z快捷键
    await contentPage.keyboard.press('ControlOrMeta+z');
    await contentPage.waitForTimeout(200);
    // 验证key值为a
    await expect(keyInput).toHaveValue('a', { timeout: 5000 });
    // 再次按ctrl+z快捷键
    await contentPage.keyboard.press('ControlOrMeta+z');
    await contentPage.waitForTimeout(200);
    // 验证key值为空
    await expect(keyInput).toHaveValue('', { timeout: 5000 });
  });
  // 测试用例2: query参数value输入字符串后撤销
  test('query参数value输入后按ctrl+z撤销', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Query参数value撤销测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 切换到Params标签页
    const paramsTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 找到Query参数区域,先输入key
    const keyInput = contentPage.getByPlaceholder('输入参数名称自动换行').first();
    await keyInput.click();
    await keyInput.fill('testKey');
    await contentPage.waitForTimeout(200);
    // 找到value输入框并输入
    const valueInput = contentPage.locator('[data-testid="params-tree-value-input"]').first();
    const valueEditor = valueInput.locator('[contenteditable="true"]').first();
    await valueEditor.click();
    await valueEditor.pressSequentially('v1', { delay: 100 });
    await contentPage.waitForTimeout(200);
    await contentPage.locator('[data-testid="url-input"]').click();
    await contentPage.waitForTimeout(200);
    await valueEditor.click();
    await valueEditor.pressSequentially('v2', { delay: 100 });
    await contentPage.waitForTimeout(200);
    await contentPage.locator('[data-testid="url-input"]').click();
    await contentPage.waitForTimeout(200);
    // 验证value值
    await expect(valueEditor).toHaveText('v1v2', { timeout: 5000 });
    // 按ctrl+z快捷键
    await contentPage.keyboard.press('ControlOrMeta+z');
    await contentPage.waitForTimeout(200);
    // 验证value值变化
    await expect(valueEditor).toHaveText('v1', { timeout: 5000 });
  });
  // 测试用例3: url和query参数联动撤销
  test('url和query参数联动变化后撤销', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('URL联动撤销测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 在url输入框输入带query参数的url
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.fill('http://example.com?key=value');
    await contentPage.waitForTimeout(500);
    // 验证url已输入
    await expect(urlInput).toHaveText('http://example.com?key=value', { timeout: 5000 });
    // 按ctrl+z快捷键撤销
    await contentPage.keyboard.press('Control+z');
    await contentPage.waitForTimeout(200);
    // 验证url恢复为空
    await expect(urlInput).toHaveText(/^\s*$/, { timeout: 5000 });
  });
});

