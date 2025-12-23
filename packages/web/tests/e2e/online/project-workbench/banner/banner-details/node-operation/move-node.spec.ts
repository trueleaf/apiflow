import { test, expect } from '../../../../../../fixtures/electron-online.fixture.ts';

test.describe('OnlineMoveNode', () => {
  test('拖拽 HTTP 节点到文件夹节点下', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
    if (!serverUrl) {
      test.skip(true, '缺少环境变量 TEST_SERVER_URL（由 .env.test 提供）');
    }
    if (!loginName || !password) {
      test.skip(true, '缺少环境变量 TEST_LOGIN_NAME/TEST_LOGIN_PASSWORD（由 .env.test 提供）');
    }
    await clearCache();
    const networkToggle = topBarPage.locator('[data-testid="header-network-toggle"]');
    const networkText = await networkToggle.textContent();
    if (networkText?.includes('离线模式') || networkText?.includes('offline mode')) {
      await networkToggle.click();
      await contentPage.waitForTimeout(500);
    }
    await topBarPage.locator('[data-testid="header-settings-btn"]').click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    await contentPage.locator('[data-testid="settings-menu-common-settings"]').click();
    const serverUrlInput = contentPage.getByPlaceholder(/请输入接口调用地址|Please enter.*address/i);
    await serverUrlInput.fill(serverUrl!);
    const saveBtn = contentPage.getByRole('button', { name: /保存|Save/i });
    if (await saveBtn.isEnabled()) {
      await saveBtn.click();
      await expect(contentPage.getByText(/保存成功|Saved successfully/i)).toBeVisible({ timeout: 5000 });
    }
    const baseUrl = contentPage.url().split('#')[0];
    await contentPage.goto(`${baseUrl}#/login`);
    await expect(contentPage.locator('[data-testid="login-form"]')).toBeVisible({ timeout: 5000 });
    await contentPage.locator('[data-testid="login-username-input"]').fill(loginName!);
    await contentPage.locator('[data-testid="login-password-input"]').fill(password!);
    await contentPage.locator('[data-testid="login-submit-btn"]').click();
    const captchaInput = contentPage.locator('[data-testid="login-captcha-input"]');
    if (await captchaInput.isVisible()) {
      if (!captcha) {
        throw new Error('后端要求验证码，请在 .env.test 中配置 TEST_LOGIN_CAPTCHA');
      }
      await captchaInput.fill(captcha);
      await contentPage.locator('[data-testid="login-submit-btn"]').click();
    }
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const projectName = `在线拖拽移动-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await contentPage.getByTestId('banner-add-folder-btn').click();
    const addFolderDialog = contentPage.getByTestId('add-folder-dialog');
    await expect(addFolderDialog).toBeVisible({ timeout: 5000 });
    await addFolderDialog.locator('[data-testid="add-folder-name-input"] input').fill('拖拽目标文件夹');
    await addFolderDialog.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog).toBeHidden({ timeout: 10000 });
    await contentPage.getByTestId('banner-add-http-btn').click();
    const addFileDialog = contentPage.getByTestId('add-file-dialog');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('待移动HTTP节点');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    const httpNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '待移动HTTP节点' }).first();
    const folderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '拖拽目标文件夹' }).first();
    const httpNodeBox = await httpNode.boundingBox();
    const folderBox = await folderNode.boundingBox();
    if (httpNodeBox && folderBox) {
      await contentPage.mouse.move(httpNodeBox.x + httpNodeBox.width / 2, httpNodeBox.y + httpNodeBox.height / 2);
      await contentPage.mouse.down();
      await contentPage.mouse.move(folderBox.x + folderBox.width / 2, folderBox.y + folderBox.height / 2);
      await contentPage.mouse.up();
    }
    await contentPage.waitForTimeout(500);
    const expandedFolder = contentPage.locator('.el-tree-node.is-expanded').filter({ hasText: '拖拽目标文件夹' });
    await expect(expandedFolder).toBeVisible({ timeout: 5000 });
    const movedNode = expandedFolder.locator('.el-tree-node__content').filter({ hasText: '待移动HTTP节点' });
    await expect(movedNode).toBeVisible({ timeout: 5000 });
  });

  test('拖拽单个 HTTP 节点到 banner 空白区域移动到根节点下', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
    if (!serverUrl) {
      test.skip(true, '缺少环境变量 TEST_SERVER_URL（由 .env.test 提供）');
    }
    if (!loginName || !password) {
      test.skip(true, '缺少环境变量 TEST_LOGIN_NAME/TEST_LOGIN_PASSWORD（由 .env.test 提供）');
    }
    await clearCache();
    const networkToggle = topBarPage.locator('[data-testid="header-network-toggle"]');
    const networkText = await networkToggle.textContent();
    if (networkText?.includes('离线模式') || networkText?.includes('offline mode')) {
      await networkToggle.click();
      await contentPage.waitForTimeout(500);
    }
    await topBarPage.locator('[data-testid="header-settings-btn"]').click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    await contentPage.locator('[data-testid="settings-menu-common-settings"]').click();
    const serverUrlInput = contentPage.getByPlaceholder(/请输入接口调用地址|Please enter.*address/i);
    await serverUrlInput.fill(serverUrl!);
    const saveBtn = contentPage.getByRole('button', { name: /保存|Save/i });
    if (await saveBtn.isEnabled()) {
      await saveBtn.click();
      await expect(contentPage.getByText(/保存成功|Saved successfully/i)).toBeVisible({ timeout: 5000 });
    }
    const baseUrl = contentPage.url().split('#')[0];
    await contentPage.goto(`${baseUrl}#/login`);
    await expect(contentPage.locator('[data-testid="login-form"]')).toBeVisible({ timeout: 5000 });
    await contentPage.locator('[data-testid="login-username-input"]').fill(loginName!);
    await contentPage.locator('[data-testid="login-password-input"]').fill(password!);
    await contentPage.locator('[data-testid="login-submit-btn"]').click();
    const captchaInput = contentPage.locator('[data-testid="login-captcha-input"]');
    if (await captchaInput.isVisible()) {
      if (!captcha) {
        throw new Error('后端要求验证码，请在 .env.test 中配置 TEST_LOGIN_CAPTCHA');
      }
      await captchaInput.fill(captcha);
      await contentPage.locator('[data-testid="login-submit-btn"]').click();
    }
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const projectName = `在线拖拽根节点-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    const treeWrap = contentPage.locator('.tree-wrap');
    await contentPage.getByTestId('banner-add-folder-btn').click();
    const addFolderDialog = contentPage.getByTestId('add-folder-dialog');
    await expect(addFolderDialog).toBeVisible({ timeout: 5000 });
    await addFolderDialog.locator('[data-testid="add-folder-name-input"] input').fill('测试文件夹');
    await addFolderDialog.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog).toBeHidden({ timeout: 10000 });
    const folderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '测试文件夹' }).first();
    await folderNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    const addFileDialog = contentPage.getByTestId('add-file-dialog');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('测试HTTP节点');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    const folderTreeNode = folderNode.locator('xpath=ancestor::div[contains(@class,"el-tree-node")][1]');
    await expect(folderTreeNode).toBeVisible({ timeout: 5000 });
    const isExpanded = await folderTreeNode.evaluate(el => el.classList.contains('is-expanded'));
    if (!isExpanded) {
      await folderTreeNode.locator('.el-tree-node__expand-icon').first().click();
      await contentPage.waitForTimeout(300);
    }
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
    const rootHttpNode = treeWrap.locator('> .el-tree > .el-tree-node').filter({ hasText: '测试HTTP节点' });
    await expect(rootHttpNode).toBeVisible({ timeout: 5000 });
  });

  test('拖拽单个 HTTP 节点调整同层级顺序', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
    if (!serverUrl) {
      test.skip(true, '缺少环境变量 TEST_SERVER_URL（由 .env.test 提供）');
    }
    if (!loginName || !password) {
      test.skip(true, '缺少环境变量 TEST_LOGIN_NAME/TEST_LOGIN_PASSWORD（由 .env.test 提供）');
    }
    await clearCache();
    const networkToggle = topBarPage.locator('[data-testid="header-network-toggle"]');
    const networkText = await networkToggle.textContent();
    if (networkText?.includes('离线模式') || networkText?.includes('offline mode')) {
      await networkToggle.click();
      await contentPage.waitForTimeout(500);
    }
    await topBarPage.locator('[data-testid="header-settings-btn"]').click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    await contentPage.locator('[data-testid="settings-menu-common-settings"]').click();
    const serverUrlInput = contentPage.getByPlaceholder(/请输入接口调用地址|Please enter.*address/i);
    await serverUrlInput.fill(serverUrl!);
    const saveBtn = contentPage.getByRole('button', { name: /保存|Save/i });
    if (await saveBtn.isEnabled()) {
      await saveBtn.click();
      await expect(contentPage.getByText(/保存成功|Saved successfully/i)).toBeVisible({ timeout: 5000 });
    }
    const baseUrl = contentPage.url().split('#')[0];
    await contentPage.goto(`${baseUrl}#/login`);
    await expect(contentPage.locator('[data-testid="login-form"]')).toBeVisible({ timeout: 5000 });
    await contentPage.locator('[data-testid="login-username-input"]').fill(loginName!);
    await contentPage.locator('[data-testid="login-password-input"]').fill(password!);
    await contentPage.locator('[data-testid="login-submit-btn"]').click();
    const captchaInput = contentPage.locator('[data-testid="login-captcha-input"]');
    if (await captchaInput.isVisible()) {
      if (!captcha) {
        throw new Error('后端要求验证码，请在 .env.test 中配置 TEST_LOGIN_CAPTCHA');
      }
      await captchaInput.fill(captcha);
      await contentPage.locator('[data-testid="login-submit-btn"]').click();
    }
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const projectName = `在线拖拽排序-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    const treeWrap = contentPage.locator('.tree-wrap');
    await contentPage.getByTestId('banner-add-http-btn').click();
    const addFileDialog = contentPage.getByTestId('add-file-dialog');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('HTTP节点A');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(300);
    await contentPage.getByTestId('banner-add-http-btn').click();
    const addFileDialog2 = contentPage.getByTestId('add-file-dialog');
    await expect(addFileDialog2).toBeVisible({ timeout: 5000 });
    await addFileDialog2.locator('input').first().fill('HTTP节点B');
    await addFileDialog2.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    const nodeB = contentPage.locator('.el-tree-node__content').filter({ hasText: 'HTTP节点B' });
    const nodeA = contentPage.locator('.el-tree-node__content').filter({ hasText: 'HTTP节点A' });
    const nodeBBox = await nodeB.boundingBox();
    const nodeABox = await nodeA.boundingBox();
    if (nodeBBox && nodeABox) {
      await contentPage.mouse.move(nodeBBox.x + nodeBBox.width / 2, nodeBBox.y + nodeBBox.height / 2);
      await contentPage.mouse.down();
      await contentPage.mouse.move(nodeABox.x + nodeABox.width / 2, nodeABox.y + 5);
      await contentPage.mouse.up();
    }
    await contentPage.waitForTimeout(500);
    const allNodes = treeWrap.locator('> .el-tree > .el-tree-node .custom-tree-node');
    const firstNodeText = await allNodes.first().textContent();
    expect(firstNodeText).toContain('HTTP节点B');
  });

  test('拖拽 HTTP 节点到非文件夹节点操作被阻止', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
    if (!serverUrl) {
      test.skip(true, '缺少环境变量 TEST_SERVER_URL（由 .env.test 提供）');
    }
    if (!loginName || !password) {
      test.skip(true, '缺少环境变量 TEST_LOGIN_NAME/TEST_LOGIN_PASSWORD（由 .env.test 提供）');
    }
    await clearCache();
    const networkToggle = topBarPage.locator('[data-testid="header-network-toggle"]');
    const networkText = await networkToggle.textContent();
    if (networkText?.includes('离线模式') || networkText?.includes('offline mode')) {
      await networkToggle.click();
      await contentPage.waitForTimeout(500);
    }
    await topBarPage.locator('[data-testid="header-settings-btn"]').click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    await contentPage.locator('[data-testid="settings-menu-common-settings"]').click();
    const serverUrlInput = contentPage.getByPlaceholder(/请输入接口调用地址|Please enter.*address/i);
    await serverUrlInput.fill(serverUrl!);
    const saveBtn = contentPage.getByRole('button', { name: /保存|Save/i });
    if (await saveBtn.isEnabled()) {
      await saveBtn.click();
      await expect(contentPage.getByText(/保存成功|Saved successfully/i)).toBeVisible({ timeout: 5000 });
    }
    const baseUrl = contentPage.url().split('#')[0];
    await contentPage.goto(`${baseUrl}#/login`);
    await expect(contentPage.locator('[data-testid="login-form"]')).toBeVisible({ timeout: 5000 });
    await contentPage.locator('[data-testid="login-username-input"]').fill(loginName!);
    await contentPage.locator('[data-testid="login-password-input"]').fill(password!);
    await contentPage.locator('[data-testid="login-submit-btn"]').click();
    const captchaInput = contentPage.locator('[data-testid="login-captcha-input"]');
    if (await captchaInput.isVisible()) {
      if (!captcha) {
        throw new Error('后端要求验证码，请在 .env.test 中配置 TEST_LOGIN_CAPTCHA');
      }
      await captchaInput.fill(captcha);
      await contentPage.locator('[data-testid="login-submit-btn"]').click();
    }
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const projectName = `在线拖拽阻止-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    const treeWrap = contentPage.locator('.tree-wrap');
    await contentPage.getByTestId('banner-add-http-btn').click();
    const addFileDialog = contentPage.getByTestId('add-file-dialog');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('HTTP节点A');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(300);
    await contentPage.getByTestId('banner-add-http-btn').click();
    const addFileDialog2 = contentPage.getByTestId('add-file-dialog');
    await expect(addFileDialog2).toBeVisible({ timeout: 5000 });
    await addFileDialog2.locator('input').first().fill('HTTP节点B');
    await addFileDialog2.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
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
    const rootNodeA = treeWrap.locator('> .el-tree > .el-tree-node').filter({ hasText: 'HTTP节点A' });
    await expect(rootNodeA).toBeVisible({ timeout: 5000 });
  });

  test('拖拽 WebSocket 节点到 banner 空白区域移动到根节点下', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
    if (!serverUrl) {
      test.skip(true, '缺少环境变量 TEST_SERVER_URL（由 .env.test 提供）');
    }
    if (!loginName || !password) {
      test.skip(true, '缺少环境变量 TEST_LOGIN_NAME/TEST_LOGIN_PASSWORD（由 .env.test 提供）');
    }
    await clearCache();
    const networkToggle = topBarPage.locator('[data-testid="header-network-toggle"]');
    const networkText = await networkToggle.textContent();
    if (networkText?.includes('离线模式') || networkText?.includes('offline mode')) {
      await networkToggle.click();
      await contentPage.waitForTimeout(500);
    }
    await topBarPage.locator('[data-testid="header-settings-btn"]').click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    await contentPage.locator('[data-testid="settings-menu-common-settings"]').click();
    const serverUrlInput = contentPage.getByPlaceholder(/请输入接口调用地址|Please enter.*address/i);
    await serverUrlInput.fill(serverUrl!);
    const saveBtn = contentPage.getByRole('button', { name: /保存|Save/i });
    if (await saveBtn.isEnabled()) {
      await saveBtn.click();
      await expect(contentPage.getByText(/保存成功|Saved successfully/i)).toBeVisible({ timeout: 5000 });
    }
    const baseUrl = contentPage.url().split('#')[0];
    await contentPage.goto(`${baseUrl}#/login`);
    await expect(contentPage.locator('[data-testid="login-form"]')).toBeVisible({ timeout: 5000 });
    await contentPage.locator('[data-testid="login-username-input"]').fill(loginName!);
    await contentPage.locator('[data-testid="login-password-input"]').fill(password!);
    await contentPage.locator('[data-testid="login-submit-btn"]').click();
    const captchaInput = contentPage.locator('[data-testid="login-captcha-input"]');
    if (await captchaInput.isVisible()) {
      if (!captcha) {
        throw new Error('后端要求验证码，请在 .env.test 中配置 TEST_LOGIN_CAPTCHA');
      }
      await captchaInput.fill(captcha);
      await contentPage.locator('[data-testid="login-submit-btn"]').click();
    }
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const projectName = `在线拖拽WS根-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    const treeWrap = contentPage.locator('.tree-wrap');
    await contentPage.getByTestId('banner-add-folder-btn').click();
    const addFolderDialog = contentPage.getByTestId('add-folder-dialog');
    await expect(addFolderDialog).toBeVisible({ timeout: 5000 });
    await addFolderDialog.locator('[data-testid="add-folder-name-input"] input').fill('WS文件夹');
    await addFolderDialog.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog).toBeHidden({ timeout: 10000 });
    const folderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: 'WS文件夹' }).first();
    await folderNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    const addFileDialog = contentPage.getByTestId('add-file-dialog');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('测试WS节点');
    await addFileDialog.locator('.el-radio').filter({ hasText: /WebSocket/i }).first().click();
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    const folderTreeNode = folderNode.locator('xpath=ancestor::div[contains(@class,"el-tree-node")][1]');
    await expect(folderTreeNode).toBeVisible({ timeout: 5000 });
    const isExpanded = await folderTreeNode.evaluate(el => el.classList.contains('is-expanded'));
    if (!isExpanded) {
      await folderTreeNode.locator('.el-tree-node__expand-icon').first().click();
      await contentPage.waitForTimeout(300);
    }
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
    const rootWsNode = treeWrap.locator('> .el-tree > .el-tree-node').filter({ hasText: '测试WS节点' });
    await expect(rootWsNode).toBeVisible({ timeout: 5000 });
  });

  test('拖拽 WebSocket 节点到文件夹节点下', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
    if (!serverUrl) {
      test.skip(true, '缺少环境变量 TEST_SERVER_URL（由 .env.test 提供）');
    }
    if (!loginName || !password) {
      test.skip(true, '缺少环境变量 TEST_LOGIN_NAME/TEST_LOGIN_PASSWORD（由 .env.test 提供）');
    }
    await clearCache();
    const networkToggle = topBarPage.locator('[data-testid="header-network-toggle"]');
    const networkText = await networkToggle.textContent();
    if (networkText?.includes('离线模式') || networkText?.includes('offline mode')) {
      await networkToggle.click();
      await contentPage.waitForTimeout(500);
    }
    await topBarPage.locator('[data-testid="header-settings-btn"]').click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    await contentPage.locator('[data-testid="settings-menu-common-settings"]').click();
    const serverUrlInput = contentPage.getByPlaceholder(/请输入接口调用地址|Please enter.*address/i);
    await serverUrlInput.fill(serverUrl!);
    const saveBtn = contentPage.getByRole('button', { name: /保存|Save/i });
    if (await saveBtn.isEnabled()) {
      await saveBtn.click();
      await expect(contentPage.getByText(/保存成功|Saved successfully/i)).toBeVisible({ timeout: 5000 });
    }
    const baseUrl = contentPage.url().split('#')[0];
    await contentPage.goto(`${baseUrl}#/login`);
    await expect(contentPage.locator('[data-testid="login-form"]')).toBeVisible({ timeout: 5000 });
    await contentPage.locator('[data-testid="login-username-input"]').fill(loginName!);
    await contentPage.locator('[data-testid="login-password-input"]').fill(password!);
    await contentPage.locator('[data-testid="login-submit-btn"]').click();
    const captchaInput = contentPage.locator('[data-testid="login-captcha-input"]');
    if (await captchaInput.isVisible()) {
      if (!captcha) {
        throw new Error('后端要求验证码，请在 .env.test 中配置 TEST_LOGIN_CAPTCHA');
      }
      await captchaInput.fill(captcha);
      await contentPage.locator('[data-testid="login-submit-btn"]').click();
    }
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const projectName = `在线拖拽WS到文件夹-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await contentPage.getByTestId('banner-add-folder-btn').click();
    const addFolderDialog = contentPage.getByTestId('add-folder-dialog');
    await expect(addFolderDialog).toBeVisible({ timeout: 5000 });
    await addFolderDialog.locator('[data-testid="add-folder-name-input"] input').fill('源文件夹');
    await addFolderDialog.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog).toBeHidden({ timeout: 10000 });
    await contentPage.getByTestId('banner-add-folder-btn').click();
    const addFolderDialog2 = contentPage.getByTestId('add-folder-dialog');
    await expect(addFolderDialog2).toBeVisible({ timeout: 5000 });
    await addFolderDialog2.locator('[data-testid="add-folder-name-input"] input').fill('目标文件夹');
    await addFolderDialog2.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog2).toBeHidden({ timeout: 10000 });
    const sourceFolderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '源文件夹' }).first();
    await sourceFolderNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    const addFileDialog = contentPage.getByTestId('add-file-dialog');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('测试WS节点');
    await addFileDialog.locator('.el-radio').filter({ hasText: /WebSocket/i }).first().click();
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    const sourceFolderTreeNode = sourceFolderNode.locator('xpath=ancestor::div[contains(@class,"el-tree-node")][1]');
    await expect(sourceFolderTreeNode).toBeVisible({ timeout: 5000 });
    const isExpanded = await sourceFolderTreeNode.evaluate(el => el.classList.contains('is-expanded'));
    if (!isExpanded) {
      await sourceFolderTreeNode.locator('.el-tree-node__expand-icon').first().click();
      await contentPage.waitForTimeout(300);
    }
    const wsNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '测试WS节点' });
    const targetFolderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '目标文件夹' }).first();
    const wsNodeBox = await wsNode.boundingBox();
    const targetBox = await targetFolderNode.boundingBox();
    if (wsNodeBox && targetBox) {
      await contentPage.mouse.move(wsNodeBox.x + wsNodeBox.width / 2, wsNodeBox.y + wsNodeBox.height / 2);
      await contentPage.mouse.down();
      await contentPage.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
      await contentPage.mouse.up();
    }
    await contentPage.waitForTimeout(500);
    const targetFolderTreeNode = targetFolderNode.locator('xpath=ancestor::div[contains(@class,"el-tree-node")][1]');
    await expect(targetFolderTreeNode).toBeVisible({ timeout: 5000 });
    const isTargetExpanded = await targetFolderTreeNode.evaluate(el => el.classList.contains('is-expanded'));
    if (!isTargetExpanded) {
      await targetFolderTreeNode.locator('.el-tree-node__expand-icon').first().click();
      await contentPage.waitForTimeout(300);
    }
    const movedNode = targetFolderTreeNode.locator('.el-tree-node__content').filter({ hasText: '测试WS节点' });
    await expect(movedNode).toBeVisible({ timeout: 5000 });
  });

  test('拖拽 HTTP Mock 节点到 banner 空白区域移动到根节点下', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
    if (!serverUrl) {
      test.skip(true, '缺少环境变量 TEST_SERVER_URL（由 .env.test 提供）');
    }
    if (!loginName || !password) {
      test.skip(true, '缺少环境变量 TEST_LOGIN_NAME/TEST_LOGIN_PASSWORD（由 .env.test 提供）');
    }
    await clearCache();
    const networkToggle = topBarPage.locator('[data-testid="header-network-toggle"]');
    const networkText = await networkToggle.textContent();
    if (networkText?.includes('离线模式') || networkText?.includes('offline mode')) {
      await networkToggle.click();
      await contentPage.waitForTimeout(500);
    }
    await topBarPage.locator('[data-testid="header-settings-btn"]').click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    await contentPage.locator('[data-testid="settings-menu-common-settings"]').click();
    const serverUrlInput = contentPage.getByPlaceholder(/请输入接口调用地址|Please enter.*address/i);
    await serverUrlInput.fill(serverUrl!);
    const saveBtn = contentPage.getByRole('button', { name: /保存|Save/i });
    if (await saveBtn.isEnabled()) {
      await saveBtn.click();
      await expect(contentPage.getByText(/保存成功|Saved successfully/i)).toBeVisible({ timeout: 5000 });
    }
    const baseUrl = contentPage.url().split('#')[0];
    await contentPage.goto(`${baseUrl}#/login`);
    await expect(contentPage.locator('[data-testid="login-form"]')).toBeVisible({ timeout: 5000 });
    await contentPage.locator('[data-testid="login-username-input"]').fill(loginName!);
    await contentPage.locator('[data-testid="login-password-input"]').fill(password!);
    await contentPage.locator('[data-testid="login-submit-btn"]').click();
    const captchaInput = contentPage.locator('[data-testid="login-captcha-input"]');
    if (await captchaInput.isVisible()) {
      if (!captcha) {
        throw new Error('后端要求验证码，请在 .env.test 中配置 TEST_LOGIN_CAPTCHA');
      }
      await captchaInput.fill(captcha);
      await contentPage.locator('[data-testid="login-submit-btn"]').click();
    }
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const projectName = `在线拖拽HTTPMock根-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    const treeWrap = contentPage.locator('.tree-wrap');
    await contentPage.getByTestId('banner-add-folder-btn').click();
    const addFolderDialog = contentPage.getByTestId('add-folder-dialog');
    await expect(addFolderDialog).toBeVisible({ timeout: 5000 });
    await addFolderDialog.locator('[data-testid="add-folder-name-input"] input').fill('Mock文件夹');
    await addFolderDialog.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog).toBeHidden({ timeout: 10000 });
    const folderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: 'Mock文件夹' }).first();
    await folderNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    const addFileDialog = contentPage.getByTestId('add-file-dialog');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('测试HTTP Mock节点');
    const mockRadio = addFileDialog.locator('.el-radio').filter({ hasText: /HTTP Mock/i }).first();
    await mockRadio.click();
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    const folderTreeNode = folderNode.locator('xpath=ancestor::div[contains(@class,"el-tree-node")][1]');
    await expect(folderTreeNode).toBeVisible({ timeout: 5000 });
    const isExpanded = await folderTreeNode.evaluate(el => el.classList.contains('is-expanded'));
    if (!isExpanded) {
      await folderTreeNode.locator('.el-tree-node__expand-icon').first().click();
      await contentPage.waitForTimeout(300);
    }
    const mockNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '测试HTTP Mock节点' });
    const mockNodeBox = await mockNode.boundingBox();
    const treeBox = await treeWrap.boundingBox();
    if (mockNodeBox && treeBox) {
      await contentPage.mouse.move(mockNodeBox.x + mockNodeBox.width / 2, mockNodeBox.y + mockNodeBox.height / 2);
      await contentPage.mouse.down();
      await contentPage.mouse.move(treeBox.x + 100, treeBox.y + treeBox.height - 50);
      await contentPage.mouse.up();
    }
    await contentPage.waitForTimeout(500);
    const rootMockNode = treeWrap.locator('> .el-tree > .el-tree-node').filter({ hasText: '测试HTTP Mock节点' });
    await expect(rootMockNode).toBeVisible({ timeout: 5000 });
  });

  test('拖拽 HTTP Mock 节点到文件夹节点下', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
    if (!serverUrl) {
      test.skip(true, '缺少环境变量 TEST_SERVER_URL（由 .env.test 提供）');
    }
    if (!loginName || !password) {
      test.skip(true, '缺少环境变量 TEST_LOGIN_NAME/TEST_LOGIN_PASSWORD（由 .env.test 提供）');
    }
    await clearCache();
    const networkToggle = topBarPage.locator('[data-testid="header-network-toggle"]');
    const networkText = await networkToggle.textContent();
    if (networkText?.includes('离线模式') || networkText?.includes('offline mode')) {
      await networkToggle.click();
      await contentPage.waitForTimeout(500);
    }
    await topBarPage.locator('[data-testid="header-settings-btn"]').click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    await contentPage.locator('[data-testid="settings-menu-common-settings"]').click();
    const serverUrlInput = contentPage.getByPlaceholder(/请输入接口调用地址|Please enter.*address/i);
    await serverUrlInput.fill(serverUrl!);
    const saveBtn = contentPage.getByRole('button', { name: /保存|Save/i });
    if (await saveBtn.isEnabled()) {
      await saveBtn.click();
      await expect(contentPage.getByText(/保存成功|Saved successfully/i)).toBeVisible({ timeout: 5000 });
    }
    const baseUrl = contentPage.url().split('#')[0];
    await contentPage.goto(`${baseUrl}#/login`);
    await expect(contentPage.locator('[data-testid="login-form"]')).toBeVisible({ timeout: 5000 });
    await contentPage.locator('[data-testid="login-username-input"]').fill(loginName!);
    await contentPage.locator('[data-testid="login-password-input"]').fill(password!);
    await contentPage.locator('[data-testid="login-submit-btn"]').click();
    const captchaInput = contentPage.locator('[data-testid="login-captcha-input"]');
    if (await captchaInput.isVisible()) {
      if (!captcha) {
        throw new Error('后端要求验证码，请在 .env.test 中配置 TEST_LOGIN_CAPTCHA');
      }
      await captchaInput.fill(captcha);
      await contentPage.locator('[data-testid="login-submit-btn"]').click();
    }
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const projectName = `在线拖拽HTTPMock到文件夹-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await contentPage.getByTestId('banner-add-folder-btn').click();
    const addFolderDialog = contentPage.getByTestId('add-folder-dialog');
    await expect(addFolderDialog).toBeVisible({ timeout: 5000 });
    await addFolderDialog.locator('[data-testid="add-folder-name-input"] input').fill('源文件夹');
    await addFolderDialog.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog).toBeHidden({ timeout: 10000 });
    await contentPage.getByTestId('banner-add-folder-btn').click();
    const addFolderDialog2 = contentPage.getByTestId('add-folder-dialog');
    await expect(addFolderDialog2).toBeVisible({ timeout: 5000 });
    await addFolderDialog2.locator('[data-testid="add-folder-name-input"] input').fill('目标文件夹');
    await addFolderDialog2.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog2).toBeHidden({ timeout: 10000 });
    const sourceFolderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '源文件夹' }).first();
    await sourceFolderNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    const addFileDialog = contentPage.getByTestId('add-file-dialog');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('测试HTTP Mock节点');
    const mockRadio = addFileDialog.locator('.el-radio').filter({ hasText: /HTTP Mock/i }).first();
    await mockRadio.click();
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    const sourceFolderTreeNode = sourceFolderNode.locator('xpath=ancestor::div[contains(@class,"el-tree-node")][1]');
    await expect(sourceFolderTreeNode).toBeVisible({ timeout: 5000 });
    const isExpanded = await sourceFolderTreeNode.evaluate(el => el.classList.contains('is-expanded'));
    if (!isExpanded) {
      await sourceFolderTreeNode.locator('.el-tree-node__expand-icon').first().click();
      await contentPage.waitForTimeout(300);
    }
    const mockNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '测试HTTP Mock节点' });
    const targetFolderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '目标文件夹' }).first();
    const mockNodeBox = await mockNode.boundingBox();
    const targetBox = await targetFolderNode.boundingBox();
    if (mockNodeBox && targetBox) {
      await contentPage.mouse.move(mockNodeBox.x + mockNodeBox.width / 2, mockNodeBox.y + mockNodeBox.height / 2);
      await contentPage.mouse.down();
      await contentPage.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
      await contentPage.mouse.up();
    }
    await contentPage.waitForTimeout(500);
    const targetFolderTreeNode = targetFolderNode.locator('xpath=ancestor::div[contains(@class,"el-tree-node")][1]');
    await expect(targetFolderTreeNode).toBeVisible({ timeout: 5000 });
    const isTargetExpanded = await targetFolderTreeNode.evaluate(el => el.classList.contains('is-expanded'));
    if (!isTargetExpanded) {
      await targetFolderTreeNode.locator('.el-tree-node__expand-icon').first().click();
      await contentPage.waitForTimeout(300);
    }
    const movedNode = targetFolderTreeNode.locator('.el-tree-node__content').filter({ hasText: '测试HTTP Mock节点' });
    await expect(movedNode).toBeVisible({ timeout: 5000 });
  });

  test('拖拽 WebSocket Mock 节点到 banner 空白区域移动到根节点下', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
    if (!serverUrl) {
      test.skip(true, '缺少环境变量 TEST_SERVER_URL（由 .env.test 提供）');
    }
    if (!loginName || !password) {
      test.skip(true, '缺少环境变量 TEST_LOGIN_NAME/TEST_LOGIN_PASSWORD（由 .env.test 提供）');
    }
    await clearCache();
    const networkToggle = topBarPage.locator('[data-testid="header-network-toggle"]');
    const networkText = await networkToggle.textContent();
    if (networkText?.includes('离线模式') || networkText?.includes('offline mode')) {
      await networkToggle.click();
      await contentPage.waitForTimeout(500);
    }
    await topBarPage.locator('[data-testid="header-settings-btn"]').click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    await contentPage.locator('[data-testid="settings-menu-common-settings"]').click();
    const serverUrlInput = contentPage.getByPlaceholder(/请输入接口调用地址|Please enter.*address/i);
    await serverUrlInput.fill(serverUrl!);
    const saveBtn = contentPage.getByRole('button', { name: /保存|Save/i });
    if (await saveBtn.isEnabled()) {
      await saveBtn.click();
      await expect(contentPage.getByText(/保存成功|Saved successfully/i)).toBeVisible({ timeout: 5000 });
    }
    const baseUrl = contentPage.url().split('#')[0];
    await contentPage.goto(`${baseUrl}#/login`);
    await expect(contentPage.locator('[data-testid="login-form"]')).toBeVisible({ timeout: 5000 });
    await contentPage.locator('[data-testid="login-username-input"]').fill(loginName!);
    await contentPage.locator('[data-testid="login-password-input"]').fill(password!);
    await contentPage.locator('[data-testid="login-submit-btn"]').click();
    const captchaInput = contentPage.locator('[data-testid="login-captcha-input"]');
    if (await captchaInput.isVisible()) {
      if (!captcha) {
        throw new Error('后端要求验证码，请在 .env.test 中配置 TEST_LOGIN_CAPTCHA');
      }
      await captchaInput.fill(captcha);
      await contentPage.locator('[data-testid="login-submit-btn"]').click();
    }
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const projectName = `在线拖拽WSMock根-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    const treeWrap = contentPage.locator('.tree-wrap');
    await contentPage.getByTestId('banner-add-folder-btn').click();
    const addFolderDialog = contentPage.getByTestId('add-folder-dialog');
    await expect(addFolderDialog).toBeVisible({ timeout: 5000 });
    await addFolderDialog.locator('[data-testid="add-folder-name-input"] input').fill('WSMock文件夹');
    await addFolderDialog.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog).toBeHidden({ timeout: 10000 });
    const folderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: 'WSMock文件夹' }).first();
    await folderNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    const addFileDialog = contentPage.getByTestId('add-file-dialog');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('测试WsMock节点');
    const wsMockRadio = addFileDialog.locator('.el-radio').filter({ hasText: /WebSocket Mock/i }).first();
    await wsMockRadio.click();
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    const folderTreeNode = folderNode.locator('xpath=ancestor::div[contains(@class,"el-tree-node")][1]');
    await expect(folderTreeNode).toBeVisible({ timeout: 5000 });
    const isExpanded = await folderTreeNode.evaluate(el => el.classList.contains('is-expanded'));
    if (!isExpanded) {
      await folderTreeNode.locator('.el-tree-node__expand-icon').first().click();
      await contentPage.waitForTimeout(300);
    }
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
    const rootWsMockNode = treeWrap.locator('> .el-tree > .el-tree-node').filter({ hasText: '测试WsMock节点' });
    await expect(rootWsMockNode).toBeVisible({ timeout: 5000 });
  });

  test('拖拽 WebSocket Mock 节点到文件夹节点下', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
    if (!serverUrl) {
      test.skip(true, '缺少环境变量 TEST_SERVER_URL（由 .env.test 提供）');
    }
    if (!loginName || !password) {
      test.skip(true, '缺少环境变量 TEST_LOGIN_NAME/TEST_LOGIN_PASSWORD（由 .env.test 提供）');
    }
    await clearCache();
    const networkToggle = topBarPage.locator('[data-testid="header-network-toggle"]');
    const networkText = await networkToggle.textContent();
    if (networkText?.includes('离线模式') || networkText?.includes('offline mode')) {
      await networkToggle.click();
      await contentPage.waitForTimeout(500);
    }
    await topBarPage.locator('[data-testid="header-settings-btn"]').click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    await contentPage.locator('[data-testid="settings-menu-common-settings"]').click();
    const serverUrlInput = contentPage.getByPlaceholder(/请输入接口调用地址|Please enter.*address/i);
    await serverUrlInput.fill(serverUrl!);
    const saveBtn = contentPage.getByRole('button', { name: /保存|Save/i });
    if (await saveBtn.isEnabled()) {
      await saveBtn.click();
      await expect(contentPage.getByText(/保存成功|Saved successfully/i)).toBeVisible({ timeout: 5000 });
    }
    const baseUrl = contentPage.url().split('#')[0];
    await contentPage.goto(`${baseUrl}#/login`);
    await expect(contentPage.locator('[data-testid="login-form"]')).toBeVisible({ timeout: 5000 });
    await contentPage.locator('[data-testid="login-username-input"]').fill(loginName!);
    await contentPage.locator('[data-testid="login-password-input"]').fill(password!);
    await contentPage.locator('[data-testid="login-submit-btn"]').click();
    const captchaInput = contentPage.locator('[data-testid="login-captcha-input"]');
    if (await captchaInput.isVisible()) {
      if (!captcha) {
        throw new Error('后端要求验证码，请在 .env.test 中配置 TEST_LOGIN_CAPTCHA');
      }
      await captchaInput.fill(captcha);
      await contentPage.locator('[data-testid="login-submit-btn"]').click();
    }
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const projectName = `在线拖拽WSMock到文件夹-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await contentPage.getByTestId('banner-add-folder-btn').click();
    const addFolderDialog = contentPage.getByTestId('add-folder-dialog');
    await expect(addFolderDialog).toBeVisible({ timeout: 5000 });
    await addFolderDialog.locator('[data-testid="add-folder-name-input"] input').fill('源文件夹');
    await addFolderDialog.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog).toBeHidden({ timeout: 10000 });
    await contentPage.getByTestId('banner-add-folder-btn').click();
    const addFolderDialog2 = contentPage.getByTestId('add-folder-dialog');
    await expect(addFolderDialog2).toBeVisible({ timeout: 5000 });
    await addFolderDialog2.locator('[data-testid="add-folder-name-input"] input').fill('目标文件夹');
    await addFolderDialog2.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog2).toBeHidden({ timeout: 10000 });
    const sourceFolderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '源文件夹' }).first();
    await sourceFolderNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    const addFileDialog = contentPage.getByTestId('add-file-dialog');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('测试WsMock节点');
    const wsMockRadio = addFileDialog.locator('.el-radio').filter({ hasText: /WebSocket Mock/i }).first();
    await wsMockRadio.click();
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    const sourceFolderTreeNode = sourceFolderNode.locator('xpath=ancestor::div[contains(@class,"el-tree-node")][1]');
    await expect(sourceFolderTreeNode).toBeVisible({ timeout: 5000 });
    const isExpanded = await sourceFolderTreeNode.evaluate(el => el.classList.contains('is-expanded'));
    if (!isExpanded) {
      await sourceFolderTreeNode.locator('.el-tree-node__expand-icon').first().click();
      await contentPage.waitForTimeout(300);
    }
    const wsMockNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '测试WsMock节点' });
    const targetFolderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '目标文件夹' }).first();
    const wsMockNodeBox = await wsMockNode.boundingBox();
    const targetBox = await targetFolderNode.boundingBox();
    if (wsMockNodeBox && targetBox) {
      await contentPage.mouse.move(wsMockNodeBox.x + wsMockNodeBox.width / 2, wsMockNodeBox.y + wsMockNodeBox.height / 2);
      await contentPage.mouse.down();
      await contentPage.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
      await contentPage.mouse.up();
    }
    await contentPage.waitForTimeout(500);
    const targetFolderTreeNode = targetFolderNode.locator('xpath=ancestor::div[contains(@class,"el-tree-node")][1]');
    await expect(targetFolderTreeNode).toBeVisible({ timeout: 5000 });
    const isTargetExpanded = await targetFolderTreeNode.evaluate(el => el.classList.contains('is-expanded'));
    if (!isTargetExpanded) {
      await targetFolderTreeNode.locator('.el-tree-node__expand-icon').first().click();
      await contentPage.waitForTimeout(300);
    }
    const movedNode = targetFolderTreeNode.locator('.el-tree-node__content').filter({ hasText: '测试WsMock节点' });
    await expect(movedNode).toBeVisible({ timeout: 5000 });
  });

  test('拖拽文件夹节点到 banner 空白区域移动到根节点下', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
    if (!serverUrl) {
      test.skip(true, '缺少环境变量 TEST_SERVER_URL（由 .env.test 提供）');
    }
    if (!loginName || !password) {
      test.skip(true, '缺少环境变量 TEST_LOGIN_NAME/TEST_LOGIN_PASSWORD（由 .env.test 提供）');
    }
    await clearCache();
    const networkToggle = topBarPage.locator('[data-testid="header-network-toggle"]');
    const networkText = await networkToggle.textContent();
    if (networkText?.includes('离线模式') || networkText?.includes('offline mode')) {
      await networkToggle.click();
      await contentPage.waitForTimeout(500);
    }
    await topBarPage.locator('[data-testid="header-settings-btn"]').click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    await contentPage.locator('[data-testid="settings-menu-common-settings"]').click();
    const serverUrlInput = contentPage.getByPlaceholder(/请输入接口调用地址|Please enter.*address/i);
    await serverUrlInput.fill(serverUrl!);
    const saveBtn = contentPage.getByRole('button', { name: /保存|Save/i });
    if (await saveBtn.isEnabled()) {
      await saveBtn.click();
      await expect(contentPage.getByText(/保存成功|Saved successfully/i)).toBeVisible({ timeout: 5000 });
    }
    const baseUrl = contentPage.url().split('#')[0];
    await contentPage.goto(`${baseUrl}#/login`);
    await expect(contentPage.locator('[data-testid="login-form"]')).toBeVisible({ timeout: 5000 });
    await contentPage.locator('[data-testid="login-username-input"]').fill(loginName!);
    await contentPage.locator('[data-testid="login-password-input"]').fill(password!);
    await contentPage.locator('[data-testid="login-submit-btn"]').click();
    const captchaInput = contentPage.locator('[data-testid="login-captcha-input"]');
    if (await captchaInput.isVisible()) {
      if (!captcha) {
        throw new Error('后端要求验证码，请在 .env.test 中配置 TEST_LOGIN_CAPTCHA');
      }
      await captchaInput.fill(captcha);
      await contentPage.locator('[data-testid="login-submit-btn"]').click();
    }
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const projectName = `在线拖拽文件夹根-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    const treeWrap = contentPage.locator('.tree-wrap');
    await contentPage.getByTestId('banner-add-folder-btn').click();
    const addFolderDialog = contentPage.getByTestId('add-folder-dialog');
    await expect(addFolderDialog).toBeVisible({ timeout: 5000 });
    await addFolderDialog.locator('[data-testid="add-folder-name-input"] input').fill('父文件夹');
    await addFolderDialog.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog).toBeHidden({ timeout: 10000 });
    const parentFolderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '父文件夹' }).first();
    await parentFolderNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const newSubFolderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
    await newSubFolderItem.click();
    const subFolderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
    await expect(subFolderDialog).toBeVisible({ timeout: 5000 });
    await subFolderDialog.locator('input').first().fill('子文件夹');
    await subFolderDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    const parentFolderTreeNode = parentFolderNode.locator('xpath=ancestor::div[contains(@class,"el-tree-node")][1]');
    await expect(parentFolderTreeNode).toBeVisible({ timeout: 5000 });
    const isExpanded = await parentFolderTreeNode.evaluate(el => el.classList.contains('is-expanded'));
    if (!isExpanded) {
      await parentFolderTreeNode.locator('.el-tree-node__expand-icon').first().click();
      await contentPage.waitForTimeout(300);
    }
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
    const rootChildFolder = treeWrap.locator('> .el-tree > .el-tree-node').filter({ hasText: '子文件夹' });
    await expect(rootChildFolder).toBeVisible({ timeout: 5000 });
  });

  test('拖拽文件夹节点到文件夹节点下', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
    if (!serverUrl) {
      test.skip(true, '缺少环境变量 TEST_SERVER_URL（由 .env.test 提供）');
    }
    if (!loginName || !password) {
      test.skip(true, '缺少环境变量 TEST_LOGIN_NAME/TEST_LOGIN_PASSWORD（由 .env.test 提供）');
    }
    await clearCache();
    const networkToggle = topBarPage.locator('[data-testid="header-network-toggle"]');
    const networkText = await networkToggle.textContent();
    if (networkText?.includes('离线模式') || networkText?.includes('offline mode')) {
      await networkToggle.click();
      await contentPage.waitForTimeout(500);
    }
    await topBarPage.locator('[data-testid="header-settings-btn"]').click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    await contentPage.locator('[data-testid="settings-menu-common-settings"]').click();
    const serverUrlInput = contentPage.getByPlaceholder(/请输入接口调用地址|Please enter.*address/i);
    await serverUrlInput.fill(serverUrl!);
    const saveBtn = contentPage.getByRole('button', { name: /保存|Save/i });
    if (await saveBtn.isEnabled()) {
      await saveBtn.click();
      await expect(contentPage.getByText(/保存成功|Saved successfully/i)).toBeVisible({ timeout: 5000 });
    }
    const baseUrl = contentPage.url().split('#')[0];
    await contentPage.goto(`${baseUrl}#/login`);
    await expect(contentPage.locator('[data-testid="login-form"]')).toBeVisible({ timeout: 5000 });
    await contentPage.locator('[data-testid="login-username-input"]').fill(loginName!);
    await contentPage.locator('[data-testid="login-password-input"]').fill(password!);
    await contentPage.locator('[data-testid="login-submit-btn"]').click();
    const captchaInput = contentPage.locator('[data-testid="login-captcha-input"]');
    if (await captchaInput.isVisible()) {
      if (!captcha) {
        throw new Error('后端要求验证码，请在 .env.test 中配置 TEST_LOGIN_CAPTCHA');
      }
      await captchaInput.fill(captcha);
      await contentPage.locator('[data-testid="login-submit-btn"]').click();
    }
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const projectName = `在线拖拽文件夹到文件夹-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await contentPage.getByTestId('banner-add-folder-btn').click();
    const addFolderDialog = contentPage.getByTestId('add-folder-dialog');
    await expect(addFolderDialog).toBeVisible({ timeout: 5000 });
    await addFolderDialog.locator('[data-testid="add-folder-name-input"] input').fill('源文件夹');
    await addFolderDialog.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog).toBeHidden({ timeout: 10000 });
    await contentPage.getByTestId('banner-add-folder-btn').click();
    const addFolderDialog2 = contentPage.getByTestId('add-folder-dialog');
    await expect(addFolderDialog2).toBeVisible({ timeout: 5000 });
    await addFolderDialog2.locator('[data-testid="add-folder-name-input"] input').fill('目标文件夹');
    await addFolderDialog2.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog2).toBeHidden({ timeout: 10000 });
    const sourceFolderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '源文件夹' }).first();
    const targetFolderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '目标文件夹' }).first();
    const sourceBox = await sourceFolderNode.boundingBox();
    const targetBox = await targetFolderNode.boundingBox();
    if (sourceBox && targetBox) {
      await contentPage.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
      await contentPage.mouse.down();
      await contentPage.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
      await contentPage.mouse.up();
    }
    await contentPage.waitForTimeout(500);
    const expandedFolder = contentPage.locator('.el-tree-node.is-expanded').filter({ hasText: '目标文件夹' });
    await expect(expandedFolder).toBeVisible({ timeout: 5000 });
    const movedFolder = expandedFolder.locator('.el-tree-node__content').filter({ hasText: '源文件夹' });
    await expect(movedFolder).toBeVisible({ timeout: 5000 });
  });

  test('拖拽文件夹节点调整同层级顺序', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
    if (!serverUrl) {
      test.skip(true, '缺少环境变量 TEST_SERVER_URL（由 .env.test 提供）');
    }
    if (!loginName || !password) {
      test.skip(true, '缺少环境变量 TEST_LOGIN_NAME/TEST_LOGIN_PASSWORD（由 .env.test 提供）');
    }
    await clearCache();
    const networkToggle = topBarPage.locator('[data-testid="header-network-toggle"]');
    const networkText = await networkToggle.textContent();
    if (networkText?.includes('离线模式') || networkText?.includes('offline mode')) {
      await networkToggle.click();
      await contentPage.waitForTimeout(500);
    }
    await topBarPage.locator('[data-testid="header-settings-btn"]').click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    await contentPage.locator('[data-testid="settings-menu-common-settings"]').click();
    const serverUrlInput = contentPage.getByPlaceholder(/请输入接口调用地址|Please enter.*address/i);
    await serverUrlInput.fill(serverUrl!);
    const saveBtn = contentPage.getByRole('button', { name: /保存|Save/i });
    if (await saveBtn.isEnabled()) {
      await saveBtn.click();
      await expect(contentPage.getByText(/保存成功|Saved successfully/i)).toBeVisible({ timeout: 5000 });
    }
    const baseUrl = contentPage.url().split('#')[0];
    await contentPage.goto(`${baseUrl}#/login`);
    await expect(contentPage.locator('[data-testid="login-form"]')).toBeVisible({ timeout: 5000 });
    await contentPage.locator('[data-testid="login-username-input"]').fill(loginName!);
    await contentPage.locator('[data-testid="login-password-input"]').fill(password!);
    await contentPage.locator('[data-testid="login-submit-btn"]').click();
    const captchaInput = contentPage.locator('[data-testid="login-captcha-input"]');
    if (await captchaInput.isVisible()) {
      if (!captcha) {
        throw new Error('后端要求验证码，请在 .env.test 中配置 TEST_LOGIN_CAPTCHA');
      }
      await captchaInput.fill(captcha);
      await contentPage.locator('[data-testid="login-submit-btn"]').click();
    }
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const projectName = `在线拖拽文件夹排序-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    const treeWrap = contentPage.locator('.tree-wrap');
    await contentPage.getByTestId('banner-add-folder-btn').click();
    const addFolderDialog = contentPage.getByTestId('add-folder-dialog');
    await expect(addFolderDialog).toBeVisible({ timeout: 5000 });
    await addFolderDialog.locator('[data-testid="add-folder-name-input"] input').fill('文件夹A');
    await addFolderDialog.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog).toBeHidden({ timeout: 10000 });
    await contentPage.getByTestId('banner-add-folder-btn').click();
    const addFolderDialog2 = contentPage.getByTestId('add-folder-dialog');
    await expect(addFolderDialog2).toBeVisible({ timeout: 5000 });
    await addFolderDialog2.locator('[data-testid="add-folder-name-input"] input').fill('文件夹B');
    await addFolderDialog2.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog2).toBeHidden({ timeout: 10000 });
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
    const allFolders = treeWrap.locator('> .el-tree > .el-tree-node .custom-tree-node');
    const firstFolderText = await allFolders.first().textContent();
    expect(firstFolderText).toContain('文件夹B');
  });

  test('拖拽文件夹节点到自身子节点操作被阻止', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
    if (!serverUrl) {
      test.skip(true, '缺少环境变量 TEST_SERVER_URL（由 .env.test 提供）');
    }
    if (!loginName || !password) {
      test.skip(true, '缺少环境变量 TEST_LOGIN_NAME/TEST_LOGIN_PASSWORD（由 .env.test 提供）');
    }
    await clearCache();
    const networkToggle = topBarPage.locator('[data-testid="header-network-toggle"]');
    const networkText = await networkToggle.textContent();
    if (networkText?.includes('离线模式') || networkText?.includes('offline mode')) {
      await networkToggle.click();
      await contentPage.waitForTimeout(500);
    }
    await topBarPage.locator('[data-testid="header-settings-btn"]').click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    await contentPage.locator('[data-testid="settings-menu-common-settings"]').click();
    const serverUrlInput = contentPage.getByPlaceholder(/请输入接口调用地址|Please enter.*address/i);
    await serverUrlInput.fill(serverUrl!);
    const saveBtn = contentPage.getByRole('button', { name: /保存|Save/i });
    if (await saveBtn.isEnabled()) {
      await saveBtn.click();
      await expect(contentPage.getByText(/保存成功|Saved successfully/i)).toBeVisible({ timeout: 5000 });
    }
    const baseUrl = contentPage.url().split('#')[0];
    await contentPage.goto(`${baseUrl}#/login`);
    await expect(contentPage.locator('[data-testid="login-form"]')).toBeVisible({ timeout: 5000 });
    await contentPage.locator('[data-testid="login-username-input"]').fill(loginName!);
    await contentPage.locator('[data-testid="login-password-input"]').fill(password!);
    await contentPage.locator('[data-testid="login-submit-btn"]').click();
    const captchaInput = contentPage.locator('[data-testid="login-captcha-input"]');
    if (await captchaInput.isVisible()) {
      if (!captcha) {
        throw new Error('后端要求验证码，请在 .env.test 中配置 TEST_LOGIN_CAPTCHA');
      }
      await captchaInput.fill(captcha);
      await contentPage.locator('[data-testid="login-submit-btn"]').click();
    }
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const projectName = `在线拖拽文件夹阻止-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    const treeWrap = contentPage.locator('.tree-wrap');
    await contentPage.getByTestId('banner-add-folder-btn').click();
    const addFolderDialog = contentPage.getByTestId('add-folder-dialog');
    await expect(addFolderDialog).toBeVisible({ timeout: 5000 });
    await addFolderDialog.locator('[data-testid="add-folder-name-input"] input').fill('父文件夹');
    await addFolderDialog.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog).toBeHidden({ timeout: 10000 });
    const parentFolderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '父文件夹' }).first();
    await parentFolderNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const newSubFolderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
    await newSubFolderItem.click();
    const subFolderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
    await expect(subFolderDialog).toBeVisible({ timeout: 5000 });
    await subFolderDialog.locator('input').first().fill('子文件夹');
    await subFolderDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    const parentFolderTreeNode = parentFolderNode.locator('xpath=ancestor::div[contains(@class,"el-tree-node")][1]');
    await expect(parentFolderTreeNode).toBeVisible({ timeout: 5000 });
    const isExpanded = await parentFolderTreeNode.evaluate(el => el.classList.contains('is-expanded'));
    if (!isExpanded) {
      await parentFolderTreeNode.locator('.el-tree-node__expand-icon').first().click();
      await contentPage.waitForTimeout(300);
    }
    const childFolderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '子文件夹' });
    const parentBox = await parentFolderNode.boundingBox();
    const childBox = await childFolderNode.boundingBox();
    if (parentBox && childBox) {
      await contentPage.mouse.move(parentBox.x + parentBox.width / 2, parentBox.y + parentBox.height / 2);
      await contentPage.mouse.down();
      await contentPage.mouse.move(childBox.x + childBox.width / 2, childBox.y + childBox.height / 2);
      await contentPage.mouse.up();
    }
    await contentPage.waitForTimeout(500);
    const rootParentFolder = treeWrap.locator('> .el-tree > .el-tree-node').filter({ hasText: '父文件夹' });
    await expect(rootParentFolder).toBeVisible({ timeout: 5000 });
  });

  test('移动包含多层嵌套的文件夹节点保持层级', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
    if (!serverUrl) {
      test.skip(true, '缺少环境变量 TEST_SERVER_URL（由 .env.test 提供）');
    }
    if (!loginName || !password) {
      test.skip(true, '缺少环境变量 TEST_LOGIN_NAME/TEST_LOGIN_PASSWORD（由 .env.test 提供）');
    }
    await clearCache();
    const networkToggle = topBarPage.locator('[data-testid="header-network-toggle"]');
    const networkText = await networkToggle.textContent();
    if (networkText?.includes('离线模式') || networkText?.includes('offline mode')) {
      await networkToggle.click();
      await contentPage.waitForTimeout(500);
    }
    await topBarPage.locator('[data-testid="header-settings-btn"]').click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    await contentPage.locator('[data-testid="settings-menu-common-settings"]').click();
    const serverUrlInput = contentPage.getByPlaceholder(/请输入接口调用地址|Please enter.*address/i);
    await serverUrlInput.fill(serverUrl!);
    const saveBtn = contentPage.getByRole('button', { name: /保存|Save/i });
    if (await saveBtn.isEnabled()) {
      await saveBtn.click();
      await expect(contentPage.getByText(/保存成功|Saved successfully/i)).toBeVisible({ timeout: 5000 });
    }
    const baseUrl = contentPage.url().split('#')[0];
    await contentPage.goto(`${baseUrl}#/login`);
    await expect(contentPage.locator('[data-testid="login-form"]')).toBeVisible({ timeout: 5000 });
    await contentPage.locator('[data-testid="login-username-input"]').fill(loginName!);
    await contentPage.locator('[data-testid="login-password-input"]').fill(password!);
    await contentPage.locator('[data-testid="login-submit-btn"]').click();
    const captchaInput = contentPage.locator('[data-testid="login-captcha-input"]');
    if (await captchaInput.isVisible()) {
      if (!captcha) {
        throw new Error('后端要求验证码，请在 .env.test 中配置 TEST_LOGIN_CAPTCHA');
      }
      await captchaInput.fill(captcha);
      await contentPage.locator('[data-testid="login-submit-btn"]').click();
    }
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const projectName = `在线拖拽多层文件夹-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await contentPage.getByTestId('banner-add-folder-btn').click();
    const addFolderDialog = contentPage.getByTestId('add-folder-dialog');
    await expect(addFolderDialog).toBeVisible({ timeout: 5000 });
    await addFolderDialog.locator('[data-testid="add-folder-name-input"] input').fill('源文件夹');
    await addFolderDialog.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog).toBeHidden({ timeout: 10000 });
    const sourceFolderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '源文件夹' }).first();
    await sourceFolderNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const newSubFolderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
    await newSubFolderItem.click();
    const subFolderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
    await expect(subFolderDialog).toBeVisible({ timeout: 5000 });
    await subFolderDialog.locator('input').first().fill('嵌套子文件夹');
    await subFolderDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    await sourceFolderNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    const addFileDialog = contentPage.getByTestId('add-file-dialog');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('嵌套HTTP节点');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    await contentPage.getByTestId('banner-add-folder-btn').click();
    const targetFolderDialog = contentPage.getByTestId('add-folder-dialog');
    await expect(targetFolderDialog).toBeVisible({ timeout: 5000 });
    await targetFolderDialog.locator('[data-testid="add-folder-name-input"] input').fill('目标文件夹');
    await targetFolderDialog.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(targetFolderDialog).toBeHidden({ timeout: 10000 });
    const targetFolderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '目标文件夹' }).first();
    const sourceBox = await sourceFolderNode.boundingBox();
    const targetBox = await targetFolderNode.boundingBox();
    if (sourceBox && targetBox) {
      await contentPage.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
      await contentPage.mouse.down();
      await contentPage.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
      await contentPage.mouse.up();
    }
    await contentPage.waitForTimeout(500);
    const targetFolderTreeNode = targetFolderNode.locator('xpath=ancestor::div[contains(@class,"el-tree-node")][1]');
    await expect(targetFolderTreeNode).toBeVisible({ timeout: 5000 });
    const isTargetExpanded = await targetFolderTreeNode.evaluate(el => el.classList.contains('is-expanded'));
    if (!isTargetExpanded) {
      await targetFolderTreeNode.locator('.el-tree-node__expand-icon').first().click();
      await contentPage.waitForTimeout(300);
    }
    const movedSourceFolder = targetFolderTreeNode.locator('.el-tree-node__content').filter({ hasText: '源文件夹' });
    await expect(movedSourceFolder).toBeVisible({ timeout: 5000 });
    const movedSourceTreeNode = movedSourceFolder.locator('xpath=ancestor::div[contains(@class,"el-tree-node")][1]');
    await expect(movedSourceTreeNode).toBeVisible({ timeout: 5000 });
    const isMovedExpanded = await movedSourceTreeNode.evaluate(el => el.classList.contains('is-expanded'));
    if (!isMovedExpanded) {
      await movedSourceTreeNode.locator('.el-tree-node__expand-icon').first().click();
      await contentPage.waitForTimeout(300);
    }
    const nestedSubFolder = movedSourceTreeNode.locator('.el-tree-node__content').filter({ hasText: '嵌套子文件夹' });
    await expect(nestedSubFolder).toBeVisible({ timeout: 5000 });
    const nestedHttpNode = movedSourceTreeNode.locator('.el-tree-node__content').filter({ hasText: '嵌套HTTP节点' });
    await expect(nestedHttpNode).toBeVisible({ timeout: 5000 });
  });
});
