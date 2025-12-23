import { test, expect } from '../../../../../../../fixtures/electron-online.fixture.ts';

const MOCK_SERVER_PORT = 3456;

test.describe('OnlineJsonBodyValidation', () => {
  test('调用echo接口验证常规json是否正常返回,content-type是否设置正确', async ({ topBarPage, contentPage, clearCache }) => {
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
    const projectName = `在线JSON常规-${Date.now()}`;
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
    await addFileDialog.locator('input').first().fill('JSON常规测试接口');
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
    const jsonRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^json$/i }).locator('.el-radio');
    await jsonRadio.click();
    await contentPage.waitForTimeout(300);
    const monacoEditor = contentPage.locator('.s-json-editor').first();
    await monacoEditor.click({ force: true });
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('{"name":"test","age":20,"active":true}');
    await contentPage.waitForTimeout(300);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('application/json', { timeout: 10000 });
    await expect(responseBody).toContainText('name', { timeout: 10000 });
    await expect(responseBody).toContainText('test', { timeout: 10000 });
    await expect(responseBody).toContainText('age', { timeout: 10000 });
    await expect(responseBody).toContainText('20', { timeout: 10000 });
    await expect(responseBody).toContainText('active', { timeout: 10000 });
    await expect(responseBody).toContainText('true', { timeout: 10000 });
  });

  test('调用echo接口验证使用变量的json是否正常返回,content-type是否设置正确', async ({ topBarPage, contentPage, clearCache }) => {
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
    const projectName = `在线JSON变量-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const variableOption = contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ });
    await variableOption.click();
    await contentPage.waitForTimeout(500);
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const nameInput = variablePage.locator('.left input').first();
    await nameInput.fill('globalVar');
    const valueTextarea = variablePage.locator('.left textarea');
    await valueTextarea.fill('global_value');
    const addBtn = variablePage.locator('.left .el-button--primary');
    await addBtn.click();
    await contentPage.waitForTimeout(500);
    await nameInput.fill('envVar');
    await valueTextarea.fill('env_value');
    await addBtn.click();
    await contentPage.waitForTimeout(500);
    await contentPage.getByTestId('banner-add-http-btn').click();
    const addFileDialog = contentPage.getByTestId('add-file-dialog');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('JSON变量测试接口');
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
    const jsonRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^json$/i }).locator('.el-radio');
    await jsonRadio.click();
    await contentPage.waitForTimeout(300);
    const monacoEditor = contentPage.locator('.s-json-editor').first();
    await monacoEditor.click({ force: true });
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('{"global":"{{globalVar}}","env":"{{envVar}}"}');
    await contentPage.waitForTimeout(300);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('application/json', { timeout: 10000 });
    await expect(responseBody).toContainText('global_value', { timeout: 10000 });
    await expect(responseBody).toContainText('env_value', { timeout: 10000 });
  });

  test('调用echo接口验证使用mock的json是否正常返回,content-type是否设置正确', async ({ topBarPage, contentPage, clearCache }) => {
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
    const projectName = `在线JSONMock-${Date.now()}`;
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
    await addFileDialog.locator('input').first().fill('JSON Mock测试接口');
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
    const jsonRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^json$/i }).locator('.el-radio');
    await jsonRadio.click();
    await contentPage.waitForTimeout(300);
    const monacoEditor = contentPage.locator('.s-json-editor').first();
    await monacoEditor.click({ force: true });
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('{"id":"{{@id}}","name":"{{@cname}}","email":"{{@email}}"}');
    await contentPage.waitForTimeout(300);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('application/json', { timeout: 10000 });
    await expect(responseBody).toContainText('id', { timeout: 10000 });
    await expect(responseBody).toContainText('name', { timeout: 10000 });
    await expect(responseBody).toContainText('email', { timeout: 10000 });
    const responseText = await responseBody.textContent();
    expect(responseText).not.toContain('@id');
    expect(responseText).not.toContain('@cname');
    expect(responseText).not.toContain('@email');
  });

  test('调用echo接口验证基础类型json是否正常返回,content-type是否设置正确', async ({ topBarPage, contentPage, clearCache }) => {
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
    const projectName = `在线JSON基础-${Date.now()}`;
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
    await addFileDialog.locator('input').first().fill('JSON基础类型测试-null');
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
    const jsonRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^json$/i }).locator('.el-radio');
    await jsonRadio.click();
    await contentPage.waitForTimeout(300);
    const monacoEditor = contentPage.locator('.s-json-editor').first();
    await monacoEditor.click({ force: true });
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('null');
    await contentPage.waitForTimeout(300);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('application/json', { timeout: 10000 });
    await expect(responseBody).toContainText('null', { timeout: 10000 });
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('123');
    await contentPage.waitForTimeout(300);
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    await expect(responseBody).toContainText('123', { timeout: 10000 });
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('true');
    await contentPage.waitForTimeout(300);
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    await expect(responseBody).toContainText('true', { timeout: 10000 });
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('"hello world');
    await contentPage.waitForTimeout(300);
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    await expect(responseBody).toContainText('hello world', { timeout: 10000 });
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('[1,2,3');
    await contentPage.waitForTimeout(300);
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    await expect(responseBody).toContainText('1', { timeout: 10000 });
    await expect(responseBody).toContainText('2', { timeout: 10000 });
    await expect(responseBody).toContainText('3', { timeout: 10000 });
  });
});
