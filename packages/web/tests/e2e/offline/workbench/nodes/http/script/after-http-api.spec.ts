import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('AfterHttpApi', () => {
  // 使用后置脚本 af.http.get/post/put/delete 触发二次请求并校验返回
  test('后置脚本可通过af.http.get/post/put/delete执行请求', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 创建HTTP节点并配置主请求URL
    await createNode(contentPage, { nodeType: 'http', name: 'af.http四方法测试' });
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 切换到后置脚本并写入四种请求方法断言
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterscript"]');
    await afterScriptTab.click();
    const monacoEditor = contentPage.locator('#pane-afterRequest .s-monaco-editor, .s-monaco-editor:visible').first();
    await expect(monacoEditor).toBeVisible({ timeout: 5000 });
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type(`const getRes = await af.http.get("http://127.0.0.1:${MOCK_SERVER_PORT}/echo", { params: { from: "get" } }); if (getRes.statusCode !== 200 || !getRes.body.includes("from=get")) { throw new Error("af.http.get失败"); } const postRes = await af.http.post("http://127.0.0.1:${MOCK_SERVER_PORT}/echo", { body: { source: "post" } }); if (postRes.statusCode !== 200 || !postRes.body.includes("\\"method\\":\\"POST\\"")) { throw new Error("af.http.post失败"); } const putRes = await af.http.put("http://127.0.0.1:${MOCK_SERVER_PORT}/echo", { body: { source: "put" } }); if (putRes.statusCode !== 200 || !putRes.body.includes("\\"method\\":\\"PUT\\"")) { throw new Error("af.http.put失败"); } const deleteRes = await af.http.delete("http://127.0.0.1:${MOCK_SERVER_PORT}/echo?source=delete"); if (deleteRes.statusCode !== 200 || !deleteRes.body.includes("\\"method\\":\\"DELETE\\"")) { throw new Error("af.http.delete失败"); }`);
    // 发送主请求并验证后置脚本执行成功
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    const responseArea = contentPage.locator('[data-testid="response-area"]');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.locator('[data-testid="status-code"]').first()).toContainText('200', { timeout: 10000 });
    await expect(responseArea.locator('[data-testid="response-error"]')).toHaveCount(0);
  });
  // 后置脚本二次请求失败时应进入错误分支并在响应区展示错误信息
  test('后置脚本af.http请求失败时在响应区域展示错误', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 创建HTTP节点并配置主请求URL
    await createNode(contentPage, { nodeType: 'http', name: 'af.http错误分支测试' });
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 切换到后置脚本并写入会失败的二次请求
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterscript"]');
    await afterScriptTab.click();
    const monacoEditor = contentPage.locator('#pane-afterRequest .s-monaco-editor, .s-monaco-editor:visible').first();
    await expect(monacoEditor).toBeVisible({ timeout: 5000 });
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('await af.http.get("http://127.0.0.1:1/unreachable", { timeout: 200 });');
    // 发送主请求并校验错误分支文案
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    const responseArea = contentPage.locator('[data-testid="response-area"]');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    const responseError = responseArea.locator('[data-testid="response-error"]');
    await expect(responseError).toBeVisible({ timeout: 10000 });
    await expect(responseError).toContainText(/ECONNREFUSED|timeout|connect|socket/i);
  });
});

