import { test, expect } from '../../../../../fixtures/desktop.fixture';

test.describe('OpenapiImport', () => {
  // 测试用例1: 打开导入页面验证OpenAPI/Swagger格式选择器
  test('打开导入页面验证OpenAPI/Swagger格式选择器', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
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
  test('OpenAPI格式文件夹命名方式选择', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
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
  test('选择追加导入方式不选择目标目录', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
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
  test('选择追加导入方式并选择目标目录', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 先创建一个文件夹
    const addFolderBtn = contentPage.getByTestId('banner-add-folder-btn');
    await addFolderBtn.click();
    const addFolderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增文件夹|新建文件夹|Add Folder/ });
    await expect(addFolderDialog).toBeVisible({ timeout: 5000 });
    await addFolderDialog.locator('input').first().fill('导入目标文件夹');
    await addFolderDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
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
  test('粘贴OpenAPI 3.0数据后自动识别格式并预览树正确展示', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const importItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导入文档/ });
    await importItem.click();
    const importPage = contentPage.locator('.doc-import');
    await expect(importPage).toBeVisible({ timeout: 5000 });
    // 切换到粘贴内容数据来源
    const pasteSource = contentPage.locator('.source-item').filter({ hasText: /粘贴内容|Paste/ });
    await pasteSource.click();
    await expect(pasteSource).toHaveClass(/active/);
    // 粘贴最小化OpenAPI 3.0文档（含2个接口,1个tag）
    const pasteTextarea = importPage.locator('.paste-import textarea');
    await expect(pasteTextarea).toBeVisible({ timeout: 5000 });
    const openapiJson = JSON.stringify({
      openapi: '3.0.0',
      info: { title: '测试API', version: '1.0.0' },
      paths: {
        '/users': {
          get: { tags: ['用户管理'], summary: '获取用户列表', responses: { '200': { description: 'OK' } } },
        },
        '/orders': {
          post: { tags: ['订单管理'], summary: '创建订单', responses: { '200': { description: 'OK' } } },
        },
      },
    });
    await pasteTextarea.fill(openapiJson);
    const parseBtn = importPage.locator('.paste-actions .el-button--primary').filter({ hasText: /解析内容|Parse/ });
    await parseBtn.click();
    // 验证预览树出现节点,文档数为2
    const previewTree = importPage.locator('.el-tree');
    await expect(previewTree.locator('.custom-tree-node').first()).toBeVisible({ timeout: 5000 });
    const docCountText = importPage.locator('.preview-stats');
    await expect(docCountText).toContainText('2');
  });
  for (const folderMode of ['Tag', 'Url']) {
    test(`${folderMode} 分组导入只保存扁平节点，预览切换后父子关系和前缀仍正确（issue #51）`, async ({ contentPage, clearCache, createProject, reload }) => {
      await clearCache();
      await createProject();
      await contentPage.waitForURL(/.*?#?\/workbench/);
      const projectId = new URL(contentPage.url().split('#')[1], 'http://localhost').searchParams.get('id');
      expect(projectId).toBeTruthy();
      await contentPage.getByTestId('banner-tool-more-btn').click();
      await contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导入文档/ }).click();
      const importPage = contentPage.locator('.doc-import');
      await importPage.locator('.source-item').filter({ hasText: /粘贴内容/ }).click();
      // 同一分组下包含两个接口，前缀由 OpenAPI servers 提供
      await importPage.locator('.paste-import textarea').fill(JSON.stringify({
        openapi: '3.0.0',
        info: { title: 'issue 51', version: '1.0.0' },
        servers: [{ url: 'https://example.com/v1' }],
        paths: {
          '/users': {
            get: { tags: ['测试中心'], summary: '查询用户', responses: { '200': { description: 'OK' } } },
            post: { tags: ['测试中心'], summary: '创建用户', responses: { '200': { description: 'OK' } } },
          },
        },
      }));
      await importPage.getByRole('button', { name: '解析内容' }).click();
      const previewNodes = importPage.locator('.el-tree .custom-tree-node');
      await expect(previewNodes).toHaveCount(3);
      // 切换预览分组，确认重建树不会产生重复节点
      await importPage.locator('.el-radio').filter({ hasText: /^none$/ }).click();
      await expect(previewNodes).toHaveCount(2);
      await importPage.locator('.el-radio').filter({ hasText: new RegExp(`^${folderMode}$`) }).click();
      await expect(previewNodes).toHaveCount(3);
      await expect(previewNodes.filter({ hasText: folderMode === 'Tag' ? '测试中心' : 'users' })).toHaveCount(1);
      await importPage.getByRole('button', { name: '确定导入' }).click();
      await expect(contentPage.locator('.el-message--success').filter({ hasText: '导入成功' })).toBeVisible();
      const bannerTree = contentPage.getByTestId('banner-doc-tree');
      await expect(bannerTree.locator('[data-test-node-type="folder"]')).toHaveCount(1);
      await bannerTree.locator('[data-test-node-type="folder"]').click();
      await expect(bannerTree.locator('[data-test-node-type="http"]')).toHaveCount(2);
      // 检查实际持久化结果，不能把预览树 children 存入文档
      const storedDocs = await contentPage.evaluate(async projectId => {
        return await new Promise<unknown[]>((resolve, reject) => {
          const openRequest = indexedDB.open('workspaceDataCache');
          openRequest.onerror = () => reject(openRequest.error);
          openRequest.onsuccess = () => {
            const database = openRequest.result;
            const nodesRequest = database.transaction('httpNodeList', 'readonly').objectStore('httpNodeList').index('projectId').getAll(projectId);
            nodesRequest.onerror = () => { database.close(); reject(nodesRequest.error); };
            nodesRequest.onsuccess = () => { database.close(); resolve(nodesRequest.result as unknown[]); };
          };
        });
      }, projectId!) as { _id: string; pid: string; children?: unknown[]; info: { type: string }; item?: { url: { prefix: string; host: string } } }[];
      expect(storedDocs).toHaveLength(3);
      expect(storedDocs.every(doc => !Object.hasOwn(doc, 'children'))).toBeTruthy();
      const folder = storedDocs.find(doc => doc.info.type === 'folder');
      expect(folder?.pid).toBe('');
      for (const doc of storedDocs.filter(doc => doc.info.type === 'http')) {
        expect(doc.pid).toBe(folder?._id);
        expect(doc.item?.url.prefix).toBe('https://example.com/v1');
        expect(doc.item?.url.host).toBe('https://example.com/v1');
      }
      await reload();
      await expect(contentPage.getByTestId('banner-doc-tree').locator('[data-test-node-type="folder"]')).toHaveCount(1);
      await contentPage.getByTestId('banner-doc-tree').locator('[data-test-node-type="folder"]').click();
      await expect(contentPage.getByTestId('banner-doc-tree').locator('[data-test-node-type="http"]')).toHaveCount(2);
    });
  }
});


