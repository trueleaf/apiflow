import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

test.describe('AfterScriptEditorFeatures', () => {
  // 测试用例1: 后置脚本编辑器支持JavaScript语法高亮
  test('后置脚本编辑器支持JavaScript语法高亮', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();/.*#\/workbench.*/
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('语法高亮测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 点击后置脚本标签页
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterscript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 在编辑器中输入包含关键字、函数、变量等的JavaScript代码
    const monacoEditor = contentPage.locator('.s-monaco-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('const message = "hello world";\nfunction test() {\n  return 123;\n}\n// 这是注释');
    await contentPage.waitForTimeout(500);
    // 验证编辑器使用Monaco Editor并支持语法高亮
    const editorContainer = contentPage.locator('.s-monaco-editor');
    await expect(editorContainer.first()).toBeVisible();
    // 验证编辑器中存在语法高亮的token（关键字、字符串、注释等会有不同的class）
    const editorContent = contentPage.locator('.monaco-editor .view-lines');
    await expect(editorContent.first()).toBeVisible();
    // 验证存在不同颜色的token类
    const hasTokens = contentPage.locator('.monaco-editor .mtk1, .monaco-editor .mtk3, .monaco-editor .mtk5, .monaco-editor .mtk6, .monaco-editor .mtk7');
    await expect(hasTokens.first()).toBeVisible();
  });
  // 测试用例2: 输入af.后出现代码补全提示,包括response,sessionStorage,localStorage,cookies,variables等API
  test('输入af.后出现代码补全提示', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();/.*#\/workbench.*/
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('代码补全测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 点击后置脚本标签页
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterscript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 在编辑器中输入af.触发代码补全
    const monacoEditor = contentPage.locator('.s-monaco-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('af.');
    await contentPage.waitForTimeout(1000);
    // 验证代码补全列表出现
    const suggestWidget = contentPage.locator('.monaco-editor .suggest-widget, .monaco-editor .editor-widget.suggest-widget');
    await expect(suggestWidget.first()).toBeVisible({ timeout: 5000 });
    // 验证补全列表中包含后置脚本的API（response等）
    const suggestItems = contentPage.locator('.monaco-editor .suggest-widget .monaco-list-row, .monaco-editor .editor-widget .monaco-list-row');
    const suggestText = await suggestItems.allTextContents();
    const hasResponseApi = suggestText.some(text => text.includes('response'));
    expect(hasResponseApi).toBeTruthy();
  });
  // 测试用例3: 点击格式化按钮,代码格式化正确
  test('点击格式化按钮代码格式化正确', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
/.*#\/workbench.*/
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('格式化测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 点击后置脚本标签页
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterscript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 在编辑器中输入格式不规范的JavaScript代码
    const monacoEditor = contentPage.locator('.s-monaco-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    // 输入格式混乱的代码（缩进不对，括号不整齐）
    await contentPage.keyboard.type('const obj={a:1,b:2};function test(){return obj.a+obj.b}');
    await contentPage.waitForTimeout(500);
    // 获取格式化前的代码内容
    const editorContent = contentPage.locator('.monaco-editor .view-lines');
    const beforeFormat = await editorContent.first().textContent();
    // 点击格式化按钮
    const formatBtn = contentPage.locator('[data-testid="format-btn"], .format-btn, button').filter({ hasText: /格式化|Format/ }).first();
    await formatBtn.click();
    await contentPage.waitForTimeout(500);
    // 获取格式化后的代码内容
    const afterFormat = await editorContent.first().textContent();
    // 验证代码已被格式化（内容应该有变化，包含换行或更好的缩进）
    expect(afterFormat).not.toBe(beforeFormat);
  });
});
