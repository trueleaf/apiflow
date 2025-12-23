import { test, expect } from '../../../../../../fixtures/electron-online.fixture.ts';

test.describe('QueryParamsRedo', () => {
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
  // 测试用例1: query参数key输入值后撤销,再重做,值恢复到撤销前的状态
  test('query参数key输入值后撤销再重做,值恢复到撤销前的状态', async ({ contentPage }) => {
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Query参数重做测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 确保选中当前HTTP节点（用于记录撤销/重做）
    const navTab = contentPage.locator('.nav .item').filter({ hasText: 'Query参数重做测试' }).first();
    await navTab.click();
    await expect(navTab).toHaveClass(/active/, { timeout: 5000 });
    // 点击Params标签页
    const paramsTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 在query参数key输入框中输入page
    const queryTree = contentPage.locator('.cl-params-tree').first();
    const keyInputs = queryTree.locator('[data-testid="params-tree-key-input"]');
    await keyInputs.first().click();
    await keyInputs.first().fill('page');
    await contentPage.waitForTimeout(200);
    // 验证key值为page
    await expect(keyInputs.first()).toHaveValue('page', { timeout: 5000 });
    // 点击撤销按钮
    const undoBtn = contentPage.locator('[data-testid="http-params-undo-btn"]').first();
    await expect(undoBtn).not.toHaveClass(/disabled/, { timeout: 5000 });
    for (let i = 0; i < 5; i += 1) {
      const currentValue = await keyInputs.first().inputValue();
      if (!currentValue) break;
      await expect(undoBtn).not.toHaveClass(/disabled/, { timeout: 5000 });
      await undoBtn.click();
      await contentPage.waitForTimeout(200);
    }
    // 验证撤销后query参数key为空
    await expect(keyInputs.first()).toHaveValue('', { timeout: 10000 });
    // 点击重做按钮
    const redoBtn = contentPage.locator('[data-testid="http-params-redo-btn"]').first();
    await expect(redoBtn).not.toHaveClass(/disabled/, { timeout: 5000 });
    for (let i = 0; i < 5; i += 1) {
      const currentValue = await keyInputs.first().inputValue();
      if (currentValue === 'page') break;
      await expect(redoBtn).not.toHaveClass(/disabled/, { timeout: 5000 });
      await redoBtn.click();
      await contentPage.waitForTimeout(200);
    }
    // 验证重做后query参数key值恢复为page
    await expect(keyInputs.first()).toHaveValue('page', { timeout: 5000 });
  });
  // 测试用例2: query参数拖拽后撤销,再重做,顺序恢复到撤销前的状态
  test('query参数拖拽后撤销再重做,顺序恢复到撤销前的状态', async ({ contentPage }) => {
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Query参数拖拽重做测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 确保选中当前HTTP节点（用于记录撤销/重做）
    const navTab = contentPage.locator('.nav .item').filter({ hasText: 'Query参数拖拽重做测试' }).first();
    await navTab.click();
    await expect(navTab).toHaveClass(/active/, { timeout: 5000 });
    // 点击Params标签页
    const paramsTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 添加两个query参数: page和size
    const queryTree = contentPage.locator('.cl-params-tree').first();
    const keyInputs = queryTree.locator('[data-testid="params-tree-key-input"]');
    await keyInputs.first().click();
    await keyInputs.first().fill('page');
    await contentPage.waitForTimeout(200);
    await expect(keyInputs.nth(1)).toBeVisible({ timeout: 5000 });
    await keyInputs.nth(1).click();
    await keyInputs.nth(1).fill('size');
    await contentPage.waitForTimeout(200);
    // 验证初始顺序为page,size
    await expect(keyInputs.first()).toHaveValue('page', { timeout: 5000 });
    await expect(keyInputs.nth(1)).toHaveValue('size', { timeout: 5000 });
    // 拖拽第一个参数到第二个位置
    const nodeContents = queryTree.locator('.el-tree-node__content');
    await expect(nodeContents.nth(1)).toBeVisible({ timeout: 5000 });
    await nodeContents.first().dragTo(nodeContents.nth(1), {
      sourcePosition: { x: 2, y: 10 },
      targetPosition: { x: 2, y: 10 },
    });
    await contentPage.waitForTimeout(500);
    // 验证拖拽后顺序已变化
    await expect(keyInputs.first()).toHaveValue('size', { timeout: 5000 });
    // 点击撤销按钮恢复顺序
    const undoBtn = contentPage.locator('[data-testid="http-params-undo-btn"]').first();
    await expect(undoBtn).not.toHaveClass(/disabled/, { timeout: 5000 });
    for (let i = 0; i < 5; i += 1) {
      const firstValue = await keyInputs.first().inputValue();
      if (firstValue === 'page') break;
      await expect(undoBtn).not.toHaveClass(/disabled/, { timeout: 5000 });
      await undoBtn.click();
      await contentPage.waitForTimeout(200);
    }
    // 验证撤销后顺序恢复为page,size
    await expect(keyInputs.first()).toHaveValue('page', { timeout: 5000 });
    // 点击重做
    const redoBtn = contentPage.locator('[data-testid="http-params-redo-btn"]').first();
    await expect(redoBtn).not.toHaveClass(/disabled/, { timeout: 5000 });
    for (let i = 0; i < 5; i += 1) {
      const firstValue = await keyInputs.first().inputValue();
      if (firstValue === 'size') break;
      await expect(redoBtn).not.toHaveClass(/disabled/, { timeout: 5000 });
      await redoBtn.click();
      await contentPage.waitForTimeout(200);
    }
    // 验证重做后顺序恢复为拖拽后的状态
    await expect(keyInputs.first()).toHaveValue('size', { timeout: 5000 });
  });
});
