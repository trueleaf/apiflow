import { test, expect } from '../../../../fixtures/electron.fixture';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe('Logo', () => {
  test('点击logo跳转主页面', async ({ topBarPage, contentPage, clearCache, jumpToSettings }) => {
    await clearCache();
    await jumpToSettings();
    // 从设置页点击 logo 返回首页
    const logo = topBarPage.locator('[data-test-id="header-logo"]');
    await expect(logo).toBeVisible();
    await logo.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    // 校验首页关键元素可见
    const homeTabs = contentPage.locator('[data-testid="home-tabs"]');
    await expect(homeTabs).toBeVisible({ timeout: 5000 });
    const projectSearchInput = contentPage.locator('[data-testid="home-project-search-input"]');
    await expect(projectSearchInput).toBeVisible({ timeout: 5000 });
  });
  test('设置页面更改应用图标后logo立马被更新, 刷新页面保持更新后的图标', async ({ topBarPage, contentPage, clearCache, jumpToSettings, reload }) => {
    await clearCache();
    await jumpToSettings();
    // 进入通用配置 -> 应用配置
    const commonSettingsMenu = contentPage.locator('[data-testid="settings-menu-common-settings"]');
    await expect(commonSettingsMenu).toBeVisible();
    await commonSettingsMenu.click();
    const appConfigTab = contentPage.locator('.tab-label').filter({ hasText: '应用配置' });
    await expect(appConfigTab).toBeVisible();
    await appConfigTab.click();
    const logoContainer = contentPage.locator('.logo-container');
    await expect(logoContainer).toBeVisible();
    // 上传自定义图标并等待设置页预览更新
    const testImagePath = path.resolve(__dirname, '../../../../../src/renderer/assets/imgs/test.png');
    const fileChooserPromise = contentPage.waitForEvent('filechooser');
    await logoContainer.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(testImagePath);
    const contentLogoPreview = contentPage.locator('.logo-container .image-preview');
    await expect(contentLogoPreview).toBeVisible({ timeout: 5000 });
    await expect(contentLogoPreview).toHaveAttribute('src', /^data:image\//, { timeout: 5000 });
    // 校验顶部 logo 通过 IPC 同步为新图标
    const logoBeforeRefresh = topBarPage.locator('[data-test-id="header-logo"]');
    await expect(logoBeforeRefresh).toHaveAttribute('src', /^data:image\//, { timeout: 5000 });
    const storedLogo = await contentPage.evaluate(() => {
      return localStorage.getItem('settings/app/logo');
    });
    expect(storedLogo).toBeTruthy();
    expect(storedLogo).toMatch(/^data:image\//);
    // 刷新后再次校验缓存与顶部 logo 保持一致
    await reload();
    await expect(topBarPage.locator('[data-test-id="header-logo"]')).toHaveAttribute('src', /^data:image\//, { timeout: 5000 });
    const storedLogoAfterReload = await contentPage.evaluate(() => {
      return localStorage.getItem('settings/app/logo');
    });
    expect(storedLogoAfterReload).toBeTruthy();
    expect(storedLogoAfterReload).toMatch(/^data:image\//);
  });
  test('点击重置后，图标恢复为默认', async ({ topBarPage, contentPage, clearCache, jumpToSettings }) => {
    await clearCache();
    const logo = topBarPage.locator('[data-test-id="header-logo"]');
    await expect(logo).toBeVisible();
    await jumpToSettings();
    // 进入应用配置并上传图标
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
    const contentLogoPreview = contentPage.locator('.logo-container .image-preview');
    await expect(contentLogoPreview).toBeVisible();
    await expect(contentLogoPreview).toHaveAttribute('src', /^data:image\//, { timeout: 5000 });
    // 执行重置并确认
    const resetBtn = contentPage.locator('.panel-actions .el-button').filter({ hasText: '重置' });
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();
    const confirmBtn = contentPage.locator('.cl-confirm-footer-right .el-button--primary');
    await expect(confirmBtn).toBeVisible({ timeout: 5000 });
    await confirmBtn.click();
    await expect(contentPage.locator('.cl-confirm-container')).toBeHidden({ timeout: 5000 });
    // 校验预览、缓存与顶部图标全部恢复为默认
    await expect(contentLogoPreview).not.toHaveAttribute('src', /^data:image\//, { timeout: 5000 });
    const storedLogo = await contentPage.evaluate(() => {
      return localStorage.getItem('settings/app/logo');
    });
    expect(storedLogo).toBeNull();
    await expect(logo).not.toHaveAttribute('src', /^data:image\//, { timeout: 5000 });
  });
});


