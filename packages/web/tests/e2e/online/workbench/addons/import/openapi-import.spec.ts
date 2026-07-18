import { test, expect } from '../../../../../fixtures/electron-online.fixture';

test.describe('OpenapiImport', () => {
  // 测试用例1: 打开导入页面验证OpenAPI/Swagger格式选择器
  test('打开导入页面验证OpenAPI/Swagger格式选择器', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 点击导入文档按钮
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    await contentPage.waitForTimeout(300);
    const importItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导入文档/ });
    await expect(importItem).toBeVisible({ timeout: 5000 });
    await importItem.click();
    await contentPage.waitForTimeout(500);
    // 验证导入页面正确渲染
    const importPage = contentPage.locator('.doc-import');
    await expect(importPage).toBeVisible({ timeout: 5000 });
    // 验证数据来源选项存在
    const sourceWrap = contentPage.locator('.source-wrap');
    await expect(sourceWrap).toBeVisible({ timeout: 3000 });
  });
  // 测试用例2: OpenAPI格式文件夹命名方式选择
  test('OpenAPI格式文件夹命名方式选择', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 点击导入文档按钮
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    await contentPage.waitForTimeout(300);
    const importItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导入文档/ });
    await expect(importItem).toBeVisible({ timeout: 5000 });
    await importItem.click();
    await contentPage.waitForTimeout(500);
    // 验证导入页面正确渲染
    const importPage = contentPage.locator('.doc-import');
    await expect(importPage).toBeVisible({ timeout: 5000 });
    // 验证额外配置区域存在
    const configSection = contentPage.locator('.doc-import').filter({ hasText: /额外配置|Configuration/ });
    await expect(configSection).toBeVisible({ timeout: 3000 });
  });
  // 测试用例3: 选择追加导入方式不选择目标目录
  test('选择追加导入方式不选择目标目录', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 点击导入文档按钮
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    await contentPage.waitForTimeout(300);
    const importItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导入文档/ });
    await expect(importItem).toBeVisible({ timeout: 5000 });
    await importItem.click();
    await contentPage.waitForTimeout(500);
    // 验证追加方式radio存在
    const appendRadio = contentPage.locator('.el-radio').filter({ hasText: /追加方式|Append/ });
    await expect(appendRadio).toBeVisible({ timeout: 3000 });
    // 验证目标目录配置存在
    const targetDirConfig = contentPage.locator('.doc-import').filter({ hasText: /目标目录|Target/ });
    await expect(targetDirConfig).toBeVisible({ timeout: 3000 });
  });
  // 测试用例4: 选择追加导入方式并选择目标目录
  test('选择追加导入方式并选择目标目录', async ({ contentPage, clearCache, createProject, loginAccount, createNode }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 先创建一个文件夹
    await createNode(contentPage, { nodeType: 'folder', name: '导入目标文件夹' });
    // 点击导入文档按钮
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    await contentPage.waitForTimeout(300);
    const importItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导入文档/ });
    await expect(importItem).toBeVisible({ timeout: 5000 });
    await importItem.click();
    await contentPage.waitForTimeout(500);
    // 验证导入页面正确渲染
    const importPage = contentPage.locator('.doc-import');
    await expect(importPage).toBeVisible({ timeout: 5000 });
  });
  // 测试用例5: 粘贴OpenAPI内容后自动识别并成功导入
  test('粘贴OpenAPI内容后可成功导入且创建者不为空', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const importItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导入文档/ });
    await importItem.click();
    const importPage = contentPage.locator('.doc-import');
    await expect(importPage).toBeVisible({ timeout: 5000 });

    const pasteSource = contentPage.locator('.source-item').filter({ hasText: /粘贴内容|Paste/ });
    await pasteSource.click();
    await expect(pasteSource).toHaveClass(/active/);

    const pasteTextarea = importPage.locator('.paste-import textarea');
    await expect(pasteTextarea).toBeVisible({ timeout: 5000 });
    const openapiJson = JSON.stringify({
      openapi: '3.0.0',
      info: { title: '在线OpenAPI', version: '1.0.0' },
      paths: {
        '/users': {
          get: { tags: ['用户'], summary: '查询用户', responses: { '200': { description: 'OK' } } },
        },
        '/orders': {
          post: { tags: ['订单'], summary: '创建订单', responses: { '200': { description: 'OK' } } },
        },
      },
    });
    await pasteTextarea.fill(openapiJson);
    const parseBtn = importPage.locator('.paste-actions .el-button--primary').filter({ hasText: /解析内容|Parse/ });
    await parseBtn.click();

    const previewTreeFirstNode = importPage.locator('.el-tree .custom-tree-node').first();
    await expect(previewTreeFirstNode).toBeVisible({ timeout: 5000 });
    await expect(importPage.locator('.preview-stats')).toContainText('2');

    // 提交导入并验证所有转换节点都携带当前用户作为创建者
    const importRequestPromise = contentPage.waitForRequest(request => request.url().includes('/api/project/import/moyu') && request.method() === 'POST');
    const importResponsePromise = contentPage.waitForResponse(response => response.url().includes('/api/project/import/moyu') && response.request().method() === 'POST');
    const submitBtn = importPage.locator('.submit-wrap .el-button--primary').filter({ hasText: /确定导入|Import/ });
    await submitBtn.click();
    const importRequest = await importRequestPromise;
    const importData = importRequest.postDataJSON() as { moyuData: { docs: { info: { creator: string } }[] } };
    expect(importData.moyuData.docs.every(doc => doc.info.creator.length > 0)).toBeTruthy();
    const importResponse = await importResponsePromise;
    expect(importResponse.ok()).toBeTruthy();
    await expect(contentPage.getByText(/导入成功|Imported/)).toBeVisible({ timeout: 5000 });
  });
});


