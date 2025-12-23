import { test, expect } from '../../../../../../fixtures/electron-online.fixture.ts';

test.describe('RequestUrlRedo', () => {
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
  // 测试用例1: 请求url中输入字符串ab,按ctrl+z撤销到a,再按ctrl+shift+z重做,url值为ab
  test('请求url输入后撤销再按ctrl+shift+z重做,url值恢复', async ({ contentPage }) => {
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('URL重做快捷键测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 在url输入框中输入字符
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.fill('');
    await contentPage.keyboard.type('a');
    await contentPage.waitForTimeout(300);
    await contentPage.keyboard.type('b');
    await contentPage.waitForTimeout(300);
    // 验证url值为ab
    await expect(urlInput).toHaveText('ab', { timeout: 5000 });
    // 按ctrl+z快捷键撤销
    await contentPage.keyboard.press('Control+z');
    await contentPage.waitForTimeout(300);
    // 验证撤销后url值
    const urlValueAfterUndo = (await urlInput.innerText()).trim();
    expect(urlValueAfterUndo.length).toBeLessThan(2);
    // 按ctrl+shift+z快捷键重做
    await contentPage.keyboard.press('Control+y');
    await contentPage.waitForTimeout(300);
    // 验证重做后url值恢复为ab
    await expect(urlInput).toHaveText('ab', { timeout: 5000 });
  });
  // 测试用例2: 请求url中输入字符串ab,点击撤销按钮撤销到a,再点击重做按钮,url值为ab
  test('请求url输入后点击撤销按钮再点击重做按钮,url值恢复', async ({ contentPage }) => {
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('URL重做按钮测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 在url输入框中输入字符
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.fill('');
    await contentPage.keyboard.type('a');
    await contentPage.waitForTimeout(300);
    await contentPage.keyboard.type('b');
    await contentPage.waitForTimeout(300);
    // 验证url值为ab
    await expect(urlInput).toHaveText('ab', { timeout: 5000 });
    // 点击撤销按钮
    const undoBtn = contentPage.locator('[data-testid="http-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证撤销后url值
    const urlValueAfterUndo = (await urlInput.innerText()).trim();
    expect(urlValueAfterUndo.length).toBeLessThan(2);
    // 点击重做按钮
    const redoBtn = contentPage.locator('[data-testid="http-params-redo-btn"]');
    await redoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证重做后url值恢复为ab
    await expect(urlInput).toHaveText('ab', { timeout: 5000 });
  });
});
