import { test, expect } from '../../../../../fixtures/electron-online.fixture';

test.describe('CodeRepoImport', () => {
  // 导入页应提供 AI 智能识别入口并可在不同来源间切换
  test('导入页面提供 AI 智能识别入口并支持切换', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 进入导入页后确认来源入口完整
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const importItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导入文档|Import/ });
    await expect(importItem).toBeVisible({ timeout: 5000 });
    await importItem.click();
    const importPage = contentPage.locator('.doc-import');
    await expect(importPage).toBeVisible({ timeout: 5000 });
    const aiSource = importPage.locator('.source-item').filter({ hasText: /AI智能识别|AI/ });
    const fileSource = importPage.locator('.source-item').filter({ hasText: /本地文件|Local File/ });
    const urlSource = importPage.locator('.source-item').filter({ hasText: /URL导入|URL/ });
    const pasteSource = importPage.locator('.source-item').filter({ hasText: /粘贴内容|Paste/ });
    await expect(aiSource).toBeVisible({ timeout: 5000 });
    await expect(fileSource).toBeVisible({ timeout: 5000 });
    await expect(urlSource).toBeVisible({ timeout: 5000 });
    await expect(pasteSource).toBeVisible({ timeout: 5000 });
    await aiSource.click();
    await expect(aiSource).toHaveClass(/active/);
    await fileSource.click();
    await expect(fileSource).toHaveClass(/active/);
    await expect(aiSource).not.toHaveClass(/active/);
  });
  // AI 识别失败时应提示错误且禁止导入
  test('AI 识别失败时显示错误提示且不产生导入数据', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 指向 mock 失败路由，稳定覆盖失败分支
    await contentPage.evaluate(() => {
      localStorage.setItem('apiflow/ai/useFreeLLM', 'false');
      localStorage.setItem('apiflow/ai/llmProvider', JSON.stringify({
        id: 'mock-ai-fail',
        name: 'mock-ai-fail',
        provider: 'custom',
        baseURL: 'http://127.0.0.1:3456/ai/mock/fail',
        apiKey: 'mock-key',
        model: 'mock-model',
        customHeaders: [],
        extraBody: '',
      }));
    });
    await contentPage.reload();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const importItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导入文档|Import/ });
    await importItem.click();
    const importPage = contentPage.locator('.doc-import');
    await expect(importPage).toBeVisible({ timeout: 5000 });
    const aiSource = importPage.locator('.source-item').filter({ hasText: /AI智能识别|AI/ });
    await aiSource.click();
    const aiInputArea = importPage.locator('.ai-input-area');
    await expect(aiInputArea).toBeVisible({ timeout: 5000 });
    await aiInputArea.locator('textarea').fill('请识别这个 API：GET /users');
    const analyzeBtn = aiInputArea.locator('.el-button--primary').filter({ hasText: /开始识别|识别中/ });
    await expect(analyzeBtn).toBeEnabled();
    await analyzeBtn.click();
    const errorMessage = contentPage.locator('.el-message--error .el-message__content').last();
    await expect(errorMessage).toContainText(/AI mock failure/, { timeout: 10000 });
    const submitBtn = importPage.locator('.submit-wrap .el-button--primary').filter({ hasText: /确定导入|Import/ });
    await expect(submitBtn).toBeDisabled();
    await expect(importPage.locator('.empty-preview')).toBeVisible({ timeout: 5000 });
  });
  // AI 识别成功后应可导入并在文档树看到新节点
  test('AI 识别成功后可提交导入并落地到文档树', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 指向 mock 成功路由，覆盖识别成功和导入落地链路
    await contentPage.evaluate(() => {
      localStorage.setItem('apiflow/ai/useFreeLLM', 'false');
      localStorage.setItem('apiflow/ai/llmProvider', JSON.stringify({
        id: 'mock-ai-success',
        name: 'mock-ai-success',
        provider: 'custom',
        baseURL: 'http://127.0.0.1:3456/ai/mock/success',
        apiKey: 'mock-key',
        model: 'mock-model',
        customHeaders: [],
        extraBody: '',
      }));
    });
    await contentPage.reload();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const importItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导入文档|Import/ });
    await importItem.click();
    const importPage = contentPage.locator('.doc-import');
    await expect(importPage).toBeVisible({ timeout: 5000 });
    const aiSource = importPage.locator('.source-item').filter({ hasText: /AI智能识别|AI/ });
    await aiSource.click();
    const aiInputArea = importPage.locator('.ai-input-area');
    await expect(aiInputArea).toBeVisible({ timeout: 5000 });
    await aiInputArea.locator('textarea').fill('请识别这个 API：GET /ai/mock/success');
    const analyzeBtn = aiInputArea.locator('.el-button--primary').filter({ hasText: /开始识别|识别中/ });
    await analyzeBtn.click();
    const successMessage = contentPage.locator('.el-message--success .el-message__content').last();
    await expect(successMessage).toContainText(/识别成功/, { timeout: 10000 });
    const previewNode = importPage.locator('.custom-tree-node').filter({ hasText: 'AI导入-成功接口' });
    await expect(previewNode).toBeVisible({ timeout: 10000 });
    const submitBtn = importPage.locator('.submit-wrap .el-button--primary').filter({ hasText: /确定导入|Import/ });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();
    const permissionDialog = contentPage.locator('.el-message-box').filter({ hasText: /暂无当前接口权限|No permission|权限/ }).first();
    await expect(permissionDialog).toBeVisible({ timeout: 10000 });
    await permissionDialog.locator('.el-button--primary').first().click();
    await expect(permissionDialog).toBeHidden({ timeout: 5000 });
    await expect(importPage.locator('.custom-tree-node').filter({ hasText: 'AI导入-成功接口' })).toBeVisible({ timeout: 10000 });
  });
});
