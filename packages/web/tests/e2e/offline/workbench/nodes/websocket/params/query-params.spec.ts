import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('WebSocketQueryParams', () => {
  // Query key 输入后应自动创建下一行，便于连续录入
  test('Query 参数 key 输入后自动新增一行', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: 'Query自动新增行测试' });
    const paramsTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /^Params$/ });
    await paramsTab.click();
    const queryParamsPanel = contentPage.locator('.ws-query-params');
    await expect(queryParamsPanel).toBeVisible({ timeout: 5000 });
    const queryKeyInputs = queryParamsPanel.getByPlaceholder('输入参数名称自动换行');
    const initialCount = await queryKeyInputs.count();
    const firstInput = queryKeyInputs.first();
    await firstInput.fill('token');
    await paramsTab.click();
    await expect.poll(async () => {
      return await queryParamsPanel.getByPlaceholder('输入参数名称自动换行').count();
    }, { timeout: 5000 }).toBeGreaterThanOrEqual(initialCount + 1);
  });
  // Query 参数填写后应实时拼接到状态栏 URL
  test('Query 参数实时拼接到 URL', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: 'Query参数URL测试' });
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill('127.0.0.1:8080/ws');
    await contentPage.keyboard.press('Enter');
    const paramsTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /^Params$/ });
    await paramsTab.click();
    const queryParamsPanel = contentPage.locator('.ws-query-params');
    await expect(queryParamsPanel).toBeVisible({ timeout: 5000 });
    await queryParamsPanel.getByPlaceholder('输入参数名称自动换行').first().fill('token');
    const queryValueInput = queryParamsPanel.locator('.cl-rich-input__editor [contenteditable="true"]').first();
    await queryValueInput.click();
    await contentPage.keyboard.type('abc123');
    const statusUrl = contentPage.locator('.ws-operation .status-wrap .url');
    await expect.poll(async () => {
      return (await statusUrl.textContent()) || '';
    }, { timeout: 5000 }).toContain('token=abc123');
  });
  // 取消勾选 Query 参数后 URL 中应移除对应参数
  test('取消勾选 Query 参数后 URL 移除该参数', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: 'Query参数禁用测试' });
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await urlEditor.fill('127.0.0.1:8080/ws');
    await contentPage.keyboard.press('Enter');
    const paramsTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /^Params$/ });
    await paramsTab.click();
    const queryParamsPanel = contentPage.locator('.ws-query-params');
    await queryParamsPanel.getByPlaceholder('输入参数名称自动换行').first().fill('disabled_param');
    const queryValueInput = queryParamsPanel.locator('.cl-rich-input__editor [contenteditable="true"]').first();
    await queryValueInput.click();
    await contentPage.keyboard.type('test_value');
    const statusUrl = contentPage.locator('.ws-operation .status-wrap .url');
    await expect.poll(async () => {
      return (await statusUrl.textContent()) || '';
    }, { timeout: 5000 }).toContain('disabled_param=test_value');
    const checkbox = queryParamsPanel.locator('.el-checkbox').first();
    await checkbox.click();
    await expect.poll(async () => {
      return (await statusUrl.textContent()) || '';
    }, { timeout: 5000 }).not.toContain('disabled_param=test_value');
  });
  // 多个 Query 参数应按 URL 规则用 & 连接
  test('多个 Query 参数使用 & 正确拼接', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: 'Query多参数测试' });
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await urlEditor.fill('127.0.0.1:8080/ws');
    await contentPage.keyboard.press('Enter');
    const paramsTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /^Params$/ });
    await paramsTab.click();
    const queryParamsPanel = contentPage.locator('.ws-query-params');
    const queryKeyInputs = queryParamsPanel.getByPlaceholder('输入参数名称自动换行');
    await queryKeyInputs.first().fill('param1');
    const queryValueInputs = queryParamsPanel.locator('.cl-rich-input__editor [contenteditable="true"]');
    await queryValueInputs.first().click();
    await contentPage.keyboard.type('value1');
    await queryKeyInputs.nth(1).fill('param2');
    await queryValueInputs.nth(1).click();
    await contentPage.keyboard.type('value2');
    const statusUrl = contentPage.locator('.ws-operation .status-wrap .url');
    await expect.poll(async () => {
      return (await statusUrl.textContent()) || '';
    }, { timeout: 5000 }).toContain('param1=value1');
    await expect.poll(async () => {
      return (await statusUrl.textContent()) || '';
    }, { timeout: 5000 }).toContain('param2=value2');
    await expect.poll(async () => {
      return (await statusUrl.textContent()) || '';
    }, { timeout: 5000 }).toContain('&');
  });
});

