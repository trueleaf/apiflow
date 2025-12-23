import { test, expect } from '../../../../../../../fixtures/electron-online.fixture.ts';

const MOCK_SERVER_PORT = 3456;

test.describe('OnlineUrlencodedBodyValidation', () => {
  test('调用echo接口验证urlencoded参数是否正常返回,content-type是否设置正确', async ({ topBarPage, contentPage, clearCache }) => {
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
    const projectName = `在线URLEncoded-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await contentPage.getByTestId('banner-add-http-btn').click();
    const addFileDialog = contentPage.getByTestId('add-file-dialog');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('URLEncoded测试接口');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    const urlEditor = contentPage.locator('[data-testid="url-input"] .ProseMirror');
    await urlEditor.click();
    await contentPage.keyboard.press('Control+A');
    await contentPage.keyboard.type(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
    await postOption.click();
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    const urlencodedRadio = contentPage.locator('.body-mode-item').filter({ hasText: 'x-www-form-urlencoded' }).locator('.el-radio');
    await urlencodedRadio.click();
    await contentPage.waitForTimeout(300);
    const paramsTree = contentPage.locator('.cl-params-tree').first();
    const firstKeyInput = paramsTree.locator('[data-testid="params-tree-key-input"]').first();
    await firstKeyInput.fill('username');
    await contentPage.waitForTimeout(200);
    const firstValueInput = paramsTree.locator('[data-testid="params-tree-value-input"]').nth(0).locator('[contenteditable="true"]');
    await firstValueInput.click();
    await contentPage.keyboard.type('test');
    await contentPage.waitForTimeout(200);
    const secondKeyInput = paramsTree.locator('[data-testid="params-tree-key-input"]').nth(1);
    await secondKeyInput.fill('password');
    await contentPage.waitForTimeout(200);
    const secondValueInput = paramsTree.locator('[data-testid="params-tree-value-input"]').nth(1).locator('[contenteditable="true"]');
    await secondValueInput.click();
    await contentPage.keyboard.type('123456');
    await contentPage.waitForTimeout(200);
    const thirdKeyInput = paramsTree.locator('[data-testid="params-tree-key-input"]').nth(2);
    await thirdKeyInput.fill('remember');
    await contentPage.waitForTimeout(200);
    const thirdValueInput = paramsTree.locator('[data-testid="params-tree-value-input"]').nth(2).locator('[contenteditable="true"]');
    await thirdValueInput.click();
    await contentPage.keyboard.type('true');
    await contentPage.waitForTimeout(200);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    await expect(responseBody).toContainText('method', { timeout: 10000 });
    await expect(responseBody).toContainText('POST', { timeout: 10000 });
    await expect(responseBody).toContainText('username', { timeout: 10000 });
    await expect(responseBody).toContainText('test', { timeout: 10000 });
    await expect(responseBody).toContainText('password', { timeout: 10000 });
    await expect(responseBody).toContainText('123456', { timeout: 10000 });
    await expect(responseBody).toContainText('remember', { timeout: 10000 });
    await expect(responseBody).toContainText('true', { timeout: 10000 });
    await expect(responseBody).toContainText('application/x-www-form-urlencoded', { timeout: 10000 });
    const statusCode = contentPage.locator('[data-testid="status-code"]').first();
    await expect(statusCode).toBeVisible({ timeout: 10000 });
    await expect(statusCode).toContainText('200');
  });

  test('PUT方法配合URLEncoded请求体验证', async ({ topBarPage, contentPage, clearCache }) => {
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
    const projectName = `在线URLEncodedPUT-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await contentPage.getByTestId('banner-add-http-btn').click();
    const addFileDialog = contentPage.getByTestId('add-file-dialog');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('URLEncoded PUT测试接口');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    const urlEditor = contentPage.locator('[data-testid="url-input"] .ProseMirror');
    await urlEditor.click();
    await contentPage.keyboard.press('Control+A');
    await contentPage.keyboard.type(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const putOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'PUT' });
    await putOption.click();
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    const urlencodedRadio = contentPage.locator('.body-mode-item').filter({ hasText: 'x-www-form-urlencoded' }).locator('.el-radio');
    await urlencodedRadio.click();
    await contentPage.waitForTimeout(300);
    const paramsTree = contentPage.locator('.cl-params-tree').first();
    const firstKeyInput = paramsTree.locator('[data-testid="params-tree-key-input"]').first();
    await firstKeyInput.fill('id');
    await contentPage.waitForTimeout(200);
    const firstValueInput = paramsTree.locator('[data-testid="params-tree-value-input"]').nth(0).locator('[contenteditable="true"]');
    await firstValueInput.click();
    await contentPage.keyboard.type('1');
    await contentPage.waitForTimeout(200);
    const secondKeyInput = paramsTree.locator('[data-testid="params-tree-key-input"]').nth(1);
    await secondKeyInput.fill('name');
    await contentPage.waitForTimeout(200);
    const secondValueInput = paramsTree.locator('[data-testid="params-tree-value-input"]').nth(1).locator('[contenteditable="true"]');
    await secondValueInput.click();
    await contentPage.keyboard.type('updated');
    await contentPage.waitForTimeout(200);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    await expect(responseBody).toContainText('method', { timeout: 10000 });
    await expect(responseBody).toContainText('PUT', { timeout: 10000 });
    await expect(responseBody).toContainText('id', { timeout: 10000 });
    await expect(responseBody).toContainText('1', { timeout: 10000 });
    await expect(responseBody).toContainText('name', { timeout: 10000 });
    await expect(responseBody).toContainText('updated', { timeout: 10000 });
    await expect(responseBody).toContainText('application/x-www-form-urlencoded', { timeout: 10000 });
    const statusCode = contentPage.locator('[data-testid="status-code"]').first();
    await expect(statusCode).toBeVisible({ timeout: 10000 });
    await expect(statusCode).toContainText('200');
  });
});
