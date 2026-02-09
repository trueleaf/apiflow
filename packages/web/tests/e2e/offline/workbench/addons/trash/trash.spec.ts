import { test, expect } from '../../../../../fixtures/electron.fixture';

test.describe('Trash/回收站', () => {
  test('删除所有类型节点后同步展示到回收站，并可逐个恢复', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    test.setTimeout(120000);
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });

    // 创建所有类型节点（folder, http, websocket, httpMock, websocketMock）
    const nodeList: { name: string; nodeType: 'http' | 'websocket' | 'httpMock' | 'websocketMock' | 'folder' }[] = [
      { name: '类型-文件夹', nodeType: 'folder' },
      { name: '类型-HTTP接口', nodeType: 'http' },
      { name: '类型-WebSocket接口', nodeType: 'websocket' },
      { name: '类型-HTTPMock接口', nodeType: 'httpMock' },
      { name: '类型-WebSocketMock接口', nodeType: 'websocketMock' },
    ];
    for (let i = 0; i < nodeList.length; i += 1) {
      const item = nodeList[i];
      await createNode(contentPage, { nodeType: item.nodeType, name: item.name });
    }

    // 倒序删除所有节点
    for (let i = nodeList.length - 1; i >= 0; i -= 1) {
      const nodeName = nodeList[i].name;
      const node = bannerTree.locator('.el-tree-node__content', { hasText: nodeName }).first();
      await expect(node).toBeVisible({ timeout: 5000 });
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

    // 验证所有节点都展示在回收站中，并逐个恢复
    const recyclerPage = contentPage.locator('.recycler');
    await expect(recyclerPage).toBeVisible({ timeout: 5000 });
    await expect(recyclerPage.locator('.docinfo').first()).toBeVisible({ timeout: 5000 });
    for (let i = 0; i < nodeList.length; i += 1) {
      const nodeName = nodeList[i].name;
      const deletedDocs = recyclerPage.locator('.docinfo').filter({ hasText: nodeName });
      await expect(deletedDocs).toHaveCount(1, { timeout: 10000 });
    }
    for (let i = 0; i < nodeList.length; i += 1) {
      const nodeName = nodeList[i].name;
      const deletedDocs = recyclerPage.locator('.docinfo').filter({ hasText: nodeName });
      await expect(deletedDocs).toHaveCount(1, { timeout: 10000 });
      await deletedDocs.first().locator('.el-button').filter({ hasText: /恢复/ }).click();
      const restoreConfirmDialog = contentPage.locator('.cl-confirm-container');
      await expect(restoreConfirmDialog).toBeVisible({ timeout: 3000 });
      await restoreConfirmDialog.locator('.el-button--primary').click();
      await contentPage.waitForTimeout(500);
      await expect(deletedDocs).toHaveCount(0, { timeout: 10000 });
      const restoredNode = bannerTree.locator('.el-tree-node__content', { hasText: nodeName }).first();
      await expect(restoredNode).toBeVisible({ timeout: 5000 });
    }
  });

  test('验证各类型节点在回收站列表与详情中的展示逻辑', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    test.setTimeout(120000);
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });

    // 创建各类型节点并补齐关键字段（用于列表/详情断言）
    await createNode(contentPage, { nodeType: 'folder', name: '详情-文件夹' });
    await createNode(contentPage, { nodeType: 'http', name: '详情-HTTP接口' });
    await bannerTree.locator('.el-tree-node__content', { hasText: '详情-HTTP接口' }).first().click();
    const httpUrlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]').first();
    await expect(httpUrlInput).toBeVisible({ timeout: 5000 });
    await httpUrlInput.fill('http://127.0.0.1/api/detail-http');
    await contentPage.waitForTimeout(300);
    // 保存HTTP接口，确保回收站能拿到接口地址
    await contentPage.locator('[data-testid="operation-save-btn"]').click();
    await contentPage.waitForTimeout(300);

    await createNode(contentPage, { nodeType: 'websocket', name: '详情-WebSocket接口' });
    await bannerTree.locator('.el-tree-node__content', { hasText: '详情-WebSocket接口' }).first().click();
    const wsUrlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(wsUrlEditor).toBeVisible({ timeout: 5000 });
    await wsUrlEditor.fill('ws://127.0.0.1/ws/detail-ws');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 保存WebSocket接口，确保回收站能拿到请求地址
    await contentPage.locator('[data-testid="websocket-operation-save-btn"]').click();
    await contentPage.waitForTimeout(300);

    await createNode(contentPage, { nodeType: 'httpMock', name: '详情-HTTPMock接口' });
    await bannerTree.locator('.el-tree-node__content', { hasText: '详情-HTTPMock接口' }).first().click();
    const httpMockConfig = contentPage.locator('.mock-config-content');
    await expect(httpMockConfig).toBeVisible({ timeout: 5000 });
    const httpMockPortInput = httpMockConfig.locator('.condition-content .port-input input').first();
    await httpMockPortInput.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('18083');
    const httpMockUrlInput = httpMockConfig.locator('.condition-content .url-input input').first();
    await httpMockUrlInput.fill('/mock/detail-http');
    await httpMockConfig.getByRole('button', { name: /保存配置/ }).click();
    await contentPage.waitForTimeout(500);

    await createNode(contentPage, { nodeType: 'websocketMock', name: '详情-WebSocketMock接口' });
    await bannerTree.locator('.el-tree-node__content', { hasText: '详情-WebSocketMock接口' }).first().click();
    const wsMockConfig = contentPage.locator('.mock-config-content');
    await expect(wsMockConfig).toBeVisible({ timeout: 5000 });
    const wsMockPortInput = wsMockConfig.locator('.condition-content .port-input input').first();
    await wsMockPortInput.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('18084');
    const wsMockPathInput = wsMockConfig.locator('.condition-content .path-input input').first();
    await wsMockPathInput.fill('/ws-mock/detail-ws');
    await wsMockConfig.getByRole('button', { name: /保存配置/ }).click();
    await contentPage.waitForTimeout(500);

    const nodeList: { name: string; nodeType: 'http' | 'websocket' | 'httpMock' | 'websocketMock' | 'folder'; expectedPath?: string }[] = [
      { name: '详情-文件夹', nodeType: 'folder' },
      { name: '详情-HTTP接口', nodeType: 'http', expectedPath: '/api/detail-http' },
      { name: '详情-WebSocket接口', nodeType: 'websocket', expectedPath: '/ws/detail-ws' },
      { name: '详情-HTTPMock接口', nodeType: 'httpMock', expectedPath: '/mock/detail-http' },
      { name: '详情-WebSocketMock接口', nodeType: 'websocketMock', expectedPath: '/ws-mock/detail-ws' },
    ];

    // 倒序删除所有节点
    for (let i = nodeList.length - 1; i >= 0; i -= 1) {
      const nodeName = nodeList[i].name;
      const node = bannerTree.locator('.el-tree-node__content', { hasText: nodeName }).first();
      await expect(node).toBeVisible({ timeout: 5000 });
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

    // 验证列表展示与详情展示
    const recyclerPage = contentPage.locator('.recycler');
    await expect(recyclerPage).toBeVisible({ timeout: 5000 });
    await expect(recyclerPage.locator('.docinfo').first()).toBeVisible({ timeout: 5000 });

    for (let i = 0; i < nodeList.length; i += 1) {
      const item = nodeList[i];
      const deletedDocs = recyclerPage.locator('.docinfo').filter({ hasText: item.name });
      await expect(deletedDocs).toHaveCount(1, { timeout: 10000 });
      const deletedDoc = deletedDocs.first();

      // 验证各类型在列表中的展示内容（图标/方法/路径）
      if (item.nodeType === 'folder') {
        await expect(deletedDoc.locator('.folder-icon')).toBeVisible({ timeout: 5000 });
      } else if (item.nodeType === 'http') {
        await expect(deletedDoc.locator('.file-icon', { hasText: /GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS/ })).toBeVisible({ timeout: 5000 });
        await expect(deletedDoc.locator('.node-path')).toContainText(item.expectedPath ?? '');
      } else if (item.nodeType === 'websocket') {
        await expect(deletedDoc.locator('.ws-icon')).toBeVisible({ timeout: 5000 });
        await expect(deletedDoc.locator('.node-path')).toContainText(item.expectedPath ?? '');
      } else if (item.nodeType === 'httpMock') {
        await expect(deletedDoc.locator('.mock-icon', { hasText: /mock/i })).toBeVisible({ timeout: 5000 });
        await expect(deletedDoc.locator('.node-path')).toContainText(item.expectedPath ?? '');
      } else if (item.nodeType === 'websocketMock') {
        await expect(deletedDoc.locator('.ws-mock-icon')).toBeVisible({ timeout: 5000 });
        await expect(deletedDoc.locator('.node-path')).toContainText(item.expectedPath ?? '');
      }

      // 打开详情抽屉并验证各类型详情字段
      await deletedDoc.locator('.el-button').filter({ hasText: /详情/ }).click();
      const docDetail = contentPage.locator('.doc-detail');
      await expect(docDetail).toBeVisible({ timeout: 5000 });
      if (item.nodeType === 'folder') {
        await expect(docDetail).toContainText(item.name);
      } else if (item.nodeType === 'http') {
        await expect(docDetail).toContainText(item.name);
        await expect(docDetail).toContainText(item.expectedPath ?? '');
      } else if (item.nodeType === 'websocket') {
        await expect(docDetail).toContainText(item.name);
        await expect(docDetail).toContainText(item.expectedPath ?? '');
      } else if (item.nodeType === 'httpMock') {
        await expect(docDetail).toContainText(item.expectedPath ?? '');
        await expect(docDetail).toContainText('18083');
      } else if (item.nodeType === 'websocketMock') {
        await expect(docDetail).toContainText(item.expectedPath ?? '');
        await expect(docDetail).toContainText('18084');
      }

      // 关闭详情抽屉
      await contentPage.keyboard.press('Escape');
      const closedByEsc = await docDetail.waitFor({ state: 'hidden', timeout: 1500 }).then(() => true).catch(() => false);
      if (!closedByEsc) {
        const visibleDrawer = contentPage.locator('.el-drawer:visible').first();
        const closeBtn = visibleDrawer.getByLabel('关闭此对话框');
        const closeBtnVisible = await closeBtn.isVisible({ timeout: 800 }).catch(() => false);
        if (closeBtnVisible) {
          await closeBtn.click({ force: true });
        } else {
          await visibleDrawer.locator('.el-drawer__headerbtn, .el-drawer__close-btn').first().click({ force: true });
        }
      }
      await expect(docDetail).toBeHidden({ timeout: 5000 });
    }
  });

  test('验证搜索条件是否生效（日期范围/接口名称/接口url/清空/全部清空/刷新）', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    test.setTimeout(120000);
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });

    // 创建两个HTTP节点并删除，作为搜索数据源
    await createNode(contentPage, { nodeType: 'http', name: '搜索-接口A' });
    await bannerTree.locator('.el-tree-node__content', { hasText: '搜索-接口A' }).first().click();
    const urlInputA = contentPage.locator('[data-testid="url-input"] [contenteditable]').first();
    await expect(urlInputA).toBeVisible({ timeout: 5000 });
    await urlInputA.fill('http://127.0.0.1/api/search-a');
    await contentPage.waitForTimeout(200);
    // 保存接口A，确保回收站筛选能拿到接口url
    await contentPage.locator('[data-testid="operation-save-btn"]').click();
    await contentPage.waitForTimeout(200);

    await createNode(contentPage, { nodeType: 'http', name: '搜索-接口B' });
    await bannerTree.locator('.el-tree-node__content', { hasText: '搜索-接口B' }).first().click();
    const urlInputB = contentPage.locator('[data-testid="url-input"] [contenteditable]').first();
    await expect(urlInputB).toBeVisible({ timeout: 5000 });
    await urlInputB.fill('http://127.0.0.1/api/search-b');
    await contentPage.waitForTimeout(200);
    // 保存接口B，确保回收站筛选能拿到接口url
    await contentPage.locator('[data-testid="operation-save-btn"]').click();
    await contentPage.waitForTimeout(200);

    const nodeA = bannerTree.locator('.el-tree-node__content', { hasText: '搜索-接口A' }).first();
    const nodeB = bannerTree.locator('.el-tree-node__content', { hasText: '搜索-接口B' }).first();
    await nodeB.click({ button: 'right' });
    await expect(contentPage.locator('.s-contextmenu')).toBeVisible({ timeout: 3000 });
    await contentPage.locator('.s-contextmenu-item').filter({ hasText: /删除/ }).click();
    await expect(contentPage.locator('.cl-confirm-container')).toBeVisible({ timeout: 3000 });
    await contentPage.locator('.cl-confirm-container .el-button--primary').click();
    await contentPage.waitForTimeout(500);
    await nodeA.click({ button: 'right' });
    await expect(contentPage.locator('.s-contextmenu')).toBeVisible({ timeout: 3000 });
    await contentPage.locator('.s-contextmenu-item').filter({ hasText: /删除/ }).click();
    await expect(contentPage.locator('.cl-confirm-container')).toBeVisible({ timeout: 3000 });
    await contentPage.locator('.cl-confirm-container .el-button--primary').click();
    await contentPage.waitForTimeout(500);

    // 打开回收站
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const recyclerItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /回收站/ });
    await recyclerItem.click();
    await contentPage.waitForTimeout(500);

    const recyclerPage = contentPage.locator('.recycler');
    await expect(recyclerPage).toBeVisible({ timeout: 5000 });
    const deletedA = recyclerPage.locator('.docinfo').filter({ hasText: '搜索-接口A' }).first();
    const deletedB = recyclerPage.locator('.docinfo').filter({ hasText: '搜索-接口B' }).first();
    await expect(deletedA).toBeVisible({ timeout: 5000 });
    await expect(deletedB).toBeVisible({ timeout: 5000 });

    // 接口名称搜索（debounce触发）
    const docNameInput = recyclerPage.locator('input[placeholder*="通过接口名称匹配"]').first();
    await expect(docNameInput).toBeVisible({ timeout: 5000 });
    await docNameInput.fill('接口A');
    await contentPage.waitForTimeout(700);
    await expect(deletedA).toBeVisible({ timeout: 5000 });
    await expect(deletedB).toBeHidden({ timeout: 5000 });
    await docNameInput.fill('');
    await contentPage.waitForTimeout(700);
    await expect(deletedA).toBeVisible({ timeout: 5000 });
    await expect(deletedB).toBeVisible({ timeout: 5000 });

    // 接口url搜索（debounce触发）
    const urlInput = recyclerPage.locator('input[placeholder*="通过接口url匹配"]').first();
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    await urlInput.fill('http://127.0.0.1/api/search-b');
    await contentPage.waitForTimeout(700);
    await expect(deletedA).toBeHidden({ timeout: 5000 });
    await expect(deletedB).toBeVisible({ timeout: 5000 });
    await urlInput.fill('');
    await contentPage.waitForTimeout(700);
    await expect(deletedA).toBeVisible({ timeout: 5000 });
    await expect(deletedB).toBeVisible({ timeout: 5000 });

    // 日期范围筛选（今天/昨天/自定义显隐/清空）
    const yesterdayRadio = recyclerPage.locator('.el-radio').filter({ hasText: /^昨天$/ });
    await yesterdayRadio.click();
    await contentPage.waitForTimeout(300);
    await expect(deletedA).toBeHidden({ timeout: 5000 });
    await expect(deletedB).toBeHidden({ timeout: 5000 });
    const todayRadio = recyclerPage.locator('.el-radio').filter({ hasText: /^今天$/ });
    await todayRadio.click();
    await contentPage.waitForTimeout(300);
    await expect(deletedA).toBeVisible({ timeout: 5000 });
    await expect(deletedB).toBeVisible({ timeout: 5000 });

    const customRadio = recyclerPage.locator('.el-radio').filter({ hasText: /^自定义$/ });
    await customRadio.click();
    await contentPage.waitForTimeout(300);
    await expect(recyclerPage.locator('.el-date-editor')).toBeVisible({ timeout: 5000 });
    const clearDateBtn = recyclerPage.locator('.el-radio-group').locator('.el-button').filter({ hasText: /清空/ }).first();
    await clearDateBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(recyclerPage.locator('.el-date-editor')).toBeHidden({ timeout: 5000 });

    // 全部清空与刷新
    const clearAllBtn = recyclerPage.locator('.el-button').filter({ hasText: /^全部清空$/ });
    await clearAllBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(docNameInput).toHaveValue('');
    await expect(urlInput).toHaveValue('');
    await expect(deletedA).toBeVisible({ timeout: 5000 });
    await expect(deletedB).toBeVisible({ timeout: 5000 });

    const refreshBtn = recyclerPage.locator('.el-button').filter({ hasText: /^刷新$/ });
    await refreshBtn.click();
    await contentPage.waitForTimeout(800);
    await expect(deletedA).toBeVisible({ timeout: 5000 });
    await expect(deletedB).toBeVisible({ timeout: 5000 });
  });

  test('父子节点同时删除后恢复子节点时同步恢复父节点（覆盖全部类型子节点）', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    test.setTimeout(120000);
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });

    // 创建folder父节点 + 4种类型子节点，并删除父子节点
    const cases: { folderName: string; childName: string; childType: 'http' | 'websocket' | 'httpMock' | 'websocketMock' }[] = [
      { folderName: '父文件夹-HTTP-父', childName: '子节点-HTTP-子', childType: 'http' },
      { folderName: '父文件夹-WebSocket-父', childName: '子节点-WebSocket-子', childType: 'websocket' },
      { folderName: '父文件夹-HTTPMock-父', childName: '子节点-HTTPMock-子', childType: 'httpMock' },
      { folderName: '父文件夹-WebSocketMock-父', childName: '子节点-WebSocketMock-子', childType: 'websocketMock' },
    ];
    for (let i = 0; i < cases.length; i += 1) {
      const item = cases[i];
      const folderId = await createNode(contentPage, { nodeType: 'folder', name: item.folderName });
      await createNode(contentPage, { nodeType: item.childType, name: item.childName, pid: folderId });

      const folderTreeNode = bannerTree.locator('.el-tree-node').filter({ hasText: item.folderName }).first();
      const expandIcon = folderTreeNode.locator('.el-tree-node__expand-icon').first();
      const expandClass = await expandIcon.getAttribute('class');
      if (expandClass && !expandClass.includes('expanded')) {
        await expandIcon.click();
        await contentPage.waitForTimeout(200);
      }
      const childNode = bannerTree.locator('.el-tree-node__content', { hasText: item.childName }).first();
      await expect(childNode).toBeVisible({ timeout: 5000 });

      // 删除子节点与父节点
      await childNode.click({ button: 'right' });
      await expect(contentPage.locator('.s-contextmenu')).toBeVisible({ timeout: 3000 });
      await contentPage.locator('.s-contextmenu-item').filter({ hasText: /删除/ }).click();
      await expect(contentPage.locator('.cl-confirm-container')).toBeVisible({ timeout: 3000 });
      await contentPage.locator('.cl-confirm-container .el-button--primary').click();
      await contentPage.waitForTimeout(500);

      const folderNode = bannerTree.locator('.el-tree-node__content', { hasText: item.folderName }).first();
      await folderNode.click({ button: 'right' });
      await expect(contentPage.locator('.s-contextmenu')).toBeVisible({ timeout: 3000 });
      await contentPage.locator('.s-contextmenu-item').filter({ hasText: /删除/ }).click();
      await expect(contentPage.locator('.cl-confirm-container')).toBeVisible({ timeout: 3000 });
      await contentPage.locator('.cl-confirm-container .el-button--primary').click();
      await contentPage.waitForTimeout(500);
    }

    // 打开回收站并逐个恢复子节点，验证父节点同步恢复
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const recyclerItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /回收站/ });
    await recyclerItem.click();
    await contentPage.waitForTimeout(500);

    const recyclerPage = contentPage.locator('.recycler');
    await expect(recyclerPage).toBeVisible({ timeout: 5000 });
    for (let i = 0; i < cases.length; i += 1) {
      const item = cases[i];
      const deletedFolderDocs = recyclerPage.locator('.docinfo').filter({ hasText: item.folderName });
      const deletedChildDocs = recyclerPage.locator('.docinfo').filter({ hasText: item.childName });
      await expect(deletedFolderDocs).toHaveCount(1, { timeout: 10000 });
      await expect(deletedChildDocs).toHaveCount(1, { timeout: 10000 });

      await deletedChildDocs.first().locator('.el-button').filter({ hasText: /恢复/ }).click();
      await expect(contentPage.locator('.cl-confirm-container')).toBeVisible({ timeout: 3000 });
      await contentPage.locator('.cl-confirm-container .el-button--primary').click();
      await contentPage.waitForTimeout(500);
      await expect(deletedFolderDocs).toHaveCount(0, { timeout: 10000 });
      await expect(deletedChildDocs).toHaveCount(0, { timeout: 10000 });

      const restoredFolderNode = bannerTree.locator('.el-tree-node__content', { hasText: item.folderName }).first();
      await expect(restoredFolderNode).toBeVisible({ timeout: 5000 });
      const restoredFolderTreeNode = bannerTree.locator('.el-tree-node').filter({ hasText: item.folderName }).first();
      const restoredExpandIcon = restoredFolderTreeNode.locator('.el-tree-node__expand-icon').first();
      const restoredExpandClass = await restoredExpandIcon.getAttribute('class');
      if (restoredExpandClass && !restoredExpandClass.includes('expanded')) {
        await restoredExpandIcon.click();
        await contentPage.waitForTimeout(200);
      }
      const restoredChildNode = bannerTree.locator('.el-tree-node__content', { hasText: item.childName }).first();
      await expect(restoredChildNode).toBeVisible({ timeout: 5000 });
    }
  });

  test('父子节点同时删除后恢复父节点时同步恢复子节点（覆盖全部类型子节点）', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    test.setTimeout(120000);
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });

    // 创建folder父节点 + 4种类型子节点，并删除父子节点
    const cases: { folderName: string; childName: string; childType: 'http' | 'websocket' | 'httpMock' | 'websocketMock' }[] = [
      { folderName: '父文件夹2-HTTP-父', childName: '子节点2-HTTP-子', childType: 'http' },
      { folderName: '父文件夹2-WebSocket-父', childName: '子节点2-WebSocket-子', childType: 'websocket' },
      { folderName: '父文件夹2-HTTPMock-父', childName: '子节点2-HTTPMock-子', childType: 'httpMock' },
      { folderName: '父文件夹2-WebSocketMock-父', childName: '子节点2-WebSocketMock-子', childType: 'websocketMock' },
    ];
    for (let i = 0; i < cases.length; i += 1) {
      const item = cases[i];
      const folderId = await createNode(contentPage, { nodeType: 'folder', name: item.folderName });
      await createNode(contentPage, { nodeType: item.childType, name: item.childName, pid: folderId });

      const folderTreeNode = bannerTree.locator('.el-tree-node').filter({ hasText: item.folderName }).first();
      const expandIcon = folderTreeNode.locator('.el-tree-node__expand-icon').first();
      const expandClass = await expandIcon.getAttribute('class');
      if (expandClass && !expandClass.includes('expanded')) {
        await expandIcon.click();
        await contentPage.waitForTimeout(200);
      }
      const childNode = bannerTree.locator('.el-tree-node__content', { hasText: item.childName }).first();
      await expect(childNode).toBeVisible({ timeout: 5000 });

      // 删除子节点与父节点
      await childNode.click({ button: 'right' });
      await expect(contentPage.locator('.s-contextmenu')).toBeVisible({ timeout: 3000 });
      await contentPage.locator('.s-contextmenu-item').filter({ hasText: /删除/ }).click();
      await expect(contentPage.locator('.cl-confirm-container')).toBeVisible({ timeout: 3000 });
      await contentPage.locator('.cl-confirm-container .el-button--primary').click();
      await contentPage.waitForTimeout(500);

      const folderNode = bannerTree.locator('.el-tree-node__content', { hasText: item.folderName }).first();
      await folderNode.click({ button: 'right' });
      await expect(contentPage.locator('.s-contextmenu')).toBeVisible({ timeout: 3000 });
      await contentPage.locator('.s-contextmenu-item').filter({ hasText: /删除/ }).click();
      await expect(contentPage.locator('.cl-confirm-container')).toBeVisible({ timeout: 3000 });
      await contentPage.locator('.cl-confirm-container .el-button--primary').click();
      await contentPage.waitForTimeout(500);
    }

    // 打开回收站并逐个恢复父节点，验证子节点同步恢复
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const recyclerItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /回收站/ });
    await recyclerItem.click();
    await contentPage.waitForTimeout(500);

    const recyclerPage = contentPage.locator('.recycler');
    await expect(recyclerPage).toBeVisible({ timeout: 5000 });
    for (let i = 0; i < cases.length; i += 1) {
      const item = cases[i];
      const deletedFolderDocs = recyclerPage.locator('.docinfo').filter({ hasText: item.folderName });
      const deletedChildDocs = recyclerPage.locator('.docinfo').filter({ hasText: item.childName });
      await expect(deletedFolderDocs).toHaveCount(1, { timeout: 10000 });
      await expect(deletedChildDocs).toHaveCount(1, { timeout: 10000 });

      await deletedFolderDocs.first().locator('.el-button').filter({ hasText: /恢复/ }).click();
      await expect(contentPage.locator('.cl-confirm-container')).toBeVisible({ timeout: 3000 });
      await contentPage.locator('.cl-confirm-container .el-button--primary').click();
      await contentPage.waitForTimeout(500);
      await expect(deletedFolderDocs).toHaveCount(0, { timeout: 10000 });
      await expect(deletedChildDocs).toHaveCount(0, { timeout: 10000 });

      const restoredFolderNode = bannerTree.locator('.el-tree-node__content', { hasText: item.folderName }).first();
      await expect(restoredFolderNode).toBeVisible({ timeout: 5000 });
      const restoredFolderTreeNode = bannerTree.locator('.el-tree-node').filter({ hasText: item.folderName }).first();
      const restoredExpandIcon = restoredFolderTreeNode.locator('.el-tree-node__expand-icon').first();
      const restoredExpandClass = await restoredExpandIcon.getAttribute('class');
      if (restoredExpandClass && !restoredExpandClass.includes('expanded')) {
        await restoredExpandIcon.click();
        await contentPage.waitForTimeout(200);
      }
      const restoredChildNode = bannerTree.locator('.el-tree-node__content', { hasText: item.childName }).first();
      await expect(restoredChildNode).toBeVisible({ timeout: 5000 });
    }
  });
  test('无已删节点时回收站展示空状态', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 直接打开回收站,不删除任何节点
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const recyclerItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /回收站/ });
    await recyclerItem.click();
    const recyclerPage = contentPage.locator('.recycler');
    await expect(recyclerPage).toBeVisible({ timeout: 5000 });
    // 验证无任何docinfo条目
    await expect(recyclerPage.locator('.docinfo')).toHaveCount(0);
    // 验证搜索区域仍可见
    const searchArea = recyclerPage.locator('.search-wrap');
    await expect(searchArea).toBeVisible();
  });
  test('恢复确认弹窗点击取消后节点保留在回收站中', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    test.setTimeout(60000);
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });
    await createNode(contentPage, { nodeType: 'http', name: '取消恢复测试节点' });
    // 删除节点
    const node = bannerTree.locator('.el-tree-node__content', { hasText: '取消恢复测试节点' }).first();
    await node.click({ button: 'right' });
    await contentPage.locator('.s-contextmenu-item').filter({ hasText: /删除/ }).click();
    await contentPage.locator('.cl-confirm-container .el-button--primary').click();
    await contentPage.waitForTimeout(500);
    // 打开回收站
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const recyclerItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /回收站/ });
    await recyclerItem.click();
    const recyclerPage = contentPage.locator('.recycler');
    await expect(recyclerPage).toBeVisible({ timeout: 5000 });
    const deletedDoc = recyclerPage.locator('.docinfo').filter({ hasText: '取消恢复测试节点' });
    await expect(deletedDoc).toHaveCount(1, { timeout: 10000 });
    // 点击恢复后在确认弹窗中取消
    await deletedDoc.first().locator('.el-button').filter({ hasText: /恢复/ }).click();
    const confirmDialog = contentPage.locator('.cl-confirm-container');
    await expect(confirmDialog).toBeVisible({ timeout: 3000 });
    await confirmDialog.locator('.el-button').filter({ hasText: /取消/ }).click();
    await expect(confirmDialog).toBeHidden({ timeout: 3000 });
    // 验证节点仍在回收站中
    await expect(deletedDoc).toHaveCount(1);
    // 验证节点未回到文档树
    await expect(bannerTree.locator('.el-tree-node__content', { hasText: '取消恢复测试节点' })).toHaveCount(0);
  });
  test('回收站已打开时删除新节点自动刷新显示', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    test.setTimeout(60000);
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });
    await createNode(contentPage, { nodeType: 'http', name: '实时刷新测试节点' });
    // 先打开回收站确认为空
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const recyclerItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /回收站/ });
    await recyclerItem.click();
    const recyclerPage = contentPage.locator('.recycler');
    await expect(recyclerPage).toBeVisible({ timeout: 5000 });
    await expect(recyclerPage.locator('.docinfo').filter({ hasText: '实时刷新测试节点' })).toHaveCount(0);
    // 在文档树中删除节点(回收站仍处于打开状态)
    const node = bannerTree.locator('.el-tree-node__content', { hasText: '实时刷新测试节点' }).first();
    await node.click({ button: 'right' });
    await contentPage.locator('.s-contextmenu-item').filter({ hasText: /删除/ }).click();
    await contentPage.locator('.cl-confirm-container .el-button--primary').click();
    // 验证回收站自动刷新显示新删除的节点
    const newDeletedDoc = recyclerPage.locator('.docinfo').filter({ hasText: '实时刷新测试节点' });
    await expect(newDeletedDoc).toHaveCount(1, { timeout: 10000 });
  });
});


