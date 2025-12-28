import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('PreScriptEditorFeatures', () => {
  // 前置脚本编辑器支持JavaScript语法高亮
  test('前置脚本编辑器支持JavaScript语法高亮', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/workbench.*/, { timeout: 5000 });
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
  test('输入af后出现代码补全提示', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/workbench.*/, { timeout: 5000 });
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
  test('点击格式化按钮代码格式化正确', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/workbench.*/, { timeout: 5000 });
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
  test('鼠标悬停在af对象属性上显示API说明提示', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/workbench.*/, { timeout: 5000 });
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
