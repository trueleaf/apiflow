import { test, expect } from '../../../../../fixtures/electron.fixture';

test.describe('RequestUrlFormat', () => {
  // 输入URL后blur自动添加http://前缀，验证格式化操作不进入撤销栈
  test('输入URL后blur自动添加http://前缀，撤销不会回到格式化前', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('URL格式化测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 输入不带协议前缀的URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await contentPage.keyboard.type('test.com/api');
    await contentPage.waitForTimeout(200);
    await expect(urlInput).toHaveText('test.com/api', { timeout: 5000 });
    // blur触发格式化，自动添加http://前缀
    await urlInput.evaluate((el) => (el as HTMLElement).blur());
    await contentPage.waitForTimeout(300);
    await expect(urlInput).toHaveText(/http:\/\/test\.com\/api/, { timeout: 5000 });
    // 撤销操作应该回到空值，而不是格式化前的值
    const undoBtn = contentPage.locator('[data-testid="http-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(urlInput).toHaveText(/^\s*$/, { timeout: 5000 });
  });
  // 输入带query参数的URL，格式化后query参数被提取并移除
  test('输入带query参数的URL，格式化后query参数被移除且不进入撤销栈', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('URL Query格式化测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 输入带query参数的URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await contentPage.keyboard.type('http://api.test.com/users?page=1&size=10');
    await contentPage.waitForTimeout(200);
    // blur触发格式化
    await urlInput.evaluate((el) => (el as HTMLElement).blur());
    await contentPage.waitForTimeout(300);
    // 验证query参数被移除
    await expect(urlInput).toHaveText('http://api.test.com/users', { timeout: 5000 });
    // 撤销应该回到空值，不会有带query的中间状态
    const undoBtn = contentPage.locator('[data-testid="http-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(urlInput).toHaveText(/^\s*$/, { timeout: 5000 });
  });
  // 输入已有http://前缀的URL，格式化不会重复添加前缀
  test('输入已有http://前缀的URL，格式化不会重复添加前缀', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('URL重复前缀测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 输入已有http://前缀的URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await contentPage.keyboard.type('http://example.com:8080/api');
    await contentPage.waitForTimeout(200);
    // blur触发格式化
    await urlInput.evaluate((el) => (el as HTMLElement).blur());
    await contentPage.waitForTimeout(300);
    // 验证前缀没有重复
    await expect(urlInput).toHaveText('http://example.com:8080/api', { timeout: 5000 });
  });
  // 输入以/开头的相对路径，格式化不添加协议前缀
  test('输入以/开头的相对路径，格式化不添加协议前缀', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('URL相对路径测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 输入相对路径
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await contentPage.keyboard.type('/api/users/123');
    await contentPage.waitForTimeout(200);
    // blur触发格式化
    await urlInput.evaluate((el) => (el as HTMLElement).blur());
    await contentPage.waitForTimeout(300);
    // 验证相对路径保持不变
    await expect(urlInput).toHaveText('/api/users/123', { timeout: 5000 });
  });
  // 逐字符输入后格式化，验证撤销只能回到逐字符输入的状态
  test('逐字符输入后格式化，撤销回到逐字符输入前的状态', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('URL逐字符格式化测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 逐字符输入
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.pressSequentially('a', { delay: 100 });
    await contentPage.waitForTimeout(200);
    await urlInput.pressSequentially('b', { delay: 100 });
    await contentPage.waitForTimeout(200);
    await urlInput.pressSequentially('c', { delay: 100 });
    await contentPage.waitForTimeout(200);
    await expect(urlInput).toHaveText('abc', { timeout: 5000 });
    // blur触发格式化（添加http://前缀）
    await urlInput.evaluate((el) => (el as HTMLElement).blur());
    await contentPage.waitForTimeout(300);
    await expect(urlInput).toHaveText(/http:\/\/abc/, { timeout: 5000 });
    // 撤销三次应该回到空值（每个字符一次撤销），格式化不占用撤销栈
    const undoBtn = contentPage.locator('[data-testid="http-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(urlInput).toHaveText('ab', { timeout: 5000 });
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(urlInput).toHaveText('a', { timeout: 5000 });
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(urlInput).toHaveText(/^\s*$/, { timeout: 5000 });
  });
});
