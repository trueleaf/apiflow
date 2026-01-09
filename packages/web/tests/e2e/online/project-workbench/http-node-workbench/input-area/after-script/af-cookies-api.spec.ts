import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('AfCookiesApi', () => {
  // 使用af.cookies.get(name)获取指定Cookie值
  test('使用af.cookies.get(name)获取指定Cookie值', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: 'Cookie获取测试' });
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 切换到后置脚本Tab
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterscript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 在后置脚本编辑器中输入代码
    const monacoEditor = contentPage.locator('.s-monaco-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('af.cookies["session_id"] = "test_session_123";\nconst sessionId = af.cookies["session_id"];\nconsole.log("sessionId:", sessionId);');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应成功
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toBeVisible({ timeout: 10000 });
  });
  // 使用af.cookies.getAll()获取所有Cookie - 通过设置多个cookie验证
  test('使用af.cookies.getAll()获取所有Cookie', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: 'Cookie获取全部测试' });
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 切换到后置脚本Tab
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterscript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 在后置脚本编辑器中输入代码设置多个cookie
    const monacoEditor = contentPage.locator('.s-monaco-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('af.cookies["cookie1"] = "value1";\naf.cookies["cookie2"] = "value2";\nconst allCookies = af.cookies;\nconsole.log("allCookies:", allCookies);');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应成功
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toBeVisible({ timeout: 10000 });
  });
  // 使用af.cookies.set(name, value)设置Cookie值
  test('使用af.cookies.set(name, value)设置Cookie值', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: 'Cookie设置测试' });
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 切换到后置脚本Tab
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterscript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 在后置脚本编辑器中输入代码设置cookie
    const monacoEditor = contentPage.locator('.s-monaco-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('af.cookies["auth_token"] = "xyz789";\nconsole.log("Cookie已设置:", af.cookies["auth_token"]);');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应成功
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toBeVisible({ timeout: 10000 });
  });
  // 使用af.cookies.remove(name)删除Cookie - 通过delete操作符
  test('使用af.cookies.remove(name)删除Cookie', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: 'Cookie删除测试' });
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 切换到后置脚本Tab
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterscript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 在后置脚本编辑器中输入代码先设置再删除cookie
    const monacoEditor = contentPage.locator('.s-monaco-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('af.cookies["auth_token"] = "xyz789";\nconsole.log("Cookie设置后:", af.cookies["auth_token"]);\ndelete af.cookies["auth_token"];\nconsole.log("Cookie删除后:", af.cookies["auth_token"]);');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应成功
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toBeVisible({ timeout: 10000 });
  });
});


