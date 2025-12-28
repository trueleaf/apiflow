import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

test.describe('MoveNode', () => {
  test.describe('移动单个httpNode节点', () => {
    // 拖拽单个httpNode节点到banner空白区域,移动到根节点下
    test('拖拽单个httpNode节点到banner空白区域,移动到根节点下', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 先创建一个文件夹
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
      // 在文件夹中创建httpNode节点
      const folderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '测试文件夹' });
      await folderNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('测试HTTP节点');
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 展开文件夹查看节点
      const folderTreeNode = folderNode.locator('xpath=ancestor::div[contains(@class,"el-tree-node")][1]');
      await expect(folderTreeNode).toBeVisible({ timeout: 5000 });
      const isExpanded = await folderTreeNode.evaluate(el => el.classList.contains('is-expanded'));
      if (!isExpanded) {
        const expandIcon = folderTreeNode.locator('.el-tree-node__expand-icon').first();
        await expandIcon.click();
        await contentPage.waitForTimeout(300);
      }
      // 拖拽httpNode到空白区域
      const httpNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '测试HTTP节点' });
      const httpNodeBox = await httpNode.boundingBox();
      const treeBox = await treeWrap.boundingBox();
      if (httpNodeBox && treeBox) {
        await contentPage.mouse.move(httpNodeBox.x + httpNodeBox.width / 2, httpNodeBox.y + httpNodeBox.height / 2);
        await contentPage.mouse.down();
        await contentPage.mouse.move(treeBox.x + 100, treeBox.y + treeBox.height - 50);
        await contentPage.mouse.up();
      }
      await contentPage.waitForTimeout(500);
      // 验证节点移动到根节点下
      const rootHttpNode = treeWrap.locator('> .el-tree > .el-tree-node').filter({ hasText: '测试HTTP节点' });
      await expect(rootHttpNode).toBeVisible({ timeout: 5000 });
    });
    // 拖拽单个httpNode节点到folder节点上,移动到folder节点下
    test('拖拽单个httpNode节点到folder节点上,移动到folder节点下', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 创建源文件夹
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newFolderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem.click();
      await contentPage.waitForTimeout(300);
      const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      const folderNameInput = folderDialog.locator('input').first();
      await folderNameInput.fill('源文件夹');
      const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
      await folderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 创建目标文件夹
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newFolderItem2 = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem2.click();
      await contentPage.waitForTimeout(300);
      const folderDialog2 = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      const folderNameInput2 = folderDialog2.locator('input').first();
      await folderNameInput2.fill('目标文件夹');
      const folderConfirmBtn2 = folderDialog2.locator('.el-button--primary').last();
      await folderConfirmBtn2.click();
      await contentPage.waitForTimeout(500);
      // 在源文件夹中创建httpNode节点
      const sourceFolderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '源文件夹' });
      await sourceFolderNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('测试HTTP节点');
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 展开源文件夹
      const sourceFolderTreeNode = sourceFolderNode.locator('xpath=ancestor::div[contains(@class,"el-tree-node")][1]');
      await expect(sourceFolderTreeNode).toBeVisible({ timeout: 5000 });
      const isExpanded = await sourceFolderTreeNode.evaluate(el => el.classList.contains('is-expanded'));
      if (!isExpanded) {
        const expandIcon = sourceFolderTreeNode.locator('.el-tree-node__expand-icon').first();
        await expandIcon.click();
        await contentPage.waitForTimeout(300);
      }
      // 拖拽httpNode到目标文件夹
      const httpNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '测试HTTP节点' });
      const targetFolderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '目标文件夹' });
      const httpNodeBox = await httpNode.boundingBox();
      const targetBox = await targetFolderNode.boundingBox();
      if (httpNodeBox && targetBox) {
        await contentPage.mouse.move(httpNodeBox.x + httpNodeBox.width / 2, httpNodeBox.y + httpNodeBox.height / 2);
        await contentPage.mouse.down();
        await contentPage.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
        await contentPage.mouse.up();
      }
      await contentPage.waitForTimeout(500);
      // 验证目标文件夹展开并包含节点
      const targetFolderTreeNode = targetFolderNode.locator('xpath=ancestor::div[contains(@class,"el-tree-node")][1]');
      await expect(targetFolderTreeNode).toBeVisible({ timeout: 5000 });
      const isTargetExpanded = await targetFolderTreeNode.evaluate(el => el.classList.contains('is-expanded'));
      if (!isTargetExpanded) {
        const expandIcon = targetFolderTreeNode.locator('.el-tree-node__expand-icon').first();
        await expandIcon.click();
        await contentPage.waitForTimeout(300);
      }
      const movedNode = targetFolderTreeNode.locator('.el-tree-node__content').filter({ hasText: '测试HTTP节点' });
      await expect(movedNode).toBeVisible({ timeout: 5000 });
    });
    // 拖拽单个httpNode节点调整在同一层级的顺序
    test('拖拽单个httpNode节点调整在同一层级的顺序', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 创建第一个httpNode节点
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('HTTP节点A');
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 创建第二个httpNode节点
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newInterfaceItem2 = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem2.click();
      await contentPage.waitForTimeout(300);
      const addFileDialog2 = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      const nameInput2 = addFileDialog2.locator('input').first();
      await nameInput2.fill('HTTP节点B');
      const confirmBtn2 = addFileDialog2.locator('.el-button--primary').last();
      await confirmBtn2.click();
      await contentPage.waitForTimeout(500);
      // 获取节点B的位置
      const nodeB = contentPage.locator('.el-tree-node__content').filter({ hasText: 'HTTP节点B' });
      const nodeA = contentPage.locator('.el-tree-node__content').filter({ hasText: 'HTTP节点A' });
      const nodeBBox = await nodeB.boundingBox();
      const nodeABox = await nodeA.boundingBox();
      if (nodeBBox && nodeABox) {
        // 拖拽节点B到节点A上方
        await contentPage.mouse.move(nodeBBox.x + nodeBBox.width / 2, nodeBBox.y + nodeBBox.height / 2);
        await contentPage.mouse.down();
        await contentPage.mouse.move(nodeABox.x + nodeABox.width / 2, nodeABox.y + 5);
        await contentPage.mouse.up();
      }
      await contentPage.waitForTimeout(500);
      // 验证节点顺序调整
      const allNodes = contentPage.locator('.el-tree > .el-tree-node .custom-tree-node');
      const firstNodeText = await allNodes.first().textContent();
      expect(firstNodeText).toContain('HTTP节点B');
    });
    // 拖拽httpNode节点到非folder节点(如httpNode)中,操作被阻止
    test('拖拽httpNode节点到非folder节点中,操作被阻止', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 创建两个httpNode节点
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('HTTP节点A');
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newInterfaceItem2 = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem2.click();
      await contentPage.waitForTimeout(300);
      const addFileDialog2 = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      const nameInput2 = addFileDialog2.locator('input').first();
      await nameInput2.fill('HTTP节点B');
      const confirmBtn2 = addFileDialog2.locator('.el-button--primary').last();
      await confirmBtn2.click();
      await contentPage.waitForTimeout(500);
      // 尝试拖拽节点A到节点B内部(inner模式)
      const nodeA = contentPage.locator('.el-tree-node__content').filter({ hasText: 'HTTP节点A' });
      const nodeB = contentPage.locator('.el-tree-node__content').filter({ hasText: 'HTTP节点B' });
      const nodeABox = await nodeA.boundingBox();
      const nodeBBox = await nodeB.boundingBox();
      if (nodeABox && nodeBBox) {
        await contentPage.mouse.move(nodeABox.x + nodeABox.width / 2, nodeABox.y + nodeABox.height / 2);
        await contentPage.mouse.down();
        await contentPage.mouse.move(nodeBBox.x + nodeBBox.width / 2, nodeBBox.y + nodeBBox.height / 2);
        await contentPage.mouse.up();
      }
      await contentPage.waitForTimeout(500);
      // 验证节点A不会成为节点B的子节点(仍然在根级别)
      const rootNodeA = treeWrap.locator('> .el-tree > .el-tree-node').filter({ hasText: 'HTTP节点A' });
      await expect(rootNodeA).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('移动单个websocketNode节点', () => {
    // 拖拽单个websocketNode节点到banner空白区域,移动到根节点下
    test('拖拽单个websocketNode节点到banner空白区域,移动到根节点下', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 先创建一个文件夹
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newFolderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem.click();
      await contentPage.waitForTimeout(300);
      const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      const folderNameInput = folderDialog.locator('input').first();
      await folderNameInput.fill('测试文件夹');
      const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
      await folderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 在文件夹中创建websocket节点
      const folderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '测试文件夹' });
      await folderNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const wsNameInput = addFileDialog.locator('input').first();
      await wsNameInput.fill('测试WS节点');
      const wsRadio = addFileDialog.locator('.el-radio').filter({ hasText: 'WebSocket' }).first();
      await wsRadio.click();
      await contentPage.waitForTimeout(200);
      const wsConfirmBtn = addFileDialog.locator('.el-button--primary').last();
      await wsConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 展开文件夹
      const folderTreeNode = folderNode.locator('xpath=ancestor::div[contains(@class,"el-tree-node")][1]');
      await expect(folderTreeNode).toBeVisible({ timeout: 5000 });
      const isExpanded = await folderTreeNode.evaluate(el => el.classList.contains('is-expanded'));
      if (!isExpanded) {
        const expandIcon = folderTreeNode.locator('.el-tree-node__expand-icon').first();
        await expandIcon.click();
        await contentPage.waitForTimeout(300);
      }
      // 拖拽websocket节点到空白区域
      const wsNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '测试WS节点' });
      const wsNodeBox = await wsNode.boundingBox();
      const treeBox = await treeWrap.boundingBox();
      if (wsNodeBox && treeBox) {
        await contentPage.mouse.move(wsNodeBox.x + wsNodeBox.width / 2, wsNodeBox.y + wsNodeBox.height / 2);
        await contentPage.mouse.down();
        await contentPage.mouse.move(treeBox.x + 100, treeBox.y + treeBox.height - 50);
        await contentPage.mouse.up();
      }
      await contentPage.waitForTimeout(500);
      // 验证节点移动到根节点下
      const rootWsNode = treeWrap.locator('> .el-tree > .el-tree-node').filter({ hasText: '测试WS节点' });
      await expect(rootWsNode).toBeVisible({ timeout: 5000 });
    });
    // 拖拽单个websocketNode节点到folder节点
    test('拖拽单个websocketNode节点到folder节点上,移动到folder节点下', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 创建源文件夹
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newFolderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem.click();
      await contentPage.waitForTimeout(300);
      const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      const folderNameInput = folderDialog.locator('input').first();
      await folderNameInput.fill('源文件夹');
      const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
      await folderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 创建目标文件夹
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newFolderItem2 = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem2.click();
      await contentPage.waitForTimeout(300);
      const folderDialog2 = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      const folderNameInput2 = folderDialog2.locator('input').first();
      await folderNameInput2.fill('目标文件夹');
      const folderConfirmBtn2 = folderDialog2.locator('.el-button--primary').last();
      await folderConfirmBtn2.click();
      await contentPage.waitForTimeout(500);
      // 在源文件夹中创建websocket节点
      const sourceFolderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '源文件夹' });
      await sourceFolderNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const wsNameInput = addFileDialog.locator('input').first();
      await wsNameInput.fill('测试WS节点');
      const wsRadio = addFileDialog.locator('.el-radio').filter({ hasText: 'WebSocket' }).first();
      await wsRadio.click();
      await contentPage.waitForTimeout(200);
      const wsConfirmBtn = addFileDialog.locator('.el-button--primary').last();
      await wsConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 展开源文件夹
      const sourceFolderTreeNode = sourceFolderNode.locator('xpath=ancestor::div[contains(@class,"el-tree-node")][1]');
      await expect(sourceFolderTreeNode).toBeVisible({ timeout: 5000 });
      const isExpanded = await sourceFolderTreeNode.evaluate(el => el.classList.contains('is-expanded'));
      if (!isExpanded) {
        const expandIcon = sourceFolderTreeNode.locator('.el-tree-node__expand-icon').first();
        await expandIcon.click();
        await contentPage.waitForTimeout(300);
      }
      // 拖拽websocket节点到目标文件夹
      const wsNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '测试WS节点' });
      const targetFolderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '目标文件夹' });
      const wsNodeBox = await wsNode.boundingBox();
      const targetBox = await targetFolderNode.boundingBox();
      if (wsNodeBox && targetBox) {
        await contentPage.mouse.move(wsNodeBox.x + wsNodeBox.width / 2, wsNodeBox.y + wsNodeBox.height / 2);
        await contentPage.mouse.down();
        await contentPage.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
        await contentPage.mouse.up();
      }
      await contentPage.waitForTimeout(500);
      // 验证目标文件夹展开并包含节点
      const targetFolderTreeNode = targetFolderNode.locator('xpath=ancestor::div[contains(@class,"el-tree-node")][1]');
      await expect(targetFolderTreeNode).toBeVisible({ timeout: 5000 });
      const isTargetExpanded = await targetFolderTreeNode.evaluate(el => el.classList.contains('is-expanded'));
      if (!isTargetExpanded) {
        const expandIcon = targetFolderTreeNode.locator('.el-tree-node__expand-icon').first();
        await expandIcon.click();
        await contentPage.waitForTimeout(300);
      }
      const movedNode = targetFolderTreeNode.locator('.el-tree-node__content').filter({ hasText: '测试WS节点' });
      await expect(movedNode).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('移动单个httpMockNode节点', () => {
    // 拖拽单个httpMockNode节点到banner空白区域,移动到根节点下
    test('拖拽单个httpMockNode节点到banner空白区域,移动到根节点下', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 先创建一个文件夹
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newFolderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem.click();
      await contentPage.waitForTimeout(300);
      const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      const folderNameInput = folderDialog.locator('input').first();
      await folderNameInput.fill('测试文件夹');
      const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
      await folderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 在文件夹中创建httpMock节点
      const folderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '测试文件夹' });
      await folderNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const mockNameInput = addFileDialog.locator('input').first();
      await mockNameInput.fill('测试Mock节点');
      const httpMockRadio = addFileDialog.locator('.el-radio').filter({ hasText: 'HTTP Mock' }).first();
      await httpMockRadio.click();
      await contentPage.waitForTimeout(200);
      const mockConfirmBtn = addFileDialog.locator('.el-button--primary').last();
      await mockConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 展开文件夹
      const folderTreeNode = folderNode.locator('xpath=ancestor::div[contains(@class,"el-tree-node")][1]');
      await expect(folderTreeNode).toBeVisible({ timeout: 5000 });
      const isExpanded = await folderTreeNode.evaluate(el => el.classList.contains('is-expanded'));
      if (!isExpanded) {
        const expandIcon = folderTreeNode.locator('.el-tree-node__expand-icon').first();
        await expandIcon.click();
        await contentPage.waitForTimeout(300);
      }
      // 拖拽mock节点到空白区域
      const mockNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '测试Mock节点' });
      const mockNodeBox = await mockNode.boundingBox();
      const treeBox = await treeWrap.boundingBox();
      if (mockNodeBox && treeBox) {
        await contentPage.mouse.move(mockNodeBox.x + mockNodeBox.width / 2, mockNodeBox.y + mockNodeBox.height / 2);
        await contentPage.mouse.down();
        await contentPage.mouse.move(treeBox.x + 100, treeBox.y + treeBox.height - 50);
        await contentPage.mouse.up();
      }
      await contentPage.waitForTimeout(500);
      // 验证节点移动到根节点下
      const rootMockNode = treeWrap.locator('> .el-tree > .el-tree-node').filter({ hasText: '测试Mock节点' });
      await expect(rootMockNode).to
    });
    // 拖拽单个httpMockNode节点到folder节点上,移动到folder节点下
    test('拖拽单个httpMockNode节点到folder节点上,移动到folder节点下', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 创建源文件夹
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newFolderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem.click();
      await contentPage.waitForTimeout(300);
      const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      const folderNameInput = folderDialog.locator('input').first();
      await folderNameInput.fill('源文件夹');
      const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
      await folderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 创建目标文件夹
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newFolderItem2 = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem2.click();
      await contentPage.waitForTimeout(300);
      const folderDialog2 = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      const folderNameInput2 = folderDialog2.locator('input').first();
      await folderNameInput2.fill('目标文件夹');
      const folderConfirmBtn2 = folderDialog2.locator('.el-button--primary').last();
      await folderConfirmBtn2.click();
      await contentPage.waitForTimeout(500);
      // 在源文件夹中创建httpMock节点
      const sourceFolderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '源文件夹' });
      await sourceFolderNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const mockNameInput = addFileDialog.locator('input').first();
      await mockNameInput.fill('测试Mock节点');
      const httpMockRadio = addFileDialog.locator('.el-radio').filter({ hasText: 'HTTP Mock' }).first();
      await httpMockRadio.click();
      await contentPage.waitForTimeout(200);
      const mockConfirmBtn = addFileDialog.locator('.el-button--primary').last();
      await mockConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 展开源文件夹
      const sourceFolderTreeNode = sourceFolderNode.locator('xpath=ancestor::div[contains(@class,"el-tree-node")][1]');
      await expect(sourceFolderTreeNode).toBeVisible({ timeout: 5000 });
      const isExpanded = await sourceFolderTreeNode.evaluate(el => el.classList.contains('is-expanded'));
      if (!isExpanded) {
        const expandIcon = sourceFolderTreeNode.locator('.el-tree-node__expand-icon').first();
        await expandIcon.click();
        await contentPage.waitForTimeout(300);
      }
      // 拖拽mock节点到目标文件夹
      const mockNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '测试Mock节点' });
      const targetFolderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '目标文件夹' });
      const mockNodeBox = await mockNode.boundingBox();
      const targetBox = await targetFolderNode.boundingBox();
      if (mockNodeBox && targetBox) {
        await contentPage.mouse.move(mockNodeBox.x + mockNodeBox.width / 2, mockNodeBox.y + mockNodeBox.height / 2);
        await contentPage.mouse.down();
        await contentPage.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
        await contentPage.mouse.up();
      }
      await contentPage.waitForTimeout(500);
      // 验证目标文件夹展开并包含节点
      const targetFolderTreeNode = targetFolderNode.locator('xpath=ancestor::div[contains(@class,"el-tree-node")][1]');
      await expect(targetFolderTreeNode).toBeVisible({ timeout: 5000 });
      const isTargetExpanded = await targetFolderTreeNode.evaluate(el => el.classList.contains('is-expanded'));
      if (!isTargetExpanded) {
        const expandIcon = targetFolderTreeNode.locator('.el-tree-node__expand-icon').first();
        await expandIcon.click();
        await contentPage.waitForTimeout(300);
      }
      const movedNode = targetFolderTreeNode.locator('.el-tree-node__content').filter({ hasText: '测试Mock节点' });
      await expect(movedNode).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('移动单个websocketMockNode节点', () => {
    // 拖拽单个websocketMockNode节点到banner空白区域,移动到根节点下
    test('拖拽单个websocketMockNode节点到banner空白区域,移动到根节点下', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 先创建一个文件夹
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newFolderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem.click();
      await contentPage.waitForTimeout(300);
      const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      const folderNameInput = folderDialog.locator('input').first();
      await folderNameInput.fill('测试文件夹');
      const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
      await folderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 在文件夹中创建websocketMock节点
      const folderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '测试文件夹' });
      await folderNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const wsMockNameInput = addFileDialog.locator('input').first();
      await wsMockNameInput.fill('测试WsMock节点');
      const wsMockRadio = addFileDialog.locator('.el-radio').filter({ hasText: 'WebSocket Mock' }).first();
      await wsMockRadio.click();
      await contentPage.waitForTimeout(200);
      const wsMockConfirmBtn = addFileDialog.locator('.el-button--primary').last();
      await wsMockConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 展开文件夹
      const folderTreeNode = folderNode.locator('xpath=ancestor::div[contains(@class,"el-tree-node")][1]');
      await expect(folderTreeNode).toBeVisible({ timeout: 5000 });
      const isExpanded = await folderTreeNode.evaluate(el => el.classList.contains('is-expanded'));
      if (!isExpanded) {
        const expandIcon = folderTreeNode.locator('.el-tree-node__expand-icon').first();
        await expandIcon.click();
        await contentPage.waitForTimeout(300);
      }
      // 拖拽wsMock节点到空白区域
      const wsMockNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '测试WsMock节点' });
      const wsMockNodeBox = await wsMockNode.boundingBox();
      const treeBox = await treeWrap.boundingBox();
      if (wsMockNodeBox && treeBox) {
        await contentPage.mouse.move(wsMockNodeBox.x + wsMockNodeBox.width / 2, wsMockNodeBox.y + wsMockNodeBox.height / 2);
        await contentPage.mouse.down();
        await contentPage.mouse.move(treeBox.x + 100, treeBox.y + treeBox.height - 50);
        await contentPage.mouse.up();
      }
      await contentPage.waitForTimeout(500);
      // 验证节点移动到根节点下
      const rootWsMockNode = treeWrap.locator('> .el-tree > .el-tree-node').filter({ hasText: '测试WsMock节点' });
      await expect(rootWsMockNode).toBeVisible({ timeout: 5000 });
    });
    // 拖拽单个websocketMockNode节点到folder节点上,移动到folder节点下
    test('拖拽单个websocketMockNode节点到folder节点上,移动到folder节点下', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 创建源文件夹
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newFolderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem.click();
      await contentPage.waitForTimeout(300);
      const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      const folderNameInput = folderDialog.locator('input').first();
      await folderNameInput.fill('源文件夹');
      const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
      await folderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 创建目标文件夹
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newFolderItem2 = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem2.click();
      await contentPage.waitForTimeout(300);
      const folderDialog2 = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      const folderNameInput2 = folderDialog2.locator('input').first();
      await folderNameInput2.fill('目标文件夹');
      const folderConfirmBtn2 = folderDialog2.locator('.el-button--primary').last();
      await folderConfirmBtn2.click();
      await contentPage.waitForTimeout(500);
      // 在源文件夹中创建websocketMock节点
      const sourceFolderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '源文件夹' });
      await sourceFolderNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const wsMockNameInput = addFileDialog.locator('input').first();
      await wsMockNameInput.fill('测试WsMock节点');
      const wsMockRadio = addFileDialog.locator('.el-radio').filter({ hasText: 'WebSocket Mock' }).first();
      await wsMockRadio.click();
      await contentPage.waitForTimeout(200);
      const wsMockConfirmBtn = addFileDialog.locator('.el-button--primary').last();
      await wsMockConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 展开源文件夹
      const sourceFolderTreeNode = sourceFolderNode.locator('xpath=ancestor::div[contains(@class,"el-tree-node")][1]');
      await expect(sourceFolderTreeNode).toBeVisible({ timeout: 5000 });
      const isExpanded = await sourceFolderTreeNode.evaluate(el => el.classList.contains('is-expanded'));
      if (!isExpanded) {
        const expandIcon = sourceFolderTreeNode.locator('.el-tree-node__expand-icon').first();
        await expandIcon.click();
        await contentPage.waitForTimeout(300);
      }
      // 拖拽wsMock节点到目标文件夹
      const wsMockNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '测试WsMock节点' });
      const targetFolderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '目标文件夹' });
      const wsMockNodeBox = await wsMockNode.boundingBox();
      const targetBox = await targetFolderNode.boundingBox();
      if (wsMockNodeBox && targetBox) {
        await contentPage.mouse.move(wsMockNodeBox.x + wsMockNodeBox.width / 2, wsMockNodeBox.y + wsMockNodeBox.height / 2);
        await contentPage.mouse.down();
        await contentPage.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
        await contentPage.mouse.up();
      }
      await contentPage.waitForTimeout(500);
      // 验证目标文件夹展开并包含节点
      const targetFolderTreeNode = targetFolderNode.locator('xpath=ancestor::div[contains(@class,"el-tree-node")][1]');
      await expect(targetFolderTreeNode).toBeVisible({ timeout: 5000 });
      const isTargetExpanded = await targetFolderTreeNode.evaluate(el => el.classList.contains('is-expanded'));
      if (!isTargetExpanded) {
        const expandIcon = targetFolderTreeNode.locator('.el-tree-node__expand-icon').first();
        await expandIcon.click();
        await contentPage.waitForTimeout(300);
      }
      const movedNode = targetFolderTreeNode.locator('.el-tree-node__content').filter({ hasText: '测试WsMock节点' });
      await expect(movedNode).toBeV
    });
  });

  test.describe('移动单个folder节点', () => {
    // 拖拽单个folder节点到banner空白区域,移动到根节点下
    test('拖拽单个folder节点到banner空白区域,移动到根节点下', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 创建父文件夹
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newFolderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem.click();
      await contentPage.waitForTimeout(300);
      const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      const folderNameInput = folderDialog.locator('input').first();
      await folderNameInput.fill('父文件夹');
      const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
      await folderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 在父文件夹中创建子文件夹
      const parentFolderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '父文件夹' });
      await parentFolderNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const newSubFolderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
      await newSubFolderItem.click();
      await contentPage.waitForTimeout(300);
      const subFolderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      const subFolderNameInput = subFolderDialog.locator('input').first();
      await subFolderNameInput.fill('子文件夹');
      const subFolderConfirmBtn = subFolderDialog.locator('.el-button--primary').last();
      await subFolderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 展开父文件夹
      const parentFolderTreeNode = parentFolderNode.locator('xpath=ancestor::div[contains(@class,"el-tree-node")][1]');
      await expect(parentFolderTreeNode).toBeVisible({ timeout: 5000 });
      const isExpanded = await parentFolderTreeNode.evaluate(el => el.classList.contains('is-expanded'));
      if (!isExpanded) {
        const expandIcon = parentFolderTreeNode.locator('.el-tree-node__expand-icon').first();
        await expandIcon.click();
        await contentPage.waitForTimeout(300);
      }
      // 拖拽子文件夹到空白区域
      const childFolderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '子文件夹' });
      const childFolderBox = await childFolderNode.boundingBox();
      const treeBox = await treeWrap.boundingBox();
      if (childFolderBox && treeBox) {
        await contentPage.mouse.move(childFolderBox.x + childFolderBox.width / 2, childFolderBox.y + childFolderBox.height / 2);
        await contentPage.mouse.down();
        await contentPage.mouse.move(treeBox.x + 100, treeBox.y + treeBox.height - 50);
        await contentPage.mouse.up();
      }
      await contentPage.waitForTimeout(500);
      // 验证子文件夹移动到根节点下
      const rootChildFolder = treeWrap.locator('> .el-tree > .el-tree-node').filter({ hasText: '子文件夹' });
      await expect(rootChildFolder).toBeVisible({ timeout: 5000 });
    });
    // 拖拽单个folder节点到folder节点上,移动到folder节点下作为子节点
    test('拖拽单个folder节点到folder节点上,移动到folder节点下作为子节点', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 创建源文件夹
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newFolderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem.click();
      await contentPage.waitForTimeout(300);
      const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      const folderNameInput = folderDialog.locator('input').first();
      await folderNameInput.fill('源文件夹');
      const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
      await folderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 创建目标文件夹
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newFolderItem2 = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem2.click();
      await contentPage.waitForTimeout(300);
      const folderDialog2 = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      const folderNameInput2 = folderDialog2.locator('input').first();
      await folderNameInput2.fill('目标文件夹');
      const folderConfirmBtn2 = folderDialog2.locator('.el-button--primary').last();
      await folderConfirmBtn2.click();
      await contentPage.waitForTimeout(500);
      // 拖拽源文件夹到目标文件夹内
      const sourceFolderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '源文件夹' });
      const targetFolderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '目标文件夹' });
      const sourceBox = await sourceFolderNode.boundingBox();
      const targetBox = await targetFolderNode.boundingBox();
      if (sourceBox && targetBox) {
        await contentPage.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
        await contentPage.mouse.down();
        await contentPage.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
        await contentPage.mouse.up();
      }
      await contentPage.waitForTime
      // 验证目标文件夹展开并包含源文件夹
      const expandedFolder = contentPage.locator('.el-tree-node.is-expanded').filter({ hasText: '目标文件夹' });
      await expect(expandedFolder).toBeVisible({ timeout: 5000 });
      const movedFolder = expandedFolder.locator('.el-tree-node__content').filter({ hasText: '源文件夹' });
      await expect(movedFolder).toBeVisible({ timeout: 5000 });
    });
    // 拖拽folder节点调整在同一层级的顺序
    test('拖拽folder节点调整在同一层级的顺序', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 创建文件夹A
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newFolderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem.click();
      await contentPage.waitForTimeout(300);
      const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      const folderNameInput = folderDialog.locator('input').first();
      await folderNameInput.fill('文件夹A');
      const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
      await folderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 创建文件夹B
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newFolderItem2 = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem2.click();
      await contentPage.waitForTimeout(300);
      const folderDialog2 = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      const folderNameInput2 = folderDialog2.locator('input').first();
      await folderNameInput2.fill('文件夹B');
      const folderConfirmBtn2 = folderDialog2.locator('.el-button--primary').last();
      await folderConfirmBtn2.click();
      await contentPage.waitForTimeout(500);
      // 拖拽文件夹B到文件夹A上方
      const folderB = contentPage.locator('.el-tree-node__content').filter({ hasText: '文件夹B' });
      const folderA = contentPage.locator('.el-tree-node__content').filter({ hasText: '文件夹A' });
      const folderBBox = await folderB.boundingBox();
      const folderABox = await folderA.boundingBox();
      if (folderBBox && folderABox) {
        await contentPage.mouse.move(folderBBox.x + folderBBox.width / 2, folderBBox.y + folderBBox.height / 2);
        await contentPage.mouse.down();
        await contentPage.mouse.move(folderABox.x + folderABox.width / 2, folderABox.y + 5);
        await contentPage.mouse.up();
      }
      await contentPage.waitForTimeout(500);
      // 验证文件夹顺序调整
      const allFolders = contentPage.locator('.el-tree > .el-tree-node .custom-tree-node');
      const firstFolderText = await allFolders.first().textContent();
      expect(firstFolderText).toContain('文件夹B');
    });
    // 拖拽folder节点到其自身子节点下,操作被阻止
    test('拖拽folder节点到其自身子节点下,操作被阻止', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 创建父文件夹
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newFolderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem.click();
      await contentPage.waitForTimeout(300);
      const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      const folderNameInput = folderDialog.locator('input').first();
      await folderNameInput.fill('父文件夹');
      const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
      await folderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 在父文件夹中创建子文件夹
      const parentFolderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '父文件夹' });
      await parentFolderNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const newSubFolderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
      await newSubFolderItem.click();
      await contentPage.waitForTimeout(300);
      const subFolderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      const subFolderNameInput = subFolderDialog.locator('input').first();
      await subFolderNameInput.fill('子文件夹');
      const subFolderConfirmBtn = subFolderDialog.locator('.el-button--primary').last();
      await subFolderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 展开父文件夹
      const parentFolderTreeNode = parentFolderNode.locator('xpath=ancestor::div[contains(@class,"el-tree-node")][1]');
      await expect(parentFolderTreeNode).toBeVisible({ timeout: 5000 });
      const isExpanded = await parentFolderTreeNode.evaluate(el => el.classList.contains('is-expanded'));
      if (!isExpanded) {
        const expandIcon = parentFolderTreeNode.locator('.el-tree-node__expand-icon').first();
        await expandIcon.click();
        await contentPage.waitForTimeout(300);
      }
      // 尝试拖拽父文件夹到子文件夹内部
      const childFolderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '子文件夹' });
      const parentBox = await parentFolderNode.boundingBox();
      const childBox = await childFolderNode.boundingBox();
      if (parentBox && childBox) {
        await contentPage.mouse.move(parentBox.x + parentBox.width / 2, parentBox.y + parentBox.height / 2);
        await contentPage.mouse.dow
        await contentPage.mouse.move(childBox.x + childBox.width / 2, childBox.y + childBox.height / 2);
        await contentPage.mouse.up();
      }
      await contentPage.waitForTimeout(500);
      // 验证父文件夹仍然在根级别(没有被移动到子文件夹内)
      const rootParentFolder = treeWrap.locator('> .el-tree > .el-tree-node').filter({ hasText: '父文件夹' });
      await expect(rootParentFolder).toBeVisible({ timeout: 5000 });
    });
    // 移动包含多层嵌套的folder节点,层级结构保持不变
    test('移动包含多层嵌套的folder节点,层级结构保持不变', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 创建源文件夹
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newFolderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem.click();
      await contentPage.waitForTimeout(300);
      const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      const folderNameInput = folderDialog.locator('input').first();
      await folderNameInput.fill('源文件夹');
      const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
      await folderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 在源文件夹中创建子文件夹
      const sourceFolderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '源文件夹' });
      await sourceFolderNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const newSubFolderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
      await newSubFolderItem.click();
      await contentPage.waitForTimeout(300);
      const subFolderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      const subFolderNameInput = subFolderDialog.locator('input').first();
      await subFolderNameInput.fill('嵌套子文件夹');
      const subFolderConfirmBtn = subFolderDialog.locator('.el-button--primary').last();
      await subFolderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 在源文件夹中创建httpNode节点
      await sourceFolderNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('嵌套HTTP节点');
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 创建目标文件夹
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newTargetFolderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
      await newTargetFolderItem.click();
      await contentPage.waitForTimeout(300);
      const targetFolderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      const targetFolderNameInput = targetFolderDialog.locator('input').first();
      await targetFolderNameInput.fill('目标文件夹');
      const targetFolderConfirmBtn = targetFolderDialog.locator('.el-button--primary').last();
      await targetFolderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 拖拽源文件夹到目标文件夹内
      const targetFolderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '目标文件夹' });
      const sourceBox = await sourceFolderNode.boundingBox();
      const targetBox = await targetFolderNode.boundingBox();
      if (sourceBox && targetBox) {
        await contentPage.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
        await contentPage.mouse.down();
        await contentPage.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
        await contentPage.mouse.up();
      }
      await contentPage.waitForTimeout(500);
      // 验证目标文件夹展开并包含源文件夹
      const targetFolderTreeNode = targetFolderNode.locator('xpath=ancestor::div[contains(@class,"el-tree-node")][1]');
      await expect(targetFolderTreeNode).toBeVisible({ timeout: 5000 });
      const isTargetExpanded = await targetFolderTreeNode.evaluate(el => el.classList.contains('is-expanded'));
      if (!isTargetExpanded) {
        const expandIcon = targetFolderTreeNode.locator('.el-tree-node__expand-icon').first();
        await expandIcon.click();
        await contentPage.waitForTimeout(300);
      }
      const movedSourceFolder = targetFolderTreeNode.locator('.el-tree-node__content').filter({ hasText: '源文件夹' });
      await expect(movedSourceFolder).toBeVisible({ timeout: 5000 });
      // 展开移动后的源文件夹验证子节点
      const movedSourceTreeNode = movedSourceFolder.locator('xpath=ancestor::div[contains(@class,"el-tree-node")][1]');
      await expect(movedSourceTreeNode).toBeVisible({ timeout: 5000 });
      const isMovedExpanded = await movedSourceTreeNode.evaluate(el => el.classList.contains('is-expanded'));
      if (!isMovedExpanded) {
        const movedExpandIcon = movedSourceTreeNode.locator('.el-tree-node__expand-icon').first();
        await movedExpandIcon.click();
        await contentPage.waitForTimeout(300);
      }
      // 验证嵌套的子文件夹和HTTP节点仍然存在
      const nestedSubFolder = movedSourceTreeNode.locator('.el-tree-node__content').filter({ hasText: '嵌套子文件夹' });
      await expect(nestedSubFolder).toBeVisible({ timeout: 5000 });
      const nestedHttpNode = movedSourceTreeNode.locator('.el-tree-node__content').filter({ hasText: '嵌套HTTP节点' });
      await expect(nestedHttpNode).toBeVisible({ timeout: 5000 });
    });
  });
});
