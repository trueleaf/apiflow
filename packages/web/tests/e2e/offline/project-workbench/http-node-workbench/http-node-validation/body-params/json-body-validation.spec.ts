import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('JsonBodyValidation', () => {
  // 测试用例1: 调用echo接口验证常规json是否正常返回,content-type是否设置正确
  test('调用echo接口验证常规json是否正常返回,content-type是否设置正确', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('JSON常规测试接口');
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
    // 选择JSON类型
    const jsonRadio = contentPage.locator('.el-radio').filter({ hasText: 'json' });
    await jsonRadio.click();
    await contentPage.waitForTimeout(300);
    // 输入常规JSON数据
    const monacoEditor = contentPage.locator('.s-code-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('{"name":"test","age":20,"active":true}');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.locator('.response-body');
    // 验证Content-Type包含application/json
    await expect(responseBody).toContainText('application/json', { timeout: 10000 });
    // 验证JSON数据正确发送
    await expect(responseBody).toContainText('name', { timeout: 10000 });
    await expect(responseBody).toContainText('test', { timeout: 10000 });
    await expect(responseBody).toContainText('age', { timeout: 10000 });
    await expect(responseBody).toContainText('20', { timeout: 10000 });
    await expect(responseBody).toContainText('active', { timeout: 10000 });
    await expect(responseBody).toContainText('true', { timeout: 10000 });
  });
  // 测试用例2: 调用echo接口验证使用变量(所有类型变量都需要验证)的json是否正常返回,content-type是否设置正确
  test('调用echo接口验证使用变量的json是否正常返回,content-type是否设置正确', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
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
    // 创建变量 globalVar=global_value
    const nameInput = variablePage.locator('.left input').first();
    await nameInput.fill('globalVar');
    const valueTextarea = variablePage.locator('.left textarea');
    await valueTextarea.fill('global_value');
    const addBtn = variablePage.locator('.left .el-button--primary');
    await addBtn.click();
    await contentPage.waitForTimeout(500);
    // 创建变量 envVar=env_value
    await nameInput.fill('envVar');
    await valueTextarea.fill('env_value');
    await addBtn.click();
    await contentPage.waitForTimeout(500);
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('JSON变量测试接口');
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
    // 选择JSON类型
    const jsonRadio = contentPage.locator('.el-radio').filter({ hasText: 'json' });
    await jsonRadio.click();
    await contentPage.waitForTimeout(300);
    // 输入包含变量的JSON数据
    const monacoEditor = contentPage.locator('.s-code-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('{"global":"{{globalVar}}","env":"{{envVar}}"}');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.locator('.response-body');
    // 验证Content-Type包含application/json
    await expect(responseBody).toContainText('application/json', { timeout: 10000 });
    // 验证变量已被正确替换
    await expect(responseBody).toContainText('global_value', { timeout: 10000 });
    await expect(responseBody).toContainText('env_value', { timeout: 10000 });
  });
  // 测试用例3: 调用echo接口验证使用mock(验证所有mock字段)的json是否正常返回,content-type是否设置正确
  test('调用echo接口验证使用mock的json是否正常返回,content-type是否设置正确', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('JSON Mock测试接口');
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
    // 选择JSON类型
    const jsonRadio = contentPage.locator('.el-radio').filter({ hasText: 'json' });
    await jsonRadio.click();
    await contentPage.waitForTimeout(300);
    // 输入包含mock数据的JSON
    const monacoEditor = contentPage.locator('.s-code-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('{"id":"@id","name":"@cname","email":"@email"}');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.locator('.response-body');
    // 验证Content-Type包含application/json
    await expect(responseBody).toContainText('application/json', { timeout: 10000 });
    // 验证mock数据已被生成（不再是@notation形式）
    // 由于mock会生成随机数据，验证响应中包含id、name、email字段
    await expect(responseBody).toContainText('id', { timeout: 10000 });
    await expect(responseBody).toContainText('name', { timeout: 10000 });
    await expect(responseBody).toContainText('email', { timeout: 10000 });
    // 验证mock数据已被替换（不应该包含@notation）
    const responseText = await responseBody.textContent();
    expect(responseText).not.toContain('@id');
    expect(responseText).not.toContain('@cname');
    expect(responseText).not.toContain('@email');
  });
  // 测试用例4: 调用echo接口验证使用基础类型的json(例如: null,1,true, "string")是否正常返回,content-type是否设置正确
  test('调用echo接口验证基础类型json是否正常返回,content-type是否设置正确', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('JSON基础类型测试-null');
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
    // 选择JSON类型
    const jsonRadio = contentPage.locator('.el-radio').filter({ hasText: 'json' });
    await jsonRadio.click();
    await contentPage.waitForTimeout(300);
    // 测试null类型
    const monacoEditor = contentPage.locator('.s-code-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('null');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.locator('.response-body');
    await expect(responseBody).toContainText('application/json', { timeout: 10000 });
    await expect(responseBody).toContainText('null', { timeout: 10000 });
    // 测试数字类型
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('123');
    await contentPage.waitForTimeout(300);
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    await expect(responseBody).toContainText('123', { timeout: 10000 });
    // 测试布尔值类型
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('true');
    await contentPage.waitForTimeout(300);
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    await expect(responseBody).toContainText('true', { timeout: 10000 });
    // 测试字符串类型
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('"hello world"');
    await contentPage.waitForTimeout(300);
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    await expect(responseBody).toContainText('hello world', { timeout: 10000 });
    // 测试数组类型
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('[1,2,3]');
    await contentPage.waitForTimeout(300);
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    await expect(responseBody).toContainText('1', { timeout: 10000 });
    await expect(responseBody).toContainText('2', { timeout: 10000 });
    await expect(responseBody).toContainText('3', { timeout: 10000 });
  });
});
