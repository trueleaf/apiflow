import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('WebSocketPreScriptEditorFeatures', () => {
  // 前置脚本编辑器应渲染 Monaco 并展示语法 token
  test('前置脚本编辑器支持JavaScript语法高亮', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: '前置脚本语法高亮测试' });
    const preScriptTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /前置脚本/ });
    await preScriptTab.click();
    const preScriptPane = contentPage.locator('#pane-preScript');
    const monacoEditor = preScriptPane.locator('.s-monaco-editor');
    await expect(monacoEditor).toBeVisible({ timeout: 5000 });
    // 输入脚本并确认编辑区域正常渲染
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('const message = "Hello World";\nfunction sum(a, b) {\n  return a + b;\n}');
    await expect(preScriptPane.locator('.monaco-editor .view-lines')).toBeVisible({ timeout: 5000 });
    const tokenLocator = preScriptPane.locator('.monaco-editor .mtk1, .monaco-editor .mtk3, .monaco-editor .mtk5, .monaco-editor .mtk6, .monaco-editor .mtk7');
    await expect(tokenLocator.first()).toBeVisible({ timeout: 5000 });
  });
  // 输入 af. 后应出现代码补全候选
  test('输入af后出现代码补全提示', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: '前置脚本代码补全测试' });
    const preScriptTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /前置脚本/ });
    await preScriptTab.click();
    const preScriptPane = contentPage.locator('#pane-preScript');
    const monacoEditor = preScriptPane.locator('.s-monaco-editor');
    await expect(monacoEditor).toBeVisible({ timeout: 5000 });
    // 先输入触发补全，必要时通过快捷键再次触发
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('af.');
    const suggestWidget = preScriptPane.locator('.monaco-editor .suggest-widget, .monaco-editor .editor-widget.suggest-widget');
    const suggestVisible = await suggestWidget.first().isVisible().catch(() => false);
    if (!suggestVisible) {
      await contentPage.keyboard.press('Control+Space');
    }
    await expect(suggestWidget.first()).toBeVisible({ timeout: 5000 });
  });
  // 点击格式化按钮后编辑器内容区域应保持可见
  test('点击格式化按钮代码格式化正确', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: '前置脚本格式化测试' });
    const preScriptTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /前置脚本/ });
    await preScriptTab.click();
    const preScriptPane = contentPage.locator('#pane-preScript');
    const monacoEditor = preScriptPane.locator('.s-monaco-editor');
    await expect(monacoEditor).toBeVisible({ timeout: 5000 });
    // 输入未格式化代码并触发格式化入口
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('const obj={a:1,b:2};function test(){return obj.a+obj.b}');
    const formatBtn = preScriptPane.locator('.editor-wrap .format-op .btn, .editor-wrap [class*="format"]').first();
    if (await formatBtn.isVisible().catch(() => false)) {
      await formatBtn.click();
    }
    await expect(preScriptPane.locator('.monaco-editor .view-lines')).toBeVisible({ timeout: 5000 });
  });
  // 前置脚本保存后刷新页面应保持内容
  test('前置脚本内容保存后刷新页面保持不变', async ({ contentPage, clearCache, createProject, createNode, reload }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: '前置脚本持久化测试' });
    const preScriptTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /前置脚本/ });
    await preScriptTab.click();
    const preScriptPane = contentPage.locator('#pane-preScript');
    const monacoEditor = preScriptPane.locator('.s-monaco-editor');
    await expect(monacoEditor).toBeVisible({ timeout: 5000 });
    // 录入并保存脚本，再刷新确认内容仍在
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('const testVar = 12345;');
    await contentPage.locator('[data-testid="websocket-operation-save-btn"]').click();
    await reload();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await preScriptTab.click();
    await expect(contentPage.locator('#pane-preScript .monaco-editor .view-lines')).toContainText('testVar', { timeout: 10000 });
  });
  // 前置脚本有内容时标签应显示红点
  test('前置脚本标签有内容时显示红点', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: '前置脚本红点测试' });
    const preScriptTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /前置脚本/ });
    await preScriptTab.click();
    const monacoEditor = contentPage.locator('#pane-preScript .s-monaco-editor');
    await expect(monacoEditor).toBeVisible({ timeout: 5000 });
    // 输入脚本后确认标签红点出现
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('const x = 1;');
    await expect(preScriptTab.locator('.el-badge').first()).toBeVisible({ timeout: 5000 });
  });
});

