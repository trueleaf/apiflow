import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('ResponseBasicInfo', () => {
  // 测试用例1: 未发送请求时,响应基本信息展示:状态码,时长,大小,格式显示为?图标
  test('未发送请求时响应基本信息显示问号图标', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '响应信息测试接口' });
    // 验证响应摘要区域存在
    const responseSummary = contentPage.locator('.response-summary-view');
    await expect(responseSummary).toBeVisible({ timeout: 5000 });
    // 验证未请求时显示?图标(通过el-icon的存在来验证)
    const questionIcons = responseSummary.locator('.el-icon');
    await expect(questionIcons.first()).toBeVisible({ timeout: 3000 });
    // 验证状态码标签存在
    await expect(responseSummary).toContainText(/状态码|Status/);
    // 验证时长标签存在
    await expect(responseSummary).toContainText(/时长|Duration/);
    // 验证大小标签存在
    await expect(responseSummary).toContainText(/大小|Size/);
    // 验证格式标签存在
    await expect(responseSummary).toContainText(/格式|Format/);
  });
  // 测试用例2: 发送请求成功,展示正确的http状态码和颜色
  test('发送请求成功展示正确的状态码和颜色', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '状态码测试接口' });
    // 测试200状态码 - 绿色
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.fill(`http://localhost:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(200);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    const responseSummary = contentPage.locator('.response-summary-view');
    await expect(responseSummary).toBeVisible({ timeout: 5000 });
    // 验证200状态码显示为绿色
    const status200 = responseSummary.locator('.green').filter({ hasText: '200' });
    await expect(status200).toBeVisible({ timeout: 5000 });
    // 测试404状态码 - 红色
    await urlInput.click();
    await urlInput.fill(`http://localhost:${MOCK_SERVER_PORT}/status/404`);
    await contentPage.waitForTimeout(200);
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证404状态码显示为红色
    const status404 = responseSummary.locator('.red').filter({ hasText: '404' });
    await expect(status404).toBeVisible({ timeout: 5000 });
  });
  // 测试用例3: 发送请求成功,展示正确的时长
  test('发送请求成功展示正确的响应时长', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '时长测试接口' });
    // 发送快速响应请求
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.fill(`http://localhost:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(200);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    const responseSummary = contentPage.locator('.response-summary-view');
    await expect(responseSummary).toBeVisible({ timeout: 5000 });
    // 验证时长显示(应该显示ms或s单位)
    await expect(responseSummary).toContainText(/\d+\s*(ms|s|毫秒|秒)/);
  });
  // 测试用例4: 发送请求成功,展示正确的返回大小
  test('发送请求成功展示正确的返回大小', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '大小测试接口' });
    // 发送请求
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.fill(`http://localhost:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(200);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    const responseSummary = contentPage.locator('.response-summary-view');
    await expect(responseSummary).toBeVisible({ timeout: 5000 });
    // 验证大小显示(应该显示B或KB或MB单位)
    await expect(responseSummary).toContainText(/\d+(\.\d+)?\s*(B|KB|MB|bytes|字节)/);
  });
  // 测试用例5: 发送请求成功,展示正确的返回格式
  test('发送请求成功展示正确的返回格式', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '格式测试接口' });
    // 发送请求
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.fill(`http://localhost:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(200);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    const responseSummary = contentPage.locator('.response-summary-view');
    await expect(responseSummary).toBeVisible({ timeout: 5000 });
    // 验证格式显示(应该显示application/json或类似内容类型)
    await expect(responseSummary).toContainText(/application\/json|text\/|json/);
  });
});


