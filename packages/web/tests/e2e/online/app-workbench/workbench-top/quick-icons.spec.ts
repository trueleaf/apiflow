import { test, expect } from '../../../../fixtures/electron.fixture';

test.describe('QuickIcons', () => {
  test.describe('AI助理按钮', () => {
    test('点击AI助理按钮弹出AI助理弹窗', async ({ contentPage, topBarPage }) => {
      const aiBtn = topBarPage.locator('[data-testid="header-ai-btn"]');
      await expect(aiBtn).toBeVisible();
      await aiBtn.click();
      // 等待AI助理弹窗出现
      const aiDialog = contentPage.locator('.ai-dialog');
      await expect(aiDialog).toBeVisible({ timeout: 5000 });
    });
    test('多次点击AI助理按钮不会关闭弹窗', async ({ contentPage, topBarPage }) => {
      const aiBtn = topBarPage.locator('[data-testid="header-ai-btn"]');
      await aiBtn.click();
      const aiDialog = contentPage.locator('.ai-dialog');
      await expect(aiDialog).toBeVisible({ timeout: 5000 });
      // 再次点击AI按钮
      await aiBtn.click();
      await topBarPage.waitForTimeout(300);
      // 弹窗应该仍然显示
      await expect(aiDialog).toBeVisible();
      // 第三次点击
      await aiBtn.click();
      await topBarPage.waitForTimeout(300);
      await expect(aiDialog).toBeVisible();
    });
  });

  test.describe('多语言切换', () => {
    test('点击语言按钮显示语言选择菜单', async ({ contentPage, topBarPage }) => {
      const languageBtn = topBarPage.locator('[data-testid="header-language-btn"]');
      await expect(languageBtn).toBeVisible();
      // 验证按钮显示当前语言标识
      const btnText = await languageBtn.textContent();
      expect(['中', '繁', 'EN', 'JP']).toContain(btnText?.trim());
      await languageBtn.click();
      // 等待语言菜单出现
      const languageMenu = contentPage.locator('.language-dropdown-menu');
      await expect(languageMenu).toBeVisible({ timeout: 5000 });
    });
    test('语言菜单包含4种语言选项', async ({ contentPage, topBarPage }) => {
      const languageBtn = topBarPage.locator('[data-testid="header-language-btn"]');
      await languageBtn.click();
      const languageMenu = contentPage.locator('.language-dropdown-menu');
      await expect(languageMenu).toBeVisible({ timeout: 5000 });
      // 验证4种语言选项存在
      await expect(languageMenu.locator('text=简体中文')).toBeVisible();
      await expect(languageMenu.locator('text=繁體中文')).toBeVisible();
      await expect(languageMenu.locator('text=English')).toBeVisible();
      await expect(languageMenu.locator('text=日本語')).toBeVisible();
    });
    test('点击语言选项切换语言', async ({ contentPage, topBarPage }) => {
      const languageBtn = topBarPage.locator('[data-testid="header-language-btn"]');
      await languageBtn.click();
      const languageMenu = contentPage.locator('.language-dropdown-menu');
      await expect(languageMenu).toBeVisible({ timeout: 5000 });
      // 点击English选项
      await languageMenu.locator('text=English').click();
      await topBarPage.waitForTimeout(500);
      // 验证语言按钮文字变为EN
      await expect(languageBtn).toHaveText('EN');
      // 验证设置按钮的title变为英文
      const settingsBtn = topBarPage.locator('[data-testid="header-settings-btn"]');
      await expect(settingsBtn).toHaveAttribute('title', 'Settings');
      // 切换回简体中文
      await languageBtn.click();
      const languageMenu2 = contentPage.locator('.language-dropdown-menu');
      await expect(languageMenu2).toBeVisible({ timeout: 5000 });
      await languageMenu2.locator('text=简体中文').click();
      await topBarPage.waitForTimeout(500);
      await expect(languageBtn).toHaveText('中');
    });
    test('点击内容区域关闭语言菜单', async ({ contentPage, topBarPage }) => {
      const languageBtn = topBarPage.locator('[data-testid="header-language-btn"]');
      await languageBtn.click();
      const languageMenu = contentPage.locator('.language-dropdown-menu');
      await expect(languageMenu).toBeVisible({ timeout: 5000 });
      // 点击内容区域关闭菜单（点击遮罩层）
      const overlay = contentPage.locator('.language-menu-overlay');
      await overlay.click();
      await expect(languageMenu).toBeHidden({ timeout: 3000 });
    });
  });

  test.describe('网络模式切换', () => {
    test('网络模式按钮显示当前模式', async ({ topBarPage }) => {
      const networkBtn = topBarPage.locator('[data-testid="header-network-toggle"]');
      await expect(networkBtn).toBeVisible();
      // 验证按钮显示模式文字
      const btnText = await networkBtn.textContent();
      expect(btnText).toMatch(/联网模式|离线模式|Online|Offline/);
    });
    test('点击网络模式按钮切换模式', async ({ topBarPage }) => {
      const networkBtn = topBarPage.locator('[data-testid="header-network-toggle"]');
      // 获取当前模式
      const initialText = await networkBtn.textContent();
      const isOnline = initialText?.includes('联网') || initialText?.includes('Online');
      await networkBtn.click();
      await topBarPage.waitForTimeout(500);
      // 验证模式切换
      if (isOnline) {
        await expect(networkBtn).toContainText(/离线模式|Offline/);
      } else {
        await expect(networkBtn).toContainText(/联网模式|Online/);
      }
      // 切换回原模式
      await networkBtn.click();
      await topBarPage.waitForTimeout(500);
      if (isOnline) {
        await expect(networkBtn).toContainText(/联网模式|Online/);
      } else {
        await expect(networkBtn).toContainText(/离线模式|Offline/);
      }
    });
    test('网络模式切换后Tab列表按模式过滤', async ({ topBarPage, createProject }) => {
      // 创建一个离线模式的项目
      const networkBtn = topBarPage.locator('[data-testid="header-network-toggle"]');
      const initialText = await networkBtn.textContent();
      const isOnline = initialText?.includes('联网') || initialText?.includes('Online');
      // 如果当前是在线模式，先切换到离线模式
      if (isOnline) {
        await networkBtn.click();
        await topBarPage.waitForTimeout(500);
      }
      // 在离线模式下创建项目
      const offlineProjectName = await createProject(`离线项目-${Date.now()}`);
      // 验证项目Tab存在
      const offlineTab = topBarPage.locator('.tab-item').filter({ hasText: offlineProjectName });
      await expect(offlineTab).toBeVisible();
      // 切换到在线模式
      await networkBtn.click();
      await topBarPage.waitForTimeout(500);
      // 验证离线项目Tab被隐藏
      await expect(offlineTab).toBeHidden();
      // 切换回离线模式
      await networkBtn.click();
      await topBarPage.waitForTimeout(500);
      // 验证离线项目Tab恢复显示
      await expect(offlineTab).toBeVisible();
    });
  });
});
