import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('AddNode', () => {
  test('鼠标右键空白区域可新增 HTTP 节点', async ({ contentPage, clearCache, createProject, reload }) => {
    await clearCache();
    await reload();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 从空白区域右键打开菜单并创建 HTTP 接口
    const treeWrap = contentPage.locator('.tree-wrap');
    await expect(treeWrap).toBeVisible({ timeout: 5000 });
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    const contextMenu = contentPage.locator('.s-contextmenu');
    await expect(contextMenu).toBeVisible({ timeout: 5000 });
    await contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ }).click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('新增-HTTP-右键空白');
    await expect(addFileDialog.locator('.el-radio').filter({ hasText: /^HTTP$/ }).first()).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('.el-button--primary').last().click();
    await expect(addFileDialog).toBeHidden({ timeout: 5000 });
    await expect(contentPage.locator('.el-tree-node__content').filter({ hasText: '新增-HTTP-右键空白' }).first()).toBeVisible({ timeout: 10000 });
  });
  test('鼠标右键目录可新增 WebSocket 节点', async ({ contentPage, clearCache, createProject, reload }) => {
    await clearCache();
    await reload();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 先创建目录，再在目录右键创建 WebSocket 节点
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    const contextMenu = contentPage.locator('.s-contextmenu');
    await expect(contextMenu).toBeVisible({ timeout: 5000 });
    await contextMenu.locator('.s-contextmenu-item', { hasText: /新建文件夹/ }).click();
    const addFolderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
    await expect(addFolderDialog).toBeVisible({ timeout: 5000 });
    await addFolderDialog.locator('input').first().fill('新增目录-用于WebSocket');
    await addFolderDialog.locator('.el-button--primary').last().click();
    await expect(addFolderDialog).toBeHidden({ timeout: 5000 });
    const folderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '新增目录-用于WebSocket' }).first();
    await expect(folderNode).toBeVisible({ timeout: 5000 });
    await folderNode.click({ button: 'right' });
    const folderContextMenu = contentPage.locator('.s-contextmenu');
    await expect(folderContextMenu).toBeVisible({ timeout: 5000 });
    await folderContextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ }).click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('新增-WebSocket-目录右键');
    await addFileDialog.locator('.el-radio').filter({ hasText: /^WebSocket$/ }).first().click();
    await addFileDialog.locator('.el-button--primary').last().click();
    await expect(addFileDialog).toBeHidden({ timeout: 5000 });
    await expect(contentPage.locator('.el-tree-node__content').filter({ hasText: '新增-WebSocket-目录右键' }).first()).toBeVisible({ timeout: 10000 });
  });
  test('工具栏可新增 HTTP Mock 与 WebSocket Mock 节点', async ({ contentPage, clearCache, createProject, reload }) => {
    await clearCache();
    await reload();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 从工具栏新建接口，切换不同类型并验证落地
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await expect(moreBtn).toBeVisible({ timeout: 5000 });
    await moreBtn.click();
    const toolPanel = contentPage.locator('.tool-panel');
    await expect(toolPanel).toBeVisible({ timeout: 5000 });
    await toolPanel.locator('[data-testid="tool-panel-banner-add-http-btn"]').click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('新增-HTTPMock-工具栏');
    await addFileDialog.locator('.el-radio').filter({ hasText: /HTTP Mock/ }).first().click();
    await addFileDialog.locator('.el-button--primary').last().click();
    await expect(addFileDialog).toBeHidden({ timeout: 5000 });
    await expect(contentPage.locator('.el-tree-node__content').filter({ hasText: '新增-HTTPMock-工具栏' }).first()).toBeVisible({ timeout: 10000 });
    await moreBtn.click();
    await expect(toolPanel).toBeVisible({ timeout: 5000 });
    await toolPanel.locator('[data-testid="tool-panel-banner-add-http-btn"]').click();
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('新增-WSMock-工具栏');
    await addFileDialog.locator('.el-radio').filter({ hasText: /WebSocket Mock/ }).first().click();
    await addFileDialog.locator('.el-button--primary').last().click();
    await expect(addFileDialog).toBeHidden({ timeout: 5000 });
    await expect(contentPage.locator('.el-tree-node__content').filter({ hasText: '新增-WSMock-工具栏' }).first()).toBeVisible({ timeout: 10000 });
  });
  test('目录节点更多菜单可新增子目录', async ({ contentPage, clearCache, createProject, reload }) => {
    await clearCache();
    await reload();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 通过工具栏新增父目录，再用节点更多菜单新增子目录
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const toolPanel = contentPage.locator('.tool-panel');
    await expect(toolPanel).toBeVisible({ timeout: 5000 });
    await toolPanel.locator('[data-testid="tool-panel-banner-add-folder-btn"]').click();
    const addFolderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
    await expect(addFolderDialog).toBeVisible({ timeout: 5000 });
    await addFolderDialog.locator('input').first().fill('父目录-更多菜单');
    await addFolderDialog.locator('.el-button--primary').last().click();
    await expect(addFolderDialog).toBeHidden({ timeout: 5000 });
    const parentNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '父目录-更多菜单' }).first();
    await expect(parentNode).toBeVisible({ timeout: 5000 });
    await parentNode.hover();
    await parentNode.locator('[data-testid="banner-node-more-btn"]').click();
    const contextMenu = contentPage.locator('.s-contextmenu');
    await expect(contextMenu).toBeVisible({ timeout: 5000 });
    await contextMenu.locator('.s-contextmenu-item', { hasText: /新建文件夹/ }).click();
    await expect(addFolderDialog).toBeVisible({ timeout: 5000 });
    await addFolderDialog.locator('input').first().fill('子目录-更多菜单');
    await addFolderDialog.locator('.el-button--primary').last().click();
    await expect(addFolderDialog).toBeHidden({ timeout: 5000 });
    await expect(contentPage.locator('.el-tree-node__content').filter({ hasText: '子目录-更多菜单' }).first()).toBeVisible({ timeout: 10000 });
  });
  test('非目录节点右键菜单不出现新建接口和新建文件夹', async ({ contentPage, clearCache, createProject, reload }) => {
    await clearCache();
    await reload();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 创建一个 HTTP 节点后，验证其右键菜单不提供目录专属能力
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    const contextMenu = contentPage.locator('.s-contextmenu');
    await expect(contextMenu).toBeVisible({ timeout: 5000 });
    await contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ }).click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('普通HTTP节点');
    await addFileDialog.locator('.el-button--primary').last().click();
    await expect(addFileDialog).toBeHidden({ timeout: 5000 });
    const httpNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '普通HTTP节点' }).first();
    await expect(httpNode).toBeVisible({ timeout: 5000 });
    await httpNode.click({ button: 'right' });
    const nodeMenu = contentPage.locator('.s-contextmenu');
    await expect(nodeMenu).toBeVisible({ timeout: 5000 });
    const newInterfaceOption = nodeMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
    const newFolderOption = nodeMenu.locator('.s-contextmenu-item', { hasText: /新建文件夹/ });
    const interfaceCount = await newInterfaceOption.count();
    if (interfaceCount > 0) {
      await expect(newInterfaceOption.first()).toBeHidden();
    } else {
      expect(interfaceCount).toBe(0);
    }
    const folderCount = await newFolderOption.count();
    if (folderCount > 0) {
      await expect(newFolderOption.first()).toBeHidden();
    } else {
      expect(folderCount).toBe(0);
    }
  });
  test('配置 AI 后可在新增接口弹窗输入提示词并完成创建', async ({ contentPage, clearCache, createProject, reload }) => {
    await clearCache();
    await reload();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 设置 AI 配置到 mock 路由，验证 AI 提示词输入与创建流程
    await contentPage.evaluate(() => {
      localStorage.setItem('apiflow/ai/useFreeLLM', 'false');
      localStorage.setItem('apiflow/ai/llmProvider', JSON.stringify({
        id: 'mock-add-node-ai',
        name: 'mock-add-node-ai',
        provider: 'custom',
        baseURL: 'http://127.0.0.1:3456/ai/mock/node-success',
        apiKey: 'mock-key',
        model: 'mock-model',
        customHeaders: [],
        extraBody: '',
      }));
    });
    await reload();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    const contextMenu = contentPage.locator('.s-contextmenu');
    await expect(contextMenu).toBeVisible({ timeout: 5000 });
    await contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ }).click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('AI新增-HTTP接口');
    const aiPromptEditor = addFileDialog.locator('[data-testid="add-file-ai-prompt-editor"] .monaco-editor');
    await expect(aiPromptEditor).toBeVisible({ timeout: 5000 });
    await aiPromptEditor.click();
    await contentPage.keyboard.type('生成一个创建用户接口');
    await addFileDialog.locator('.el-button--primary').last().click();
    await expect(addFileDialog).toBeHidden({ timeout: 15000 });
    await expect(contentPage.locator('.el-tree-node__content').filter({ hasText: 'AI新增-HTTP接口' }).first()).toBeVisible({ timeout: 10000 });
  });
});
