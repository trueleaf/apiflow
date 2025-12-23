import { test, expect } from '../../../../../../fixtures/electron-online.fixture.ts';

test.describe('RequestMethodUndo', () => {
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
  // 测试用例1: 切换请求方法两次,点击撤销按钮,请求方法恢复到上一次的状态
  test('切换请求方法后点击撤销按钮恢复', async ({ contentPage }) => {
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('请求方法撤销测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证初始请求方法为GET
    const methodSelector = contentPage.locator('[data-testid="method-select"]').first();
    await expect(methodSelector).toContainText('GET', { timeout: 5000 });
    // 切换请求方法为POST
    await methodSelector.click();
    await contentPage.waitForTimeout(200);
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' }).first();
    await postOption.click();
    await contentPage.waitForTimeout(300);
    await expect(methodSelector).toContainText('POST', { timeout: 5000 });
    // 切换请求方法为PUT
    await methodSelector.click();
    await contentPage.waitForTimeout(200);
    const putOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'PUT' }).first();
    await putOption.click();
    await contentPage.waitForTimeout(300);
    await expect(methodSelector).toContainText('PUT', { timeout: 5000 });
    // 点击撤销按钮
    const undoBtn = contentPage.locator('[data-testid="http-params-undo-btn"]').first();
    await undoBtn.click();
    await contentPage.waitForTimeout(200);
    // 验证请求方法恢复为POST
    await expect(methodSelector).toContainText('POST', { timeout: 5000 });
    // 再次点击撤销按钮
    await undoBtn.click();
    await contentPage.waitForTimeout(200);
    // 验证请求方法恢复为GET
    await expect(methodSelector).toContainText('GET', { timeout: 5000 });
  });
  // 测试用例2: 切换请求方法两次,按ctrl+z,请求方法恢复到上一次的状态
  test('切换请求方法后按ctrl+z快捷键恢复', async ({ contentPage }) => {
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('请求方法快捷键撤销测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证初始请求方法为GET
    const methodSelector = contentPage.locator('[data-testid="method-select"]').first();
    await expect(methodSelector).toContainText('GET', { timeout: 5000 });
    // 切换请求方法为POST
    await methodSelector.click();
    await contentPage.waitForTimeout(200);
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' }).first();
    await postOption.click();
    await contentPage.waitForTimeout(300);
    await expect(methodSelector).toContainText('POST', { timeout: 5000 });
    // 切换请求方法为PUT
    await methodSelector.click();
    await contentPage.waitForTimeout(200);
    const putOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'PUT' }).first();
    await putOption.click();
    await contentPage.waitForTimeout(300);
    await expect(methodSelector).toContainText('PUT', { timeout: 5000 });
    // 按ctrl+z快捷键
    await contentPage.keyboard.press('Control+z');
    await contentPage.waitForTimeout(200);
    // 验证请求方法恢复为POST
    await expect(methodSelector).toContainText('POST', { timeout: 5000 });
    // 再次按ctrl+z快捷键
    await contentPage.keyboard.press('Control+z');
    await contentPage.waitForTimeout(200);
    // 验证请求方法恢复为GET
    await expect(methodSelector).toContainText('GET', { timeout: 5000 });
  });
});
