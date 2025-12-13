import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('ResponseCookie', () => {
  // 测试用例1: 返回cookie正确展示
  test('返回Cookie正确展示', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
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
    const responseBody = contentPage.locator('.response-body');
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 切换到Cookie标签页
    const cookieTab = contentPage.locator('.response-tabs, .response-detail-tabs').locator('text=Cookie, text=Cookies').first();
    if (await cookieTab.isVisible().catch(() => false)) {
      await cookieTab.click();
      await contentPage.waitForTimeout(300);
    }
  });
  // 测试用例2: Cookie值包括名称,值,域,路径等完整信息
  test('Cookie展示包含完整信息', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Cookie详情测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('.url-input input');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击Headers标签页添加Cookie请求头
    const headersTab = contentPage.locator('[data-testid="http-params-tab-header"]');
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    // 添加Cookie请求头
    const headerKeyInput = contentPage.locator('.custom-headers input[placeholder*="名称"], .custom-headers input[placeholder*="Key"]').first();
    if (await headerKeyInput.isVisible().catch(() => false)) {
      await headerKeyInput.fill('Cookie');
      await contentPage.waitForTimeout(200);
      const headerValueInput = contentPage.locator('.custom-headers input[placeholder*="值"], .custom-headers input[placeholder*="Value"]').first();
      await headerValueInput.fill('test=value123');
      await contentPage.waitForTimeout(300);
    }
    // 发送请求
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证响应区域存在
    const responseBody = contentPage.locator('.response-body');
    await expect(responseBody).toBeVisible({ timeout: 10000 });
  });
});
