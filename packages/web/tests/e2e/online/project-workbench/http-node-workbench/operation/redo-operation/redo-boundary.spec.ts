import { test, expect } from '../../../../../../fixtures/electron-online.fixture.ts';

test.describe('RedoBoundary', () => {
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
  // 测试用例1: 没有可重做的操作时,重做按钮置灰不可点击,ctrl+shift+z无反应
  test('没有可重做的操作时,重做按钮置灰不可点击', async ({ contentPage }) => {
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('重做边界测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 观察重做按钮的状态
    const redoBtn = contentPage.locator('[data-testid="http-params-redo-btn"]');
    // 验证重做按钮呈灰色禁用状态
    await expect(redoBtn).toHaveClass(/disabled/, { timeout: 5000 });
    // 记录当前url值
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    const originalUrl = (await urlInput.innerText()).trim();
    // 尝试按ctrl+shift+z快捷键
    await contentPage.keyboard.press('Control+Shift+z');
    await contentPage.waitForTimeout(300);
    // 验证ctrl+shift+z快捷键无响应,url值不变
    await expect(urlInput).toHaveText(originalUrl === '' ? /^\s*$/ : originalUrl, { timeout: 5000 });
  });
  // 测试用例2: 撤销后进行新操作,重做历史被清空,重做按钮置灰不可点击
  test('撤销后进行新操作,重做历史被清空,重做按钮置灰不可点击', async ({ contentPage }) => {
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('重做历史清空测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 初始请求方法为GET,切换为POST
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
    await postOption.click();
    await contentPage.waitForTimeout(300);
    // 验证请求方法为POST
    await expect(methodSelect).toContainText('POST', { timeout: 5000 });
    // 点击撤销按钮,请求方法恢复为GET
    const undoBtn = contentPage.locator('[data-testid="http-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证撤销后请求方法为GET
    await expect(methodSelect).toContainText('GET', { timeout: 5000 });
    // 此时重做按钮应该可用
    const redoBtn = contentPage.locator('[data-testid="http-params-redo-btn"]');
    await expect(redoBtn).not.toHaveClass(/disabled/, { timeout: 5000 });
    // 将请求方法切换为PUT(进行新操作)
    await methodSelect.click();
    const putOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'PUT' });
    await putOption.click();
    await contentPage.waitForTimeout(300);
    // 验证请求方法为PUT
    await expect(methodSelect).toContainText('PUT', { timeout: 5000 });
    // 观察重做按钮状态,进行新操作后重做历史栈被清空
    await expect(redoBtn).toHaveClass(/disabled/, { timeout: 5000 });
  });
});
