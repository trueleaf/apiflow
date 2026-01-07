import { test, expect } from '../../../../fixtures/electron-online.fixture';

test.describe('Online后台管理权限', () => {
  test('管理员账号可看到入口并进入后台管理', async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
    await clearCache();

    const loginName1 = process.env.TEST_LOGIN_NAME;
    const password1 = process.env.TEST_LOGIN_PASSWORD;
    const loginName2 = process.env.TEST_LOGIN_NAME2;
    const password2 = process.env.TEST_LOGIN_PASSWORD2;
    if (!loginName1 || !password1) throw new Error('缺少 TEST_LOGIN_NAME/TEST_LOGIN_PASSWORD 环境变量');

    await loginAccount({ loginName: loginName1, password: password1 });
    const adminBtn = topBarPage.locator('[data-testid="header-admin-btn"]');
    const adminBtnVisible = await adminBtn.isVisible({ timeout: 1000 }).catch(() => false);
    if (!adminBtnVisible) {
      if (!loginName2 || !password2) test.skip(true, '未配置第二账号，且当前账号不是管理员');
      await loginAccount({ loginName: loginName2, password: password2 });
    }

    const finalAdminBtnVisible = await adminBtn.isVisible({ timeout: 1000 }).catch(() => false);
    test.skip(!finalAdminBtnVisible, '当前测试环境没有管理员账号');

    await adminBtn.click();
    await contentPage.waitForURL(/.*#\/admin.*/, { timeout: 10000 });
    await expect(contentPage.locator('.s-permission')).toBeVisible({ timeout: 10000 });
  });

  test('非管理员账号无法进入后台管理路由', async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
    await clearCache();

    const loginName1 = process.env.TEST_LOGIN_NAME;
    const password1 = process.env.TEST_LOGIN_PASSWORD;
    const loginName2 = process.env.TEST_LOGIN_NAME2;
    const password2 = process.env.TEST_LOGIN_PASSWORD2;
    if (!loginName1 || !password1) throw new Error('缺少 TEST_LOGIN_NAME/TEST_LOGIN_PASSWORD 环境变量');

    await loginAccount({ loginName: loginName1, password: password1 });
    const adminBtn = topBarPage.locator('[data-testid="header-admin-btn"]');
    const firstIsAdmin = await adminBtn.isVisible({ timeout: 1000 }).catch(() => false);
    if (firstIsAdmin) {
      if (!loginName2 || !password2) test.skip(true, '未配置第二账号，无法构造非管理员场景');
      await loginAccount({ loginName: loginName2, password: password2 });
    }

    const nonAdminVisible = await adminBtn.isVisible({ timeout: 1000 }).catch(() => false);
    test.skip(nonAdminVisible, '当前测试环境两个账号均为管理员');

    await contentPage.evaluate(() => {
      window.location.hash = '#/admin';
    });
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
    await expect(adminBtn).toBeHidden({ timeout: 2000 });
  });

  test('未登录用户访问/admin路由自动重定向', async ({ topBarPage, contentPage, clearCache }) => {
    await clearCache();

    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
    const adminBtn = topBarPage.locator('[data-testid="header-admin-btn"]');
    await expect(adminBtn).toBeHidden({ timeout: 2000 });

    await contentPage.evaluate(() => {
      window.location.hash = '#/admin';
    });
    await contentPage.waitForLoadState('networkidle');
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
  });
});
