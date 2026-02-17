import { test, expect } from '../../../fixtures/electron-online.fixture';

test.describe('ProjectList', () => {
  test('项目卡片包含关键信息与操作入口', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    const projectName = await createProject(`卡片信息-${Date.now()}`);
    // 返回首页并等待项目列表刷新
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    const projectListPromise = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
      { timeout: 20000 },
    );
    await homeBtn.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    await projectListPromise;
    const projectCard = contentPage.locator('.project-list').filter({ hasText: projectName }).first();
    await expect(projectCard).toBeVisible({ timeout: 5000 });
    await expect(projectCard.locator('.project-name')).toContainText(projectName);
    await expect(projectCard.locator('[data-testid="home-project-delete-btn"]')).toBeVisible();
    await expect(projectCard.locator('[data-testid="home-project-enter-btn"]')).toBeVisible();
    await expect(projectCard.locator('.project-creator')).toBeVisible();
    await expect(projectCard.locator('.project-update-time')).toBeVisible();
    await expect(projectCard.locator('.project-api-count')).toBeVisible();
  });

  test('点击编辑按钮进入项目工作区并高亮对应Tab', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    const projectName = await createProject(`进入工作区-${Date.now()}`);
    // 返回首页后从项目卡片进入工作区
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    const projectListPromise = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
      { timeout: 20000 },
    );
    await homeBtn.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    await projectListPromise;
    const projectCard = contentPage.locator('.project-list').filter({ hasText: projectName }).first();
    await expect(projectCard).toBeVisible({ timeout: 5000 });
    await projectCard.locator('[data-testid="home-project-enter-btn"]').click();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const projectTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectName });
    await expect(projectTab).toBeVisible({ timeout: 5000 });
    await expect(projectTab).toHaveClass(/active/);
  });

  test('修改项目名称后首页卡片与顶部Tab同步更新', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    const originalName = await createProject(`重命名前-${Date.now()}`);
    // 先确保存在项目Tab，再回首页执行重命名
    const projectTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: originalName });
    await expect(projectTab).toBeVisible({ timeout: 5000 });
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    const projectListPromise = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
      { timeout: 20000 },
    );
    await homeBtn.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    await projectListPromise;
    const projectCard = contentPage.locator('.project-list').filter({ hasText: originalName }).first();
    await expect(projectCard).toBeVisible({ timeout: 5000 });
    // 通过卡片编辑图标打开重命名弹窗并提交新名称
    await projectCard.hover();
    const editIcon = projectCard.locator('.operator div[title="编辑"], .operator div[title="Edit"]').first();
    await editIcon.click();
    const editDialog = contentPage.locator('.el-dialog').filter({ hasText: /编辑项目|修改项目|Edit Project|Rename Project/ }).first();
    await expect(editDialog).toBeVisible({ timeout: 5000 });
    const newName = `重命名后-${Date.now()}`;
    await editDialog.locator('input').first().fill(newName);
    await editDialog.locator('.el-button--primary').last().click();
    await expect(editDialog).toBeHidden({ timeout: 5000 });
    await expect(contentPage.locator('.project-list').filter({ hasText: newName }).first()).toBeVisible({ timeout: 5000 });
    await expect(topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: newName })).toBeVisible({ timeout: 5000 });
  });

  test('收藏与取消收藏会在收藏区同步增减', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    const projectName = await createProject(`收藏测试-${Date.now()}`);
    // 回到首页执行收藏
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    const projectListPromise = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
      { timeout: 20000 },
    );
    await homeBtn.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    await projectListPromise;
    const projectCard = contentPage.locator('.project-list').filter({ hasText: projectName }).first();
    await expect(projectCard).toBeVisible({ timeout: 5000 });
    // 收藏项目并验证收藏区出现该项目
    await projectCard.locator('.operator div[title="收藏"], .operator div[title="Favorite"]').first().click();
    const starProjectCard = contentPage.locator('[data-testid="home-star-projects-wrap"] .project-list').filter({ hasText: projectName }).first();
    await expect(starProjectCard).toBeVisible({ timeout: 5000 });
    // 取消收藏并验证收藏区移除该项目
    await starProjectCard.locator('[data-testid="home-star-project-unstar-btn"]').click();
    await expect(contentPage.locator('[data-testid="home-star-projects-wrap"] .project-list').filter({ hasText: projectName })).toHaveCount(0, { timeout: 5000 });
  });

  test('删除项目后卡片消失，若支持撤回则可恢复', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    const projectName = await createProject(`删除测试-${Date.now()}`);
    // 进入首页执行删除流程
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    const projectListPromise = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
      { timeout: 20000 },
    );
    await homeBtn.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    await projectListPromise;
    const projectCard = contentPage.locator('.project-list').filter({ hasText: projectName }).first();
    await expect(projectCard).toBeVisible({ timeout: 5000 });
    await projectCard.locator('[data-testid="home-project-delete-btn"]').click();
    const confirmDialog = contentPage.locator('.cl-confirm-container');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    await confirmDialog.locator('.el-button--primary').first().click();
    await expect(projectCard).toBeHidden({ timeout: 5000 });
    // 有撤回通知时验证可以恢复
    const undoNotification = contentPage.locator('.undo-notification');
    const hasUndo = await undoNotification.isVisible({ timeout: 1500 }).catch(() => false);
    if (hasUndo) {
      await undoNotification.locator('.btn-undo').click();
      await expect(contentPage.locator('.project-list').filter({ hasText: projectName }).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('接口数量统计不包含 folder 节点', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount, createNode }) => {
    test.setTimeout(120000);
    await clearCache();
    await loginAccount();
    const projectName = await createProject(`接口数量-${Date.now()}`);
    // 在工作区创建 folder + 多种接口节点
    await expect(contentPage).toHaveURL(/.*?#?\/workbench/, { timeout: 5000 });
    const folderId = await createNode(contentPage, { nodeType: 'folder', name: `folder-${Date.now()}` });
    await createNode(contentPage, { nodeType: 'folder', name: `folder-child-${Date.now()}`, pid: folderId });
    await createNode(contentPage, { nodeType: 'http', name: `http-${Date.now()}` });
    await createNode(contentPage, { nodeType: 'websocket', name: `ws-${Date.now()}` });
    await createNode(contentPage, { nodeType: 'httpMock', name: `mock-${Date.now()}` });
    // 回到首页并验证接口总数为3（不计 folder）
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    const projectListPromise = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
      { timeout: 20000 },
    );
    await homeBtn.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    await projectListPromise;
    const projectCard = contentPage.locator('.project-list').filter({ hasText: projectName }).first();
    await expect(projectCard).toBeVisible({ timeout: 5000 });
    await expect(projectCard.locator('.project-api-count .teal')).toContainText('3', { timeout: 5000 });
  });
});
