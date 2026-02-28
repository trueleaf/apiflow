import { test, expect } from '../../../../fixtures/electron-online.fixture';

test.describe('QuickIcons', () => {
  // 验证 AI 助理入口可打开弹窗且重复点击不会关闭
  test('AI 助理入口可打开并保持弹窗显示', async ({ contentPage, topBarPage, clearCache, loginAccount }) => {
    await clearCache();
    await loginAccount();
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
  // 验证语言菜单选项完整且切换中英文成功
  test('语言菜单展示并支持中英文切换', async ({ contentPage, topBarPage, clearCache, loginAccount }) => {
    await clearCache();
    await loginAccount();
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
    await languageBtn.click();
    const languageMenuBack = contentPage.locator('.language-dropdown-menu');
    await expect(languageMenuBack).toBeVisible({ timeout: 5000 });
    await languageMenuBack.locator('text=简体中文').click();
    await expect(languageBtn).toHaveText('中', { timeout: 5000 });
  });
  // 验证网络模式切换后标签页按模式过滤
  test('网络模式切换后按模式过滤标签页', async ({ topBarPage, contentPage, clearCache, loginAccount, createProject }) => {
    await clearCache();
    await loginAccount();
    const networkBtn = topBarPage.locator('[data-testid="header-network-toggle"]');
    const networkText = networkBtn.locator('.icon-text');
    const onlineTextPattern = /联网模式|Online|Internet/;
    const offlineTextPattern = /离线模式|Offline/;
    const initialText = await networkText.innerText();
    const isOnline = onlineTextPattern.test(initialText);
    // 先确保处于离线模式并创建离线项目
    if (isOnline) {
      await networkBtn.click();
      await expect.poll(async () => {
        try {
          return await networkText.innerText();
        } catch {
          return '';
        }
      }, { timeout: 15000 }).toMatch(offlineTextPattern);
    }
    const offlineProjectName = await createProject(`离线项目-${Date.now()}`);
    const offlineTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: offlineProjectName });
    await expect(offlineTab).toBeVisible({ timeout: 10000 });
    // 切回在线模式后离线标签应被隐藏
    await networkBtn.click();
    await expect.poll(async () => {
      try {
        return await networkText.innerText();
      } catch {
        return '';
      }
    }, { timeout: 15000 }).toMatch(onlineTextPattern);
    await expect(offlineTab).toBeHidden({ timeout: 10000 });
    // 再切回离线模式并验证标签恢复
    await networkBtn.click();
    await expect.poll(async () => {
      try {
        return await networkText.innerText();
      } catch {
        return '';
      }
    }, { timeout: 15000 }).toMatch(offlineTextPattern);
    await expect(offlineTab).toBeVisible({ timeout: 10000 });
  });
});
