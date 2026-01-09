import { test, expect } from '../../../fixtures/electron.fixture';
import type { Locator } from '@playwright/test';

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getRecyclerDeletedDocByName = (recyclerPage: Locator, name: string) =>
  recyclerPage.locator('.docinfo', {
    has: recyclerPage.locator('.node-info', {
      hasText: new RegExp(`${escapeRegExp(name)}(?![A-Za-z0-9])`),
    }),
  });

test.describe('Trash', () => {
  test('打开回收站页面,显示回收站标题和搜索条件', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const recyclerItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /回收站/ });
    await recyclerItem.click();
    await contentPage.waitForTimeout(500);
    const recyclerPage = contentPage.locator('.recycler');
    await expect(recyclerPage).toBeVisible({ timeout: 5000 });
    const title = recyclerPage.locator('.title-text');
    await expect(title).toContainText(/接口回收站/);
    const dateRadios = recyclerPage.locator('.el-radio-group .el-radio');
    await expect(dateRadios.first()).toBeVisible();
    const docNameInput = recyclerPage.locator('.el-input').filter({ hasText: /接口名称/ }).or(recyclerPage.locator('input[placeholder*="接口名称"]'));
    await expect(docNameInput.first()).toBeVisible();
  });
  test('删除接口后在回收站中显示被删除的接口', async ({ topBarPage, contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await createNode(contentPage, { nodeType: 'http', name: '待删除接口' });
    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });
    const treeNode = bannerTree.locator('.el-tree-node__content', { hasText: '待删除接口' }).first();
    await expect(treeNode).toBeVisible({ timeout: 5000 });
    await treeNode.click({ button: 'right' });
    const contextMenu = contentPage.locator('.s-contextmenu');
    await expect(contextMenu).toBeVisible({ timeout: 3000 });
    const deleteOption = contextMenu.locator('.s-contextmenu-item').filter({ hasText: /删除/ });
    await deleteOption.click();
    const confirmDialog = contentPage.locator('.cl-confirm-container');
    await expect(confirmDialog).toBeVisible({ timeout: 3000 });
    const confirmBtn = confirmDialog.locator('.el-button--primary');
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    await expect(treeNode).not.toBeVisible({ timeout: 5000 });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const recyclerItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /回收站/ });
    await recyclerItem.click();
    await contentPage.waitForTimeout(500);
    const recyclerPage = contentPage.locator('.recycler');
    await expect(recyclerPage).toBeVisible({ timeout: 5000 });
    const deletedDoc = recyclerPage.locator('.docinfo').filter({ hasText: '待删除接口' });
    await expect(deletedDoc).toBeVisible({ timeout: 5000 });
  });
  test('恢复已删除的接口,接口重新出现在导航树中', async ({ topBarPage, contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await createNode(contentPage, { nodeType: 'http', name: '待恢复接口' });
    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });
    const treeNode = bannerTree.locator('.el-tree-node__content', { hasText: '待恢复接口' }).first();
    await expect(treeNode).toBeVisible({ timeout: 5000 });
    await treeNode.click({ button: 'right' });
    const contextMenu2 = contentPage.locator('.s-contextmenu');
    await expect(contextMenu2).toBeVisible({ timeout: 3000 });
    const deleteOption = contextMenu2.locator('.s-contextmenu-item').filter({ hasText: /删除/ });
    await deleteOption.click();
    const confirmDialog = contentPage.locator('.cl-confirm-container');
    await expect(confirmDialog).toBeVisible({ timeout: 3000 });
    const confirmBtn = confirmDialog.locator('.el-button--primary');
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const recyclerItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /回收站/ });
    await recyclerItem.click();
    await contentPage.waitForTimeout(500);
    const recyclerPage = contentPage.locator('.recycler');
    await expect(recyclerPage).toBeVisible({ timeout: 5000 });
    const deletedDoc = recyclerPage.locator('.docinfo').filter({ hasText: '待恢复接口' });
    await expect(deletedDoc).toBeVisible({ timeout: 5000 });
    const restoreBtn = deletedDoc.locator('.el-button').filter({ hasText: /恢复/ });
    await restoreBtn.click();
    const restoreConfirmDialog = contentPage.locator('.cl-confirm-container');
    await expect(restoreConfirmDialog).toBeVisible({ timeout: 3000 });
    const restoreConfirmBtn = restoreConfirmDialog.locator('.el-button--primary');
    await restoreConfirmBtn.click();
    await contentPage.waitForTimeout(500);
    await expect(deletedDoc).not.toBeVisible({ timeout: 5000 });
    const restoredNode = bannerTree.locator('.el-tree-node__content', { hasText: '待恢复接口' }).first();
    await expect(restoredNode).toBeVisible({ timeout: 5000 });
  });
  test('删除所有类型节点后逐个恢复', async ({ topBarPage, contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });
    await createNode(contentPage, { nodeType: 'folder', name: '类型-文件夹' });
    const fileList: { name: string; nodeType: 'http' | 'websocket' }[] = [
      { name: '类型-HTTP', nodeType: 'http' },
      { name: '类型-WebSocket', nodeType: 'websocket' },
    ];
    for (let i = 0; i < fileList.length; i += 1) {
      const item = fileList[i];
      await createNode(contentPage, { nodeType: item.nodeType, name: item.name });
    }
    for (let i = 0; i < allNodeNames.length; i += 1) {
      const nodeName = allNodeNames[i];
      const node = bannerTree.locator('.el-tree-node__content', { hasText: nodeName }).first();
      await expect(node).toBeVisible({ timeout: 5000 });
    }
    for (let i = allNodeNames.length - 1; i >= 0; i -= 1) {
      const nodeName = allNodeNames[i];
      const node = bannerTree.locator('.el-tree-node__content', { hasText: nodeName }).first();
      await node.click({ button: 'right' });
      const contextMenu = contentPage.locator('.s-contextmenu');
      await expect(contextMenu).toBeVisible({ timeout: 3000 });
      await contextMenu.locator('.s-contextmenu-item').filter({ hasText: /删除/ }).click();
      const confirmDialog = contentPage.locator('.cl-confirm-container');
      await expect(confirmDialog).toBeVisible({ timeout: 3000 });
      await confirmDialog.locator('.el-button--primary').click();
      await contentPage.waitForTimeout(500);
    }
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const recyclerItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /回收站/ });
    await recyclerItem.click();
    await contentPage.waitForTimeout(500);
    const recyclerPage = contentPage.locator('.recycler');
    await expect(recyclerPage).toBeVisible({ timeout: 5000 });
    await expect(recyclerPage.locator('.docinfo').first()).toBeVisible({ timeout: 5000 });
    for (let i = 0; i < allNodeNames.length; i += 1) {
      const nodeName = allNodeNames[i];
      const deletedDoc = getRecyclerDeletedDocByName(recyclerPage, nodeName);
      await expect(deletedDoc).toBeVisible({ timeout: 5000 });
    }
    for (let i = 0; i < allNodeNames.length; i += 1) {
      const nodeName = allNodeNames[i];
      const deletedDoc = getRecyclerDeletedDocByName(recyclerPage, nodeName);
      await deletedDoc.locator('.el-button').filter({ hasText: /恢复/ }).click();
      const restoreConfirmDialog = contentPage.locator('.cl-confirm-container');
       await expect(restoreConfirmDialog).toBeVisible({ timeout: 3000 });
       await restoreConfirmDialog.locator('.el-button--primary').click();
      await contentPage.waitForTimeout(500);
      await expect(deletedDoc).not.toBeVisible({ timeout: 5000 });
      const restoredNode = bannerTree.locator('.el-tree-node__content', { hasText: nodeName }).first();
      await expect(restoredNode).toBeVisible({ timeout: 5000 });
    }
  });
  test('父子节点同时删除后恢复时同步恢复全部', async ({ topBarPage, contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });
    const groupList: { folderName: string; childName: string; nodeType: 'http' | 'websocket'; restoreTarget: 'folder' | 'child' }[] = [
      { folderName: '父节点1', childName: '子节点1-HTTP', nodeType: 'http', restoreTarget: 'child' },
      { folderName: '父节点2', childName: '子节点2-WebSocketMock', nodeType: 'websocket', restoreTarget: 'folder' },
    ];
    for (let i = 0; i < groupList.length; i += 1) {
      const group = groupList[i];
      const folderId = await createNode(contentPage, { nodeType: 'folder', name: group.folderName });
      await createNode(contentPage, { nodeType: group.nodeType, name: group.childName, pid: folderId });
    }
    for (let i = 0; i < groupList.length; i += 1) {
      const group = groupList[i];
      const folderTreeNode = bannerTree.locator('.el-tree-node').filter({ hasText: group.folderName }).first();
      const expandIcon = folderTreeNode.locator('.el-tree-node__expand-icon').first();
      const expandClass = await expandIcon.getAttribute('class');
      if (expandClass && !expandClass.includes('expanded')) {
        await expandIcon.click();
        await contentPage.waitForTimeout(200);
      }
      const childNode = bannerTree.locator('.el-tree-node__content', { hasText: group.childName }).first();
      await expect(childNode).toBeVisible({ timeout: 5000 });
      await childNode.click({ button: 'right' });
      const childMenu = contentPage.locator('.s-contextmenu');
      await expect(childMenu).toBeVisible({ timeout: 3000 });
      await childMenu.locator('.s-contextmenu-item').filter({ hasText: /删除/ }).click();
      const confirmDialog1 = contentPage.locator('.cl-confirm-container');
      await expect(confirmDialog1).toBeVisible({ timeout: 3000 });
      await confirmDialog1.locator('.el-button--primary').click();
      await contentPage.waitForTimeout(500);
      const folderNode = bannerTree.locator('.el-tree-node__content', { hasText: group.folderName }).first();
      await folderNode.click({ button: 'right' });
      const folderMenu = contentPage.locator('.s-contextmenu');
      await expect(folderMenu).toBeVisible({ timeout: 3000 });
      await folderMenu.locator('.s-contextmenu-item').filter({ hasText: /删除/ }).click();
      const confirmDialog2 = contentPage.locator('.cl-confirm-container');
      await expect(confirmDialog2).toBeVisible({ timeout: 3000 });
      await confirmDialog2.locator('.el-button--primary').click();
      await contentPage.waitForTimeout(500);
    }
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const recyclerItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /回收站/ });
    await recyclerItem.click();
    await contentPage.waitForTimeout(500);
    const recyclerPage = contentPage.locator('.recycler');
    await expect(recyclerPage).toBeVisible({ timeout: 5000 });
    for (let i = 0; i < groupList.length; i += 1) {
      const group = groupList[i];
      const deletedFolder = recyclerPage.locator('.docinfo').filter({ hasText: group.folderName });
      const deletedChild = recyclerPage.locator('.docinfo').filter({ hasText: group.childName });
      await expect(deletedFolder).toBeVisible({ timeout: 5000 });
      await expect(deletedChild).toBeVisible({ timeout: 5000 });
    }
    for (let i = 0; i < groupList.length; i += 1) {
      const group = groupList[i];
      const deletedFolder = recyclerPage.locator('.docinfo').filter({ hasText: group.folderName });
      const deletedChild = recyclerPage.locator('.docinfo').filter({ hasText: group.childName });
      const restoreTarget = group.restoreTarget === 'child' ? deletedChild : deletedFolder;
      await restoreTarget.locator('.el-button').filter({ hasText: /恢复/ }).click();
      const restoreConfirmDialog = contentPage.locator('.cl-confirm-container');
      await expect(restoreConfirmDialog).toBeVisible({ timeout: 3000 });
      await restoreConfirmDialog.locator('.el-button--primary').click();
      await contentPage.waitForTimeout(500);
      await expect(deletedFolder).not.toBeVisible({ timeout: 5000 });
      await expect(deletedChild).not.toBeVisible({ timeout: 5000 });
      const folderNode = bannerTree.locator('.el-tree-node__content', { hasText: group.folderName }).first();
      await expect(folderNode).toBeVisible({ timeout: 5000 });
      const restoredFolderTreeNode = bannerTree.locator('.el-tree-node').filter({ hasText: group.folderName }).first();
      const restoredExpandIcon = restoredFolderTreeNode.locator('.el-tree-node__expand-icon').first();
      const restoredExpandClass = await restoredExpandIcon.getAttribute('class');
      if (restoredExpandClass && !restoredExpandClass.includes('expanded')) {
        await restoredExpandIcon.click();
        await contentPage.waitForTimeout(200);
      }
      const childNode = bannerTree.locator('.el-tree-node__content', { hasText: group.childName }).first();
      await expect(childNode).toBeVisible({ timeout: 5000 });
    }
  });
});


