import { test, expect } from '../../../fixtures/electron-online.fixture.ts';

test.describe('OnlineSearchProject', () => {
  test('搜索不存在的项目显示空态', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
    if (!serverUrl) {
      test.skip(true, '缺少环境变量 TEST_SERVER_URL（由 .env.test 提供）');
    }
    if (!loginName || !password) {
      test.skip(true, '缺少环境变量 TEST_LOGIN_NAME/TEST_LOGIN_PASSWORD（由 .env.test 提供）');
    }
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
    await contentPage.waitForTimeout(500);
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    await homeBtn.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    await contentPage.waitForTimeout(500);
    const projectName = `在线搜索空态-${Date.now()}`;
    const addProjectBtn = contentPage.locator('[data-testid="home-add-project-btn"]');
    await expect(addProjectBtn).toBeVisible({ timeout: 10000 });
    await addProjectBtn.click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    const projectNameInput = projectDialog.locator('input').first();
    await projectNameInput.fill(projectName);
    const confirmAddBtn = projectDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await homeBtn.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const confirmBtn = contentPage.locator('.el-message-box__btns .el-button--primary');
    if (await confirmBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await confirmBtn.click();
      await contentPage.waitForTimeout(300);
    }
    await contentPage.waitForTimeout(500);
    const projectCards = contentPage.locator('[data-testid^="home-project-card-"]');
    await expect(projectCards.first()).toBeVisible({ timeout: 10000 });
    const searchInput = contentPage.locator('[data-testid="home-project-search-input"]');
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    await searchInput.fill('不存在的项目关键词-xyz');
    await contentPage.waitForTimeout(400);
    await expect(projectCards).toHaveCount(0);
    const emptyContainer = contentPage.locator('.empty-container .el-empty');
    await expect(emptyContainer).toBeVisible({ timeout: 5000 });
  });

  test('搜索匹配项目名称时列表正确过滤', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
    if (!serverUrl) {
      test.skip(true, '缺少环境变量 TEST_SERVER_URL（由 .env.test 提供）');
    }
    if (!loginName || !password) {
      test.skip(true, '缺少环境变量 TEST_LOGIN_NAME/TEST_LOGIN_PASSWORD（由 .env.test 提供）');
    }
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
    await contentPage.waitForTimeout(500);
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    await homeBtn.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    await contentPage.waitForTimeout(500);
    const keyword = `在线搜索-${Date.now()}`;
    const addProjectBtn = contentPage.locator('[data-testid="home-add-project-btn"]');
    await expect(addProjectBtn).toBeVisible({ timeout: 10000 });
    await addProjectBtn.click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    const projectNameInput = projectDialog.locator('input').first();
    await projectNameInput.fill(`项目-${keyword}`);
    const confirmAddBtn = projectDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await homeBtn.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const confirmBtn = contentPage.locator('.el-message-box__btns .el-button--primary');
    if (await confirmBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await confirmBtn.click();
      await contentPage.waitForTimeout(300);
    }
    await contentPage.waitForTimeout(500);
    await addProjectBtn.click();
    const projectDialog2 = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog2).toBeVisible({ timeout: 5000 });
    const projectNameInput2 = projectDialog2.locator('input').first();
    await projectNameInput2.fill(`项目-不匹配-${keyword}`);
    const confirmAddBtn2 = projectDialog2.locator('.el-button--primary').last();
    await confirmAddBtn2.click();
    await expect(projectDialog2).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await homeBtn.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const confirmBtn2 = contentPage.locator('.el-message-box__btns .el-button--primary');
    if (await confirmBtn2.isVisible({ timeout: 500 }).catch(() => false)) {
      await confirmBtn2.click();
      await contentPage.waitForTimeout(300);
    }
    await contentPage.waitForTimeout(500);
    const searchInput = contentPage.locator('[data-testid="home-project-search-input"]');
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    await searchInput.fill(keyword);
    await contentPage.waitForTimeout(500);
    const projectCards = contentPage.locator('[data-testid^="home-project-card-"]');
    await expect(projectCards).toHaveCount(1);
    await expect(projectCards.first().locator('.project-name')).toContainText(keyword);
  });

  test('清空搜索后项目列表恢复展示', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
    if (!serverUrl) {
      test.skip(true, '缺少环境变量 TEST_SERVER_URL（由 .env.test 提供）');
    }
    if (!loginName || !password) {
      test.skip(true, '缺少环境变量 TEST_LOGIN_NAME/TEST_LOGIN_PASSWORD（由 .env.test 提供）');
    }
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
    await contentPage.waitForTimeout(500);
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    await homeBtn.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const keyword = `在线清空-${Date.now()}`;
    const addProjectBtn = contentPage.locator('[data-testid="home-add-project-btn"]');
    await addProjectBtn.click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    const projectNameInput = projectDialog.locator('input').first();
    await projectNameInput.fill(`项目-${keyword}`);
    const confirmAddBtn = projectDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await homeBtn.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const confirmBtn = contentPage.locator('.el-message-box__btns .el-button--primary');
    if (await confirmBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await confirmBtn.click();
      await contentPage.waitForTimeout(300);
    }
    await contentPage.waitForTimeout(500);
    const projectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(projectCard).toBeVisible({ timeout: 10000 });
    const searchInput = contentPage.locator('[data-testid="home-project-search-input"]');
    await searchInput.fill(keyword);
    await contentPage.waitForTimeout(400);
    await expect(projectCard).toBeHidden({ timeout: 5000 });
    const clearBtn = contentPage.locator('[data-testid="home-search-clear-btn"]');
    await expect(clearBtn).toBeVisible({ timeout: 5000 });
    await clearBtn.click();
    await contentPage.waitForTimeout(400);
    await expect(projectCard).toBeVisible({ timeout: 5000 });
  });

  test('高级搜索禁用提示保持不可展开', async ({ topBarPage, contentPage, clearCache }) => {
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
