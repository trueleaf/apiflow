import { test, expect } from '../../../../fixtures/electron.fixture';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe('Logo', () => {
  test('点击logo跳转主页面', async ({ topBarPage, contentPage }) => {
    const logo = topBarPage.locator('.logo-img');
    await expect(logo).toBeVisible();
    await logo.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
  });
  test('设置页面更改应用图标后logo立马被更新, 刷新页面保持更新后的图标', async ({ topBarPage, contentPage }) => {
    // 获取初始Logo的src
    const logo = topBarPage.locator('.logo-img');
    await expect(logo).toBeVisible();
    const initialSrc = await logo.getAttribute('src');
    // 通过顶部Header右侧的设置图标按钮跳转到设置页面
    const settingsBtn = topBarPage.locator('[data-testid="header-settings-btn"]');
    await expect(settingsBtn).toBeVisible();
    await settingsBtn.click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    // 点击"通用配置"菜单项
    const commonSettingsMenu = contentPage.locator('[data-testid="settings-menu-common-settings"]');
    await expect(commonSettingsMenu).toBeVisible();
    await commonSettingsMenu.click();
    // 切换到"应用配置" tab
    const appConfigTab = contentPage.locator('.tab-label').filter({ hasText: '应用配置' });
    await expect(appConfigTab).toBeVisible();
    await appConfigTab.click();
    // 定位Logo上传容器
    const logoContainer = contentPage.locator('.logo-container');
    await expect(logoContainer).toBeVisible();
    // 准备文件上传 - 使用项目中已有的logo图片作为测试文件
    const testImagePath = path.resolve(__dirname, '../../../../../src/renderer/assets/imgs/test.png');
    // 监听文件选择器并上传文件
    const fileChooserPromise = contentPage.waitForEvent('filechooser');
    await logoContainer.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(testImagePath);
    // 等待Logo更新完成（等待loading消失）
    await expect(contentPage.locator('.loading-indicator')).toBeHidden({ timeout: 10000 });
    // 验证设置页面的 Logo 预览已更新为 base64 格式
    const contentLogoPreview = contentPage.locator('.logo-container .image-preview');
    await expect(contentLogoPreview).toBeVisible();
    await expect(contentLogoPreview).toHaveAttribute('src', /^data:image\//, { timeout: 5000 });
    const updatedContentSrc = await contentLogoPreview.getAttribute('src');
    expect(updatedContentSrc).not.toBe(initialSrc);
    // 刷新contentPage验证持久化
    await contentPage.reload();
    await contentPage.waitForLoadState('domcontentloaded');
    // 刷新topBarPage验证持久化
    await topBarPage.reload();
    await topBarPage.waitForLoadState('domcontentloaded');
    // 等待握手完成后 topBarView 接收到 contentView 推送的应用设置
    await topBarPage.waitForTimeout(500);
    // 验证刷新后Logo仍然保持更新后的图标
    const logoAfterRefresh = topBarPage.locator('.logo-img');
    await expect(logoAfterRefresh).toBeVisible();
    // 验证localStorage中存储了新Logo
    const storedLogo = await contentPage.evaluate(() => {
      return localStorage.getItem('settings/app/logo');
    });
    expect(storedLogo).toBeTruthy();
    expect(storedLogo).toMatch(/^data:image\//);
    // 等待 topBarView 的 logo 更新为 base64 格式（通过 IPC 从 contentView 同步）
    await expect(logoAfterRefresh).toHaveAttribute('src', /^data:image\//, { timeout: 5000 });
  });
});
