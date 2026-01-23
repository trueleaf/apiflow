import { test, expect } from '../../../fixtures/electron.fixture';

test.describe('HandshakeMechanism', () => {
  test('应用启动时事件监听器立即可用', async ({ topBarPage, contentPage, clearCache }) => {
    await clearCache();
    // 验证AI助理按钮可用（测试showAiDialog事件）
    const aiBtn = topBarPage.locator('[data-testid="header-ai-btn"]');
    await expect(aiBtn).toBeVisible();
    await aiBtn.click();
    // 如果监听器未注册，contentView不会显示弹窗
    const aiDialog = contentPage.locator('.ai-dialog');
    await expect(aiDialog).toBeVisible({ timeout: 5000 });
    // 关闭弹窗
    const closeBtn = aiDialog.locator('.el-dialog__close');
    await closeBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证语言菜单功能（测试showLanguageMenu事件）
    const languageBtn = topBarPage.locator('[data-testid="header-language-btn"]');
    await languageBtn.click();
    const languageMenu = contentPage.locator('.language-dropdown-menu');
    await expect(languageMenu).toBeVisible({ timeout: 5000 });
  });

  test('设置按钮点击后Tab和页面同步创建', async ({ topBarPage, contentPage, clearCache }) => {
    await clearCache();
    const settingsBtn = topBarPage.locator('[data-testid="header-settings-btn"]');
    await settingsBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证Tab已创建
    const settingsTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: /设置|Settings/ });
    await expect(settingsTab).toBeVisible();
    // 验证页面已跳转（这证明IPC通讯正常）
    await expect(contentPage).toHaveURL(/.*#\/settings/, { timeout: 5000 });
    const settingsMenu = contentPage.locator('[data-testid="settings-menu"]');
    await expect(settingsMenu).toBeVisible({ timeout: 5000 });
  });

  test('网络模式切换后事件监听器仍然正常', async ({ topBarPage, contentPage, clearCache }) => {
    await clearCache();
    const networkBtn = topBarPage.locator('[data-testid="header-network-toggle"]');
    const networkText = networkBtn.locator('.icon-text');
    const onlineTextPattern = /联网模式|Online|Internet/;
    const offlineTextPattern = /离线模式|Offline/;
    // 获取当前模式并切换
    const initialText = await networkText.innerText();
    const isOnline = onlineTextPattern.test(initialText);
    await networkBtn.click();
    // 等待模式切换完成（contentView会刷新）
    if (isOnline) {
      await expect(networkText).toContainText(offlineTextPattern, { timeout: 10000 });
    } else {
      await expect(networkText).toContainText(onlineTextPattern, { timeout: 10000 });
    }
    // 等待刷新完成
    await contentPage.waitForLoadState('domcontentloaded');
    await contentPage.waitForTimeout(1000);
    // 验证切换后AI按钮仍然可用
    const aiBtn = topBarPage.locator('[data-testid="header-ai-btn"]');
    await aiBtn.click();
    const aiDialog = contentPage.locator('.ai-dialog');
    await expect(aiDialog).toBeVisible({ timeout: 5000 });
    // 关闭弹窗
    const closeBtn = aiDialog.locator('.el-dialog__close');
    await closeBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证设置按钮仍然可用
    const settingsBtn = topBarPage.locator('[data-testid="header-settings-btn"]');
    await settingsBtn.click();
    await contentPage.waitForTimeout(500);
    await expect(contentPage).toHaveURL(/.*#\/settings/, { timeout: 5000 });
  });

  test('项目创建后topBar和contentView通讯正常', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    const projectName = await createProject(`通讯测试-${Date.now()}`);
    // 验证topBar收到项目创建通知并添加Tab
    const projectTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectName });
    await expect(projectTab).toBeVisible();
    await expect(projectTab).toHaveClass(/active/);
    // 验证contentView已跳转到项目工作区
    await expect(contentPage).toHaveURL(/.*#\/workbench/, { timeout: 5000 });
  });

  test('快速连续操作不会丢失事件', async ({ topBarPage, contentPage, clearCache }) => {
    await clearCache();
    // 连续点击多个按钮测试事件队列
    const aiBtn = topBarPage.locator('[data-testid="header-ai-btn"]');
    const languageBtn = topBarPage.locator('[data-testid="header-language-btn"]');
    const settingsBtn = topBarPage.locator('[data-testid="header-settings-btn"]');
    // 快速点击AI按钮
    await aiBtn.click();
    await contentPage.waitForTimeout(100);
    // 快速点击语言按钮
    await languageBtn.click();
    await contentPage.waitForTimeout(100);
    // 验证两个UI元素都显示
    const aiDialog = contentPage.locator('.ai-dialog');
    const languageMenu = contentPage.locator('.language-dropdown-menu');
    // AI弹窗应该显示
    await expect(aiDialog).toBeVisible({ timeout: 5000 });
    // 语言菜单也应该显示
    await expect(languageMenu).toBeVisible({ timeout: 5000 });
    // 关闭语言菜单
    const languageOverlay = contentPage.locator('.language-menu-overlay');
    await languageOverlay.click();
    await contentPage.waitForTimeout(300);
    // 关闭AI弹窗
    const closeBtn = aiDialog.locator('.el-dialog__close');
    await closeBtn.click();
    await contentPage.waitForTimeout(300);
    // 点击设置按钮
    await settingsBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证设置功能正常
    await expect(contentPage).toHaveURL(/.*#\/settings/, { timeout: 5000 });
  });

  test('应用刷新后IPC通讯立即恢复', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    const projectName = await createProject(`刷新测试-${Date.now()}`);
    // 点击刷新按钮
    const refreshBtn = topBarPage.locator('[data-testid="header-refresh-btn"]');
    await refreshBtn.click();
    // 等待刷新完成
    await topBarPage.waitForLoadState('domcontentloaded');
    await contentPage.waitForLoadState('domcontentloaded');
    await contentPage.waitForTimeout(1000);
    // 刷新后立即测试IPC通讯
    const aiBtn = topBarPage.locator('[data-testid="header-ai-btn"]');
    await aiBtn.click();
    // 如果监听器未立即注册，这里会失败
    const aiDialog = contentPage.locator('.ai-dialog');
    await expect(aiDialog).toBeVisible({ timeout: 5000 });
  });

  test('Tab切换通知在初始化后立即可用', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    // 创建两个项目
    const projectAName = await createProject(`切换A-${Date.now()}`);
    const projectBName = await createProject(`切换B-${Date.now()}`);
    // 点击项目A的Tab
    const projectATab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectAName });
    await projectATab.click();
    await contentPage.waitForTimeout(500);
    // 验证contentView收到切换通知并加载项目A
    await expect(contentPage).toHaveURL(new RegExp(`.*workbench.*id=${projectAName.match(/\d+$/)?.[0]}`), { timeout: 5000 });
    // 点击项目B的Tab
    const projectBTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectBName });
    await projectBTab.click();
    await contentPage.waitForTimeout(500);
    // 验证contentView切换到项目B
    await expect(contentPage).toHaveURL(new RegExp(`.*workbench.*id=${projectBName.match(/\d+$/)?.[0]}`), { timeout: 5000 });
  });
});
