import { test, expect } from '../../../../fixtures/electron.fixture';

test.describe('QuickIcons', () => {
  // 验证 AI 按钮打开弹窗且重复点击不会关闭
  test('AI 助理入口可打开并保持弹窗显示', async ({ contentPage, topBarPage, clearCache }) => {
    await clearCache();
    const aiBtn = topBarPage.locator('[data-testid="header-ai-btn"]');
    await expect(aiBtn).toBeVisible({ timeout: 5000 });
    await aiBtn.click();
    const aiDialog = contentPage.locator('.ai-dialog');
    await expect(aiDialog).toBeVisible({ timeout: 5000 });
    await expect(aiDialog.locator('.ai-input-trigger')).toContainText('Agent');
    await aiBtn.click();
    await expect(aiDialog).toBeVisible({ timeout: 5000 });
    await aiBtn.click();
    await expect(aiDialog).toBeVisible({ timeout: 5000 });
  });
  // 验证语言菜单选项完整，切换后文案与刷新持久化一致
  test('语言切换与刷新持久化', async ({ contentPage, topBarPage, clearCache, reload }) => {
    await clearCache();
    const languageBtn = topBarPage.locator('[data-testid="header-language-btn"]');
    await expect(languageBtn).toBeVisible({ timeout: 5000 });
    await languageBtn.click();
    const languageMenu = contentPage.locator('.language-dropdown-menu');
    await expect(languageMenu).toBeVisible({ timeout: 5000 });
    await expect(languageMenu.locator('text=简体中文')).toBeVisible({ timeout: 5000 });
    await expect(languageMenu.locator('text=繁體中文')).toBeVisible({ timeout: 5000 });
    await expect(languageMenu.locator('text=English')).toBeVisible({ timeout: 5000 });
    await expect(languageMenu.locator('text=日本語')).toBeVisible({ timeout: 5000 });
    await languageMenu.locator('text=English').click();
    await expect(languageBtn).toHaveText('EN', { timeout: 5000 });
    await expect(topBarPage.locator('[data-testid="header-home-btn"]')).toContainText('Home', { timeout: 5000 });
    await reload();
    await expect(topBarPage.locator('[data-testid="header-language-btn"]')).toHaveText('EN', { timeout: 10000 });
    await topBarPage.locator('[data-testid="header-language-btn"]').click();
    const languageMenuBack = contentPage.locator('.language-dropdown-menu');
    await expect(languageMenuBack).toBeVisible({ timeout: 5000 });
    await languageMenuBack.locator('text=简体中文').click();
    await expect(topBarPage.locator('[data-testid="header-language-btn"]')).toHaveText('中', { timeout: 5000 });
  });
  // 验证网络模式切换及 tab 过滤行为
  test('网络模式切换后按模式过滤标签页', async ({ topBarPage, contentPage, createProject, clearCache }) => {
    await clearCache();
    const networkBtn = topBarPage.locator('[data-testid="header-network-toggle"]');
    const networkText = networkBtn.locator('.icon-text');
    await expect(networkText).toContainText(/离线模式|Offline/, { timeout: 5000 });
    const offlineProjectName = await createProject(`离线项目-${Date.now()}`);
    const offlineTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: offlineProjectName });
    await expect(offlineTab).toBeVisible({ timeout: 5000 });
    await networkBtn.click();
    await expect.poll(async () => {
      try {
        return await networkText.innerText();
      } catch {
        return '';
      }
    }, { timeout: 15000 }).toMatch(/联网模式|Online|Internet/);
    await expect(offlineTab).toBeHidden({ timeout: 10000 });
    await networkBtn.click();
    await expect.poll(async () => {
      try {
        return await networkText.innerText();
      } catch {
        return '';
      }
    }, { timeout: 15000 }).toMatch(/离线模式|Offline/);
    await expect(offlineTab).toBeVisible({ timeout: 10000 });
  });
});


