import { test, expect } from '../../../../../fixtures/electron-online.fixture.ts';

const MOCK_SERVER_PORT = 3456;

test.describe('RequestMethodInput', () => {
  test.beforeEach(async ({ topBarPage, contentPage, clearCache }) => {
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
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: / 新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(`在线项目-${Date.now()}`);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
  });
  // 测试用例1: 正确展示GET, POST, PUT, DEL, PATCH, HEAD, OPTIONS,选择或者点击空白区域下拉菜单消失
  test('正确展示GET,POST,PUT,DEL,PATCH,HEAD,OPTIONS,选择或点击空白区域下拉菜单消失', async ({ contentPage }) => {
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('请求方法下拉测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 点击请求方法下拉框
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    await contentPage.waitForTimeout(300);
    // 验证下拉选项包含所有请求方法
    const options = contentPage.locator('.el-select-dropdown__item');
    await expect(options.filter({ hasText: 'GET' })).toBeVisible({ timeout: 5000 });
    await expect(options.filter({ hasText: 'POST' })).toBeVisible({ timeout: 5000 });
    await expect(options.filter({ hasText: 'PUT' })).toBeVisible({ timeout: 5000 });
    await expect(options.filter({ hasText: 'DEL' })).toBeVisible({ timeout: 5000 });
    await expect(options.filter({ hasText: 'PATCH' })).toBeVisible({ timeout: 5000 });
    await expect(options.filter({ hasText: 'HEAD' })).toBeVisible({ timeout: 5000 });
    await expect(options.filter({ hasText: 'OPTIONS' })).toBeVisible({ timeout: 5000 });
    // 选择POST方法
    const postOption = options.filter({ hasText: 'POST' });
    await postOption.click();
    await contentPage.waitForTimeout(300);
    // 验证下拉菜单关闭,显示选中值
    await expect(methodSelect).toContainText('POST', { timeout: 5000 });
    // 再次点击下拉框
    await methodSelect.click();
    await contentPage.waitForTimeout(300);
    // 点击空白区域,下拉菜单消失
    const urlInput = contentPage.locator('[data-testid="url-input"]');
    await urlInput.click();
    await contentPage.waitForTimeout(300);
    // 验证下拉菜单已关闭
    const dropdown = contentPage.locator('.el-select-dropdown').filter({ hasText: 'GET' });
    await expect(dropdown).toBeHidden({ timeout: 5000 });
  });
  // 测试用例2: 切换请求方法不会改变banner节点中的请求方法,只有保存后才会生效
  test('切换请求方法不会改变banner节点中的请求方法,只有保存后才会生效', async ({ contentPage }) => {
    // 新增HTTP节点并保存
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('方法保存测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 保存节点
    const saveBtn = contentPage.locator('[data-testid="operation-save-btn"]');
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    // 切换请求方法为POST
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
    await postOption.click();
    await contentPage.waitForTimeout(300);
    // 验证编辑区域显示POST
    await expect(methodSelect).toContainText('POST', { timeout: 5000 });
    // 验证banner节点图标仍为GET(未保存)
    const bannerNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '方法保存测试' });
    await expect(bannerNode).toContainText('GET', { timeout: 5000 });
    // 点击保存按钮
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证保存后banner节点图标变为POST
    await expect(bannerNode).toContainText('POST', { timeout: 5000 });
  });
  // 测试用例3: 切换所有请求方法,点击发送请求,调用测试服务器/echo接口,返回method为选中的method
  test('切换请求方法后发送请求,响应中method字段与选中的方法一致', async ({ contentPage }) => {
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('请求方法验证测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 测试GET方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    const responseCode = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseCode).toBeVisible({ timeout: 10000 });
    await expect(responseCode).toContainText('GET', { timeout: 10000 });
    // 测试POST方法
    await methodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^POST$/ });
    await expect(postOption).toBeVisible({ timeout: 5000 });
    await postOption.click();
    await contentPage.waitForTimeout(300);
    await expect(methodSelect).toContainText('POST', { timeout: 5000 });
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    await expect(responseCode).toContainText('POST', { timeout: 10000 });
    // 测试PUT方法
    await methodSelect.click();
    const putOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^PUT$/ });
    await expect(putOption).toBeVisible({ timeout: 5000 });
    await putOption.click();
    await contentPage.waitForTimeout(300);
    await expect(methodSelect).toContainText('PUT', { timeout: 5000 });
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    await expect(responseCode).toContainText('PUT', { timeout: 10000 });
  });
});
