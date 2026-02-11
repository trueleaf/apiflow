import { test, expect } from '../../../../../fixtures/electron-online.fixture';

test.describe('Export', () => {
  test('导出弹窗显示HTML、WORD、JSON文档、OpenAPI四种导出类型', async ({ topBarPage, contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const exportItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导出文档/ });
    await exportItem.click();
    await contentPage.waitForTimeout(500);
    const exportPage = contentPage.locator('.doc-export');
    await expect(exportPage).toBeVisible({ timeout: 5000 });
    await expect(exportPage.locator('.item').filter({ hasText: 'HTML' })).toBeVisible();
    await expect(exportPage.locator('.item').filter({ hasText: 'WORD' })).toBeVisible();
    await expect(exportPage.locator('.item').filter({ hasText: /JSON文档/ })).toBeVisible();
    await expect(exportPage.locator('.item').filter({ hasText: 'OpenAPI' })).toBeVisible();
  });
  test('选择JSON文档类型后显示active状态', async ({ topBarPage, contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const exportItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导出文档/ });
    await exportItem.click();
    await contentPage.waitForTimeout(500);
    const exportPage = contentPage.locator('.doc-export');
    await expect(exportPage).toBeVisible({ timeout: 5000 });
    const jsonOption = exportPage.locator('.item').filter({ hasText: /JSON文档/ });
    await jsonOption.click();
    await expect(jsonOption).toHaveClass(/active/);
  });
  test('选择OpenAPI类型后显示active状态', async ({ topBarPage, contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const exportItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导出文档/ });
    await exportItem.click();
    await contentPage.waitForTimeout(500);
    const exportPage = contentPage.locator('.doc-export');
    await expect(exportPage).toBeVisible({ timeout: 5000 });
    const openapiOption = exportPage.locator('.item').filter({ hasText: 'OpenAPI' });
    await openapiOption.click();
    await expect(openapiOption).toHaveClass(/active/);
  });
  test('开启选择导出后显示el-tree节点树', async ({ topBarPage, contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await createNode(contentPage, { nodeType: 'http', name: '测试接口' });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const exportItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导出文档/ });
    await exportItem.click();
    await contentPage.waitForTimeout(500);
    const exportPage = contentPage.locator('.doc-export');
    await expect(exportPage).toBeVisible({ timeout: 5000 });
    const selectExportCheckbox = exportPage.locator('.config-item').filter({ hasText: /选择导出/ }).locator('.el-checkbox');
    await expect(selectExportCheckbox).toBeVisible({ timeout: 5000 });
    await selectExportCheckbox.click();
    await contentPage.waitForTimeout(300);
    const tree = exportPage.locator('.el-tree');
    await expect(tree).toBeVisible({ timeout: 5000 });
    await expect(tree.locator('.el-tree-node').first()).toBeVisible();
  });
  test('在线模式创建全类型节点与参数组合,导出JSON并校验内容', async ({ topBarPage, contentPage, clearCache, createProject, createNode, loginAccount }) => {
    test.setTimeout(120000);
    await clearCache();
    await loginAccount();
    const projectName = '导出JSON全量测试项目';
    await createProject(projectName);
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 创建全类型节点，覆盖导出核心结构
    await createNode(contentPage, { nodeType: 'folder', name: '导出测试文件夹' });
    await createNode(contentPage, { nodeType: 'websocket', name: '导出测试WebSocket节点' });
    await createNode(contentPage, { nodeType: 'httpMock', name: '导出测试HTTP Mock节点' });
    await createNode(contentPage, { nodeType: 'websocketMock', name: '导出测试WebSocket Mock节点' });
    await createNode(contentPage, { nodeType: 'http', name: 'OpenAPI-参数组合接口' });
    await createNode(contentPage, { nodeType: 'http', name: 'OpenAPI-JSON请求体接口' });
    await createNode(contentPage, { nodeType: 'http', name: 'OpenAPI-FormData请求体接口' });
    await createNode(contentPage, { nodeType: 'http', name: 'OpenAPI-UrlEncoded请求体接口' });
    await createNode(contentPage, { nodeType: 'http', name: 'OpenAPI-Raw请求体接口' });

    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const exportItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导出文档/ });
    await exportItem.click();
    await contentPage.waitForTimeout(500);
    const exportPage = contentPage.locator('.doc-export');
    await expect(exportPage).toBeVisible({ timeout: 5000 });
    const jsonOption = exportPage.locator('.item').filter({ hasText: /JSON文档/ });
    await jsonOption.click();
    await expect(jsonOption).toHaveClass(/active/);
    const exportResponsePromise = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/export/json') && response.request().method() === 'POST',
      { timeout: 15000 },
    );
    const exportBtn = exportPage.locator('.el-button--primary').filter({ hasText: /确定导出/ });
    await exportBtn.click();
    const exportResponse = await exportResponsePromise;
    expect(exportResponse.status()).toBe(200);
    const exportJsonText = (await exportResponse.body()).toString('utf8');
    expect(exportJsonText).toBeTruthy();
    const exportJson = JSON.parse(exportJsonText) as unknown as {
      type?: string;
      info?: { projectName?: string };
      docs?: { info?: { name?: string; type?: string } }[];
    };
    expect(exportJson.type).toBe('apiflow');
    expect(exportJson.info?.projectName).toBe(projectName);
    expect(exportJson.docs?.some((d) => d.info?.name === '导出测试文件夹' && d.info?.type === 'folder')).toBeTruthy();
    expect(exportJson.docs?.some((d) => d.info?.name === '导出测试WebSocket节点' && d.info?.type === 'websocket')).toBeTruthy();
    expect(exportJson.docs?.some((d) => d.info?.name === '导出测试HTTP Mock节点' && d.info?.type === 'httpMock')).toBeTruthy();
    expect(exportJson.docs?.some((d) => d.info?.name === '导出测试WebSocket Mock节点' && d.info?.type === 'websocketMock')).toBeTruthy();
    expect(exportJson.docs?.some((d) => d.info?.name === 'OpenAPI-参数组合接口' && d.info?.type === 'http')).toBeTruthy();
    expect(exportJson.docs?.some((d) => d.info?.name === 'OpenAPI-JSON请求体接口' && d.info?.type === 'http')).toBeTruthy();
    expect(exportJson.docs?.some((d) => d.info?.name === 'OpenAPI-FormData请求体接口' && d.info?.type === 'http')).toBeTruthy();
    expect(exportJson.docs?.some((d) => d.info?.name === 'OpenAPI-UrlEncoded请求体接口' && d.info?.type === 'http')).toBeTruthy();
    expect(exportJson.docs?.some((d) => d.info?.name === 'OpenAPI-Raw请求体接口' && d.info?.type === 'http')).toBeTruthy();
  });
  test('导出HTML文档格式,点击确定导出按钮触发下载', async ({ topBarPage, contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await createNode(contentPage, { nodeType: 'http', name: 'HTML导出测试接口' });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const exportItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导出文档/ });
    await exportItem.click();
    await contentPage.waitForTimeout(500);
    const exportPage = contentPage.locator('.doc-export');
    await expect(exportPage).toBeVisible({ timeout: 5000 });
    const htmlOption = exportPage.locator('.item').filter({ hasText: 'HTML' });
    await htmlOption.click();
    await expect(htmlOption).toHaveClass(/active/);
    const exportResponsePromise = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/export/html') && response.request().method() === 'POST',
      { timeout: 15000 },
    );
    const exportBtn = exportPage.locator('.el-button--primary').filter({ hasText: /确定导出/ });
    await exportBtn.click();
    const exportResponse = await exportResponsePromise;
    expect(exportResponse.status()).toBe(200);
    const contentType = exportResponse.headers()['content-type'] || '';
    expect(contentType.length).toBeGreaterThan(0);
  });
  test('导出WORD文档格式,点击确定导出按钮触发下载', async ({ topBarPage, contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await createNode(contentPage, { nodeType: 'http', name: 'WORD导出测试接口' });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const exportItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导出文档/ });
    await exportItem.click();
    await contentPage.waitForTimeout(500);
    const exportPage = contentPage.locator('.doc-export');
    await expect(exportPage).toBeVisible({ timeout: 5000 });
    const wordOption = exportPage.locator('.item').filter({ hasText: 'WORD' });
    await wordOption.click();
    await expect(wordOption).toHaveClass(/active/);
    await contentPage.evaluate(() => {
      const w = window as unknown as {
        __downloadRecords?: { filename: string; href: string; content?: string }[];
        __originalAnchorClick?: typeof HTMLAnchorElement.prototype.click;
        __originalRevokeObjectURL?: typeof URL.revokeObjectURL;
      };
      w.__downloadRecords = [];
      if (!w.__originalRevokeObjectURL) {
        w.__originalRevokeObjectURL = URL.revokeObjectURL.bind(URL);
        URL.revokeObjectURL = () => { };
      }
      if (!w.__originalAnchorClick) {
        w.__originalAnchorClick = HTMLAnchorElement.prototype.click;
        HTMLAnchorElement.prototype.click = function () {
          const downloadAttr = this.getAttribute('download');
          const href = this.getAttribute('href') || '';
          if (downloadAttr) {
            w.__downloadRecords?.push({ filename: downloadAttr, href });
          }
          return w.__originalAnchorClick!.apply(this);
        };
      }
    });
    const exportBtn = exportPage.locator('.el-button--primary').filter({ hasText: /确定导出/ });
    await exportBtn.click();
    await expect.poll(async () => {
      return await contentPage.evaluate(() => {
        const w = window as unknown as { __downloadRecords?: { filename: string }[] };
        return w.__downloadRecords?.length || 0;
      });
    }, { timeout: 15000 }).toBeGreaterThan(0);
    const filenames = await contentPage.evaluate(() => {
      const w = window as unknown as { __downloadRecords?: { filename: string }[] };
      return (w.__downloadRecords || []).map((r) => r.filename);
    });
    expect(filenames.some((name) => name.endsWith('.docx'))).toBeTruthy();
  });
  test('在线模式选择OpenAPI后点击确定导出提示仅支持离线模式且不触发下载', async ({ topBarPage, contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await createNode(contentPage, { nodeType: 'http', name: 'OpenAPI提示测试接口' });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const exportItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导出文档/ });
    await exportItem.click();
    await contentPage.waitForTimeout(500);
    const exportPage = contentPage.locator('.doc-export');
    await expect(exportPage).toBeVisible({ timeout: 5000 });
    const openapiOption = exportPage.locator('.item').filter({ hasText: 'OpenAPI' });
    await openapiOption.click();
    await expect(openapiOption).toHaveClass(/active/);
    await contentPage.evaluate(() => {
      const w = window as unknown as { __downloadRecords?: { filename: string; href: string }[] };
      w.__downloadRecords = [];
    });
    const exportBtn = exportPage.locator('.el-button--primary').filter({ hasText: /确定导出/ });
    await exportBtn.click();
    await expect(contentPage.getByText(/OpenAPI导出仅支持离线模式/)).toBeVisible({ timeout: 5000 });
    const downloadCount = await contentPage.evaluate(() => {
      const w = window as unknown as { __downloadRecords?: { filename: string; href: string }[] };
      return w.__downloadRecords?.length || 0;
    });
    expect(downloadCount).toBe(0);
  });
});


