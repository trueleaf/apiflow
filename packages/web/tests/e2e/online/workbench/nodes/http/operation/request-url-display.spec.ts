import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('RequestUrlDisplay', () => {
  // 测试用例1: url地址展示encode后的结果
  test('url地址展示encode后的结果', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: 'URL编码测试' });
    // 输入包含中文的URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?name=测试`);
    await contentPage.waitForTimeout(300);
    // 点击其他区域使输入框失焦
    await contentPage.locator('[data-testid="method-select"]').click();
    await contentPage.waitForTimeout(300);
    // 验证URL展示区域存在编码后的内容
    const urlDisplay = contentPage.locator('.pre-url-wrap .url');
    await expect(urlDisplay).toBeVisible({ timeout: 5000 });
    await expect(urlDisplay).toContainText('%E6%B5%8B%E8%AF%95', { timeout: 5000 });
    const urlInputValue = (await urlInput.innerText()).trim();
    expect(urlInputValue).toBe(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
  });
  // 测试用例2: 如果url地址存在异常需要提示tooltip
  test('url地址存在异常时需要提示', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: 'URL异常提示测试' });
    // 输入包含未定义变量的URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo/{{undefinedVar}}`);
    await contentPage.waitForTimeout(300);
    // 点击其他区域使输入框失焦
    await contentPage.locator('[data-testid="method-select"]').click();
    await contentPage.waitForTimeout(300);
    // 验证URL展示区域存在警告或提示
    const urlDisplay = contentPage.locator('.pre-url-wrap .url');
    await expect(urlDisplay).toBeVisible({ timeout: 5000 });
    const warningIcon = contentPage.locator('.pre-url-wrap .tip');
    await expect(warningIcon).toBeVisible({ timeout: 5000 });
    await warningIcon.hover();
    const tooltipContent = contentPage.locator('.el-popper').filter({ hasText: '{{undefinedVar}}' }).first();
    await expect(tooltipContent).toBeVisible({ timeout: 5000 });
  });
  // 测试用例3: url如果没有http://或者https://开头自动添加http://
  test('url没有协议时自动添加http前缀', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '自动添加协议测试' });
    // 输入不带协议的URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(300);
    // 点击其他区域使输入框失焦
    await contentPage.locator('[data-testid="method-select"]').click();
    await contentPage.waitForTimeout(500);
    const formattedUrl = (await urlInput.innerText()).trim();
    expect(formattedUrl).toBe(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 发送请求验证自动添加了http://
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
  });
});


