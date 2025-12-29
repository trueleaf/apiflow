import { test, expect } from '../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('PathParamsValidation', () => {
  test('调用echo接口验证path参数是否正常返回', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Path参数测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL包含path参数占位符
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo/users/{userId}/posts/{postId}`);
    await contentPage.waitForTimeout(500);
    // 点击Params标签页
    const paramsTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 验证Path参数区域自动识别出两个path参数
    const pathParamsArea = contentPage.locator('.query-path-params');
    await expect(pathParamsArea).toBeVisible({ timeout: 5000 });
    // 设置userId的值为123
    const pathParamsInputs = contentPage.locator('.query-path-params .cl-params-tree').last().locator('[data-testid="params-tree-value-input"]');
    const userIdValueInput = pathParamsInputs.nth(0);
    await userIdValueInput.click();
    await contentPage.keyboard.type('123');
    await contentPage.waitForTimeout(300);
    // 设置postId的值为456
    const postIdValueInput = pathParamsInputs.nth(1);
    await postIdValueInput.click();
    await contentPage.keyboard.type('456');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    // 验证path参数被正确替换
    await expect(responseBody).toContainText('/echo/users/123/posts/456', { timeout: 10000 });
    // 验证pathParams包含正确的参数值
    await expect(responseBody).toContainText('userId', { timeout: 10000 });
    await expect(responseBody).toContainText('123', { timeout: 10000 });
    await expect(responseBody).toContainText('postId', { timeout: 10000 });
    await expect(responseBody).toContainText('456', { timeout: 10000 });
  });

  test('调用echo接口验证单个path参数是否正常返回', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('单个Path参数测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL包含单个path参数
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo/items/{id}`);
    await contentPage.waitForTimeout(500);
    // 点击Params标签页
    const paramsTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 设置id的值
    const pathParamsInputs = contentPage.locator('.query-path-params .cl-params-tree').last().locator('[data-testid="params-tree-value-input"]');
    const idValueInput = pathParamsInputs.nth(0);
    await idValueInput.click();
    await contentPage.keyboard.type('item_001');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('/echo/items/item_001', { timeout: 10000 });
    await expect(responseBody).toContainText('id', { timeout: 10000 });
    await expect(responseBody).toContainText('item_001', { timeout: 10000 });
  });

  test('调用echo接口验证中文path参数是否正常返回', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('中文Path参数测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo/{param}`);
    await contentPage.waitForTimeout(500);
    // 点击Params标签页
    const paramsTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 设置中文path参数值
    const pathParamsInputs = contentPage.locator('.query-path-params .cl-params-tree').last().locator('[data-testid="params-tree-value-input"]');
    const paramValueInput = pathParamsInputs.nth(0);
    await paramValueInput.click();
    await contentPage.keyboard.type('测试中文');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应（中文会被URL编码）
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('/echo/', { timeout: 10000 });
    // 验证路径中包含中文编码或原始中文
    await expect(responseBody).toContainText('param', { timeout: 10000 });
  });

  test('调用echo接口验证使用变量的path参数是否正常返回', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 打开变量管理页面并创建变量
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const variableOption = contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ });
    await variableOption.click();
    await contentPage.waitForTimeout(500);
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    // 创建变量 userId=user_12345
    const nameInput = variablePage.locator('.left input').first();
    await nameInput.fill('userId');
    const valueTextarea = variablePage.locator('.left textarea');
    await valueTextarea.fill('user_12345');
    const addBtn = variablePage.locator('.left .el-button--primary');
    await addBtn.click();
    await contentPage.waitForTimeout(500);
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('变量Path参数测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo/users/{id}`);
    await contentPage.waitForTimeout(500);
    // 点击Params标签页
    const paramsTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 设置path参数使用变量
    const pathParamsInputs = contentPage.locator('.query-path-params .cl-params-tree').last().locator('[data-testid="params-tree-value-input"]');
    const idValueInput = pathParamsInputs.nth(0);
    await idValueInput.click();
    await contentPage.keyboard.type('{{userId}}');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    // 验证变量被正确替换
    await expect(responseBody).toContainText('/echo/users/user_12345', { timeout: 10000 });
  });

  test('调用echo接口验证多个path参数混合URL编码是否正常返回', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('多Path参数编码测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL包含三个path参数
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo/users/{userId}/posts/{postId}/comments/{commentId}`);
    await contentPage.waitForTimeout(500);
    // 点击Params标签页
    const paramsTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 设置三个path参数的值
    const pathParamsInputs = contentPage.locator('.query-path-params .cl-params-tree').last().locator('[data-testid="params-tree-value-input"]');
    // userId
    const userIdValueInput = pathParamsInputs.nth(0);
    await userIdValueInput.click();
    await contentPage.keyboard.type('user001');
    await contentPage.waitForTimeout(200);
    // postId
    const postIdValueInput = pathParamsInputs.nth(1);
    await postIdValueInput.click();
    await contentPage.keyboard.type('post002');
    await contentPage.waitForTimeout(200);
    // commentId
    const commentIdValueInput = pathParamsInputs.nth(2);
    await commentIdValueInput.click();
    await contentPage.keyboard.type('comment003');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    // 验证所有path参数都被正确替换
    await expect(responseBody).toContainText('/echo/users/user001/posts/post002/comments/comment003', { timeout: 10000 });
    // 验证pathParams包含所有参数
    await expect(responseBody).toContainText('userId', { timeout: 10000 });
    await expect(responseBody).toContainText('user001', { timeout: 10000 });
    await expect(responseBody).toContainText('postId', { timeout: 10000 });
    await expect(responseBody).toContainText('post002', { timeout: 10000 });
    await expect(responseBody).toContainText('commentId', { timeout: 10000 });
    await expect(responseBody).toContainText('comment003', { timeout: 10000 });
  });
});
