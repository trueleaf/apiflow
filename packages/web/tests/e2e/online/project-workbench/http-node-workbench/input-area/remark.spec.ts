import { test, expect } from '../../../../../fixtures/electron-online.fixture';

test.describe('Remark', () => {
  // 测试用例1: 备注编辑器支持Markdown格式输入和预览
  test('备注编辑器支持Markdown格式输入和预览', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Markdown备注测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await expect(addFileDialog).toBeHidden({ timeout: 10000 });
    // 切换到备注标签页
    const remarksTab = contentPage.locator('[data-testid="http-params-tab-remarks"]');
    await remarksTab.click();
    // 在备注编辑器中输入Markdown格式内容
    const markdownEditor = contentPage.locator('.markdown-editor');
    await expect(markdownEditor).toBeVisible({ timeout: 5000 });
    const editorContent = markdownEditor.locator('.ProseMirror');
    await editorContent.click();
    await editorContent.pressSequentially('# 主标题', { delay: 50 });
    await contentPage.keyboard.press('Enter');
    await editorContent.pressSequentially('这是一段普通文本', { delay: 50 });
    await contentPage.waitForTimeout(300);
    // 验证Markdown编辑器存在且内容已输入
    await expect(editorContent).toContainText('主标题', { timeout: 5000 });
    await expect(editorContent).toContainText('这是一段普通文本', { timeout: 5000 });
  });
  // 测试用例2: 输入普通文本后保存,刷新页面内容保持不变
  test('输入普通文本后保存,刷新页面内容保持不变', async ({ contentPage, clearCache, createProject, loginAccount, reload }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('备注持久化测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await expect(addFileDialog).toBeHidden({ timeout: 10000 });
    // 切换到备注标签页
    const remarksTab = contentPage.locator('[data-testid="http-params-tab-remarks"]');
    await remarksTab.click();
    // 在备注编辑器中输入普通文本
    const markdownEditor = contentPage.locator('.markdown-editor');
    const editorContent = markdownEditor.locator('.ProseMirror');
    await editorContent.click();
    const testRemark = '这是测试备注内容-' + Date.now();
    await editorContent.pressSequentially(testRemark, { delay: 30 });
    await contentPage.waitForTimeout(300);
    // 保存内容
    const saveBtn = contentPage.locator('[data-testid="operation-save-btn"]');
    await saveBtn.click();
    await contentPage.waitForTimeout(1000);
    await reload();
    await contentPage.waitForTimeout(500);
    // 点击节点重新打开
    const nodeItem = contentPage.locator('.tree-item').filter({ hasText: '备注持久化测试接口' }).first();
    await nodeItem.click();
    await contentPage.waitForTimeout(500);
    // 切换到备注标签页
    await remarksTab.click();
    await contentPage.waitForTimeout(300);
    // 验证备注内容保持不变
    const editorContentAfterReload = contentPage.locator('.markdown-editor .ProseMirror');
    await expect(editorContentAfterReload).toContainText(testRemark, { timeout: 5000 });
  });
  // 测试用例3: 输入Markdown标题(# 标题)正确渲染为标题样式
  test('输入Markdown标题正确渲染为标题样式', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Markdown标题测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await expect(addFileDialog).toBeHidden({ timeout: 10000 });
    // 切换到备注标签页
    const remarksTab = contentPage.locator('[data-testid="http-params-tab-remarks"]');
    await remarksTab.click();
    // 在备注编辑器中输入标题
    const markdownEditor = contentPage.locator('.markdown-editor');
    const editorContent = markdownEditor.locator('.ProseMirror');
    await editorContent.click();
    await editorContent.pressSequentially('# 一级标题', { delay: 50 });
    await contentPage.keyboard.press('Enter');
    await editorContent.pressSequentially('## 二级标题', { delay: 50 });
    await contentPage.waitForTimeout(500);
    // 验证标题正确渲染（h1 和 h2 标签）
    const h1Element = editorContent.locator('h1');
    const h2Element = editorContent.locator('h2');
    await expect(h1Element).toContainText('一级标题', { timeout: 5000 });
    await expect(h2Element).toContainText('二级标题', { timeout: 5000 });
  });
  // 测试用例4: 输入Markdown粗体(**粗体**)正确渲染为粗体样式
  test('输入Markdown粗体正确渲染为粗体样式', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Markdown粗体测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await expect(addFileDialog).toBeHidden({ timeout: 10000 });
    // 切换到备注标签页
    const remarksTab = contentPage.locator('[data-testid="http-params-tab-remarks"]');
    await remarksTab.click();
    // 在备注编辑器中输入粗体文本
    const markdownEditor = contentPage.locator('.markdown-editor');
    const editorContent = markdownEditor.locator('.ProseMirror');
    await editorContent.click();
    // 使用工具栏的粗体按钮或快捷键
    await editorContent.pressSequentially('普通文本 ', { delay: 50 });
    // 使用Ctrl+B快捷键启用粗体
    await contentPage.keyboard.press('ControlOrMeta+b');
    await editorContent.pressSequentially('粗体文本', { delay: 50 });
    await contentPage.keyboard.press('Control+b');
    await contentPage.waitForTimeout(300);
    // 验证粗体正确渲染（strong 标签）
    const strongElement = editorContent.locator('strong');
    await expect(strongElement).toContainText('粗体文本', { timeout: 5000 });
  });
  // 测试用例5: 输入Markdown链接([文字](url))正确渲染为可点击链接
  test('输入Markdown链接正确渲染为可点击链接', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Markdown链接测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await expect(addFileDialog).toBeHidden({ timeout: 10000 });
    // 切换到备注标签页
    const remarksTab = contentPage.locator('[data-testid="http-params-tab-remarks"]');
    await remarksTab.click();
    // 在备注编辑器中输入链接
    const markdownEditor = contentPage.locator('.markdown-editor');
    const editorContent = markdownEditor.locator('.ProseMirror');
    await editorContent.click();
    // 输入链接文本，并通过工具栏插入链接
    await editorContent.pressSequentially('示例链接', { delay: 30 });
    await contentPage.waitForTimeout(300);
    await editorContent.click();
    await editorContent.press('ControlOrMeta+a');
    contentPage.once('dialog', async (dialog) => {
      await dialog.accept('https://example.com');
    });
    await markdownEditor.getByTestId('markdown-toolbar-link-btn').click();
    await contentPage.waitForTimeout(300);
    // 验证链接正确渲染（a 标签）
    const linkElement = editorContent.locator('a');
    await expect(linkElement).toBeVisible({ timeout: 5000 });
    await expect(linkElement).toHaveAttribute('href', 'https://example.com');
  });
  // 测试用例6: 输入Markdown代码块正确渲染并支持语
  test('输入Markdown代码块正确渲染', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Markdown代码块测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await expect(addFileDialog).toBeHidden({ timeout: 10000 });
    // 切换到备注标签页
    const remarksTab = contentPage.locator('[data-testid="http-params-tab-remarks"]');
    await remarksTab.click();
    // 在备注编辑器中输入代码块
    const markdownEditor = contentPage.locator('.markdown-editor');
    const editorContent = markdownEditor.locator('.ProseMirror');
    await editorContent.click();
    // 输入代码块
    await editorContent.pressSequentially('```', { delay: 50 });
    await contentPage.keyboard.press('Enter');
    await editorContent.pressSequentially('const test = "hello";', { delay: 30 });
    await contentPage.waitForTimeout(500);
    // 验证代码块正确渲染（pre 或 code 标签）
    const codeElement = editorContent.locator('pre, code');
    await expect(codeElement.first()).toBeVisible({ timeout: 5000 });
  });
  // 测试用例7: 备注内容变更后出现未保存小圆点,保存后小圆点消失
  test('备注内容变更后出现未保存小圆点,保存后小圆点消失', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('未保存标记测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await expect(addFileDialog).toBeHidden({ timeout: 10000 });
    // 先保存确保初始状态没有未保存标记
    const saveBtn = contentPage.locator('[data-testid="operation-save-btn"]');
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    // 切换到备注标签页
    const remarksTab = contentPage.locator('[data-testid="http-params-tab-remarks"]');
    await remarksTab.click();
    // 在备注编辑器中修改内容
    const markdownEditor = contentPage.locator('.markdown-editor');
    const editorContent = markdownEditor.locator('.ProseMirror');
    await editorContent.click();
    await editorContent.pressSequentially('新增的备注内容', { delay: 50 });
    await contentPage.waitForTimeout(500);
    // 验证出现未保存标记（通常是标签页上的圆点或其他指示）
    const unsavedIndicator = contentPage.locator('[data-testid="project-nav-tab-unsaved"]').first();
    await expect(unsavedIndicator).toBeVisible({ timeout: 5000 });
    // 保存内容
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证未保存标记消失
    await expect(unsavedIndicator).not.toBeVisible({ timeout: 5000 });
  });
  // 测试用例8: 备注支持撤销操作,ctrl+z可以撤销输入
  test('备注支持撤销操作,ctrl+z可以撤销输入', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('撤销操作测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await expect(addFileDialog).toBeHidden({ timeout: 10000 });
    // 切换到备注标签页
    const remarksTab = contentPage.locator('[data-testid="http-params-tab-remarks"]');
    await remarksTab.click();
    // 在备注编辑器中输入文本
    const markdownEditor = contentPage.locator('.markdown-editor');
    const editorContent = markdownEditor.locator('.ProseMirror');
    await editorContent.click();
    await editorContent.pressSequentially('第一段内容', { delay: 50 });
    await contentPage.waitForTimeout(300);
    await editorContent.pressSequentially(' 第二段内容', { delay: 50 });
    await contentPage.waitForTimeout(300);
    // 验证内容已输入
    await expect(editorContent).toContainText('第一段内容 第二段内容', { timeout: 5000 });
    await expect(editorContent).toContainText('第一段内容 第二段内容', { timeout: 10000 });
    // 按Ctrl+Z撤销
    await contentPage.keyboard.press('ControlOrMeta+z');
    await contentPage.waitForTimeout(300);
    // 验证最后的输入被撤销
    await expect(editorContent).toContainText('第一段内容', { timeout: 5000 });
    await expect(editorContent).not.toContainText('第二段内容', { timeout: 5000 });
  });
  // 测试用例9: 备注支持重做操作,ctrl+shift+z可以重做撤销的操作
  test('备注支持重做操作,ctrl+shift+z可以重做撤销的操作', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('重做操作测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await expect(addFileDialog).toBeHidden({ timeout: 10000 });
    // 切换到备注标签页
    const remarksTab = contentPage.locator('[data-testid="http-params-tab-remarks"]');
    await remarksTab.click();
    // 在备注编辑器中输入文本
    const markdownEditor = contentPage.locator('.markdown-editor');
    const editorContent = markdownEditor.locator('.ProseMirror');
    await editorContent.click();
    await editorContent.pressSequentially('原始内容', { delay: 20 });
    await contentPage.waitForTimeout(300);
    await editorContent.pressSequentially(' 新增内容', { delay: 20 });
    await contentPage.waitForTimeout(300);
    await expect(editorContent).toContainText(/原始内容\s*新增内容/, { timeout: 10000 });
    // 按Ctrl+Z撤销
    await contentPage.keyboard.press('ControlOrMeta+z');
    await contentPage.waitForTimeout(300);
    // 验证内容被撤销
    await expect(editorContent).toContainText('原始内容', { timeout: 5000 });
    await expect(editorContent).not.toContainText('新增内容', { timeout: 5000 });
    // 按Ctrl+Shift+Z重做
    await contentPage.keyboard.press('ControlOrMeta+Shift+z');
    await contentPage.waitForTimeout(300);
    // 验证撤销的内容被恢复
    await expect(editorContent).toContainText(/原始内容\s*新增内容/, { timeout: 10000 });
  });
});
