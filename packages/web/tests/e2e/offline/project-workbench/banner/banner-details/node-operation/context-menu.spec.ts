import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('ContextMenu', () => {
  test.describe('空白区域右键菜单', () => {
    // 鼠标右键空白区域,出现新建接口,新建文件夹,设置公共请求头,粘贴节点(可能置灰)等功能
    test('鼠标右键空白区域,出现新建接口,新建文件夹,设置公共请求头,粘贴节点(可能置灰)等功能', async ({ contentPage, clearCache, createProject }) => {
      await clearCache();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      // 在空白区域右键
      const treeWrap = contentPage.locator('.tree-wrap');
      await expect(treeWrap).toBeVisible({ timeout: 5000 });
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      // 验证右键菜单出现
      const contextMenu = contentPage.locator('.s-contextmenu');
      await expect(contextMenu).toBeVisible({ timeout: 3000 });
      // 验证菜单项
      const newInterfaceItem = contextMenu.locator('.contextmenu-item', { hasText: /新建接口/ });
      await expect(newInterfaceItem).toBeVisible();
      const newFolderItem = contextMenu.locator('.contextmenu-item', { hasText: /新建文件夹/ });
      await expect(newFolderItem).toBeVisible();
      const commonHeaderItem = contextMenu.locator('.contextmenu-item', { hasText: /设置公共请求头/ });
      await expect(commonHeaderItem).toBeVisible();
      const pasteItem = contextMenu.locator('.contextmenu-item', { hasText: /粘贴/ });
      await expect(pasteItem).toBeVisible();
      // 验证不显示剪切、复制、重命名、删除选项
      const cutItem = contextMenu.locator('.contextmenu-item', { hasText: /^剪切$/ });
      await expect(cutItem).toBeHidden();
      const copyItem = contextMenu.locator('.contextmenu-item', { hasText: /^复制$/ });
      await expect(copyItem).toBeHidden();
      const renameItem = contextMenu.locator('.contextmenu-item', { hasText: /重命名/ });
      await expect(renameItem).toBeHidden();
      const deleteItem = contextMenu.locator('.contextmenu-item', { hasText: /删除/ });
      await expect(deleteItem).toBeHidden();
    });
    // 鼠标右键空白区域,点击新建接口,成功后在根节点末尾生成节点
    test('鼠标右键空白区域,点击新建接口,成功后在根节点末尾生成节点', async ({ contentPage, clearCache, createProject }) => {
      await clearCache();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      // 在空白区域右键
      const treeWrap = contentPage.locator('.tree-wrap');
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      // 点击新建接口
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newInterfaceItem = contextMenu.locator('.contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      // 填写接口信息
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('新建HTTP接口');
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 验证对话框关闭
      await expect(addFileDialog).toBeHidden({ timeout: 5000 });
      // 验证新节点出现在树中
      const newNode = contentPage.locator('.el-tree-node').filter({ hasText: '新建HTTP接口' });
      await expect(newNode).toBeVisible({ timeout: 5000 });
    });
    // 鼠标右键空白区域,点击新建文件夹,成功后在根节点最后一个目录节点下面生成目录节点
    test('鼠标右键空白区域,点击新建文件夹,成功后在根节点最后一个目录节点下面生成目录节点', async ({ contentPage, clearCache, createProject }) => {
      await clearCache();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      // 在空白区域右键
      const treeWrap = contentPage.locator('.tree-wrap');
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      // 点击新建文件夹
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newFolderItem = contextMenu.locator('.contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem.click();
      await contentPage.waitForTimeout(300);
      // 填写文件夹信息
      const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      await expect(folderDialog).toBeVisible({ timeout: 5000 });
      const folderNameInput = folderDialog.locator('input').first();
      await folderNameInput.fill('新建文件夹');
      const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
      await folderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 验证文件夹创建成功
      const folderNode = contentPage.locator('.el-tree-node').filter({ hasText: '新建文件夹' });
      await expect(folderNode).toBeVisible({ timeout: 5000 });
    });
    // 鼠标右键空白区域,点击设置公共请求头,导航区域增加公共请求头标签,内容区域出现公共请求头设置内容
    test('鼠标右键空白区域,点击设置公共请求头,导航区域增加公共请求头标签', async ({ contentPage, clearCache, createProject }) => {
      await clearCache();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      // 在空白区域右键
      const treeWrap = contentPage.locator('.tree-wrap');
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      // 点击设置公共请求头
      const contextMenu = contentPage.locator('.s-contextmenu');
      const commonHeaderItem = contextMenu.locator('.contextmenu-item', { hasText: /设置公共请求头/ });
      await commonHeaderItem.click();
      await contentPage.waitForTimeout(500);
      // 验证导航区域增加公共请求头标签
      const commonHeaderTab = contentPage.locator('.s-nav').locator('.nav-item', { hasText: /公共请求头/ });
      await expect(commonHeaderTab).toBeVisible({ timeout: 5000 });
    });
    // 鼠标右键空白区域,点击粘贴,可以粘贴节点
    test('鼠标右键空白区域,点击粘贴,可以粘贴节点', async ({ contentPage, clearCache, createProject }) => {
      await clearCache();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 先创建一个HTTP节点
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newInterfaceItem = contextMenu.locator('.contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('源节点');
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 复制该节点
      const sourceNode = contentPage.locator('.el-tree-node').filter({ hasText: '源节点' });
      await sourceNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const copyItem = contentPage.locator('.s-contextmenu .contextmenu-item', { hasText: /复制/ }).first();
      await copyItem.click();
      await contentPage.waitForTimeout(300);
      // 在空白区域右键粘贴
      await treeWrap.click({ button: 'right', position: { x: 100, y: 300 } });
      await contentPage.waitForTimeout(300);
      const pasteItem = contentPage.locator('.s-contextmenu .contextmenu-item', { hasText: /粘贴/ });
      await expect(pasteItem).toBeVisible();
      await pasteItem.click();
      await contentPage.waitForTimeout(500);
      // 验证粘贴成功,出现两个源节点
      const allSourceNodes = contentPage.locator('.el-tree-node').filter({ hasText: '源节点' });
      await expect(allSourceNodes).toHaveCount(2, { timeout: 5000 });
    });
  });
  test.describe('Folder节点右键菜单', () => {
    // 鼠标右键folder节点,出现新建接口,新建文件夹,设置公共请求头,剪切,复制,粘贴(可能置灰),重命名,删除等功能
    test('鼠标右键folder节点,出现新建接口,新建文件夹,设置公共请求头,剪切,复制,粘贴,重命名,删除等功能', async ({ contentPage, clearCache, createProject }) => {
      await clearCache();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 先创建一个文件夹
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newFolderItem = contextMenu.locator('.contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem.click();
      await contentPage.waitForTimeout(300);
      const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      await expect(folderDialog).toBeVisible({ timeout: 5000 });
      const folderNameInput = folderDialog.locator('input').first();
      await folderNameInput.fill('测试文件夹');
      const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
      await folderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 右键文件夹节点
      const folderNode = contentPage.locator('.el-tree-node').filter({ hasText: '测试文件夹' });
      await folderNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      // 验证菜单项
      const folderContextMenu = contentPage.locator('.s-contextmenu');
      const newInterfaceInFolder = folderContextMenu.locator('.contextmenu-item', { hasText: /新建接口/ });
      await expect(newInterfaceInFolder).toBeVisible();
      const newFolderInFolder = folderContextMenu.locator('.contextmenu-item', { hasText: /新建文件夹/ });
      await expect(newFolderInFolder).toBeVisible();
      const commonHeaderInFolder = folderContextMenu.locator('.contextmenu-item', { hasText: /设置公共请求头/ });
      await expect(commonHeaderInFolder).toBeVisible();
      const cutItem = folderContextMenu.locator('.contextmenu-item', { hasText: /剪切/ });
      await expect(cutItem).toBeVisible();
      const copyItem = folderContextMenu.locator('.contextmenu-item', { hasText: /复制/ }).first();
      await expect(copyItem).toBeVisible();
      const pasteItem = folderContextMenu.locator('.contextmenu-item', { hasText: /粘贴/ });
      await expect(pasteItem).toBeVisible();
      const renameItem = folderContextMenu.locator('.contextmenu-item', { hasText: /重命名/ });
      await expect(renameItem).toBeVisible();
      const deleteItem = folderContextMenu.locator('.contextmenu-item', { hasText: /删除/ });
      await expect(deleteItem).toBeVisible();
    });
    // 鼠标右键folder节点,点击新建接口,成功后在当前folder内生成节点,并且生成的节点排在末尾
    test('鼠标右键folder节点,点击新建接口,成功后在当前folder内生成节点', async ({ contentPage, clearCache, createProject }) => {
      await clearCache();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 先创建一个文件夹
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newFolderItem = contextMenu.locator('.contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem.click();
      await contentPage.waitForTimeout(300);
      const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      await expect(folderDialog).toBeVisible({ timeout: 5000 });
      const folderNameInput = folderDialog.locator('input').first();
      await folderNameInput.fill('测试文件夹');
      const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
      await folderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 右键文件夹节点
      const folderNode = contentPage.locator('.el-tree-node').filter({ hasText: '测试文件夹' });
      await folderNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      // 点击新建接口
      const newInterfaceItem = contentPage.locator('.s-contextmenu .contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      // 填写接口信息
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('文件夹内HTTP接口');
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 验证新节点出现在文件夹下
      const expandedFolder = contentPage.locator('.el-tree-node.is-expanded').filter({ hasText: '测试文件夹' });
      await expect(expandedFolder).toBeVisible({ timeout: 5000 });
      const childNode = expandedFolder.locator('.el-tree-node').filter({ hasText: '文件夹内HTTP接口' });
      await expect(childNode).toBeVisible({ timeout: 5000 });
    });
    // 鼠标右键folder节点,点击新建文件夹,成功后在当前folder内生成节点
    test('鼠标右键folder节点,点击新建文件夹,成功后在当前folder内生成节点', async ({ contentPage, clearCache, createProject }) => {
      await clearCache();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 先创建一个文件夹
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newFolderItem = contextMenu.locator('.contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem.click();
      await contentPage.waitForTimeout(300);
      const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      await expect(folderDialog).toBeVisible({ timeout: 5000 });
      const folderNameInput = folderDialog.locator('input').first();
      await folderNameInput.fill('父文件夹');
      const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
      await folderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 右键文件夹节点
      const folderNode = contentPage.locator('.el-tree-node').filter({ hasText: '父文件夹' });
      await folderNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      // 点击新建文件夹
      const newChildFolderItem = contentPage.locator('.s-contextmenu .contextmenu-item', { hasText: /新建文件夹/ });
      await newChildFolderItem.click();
      await contentPage.waitForTimeout(300);
      // 填写子文件夹信息
      const childFolderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      await expect(childFolderDialog).toBeVisible({ timeout: 5000 });
      const childFolderNameInput = childFolderDialog.locator('input').first();
      await childFolderNameInput.fill('子文件夹');
      const childFolderConfirmBtn = childFolderDialog.locator('.el-button--primary').last();
      await childFolderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 验证子文件夹出现在父文件夹下
      const expandedFolder = contentPage.locator('.el-tree-node.is-expanded').filter({ hasText: '父文件夹' });
      await expect(expandedFolder).toBeVisible({ timeout: 5000 });
      const childFolder = expandedFolder.locator('.el-tree-node').filter({ hasText: '子文件夹' });
      await expect(childFolder).toBeVisible({ timeout: 5000 });
    });
    // 鼠标右键folder节点,点击设置公共请求头,导航区域增加公共请求头标签
    test('鼠标右键folder节点,点击设置公共请求头,导航区域增加公共请求头标签', async ({ contentPage, clearCache, createProject }) => {
      await clearCache();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 先创建一个文件夹
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newFolderItem = contextMenu.locator('.contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem.click();
      await contentPage.waitForTimeout(300);
      const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      await expect(folderDialog).toBeVisible({ timeout: 5000 });
      const folderNameInput = folderDialog.locator('input').first();
      await folderNameInput.fill('测试文件夹');
      const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
      await folderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 右键文件夹节点
      const folderNode = contentPage.locator('.el-tree-node').filter({ hasText: '测试文件夹' });
      await folderNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      // 点击设置公共请求头
      const commonHeaderItem = contentPage.locator('.s-contextmenu .contextmenu-item', { hasText: /设置公共请求头/ });
      await commonHeaderItem.click();
      await contentPage.waitForTimeout(500);
      // 验证导航区域增加公共请求头标签
      const commonHeaderTab = contentPage.locator('.s-nav').locator('.nav-item', { hasText: /公共请求头/ });
      await expect(commonHeaderTab).toBeVisible({ timeout: 5000 });
    });
    // 鼠标右键folder节点,点击剪切,被剪切节点样式发生改变,点击粘贴可以粘贴节点
    test('鼠标右键folder节点,点击剪切,被剪切节点样式发生改变,粘贴可以移动节点', async ({ contentPage, clearCache, createProject }) => {
      await clearCache();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 先创建一个文件夹
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newFolderItem = contextMenu.locator('.contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem.click();
      await contentPage.waitForTimeout(300);
      const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      await expect(folderDialog).toBeVisible({ timeout: 5000 });
      const folderNameInput = folderDialog.locator('input').first();
      await folderNameInput.fill('源文件夹');
      const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
      await folderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 创建目标文件夹
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newFolderItem2 = contentPage.locator('.s-contextmenu .contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem2.click();
      await contentPage.waitForTimeout(300);
      const folderDialog2 = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      await expect(folderDialog2).toBeVisible({ timeout: 5000 });
      const folderNameInput2 = folderDialog2.locator('input').first();
      await folderNameInput2.fill('目标文件夹');
      const folderConfirmBtn2 = folderDialog2.locator('.el-button--primary').last();
      await folderConfirmBtn2.click();
      await contentPage.waitForTimeout(500);
      // 右键源文件夹,点击剪切
      const sourceFolderNode = contentPage.locator('.el-tree-node').filter({ hasText: '源文件夹' });
      await sourceFolderNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const cutItem = contentPage.locator('.s-contextmenu .contextmenu-item', { hasText: /剪切/ });
      await cutItem.click();
      await contentPage.waitForTimeout(300);
      // 验证被剪切节点有特殊样式
      const cutNode = contentPage.locator('.el-tree-node.is-cut').filter({ hasText: '源文件夹' });
      await expect(cutNode).toBeVisible({ timeout: 5000 });
      // 右键目标文件夹,点击粘贴
      const targetFolderNode = contentPage.locator('.el-tree-node').filter({ hasText: '目标文件夹' });
      await targetFolderNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const pasteItem = contentPage.locator('.s-contextmenu .contextmenu-item', { hasText: /粘贴/ });
      await pasteItem.click();
      await contentPage.waitForTimeout(500);
      // 验证源文件夹移动到目标文件夹内
      const expandedFolder = contentPage.locator('.el-tree-node.is-expanded').filter({ hasText: '目标文件夹' });
      await expect(expandedFolder).toBeVisible({ timeout: 5000 });
      const movedFolder = expandedFolder.locator('.el-tree-node').filter({ hasText: '源文件夹' });
      await expect(movedFolder).toBeVisible({ timeout: 5000 });
    });
    // 鼠标右键folder节点,点击复制,点击粘贴可以粘贴节点
    test('鼠标右键folder节点,点击复制,粘贴可以复制节点', async ({ contentPage, clearCache, createProject }) => {
      await clearCache();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 先创建一个文件夹
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newFolderItem = contextMenu.locator('.contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem.click();
      await contentPage.waitForTimeout(300);
      const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      await expect(folderDialog).toBeVisible({ timeout: 5000 });
      const folderNameInput = folderDialog.locator('input').first();
      await folderNameInput.fill('源文件夹');
      const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
      await folderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 右键源文件夹,点击复制
      const sourceFolderNode = contentPage.locator('.el-tree-node').filter({ hasText: '源文件夹' });
      await sourceFolderNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const copyItem = contentPage.locator('.s-contextmenu .contextmenu-item', { hasText: /复制/ }).first();
      await copyItem.click();
      await contentPage.waitForTimeout(300);
      // 在空白区域右键粘贴
      await treeWrap.click({ button: 'right', position: { x: 100, y: 300 } });
      await contentPage.waitForTimeout(300);
      const pasteItem = contentPage.locator('.s-contextmenu .contextmenu-item', { hasText: /粘贴/ });
      await pasteItem.click();
      await contentPage.waitForTimeout(500);
      // 验证出现两个源文件夹
      const allSourceFolders = contentPage.locator('.el-tree-node').filter({ hasText: '源文件夹' });
      await expect(allSourceFolders).toHaveCount(2, { timeout: 5000 });
    });
    // 鼠标右键folder节点,点击重命名(或f2),可以正常重命名
    test('鼠标右键folder节点,点击重命名,可以正常重命名', async ({ contentPage, clearCache, createProject }) => {
      await clearCache();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 先创建一个文件夹
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newFolderItem = contextMenu.locator('.contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem.click();
      await contentPage.waitForTimeout(300);
      const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      await expect(folderDialog).toBeVisible({ timeout: 5000 });
      const folderNameInput = folderDialog.locator('input').first();
      await folderNameInput.fill('原文件夹名称');
      const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
      await folderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 右键文件夹,点击重命名
      const folderNode = contentPage.locator('.el-tree-node').filter({ hasText: '原文件夹名称' });
      await folderNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const renameItem = contentPage.locator('.s-contextmenu .contextmenu-item', { hasText: /重命名/ });
      await renameItem.click();
      await contentPage.waitForTimeout(300);
      // 验证输入框出现
      const renameInput = folderNode.locator('input');
      await expect(renameInput).toBeVisible({ timeout: 5000 });
      // 清空并输入新名称
      await renameInput.fill('新文件夹名称');
      await contentPage.keyboard.press('Enter');
      await contentPage.waitForTimeout(500);
      // 验证重命名成功
      const renamedFolder = contentPage.locator('.el-tree-node').filter({ hasText: '新文件夹名称' });
      await expect(renamedFolder).toBeVisible({ timeout: 5000 });
      const oldFolder = contentPage.locator('.el-tree-node').filter({ hasText: '原文件夹名称' });
      await expect(oldFolder).toBeHidden();
    });
    // 鼠标右键folder节点,点击删除(或delete),可以正常删除目录
    test('鼠标右键folder节点,点击删除,可以正常删除目录', async ({ contentPage, clearCache, createProject }) => {
      await clearCache();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 先创建一个文件夹
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newFolderItem = contextMenu.locator('.contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem.click();
      await contentPage.waitForTimeout(300);
      const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      await expect(folderDialog).toBeVisible({ timeout: 5000 });
      const folderNameInput = folderDialog.locator('input').first();
      await folderNameInput.fill('待删除文件夹');
      const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
      await folderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 验证文件夹存在
      const folderNode = contentPage.locator('.el-tree-node').filter({ hasText: '待删除文件夹' });
      await expect(folderNode).toBeVisible({ timeout: 5000 });
      // 右键文件夹,点击删除
      await folderNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const deleteItem = contentPage.locator('.s-contextmenu .contextmenu-item', { hasText: /删除/ });
      await deleteItem.click();
      await contentPage.waitForTimeout(300);
      // 确认删除对话框
      const confirmDialog = contentPage.locator('.el-message-box');
      await expect(confirmDialog).toBeVisible({ timeout: 5000 });
      const confirmBtn = confirmDialog.locator('.el-button--primary');
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 验证文件夹被删除
      const deletedFolder = contentPage.locator('.el-tree-node').filter({ hasText: '待删除文件夹' });
      await expect(deletedFolder).toBeHidden({ timeout: 5000 });
    });
  });
  test.describe('非Folder节点右键菜单', () => {
    // 鼠标右键非folder节点,出现剪切,复制,生成副本,重命名,删除等功能
    test('鼠标右键非folder节点,出现剪切,复制,生成副本,重命名,删除等功能', async ({ contentPage, clearCache, createProject }) => {
      await clearCache();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 先创建一个HTTP节点
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newInterfaceItem = contextMenu.locator('.contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('测试HTTP节点');
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 右键HTTP节点
      const httpNode = contentPage.locator('.el-tree-node').filter({ hasText: '测试HTTP节点' });
      await httpNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      // 验证菜单项
      const nodeContextMenu = contentPage.locator('.s-contextmenu');
      const cutItem = nodeContextMenu.locator('.contextmenu-item', { hasText: /剪切/ });
      await expect(cutItem).toBeVisible();
      const copyItem = nodeContextMenu.locator('.contextmenu-item', { hasText: /复制/ }).first();
      await expect(copyItem).toBeVisible();
      const forkItem = nodeContextMenu.locator('.contextmenu-item', { hasText: /生成副本/ });
      await expect(forkItem).toBeVisible();
      const renameItem = nodeContextMenu.locator('.contextmenu-item', { hasText: /重命名/ });
      await expect(renameItem).toBeVisible();
      const deleteItem = nodeContextMenu.locator('.contextmenu-item', { hasText: /删除/ });
      await expect(deleteItem).toBeVisible();
      // 验证不显示新建接口、新建文件夹、粘贴选项
      const newInterfaceInNode = nodeContextMenu.locator('.contextmenu-item', { hasText: /新建接口/ });
      await expect(newInterfaceInNode).toBeHidden();
      const newFolderInNode = nodeContextMenu.locator('.contextmenu-item', { hasText: /新建文件夹/ });
      await expect(newFolderInNode).toBeHidden();
    });
    // 鼠标右键非folder节点,点击剪切,被剪切节点样式发生改变,粘贴可以移动节点
    test('鼠标右键非folder节点,点击剪切,被剪切节点样式发生改变,粘贴可以移动节点', async ({ contentPage, clearCache, createProject }) => {
      await clearCache();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 创建目标文件夹
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newFolderItem = contextMenu.locator('.contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem.click();
      await contentPage.waitForTimeout(300);
      const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      await expect(folderDialog).toBeVisible({ timeout: 5000 });
      const folderNameInput = folderDialog.locator('input').first();
      await folderNameInput.fill('目标文件夹');
      const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
      await folderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 创建HTTP节点
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newInterfaceItem = contentPage.locator('.s-contextmenu .contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('源HTTP节点');
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 右键HTTP节点,点击剪切
      const httpNode = contentPage.locator('.el-tree-node').filter({ hasText: '源HTTP节点' });
      await httpNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const cutItem = contentPage.locator('.s-contextmenu .contextmenu-item', { hasText: /剪切/ });
      await cutItem.click();
      await contentPage.waitForTimeout(300);
      // 验证被剪切节点有特殊样式
      const cutNode = contentPage.locator('.el-tree-node.is-cut').filter({ hasText: '源HTTP节点' });
      await expect(cutNode).toBeVisible({ timeout: 5000 });
      // 右键目标文件夹,点击粘贴
      const targetFolderNode = contentPage.locator('.el-tree-node').filter({ hasText: '目标文件夹' });
      await targetFolderNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const pasteItem = contentPage.locator('.s-contextmenu .contextmenu-item', { hasText: /粘贴/ });
      await pasteItem.click();
      await contentPage.waitForTimeout(500);
      // 验证HTTP节点移动到目标文件夹内
      const expandedFolder = contentPage.locator('.el-tree-node.is-expanded').filter({ hasText: '目标文件夹' });
      await expect(expandedFolder).toBeVisible({ timeout: 5000 });
      const movedNode = expandedFolder.locator('.el-tree-node').filter({ hasText: '源HTTP节点' });
      await expect(movedNode).toBeVisible({ timeout: 5000 });
    });
    // 鼠标右键非folder节点,点击复制,粘贴可以复制节点
    test('鼠标右键非folder节点,点击复制,粘贴可以复制节点', async ({ contentPage, clearCache, createProject }) => {
      await clearCache();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 创建HTTP节点
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newInterfaceItem = contextMenu.locator('.contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('源HTTP节点');
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 右键HTTP节点,点击复制
      const httpNode = contentPage.locator('.el-tree-node').filter({ hasText: '源HTTP节点' });
      await httpNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const copyItem = contentPage.locator('.s-contextmenu .contextmenu-item', { hasText: /复制/ }).first();
      await copyItem.click();
      await contentPage.waitForTimeout(300);
      // 在空白区域右键粘贴
      await treeWrap.click({ button: 'right', position: { x: 100, y: 300 } });
      await contentPage.waitForTimeout(300);
      const pasteItem = contentPage.locator('.s-contextmenu .contextmenu-item', { hasText: /粘贴/ });
      await pasteItem.click();
      await contentPage.waitForTimeout(500);
      // 验证出现两个源HTTP节点
      const allSourceNodes = contentPage.locator('.el-tree-node').filter({ hasText: '源HTTP节点' });
      await expect(allSourceNodes).toHaveCount(2, { timeout: 5000 });
    });
    // 鼠标右键非folder节点,点击生成副本,可以在当前节点后面生成副本节点
    test('鼠标右键非folder节点,点击生成副本,可以在当前节点后面生成副本节点', async ({ contentPage, clearCache, createProject }) => {
      await clearCache();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 创建HTTP节点
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newInterfaceItem = contextMenu.locator('.contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('源HTTP节点');
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 右键HTTP节点,点击生成副本
      const httpNode = contentPage.locator('.el-tree-node').filter({ hasText: '源HTTP节点' });
      await httpNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const forkItem = contentPage.locator('.s-contextmenu .contextmenu-item', { hasText: /生成副本/ });
      await forkItem.click();
      await contentPage.waitForTimeout(500);
      // 验证出现两个源HTTP节点
      const allSourceNodes = contentPage.locator('.el-tree-node').filter({ hasText: '源HTTP节点' });
      await expect(allSourceNodes).toHaveCount(2, { timeout: 5000 });
    });
    // 鼠标右键非folder节点,点击重命名(或f2),可以正常重命名
    test('鼠标右键非folder节点,点击重命名,可以正常重命名', async ({ contentPage, clearCache, createProject }) => {
      await clearCache();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 创建HTTP节点
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newInterfaceItem = contextMenu.locator('.contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('原节点名称');
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 右键HTTP节点,点击重命名
      const httpNode = contentPage.locator('.el-tree-node').filter({ hasText: '原节点名称' });
      await httpNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const renameItem = contentPage.locator('.s-contextmenu .contextmenu-item', { hasText: /重命名/ });
      await renameItem.click();
      await contentPage.waitForTimeout(300);
      // 验证输入框出现
      const renameInput = httpNode.locator('input');
      await expect(renameInput).toBeVisible({ timeout: 5000 });
      // 清空并输入新名称
      await renameInput.fill('新节点名称');
      await contentPage.keyboard.press('Enter');
      await contentPage.waitForTimeout(500);
      // 验证重命名成功
      const renamedNode = contentPage.locator('.el-tree-node').filter({ hasText: '新节点名称' });
      await expect(renamedNode).toBeVisible({ timeout: 5000 });
      const oldNode = contentPage.locator('.el-tree-node').filter({ hasText: '原节点名称' });
      await expect(oldNode).toBeHidden();
    });
    // 鼠标右键非folder节点,点击删除(或delete),可以正常删除节点
    test('鼠标右键非folder节点,点击删除,可以正常删除节点', async ({ contentPage, clearCache, createProject }) => {
      await clearCache();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 创建HTTP节点
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newInterfaceItem = contextMenu.locator('.contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('待删除节点');
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 验证节点存在
      const httpNode = contentPage.locator('.el-tree-node').filter({ hasText: '待删除节点' });
      await expect(httpNode).toBeVisible({ timeout: 5000 });
      // 右键HTTP节点,点击删除
      await httpNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const deleteItem = contentPage.locator('.s-contextmenu .contextmenu-item', { hasText: /删除/ });
      await deleteItem.click();
      await contentPage.waitForTimeout(300);
      // 确认删除对话框
      const confirmDialog = contentPage.locator('.el-message-box');
      await expect(confirmDialog).toBeVisible({ timeout: 5000 });
      const confirmDeleteBtn = confirmDialog.locator('.el-button--primary');
      await confirmDeleteBtn.click();
      await contentPage.waitForTimeout(500);
      // 验证节点被删除
      const deletedNode = contentPage.locator('.el-tree-node').filter({ hasText: '待删除节点' });
      await expect(deletedNode).toBeHidden({ timeout: 5000 });
    });
  });
});
