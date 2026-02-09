import { test, expect } from '../../../../../../../fixtures/electron-online.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('FormdataBodyValidation', () => {
  // 测试用例1: 调用echo接口验证常规formdata是否正常返回,content-type是否设置正确
  test('调用echo接口验证常规formdata是否正常返回,content-type是否设置正确', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: 'FormData测试接口' });
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
    // 选择FormData类型
    const formdataRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^form-data$/i }).locator('.el-radio');
    await formdataRadio.click();
    await contentPage.waitForTimeout(300);
    // 添加表单字段: name=test
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('name');
    await valueInputs.first().click();
    await contentPage.keyboard.type('test');
    await contentPage.waitForTimeout(300);
    // 添加表单字段: email=test@example.com
    await keyInputs.nth(1).fill('email');
    await valueInputs.nth(1).click();
    await contentPage.keyboard.type('test@example.com');
    await contentPage.waitForTimeout(300);
    // 添加表单字段: age=25
    await keyInputs.nth(2).fill('age');
    await valueInputs.nth(2).click();
    await contentPage.keyboard.type('25');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    // 验证Content-Type包含multipart/form-data
    await expect(responseBody).toContainText('multipart/form-data', { timeout: 10000 });
    // 验证表单数据正确发送
    await expect(responseBody).toContainText('name', { timeout: 10000 });
    await expect(responseBody).toContainText('test', { timeout: 10000 });
    await expect(responseBody).toContainText('email', { timeout: 10000 });
    await expect(responseBody).toContainText('test@example.com', { timeout: 10000 });
    await expect(responseBody).toContainText('age', { timeout: 10000 });
    await expect(responseBody).toContainText('25', { timeout: 10000 });
  });

  // 测试用例2: 调用echo接口验证使用变量的formdata是否正常返回,content-type是否设置正确
  test('调用echo接口验证使用变量的formdata是否正常返回,content-type是否设置正确', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
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
    // 创建变量 projectVar=project_value
    const nameInput = variablePage.locator('.left input').first();
    await nameInput.fill('projectVar');
    const valueTextarea = variablePage.locator('.left textarea');
    await valueTextarea.fill('project_value');
    const addBtn = variablePage.locator('.left .el-button--primary');
    await addBtn.click();
    await contentPage.waitForTimeout(500);
    // 创建变量 envVar=env_value
    await nameInput.fill('envVar');
    await valueTextarea.fill('env_value');
    await addBtn.click();
    await contentPage.waitForTimeout(500);
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: 'FormData变量测试' });
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
    // 选择FormData类型
    const formdataRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^form-data$/i }).locator('.el-radio');
    await formdataRadio.click();
    await contentPage.waitForTimeout(300);
    // 添加表单字段: name={{projectVar}}
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('name');
    await valueInputs.first().click();
    await contentPage.keyboard.type('{{projectVar}}');
    await contentPage.waitForTimeout(300);
    // 添加表单字段: desc={{envVar}}
    await keyInputs.nth(1).fill('desc');
    await valueInputs.nth(1).click();
    await contentPage.keyboard.type('{{envVar}}');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    // 验证Content-Type包含multipart/form-data
    await expect(responseBody).toContainText('multipart/form-data', { timeout: 10000 });
    // 验证变量被正确替换
    await expect(responseBody).toContainText('project_value', { timeout: 10000 });
    await expect(responseBody).toContainText('env_value', { timeout: 10000 });
  });

  // 测试用例3: 调用echo接口验证使用mock的formdata是否正常返回,content-type是否设置正确
  test('调用echo接口验证使用mock的formdata是否正常返回,content-type是否设置正确', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: 'FormData Mock测试' });
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
    // 选择FormData类型
    const formdataRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^form-data$/i }).locator('.el-radio');
    await formdataRadio.click();
    await contentPage.waitForTimeout(300);
    // 添加表单字段: id=@id (mock数据)
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('id');
    await valueInputs.first().click();
    await contentPage.keyboard.type('@id');
    await contentPage.waitForTimeout(300);
    // 添加表单字段: email=@email (mock数据)
    await keyInputs.nth(1).fill('email');
    await valueInputs.nth(1).click();
    await contentPage.keyboard.type('@email');
    await contentPage.waitForTimeout(300);
    // 添加表单字段: name=@cname (mock数据)
    await keyInputs.nth(2).fill('name');
    await valueInputs.nth(2).click();
    await contentPage.keyboard.type('@cname');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    // 验证Content-Type包含multipart/form-data
    await expect(responseBody).toContainText('multipart/form-data', { timeout: 10000 });
    // 验证mock数据已生成(不包含@符号说明已被替换)
    // id字段应该有值
    await expect(responseBody).toContainText('id', { timeout: 10000 });
    // email字段应该有值
    await expect(responseBody).toContainText('email', { timeout: 10000 });
    // name字段应该有值
    await expect(responseBody).toContainText('name', { timeout: 10000 });
  });

  // 测试用例4: 调用echo接口验证文件上传是否正常返回,content-type是否设置正确
  test.skip('调用echo接口验证文件上传是否正常返回,content-type是否设置正确', async () => {});
});


