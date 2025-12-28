import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('EnvVariableAccess', () => {
  // 测试用例1: 使用af.envs获取所有环境变量列表
  test('使用af.envs获取所有环境变量列表', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
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
    // 创建变量 testEnvVar=test_value
    const nameInput = variablePage.locator('.left input').first();
    await nameInput.fill('testEnvVar');
    const valueTextarea = variablePage.locator('.left textarea');
    await valueTextarea.fill('test_value');
    const addBtn = variablePage.locator('.left .el-button--primary');
    await addBtn.click();
    await contentPage.waitForTimeout(500);
    // 创建变量 anotherVar=another_value
    await nameInput.fill('anotherVar');
    await valueTextarea.fill('another_value');
    await addBtn.click();
    await contentPage.waitForTimeout(500);
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('af.envs测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击前置脚本标签页
    const preScriptTab = contentPage.locator('[data-testid="http-params-tab-prescript"]');
    await preScriptTab.click();
    await contentPage.waitForTimeout(500);
    // 在前置脚本编辑器中输入代码
    const editor = contentPage.locator('.s-monaco-editor');
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click();
    await contentPage.waitForTimeout(300);
    // 输入前置脚本代码: 获取所有环境变量并打印
    const scriptCode = `console.log("所有环境变量:", JSON.stringify(af.envs));`;
    await contentPage.keyboard.type(scriptCode);
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证响应区域存在
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toBeVisible({ timeout: 10000 });
  });
  // 测试用例2: 使用af.currentEnv获取当前激活的环境变量
  test('使用af.currentEnv获取当前激活的环境变量', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
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
    // 创建变量 currentEnvVar=current_value
    const nameInput = variablePage.locator('.left input').first();
    await nameInput.fill('currentEnvVar');
    const valueTextarea = variablePage.locator('.left textarea');
    await valueTextarea.fill('current_value');
    const addBtn = variablePage.locator('.left .el-button--primary');
    await addBtn.click();
    await contentPage.waitForTimeout(500);
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('af.currentEnv测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击前置脚本标签页
    const preScriptTab = contentPage.locator('[data-testid="http-params-tab-prescript"]');
    await preScriptTab.click();
    await contentPage.waitForTimeout(500);
    // 在前置脚本编辑器中输入代码
    const editor = contentPage.locator('.s-monaco-editor');
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click();
    await contentPage.waitForTimeout(300);
    // 输入前置脚本代码: 获取当前激活的环境变量并打印
    const scriptCode = `console.log("当前环境变量:", JSON.stringify(af.currentEnv));`;
    await contentPage.keyboard.type(scriptCode);
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证响应区域存在
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toBeVisible({ timeout: 10000 });
  });
});
