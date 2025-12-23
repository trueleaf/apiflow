import { test, expect } from '../../../fixtures/electron-online.fixture.ts';

test.describe('OnlineProjectList', () => {
  test('项目卡片展示名称与进入按钮', async ({ topBarPage, contentPage, clearCache }) => {
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
    await contentPage.waitForTimeout(500);
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    await homeBtn.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const projectName = `在线项目卡片-${Date.now()}`;
    const addProjectBtn = contentPage.locator('[data-testid="home-add-project-btn"]');
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
    const projectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(projectCard).toBeVisible({ timeout: 10000 });
    await expect(projectCard.locator('.project-name')).toContainText(projectName);
    await expect(projectCard.locator('[data-testid="home-project-enter-btn"]')).toBeVisible();
  });

  test('项目卡片包含编辑删除收藏及信息字段', async ({ topBarPage, contentPage, clearCache }) => {
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
    await contentPage.waitForTimeout(500);
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    await homeBtn.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const projectName = `在线卡片字段-${Date.now()}`;
    const addProjectBtn = contentPage.locator('[data-testid="home-add-project-btn"]');
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
    const projectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(projectCard).toBeVisible({ timeout: 10000 });
    await expect(projectCard.locator('.project-name')).toContainText(projectName);
    await expect(projectCard.locator('.operator div[title="编辑"]')).toBeVisible();
    await expect(projectCard.locator('[data-testid="home-project-delete-btn"]')).toBeVisible();
    await expect(projectCard.locator('.operator div[title="收藏"]')).toBeVisible();
    await expect(projectCard.locator('.project-creator')).toBeVisible();
    await expect(projectCard.locator('.project-update-time')).toBeVisible();
    await expect(projectCard.locator('.project-api-count')).toBeVisible();
    await expect(projectCard.locator('[data-testid="home-project-enter-btn"]')).toBeVisible();
  });

  test('点击进入按钮跳转项目工作区并激活 Tab', async ({ topBarPage, contentPage, clearCache }) => {
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
    await contentPage.waitForTimeout(500);
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    await homeBtn.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const projectName = `在线进入项目-${Date.now()}`;
    const addProjectBtn = contentPage.locator('[data-testid="home-add-project-btn"]');
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
    const projectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(projectCard).toBeVisible({ timeout: 10000 });
    await projectCard.locator('[data-testid="home-project-enter-btn"]').click();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 10000 });
    const projectTab = topBarPage.locator('.tab-item').filter({ hasText: projectName });
    await expect(projectTab).toBeVisible({ timeout: 5000 });
    await expect(projectTab).toHaveClass(/active/);
  });

  test('修改项目名称后卡片与 Tab 同步更新', async ({ topBarPage, contentPage, clearCache }) => {
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
    await contentPage.waitForTimeout(500);
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    await homeBtn.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const projectName = `在线重命名-${Date.now()}`;
    const addProjectBtn = contentPage.locator('[data-testid="home-add-project-btn"]');
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
    const projectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(projectCard).toBeVisible({ timeout: 10000 });
    await projectCard.locator('[data-testid="home-project-enter-btn"]').click();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 10000 });
    await homeBtn.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const editIcon = projectCard.locator('.operator div[title="编辑"]');
    await editIcon.click();
    const editDialog = contentPage.locator('.el-dialog').filter({ hasText: /编辑项目|修改项目/ });
    await expect(editDialog).toBeVisible({ timeout: 5000 });
    const newProjectName = `更新后的在线项目-${Date.now()}`;
    const editInput = editDialog.locator('input').first();
    await editInput.fill(newProjectName);
    const confirmEditBtn = editDialog.locator('.el-button--primary').last();
    await confirmEditBtn.click();
    await expect(editDialog).toBeHidden({ timeout: 10000 });
    await expect(contentPage.locator('[data-testid="home-project-card-0"] .project-name')).toContainText(newProjectName, { timeout: 5000 });
    const projectTab = topBarPage.locator('.tab-item').filter({ hasText: newProjectName });
    await expect(projectTab).toBeVisible({ timeout: 5000 });
  });

  test('收藏与取消收藏项目后状态同步', async ({ topBarPage, contentPage, clearCache }) => {
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
    await contentPage.waitForTimeout(500);
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    await homeBtn.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const projectName = `在线收藏-${Date.now()}`;
    const addProjectBtn = contentPage.locator('[data-testid="home-add-project-btn"]');
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
    const projectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(projectCard).toBeVisible({ timeout: 10000 });
    const starBtn = projectCard.locator('.operator div[title="收藏"]');
    await expect(starBtn).toBeVisible({ timeout: 5000 });
    await starBtn.click();
    await contentPage.waitForTimeout(500);
    const starProjectsWrap = contentPage.locator('[data-testid="home-star-projects-wrap"]');
    await expect(starProjectsWrap).toBeVisible({ timeout: 10000 });
    const starProjectCard = contentPage.locator('[data-testid="home-star-project-card-0"]');
    await expect(starProjectCard).toContainText(projectName);
    const unstarBtn = starProjectCard.locator('[data-testid="home-star-project-unstar-btn"]');
    await unstarBtn.click();
    await contentPage.waitForTimeout(500);
    await expect(starProjectsWrap).toBeHidden({ timeout: 5000 });
    const starBtnAfterUnstar = projectCard.locator('.operator div[title="收藏"]');
    await expect(starBtnAfterUnstar).toBeVisible({ timeout: 5000 });
  });

  test('删除项目后支持撤回恢复', async ({ topBarPage, contentPage, clearCache }) => {
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
    await contentPage.waitForTimeout(500);
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    await homeBtn.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const projectName = `在线删除-${Date.now()}`;
    const addProjectBtn = contentPage.locator('[data-testid="home-add-project-btn"]');
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
    const projectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(projectCard).toBeVisible({ timeout: 10000 });
    const deleteBtn = projectCard.locator('[data-testid="home-project-delete-btn"]');
    await deleteBtn.click();
    const confirmDialog = contentPage.locator('.el-message-box');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    const deleteConfirmBtn = confirmDialog.locator('.el-button--primary');
    await deleteConfirmBtn.click();
    await expect(confirmDialog).toBeHidden({ timeout: 5000 });
    await expect(projectCard).toBeHidden({ timeout: 5000 });
    const undoNotification = contentPage.locator('.undo-notification');
    await expect(undoNotification).toBeVisible({ timeout: 5000 });
    const undoBtn = undoNotification.locator('.btn-undo');
    await undoBtn.click();
    await expect(undoNotification).toBeHidden({ timeout: 5000 });
    const restoredProjectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(restoredProjectCard).toBeVisible({ timeout: 5000 });
    await expect(restoredProjectCard.locator('.project-name')).toContainText(projectName);
  });

  test('接口数量展示正确且文件夹不计入', async ({ topBarPage, contentPage, clearCache }) => {
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
    await contentPage.waitForTimeout(500);
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    await homeBtn.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const projectName = `在线接口计数-${Date.now()}`;
    const addProjectBtn = contentPage.locator('[data-testid="home-add-project-btn"]');
    await addProjectBtn.click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    const projectNameInput = projectDialog.locator('input').first();
    await projectNameInput.fill(projectName);
    const confirmAddBtn = projectDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    const addFolderBtn = contentPage.locator('[data-testid="banner-add-folder-btn"]').first();
    await addFolderBtn.click();
    const addFolderDialog = contentPage.locator('[data-testid="add-folder-dialog"]');
    await expect(addFolderDialog).toBeVisible({ timeout: 5000 });
    await addFolderDialog.locator('[data-testid="add-folder-name-input"] input').fill(`目录-${Date.now()}`);
    await addFolderDialog.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog).toBeHidden({ timeout: 10000 });
    const addHttpBtn = contentPage.locator('[data-testid="banner-add-http-btn"]').first();
    await addHttpBtn.click();
    const addApiDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口|Create/ });
    await expect(addApiDialog).toBeVisible({ timeout: 5000 });
    await addApiDialog.locator('input').first().fill(`HTTP-${Date.now()}`);
    await addApiDialog.locator('.el-button--primary').last().click();
    await expect(addApiDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForTimeout(500);
    await addHttpBtn.click();
    const addApiDialog2 = contentPage.locator('.el-dialog').filter({ hasText: /新建接口|Create/ });
    await expect(addApiDialog2).toBeVisible({ timeout: 5000 });
    await addApiDialog2.locator('input').first().fill(`HTTP2-${Date.now()}`);
    await addApiDialog2.locator('.el-button--primary').last().click();
    await expect(addApiDialog2).toBeHidden({ timeout: 10000 });
    await contentPage.waitForTimeout(500);
    await homeBtn.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const confirmBtn = contentPage.locator('.el-message-box__btns .el-button--primary');
    if (await confirmBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await confirmBtn.click();
      await contentPage.waitForTimeout(300);
    }
    await contentPage.waitForTimeout(800);
    const projectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(projectCard).toBeVisible({ timeout: 10000 });
    const apiCount = projectCard.locator('.project-api-count');
    await expect(apiCount).toContainText('2', { timeout: 5000 });
  });
});
