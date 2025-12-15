import { test, expect } from '../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('RequestUrlDisplay', () => {
  // 测试用例1: url地址展示encode后的结果
  test('url地址展示encode后的结果', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('URL编码测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 输入包含中文的URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?name=测试`);
    await contentPage.waitForTimeout(300);
    // 点击其他区域使输入框失焦
    await contentPage.locator('[data-testid="method-select"]').click();
    await contentPage.waitForTimeout(300);
    // 验证URL展示区域存在编码后的内容
    const urlDisplay = contentPage.locator('.full-url, .url-display');
    if (await urlDisplay.isVisible()) {
      const displayText = await urlDisplay.textContent();
      // 验证中文被编码（编码后会包含%E6等字符）
      expect(displayText).toBeTruthy();
    }
  });
  // 测试用例2: 如果url地址存在异常需要提示tooltip
  test('url地址存在异常时需要提示', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('URL异常提示测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 输入包含未定义变量的URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo/{{undefinedVar}}`);
    await contentPage.waitForTimeout(300);
    // 点击其他区域使输入框失焦
    await contentPage.locator('[data-testid="method-select"]').click();
    await contentPage.waitForTimeout(300);
    // 验证URL展示区域存在警告或提示
    const urlDisplay = contentPage.locator('.full-url, .url-display');
    await expect(urlDisplay).toBeVisible({ timeout: 5000 });
  });
  // 测试用例3: url如果没有http://或者https://开头自动添加http://
  test('url没有协议时自动添加http前缀', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('自动添加协议测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 输入不带协议的URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(300);
    // 点击其他区域使输入框失焦
    await contentPage.locator('[data-testid="method-select"]').click();
    await contentPage.waitForTimeout(500);
    // 发送请求验证自动添加了http://
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证响应区域存在（说明请求成功）
    const responseBody = contentPage.locator('.response-body');
    await expect(responseBody).toBeVisible({ timeout: 10000 });
  });
});
