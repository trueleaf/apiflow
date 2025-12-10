import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('OtherCases', () => {
  // 在根节点新增,粘贴非folder节点,会排序在末尾
  test('在根节点新增/粘贴非folder节点,会排序在末尾', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const treeWrap = contentPage.locator('.tree-wrap');
    // 首先创建一个文件夹
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
    // 创建第一个HTTP节点
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const newInterfaceItem1 = contentPage.locator('.s-contextmenu .contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem1.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog1 = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
    await expect(addFileDialog1).toBeVisible({ timeout: 5000 });
    const nameInput1 = addFileDialog1.locator('input').first();
    await nameInput1.fill('HTTP节点1');
    const confirmBtn1 = addFileDialog1.locator('.el-button--primary').last();
    await confirmBtn1.click();
    await contentPage.waitForTimeout(500);
    // 创建第二个HTTP节点
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const newInterfaceItem2 = contentPage.locator('.s-contextmenu .contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem2.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog2 = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
    await expect(addFileDialog2).toBeVisible({ timeout: 5000 });
    const nameInput2 = addFileDialog2.locator('input').first();
    await nameInput2.fill('HTTP节点2');
    const confirmBtn2 = addFileDialog2.locator('.el-button--primary').last();
    await confirmBtn2.click();
    await contentPage.waitForTimeout(500);
    // 获取所有根节点
    const treeNodes = contentPage.locator('.el-tree > .el-tree-node');
    const nodeCount = await treeNodes.count();
    // 验证文件夹在前，HTTP节点在后
    // 第一个应该是文件夹
    const firstNode = treeNodes.nth(0);
    await expect(firstNode).toContainText('测试文件夹');
    // 最后一个应该是最新创建的HTTP节点2
    const lastNode = treeNodes.nth(nodeCount - 1);
    await expect(lastNode).toContainText('HTTP节点2');
  });
  // 在根节点新增,粘贴folder节点,会排序到根目录下最后一个目录节点下面
  test('在根节点新增/粘贴folder节点,会排序到根目录下最后一个目录节点下面', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const treeWrap = contentPage.locator('.tree-wrap');
    // 首先创建一个HTTP节点
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const newInterfaceItem = contentPage.locator('.s-contextmenu .contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('HTTP节点');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 创建第一个文件夹
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const newFolderItem1 = contentPage.locator('.s-contextmenu .contextmenu-item', { hasText: /新建文件夹/ });
    await newFolderItem1.click();
    await contentPage.waitForTimeout(300);
    const folderDialog1 = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
    await expect(folderDialog1).toBeVisible({ timeout: 5000 });
    const folderNameInput1 = folderDialog1.locator('input').first();
    await folderNameInput1.fill('文件夹1');
    const folderConfirmBtn1 = folderDialog1.locator('.el-button--primary').last();
    await folderConfirmBtn1.click();
    await contentPage.waitForTimeout(500);
    // 创建第二个文件夹
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const newFolderItem2 = contentPage.locator('.s-contextmenu .contextmenu-item', { hasText: /新建文件夹/ });
    await newFolderItem2.click();
    await contentPage.waitForTimeout(300);
    const folderDialog2 = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
    await expect(folderDialog2).toBeVisible({ timeout: 5000 });
    const folderNameInput2 = folderDialog2.locator('input').first();
    await folderNameInput2.fill('文件夹2');
    const folderConfirmBtn2 = folderDialog2.locator('.el-button--primary').last();
    await folderConfirmBtn2.click();
    await contentPage.waitForTimeout(500);
    // 获取所有根节点
    const treeNodes = contentPage.locator('.el-tree > .el-tree-node');
    const nodeCount = await treeNodes.count();
    // 验证文件夹在前，HTTP节点在后
    // 前两个应该是文件夹
    const firstNode = treeNodes.nth(0);
    await expect(firstNode).toContainText('文件夹');
    const secondNode = treeNodes.nth(1);
    await expect(secondNode).toContainText('文件夹');
    // 最后一个应该是HTTP节点
    const lastNode = treeNodes.nth(nodeCount - 1);
    await expect(lastNode).toContainText('HTTP节点');
  });
  // 在根节点粘贴包含folder节点的混合节点,folder节点会排序到根目录下最后一个目录节点下面,非folder节点会排序在末尾
  test('在根节点粘贴包含folder节点的混合节点,folder排序到文件夹区域,非folder排序在末尾', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const treeWrap = contentPage.locator('.tree-wrap');
    // 创建一个文件夹
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const newFolderItem = contentPage.locator('.s-contextmenu .contextmenu-item', { hasText: /新建文件夹/ });
    await newFolderItem.click();
    await contentPage.waitForTimeout(300);
    const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
    await expect(folderDialog).toBeVisible({ timeout: 5000 });
    const folderNameInput = folderDialog.locator('input').first();
    await folderNameInput.fill('源文件夹');
    const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
    await folderConfirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 创建一个HTTP节点
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
    // 多选节点：先点击文件夹，然后Ctrl+点击HTTP节点
    const folderNode = contentPage.locator('.el-tree-node').filter({ hasText: '源文件夹' });
    await folderNode.click();
    await contentPage.waitForTimeout(200);
    await contentPage.keyboard.down('Control');
    const httpNode = contentPage.locator('.el-tree-node').filter({ hasText: '源HTTP节点' });
    await httpNode.click();
    await contentPage.keyboard.up('Control');
    await contentPage.waitForTimeout(300);
    // 右键批量复制
    await folderNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const batchCopyItem = contentPage.locator('.s-contextmenu .contextmenu-item', { hasText: /批量复制/ });
    await expect(batchCopyItem).toBeVisible();
    await batchCopyItem.click();
    await contentPage.waitForTimeout(300);
    // 在空白区域右键粘贴
    await treeWrap.click({ button: 'right', position: { x: 100, y: 400 } });
    await contentPage.waitForTimeout(300);
    const pasteItem = contentPage.locator('.s-contextmenu .contextmenu-item', { hasText: /粘贴/ });
    await pasteItem.click();
    await contentPage.waitForTimeout(500);
    // 获取所有根节点
    const treeNodes = contentPage.locator('.el-tree > .el-tree-node');
    const nodeCount = await treeNodes.count();
    // 验证粘贴后有4个节点（2个文件夹 + 2个HTTP节点）
    await expect(treeNodes).toHaveCount(4, { timeout: 5000 });
    // 验证文件夹在前两位
    const firstNode = treeNodes.nth(0);
    const secondNode = treeNodes.nth(1);
    await expect(firstNode).toContainText('源文件夹');
    await expect(secondNode).toContainText('源文件夹');
    // 验证HTTP节点在后两位
    const thirdNode = treeNodes.nth(2);
    const fourthNode = treeNodes.nth(3);
    await expect(thirdNode).toContainText('源HTTP节点');
    await expect(fourthNode).toContainText('源HTTP节点');
  });
});
