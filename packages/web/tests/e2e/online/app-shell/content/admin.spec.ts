import { test, expect } from '../../../../fixtures/electron-online.fixture';
import { hasAdminMenu, openSettings, switchAdminTab, waitForUserListLoaded } from '../../../../fixtures/admin-helper';

test.describe('Online后台管理权限', () => {
  test('管理员账号可看到系统管理菜单并进入用户管理', async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
    await clearCache();
    const loginName1 = process.env.TEST_LOGIN_NAME;
    const password1 = process.env.TEST_LOGIN_PASSWORD;
    const loginName2 = process.env.TEST_LOGIN_NAME2;
    const password2 = process.env.TEST_LOGIN_PASSWORD2;
    if (!loginName1 || !password1) throw new Error('缺少 TEST_LOGIN_NAME/TEST_LOGIN_PASSWORD 环境变量');
    await loginAccount({ loginName: loginName1, password: password1 });
    await openSettings(topBarPage, contentPage);
    let adminReady = await hasAdminMenu(contentPage);
    if (!adminReady) {
      if (!loginName2 || !password2) test.skip(true, '未配置第二账号，且当前账号不是管理员');
      await loginAccount({ loginName: loginName2, password: password2 });
      await openSettings(topBarPage, contentPage);
      adminReady = await hasAdminMenu(contentPage);
    }
    test.skip(!adminReady, '当前测试环境没有管理员账号');
    const adminMenu = contentPage.locator('[data-testid="settings-menu-admin-user"]').first();
    await expect(adminMenu).toBeVisible({ timeout: 5000 });
    await switchAdminTab(contentPage, '用户管理');
    await waitForUserListLoaded(contentPage);
  });

  test('非管理员账号看不到系统管理菜单', async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
    await clearCache();
    const loginName1 = process.env.TEST_LOGIN_NAME;
    const password1 = process.env.TEST_LOGIN_PASSWORD;
    const loginName2 = process.env.TEST_LOGIN_NAME2;
    const password2 = process.env.TEST_LOGIN_PASSWORD2;
    if (!loginName1 || !password1) throw new Error('缺少 TEST_LOGIN_NAME/TEST_LOGIN_PASSWORD 环境变量');
    await loginAccount({ loginName: loginName1, password: password1 });
    await openSettings(topBarPage, contentPage);
    const firstIsAdmin = await hasAdminMenu(contentPage);
    if (firstIsAdmin) {
      if (!loginName2 || !password2) test.skip(true, '未配置第二账号，无法构造非管理员场景');
      await loginAccount({ loginName: loginName2, password: password2 });
      await openSettings(topBarPage, contentPage);
    }
    const adminMenuVisible = await hasAdminMenu(contentPage);
    test.skip(adminMenuVisible, '当前测试环境两个账号均为管理员');
    const adminSectionTitle = contentPage.locator('.sidebar-title').filter({ hasText: /系统管理|System/i }).first();
    await expect(adminSectionTitle).toBeHidden();
    await expect(contentPage.locator('[data-testid="settings-menu-admin-user"]')).toHaveCount(0);
  });

  test('未登录用户进入设置页不会显示系统管理菜单', async ({ topBarPage, contentPage, clearCache }) => {
    await clearCache();
    await openSettings(topBarPage, contentPage);
    await expect(contentPage).toHaveURL(/.*#\/settings.*/);
    const adminSectionTitle = contentPage.locator('.sidebar-title').filter({ hasText: /系统管理|System/i }).first();
    await expect(adminSectionTitle).toBeHidden();
    await expect(contentPage.locator('[data-testid="settings-menu-admin-user"]')).toHaveCount(0);
  });
});
