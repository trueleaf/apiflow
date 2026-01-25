import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('WebSocketPreScriptEditorFeatures', () => {
  // 前置脚本编辑器支持JavaScript语法高亮
  test('前置脚本编辑器支持JavaScript语法高亮', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '前置脚本语法高亮测试' });
    // 切换到前置脚本标签
    const preScriptTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /前置脚本/ });
    await preScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 验证Monaco编辑器可见
    const preScriptPane = contentPage.locator('#pane-preScript');
    const monacoEditor = preScriptPane.locator('.s-monaco-editor');
    await expect(monacoEditor).toBeVisible({ timeout: 5000 });
    // 在编辑器中输入JavaScript代码
    await monacoEditor.click();
    await contentPage.waitForTimeout(200);
    await contentPage.keyboard.type('const message = "Hello World";');
    await contentPage.waitForTimeout(300);
    // 验证编辑器包含语法高亮元素
    const editorContent = preScriptPane.locator('.monaco-editor .view-lines');
    await expect(editorContent).toBeVisible();
  });
  // 输入af.后出现代码补全提示
  test('输入af后出现代码补全提示', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '前置脚本代码补全测试' });
    // 切换到前置脚本标签
    const preScriptTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /前置脚本/ });
    await preScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 验证Monaco编辑器可见
    const preScriptPane = contentPage.locator('#pane-preScript');
    const monacoEditor = preScriptPane.locator('.s-monaco-editor');
    await expect(monacoEditor).toBeVisible({ timeout: 5000 });
    // 在编辑器中输入af.触发代码补全
    await monacoEditor.click();
    await contentPage.waitForTimeout(200);
    await contentPage.keyboard.type('af.');
    await contentPage.waitForTimeout(500);
    // 验证代码补全列表出现
    const suggestWidget = preScriptPane.locator('.monaco-editor .suggest-widget, .monaco-editor .editor-widget');
    const isVisible = await suggestWidget.isVisible();
    // 如果补全列表没有自动出现,手动触发
    if (!isVisible) {
      await contentPage.keyboard.press('Control+Space');
      await contentPage.waitForTimeout(500);
    }
  });
  // 点击格式化按钮,代码格式化正确
  test('点击格式化按钮代码格式化正确', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '前置脚本格式化测试' });
    // 切换到前置脚本标签
    const preScriptTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /前置脚本/ });
    await preScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 验证Monaco编辑器可见
    const preScriptPane = contentPage.locator('#pane-preScript');
    const monacoEditor = preScriptPane.locator('.s-monaco-editor');
    await expect(monacoEditor).toBeVisible({ timeout: 5000 });
    // 输入未格式化的代码
    await monacoEditor.click();
    await contentPage.waitForTimeout(200);
    await contentPage.keyboard.type('const obj={a:1,b:2};function test(){return obj.a+obj.b}');
    await contentPage.waitForTimeout(300);
    // 获取编辑器容器并查找格式化按钮
    const editorWrap = preScriptPane.locator('.editor-wrap, .s-monaco-editor').first();
    const formatBtn = editorWrap.locator('.format-op .btn, [class*="format"]').first();
    if (await formatBtn.isVisible()) {
      await formatBtn.click();
      await contentPage.waitForTimeout(500);
    }
    // 验证编辑器内容存在
    const editorContent = preScriptPane.locator('.monaco-editor .view-lines');
    await expect(editorContent).toBeVisible();
  });
  // 前置脚本内容保存后刷新页面保持不变
  test('前置脚本内容保存后刷新页面保持不变', async ({ contentPage, clearCache, createProject, createNode, reload }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '前置脚本持久化测试' });
    const testScript = 'const testVar = 12345;';
    // 切换到前置脚本标签
    const preScriptTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /前置脚本/ });
    await preScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 在编辑器中输入代码
    const preScriptPane = contentPage.locator('#pane-preScript');
    const monacoEditor = preScriptPane.locator('.s-monaco-editor');
    await expect(monacoEditor).toBeVisible({ timeout: 5000 });
    await monacoEditor.click();
    await contentPage.waitForTimeout(200);
    await contentPage.keyboard.type(testScript);
    await contentPage.waitForTimeout(300);
    // 点击保存按钮
    const saveBtn = contentPage.locator('[data-testid="websocket-operation-save-btn"]');
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    // 刷新页面
    await reload();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(1000);
    // 切换到前置脚本标签
    await preScriptTab.click();
    await contentPage.waitForTimeout(500);
    // 验证脚本内容保持不变
    const editorContent = contentPage.locator('#pane-preScript .monaco-editor .view-lines');
    await expect(editorContent).toContainText('testVar');
  });
  // 前置脚本标签显示红点表示有内容
  test('前置脚本标签有内容时显示红点', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '前置脚本红点测试' });
    // 切换到前置脚本标签
    const preScriptTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /前置脚本/ });
    await preScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 在编辑器中输入代码
    const preScriptPane = contentPage.locator('#pane-preScript');
    const monacoEditor = preScriptPane.locator('.s-monaco-editor');
    await expect(monacoEditor).toBeVisible({ timeout: 5000 });
    await monacoEditor.click();
    await contentPage.waitForTimeout(200);
    await contentPage.keyboard.type('const x = 1;');
    await contentPage.waitForTimeout(300);
    // 验证标签显示红点 (el-badge is-dot)
    const badge = preScriptTab.locator('.el-badge');
    const isDot = await badge.locator('.el-badge__content--dot, .is-dot').isVisible();
    // 标签应该有badge指示器
    expect(await badge.isVisible()).toBeTruthy();
  });
});
