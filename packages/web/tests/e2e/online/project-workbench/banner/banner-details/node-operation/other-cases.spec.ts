import { test, expect } from '../../../../../../fixtures/electron-online.fixture.ts';

test.describe('OnlineOtherCases', () => {
  test('在根节点新增/粘贴非folder节点,会排序在末尾', async ({ topBarPage, contentPage, clearCache }) => {
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
    const projectName = `在线排序非folder-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await contentPage.waitForTimeout(500);
    await contentPage.getByTestId('banner-add-folder-btn').click();
    const addFolderDialog = contentPage.getByTestId('add-folder-dialog');
    await expect(addFolderDialog).toBeVisible({ timeout: 5000 });
    await addFolderDialog.locator('[data-testid="add-folder-name-input"] input').fill('测试文件夹');
    await addFolderDialog.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog).toBeHidden({ timeout: 10000 });
    await contentPage.getByTestId('banner-add-http-btn').click();
    const addFileDialog1 = contentPage.getByTestId('add-file-dialog');
    await expect(addFileDialog1).toBeVisible({ timeout: 5000 });
    await addFileDialog1.locator('input').first().fill('HTTP节点1');
    await addFileDialog1.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    await contentPage.getByTestId('banner-add-http-btn').click();
    const addFileDialog2 = contentPage.getByTestId('add-file-dialog');
    await expect(addFileDialog2).toBeVisible({ timeout: 5000 });
    await addFileDialog2.locator('input').first().fill('HTTP节点2');
    await addFileDialog2.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    const treeNodes = contentPage.locator('.el-tree > .el-tree-node');
    const nodeTexts = await treeNodes.evaluateAll((els) => els.map((el) => (el.textContent ?? '').replace(/\\s+/g, ' ').trim()));
    const folderIndex = nodeTexts.findIndex((t) => t.includes('测试文件夹'));
    const http1Index = nodeTexts.findIndex((t) => t.includes('HTTP节点1'));
    const http2Index = nodeTexts.findIndex((t) => t.includes('HTTP节点2'));
    expect(folderIndex).toBeGreaterThanOrEqual(0);
    expect(http1Index).toBeGreaterThanOrEqual(0);
    expect(http2Index).toBeGreaterThanOrEqual(0);
    expect(folderIndex).toBeLessThan(http1Index);
    expect(http1Index).toBeLessThan(http2Index);
  });

  test('在根节点新增/粘贴folder节点,会排序到目录区域', async ({ topBarPage, contentPage, clearCache }) => {
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
    const projectName = `在线排序folder-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await contentPage.waitForTimeout(500);
    await contentPage.getByTestId('banner-add-http-btn').click();
    const addFileDialog = contentPage.getByTestId('add-file-dialog');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('HTTP节点');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    await contentPage.getByTestId('banner-add-folder-btn').click();
    const addFolderDialog1 = contentPage.getByTestId('add-folder-dialog');
    await expect(addFolderDialog1).toBeVisible({ timeout: 5000 });
    await addFolderDialog1.locator('[data-testid="add-folder-name-input"] input').fill('文件夹1');
    await addFolderDialog1.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog1).toBeHidden({ timeout: 10000 });
    await contentPage.getByTestId('banner-add-folder-btn').click();
    const addFolderDialog2 = contentPage.getByTestId('add-folder-dialog');
    await expect(addFolderDialog2).toBeVisible({ timeout: 5000 });
    await addFolderDialog2.locator('[data-testid="add-folder-name-input"] input').fill('文件夹2');
    await addFolderDialog2.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog2).toBeHidden({ timeout: 10000 });
    const treeNodes = contentPage.locator('.el-tree > .el-tree-node');
    const nodeTexts = await treeNodes.evaluateAll((els) => els.map((el) => (el.textContent ?? '').replace(/\\s+/g, ' ').trim()));
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

  test('在根节点粘贴包含folder节点的混合节点,排序区分folder与非folder', async ({ topBarPage, contentPage, clearCache }) => {
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
    const projectName = `在线混合排序-${Date.now()}`;
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(projectName);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
    await contentPage.waitForTimeout(500);
    await contentPage.getByTestId('banner-add-folder-btn').click();
    const addFolderDialog = contentPage.getByTestId('add-folder-dialog');
    await expect(addFolderDialog).toBeVisible({ timeout: 5000 });
    await addFolderDialog.locator('[data-testid="add-folder-name-input"] input').fill('源文件夹');
    await addFolderDialog.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog).toBeHidden({ timeout: 10000 });
    await contentPage.getByTestId('banner-add-http-btn').click();
    const addFileDialog = contentPage.getByTestId('add-file-dialog');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('源HTTP节点');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    const folderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '源文件夹' });
    await folderNode.click();
    await contentPage.waitForTimeout(200);
    await contentPage.keyboard.down('Control');
    const httpNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '源HTTP节点' });
    await httpNode.click();
    await contentPage.keyboard.up('Control');
    await contentPage.waitForTimeout(300);
    await folderNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const batchCopyItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /批量复制|Batch Copy/ });
    await expect(batchCopyItem).toBeVisible();
    await batchCopyItem.click();
    await contentPage.waitForTimeout(300);
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 400 } });
    await contentPage.waitForTimeout(300);
    const pasteItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /粘贴|Paste/ });
    await pasteItem.click();
    await contentPage.waitForTimeout(500);
    const treeNodes = contentPage.locator('.el-tree > .el-tree-node');
    const nodeTexts = await treeNodes.evaluateAll((els) => els.map((el) => (el.textContent ?? '').replace(/\\s+/g, ' ').trim()));
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
});
