import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('RedirectConfig', () => {
  // 测试用例1: 开启自动跟随重定向时,请求自动跟随重定向并返回最终响应
  test('开启自动跟随重定向时,请求自动跟随重定向并返回最终响应', async ({ contentPage, clearCache, createProject, createNode, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '自动跟随重定向测试接口' });
    // 切换到设置标签页
    const settingsTab = contentPage.locator('[data-testid="http-params-tab-settings"]');
    await settingsTab.click();
    await contentPage.waitForTimeout(300);
    // 确保自动跟随重定向开关是开启状态
    const followRedirectSwitch = contentPage.locator('.request-settings .config-item').filter({ hasText: /自动跟随重定向|Follow Redirect/ }).locator('.el-switch');
    const isChecked = await followRedirectSwitch.locator('input').isChecked();
    if (!isChecked) {
      await followRedirectSwitch.click();
      await contentPage.waitForTimeout(300);
    }
    // 设置请求URL为重定向接口
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://localhost:${MOCK_SERVER_PORT}/redirect-302`);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证响应 - 应该是最终/echo接口的响应,而不是重定向响应
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.locator('.s-json-editor').first();
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证响应中包含echo接口返回的数据,说明已经跟随重定向到最终接口
    await expect(responseBody).toContainText('/echo', { timeout: 10000 });
    await expect(responseBody).toContainText('method', { timeout: 10000 });
  });
  // 测试用例2: 关闭自动跟随重定向时,请求返回重定向响应不继续跟随
  test('关闭自动跟随重定向时,请求返回重定向响应不继续跟随', async ({ contentPage, clearCache, createProject, createNode, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '禁用重定向测试接口' });
    // 切换到设置标签页
    const settingsTab = contentPage.locator('[data-testid="http-params-tab-settings"]');
    await settingsTab.click();
    await contentPage.waitForTimeout(300);
    // 关闭自动跟随重定向开关
    const followRedirectSwitch = contentPage.locator('.request-settings .config-item').filter({ hasText: /自动跟随重定向|Follow Redirect/ }).locator('.el-switch');
    const isChecked = await followRedirectSwitch.locator('input').isChecked();
    if (isChecked) {
      await followRedirectSwitch.click();
      await contentPage.waitForTimeout(300);
    }
    // 设置请求URL为重定向接口
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://localhost:${MOCK_SERVER_PORT}/redirect-302`);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证响应区域显示重定向信息
    const responseArea = contentPage.locator('[data-testid="response-area"]');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    // 应该看到重定向标识或302状态码
    const statusCodeArea = responseArea.locator('[data-testid="status-code"]').first();
    await expect(statusCodeArea).toContainText('302', { timeout: 10000 });
  });
  // 测试用例3: 修改最大重定向次数配置,超过次数后停止重定向并提示
  test('修改最大重定向次数配置,超过次数后停止重定向并提示', async ({ contentPage, clearCache, createProject, createNode, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '最大重定向次数测试接口' });
    // 切换到设置标签页
    const settingsTab = contentPage.locator('[data-testid="http-params-tab-settings"]');
    await settingsTab.click();
    await contentPage.waitForTimeout(300);
    // 确保自动跟随重定向开关是开启状态
    const followRedirectSwitch = contentPage.locator('.request-settings .config-item').filter({ hasText: /自动跟随重定向|Follow Redirect/ }).locator('.el-switch');
    const isRedirectChecked = await followRedirectSwitch.locator('input').isChecked();
    if (!isRedirectChecked) {
      await followRedirectSwitch.click();
      await contentPage.waitForTimeout(300);
    }
    // 修改最大重定向次数为2
    const maxRedirectsInput = contentPage.locator('.request-settings .config-item').filter({ hasText: /最大重定向次数|Max Redirects/ }).locator('input');
    await maxRedirectsInput.fill('2');
    await contentPage.waitForTimeout(300);
    // 设置请求URL为链式重定向接口(需要重定向5次)
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://localhost:${MOCK_SERVER_PORT}/redirect-chain/5`);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证响应区域显示错误信息(超过最大重定向次数)
    const responseArea = contentPage.locator('[data-testid="response-area"]');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    // 应该显示错误信息,表示重定向次数超过限制
    const errorText = responseArea.locator('.s-json-editor').first().or(responseArea.getByTestId('response-error').first());
    await expect(errorText).toContainText(/redirect|重定向|error|错误/i, { timeout: 10000 });
  });
});

