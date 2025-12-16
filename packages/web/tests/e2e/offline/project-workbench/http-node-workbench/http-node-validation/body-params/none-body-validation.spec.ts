import { test, expect } from '../../../../../../fixtures/electron.fixture';

const ECHO_URL = 'http://localhost:3456/echo';

test.describe('NoneBodyValidation', () => {
  test.beforeEach(async ({ createProject, contentPage }) => {
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill(`NoneBody测试-${Date.now()}`);
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
  });

  test('调用echo接口验证body为none请求是否正常返回,content-type是否正确', async ({ contentPage }) => {
    // 1. 选择GET方法（默认就是GET）
    const methodSelect = contentPage.locator('[data-testid="method-select"]').first();
    await expect(methodSelect).toBeVisible({ timeout: 5000 });
    await methodSelect.click();
    const methodDropdown = contentPage.locator('.el-select-dropdown:visible');
    await methodDropdown.locator('.el-select-dropdown__item', { hasText: /^GET$/ }).first().click();

    // 2. 输入echo接口URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.fill(ECHO_URL);

    // 3. 在Body区域选择None类型(不发送body)
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    const noneRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^none$/i }).locator('.el-radio');
    await noneRadio.click();

    // 4. 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);

    // 5. 检查响应结果
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    await expect(responseBody).toContainText('method', { timeout: 10000 });
    await expect(responseBody).toContainText('GET', { timeout: 10000 });

    // 验证响应状态码为200
    const statusCode = contentPage.locator('.status-code');
    await expect(statusCode).toContainText('200');

    // 验证请求不包含body (通过查看请求信息tab)
    const requestTab = contentPage.locator('[data-testid="response-tab-request"]');
    await requestTab.click();
    await contentPage.waitForTimeout(300);
  });

  test('DELETE方法配合None请求体验证', async ({ contentPage }) => {
    // 1. 选择DELETE方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]').first();
    await expect(methodSelect).toBeVisible({ timeout: 5000 });
    await methodSelect.click();
    const methodDropdown = contentPage.locator('.el-select-dropdown:visible');
    await methodDropdown.locator('.el-select-dropdown__item', { hasText: /^(DEL|DELETE)$/ }).first().click();

    // 2. 输入echo接口URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.fill(ECHO_URL);

    // 3. 在Body区域选择None类型
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    const noneRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^none$/i }).locator('.el-radio');
    await noneRadio.click();

    // 4. 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);

    // 5. 检查响应结果
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    await expect(responseBody).toContainText('method', { timeout: 10000 });
    await expect(responseBody).toContainText(/DEL|DELETE/, { timeout: 10000 });

    // 验证响应状态码为200
    const statusCode = contentPage.locator('.status-code');
    await expect(statusCode).toContainText('200');
  });
});
