import { test, expect } from '../../../fixtures/electron-online.fixture.ts';

test.describe('CookieManagement', () => {
  test.beforeEach(async ({ topBarPage, contentPage, clearCache }) => {
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
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: / 新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(`在线项目-${Date.now()}`);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
  });

  test('打开Cookie管理页面,显示Cookie列表和操作按钮', async ({ contentPage }) => {
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const cookieItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /Cookie管理|Cookies/ });
    await cookieItem.click();
    await contentPage.waitForTimeout(500);
    const cookiePage = contentPage.locator('.cookies-page');
    await expect(cookiePage).toBeVisible({ timeout: 5000 });
    const title = cookiePage.locator('.title');
    await expect(title).toContainText(/Cookies 管理/);
    const searchInput = cookiePage.locator('input[placeholder*="名称"]');
    await expect(searchInput).toBeVisible();
    const domainSelect = cookiePage.locator('.el-select');
    await expect(domainSelect).toBeVisible();
    const addBtn = cookiePage.locator('.el-button--primary').filter({ hasText: /新增 Cookie/ });
    await expect(addBtn).toBeVisible();
    const batchDeleteBtn = cookiePage.locator('.el-button--danger').filter({ hasText: /批量删除/ });
    await expect(batchDeleteBtn).toBeVisible();
  });

  test('新增Cookie成功,Cookie显示在列表中', async ({ contentPage }) => {
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const cookieItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /Cookie管理|Cookies/ });
    await cookieItem.click();
    await contentPage.waitForTimeout(500);
    const cookiePage = contentPage.locator('.cookies-page');
    await expect(cookiePage).toBeVisible({ timeout: 5000 });
    const addBtn = cookiePage.locator('.el-button--primary').filter({ hasText: /新增 Cookie/ });
    await addBtn.click();
    const dialog = contentPage.locator('.el-dialog').filter({ hasText: /新增 Cookie/ });
    await expect(dialog).toBeVisible({ timeout: 5000 });
    const nameInput = dialog.locator('.el-form-item').filter({ hasText: /名称/ }).locator('input');
    await nameInput.fill('testCookie');
    const valueInput = dialog.locator('.el-form-item').filter({ hasText: /值/ }).locator('textarea');
    await valueInput.fill('testValue123');
    const saveBtn = dialog.locator('.el-button--primary').filter({ hasText: /保存/ });
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    await expect(dialog).not.toBeVisible({ timeout: 5000 });
    const cookieTable = cookiePage.locator('.el-table');
    await expect(cookieTable).toContainText('testCookie');
    await expect(cookieTable).toContainText('testValue123');
  });

  test('编辑Cookie成功,Cookie值被更新', async ({ contentPage }) => {
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const cookieItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /Cookie管理|Cookies/ });
    await cookieItem.click();
    await contentPage.waitForTimeout(500);
    const cookiePage = contentPage.locator('.cookies-page');
    await expect(cookiePage).toBeVisible({ timeout: 5000 });
    const addBtn = cookiePage.locator('.el-button--primary').filter({ hasText: /新增 Cookie/ });
    await addBtn.click();
    const addDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增 Cookie/ });
    await expect(addDialog).toBeVisible({ timeout: 5000 });
    const nameInput = addDialog.locator('.el-form-item').filter({ hasText: /名称/ }).locator('input');
    await nameInput.fill('editableCookie');
    const valueInput = addDialog.locator('.el-form-item').filter({ hasText: /值/ }).locator('textarea');
    await valueInput.fill('originalValue');
    const saveBtn = addDialog.locator('.el-button--primary').filter({ hasText: /保存/ });
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    const editBtn = cookiePage.locator('.el-table .el-button').filter({ hasText: /编辑/ }).first();
    await editBtn.click();
    const editDialog = contentPage.locator('.el-dialog').filter({ hasText: /编辑 Cookie/ });
    await expect(editDialog).toBeVisible({ timeout: 5000 });
    const editValueInput = editDialog.locator('.el-form-item').filter({ hasText: /值/ }).locator('textarea');
    await editValueInput.fill('updatedValue');
    const editSaveBtn = editDialog.locator('.el-button--primary').filter({ hasText: /保存/ });
    await editSaveBtn.click();
    await contentPage.waitForTimeout(500);
    await expect(editDialog).not.toBeVisible({ timeout: 5000 });
    const cookieTable = cookiePage.locator('.el-table');
    await expect(cookieTable).toContainText('updatedValue');
  });

  test('删除Cookie成功,Cookie从列表中移除', async ({ contentPage }) => {
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const cookieItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /Cookie管理|Cookies/ });
    await cookieItem.click();
    await contentPage.waitForTimeout(500);
    const cookiePage = contentPage.locator('.cookies-page');
    await expect(cookiePage).toBeVisible({ timeout: 5000 });
    const addBtn = cookiePage.locator('.el-button--primary').filter({ hasText: /新增 Cookie/ });
    await addBtn.click();
    const addDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增 Cookie/ });
    await expect(addDialog).toBeVisible({ timeout: 5000 });
    const nameInput = addDialog.locator('.el-form-item').filter({ hasText: /名称/ }).locator('input');
    await nameInput.fill('deletableCookie');
    const valueInput = addDialog.locator('.el-form-item').filter({ hasText: /值/ }).locator('textarea');
    await valueInput.fill('deleteMe');
    const saveBtn = addDialog.locator('.el-button--primary').filter({ hasText: /保存/ });
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    const cookieTable = cookiePage.locator('.el-table');
    await expect(cookieTable).toContainText('deletableCookie');
    const deleteBtn = cookiePage.locator('.el-table .el-button--danger').filter({ hasText: /删除/ }).first();
    await deleteBtn.click();
    const confirmDialog = contentPage.locator('.el-message-box');
    await expect(confirmDialog).toBeVisible({ timeout: 3000 });
    const confirmBtn = confirmDialog.locator('.el-button--primary');
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    await expect(cookieTable).not.toContainText('deletableCookie');
  });

  test('按名称搜索Cookie,列表显示匹配的Cookie', async ({ contentPage }) => {
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const cookieItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /Cookie管理|Cookies/ });
    await cookieItem.click();
    await contentPage.waitForTimeout(500);
    const cookiePage = contentPage.locator('.cookies-page');
    await expect(cookiePage).toBeVisible({ timeout: 5000 });
    const addBtn = cookiePage.locator('.el-button--primary').filter({ hasText: /新增 Cookie/ });
    await addBtn.click();
    let addDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增 Cookie/ });
    await expect(addDialog).toBeVisible({ timeout: 5000 });
    let nameInput = addDialog.locator('.el-form-item').filter({ hasText: /名称/ }).locator('input');
    await nameInput.fill('searchCookie');
    let valueInput = addDialog.locator('.el-form-item').filter({ hasText: /值/ }).locator('textarea');
    await valueInput.fill('searchValue');
    let saveBtn = addDialog.locator('.el-button--primary').filter({ hasText: /保存/ });
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    await addBtn.click();
    addDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增 Cookie/ });
    await expect(addDialog).toBeVisible({ timeout: 5000 });
    nameInput = addDialog.locator('.el-form-item').filter({ hasText: /名称/ }).locator('input');
    await nameInput.fill('otherCookie');
    valueInput = addDialog.locator('.el-form-item').filter({ hasText: /值/ }).locator('textarea');
    await valueInput.fill('otherValue');
    saveBtn = addDialog.locator('.el-button--primary').filter({ hasText: /保存/ });
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    const cookieTable = cookiePage.locator('.el-table');
    await expect(cookieTable).toContainText('searchCookie');
    await expect(cookieTable).toContainText('otherCookie');
    const searchInput = cookiePage.locator('input[placeholder*="名称"]');
    await searchInput.fill('search');
    await contentPage.waitForTimeout(300);
    await expect(cookieTable).toContainText('searchCookie');
    await expect(cookieTable).not.toContainText('otherCookie');
  });
});
