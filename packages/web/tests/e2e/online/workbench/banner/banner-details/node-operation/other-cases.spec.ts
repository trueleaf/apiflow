import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

test.describe('OtherCases', () => {
  // 在根节点新增,粘贴非folder节点,会排序在末尾
  test('在根节点新增/粘贴非folder节点,会排序在末尾', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const treeWrap = contentPage.locator('.tree-wrap');
    // 首先创建一个文件夹
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
    // 创建第一个HTTP节点
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const newInterfaceItem1 = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
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
    const newInterfaceItem2 = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
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
    const nodeTexts = await treeNodes.evaluateAll((els) => els.map((el) => (el.textContent ?? '').replace(/\s+/g, ' ').trim()));
    const folderIndex = nodeTexts.findIndex((t) => t.includes('测试文件夹'));
    const http1Index = nodeTexts.findIndex((t) => t.includes('HTTP节点1'));
    const http2Index = nodeTexts.findIndex((t) => t.includes('HTTP节点2'));
    expect(folderIndex).toBeGreaterThanOrEqual(0);
    expect(http1Index).toBeGreaterThanOrEqual(0);
    expect(http2Index).toBeGreaterThanOrEqual(0);
    expect(folderIndex).toBeLessThan(http1Index);
    expect(http1Index).toBeLessThan(http2Index);
  });
  // 在根节点新增,粘贴folder节点,会排序到根目录下最后一个目录节点下面
  test('在根节点新增/粘贴folder节点,会排序到根目录下最后一个目录节点下面', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const treeWrap = contentPage.locator('.tree-wrap');
    // 首先创建一个HTTP节点
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
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
    const newFolderItem1 = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
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
    const newFolderItem2 = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
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
    const nodeTexts = await treeNodes.evaluateAll((els) => els.map((el) => (el.textContent ?? '').replace(/\s+/g, ' ').trim()));
    const httpIndex = nodeTexts.findIndex((t) => t.includes('HTTP节点'));
    const folderIndexes = nodeTexts
      .map((t, idx) => ({ t, idx }))
      .filter((x) => x.t.includes('文件夹1') || x.t.includes('文件夹2'))
      .map((x) => x.idx);
    expect(httpIndex).toBeGreaterThanOrEqual(0);
    expect(folderIndexes.length).toBeGreaterThanOrEqual(2);
    for (const folderIndex of folderIndexes) {
      expect(folderIndex).toBeLessThan(httpIndex);
    }
  });
  // 在根节点粘贴包含folder节点的混合节点,folder节点会排序到根目录下最后一个目录节点下面,非folder节点会排序在末尾
  test('在根节点粘贴包含folder节点的混合节点,folder排序到文件夹区域,非folder排序在末尾', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const treeWrap = contentPage.locator('.tree-wrap');
    // 创建一个文件夹
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const newFolderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
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
    // 多选节点：先点击文件夹，然后Ctrl+点击HTTP节点
    const folderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '源文件夹' });
    await folderNode.click();
    await contentPage.waitForTimeout(200);
    await contentPage.keyboard.down('Control');
    const httpNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '源HTTP节点' });
    await httpNode.click();
    await contentPage.keyboard.up('Control');
    await contentPage.waitForTimeout(300);
    // 右键批量复制
    await folderNode.click({ button: 'right' });
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
    // 获取所有根节点
    const treeNodes = contentPage.locator('.el-tree > .el-tree-node');
    const nodeTexts = await treeNodes.evaluateAll((els) => els.map((el) => (el.textContent ?? '').replace(/\s+/g, ' ').trim()));
    const folderIndexes = nodeTexts
      .map((t, idx) => ({ t, idx }))
      .filter((x) => x.t.includes('源文件夹'))
      .map((x) => x.idx);
    const httpIndexes = nodeTexts
      .map((t, idx) => ({ t, idx }))
      .filter((x) => x.t.includes('源HTTP节点'))
      .map((x) => x.idx);
    expect(folderIndexes.length).toBeGreaterThanOrEqual(2);
    expect(httpIndexes.length).toBeGreaterThanOrEqual(2);
    const maxFolderIndex = Math.max(...folderIndexes);
    const minHttpIndex = Math.min(...httpIndexes);
    expect(maxFolderIndex).toBeLessThan(minHttpIndex);
  });
  // 新增节点后刷新页面节点顺序保持不变
  test('新增节点后刷新页面节点顺序保持不变', async ({ contentPage, clearCache, createProject, createNode, loginAccount, reload }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    let contextMenu = contentPage.locator('.s-contextmenu');
    let newFolderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建文件夹/ });
    await newFolderItem.click();
    await contentPage.waitForTimeout(300);
    let folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
    await expect(folderDialog).toBeVisible({ timeout: 5000 });
    await folderDialog.locator('input').first().fill('刷新顺序文件夹');
    await folderDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    await treeWrap.click({ button: 'right', position: { x: 100, y: 220 } });
    await contentPage.waitForTimeout(300);
    contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    let addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('刷新顺序HTTP1');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    await treeWrap.click({ button: 'right', position: { x: 100, y: 240 } });
    await contentPage.waitForTimeout(300);
    contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem2 = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem2.click();
    await contentPage.waitForTimeout(300);
    addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('刷新顺序HTTP2');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    const beforeReloadTexts = await contentPage.locator('.el-tree > .el-tree-node').evaluateAll((els) => {
      return els.map((el) => (el.textContent ?? '').replace(/\s+/g, ' ').trim());
    });
    await reload();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(800);
    const afterReloadTexts = await contentPage.locator('.el-tree > .el-tree-node').evaluateAll((els) => {
      return els.map((el) => (el.textContent ?? '').replace(/\s+/g, ' ').trim());
    });
    const beforeFiltered = beforeReloadTexts.filter((item) => item.includes('刷新顺序文件夹') || item.includes('刷新顺序HTTP1') || item.includes('刷新顺序HTTP2'));
    const afterFiltered = afterReloadTexts.filter((item) => item.includes('刷新顺序文件夹') || item.includes('刷新顺序HTTP1') || item.includes('刷新顺序HTTP2'));
    expect(beforeFiltered).toEqual(afterFiltered);
  });
});


