import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('AfterScriptExecution', () => {
  // 后置脚本语法错误时,在响应区域展示脚本错误信息
  test('后置脚本语法错误时在响应区域展示脚本错误信息', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('后置脚本语法错误测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('.url-input input');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(300);
    // 点击后置脚本标签页
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterscript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(500);
    // 在后置脚本编辑器中输入有语法错误的代码
    const afterScriptEditor = contentPage.locator('.s-monaco-editor').first();
    await afterScriptEditor.click();
    await contentPage.waitForTimeout(300);
    // 输入语法错误的代码: 缺少闭合括号
    await contentPage.keyboard.type('const x = { invalid syntax');
    await contentPage.waitForTimeout(500);
    // 发送请求
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证响应区域显示脚本错误信息
    const responseBody = contentPage.locator('.response-body');
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证错误信息（脚本语法错误会显示在响应区域）
    const errorText = await responseBody.textContent();
    expect(errorText?.toLowerCase()).toContain('error');
  });
  // 后置脚本运行时错误时,在响应区域展示运行时错误信息
  test('后置脚本运行时错误时在响应区域展示运行时错误信息', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('后置脚本运行时错误测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('.url-input input');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(300);
    // 点击后置脚本标签页
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterscript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(500);
    // 在后置脚本编辑器中输入会导致运行时错误的代码
    const afterScriptEditor = contentPage.locator('.s-monaco-editor').first();
    await afterScriptEditor.click();
    await contentPage.waitForTimeout(300);
    // 输入运行时错误的代码: 访问null的属性
    await contentPage.keyboard.type('const x = null; x.property;');
    await contentPage.waitForTimeout(500);
    // 发送请求
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证响应区域显示脚本运行时错误信息
    const responseBody = contentPage.locator('.response-body');
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证错误信息（运行时错误会显示在响应区域）
    const errorText = await responseBody.textContent();
    expect(errorText?.toLowerCase()).toContain('error');
  });
  // 后置脚本在主请求响应后执行
  test('后置脚本在主请求响应后执行', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('后置脚本执行顺序测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('.url-input input');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(300);
    // 点击后置脚本标签页
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterscript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(500);
    // 在后置脚本编辑器中输入访问响应的代码
    const afterScriptEditor = contentPage.locator('.s-monaco-editor').first();
    await afterScriptEditor.click();
    await contentPage.waitForTimeout(300);
    // 输入访问响应状态码的代码
    await contentPage.keyboard.type('const statusCode = af.response.statusCode;');
    await contentPage.waitForTimeout(500);
    // 发送请求
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证主请求成功返回（后置脚本在主请求响应后执行，不影响主请求结果）
    const responseBody = contentPage.locator('.response-body');
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证响应中包含echo接口返回的数据，说明主请求成功执行
    await expect(responseBody).toContainText('host', { timeout: 10000 });
    await expect(responseBody).toContainText('127.0.0.1', { timeout: 10000 });
    // 验证响应状态码为200，表示请求成功
    const statusInfo = contentPage.locator('.status-info');
    await expect(statusInfo).toContainText('200', { timeout: 10000 });
  });
});
