import { test, expect } from '../../../../fixtures/electron.fixture';

test.describe('SettingsSecondaryTabs', () => {
  // 设置页离线可见二级菜单可依次切换并展示对应内容
  test('离线设置二级菜单切换覆盖 local-data/shortcuts/components/ai-settings/about/project-recovery', async ({ contentPage, clearCache, jumpToSettings }) => {
    await clearCache();
    await jumpToSettings();
    // 按菜单顺序执行切换，验证激活态与内容标题一致
    const menuCheckList = [
      { action: 'project-recovery', container: '.project-recovery .page-title', title: '项目回收站' },
      { action: 'local-data', container: '.cache-management .page-title', title: '本地数据管理' },
      { action: 'shortcuts', container: '.shortcuts-settings .page-header', title: '快捷键' },
      { action: 'components', container: '', title: '组件库' },
      { action: 'ai-settings', container: '.ai-settings-container .page-header', title: 'AI 设置' },
      { action: 'about', container: '.about-container .page-header', title: '关于' },
    ];
    for (let i = 0; i < menuCheckList.length; i += 1) {
      const menu = contentPage.locator(`[data-testid="settings-menu-${menuCheckList[i].action}"]`);
      await expect(menu).toBeVisible({ timeout: 5000 });
      await menu.click();
      await expect(menu).toHaveClass(/active/, { timeout: 5000 });
      if (menuCheckList[i].container) {
        const pageContainer = contentPage.locator(menuCheckList[i].container).first();
        await expect(pageContainer).toBeVisible({ timeout: 5000 });
        await expect(pageContainer).toContainText(menuCheckList[i].title, { timeout: 5000 });
      }
    }
  });
  // 二级设置页刷新后应保持 activeTab，不回退到默认菜单
  test('离线设置二级菜单刷新后保持 activeTab', async ({ contentPage, clearCache, jumpToSettings, reload }) => {
    await clearCache();
    await jumpToSettings();
    // 先验证 ai-settings 的刷新保持
    const aiMenu = contentPage.locator('[data-testid="settings-menu-ai-settings"]');
    await aiMenu.click();
    await expect(aiMenu).toHaveClass(/active/, { timeout: 5000 });
    await expect(contentPage.locator('.content-area h2').first()).toContainText('AI 设置', { timeout: 5000 });
    await reload();
    await expect(contentPage).toHaveURL(/.*#\/settings/, { timeout: 10000 });
    await expect(contentPage.locator('[data-testid="settings-menu-ai-settings"]')).toHaveClass(/active/, { timeout: 5000 });
    await expect(contentPage.locator('.content-area h2').first()).toContainText('AI 设置', { timeout: 5000 });
    // 再验证 local-data 的刷新保持
    const localDataMenu = contentPage.locator('[data-testid="settings-menu-local-data"]');
    await localDataMenu.click();
    await expect(localDataMenu).toHaveClass(/active/, { timeout: 5000 });
    await expect(contentPage.locator('.content-area h2').first()).toContainText('本地数据管理', { timeout: 5000 });
    await reload();
    await expect(contentPage).toHaveURL(/.*#\/settings/, { timeout: 10000 });
    await expect(contentPage.locator('[data-testid="settings-menu-local-data"]')).toHaveClass(/active/, { timeout: 5000 });
    await expect(contentPage.locator('.content-area h2').first()).toContainText('本地数据管理', { timeout: 5000 });
  });
  // 切回首页后再次进入设置页，保持上一次选择的二级菜单
  test('离线设置页重入时保持上一次 activeTab', async ({ topBarPage, contentPage, clearCache, jumpToSettings }) => {
    await clearCache();
    await jumpToSettings();
    // 切到关于页并确认激活
    const aboutMenu = contentPage.locator('[data-testid="settings-menu-about"]');
    await aboutMenu.click();
    await expect(aboutMenu).toHaveClass(/active/, { timeout: 5000 });
    await expect(contentPage.locator('.content-area h2').first()).toContainText('关于', { timeout: 5000 });
    // 通过顶部导航离开设置页，再重新进入
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    await homeBtn.click();
    await expect(contentPage).toHaveURL(/.*#\/home/, { timeout: 10000 });
    const settingsBtn = topBarPage.locator('[data-testid="header-settings-btn"]');
    await settingsBtn.click();
    await expect(contentPage).toHaveURL(/.*#\/settings/, { timeout: 10000 });
    // 验证重入后依旧落在 about 菜单
    await expect(contentPage.locator('[data-testid="settings-menu-about"]')).toHaveClass(/active/, { timeout: 5000 });
    await expect(contentPage.locator('.content-area h2').first()).toContainText('关于', { timeout: 5000 });
  });
});
