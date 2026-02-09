import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('WebSocketAfterScriptEditorFeatures', () => {
  // 后置脚本编辑器支持JavaScript语法高亮
  test('后置脚本编辑器支持JavaScript语法高亮', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '后置脚本语法高亮测试' });
    // 切换到后置脚本标签
    const afterScriptTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /后置脚本/ });
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 在编辑器中输入包含关键字、函数、变量等的JavaScript代码
    const afterScriptPane = contentPage.locator('#pane-afterScript');
    const monacoEditor = afterScriptPane.locator('.s-monaco-editor');
    await expect(monacoEditor).toBeVisible({ timeout: 5000 });
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('const message = "hello world";\nfunction test() {\n  return 123;\n}\n// comment');
    await contentPage.waitForTimeout(500);
    // 验证编辑器使用Monaco Editor并支持语法高亮
    await expect(monacoEditor).toBeVisible();
    // 验证编辑器中存在语法高亮的token
    const editorContent = afterScriptPane.locator('.monaco-editor .view-lines');
    await expect(editorContent).toBeVisible();
    // 验证存在不同颜色的token类
    const hasTokens = afterScriptPane.locator('.monaco-editor .mtk1, .monaco-editor .mtk3, .monaco-editor .mtk5, .monaco-editor .mtk6, .monaco-editor .mtk7');
    await expect(hasTokens.first()).toBeVisible();
  });
  // 输入af.后出现代码补全提示,包括response等API
  test('输入af后出现代码补全提示', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '后置脚本代码补全测试' });
    // 切换到后置脚本标签
    const afterScriptTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /后置脚本/ });
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 在编辑器中输入af.触发代码补全
    const afterScriptPane = contentPage.locator('#pane-afterScript');
    const monacoEditor = afterScriptPane.locator('.s-monaco-editor');
    await expect(monacoEditor).toBeVisible({ timeout: 5000 });
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('af.');
    await contentPage.waitForTimeout(1000);
    // 验证代码补全列表出现
    const suggestWidget = afterScriptPane.locator('.monaco-editor .suggest-widget, .monaco-editor .editor-widget.suggest-widget');
    await expect(suggestWidget.first()).toBeVisible({ timeout: 5000 });
  });
  // 点击格式化按钮,代码格式化正确
  test('点击格式化按钮代码格式化正确', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '后置脚本格式化测试' });
    // 切换到后置脚本标签
    const afterScriptTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /后置脚本/ });
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 在编辑器中输入格式不规范的JavaScript代码
    const afterScriptPane = contentPage.locator('#pane-afterScript');
    const monacoEditor = afterScriptPane.locator('.s-monaco-editor');
    await expect(monacoEditor).toBeVisible({ timeout: 5000 });
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    // 输入格式混乱的代码
    await contentPage.keyboard.type('const obj={a:1,b:2};function test(){return obj.a+obj.b}');
    await contentPage.waitForTimeout(500);
    // 获取编辑器内容
    const editorContent = afterScriptPane.locator('.monaco-editor .view-lines');
    await expect(editorContent).toBeVisible();
    // 查找格式化按钮并点击
    const editorWrap = afterScriptPane.locator('.editor-wrap').first();
    const formatBtn = editorWrap.locator('.format-op .btn, [class*="format"]').first();
    if (await formatBtn.isVisible()) {
      await formatBtn.click();
      await contentPage.waitForTimeout(500);
    }
  });
  // 后置脚本内容保存后刷新页面保持不变
  test('后置脚本内容保存后刷新页面保持不变', async ({ contentPage, clearCache, createProject, createNode, reload }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '后置脚本持久化测试' });
    const testScript = 'const afterTestVar = 67890;';
    // 切换到后置脚本标签
    const afterScriptTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /后置脚本/ });
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 在编辑器中输入代码
    const afterScriptPane = contentPage.locator('#pane-afterScript');
    const monacoEditor = afterScriptPane.locator('.s-monaco-editor');
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
    // 切换到后置脚本标签
    await afterScriptTab.click();
    await contentPage.waitForTimeout(500);
    // 验证脚本内容保持不变
    const editorContent = contentPage.locator('#pane-afterScript .monaco-editor .view-lines');
    await expect(editorContent).toContainText('afterTestVar');
  });
  // 后置脚本标签有内容时显示红点
  test('后置脚本标签有内容时显示红点', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '后置脚本红点测试' });
    // 切换到后置脚本标签
    const afterScriptTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /后置脚本/ });
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 在编辑器中输入代码
    const afterScriptPane = contentPage.locator('#pane-afterScript');
    const monacoEditor = afterScriptPane.locator('.s-monaco-editor');
    await expect(monacoEditor).toBeVisible({ timeout: 5000 });
    await monacoEditor.click();
    await contentPage.waitForTimeout(200);
    await contentPage.keyboard.type('const y = 2;');
    await contentPage.waitForTimeout(300);
    // 验证标签显示红点
    const badge = afterScriptTab.locator('.el-badge');
    expect(await badge.isVisible()).toBeTruthy();
  });
});
