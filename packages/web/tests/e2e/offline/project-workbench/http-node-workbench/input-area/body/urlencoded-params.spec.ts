import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('UrlencodedParams', () => {
  // 测试用例1: urlencoded参数key输入值以后,如果不存在next节点,则自动新增一行数据,自动新增数据需要被选中
  test('urlencoded参数key输入值以后自动新增一行数据', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Urlencoded自动新增测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 点击Body标签页
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择urlencoded类型
    const urlencodedRadio = contentPage.locator('.el-radio').filter({ hasText: 'urlencoded' });
    await urlencodedRadio.click();
    await contentPage.waitForTimeout(300);
    // 获取初始行数
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const initialCount = await keyInputs.count();
    // 在第一行urlencoded参数的key输入框中输入username
    await keyInputs.first().fill('username');
    // 点击key输入框外的区域使其失焦
    await contentPage.locator('[data-testid="url-input"]').click();
    await contentPage.waitForTimeout(300);
    // 验证自动新增第二行空的urlencoded参数行
    const newCount = await keyInputs.count();
    expect(newCount).toBe(initialCount + 1);
    // 验证第一行key值为username
    const firstKeyValue = await keyInputs.first().inputValue();
    expect(firstKeyValue).toBe('username');
  });
  // 测试用例2: urlencoded参数key,value输入值以后,调用echo接口返回结果正确
  test('urlencoded参数key,value输入值以后调用echo接口返回结果正确', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Urlencoded发送测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 选择POST方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
    await postOption.click();
    // 点击Body标签页
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择urlencoded类型
    const urlencodedRadio = contentPage.locator('.el-radio').filter({ hasText: 'urlencoded' });
    await urlencodedRadio.click();
    await contentPage.waitForTimeout(300);
    // 添加表单字段: username=admin
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('username');
    await valueInputs.first().click();
    await contentPage.keyboard.type('admin');
    await contentPage.waitForTimeout(300);
    // 添加表单字段: password=secret
    await keyInputs.nth(1).fill('password');
    await valueInputs.nth(1).click();
    await contentPage.keyboard.type('secret');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    // 验证Content-Type包含application/x-www-form-urlencoded
    await expect(responseBody).toContainText('application/x-www-form-urlencoded', { timeout: 10000 });
    // 验证表单数据正确发送
    await expect(responseBody).toContainText('username', { timeout: 10000 });
    await expect(responseBody).toContainText('admin', { timeout: 10000 });
    await expect(responseBody).toContainText('password', { timeout: 10000 });
    await expect(responseBody).toContainText('secret', { timeout: 10000 });
  });
  // 测试用例3: urlencoded参数key,value支持变量,调用echo接口返回结果正确
  test('urlencoded参数key,value支持变量调用echo接口返回结果正确', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 打开变量管理页面并创建变量
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const variableOption = contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ });
    await variableOption.click();
    await contentPage.waitForTimeout(500);
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    // 创建变量 account=user123
    const nameInput = variablePage.locator('.left input').first();
    await nameInput.fill('account');
    const valueTextarea = variablePage.locator('.left textarea');
    await valueTextarea.fill('user123');
    const addBtn = variablePage.locator('.left .el-button--primary');
    await addBtn.click();
    await contentPage.waitForTimeout(500);
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Urlencoded变量测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 选择POST方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
    await postOption.click();
    // 点击Body标签页
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择urlencoded类型
    const urlencodedRadio = contentPage.locator('.el-radio').filter({ hasText: 'urlencoded' });
    await urlencodedRadio.click();
    await contentPage.waitForTimeout(300);
    // 添加表单字段: user={{account}}
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('user');
    await valueInputs.first().click();
    await contentPage.keyboard.type('{{account}}');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    // 验证变量被正确替换
    await expect(responseBody).toContainText('user123', { timeout: 10000 });
  });
  // 测试用例4: urlencoded参数key,value支持mock,调用echo接口返回结果正确
  test('urlencoded参数key,value支持mock调用echo接口返回结果正确', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Urlencoded Mock测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 选择POST方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
    await postOption.click();
    // 点击Body标签页
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择urlencoded类型
    const urlencodedRadio = contentPage.locator('.el-radio').filter({ hasText: 'urlencoded' });
    await urlencodedRadio.click();
    await contentPage.waitForTimeout(300);
    // 添加表单字段: name=@name (mock数据)
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('name');
    await valueInputs.first().click();
    await contentPage.keyboard.type('@cname');
    await contentPage.waitForTimeout(300);
    // 添加表单字段: email=@email (mock数据)
    await keyInputs.nth(1).fill('email');
    await valueInputs.nth(1).click();
    await contentPage.keyboard.type('@email');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    // 验证Content-Type包含application/x-www-form-urlencoded
    await expect(responseBody).toContainText('application/x-www-form-urlencoded', { timeout: 10000 });
    // 验证mock数据已生成(字段名存在)
    await expect(responseBody).toContainText('name', { timeout: 10000 });
    await expect(responseBody).toContainText('email', { timeout: 10000 });
  });
  // 测试用例5: urlencoded参数key,value支持混合变量,调用echo接口返回结果正确
  test('urlencoded参数key,value支持混合变量调用echo接口返回结果正确', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 打开变量管理页面并创建变量
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const variableOption = contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ });
    await variableOption.click();
    await contentPage.waitForTimeout(500);
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    // 创建变量 api_v=v1
    const nameInput = variablePage.locator('.left input').first();
    await nameInput.fill('api_v');
    const valueTextarea = variablePage.locator('.left textarea');
    await valueTextarea.fill('v1');
    const addBtn = variablePage.locator('.left .el-button--primary');
    await addBtn.click();
    await contentPage.waitForTimeout(500);
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Urlencoded混合变量测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 选择POST方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
    await postOption.click();
    // 点击Body标签页
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择urlencoded类型
    const urlencodedRadio = contentPage.locator('.el-radio').filter({ hasText: 'urlencoded' });
    await urlencodedRadio.click();
    await contentPage.waitForTimeout(300);
    // 添加表单字段: version=api_{{api_v}} (变量混合文本)
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('version');
    await valueInputs.first().click();
    await contentPage.keyboard.type('api_{{api_v}}');
    await contentPage.waitForTimeout(300);
    // 添加表单字段: request_id=REQ_@id (文本混合mock)
    await keyInputs.nth(1).fill('request_id');
    await valueInputs.nth(1).click();
    await contentPage.keyboard.type('REQ_@id');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    // 验证混合变量被正确替换
    await expect(responseBody).toContainText('api_v1', { timeout: 10000 });
    await expect(responseBody).toContainText('REQ_', { timeout: 10000 });
  });
  // 测试用例6: urlencoded参数是否发送未勾选那么当前参数不会发送
  test('urlencoded参数是否发送未勾选那么当前参数不会发送', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Urlencoded发送控制测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 选择POST方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
    await postOption.click();
    // 点击Body标签页
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择urlencoded类型
    const urlencodedRadio = contentPage.locator('.el-radio').filter({ hasText: 'urlencoded' });
    await urlencodedRadio.click();
    await contentPage.waitForTimeout(300);
    // 添加表单字段: user=admin (已勾选)
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('user');
    await valueInputs.first().click();
    await contentPage.keyboard.type('admin');
    await contentPage.waitForTimeout(300);
    // 添加表单字段: token=abc123 (将取消勾选)
    await keyInputs.nth(1).fill('token');
    await valueInputs.nth(1).click();
    await contentPage.keyboard.type('abc123');
    await contentPage.waitForTimeout(300);
    // 取消勾选token参数的"是否发送"checkbox
    const tokenRow = contentPage.locator('[data-testid="params-tree-row"]').filter({ hasText: /^token$/i }).first();
    await tokenRow.getByRole('checkbox').first().click();
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应 - 只包含user,不包含token
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('user', { timeout: 10000 });
    await expect(responseBody).toContainText('admin', { timeout: 10000 });
    // 验证token没有被发送
    const responseText = await responseBody.textContent();
    expect(responseText).not.toContain('token');
  });
});


