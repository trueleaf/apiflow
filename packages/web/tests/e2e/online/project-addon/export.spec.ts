import { test, expect } from '../../../fixtures/electron-online.fixture.ts';

const MOCK_SERVER_PORT = 3456;

test.describe('Export', () => {
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

  test('导出弹窗显示HTML、WORD、JSON文档、OpenAPI四种导出类型', async ({ contentPage }) => {
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const exportItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导出文档/ });
    await exportItem.click();
    await contentPage.waitForTimeout(500);
    const exportPage = contentPage.locator('.doc-export');
    await expect(exportPage).toBeVisible({ timeout: 5000 });
    const htmlOption = exportPage.locator('.item').filter({ hasText: 'HTML' });
    await expect(htmlOption).toBeVisible();
    const wordOption = exportPage.locator('.item').filter({ hasText: 'WORD' });
    await expect(wordOption).toBeVisible();
    const jsonOption = exportPage.locator('.item').filter({ hasText: /JSON文档/ });
    await expect(jsonOption).toBeVisible();
    const openapiOption = exportPage.locator('.item').filter({ hasText: 'OpenAPI' });
    await expect(openapiOption).toBeVisible();
  });

  test('选择JSON文档类型后显示active状态', async ({ contentPage }) => {
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const exportItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导出文档/ });
    await exportItem.click();
    await contentPage.waitForTimeout(500);
    const exportPage = contentPage.locator('.doc-export');
    await expect(exportPage).toBeVisible({ timeout: 5000 });
    const jsonOption = exportPage.locator('.item').filter({ hasText: /JSON文档/ });
    await jsonOption.click();
    await expect(jsonOption).toHaveClass(/active/);
  });

  test('选择OpenAPI类型后显示active状态', async ({ contentPage }) => {
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const exportItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导出文档/ });
    await exportItem.click();
    await contentPage.waitForTimeout(500);
    const exportPage = contentPage.locator('.doc-export');
    await expect(exportPage).toBeVisible({ timeout: 5000 });
    const openapiOption = exportPage.locator('.item').filter({ hasText: 'OpenAPI' });
    await openapiOption.click();
    await expect(openapiOption).toHaveClass(/active/);
  });

  test('开启选择导出后显示el-tree节点树', async ({ contentPage }) => {
    const addFileBtn = contentPage.getByTestId('banner-add-http-btn');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: / 新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const exportItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导出文档/ });
    await exportItem.click();
    await contentPage.waitForTimeout(500);
    const exportPage = contentPage.locator('.doc-export');
    await expect(exportPage).toBeVisible({ timeout: 5000 });
    const selectExportCheckbox = exportPage.locator('.config-item').filter({ hasText: /选择导出/ }).locator('.el-checkbox');
    await expect(selectExportCheckbox).toBeVisible({ timeout: 5000 });
    await selectExportCheckbox.click();
    await contentPage.waitForTimeout(300);
    const tree = exportPage.locator('.el-tree');
    await expect(tree).toBeVisible({ timeout: 5000 });
    const treeNode = tree.locator('.el-tree-node');
    await expect(treeNode.first()).toBeVisible();
  });

  test('导出JSON文档格式,点击确定导出按钮触发下载', async ({ contentPage }) => {
    const addFileBtn = contentPage.getByTestId('banner-add-http-btn');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: / 新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('导出测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const exportItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导出文档/ });
    await exportItem.click();
    await contentPage.waitForTimeout(500);
    const exportPage = contentPage.locator('.doc-export');
    await expect(exportPage).toBeVisible({ timeout: 5000 });
    const jsonOption = exportPage.locator('.item').filter({ hasText: /JSON文档/ });
    await jsonOption.click();
    await expect(jsonOption).toHaveClass(/active/);
    await contentPage.evaluate(() => {
      const w = window as unknown as { __downloadFilenames?: string[] };
      w.__downloadFilenames = [];
      const originalClick = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function () {
        const downloadAttr = this.getAttribute('download');
        if (downloadAttr) {
          w.__downloadFilenames?.push(downloadAttr);
        }
        return originalClick.apply(this);
      };
    });
    const exportBtn = exportPage.locator('.el-button--primary').filter({ hasText: /确定导出/ });
    await exportBtn.click();
    await expect.poll(async () => {
      return await contentPage.evaluate(() => {
        const w = window as unknown as { __downloadFilenames?: string[] };
        return w.__downloadFilenames?.length || 0;
      });
    }, { timeout: 5000 }).toBeGreaterThan(0);
    const filenames = await contentPage.evaluate(() => {
      const w = window as unknown as { __downloadFilenames?: string[] };
      return w.__downloadFilenames || [];
    });
    expect(filenames.some((name) => name.endsWith('.json'))).toBeTruthy();
  });

  test('导出OpenAPI格式,点击确定导出按钮触发下载', async ({ contentPage }) => {
    const addFileBtn = contentPage.getByTestId('banner-add-http-btn');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: / 新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('OpenAPI测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const exportItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导出文档/ });
    await exportItem.click();
    await contentPage.waitForTimeout(500);
    const exportPage = contentPage.locator('.doc-export');
    await expect(exportPage).toBeVisible({ timeout: 5000 });
    const openapiOption = exportPage.locator('.item').filter({ hasText: 'OpenAPI' });
    await openapiOption.click();
    await expect(openapiOption).toHaveClass(/active/);
    await contentPage.evaluate(() => {
      const w = window as unknown as { __downloadFilenames?: string[] };
      w.__downloadFilenames = [];
      const originalClick = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function () {
        const downloadAttr = this.getAttribute('download');
        if (downloadAttr) {
          w.__downloadFilenames?.push(downloadAttr);
        }
        return originalClick.apply(this);
      };
    });
    const exportBtn = exportPage.locator('.el-button--primary').filter({ hasText: /确定导出/ });
    await exportBtn.click();
    await expect.poll(async () => {
      return await contentPage.evaluate(() => {
        const w = window as unknown as { __downloadFilenames?: string[] };
        return w.__downloadFilenames?.length || 0;
      });
    }, { timeout: 5000 }).toBeGreaterThan(0);
    const filenames = await contentPage.evaluate(() => {
      const w = window as unknown as { __downloadFilenames?: string[] };
      return w.__downloadFilenames || [];
    });
    expect(filenames.some((name) => name.endsWith('.openapi.json'))).toBeTruthy();
  });

});
