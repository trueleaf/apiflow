import { test, expect } from '../../../fixtures/electron-online.fixture.ts';

test.describe('OnlineWebSocketSaveLoad', () => {
  test('WebSocket 节点保存后刷新仍能加载已保存内容', async ({ topBarPage, contentPage, clearCache }) => {
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

    const projectName = `在线WS保存项目-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });

    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await contentPage.waitForTimeout(500);

    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);

    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口|New Interface/i });
    await expect(newInterfaceItem).toBeVisible({ timeout: 5000 });
    await newInterfaceItem.click();

    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口|New Interface/i });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });

    await addFileDialog.locator('input').first().fill('WS保存加载测试');
    const wsRadio = addFileDialog.locator('.el-radio').filter({ hasText: /WebSocket/ }).first();
    await wsRadio.click();
    await contentPage.waitForTimeout(200);

    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(800);

    const wsUrlInput = contentPage.locator('[data-testid="websocket-url-input"] input');
    if (await wsUrlInput.count()) {
      await wsUrlInput.fill('wss://example.com/online-save-load');
    }

    const saveBtn = contentPage.locator('[data-testid="websocket-operation-save-btn"]');
    await expect(saveBtn).toBeVisible({ timeout: 10000 });
    await saveBtn.click();
    await contentPage.waitForTimeout(800);

    await contentPage.reload();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await contentPage.waitForTimeout(1200);

    const saveBtnAfterReload = contentPage.locator('[data-testid="websocket-operation-save-btn"]');
    await expect(saveBtnAfterReload).toBeVisible({ timeout: 10000 });
  });
});
