import { test, expect } from '../../../../fixtures/electron-online.fixture.ts';

test.describe('OnlineRenameNode', () => {
  test('创建 HTTP 节点并重命名', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
    await clearCache();

    const settingsBtn = topBarPage.locator('[data-testid="header-settings-btn"]');
    await settingsBtn.click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });

    const commonSettingsMenu = contentPage.locator('[data-testid="settings-menu-common-settings"]');
    await commonSettingsMenu.click();

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

    const projectName = `在线节点项目-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();

    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });

    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await contentPage.waitForTimeout(500);

    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();

    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('待重命名HTTP节点');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);

    const httpNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '待重命名HTTP节点' });
    await expect(httpNode).toBeVisible({ timeout: 10000 });
    await httpNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);

    const renameItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /重命名|Rename/ });
    await expect(renameItem).toBeVisible({ timeout: 5000 });
    await renameItem.click();
    await contentPage.waitForTimeout(300);

    const renameInput = contentPage.locator('.tree-wrap .rename-ipt').first();
    await expect(renameInput).toBeVisible({ timeout: 5000 });
    await renameInput.fill('新HTTP节点名称');
    await renameInput.press('Enter');

    await contentPage.waitForTimeout(500);
    await expect(contentPage.locator('.el-tree-node__content').filter({ hasText: '新HTTP节点名称' })).toBeVisible({ timeout: 10000 });
  });
});
