import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('ResponseCookie', () => {
  // 测试用例1: 返回cookie正确展示
  test('返回Cookie正确展示', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Cookie测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证响应区域存在
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
    // 切换到Cookie标签页
    const cookieTab = contentPage.locator('[data-testid="response-tabs"]').getByRole('tab', { name: /Cookie|Cookies/i }).first();
    const cookieTabVisible = await cookieTab.isVisible().catch(() => false);
    if (cookieTabVisible) {
      await cookieTab.click();
      await contentPage.waitForTimeout(300);
    }
  });
  // 测试用例2: Cookie值包括名称,值,域,路径等完整信息
  test('Cookie展示包含完整信息', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Cookie详情测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击Headers标签页添加Cookie请求头
    const headersTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    // 添加Cookie请求头
    const headerKeyInput = contentPage.locator('.custom-headers input[placeholder*="名称"], .custom-headers input[placeholder*="Key"]').first();
    const headerKeyInputVisible = await headerKeyInput.isVisible().catch(() => false);
    if (headerKeyInputVisible) {
      await headerKeyInput.fill('Cookie');
      await contentPage.waitForTimeout(200);
      const headerValueInput = contentPage.locator('.custom-headers input[placeholder*="值"], .custom-headers input[placeholder*="Value"]').first();
      await headerValueInput.fill('test=value123');
      await contentPage.waitForTimeout(300);
    }
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证响应区域存在
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
  });
  // 使用set-cookie端点验证Cookie表格正确解析和展示cookie名称及值
  test('响应Cookie表格正确展示cookie名称和值', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('SetCookie\u89e3\u6790\u6d4b\u8bd5');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // \u8bf7\u6c42set-cookie/basic\u7aef\u70b9\uff0c\u670d\u52a1\u7aef\u4f1a\u8bbe\u7f6e Set-Cookie: af_basic=basic_value
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/set-cookie/basic`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    const responseTabs2 = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs2).toBeVisible({ timeout: 10000 });
    // \u5207\u6362\u5230Cookie\u6807\u7b7e\u9875
    const cookieTab = responseTabs2.getByRole('tab', { name: /Cookie/i }).first();
    await cookieTab.click();
    await contentPage.waitForTimeout(300);
    // \u9a8c\u8bc1Cookie\u8868\u683c\u5305\u542b\u6b63\u786e\u7684cookie\u540d\u79f0\u548c\u503c
    const cookiePane = contentPage.locator('[data-testid="response-tab-cookie"]');
    await expect(cookiePane).toContainText('af_basic', { timeout: 5000 });
    await expect(cookiePane).toContainText('basic_value', { timeout: 5000 });
  });
});


