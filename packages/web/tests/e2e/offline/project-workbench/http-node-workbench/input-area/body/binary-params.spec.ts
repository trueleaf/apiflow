import { test, expect } from '../../../../../../fixtures/electron.fixture';
import path from 'path';
import fs from 'fs';

const MOCK_SERVER_PORT = 3456;

test.describe('BinaryParams', () => {
  // 变量模式,若没有输入有效变量,发送返回值中正确提示发送被终止
  test('变量模式下无效变量发送被阻止', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('Binary变量模式无效变量测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置POST方法
    const methodSelect = contentPage.locator('.request-url .method-select');
    await methodSelect.click();
    await contentPage.waitForTimeout(200);
    const postOption = contentPage.locator('.el-select-dropdown__item', { hasText: 'POST' });
    await postOption.click();
    await contentPage.waitForTimeout(300);
    // 设置请求URL
    const urlInput = contentPage.locator('.request-url .url-input input');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(300);
    // 切换到Body标签
    const bodyTab = contentPage.locator('.el-tabs__item', { hasText: 'Body' });
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
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(1000);
    // 验证显示错误提示
    const errorMessage = contentPage.locator('.el-message--error, .response-error, .error-tip');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });
  // 变量模式,输入有效变量,请求头自动添加contentType并正确发送
  test('变量模式下有效变量正确发送', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 创建测试文件
    const testFilePath = path.join(process.cwd(), 'temp', 'test-binary.txt');
    const testDir = path.dirname(testFilePath);
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    fs.writeFileSync(testFilePath, 'test binary content');
    // 创建HTTP节点
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('Binary变量模式有效变量测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 先添加变量
    const variableBtn = contentPage.locator('.variable-btn, [data-testid="variable-btn"]');
    if (await variableBtn.isVisible()) {
      await variableBtn.click();
      await contentPage.waitForTimeout(300);
      const variableDialog = contentPage.locator('.el-dialog').filter({ hasText: /变量/ });
      if (await variableDialog.isVisible()) {
        const addBtn = variableDialog.locator('.el-button', { hasText: /新增|添加/ }).first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
          await contentPage.waitForTimeout(200);
          const keyInput = variableDialog.locator('input').first();
          await keyInput.fill('binaryFilePath');
          const valueInput = variableDialog.locator('input').nth(1);
          await valueInput.fill(testFilePath);
          const saveBtn = variableDialog.locator('.el-button--primary').last();
          await saveBtn.click();
          await contentPage.waitForTimeout(300);
        }
        const closeBtn = variableDialog.locator('.el-dialog__close, .el-icon-close').first();
        if (await closeBtn.isVisible()) {
          await closeBtn.click();
        }
      }
    }
    // 设置POST方法
    const methodSelect = contentPage.locator('.request-url .method-select');
    await methodSelect.click();
    await contentPage.waitForTimeout(200);
    const postOption = contentPage.locator('.el-select-dropdown__item', { hasText: 'POST' });
    await postOption.click();
    await contentPage.waitForTimeout(300);
    // 设置请求URL
    const urlInput = contentPage.locator('.request-url .url-input input');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(300);
    // 切换到Body标签
    const bodyTab = contentPage.locator('.el-tabs__item', { hasText: 'Body' });
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
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应区域有内容（请求成功发送）
    const responseArea = contentPage.locator('.response-area, .response-wrap, .response-content');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    // 清理测试文件
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });
  // 文件模式,未选择文件,发送返回值中正确提示发送被终止
  test('文件模式下未选择文件发送被阻止', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('Binary文件模式未选择文件测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置POST方法
    const methodSelect = contentPage.locator('.request-url .method-select');
    await methodSelect.click();
    await contentPage.waitForTimeout(200);
    const postOption = contentPage.locator('.el-select-dropdown__item', { hasText: 'POST' });
    await postOption.click();
    await contentPage.waitForTimeout(300);
    // 设置请求URL
    const urlInput = contentPage.locator('.request-url .url-input input');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(300);
    // 切换到Body标签
    const bodyTab = contentPage.locator('.el-tabs__item', { hasText: 'Body' });
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
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(1000);
    // 验证显示错误提示
    const errorMessage = contentPage.locator('.el-message--error, .response-error, .error-tip');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });
  // 文件模式,选择正确的文件,请求头自动添加contentType并正确发送
  test('文件模式下选择文件正确发送', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
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
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('Binary文件模式选择文件测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置POST方法
    const methodSelect = contentPage.locator('.request-url .method-select');
    await methodSelect.click();
    await contentPage.waitForTimeout(200);
    const postOption = contentPage.locator('.el-select-dropdown__item', { hasText: 'POST' });
    await postOption.click();
    await contentPage.waitForTimeout(300);
    // 设置请求URL
    const urlInput = contentPage.locator('.request-url .url-input input');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(300);
    // 切换到Body标签
    const bodyTab = contentPage.locator('.el-tabs__item', { hasText: 'Body' });
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
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles(testFilePath);
      await contentPage.waitForTimeout(500);
    }
    // 点击发送按钮
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应区域有内容（请求成功发送）
    const responseArea = contentPage.locator('.response-area, .response-wrap, .response-content');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    // 清理测试文件
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });
});
