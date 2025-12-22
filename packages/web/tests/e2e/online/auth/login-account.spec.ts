import { test, expect } from '../../../fixtures/electron-online.fixture.ts';

test.describe('OnlineLoginAccount', () => {
  test('账号密码登录成功后进入首页', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;

    await clearCache();

    const settingsBtn = topBarPage.locator('[data-testid="header-settings-btn"]');
    await settingsBtn.click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });

    const commonSettingsMenu = contentPage.locator('[data-testid="settings-menu-common-settings"]');
    await commonSettingsMenu.click();

    await expect(contentPage.getByText(/应用配置|App Config/i)).toBeVisible({ timeout: 5000 });

    const appConfigTab = contentPage.locator('.clean-tabs__header .clean-tabs__item', { hasText: /应用配置|App Config/i });
    await appConfigTab.click();

    const serverUrlInput = contentPage.getByPlaceholder(/请输入接口调用地址|Please enter.*address/i);
    await expect(serverUrlInput).toBeVisible({ timeout: 5000 });
    await serverUrlInput.fill(serverUrl!);

    const saveBtn = contentPage.getByRole('button', { name: /保存|Save/i });
    if (await saveBtn.isEnabled()) {
      await saveBtn.click();
      await expect(contentPage.getByText(/保存成功|Saved successfully/i)).toBeVisible({ timeout: 5000 });
    }

    await contentPage.evaluate(() => {
      window.location.hash = '#/login'
    });
    await contentPage.waitForURL(/.*#\/login.*/, { timeout: 5000 });
    await expect(contentPage.locator('[data-testid="login-form"]')).toBeVisible({ timeout: 5000 });

    await expect(contentPage.locator('[data-testid="login-username-input"]')).toBeVisible({ timeout: 5000 });
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
    await expect(contentPage.locator('[data-testid="home-add-project-btn"]')).toBeVisible({ timeout: 10000 });
  });
});
