import { test, expect } from '../../../../../../fixtures/electron.fixture';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MOCK_SERVER_PORT = 3456;

test.describe('FormdataFileUploadValidation', () => {
  // 测试用例1: 调用echo接口验证包含字符串和file类型的formData是否正常返回,content-type是否设置正确
  test('调用echo接口验证包含字符串和file类型的formData是否正常返回,content-type是否设置正确', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('FormData文件上传测试');
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
    // 选择FormData类型
    const formdataRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^form-data$/i }).locator('.el-radio');
    await formdataRadio.click();
    await contentPage.waitForTimeout(300);
    // 添加字符串字段: username=testuser
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('username');
    await valueInputs.first().click();
    await contentPage.keyboard.type('testuser');
    await contentPage.waitForTimeout(300);
    // 添加字符串字段: description=test file upload
    await keyInputs.nth(1).fill('description');
    await valueInputs.nth(1).click();
    await contentPage.keyboard.type('test file upload');
    await contentPage.waitForTimeout(300);
    // 添加文件字段
    await keyInputs.nth(2).fill('file');
    // 切换为文件类型
    const typeSelects = contentPage.locator('[data-testid="params-tree-type-select"]');
    await typeSelects.nth(2).click();
    const visibleDropdown = contentPage.locator('.el-select-dropdown:visible');
    await visibleDropdown.getByRole('option', { name: /^file$/i }).first().click();
    await contentPage.waitForTimeout(300);
    // 选择文件上传
    const fileInput = contentPage.locator('[data-testid="params-tree-file-input"]').first();
    const testFilePath = path.resolve(__dirname, '../../../../../../../src/renderer/assets/imgs/logo.png');
    await fileInput.setInputFiles(testFilePath);
    await contentPage.waitForTimeout(500);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    // 验证Content-Type包含multipart/form-data
    await expect(responseBody).toContainText('multipart/form-data', { timeout: 10000 });
    // 验证字符串字段
    await expect(responseBody).toContainText('username', { timeout: 10000 });
    await expect(responseBody).toContainText('testuser', { timeout: 10000 });
    await expect(responseBody).toContainText('description', { timeout: 10000 });
    // 验证文件字段
    await expect(responseBody).toContainText('file', { timeout: 10000 });
  });

  // 测试用例2: 调用echo接口验证formData录入value如果是变量(验证所有变量类型)是否正常返回,content-type是否设置正确
  test('调用echo接口验证formData录入value如果是变量是否正常返回,content-type是否设置正确', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 打开变量管理页面并创建变量
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const variableOption = contentPage.locator('.dropdown-item').filter({ hasText: /全局变量|变量/ });
    await variableOption.click();
    await contentPage.waitForTimeout(500);
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    // 创建变量 globalVar=global_value
    const nameInput = variablePage.locator('.left input').first();
    await nameInput.fill('globalVar');
    const valueTextarea = variablePage.locator('.left textarea');
    await valueTextarea.fill('global_value');
    const addBtn = variablePage.locator('.left .el-button--primary');
    await addBtn.click();
    await contentPage.waitForTimeout(500);
    // 创建变量 envVar=env_value
    await nameInput.fill('envVar');
    await valueTextarea.fill('env_value');
    await addBtn.click();
    await contentPage.waitForTimeout(500);
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('FormData变量测试');
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
    // 选择FormData类型
    const formdataRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^form-data$/i }).locator('.el-radio');
    await formdataRadio.click();
    await contentPage.waitForTimeout(300);
    // 添加包含变量的字段: name={{globalVar}}
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('name');
    await valueInputs.first().click();
    await contentPage.keyboard.type('{{globalVar}}');
    await contentPage.waitForTimeout(300);
    // 添加包含变量的字段: env={{envVar}}
    await keyInputs.nth(1).fill('env');
    await valueInputs.nth(1).click();
    await contentPage.keyboard.type('{{envVar}}');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    // 验证Content-Type包含multipart/form-data
    await expect(responseBody).toContainText('multipart/form-data', { timeout: 10000 });
    // 验证变量被正确替换
    await expect(responseBody).toContainText('global_value', { timeout: 10000 });
    await expect(responseBody).toContainText('env_value', { timeout: 10000 });
  });

  // 测试用例3: 调用echo接口验证formData录入value如果是mock是否正常返回,content-type是否设置正确
  test('调用echo接口验证formData录入value如果是mock是否正常返回,content-type是否设置正确', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('FormData Mock测试');
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
    // 选择FormData类型
    const formdataRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^form-data$/i }).locator('.el-radio');
    await formdataRadio.click();
    await contentPage.waitForTimeout(300);
    // 添加包含mock的字段: id=@id
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('id');
    await valueInputs.first().click();
    await contentPage.keyboard.type('@id');
    await contentPage.waitForTimeout(300);
    // 添加包含mock的字段: phone=@mobile
    await keyInputs.nth(1).fill('phone');
    await valueInputs.nth(1).click();
    await contentPage.keyboard.type('@mobile');
    await contentPage.waitForTimeout(300);
    // 添加包含mock的字段: email=@email
    await keyInputs.nth(2).fill('email');
    await valueInputs.nth(2).click();
    await contentPage.keyboard.type('@email');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    // 验证Content-Type包含multipart/form-data
    await expect(responseBody).toContainText('multipart/form-data', { timeout: 10000 });
    // 验证mock数据已生成(字段存在)
    await expect(responseBody).toContainText('id', { timeout: 10000 });
    await expect(responseBody).toContainText('phone', { timeout: 10000 });
    await expect(responseBody).toContainText('email', { timeout: 10000 });
  });

  // 测试用例4: 调用echo接口验证formData中没有file字段时是否正常返回,content-type是否设置正确
  test('调用echo接口验证formData中没有file字段时是否正常返回,content-type是否设置正确', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('FormData纯字符串测试');
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
    // 选择FormData类型
    const formdataRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^form-data$/i }).locator('.el-radio');
    await formdataRadio.click();
    await contentPage.waitForTimeout(300);
    // 添加多个纯字符串字段
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    // 字段1: name=张三
    await keyInputs.first().fill('name');
    await valueInputs.first().click();
    await contentPage.keyboard.type('张三');
    await contentPage.waitForTimeout(300);
    // 字段2: email=test@example.com
    await keyInputs.nth(1).fill('email');
    await valueInputs.nth(1).click();
    await contentPage.keyboard.type('test@example.com');
    await contentPage.waitForTimeout(300);
    // 字段3: age=25
    await keyInputs.nth(2).fill('age');
    await valueInputs.nth(2).click();
    await contentPage.keyboard.type('25');
    await contentPage.waitForTimeout(300);
    // 字段4: city=北京
    await keyInputs.nth(3).fill('city');
    await valueInputs.nth(3).click();
    await contentPage.keyboard.type('北京');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    // 验证Content-Type包含multipart/form-data
    await expect(responseBody).toContainText('multipart/form-data', { timeout: 10000 });
    // 验证所有字符串字段正确发送
    await expect(responseBody).toContainText('name', { timeout: 10000 });
    await expect(responseBody).toContainText('张三', { timeout: 10000 });
    await expect(responseBody).toContainText('email', { timeout: 10000 });
    await expect(responseBody).toContainText('test@example.com', { timeout: 10000 });
    await expect(responseBody).toContainText('age', { timeout: 10000 });
    await expect(responseBody).toContainText('25', { timeout: 10000 });
    await expect(responseBody).toContainText('city', { timeout: 10000 });
    await expect(responseBody).toContainText('北京', { timeout: 10000 });
  });
});
