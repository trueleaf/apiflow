import { test, expect } from '../../../../fixtures/electron.fixture';

test.describe('SettingsLocalStorageDelete', () => {
  // 本地数据页删除 localStorage 单项后，表格与浏览器缓存应保持一致
  test('离线设置-本地数据页删除单条 localStorage 数据并同步刷新', async ({ contentPage, clearCache, jumpToSettings }) => {
    await clearCache();

    const cacheKey = `e2e/settings-local-delete-${Date.now()}`;
    await contentPage.evaluate((key) => {
      localStorage.setItem(key, JSON.stringify({ from: 'e2e-delete-case' }));
    }, cacheKey);

    await jumpToSettings();

    // 进入本地数据页并刷新 localStorage 列表，确保目标缓存项可见
    const localDataMenu = contentPage.locator('[data-testid="settings-menu-local-data"]');
    await localDataMenu.click();
    await expect(localDataMenu).toHaveClass(/active/, { timeout: 5000 });
    const localStorageCard = contentPage.locator('.cache-card', { hasText: /localStorage 数据/ }).first();
    await localStorageCard.click();
    await expect(localStorageCard).toHaveClass(/selected/, { timeout: 5000 });
    const refreshBtn = localStorageCard.locator('.refresh-btn').first();
    await refreshBtn.click();

    const targetRow = contentPage.locator('.localstorage-detail .el-table__body-wrapper tbody tr').filter({ hasText: cacheKey }).first();
    await expect(targetRow).toBeVisible({ timeout: 10000 });

    // 通过删除确认弹窗删除目标缓存项
    await targetRow.locator('.el-button').filter({ hasText: /^删除$/ }).first().click();
    const confirmDialog = contentPage.locator('.cl-confirm-container').filter({ hasText: /删除确认/ }).first();
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    await confirmDialog.locator('.el-button--primary').click();
    await expect(confirmDialog).toBeHidden({ timeout: 5000 });

    await expect(targetRow).toHaveCount(0, { timeout: 10000 });

    const localStorageValue = await contentPage.evaluate((key) => {
      return localStorage.getItem(key);
    }, cacheKey);
    expect(localStorageValue).toBeNull();
  });
});
