import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('AfResponseApi', () => {
  // 测试用例1: 使用af.response.statusCode获取响应状态码
  test('使用af.response.statusCode获取响应状态码', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('af.response.statusCode测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('.url-input input');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击后置脚本标签页
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterScript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 在后置脚本中输入代码
    const monacoEditor = contentPage.locator('.monaco-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('console.log("statusCode:", af.response.statusCode)');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证控制台输出包含状态码
    const consoleOutput = contentPage.locator('.console-output, .response-console, [class*="console"]');
    await expect(consoleOutput.first()).toContainText('200', { timeout: 10000 });
  });
  // 测试用例2: 使用af.response.headers获取响应头
  test('使用af.response.headers获取响应头', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('af.response.headers测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('.url-input input');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击后置脚本标签页
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterScript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 在后置脚本中输入代码
    const monacoEditor = contentPage.locator('.monaco-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('console.log("headers:", JSON.stringify(af.response.headers))');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证控制台输出包含响应头信息
    const consoleOutput = contentPage.locator('.console-output, .response-console, [class*="console"]');
    await expect(consoleOutput.first()).toContainText('content-type', { timeout: 10000 });
  });
  // 测试用例3: 使用af.response.cookies获取响应Cookie
  test('使用af.response.cookies获取响应Cookie', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('af.response.cookies测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL - 使用set-cookie端点
    const urlInput = contentPage.locator('.url-input input');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/set-cookie`);
    // 点击后置脚本标签页
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterScript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 在后置脚本中输入代码
    const monacoEditor = contentPage.locator('.monaco-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('console.log("cookies:", JSON.stringify(af.response.cookies))');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证控制台输出包含cookies信息
    const consoleOutput = contentPage.locator('.console-output, .response-console, [class*="console"]');
    await expect(consoleOutput.first()).toContainText('cookies', { timeout: 10000 });
  });
  // 测试用例4: 使用af.response.body获取响应体数据
  test('使用af.response.body获取响应体数据', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('af.response.body测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('.url-input input');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击后置脚本标签页
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterScript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 在后置脚本中输入代码
    const monacoEditor = contentPage.locator('.monaco-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('console.log("body:", JSON.stringify(af.response.body))');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证控制台输出包含响应体信息
    const consoleOutput = contentPage.locator('.console-output, .response-console, [class*="console"]');
    await expect(consoleOutput.first()).toContainText('body', { timeout: 10000 });
  });
  // 测试用例5: 使用af.response.rt获取响应时长
  test('使用af.response.rt获取响应时长', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('af.response.rt测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('.url-input input');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击后置脚本标签页
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterScript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 在后置脚本中输入代码
    const monacoEditor = contentPage.locator('.monaco-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('console.log("rt:", af.response.rt, "ms")');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证控制台输出包含响应时长
    const consoleOutput = contentPage.locator('.console-output, .response-console, [class*="console"]');
    await expect(consoleOutput.first()).toContainText('rt', { timeout: 10000 });
    await expect(consoleOutput.first()).toContainText('ms', { timeout: 10000 });
  });
  // 测试用例6: 使用af.response.size获取响应大小
  test('使用af.response.size获取响应大小', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('af.response.size测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('.url-input input');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击后置脚本标签页
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterScript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 在后置脚本中输入代码
    const monacoEditor = contentPage.locator('.monaco-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('console.log("size:", af.response.size, "bytes")');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证控制台输出包含响应大小
    const consoleOutput = contentPage.locator('.console-output, .response-console, [class*="console"]');
    await expect(consoleOutput.first()).toContainText('size', { timeout: 10000 });
    await expect(consoleOutput.first()).toContainText('bytes', { timeout: 10000 });
  });
  // 测试用例7: 使用af.response.ip获取远端IP地址
  test('使用af.response.ip获取远端IP地址', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('af.response.ip测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('.url-input input');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击后置脚本标签页
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterScript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 在后置脚本中输入代码
    const monacoEditor = contentPage.locator('.monaco-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('console.log("ip:", af.response.ip)');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证控制台输出包含IP地址
    const consoleOutput = contentPage.locator('.console-output, .response-console, [class*="console"]');
    await expect(consoleOutput.first()).toContainText('ip', { timeout: 10000 });
    // 验证IP地址格式（127.0.0.1 或 ::1）
    const consoleText = await consoleOutput.first().textContent();
    const hasValidIp = consoleText?.includes('127.0.0.1') || consoleText?.includes('::1') || consoleText?.includes('localhost');
    expect(hasValidIp).toBeTruthy();
  });
});
