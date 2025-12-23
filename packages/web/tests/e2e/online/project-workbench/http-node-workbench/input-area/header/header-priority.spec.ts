import { test, expect } from '../../../../../../fixtures/electron-online.fixture.ts';

const MOCK_SERVER_PORT = 3456;

test.describe('HeaderPriority', () => {
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
  // 测试用例1: 自定义请求头优先级大于公共请求头,相同key时自定义header值被发送
  test('自定义请求头优先级大于公共请求头,相同key时自定义header值被发送', async ({ contentPage }) => {
    await contentPage.waitForTimeout(500);
    // 打开公共请求头设置
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const commonHeaderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /设置公共请求头/ });
    await commonHeaderItem.click();
    await contentPage.waitForTimeout(500);
    const commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    // 添加公共请求头: X-Custom=from-common
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('X-Custom');
    await valueInputs.first().click();
    await contentPage.keyboard.type('from-common');
    await contentPage.waitForTimeout(300);
    const confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    await confirmBtn.click();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('请求头优先级测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击Headers标签页
    const headersTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    // 添加自定义请求头: X-Custom=from-custom
    const headerKeyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const headerValueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await headerKeyInputs.first().fill('X-Custom');
    await headerValueInputs.first().click();
    await contentPage.keyboard.type('from-custom');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    const statusCode = responseArea.getByTestId('status-code');
    await expect(statusCode).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证自定义请求头的值优先级最高,服务器接收到X-Custom=from-custom
    await expect(responseBody).toContainText('from-custom', { timeout: 10000 });
  });
  // 测试用例2: 公共请求头优先级大于可更改的默认请求头(User-Agent)
  test('公共请求头优先级大于可更改的默认请求头', async ({ contentPage }) => {
    await contentPage.waitForTimeout(500);
    // 打开公共请求头设置
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const commonHeaderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /设置公共请求头/ });
    await commonHeaderItem.click();
    await contentPage.waitForTimeout(500);
    const commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    // 添加公共请求头覆盖User-Agent
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('User-Agent');
    await valueInputs.first().click();
    await contentPage.keyboard.type('CustomAgent/1.0');
    await contentPage.waitForTimeout(300);
    const confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    await confirmBtn.click();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('公共请求头优先级测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    const statusCode = responseArea.getByTestId('status-code');
    await expect(statusCode).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证公共请求头覆盖了默认的User-Agent
    await expect(responseBody).toContainText('CustomAgent/1.0', { timeout: 10000 });
  });
  // 测试用例3: 自定义请求头优先级大于默认请求头(User-Agent)
  test('自定义请求头优先级大于默认请求头', async ({ contentPage }) => {
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('自定义请求头覆盖默认值测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击Headers标签页
    const headersTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    // 添加自定义请求头覆盖User-Agent
    const headerKeyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const headerValueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await headerKeyInputs.first().fill('User-Agent');
    await headerValueInputs.first().click();
    await contentPage.keyboard.type('MyCustomAgent/2.0');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    const statusCode = responseArea.getByTestId('status-code');
    await expect(statusCode).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证自定义请求头覆盖了默认的User-Agent
    await expect(responseBody).toContainText('MyCustomAgent/2.0', { timeout: 10000 });
  });
  // 测试用例4: 完整优先级链验证 - 自定义header > 公共header > 默认header
  test('完整优先级链验证 - 自定义header优先级高于公共header优先级高于默认header', async ({ contentPage }) => {
    await contentPage.waitForTimeout(500);
    // 打开公共请求头设置
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const commonHeaderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /设置公共请求头/ });
    await commonHeaderItem.click();
    await contentPage.waitForTimeout(500);
    const commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    // 添加公共请求头覆盖User-Agent
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('User-Agent');
    await valueInputs.first().click();
    await contentPage.keyboard.type('CommonAgent/1.0');
    await contentPage.waitForTimeout(300);
    const confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    await confirmBtn.click();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('完整优先级链测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击Headers标签页
    const headersTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    // 添加自定义请求头覆盖User-Agent
    const headerKeyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const headerValueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await headerKeyInputs.first().fill('User-Agent');
    await headerValueInputs.first().click();
    await contentPage.keyboard.type('CustomAgent/2.0');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    const statusCode = responseArea.getByTestId('status-code');
    await expect(statusCode).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证自定义请求头优先级最高,即使公共请求头也设置了相同的key
    await expect(responseBody).toContainText('CustomAgent/2.0', { timeout: 10000 });
  });
});
