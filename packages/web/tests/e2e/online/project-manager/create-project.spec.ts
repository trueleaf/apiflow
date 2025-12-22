import { test, expect } from '../../../fixtures/electron-online.fixture.ts';

test.describe('OnlineCreateProject', () => {
  test('登录后创建项目并进入工作台', async ({ topBarPage, contentPage, clearCache }) => {
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

    const settingsBtn = topBarPage.locator('[data-testid="header-settings-btn"]');
    await settingsBtn.click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });

    const commonSettingsMenu = contentPage.locator('[data-testid="settings-menu-common-settings"]');
    await commonSettingsMenu.click();

    await expect(contentPage.getByText(/应用配置|App Config/i)).toBeVisible({ timeout: 5000 });

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

    await contentPage.locator('[data-testid="login-username-input"] input').fill(loginName!);
    await contentPage.locator('[data-testid="login-password-input"] input').fill(password!);
    await contentPage.locator('[data-testid="login-submit-btn"]').click();

    const captchaInput = contentPage.locator('[data-testid="login-captcha-input"] input');
    if (await captchaInput.isVisible()) {
      if (!captcha) {
        throw new Error('后端要求验证码，请在 .env.test 中配置 TEST_LOGIN_CAPTCHA');
      }
      await captchaInput.fill(captcha);
      await contentPage.locator('[data-testid="login-submit-btn"]').click();
    }

    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    await expect(contentPage.locator('[data-testid="home-add-project-btn"]')).toBeVisible({ timeout: 10000 });

    const projectName = `在线项目-${Date.now()}`;
    const addProjectBtn = contentPage.locator('[data-testid="home-add-project-btn"]');
    await addProjectBtn.click();

    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });

    const projectNameInput = projectDialog.locator('input').first();
    await projectNameInput.fill(projectName);

    const confirmBtn = projectDialog.locator('.el-button--primary').last();
    await confirmBtn.click();

    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });

    const activeTab = topBarPage.locator('.tab-item.active');
    await expect(activeTab).toBeVisible({ timeout: 5000 });
    await expect(activeTab).toContainText(projectName);
  });
});
