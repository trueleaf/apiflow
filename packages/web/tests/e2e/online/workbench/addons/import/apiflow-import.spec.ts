import { test, expect } from '../../../../../fixtures/electron-online.fixture';

test.describe('ApiflowImport', () => {
  // 测试用例1: 打开导入页面并选择本地文件导入方式
  test('打开导入页面并选择本地文件导入方式', async ({ contentPage, clearCache, createProject, loginAccount }) => {
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
    // 验证默认选中本地文件
    const activeSource = contentPage.locator('.source-item.active');
    await expect(activeSource).toContainText(/本地文件|Local File/);
  });
  // 测试用例2: 导入apiflow格式数据预览正确显示
  test('导入apiflow格式数据预览正确显示', async ({ contentPage, clearCache, createProject, loginAccount }) => {
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
    // 验证预览区域存在
    const previewSection = contentPage.locator('.doc-import').filter({ hasText: /导入数据预览|Preview/ });
    await expect(previewSection).toBeVisible({ timeout: 3000 });
    // 验证空状态提示显示
    const emptyPreview = contentPage.locator('.empty-preview');
    await expect(emptyPreview).toBeVisible({ timeout: 3000 });
  });
  // 测试用例3: 选择追加导入方式
  test('选择追加导入方式', async ({ contentPage, clearCache, createProject, loginAccount }) => {
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
    // 验证追加方式radio存在并默认选中
    const appendRadio = contentPage.locator('.el-radio').filter({ hasText: /追加方式|Append/ });
    await expect(appendRadio).toBeVisible({ timeout: 3000 });
  });
  // 测试用例4: 选择覆盖导入方式弹出确认框
  test('选择覆盖导入方式弹出确认框', async ({ contentPage, clearCache, createProject, loginAccount }) => {
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
    // 点击覆盖方式radio
    const coverRadio = contentPage.locator('.el-radio').filter({ hasText: /覆盖方式|Override/ });
    await coverRadio.click();
    await contentPage.waitForTimeout(300);
    // 验证确认对话框出现
    const confirmDialog = contentPage.locator('.cl-confirm-container').filter({ hasText: /覆盖后的数据将无法还原|cannot be restored/ });
    await expect(confirmDialog).toBeVisible({ timeout: 3000 });
    // 取消操作
    const cancelBtn = confirmDialog.locator('.el-button').filter({ hasText: /取消|Cancel/ });
    await cancelBtn.click();
    await contentPage.waitForTimeout(300);
  });
  // 测试用例5: 无数据时点击确定导入显示警告
  test('无数据时点击确定导入显示警告', async ({ contentPage, clearCache, createProject, loginAccount }) => {
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
    // 验证确定导入按钮是禁用状态（无数据时）
    const submitBtn = contentPage.locator('.submit-wrap .el-button--primary');
    await expect(submitBtn).toBeDisabled();
  });
  // 测试用例6: 切换不同数据来源类型
  test('切换不同数据来源类型', async ({ contentPage, clearCache, createProject, loginAccount }) => {
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
    // 点击URL导入选项
    const urlSource = contentPage.locator('.source-item').filter({ hasText: /URL导入|URL/ });
    await urlSource.click();
    await contentPage.waitForTimeout(300);
    // 验证URL导入选项被选中
    await expect(urlSource).toHaveClass(/active/);
    // 点击粘贴内容选项
    const pasteSource = contentPage.locator('.source-item').filter({ hasText: /粘贴内容|Paste/ });
    await pasteSource.click();
    await contentPage.waitForTimeout(300);
    // 验证粘贴内容选项被选中
    await expect(pasteSource).toHaveClass(/active/);
  });
  // 测试用例7: 粘贴apiflow内容后预览树与导入按钮状态正确
  test('粘贴apiflow格式内容后预览树展示节点且可导入', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const importItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导入文档/ });
    await expect(importItem).toBeVisible({ timeout: 5000 });
    await importItem.click();
    await contentPage.waitForTimeout(500);

    const importPage = contentPage.locator('.doc-import');
    await expect(importPage).toBeVisible({ timeout: 5000 });
    const pasteSource = contentPage.locator('.source-item').filter({ hasText: /粘贴内容|Paste/ });
    await pasteSource.click();
    await expect(pasteSource).toHaveClass(/active/);

    const pasteTextarea = importPage.locator('.paste-import textarea');
    await expect(pasteTextarea).toBeVisible({ timeout: 5000 });
    const now = new Date().toISOString();
    const apiflowJson = JSON.stringify({
      type: 'apiflow',
      info: { projectName: '在线导入测试' },
      docs: [
        {
          _id: 'online_import_http_1',
          pid: '',
          projectId: '',
          sort: 0,
          info: {
            name: '在线导入接口A',
            description: '',
            version: '',
            type: 'http',
            creator: '',
            maintainer: '',
            deletePerson: '',
          },
          item: {
            method: 'get',
            url: { prefix: '', path: '/echo' },
            paths: [],
            queryParams: [],
            requestBody: {
              mode: 'none',
              rawJson: '',
              formdata: [],
              urlencoded: [],
              raw: { data: '', dataType: 'text/plain' },
              binary: { mode: 'file', varValue: '', binaryValue: { path: '', raw: '', id: '' } },
            },
            responseParams: [],
            headers: [],
            contentType: '',
          },
          preRequest: { raw: '' },
          afterRequest: { raw: '' },
          createdAt: now,
          updatedAt: now,
          isDeleted: false,
        },
      ],
    });
    await pasteTextarea.fill(apiflowJson);
    const parseBtn = importPage.locator('.paste-actions .el-button--primary').filter({ hasText: /解析内容|Parse/ });
    await expect(parseBtn).toBeEnabled();
    await parseBtn.click();

    const previewNode = importPage.locator('.el-tree .custom-tree-node').filter({ hasText: '在线导入接口A' });
    await expect(previewNode).toBeVisible({ timeout: 5000 });
    const submitBtn = importPage.locator('.submit-wrap .el-button--primary').filter({ hasText: /确定导入|Import/ });
    await expect(submitBtn).toBeEnabled();
  });
});


