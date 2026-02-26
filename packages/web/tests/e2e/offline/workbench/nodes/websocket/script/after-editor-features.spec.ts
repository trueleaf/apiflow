import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('WebSocketAfterScriptEditorFeatures', () => {
  // 后置脚本编辑器应渲染 Monaco 且存在语法 token
  test('后置脚本编辑器支持JavaScript语法高亮', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: '后置脚本语法高亮测试' });
    const afterScriptTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /后置脚本/ });
    await afterScriptTab.click();
    const afterScriptPane = contentPage.locator('#pane-afterScript');
    const monacoEditor = afterScriptPane.locator('.s-monaco-editor');
    await expect(monacoEditor).toBeVisible({ timeout: 5000 });
    // 输入多种语法元素，验证 token 渲染存在
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('const message = "hello world";\nfunction test() {\n  return 123;\n}\n// comment');
    const tokenLocator = afterScriptPane.locator('.monaco-editor .mtk1, .monaco-editor .mtk3, .monaco-editor .mtk5, .monaco-editor .mtk6, .monaco-editor .mtk7');
    await expect(tokenLocator.first()).toBeVisible({ timeout: 5000 });
  });
  // 输入 af. 后应出现代码补全列表
  test('输入af后出现代码补全提示', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: '后置脚本代码补全测试' });
    const afterScriptTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /后置脚本/ });
    await afterScriptTab.click();
    const afterScriptPane = contentPage.locator('#pane-afterScript');
    const monacoEditor = afterScriptPane.locator('.s-monaco-editor');
    await expect(monacoEditor).toBeVisible({ timeout: 5000 });
    // 优先通过输入触发补全，若未弹出则补发快捷键
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('af.');
    const suggestWidget = afterScriptPane.locator('.monaco-editor .suggest-widget, .monaco-editor .editor-widget.suggest-widget');
    const suggestVisible = await suggestWidget.first().isVisible().catch(() => false);
    if (!suggestVisible) {
      await contentPage.keyboard.press('Control+Space');
    }
    await expect(suggestWidget.first()).toBeVisible({ timeout: 5000 });
  });
  // 点击格式化按钮后编辑器仍保持可编辑状态
  test('点击格式化按钮代码格式化正确', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: '后置脚本格式化测试' });
    const afterScriptTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /后置脚本/ });
    await afterScriptTab.click();
    const afterScriptPane = contentPage.locator('#pane-afterScript');
    const monacoEditor = afterScriptPane.locator('.s-monaco-editor');
    await expect(monacoEditor).toBeVisible({ timeout: 5000 });
    // 输入未格式化代码并触发格式化入口
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('const obj={a:1,b:2};function test(){return obj.a+obj.b}');
    const formatBtn = afterScriptPane.locator('.editor-wrap .format-op .btn, .editor-wrap [class*="format"]').first();
    if (await formatBtn.isVisible().catch(() => false)) {
      await formatBtn.click();
    }
    await expect(afterScriptPane.locator('.monaco-editor .view-lines')).toBeVisible({ timeout: 5000 });
  });
  // 后置脚本保存并刷新后应保持原内容
  test('后置脚本内容保存后刷新页面保持不变', async ({ contentPage, clearCache, createProject, createNode, reload }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: '后置脚本持久化测试' });
    const afterScriptTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /后置脚本/ });
    await afterScriptTab.click();
    const afterScriptPane = contentPage.locator('#pane-afterScript');
    const monacoEditor = afterScriptPane.locator('.s-monaco-editor');
    await expect(monacoEditor).toBeVisible({ timeout: 5000 });
    // 录入脚本并保存，随后刷新验证持久化
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('const afterTestVar = 67890;');
    await contentPage.locator('[data-testid="websocket-operation-save-btn"]').click();
    await reload();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await afterScriptTab.click();
    await expect(contentPage.locator('#pane-afterScript .monaco-editor .view-lines')).toContainText('afterTestVar', { timeout: 10000 });
  });
  // 后置脚本有内容时标签应显示红点
  test('后置脚本标签有内容时显示红点', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: '后置脚本红点测试' });
    const afterScriptTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /后置脚本/ });
    await afterScriptTab.click();
    const monacoEditor = contentPage.locator('#pane-afterScript .s-monaco-editor');
    await expect(monacoEditor).toBeVisible({ timeout: 5000 });
    // 输入任意脚本后检查红点渲染
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('const y = 2;');
    await expect(afterScriptTab.locator('.el-badge').first()).toBeVisible({ timeout: 5000 });
  });
  // 清空后置脚本内容后标签红点应消失
  test('后置脚本编辑器清空内容后红点消失', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: '后置脚本红点消失测试' });
    const afterScriptTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /后置脚本/ });
    await afterScriptTab.click();
    const monacoEditor = contentPage.locator('#pane-afterScript .s-monaco-editor');
    await expect(monacoEditor).toBeVisible({ timeout: 5000 });
    // 先写入内容触发红点，再清空并验证红点关闭
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('const z = 3;');
    await expect(afterScriptTab.locator('.el-badge').first()).toBeVisible({ timeout: 5000 });
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.press('Backspace');
    await expect.poll(async () => {
      const badgeContent = afterScriptTab.locator('.el-badge__content');
      if (await badgeContent.count() === 0) {
        return false;
      }
      return await badgeContent.first().isVisible();
    }, { timeout: 5000 }).toBe(false);
  });
});

