import { test, expect } from '../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('GlobalCommonHeaders', () => {
  // 测试用例1: 为folder节点设置公共请求头,该folder下所有接口自动继承这些请求头
  test('为folder节点设置公共请求头,该folder下所有接口自动继承这些请求头', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const treeWrap = contentPage.locator('.tree-wrap');
    // 创建一个folder节点
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newFolderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建文件夹/ });
    await newFolderItem.click();
    await contentPage.waitForTimeout(300);
    const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
    await expect(folderDialog).toBeVisible({ timeout: 5000 });
    const folderNameInput = folderDialog.locator('input').first();
    await folderNameInput.fill('测试文件夹');
    const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
    await folderConfirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 右键folder节点,点击设置公共请求头
    const folderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '测试文件夹' });
    await folderNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const commonHeaderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /设置公共请求头/ });
    await commonHeaderItem.click();
    await contentPage.waitForTimeout(500);
    // 验证公共请求头配置页面打开
    const commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    // 验证说明区域显示规则
    await expect(commonHeaderPage).toContainText('公共请求头针对目录内所有接口生效');
    await expect(commonHeaderPage).toContainText('针对嵌套目录，子目录优先级高于父目录');
    await expect(commonHeaderPage).toContainText('接口本身请求头优先级高于公共请求头');
    // 添加公共请求头
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('Authorization');
    await valueInputs.first().click();
    await contentPage.keyboard.type('Bearer testtoken');
    await contentPage.waitForTimeout(300);
    // 点击确认修改按钮保存
    const confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证修改成功消息
    const successMessage = contentPage.locator('.el-message--success');
    await expect(successMessage).toBeVisible({ timeout: 3000 });
    // 在folder下创建一个HTTP节点
    await folderNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口|新增接口/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('测试接口');
    const fileConfirmBtn = addFileDialog.locator('.el-button--primary').last();
    await fileConfirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL并发送
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应中包含公共请求头
    const responseBody = contentPage.locator('.response-body');
    await expect(responseBody).toContainText('Bearer testtoken', { timeout: 10000 });
  });
  // 测试用例2: 公共请求头支持表格模式和多行编辑模式切换,两种模式数据同步
  test('公共请求头支持表格模式和多行编辑模式切换,两种模式数据同步', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const treeWrap = contentPage.locator('.tree-wrap');
    // 打开全局公共请求头设置
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const commonHeaderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /设置公共请求头/ });
    await commonHeaderItem.click();
    await contentPage.waitForTimeout(500);
    // 验证公共请求头配置页面打开
    const commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    // 在表格模式下添加公共请求头
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('X-Test-Header');
    await valueInputs.first().click();
    await contentPage.keyboard.type('test-value');
    await contentPage.waitForTimeout(300);
    // 点击多行编辑切换按钮
    const toggleModeBtn = commonHeaderPage.locator('.mode-toggle-icon');
    await toggleModeBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证切换到多行编辑模式
    const multilineTextarea = contentPage.locator('[data-testid="params-tree-multiline-textarea"]');
    await expect(multilineTextarea).toBeVisible({ timeout: 3000 });
    // 验证多行编辑器中包含之前输入的数据
    const textareaValue = await multilineTextarea.inputValue();
    expect(textareaValue).toContain('X-Test-Header');
    expect(textareaValue).toContain('test-value');
    // 在多行编辑器中编辑内容
    await multilineTextarea.fill('Content-Type=application/json\nAccept=*/*');
    await contentPage.waitForTimeout(300);
    // 点击应用按钮
    const applyBtn = contentPage.locator('[data-testid="params-tree-apply-btn"]');
    await applyBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证自动切换回表格模式
    await expect(multilineTextarea).not.toBeVisible({ timeout: 3000 });
    // 验证表格中的数据已更新
    const firstKeyInput = contentPage.locator('[data-testid="params-tree-key-input"]').first();
    const firstKeyValue = await firstKeyInput.inputValue();
    expect(firstKeyValue).toBe('Content-Type');
    // 再次切换到多行编辑模式验证数据一致
    await toggleModeBtn.click();
    await contentPage.waitForTimeout(500);
    await expect(multilineTextarea).toBeVisible({ timeout: 3000 });
    const updatedTextareaValue = await multilineTextarea.inputValue();
    expect(updatedTextareaValue).toContain('Content-Type');
    expect(updatedTextareaValue).toContain('application/json');
    // 点击返回按钮验证数据不被修改
    const cancelBtn = contentPage.locator('[data-testid="params-tree-cancel-btn"]');
    await cancelBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证切换回表格模式
    await expect(multilineTextarea).not.toBeVisible({ timeout: 3000 });
    // 验证表格数据保持不变
    const finalKeyValue = await firstKeyInput.inputValue();
    expect(finalKeyValue).toBe('Content-Type');
  });
  // 测试用例3: 批量模式应用参数后自动在尾部添加空行
  test('批量模式应用参数后自动在尾部添加空行', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const treeWrap = contentPage.locator('.tree-wrap');
    // 打开全局公共请求头设置
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const commonHeaderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /设置公共请求头/ });
    await commonHeaderItem.click();
    await contentPage.waitForTimeout(500);
    // 验证公共请求头配置页面打开
    const commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    // 点击多行编辑切换按钮
    const toggleModeBtn = commonHeaderPage.locator('.mode-toggle-icon');
    await toggleModeBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证切换到多行编辑模式
    const multilineTextarea = contentPage.locator('[data-testid="params-tree-multiline-textarea"]');
    await expect(multilineTextarea).toBeVisible({ timeout: 3000 });
    // 在多行编辑器中输入2行参数
    await multilineTextarea.fill('Content-Type=application/json\nAccept=*/*');
    await contentPage.waitForTimeout(300);
    // 点击应用按钮
    const applyBtn = contentPage.locator('[data-testid="params-tree-apply-btn"]');
    await applyBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证自动切换回表格模式
    await expect(multilineTextarea).not.toBeVisible({ timeout: 3000 });
    // 验证参数行数为3行(2个有效参数 + 1个自动添加的空行)
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await expect(keyInputs).toHaveCount(3);
    // 验证最后一行的key和value为空
    const lastKeyValue = await keyInputs.nth(2).inputValue();
    const lastValueValue = await valueInputs.nth(2).inputValue();
    expect(lastKeyValue).toBe('');
    expect(lastValueValue).toBe('');
    // 验证前两行的数据正确
    const firstKeyValue = await keyInputs.nth(0).inputValue();
    const firstValueValue = await valueInputs.nth(0).inputValue();
    expect(firstKeyValue).toBe('Content-Type');
    expect(firstValueValue).toBe('application/json');
    const secondKeyValue = await keyInputs.nth(1).inputValue();
    const secondValueValue = await valueInputs.nth(1).inputValue();
    expect(secondKeyValue).toBe('Accept');
    expect(secondValueValue).toBe('*/*');
  });
});
