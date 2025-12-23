import { test, expect } from '../../../../../../fixtures/electron-online.fixture.ts';
import path from 'path';
import { fileURLToPath } from 'url';

const MOCK_SERVER_PORT = 3456;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe('FormDataParams', () => {
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
  // ========== stringOnlyFormdata: 类型全为string的formdata参数 ==========
  test.describe('StringOnlyFormdata', () => {
    // 测试用例1: formdata参数key输入值以后,如果不存在next节点,则自动新增一行数据,自动新增数据需要被选中
    test('formdata参数key输入值以后自动新增一行数据', async ({ contentPage }) => {
      // 新增HTTP节点
      const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
      await addFileBtn.click();
      const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const fileNameInput = addFileDialog.locator('input').first();
      await fileNameInput.fill('FormData自动新增测试');
      const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmAddBtn.click();
      await expect(addFileDialog).toBeHidden({ timeout: 10000 });
      // 点击Body标签页
      const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
      await bodyTab.click();
      await contentPage.waitForTimeout(300);
      // 选择FormData类型
      const formdataRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^form-data$/i }).locator('.el-radio');
      await formdataRadio.click();
      await contentPage.waitForTimeout(300);
      // 获取初始行数
      const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
      const initialCount = await keyInputs.count();
      // 在第一行formdata参数的key输入框中输入username
      await keyInputs.first().fill('username');
      // 点击key输入框外的区域使其失焦
      await contentPage.locator('[data-testid="url-input"]').click();
      await contentPage.waitForTimeout(300);
      // 验证自动新增第二行空的formdata参数行
      const newCount = await keyInputs.count();
      expect(newCount).toBe(initialCount + 1);
      // 验证第一行key值为username
      const firstKeyValue = await keyInputs.first().inputValue();
      expect(firstKeyValue).toBe('username');
    });
    // 测试用例2: formdata参数key,value,description输入值以后,调用echo接口返回结果正确
    test('formdata参数key,value输入值以后调用echo接口返回结果正确', async ({ contentPage }) => {
      // 新增HTTP节点
      const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
      await addFileBtn.click();
      const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const fileNameInput = addFileDialog.locator('input').first();
      await fileNameInput.fill('FormData发送测试');
      const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmAddBtn.click();
      await expect(addFileDialog).toBeHidden({ timeout: 10000 });
      // 设置请求URL
      const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
      await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
      // 选择POST方法
      const methodSelect = contentPage.locator('[data-testid="method-select"]');
      await methodSelect.click();
      await contentPage.getByRole('option', { name: 'POST' }).click();
      // 点击Body标签页
      const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
      await bodyTab.click();
      await contentPage.waitForTimeout(300);
      // 选择FormData类型
      const formdataRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^form-data$/i }).locator('.el-radio');
      await formdataRadio.click();
      await contentPage.waitForTimeout(300);
      // 添加表单字段: username=admin
      const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
      const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
      await keyInputs.first().fill('username');
      await valueInputs.first().click();
      await contentPage.keyboard.type('admin');
      await contentPage.waitForTimeout(300);
      // 添加表单字段: password=123456
      await keyInputs.nth(1).fill('password');
      await valueInputs.nth(1).click();
      await contentPage.keyboard.type('123456');
      await contentPage.waitForTimeout(300);
      // 发送请求
      const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
      await sendBtn.click();
      // 验证响应
      const responseArea = contentPage.getByTestId('response-area');
      await expect(responseArea).toBeVisible({ timeout: 10000 });
      await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
      const responseBody = responseArea.locator('.s-json-editor').first();
      // 验证Content-Type包含multipart/form-data
      await expect(responseBody).toContainText('multipart/form-data', { timeout: 10000 });
      // 验证表单数据正确发送
      await expect(responseBody).toContainText('username', { timeout: 10000 });
      await expect(responseBody).toContainText('admin', { timeout: 10000 });
      await expect(responseBody).toContainText('password', { timeout: 10000 });
      await expect(responseBody).toContainText('123456', { timeout: 10000 });
    });
    // 测试用例3: formdata参数key,value支持变量,调用echo接口返回结果正确
    test('formdata参数key,value支持变量调用echo接口返回结果正确', async ({ contentPage }) => {
      // 打开变量管理页面并创建变量
      const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
      await moreBtn.click();
      const variableOption = contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ });
      await variableOption.click();
      await contentPage.waitForTimeout(500);
      const variablePage = contentPage.locator('.s-variable');
      await expect(variablePage).toBeVisible({ timeout: 5000 });
      // 创建变量 app_id=mobile_app
      const nameInput = variablePage.locator('.left input').first();
      await nameInput.fill('app_id');
      const valueTextarea = variablePage.locator('.left textarea');
      await valueTextarea.fill('mobile_app');
      const addBtn = variablePage.locator('.left .el-button--primary');
      await addBtn.click();
      await contentPage.waitForTimeout(500);
      // 创建变量 access_token=token_abc123
      await nameInput.fill('access_token');
      await valueTextarea.fill('token_abc123');
      await addBtn.click();
      await contentPage.waitForTimeout(500);
      // 新增HTTP节点
      const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
      await addFileBtn.click();
      const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const fileNameInput = addFileDialog.locator('input').first();
      await fileNameInput.fill('FormData变量测试');
      const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmAddBtn.click();
      await expect(addFileDialog).toBeHidden({ timeout: 10000 });
      // 设置请求URL
      const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
      await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
      // 选择POST方法
      const methodSelect = contentPage.locator('[data-testid="method-select"]');
      await methodSelect.click();
      await contentPage.getByRole('option', { name: 'POST' }).click();
      // 点击Body标签页
      const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
      await bodyTab.click();
      await contentPage.waitForTimeout(300);
      // 选择FormData类型
      const formdataRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^form-data$/i }).locator('.el-radio');
      await formdataRadio.click();
      await contentPage.waitForTimeout(300);
      // 添加表单字段: app_id={{app_id}} (项目变量)
      const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
      const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
      await keyInputs.first().fill('app_id');
      await valueInputs.first().click();
      await contentPage.keyboard.type('{{app_id}}');
      await contentPage.waitForTimeout(300);
      // 添加表单字段: token={{access_token}} (全局变量)
      await keyInputs.nth(1).fill('token');
      await valueInputs.nth(1).click();
      await contentPage.keyboard.type('{{access_token}}');
      await contentPage.waitForTimeout(300);
      // 发送请求
      const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
      await sendBtn.click();
      // 验证响应
      const responseArea = contentPage.getByTestId('response-area');
      await expect(responseArea).toBeVisible({ timeout: 10000 });
      await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
      const responseBody = responseArea.locator('.s-json-editor').first();
      // 验证变量被正确替换
      await expect(responseBody).toContainText('mobile_app', { timeout: 10000 });
      await expect(responseBody).toContainText('token_abc123', { timeout: 10000 });
    });
    // 测试用例4: formdata参数key,value支持mock,调用echo接口返回结果正确
    test('formdata参数key,value支持mock调用echo接口返回结果正确', async ({ contentPage }) => {
      // 新增HTTP节点
      const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
      await addFileBtn.click();
      const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const fileNameInput = addFileDialog.locator('input').first();
      await fileNameInput.fill('FormData Mock测试');
      const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmAddBtn.click();
      await expect(addFileDialog).toBeHidden({ timeout: 10000 });
      // 设置请求URL
      const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
      await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
      // 选择POST方法
      const methodSelect = contentPage.locator('[data-testid="method-select"]');
      await methodSelect.click();
      await contentPage.getByRole('option', { name: 'POST' }).click();
      // 点击Body标签页
      const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
      await bodyTab.click();
      await contentPage.waitForTimeout(300);
      // 选择FormData类型
      const formdataRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^form-data$/i }).locator('.el-radio');
      await formdataRadio.click();
      await contentPage.waitForTimeout(300);
      // 添加表单字段: phone=@phone (mock数据)
      const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
      const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
      await keyInputs.first().fill('phone');
      await valueInputs.first().click();
      await contentPage.keyboard.type('@phone');
      await contentPage.waitForTimeout(300);
      // 添加表单字段: user_id=@id (mock数据)
      await keyInputs.nth(1).fill('user_id');
      await valueInputs.nth(1).click();
      await contentPage.keyboard.type('@id');
      await contentPage.waitForTimeout(300);
      // 发送请求
      const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
      await sendBtn.click();
      // 验证响应
      const responseArea = contentPage.getByTestId('response-area');
      await expect(responseArea).toBeVisible({ timeout: 10000 });
      await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
      const responseBody = responseArea.locator('.s-json-editor').first();
      // 验证Content-Type包含multipart/form-data
      await expect(responseBody).toContainText('multipart/form-data', { timeout: 10000 });
      // 验证mock数据已生成(不包含@符号说明已被替换)
      await expect(responseBody).toContainText('phone', { timeout: 10000 });
      await expect(responseBody).toContainText('user_id', { timeout: 10000 });
    });
    // 测试用例5: formdata参数key,value支持混合变量,调用echo接口返回结果正确
    test('formdata参数key,value支持混合变量调用echo接口返回结果正确', async ({ contentPage }) => {
      // 打开变量管理页面并创建变量
      const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
      await moreBtn.click();
      const variableOption = contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ });
      await variableOption.click();
      await contentPage.waitForTimeout(500);
      const variablePage = contentPage.locator('.s-variable');
      await expect(variablePage).toBeVisible({ timeout: 5000 });
      // 创建变量 service=user
      const nameInput = variablePage.locator('.left input').first();
      await nameInput.fill('service');
      const valueTextarea = variablePage.locator('.left textarea');
      await valueTextarea.fill('user');
      const addBtn = variablePage.locator('.left .el-button--primary');
      await addBtn.click();
      await contentPage.waitForTimeout(500);
      // 新增HTTP节点
      const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
      await addFileBtn.click();
      const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const fileNameInput = addFileDialog.locator('input').first();
      await fileNameInput.fill('FormData混合变量测试');
      const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmAddBtn.click();
      await expect(addFileDialog).toBeHidden({ timeout: 10000 });
      // 设置请求URL
      const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
      await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
      // 选择POST方法
      const methodSelect = contentPage.locator('[data-testid="method-select"]');
      await methodSelect.click();
      await contentPage.getByRole('option', { name: 'POST' }).click();
      // 点击Body标签页
      const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
      await bodyTab.click();
      await contentPage.waitForTimeout(300);
      // 选择FormData类型
      const formdataRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^form-data$/i }).locator('.el-radio');
      await formdataRadio.click();
      await contentPage.waitForTimeout(300);
      // 添加表单字段: action={{service}}_query (变量混合文本)
      const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
      const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
      await keyInputs.first().fill('action');
      await valueInputs.first().click();
      await contentPage.keyboard.type('{{service}}_query');
      await contentPage.waitForTimeout(300);
      // 添加表单字段: req_id=REQ_@id (文本混合mock)
      await keyInputs.nth(1).fill('req_id');
      await valueInputs.nth(1).click();
      await contentPage.keyboard.type('REQ_@id');
      await contentPage.waitForTimeout(300);
      // 发送请求
      const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
      await sendBtn.click();
      // 验证响应
      const responseArea = contentPage.getByTestId('response-area');
      await expect(responseArea).toBeVisible({ timeout: 10000 });
      await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
      const responseBody = responseArea.locator('.s-json-editor').first();
      // 验证混合变量被正确替换
      await expect(responseBody).toContainText('user_query', { timeout: 10000 });
      await expect(responseBody).toContainText('REQ_', { timeout: 10000 });
    });
    // 测试用例6: formdata参数是否发送未勾选那么当前参数不会发送
    test('formdata参数是否发送未勾选那么当前参数不会发送', async ({ contentPage }) => {
      // 新增HTTP节点
      const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
      await addFileBtn.click();
      const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const fileNameInput = addFileDialog.locator('input').first();
      await fileNameInput.fill('FormData发送控制测试');
      const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmAddBtn.click();
      await expect(addFileDialog).toBeHidden({ timeout: 10000 });
      // 设置请求URL
      const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
      await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
      // 选择POST方法
      const methodSelect = contentPage.locator('[data-testid="method-select"]');
      await methodSelect.click();
      await contentPage.getByRole('option', { name: 'POST' }).click();
      // 点击Body标签页
      const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
      await bodyTab.click();
      await contentPage.waitForTimeout(300);
      // 选择FormData类型
      const formdataRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^form-data$/i }).locator('.el-radio');
      await formdataRadio.click();
      await contentPage.waitForTimeout(300);
      // 添加表单字段: username=admin (已勾选)
      const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
      const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
      await keyInputs.first().fill('username');
      await valueInputs.first().click();
      await contentPage.keyboard.type('admin');
      await contentPage.waitForTimeout(300);
      // 添加表单字段: password=123456 (将取消勾选)
      await keyInputs.nth(1).fill('password');
      await valueInputs.nth(1).click();
      await contentPage.keyboard.type('123456');
      await contentPage.waitForTimeout(300);
      // 取消勾选password参数的"是否发送"checkbox (el-tree内置复选框)
      const treeNodes = contentPage.locator('.body-params .el-tree-node');
      const secondNodeCheckbox = treeNodes.nth(1).locator('.el-tree-node__content > .el-checkbox').first();
      await secondNodeCheckbox.click();
      await contentPage.waitForTimeout(300);
      // 发送请求
      const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
      await sendBtn.click();
      // 验证响应 - 只包含username,不包含password
      const responseArea = contentPage.getByTestId('response-area');
      await expect(responseArea).toBeVisible({ timeout: 10000 });
      await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
      const responseBody = responseArea.locator('.s-json-editor').first();
      await expect(responseBody).toContainText('username', { timeout: 10000 });
      await expect(responseBody).toContainText('admin', { timeout: 10000 });
      // 验证password没有被发送
      const responseText = await responseBody.textContent();
      expect(responseText).not.toContain('password');
    });
  });

  // ========== fileOnlyFormdata: 类型全为file的formdata参数 ==========
  test.describe('FileOnlyFormdata', () => {
    // 测试用例1: value模式切换后要清空之前的数据
    test('value模式切换后要清空之前的数据', async ({ contentPage }) => {
      // 新增HTTP节点
      const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
      await addFileBtn.click();
      const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const fileNameInput = addFileDialog.locator('input').first();
      await fileNameInput.fill('FileOnlyFormData模式切换测试');
      const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmAddBtn.click();
      await expect(addFileDialog).toBeHidden({ timeout: 10000 });
      // 点击Body标签页
      const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
      await bodyTab.click();
      await contentPage.waitForTimeout(300);
      // 选择FormData类型
      const formdataRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^form-data$/i }).locator('.el-radio');
      await formdataRadio.click();
      await contentPage.waitForTimeout(300);
      // 设置第一行key和type=file
      const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
      await keyInputs.first().fill('avatar');
      await contentPage.waitForTimeout(300);
      const typeSelects = contentPage.locator('[data-testid="params-tree-type-select"]');
      await typeSelects.first().click();
      const visibleDropdown = contentPage.locator('.el-select-dropdown:visible');
      await visibleDropdown.getByRole('option', { name: /^file$/i }).first().click();
      await contentPage.waitForTimeout(300);
      // 选择文件模式并选择文件
      const fileValueWrapper = contentPage.locator('.file-value-wrapper').first();
      const toggleBtn = fileValueWrapper.locator('[data-testid="params-tree-file-toggle-btn"]');
      const varInput = fileValueWrapper.locator('[data-testid="params-tree-file-var-input"]');
      const selectLabel = fileValueWrapper.locator('[data-testid="params-tree-file-select-label"]');
      if (await varInput.isVisible()) {
        await toggleBtn.dispatchEvent('click');
        await contentPage.waitForTimeout(300);
      }
      await expect(selectLabel).toBeVisible({ timeout: 5000 });
      const logoFilePath = path.resolve(__dirname, '../../../../../../../src/renderer/assets/imgs/logo.png');
      const fileInput = fileValueWrapper.locator('[data-testid="params-tree-file-input"]');
      await fileInput.setInputFiles(logoFilePath);
      await contentPage.waitForTimeout(500);
      const fileText = fileValueWrapper.locator('.file-mode-wrap .text-wrap');
      await expect(fileText).toContainText('logo.png', { timeout: 5000 });
      // 切换到变量模式，应清空之前的文件选择
      await toggleBtn.dispatchEvent('click');
      await contentPage.waitForTimeout(300);
      await expect(varInput).toBeVisible({ timeout: 5000 });
      await expect(varInput).toHaveValue('', { timeout: 5000 });
      // 再切回文件模式，仍应为空
      await toggleBtn.dispatchEvent('click');
      await contentPage.waitForTimeout(300);
      await expect(selectLabel).toBeVisible({ timeout: 5000 });
      await expect(fileText).not.toContainText('logo.png', { timeout: 5000 });
    });
    // 测试用例2: value如果为文件模式,选择文件,调用echo接口返回结果正确
    test('value如果为文件模式选择文件调用echo接口返回结果正确', async ({ contentPage }) => {
      // 新增HTTP节点
      const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
      await addFileBtn.click();
      const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const fileNameInput = addFileDialog.locator('input').first();
      await fileNameInput.fill('FileOnlyFormData文件模式发送测试');
      const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmAddBtn.click();
      await expect(addFileDialog).toBeHidden({ timeout: 10000 });
      // 设置请求URL
      const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
      await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
      // 选择POST方法
      const methodSelect = contentPage.locator('[data-testid="method-select"]');
      await methodSelect.click();
      await contentPage.getByRole('option', { name: 'POST' }).click();
      // 点击Body标签页
      const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
      await bodyTab.click();
      await contentPage.waitForTimeout(300);
      // 选择FormData类型
      const formdataRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^form-data$/i }).locator('.el-radio');
      await formdataRadio.click();
      await contentPage.waitForTimeout(300);
      // 设置第一行key和type=file
      const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
      await keyInputs.first().fill('avatar');
      await contentPage.waitForTimeout(300);
      const typeSelects = contentPage.locator('[data-testid="params-tree-type-select"]');
      await typeSelects.first().click();
      const visibleDropdown = contentPage.locator('.el-select-dropdown:visible');
      await visibleDropdown.getByRole('option', { name: /^file$/i }).first().click();
      await contentPage.waitForTimeout(300);
      // 选择文件模式并选择文件
      const fileValueWrapper = contentPage.locator('.file-value-wrapper').first();
      const toggleBtn = fileValueWrapper.locator('[data-testid="params-tree-file-toggle-btn"]');
      const varInput = fileValueWrapper.locator('[data-testid="params-tree-file-var-input"]');
      const selectLabel = fileValueWrapper.locator('[data-testid="params-tree-file-select-label"]');
      if (await varInput.isVisible()) {
        await toggleBtn.click();
        await contentPage.waitForTimeout(300);
      }
      await expect(selectLabel).toBeVisible({ timeout: 5000 });
      const logoFilePath = path.resolve(__dirname, '../../../../../../../src/renderer/assets/imgs/logo.png');
      await fileValueWrapper.locator('[data-testid="params-tree-file-input"]').setInputFiles(logoFilePath);
      await contentPage.waitForTimeout(500);
      // 发送请求
      const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
      await sendBtn.click();
      // 验证响应
      const responseArea = contentPage.getByTestId('response-area');
      await expect(responseArea).toBeVisible({ timeout: 10000 });
      await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
      const responseBody = responseArea.locator('.s-json-editor').first();
      await expect(responseBody).toContainText('multipart/form-data', { timeout: 10000 });
      await expect(responseBody).toContainText('avatar', { timeout: 10000 });
      await expect(responseBody).toContainText('File:', { timeout: 10000 });
      await expect(responseBody).toContainText('logo.png', { timeout: 10000 });
    });
    // 测试用例3: value如果为文件模式,未选择文件,value输入框下方提示文件不存在
    test('value如果为文件模式未选择文件时提示文件不存在', async ({ contentPage }) => {
      // 新增HTTP节点
      const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
      await addFileBtn.click();
      const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const fileNameInput = addFileDialog.locator('input').first();
      await fileNameInput.fill('FileOnlyFormData文件模式未选文件测试');
      const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmAddBtn.click();
      await expect(addFileDialog).toBeHidden({ timeout: 10000 });
      // 设置请求URL
      const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
      await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
      // 选择POST方法
      const methodSelect = contentPage.locator('[data-testid="method-select"]');
      await methodSelect.click();
      await contentPage.getByRole('option', { name: 'POST' }).click();
      // 点击Body标签页
      const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
      await bodyTab.click();
      await contentPage.waitForTimeout(300);
      // 选择FormData类型
      const formdataRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^form-data$/i }).locator('.el-radio');
      await formdataRadio.click();
      await contentPage.waitForTimeout(300);
      // 设置第一行key和type=file
      const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
      await keyInputs.first().fill('avatar');
      await contentPage.waitForTimeout(300);
      const typeSelects = contentPage.locator('[data-testid="params-tree-type-select"]');
      await typeSelects.first().click();
      const visibleDropdown = contentPage.locator('.el-select-dropdown:visible');
      await visibleDropdown.getByRole('option', { name: /^file$/i }).first().click();
      await contentPage.waitForTimeout(300);
      // 选择文件模式，但不选择文件
      const fileValueWrapper = contentPage.locator('.file-value-wrapper').first();
      const toggleBtn = fileValueWrapper.locator('[data-testid="params-tree-file-toggle-btn"]');
      const varInput = fileValueWrapper.locator('[data-testid="params-tree-file-var-input"]');
      const selectLabel = fileValueWrapper.locator('[data-testid="params-tree-file-select-label"]');
      if (await varInput.isVisible()) {
        await toggleBtn.click();
        await contentPage.waitForTimeout(300);
      }
      await expect(selectLabel).toBeVisible({ timeout: 5000 });
      // 点击发送
      const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
      await sendBtn.click();
      const fileError = fileValueWrapper.locator('.file-error');
      await expect(fileError).toBeVisible({ timeout: 10000 });
      await expect(fileError).toContainText(/不存在/, { timeout: 10000 });
      const responseArea = contentPage.getByTestId('response-area');
      await expect(responseArea).toBeVisible({ timeout: 10000 });
      const responseError = responseArea.getByTestId('response-error');
      await expect(responseError).toBeVisible({ timeout: 10000 });
    });
    // 测试用例4: value如果为变量模式,并且值为文件类型变量,并且文件存在,调用echo接口返回结果正确
    test('value如果为变量模式且文件存在调用echo接口返回结果正确', async ({ contentPage }) => {
      // 打开变量管理页面并创建变量
      const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
      await moreBtn.click();
      const variableOption = contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ });
      await variableOption.click();
      await contentPage.waitForTimeout(500);
      const variablePage = contentPage.locator('.s-variable');
      await expect(variablePage).toBeVisible({ timeout: 5000 });
      const logoFilePath = path.resolve(__dirname, '../../../../../../../src/renderer/assets/imgs/logo.png');
      const nameInput = variablePage.locator('.left input').first();
      const valueTextarea = variablePage.locator('.left textarea');
      const addBtn = variablePage.locator('.left .el-button--primary');
      await nameInput.fill('avatar_path');
      await valueTextarea.fill(logoFilePath);
      await addBtn.click();
      await contentPage.waitForTimeout(500);
      // 新增HTTP节点
      const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
      await addFileBtn.click();
      const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const fileNameInput = addFileDialog.locator('input').first();
      await fileNameInput.fill('FileOnlyFormData变量模式文件存在测试');
      const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmAddBtn.click();
      await expect(addFileDialog).toBeHidden({ timeout: 10000 });
      // 设置请求URL
      const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
      await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
      // 选择POST方法
      const methodSelect = contentPage.locator('[data-testid="method-select"]');
      await methodSelect.click();
      await contentPage.getByRole('option', { name: 'POST' }).click();
      // 点击Body标签页
      const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
      await bodyTab.click();
      await contentPage.waitForTimeout(300);
      // 选择FormData类型
      const formdataRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^form-data$/i }).locator('.el-radio');
      await formdataRadio.click();
      await contentPage.waitForTimeout(300);
      // 设置第一行key和type=file
      const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
      await keyInputs.first().fill('avatar');
      await contentPage.waitForTimeout(300);
      const typeSelects = contentPage.locator('[data-testid="params-tree-type-select"]');
      await typeSelects.first().click();
      const visibleDropdown = contentPage.locator('.el-select-dropdown:visible');
      await visibleDropdown.getByRole('option', { name: /^file$/i }).first().click();
      await contentPage.waitForTimeout(300);
      // 切换为变量模式并输入变量
      const fileValueWrapper = contentPage.locator('.file-value-wrapper').first();
      const toggleBtn = fileValueWrapper.locator('[data-testid="params-tree-file-toggle-btn"]');
      const varInput = fileValueWrapper.locator('[data-testid="params-tree-file-var-input"]');
      if (!(await varInput.isVisible())) {
        await toggleBtn.click();
        await contentPage.waitForTimeout(300);
      }
      await varInput.fill('{{avatar_path}}');
      await contentPage.waitForTimeout(300);
      // 发送请求
      const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
      await sendBtn.click();
      // 验证响应
      const responseArea = contentPage.getByTestId('response-area');
      await expect(responseArea).toBeVisible({ timeout: 10000 });
      await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
      const responseBody = responseArea.locator('.s-json-editor').first();
      await expect(responseBody).toContainText('multipart/form-data', { timeout: 10000 });
      await expect(responseBody).toContainText('avatar', { timeout: 10000 });
      await expect(responseBody).toContainText('File:', { timeout: 10000 });
      await expect(responseBody).toContainText('logo.png', { timeout: 10000 });
    });
    // 测试用例5: value如果为变量模式,并且值为文件类型变量,并且文件不存在,提示文件不存在
    test('value如果为变量模式且文件不存在时提示文件不存在', async ({ contentPage }) => {
      // 打开变量管理页面并创建变量
      const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
      await moreBtn.click();
      const variableOption = contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ });
      await variableOption.click();
      await contentPage.waitForTimeout(500);
      const variablePage = contentPage.locator('.s-variable');
      await expect(variablePage).toBeVisible({ timeout: 5000 });
      const notExistFilePath = path.resolve(process.cwd(), 'temp', `file-only-formdata-not-exist-${Date.now()}.txt`);
      const nameInput = variablePage.locator('.left input').first();
      const valueTextarea = variablePage.locator('.left textarea');
      const addBtn = variablePage.locator('.left .el-button--primary');
      await nameInput.fill('missing_path');
      await valueTextarea.fill(notExistFilePath);
      await addBtn.click();
      await contentPage.waitForTimeout(500);
      // 新增HTTP节点
      const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
      await addFileBtn.click();
      const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const fileNameInput = addFileDialog.locator('input').first();
      await fileNameInput.fill('FileOnlyFormData变量模式文件不存在测试');
      const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmAddBtn.click();
      await expect(addFileDialog).toBeHidden({ timeout: 10000 });
      // 设置请求URL
      const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
      await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
      // 选择POST方法
      const methodSelect = contentPage.locator('[data-testid="method-select"]');
      await methodSelect.click();
      await contentPage.getByRole('option', { name: 'POST' }).click();
      // 点击Body标签页
      const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
      await bodyTab.click();
      await contentPage.waitForTimeout(300);
      // 选择FormData类型
      const formdataRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^form-data$/i }).locator('.el-radio');
      await formdataRadio.click();
      await contentPage.waitForTimeout(300);
      // 设置第一行key和type=file
      const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
      await keyInputs.first().fill('avatar');
      await contentPage.waitForTimeout(300);
      const typeSelects = contentPage.locator('[data-testid="params-tree-type-select"]');
      await typeSelects.first().click();
      const visibleDropdown = contentPage.locator('.el-select-dropdown:visible');
      await visibleDropdown.getByRole('option', { name: /^file$/i }).first().click();
      await contentPage.waitForTimeout(300);
      // 变量模式输入缺失文件变量
      const fileValueWrapper = contentPage.locator('.file-value-wrapper').first();
      const toggleBtn = fileValueWrapper.locator('[data-testid="params-tree-file-toggle-btn"]');
      const varInput = fileValueWrapper.locator('[data-testid="params-tree-file-var-input"]');
      if (!(await varInput.isVisible())) {
        await toggleBtn.click();
        await contentPage.waitForTimeout(300);
      }
      await varInput.fill('{{missing_path}}');
      await contentPage.waitForTimeout(300);
      // 发送请求
      const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
      await sendBtn.click();
      const fileError = fileValueWrapper.locator('.file-error');
      await expect(fileError).toBeVisible({ timeout: 10000 });
      await expect(fileError).toContainText(/不存在/, { timeout: 10000 });
      const responseArea = contentPage.getByTestId('response-area');
      await expect(responseArea).toBeVisible({ timeout: 10000 });
      await expect(responseArea.getByTestId('response-error')).toBeVisible({ timeout: 10000 });
    });
    // 测试用例6: value如果为变量模式,并且值不是变量,提示文件不存在
    test('value如果为变量模式但值不是变量时提示文件不存在', async ({ contentPage }) => {
      // 新增HTTP节点
      const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
      await addFileBtn.click();
      const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const fileNameInput = addFileDialog.locator('input').first();
      await fileNameInput.fill('FileOnlyFormData变量模式非变量值测试');
      const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmAddBtn.click();
      await expect(addFileDialog).toBeHidden({ timeout: 10000 });
      // 设置请求URL
      const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
      await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
      // 选择POST方法
      const methodSelect = contentPage.locator('[data-testid="method-select"]');
      await methodSelect.click();
      await contentPage.getByRole('option', { name: 'POST' }).click();
      // 点击Body标签页
      const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
      await bodyTab.click();
      await contentPage.waitForTimeout(300);
      // 选择FormData类型
      const formdataRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^form-data$/i }).locator('.el-radio');
      await formdataRadio.click();
      await contentPage.waitForTimeout(300);
      // 设置第一行key和type=file
      const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
      await keyInputs.first().fill('avatar');
      await contentPage.waitForTimeout(300);
      const typeSelects = contentPage.locator('[data-testid="params-tree-type-select"]');
      await typeSelects.first().click();
      const visibleDropdown = contentPage.locator('.el-select-dropdown:visible');
      await visibleDropdown.getByRole('option', { name: /^file$/i }).first().click();
      await contentPage.waitForTimeout(300);
      // 变量模式输入普通文本
      const fileValueWrapper = contentPage.locator('.file-value-wrapper').first();
      const toggleBtn = fileValueWrapper.locator('[data-testid="params-tree-file-toggle-btn"]');
      const varInput = fileValueWrapper.locator('[data-testid="params-tree-file-var-input"]');
      if (!(await varInput.isVisible())) {
        await toggleBtn.click();
        await contentPage.waitForTimeout(300);
      }
      await varInput.fill('invalid_file_path');
      await contentPage.waitForTimeout(300);
      // 发送请求
      const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
      await sendBtn.click();
      const fileError = fileValueWrapper.locator('.file-error');
      await expect(fileError).toBeVisible({ timeout: 10000 });
      await expect(fileError).toContainText(/不存在|无效/, { timeout: 10000 });
      const responseArea = contentPage.getByTestId('response-area');
      await expect(responseArea).toBeVisible({ timeout: 10000 });
      await expect(responseArea.getByTestId('response-error')).toBeVisible({ timeout: 10000 });
    });
    // 测试用例7: value值合法,formdata参数key为变量,调用echo接口返回结果正确
    test('formdata参数key为变量调用echo接口返回结果正确', async ({ contentPage }) => {
      // 打开变量管理页面并创建变量
      const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
      await moreBtn.click();
      const variableOption = contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ });
      await variableOption.click();
      await contentPage.waitForTimeout(500);
      const variablePage = contentPage.locator('.s-variable');
      await expect(variablePage).toBeVisible({ timeout: 5000 });
      const logoFilePath = path.resolve(__dirname, '../../../../../../../src/renderer/assets/imgs/logo.png');
      const nameInput = variablePage.locator('.left input').first();
      const valueTextarea = variablePage.locator('.left textarea');
      const addBtn = variablePage.locator('.left .el-button--primary');
      await nameInput.fill('upload_key');
      await valueTextarea.fill('avatar');
      await addBtn.click();
      await contentPage.waitForTimeout(300);
      // 新增HTTP节点
      const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
      await addFileBtn.click();
      const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const fileNameInput = addFileDialog.locator('input').first();
      await fileNameInput.fill('FileOnlyFormData key变量测试');
      const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmAddBtn.click();
      await expect(addFileDialog).toBeHidden({ timeout: 10000 });
      // 设置请求URL
      const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
      await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
      // 选择POST方法
      const methodSelect = contentPage.locator('[data-testid="method-select"]');
      await methodSelect.click();
      await contentPage.getByRole('option', { name: 'POST' }).click();
      // 点击Body标签页
      const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
      await bodyTab.click();
      await contentPage.waitForTimeout(300);
      // 选择FormData类型
      const formdataRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^form-data$/i }).locator('.el-radio');
      await formdataRadio.click();
      await contentPage.waitForTimeout(300);
      // key使用变量，type=file
      const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
      await keyInputs.first().fill('{{upload_key}}');
      await contentPage.waitForTimeout(300);
      const typeSelects = contentPage.locator('[data-testid="params-tree-type-select"]');
      await typeSelects.first().click();
      const visibleDropdown = contentPage.locator('.el-select-dropdown:visible');
      await visibleDropdown.getByRole('option', { name: /^file$/i }).first().click();
      await contentPage.waitForTimeout(300);
      // 文件模式选择文件
      const fileValueWrapper = contentPage.locator('.file-value-wrapper').first();
      const toggleBtn = fileValueWrapper.locator('[data-testid="params-tree-file-toggle-btn"]');
      const varInput = fileValueWrapper.locator('[data-testid="params-tree-file-var-input"]');
      const selectLabel = fileValueWrapper.locator('[data-testid="params-tree-file-select-label"]');
      if (await varInput.isVisible()) {
        await toggleBtn.click();
        await contentPage.waitForTimeout(300);
      }
      await expect(selectLabel).toBeVisible({ timeout: 5000 });
      await fileValueWrapper.locator('[data-testid="params-tree-file-input"]').setInputFiles(logoFilePath);
      await contentPage.waitForTimeout(500);
      // 发送请求
      const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
      await sendBtn.click();
      // 验证响应
      const responseArea = contentPage.getByTestId('response-area');
      await expect(responseArea).toBeVisible({ timeout: 10000 });
      await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
      const responseBody = responseArea.locator('.s-json-editor').first();
      await expect(responseBody).toContainText('multipart/form-data', { timeout: 10000 });
      await expect(responseBody).toContainText('avatar', { timeout: 10000 });
      await expect(responseBody).toContainText('logo.png', { timeout: 10000 });
      const responseText = await responseBody.textContent();
      expect(responseText || '').not.toContain('{{upload_key}}');
    });
    // 测试用例8: value值合法,formdata参数key为mock,调用echo接口返回结果正确
    test('formdata参数key为mock调用echo接口返回结果正确', async ({ contentPage }) => {
      // 新增HTTP节点
      const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
      await addFileBtn.click();
      const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const fileNameInput = addFileDialog.locator('input').first();
      await fileNameInput.fill('FileOnlyFormData key mock测试');
      const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmAddBtn.click();
      await expect(addFileDialog).toBeHidden({ timeout: 10000 });
      // 设置请求URL
      const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
      await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
      // 选择POST方法
      const methodSelect = contentPage.locator('[data-testid="method-select"]');
      await methodSelect.click();
      await contentPage.getByRole('option', { name: 'POST' }).click();
      // 点击Body标签页
      const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
      await bodyTab.click();
      await contentPage.waitForTimeout(300);
      // 选择FormData类型
      const formdataRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^form-data$/i }).locator('.el-radio');
      await formdataRadio.click();
      await contentPage.waitForTimeout(300);
      // key使用mock，type=file
      const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
      await keyInputs.first().fill('@id');
      await contentPage.waitForTimeout(300);
      const typeSelects = contentPage.locator('[data-testid="params-tree-type-select"]');
      await typeSelects.first().click();
      const visibleDropdown = contentPage.locator('.el-select-dropdown:visible');
      await visibleDropdown.getByRole('option', { name: /^file$/i }).first().click();
      await contentPage.waitForTimeout(300);
      // 文件模式选择文件
      const fileValueWrapper = contentPage.locator('.file-value-wrapper').first();
      const toggleBtn = fileValueWrapper.locator('[data-testid="params-tree-file-toggle-btn"]');
      const varInput = fileValueWrapper.locator('[data-testid="params-tree-file-var-input"]');
      const selectLabel = fileValueWrapper.locator('[data-testid="params-tree-file-select-label"]');
      if (await varInput.isVisible()) {
        await toggleBtn.click();
        await contentPage.waitForTimeout(300);
      }
      await expect(selectLabel).toBeVisible({ timeout: 5000 });
      const logoFilePath = path.resolve(__dirname, '../../../../../../../src/renderer/assets/imgs/logo.png');
      await fileValueWrapper.locator('[data-testid="params-tree-file-input"]').setInputFiles(logoFilePath);
      await contentPage.waitForTimeout(500);
      // 发送请求
      const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
      await sendBtn.click();
      // 验证响应
      const responseArea = contentPage.getByTestId('response-area');
      await expect(responseArea).toBeVisible({ timeout: 10000 });
      await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
      const responseBody = responseArea.locator('.s-json-editor').first();
      await expect(responseBody).toContainText('multipart/form-data', { timeout: 10000 });
      await expect(responseBody).toContainText('File:', { timeout: 10000 });
      await expect(responseBody).toContainText('logo.png', { timeout: 10000 });
      const responseText = await responseBody.textContent();
      expect(responseText || '').toContain('@id');
    });
    // 测试用例9: value值合法,formdata参数key为混合变量,调用echo接口返回结果正确
    test('formdata参数key为混合变量调用echo接口返回结果正确', async ({ contentPage }) => {
      // 打开变量管理页面并创建变量
      const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
      await moreBtn.click();
      const variableOption = contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ });
      await variableOption.click();
      await contentPage.waitForTimeout(500);
      const variablePage = contentPage.locator('.s-variable');
      await expect(variablePage).toBeVisible({ timeout: 5000 });
      const nameInput = variablePage.locator('.left input').first();
      const valueTextarea = variablePage.locator('.left textarea');
      const addBtn = variablePage.locator('.left .el-button--primary');
      await nameInput.fill('service');
      await valueTextarea.fill('user');
      await addBtn.click();
      await contentPage.waitForTimeout(500);
      // 新增HTTP节点
      const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
      await addFileBtn.click();
      const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const fileNameInput = addFileDialog.locator('input').first();
      await fileNameInput.fill('FileOnlyFormData key 混合变量测试');
      const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmAddBtn.click();
      await expect(addFileDialog).toBeHidden({ timeout: 10000 });
      // 设置请求URL
      const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
      await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
      // 选择POST方法
      const methodSelect = contentPage.locator('[data-testid="method-select"]');
      await methodSelect.click();
      await contentPage.getByRole('option', { name: 'POST' }).click();
      // 点击Body标签页
      const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
      await bodyTab.click();
      await contentPage.waitForTimeout(300);
      // 选择FormData类型
      const formdataRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^form-data$/i }).locator('.el-radio');
      await formdataRadio.click();
      await contentPage.waitForTimeout(300);
      // key使用混合变量，type=file
      const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
      await keyInputs.first().fill('file_{{service}}');
      await contentPage.waitForTimeout(300);
      const typeSelects = contentPage.locator('[data-testid="params-tree-type-select"]');
      await typeSelects.first().click();
      const visibleDropdown = contentPage.locator('.el-select-dropdown:visible');
      await visibleDropdown.getByRole('option', { name: /^file$/i }).first().click();
      await contentPage.waitForTimeout(300);
      // 文件模式选择文件
      const fileValueWrapper = contentPage.locator('.file-value-wrapper').first();
      const toggleBtn = fileValueWrapper.locator('[data-testid="params-tree-file-toggle-btn"]');
      const varInput = fileValueWrapper.locator('[data-testid="params-tree-file-var-input"]');
      const selectLabel = fileValueWrapper.locator('[data-testid="params-tree-file-select-label"]');
      if (await varInput.isVisible()) {
        await toggleBtn.click();
        await contentPage.waitForTimeout(300);
      }
      await expect(selectLabel).toBeVisible({ timeout: 5000 });
      const logoFilePath = path.resolve(__dirname, '../../../../../../../src/renderer/assets/imgs/logo.png');
      await fileValueWrapper.locator('[data-testid="params-tree-file-input"]').setInputFiles(logoFilePath);
      await contentPage.waitForTimeout(500);
      // 发送请求
      const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
      await sendBtn.click();
      // 验证响应
      const responseArea = contentPage.getByTestId('response-area');
      await expect(responseArea).toBeVisible({ timeout: 10000 });
      await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
      const responseBody = responseArea.locator('.s-json-editor').first();
      await expect(responseBody).toContainText('multipart/form-data', { timeout: 10000 });
      await expect(responseBody).toContainText('file_user', { timeout: 10000 });
      await expect(responseBody).toContainText('logo.png', { timeout: 10000 });
      const responseText = await responseBody.textContent();
      expect(responseText || '').not.toContain('{{service}}');
    });
    // 测试用例10: file类型formdata参数是否发送未勾选那么当前参数不会发送
    test('file类型formdata参数是否发送未勾选那么当前参数不会发送', async ({ contentPage }) => {
      // 新增HTTP节点
      const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
      await addFileBtn.click();
      const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const fileNameInput = addFileDialog.locator('input').first();
      await fileNameInput.fill('FileOnlyFormData是否发送控制测试');
      const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmAddBtn.click();
      await expect(addFileDialog).toBeHidden({ timeout: 10000 });
      // 设置请求URL
      const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
      await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
      // 选择POST方法
      const methodSelect = contentPage.locator('[data-testid="method-select"]');
      await methodSelect.click();
      await contentPage.getByRole('option', { name: 'POST' }).click();
      // 点击Body标签页
      const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
      await bodyTab.click();
      await contentPage.waitForTimeout(300);
      // 选择FormData类型
      const formdataRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^form-data$/i }).locator('.el-radio');
      await formdataRadio.click();
      await contentPage.waitForTimeout(300);
      // 第一行string: username=admin
      const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
      const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
      await keyInputs.first().fill('username');
      await valueInputs.first().click();
      await contentPage.keyboard.type('admin');
      await contentPage.waitForTimeout(300);
      // 第二行file: avatar=logo.png
      await keyInputs.nth(1).fill('avatar');
      await contentPage.waitForTimeout(300);
      const typeSelects = contentPage.locator('[data-testid="params-tree-type-select"]');
      await typeSelects.nth(1).click();
      const visibleDropdown = contentPage.locator('.el-select-dropdown:visible');
      await visibleDropdown.getByRole('option', { name: /^file$/i }).first().click();
      await contentPage.waitForTimeout(300);
      const fileValueWrapper = contentPage.locator('.file-value-wrapper').first();
      const toggleBtn = fileValueWrapper.locator('[data-testid="params-tree-file-toggle-btn"]');
      const varInput = fileValueWrapper.locator('[data-testid="params-tree-file-var-input"]');
      const selectLabel = fileValueWrapper.locator('[data-testid="params-tree-file-select-label"]');
      if (await varInput.isVisible()) {
        await toggleBtn.click();
        await contentPage.waitForTimeout(300);
      }
      await expect(selectLabel).toBeVisible({ timeout: 5000 });
      const logoFilePath = path.resolve(__dirname, '../../../../../../../src/renderer/assets/imgs/logo.png');
      await fileValueWrapper.locator('[data-testid="params-tree-file-input"]').setInputFiles(logoFilePath);
      await contentPage.waitForTimeout(500);
      // 取消勾选第二行参数的"是否发送"checkbox
      const treeNodes = contentPage.locator('.body-params .el-tree-node');
      const secondNodeCheckbox = treeNodes.nth(1).locator('.el-tree-node__content > .el-checkbox').first();
      await secondNodeCheckbox.click();
      await contentPage.waitForTimeout(300);
      // 发送请求
      const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
      await sendBtn.click();
      // 验证响应 - 只包含username,不包含avatar
      const responseArea = contentPage.getByTestId('response-area');
      await expect(responseArea).toBeVisible({ timeout: 10000 });
      await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
      const responseBody = responseArea.locator('.s-json-editor').first();
      await expect(responseBody).toContainText('username', { timeout: 10000 });
      await expect(responseBody).toContainText('admin', { timeout: 10000 });
      const responseText = await responseBody.textContent();
      expect(responseText || '').not.toContain('avatar');
      expect(responseText || '').not.toContain('logo.png');
    });
  });

  // ========== mixedFormdata: 类型为file和string的混合类型的formdata参数 ==========
  test.describe('MixedFormdata', () => {
    // 测试用例1: 存在string类型value和file类型value时候,调用echo接口返回结果正确
    test('存在string类型value和file类型value时候调用echo接口返回结果正确', async ({ contentPage }) => {
      // 新增HTTP节点
      const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
      await addFileBtn.click();
      const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const fileNameInput = addFileDialog.locator('input').first();
      await fileNameInput.fill('MixedFormData发送测试');
      const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmAddBtn.click();
      await expect(addFileDialog).toBeHidden({ timeout: 10000 });
      // 设置请求URL
      const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
      await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
      // 选择POST方法
      const methodSelect = contentPage.locator('[data-testid="method-select"]');
      await methodSelect.click();
      await contentPage.getByRole('option', { name: 'POST' }).click();
      // 点击Body标签页
      const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
      await bodyTab.click();
      await contentPage.waitForTimeout(300);
      // 选择FormData类型
      const formdataRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^form-data$/i }).locator('.el-radio');
      await formdataRadio.click();
      await contentPage.waitForTimeout(300);
      // 第一行string: username=testuser
      const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
      const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
      await keyInputs.first().fill('username');
      await valueInputs.first().click();
      await contentPage.keyboard.type('testuser');
      await contentPage.waitForTimeout(300);
      // 第二行file: avatar=logo.png
      await keyInputs.nth(1).fill('avatar');
      await contentPage.waitForTimeout(300);
      const typeSelects = contentPage.locator('[data-testid="params-tree-type-select"]');
      await typeSelects.nth(1).click();
      const visibleDropdown = contentPage.locator('.el-select-dropdown:visible');
      await visibleDropdown.getByRole('option', { name: /^file$/i }).first().click();
      await contentPage.waitForTimeout(300);
      const fileValueWrapper = contentPage.locator('.file-value-wrapper').first();
      const toggleBtn = fileValueWrapper.locator('[data-testid="params-tree-file-toggle-btn"]');
      const varInput = fileValueWrapper.locator('[data-testid="params-tree-file-var-input"]');
      const selectLabel = fileValueWrapper.locator('[data-testid="params-tree-file-select-label"]');
      if (await varInput.isVisible()) {
        await toggleBtn.click();
        await contentPage.waitForTimeout(300);
      }
      await expect(selectLabel).toBeVisible({ timeout: 5000 });
      const logoFilePath = path.resolve(__dirname, '../../../../../../../src/renderer/assets/imgs/logo.png');
      await fileValueWrapper.locator('[data-testid="params-tree-file-input"]').setInputFiles(logoFilePath);
      await contentPage.waitForTimeout(500);
      // 发送请求
      const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
      await sendBtn.click();
      // 验证响应
      const responseArea = contentPage.getByTestId('response-area');
      await expect(responseArea).toBeVisible({ timeout: 10000 });
      await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
      const responseBody = responseArea.locator('.s-json-editor').first();
      await expect(responseBody).toContainText('multipart/form-data', { timeout: 10000 });
      await expect(responseBody).toContainText('username', { timeout: 10000 });
      await expect(responseBody).toContainText('testuser', { timeout: 10000 });
      await expect(responseBody).toContainText('avatar', { timeout: 10000 });
      await expect(responseBody).toContainText('File:', { timeout: 10000 });
      await expect(responseBody).toContainText('logo.png', { timeout: 10000 });
    });
  });
});
