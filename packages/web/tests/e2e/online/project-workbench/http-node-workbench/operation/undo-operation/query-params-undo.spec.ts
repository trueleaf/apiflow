import { test, expect } from '../../../../../../fixtures/electron-online.fixture.ts';

test.describe('QueryParamsUndo', () => {
  test.beforeEach(async ({ topBarPage, contentPage, clearCache }) => {
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
    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: / 新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await projectDialog.locator('input').first().fill(`在线项目-${Date.now()}`);
    await projectDialog.locator('.el-button--primary').last().click();
    await expect(projectDialog).toBeHidden({ timeout: 10000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 15000 });
  });
  // 测试用例1: query参数key输入字符串ab,按ctrl+z逐步撤销
  test('query参数key输入后按ctrl+z撤销', async ({ contentPage }) => {
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Query参数撤销测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 切换到Params标签页
    const paramsTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 找到Query参数区域的key输入框
    const keyInput = contentPage.getByPlaceholder('输入参数名称自动换行').first();
    await keyInput.click();
    await keyInput.pressSequentially('a', { delay: 100 });
    await contentPage.waitForTimeout(200);
    await contentPage.locator('[data-testid="url-input"]').click();
    await contentPage.waitForTimeout(200);
    await keyInput.click();
    await keyInput.pressSequentially('b', { delay: 100 });
    await contentPage.waitForTimeout(200);
    await contentPage.locator('[data-testid="url-input"]').click();
    await contentPage.waitForTimeout(200);
    // 验证key值为ab
    await expect(keyInput).toHaveValue('ab', { timeout: 5000 });
    // 按ctrl+z快捷键
    await contentPage.keyboard.press('ControlOrMeta+z');
    await contentPage.waitForTimeout(200);
    // 验证key值为a
    await expect(keyInput).toHaveValue('a', { timeout: 5000 });
    // 再次按ctrl+z快捷键
    await contentPage.keyboard.press('ControlOrMeta+z');
    await contentPage.waitForTimeout(200);
    // 验证key值为空
    await expect(keyInput).toHaveValue('', { timeout: 5000 });
  });
  // 测试用例2: query参数value输入字符串后撤销
  test('query参数value输入后按ctrl+z撤销', async ({ contentPage }) => {
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Query参数value撤销测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 切换到Params标签页
    const paramsTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 找到Query参数区域,先输入key
    const keyInput = contentPage.getByPlaceholder('输入参数名称自动换行').first();
    await keyInput.click();
    await keyInput.fill('testKey');
    await contentPage.waitForTimeout(200);
    // 找到value输入框并输入
    const valueInput = contentPage.locator('[data-testid="params-tree-value-input"]').first();
    const valueEditor = valueInput.locator('[contenteditable="true"]').first();
    await valueEditor.click();
    await valueEditor.pressSequentially('v1', { delay: 100 });
    await contentPage.waitForTimeout(200);
    await contentPage.locator('[data-testid="url-input"]').click();
    await contentPage.waitForTimeout(200);
    await valueEditor.click();
    await valueEditor.pressSequentially('v2', { delay: 100 });
    await contentPage.waitForTimeout(200);
    await contentPage.locator('[data-testid="url-input"]').click();
    await contentPage.waitForTimeout(200);
    // 验证value值
    await expect(valueEditor).toHaveText('v1v2', { timeout: 5000 });
    // 按ctrl+z快捷键
    await contentPage.keyboard.press('ControlOrMeta+z');
    await contentPage.waitForTimeout(200);
    // 验证value值变化
    await expect(valueEditor).toHaveText('v1', { timeout: 5000 });
  });
  // 测试用例3: url和query参数联动撤销
  test('url和query参数联动变化后撤销', async ({ contentPage }) => {
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('URL联动撤销测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 在url输入框输入带query参数的url
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.fill('http://example.com?key=value');
    await contentPage.waitForTimeout(500);
    // 验证url已输入
    await expect(urlInput).toHaveText('http://example.com?key=value', { timeout: 5000 });
    // 按ctrl+z快捷键撤销
    await contentPage.keyboard.press('Control+z');
    await contentPage.waitForTimeout(200);
    // 验证url恢复为空
    await expect(urlInput).toHaveText(/^\s*$/, { timeout: 5000 });
  });
});
