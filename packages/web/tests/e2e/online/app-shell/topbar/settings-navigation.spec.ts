import { test, expect } from '../../../../fixtures/electron-online.fixture';

test.describe('SettingsNavigation', () => {
  test('点击设置按钮创建Tab并跳转设置页面', async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
    await clearCache();
    await loginAccount();
    const settingsBtn = topBarPage.locator('[data-testid="header-settings-btn"]');
    await expect(settingsBtn).toBeVisible();
    // 记录点击前的Tab数量
    const tabCountBefore = await topBarPage.locator('[data-test-id^="header-tab-item-"]').count();
    await settingsBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证设置Tab已创建
    const tabCountAfter = await topBarPage.locator('[data-test-id^="header-tab-item-"]').count();
    expect(tabCountAfter).toBeGreaterThan(tabCountBefore);
    // 验证设置Tab被高亮
    const settingsTab = topBarPage.locator('[data-test-id^="header-tab-item-"].active').filter({ hasText: /设置|Settings/ });
    await expect(settingsTab).toBeVisible();
    // 验证页面跳转到设置页
    await expect(contentPage).toHaveURL(/.*#\/settings/, { timeout: 5000 });
    // 验证设置页面内容可见
    const settingsMenu = contentPage.locator('[data-testid="settings-menu"]');
    await expect(settingsMenu).toBeVisible({ timeout: 5000 });
  });

  test('多次点击设置按钮不重复创建Tab', async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
    await clearCache();
    await loginAccount();
    const settingsBtn = topBarPage.locator('[data-testid="header-settings-btn"]');
    // 第一次点击
    await settingsBtn.click();
    await contentPage.waitForTimeout(500);
    const tabCountAfterFirst = await topBarPage.locator('[data-test-id^="header-tab-item-"]').count();
    // 第二次点击
    await settingsBtn.click();
    await contentPage.waitForTimeout(500);
    const tabCountAfterSecond = await topBarPage.locator('[data-test-id^="header-tab-item-"]').count();
    // 验证Tab数量没有增加
    expect(tabCountAfterSecond).toBe(tabCountAfterFirst);
    // 验证仍然在设置页面
    await expect(contentPage).toHaveURL(/.*#\/settings/);
  });

  test('在项目工作区点击设置能正常跳转', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    const projectName = await createProject(`设置跳转测试-${Date.now()}`);
    // 验证在项目工作区
    await expect(contentPage).toHaveURL(/.*#\/workbench/);
    const projectTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectName });
    await expect(projectTab).toHaveClass(/active/);
    // 点击设置按钮
    const settingsBtn = topBarPage.locator('[data-testid="header-settings-btn"]');
    await settingsBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证跳转到设置页面
    await expect(contentPage).toHaveURL(/.*#\/settings/, { timeout: 5000 });
    // 验证设置Tab被高亮
    const settingsTab = topBarPage.locator('[data-test-id^="header-tab-item-"].active').filter({ hasText: /设置|Settings/ });
    await expect(settingsTab).toBeVisible();
    // 验证项目Tab不再高亮
    await expect(projectTab).not.toHaveClass(/active/);
  });

  test('关闭设置Tab后再次点击设置按钮重新创建', async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
    await clearCache();
    await loginAccount();
    const settingsBtn = topBarPage.locator('[data-testid="header-settings-btn"]');
    // 打开设置
    await settingsBtn.click();
    await contentPage.waitForTimeout(500);
    const settingsTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: /设置|Settings/ });
    await expect(settingsTab).toBeVisible();
    // 关闭设置Tab
    const closeBtn = settingsTab.locator('[data-test-id^="header-tab-close-btn-"]');
    await closeBtn.click();
    await topBarPage.waitForTimeout(300);
    await expect(settingsTab).toBeHidden();
    // 再次点击设置按钮
    await settingsBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证设置Tab重新出现并高亮
    const newSettingsTab = topBarPage.locator('[data-test-id^="header-tab-item-"].active').filter({ hasText: /设置|Settings/ });
    await expect(newSettingsTab).toBeVisible();
    // 验证页面在设置页
    await expect(contentPage).toHaveURL(/.*#\/settings/);
  });

  test('设置Tab图标显示正确', async ({ topBarPage, contentPage, clearCache, loginAccount, jumpToSettings }) => {
    await clearCache();
    await loginAccount();
    await jumpToSettings();
    // 验证设置Tab存在且显示Settings图标
    const settingsTab = topBarPage.locator('[data-test-id^="header-tab-item-"].active').filter({ hasText: /设置|Settings/ });
    await expect(settingsTab).toBeVisible();
    const settingsTabIcon = settingsTab.locator('.tab-icon');
    await expect(settingsTabIcon).toBeVisible();
    await expect(settingsTabIcon).toHaveClass(/tab-icon/);
  });
});
