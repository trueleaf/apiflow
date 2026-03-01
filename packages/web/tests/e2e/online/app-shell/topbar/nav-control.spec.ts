import { test, expect } from '../../../../fixtures/electron-online.fixture';

test.describe('NavControl', () => {
  test('前进后退按钮按历史栈导航', async ({ topBarPage, contentPage, loginAccount, jumpToSettings }) => {
    await loginAccount();
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    await homeBtn.click();
    await expect(contentPage).toHaveURL(/.*#\/home/, { timeout: 5000 });
    // 先进入设置页，构造 home -> settings 历史
    await jumpToSettings();
    const settingsTab = topBarPage.locator('[data-test-id^="header-tab-item-"][data-id="settings-online"]');
    await expect(settingsTab).toHaveClass(/active/, { timeout: 5000 });
    const backBtn = topBarPage.locator('[data-testid="header-back-btn"]');
    await backBtn.click();
    await expect(contentPage).toHaveURL(/.*#\/home/, { timeout: 10000 });
    await expect(homeBtn).toHaveClass(/active/, { timeout: 5000 });
    const forwardBtn = topBarPage.locator('[data-testid="header-forward-btn"]');
    await forwardBtn.click();
    await expect(contentPage).toHaveURL(/.*#\/settings/, { timeout: 10000 });
    await expect(settingsTab).toHaveClass(/active/, { timeout: 5000 });
  });
  test('多次后退和前进验证完整历史栈', async ({ topBarPage, contentPage, loginAccount, jumpToSettings }) => {
    await loginAccount();
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    const settingsTab = topBarPage.locator('[data-test-id^="header-tab-item-"][data-id="settings-online"]');
    // 构造 home -> settings -> home -> settings 的多步历史
    await homeBtn.click();
    await expect(contentPage).toHaveURL(/.*#\/home/, { timeout: 5000 });
    await jumpToSettings();
    await expect(settingsTab).toHaveClass(/active/, { timeout: 5000 });
    await homeBtn.click();
    await expect(contentPage).toHaveURL(/.*#\/home/, { timeout: 5000 });
    await jumpToSettings();
    await expect(settingsTab).toHaveClass(/active/, { timeout: 5000 });
    const backBtn = topBarPage.locator('[data-testid="header-back-btn"]');
    const forwardBtn = topBarPage.locator('[data-testid="header-forward-btn"]');
    await backBtn.click();
    await expect(contentPage).toHaveURL(/.*#\/home/, { timeout: 10000 });
    await backBtn.click();
    await expect(contentPage).toHaveURL(/.*#\/settings/, { timeout: 10000 });
    await expect(settingsTab).toHaveClass(/active/, { timeout: 5000 });
    await forwardBtn.click();
    await expect(contentPage).toHaveURL(/.*#\/home/, { timeout: 10000 });
    await expect(homeBtn).toHaveClass(/active/, { timeout: 5000 });
    await forwardBtn.click();
    await expect(contentPage).toHaveURL(/.*#\/settings/, { timeout: 10000 });
    await expect(settingsTab).toHaveClass(/active/, { timeout: 5000 });
  });

  test('历史栈为空时后退到主页面', async ({ topBarPage, contentPage, clearCache, loginAccount, reload, jumpToSettings }) => {
    await clearCache();

    await loginAccount();
    await reload();
    await jumpToSettings();
    // 点击后退按钮，应回到主页面
    const backBtn = topBarPage.locator('[data-testid="header-back-btn"]');
    await backBtn.click();
    // 验证回到主页面
    await contentPage.waitForURL(/.*#\/(home)?$/, { timeout: 5000 });
  });
});


