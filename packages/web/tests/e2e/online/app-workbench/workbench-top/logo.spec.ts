import { test, expect } from '../../../../fixtures/electron-online.fixture.ts';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe('OnlineLogo', () => {
  test('点击logo跳转主页面', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
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
    const settingsBtn = topBarPage.locator('[data-testid="header-settings-btn"]');
    await expect(settingsBtn).toBeVisible();
    await settingsBtn.click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    const logo = topBarPage.locator('.logo-img');
    await expect(logo).toBeVisible();
    await logo.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    const homeTabs = contentPage.locator('[data-testid="home-tabs"]');
    await expect(homeTabs).toBeVisible({ timeout: 5000 });
    const projectSearchInput = contentPage.locator('[data-testid="home-project-search-input"]');
    await expect(projectSearchInput).toBeVisible({ timeout: 5000 });
  });
  test('设置页面更改应用图标后logo立马被更新, 刷新页面保持更新后的图标', async ({ topBarPage, contentPage }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
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
    const logo = topBarPage.locator('.logo-img');
    await expect(logo).toBeVisible();
    const initialSrc = await logo.getAttribute('src');
    const settingsBtn = topBarPage.locator('[data-testid="header-settings-btn"]');
    await expect(settingsBtn).toBeVisible();
    await settingsBtn.click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    const commonSettingsMenu = contentPage.locator('[data-testid="settings-menu-common-settings"]');
    await expect(commonSettingsMenu).toBeVisible();
    await commonSettingsMenu.click();
    const appConfigTab = contentPage.locator('.tab-label').filter({ hasText: '应用配置' });
    await expect(appConfigTab).toBeVisible();
    await appConfigTab.click();
    const logoContainer = contentPage.locator('.logo-container');
    await expect(logoContainer).toBeVisible();
    const testImagePath = path.resolve(__dirname, '../../../../../src/renderer/assets/imgs/test.png');
    const fileChooserPromise = contentPage.waitForEvent('filechooser');
    await logoContainer.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(testImagePath);
    await expect(contentPage.locator('.loading-indicator')).toBeHidden({ timeout: 10000 });
    const contentLogoPreview = contentPage.locator('.logo-container .image-preview');
    await expect(contentLogoPreview).toBeVisible();
    await expect(contentLogoPreview).toHaveAttribute('src', /^data:image\//, { timeout: 5000 });
    const updatedContentSrc = await contentLogoPreview.getAttribute('src');
    expect(updatedContentSrc).not.toBe(initialSrc);
    await contentPage.reload();
    await contentPage.waitForLoadState('domcontentloaded');
    await topBarPage.reload();
    await topBarPage.waitForLoadState('domcontentloaded');
    await topBarPage.waitForTimeout(500);
    const logoAfterRefresh = topBarPage.locator('.logo-img');
    await expect(logoAfterRefresh).toBeVisible();
    const storedLogo = await contentPage.evaluate(() => {
      return localStorage.getItem('settings/app/logo');
    });
    expect(storedLogo).toBeTruthy();
    expect(storedLogo).toMatch(/^data:image\//);
    await expect(logoAfterRefresh).toHaveAttribute('src', /^data:image\//, { timeout: 5000 });
  });
  test('点击重置后，图标恢复为默认', async ({ topBarPage, contentPage }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
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
    const logo = topBarPage.locator('.logo-img');
    await expect(logo).toBeVisible();
    const settingsBtn = topBarPage.locator('[data-testid="header-settings-btn"]');
    await expect(settingsBtn).toBeVisible();
    await settingsBtn.click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    const commonSettingsMenu = contentPage.locator('[data-testid="settings-menu-common-settings"]');
    await expect(commonSettingsMenu).toBeVisible();
    await commonSettingsMenu.click();
    const appConfigTab = contentPage.locator('.tab-label').filter({ hasText: '应用配置' });
    await expect(appConfigTab).toBeVisible();
    await appConfigTab.click();
    const logoContainer = contentPage.locator('.logo-container');
    await expect(logoContainer).toBeVisible();
    const testImagePath = path.resolve(__dirname, '../../../../../src/renderer/assets/imgs/test.png');
    const fileChooserPromise = contentPage.waitForEvent('filechooser');
    await logoContainer.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(testImagePath);
    await expect(contentPage.locator('.loading-indicator')).toBeHidden({ timeout: 10000 });
    const contentLogoPreview = contentPage.locator('.logo-container .image-preview');
    await expect(contentLogoPreview).toBeVisible();
    await expect(contentLogoPreview).toHaveAttribute('src', /^data:image\//, { timeout: 5000 });
    const resetBtn = contentPage.locator('.panel-actions .el-button').filter({ hasText: '重置' });
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();
    const confirmBtn = contentPage.locator('.el-message-box__btns .el-button--primary');
    await expect(confirmBtn).toBeVisible({ timeout: 5000 });
    await confirmBtn.click();
    await expect(contentPage.locator('.el-message-box')).toBeHidden({ timeout: 5000 });
    await expect(contentLogoPreview).not.toHaveAttribute('src', /^data:image\//, { timeout: 5000 });
    const storedLogo = await contentPage.evaluate(() => {
      return localStorage.getItem('settings/app/logo');
    });
    expect(storedLogo).toBeNull();
    await topBarPage.waitForTimeout(500);
    await expect(logo).not.toHaveAttribute('src', /^data:image\//, { timeout: 5000 });
  });
});
