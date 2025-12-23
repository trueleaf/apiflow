import { test, expect } from '../../../../fixtures/electron-online.fixture.ts';

test.describe('OnlineCreateFolder', () => {
  test('创建文件夹后在树上可见', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
    await clearCache();

    await topBarPage.locator('[data-testid="header-settings-btn"]').click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    await contentPage.locator('[data-testid="settings-menu-common-settings"]').click();

    const serverUrlInput = contentPage.getByPlaceholder(/请输入接口调用地址|Please enter.*address/i);
    await serverUrlInput.fill(serverUrl!);

    const saveSettingsBtn = contentPage.getByRole('button', { name: /保存|Save/i });
    if (await saveSettingsBtn.isEnabled()) {
      await saveSettingsBtn.click();
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

    const projectName = `在线文件夹项目-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });

    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await contentPage.waitForTimeout(500);

    await contentPage.locator('[data-testid="banner-tool-more-btn"]').click();
    await contentPage.waitForTimeout(300);

    const addFolderItem = contentPage.locator('[data-testid="tool-panel-banner-add-folder-btn"]');
    await expect(addFolderItem).toBeVisible({ timeout: 5000 });
    await addFolderItem.click();

    const folderDialog = contentPage.getByTestId('add-folder-dialog');
    await expect(folderDialog).toBeVisible({ timeout: 5000 });

    const folderName = `文件夹-${Date.now()}`;
    await folderDialog.locator('[data-testid="add-folder-name-input"] input').fill(folderName);
    await folderDialog.locator('[data-testid="add-folder-confirm-btn"]').click();

    await contentPage.waitForTimeout(500);
    await expect(contentPage.locator('.el-tree-node__content').filter({ hasText: folderName })).toBeVisible({ timeout: 10000 });
  });
});
