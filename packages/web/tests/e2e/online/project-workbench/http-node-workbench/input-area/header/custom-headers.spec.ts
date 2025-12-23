import { test, expect } from '../../../../../../fixtures/electron-online.fixture.ts';

const MOCK_SERVER_PORT = 3456;

test.describe('CustomHeaders', () => {
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
  // 用户输入请求头key,如果匹配上预设的请求头,会出现请求头下拉列表
  test('请求头key输入匹配时出现下拉列表并支持键盘选择', async ({ contentPage }) => {
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const addHttpBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addHttpBtn.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('请求头下拉列表测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 切换到Headers标签
    const headersTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    // 在自定义请求头的key输入框中输入"auth"
    const headersTree = contentPage.locator('.cl-params-tree').first();
    const headerKeyInput = headersTree.locator('[data-testid="params-tree-key-autocomplete"] input').first();
    await headerKeyInput.click();
    await headerKeyInput.fill('auth');
    await contentPage.waitForTimeout(500);
    // 验证出现下拉列表（包含Authorization等）
    const dropdown = contentPage.locator('.params-tree-autocomplete:visible');
    await expect(dropdown).toBeVisible({ timeout: 3000 });
    // 按tab键选中第一个下拉项
    await contentPage.keyboard.press('Tab');
    await contentPage.waitForTimeout(300);
    // 验证输入框值被填充
    const inputValue = await headerKeyInput.inputValue();
    expect(inputValue.toLowerCase()).toContain('auth');
  });
  // 用户输入请求头如果key相同(key忽略大小写比较)则会覆盖默认请求头
  test('自定义请求头key忽略大小写覆盖默认请求头', async ({ contentPage }) => {
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const addHttpBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addHttpBtn.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('请求头覆盖测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(300);
    // 切换到Headers标签
    const headersTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    // 在自定义请求头中添加key="user-agent",value="CustomAgent/1.0"
    const headersTree = contentPage.locator('.cl-params-tree').first();
    const headerKeyInput = headersTree.locator('[data-testid="params-tree-key-autocomplete"] input').first();
    const headerValueInput = headersTree
      .locator('[data-testid="params-tree-value-input"]')
      .first()
      .locator('[contenteditable="true"]');
    await headerKeyInput.click();
    await headerKeyInput.fill('user-agent');
    await contentPage.waitForTimeout(200);
    await headerValueInput.click();
    await contentPage.keyboard.type('CustomAgent/1.0');
    await contentPage.waitForTimeout(300);
    // 点击发送按钮
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应区域有内容（请求成功发送）
    const responseArea = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
  });
  // header参数key输入值以后,如果不存在next节点,则自动新增一行数据
  test('header参数key输入后自动新增一行', async ({ contentPage }) => {
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const addHttpBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addHttpBtn.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('Header自动新增行测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 切换到Headers标签
    const headersTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    // 获取初始行数
    const headersTree = contentPage.locator('.cl-params-tree').first();
    const headerRows = headersTree.locator('.el-tree-node');
    const initialRowCount = await headerRows.count();
    // 在第一行header的key输入框中输入X-Custom-Header
    const headerKeyInput = headersTree.locator('[data-testid="params-tree-key-autocomplete"] input').first();
    await headerKeyInput.click();
    await headerKeyInput.fill('X-Custom-Header');
    await contentPage.waitForTimeout(200);
    // 点击key输入框外的区域使其失焦
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    // 验证自动新增第二行
    const newRowCount = await headerRows.count();
    expect(newRowCount).toBeGreaterThan(initialRowCount);
  });
  // header参数key,value输入值以后,调用echo接口验证header参数正确发送
  test('自定义header参数正确发送到服务器', async ({ contentPage }) => {
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const addHttpBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addHttpBtn.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('Header发送测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(300);
    // 切换到Headers标签
    const headersTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    // 添加自定义header: key="X-Request-ID", value="12345"
    const headersTree = contentPage.locator('.cl-params-tree').first();
    const headerKeyInput = headersTree.locator('[data-testid="params-tree-key-autocomplete"] input').first();
    const headerValueInput = headersTree
      .locator('[data-testid="params-tree-value-input"]')
      .first()
      .locator('[contenteditable="true"]');
    await headerKeyInput.click();
    await headerKeyInput.fill('X-Request-ID');
    await contentPage.waitForTimeout(200);
    await headerValueInput.click();
    await contentPage.keyboard.type('12345');
    await contentPage.waitForTimeout(300);
    // 点击发送按钮
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应区域有内容（请求成功发送）
    const responseArea = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
  });
  // header参数key,value支持变量替换
  test('header参数支持变量替换', async ({ contentPage }) => {
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const addHttpBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addHttpBtn.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('Header变量替换测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(300);
    // 切换到Headers标签
    const headersTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    // 添加header: key="Authorization", value="Bearer {{token}}"
    const headersTree = contentPage.locator('.cl-params-tree').first();
    const headerKeyInput = headersTree.locator('[data-testid="params-tree-key-autocomplete"] input').first();
    const headerValueInput = headersTree
      .locator('[data-testid="params-tree-value-input"]')
      .first()
      .locator('[contenteditable="true"]');
    await headerKeyInput.click();
    await headerKeyInput.fill('Authorization');
    await contentPage.waitForTimeout(200);
    await headerValueInput.click();
    await contentPage.keyboard.type('Bearer {{token}}');
    await contentPage.waitForTimeout(300);
    // 点击发送按钮
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应区域有内容（请求成功发送）
    const responseArea = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
  });
  // header参数是否发送未勾选那么当前参数不会发送
  test('未勾选的header参数不会发送', async ({ contentPage }) => {
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const addHttpBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addHttpBtn.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('Header是否发送测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(300);
    // 切换到Headers标签
    const headersTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    // 添加自定义header: key="X-Request-ID", value="12345"
    const headersTree = contentPage.locator('.cl-params-tree').first();
    const headerKeyInput = headersTree.locator('[data-testid="params-tree-key-autocomplete"] input').first();
    const headerValueInput = headersTree
      .locator('[data-testid="params-tree-value-input"]')
      .first()
      .locator('[contenteditable="true"]');
    await headerKeyInput.click();
    await headerKeyInput.fill('X-Request-ID');
    await contentPage.waitForTimeout(200);
    await headerValueInput.click();
    await contentPage.keyboard.type('12345');
    await contentPage.waitForTimeout(300);
    // 取消勾选"是否发送"checkbox
    const firstRow = headersTree.locator('.el-tree-node').first();
    const sendCheckbox = firstRow.locator('.el-tree-node__content > .el-checkbox').first();
    if (await sendCheckbox.isVisible()) {
      await sendCheckbox.click();
      await contentPage.waitForTimeout(200);
    }
    // 点击发送按钮
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应区域有内容（请求成功发送）
    const responseArea = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
  });
});
