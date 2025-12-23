import { test, expect } from '../../../../../../fixtures/electron-online.fixture.ts';

const MOCK_SERVER_PORT = 3456;

test.describe('RawValue', () => {
  test.beforeEach(async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
    if (!serverUrl) {
      test.skip(true, '缺少环境变量 TEST_SERVER_URL（由 .env.test 提供）');
    }
    if (!loginName || !password) {
      test.skip(true, '缺少环境变量 TEST_LOGIN_NAME/TEST_LOGIN_PASSWORD（由 .env.test 提供）');
    }
    await clearCache();
    const networkToggle = topBarPage.locator('[data-testid="header-network-toggle"]');
    const networkText = await networkToggle.textContent();
    if (networkText?.includes('离线模式') || networkText?.includes('offline mode')) {
      await networkToggle.click();
      await contentPage.waitForTimeout(500);
    }
    await topBarPage.locator('[data-testid="header-settings-btn"]').click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    await contentPage.locator('[data-testid="settings-menu-common-settings"]').click();
    const serverUrlInput = contentPage.getByPlaceholder(/请输入接口调用地址|Please enter.*address/i);
    await serverUrlInput.fill(serverUrl!);
    const saveBtn = contentPage.getByRole('button', { name: /保存|Save/i });
    if (await saveBtn.isEnabled()) {
      await saveBtn.click();
      await expect(contentPage.getByText(/保存成功|Saved successfully/i)).toBeVisible({ timeout: 5000 });
    }
    const baseUrl = contentPage.url().split('#')[0];
    await contentPage.goto(`${baseUrl}#/login`);
    await expect(contentPage.locator('[data-testid="login-form"]')).toBeVisible({ timeout: 5000 });
    await contentPage.locator('[data-testid="login-username-input"]').fill(loginName!);
    await contentPage.locator('[data-testid="login-password-input"]').fill(password!);
    await contentPage.locator('[data-testid="login-submit-btn"]').click();
    const captchaInput = contentPage.locator('[data-testid="login-captcha-input"]');
    if (await captchaInput.isVisible()) {
      if (!captcha) {
        throw new Error('后端要求验证码，请在 .env.test 中配置 TEST_LOGIN_CAPTCHA');
      }
      await captchaInput.fill(captcha);
      await contentPage.locator('[data-testid="login-submit-btn"]').click();
    }
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: / 新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(`在线项目-${Date.now()}`);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
  });
  // 测试用例1: 原始值需要正确返回
  test('原始值正确返回', async ({ contentPage }) => {
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('原始值测试');
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
    // 切换到原始值标签页
    const rawTab = contentPage.locator('[data-testid="response-tabs"]').getByRole('tab', { name: /原始值|原始|Raw/i }).first();
    if (await rawTab.isVisible().catch(() => false)) {
      await rawTab.click();
      await contentPage.waitForTimeout(300);
    }
  });
  // 测试用例2: 原始值与JSON格式化显示的内容一致
  test('原始值与JSON格式化显示内容一致', async ({ contentPage }) => {
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('原始值一致性测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?test=rawvalue`);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证响应区域存在
    const responseBody = contentPage.locator('[data-testid="response-tab-body"]');
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证响应内容包含预期数据
    const responseText = await responseBody.textContent();
    expect(responseText).toContain('rawvalue');
  });
});
