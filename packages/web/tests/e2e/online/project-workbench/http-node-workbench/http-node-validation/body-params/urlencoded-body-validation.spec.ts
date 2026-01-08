import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('UrlencodedBodyValidation', () => {
  test('调用echo接口验证urlencoded参数是否正常返回,content-type是否设置正确', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('URLEncoded测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 选择POST方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
    await postOption.click();

    // 点击Body标签页
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择x-www-form-urlencoded类型
    const urlencodedRadio = contentPage.locator('.body-mode-item').filter({ hasText: 'x-www-form-urlencoded' }).locator('.el-radio');
    await urlencodedRadio.click();
    await contentPage.waitForTimeout(300);
    // 添加参数字段: username=test
    const paramsTree = contentPage.locator('.cl-params-tree').first();
    const firstKeyInput = paramsTree.locator('[data-testid="params-tree-key-input"]').first();
    await firstKeyInput.fill('username');
    await contentPage.waitForTimeout(200);
    const firstValueInput = paramsTree.locator('[data-testid="params-tree-value-input"]').nth(0).locator('[contenteditable="true"]');
    await firstValueInput.click();
    await contentPage.keyboard.type('test');
    await contentPage.waitForTimeout(200);
    // 添加参数字段: password=123456
    const secondKeyInput = paramsTree.locator('[data-testid="params-tree-key-input"]').nth(1);
    await secondKeyInput.fill('password');
    await contentPage.waitForTimeout(200);
    const secondValueInput = paramsTree.locator('[data-testid="params-tree-value-input"]').nth(1).locator('[contenteditable="true"]');
    await secondValueInput.click();
    await contentPage.keyboard.type('123456');
    await contentPage.waitForTimeout(200);
    // 添加参数字段: remember=true
    const thirdKeyInput = paramsTree.locator('[data-testid="params-tree-key-input"]').nth(2);
    await thirdKeyInput.fill('remember');
    await contentPage.waitForTimeout(200);
    const thirdValueInput = paramsTree.locator('[data-testid="params-tree-value-input"]').nth(2).locator('[contenteditable="true"]');
    await thirdValueInput.click();
    await contentPage.keyboard.type('true');
    await contentPage.waitForTimeout(200);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    await expect(responseBody).toContainText('method', { timeout: 10000 });
    await expect(responseBody).toContainText('POST', { timeout: 10000 });
    await expect(responseBody).toContainText('username', { timeout: 10000 });
    await expect(responseBody).toContainText('test', { timeout: 10000 });
    await expect(responseBody).toContainText('password', { timeout: 10000 });
    await expect(responseBody).toContainText('123456', { timeout: 10000 });
    await expect(responseBody).toContainText('remember', { timeout: 10000 });
    await expect(responseBody).toContainText('true', { timeout: 10000 });
    await expect(responseBody).toContainText('application/x-www-form-urlencoded', { timeout: 10000 });

    // 验证响应状态码为200
    const statusCode = contentPage.locator('[data-testid="status-code"]').first();
    await expect(statusCode).toBeVisible({ timeout: 10000 });
    await expect(statusCode).toContainText('200');
  });

  test('PUT方法配合URLEncoded请求体验证', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('URLEncoded PUT测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 选择PUT方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const putOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'PUT' });
    await putOption.click();
    // 点击Body标签页
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择x-www-form-urlencoded类型
    const urlencodedRadio = contentPage.locator('.body-mode-item').filter({ hasText: 'x-www-form-urlencoded' }).locator('.el-radio');
    await urlencodedRadio.click();
    await contentPage.waitForTimeout(300);
    // 添加参数字段: id=1
    const paramsTree = contentPage.locator('.cl-params-tree').first();
    const firstKeyInput = paramsTree.locator('[data-testid="params-tree-key-input"]').first();
    await firstKeyInput.fill('id');
    await contentPage.waitForTimeout(200);
    const firstValueInput = paramsTree.locator('[data-testid="params-tree-value-input"]').nth(0).locator('[contenteditable="true"]');
    await firstValueInput.click();
    await contentPage.keyboard.type('1');
    await contentPage.waitForTimeout(200);
    // 添加参数字段: name=updated
    const secondKeyInput = paramsTree.locator('[data-testid="params-tree-key-input"]').nth(1);
    await secondKeyInput.fill('name');
    await contentPage.waitForTimeout(200);
    const secondValueInput = paramsTree.locator('[data-testid="params-tree-value-input"]').nth(1).locator('[contenteditable="true"]');
    await secondValueInput.click();
    await contentPage.keyboard.type('updated');
    await contentPage.waitForTimeout(200);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    await expect(responseBody).toContainText('method', { timeout: 10000 });
    await expect(responseBody).toContainText('PUT', { timeout: 10000 });
    await expect(responseBody).toContainText('id', { timeout: 10000 });
    await expect(responseBody).toContainText('1', { timeout: 10000 });
    await expect(responseBody).toContainText('name', { timeout: 10000 });
    await expect(responseBody).toContainText('updated', { timeout: 10000 });
    await expect(responseBody).toContainText('application/x-www-form-urlencoded', { timeout: 10000 });

    // 验证响应状态码为200
    const statusCode = contentPage.locator('[data-testid="status-code"]').first();
    await expect(statusCode).toBeVisible({ timeout: 10000 });
    await expect(statusCode).toContainText('200');
  });
});

