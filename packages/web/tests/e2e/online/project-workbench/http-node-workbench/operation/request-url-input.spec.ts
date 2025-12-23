import { test, expect } from '../../../../../fixtures/electron-online.fixture.ts';

const MOCK_SERVER_PORT = 3456;

test.describe('RequestUrlInput', () => {
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
  // 测试用例1: 输入localhost地址调用echo接口成功返回
  test('输入localhost地址调用echo接口成功返回', async ({ contentPage }) => {
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('localhost测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 输入localhost URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://localhost:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证响应
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
    const responseBody = contentPage.locator('[data-testid="response-tab-body"]');
    await expect(responseBody).toBeVisible({ timeout: 10000 });
  });
  // 测试用例2: 输入127.0.0.1地址调用echo接口成功返回
  test('输入127.0.0.1地址调用echo接口成功返回', async ({ contentPage }) => {
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('IP地址测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 输入IP地址URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证响应
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
    const responseBody = contentPage.locator('[data-testid="response-tab-body"]');
    await expect(responseBody).toBeVisible({ timeout: 10000 });
  });
  // 测试用例3: 使用变量调用echo接口成功返回
  test('使用变量调用echo接口成功返回', async ({ contentPage }) => {
    // 创建变量
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const variableOption = contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ });
    await variableOption.click();
    await contentPage.waitForTimeout(500);
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    // 创建变量 localUrl=127.0.0.1
    const nameInput = variablePage.locator('.left input').first();
    await nameInput.fill('localUrl');
    const valueTextarea = variablePage.locator('.left textarea');
    await valueTextarea.fill('127.0.0.1');
    const addBtn = variablePage.locator('.left .el-button--primary');
    await addBtn.click();
    await contentPage.waitForTimeout(500);
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('变量URL测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 输入带变量的URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://{{localUrl}}:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证响应
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
    const responseBody = contentPage.locator('[data-testid="response-tab-body"]');
    await expect(responseBody).toBeVisible({ timeout: 10000 });
  });
  // 测试用例4: 不带协议的URL自动添加http://后成功请求
  test('不带协议的URL自动添加http后成功请求', async ({ contentPage }) => {
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('无协议URL测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 输入不带协议的URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(300);
    // 点击其他区域失焦
    await contentPage.locator('[data-testid="method-select"]').click();
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证响应
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
    const responseBody = contentPage.locator('[data-testid="response-tab-body"]');
    await expect(responseBody).toBeVisible({ timeout: 10000 });
  });
  // 测试用例5: URL中的query参数自动解析到参数列表
  test('URL中的query参数自动解析到参数列表', async ({ contentPage }) => {
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Query参数解析测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 输入带query参数的URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?id=3&name=lee`);
    await contentPage.waitForTimeout(300);
    // 点击其他区域失焦
    await contentPage.locator('[data-testid="method-select"]').click();
    await contentPage.waitForTimeout(500);
    // 验证参数列表中存在解析的参数
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const keyCount = await keyInputs.count();
    // 应该有至少2个参数（id和name）
    expect(keyCount).toBeGreaterThanOrEqual(2);
  });
  // 测试用例6: URL中带query参数发送请求返回结果正确
  test('URL中带query参数发送请求返回结果正确', async ({ contentPage }) => {
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Query参数请求测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 输入带query参数的URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?id=3&name=lee`);
    await contentPage.waitForTimeout(300);
    // 点击其他区域失焦
    await contentPage.locator('[data-testid="method-select"]').click();
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证响应包含query参数
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
    const responseBody = contentPage.locator('[data-testid="response-tab-body"]');
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    await expect(responseBody).toContainText('id', { timeout: 10000 });
    await expect(responseBody).toContainText('name', { timeout: 10000 });
  });
  // 测试用例7: 粘贴的URL去除前后空格
  test('粘贴的URL去除前后空格', async ({ contentPage }) => {
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('粘贴空格测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 先清空URL输入框
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill('');
    await contentPage.waitForTimeout(300);
    // 直接输入带空格的URL（模拟粘贴效果）
    await urlInput.fill(`  http://127.0.0.1:${MOCK_SERVER_PORT}/echo  `);
    await contentPage.waitForTimeout(300);
    // 点击其他区域失焦
    await contentPage.locator('[data-testid="method-select"]').click();
    await contentPage.waitForTimeout(300);
    // 发送请求验证URL被正确处理
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证响应
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
    const responseBody = contentPage.locator('[data-testid="response-tab-body"]');
    await expect(responseBody).toBeVisible({ timeout: 10000 });
  });
});
