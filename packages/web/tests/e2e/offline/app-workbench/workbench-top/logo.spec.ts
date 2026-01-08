import { test, expect } from '../../../../fixtures/electron.fixture';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe('Logo', () => {
  test('点击logo跳转主页面', async ({ topBarPage, contentPage, clearCache, jumpToSettings }) => {
    await clearCache();
    await jumpToSettings();
    // 点击logo跳转主页面
    const logo = topBarPage.locator('.logo-img');
    await expect(logo).toBeVisible();
    await logo.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    // 验证主页面元素存在
    const homeTabs = contentPage.locator('[data-testid="home-tabs"]');
    await expect(homeTabs).toBeVisible({ timeout: 5000 });
    const projectSearchInput = contentPage.locator('[data-testid="home-project-search-input"]');
    await expect(projectSearchInput).toBeVisible({ timeout: 5000 });
  });
  test('设置页面更改应用图标后logo立马被更新, 刷新页面保持更新后的图标', async ({ topBarPage, contentPage, reload, jumpToSettings }) => {
    // 获取初始Logo的src
    const logo = topBarPage.locator('.logo-img');
    await expect(logo).toBeVisible();
    const initialSrc = await logo.getAttribute('src');
    await jumpToSettings();
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
    await reload();
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
  test('点击重置后，图标恢复为默认', async ({ topBarPage, contentPage, jumpToSettings }) => {
    // 先上传自定义图标
    const logo = topBarPage.locator('.logo-img');
    await expect(logo).toBeVisible();
    await jumpToSettings();
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
    // 等待Logo更新完成
    await expect(contentPage.locator('.loading-indicator')).toBeHidden({ timeout: 10000 });
    // 验证设置页面的 Logo 预览已更新为 base64 格式
    const contentLogoPreview = contentPage.locator('.logo-container .image-preview');
    await expect(contentLogoPreview).toBeVisible();
    await expect(contentLogoPreview).toHaveAttribute('src', /^data:image\//, { timeout: 5000 });
    // 点击重置按钮
    const resetBtn = contentPage.locator('.panel-actions .el-button').filter({ hasText: '重置' });
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();
    // 在确认对话框中点击"确定"
    const confirmBtn = contentPage.locator('.cl-confirm-footer-right .el-button--primary');
    await expect(confirmBtn).toBeVisible({ timeout: 5000 });
    await confirmBtn.click();
    // 等待对话框关闭
    await expect(contentPage.locator('.cl-confirm-container')).toBeHidden({ timeout: 5000 });
    // 验证 Logo 预览恢复为默认（不再是 base64 格式）
    await expect(contentLogoPreview).not.toHaveAttribute('src', /^data:image\//, { timeout: 5000 });
    // 验证 localStorage 中的 logo 被清除
    const storedLogo = await contentPage.evaluate(() => {
      return localStorage.getItem('settings/app/logo');
    });
    expect(storedLogo).toBeNull();
    // 验证 topBarView 的 logo 也恢复为默认
    await topBarPage.waitForTimeout(500);
    await expect(logo).not.toHaveAttribute('src', /^data:image\//, { timeout: 5000 });
  });
});

