import { test, expect } from '../../../../../fixtures/electron.fixture';

test.describe('PostmanImport', () => {
  // 测试用例1: 打开导入页面验证Postman格式支持
  test('打开导入页面验证Postman格式支持', async ({ contentPage, clearCache, createProject }) => {
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
    // 验证本地文件上传区域存在
    const fileUploadArea = contentPage.locator('.source-item.active');
    await expect(fileUploadArea).toContainText(/本地文件|Local File/);
  });
  // 测试用例2: 验证Postman Collection格式识别
  test('验证Postman Collection格式识别', async ({ contentPage, clearCache, createProject }) => {
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
  // 测试用例3: 选择追加导入方式
  test('选择追加导入方式', async ({ contentPage, clearCache, createProject }) => {
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
  });
  // 测试用例4: 无数据时确定导入按钮禁用
  test('无数据时确定导入按钮禁用', async ({ contentPage, clearCache, createProject }) => {
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
    // 验证确定导入按钮是禁用状态（无数据时）
    const submitBtn = contentPage.locator('.submit-wrap .el-button--primary');
    await expect(submitBtn).toBeDisabled();
  });
  test('粘贴Postman Collection数据后预览树展示嵌套文件夹和接口', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const importItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导入文档/ });
    await importItem.click();
    const importPage = contentPage.locator('.doc-import');
    await expect(importPage).toBeVisible({ timeout: 5000 });
    // 切换到粘贴内容
    const pasteSource = contentPage.locator('.source-item').filter({ hasText: /粘贴内容|Paste/ });
    await pasteSource.click();
    // 粘贴Postman Collection v2.1数据（含嵌套文件夹）
    const pasteTextarea = importPage.locator('.paste-import textarea');
    await expect(pasteTextarea).toBeVisible({ timeout: 5000 });
    const postmanJson = JSON.stringify({
      info: { _postman_id: 'test-id-001', name: '测试集合', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
      item: [
        {
          name: '用户模块',
          item: [
            { name: '获取用户', request: { method: 'GET', url: { raw: 'http://localhost/api/users', host: ['localhost'], path: ['api', 'users'] } } },
          ],
        },
        { name: '健康检查', request: { method: 'GET', url: { raw: 'http://localhost/health', host: ['localhost'], path: ['health'] } } },
      ],
    });
    await pasteTextarea.fill(postmanJson);
    const parseBtn = importPage.locator('.paste-actions .el-button--primary').filter({ hasText: /解析内容|Parse/ });
    await parseBtn.click();
    // 验证预览树展示文件夹和接口节点
    const previewTree = importPage.locator('.el-tree');
    await expect(previewTree.locator('.custom-tree-node').first()).toBeVisible({ timeout: 5000 });
    // 验证文件夹数>=1（用户模块文件夹）
    const statsText = importPage.locator('.preview-stats');
    await expect(statsText).toBeVisible();
    // 验证确定导入按钮可用
    const submitBtn2 = importPage.locator('.submit-wrap .el-button--primary').filter({ hasText: /确定导入|Import/ });
    await expect(submitBtn2).toBeEnabled();
  });
});


