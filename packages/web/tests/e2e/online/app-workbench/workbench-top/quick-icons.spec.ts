import { test, expect } from '../../../../fixtures/electron-online.fixture';

test.describe('QuickIcons', () => {
  test.describe('AI助理按钮', () => {
    test('点击AI助理按钮弹出AI助理弹窗', async ({ contentPage, topBarPage, clearCache, loginAccount }) => {
      // 清空缓存，确保首次打开时使用默认模式
      await clearCache();
      await loginAccount();
      const aiBtn = topBarPage.locator('[data-testid="header-ai-btn"]');
      await expect(aiBtn).toBeVisible();
      await aiBtn.click();
      // 等待AI助理弹窗出现
      const aiDialog = contentPage.locator('.ai-dialog');
      await expect(aiDialog).toBeVisible({ timeout: 5000 });
      // 验证首次打开默认是 Agent 模式
      const modeTrigger = aiDialog.locator('.ai-input-trigger');
      await expect(modeTrigger).toContainText('Agent');
    });
    test('多次点击AI助理按钮不会关闭弹窗', async ({ contentPage, topBarPage, clearCache, loginAccount }) => {
      // 清空缓存，确保首次打开时使用默认模式
      await clearCache();
      await loginAccount();
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
    test('点击语言按钮显示语言选择菜单', async ({ contentPage, topBarPage, loginAccount }) => {
      await loginAccount();
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
    test('语言菜单包含4种语言选项', async ({ contentPage, topBarPage, loginAccount }) => {
      await loginAccount();
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
    test('点击语言选项切换语言', async ({ contentPage, topBarPage, loginAccount }) => {
      await loginAccount();
      const languageBtn = topBarPage.locator('[data-testid="header-language-btn"]');
      await languageBtn.click();
      const languageMenu = contentPage.locator('.language-dropdown-menu');
      await expect(languageMenu).toBeVisible({ timeout: 5000 });
      // 点击English选项
      await languageMenu.locator('text=English').click();
      await topBarPage.waitForTimeout(500);
      // 验证语言按钮文字变为EN
      await expect(languageBtn).toHaveText('EN');
      // 验证其他按钮的文案变为英文（例如首页按钮）
      const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
      await expect(homeBtn).toContainText('Home');
      // 切换回简体中文
      await languageBtn.click();
      const languageMenu2 = contentPage.locator('.language-dropdown-menu');
      await expect(languageMenu2).toBeVisible({ timeout: 5000 });
      await languageMenu2.locator('text=简体中文').click();
      await topBarPage.waitForTimeout(500);
      await expect(languageBtn).toHaveText('中');
    });
    test('点击内容区域关闭语言菜单', async ({ contentPage, topBarPage, loginAccount }) => {
      await loginAccount();
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
    test('网络模式按钮显示当前模式', async ({ topBarPage, loginAccount, clearCache }) => {
      await clearCache();
      await loginAccount();
      const networkBtn = topBarPage.locator('[data-testid="header-network-toggle"]');
      await expect(networkBtn).toBeVisible();
      // 验证按钮显示模式文字
      const btnText = await networkBtn.textContent();
      expect(btnText).toMatch(/联网模式|离线模式|Online|Offline/);
    });
    test('点击网络模式按钮切换模式', async ({ topBarPage, loginAccount,clearCache }) => {
      await clearCache();
      await loginAccount();
      const networkBtn = topBarPage.locator('[data-testid="header-network-toggle"]');
      const networkText = networkBtn.locator('.icon-text');
      const onlineTextPattern = /联网模式|Online|Internet/;
      const offlineTextPattern = /离线模式|Offline/;
      // 获取当前模式
      const initialText = await networkText.innerText();
      const isOnline = onlineTextPattern.test(initialText);
      await networkBtn.click();
      await topBarPage.waitForLoadState('domcontentloaded');
      // 等待模式文案更新（切换过程可能触发重载或存在 IPC 同步延迟）
      const expectedAfterToggle = isOnline ? offlineTextPattern : onlineTextPattern;
      await expect.poll(async () => {
        try {
          return await networkText.innerText();
        } catch {
          return '';
        }
      }, { timeout: 15000 }).toMatch(expectedAfterToggle);
      // 切换回原模式
      await networkBtn.click();
      await topBarPage.waitForLoadState('domcontentloaded');
      // 等待模式文案恢复
      const expectedAfterRestore = isOnline ? onlineTextPattern : offlineTextPattern;
      await expect.poll(async () => {
        try {
          return await networkText.innerText();
        } catch {
          return '';
        }
      }, { timeout: 15000 }).toMatch(expectedAfterRestore);
    });
    test('网络模式切换后Tab列表按模式过滤', async ({ topBarPage, clearCache, createProject, loginAccount }) => {
      await clearCache()
      await loginAccount();
      // 创建一个离线模式的项目
      const networkBtn = topBarPage.locator('[data-testid="header-network-toggle"]');
      const networkText = networkBtn.locator('.icon-text');
      const onlineTextPattern = /联网模式|Online|Internet/;
      const offlineTextPattern = /离线模式|Offline/;
      const initialText = await networkText.innerText();
      const isOnline = onlineTextPattern.test(initialText);
      // 如果当前是在线模式，先切换到离线模式
      if (isOnline) {
        await networkBtn.click();
        await expect(networkText).toContainText(offlineTextPattern);
      }
      // 在离线模式下创建项目
      const offlineProjectName = await createProject(`离线项目-${Date.now()}`);
      // 验证项目Tab存在
      const offlineTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: offlineProjectName });
      await expect(offlineTab).toBeVisible();
      // 切换到在线模式
      await networkBtn.click();
      await expect(networkText).toContainText(onlineTextPattern);
      // 验证离线项目Tab被隐藏
      await expect(offlineTab).toBeHidden();
      // 切换回离线模式
      await networkBtn.click();
      await expect(networkText).toContainText(offlineTextPattern);
      // 验证离线项目Tab恢复显示
      await expect(offlineTab).toBeVisible();
    });
  });

  test.describe('用户菜单', () => {
    test('点击用户头像显示用户菜单', async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
      await clearCache();
      await loginAccount();
      const userMenuBtn = topBarPage.locator('[data-testid="header-user-menu-btn"]');
      await expect(userMenuBtn).toBeVisible();
      await userMenuBtn.click();
      // 等待用户菜单出现
      const userMenu = contentPage.locator('[data-test-id="user-menu"]');
      await expect(userMenu).toBeVisible({ timeout: 5000 });
    });
    test('用户菜单包含退出登录选项', async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
      await clearCache();
      await loginAccount();
      const userMenuBtn = topBarPage.locator('[data-testid="header-user-menu-btn"]');
      await userMenuBtn.click();
      const userMenu = contentPage.locator('[data-test-id="user-menu"]');
      await expect(userMenu).toBeVisible({ timeout: 5000 });
      // 验证退出登录按钮存在
      const logoutBtn = contentPage.locator('[data-test-id="user-menu-logout-btn"]');
      await expect(logoutBtn).toBeVisible();
      await expect(logoutBtn).toContainText(/退出登录|Logout/);
    });
    test('点击退出登录清除用户信息并跳转登录页', async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
      await clearCache();
      await loginAccount();
      // 验证用户头像存在（登录状态）
      const userMenuBtn = topBarPage.locator('[data-testid="header-user-menu-btn"]');
      await expect(userMenuBtn).toBeVisible();
      // 打开用户菜单
      await userMenuBtn.click();
      const userMenu = contentPage.locator('[data-test-id="user-menu"]');
      await expect(userMenu).toBeVisible({ timeout: 5000 });
      // 点击退出登录
      const logoutBtn = contentPage.locator('[data-test-id="user-menu-logout-btn"]');
      await logoutBtn.click();
      // 等待跳转到登录页
      await contentPage.waitForURL(/.*?#?\/login/, { timeout: 5000 });
      // 验证登录页面元素存在
      const loginTabs = contentPage.locator('[data-testid="login-tabs"]');
      await expect(loginTabs).toBeVisible({ timeout: 5000 });
      // 验证用户头像消失（退出登录后）
      await expect(userMenuBtn).toBeHidden();
    });
    test('点击内容区域关闭用户菜单', async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
      await clearCache();
      await loginAccount();
      const userMenuBtn = topBarPage.locator('[data-testid="header-user-menu-btn"]');
      await userMenuBtn.click();
      const userMenu = contentPage.locator('[data-test-id="user-menu"]');
      await expect(userMenu).toBeVisible({ timeout: 5000 });
      // 点击遮罩层关闭菜单
      const overlay = contentPage.locator('[data-test-id="user-menu-overlay"]');
      await overlay.click();
      await expect(userMenu).toBeHidden({ timeout: 3000 });
    });
    test('退出登录后topBar更新用户状态', async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
      await clearCache();
      await loginAccount();
      // 记录登录时的用户头像
      const userMenuBtn = topBarPage.locator('[data-testid="header-user-menu-btn"]');
      await expect(userMenuBtn).toBeVisible();
      // 退出登录
      await userMenuBtn.click();
      const logoutBtn = contentPage.locator('[data-test-id="user-menu-logout-btn"]');
      await logoutBtn.click();
      await contentPage.waitForURL(/.*?#?\/login/, { timeout: 5000 });
      // 验证用户头像不可见
      await expect(userMenuBtn).toBeHidden();
      // 验证网络模式按钮仍然可见（退出后其他按钮正常）
      const networkBtn = topBarPage.locator('[data-testid="header-network-toggle"]');
      await expect(networkBtn).toBeVisible();
    });
  });
});


