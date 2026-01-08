import { test, expect } from '../../../../fixtures/electron-online.fixture';
import type { Page } from '@playwright/test';

const MOCK_SERVER_PORT = 3456;
const COMMON_HEADERS_TIMEOUT = 20000;
const waitForCommonHeaderFetch = (page: Page) =>
  page.waitForResponse(
    (response) => response.ok() && (response.url().includes('/api/project/global_common_headers') || response.url().includes('/api/project/common_header_by_id')),
    { timeout: COMMON_HEADERS_TIMEOUT },
  );
const waitForCommonHeaderSave = (page: Page) =>
  page.waitForResponse(
    (response) => response.ok() && (response.url().includes('/api/project/replace_global_common_headers') || response.url().includes('/api/project/common_header')),
    { timeout: COMMON_HEADERS_TIMEOUT },
  );

test.describe('CommonHeaders', () => {
  // 测试用例1: 为folder节点设置公共请求头,该folder下所有接口自动继承这些请求头
  test('为folder节点设置公共请求头,该folder下所有接口自动继承这些请求头', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    // 清除缓存并登录
    await clearCache();
    await loginAccount();
    // 创建项目并进入工作台
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 创建一个folder节点
    const folderId = await createNode(contentPage, { nodeType: 'folder', name: '测试文件夹' });
    // 右键点击folder节点，打开上下文菜单
    const folderNode = contentPage.locator(`[data-test-node-id="${folderId}"]`);
    await folderNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    // 点击"设置公共请求头"菜单项
    const commonHeaderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /设置公共请求头/ });
    const fetchCommonHeader = waitForCommonHeaderFetch(contentPage);
    await commonHeaderItem.click();
    await fetchCommonHeader;
    // 验证公共请求头配置页面成功打开
    const commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    // 验证说明区域显示正确的规则说明
    await expect(commonHeaderPage).toContainText('公共请求头针对目录内所有接口生效');
    await expect(commonHeaderPage).toContainText('针对嵌套目录，子目录优先级高于父目录');
    await expect(commonHeaderPage).toContainText('接口本身请求头优先级高于公共请求头');
    // 在表格中添加公共请求头 Authorization
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('Authorization');
    await valueInputs.first().click();
    await contentPage.keyboard.type('Bearer testtoken');
    // 点击确认修改按钮，保存公共请求头配置
    const confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    const saveCommonHeader = waitForCommonHeaderSave(contentPage);
    await confirmBtn.click();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    await saveCommonHeader;
    // 在该folder下创建HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '测试接口', pid: folderId });
    // 设置请求URL并发送请求
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 切换到请求详情视图，验证请求信息中包含继承的公共请求头
    await expect(contentPage.locator('[data-testid="response-tabs"]')).toBeVisible({ timeout: 10000 });
    await contentPage.locator('#tab-SRequestView').click();
    const requestInfo = contentPage.locator('.request-info');
    await expect(requestInfo).toBeVisible({ timeout: 10000 });
    await expect(requestInfo).toContainText('Authorization', { timeout: 10000 });
    await expect(requestInfo).toContainText('Bearer testtoken', { timeout: 10000 });
  });
  // 测试用例2: 公共请求头支持表格模式和多行编辑模式切换,两种模式数据同步
  test('公共请求头支持表格模式和多行编辑模式切换,两种模式数据同步', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    // 清除缓存并登录
    await clearCache();
    await loginAccount();
    // 创建项目并进入工作台
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 右键点击树区域空白处，打开全局公共请求头设置
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    const contextMenu = contentPage.locator('.s-contextmenu');
    const commonHeaderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /设置公共请求头/ });
    const fetchCommonHeader = waitForCommonHeaderFetch(contentPage);
    await commonHeaderItem.click();
    await fetchCommonHeader;
    // 验证公共请求头配置页面成功打开
    const commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    // 在表格模式下添加一个测试请求头
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('X-Test-Header');
    await valueInputs.first().click();
    await contentPage.keyboard.type('test-value');
    // 点击模式切换按钮，切换到多行编辑模式
    const toggleModeBtn = commonHeaderPage.locator('.mode-toggle-icon');
    await toggleModeBtn.click();
    // 验证成功切换到多行编辑模式
    const multilineTextarea = contentPage.locator('[data-testid="params-tree-multiline-textarea"]');
    await expect(multilineTextarea).toBeVisible({ timeout: 3000 });
    // 验证多行编辑器中正确显示之前在表格中输入的数据
    const textareaValue = await multilineTextarea.inputValue();
    expect(textareaValue).toContain('X-Test-Header');
    expect(textareaValue).toContain('test-value');
    // 在多行编辑器中重新编辑内容为两个新的请求头
    await multilineTextarea.fill('Content-Type=application/json\nAccept=*/*');
    // 点击应用按钮，将多行编辑的内容应用到表格
    const applyBtn = contentPage.locator('[data-testid="params-tree-apply-btn"]');
    await applyBtn.click();
    // 验证应用后自动切换回表格模式
    await expect(multilineTextarea).not.toBeVisible({ timeout: 3000 });
    // 验证表格中的数据已经更新为多行编辑器中的内容
    const firstKeyInput = contentPage.locator('[data-testid="params-tree-key-input"]').first();
    const firstKeyValue = await firstKeyInput.inputValue();
    expect(firstKeyValue).toBe('Content-Type');
    // 再次切换到多行编辑模式，验证数据保持一致
    await toggleModeBtn.click();
    await expect(multilineTextarea).toBeVisible({ timeout: 3000 });
    const updatedTextareaValue = await multilineTextarea.inputValue();
    expect(updatedTextareaValue).toContain('Content-Type');
    expect(updatedTextareaValue).toContain('application/json');
    // 点击取消按钮（不应用修改），验证数据不被修改
    const cancelBtn = contentPage.locator('[data-testid="params-tree-cancel-btn"]');
    await cancelBtn.click();
    // 验证取消后切换回表格模式
    await expect(multilineTextarea).not.toBeVisible({ timeout: 3000 });
    // 验证表格数据保持不变（未被取消操作影响）
    const finalKeyValue = await firstKeyInput.inputValue();
    expect(finalKeyValue).toBe('Content-Type');
  });
  // 测试用例3: 批量模式应用参数后自动在尾部添加空行
  test('批量模式应用参数后自动在尾部添加空行', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    // 清除缓存并登录
    await clearCache();
    await loginAccount();
    // 创建项目并进入工作台
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 右键点击树区域空白处，打开全局公共请求头设置
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    const contextMenu = contentPage.locator('.s-contextmenu');
    const commonHeaderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /设置公共请求头/ });
    const fetchCommonHeader = waitForCommonHeaderFetch(contentPage);
    await commonHeaderItem.click();
    await fetchCommonHeader;
    // 验证公共请求头配置页面成功打开
    const commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    // 点击模式切换按钮，直接进入多行编辑模式
    const toggleModeBtn = commonHeaderPage.locator('.mode-toggle-icon');
    await toggleModeBtn.click();
    // 验证成功切换到多行编辑模式
    const multilineTextarea = contentPage.locator('[data-testid="params-tree-multiline-textarea"]');
    await expect(multilineTextarea).toBeVisible({ timeout: 3000 });
    // 在多行编辑器中输入2行有效参数
    await multilineTextarea.fill('Content-Type=application/json\nAccept=*/*');
    // 点击应用按钮，将内容应用到表格
    const applyBtn = contentPage.locator('[data-testid="params-tree-apply-btn"]');
    await applyBtn.click();
    // 验证应用后自动切换回表格模式
    await expect(multilineTextarea).not.toBeVisible({ timeout: 3000 });
    // 验证表格行数为3行（2个有效参数 + 1个自动添加的空行）
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await expect(keyInputs).toHaveCount(3);
    // 验证第3行（最后一行）的key和value都为空
    const lastKeyValue = await keyInputs.nth(2).inputValue();
    const lastValueEditable = valueInputs.nth(2).locator('[contenteditable="true"]').first();
    const lastValueValue = (await lastValueEditable.innerText()).trim();
    expect(lastKeyValue).toBe('');
    expect(lastValueValue).toBe('');
    // 验证第1行数据正确解析
    const firstKeyValue = await keyInputs.nth(0).inputValue();
    const firstValueEditable = valueInputs.nth(0).locator('[contenteditable="true"]').first();
    const firstValueValue = (await firstValueEditable.innerText()).trim();
    expect(firstKeyValue).toBe('Content-Type');
    expect(firstValueValue).toBe('application/json');
    // 验证第2行数据正确解析
    const secondKeyValue = await keyInputs.nth(1).inputValue();
    const secondValueEditable = valueInputs.nth(1).locator('[contenteditable="true"]').first();
    const secondValueValue = (await secondValueEditable.innerText()).trim();
    expect(secondKeyValue).toBe('Accept');
    expect(secondValueValue).toBe('*/*');
  });
  // 测试用例4: 公共请求头顺序在刷新后保持一致，且在HTTP节点中展示顺序相同
  test('公共请求头顺序在刷新后保持一致,且在HTTP节点中展示顺序相同', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    // 清除缓存并登录
    await clearCache();
    await loginAccount();
    // 创建项目并进入工作台
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 右键点击树区域空白处，打开全局公共请求头设置
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    const contextMenu = contentPage.locator('.s-contextmenu');
    const commonHeaderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /设置公共请求头/ });
    await commonHeaderItem.click();
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
    // 保存公共请求头配置
    const confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    const saveCommonHeader = waitForCommonHeaderSave(contentPage);
    await confirmBtn.click();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    await saveCommonHeader;
    // 点击刷新按钮，重新从服务器加载数据
    const refreshBtn = commonHeaderPage.locator('.el-button--primary').filter({ hasText: /刷新/ });
    const refreshPromise = waitForCommonHeaderFetch(contentPage);
    await refreshBtn.click();
    await refreshPromise;
    // 验证刷新后顺序保持为 a, b, c
    const refreshedKeyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const firstKey = await refreshedKeyInputs.nth(0).inputValue();
    const secondKey = await refreshedKeyInputs.nth(1).inputValue();
    const thirdKey = await refreshedKeyInputs.nth(2).inputValue();
    expect(firstKey).toBe('a');
    expect(secondKey).toBe('b');
    expect(thirdKey).toBe('c');
    // 创建HTTP节点，验证公共请求头在HTTP节点中的展示顺序
    await createNode(contentPage, { nodeType: 'http', name: '测试接口' });
    // 切换到Headers标签
    await contentPage.locator('#tab-SRequestHeaders').click();
    // 验证公共请求头表格中的顺序也是 a, b, c
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
  test('在目录下创建的httpNode继承该目录的公共请求头', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    // 清除缓存并登录
    await clearCache();
    await loginAccount();
    // 创建项目并进入工作台
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 创建一个folder节点
    const folderAId = await createNode(contentPage, { nodeType: 'folder', name: '目录A' });
    // 右键点击folder节点，打开上下文菜单
    const folderNode = contentPage.locator(`[data-test-node-id="${folderAId}"]`);
    await folderNode.click({ button: 'right' });
    // 点击"设置公共请求头"菜单项
    const commonHeaderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /设置公共请求头/ });
    const fetchCommonHeader = waitForCommonHeaderFetch(contentPage);
    await commonHeaderItem.click();
    await fetchCommonHeader;
    const commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    // 为目录A添加公共请求头
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('X-Folder-A-Header');
    await valueInputs.first().click();
    await contentPage.keyboard.type('folder-a-value');
    // 保存公共请求头配置
    const confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    const saveCommonHeader = waitForCommonHeaderSave(contentPage);
    await confirmBtn.click();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    await saveCommonHeader;
    // 在目录A下创建一个HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '测试接口A', pid: folderAId });
    // 设置请求URL并发送请求
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 切换到请求详情视图，验证请求信息中包含继承的公共请求头
    await expect(contentPage.locator('[data-testid="response-tabs"]')).toBeVisible({ timeout: 10000 });
    await contentPage.locator('#tab-SRequestView').click();
    const requestInfo = contentPage.locator('.request-info');
    await expect(requestInfo).toBeVisible({ timeout: 10000 });
    await expect(requestInfo).toContainText('X-Folder-A-Header', { timeout: 10000 });
    await expect(requestInfo).toContainText('folder-a-value', { timeout: 10000 });
  });
  // 测试用例6: 多层目录嵌套的公共请求头继承场景
  test('多层目录嵌套的公共请求头继承场景', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    // 清除缓存并登录
    await clearCache();
    await loginAccount();
    // 创建项目并进入工作台
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 创建第一层目录
    const level1FolderId = await createNode(contentPage, { nodeType: 'folder', name: '目录Level1' });
    // 为Level1目录设置公共请求头
    const level1Folder = contentPage.locator(`[data-test-node-id="${level1FolderId}"]`);
    await level1Folder.click({ button: 'right' });
    let commonHeaderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /设置公共请求头/ });
    const fetchCommonHeaderLevel1 = waitForCommonHeaderFetch(contentPage);
    await commonHeaderItem.click();
    await fetchCommonHeaderLevel1;
    let commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    let keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    let valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('X-Level1-Header');
    await valueInputs.first().click();
    await contentPage.keyboard.type('level1-value');
    // 保存Level1的公共请求头配置
    let confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    const saveCommonHeaderLevel1 = waitForCommonHeaderSave(contentPage);
    await confirmBtn.click();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    await saveCommonHeaderLevel1;
    // 在Level1下创建第二层目录
    const level2FolderId = await createNode(contentPage, { nodeType: 'folder', name: '目录Level2', pid: level1FolderId });
    // 为Level2目录设置公共请求头
    const level2Folder = contentPage.locator(`[data-test-node-id="${level2FolderId}"]`);
    await level2Folder.click({ button: 'right' });
    commonHeaderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /设置公共请求头/ });
    const fetchCommonHeaderLevel2 = waitForCommonHeaderFetch(contentPage);
    await commonHeaderItem.click();
    await fetchCommonHeaderLevel2;
    commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('X-Level2-Header');
    await valueInputs.first().click();
    await contentPage.keyboard.type('level2-value');
    // 保存Level2的公共请求头配置
    confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    const saveCommonHeaderLevel2 = waitForCommonHeaderSave(contentPage);
    await confirmBtn.click();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    await saveCommonHeaderLevel2;
    // 在Level2下创建第三层目录
    const level3FolderId = await createNode(contentPage, { nodeType: 'folder', name: '目录Level3', pid: level2FolderId });
    // 为Level3目录设置公共请求头
    const level3Folder = contentPage.locator(`[data-test-node-id="${level3FolderId}"]`);
    await level3Folder.click({ button: 'right' });
    commonHeaderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /设置公共请求头/ });
    const fetchCommonHeaderLevel3 = waitForCommonHeaderFetch(contentPage);
    await commonHeaderItem.click();
    await fetchCommonHeaderLevel3;
    commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('X-Level3-Header');
    await valueInputs.first().click();
    await contentPage.keyboard.type('level3-value');
    // 保存Level3的公共请求头配置
    confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    const saveCommonHeaderLevel3 = waitForCommonHeaderSave(contentPage);
    await confirmBtn.click();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    await saveCommonHeaderLevel3;
    // 在最深层Level3下创建HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '嵌套测试接口', pid: level3FolderId });
    // 设置请求URL并发送请求
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 切换到请求详情视图，验证请求中包含所有三层目录的公共请求头
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
  test('子目录公共请求头优先级高于父目录', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    // 清除缓存并登录
    await clearCache();
    await loginAccount();
    // 创建项目并进入工作台
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 创建父目录
    const parentFolderId = await createNode(contentPage, { nodeType: 'folder', name: '父目录' });
    // 为父目录设置公共请求头
    const parentFolder = contentPage.locator(`[data-test-node-id="${parentFolderId}"]`);
    await parentFolder.click({ button: 'right' });
    let commonHeaderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /设置公共请求头/ });
    const fetchCommonHeaderParent = waitForCommonHeaderFetch(contentPage);
    await commonHeaderItem.click();
    await fetchCommonHeaderParent;
    let commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    let keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    let valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('X-Override-Header');
    await valueInputs.first().click();
    await contentPage.keyboard.type('parent-value');
    // 保存父目录的公共请求头
    let confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    const saveCommonHeaderParent = waitForCommonHeaderSave(contentPage);
    await confirmBtn.click();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    await saveCommonHeaderParent;
    // 在父目录下创建子目录
    const childFolderId = await createNode(contentPage, { nodeType: 'folder', name: '子目录', pid: parentFolderId });
    // 为子目录设置相同key但不同value的公共请求头
    const childFolder = contentPage.locator(`[data-test-node-id="${childFolderId}"]`);
    await childFolder.click({ button: 'right' });
    commonHeaderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /设置公共请求头/ });
    const fetchCommonHeaderChild = waitForCommonHeaderFetch(contentPage);
    await commonHeaderItem.click();
    await fetchCommonHeaderChild;
    commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('X-Override-Header');
    await valueInputs.first().click();
    await contentPage.keyboard.type('child-value');
    // 保存子目录的公共请求头
    confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    const saveCommonHeaderChild = waitForCommonHeaderSave(contentPage);
    await confirmBtn.click();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    await saveCommonHeaderChild;
    // 在子目录下创建HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '优先级测试接口', pid: childFolderId });
    // 切换到Headers标签，验证UI上父级被标记为低优先级，子级为高优先级
    await contentPage.locator('#tab-SRequestHeaders').click();
    const commonHeaderTable = contentPage.locator('.header-info .el-table').first();
    const parentRow = commonHeaderTable.locator('.el-table__body-wrapper tbody tr', { hasText: 'parent-value' }).first();
    const childRow = commonHeaderTable.locator('.el-table__body-wrapper tbody tr', { hasText: 'child-value' }).first();
    await expect(parentRow).toBeVisible({ timeout: 5000 });
    await expect(childRow).toBeVisible({ timeout: 5000 });
    // 验证父目录的请求头被标记为低优先级（有inactive-common-header样式）
    await expect(parentRow.locator('.inactive-common-header', { hasText: 'X-Override-Header' }).first()).toBeVisible({ timeout: 5000 });
    // 验证子目录的请求头没有被标记为低优先级
    await expect(childRow.locator('.inactive-common-header')).toHaveCount(0);
    // 设置请求URL并发送请求
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 切换到请求详情视图，验证子目录的公共请求头覆盖了父目录的
    await expect(contentPage.locator('[data-testid="response-tabs"]')).toBeVisible({ timeout: 10000 });
    await contentPage.locator('#tab-SRequestView').click();
    const requestInfo = contentPage.locator('.request-info');
    await expect(requestInfo).toBeVisible({ timeout: 10000 });
    await expect(requestInfo).toContainText('child-value', { timeout: 10000 });
    const requestText = await requestInfo.textContent();
    expect(requestText).not.toContain('parent-value');
  });
  // 测试用例8: 全局公共请求头对根目录HTTP节点生效
  test('全局公共请求头对根目录HTTP节点生效', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    // 清除缓存并登录
    await clearCache();
    await loginAccount();
    // 创建项目并进入工作台
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 右键点击树区域空白处，打开全局公共请求头设置
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    const contextMenu = contentPage.locator('.s-contextmenu');
    const commonHeaderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /设置公共请求头/ });
    const fetchCommonHeader = waitForCommonHeaderFetch(contentPage);
    await commonHeaderItem.click();
    await fetchCommonHeader;
    // 验证公共请求头配置页面成功打开
    const commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    // 添加全局公共请求头
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('X-Global-Header');
    await valueInputs.first().click();
    await contentPage.keyboard.type('global-value');
    // 保存全局公共请求头配置
    const confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    const saveCommonHeader = waitForCommonHeaderSave(contentPage);
    await confirmBtn.click();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    await saveCommonHeader;
    // 在根目录创建HTTP节点并发送请求
    await createNode(contentPage, { nodeType: 'http', name: '根目录接口' });
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 切换到请求详情视图，验证全局公共请求头生效
    await expect(contentPage.locator('[data-testid="response-tabs"]')).toBeVisible({ timeout: 10000 });
    await contentPage.locator('#tab-SRequestView').click();
    const requestInfo = contentPage.locator('.request-info');
    await expect(requestInfo).toBeVisible({ timeout: 10000 });
    await expect(requestInfo).toContainText('X-Global-Header', { timeout: 10000 });
    await expect(requestInfo).toContainText('global-value', { timeout: 10000 });
  });
  // 测试用例9: 全局公共请求头对目录下HTTP节点生效
  test('全局公共请求头对目录下HTTP节点生效', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    // 清除缓存并登录
    await clearCache();
    await loginAccount();
    // 创建项目并进入工作台
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 右键点击树区域空白处，打开全局公共请求头设置
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    const contextMenu = contentPage.locator('.s-contextmenu');
    const commonHeaderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /设置公共请求头/ });
    const fetchCommonHeader = waitForCommonHeaderFetch(contentPage);
    await commonHeaderItem.click();
    await fetchCommonHeader;
    // 验证公共请求头配置页面成功打开，并添加全局公共请求头
    const commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('X-Global-Header');
    await valueInputs.first().click();
    await contentPage.keyboard.type('global-value');
    // 保存全局公共请求头配置
    const confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    const saveCommonHeader = waitForCommonHeaderSave(contentPage);
    await confirmBtn.click();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    await saveCommonHeader;
    // 创建目录并在目录下创建HTTP节点
    const folderId = await createNode(contentPage, { nodeType: 'folder', name: '测试文件夹' });
    await createNode(contentPage, { nodeType: 'http', name: '文件夹内接口', pid: folderId });
    // 设置请求URL并发送请求
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 切换到请求详情视图，验证全局公共请求头在目录下的HTTP节点中生效
    await expect(contentPage.locator('[data-testid="response-tabs"]')).toBeVisible({ timeout: 10000 });
    await contentPage.locator('#tab-SRequestView').click();
    const requestInfo = contentPage.locator('.request-info');
    await expect(requestInfo).toBeVisible({ timeout: 10000 });
    await expect(requestInfo).toContainText('X-Global-Header', { timeout: 10000 });
    await expect(requestInfo).toContainText('global-value', { timeout: 10000 });
  });
  // 测试用例10: 全局、目录、自定义请求头优先级-相同key
  test('全局、目录、自定义请求头优先级-相同key', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    // 清除缓存并登录
    await clearCache();
    await loginAccount();
    // 创建项目并进入工作台
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 右键点击树区域空白处，设置全局公共请求头
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    const contextMenu = contentPage.locator('.s-contextmenu');
    let commonHeaderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /设置公共请求头/ });
    const fetchGlobalHeader = waitForCommonHeaderFetch(contentPage);
    await commonHeaderItem.click();
    await fetchGlobalHeader;
    // 添加全局公共请求头X-Priority-Test: global
    let commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    let keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    let valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('X-Priority-Test');
    await valueInputs.first().click();
    await contentPage.keyboard.type('global');
    let confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    const saveGlobalHeader = waitForCommonHeaderSave(contentPage);
    await confirmBtn.click();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    await saveGlobalHeader;
    // 创建目录并设置目录公共请求头X-Priority-Test: folder
    const folderId = await createNode(contentPage, { nodeType: 'folder', name: '测试文件夹' });
    const folderNode = contentPage.locator(`[data-test-node-id="${folderId}"]`);
    await folderNode.click({ button: 'right' });
    commonHeaderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /设置公共请求头/ });
    const fetchFolderHeader = waitForCommonHeaderFetch(contentPage);
    await commonHeaderItem.click();
    await fetchFolderHeader;
    commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('X-Priority-Test');
    await valueInputs.first().click();
    await contentPage.keyboard.type('folder');
    confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    const saveFolderHeader = waitForCommonHeaderSave(contentPage);
    await confirmBtn.click();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    await saveFolderHeader;
    // 在目录下创建HTTP节点并设置自定义请求头X-Priority-Test: custom
    await createNode(contentPage, { nodeType: 'http', name: '优先级测试', pid: folderId });
    await contentPage.locator('#tab-SRequestHeaders').click();
    const headerKeyInputs = contentPage.locator('.custom-header [data-testid="params-tree-key-input"]');
    const headerValueInputs = contentPage.locator('.custom-header [data-testid="params-tree-value-input"]');
    await headerKeyInputs.first().fill('X-Priority-Test');
    await headerValueInputs.first().click();
    await contentPage.keyboard.type('custom');
    await contentPage.waitForTimeout(500);
    // 在Headers标签页验证全局、目录、自定义三个请求头都显示，但全局和目录被标记为低优先级
    const commonHeaderTable = contentPage.locator('.header-info .el-table').first();
    const globalRow = commonHeaderTable.locator('.el-table__body-wrapper tbody tr', { hasText: 'global' }).first();
    const folderRow = commonHeaderTable.locator('.el-table__body-wrapper tbody tr', { hasText: 'folder' }).first();
    const customRow = commonHeaderTable.locator('.el-table__body-wrapper tbody tr', { hasText: 'custom' }).first();
    await expect(globalRow).toBeVisible({ timeout: 5000 });
    await expect(folderRow).toBeVisible({ timeout: 5000 });
    await expect(customRow).toBeVisible({ timeout: 5000 });
    await expect(globalRow.locator('.inactive-common-header', { hasText: 'X-Priority-Test' }).first()).toBeVisible({ timeout: 5000 });
    await expect(folderRow.locator('.inactive-common-header', { hasText: 'X-Priority-Test' }).first()).toBeVisible({ timeout: 5000 });
    await expect(customRow.locator('.inactive-common-header')).toHaveCount(0);
    // 发送请求并验证最终只使用了自定义请求头，全局和目录被覆盖
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    await expect(contentPage.locator('[data-testid="response-tabs"]')).toBeVisible({ timeout: 10000 });
    await contentPage.locator('#tab-SRequestView').click();
    const requestInfo = contentPage.locator('.request-info');
    await expect(requestInfo).toBeVisible({ timeout: 10000 });
    await expect(requestInfo).toContainText('custom', { timeout: 10000 });
    const requestText = await requestInfo.textContent();
    expect(requestText).not.toContain('global');
    expect(requestText).not.toContain('folder');
  });
  // 测试用例11: 全局、目录、自定义请求头优先级-不同key
  test('全局、目录、自定义请求头优先级-不同key', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    // 清除缓存并登录
    await clearCache();
    await loginAccount();
    // 创建项目并进入工作台
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 右键点击树区域空白处，设置全局公共请求头X-Global: global-value
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    const contextMenu = contentPage.locator('.s-contextmenu');
    let commonHeaderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /设置公共请求头/ });
    const fetchGlobalHeader = waitForCommonHeaderFetch(contentPage);
    await commonHeaderItem.click();
    await fetchGlobalHeader;
    let commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    let keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    let valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('X-Global');
    await valueInputs.first().click();
    await contentPage.keyboard.type('global-value');
    let confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    const saveGlobalHeader = waitForCommonHeaderSave(contentPage);
    await confirmBtn.click();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    await saveGlobalHeader;
    // 创建目录并设置目录公共请求头X-Folder: folder-value
    const folderId = await createNode(contentPage, { nodeType: 'folder', name: '测试文件夹' });
    const folderNode = contentPage.locator(`[data-test-node-id="${folderId}"]`);
    await folderNode.click({ button: 'right' });
    commonHeaderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /设置公共请求头/ });
    const fetchFolderHeader = waitForCommonHeaderFetch(contentPage);
    await commonHeaderItem.click();
    await fetchFolderHeader;
    commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('X-Folder');
    await valueInputs.first().click();
    await contentPage.keyboard.type('folder-value');
    confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    const saveFolderHeader = waitForCommonHeaderSave(contentPage);
    await confirmBtn.click();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    await saveFolderHeader;
    // 在目录下创建HTTP节点并设置自定义请求头X-Custom: custom-value
    await createNode(contentPage, { nodeType: 'http', name: '多key测试', pid: folderId });
    await contentPage.locator('#tab-SRequestHeaders').click();
    const headerKeyInputs = contentPage.locator('.custom-header [data-testid="params-tree-key-input"]');
    const headerValueInputs = contentPage.locator('.custom-header [data-testid="params-tree-value-input"]');
    await headerKeyInputs.first().fill('X-Custom');
    await headerValueInputs.first().click();
    await contentPage.keyboard.type('custom-value');
    await contentPage.waitForTimeout(500);
    // 发送请求并验证三个不同key的请求头同时生效
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    await expect(contentPage.locator('[data-testid="response-tabs"]')).toBeVisible({ timeout: 10000 });
    await contentPage.locator('#tab-SRequestView').click();
    const requestInfo = contentPage.locator('.request-info');
    await expect(requestInfo).toBeVisible({ timeout: 10000 });
    await expect(requestInfo).toContainText('X-Global', { timeout: 10000 });
    await expect(requestInfo).toContainText('global-value', { timeout: 10000 });
    await expect(requestInfo).toContainText('X-Folder', { timeout: 10000 });
    await expect(requestInfo).toContainText('folder-value', { timeout: 10000 });
    await expect(requestInfo).toContainText('X-Custom', { timeout: 10000 });
    await expect(requestInfo).toContainText('custom-value', { timeout: 10000 });
  });
  // 测试用例12: 嵌套目录时全局请求头的继承
  test('嵌套目录时全局请求头的继承', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    // 清除缓存并登录
    await clearCache();
    await loginAccount();
    // 创建项目并进入工作台
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 右键点击树区域空白处，设置全局公共请求头X-Global: global
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    const contextMenu = contentPage.locator('.s-contextmenu');
    let commonHeaderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /设置公共请求头/ });
    const fetchGlobalHeader = waitForCommonHeaderFetch(contentPage);
    await commonHeaderItem.click();
    await fetchGlobalHeader;
    let commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    let keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    let valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('X-Global');
    await valueInputs.first().click();
    await contentPage.keyboard.type('global');
    let confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    const saveGlobalHeader = waitForCommonHeaderSave(contentPage);
    await confirmBtn.click();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    await saveGlobalHeader;
    // 创建Level1目录并设置公共请求头X-Level1: level1
    const level1FolderId = await createNode(contentPage, { nodeType: 'folder', name: '目录Level1' });
    const level1Folder = contentPage.locator(`[data-test-node-id="${level1FolderId}"]`);
    await level1Folder.click({ button: 'right' });
    commonHeaderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /设置公共请求头/ });
    const fetchLevel1Header = waitForCommonHeaderFetch(contentPage);
    await commonHeaderItem.click();
    await fetchLevel1Header;
    commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('X-Level1');
    await valueInputs.first().click();
    await contentPage.keyboard.type('level1');
    confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    const saveLevel1Header = waitForCommonHeaderSave(contentPage);
    await confirmBtn.click();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    await saveLevel1Header;
    // 创建Level2目录并设置公共请求头X-Level2: level2
    const level2FolderId = await createNode(contentPage, { nodeType: 'folder', name: '目录Level2', pid: level1FolderId });
    const level2Folder = contentPage.locator(`[data-test-node-id="${level2FolderId}"]`);
    await level2Folder.click({ button: 'right' });
    commonHeaderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /设置公共请求头/ });
    const fetchLevel2Header = waitForCommonHeaderFetch(contentPage);
    await commonHeaderItem.click();
    await fetchLevel2Header;
    commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('X-Level2');
    await valueInputs.first().click();
    await contentPage.keyboard.type('level2');
    confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    const saveLevel2Header = waitForCommonHeaderSave(contentPage);
    await confirmBtn.click();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    await saveLevel2Header;
    // 创建Level3目录并设置公共请求头X-Level3: level3
    const level3FolderId = await createNode(contentPage, { nodeType: 'folder', name: '目录Level3', pid: level2FolderId });
    const level3Folder = contentPage.locator(`[data-test-node-id="${level3FolderId}"]`);
    await level3Folder.click({ button: 'right' });
    commonHeaderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /设置公共请求头/ });
    const fetchLevel3Header = waitForCommonHeaderFetch(contentPage);
    await commonHeaderItem.click();
    await fetchLevel3Header;
    commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('X-Level3');
    await valueInputs.first().click();
    await contentPage.keyboard.type('level3');
    confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    const saveLevel3Header = waitForCommonHeaderSave(contentPage);
    await confirmBtn.click();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    await saveLevel3Header;
    // 在最深层Level3目录下创建HTTP节点并发送请求
    await createNode(contentPage, { nodeType: 'http', name: '深层嵌套接口', pid: level3FolderId });
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证请求中包含全局和所有三层目录的公共请求头
    await expect(contentPage.locator('[data-testid="response-tabs"]')).toBeVisible({ timeout: 10000 });
    await contentPage.locator('#tab-SRequestView').click();
    const requestInfo = contentPage.locator('.request-info');
    await expect(requestInfo).toBeVisible({ timeout: 10000 });
    await expect(requestInfo).toContainText('X-Global', { timeout: 10000 });
    await expect(requestInfo).toContainText('global', { timeout: 10000 });
    await expect(requestInfo).toContainText('X-Level1', { timeout: 10000 });
    await expect(requestInfo).toContainText('level1', { timeout: 10000 });
    await expect(requestInfo).toContainText('X-Level2', { timeout: 10000 });
    await expect(requestInfo).toContainText('level2', { timeout: 10000 });
    await expect(requestInfo).toContainText('X-Level3', { timeout: 10000 });
    await expect(requestInfo).toContainText('level3', { timeout: 10000 });
  });
});

