import { test, expect } from '../../../../../../fixtures/electron-online.fixture.ts';

test.describe('OnlineCopyNode', () => {
  test('复制 HTTP 节点粘贴到根节点', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
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
    const projectName = `在线复制HTTP-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await contentPage.getByTestId('banner-add-http-btn').click();
    const addFileDialog = contentPage.getByTestId('add-file-dialog');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('源HTTP节点');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    const sourceNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '源HTTP节点' });
    await expect(sourceNode).toBeVisible({ timeout: 5000 });
    await sourceNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const copyItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /复制|Copy/ }).first();
    await expect(copyItem).toBeVisible();
    await copyItem.click();
    await contentPage.waitForTimeout(300);
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 300 } });
    await contentPage.waitForTimeout(300);
    const pasteItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /粘贴|Paste/ });
    await expect(pasteItem).toBeVisible();
    await pasteItem.click();
    await contentPage.waitForTimeout(500);
    const allNodes = contentPage.locator('.el-tree-node__content').filter({ hasText: '源HTTP节点' });
    await expect(allNodes).toHaveCount(2, { timeout: 5000 });
  });

  test('复制 HTTP 节点粘贴到文件夹节点下', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
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
    const projectName = `在线复制到文件夹-${Date.now()}`;
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
    await addFolderDialog.locator('[data-testid="add-folder-name-input"] input').fill('目标文件夹');
    await addFolderDialog.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog).toBeHidden({ timeout: 10000 });
    await contentPage.getByTestId('banner-add-http-btn').click();
    const addFileDialog = contentPage.getByTestId('add-file-dialog');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('源HTTP节点');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    const sourceNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '源HTTP节点' });
    await expect(sourceNode).toBeVisible({ timeout: 5000 });
    await sourceNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const copyItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /复制|Copy/ }).first();
    await expect(copyItem).toBeVisible();
    await copyItem.click();
    await contentPage.waitForTimeout(300);
    const folderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '目标文件夹' }).first();
    await folderNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const pasteItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /粘贴|Paste/ });
    await expect(pasteItem).toBeVisible();
    await pasteItem.click();
    await contentPage.waitForTimeout(500);
    const expandedFolder = contentPage.locator('.el-tree-node.is-expanded').filter({ hasText: '目标文件夹' });
    await expect(expandedFolder).toBeVisible({ timeout: 5000 });
    const childNode = expandedFolder.locator('.el-tree-node__content').filter({ hasText: '源HTTP节点' });
    await expect(childNode).toBeVisible({ timeout: 5000 });
  });

  test('复制多个 HTTP 节点粘贴到根节点下', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
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
    const projectName = `在线批量复制HTTP-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await contentPage.waitForTimeout(500);
    for (let i = 1; i <= 3; i += 1) {
      await contentPage.getByTestId('banner-add-http-btn').click();
      const addFileDialog = contentPage.getByTestId('add-file-dialog');
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      await addFileDialog.locator('input').first().fill(`HTTP节点${i}`);
      await addFileDialog.locator('.el-button--primary').last().click();
      await contentPage.waitForTimeout(300);
    }
    const node1 = contentPage.locator('.el-tree-node__content').filter({ hasText: 'HTTP节点1' });
    const node2 = contentPage.locator('.el-tree-node__content').filter({ hasText: 'HTTP节点2' });
    const node3 = contentPage.locator('.el-tree-node__content').filter({ hasText: 'HTTP节点3' });
    await node1.click();
    await contentPage.waitForTimeout(200);
    await contentPage.keyboard.down('Control');
    await node2.click();
    await contentPage.waitForTimeout(200);
    await node3.click();
    await contentPage.keyboard.up('Control');
    await contentPage.waitForTimeout(300);
    await node1.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const batchCopyItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /批量复制|Batch Copy/i });
    await expect(batchCopyItem).toBeVisible();
    await batchCopyItem.click();
    await contentPage.waitForTimeout(300);
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 400 } });
    await contentPage.waitForTimeout(300);
    const pasteItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /粘贴|Paste/ });
    await pasteItem.click();
    await contentPage.waitForTimeout(500);
    const allNode1 = contentPage.locator('.el-tree-node__content').filter({ hasText: 'HTTP节点1' });
    const allNode2 = contentPage.locator('.el-tree-node__content').filter({ hasText: 'HTTP节点2' });
    const allNode3 = contentPage.locator('.el-tree-node__content').filter({ hasText: 'HTTP节点3' });
    await expect(allNode1).toHaveCount(2, { timeout: 5000 });
    await expect(allNode2).toHaveCount(2, { timeout: 5000 });
    await expect(allNode3).toHaveCount(2, { timeout: 5000 });
  });

  test('复制 WebSocket 节点粘贴到根节点下', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
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
    const projectName = `在线复制WS-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await contentPage.getByTestId('banner-add-http-btn').click();
    const addFileDialog = contentPage.getByTestId('add-file-dialog');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('源WebSocket节点');
    const wsRadio = addFileDialog.locator('.el-radio').filter({ hasText: /WebSocket/i }).first();
    await wsRadio.click();
    await contentPage.waitForTimeout(200);
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    const sourceNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '源WebSocket节点' });
    await expect(sourceNode).toBeVisible({ timeout: 5000 });
    await sourceNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const copyItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /复制|Copy/ }).first();
    await copyItem.click();
    await contentPage.waitForTimeout(300);
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 300 } });
    await contentPage.waitForTimeout(300);
    const pasteItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /粘贴|Paste/ });
    await pasteItem.click();
    await contentPage.waitForTimeout(500);
    const allNodes = contentPage.locator('.el-tree-node__content').filter({ hasText: '源WebSocket节点' });
    await expect(allNodes).toHaveCount(2, { timeout: 5000 });
  });

  test('复制 WebSocket 节点粘贴到文件夹节点下', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
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
    const projectName = `在线复制WS到文件夹-${Date.now()}`;
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
    await addFolderDialog.locator('[data-testid="add-folder-name-input"] input').fill('WS目标文件夹');
    await addFolderDialog.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog).toBeHidden({ timeout: 10000 });
    await contentPage.getByTestId('banner-add-http-btn').click();
    const addFileDialog = contentPage.getByTestId('add-file-dialog');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('源WebSocket节点');
    const wsRadio = addFileDialog.locator('.el-radio').filter({ hasText: /WebSocket/i }).first();
    await wsRadio.click();
    await contentPage.waitForTimeout(200);
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    const sourceNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '源WebSocket节点' });
    await sourceNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const copyItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /复制|Copy/ }).first();
    await copyItem.click();
    await contentPage.waitForTimeout(300);
    const folderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: 'WS目标文件夹' }).first();
    await folderNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const pasteItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /粘贴|Paste/ });
    await pasteItem.click();
    await contentPage.waitForTimeout(500);
    const expandedFolder = contentPage.locator('.el-tree-node.is-expanded').filter({ hasText: 'WS目标文件夹' });
    await expect(expandedFolder).toBeVisible({ timeout: 5000 });
  });

  test('复制 HTTP Mock 节点粘贴到根节点下', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
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
    const projectName = `在线复制HTTPMock-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await contentPage.getByTestId('banner-add-http-btn').click();
    const addFileDialog = contentPage.getByTestId('add-file-dialog');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('源HTTP Mock节点');
    const mockRadio = addFileDialog.locator('.el-radio').filter({ hasText: /HTTP Mock/i }).first();
    await mockRadio.click();
    await contentPage.waitForTimeout(200);
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    const sourceNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '源HTTP Mock节点' });
    await expect(sourceNode).toBeVisible({ timeout: 5000 });
    await sourceNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const copyItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /复制|Copy/ }).first();
    await copyItem.click();
    await contentPage.waitForTimeout(300);
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 300 } });
    await contentPage.waitForTimeout(300);
    const pasteItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /粘贴|Paste/ });
    await pasteItem.click();
    await contentPage.waitForTimeout(500);
    const allNodes = contentPage.locator('.el-tree-node__content').filter({ hasText: '源HTTP Mock节点' });
    await expect(allNodes).toHaveCount(2, { timeout: 5000 });
  });

  test('复制 HTTP Mock 节点粘贴到文件夹节点下', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
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
    const projectName = `在线复制HTTPMock到文件夹-${Date.now()}`;
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
    await addFolderDialog.locator('[data-testid="add-folder-name-input"] input').fill('Mock目标文件夹');
    await addFolderDialog.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog).toBeHidden({ timeout: 10000 });
    await contentPage.getByTestId('banner-add-http-btn').click();
    const addFileDialog = contentPage.getByTestId('add-file-dialog');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('源HTTP Mock节点');
    const mockRadio = addFileDialog.locator('.el-radio').filter({ hasText: /HTTP Mock/i }).first();
    await mockRadio.click();
    await contentPage.waitForTimeout(200);
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    const sourceNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '源HTTP Mock节点' });
    await sourceNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const copyItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /复制|Copy/ }).first();
    await copyItem.click();
    await contentPage.waitForTimeout(300);
    const folderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: 'Mock目标文件夹' }).first();
    await folderNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const pasteItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /粘贴|Paste/ });
    await pasteItem.click();
    await contentPage.waitForTimeout(500);
    const expandedFolder = contentPage.locator('.el-tree-node.is-expanded').filter({ hasText: 'Mock目标文件夹' });
    await expect(expandedFolder).toBeVisible({ timeout: 5000 });
  });

  test('复制 WebSocket Mock 节点粘贴到根节点下', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
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
    const projectName = `在线复制WSMock-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await contentPage.getByTestId('banner-add-http-btn').click();
    const addFileDialog = contentPage.getByTestId('add-file-dialog');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('源WS Mock节点');
    const wsMockRadio = addFileDialog.locator('.el-radio').filter({ hasText: /WebSocket Mock/i }).first();
    await wsMockRadio.click();
    await contentPage.waitForTimeout(200);
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    const sourceNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '源WS Mock节点' });
    await sourceNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const copyItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /复制|Copy/ }).first();
    await copyItem.click();
    await contentPage.waitForTimeout(300);
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 300 } });
    await contentPage.waitForTimeout(300);
    const pasteItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /粘贴|Paste/ });
    await pasteItem.click();
    await contentPage.waitForTimeout(500);
    const allNodes = contentPage.locator('.el-tree-node__content').filter({ hasText: '源WS Mock节点' });
    await expect(allNodes).toHaveCount(2, { timeout: 5000 });
  });

  test('复制 WebSocket Mock 节点粘贴到文件夹节点下', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
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
    const projectName = `在线复制WSMock到文件夹-${Date.now()}`;
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
    await addFolderDialog.locator('[data-testid="add-folder-name-input"] input').fill('WSMock目标文件夹');
    await addFolderDialog.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog).toBeHidden({ timeout: 10000 });
    await contentPage.getByTestId('banner-add-http-btn').click();
    const addFileDialog = contentPage.getByTestId('add-file-dialog');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('源WS Mock节点');
    const wsMockRadio = addFileDialog.locator('.el-radio').filter({ hasText: /WebSocket Mock/i }).first();
    await wsMockRadio.click();
    await contentPage.waitForTimeout(200);
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    const sourceNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '源WS Mock节点' });
    await sourceNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const copyItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /复制|Copy/ }).first();
    await copyItem.click();
    await contentPage.waitForTimeout(300);
    const folderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: 'WSMock目标文件夹' }).first();
    await folderNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const pasteItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /粘贴|Paste/ });
    await pasteItem.click();
    await contentPage.waitForTimeout(500);
    const expandedFolder = contentPage.locator('.el-tree-node.is-expanded').filter({ hasText: 'WSMock目标文件夹' });
    await expect(expandedFolder).toBeVisible({ timeout: 5000 });
  });

  test('复制单个 folder 节点粘贴到根节点下', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
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
    const projectName = `在线复制文件夹-${Date.now()}`;
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
    const sourceFolder = contentPage.locator('.el-tree-node__content').filter({ hasText: '源文件夹' });
    await sourceFolder.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const copyItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /复制|Copy/ }).first();
    await copyItem.click();
    await contentPage.waitForTimeout(300);
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 300 } });
    await contentPage.waitForTimeout(300);
    const pasteItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /粘贴|Paste/ });
    await pasteItem.click();
    await contentPage.waitForTimeout(500);
    const allFolders = contentPage.locator('.el-tree-node__content').filter({ hasText: '源文件夹' });
    await expect(allFolders).toHaveCount(2, { timeout: 5000 });
  });

  test('复制包含子节点的 folder 节点', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
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
    const projectName = `在线复制子节点文件夹-${Date.now()}`;
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
    await addFolderDialog.locator('[data-testid="add-folder-name-input"] input').fill('父文件夹');
    await addFolderDialog.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog).toBeHidden({ timeout: 10000 });
    const parentFolder = contentPage.locator('.el-tree-node__content').filter({ hasText: '父文件夹' });
    await parentFolder.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口|New Interface/i });
    await newInterfaceItem.click();
    const addFileDialog = contentPage.getByTestId('add-file-dialog');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('子节点HTTP');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    await parentFolder.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const copyItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /复制|Copy/ }).first();
    await copyItem.click();
    await contentPage.waitForTimeout(300);
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 350 } });
    await contentPage.waitForTimeout(300);
    const pasteItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /粘贴|Paste/ });
    await pasteItem.click();
    await contentPage.waitForTimeout(500);
    const allFolders = contentPage.locator('.el-tree-node__content').filter({ hasText: '父文件夹' });
    await expect(allFolders).toHaveCount(2, { timeout: 5000 });
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
      .locator('.el-tree-node__children .el-tree-node__content')
      .filter({ hasText: '子节点HTTP' });
    await expect(secondChildNode).toHaveCount(1, { timeout: 5000 });
  });

  test('批量复制不同类型节点粘贴到根节点下', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
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
    const projectName = `在线混合复制-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await contentPage.waitForTimeout(500);
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    let newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口|New Interface/i });
    await newInterfaceItem.click();
    let addFileDialog = contentPage.getByTestId('add-file-dialog');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('混合HTTP节点');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口|New Interface/i });
    await newInterfaceItem.click();
    addFileDialog = contentPage.getByTestId('add-file-dialog');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('混合WebSocket节点');
    const wsRadio = addFileDialog.locator('.el-radio').filter({ hasText: /WebSocket/i }).first();
    await wsRadio.click();
    await contentPage.waitForTimeout(200);
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    const httpNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '混合HTTP节点' });
    const wsNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '混合WebSocket节点' });
    await httpNode.click();
    await contentPage.waitForTimeout(200);
    await contentPage.keyboard.down('Control');
    await wsNode.click();
    await contentPage.keyboard.up('Control');
    await contentPage.waitForTimeout(300);
    await httpNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const batchCopyItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /批量复制|Batch Copy/i });
    await batchCopyItem.click();
    await contentPage.waitForTimeout(300);
    await treeWrap.click({ button: 'right', position: { x: 100, y: 400 } });
    await contentPage.waitForTimeout(300);
    const pasteItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /粘贴|Paste/ });
    await pasteItem.click();
    await contentPage.waitForTimeout(500);
    const allHttpNodes = contentPage.locator('.el-tree-node__content').filter({ hasText: '混合HTTP节点' });
    const allWsNodes = contentPage.locator('.el-tree-node__content').filter({ hasText: '混合WebSocket节点' });
    await expect(allHttpNodes).toHaveCount(2, { timeout: 5000 });
    await expect(allWsNodes).toHaveCount(2, { timeout: 5000 });
  });

  test('使用Ctrl+C和Ctrl+V复制粘贴节点', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;
    const loginName = process.env.TEST_LOGIN_NAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const captcha = process.env.TEST_LOGIN_CAPTCHA;
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
    const projectName = `在线快捷键复制-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await contentPage.waitForTimeout(500);
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口|New Interface/i });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.getByTestId('add-file-dialog');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('快捷键测试节点');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    const sourceNode = contentPage.locator('.custom-tree-node').filter({ hasText: '快捷键测试节点' });
    await sourceNode.click();
    await contentPage.waitForTimeout(200);
    await contentPage.keyboard.press('Control+c');
    await contentPage.waitForTimeout(300);
    await treeWrap.click({ button: 'right', position: { x: 100, y: 300 } });
    await contentPage.waitForTimeout(200);
    await contentPage.keyboard.press('Escape');
    await contentPage.waitForTimeout(200);
    await sourceNode.focus();
    await contentPage.keyboard.press('Control+v');
    await contentPage.waitForTimeout(500);
    const allNodes = contentPage.locator('.custom-tree-node').filter({ hasText: '快捷键测试节点' });
    await expect(allNodes).toHaveCount(2, { timeout: 5000 });
  });
});
