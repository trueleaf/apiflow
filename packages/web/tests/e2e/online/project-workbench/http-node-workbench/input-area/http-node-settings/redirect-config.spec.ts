import { test, expect } from '../../../../../../fixtures/electron-online.fixture.ts';

const MOCK_SERVER_PORT = 3456;

test.describe('RedirectConfig', () => {
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
  // 测试用例1: 开启自动跟随重定向时,请求自动跟随重定向并返回最终响应
  test('开启自动跟随重定向时,请求自动跟随重定向并返回最终响应', async ({ contentPage }) => {
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('自动跟随重定向测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 切换到设置标签页
    const settingsTab = contentPage.locator('[data-testid="http-params-tab-settings"]');
    await settingsTab.click();
    await contentPage.waitForTimeout(300);
    // 确保自动跟随重定向开关是开启状态
    const followRedirectSwitch = contentPage.locator('.request-settings .config-item').filter({ hasText: /自动跟随重定向|Follow Redirect/ }).locator('.el-switch');
    const isChecked = await followRedirectSwitch.locator('input').isChecked();
    if (!isChecked) {
      await followRedirectSwitch.click();
      await contentPage.waitForTimeout(300);
    }
    // 设置请求URL为重定向接口
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://localhost:${MOCK_SERVER_PORT}/redirect-302`);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证响应 - 应该是最终/echo接口的响应,而不是重定向响应
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.locator('.s-json-editor').first();
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证响应中包含echo接口返回的数据,说明已经跟随重定向到最终接口
    await expect(responseBody).toContainText('/echo', { timeout: 10000 });
    await expect(responseBody).toContainText('method', { timeout: 10000 });
  });
  // 测试用例2: 关闭自动跟随重定向时,请求返回重定向响应不继续跟随
  test('关闭自动跟随重定向时,请求返回重定向响应不继续跟随', async ({ contentPage }) => {
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('禁用重定向测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 切换到设置标签页
    const settingsTab = contentPage.locator('[data-testid="http-params-tab-settings"]');
    await settingsTab.click();
    await contentPage.waitForTimeout(300);
    // 关闭自动跟随重定向开关
    const followRedirectSwitch = contentPage.locator('.request-settings .config-item').filter({ hasText: /自动跟随重定向|Follow Redirect/ }).locator('.el-switch');
    const isChecked = await followRedirectSwitch.locator('input').isChecked();
    if (isChecked) {
      await followRedirectSwitch.click();
      await contentPage.waitForTimeout(300);
    }
    // 设置请求URL为重定向接口
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://localhost:${MOCK_SERVER_PORT}/redirect-302`);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证响应区域显示重定向信息
    const responseArea = contentPage.locator('[data-testid="response-area"]');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    // 应该看到重定向标识或302状态码
    const statusCodeArea = responseArea.locator('[data-testid="status-code"]').first();
    await expect(statusCodeArea).toContainText('302', { timeout: 10000 });
  });
  // 测试用例3: 修改最大重定向次数配置,超过次数后停止重定向并提示
  test('修改最大重定向次数配置,超过次数后停止重定向并提示', async ({ contentPage }) => {
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('最大重定向次数测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 切换到设置标签页
    const settingsTab = contentPage.locator('[data-testid="http-params-tab-settings"]');
    await settingsTab.click();
    await contentPage.waitForTimeout(300);
    // 确保自动跟随重定向开关是开启状态
    const followRedirectSwitch = contentPage.locator('.request-settings .config-item').filter({ hasText: /自动跟随重定向|Follow Redirect/ }).locator('.el-switch');
    const isRedirectChecked = await followRedirectSwitch.locator('input').isChecked();
    if (!isRedirectChecked) {
      await followRedirectSwitch.click();
      await contentPage.waitForTimeout(300);
    }
    // 修改最大重定向次数为2
    const maxRedirectsInput = contentPage.locator('.request-settings .config-item').filter({ hasText: /最大重定向次数|Max Redirects/ }).locator('input');
    await maxRedirectsInput.fill('2');
    await contentPage.waitForTimeout(300);
    // 设置请求URL为链式重定向接口(需要重定向5次)
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://localhost:${MOCK_SERVER_PORT}/redirect-chain/5`);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证响应区域显示错误信息(超过最大重定向次数)
    const responseArea = contentPage.locator('[data-testid="response-area"]');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    // 应该显示错误信息,表示重定向次数超过限制
    const errorText = responseArea.locator('.s-json-editor').first().or(responseArea.getByTestId('response-error').first());
    await expect(errorText).toContainText(/redirect|重定向|error|错误/i, { timeout: 10000 });
  });
});
