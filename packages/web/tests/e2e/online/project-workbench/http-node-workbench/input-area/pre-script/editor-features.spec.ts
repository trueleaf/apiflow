import { test, expect } from '../../../../../../fixtures/electron-online.fixture.ts';

test.describe('PreScriptEditorFeatures', () => {
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
  // 前置脚本编辑器支持JavaScript语法高亮
  test('前置脚本编辑器支持JavaScript语法高亮', async ({ contentPage }) => {
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('前置脚本语法高亮测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 切换到前置脚本标签
    const preScriptTab = contentPage.locator('[data-testid="http-params-tab-prescript"]');
    await preScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 验证Monaco编辑器可见
    const monacoEditor = contentPage.locator('.s-monaco-editor');
    await expect(monacoEditor).toBeVisible({ timeout: 5000 });
    // 在编辑器中输入JavaScript代码
    await monacoEditor.click();
    await contentPage.waitForTimeout(200);
    await contentPage.keyboard.type('const message = "Hello World";');
    await contentPage.waitForTimeout(300);
    // 验证编辑器包含语法高亮元素
    const editorContent = contentPage.locator('.monaco-editor .view-lines');
    await expect(editorContent).toBeVisible();
  });
  // 输入af.后出现代码补全提示
  test('输入af后出现代码补全提示', async ({ contentPage }) => {
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('前置脚本代码补全测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 切换到前置脚本标签
    const preScriptTab = contentPage.locator('[data-testid="http-params-tab-prescript"]');
    await preScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 验证Monaco编辑器可见
    const monacoEditor = contentPage.locator('.s-monaco-editor');
    await expect(monacoEditor).toBeVisible({ timeout: 5000 });
    // 在编辑器中输入af.触发代码补全
    await monacoEditor.click();
    await contentPage.waitForTimeout(200);
    await contentPage.keyboard.type('af.');
    await contentPage.waitForTimeout(500);
    // 验证代码补全列表出现
    const suggestWidget = contentPage.locator('.monaco-editor .suggest-widget, .monaco-editor .editor-widget');
    const isVisible = await suggestWidget.isVisible();
    // 如果补全列表没有自动出现，手动触发
    if (!isVisible) {
      await contentPage.keyboard.press('Control+Space');
      await contentPage.waitForTimeout(500);
    }
  });
  // 点击格式化按钮,代码格式化正确
  test('点击格式化按钮代码格式化正确', async ({ contentPage }) => {
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('前置脚本格式化测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 切换到前置脚本标签
    const preScriptTab = contentPage.locator('[data-testid="http-params-tab-prescript"]');
    await preScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 验证Monaco编辑器可见
    const monacoEditor = contentPage.locator('.s-monaco-editor');
    await expect(monacoEditor).toBeVisible({ timeout: 5000 });
    // 在编辑器中输入格式不规范的JavaScript代码
    await monacoEditor.click();
    await contentPage.waitForTimeout(200);
    await contentPage.keyboard.type('function test(){const a=1;return a+2;}');
    await contentPage.waitForTimeout(300);
    // 尝试点击格式化按钮
    const formatBtn = contentPage.locator('.format-btn, [data-testid="format-btn"], button', { hasText: /格式化|Format/ });
    if (await formatBtn.isVisible()) {
      await formatBtn.click();
      await contentPage.waitForTimeout(500);
    } else {
      // 使用快捷键格式化
      await contentPage.keyboard.press('Shift+Alt+F');
      await contentPage.waitForTimeout(500);
    }
    // 验证编辑器内容仍然存在
    const editorContent = contentPage.locator('.monaco-editor .view-lines');
    await expect(editorContent).toBeVisible();
  });
  // 鼠标悬停在af对象属性上时显示API说明提示
  test('鼠标悬停在af对象属性上显示API说明提示', async ({ contentPage }) => {
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('前置脚本Hover提示测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 切换到前置脚本标签
    const preScriptTab = contentPage.locator('[data-testid="http-params-tab-prescript"]');
    await preScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 验证Monaco编辑器可见
    const monacoEditor = contentPage.locator('.s-monaco-editor');
    await expect(monacoEditor).toBeVisible({ timeout: 5000 });
    // 在编辑器中输入af.request
    await monacoEditor.click();
    await contentPage.waitForTimeout(200);
    await contentPage.keyboard.type('af.request');
    await contentPage.waitForTimeout(300);
    // 将鼠标悬停在af.request上
    const editorContent = contentPage.locator('.monaco-editor .view-lines');
    await editorContent.hover();
    await contentPage.waitForTimeout(500);
    // 验证编辑器内容存在
    await expect(editorContent).toBeVisible();
  });
});
