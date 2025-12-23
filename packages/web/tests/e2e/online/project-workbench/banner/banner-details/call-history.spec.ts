import { test, expect } from '../../../../../fixtures/electron-online.fixture.ts';

test.describe('OnlineCallHistory', () => {
  test('切换到调用历史Tab页,验证Tab切换功能', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
    await clearCache();
    const networkToggle = topBarPage.locator('[data-testid="header-network-toggle"]');
    const networkText = await networkToggle.textContent();
    if (networkText?.includes('离线模式') || networkText?.includes('offline mode')) {
      await networkToggle.click();
      await contentPage.waitForTimeout(500);
    }
    await topBarPage.locator('[data-testid="header-settings-btn"]').click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    await contentPage.locator('[data-testid="settings-menu-common-settings"]').click();
    const serverUrlInput = contentPage.getByPlaceholder(/请输入接口调用地址|Please enter.*address/i);
    await serverUrlInput.fill(serverUrl!);
    const saveBtn = contentPage.getByRole('button', { name: /保存|Save/i });
    if (await saveBtn.isEnabled()) {
      await saveBtn.click();
      await expect(contentPage.getByText(/保存成功|Saved successfully/i)).toBeVisible({ timeout: 5000 });
    }
    const baseUrl = contentPage.url().split('#')[0];
    await contentPage.goto(`${baseUrl}#/login`);
    await expect(contentPage.locator('[data-testid="login-form"]')).toBeVisible({ timeout: 5000 });
    await contentPage.locator('[data-testid="login-username-input"]').fill(loginName!);
    await contentPage.locator('[data-testid="login-password-input"]').fill(password!);
    await contentPage.locator('[data-testid="login-submit-btn"]').click();
    const captchaInput = contentPage.locator('[data-testid="login-captcha-input"]');
    if (await captchaInput.isVisible()) {
      if (!captcha) {
        throw new Error('后端要求验证码，请在 .env.test 中配置 TEST_LOGIN_CAPTCHA');
      }
      await captchaInput.fill(captcha);
      await contentPage.locator('[data-testid="login-submit-btn"]').click();
    }
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const projectName = `在线调用历史-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await contentPage.waitForTimeout(500);
    const bannerTabs = contentPage.locator('[data-testid="banner-tabs"]');
    await expect(bannerTabs).toBeVisible({ timeout: 5000 });
    const listTab = bannerTabs.locator('.clean-tabs__item').filter({ hasText: /接口列表/ });
    const historyTab = bannerTabs.locator('.clean-tabs__item').filter({ hasText: /调用历史/ });
    await expect(listTab).toBeVisible();
    await expect(historyTab).toBeVisible();
    await historyTab.click();
    await contentPage.waitForTimeout(300);
    const sendHistoryComponent = contentPage.locator('.send-history');
    await expect(sendHistoryComponent).toBeVisible({ timeout: 5000 });
    await listTab.click();
    await contentPage.waitForTimeout(300);
    const nodeTree = contentPage.locator('[data-testid="banner-doc-tree"]');
    await expect(nodeTree).toBeVisible({ timeout: 5000 });
  });

  test('调用历史搜索框功能验证', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
    await clearCache();
    const networkToggle = topBarPage.locator('[data-testid="header-network-toggle"]');
    const networkText = await networkToggle.textContent();
    if (networkText?.includes('离线模式') || networkText?.includes('offline mode')) {
      await networkToggle.click();
      await contentPage.waitForTimeout(500);
    }
    await topBarPage.locator('[data-testid="header-settings-btn"]').click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    await contentPage.locator('[data-testid="settings-menu-common-settings"]').click();
    const serverUrlInput = contentPage.getByPlaceholder(/请输入接口调用地址|Please enter.*address/i);
    await serverUrlInput.fill(serverUrl!);
    const saveBtn = contentPage.getByRole('button', { name: /保存|Save/i });
    if (await saveBtn.isEnabled()) {
      await saveBtn.click();
      await expect(contentPage.getByText(/保存成功|Saved successfully/i)).toBeVisible({ timeout: 5000 });
    }
    const baseUrl = contentPage.url().split('#')[0];
    await contentPage.goto(`${baseUrl}#/login`);
    await expect(contentPage.locator('[data-testid="login-form"]')).toBeVisible({ timeout: 5000 });
    await contentPage.locator('[data-testid="login-username-input"]').fill(loginName!);
    await contentPage.locator('[data-testid="login-password-input"]').fill(password!);
    await contentPage.locator('[data-testid="login-submit-btn"]').click();
    const captchaInput = contentPage.locator('[data-testid="login-captcha-input"]');
    if (await captchaInput.isVisible()) {
      if (!captcha) {
        throw new Error('后端要求验证码，请在 .env.test 中配置 TEST_LOGIN_CAPTCHA');
      }
      await captchaInput.fill(captcha);
      await contentPage.locator('[data-testid="login-submit-btn"]').click();
    }
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const projectName = `在线历史搜索-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await contentPage.waitForTimeout(500);
    const bannerTabs = contentPage.locator('[data-testid="banner-tabs"]');
    const historyTab = bannerTabs.locator('.clean-tabs__item').filter({ hasText: /调用历史/ });
    await historyTab.click();
    await contentPage.waitForTimeout(300);
    const searchInput = contentPage.locator('.send-history-search .el-input');
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    const inputElement = searchInput.locator('input');
    await expect(inputElement).toHaveAttribute('placeholder', /过滤历史记录/);
    const searchIcon = searchInput.locator('.el-input__prefix .el-icon');
    await expect(searchIcon).toBeVisible();
    const deleteIcon = searchInput.locator('.clear-history-icon');
    await expect(deleteIcon).toBeVisible();
    await inputElement.fill('test');
    await contentPage.waitForTimeout(400);
    const clearBtn = searchInput.locator('.el-input__clear');
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await expect(inputElement).toHaveValue('');
  });

  test('清空所有历史记录功能验证', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
    await clearCache();
    const networkToggle = topBarPage.locator('[data-testid="header-network-toggle"]');
    const networkText = await networkToggle.textContent();
    if (networkText?.includes('离线模式') || networkText?.includes('offline mode')) {
      await networkToggle.click();
      await contentPage.waitForTimeout(500);
    }
    await topBarPage.locator('[data-testid="header-settings-btn"]').click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    await contentPage.locator('[data-testid="settings-menu-common-settings"]').click();
    const serverUrlInput = contentPage.getByPlaceholder(/请输入接口调用地址|Please enter.*address/i);
    await serverUrlInput.fill(serverUrl!);
    const saveBtn = contentPage.getByRole('button', { name: /保存|Save/i });
    if (await saveBtn.isEnabled()) {
      await saveBtn.click();
      await expect(contentPage.getByText(/保存成功|Saved successfully/i)).toBeVisible({ timeout: 5000 });
    }
    const baseUrl = contentPage.url().split('#')[0];
    await contentPage.goto(`${baseUrl}#/login`);
    await expect(contentPage.locator('[data-testid="login-form"]')).toBeVisible({ timeout: 5000 });
    await contentPage.locator('[data-testid="login-username-input"]').fill(loginName!);
    await contentPage.locator('[data-testid="login-password-input"]').fill(password!);
    await contentPage.locator('[data-testid="login-submit-btn"]').click();
    const captchaInput = contentPage.locator('[data-testid="login-captcha-input"]');
    if (await captchaInput.isVisible()) {
      if (!captcha) {
        throw new Error('后端要求验证码，请在 .env.test 中配置 TEST_LOGIN_CAPTCHA');
      }
      await captchaInput.fill(captcha);
      await contentPage.locator('[data-testid="login-submit-btn"]').click();
    }
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const projectName = `在线清空历史-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await contentPage.waitForTimeout(500);
    const bannerTabs = contentPage.locator('[data-testid="banner-tabs"]');
    const historyTab = bannerTabs.locator('.clean-tabs__item').filter({ hasText: /调用历史/ });
    await historyTab.click();
    await contentPage.waitForTimeout(300);
    const deleteIcon = contentPage.locator('.send-history-search .clear-history-icon');
    await expect(deleteIcon).toBeVisible({ timeout: 5000 });
    await expect(deleteIcon).toHaveAttribute('title', /清空历史记录/);
    await deleteIcon.click();
    await contentPage.waitForTimeout(300);
    const confirmDialog = contentPage.locator('.el-message-box');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    const dialogContent = confirmDialog.locator('.el-message-box__message');
    await expect(dialogContent).toContainText(/确定要清空所有历史记录吗/);
    const cancelBtn = confirmDialog.locator('.el-message-box__btns button').filter({ hasText: /取消/ });
    await cancelBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(confirmDialog).toBeHidden({ timeout: 5000 });
  });

  test('历史记录列表展示验证,包括空状态', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
    await clearCache();
    const networkToggle = topBarPage.locator('[data-testid="header-network-toggle"]');
    const networkText = await networkToggle.textContent();
    if (networkText?.includes('离线模式') || networkText?.includes('offline mode')) {
      await networkToggle.click();
      await contentPage.waitForTimeout(500);
    }
    await topBarPage.locator('[data-testid="header-settings-btn"]').click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    await contentPage.locator('[data-testid="settings-menu-common-settings"]').click();
    const serverUrlInput = contentPage.getByPlaceholder(/请输入接口调用地址|Please enter.*address/i);
    await serverUrlInput.fill(serverUrl!);
    const saveBtn = contentPage.getByRole('button', { name: /保存|Save/i });
    if (await saveBtn.isEnabled()) {
      await saveBtn.click();
      await expect(contentPage.getByText(/保存成功|Saved successfully/i)).toBeVisible({ timeout: 5000 });
    }
    const baseUrl = contentPage.url().split('#')[0];
    await contentPage.goto(`${baseUrl}#/login`);
    await expect(contentPage.locator('[data-testid="login-form"]')).toBeVisible({ timeout: 5000 });
    await contentPage.locator('[data-testid="login-username-input"]').fill(loginName!);
    await contentPage.locator('[data-testid="login-password-input"]').fill(password!);
    await contentPage.locator('[data-testid="login-submit-btn"]').click();
    const captchaInput = contentPage.locator('[data-testid="login-captcha-input"]');
    if (await captchaInput.isVisible()) {
      if (!captcha) {
        throw new Error('后端要求验证码，请在 .env.test 中配置 TEST_LOGIN_CAPTCHA');
      }
      await captchaInput.fill(captcha);
      await contentPage.locator('[data-testid="login-submit-btn"]').click();
    }
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const projectName = `在线空状态-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await contentPage.waitForTimeout(500);
    const bannerTabs = contentPage.locator('[data-testid="banner-tabs"]');
    const historyTab = bannerTabs.locator('.clean-tabs__item').filter({ hasText: /调用历史/ });
    await historyTab.click();
    await contentPage.waitForTimeout(300);
    const historyList = contentPage.locator('.send-history-list');
    await expect(historyList).toBeVisible({ timeout: 5000 });
    const emptyState = contentPage.locator('.send-history-list .empty');
    await expect(emptyState).toBeVisible({ timeout: 5000 });
    await expect(emptyState).toContainText(/暂无历史记录/);
  });

  test('点击历史记录项打开对应接口Tab页', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
    await clearCache();
    const networkToggle = topBarPage.locator('[data-testid="header-network-toggle"]');
    const networkText = await networkToggle.textContent();
    if (networkText?.includes('离线模式') || networkText?.includes('offline mode')) {
      await networkToggle.click();
      await contentPage.waitForTimeout(500);
    }
    await topBarPage.locator('[data-testid="header-settings-btn"]').click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    await contentPage.locator('[data-testid="settings-menu-common-settings"]').click();
    const serverUrlInput = contentPage.getByPlaceholder(/请输入接口调用地址|Please enter.*address/i);
    await serverUrlInput.fill(serverUrl!);
    const saveBtn = contentPage.getByRole('button', { name: /保存|Save/i });
    if (await saveBtn.isEnabled()) {
      await saveBtn.click();
      await expect(contentPage.getByText(/保存成功|Saved successfully/i)).toBeVisible({ timeout: 5000 });
    }
    const baseUrl = contentPage.url().split('#')[0];
    await contentPage.goto(`${baseUrl}#/login`);
    await expect(contentPage.locator('[data-testid="login-form"]')).toBeVisible({ timeout: 5000 });
    await contentPage.locator('[data-testid="login-username-input"]').fill(loginName!);
    await contentPage.locator('[data-testid="login-password-input"]').fill(password!);
    await contentPage.locator('[data-testid="login-submit-btn"]').click();
    const captchaInput = contentPage.locator('[data-testid="login-captcha-input"]');
    if (await captchaInput.isVisible()) {
      if (!captcha) {
        throw new Error('后端要求验证码，请在 .env.test 中配置 TEST_LOGIN_CAPTCHA');
      }
      await captchaInput.fill(captcha);
      await contentPage.locator('[data-testid="login-submit-btn"]').click();
    }
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const projectName = `在线历史点击-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await contentPage.waitForTimeout(500);
    await contentPage.getByTestId('banner-add-http-btn').click();
    const addApiDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口|Create/ });
    await expect(addApiDialog).toBeVisible({ timeout: 5000 });
    const httpName = '未命名接口';
    await addApiDialog.locator('input').first().fill(httpName);
    await addApiDialog.locator('.el-button--primary').last().click();
    await expect(addApiDialog).toBeHidden({ timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const bannerTree = contentPage.locator('[data-testid="banner-doc-tree"]');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });
    await bannerTree.locator('.el-tree-node__content', { hasText: httpName }).first().click();
    const urlEditor = contentPage.locator('[data-testid="url-input"] .ProseMirror');
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.click();
    await contentPage.keyboard.press('Control+A');
    await contentPage.keyboard.type('http://localhost:3456/echo');
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await expect(sendBtn).toBeVisible({ timeout: 5000 });
    await sendBtn.click();
    await contentPage.waitForTimeout(800);
    const addTabBtn = contentPage.locator('[data-testid="project-nav-add-tab-btn"]');
    await expect(addTabBtn).toBeVisible({ timeout: 5000 });
    await addTabBtn.click();
    await contentPage.waitForTimeout(300);
    const apiTab = contentPage.locator('[data-testid^="project-nav-tab-"]').filter({ hasText: httpName }).first();
    await expect(apiTab).toBeVisible({ timeout: 5000 });
    await expect(apiTab).not.toHaveClass(/active/);
    const bannerTabs = contentPage.locator('[data-testid="banner-tabs"]');
    const historyTab = bannerTabs.locator('.clean-tabs__item').filter({ hasText: /调用历史/ });
    await historyTab.click();
    await contentPage.waitForTimeout(500);
    const historyItem = contentPage.locator('.send-history-list .history-item').first();
    await expect(historyItem).toBeVisible({ timeout: 15000 });
    await historyItem.click();
    await contentPage.waitForTimeout(500);
    await expect(apiTab).toHaveClass(/active/, { timeout: 5000 });
  });

  test('已删除接口的历史记录标记验证', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
    await clearCache();
    const networkToggle = topBarPage.locator('[data-testid="header-network-toggle"]');
    const networkText = await networkToggle.textContent();
    if (networkText?.includes('离线模式') || networkText?.includes('offline mode')) {
      await networkToggle.click();
      await contentPage.waitForTimeout(500);
    }
    await topBarPage.locator('[data-testid="header-settings-btn"]').click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    await contentPage.locator('[data-testid="settings-menu-common-settings"]').click();
    const serverUrlInput = contentPage.getByPlaceholder(/请输入接口调用地址|Please enter.*address/i);
    await serverUrlInput.fill(serverUrl!);
    const saveBtn = contentPage.getByRole('button', { name: /保存|Save/i });
    if (await saveBtn.isEnabled()) {
      await saveBtn.click();
      await expect(contentPage.getByText(/保存成功|Saved successfully/i)).toBeVisible({ timeout: 5000 });
    }
    const baseUrl = contentPage.url().split('#')[0];
    await contentPage.goto(`${baseUrl}#/login`);
    await expect(contentPage.locator('[data-testid="login-form"]')).toBeVisible({ timeout: 5000 });
    await contentPage.locator('[data-testid="login-username-input"]').fill(loginName!);
    await contentPage.locator('[data-testid="login-password-input"]').fill(password!);
    await contentPage.locator('[data-testid="login-submit-btn"]').click();
    const captchaInput = contentPage.locator('[data-testid="login-captcha-input"]');
    if (await captchaInput.isVisible()) {
      if (!captcha) {
        throw new Error('后端要求验证码，请在 .env.test 中配置 TEST_LOGIN_CAPTCHA');
      }
      await captchaInput.fill(captcha);
      await contentPage.locator('[data-testid="login-submit-btn"]').click();
    }
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const projectName = `在线历史删除-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await contentPage.waitForTimeout(500);
    await contentPage.getByTestId('banner-add-http-btn').click();
    const addApiDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口|Create/ });
    await expect(addApiDialog).toBeVisible({ timeout: 5000 });
    const httpName = '未命名接口';
    await addApiDialog.locator('input').first().fill(httpName);
    await addApiDialog.locator('.el-button--primary').last().click();
    await expect(addApiDialog).toBeHidden({ timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const bannerTree = contentPage.locator('[data-testid="banner-doc-tree"]');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });
    const httpRow = bannerTree.locator('.el-tree-node__content', { hasText: httpName }).first();
    await httpRow.click();
    const urlEditor = contentPage.locator('[data-testid="url-input"] .ProseMirror');
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.click();
    await contentPage.keyboard.press('Control+A');
    await contentPage.keyboard.type('http://localhost:3456/echo');
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await expect(sendBtn).toBeVisible({ timeout: 5000 });
    await sendBtn.click();
    await contentPage.waitForTimeout(800);
    await httpRow.click({ button: 'right' });
    const deleteMenuItem = contentPage.locator('.s-contextmenu-item').filter({ hasText: /删除|Delete/ }).first();
    await expect(deleteMenuItem).toBeVisible({ timeout: 5000 });
    await deleteMenuItem.click();
    const confirmBtn = contentPage.locator('.el-message-box__btns .el-button--primary');
    await expect(confirmBtn).toBeVisible({ timeout: 5000 });
    await confirmBtn.click();
    await contentPage.waitForTimeout(800);
    const bannerTabs = contentPage.locator('[data-testid="banner-tabs"]');
    const historyTab = bannerTabs.locator('.clean-tabs__item').filter({ hasText: /调用历史/ });
    await historyTab.click();
    await contentPage.waitForTimeout(500);
    const deletedItem = contentPage.locator('.send-history-list .history-item.deleted-item').first();
    await expect(deletedItem).toBeVisible({ timeout: 15000 });
    const deletedTag = deletedItem.locator('.deleted-tag');
    await expect(deletedTag).toBeVisible({ timeout: 5000 });
    await expect(deletedTag).toContainText(/已删除/);
    const cleanDeletedBtn = contentPage.locator('.clean-deleted-btn');
    await expect(cleanDeletedBtn).toBeVisible({ timeout: 5000 });
  });

  test('历史记录滚动加载验证', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
    await clearCache();
    const networkToggle = topBarPage.locator('[data-testid="header-network-toggle"]');
    const networkText = await networkToggle.textContent();
    if (networkText?.includes('离线模式') || networkText?.includes('offline mode')) {
      await networkToggle.click();
      await contentPage.waitForTimeout(500);
    }
    await topBarPage.locator('[data-testid="header-settings-btn"]').click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    await contentPage.locator('[data-testid="settings-menu-common-settings"]').click();
    const serverUrlInput = contentPage.getByPlaceholder(/请输入接口调用地址|Please enter.*address/i);
    await serverUrlInput.fill(serverUrl!);
    const saveBtn = contentPage.getByRole('button', { name: /保存|Save/i });
    if (await saveBtn.isEnabled()) {
      await saveBtn.click();
      await expect(contentPage.getByText(/保存成功|Saved successfully/i)).toBeVisible({ timeout: 5000 });
    }
    const baseUrl = contentPage.url().split('#')[0];
    await contentPage.goto(`${baseUrl}#/login`);
    await expect(contentPage.locator('[data-testid="login-form"]')).toBeVisible({ timeout: 5000 });
    await contentPage.locator('[data-testid="login-username-input"]').fill(loginName!);
    await contentPage.locator('[data-testid="login-password-input"]').fill(password!);
    await contentPage.locator('[data-testid="login-submit-btn"]').click();
    const captchaInput = contentPage.locator('[data-testid="login-captcha-input"]');
    if (await captchaInput.isVisible()) {
      if (!captcha) {
        throw new Error('后端要求验证码，请在 .env.test 中配置 TEST_LOGIN_CAPTCHA');
      }
      await captchaInput.fill(captcha);
      await contentPage.locator('[data-testid="login-submit-btn"]').click();
    }
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const projectName = `在线历史滚动-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await contentPage.waitForTimeout(500);
    await contentPage.evaluate(async () => {
      const dbName = 'sendHistoryCache';
      const version = 2;
      const storeName = 'histories';
      const openRequest = indexedDB.open(dbName, version);
      const db: IDBDatabase = await new Promise((resolve, reject) => {
        openRequest.onupgradeneeded = () => {
          const upgradeDb = openRequest.result;
          if (!upgradeDb.objectStoreNames.contains(storeName)) {
            const store = upgradeDb.createObjectStore(storeName, { keyPath: '_id' });
            store.createIndex('nodeId', 'nodeId', { unique: false });
            store.createIndex('timestamp', 'timestamp', { unique: false });
            store.createIndex('networkType', 'networkType', { unique: false });
          }
        };
        openRequest.onsuccess = () => resolve(openRequest.result);
        openRequest.onerror = () => reject(openRequest.error);
      });
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const now = Date.now();
      for (let i = 0; i < 31; i += 1) {
        store.put({
          _id: `e2e-online-${now}-${i}`,
          nodeId: `e2e-node-${i}`,
          nodeName: `E2E接口${i}`,
          nodeType: 'http',
          method: 'GET',
          url: `http://localhost:3456/echo?i=${i}`,
          timestamp: now - i,
          operatorName: 'e2e',
          networkType: 'online'
        });
      }
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
      db.close();
    });
    const bannerTabs = contentPage.locator('[data-testid="banner-tabs"]');
    const historyTab = bannerTabs.locator('.clean-tabs__item').filter({ hasText: /调用历史/ });
    await historyTab.click();
    await contentPage.waitForTimeout(300);
    const historyList = contentPage.locator('.send-history-list');
    await expect(historyList).toBeVisible({ timeout: 5000 });
    await expect(contentPage.locator('.send-history-list .history-item').first()).toBeVisible({ timeout: 15000 });
    await historyList.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await expect(contentPage.locator('.send-history-list .no-more')).toBeVisible({ timeout: 15000 });
  });

  test('清理已删除接口历史功能验证', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
    await clearCache();
    const networkToggle = topBarPage.locator('[data-testid="header-network-toggle"]');
    const networkText = await networkToggle.textContent();
    if (networkText?.includes('离线模式') || networkText?.includes('offline mode')) {
      await networkToggle.click();
      await contentPage.waitForTimeout(500);
    }
    await topBarPage.locator('[data-testid="header-settings-btn"]').click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    await contentPage.locator('[data-testid="settings-menu-common-settings"]').click();
    const serverUrlInput = contentPage.getByPlaceholder(/请输入接口调用地址|Please enter.*address/i);
    await serverUrlInput.fill(serverUrl!);
    const saveBtn = contentPage.getByRole('button', { name: /保存|Save/i });
    if (await saveBtn.isEnabled()) {
      await saveBtn.click();
      await expect(contentPage.getByText(/保存成功|Saved successfully/i)).toBeVisible({ timeout: 5000 });
    }
    const baseUrl = contentPage.url().split('#')[0];
    await contentPage.goto(`${baseUrl}#/login`);
    await expect(contentPage.locator('[data-testid="login-form"]')).toBeVisible({ timeout: 5000 });
    await contentPage.locator('[data-testid="login-username-input"]').fill(loginName!);
    await contentPage.locator('[data-testid="login-password-input"]').fill(password!);
    await contentPage.locator('[data-testid="login-submit-btn"]').click();
    const captchaInput = contentPage.locator('[data-testid="login-captcha-input"]');
    if (await captchaInput.isVisible()) {
      if (!captcha) {
        throw new Error('后端要求验证码，请在 .env.test 中配置 TEST_LOGIN_CAPTCHA');
      }
      await captchaInput.fill(captcha);
      await contentPage.locator('[data-testid="login-submit-btn"]').click();
    }
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const projectName = `在线清理历史-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await contentPage.waitForTimeout(500);
    await contentPage.getByTestId('banner-add-http-btn').click();
    const addApiDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口|Create/ });
    await expect(addApiDialog).toBeVisible({ timeout: 5000 });
    const httpName = '未命名接口';
    await addApiDialog.locator('input').first().fill(httpName);
    await addApiDialog.locator('.el-button--primary').last().click();
    await expect(addApiDialog).toBeHidden({ timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const bannerTree = contentPage.locator('[data-testid="banner-doc-tree"]');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });
    const httpRow = bannerTree.locator('.el-tree-node__content', { hasText: httpName }).first();
    await httpRow.click();
    const urlEditor = contentPage.locator('[data-testid="url-input"] .ProseMirror');
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.click();
    await contentPage.keyboard.press('Control+A');
    await contentPage.keyboard.type('http://localhost:3456/echo');
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await expect(sendBtn).toBeVisible({ timeout: 5000 });
    await sendBtn.click();
    await contentPage.waitForTimeout(800);
    await httpRow.click({ button: 'right' });
    const deleteMenuItem = contentPage.locator('.s-contextmenu-item').filter({ hasText: /删除|Delete/ }).first();
    await expect(deleteMenuItem).toBeVisible({ timeout: 5000 });
    await deleteMenuItem.click();
    const confirmBtn = contentPage.locator('.el-message-box__btns .el-button--primary');
    await expect(confirmBtn).toBeVisible({ timeout: 5000 });
    await confirmBtn.click();
    await contentPage.waitForTimeout(800);
    const bannerTabs = contentPage.locator('[data-testid="banner-tabs"]');
    const historyTab = bannerTabs.locator('.clean-tabs__item').filter({ hasText: /调用历史/ });
    await historyTab.click();
    await contentPage.waitForTimeout(300);
    const cleanDeletedBtn = contentPage.locator('.clean-deleted-btn');
    await expect(cleanDeletedBtn).toBeVisible({ timeout: 15000 });
    await expect(cleanDeletedBtn).toContainText(/\(\d+\)/);
    await cleanDeletedBtn.click();
    const confirmDialog = contentPage.locator('.el-message-box');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    const cancelBtn = confirmDialog.locator('.el-message-box__btns button').filter({ hasText: /取消/ });
    await cancelBtn.click();
    await expect(confirmDialog).toBeHidden({ timeout: 5000 });
    await cleanDeletedBtn.click();
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    const confirmClearBtn = confirmDialog.locator('.el-message-box__btns .el-button--primary');
    await expect(confirmClearBtn).toBeVisible({ timeout: 5000 });
    await confirmClearBtn.click();
    await expect(confirmDialog).toBeHidden({ timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const deletedItem = contentPage.locator('.send-history-list .history-item.deleted-item');
    await expect(deletedItem).toHaveCount(0);
    const emptyState = contentPage.locator('.send-history-list .empty');
    await expect(emptyState).toBeVisible({ timeout: 5000 });
    await expect(emptyState).toContainText(/暂无历史记录/);
    await expect(cleanDeletedBtn).toBeHidden({ timeout: 5000 });
  });
});
