import { test, expect } from '../../../../fixtures/electron-online.fixture.ts';

test.describe('OnlineNavControl', () => {
  test('点击刷新按钮后Tab状态保持', async ({ topBarPage, contentPage, clearCache }) => {
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
    const projectName = `刷新测试-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    const projectTab = topBarPage.locator('.tab-item').filter({ hasText: projectName });
    await expect(projectTab).toBeVisible();
    await expect(projectTab).toHaveClass(/active/);
    const tabCountBefore = await topBarPage.locator('.tab-item').count();
    const refreshBtn = topBarPage.locator('[data-testid="header-refresh-btn"]');
    await expect(refreshBtn).toBeVisible();
    await refreshBtn.click();
    await topBarPage.waitForLoadState('domcontentloaded');
    await contentPage.waitForLoadState('domcontentloaded');
    await topBarPage.waitForTimeout(1000);
    const projectTabAfterRefresh = topBarPage.locator('.tab-item').filter({ hasText: projectName });
    await expect(projectTabAfterRefresh).toBeVisible({ timeout: 10000 });
    const tabCountAfter = await topBarPage.locator('.tab-item').count();
    expect(tabCountAfter).toBe(tabCountBefore);
    await expect(projectTabAfterRefresh).toHaveClass(/active/);
  });
  test('前进后退按钮按历史栈导航', async ({ topBarPage, contentPage, clearCache }) => {
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
    const projectAName = `项目A-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialogA = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialogA).toBeVisible({ timeout: 5000 });
    await projectDialogA.locator('input').first().fill(projectAName);
    await projectDialogA.locator('.el-button--primary').last().click();
    await expect(projectDialogA).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    const homeBtnA = topBarPage.locator('[data-testid="header-home-btn"]');
    await homeBtnA.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    const confirmBtnA = contentPage.locator('.el-message-box__btns .el-button--primary');
    if (await confirmBtnA.isVisible({ timeout: 1000 }).catch(() => false)) {
      await confirmBtnA.click();
      await topBarPage.waitForTimeout(300);
    }
    const projectBName = `项目B-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialogB = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialogB).toBeVisible({ timeout: 5000 });
    await projectDialogB.locator('input').first().fill(projectBName);
    await projectDialogB.locator('.el-button--primary').last().click();
    await expect(projectDialogB).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    const homeBtnB = topBarPage.locator('[data-testid="header-home-btn"]');
    await homeBtnB.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    const confirmBtnB = contentPage.locator('.el-message-box__btns .el-button--primary');
    if (await confirmBtnB.isVisible({ timeout: 1000 }).catch(() => false)) {
      await confirmBtnB.click();
      await topBarPage.waitForTimeout(300);
    }
    const projectCName = `项目C-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialogC = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialogC).toBeVisible({ timeout: 5000 });
    await projectDialogC.locator('input').first().fill(projectCName);
    await projectDialogC.locator('.el-button--primary').last().click();
    await expect(projectDialogC).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    const projectATab = topBarPage.locator('.tab-item').filter({ hasText: projectAName });
    await projectATab.click();
    await topBarPage.waitForTimeout(300);
    await expect(projectATab).toHaveClass(/active/);
    const settingsBtn = topBarPage.locator('[data-testid="header-settings-btn"]');
    await settingsBtn.click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    const backBtn = topBarPage.locator('[data-testid="header-back-btn"]');
    await expect(backBtn).toBeVisible();
    await backBtn.click();
    await topBarPage.waitForTimeout(500);
    await expect(projectATab).toHaveClass(/active/);
    await expect(contentPage).toHaveURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    const forwardBtn = topBarPage.locator('[data-testid="header-forward-btn"]');
    await expect(forwardBtn).toBeVisible();
    await forwardBtn.click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    await topBarPage.waitForTimeout(500);
    const settingsTab = topBarPage.locator('.tab-item').filter({ hasText: /设置|Settings/ });
    await expect(settingsTab).toBeVisible();
  });
  test('多次后退和前进验证完整历史栈', async ({ topBarPage, contentPage, clearCache }) => {
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
    const projectAName = `历史A-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialogA = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialogA).toBeVisible({ timeout: 5000 });
    await projectDialogA.locator('input').first().fill(projectAName);
    await projectDialogA.locator('.el-button--primary').last().click();
    await expect(projectDialogA).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    const homeBtnA = topBarPage.locator('[data-testid="header-home-btn"]');
    await homeBtnA.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    const confirmBtnA = contentPage.locator('.el-message-box__btns .el-button--primary');
    if (await confirmBtnA.isVisible({ timeout: 1000 }).catch(() => false)) {
      await confirmBtnA.click();
      await topBarPage.waitForTimeout(300);
    }
    const projectBName = `历史B-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialogB = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialogB).toBeVisible({ timeout: 5000 });
    await projectDialogB.locator('input').first().fill(projectBName);
    await projectDialogB.locator('.el-button--primary').last().click();
    await expect(projectDialogB).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    const homeBtnB = topBarPage.locator('[data-testid="header-home-btn"]');
    await homeBtnB.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    const confirmBtnB = contentPage.locator('.el-message-box__btns .el-button--primary');
    if (await confirmBtnB.isVisible({ timeout: 1000 }).catch(() => false)) {
      await confirmBtnB.click();
      await topBarPage.waitForTimeout(300);
    }
    const projectCName = `历史C-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialogC = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialogC).toBeVisible({ timeout: 5000 });
    await projectDialogC.locator('input').first().fill(projectCName);
    await projectDialogC.locator('.el-button--primary').last().click();
    await expect(projectDialogC).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    const projectATab = topBarPage.locator('.tab-item').filter({ hasText: projectAName });
    await projectATab.click();
    await topBarPage.waitForTimeout(300);
    const settingsBtn = topBarPage.locator('[data-testid="header-settings-btn"]');
    await settingsBtn.click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    const backBtn = topBarPage.locator('[data-testid="header-back-btn"]');
    const forwardBtn = topBarPage.locator('[data-testid="header-forward-btn"]');
    await backBtn.click();
    await topBarPage.waitForTimeout(500);
    await expect(projectATab).toHaveClass(/active/);
    await backBtn.click();
    await topBarPage.waitForTimeout(500);
    const projectCTab = topBarPage.locator('.tab-item').filter({ hasText: projectCName });
    await expect(projectCTab).toHaveClass(/active/);
    await forwardBtn.click();
    await topBarPage.waitForTimeout(500);
    await expect(projectATab).toHaveClass(/active/);
    await forwardBtn.click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    await topBarPage.waitForTimeout(500);
    const settingsTab = topBarPage.locator('.tab-item').filter({ hasText: /设置|Settings/ });
    await expect(settingsTab).toBeVisible();
  });
  test('历史栈为空时后退到主页面', async ({ topBarPage, contentPage, clearCache }) => {
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
    await contentPage.reload();
    await contentPage.waitForLoadState('domcontentloaded');
    await topBarPage.reload();
    await topBarPage.waitForLoadState('domcontentloaded');
    await topBarPage.waitForTimeout(500);
    const settingsBtn = topBarPage.locator('[data-testid="header-settings-btn"]');
    await expect(settingsBtn).toBeVisible();
    await settingsBtn.click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    const backBtn = topBarPage.locator('[data-testid="header-back-btn"]');
    await backBtn.click();
    await contentPage.waitForURL(/.*#\/(home)?$/, { timeout: 5000 });
  });
});
