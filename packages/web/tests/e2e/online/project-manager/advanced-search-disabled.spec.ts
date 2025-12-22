import { test, expect } from '../../../fixtures/electron-online.fixture.ts';

test.describe('OnlineAdvancedSearchDisabled', () => {
  test('互联网模式下高级搜索按钮被禁用并显示仅离线模式可用提示', async ({ topBarPage, contentPage, clearCache }) => {
    await clearCache();

    const networkToggle = topBarPage.locator('[data-testid="header-network-toggle"]');
    const networkText = await networkToggle.textContent();
    if (networkText?.includes('离线模式') || networkText?.includes('offline mode')) {
      await networkToggle.click();
      await contentPage.waitForTimeout(500);
    }

    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });

    const advancedBtn = contentPage.locator('[data-testid="home-advanced-search-btn"]');
    await expect(advancedBtn).toBeVisible({ timeout: 5000 });

    await expect(advancedBtn).toHaveAttribute('title', /仅离线模式可用|Only available in offline mode/i);

    await advancedBtn.click();
    const advancedPanel = contentPage.locator('.advanced-search-panel');
    await expect(advancedPanel).toBeHidden();
  });
});