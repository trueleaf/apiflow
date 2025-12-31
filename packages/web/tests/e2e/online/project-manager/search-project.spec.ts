import { test, expect } from '../../../fixtures/electron-online.fixture';

test.describe('SearchProject', () => {
  // 测试用例1: 搜索无结果展示
  test('输入不存在的项目名称,显示空状态提示', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    const projectName = await createProject();
    await contentPage.waitForTimeout(500);
    // 返回首页
    const logo = topBarPage.locator('.logo-img');
    const projectListPromise = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
      { timeout: 20000 },
    );
    const urlPromise = contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    await logo.click();
    await Promise.all([projectListPromise, urlPromise]);
    await contentPage.waitForTimeout(500);
    // 验证项目卡片存在
    const projectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(projectCard).toBeVisible({ timeout: 5000 });
    // 定位搜索输入框
    const searchInput = contentPage.locator('[data-testid="home-project-search-input"]');
    await expect(searchInput).toBeVisible();
    // 输入不存在的项目名称
    await searchInput.fill('不存在的项目xyz123');
    // 等待300ms防抖延迟
    await contentPage.waitForTimeout(400);
    // 验证项目卡片列表为空
    await expect(projectCard).toBeHidden({ timeout: 5000 });
    // 验证空状态组件显示
    const emptyContainer = contentPage.locator('.empty-container .el-empty');
    await expect(emptyContainer).toBeVisible({ timeout: 5000 });
  });

  test('清空搜索框后,项目列表恢复显示', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    const projectName = await createProject();
    await contentPage.waitForTimeout(500);
    // 返回首页
    const logo = topBarPage.locator('.logo-img');
    const projectListPromise = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
      { timeout: 20000 },
    );
    const urlPromise = contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    await logo.click();
    await Promise.all([projectListPromise, urlPromise]);
    await contentPage.waitForTimeout(500);
    // 定位搜索输入框
    const searchInput = contentPage.locator('[data-testid="home-project-search-input"]');
    await searchInput.fill('不存在的项目xyz123');
    await contentPage.waitForTimeout(400);
    // 验证项目卡片隐藏
    const projectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(projectCard).toBeHidden({ timeout: 5000 });
    // 点击清空按钮
    const clearBtn = contentPage.locator('[data-testid="home-search-clear-btn"]');
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await contentPage.waitForTimeout(400);
    // 验证项目卡片恢复显示
    await expect(projectCard).toBeVisible({ timeout: 5000 });
  });

  test('搜索匹配项目名称,项目列表正确过滤', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    // 创建两个项目，使用唯一的名称避免与其他项目冲突
    const uniqueId = Date.now();
    const project1 = await createProject(`测试项目AAA_${uniqueId}`);
    await contentPage.waitForTimeout(300);
    // 返回首页
    const logo = topBarPage.locator('.logo-img');
    const projectListPromise = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
      { timeout: 20000 },
    );
    const urlPromise = contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    await logo.click();
    await Promise.all([projectListPromise, urlPromise]);
    await contentPage.waitForTimeout(300);
    const project2 = await createProject(`另一个项目BBB_${uniqueId}`);
    await contentPage.waitForTimeout(300);
    // 返回首页
    const projectListPromiseAfterSecondClick = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
      { timeout: 20000 },
    );
    const secondUrlPromise = contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    await logo.click();
    await Promise.all([projectListPromiseAfterSecondClick, secondUrlPromise]);
    await contentPage.waitForTimeout(800);
    // 搜索第一个项目
    const searchInput = contentPage.locator('[data-testid="home-project-search-input"]');
    await searchInput.fill(`AAA_${uniqueId}`);
    await contentPage.waitForTimeout(500);
    // 验证只显示匹配的项目
    const projectCards = contentPage.locator('[data-testid^="home-project-card-"]');
    await expect(projectCards).toHaveCount(1);
    // 验证显示的是正确的项目
    const projectNameEl = contentPage.locator('[data-testid="home-project-card-0"] .project-name');
    await expect(projectNameEl).toContainText(`AAA_${uniqueId}`);
  });
});
