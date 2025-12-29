import { test, expect } from '../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('CommonHeaders', () => {
  // 测试用例1: 为folder节点设置公共请求头,该folder下所有接口自动继承这些请求头
  test('为folder节点设置公共请求头,该folder下所有接口自动继承这些请求头', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // await contentPage.waitForTimeout(500);
    const treeWrap = contentPage.locator('.tree-wrap');
    // 创建一个folder节点
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    // await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newFolderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建文件夹/ });
    await newFolderItem.click();
    // await contentPage.waitForTimeout(300);
    const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
    await expect(folderDialog).toBeVisible({ timeout: 5000 });
    const folderNameInput = folderDialog.locator('input').first();
    await folderNameInput.fill('测试文件夹');
    const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
    await folderConfirmBtn.click();
    // await contentPage.waitForTimeout(500);
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
    // await contentPage.waitForTimeout(300);
    // 点击确认修改按钮保存
    const confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    await confirmBtn.click();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    // 在folder下创建一个HTTP节点
    await folderNode.click({ button: 'right' });
    // await contentPage.waitForTimeout(300);
    const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    // await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口|新增接口/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('测试接口');
    const fileConfirmBtn = addFileDialog.locator('.el-button--primary').last();
    await fileConfirmBtn.click();
    // await contentPage.waitForTimeout(500);
    // 设置请求URL并发送
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证请求信息中包含公共请求头（避免依赖响应体渲染实现）
    await expect(contentPage.locator('[data-testid="response-tabs"]')).toBeVisible({ timeout: 10000 });
    await contentPage.locator('#tab-SRequestView').click();
    const requestInfo = contentPage.locator('.request-info');
    await expect(requestInfo).toBeVisible({ timeout: 10000 });
    await expect(requestInfo).toContainText('Authorization', { timeout: 10000 });
    await expect(requestInfo).toContainText('Bearer testtoken', { timeout: 10000 });
  });
  // 测试用例2: 公共请求头支持表格模式和多行编辑模式切换,两种模式数据同步
  test('公共请求头支持表格模式和多行编辑模式切换,两种模式数据同步', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // await contentPage.waitForTimeout(500);
    const treeWrap = contentPage.locator('.tree-wrap');
    // 打开全局公共请求头设置
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    // await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const commonHeaderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /设置公共请求头/ });
    await commonHeaderItem.click();
    // await contentPage.waitForTimeout(500);
    // 验证公共请求头配置页面打开
    const commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    // 在表格模式下添加公共请求头
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('X-Test-Header');
    await valueInputs.first().click();
    await contentPage.keyboard.type('test-value');
    // await contentPage.waitForTimeout(300);
    // 点击多行编辑切换按钮
    const toggleModeBtn = commonHeaderPage.locator('.mode-toggle-icon');
    await toggleModeBtn.click();
    // await contentPage.waitForTimeout(500);
    // 验证切换到多行编辑模式
    const multilineTextarea = contentPage.locator('[data-testid="params-tree-multiline-textarea"]');
    await expect(multilineTextarea).toBeVisible({ timeout: 3000 });
    // 验证多行编辑器中包含之前输入的数据
    const textareaValue = await multilineTextarea.inputValue();
    expect(textareaValue).toContain('X-Test-Header');
    expect(textareaValue).toContain('test-value');
    // 在多行编辑器中编辑内容
    await multilineTextarea.fill('Content-Type=application/json\nAccept=*/*');
    // await contentPage.waitForTimeout(300);
    // 点击应用按钮
    const applyBtn = contentPage.locator('[data-testid="params-tree-apply-btn"]');
    await applyBtn.click();
    // await contentPage.waitForTimeout(500);
    // 验证自动切换回表格模式
    await expect(multilineTextarea).not.toBeVisible({ timeout: 3000 });
    // 验证表格中的数据已更新
    const firstKeyInput = contentPage.locator('[data-testid="params-tree-key-input"]').first();
    const firstKeyValue = await firstKeyInput.inputValue();
    expect(firstKeyValue).toBe('Content-Type');
    // 再次切换到多行编辑模式验证数据一致
    await toggleModeBtn.click();
    // await contentPage.waitForTimeout(500);
    await expect(multilineTextarea).toBeVisible({ timeout: 3000 });
    const updatedTextareaValue = await multilineTextarea.inputValue();
    expect(updatedTextareaValue).toContain('Content-Type');
    expect(updatedTextareaValue).toContain('application/json');
    // 点击返回按钮验证数据不被修改
    const cancelBtn = contentPage.locator('[data-testid="params-tree-cancel-btn"]');
    await cancelBtn.click();
    // await contentPage.waitForTimeout(500);
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
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // await contentPage.waitForTimeout(500);
    const treeWrap = contentPage.locator('.tree-wrap');
    // 打开全局公共请求头设置
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    // await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const commonHeaderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /设置公共请求头/ });
    await commonHeaderItem.click();
    // await contentPage.waitForTimeout(500);
    // 验证公共请求头配置页面打开
    const commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    // 点击多行编辑切换按钮
    const toggleModeBtn = commonHeaderPage.locator('.mode-toggle-icon');
    await toggleModeBtn.click();
    // await contentPage.waitForTimeout(500);
    // 验证切换到多行编辑模式
    const multilineTextarea = contentPage.locator('[data-testid="params-tree-multiline-textarea"]');
    await expect(multilineTextarea).toBeVisible({ timeout: 3000 });
    // 在多行编辑器中输入2行参数
    await multilineTextarea.fill('Content-Type=application/json\nAccept=*/*');
    // await contentPage.waitForTimeout(300);
    // 点击应用按钮
    const applyBtn = contentPage.locator('[data-testid="params-tree-apply-btn"]');
    await applyBtn.click();
    // await contentPage.waitForTimeout(500);
    // 验证自动切换回表格模式
    await expect(multilineTextarea).not.toBeVisible({ timeout: 3000 });
    // 验证参数行数为3行(2个有效参数 + 1个自动添加的空行)
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await expect(keyInputs).toHaveCount(3);
    // 验证最后一行的key和value为空
    const lastKeyValue = await keyInputs.nth(2).inputValue();
    const lastValueEditable = valueInputs.nth(2).locator('[contenteditable="true"]').first();
    const lastValueValue = (await lastValueEditable.innerText()).trim();
    expect(lastKeyValue).toBe('');
    expect(lastValueValue).toBe('');
    // 验证前两行的数据正确
    const firstKeyValue = await keyInputs.nth(0).inputValue();
    const firstValueEditable = valueInputs.nth(0).locator('[contenteditable="true"]').first();
    const firstValueValue = (await firstValueEditable.innerText()).trim();
    expect(firstKeyValue).toBe('Content-Type');
    expect(firstValueValue).toBe('application/json');
    const secondKeyValue = await keyInputs.nth(1).inputValue();
    const secondValueEditable = valueInputs.nth(1).locator('[contenteditable="true"]').first();
    const secondValueValue = (await secondValueEditable.innerText()).trim();
    expect(secondKeyValue).toBe('Accept');
    expect(secondValueValue).toBe('*/*');
  });
  // 测试用例4: 公共请求头顺序在刷新后保持一致，且在HTTP节点中展示顺序相同
  test('公共请求头顺序在刷新后保持一致,且在HTTP节点中展示顺序相同', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // await contentPage.waitForTimeout(500);
    const treeWrap = contentPage.locator('.tree-wrap');
    // 打开全局公共请求头设置
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    // await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const commonHeaderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /设置公共请求头/ });
    await commonHeaderItem.click();
    // await contentPage.waitForTimeout(500);
    const commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    // 按顺序添加3个公共请求头: a, b, c
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.nth(0).fill('a');
    await valueInputs.nth(0).click();
    await contentPage.keyboard.type('value-a');
    await contentPage.waitForTimeout(200);
    await keyInputs.nth(1).fill('b');
    await valueInputs.nth(1).click();
    await contentPage.keyboard.type('value-b');
    await contentPage.waitForTimeout(200);
    await keyInputs.nth(2).fill('c');
    await valueInputs.nth(2).click();
    await contentPage.keyboard.type('value-c');
    // await contentPage.waitForTimeout(300);
    // 点击确认修改按钮保存
    const confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    await confirmBtn.click();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    // 点击刷新按钮重新加载数据
    const refreshBtn = commonHeaderPage.locator('.el-button--primary').filter({ hasText: /刷新/ });
    await refreshBtn.click();
    // await contentPage.waitForTimeout(500);
    // 验证刷新后顺序保持为 a, b, c
    const refreshedKeyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const firstKey = await refreshedKeyInputs.nth(0).inputValue();
    const secondKey = await refreshedKeyInputs.nth(1).inputValue();
    const thirdKey = await refreshedKeyInputs.nth(2).inputValue();
    expect(firstKey).toBe('a');
    expect(secondKey).toBe('b');
    expect(thirdKey).toBe('c');
    // 创建HTTP节点验证公共请求头顺序
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    // await contentPage.waitForTimeout(300);
    const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    // await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口|新增接口/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('测试接口');
    const fileConfirmBtn = addFileDialog.locator('.el-button--primary').last();
    await fileConfirmBtn.click();
    // await contentPage.waitForTimeout(500);
    // 切换到Headers标签
    // 注意：data-testid 在 el-tab-pane（pane）上，真正可点击的是 tab
    await contentPage.locator('#tab-SRequestHeaders').click();
    // await contentPage.waitForTimeout(300);
    // 验证公共请求头表格中的顺序为 a, b, c
    const commonHeaderTable = contentPage.locator('.header-info .el-table');
    await expect(commonHeaderTable).toBeVisible({ timeout: 3000 });
    const tableRows = commonHeaderTable.locator('.el-table__body-wrapper .el-table__row');
    const firstRowKey = await tableRows.nth(0).locator('td').nth(1).textContent();
    const secondRowKey = await tableRows.nth(1).locator('td').nth(1).textContent();
    const thirdRowKey = await tableRows.nth(2).locator('td').nth(1).textContent();
    expect(firstRowKey?.trim()).toBe('a');
    expect(secondRowKey?.trim()).toBe('b');
    expect(thirdRowKey?.trim()).toBe('c');
  });
  // 测试用例5: 在目录A中设置公共请求头,在A目录下创建的httpNode继承A目录的公共请求头
  test('在目录下创建的httpNode继承该目录的公共请求头', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // await contentPage.waitForTimeout(500);
    const treeWrap = contentPage.locator('.tree-wrap');
    // 创建一个folder节点
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    // await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newFolderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建文件夹/ });
    await newFolderItem.click();
    // await contentPage.waitForTimeout(300);
    const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
    await expect(folderDialog).toBeVisible({ timeout: 5000 });
    const folderNameInput = folderDialog.locator('input').first();
    await folderNameInput.fill('目录A');
    const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
    await folderConfirmBtn.click();
    // await contentPage.waitForTimeout(500);
    // 右键folder节点,设置公共请求头
    const folderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '目录A' });
    await folderNode.click({ button: 'right' });
    // await contentPage.waitForTimeout(300);
    const commonHeaderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /设置公共请求头/ });
    await commonHeaderItem.click();
    // await contentPage.waitForTimeout(500);
    const commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    // 添加公共请求头
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('X-Folder-A-Header');
    await valueInputs.first().click();
    await contentPage.keyboard.type('folder-a-value');
    // await contentPage.waitForTimeout(300);
    // 保存公共请求头
    const confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    await confirmBtn.click();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    // await contentPage.waitForTimeout(500);
    // 在folder下创建一个HTTP节点
    await folderNode.click({ button: 'right' });
    // await contentPage.waitForTimeout(300);
    const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    // await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口|新增接口/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('测试接口A');
    const fileConfirmBtn = addFileDialog.locator('.el-button--primary').last();
    await fileConfirmBtn.click();
    // await contentPage.waitForTimeout(500);
    // 发送请求验证公共请求头被继承
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证请求信息中包含继承的公共请求头
    await expect(contentPage.locator('[data-testid="response-tabs"]')).toBeVisible({ timeout: 10000 });
    await contentPage.locator('#tab-SRequestView').click();
    const requestInfo = contentPage.locator('.request-info');
    await expect(requestInfo).toBeVisible({ timeout: 10000 });
    await expect(requestInfo).toContainText('X-Folder-A-Header', { timeout: 10000 });
    await expect(requestInfo).toContainText('folder-a-value', { timeout: 10000 });
  });
  // 测试用例6: 多层目录嵌套的公共请求头继承场景
  test('多层目录嵌套的公共请求头继承场景', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // await contentPage.waitForTimeout(500);
    const treeWrap = contentPage.locator('.tree-wrap');
    // 创建第一层目录: 目录Level1
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    // await contentPage.waitForTimeout(300);
    let contextMenu = contentPage.locator('.s-contextmenu');
    let newFolderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建文件夹/ });
    await newFolderItem.click();
    // await contentPage.waitForTimeout(300);
    let folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
    await expect(folderDialog).toBeVisible({ timeout: 5000 });
    let folderNameInput = folderDialog.locator('input').first();
    await folderNameInput.fill('目录Level1');
    let folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
    await folderConfirmBtn.click();
    // await contentPage.waitForTimeout(500);
    // 为Level1目录设置公共请求头
    const level1Folder = contentPage.locator('.el-tree-node__content').filter({ hasText: '目录Level1' });
    await level1Folder.click({ button: 'right' });
    // await contentPage.waitForTimeout(300);
    let commonHeaderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /设置公共请求头/ });
    await commonHeaderItem.click();
    // await contentPage.waitForTimeout(500);
    let commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    let keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    let valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('X-Level1-Header');
    await valueInputs.first().click();
    await contentPage.keyboard.type('level1-value');
    // await contentPage.waitForTimeout(300);
    let confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    await confirmBtn.click();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    // await contentPage.waitForTimeout(500);
    // 在Level1下创建第二层目录: 目录Level2
    await level1Folder.click({ button: 'right' });
    // await contentPage.waitForTimeout(300);
    contextMenu = contentPage.locator('.s-contextmenu');
    newFolderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建文件夹/ });
    await newFolderItem.click();
    // await contentPage.waitForTimeout(300);
    folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
    await expect(folderDialog).toBeVisible({ timeout: 5000 });
    folderNameInput = folderDialog.locator('input').first();
    await folderNameInput.fill('目录Level2');
    folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
    await folderConfirmBtn.click();
    // await contentPage.waitForTimeout(500);
    // 为Level2目录设置公共请求头
    const level2Folder = contentPage.locator('.el-tree-node__content').filter({ hasText: '目录Level2' });
    await level2Folder.click({ button: 'right' });
    // await contentPage.waitForTimeout(300);
    commonHeaderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /设置公共请求头/ });
    await commonHeaderItem.click();
    // await contentPage.waitForTimeout(500);
    commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('X-Level2-Header');
    await valueInputs.first().click();
    await contentPage.keyboard.type('level2-value');
    // await contentPage.waitForTimeout(300);
    confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    await confirmBtn.click();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    // await contentPage.waitForTimeout(500);
    // 在Level2下创建第三层目录: 目录Level3
    await level2Folder.click({ button: 'right' });
    // await contentPage.waitForTimeout(300);
    contextMenu = contentPage.locator('.s-contextmenu');
    newFolderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建文件夹/ });
    await newFolderItem.click();
    // await contentPage.waitForTimeout(300);
    folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
    await expect(folderDialog).toBeVisible({ timeout: 5000 });
    folderNameInput = folderDialog.locator('input').first();
    await folderNameInput.fill('目录Level3');
    folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
    await folderConfirmBtn.click();
    // await contentPage.waitForTimeout(500);
    // 为Level3目录设置公共请求头
    const level3Folder = contentPage.locator('.el-tree-node__content').filter({ hasText: '目录Level3' });
    await level3Folder.click({ button: 'right' });
    // await contentPage.waitForTimeout(300);
    commonHeaderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /设置公共请求头/ });
    await commonHeaderItem.click();
    // await contentPage.waitForTimeout(500);
    commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('X-Level3-Header');
    await valueInputs.first().click();
    await contentPage.keyboard.type('level3-value');
    // await contentPage.waitForTimeout(300);
    confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    await confirmBtn.click();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    // await contentPage.waitForTimeout(500);
    // 在Level3下创建一个HTTP节点
    await level3Folder.click({ button: 'right' });
    // await contentPage.waitForTimeout(300);
    const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    // await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口|新增接口/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('嵌套测试接口');
    const fileConfirmBtn = addFileDialog.locator('.el-button--primary').last();
    await fileConfirmBtn.click();
    // await contentPage.waitForTimeout(500);
    // 发送请求验证多层公共请求头都被继承
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证请求信息中包含所有三层的公共请求头
    await expect(contentPage.locator('[data-testid="response-tabs"]')).toBeVisible({ timeout: 10000 });
    await contentPage.locator('#tab-SRequestView').click();
    const requestInfo = contentPage.locator('.request-info');
    await expect(requestInfo).toBeVisible({ timeout: 10000 });
    await expect(requestInfo).toContainText('X-Level1-Header', { timeout: 10000 });
    await expect(requestInfo).toContainText('level1-value', { timeout: 10000 });
    await expect(requestInfo).toContainText('X-Level2-Header', { timeout: 10000 });
    await expect(requestInfo).toContainText('level2-value', { timeout: 10000 });
    await expect(requestInfo).toContainText('X-Level3-Header', { timeout: 10000 });
    await expect(requestInfo).toContainText('level3-value', { timeout: 10000 });
  });
  // 测试用例7: 子目录公共请求头优先级高于父目录（相同key的情况）
  test('子目录公共请求头优先级高于父目录', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // await contentPage.waitForTimeout(500);
    const treeWrap = contentPage.locator('.tree-wrap');
    // 创建父目录
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    // await contentPage.waitForTimeout(300);
    let contextMenu = contentPage.locator('.s-contextmenu');
    let newFolderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建文件夹/ });
    await newFolderItem.click();
    // await contentPage.waitForTimeout(300);
    let folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
    await expect(folderDialog).toBeVisible({ timeout: 5000 });
    let folderNameInput = folderDialog.locator('input').first();
    await folderNameInput.fill('父目录');
    let folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
    await folderConfirmBtn.click();
    // await contentPage.waitForTimeout(500);
    // 为父目录设置公共请求头
    const parentFolder = contentPage.locator('.el-tree-node__content').filter({ hasText: '父目录' });
    await parentFolder.click({ button: 'right' });
    // await contentPage.waitForTimeout(300);
    let commonHeaderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /设置公共请求头/ });
    await commonHeaderItem.click();
    // await contentPage.waitForTimeout(500);
    let commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    let keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    let valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('X-Override-Header');
    await valueInputs.first().click();
    await contentPage.keyboard.type('parent-value');
    // await contentPage.waitForTimeout(300);
    let confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    await confirmBtn.click();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    // await contentPage.waitForTimeout(500);
    // 在父目录下创建子目录
    await parentFolder.click({ button: 'right' });
    // await contentPage.waitForTimeout(300);
    contextMenu = contentPage.locator('.s-contextmenu');
    newFolderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建文件夹/ });
    await newFolderItem.click();
    // await contentPage.waitForTimeout(300);
    folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
    await expect(folderDialog).toBeVisible({ timeout: 5000 });
    folderNameInput = folderDialog.locator('input').first();
    await folderNameInput.fill('子目录');
    folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
    await folderConfirmBtn.click();
    // await contentPage.waitForTimeout(500);
    // 为子目录设置相同key但不同value的公共请求头
    const childFolder = contentPage.locator('.el-tree-node__content').filter({ hasText: '子目录' });
    await childFolder.click({ button: 'right' });
    // await contentPage.waitForTimeout(300);
    commonHeaderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /设置公共请求头/ });
    await commonHeaderItem.click();
    // await contentPage.waitForTimeout(500);
    commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('X-Override-Header');
    await valueInputs.first().click();
    await contentPage.keyboard.type('child-value');
    // await contentPage.waitForTimeout(300);
    confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    await confirmBtn.click();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    // await contentPage.waitForTimeout(500);
    // 在子目录下创建HTTP节点
    await childFolder.click({ button: 'right' });
    // await contentPage.waitForTimeout(300);
    const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    // await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口|新增接口/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('优先级测试接口');
    const fileConfirmBtn = addFileDialog.locator('.el-button--primary').last();
    await fileConfirmBtn.click();
    // await contentPage.waitForTimeout(500);
    // 切换到Headers标签，验证UI上父级被标记为低优先级，子级为高优先级
    await contentPage.locator('#tab-SRequestHeaders').click();
    // await contentPage.waitForTimeout(500);
    const commonHeaderTable = contentPage.locator('.header-info .el-table').first();
    const parentRow = commonHeaderTable.locator('.el-table__body-wrapper tbody tr', { hasText: 'parent-value' }).first();
    const childRow = commonHeaderTable.locator('.el-table__body-wrapper tbody tr', { hasText: 'child-value' }).first();
    await expect(parentRow).toBeVisible({ timeout: 5000 });
    await expect(childRow).toBeVisible({ timeout: 5000 });
    await expect(parentRow.locator('.inactive-common-header', { hasText: 'X-Override-Header' }).first()).toBeVisible({ timeout: 5000 });
    await expect(childRow.locator('.inactive-common-header')).toHaveCount(0);
    // 发送请求验证子目录的公共请求头覆盖父目录的
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证请求信息中子目录覆盖父目录
    await expect(contentPage.locator('[data-testid="response-tabs"]')).toBeVisible({ timeout: 10000 });
    await contentPage.locator('#tab-SRequestView').click();
    const requestInfo = contentPage.locator('.request-info');
    await expect(requestInfo).toBeVisible({ timeout: 10000 });
    await expect(requestInfo).toContainText('child-value', { timeout: 10000 });
    const requestText = await requestInfo.textContent();
    expect(requestText).not.toContain('parent-value');
  });
});
