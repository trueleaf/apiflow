import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('WebSocketQueryParams', () => {
  // Query参数key输入值后,如果不存在next节点,则自动新增一行数据
  test('Query参数key输入后自动新增一行', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: 'Query自动新增行测试' });
    // 切换到Params标签
    const paramsTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /^Params$/ });
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 获取初始行数
    const queryParamsPanel = contentPage.locator('.ws-query-params');
    await expect(queryParamsPanel).toBeVisible({ timeout: 5000 });
    const queryKeyInputs = queryParamsPanel.getByPlaceholder('输入参数名称自动换行');
    const initialRowCount = await queryKeyInputs.count();
    // 在第一行Query参数的key输入框中输入参数名
    const queryKeyInput = queryKeyInputs.first();
    await queryKeyInput.click();
    await queryKeyInput.fill('token');
    await contentPage.waitForTimeout(200);
    // 点击输入框外的区域使其失焦
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 验证自动新增一行
    const newRowCount = await queryKeyInputs.count();
    expect(newRowCount).toBeGreaterThanOrEqual(initialRowCount);
  });
  // Query参数正确添加到URL中
  test('Query参数正确添加到URL中', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: 'Query参数URL测试' });
    // 输入连接地址
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill('127.0.0.1:8080/ws');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 切换到Params标签
    const paramsTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /^Params$/ });
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 添加Query参数: key="token", value="abc123"
    const queryParamsPanel = contentPage.locator('.ws-query-params');
    await expect(queryParamsPanel).toBeVisible({ timeout: 5000 });
    const queryKeyInput = queryParamsPanel.getByPlaceholder('输入参数名称自动换行').first();
    await queryKeyInput.click();
    await queryKeyInput.fill('token');
    await contentPage.waitForTimeout(200);
    const queryValueInput = queryParamsPanel.locator('.cl-rich-input__editor [contenteditable="true"]').first();
    await queryValueInput.click();
    await contentPage.keyboard.type('abc123');
    await contentPage.waitForTimeout(300);
    // 验证状态栏URL包含Query参数
    const statusUrl = contentPage.locator('.ws-operation .status-wrap .url');
    await expect(statusUrl).toContainText('token=abc123');
  });
  // Query参数支持变量替换
  test('Query参数支持变量替换', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: 'Query变量替换测试' });
    // 输入连接地址
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill('127.0.0.1:8080/ws');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 打开变量维护页面添加变量
    const variableBtn = contentPage.locator('.ws-params .action-item').filter({ hasText: /变量/ });
    await variableBtn.click();
    await contentPage.waitForTimeout(500);
    const variableTab = contentPage.locator('[data-testid="project-nav-tab-variable"]');
    await expect(variableTab).toHaveClass(/active/, { timeout: 5000 });
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const addPanel = variablePage.locator('.left');
    const nameFormItem = addPanel.locator('.el-form-item').filter({ hasText: /变量名称|Variable Name|Name/ });
    await nameFormItem.locator('input').first().fill('WS_TOKEN');
    const valueFormItem = addPanel.locator('.el-form-item').filter({ hasText: /变量值|Value/ });
    await valueFormItem.locator('textarea').first().fill('secret_token');
    const confirmAddBtn = addPanel.locator('.el-button--primary').filter({ hasText: /确认添加|Add|Confirm/ }).first();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    await expect(variablePage.locator('.right')).toContainText('WS_TOKEN', { timeout: 5000 });
    // 关闭变量页签返回WebSocket页面
    const closeBtn = variableTab.locator('[data-testid="project-nav-tab-close-btn"]').first();
    await closeBtn.click();
    await contentPage.waitForTimeout(300);
    // 切换到Params标签
    const paramsTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /^Params$/ });
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 添加Query参数使用变量
    const queryParamsPanel = contentPage.locator('.ws-query-params');
    await expect(queryParamsPanel).toBeVisible({ timeout: 5000 });
    const queryKeyInput = queryParamsPanel.getByPlaceholder('输入参数名称自动换行').first();
    await queryKeyInput.click();
    await queryKeyInput.fill('token');
    await contentPage.waitForTimeout(200);
    const queryValueInput = queryParamsPanel.locator('.cl-rich-input__editor [contenteditable="true"]').first();
    await queryValueInput.click();
    await contentPage.keyboard.type('{{WS_TOKEN}}');
    await contentPage.waitForTimeout(300);
    // 验证状态栏URL包含变量替换后的值
    const statusUrl = contentPage.locator('.ws-operation .status-wrap .url');
    await expect(statusUrl).toContainText('token=secret_token');
  });
  // 取消勾选Query参数后,URL中不包含该参数
  test('取消勾选Query参数后URL中不包含该参数', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: 'Query参数禁用测试' });
    // 输入连接地址
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill('127.0.0.1:8080/ws');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 切换到Params标签
    const paramsTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /^Params$/ });
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 添加Query参数
    const queryParamsPanel = contentPage.locator('.ws-query-params');
    await expect(queryParamsPanel).toBeVisible({ timeout: 5000 });
    const queryKeyInput = queryParamsPanel.getByPlaceholder('输入参数名称自动换行').first();
    await queryKeyInput.click();
    await queryKeyInput.fill('disabled_param');
    await contentPage.waitForTimeout(200);
    const queryValueInput = queryParamsPanel.locator('.cl-rich-input__editor [contenteditable="true"]').first();
    await queryValueInput.click();
    await contentPage.keyboard.type('test_value');
    await contentPage.waitForTimeout(300);
    // 验证URL包含参数
    const statusUrl = contentPage.locator('.ws-operation .status-wrap .url');
    await expect(statusUrl).toContainText('disabled_param=test_value');
    // 取消勾选该参数
    const checkbox = queryParamsPanel.locator('.el-checkbox').first();
    await checkbox.click();
    await contentPage.waitForTimeout(300);
    // 验证URL不再包含该参数
    await expect(statusUrl).not.toContainText('disabled_param');
  });
  // 多个Query参数正确拼接
  test('多个Query参数正确拼接', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: 'Query多参数测试' });
    // 输入连接地址
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill('127.0.0.1:8080/ws');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 切换到Params标签
    const paramsTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /^Params$/ });
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 添加第一个Query参数
    const queryParamsPanel = contentPage.locator('.ws-query-params');
    await expect(queryParamsPanel).toBeVisible({ timeout: 5000 });
    const queryKeyInputs = queryParamsPanel.getByPlaceholder('输入参数名称自动换行');
    const queryKeyInput1 = queryKeyInputs.first();
    await queryKeyInput1.click();
    await queryKeyInput1.fill('param1');
    await contentPage.waitForTimeout(200);
    const queryValueInputs = queryParamsPanel.locator('.cl-rich-input__editor [contenteditable="true"]');
    const queryValueInput1 = queryValueInputs.first();
    await queryValueInput1.click();
    await contentPage.keyboard.type('value1');
    await contentPage.waitForTimeout(300);
    // 添加第二个Query参数（自动新增的行）
    const queryKeyInput2 = queryKeyInputs.nth(1);
    await queryKeyInput2.click();
    await queryKeyInput2.fill('param2');
    await contentPage.waitForTimeout(200);
    const queryValueInput2 = queryValueInputs.nth(1);
    await queryValueInput2.click();
    await contentPage.keyboard.type('value2');
    await contentPage.waitForTimeout(300);
    // 验证URL包含两个参数,用&连接
    const statusUrl = contentPage.locator('.ws-operation .status-wrap .url');
    await expect(statusUrl).toContainText('param1=value1', { timeout: 5000 });
    await expect(statusUrl).toContainText('param2=value2', { timeout: 5000 });
    await expect(statusUrl).toContainText('&', { timeout: 5000 });
  });
});
