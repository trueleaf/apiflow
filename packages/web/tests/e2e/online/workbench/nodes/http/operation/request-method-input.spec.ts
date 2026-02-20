import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('RequestMethodInput', () => {
  // 测试用例1: 正确展示GET, POST, PUT, DEL, PATCH, HEAD, OPTIONS,选择或者点击空白区域下拉菜单消失
  test('正确展示GET,POST,PUT,DEL,PATCH,HEAD,OPTIONS,选择或点击空白区域下拉菜单消失', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '请求方法下拉测试' });
    // 点击请求方法下拉框
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    await contentPage.waitForTimeout(300);
    // 验证下拉选项包含所有请求方法
    const dropdown = contentPage.locator('.el-select-dropdown:visible').last();
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    await expect(dropdown.getByRole('option', { name: /^GET$/ })).toBeVisible({ timeout: 5000 });
    await expect(dropdown.getByRole('option', { name: /^POST$/ })).toBeVisible({ timeout: 5000 });
    await expect(dropdown.getByRole('option', { name: /^PUT$/ })).toBeVisible({ timeout: 5000 });
    await expect(dropdown.getByRole('option', { name: /^DEL$/ })).toBeVisible({ timeout: 5000 });
    await expect(dropdown.getByRole('option', { name: /^PATCH$/ })).toBeVisible({ timeout: 5000 });
    await expect(dropdown.getByRole('option', { name: /^HEAD$/ })).toBeVisible({ timeout: 5000 });
    await expect(dropdown.getByRole('option', { name: /^OPTIONS$/ })).toBeVisible({ timeout: 5000 });
    // 选择POST方法
    const postOption = dropdown.getByRole('option', { name: /^POST$/ });
    await postOption.click();
    await contentPage.waitForTimeout(300);
    // 验证下拉菜单关闭,显示选中值
    await expect(methodSelect).toContainText('POST', { timeout: 5000 });
    const unsavedDot = contentPage.locator('.nav .item.active [data-testid="project-nav-tab-unsaved"]');
    await expect(unsavedDot).toBeVisible({ timeout: 5000 });
    // 再次点击下拉框
    await methodSelect.click();
    await contentPage.waitForTimeout(300);
    // 点击空白区域,下拉菜单消失
    const urlInput = contentPage.locator('[data-testid="url-input"]');
    await urlInput.click();
    await contentPage.waitForTimeout(300);
    // 验证下拉菜单已关闭
    const visibleDropdown = contentPage.locator('.el-select-dropdown:visible');
    await expect(visibleDropdown).toHaveCount(0, { timeout: 5000 });
  });
  // 测试用例2: 切换请求方法不会改变banner节点中的请求方法,只有保存后才会生效
  test('切换请求方法不会改变banner节点中的请求方法,只有保存后才会生效', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点并保存
    await createNode(contentPage, { nodeType: 'http', name: '方法保存测试' });
    // 保存节点
    const saveBtn = contentPage.locator('[data-testid="operation-save-btn"]');
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    // 切换请求方法为POST
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
    await postOption.click();
    await contentPage.waitForTimeout(300);
    // 验证编辑区域显示POST
    await expect(methodSelect).toContainText('POST', { timeout: 5000 });
    // 验证banner节点图标仍为GET(未保存)
    const bannerNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '方法保存测试' });
    await expect(bannerNode).toContainText('GET', { timeout: 5000 });
    // 点击保存按钮
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证保存后banner节点图标变为POST
    await expect(bannerNode).toContainText('POST', { timeout: 5000 });
  });
  // 测试用例3: 切换请求方法并发送请求,响应method与选中方法一致
  test('切换请求方法后发送请求,响应中method字段与选中的方法一致', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '请求方法验证测试' });
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 测试GET方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    const responseCode = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseCode).toBeVisible({ timeout: 10000 });
    await expect(responseCode).toContainText('"method": "GET"', { timeout: 10000 });
    // 测试POST方法
    await methodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^POST$/ });
    await expect(postOption).toBeVisible({ timeout: 5000 });
    await postOption.click();
    await contentPage.waitForTimeout(300);
    await expect(methodSelect).toContainText('POST', { timeout: 5000 });
    await sendBtn.click();
    await expect(responseCode).toContainText('"method": "POST"', { timeout: 10000 });
    // 测试PUT方法
    await methodSelect.click();
    const putOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^PUT$/ });
    await expect(putOption).toBeVisible({ timeout: 5000 });
    await putOption.click();
    await contentPage.waitForTimeout(300);
    await expect(methodSelect).toContainText('PUT', { timeout: 5000 });
    await sendBtn.click();
    await expect(responseCode).toContainText('"method": "PUT"', { timeout: 10000 });
    // 测试DELETE方法
    await methodSelect.click();
    const delOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^DEL$/ });
    await expect(delOption).toBeVisible({ timeout: 5000 });
    await delOption.click();
    await contentPage.waitForTimeout(300);
    await expect(methodSelect).toContainText(/DEL/, { timeout: 5000 });
    await sendBtn.click();
    await expect(responseCode).toContainText('"method": "DELETE"', { timeout: 10000 });
    // 测试PATCH方法
    await methodSelect.click();
    const patchOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^PATCH$/ });
    await expect(patchOption).toBeVisible({ timeout: 5000 });
    await patchOption.click();
    await contentPage.waitForTimeout(300);
    await expect(methodSelect).toContainText('PATCH', { timeout: 5000 });
    await sendBtn.click();
    await expect(responseCode).toContainText('"method": "PATCH"', { timeout: 10000 });
    // 测试OPTIONS方法
    await methodSelect.click();
    const optionsOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^OPTIONS$/ });
    await expect(optionsOption).toBeVisible({ timeout: 5000 });
    await optionsOption.click();
    await contentPage.waitForTimeout(300);
    await expect(methodSelect).toContainText('OPTIONS', { timeout: 5000 });
    await sendBtn.click();
    await expect(responseCode).toContainText('"method": "OPTIONS"', { timeout: 10000 });
  });
  // 测试用例4: 发送请求后出现取消请求按钮,点击后恢复发送按钮
  test('发送请求后出现取消请求按钮点击后恢复发送按钮', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await createNode(contentPage, { nodeType: 'http', name: '方法取消按钮测试' });
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const getOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^GET$/ }).first();
    await getOption.click();
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/delay/10000`);
    await contentPage.waitForTimeout(200);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    const cancelBtn = contentPage.locator('[data-testid="operation-cancel-btn"]');
    await expect(cancelBtn).toBeVisible({ timeout: 5000 });
    await cancelBtn.click();
    await contentPage.waitForTimeout(500);
    await expect(contentPage.locator('[data-testid="operation-send-btn"]')).toBeVisible({ timeout: 5000 });
  });
});


