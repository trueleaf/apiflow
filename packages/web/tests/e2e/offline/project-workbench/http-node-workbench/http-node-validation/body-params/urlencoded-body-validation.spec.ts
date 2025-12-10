import { test, expect } from '../../../../../../fixtures/electron.fixture';

const ECHO_URL = 'http://localhost:3456/echo';

test.describe('UrlencodedBodyValidation', () => {
  test.beforeEach(async ({ createProject, contentPage }) => {
    await createProject();
    await contentPage.waitForTimeout(500);
  });

  test('调用echo接口验证urlencoded参数是否正常返回,content-type是否设置正确', async ({ contentPage }) => {
    // 1. 选择POST方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await expect(methodSelect).toBeVisible({ timeout: 5000 });
    await methodSelect.click();
    await contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' }).click();

    // 2. 输入echo接口URL
    const urlInput = contentPage.locator('[data-testid="url-input"]');
    await urlInput.fill(ECHO_URL);

    // 3. 在Body区域选择x-www-form-urlencoded类型
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    const urlencodedRadio = contentPage.locator('.body-mode-item').filter({ hasText: 'x-www-form-urlencoded' }).locator('.el-radio');
    await urlencodedRadio.click();
    await contentPage.waitForTimeout(300);

    // 4. 添加参数字段: username=test
    const paramsTree = contentPage.locator('.cl-params-tree').first();
    const firstKeyInput = paramsTree.locator('[data-testid="params-tree-key-input"]').first();
    await firstKeyInput.fill('username');
    await contentPage.waitForTimeout(200);
    const firstValueInput = paramsTree.locator('.el-input').nth(1).locator('input');
    await firstValueInput.fill('test');
    await contentPage.waitForTimeout(200);

    // 添加参数字段: password=123456 (新行自动生成)
    const secondKeyInput = paramsTree.locator('[data-testid="params-tree-key-input"]').nth(1);
    await secondKeyInput.fill('password');
    await contentPage.waitForTimeout(200);
    const secondValueInput = paramsTree.locator('.el-input').nth(4).locator('input');
    await secondValueInput.fill('123456');
    await contentPage.waitForTimeout(200);

    // 添加参数字段: remember=true (新行自动生成)
    const thirdKeyInput = paramsTree.locator('[data-testid="params-tree-key-input"]').nth(2);
    await thirdKeyInput.fill('remember');
    await contentPage.waitForTimeout(200);
    const thirdValueInput = paramsTree.locator('.el-input').nth(7).locator('input');
    await thirdValueInput.fill('true');
    await contentPage.waitForTimeout(200);

    // 5. 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);

    // 6. 检查响应结果
    const responseTabBody = contentPage.locator('[data-testid="response-tab-body"]');
    await expect(responseTabBody).toBeVisible({ timeout: 10000 });
    await responseTabBody.click();
    await contentPage.waitForTimeout(500);

    // 获取响应内容验证
    const responseContent = await contentPage.locator('.response-view').textContent();
    expect(responseContent).toContain('method');
    expect(responseContent).toContain('POST');
    expect(responseContent).toContain('username');
    expect(responseContent).toContain('test');
    expect(responseContent).toContain('password');
    expect(responseContent).toContain('123456');
    expect(responseContent).toContain('remember');
    expect(responseContent).toContain('true');

    // 验证Content-Type为application/x-www-form-urlencoded
    expect(responseContent).toContain('application/x-www-form-urlencoded');

    // 验证响应状态码为200
    const statusCode = contentPage.locator('.status-code');
    await expect(statusCode).toContainText('200');
  });

  test('PUT方法配合URLEncoded请求体验证', async ({ contentPage }) => {
    // 1. 选择PUT方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await expect(methodSelect).toBeVisible({ timeout: 5000 });
    await methodSelect.click();
    await contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'PUT' }).click();

    // 2. 输入echo接口URL
    const urlInput = contentPage.locator('[data-testid="url-input"]');
    await urlInput.fill(ECHO_URL);

    // 3. 在Body区域选择x-www-form-urlencoded类型
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    const urlencodedRadio = contentPage.locator('.body-mode-item').filter({ hasText: 'x-www-form-urlencoded' }).locator('.el-radio');
    await urlencodedRadio.click();
    await contentPage.waitForTimeout(300);

    // 4. 添加参数字段: id=1
    const paramsTree = contentPage.locator('.cl-params-tree').first();
    const firstKeyInput = paramsTree.locator('[data-testid="params-tree-key-input"]').first();
    await firstKeyInput.fill('id');
    await contentPage.waitForTimeout(200);
    const firstValueInput = paramsTree.locator('.el-input').nth(1).locator('input');
    await firstValueInput.fill('1');
    await contentPage.waitForTimeout(200);

    // 添加参数字段: name=updated
    const secondKeyInput = paramsTree.locator('[data-testid="params-tree-key-input"]').nth(1);
    await secondKeyInput.fill('name');
    await contentPage.waitForTimeout(200);
    const secondValueInput = paramsTree.locator('.el-input').nth(4).locator('input');
    await secondValueInput.fill('updated');
    await contentPage.waitForTimeout(200);

    // 5. 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);

    // 6. 检查响应结果
    const responseTabBody = contentPage.locator('[data-testid="response-tab-body"]');
    await expect(responseTabBody).toBeVisible({ timeout: 10000 });
    await responseTabBody.click();
    await contentPage.waitForTimeout(500);

    // 获取响应内容验证
    const responseContent = await contentPage.locator('.response-view').textContent();
    expect(responseContent).toContain('method');
    expect(responseContent).toContain('PUT');
    expect(responseContent).toContain('id');
    expect(responseContent).toContain('1');
    expect(responseContent).toContain('name');
    expect(responseContent).toContain('updated');

    // 验证Content-Type为application/x-www-form-urlencoded
    expect(responseContent).toContain('application/x-www-form-urlencoded');

    // 验证响应状态码为200
    const statusCode = contentPage.locator('.status-code');
    await expect(statusCode).toContainText('200');
  });
});
