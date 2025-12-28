import { test, expect } from '../../../../../../fixtures/electron.fixture';
import path from 'path';
import fs from 'fs';

const MOCK_SERVER_PORT = 3456;

test.describe('BinaryParams', () => {
  // 变量模式,若没有输入有效变量,发送返回值中正确提示发送被终止
  test('变量模式下无效变量发送被阻止', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/workbench.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('Binary变量模式无效变量测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置POST方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    await contentPage.waitForTimeout(200);
    await contentPage.getByRole('option', { name: 'POST' }).click();
    await contentPage.waitForTimeout(300);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(300);
    // 切换到Body标签
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择binary类型
    const binaryRadio = contentPage.locator('.body-params .el-radio', { hasText: /binary/i });
    await binaryRadio.click();
    await contentPage.waitForTimeout(300);
    // 选择变量模式
    const binaryWrap = contentPage.locator('.binary-wrap');
    const varModeRadio = binaryWrap.locator('.el-radio', { hasText: /变量模式/ });
    await varModeRadio.click();
    await contentPage.waitForTimeout(300);
    // 输入无效变量
    const varInput = contentPage.locator('.var-mode .el-input input');
    await varInput.fill('{{invalidVariable}}');
    await contentPage.waitForTimeout(300);
    // 点击发送按钮
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    // 验证显示错误提示
    const errorMessage = responseArea.getByTestId('response-error');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });
  // 变量模式,输入有效变量,请求头自动添加contentType并正确发送
  test('变量模式下有效变量正确发送', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/workbench.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 创建测试文件
    const testFilePath = path.join(process.cwd(), 'temp', 'test-binary.txt');
    const testDir = path.dirname(testFilePath);
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    fs.writeFileSync(testFilePath, 'test binary content');
    // 创建HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('Binary变量模式有效变量测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 打开变量管理页签并创建变量
    const variableBtn = contentPage.locator('[data-testid="http-params-variable-btn"]').first();
    await variableBtn.click();
    await contentPage.waitForTimeout(300);
    const variableTab = contentPage.locator('[data-testid="project-nav-tab-variable"]');
    await expect(variableTab).toHaveClass(/active/, { timeout: 5000 });
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const addPanel = variablePage.locator('.left');
    const nameFormItem = addPanel.locator('.el-form-item').filter({ hasText: /变量名称|Variable Name|Name/ });
    await nameFormItem.locator('input').first().fill('binaryFilePath');
    const valueFormItem = addPanel.locator('.el-form-item').filter({ hasText: /变量值|Value/ });
    await valueFormItem.locator('textarea').first().fill(testFilePath);
    const confirmAddBtn2 = addPanel.locator('.el-button--primary').filter({ hasText: /确认添加|Add|Confirm/ }).first();
    await confirmAddBtn2.click();
    await contentPage.waitForTimeout(500);
    await expect(variablePage.locator('.right')).toContainText('binaryFilePath', { timeout: 5000 });
    // 切回HTTP节点页签
    const httpTab = contentPage.locator('.nav .item').filter({ hasText: 'Binary变量模式有效变量测试' }).first();
    await httpTab.click();
    await contentPage.waitForTimeout(300);
    // 设置POST方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    await contentPage.waitForTimeout(200);
    await contentPage.getByRole('option', { name: 'POST' }).click();
    await contentPage.waitForTimeout(300);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(300);
    // 切换到Body标签
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择binary类型
    const binaryRadio = contentPage.locator('.body-params .el-radio', { hasText: /binary/i });
    await binaryRadio.click();
    await contentPage.waitForTimeout(300);
    // 选择变量模式
    const binaryWrap = contentPage.locator('.binary-wrap');
    const varModeRadio = binaryWrap.locator('.el-radio', { hasText: /变量模式/ });
    await varModeRadio.click();
    await contentPage.waitForTimeout(300);
    // 输入有效变量
    const varInput = contentPage.locator('.var-mode .el-input input');
    await varInput.fill('{{binaryFilePath}}');
    await contentPage.waitForTimeout(300);
    // 点击发送按钮
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.locator('.s-json-editor').first();
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 清理测试文件
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });
  // 文件模式,未选择文件,发送返回值中正确提示发送被终止
  test('文件模式下未选择文件发送被阻止', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/workbench.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('Binary文件模式未选择文件测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置POST方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    await contentPage.waitForTimeout(200);
    await contentPage.getByRole('option', { name: 'POST' }).click();
    await contentPage.waitForTimeout(300);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(300);
    // 切换到Body标签
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择binary类型
    const binaryRadio = contentPage.locator('.body-params .el-radio', { hasText: /binary/i });
    await binaryRadio.click();
    await contentPage.waitForTimeout(300);
    // 选择文件模式
    const binaryWrap = contentPage.locator('.binary-wrap');
    const fileModeRadio = binaryWrap.locator('.el-radio', { hasText: /文件模式/ });
    await fileModeRadio.click();
    await contentPage.waitForTimeout(300);
    // 不选择任何文件，直接发送
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    // 验证显示错误提示
    const errorMessage = responseArea.getByTestId('response-error');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });
  // 文件模式,选择正确的文件,请求头自动添加contentType并正确发送
  test('文件模式下选择文件正确发送', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/workbench.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 创建测试文件
    const testFilePath = path.join(process.cwd(), 'temp', 'test-image.png');
    const testDir = path.dirname(testFilePath);
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    // 创建一个简单的PNG文件头
    const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    fs.writeFileSync(testFilePath, pngHeader);
    // 创建HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('Binary文件模式选择文件测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置POST方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    await contentPage.waitForTimeout(200);
    await contentPage.getByRole('option', { name: 'POST' }).click();
    await contentPage.waitForTimeout(300);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(300);
    // 切换到Body标签
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择binary类型
    const binaryRadio = contentPage.locator('.body-params .el-radio', { hasText: /binary/i });
    await binaryRadio.click();
    await contentPage.waitForTimeout(300);
    // 选择文件模式
    const binaryWrap = contentPage.locator('.binary-wrap');
    const fileModeRadio = binaryWrap.locator('.el-radio', { hasText: /文件模式/ });
    await fileModeRadio.click();
    await contentPage.waitForTimeout(300);
    // 使用文件输入选择文件
    const fileInput = contentPage.locator('.file-mode input[type="file"]');
    await fileInput.setInputFiles(testFilePath);
    await contentPage.waitForTimeout(500);
    // 点击发送按钮
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.locator('.s-json-editor').first();
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 清理测试文件
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });
});
