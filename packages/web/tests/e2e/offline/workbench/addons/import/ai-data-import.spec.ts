import { test, expect } from '../../../../../fixtures/electron.fixture';
test.describe('AiDataImport', () => {
  test('导入页面提供 AI 智能识别入口并支持切换', async ({ contentPage, clearCache, createProject, reload }) => {
    await clearCache();
    await reload();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 进入导入文档页面并切换到 AI 智能识别
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const importItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导入文档|Import/ });
    await expect(importItem).toBeVisible({ timeout: 5000 });
    await importItem.click();
    const importPage = contentPage.locator('.doc-import');
    await expect(importPage).toBeVisible({ timeout: 5000 });
    const aiSource = importPage.locator('.source-item').filter({ hasText: /AI智能识别|AI/ });
    await expect(aiSource).toBeVisible({ timeout: 5000 });
    await aiSource.click();
    await expect(aiSource).toHaveClass(/active/);
    const fileSource = importPage.locator('.source-item').filter({ hasText: /本地文件|Local File/ });
    await fileSource.click();
    await expect(fileSource).toHaveClass(/active/);
    await expect(aiSource).not.toHaveClass(/active/);
  });
  test('AI 识别失败时显示错误提示且不产生导入数据', async ({ contentPage, clearCache, createProject, reload }) => {
    await clearCache();
    await reload();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 配置自定义 AI 地址到 mock 失败路由，触发稳定失败分支
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
    await reload();
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
    const input = aiInputArea.locator('textarea');
    await input.fill('请识别这个 API：GET /users');
    const analyzeBtn = aiInputArea.locator('.el-button--primary').filter({ hasText: /开始识别|识别中/ });
    await expect(analyzeBtn).toBeEnabled();
    await analyzeBtn.click();
    const errorMessage = contentPage.locator('.el-message--error .el-message__content').last();
    await expect(errorMessage).toContainText(/AI mock failure/, { timeout: 10000 });
    const submitBtn = importPage.locator('.submit-wrap .el-button--primary').filter({ hasText: /确定导入|Import/ });
    await expect(submitBtn).toBeDisabled();
    await expect(importPage.locator('.empty-preview')).toBeVisible({ timeout: 5000 });
  });
  test('AI 识别成功后可提交导入并落地到文档树', async ({ contentPage, clearCache, createProject, reload }) => {
    await clearCache();
    await reload();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 配置自定义 AI 地址到 mock 成功路由，覆盖识别成功与导入落地链路
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
    await reload();
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
    const input = aiInputArea.locator('textarea');
    await input.fill('请识别这个 API：GET /ai/mock/success');
    const analyzeBtn = aiInputArea.locator('.el-button--primary').filter({ hasText: /开始识别|识别中/ });
    await analyzeBtn.click();
    const successMessage = contentPage.locator('.el-message--success .el-message__content').last();
    await expect(successMessage).toContainText(/识别成功/, { timeout: 10000 });
    const previewNode = importPage.locator('.custom-tree-node').filter({ hasText: 'AI导入-成功接口' });
    await expect(previewNode).toBeVisible({ timeout: 10000 });
    const submitBtn = importPage.locator('.submit-wrap .el-button--primary').filter({ hasText: /确定导入|Import/ });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();
    await expect(contentPage.locator('.el-message--success .el-message__content').last()).toContainText(/导入成功/, { timeout: 10000 });
    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree.locator('.el-tree-node__content').filter({ hasText: 'AI导入-成功接口' }).first()).toBeVisible({ timeout: 10000 });
  });
});


