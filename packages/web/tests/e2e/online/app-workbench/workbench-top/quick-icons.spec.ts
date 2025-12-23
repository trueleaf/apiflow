import { test, expect } from '../../../../fixtures/electron-online.fixture.ts';

test.describe('QuickIcons', () => {
  test.describe('AI助理按钮', () => {
    test('点击AI助理按钮弹出AI助理弹窗', async ({ contentPage, topBarPage }) => {
      const aiBtn = topBarPage.locator('[data-testid="header-ai-btn"]');
      await expect(aiBtn).toBeVisible();
      await aiBtn.click();
      const aiDialog = contentPage.locator('.ai-dialog');
      await expect(aiDialog).toBeVisible({ timeout: 5000 });
    });
    test('多次点击AI助理按钮不会关闭弹窗', async ({ contentPage, topBarPage }) => {
      const aiBtn = topBarPage.locator('[data-testid="header-ai-btn"]');
      await aiBtn.click();
      const aiDialog = contentPage.locator('.ai-dialog');
      await expect(aiDialog).toBeVisible({ timeout: 5000 });
      await aiBtn.click();
      await topBarPage.waitForTimeout(300);
      await expect(aiDialog).toBeVisible();
      await aiBtn.click();
      await topBarPage.waitForTimeout(300);
      await expect(aiDialog).toBeVisible();
    });
  });

  test.describe('多语言切换', () => {
    test('点击语言按钮显示语言选择菜单', async ({ contentPage, topBarPage }) => {
      const languageBtn = topBarPage.locator('[data-testid="header-language-btn"]');
      await expect(languageBtn).toBeVisible();
      const btnText = await languageBtn.textContent();
      expect(['中', '繁', 'EN', 'JP']).toContain(btnText?.trim());
      await languageBtn.click();
      const languageMenu = contentPage.locator('.language-dropdown-menu');
      await expect(languageMenu).toBeVisible({ timeout: 5000 });
    });
    test('语言菜单包含4种语言选项', async ({ contentPage, topBarPage }) => {
      const languageBtn = topBarPage.locator('[data-testid="header-language-btn"]');
      await languageBtn.click();
      const languageMenu = contentPage.locator('.language-dropdown-menu');
      await expect(languageMenu).toBeVisible({ timeout: 5000 });
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
      await languageMenu.locator('text=English').click();
      await topBarPage.waitForTimeout(500);
      await expect(languageBtn).toHaveText('EN');
      const settingsBtn = topBarPage.locator('[data-testid="header-settings-btn"]');
      await expect(settingsBtn).toHaveAttribute('title', 'Settings');
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
      const overlay = contentPage.locator('.language-menu-overlay');
      await overlay.click();
      await expect(languageMenu).toBeHidden({ timeout: 3000 });
    });
  });

  test.describe('网络模式切换', () => {
    test('网络模式按钮显示当前模式', async ({ topBarPage }) => {
      const networkBtn = topBarPage.locator('[data-testid="header-network-toggle"]');
      await expect(networkBtn).toBeVisible();
      const btnText = await networkBtn.textContent();
      expect(btnText).toMatch(/联网模式|离线模式|Online|Offline/);
    });
    test('点击网络模式按钮切换模式', async ({ topBarPage }) => {
      const networkBtn = topBarPage.locator('[data-testid="header-network-toggle"]');
      const initialText = await networkBtn.textContent();
      const isOnline = initialText?.includes('联网') || initialText?.includes('Online');
      await networkBtn.click();
      await topBarPage.waitForTimeout(500);
      if (isOnline) {
        await expect(networkBtn).toContainText(/离线模式|Offline/);
      } else {
        await expect(networkBtn).toContainText(/联网模式|Online/);
      }
      await networkBtn.click();
      await topBarPage.waitForTimeout(500);
      if (isOnline) {
        await expect(networkBtn).toContainText(/联网模式|Online/);
      } else {
        await expect(networkBtn).toContainText(/离线模式|Offline/);
      }
    });
    test('网络模式切换后Tab列表按模式过滤', async ({ topBarPage, contentPage }) => {
      const networkBtn = topBarPage.locator('[data-testid="header-network-toggle"]');
      const initialText = await networkBtn.textContent();
      const isOnline = initialText?.includes('联网') || initialText?.includes('Online');
      if (isOnline) {
        await networkBtn.click();
        await topBarPage.waitForTimeout(500);
      }
      const addProjectBtn = topBarPage.locator('[data-testid="header-add-project-btn"]');
      await addProjectBtn.click();
      const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
      await expect(projectDialog).toBeVisible({ timeout: 5000 });
      const projectName = `离线项目-${Date.now()}`;
      await projectDialog.locator('input').first().fill(projectName);
      await projectDialog.locator('.el-button--primary').last().click();
      await expect(projectDialog).toBeHidden({ timeout: 5000 });
      await topBarPage.waitForTimeout(500);
      const offlineTab = topBarPage.locator('.tab-item').filter({ hasText: projectName });
      await expect(offlineTab).toBeVisible();
      await networkBtn.click();
      await topBarPage.waitForTimeout(500);
      await expect(offlineTab).toBeHidden();
      await networkBtn.click();
      await topBarPage.waitForTimeout(500);
      await expect(offlineTab).toBeVisible();
    });
  });
});
