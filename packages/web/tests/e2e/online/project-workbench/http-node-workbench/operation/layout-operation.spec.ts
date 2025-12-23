import { test, expect } from '../../../../../fixtures/electron-online.fixture.ts';

const MOCK_SERVER_PORT = 3456;

test.describe('LayoutOperation', () => {
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
  // 测试用例1: 点击水平布局按钮,请求区域和响应区域左右排列
  test('点击水平布局按钮,请求区域和响应区域左右排列', async ({ contentPage }) => {
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('水平布局测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 点击布局下拉按钮
    const layoutDropdown = contentPage.locator('[data-testid="http-params-layout-dropdown"]');
    await layoutDropdown.click();
    await contentPage.waitForTimeout(300);
    // 选择左右布局
    const horizontalOption = contentPage.locator('.el-dropdown-menu__item').filter({ hasText: /左右布局|Horizontal/ });
    await horizontalOption.click();
    await contentPage.waitForTimeout(500);
    // 验证布局切换为水平布局
    const apidocContainer = contentPage.locator('.apidoc');
    await expect(apidocContainer).not.toHaveClass(/vertical/, { timeout: 5000 });
    // 验证请求区域在左侧,响应区域在右侧
    const requestLayout = contentPage.locator('.request-layout');
    await expect(requestLayout).toBeVisible({ timeout: 5000 });
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    const responseSummary = contentPage.locator('.response-summary-view');
    await expect(responseSummary).toBeVisible({ timeout: 10000 });
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
  });
  // 测试用例2: 点击垂直布局按钮,请求区域和响应区域上下排列
  test('点击垂直布局按钮,请求区域和响应区域上下排列', async ({ contentPage }) => {
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('垂直布局测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 点击布局下拉按钮
    const layoutDropdown = contentPage.locator('[data-testid="http-params-layout-dropdown"]');
    await layoutDropdown.click();
    await contentPage.waitForTimeout(300);
    // 选择上下布局
    const verticalOption = contentPage.locator('.el-dropdown-menu__item').filter({ hasText: /上下布局|Vertical/ });
    await verticalOption.click();
    await contentPage.waitForTimeout(500);
    // 验证布局切换为垂直布局
    const apidocContainer = contentPage.locator('.apidoc');
    await expect(apidocContainer).toHaveClass(/vertical/, { timeout: 5000 });
    // 验证请求区域在上方,响应区域在下方
    const requestLayout = contentPage.locator('.request-layout');
    await expect(requestLayout).toBeVisible({ timeout: 5000 });
    await expect(requestLayout).toHaveClass(/vertical/, { timeout: 5000 });
  });
  // 测试用例3: 切换布局后刷新页面,布局保持不变
  test('切换布局后刷新页面,布局保持不变', async ({ contentPage }) => {
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('布局持久化测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 点击布局下拉按钮,切换到上下布局
    const layoutDropdown = contentPage.locator('[data-testid="http-params-layout-dropdown"]');
    await layoutDropdown.click();
    await contentPage.waitForTimeout(300);
    const verticalOption = contentPage.locator('.el-dropdown-menu__item').filter({ hasText: /上下布局|Vertical/ });
    await verticalOption.click();
    await contentPage.waitForTimeout(500);
    // 验证布局已切换为垂直布局
    const apidocContainer = contentPage.locator('.apidoc');
    await expect(apidocContainer).toHaveClass(/vertical/, { timeout: 5000 });
    // 刷新页面
    await contentPage.reload();
    await contentPage.waitForTimeout(1000);
    // 验证刷新后布局保持为垂直布局
    const apidocContainerAfterReload = contentPage.locator('.apidoc');
    await expect(apidocContainerAfterReload).toHaveClass(/vertical/, { timeout: 5000 });
  });
});
