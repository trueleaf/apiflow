import { test, expect } from '../../../fixtures/electron-online.fixture.ts';

test.describe('OnlineAdvancedSearchDisabled', () => {
  test('互联网模式下高级搜索按钮被禁用并显示仅离线模式可用提示', async ({ contentPage, clearCache }) => {
    await clearCache();

    const advancedBtn = contentPage.locator('[data-testid="home-advanced-search-btn"]');
    await expect(advancedBtn).toBeVisible({ timeout: 5000 });

    const title = await advancedBtn.getAttribute('title');
    await expect(title).toMatch(/仅离线模式可用|Only available in offline mode/i);

    await advancedBtn.click();
    const advancedPanel = contentPage.locator('.advanced-search-panel');
    await expect(advancedPanel).toBeHidden();
  });
});