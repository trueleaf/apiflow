import { test, expect } from '../../../fixtures/electron.fixture';

test.describe('ProjectList', () => {
  test('项目列表以卡片形式展示,卡片包含:项目名称,修改图标,删除图标,收藏图标,创建者,最新更新日期,接口总数,编辑按钮', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    const projectName = await createProject();
    // 等待项目列表加载
    await contentPage.waitForTimeout(500);
    // 定位项目卡片
    const projectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(projectCard).toBeVisible({ timeout: 5000 });
    // 验证项目名称
    const projectNameEl = projectCard.locator('.project-name');
    await expect(projectNameEl).toBeVisible();
    await expect(projectNameEl).toContainText(projectName);
    // 验证修改图标
    const editIcon = projectCard.locator('[data-testid="home-project-edit-btn"]');
    await expect(editIcon).toBeVisible();
    // 验证删除图标
    const deleteIcon = projectCard.locator('[data-testid="home-project-delete-btn"]');
    await expect(deleteIcon).toBeVisible();
    // 验证收藏图标(未收藏状态显示空心星星)
    const starIcon = projectCard.locator('[data-testid="home-project-star-btn"]');
    await expect(starIcon).toBeVisible();
    // 验证创建者信息
    const creatorInfo = projectCard.locator('.project-info-item').filter({ hasText: '创建者' });
    await expect(creatorInfo).toBeVisible();
    // 验证最新更新日期
    const updateInfo = projectCard.locator('.project-info-item').filter({ hasText: '最新更新' });
    await expect(updateInfo).toBeVisible();
    // 验证接口总数
    const docNumInfo = projectCard.locator('.project-info-item').filter({ hasText: '接口总数' });
    await expect(docNumInfo).toBeVisible();
    // 验证编辑按钮
    const enterBtn = projectCard.locator('[data-testid="home-project-enter-btn"]');
    await expect(enterBtn).toBeVisible();
  });

  test('点击编辑按钮,跳转对应项目工作区', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    const projectName = await createProject();
    await contentPage.waitForTimeout(500);
    // 定位项目卡片并点击编辑按钮
    const projectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(projectCard).toBeVisible({ timeout: 5000 });
    const enterBtn = projectCard.locator('[data-testid="home-project-enter-btn"]');
    await enterBtn.click();
    // 验证路由跳转到项目工作区
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 验证URL携带query参数
    const url = contentPage.url();
    expect(url).toContain('mode=edit');
    // 验证顶部导航栏新增Tab并高亮
    const projectTab = topBarPage.locator('.nav-item').filter({ hasText: projectName });
    await expect(projectTab).toBeVisible({ timeout: 5000 });
    // 验证Tab处于激活状态
    await expect(projectTab).toHaveClass(/active/);
  });

  test('点击修改按钮,弹出修改名称弹窗,并且输入框选中对应项目名称', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    const projectName = await createProject();
    await contentPage.waitForTimeout(500);
    // 定位项目卡片并点击修改图标
    const projectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(projectCard).toBeVisible({ timeout: 5000 });
    const editIcon = projectCard.locator('[data-testid="home-project-edit-btn"]');
    await editIcon.click();
    // 验证编辑弹窗弹出
    const editDialog = contentPage.locator('.el-dialog').filter({ hasText: /编辑项目|修改项目/ });
    await expect(editDialog).toBeVisible({ timeout: 5000 });
    // 验证输入框显示项目名称
    const projectNameInput = editDialog.locator('input').first();
    await expect(projectNameInput).toBeVisible();
    await expect(projectNameInput).toHaveValue(projectName);
    // 验证输入框获得焦点
    await expect(projectNameInput).toBeFocused();
  });

  test('点击修改按钮,弹出修改名称弹窗,点击确认后项目列表卡片名称更新为最新,顶部导航栏项目名称更新为最新', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    const projectName = await createProject();
    await contentPage.waitForTimeout(500);
    // 先点击编辑按钮进入项目工作区，创建Tab
    const projectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(projectCard).toBeVisible({ timeout: 5000 });
    const enterBtn = projectCard.locator('[data-testid="home-project-enter-btn"]');
    await enterBtn.click();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 返回首页
    const logo = topBarPage.locator('.logo-img');
    await logo.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 点击修改图标
    const projectCardAfterReturn = contentPage.locator('[data-testid="home-project-card-0"]');
    const editIcon = projectCardAfterReturn.locator('[data-testid="home-project-edit-btn"]');
    await editIcon.click();
    // 验证编辑弹窗弹出
    const editDialog = contentPage.locator('.el-dialog').filter({ hasText: /编辑项目|修改项目/ });
    await expect(editDialog).toBeVisible({ timeout: 5000 });
    // 输入新的项目名称
    const newProjectName = `更新后的项目-${Date.now()}`;
    const projectNameInput = editDialog.locator('input').first();
    await projectNameInput.fill(newProjectName);
    // 点击确定按钮
    const confirmBtn = editDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    // 验证弹窗关闭
    await expect(editDialog).toBeHidden({ timeout: 5000 });
    // 验证项目卡片名称更新
    const updatedProjectName = contentPage.locator('[data-testid="home-project-card-0"] .project-name');
    await expect(updatedProjectName).toContainText(newProjectName, { timeout: 5000 });
    // 验证顶部导航栏Tab名称更新
    const projectTab = topBarPage.locator('.nav-item').filter({ hasText: newProjectName });
    await expect(projectTab).toBeVisible({ timeout: 5000 });
  });

  test('未收藏项目,点击收藏图标,图标变为已收藏图标,并且在收藏的项目中展示被收藏项目', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    const projectName = await createProject();
    await contentPage.waitForTimeout(500);
    // 定位项目卡片
    const projectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(projectCard).toBeVisible({ timeout: 5000 });
    // 点击收藏图标(空心星星)
    const starBtn = projectCard.locator('[data-testid="home-project-star-btn"]');
    await expect(starBtn).toBeVisible();
    await starBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证收藏图标变为已收藏(实心星星)
    const unstarBtn = projectCard.locator('[data-testid="home-project-unstar-btn"]');
    await expect(unstarBtn).toBeVisible({ timeout: 5000 });
    // 验证"收藏的项目"区域显示
    const starProjectsTitle = contentPage.locator('.star-projects-wrap');
    await expect(starProjectsTitle).toBeVisible({ timeout: 5000 });
    // 验证收藏区域包含该项目
    const starProjectCard = contentPage.locator('[data-testid="home-star-project-card-0"]');
    await expect(starProjectCard).toBeVisible({ timeout: 5000 });
    const starProjectName = starProjectCard.locator('.project-name');
    await expect(starProjectName).toContainText(projectName);
  });

  test('如果不存在收藏的项目,不展示收藏的项目标题', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    await createProject();
    await contentPage.waitForTimeout(500);
    // 验证"收藏的项目"区域不显示
    const starProjectsWrap = contentPage.locator('.star-projects-wrap');
    await expect(starProjectsWrap).toBeHidden({ timeout: 5000 });
    // 验证"全部项目"区域正常显示
    const allProjectsTitle = contentPage.locator('.all-projects-wrap');
    await expect(allProjectsTitle).toBeVisible({ timeout: 5000 });
  });

  test('收藏的项目,点击收藏图标,图标变为未收藏图标,并且从收藏的项目中移除', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    const projectName = await createProject();
    await contentPage.waitForTimeout(500);
    // 先收藏项目
    const projectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(projectCard).toBeVisible({ timeout: 5000 });
    const starBtn = projectCard.locator('[data-testid="home-project-star-btn"]');
    await starBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证收藏区域显示
    const starProjectsWrap = contentPage.locator('.star-projects-wrap');
    await expect(starProjectsWrap).toBeVisible({ timeout: 5000 });
    // 在收藏区域点击取消收藏
    const starProjectCard = contentPage.locator('[data-testid="home-star-project-card-0"]');
    const unstarBtn = starProjectCard.locator('[data-testid="home-star-project-unstar-btn"]');
    await expect(unstarBtn).toBeVisible();
    await unstarBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证收藏区域隐藏(因为没有收藏项目了)
    await expect(starProjectsWrap).toBeHidden({ timeout: 5000 });
    // 验证全部项目区域的项目变为未收藏状态
    const allProjectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    const starBtnAfterUnstar = allProjectCard.locator('[data-testid="home-project-star-btn"]');
    await expect(starBtnAfterUnstar).toBeVisible({ timeout: 5000 });
  });

  test('点击删除项目图标,提示用户是否删除,确认后删除项目,在左下角出现撤回倒计时,在倒计时时间内允许用户撤回删除的项目', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    const projectName = await createProject();
    await contentPage.waitForTimeout(500);
    // 定位项目卡片并点击删除图标
    const projectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(projectCard).toBeVisible({ timeout: 5000 });
    const deleteBtn = projectCard.locator('[data-testid="home-project-delete-btn"]');
    await deleteBtn.click();
    // 验证确认对话框弹出
    const confirmDialog = contentPage.locator('.el-message-box');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    await expect(confirmDialog).toContainText('此操作将删除该项目');
    // 点击确定按钮
    const confirmBtn = confirmDialog.locator('.el-button--primary');
    await confirmBtn.click();
    // 验证对话框关闭
    await expect(confirmDialog).toBeHidden({ timeout: 5000 });
    // 验证项目卡片从列表中消失
    await expect(projectCard).toBeHidden({ timeout: 5000 });
    // 验证撤回通知显示
    const undoNotification = contentPage.locator('.undo-notification');
    await expect(undoNotification).toBeVisible({ timeout: 5000 });
    await expect(undoNotification).toContainText('项目已删除');
    // 点击撤回按钮
    const undoBtn = undoNotification.locator('.undo-btn');
    await expect(undoBtn).toBeVisible();
    await undoBtn.click();
    // 验证撤回通知消失
    await expect(undoNotification).toBeHidden({ timeout: 5000 });
    // 验证项目恢复
    const restoredProjectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(restoredProjectCard).toBeVisible({ timeout: 5000 });
    const restoredProjectName = restoredProjectCard.locator('.project-name');
    await expect(restoredProjectName).toContainText(projectName);
  });

  test('接口数量需要正确展示,folder节点不计入接口总数', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    const projectName = await createProject();
    await contentPage.waitForTimeout(500);
    // 进入项目工作区
    const projectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(projectCard).toBeVisible({ timeout: 5000 });
    const enterBtn = projectCard.locator('[data-testid="home-project-enter-btn"]');
    await enterBtn.click();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 添加一个文件夹节点
    const addFolderBtn = contentPage.locator('[data-testid="banner-add-folder-btn"]');
    await expect(addFolderBtn).toBeVisible({ timeout: 5000 });
    await addFolderBtn.click();
    await contentPage.waitForTimeout(500);
    // 添加一个HTTP节点
    const addHttpBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await expect(addHttpBtn).toBeVisible({ timeout: 5000 });
    await addHttpBtn.click();
    await contentPage.waitForTimeout(500);
    // 返回首页查看接口总数
    const logo = topBarPage.locator('.logo-img');
    await logo.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 验证接口总数为1(folder不计入)
    const projectCardAfterReturn = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(projectCardAfterReturn).toBeVisible({ timeout: 5000 });
    const docNumInfo = projectCardAfterReturn.locator('.project-info-item').filter({ hasText: '接口总数' });
    await expect(docNumInfo).toContainText('1');
  });
});
