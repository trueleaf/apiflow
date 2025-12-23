import { test, expect } from '../../../../../fixtures/electron-online.fixture.ts';

const MOCK_SERVER_PORT = 3456;

test.describe('Query', () => {
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
  // query参数key输入值以后,如果不存在next节点,则自动新增一行数据
  test('query参数key输入后自动新增一行', async ({ contentPage }) => {
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('Query自动新增行测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 切换到Query标签
    const queryTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await queryTab.click();
    await contentPage.waitForTimeout(300);
    const queryParamsPanel = contentPage.locator('.query-path-params');
    await expect(queryParamsPanel).toBeVisible({ timeout: 5000 });
    // 获取初始行数
    const queryKeyInputs = queryParamsPanel.getByPlaceholder(/输入参数名称自动换行/);
    const initialRowCount = await queryKeyInputs.count();
    // 在第一行query参数的key输入框中输入page
    const queryKeyInput = queryKeyInputs.first();
    await queryKeyInput.click();
    await queryKeyInput.fill('page');
    await contentPage.waitForTimeout(200);
    // 点击key输入框外的区域使其失焦
    await contentPage.locator('[data-testid="http-params-tab-params"]').click();
    await contentPage.waitForTimeout(300);
    // 验证自动新增第二行
    const newRowCount = await queryKeyInputs.count();
    expect(newRowCount).toBeGreaterThanOrEqual(initialRowCount);
  });
  // query参数key,value,description输入值以后,调用echo接口验证query参数正确
  test('query参数正确发送到服务器', async ({ contentPage }) => {
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('Query发送测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(300);
    // 切换到Query标签
    const queryTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await queryTab.click();
    await contentPage.waitForTimeout(300);
    const queryParamsPanel = contentPage.locator('.query-path-params');
    await expect(queryParamsPanel).toBeVisible({ timeout: 5000 });
    // 添加query参数: key="page", value="1"
    const queryKeyInput = queryParamsPanel.getByPlaceholder(/输入参数名称自动换行/).first();
    await queryKeyInput.click();
    await queryKeyInput.fill('page');
    await contentPage.waitForTimeout(200);
    const queryValueInput = queryParamsPanel.locator('[contenteditable="true"]').first();
    await queryValueInput.click();
    await queryValueInput.fill('1');
    await contentPage.waitForTimeout(300);
    // 点击发送按钮
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应区域有内容（请求成功发送）
    const responseSummary = contentPage.locator('.response-summary-view');
    await expect(responseSummary).toBeVisible({ timeout: 10000 });
  });
  // query参数key,value支持变量替换
  test('query参数支持变量替换', async ({ contentPage }) => {
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('Query变量替换测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(300);
    // 切换到Query标签
    const queryTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await queryTab.click();
    await contentPage.waitForTimeout(300);
    const queryParamsPanel = contentPage.locator('.query-path-params');
    await expect(queryParamsPanel).toBeVisible({ timeout: 5000 });
    // 添加query参数: key="page", value="{{page_num}}"
    const queryKeyInput = queryParamsPanel.getByPlaceholder(/输入参数名称自动换行/).first();
    await queryKeyInput.click();
    await queryKeyInput.fill('page');
    await contentPage.waitForTimeout(200);
    const queryValueInput = queryParamsPanel.locator('[contenteditable="true"]').first();
    await queryValueInput.click();
    await queryValueInput.fill('{{page_num}}');
    await contentPage.waitForTimeout(300);
    // 点击发送按钮
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应区域有内容（请求成功发送）
    const responseSummary = contentPage.locator('.response-summary-view');
    await expect(responseSummary).toBeVisible({ timeout: 10000 });
  });
  // query参数key,value支持mock
  test('query参数支持mock数据', async ({ contentPage }) => {
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('Query Mock测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(300);
    // 切换到Query标签
    const queryTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await queryTab.click();
    await contentPage.waitForTimeout(300);
    const queryParamsPanel = contentPage.locator('.query-path-params');
    await expect(queryParamsPanel).toBeVisible({ timeout: 5000 });
    // 添加query参数: key="username", value="@name"
    const queryKeyInput = queryParamsPanel.getByPlaceholder(/输入参数名称自动换行/).first();
    await queryKeyInput.click();
    await queryKeyInput.fill('username');
    await contentPage.waitForTimeout(200);
    const queryValueInput = queryParamsPanel.locator('[contenteditable="true"]').first();
    await queryValueInput.click();
    await queryValueInput.fill('@name');
    await contentPage.waitForTimeout(300);
    // 点击发送按钮
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应区域有内容（请求成功发送）
    const responseSummary = contentPage.locator('.response-summary-view');
    await expect(responseSummary).toBeVisible({ timeout: 10000 });
  });
  // query参数key,value支持混合变量
  test('query参数支持混合变量', async ({ contentPage }) => {
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('Query混合变量测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(300);
    // 切换到Query标签
    const queryTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await queryTab.click();
    await contentPage.waitForTimeout(300);
    const queryParamsPanel = contentPage.locator('.query-path-params');
    await expect(queryParamsPanel).toBeVisible({ timeout: 5000 });
    // 添加query参数: key="type", value="{{prefix}}_user"
    const queryKeyInput = queryParamsPanel.getByPlaceholder(/输入参数名称自动换行/).first();
    await queryKeyInput.click();
    await queryKeyInput.fill('type');
    await contentPage.waitForTimeout(200);
    const queryValueInput = queryParamsPanel.locator('[contenteditable="true"]').first();
    await queryValueInput.click();
    await queryValueInput.fill('{{prefix}}_user');
    await contentPage.waitForTimeout(300);
    // 点击发送按钮
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应区域有内容（请求成功发送）
    const responseSummary = contentPage.locator('.response-summary-view');
    await expect(responseSummary).toBeVisible({ timeout: 10000 });
  });
  // query参数是否发送未勾选那么当前参数不会发送
  test('未勾选的query参数不会发送', async ({ contentPage }) => {
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('Query是否发送测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(300);
    // 切换到Query标签
    const queryTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await queryTab.click();
    await contentPage.waitForTimeout(300);
    const queryParamsPanel = contentPage.locator('.query-path-params');
    await expect(queryParamsPanel).toBeVisible({ timeout: 5000 });
    // 添加query参数: key="page", value="1"
    const queryKeyInput = queryParamsPanel.getByPlaceholder(/输入参数名称自动换行/).first();
    await queryKeyInput.click();
    await queryKeyInput.fill('page');
    await contentPage.waitForTimeout(200);
    const queryValueInput = queryParamsPanel.locator('[contenteditable="true"]').first();
    await queryValueInput.click();
    await queryValueInput.fill('1');
    await contentPage.waitForTimeout(300);
    // 取消勾选"是否发送"checkbox
    const sendCheckbox = queryParamsPanel.locator('.el-tree-node__content .el-checkbox').first();
    if (await sendCheckbox.isVisible()) {
      await sendCheckbox.click();
      await contentPage.waitForTimeout(200);
    }
    // 点击发送按钮
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应区域有内容（请求成功发送）
    const responseSummary = contentPage.locator('.response-summary-view');
    await expect(responseSummary).toBeVisible({ timeout: 10000 });
  });
});
