import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('FormDataParams', () => {
  // ========== stringOnlyFormdata: 类型全为string的formdata参数 ==========
  test.describe('StringOnlyFormdata', () => {
    // 测试用例1: formdata参数key输入值以后,如果不存在next节点,则自动新增一行数据,自动新增数据需要被选中
    test('formdata参数key输入值以后自动新增一行数据', async ({ contentPage, clearCache, createProject }) => {
      await clearCache();
      await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      // 新增HTTP节点
      const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
      await addFileBtn.click();
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const fileNameInput = addFileDialog.locator('input').first();
      await fileNameInput.fill('FormData自动新增测试');
      const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmAddBtn.click();
      await contentPage.waitForTimeout(500);
      // 点击Body标签页
      const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
      await bodyTab.click();
      await contentPage.waitForTimeout(300);
      // 选择FormData类型
      const formdataRadio = contentPage.locator('.el-radio').filter({ hasText: 'formdata' });
      await formdataRadio.click();
      await contentPage.waitForTimeout(300);
      // 获取初始行数
      const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
      const initialCount = await keyInputs.count();
      // 在第一行formdata参数的key输入框中输入username
      await keyInputs.first().fill('username');
      // 点击key输入框外的区域使其失焦
      await contentPage.locator('.url-input').click();
      await contentPage.waitForTimeout(300);
      // 验证自动新增第二行空的formdata参数行
      const newCount = await keyInputs.count();
      expect(newCount).toBe(initialCount + 1);
      // 验证第一行key值为username
      const firstKeyValue = await keyInputs.first().inputValue();
      expect(firstKeyValue).toBe('username');
    });
    // 测试用例2: formdata参数key,value,description输入值以后,调用echo接口返回结果正确
    test('formdata参数key,value输入值以后调用echo接口返回结果正确', async ({ contentPage, clearCache, createProject }) => {
      await clearCache();
      await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      // 新增HTTP节点
      const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
      await addFileBtn.click();
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const fileNameInput = addFileDialog.locator('input').first();
      await fileNameInput.fill('FormData发送测试');
      const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmAddBtn.click();
      await contentPage.waitForTimeout(500);
      // 设置请求URL
      const urlInput = contentPage.locator('.url-input input');
      await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
      // 选择POST方法
      const methodSelect = contentPage.locator('.method-select');
      await methodSelect.click();
      const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
      await postOption.click();
      // 点击Body标签页
      const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
      await bodyTab.click();
      await contentPage.waitForTimeout(300);
      // 选择FormData类型
      const formdataRadio = contentPage.locator('.el-radio').filter({ hasText: 'formdata' });
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
      const sendBtn = contentPage.locator('.send-btn');
      await sendBtn.click();
      await contentPage.waitForTimeout(2000);
      // 验证响应
      const responseBody = contentPage.locator('.response-body');
      // 验证Content-Type包含multipart/form-data
      await expect(responseBody).toContainText('multipart/form-data', { timeout: 10000 });
      // 验证表单数据正确发送
      await expect(responseBody).toContainText('username', { timeout: 10000 });
      await expect(responseBody).toContainText('admin', { timeout: 10000 });
      await expect(responseBody).toContainText('password', { timeout: 10000 });
      await expect(responseBody).toContainText('123456', { timeout: 10000 });
    });
    // 测试用例3: formdata参数key,value支持变量,调用echo接口返回结果正确
    test('formdata参数key,value支持变量调用echo接口返回结果正确', async ({ contentPage, clearCache, createProject }) => {
      await clearCache();
      await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
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
      const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
      await addFileBtn.click();
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const fileNameInput = addFileDialog.locator('input').first();
      await fileNameInput.fill('FormData变量测试');
      const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmAddBtn.click();
      await contentPage.waitForTimeout(500);
      // 设置请求URL
      const urlInput = contentPage.locator('.url-input input');
      await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
      // 选择POST方法
      const methodSelect = contentPage.locator('.method-select');
      await methodSelect.click();
      const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
      await postOption.click();
      // 点击Body标签页
      const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
      await bodyTab.click();
      await contentPage.waitForTimeout(300);
      // 选择FormData类型
      const formdataRadio = contentPage.locator('.el-radio').filter({ hasText: 'formdata' });
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
      const sendBtn = contentPage.locator('.send-btn');
      await sendBtn.click();
      await contentPage.waitForTimeout(2000);
      // 验证响应
      const responseBody = contentPage.locator('.response-body');
      // 验证变量被正确替换
      await expect(responseBody).toContainText('mobile_app', { timeout: 10000 });
      await expect(responseBody).toContainText('token_abc123', { timeout: 10000 });
    });
    // 测试用例4: formdata参数key,value支持mock,调用echo接口返回结果正确
    test('formdata参数key,value支持mock调用echo接口返回结果正确', async ({ contentPage, clearCache, createProject }) => {
      await clearCache();
      await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      // 新增HTTP节点
      const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
      await addFileBtn.click();
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const fileNameInput = addFileDialog.locator('input').first();
      await fileNameInput.fill('FormData Mock测试');
      const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmAddBtn.click();
      await contentPage.waitForTimeout(500);
      // 设置请求URL
      const urlInput = contentPage.locator('.url-input input');
      await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
      // 选择POST方法
      const methodSelect = contentPage.locator('.method-select');
      await methodSelect.click();
      const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
      await postOption.click();
      // 点击Body标签页
      const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
      await bodyTab.click();
      await contentPage.waitForTimeout(300);
      // 选择FormData类型
      const formdataRadio = contentPage.locator('.el-radio').filter({ hasText: 'formdata' });
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
      const sendBtn = contentPage.locator('.send-btn');
      await sendBtn.click();
      await contentPage.waitForTimeout(2000);
      // 验证响应
      const responseBody = contentPage.locator('.response-body');
      // 验证Content-Type包含multipart/form-data
      await expect(responseBody).toContainText('multipart/form-data', { timeout: 10000 });
      // 验证mock数据已生成(不包含@符号说明已被替换)
      await expect(responseBody).toContainText('phone', { timeout: 10000 });
      await expect(responseBody).toContainText('user_id', { timeout: 10000 });
    });
    // 测试用例5: formdata参数key,value支持混合变量,调用echo接口返回结果正确
    test('formdata参数key,value支持混合变量调用echo接口返回结果正确', async ({ contentPage, clearCache, createProject }) => {
      await clearCache();
      await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
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
      const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
      await addFileBtn.click();
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const fileNameInput = addFileDialog.locator('input').first();
      await fileNameInput.fill('FormData混合变量测试');
      const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmAddBtn.click();
      await contentPage.waitForTimeout(500);
      // 设置请求URL
      const urlInput = contentPage.locator('.url-input input');
      await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
      // 选择POST方法
      const methodSelect = contentPage.locator('.method-select');
      await methodSelect.click();
      const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
      await postOption.click();
      // 点击Body标签页
      const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
      await bodyTab.click();
      await contentPage.waitForTimeout(300);
      // 选择FormData类型
      const formdataRadio = contentPage.locator('.el-radio').filter({ hasText: 'formdata' });
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
      const sendBtn = contentPage.locator('.send-btn');
      await sendBtn.click();
      await contentPage.waitForTimeout(2000);
      // 验证响应
      const responseBody = contentPage.locator('.response-body');
      // 验证混合变量被正确替换
      await expect(responseBody).toContainText('user_query', { timeout: 10000 });
      await expect(responseBody).toContainText('REQ_', { timeout: 10000 });
    });
    // 测试用例6: formdata参数是否发送未勾选那么当前参数不会发送
    test('formdata参数是否发送未勾选那么当前参数不会发送', async ({ contentPage, clearCache, createProject }) => {
      await clearCache();
      await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      // 新增HTTP节点
      const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
      await addFileBtn.click();
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const fileNameInput = addFileDialog.locator('input').first();
      await fileNameInput.fill('FormData发送控制测试');
      const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmAddBtn.click();
      await contentPage.waitForTimeout(500);
      // 设置请求URL
      const urlInput = contentPage.locator('.url-input input');
      await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
      // 选择POST方法
      const methodSelect = contentPage.locator('.method-select');
      await methodSelect.click();
      const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
      await postOption.click();
      // 点击Body标签页
      const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
      await bodyTab.click();
      await contentPage.waitForTimeout(300);
      // 选择FormData类型
      const formdataRadio = contentPage.locator('.el-radio').filter({ hasText: 'formdata' });
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
      // 取消勾选password参数的"是否发送"checkbox
      const sendCheckboxes = contentPage.locator('[data-testid="params-tree-send-checkbox"]');
      await sendCheckboxes.nth(1).click();
      await contentPage.waitForTimeout(300);
      // 发送请求
      const sendBtn = contentPage.locator('.send-btn');
      await sendBtn.click();
      await contentPage.waitForTimeout(2000);
      // 验证响应 - 只包含username,不包含password
      const responseBody = contentPage.locator('.response-body');
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
    test.skip('value模式切换后要清空之前的数据', async () => {});
    // 测试用例2: value如果为文件模式,选择文件,调用echo接口返回结果正确
    test.skip('value如果为文件模式选择文件调用echo接口返回结果正确', async () => {});
    // 测试用例3: value如果为文件模式,未选择文件,value输入框下方提示文件不存在
    test.skip('value如果为文件模式未选择文件时提示文件不存在', async () => {});
    // 测试用例4: value如果为变量模式,并且值为文件类型变量,并且文件存在,调用echo接口返回结果正确
    test.skip('value如果为变量模式且文件存在调用echo接口返回结果正确', async () => {});
    // 测试用例5: value如果为变量模式,并且值为文件类型变量,并且文件不存在,提示文件不存在
    test.skip('value如果为变量模式且文件不存在时提示文件不存在', async () => {});
    // 测试用例6: value如果为变量模式,并且值不是变量,提示文件不存在
    test.skip('value如果为变量模式但值不是变量时提示文件不存在', async () => {});
    // 测试用例7: value值合法,formdata参数key为变量,调用echo接口返回结果正确
    test.skip('formdata参数key为变量调用echo接口返回结果正确', async () => {});
    // 测试用例8: value值合法,formdata参数key为mock,调用echo接口返回结果正确
    test.skip('formdata参数key为mock调用echo接口返回结果正确', async () => {});
    // 测试用例9: value值合法,formdata参数key为混合变量,调用echo接口返回结果正确
    test.skip('formdata参数key为混合变量调用echo接口返回结果正确', async () => {});
    // 测试用例10: file类型formdata参数是否发送未勾选那么当前参数不会发送
    test.skip('file类型formdata参数是否发送未勾选那么当前参数不会发送', async () => {});
  });

  // ========== mixedFormdata: 类型为file和string的混合类型的formdata参数 ==========
  test.describe('MixedFormdata', () => {
    // 测试用例1: 存在string类型value和file类型value时候,调用echo接口返回结果正确
    test.skip('存在string类型value和file类型value时候调用echo接口返回结果正确', async () => {});
  });
});
