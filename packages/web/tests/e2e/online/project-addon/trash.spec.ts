import { test, expect } from '../../../fixtures/electron-online.fixture';
import type { Locator } from '@playwright/test';

// 转义正则表达式特殊字符
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 根据节点名称精确定位回收站中的已删除节点
const getRecyclerDeletedDocByName = (recyclerPage: Locator, name: string) =>
  recyclerPage.locator('.docinfo', {
    has: recyclerPage.locator('.node-info', {
      hasText: new RegExp(`${escapeRegExp(name)}(?![A-Za-z0-9])`),
    }),
  });

test.describe('Trash/回收站', () => {
  test('打开回收站页面,显示回收站标题和搜索条件', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 打开回收站
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const recyclerItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /回收站/ });
    await recyclerItem.click();
    await contentPage.waitForTimeout(500);
    // 验证回收站页面和搜索条件显示
    const recyclerPage = contentPage.locator('.recycler');
    await expect(recyclerPage).toBeVisible({ timeout: 5000 });
    const title = recyclerPage.locator('.title-text');
    await expect(title).toContainText(/接口回收站/);
    const operatorCheckbox = recyclerPage.locator('.el-checkbox-group .el-checkbox').first();
    await expect(operatorCheckbox).toBeVisible();
    const dateRadios = recyclerPage.locator('.el-radio-group .el-radio');
    await expect(dateRadios.first()).toBeVisible();
    const docNameInput = recyclerPage.locator('.el-input').filter({ hasText: /接口名称/ }).or(recyclerPage.locator('input[placeholder*="接口名称"]'));
    await expect(docNameInput.first()).toBeVisible();
    const urlInput = recyclerPage.locator('.el-input').filter({ hasText: /接口url/ }).or(recyclerPage.locator('input[placeholder*="接口url"]'));
    await expect(urlInput.first()).toBeVisible();
  });

  test('删除所有类型节点后在回收站中展示', async ({ topBarPage, contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });
    // 创建所有类型节点（folder, http, websocket, httpMock, websocketMock）
    const nodeList: { name: string; nodeType: 'http' | 'websocket' | 'httpMock' | 'websocketMock' | 'folder' }[] = [
      { name: '类型-文件夹', nodeType: 'folder' },
      { name: '类型-HTTP', nodeType: 'http' },
      { name: '类型-WebSocket', nodeType: 'websocket' },
      { name: '类型-HTTPMock', nodeType: 'httpMock' },
      { name: '类型-WebSocketMock', nodeType: 'websocketMock' },
    ];
    for (let i = 0; i < nodeList.length; i += 1) {
      const item = nodeList[i];
      await createNode(contentPage, { nodeType: item.nodeType, name: item.name });
    }
    for (let i = 0; i < nodeList.length; i += 1) {
      const nodeName = nodeList[i].name;
      const node = bannerTree.locator('.el-tree-node__content', { hasText: nodeName }).first();
      await expect(node).toBeVisible({ timeout: 5000 });
    }
    // 倒序删除所有节点
    for (let i = nodeList.length - 1; i >= 0; i -= 1) {
      const nodeName = nodeList[i].name;
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
    // 打开回收站
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const recyclerItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /回收站/ });
    await recyclerItem.click();
    await contentPage.waitForTimeout(500);
    // 验证所有节点都显示在回收站中
    const recyclerPage = contentPage.locator('.recycler');
    await expect(recyclerPage).toBeVisible({ timeout: 5000 });
    await expect(recyclerPage.locator('.docinfo').first()).toBeVisible({ timeout: 5000 });
    for (let i = 0; i < nodeList.length; i += 1) {
      const nodeName = nodeList[i].name;
      const deletedDoc = getRecyclerDeletedDocByName(recyclerPage, nodeName);
      await expect(deletedDoc).toBeVisible({ timeout: 5000 });
    }
  });

  test('验证各类型节点在回收站中的展示格式', async ({ topBarPage, contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 创建5种不同类型的节点
    await createNode(contentPage, { nodeType: 'folder', name: '文件夹节点' });
    await createNode(contentPage, { nodeType: 'http', name: 'HTTP节点' });
    await createNode(contentPage, { nodeType: 'websocket', name: 'WebSocket节点' });
    await createNode(contentPage, { nodeType: 'httpMock', name: 'HTTPMock节点' });
    await createNode(contentPage, { nodeType: 'websocketMock', name: 'WSMock节点' });
    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    // 倒序删除所有节点
    const nodeNames = ['WSMock节点', 'HTTPMock节点', 'WebSocket节点', 'HTTP节点', '文件夹节点'];
    for (let i = 0; i < nodeNames.length; i += 1) {
      const nodeName = nodeNames[i];
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
    // 验证各类型节点的图标和展示格式
    const folderDoc = getRecyclerDeletedDocByName(recyclerPage, '文件夹节点');
    await expect(folderDoc.locator('.folder-icon')).toBeVisible();
    await expect(folderDoc.locator('.node-info')).toContainText('文件夹节点');
    const httpDoc = getRecyclerDeletedDocByName(recyclerPage, 'HTTP节点');
    await expect(httpDoc.locator('.file-icon')).toBeVisible();
    await expect(httpDoc.locator('.node-info')).toContainText('HTTP节点');
    await expect(httpDoc.locator('.node-path')).toBeVisible();
    const wsDoc = getRecyclerDeletedDocByName(recyclerPage, 'WebSocket节点');
    await expect(wsDoc.locator('.ws-icon')).toBeVisible();
    await expect(wsDoc.locator('.node-info')).toContainText('WebSocket节点');
    await expect(wsDoc.locator('.node-path')).toBeVisible();
    const httpMockDoc = getRecyclerDeletedDocByName(recyclerPage, 'HTTPMock节点');
    await expect(httpMockDoc.locator('.mock-icon')).toBeVisible();
    await expect(httpMockDoc.locator('.node-info')).toContainText('HTTPMock节点');
    await expect(httpMockDoc.locator('.node-path')).toBeVisible();
    const wsMockDoc = getRecyclerDeletedDocByName(recyclerPage, 'WSMock节点');
    await expect(wsMockDoc.locator('.ws-mock-icon')).toBeVisible();
    await expect(wsMockDoc.locator('.node-info')).toContainText('WSMock节点');
    await expect(wsMockDoc.locator('.node-path')).toBeVisible();
  });

  test('验证节点详情展示-HTTP类型', async ({ topBarPage, contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await createNode(contentPage, { nodeType: 'http', name: 'HTTP详情测试' });
    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    const node = bannerTree.locator('.el-tree-node__content', { hasText: 'HTTP详情测试' }).first();
    // 删除节点
    await node.click({ button: 'right' });
    const contextMenu = contentPage.locator('.s-contextmenu');
    await expect(contextMenu).toBeVisible({ timeout: 3000 });
    await contextMenu.locator('.s-contextmenu-item').filter({ hasText: /删除/ }).click();
    const confirmDialog = contentPage.locator('.cl-confirm-container');
    await expect(confirmDialog).toBeVisible({ timeout: 3000 });
    await confirmDialog.locator('.el-button--primary').click();
    await contentPage.waitForTimeout(500);
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const recyclerItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /回收站/ });
    await recyclerItem.click();
    await contentPage.waitForTimeout(500);
    const recyclerPage = contentPage.locator('.recycler');
    await expect(recyclerPage).toBeVisible({ timeout: 5000 });
    const deletedDoc = getRecyclerDeletedDocByName(recyclerPage, 'HTTP详情测试');
    await expect(deletedDoc).toBeVisible({ timeout: 5000 });
    // 打开详情弹窗并验证HTTP类型的详情字段
    const detailBtn = deletedDoc.locator('.el-button').filter({ hasText: /详情/ });
    await detailBtn.click();
    await contentPage.waitForTimeout(300);
    const detailPopover = contentPage.locator('.doc-detail');
    await expect(detailPopover).toBeVisible({ timeout: 5000 });
    await expect(detailPopover.locator('text=/请求方式/')).toBeVisible();
    await expect(detailPopover.locator('text=/接口名称/')).toBeVisible();
    await expect(detailPopover.locator('text=/请求地址/')).toBeVisible();
    await expect(detailPopover.locator('text=/维护人员/')).toBeVisible();
    await expect(detailPopover.locator('text=/创建人员/')).toBeVisible();
    await expect(detailPopover.locator('text=/更新日期/')).toBeVisible();
    await expect(detailPopover.locator('text=/创建日期/')).toBeVisible();
    const closeBtn = detailPopover.locator('.close');
    await closeBtn.click();
    await expect(detailPopover).not.toBeVisible({ timeout: 3000 });
  });

  test('验证节点详情展示-Folder类型', async ({ topBarPage, contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await createNode(contentPage, { nodeType: 'folder', name: 'Folder详情测试' });
    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    const node = bannerTree.locator('.el-tree-node__content', { hasText: 'Folder详情测试' }).first();
    await node.click({ button: 'right' });
    const contextMenu = contentPage.locator('.s-contextmenu');
    await expect(contextMenu).toBeVisible({ timeout: 3000 });
    await contextMenu.locator('.s-contextmenu-item').filter({ hasText: /删除/ }).click();
    const confirmDialog = contentPage.locator('.cl-confirm-container');
    await expect(confirmDialog).toBeVisible({ timeout: 3000 });
    await confirmDialog.locator('.el-button--primary').click();
    await contentPage.waitForTimeout(500);
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const recyclerItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /回收站/ });
    await recyclerItem.click();
    await contentPage.waitForTimeout(500);
    const recyclerPage = contentPage.locator('.recycler');
    await expect(recyclerPage).toBeVisible({ timeout: 5000 });
    const deletedDoc = getRecyclerDeletedDocByName(recyclerPage, 'Folder详情测试');
    await expect(deletedDoc).toBeVisible({ timeout: 5000 });
    // 打开详情弹窗并验证Folder类型的详情字段
    const detailBtn = deletedDoc.locator('.el-button').filter({ hasText: /详情/ });
    await detailBtn.click();
    await contentPage.waitForTimeout(300);
    const detailPopover = contentPage.locator('.doc-detail');
    await expect(detailPopover).toBeVisible({ timeout: 5000 });
    await expect(detailPopover.locator('text=/目录名称/')).toBeVisible();
    await expect(detailPopover.locator('text=/Folder详情测试/')).toBeVisible();
  });

  test('搜索过滤-操作人员过滤', async ({ topBarPage, contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 创建并删除两个测试节点
    await createNode(contentPage, { nodeType: 'http', name: '操作人员测试1' });
    await createNode(contentPage, { nodeType: 'http', name: '操作人员测试2' });
    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    const nodeNames = ['操作人员测试2', '操作人员测试1'];
    for (let i = 0; i < nodeNames.length; i += 1) {
      const nodeName = nodeNames[i];
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
    // 测试操作人员过滤
    const operatorCheckboxes = recyclerPage.locator('.el-checkbox-group .el-checkbox');
    const operatorCount = await operatorCheckboxes.count();
    if (operatorCount > 0) {
      const firstCheckbox = operatorCheckboxes.first();
      await firstCheckbox.click();
      await contentPage.waitForTimeout(800);
      await expect(recyclerPage.locator('.docinfo').first()).toBeVisible();
      const clearOperatorBtn = recyclerPage.locator('.el-button').filter({ hasText: /清空/ }).first();
      await clearOperatorBtn.click();
      await contentPage.waitForTimeout(800);
    }
  });

  test('搜索过滤-日期范围过滤', async ({ topBarPage, contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 创建并删除测试节点
    await createNode(contentPage, { nodeType: 'http', name: '日期测试节点' });
    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    const node = bannerTree.locator('.el-tree-node__content', { hasText: '日期测试节点' }).first();
    await node.click({ button: 'right' });
    const contextMenu = contentPage.locator('.s-contextmenu');
    await expect(contextMenu).toBeVisible({ timeout: 3000 });
    await contextMenu.locator('.s-contextmenu-item').filter({ hasText: /删除/ }).click();
    const confirmDialog = contentPage.locator('.cl-confirm-container');
    await expect(confirmDialog).toBeVisible({ timeout: 3000 });
    await confirmDialog.locator('.el-button--primary').click();
    await contentPage.waitForTimeout(500);
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const recyclerItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /回收站/ });
    await recyclerItem.click();
    await contentPage.waitForTimeout(500);
    const recyclerPage = contentPage.locator('.recycler');
    await expect(recyclerPage).toBeVisible({ timeout: 5000 });
    const deletedDoc = getRecyclerDeletedDocByName(recyclerPage, '日期测试节点');
    await expect(deletedDoc).toBeVisible({ timeout: 5000 });
    // 测试各日期范围过滤
    const todayRadio = recyclerPage.locator('.el-radio').filter({ hasText: /^今天$/ });
    await todayRadio.click();
    await contentPage.waitForTimeout(500);
    await expect(deletedDoc).toBeVisible();
    const yesterdayRadio = recyclerPage.locator('.el-radio').filter({ hasText: /^昨天$/ });
    await yesterdayRadio.click();
    await contentPage.waitForTimeout(500);
    const twoDaysRadio = recyclerPage.locator('.el-radio').filter({ hasText: /^近两天$/ });
    await twoDaysRadio.click();
    await contentPage.waitForTimeout(500);
    await expect(deletedDoc).toBeVisible();
    const sevenDaysRadio = recyclerPage.locator('.el-radio').filter({ hasText: /^近七天$/ });
    await sevenDaysRadio.click();
    await contentPage.waitForTimeout(500);
    await expect(deletedDoc).toBeVisible();
    const clearDateBtn = recyclerPage.locator('.el-button').filter({ hasText: /清空/ }).nth(1);
    await clearDateBtn.click();
    await contentPage.waitForTimeout(500);
  });

  test('搜索过滤-接口名称和URL过滤', async ({ topBarPage, contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 创建并删除测试节点
    await createNode(contentPage, { nodeType: 'http', name: '搜索测试接口' });
    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    const node = bannerTree.locator('.el-tree-node__content', { hasText: '搜索测试接口' }).first();
    await node.click({ button: 'right' });
    const contextMenu = contentPage.locator('.s-contextmenu');
    await expect(contextMenu).toBeVisible({ timeout: 3000 });
    await contextMenu.locator('.s-contextmenu-item').filter({ hasText: /删除/ }).click();
    const confirmDialog = contentPage.locator('.cl-confirm-container');
    await expect(confirmDialog).toBeVisible({ timeout: 3000 });
    await confirmDialog.locator('.el-button--primary').click();
    await contentPage.waitForTimeout(500);
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const recyclerItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /回收站/ });
    await recyclerItem.click();
    await contentPage.waitForTimeout(500);
    const recyclerPage = contentPage.locator('.recycler');
    await expect(recyclerPage).toBeVisible({ timeout: 5000 });
    const deletedDoc = getRecyclerDeletedDocByName(recyclerPage, '搜索测试接口');
    await expect(deletedDoc).toBeVisible({ timeout: 5000 });
    // 测试接口名称模糊搜索
    const docNameInput = recyclerPage.locator('input[placeholder*="接口名称"]').or(recyclerPage.locator('.el-input').filter({ hasText: /接口名称/ }).locator('input'));
    await docNameInput.first().fill('搜索测试');
    await contentPage.waitForTimeout(600);
    await expect(deletedDoc).toBeVisible();
    await docNameInput.first().clear();
    await contentPage.waitForTimeout(600);
    // 测试接口URL模糊搜索
    const urlInput = recyclerPage.locator('input[placeholder*="接口url"]').or(recyclerPage.locator('.el-input').filter({ hasText: /接口url/ }).locator('input'));
    await urlInput.first().fill('/api');
    await contentPage.waitForTimeout(600);
    await urlInput.first().clear();
    await contentPage.waitForTimeout(600);
    const clearAllBtn = recyclerPage.locator('.el-button').filter({ hasText: /^全部清空$/ });
    await clearAllBtn.click();
    await contentPage.waitForTimeout(500);
  });

  test('恢复单个节点功能验证', async ({ topBarPage, contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 创建并删除节点
    await createNode(contentPage, { nodeType: 'http', name: '待恢复接口' });
    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    const node = bannerTree.locator('.el-tree-node__content', { hasText: '待恢复接口' }).first();
    await expect(node).toBeVisible({ timeout: 5000 });
    await node.click({ button: 'right' });
    const contextMenu = contentPage.locator('.s-contextmenu');
    await expect(contextMenu).toBeVisible({ timeout: 3000 });
    await contextMenu.locator('.s-contextmenu-item').filter({ hasText: /删除/ }).click();
    const confirmDialog = contentPage.locator('.cl-confirm-container');
    await expect(confirmDialog).toBeVisible({ timeout: 3000 });
    await confirmDialog.locator('.el-button--primary').click();
    await contentPage.waitForTimeout(500);
    await expect(node).not.toBeVisible({ timeout: 5000 });
    // 打开回收站
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const recyclerItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /回收站/ });
    await recyclerItem.click();
    await contentPage.waitForTimeout(500);
    const recyclerPage = contentPage.locator('.recycler');
    await expect(recyclerPage).toBeVisible({ timeout: 5000 });
    const deletedDoc = getRecyclerDeletedDocByName(recyclerPage, '待恢复接口');
    await expect(deletedDoc).toBeVisible({ timeout: 5000 });
    // 恢复节点
    const restoreBtn = deletedDoc.locator('.el-button').filter({ hasText: /恢复/ });
    await restoreBtn.click();
    const restoreConfirmDialog = contentPage.locator('.cl-confirm-container');
    await expect(restoreConfirmDialog).toBeVisible({ timeout: 3000 });
    await restoreConfirmDialog.locator('.el-button--primary').click();
    await contentPage.waitForTimeout(500);
    // 验证恢复成功
    await expect(deletedDoc).not.toBeVisible({ timeout: 5000 });
    const restoredNode = bannerTree.locator('.el-tree-node__content', { hasText: '待恢复接口' }).first();
    await expect(restoredNode).toBeVisible({ timeout: 5000 });
  });

  test('恢复所有类型节点', async ({ topBarPage, contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });
    // 创建所有类型的节点
    const nodeList: { name: string; nodeType: 'http' | 'websocket' | 'httpMock' | 'websocketMock' | 'folder' }[] = [
      { name: '恢复-文件夹', nodeType: 'folder' },
      { name: '恢复-HTTP', nodeType: 'http' },
      { name: '恢复-WebSocket', nodeType: 'websocket' },
      { name: '恢复-HTTPMock', nodeType: 'httpMock' },
      { name: '恢复-WSMock', nodeType: 'websocketMock' },
    ];
    for (let i = 0; i < nodeList.length; i += 1) {
      const item = nodeList[i];
      await createNode(contentPage, { nodeType: item.nodeType, name: item.name });
    }
    for (let i = 0; i < nodeList.length; i += 1) {
      const nodeName = nodeList[i].name;
      const node = bannerTree.locator('.el-tree-node__content', { hasText: nodeName }).first();
      await expect(node).toBeVisible({ timeout: 5000 });
    }
    // 倒序删除所有节点
    for (let i = nodeList.length - 1; i >= 0; i -= 1) {
      const nodeName = nodeList[i].name;
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
    for (let i = 0; i < nodeList.length; i += 1) {
      const nodeName = nodeList[i].name;
      const deletedDoc = getRecyclerDeletedDocByName(recyclerPage, nodeName);
      await expect(deletedDoc).toBeVisible({ timeout: 5000 });
    }
    // 逐个恢复所有类型的节点
    for (let i = 0; i < nodeList.length; i += 1) {
      const nodeName = nodeList[i].name;
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

  test('父子节点同时删除后恢复子节点时同步恢复父节点', async ({ topBarPage, contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });
    // 创建父文件夹和子节点
    const folderId = await createNode(contentPage, { nodeType: 'folder', name: '父文件夹' });
    await createNode(contentPage, { nodeType: 'http', name: '子接口', pid: folderId });
    const folderTreeNode = bannerTree.locator('.el-tree-node').filter({ hasText: '父文件夹' }).first();
    const expandIcon = folderTreeNode.locator('.el-tree-node__expand-icon').first();
    const expandClass = await expandIcon.getAttribute('class');
    if (expandClass && !expandClass.includes('expanded')) {
      await expandIcon.click();
      await contentPage.waitForTimeout(200);
    }
    const childNode = bannerTree.locator('.el-tree-node__content', { hasText: '子接口' }).first();
    await expect(childNode).toBeVisible({ timeout: 5000 });
    // 删除子节点和父节点
    await childNode.click({ button: 'right' });
    const childMenu = contentPage.locator('.s-contextmenu');
    await expect(childMenu).toBeVisible({ timeout: 3000 });
    await childMenu.locator('.s-contextmenu-item').filter({ hasText: /删除/ }).click();
    const confirmDialog1 = contentPage.locator('.cl-confirm-container');
    await expect(confirmDialog1).toBeVisible({ timeout: 3000 });
    await confirmDialog1.locator('.el-button--primary').click();
    await contentPage.waitForTimeout(500);
    const folderNode = bannerTree.locator('.el-tree-node__content', { hasText: '父文件夹' }).first();
    await folderNode.click({ button: 'right' });
    const folderMenu = contentPage.locator('.s-contextmenu');
    await expect(folderMenu).toBeVisible({ timeout: 3000 });
    await folderMenu.locator('.s-contextmenu-item').filter({ hasText: /删除/ }).click();
    const confirmDialog2 = contentPage.locator('.cl-confirm-container');
    await expect(confirmDialog2).toBeVisible({ timeout: 3000 });
    await confirmDialog2.locator('.el-button--primary').click();
    await contentPage.waitForTimeout(500);
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const recyclerItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /回收站/ });
    await recyclerItem.click();
    await contentPage.waitForTimeout(500);
    const recyclerPage = contentPage.locator('.recycler');
    await expect(recyclerPage).toBeVisible({ timeout: 5000 });
    const deletedFolder = getRecyclerDeletedDocByName(recyclerPage, '父文件夹');
    const deletedChild = getRecyclerDeletedDocByName(recyclerPage, '子接口');
    await expect(deletedFolder).toBeVisible({ timeout: 5000 });
    await expect(deletedChild).toBeVisible({ timeout: 5000 });
    // 恢复子节点，验证父节点同步恢复
    await deletedChild.locator('.el-button').filter({ hasText: /恢复/ }).click();
    const restoreConfirmDialog = contentPage.locator('.cl-confirm-container');
    await expect(restoreConfirmDialog).toBeVisible({ timeout: 3000 });
    await restoreConfirmDialog.locator('.el-button--primary').click();
    await contentPage.waitForTimeout(500);
    await expect(deletedFolder).not.toBeVisible({ timeout: 5000 });
    await expect(deletedChild).not.toBeVisible({ timeout: 5000 });
    const restoredFolderNode = bannerTree.locator('.el-tree-node__content', { hasText: '父文件夹' }).first();
    await expect(restoredFolderNode).toBeVisible({ timeout: 5000 });
    const restoredFolderTreeNode = bannerTree.locator('.el-tree-node').filter({ hasText: '父文件夹' }).first();
    const restoredExpandIcon = restoredFolderTreeNode.locator('.el-tree-node__expand-icon').first();
    const restoredExpandClass = await restoredExpandIcon.getAttribute('class');
    if (restoredExpandClass && !restoredExpandClass.includes('expanded')) {
      await restoredExpandIcon.click();
      await contentPage.waitForTimeout(200);
    }
    const restoredChildNode = bannerTree.locator('.el-tree-node__content', { hasText: '子接口' }).first();
    await expect(restoredChildNode).toBeVisible({ timeout: 5000 });
  });

  test('父子节点同时删除后恢复父节点时同步恢复子节点', async ({ topBarPage, contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });
    // 创建父文件夹和子节点
    const folderId = await createNode(contentPage, { nodeType: 'folder', name: '父文件夹2' });
    await createNode(contentPage, { nodeType: 'websocket', name: '子WebSocket', pid: folderId });
    const folderTreeNode = bannerTree.locator('.el-tree-node').filter({ hasText: '父文件夹2' }).first();
    const expandIcon = folderTreeNode.locator('.el-tree-node__expand-icon').first();
    const expandClass = await expandIcon.getAttribute('class');
    if (expandClass && !expandClass.includes('expanded')) {
      await expandIcon.click();
      await contentPage.waitForTimeout(200);
    }
    const childNode = bannerTree.locator('.el-tree-node__content', { hasText: '子WebSocket' }).first();
    await expect(childNode).toBeVisible({ timeout: 5000 });
    // 删除子节点和父节点
    await childNode.click({ button: 'right' });
    const childMenu = contentPage.locator('.s-contextmenu');
    await expect(childMenu).toBeVisible({ timeout: 3000 });
    await childMenu.locator('.s-contextmenu-item').filter({ hasText: /删除/ }).click();
    const confirmDialog1 = contentPage.locator('.cl-confirm-container');
    await expect(confirmDialog1).toBeVisible({ timeout: 3000 });
    await confirmDialog1.locator('.el-button--primary').click();
    await contentPage.waitForTimeout(500);
    const folderNode = bannerTree.locator('.el-tree-node__content', { hasText: '父文件夹2' }).first();
    await folderNode.click({ button: 'right' });
    const folderMenu = contentPage.locator('.s-contextmenu');
    await expect(folderMenu).toBeVisible({ timeout: 3000 });
    await folderMenu.locator('.s-contextmenu-item').filter({ hasText: /删除/ }).click();
    const confirmDialog2 = contentPage.locator('.cl-confirm-container');
    await expect(confirmDialog2).toBeVisible({ timeout: 3000 });
    await confirmDialog2.locator('.el-button--primary').click();
    await contentPage.waitForTimeout(500);
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const recyclerItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /回收站/ });
    await recyclerItem.click();
    await contentPage.waitForTimeout(500);
    const recyclerPage = contentPage.locator('.recycler');
    await expect(recyclerPage).toBeVisible({ timeout: 5000 });
    const deletedFolder = getRecyclerDeletedDocByName(recyclerPage, '父文件夹2');
    const deletedChild = getRecyclerDeletedDocByName(recyclerPage, '子WebSocket');
    await expect(deletedFolder).toBeVisible({ timeout: 5000 });
    await expect(deletedChild).toBeVisible({ timeout: 5000 });
    // 恢复父节点，验证子节点同步恢复
    await deletedFolder.locator('.el-button').filter({ hasText: /恢复/ }).click();
    const restoreConfirmDialog = contentPage.locator('.cl-confirm-container');
    await expect(restoreConfirmDialog).toBeVisible({ timeout: 3000 });
    await restoreConfirmDialog.locator('.el-button--primary').click();
    await contentPage.waitForTimeout(500);
    await expect(deletedFolder).not.toBeVisible({ timeout: 5000 });
    await expect(deletedChild).not.toBeVisible({ timeout: 5000 });
    const restoredFolderNode = bannerTree.locator('.el-tree-node__content', { hasText: '父文件夹2' }).first();
    await expect(restoredFolderNode).toBeVisible({ timeout: 5000 });
    const restoredFolderTreeNode = bannerTree.locator('.el-tree-node').filter({ hasText: '父文件夹2' }).first();
    const restoredExpandIcon = restoredFolderTreeNode.locator('.el-tree-node__expand-icon').first();
    const restoredExpandClass = await restoredExpandIcon.getAttribute('class');
    if (restoredExpandClass && !restoredExpandClass.includes('expanded')) {
      await restoredExpandIcon.click();
      await contentPage.waitForTimeout(200);
    }
    const restoredChildNode = bannerTree.locator('.el-tree-node__content', { hasText: '子WebSocket' }).first();
    await expect(restoredChildNode).toBeVisible({ timeout: 5000 });
  });

  test('验证时间分组展示逻辑', async ({ topBarPage, contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 创建并删除测试节点
    await createNode(contentPage, { nodeType: 'http', name: '时间分组测试' });
    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    const node = bannerTree.locator('.el-tree-node__content', { hasText: '时间分组测试' }).first();
    await node.click({ button: 'right' });
    const contextMenu = contentPage.locator('.s-contextmenu');
    await expect(contextMenu).toBeVisible({ timeout: 3000 });
    await contextMenu.locator('.s-contextmenu-item').filter({ hasText: /删除/ }).click();
    const confirmDialog = contentPage.locator('.cl-confirm-container');
    await expect(confirmDialog).toBeVisible({ timeout: 3000 });
    await confirmDialog.locator('.el-button--primary').click();
    await contentPage.waitForTimeout(500);
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const recyclerItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /回收站/ });
    await recyclerItem.click();
    await contentPage.waitForTimeout(500);
    const recyclerPage = contentPage.locator('.recycler');
    await expect(recyclerPage).toBeVisible({ timeout: 5000 });
    // 验证日期分组标题和时间格式
    const titleElement = recyclerPage.locator('.list-wrap .title').first();
    await expect(titleElement).toBeVisible({ timeout: 5000 });
    const titleText = await titleElement.innerText();
    const isValidTitle = /今天|昨天|\d{4}年\d{1,2}月\d{1,2}号/.test(titleText);
    expect(isValidTitle).toBe(true);
    const dateElement = recyclerPage.locator('.date-chunk .date').first();
    await expect(dateElement).toBeVisible({ timeout: 5000 });
    const dateText = await dateElement.innerText();
    const isValidTime = /\d{1,2}:\d{2}/.test(dateText);
    expect(isValidTime).toBe(true);
  });

  test('验证刷新功能', async ({ topBarPage, contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 创建并删除测试节点
    await createNode(contentPage, { nodeType: 'http', name: '刷新测试节点' });
    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    const node = bannerTree.locator('.el-tree-node__content', { hasText: '刷新测试节点' }).first();
    await node.click({ button: 'right' });
    const contextMenu = contentPage.locator('.s-contextmenu');
    await expect(contextMenu).toBeVisible({ timeout: 3000 });
    await contextMenu.locator('.s-contextmenu-item').filter({ hasText: /删除/ }).click();
    const confirmDialog = contentPage.locator('.cl-confirm-container');
    await expect(confirmDialog).toBeVisible({ timeout: 3000 });
    await confirmDialog.locator('.el-button--primary').click();
    await contentPage.waitForTimeout(500);
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const recyclerItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /回收站/ });
    await recyclerItem.click();
    await contentPage.waitForTimeout(500);
    const recyclerPage = contentPage.locator('.recycler');
    await expect(recyclerPage).toBeVisible({ timeout: 5000 });
    const deletedDoc = getRecyclerDeletedDocByName(recyclerPage, '刷新测试节点');
    await expect(deletedDoc).toBeVisible({ timeout: 5000 });
    // 测试刷新功能
    const refreshBtn = recyclerPage.locator('.el-button').filter({ hasText: /^刷新$/ });
    await refreshBtn.click();
    await contentPage.waitForTimeout(800);
    await expect(deletedDoc).toBeVisible({ timeout: 5000 });
  });
});


