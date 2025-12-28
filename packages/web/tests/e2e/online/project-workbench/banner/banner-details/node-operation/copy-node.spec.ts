import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

test.describe('CopyNode', () => {
  test.describe('复制HTTP节点', () => {
    // 复制单个httpNode节点粘贴到根节点下
    test('复制单个httpNode节点粘贴到根节点下', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      // 创建一个HTTP节点
      const treeWrap = contentPage.locator('.tree-wrap');
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('源HTTP节点');
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 验证节点创建成功
      const sourceNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '源HTTP节点' });
      await expect(sourceNode).toBeVisible({ timeout: 5000 });
      // 右键复制节点
      await sourceNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const copyItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /复制/ }).first();
      await expect(copyItem).toBeVisible();
      await copyItem.click();
      await contentPage.waitForTimeout(300);
      // 在空白区域右键粘贴
      await treeWrap.click({ button: 'right', position: { x: 100, y: 300 } });
      await contentPage.waitForTimeout(300);
      const pasteItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /粘贴/ });
      await expect(pasteItem).toBeVisible();
      await pasteItem.click();
      await contentPage.waitForTimeout(500);
      // 验证新节点出现
      const allNodes = contentPage.locator('.el-tree-node__content').filter({ hasText: '源HTTP节点' });
      await expect(allNodes).toHaveCount(2, { timeout: 5000 });
    });
    // 复制单个httpNode节点粘贴到folder节点下
    test('复制单个httpNode节点粘贴到folder节点下', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 创建文件夹
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newFolderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建文件夹/ });
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
      const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('源HTTP节点');
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 右键复制HTTP节点
      const sourceNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '源HTTP节点' });
      await sourceNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const copyItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /复制/ }).first();
      await copyItem.click();
      await contentPage.waitForTimeout(300);
      // 在文件夹上右键粘贴
      const folderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '目标文件夹' });
      await folderNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const pasteItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /粘贴/ });
      await expect(pasteItem).toBeVisible();
      await pasteItem.click();
      await contentPage.waitForTimeout(500);
      // 验证文件夹下出现新节点
      const expandedFolder = contentPage.locator('.el-tree-node.is-expanded').filter({ hasText: '目标文件夹' });
      await expect(expandedFolder).toBeVisible({ timeout: 5000 });
      const childNode = expandedFolder.locator('.el-tree-node__content').filter({ hasText: '源HTTP节点' });
      await expect(childNode).toBeVisible({ timeout: 5000 });
    });
    // 复制多个httpNode节点粘贴到根节点下
    test('复制多个httpNode节点粘贴到根节点下', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 创建3个HTTP节点
      for (let i = 1; i <= 3; i++) {
        await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
        await contentPage.waitForTimeout(300);
        const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
        await newInterfaceItem.click();
        await contentPage.waitForTimeout(300);
        const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
        await expect(addFileDialog).toBeVisible({ timeout: 5000 });
        const nameInput = addFileDialog.locator('input').first();
        await nameInput.fill(`HTTP节点${i}`);
        const confirmBtn = addFileDialog.locator('.el-button--primary').last();
        await confirmBtn.click();
        await contentPage.waitForTimeout(500);
      }
      // 多选节点: 点击第一个节点，然后Ctrl+点击其他节点
      const node1 = contentPage.locator('.el-tree-node__content').filter({ hasText: 'HTTP节点1' });
      await node1.click();
      await contentPage.waitForTimeout(200);
      await contentPage.keyboard.down('Control');
      const node2 = contentPage.locator('.el-tree-node__content').filter({ hasText: 'HTTP节点2' });
      await node2.click();
      await contentPage.waitForTimeout(200);
      const node3 = contentPage.locator('.el-tree-node__content').filter({ hasText: 'HTTP节点3' });
      await node3.click();
      await contentPage.keyboard.up('Control');
      await contentPage.waitForTimeout(300);
      // 右键批量复制
      await node1.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const batchCopyItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /批量复制/ });
      await expect(batchCopyItem).toBeVisible();
      await batchCopyItem.click();
      await contentPage.waitForTimeout(300);
      // 在空白区域右键粘贴
      await treeWrap.click({ button: 'right', position: { x: 100, y: 400 } });
      await contentPage.waitForTimeout(300);
      const pasteItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /粘贴/ });
      await pasteItem.click();
      await contentPage.waitForTimeout(500);
      // 验证新节点出现（每个节点应该有2个）
      const allNode1 = contentPage.locator('.el-tree-node__content').filter({ hasText: 'HTTP节点1' });
      const allNode2 = contentPage.locator('.el-tree-node__content').filter({ hasText: 'HTTP节点2' });
      const allNode3 = contentPage.locator('.el-tree-node__content').filter({ hasText: 'HTTP节点3' });
      await expect(allNode1).toHaveCount(2, { timeout: 5000 });
      await expect(allNode2).toHaveCount(2, { timeout: 5000 });
      await expect(allNode3).toHaveCount(2, { timeout: 5000 });
    });
  });
  test.describe('复制WebSocket节点', () => {
    // 复制单个websocketNode节点粘贴到根节点下
    test('复制单个websocketNode节点粘贴到根节点下', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 创建WebSocket节点
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('源WebSocket节点');
      const wsRadio = addFileDialog.locator('.el-radio').filter({ hasText: 'WebSocket' }).first();
      await wsRadio.click();
      await contentPage.waitForTimeout(200);
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 验证节点创建成功
      const sourceNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '源WebSocket节点' });
      await expect(sourceNode).toBeVisible({ timeout: 5000 });
      // 右键复制节点
      await sourceNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const copyItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /复制/ }).first();
      await copyItem.click();
      await contentPage.waitForTimeout(300);
      // 在空白区域右键粘贴
      await treeWrap.click({ button: 'right', position: { x: 100, y: 300 } });
      await contentPage.waitForTimeout(300);
      const pasteItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /粘贴/ });
      await pasteItem.click();
      await contentPage.waitForTimeout(500);
      // 验证新节点出现
      const allNodes = contentPage.locator('.el-tree-node__content').filter({ hasText: '源WebSocket节点' });
      await expect(allNodes).toHaveCount(2, { timeout: 5000 });
    });
    // 复制单个websocketNode节点粘贴到folder节点下
    test('复制单个websocketNode节点粘贴到folder节点下', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 创建文件夹
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newFolderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem.click();
      await contentPage.waitForTimeout(300);
      const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      const folderNameInput = folderDialog.locator('input').first();
      await folderNameInput.fill('WS目标文件夹');
      const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
      await folderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 创建WebSocket节点
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('源WebSocket节点');
      const wsRadio = addFileDialog.locator('.el-radio').filter({ hasText: 'WebSocket' }).first();
      await wsRadio.click();
      await contentPage.waitForTimeout(200);
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 右键复制节点
      const sourceNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '源WebSocket节点' });
      await sourceNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const copyItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /复制/ }).first();
      await copyItem.click();
      await contentPage.waitForTimeout(300);
      // 在文件夹上右键粘贴
      const folderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: 'WS目标文件夹' });
      await folderNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const pasteItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /粘贴/ });
      await pasteItem.click();
      await contentPage.waitForTimeout(500);
      // 验证文件夹展开并显示子节点
      const expandedFolder = contentPage.locator('.el-tree-node.is-expanded').filter({ hasText: 'WS目标文件夹' });
      await expect(expandedFolder).toBeVisible({ timeout: 5000 });
    });
  });
  test.describe('复制HTTP Mock节点', () => {
    // 复制单个httpMockNode节点粘贴到根节点下
    test('复制单个httpMockNode节点粘贴到根节点下', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 创建HTTP Mock节点
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('源HTTP Mock节点');
      const mockRadio = addFileDialog.locator('.el-radio').filter({ hasText: 'HTTP Mock' });
      await mockRadio.click();
      await contentPage.waitForTimeout(200);
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 验证节点创建成功
      const sourceNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '源HTTP Mock节点' });
      await expect(sourceNode).toBeVisible({ timeout: 5000 });
      // 右键复制节点
      await sourceNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const copyItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /复制/ }).first();
      await copyItem.click();
      await contentPage.waitForTimeout(300);
      // 在空白区域右键粘贴
      await treeWrap.click({ button: 'right', position: { x: 100, y: 300 } });
      await contentPage.waitForTimeout(300);
      const pasteItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /粘贴/ });
      await pasteItem.click();
      await contentPage.waitForTimeout(500);
      // 验证新节点出现
      const allNodes = contentPage.locator('.el-tree-node__content').filter({ hasText: '源HTTP Mock节点' });
      await expect(allNodes).toHaveCount(2, { timeout: 5000 });
    });
    // 复制单个httpMockNode节点粘贴到folder节点下
    test('复制单个httpMockNode节点粘贴到folder节点下', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 创建文件夹
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newFolderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem.click();
      await contentPage.waitForTimeout(300);
      const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      const folderNameInput = folderDialog.locator('input').first();
      await folderNameInput.fill('Mock目标文件夹');
      const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
      await folderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 创建HTTP Mock节点
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('源HTTP Mock节点');
      const mockRadio = addFileDialog.locator('.el-radio').filter({ hasText: 'HTTP Mock' });
      await mockRadio.click();
      await contentPage.waitForTimeout(200);
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 右键复制节点
      const sourceNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '源HTTP Mock节点' });
      await sourceNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const copyItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /复制/ }).first();
      await copyItem.click();
      await contentPage.waitForTimeout(300);
      // 在文件夹上右键粘贴
      const folderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: 'Mock目标文件夹' });
      await folderNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const pasteItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /粘贴/ });
      await pasteItem.click();
      await contentPage.waitForTimeout(500);
      // 验证文件夹展开并显示子节点
      const expandedFolder = contentPage.locator('.el-tree-node.is-expanded').filter({ hasText: 'Mock目标文件夹' });
      await expect(expandedFolder).toBeVisible({ timeout: 5000 });
    });
  });
  test.describe('复制WebSocket Mock节点', () => {
    // 复制单个websocketMockNode节点粘贴到根节点下
    test('复制单个websocketMockNode节点粘贴到根节点下', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 创建WebSocket Mock节点
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('源WS Mock节点');
      const wsMockRadio = addFileDialog.locator('.el-radio').filter({ hasText: 'WebSocket Mock' });
      await wsMockRadio.click();
      await contentPage.waitForTimeout(200);
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 验证节点创建成功
      const sourceNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '源WS Mock节点' });
      await expect(sourceNode).toBeVisible({ timeout: 5000 });
      // 右键复制节点
      await sourceNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const copyItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /复制/ }).first();
      await copyItem.click();
      await contentPage.waitForTimeout(300);
      // 在空白区域右键粘贴
      await treeWrap.click({ button: 'right', position: { x: 100, y: 300 } });
      await contentPage.waitForTimeout(300);
      const pasteItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /粘贴/ });
      await pasteItem.click();
      await contentPage.waitForTimeout(500);
      // 验证新节点出现
      const allNodes = contentPage.locator('.el-tree-node__content').filter({ hasText: '源WS Mock节点' });
      await expect(allNodes).toHaveCount(2, { timeout: 5000 });
    });
    // 复制单个websocketMockNode节点粘贴到folder节点下
    test('复制单个websocketMockNode节点粘贴到folder节点下', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 创建文件夹
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newFolderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem.click();
      await contentPage.waitForTimeout(300);
      const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      const folderNameInput = folderDialog.locator('input').first();
      await folderNameInput.fill('WSMock目标文件夹');
      const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
      await folderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 创建WebSocket Mock节点
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('源WS Mock节点');
      const wsMockRadio = addFileDialog.locator('.el-radio').filter({ hasText: 'WebSocket Mock' });
      await wsMockRadio.click();
      await contentPage.waitForTimeout(200);
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 右键复制节点
      const sourceNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '源WS Mock节点' });
      await sourceNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const copyItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /复制/ }).first();
      await copyItem.click();
      await contentPage.waitForTimeout(300);
      // 在文件夹上右键粘贴
      const folderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: 'WSMock目标文件夹' });
      await folderNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const pasteItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /粘贴/ });
      await pasteItem.click();
      await contentPage.waitForTimeout(500);
      // 验证文件夹展开并显示子节点
      const expandedFolder = contentPage.locator('.el-tree-node.is-expanded').filter({ hasText: 'WSMock目标文件夹' });
      await expect(expandedFolder).toBeVisible({ timeout: 5000 });
    });
  });
  test.describe('复制文件夹节点', () => {
    // 复制单个folder节点粘贴到根节点下
    test('复制单个folder节点粘贴到根节点下', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 创建文件夹
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
      // 验证文件夹创建成功
      const sourceFolder = contentPage.locator('.el-tree-node__content').filter({ hasText: '源文件夹' });
      await expect(sourceFolder).toBeVisible({ timeout: 5000 });
      // 右键复制文件夹
      await sourceFolder.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const copyItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /复制/ }).first();
      await copyItem.click();
      await contentPage.waitForTimeout(300);
      // 在空白区域右键粘贴
      await treeWrap.click({ button: 'right', position: { x: 100, y: 300 } });
      await contentPage.waitForTimeout(300);
      const pasteItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /粘贴/ });
      await pasteItem.click();
      await contentPage.waitForTime
      // 验证新文件夹出现
      const allFolders = contentPage.locator('.el-tree-node__content').filter({ hasText: '源文件夹' });
      await expect(allFolders).toHaveCount(2, { timeout: 5000 });
    });
    // 复制包含子节点的folder节点
    test('复制包含子节点的folder节点', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 创建文件夹
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
      // 在文件夹下创建子节点
      const parentFolder = contentPage.locator('.el-tree-node__content').filter({ hasText: '父文件夹' });
      await parentFolder.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('子节点HTTP');
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 右键复制文件夹
      await parentFolder.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const copyItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /复制/ }).first();
      await copyItem.click();
      await contentPage.waitForTimeout(300);
      // 在空白区域右键粘贴
      await treeWrap.click({ button: 'right', position: { x: 100, y: 350 } });
      await contentPage.waitForTimeout(300);
      const pasteItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /粘贴/ });
      await pasteItem.click();
      await contentPage.waitForTimeout(500);
      // 验证新文件夹出现
      const allFolders = contentPage.locator('.el-tree-node__content').filter({ hasText: '父文件夹' });
      await expect(allFolders).toHaveCount(2, { timeout: 5000 });
      // 验证子节点也被复制（分别在两个文件夹下各存在一个子节点）
      const firstFolderNode = allFolders.nth(0).locator('xpath=ancestor::div[contains(@class,"el-tree-node")]');
      const firstExpandIcon = firstFolderNode.locator('.el-tree-node__expand-icon').first();
      const firstExpandClass = await firstExpandIcon.getAttribute('class');
      if (!firstExpandClass?.includes('expanded')) {
        await firstExpandIcon.click();
        await contentPage.waitForTimeout(200);
      }
      const firstChildNode = firstFolderNode
        .locator('.el-tree-node__children .el-tree-node__content')
        .filter({ hasText: '子节点HTTP' });
      await expect(firstChildNode).toHaveCount(1, { timeout: 5000 });
      const secondFolderNode = allFolders.nth(1).locator('xpath=ancestor::div[contains(@class,"el-tree-node")]');
      const secondExpandIcon = secondFolderNode.locator('.el-tree-node__expand-icon').first();
      const secondExpandClass = await secondExpandIcon.getAttribute('class');
      if (!secondExpandClass?.includes('expanded')) {
        await secondExpandIcon.click();
        await contentPage.waitForTimeout(200);
      }
      const secondChildNode = secondFolderNode
        .locator('.el-tree-node__ch')
        .filter({ hasText: '子节点HTTP' });
      await expect(secondChildNode).toHaveCount(1, { timeout: 5000 });
    });
  });
  test.describe('复制混合节点', () => {
    // 批量复制不同类型节点
    test('批量复制不同类型节点粘贴到根节点下', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 创建HTTP节点
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      let newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      let addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      let nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('混合HTTP节点');
      let confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 创建WebSocket节点
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('混合WebSocket节点');
      const wsRadio = addFileDialog.locator('.el-radio').filter({ hasText: 'WebSocket' }).first();
      await wsRadio.click();
      await contentPage.waitForTimeout(200);
      confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 多选节点
      const httpNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '混合HTTP节点' });
      await httpNode.click();
      await contentPage.waitForTimeout(200);
      await contentPage.keyboard.down('Control');
      const wsNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '混合WebSocket节点' });
      await wsNode.click();
      await contentPage.keyboard.up('Control');
      await contentPage.waitForTimeout(300);
      // 右键批量复制
      await httpNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      const batchCopyItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /批量复制/ });
      await batchCopyItem.click();
      await contentPage.waitForTimeout(300);
      // 在空白区域右键粘贴
      await treeWrap.click({ button: 'right', position: { x: 100, y: 400 } });
      await contentPage.waitForTimeout(300);
      const pasteItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /粘贴/ });
      await pasteItem.click();
      await contentPage.waitForTimeout(500);
      // 验证新节点出现
      const allHttpNodes = contentPage.locator('.el-tree-node__content').filter({ hasText: '混合HTTP节点' });
      const allWsNodes = contentPage.locator('.el-tree-node__content').filter({ hasText: '混合WebSocket节点' });
      await expect(allHttpNodes).toHaveCount(2, { timeout: 5000 });
      await expect(allWsNodes).toHaveCount(2, { timeout: 5000 });
    });
  });
  test.describe('快捷键复制粘贴', () => {
    // 使用Ctrl+C和Ctrl+V复制粘贴节点
    test('使用Ctrl+C和Ctrl+V复制粘贴节点', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      const treeWrap = contentPage.locator('.tree-wrap');
      // 创建HTTP节点
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('快捷键测试节点');
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 选中节点
      const sourceNode = contentPage.locator('.custom-tree-node').filter({ hasText: '快捷键测试节点' });
      await sourceNode.click();
      await contentPage.waitForTimeout(200);
      // 使用Ctrl+C复制
      await contentPage.keyboard.press('Control+c');
      await contentPage.waitForTimeout(300);
      // 将“当前操作节点”切换为根节点（tree-wrap 右键会设置 currentOperationalNode 为 null）
      await treeWrap.click({ button: 'right', position: { x: 100, y: 300 } });
      await contentPage.waitForTimeout(200);
      await contentPage.keyboard.press('Escape');
      await contentPage.waitForTimeout(200);
      // 保持焦点在节点上触发 keydown，但不触发 click（避免 currentOperationalNode 被重新赋值为 http 节点）
      await sourceNode.focus();
      // 使用Ctrl+V粘贴
      await contentPage.keyboard.press('Control+v');
      await contentPage.waitForTimeout(500);
      // 验证新节点出现
      const allNodes = contentPage.locator('.custom-tree-node').filter({ hasText: '快捷键测试节点' });
      await expect(allNodes).toHaveCount(2, { timeout: 5000 });
    });
  });
});
