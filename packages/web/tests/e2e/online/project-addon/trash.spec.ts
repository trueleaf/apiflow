import { test, expect } from '../../../fixtures/electron-online.fixture.ts';

test.describe('Trash', () => {
  test.beforeEach(async ({ topBarPage, contentPage, clearCache }) => {
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
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: / 新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(`在线项目-${Date.now()}`);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
  });
  test('打开回收站页面,显示回收站标题和搜索条件', async ({ contentPage }) => {
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
  test('删除接口后在回收站中显示被删除的接口', async ({ contentPage }) => {
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('待删除接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });
    const treeNode = bannerTree.locator('.el-tree-node__content', { hasText: '待删除接口' }).first();
    await expect(treeNode).toBeVisible({ timeout: 5000 });
    await treeNode.click({ button: 'right' });
    const contextMenu = contentPage.locator('.s-contextmenu');
    await expect(contextMenu).toBeVisible({ timeout: 3000 });
    const deleteOption = contextMenu.locator('.s-contextmenu-item').filter({ hasText: /删除/ });
    await deleteOption.click();
    const confirmDialog = contentPage.locator('.el-message-box');
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
  test('恢复已删除的接口,接口重新出现在导航树中', async ({ contentPage }) => {
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('待恢复接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });
    const treeNode = bannerTree.locator('.el-tree-node__content', { hasText: '待恢复接口' }).first();
    await expect(treeNode).toBeVisible({ timeout: 5000 });
    await treeNode.click({ button: 'right' });
    const contextMenu2 = contentPage.locator('.s-contextmenu');
    await expect(contextMenu2).toBeVisible({ timeout: 3000 });
    const deleteOption = contextMenu2.locator('.s-contextmenu-item').filter({ hasText: /删除/ });
    await deleteOption.click();
    const confirmDialog = contentPage.locator('.el-message-box');
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
    const restoreConfirmDialog = contentPage.locator('.el-message-box');
    await expect(restoreConfirmDialog).toBeVisible({ timeout: 3000 });
    const restoreConfirmBtn = restoreConfirmDialog.locator('.el-button--primary');
    await restoreConfirmBtn.click();
    await contentPage.waitForTimeout(500);
    await expect(deletedDoc).not.toBeVisible({ timeout: 5000 });
    const restoredNode = bannerTree.locator('.el-tree-node__content', { hasText: '待恢复接口' }).first();
    await expect(restoredNode).toBeVisible({ timeout: 5000 });
  });
});
