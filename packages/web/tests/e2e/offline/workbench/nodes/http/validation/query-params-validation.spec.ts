import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('QueryParamsValidation', () => {
  // 测试用例1: 调用echo接口验证参数为空是否正常返回/echo?id=
  test('调用echo接口验证参数为空是否正常返回', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Query空参数测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击Params标签页
    const paramsTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 添加空值参数: id=(空值)
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    await keyInputs.first().fill('id');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    // 验证请求成功且包含id参数
    await expect(responseBody).toContainText('id', { timeout: 10000 });
  });
  // 测试用例2: 调用echo接口验证常规参数是否正常返回/echo?id=1
  test('调用echo接口验证常规参数是否正常返回', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Query常规参数测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击Params标签页
    const paramsTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 添加参数: id=1
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('id');
    await valueInputs.first().click();
    await contentPage.keyboard.type('1');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    // 验证请求成功且包含id=1参数
    await expect(responseBody).toContainText('id', { timeout: 10000 });
    await expect(responseBody).toContainText('1', { timeout: 10000 });
  });
  // 测试用例3: 调用echo接口验证同名参数是否正常返回/echo?id=1&id=3
  test('调用echo接口验证同名参数是否正常返回', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Query同名参数测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击Params标签页
    const paramsTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 添加第一个参数: id=1
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('id');
    await valueInputs.first().click();
    await contentPage.keyboard.type('1');
    await contentPage.waitForTimeout(300);
    // 添加第二个同名参数: id=3
    await keyInputs.nth(1).fill('id');
    await valueInputs.nth(1).click();
    await contentPage.keyboard.type('3');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    // 验证请求成功且包含两个id参数值
    await expect(responseBody).toContainText('id', { timeout: 10000 });
    await expect(responseBody).toContainText('1', { timeout: 10000 });
    await expect(responseBody).toContainText('3', { timeout: 10000 });
  });
  // 测试用例4: 调用echo接口验证中文参数是否正常返回/echo?name=张三&tag=a+b
  test('调用echo接口验证中文参数是否正常返回', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Query中文参数测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击Params标签页
    const paramsTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 添加中文参数: name=张三
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('name');
    await valueInputs.first().click();
    await contentPage.keyboard.type('张三');
    await contentPage.waitForTimeout(300);
    // 添加包含空格的参数: tag=a b
    await keyInputs.nth(1).fill('tag');
    await valueInputs.nth(1).click();
    await contentPage.keyboard.type('a b');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    // 验证请求成功且参数值正确（Echo服务会自动解码）
    await expect(responseBody).toContainText('name', { timeout: 10000 });
    await expect(responseBody).toContainText('张三', { timeout: 10000 });
    await expect(responseBody).toContainText('tag', { timeout: 10000 });
  });
});


