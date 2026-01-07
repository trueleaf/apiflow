import { test, expect } from '../../../fixtures/electron-online.fixture';
import type { Response } from 'playwright';

// 辅助函数：初始化测试环境
const initTestEnv = async (topBarPage: any, contentPage: any, clearCache: () => Promise<void>, reload: () => Promise<void>) => {
  await clearCache();
  // 先点击首页按钮确保在首页
  const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
  const projectListPromise = contentPage.waitForResponse(
    (response: Response) => response.url().includes('/api/project/project_list') && response.status() === 200,
    { timeout: 20000 },
  );
  await homeBtn.click();
  await projectListPromise;
  await contentPage.waitForTimeout(300);
  await reload();
  await contentPage.waitForTimeout(500);
  return homeBtn;
};
// 辅助函数：创建项目后返回首页
const createProjectAndGoHome = async (topBarPage: any, contentPage: any, createProject: (name?: string) => Promise<string>, homeBtn: any, projectName?: string) => {
  const name = await createProject(projectName);
  // 返回首页
  const projectListPromise = contentPage.waitForResponse(
    (response: Response) => response.url().includes('/api/project/project_list') && response.status() === 200,
    { timeout: 20000 },
  );
  await homeBtn.click();
  await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
  await projectListPromise;
  await contentPage.waitForTimeout(500);
  // 关闭可能的提示弹窗
  const confirmBtn = contentPage.locator('.el-message-box__btns .el-button--primary');
  const confirmBtnVisible = await confirmBtn.isVisible({ timeout: 1000 }).catch(() => false);
  if (confirmBtnVisible) {
    await confirmBtn.click();
    await contentPage.waitForTimeout(300);
  }
  return name;
};

test.describe('ProjectList', () => {
  test('项目列表以卡片形式展示,卡片包含:项目名称,修改图标,删除图标,收藏图标,创建者,最新更新日期,接口总数,编辑按钮', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    const homeBtn = await initTestEnv(topBarPage, contentPage, clearCache, reload);
    await loginAccount();
    const projectName = await createProjectAndGoHome(topBarPage, contentPage, createProject, homeBtn);
    // 定位项目卡片
    const projectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(projectCard).toBeVisible({ timeout: 5000 });
    // 验证项目名称
    const projectNameEl = projectCard.locator('.project-name');
    await expect(projectNameEl).toBeVisible();
    await expect(projectNameEl).toContainText(projectName);
    // 验证编辑图标(使用title属性定位)
    const editIcon = projectCard.locator('.operator div[title="编辑"]');
    await expect(editIcon).toBeVisible();
    // 验证删除图标
    const deleteIcon = projectCard.locator('[data-testid="home-project-delete-btn"]');
    await expect(deleteIcon).toBeVisible();
    // 验证收藏图标(未收藏状态使用title属性定位)
    const starIcon = projectCard.locator('.operator div[title="收藏"]');
    await expect(starIcon).toBeVisible();
    // 验证创建者信息
    const creatorInfo = projectCard.locator('.project-creator');
    await expect(creatorInfo).toBeVisible();
    // 验证最新更新日期
    const updateInfo = projectCard.locator('.project-update-time');
    await expect(updateInfo).toBeVisible();
    // 验证接口总数
    const docNumInfo = projectCard.locator('.project-api-count');
    await expect(docNumInfo).toBeVisible();
    // 验证编辑按钮
    const enterBtn = projectCard.locator('[data-testid="home-project-enter-btn"]');
    await expect(enterBtn).toBeVisible();
  });

  test('点击编辑按钮,跳转对应项目工作区', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    const homeBtn = await initTestEnv(topBarPage, contentPage, clearCache, reload);
    await loginAccount();
    const projectName = await createProjectAndGoHome(topBarPage, contentPage, createProject, homeBtn);
    // 定位项目卡片并点击编辑按钮
    const projectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(projectCard).toBeVisible({ timeout: 5000 });
    const enterBtn = projectCard.locator('[data-testid="home-project-enter-btn"]');
    await enterBtn.click();
    // 验证路由跳转到项目工作区
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 验证URL携带query参数
    const url = contentPage.url();
    expect(url).toContain('mode=edit');
    // 验证顶部导航栏新增Tab并高亮
    const projectTab = topBarPage.locator('.tab-item').filter({ hasText: projectName });
    await expect(projectTab).toBeVisible({ timeout: 5000 });
    // 验证Tab处于激活状态
    await expect(projectTab).toHaveClass(/active/);
  });

  test('点击修改按钮,弹出修改名称弹窗,并且输入框选中对应项目名称', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    const homeBtn = await initTestEnv(topBarPage, contentPage, clearCache, reload);
    await loginAccount();
    const projectName = await createProjectAndGoHome(topBarPage, contentPage, createProject, homeBtn);
    // 定位项目卡片并点击编辑图标(使用title属性定位)
    const projectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(projectCard).toBeVisible({ timeout: 5000 });
    const editIcon = projectCard.locator('.operator div[title="编辑"]');
    await editIcon.click();
    // 验证编辑弹窗弹出
    const editDialog = contentPage.locator('.el-dialog').filter({ hasText: /编辑项目|修改项目/ });
    await expect(editDialog).toBeVisible({ timeout: 5000 });
    // 验证输入框显示项目名称
    const projectNameInput = editDialog.locator('input').first();
    await expect(projectNameInput).toBeVisible();
    await expect(projectNameInput).toHaveValue(projectName);
  });

  test('点击修改按钮,弹出修改名称弹窗,点击确认后项目列表卡片名称更新为最新,顶部导航栏项目名称更新为最新', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    const homeBtn = await initTestEnv(topBarPage, contentPage, clearCache, reload);
    await loginAccount();
    const projectName = await createProjectAndGoHome(topBarPage, contentPage, createProject, homeBtn);
    // 先点击编辑按钮进入项目工作区，创建Tab
    const projectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(projectCard).toBeVisible({ timeout: 5000 });
    const enterBtn = projectCard.locator('[data-testid="home-project-enter-btn"]');
    await enterBtn.click();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 返回首页
    await homeBtn.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 关闭可能的提示弹窗
    const msgBoxConfirmBtn = contentPage.locator('.el-message-box__btns .el-button--primary');
    const msgBoxConfirmBtnVisible = await msgBoxConfirmBtn.isVisible({ timeout: 1000 }).catch(() => false);
    if (msgBoxConfirmBtnVisible) {
      await msgBoxConfirmBtn.click();
      await contentPage.waitForTimeout(300);
    }
    // 点击编辑图标
    const projectCardAfterReturn = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(projectCardAfterReturn).toBeVisible({ timeout: 5000 });
    const editIcon = projectCardAfterReturn.locator('.operator div[title="编辑"]');
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
    const projectTab = topBarPage.locator('.tab-item').filter({ hasText: newProjectName });
    await expect(projectTab).toBeVisible({ timeout: 5000 });
  });

  test('未收藏项目,点击收藏图标,图标变为已收藏图标,并且在收藏的项目中展示被收藏项目', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    const homeBtn = await initTestEnv(topBarPage, contentPage, clearCache, reload);
    await loginAccount();
    const projectName = await createProjectAndGoHome(topBarPage, contentPage, createProject, homeBtn);
    // 定位项目卡片
    const projectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(projectCard).toBeVisible({ timeout: 5000 });
    // 点击收藏图标(使用title属性定位)
    const starBtn = projectCard.locator('.operator div[title="收藏"]');
    await expect(starBtn).toBeVisible();
    await starBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证收藏图标变为已收藏(实心星星)
    const unstarBtn = projectCard.locator('[data-testid="home-project-unstar-btn"]');
    await expect(unstarBtn).toBeVisible({ timeout: 5000 });
    // 验证"收藏的项目"区域显示
    const starProjectsTitle = contentPage.locator('[data-testid="home-star-projects-wrap"]');
    await expect(starProjectsTitle).toBeVisible({ timeout: 5000 });
    // 验证收藏区域包含该项目
    const starProjectCard = contentPage.locator('[data-testid="home-star-project-card-0"]');
    await expect(starProjectCard).toBeVisible({ timeout: 5000 });
    const starProjectName = starProjectCard.locator('.project-name');
    await expect(starProjectName).toContainText(projectName);
  });

  test('如果不存在收藏的项目,不展示收藏的项目标题', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    const homeBtn = await initTestEnv(topBarPage, contentPage, clearCache, reload);
    await loginAccount();
    await createProjectAndGoHome(topBarPage, contentPage, createProject, homeBtn);
    // 验证"收藏的项目"区域不显示
    const starProjectsWrap = contentPage.locator('[data-testid="home-star-projects-wrap"]');
    await expect(starProjectsWrap).toBeHidden({ timeout: 5000 });
    // 验证"全部项目"区域正常显示
    const allProjectsTitle = contentPage.locator('[data-testid="home-projects-wrap"]');
    await expect(allProjectsTitle).toBeVisible({ timeout: 5000 });
  });

  test('收藏的项目,点击收藏图标,图标变为未收藏图标,并且从收藏的项目中移除', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    const homeBtn = await initTestEnv(topBarPage, contentPage, clearCache, reload);
    await loginAccount();
    await createProjectAndGoHome(topBarPage, contentPage, createProject, homeBtn);
    // 先收藏项目
    const projectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(projectCard).toBeVisible({ timeout: 5000 });
    const starBtn = projectCard.locator('.operator div[title="收藏"]');
    await starBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证收藏区域显示
    const starProjectsWrap = contentPage.locator('[data-testid="home-star-projects-wrap"]');
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
    const starBtnAfterUnstar = allProjectCard.locator('.operator div[title="收藏"]');
    await expect(starBtnAfterUnstar).toBeVisible({ timeout: 5000 });
  });

  test('点击删除项目图标,提示用户是否删除,确认后删除项目,在左下角出现撤回倒计时,在倒计时时间内允许用户撤回删除的项目', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    const homeBtn = await initTestEnv(topBarPage, contentPage, clearCache, reload);
    await loginAccount();
    const projectName = await createProjectAndGoHome(topBarPage, contentPage, createProject, homeBtn);
    // 定位项目卡片并点击删除图标
    const projectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(projectCard).toBeVisible({ timeout: 5000 });
    const deleteBtn = projectCard.locator('[data-testid="home-project-delete-btn"]');
    await deleteBtn.click();
    // 验证确认对话框弹出
    const confirmDialog = contentPage.locator('.el-message-box');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    // 点击确定按钮
    const deleteConfirmBtn = confirmDialog.locator('.el-button--primary');
    await deleteConfirmBtn.click();
    // 验证对话框关闭
    await expect(confirmDialog).toBeHidden({ timeout: 5000 });
    // 验证项目卡片从列表中消失
    await expect(projectCard).toBeHidden({ timeout: 5000 });
    // 验证撤回通知显示
    const undoNotification = contentPage.locator('.undo-notification');
    await expect(undoNotification).toBeVisible({ timeout: 5000 });
    // 点击撤回按钮
    const undoBtn = undoNotification.locator('.btn-undo');
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

  test('接口数量需要正确展示,folder节点不计入接口总数', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    const homeBtn = await initTestEnv(topBarPage, contentPage, clearCache, reload);
    await loginAccount();
    await createProjectAndGoHome(topBarPage, contentPage, createProject, homeBtn);
    // 进入项目工作区
    const projectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(projectCard).toBeVisible({ timeout: 5000 });
    const enterBtn = projectCard.locator('[data-testid="home-project-enter-btn"]');
    await enterBtn.click();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const bannerTree = contentPage.locator('[data-testid="banner-doc-tree"]');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });
    const addFolderBtn = contentPage.locator('[data-testid="banner-add-folder-btn"]').first();
    const addApiBtn = contentPage.locator('[data-testid="banner-add-http-btn"]').first();
    const addFolderDialog = contentPage.locator('[data-testid="add-folder-dialog"]');
    const addApiDialog = contentPage.locator('.el-dialog:has(.add-file-dialog__body)');
    const contextmenu = contentPage.locator('[data-testid="contextmenu"]');
    const ctxAddFolderItem = contentPage.locator('[data-testid="contextmenu-item-新建文件夹"], [data-testid="contextmenu-item-New Folder"]');
    const ctxAddApiItem = contentPage.locator('[data-testid="contextmenu-item-新建接口"], [data-testid="contextmenu-item-New Interface"]');
    const rootFolderAName = `A-${Date.now()}`;
    const rootFolderBName = `B-${Date.now()}`;
    const rootFolderCName = `C-${Date.now()}`;
    const folderA1Name = `A-1-${Date.now()}`;
    const folderA111Name = `A-1-1-${Date.now()}`;
    const rootHttpName = `HTTP-${Date.now()}`;
    const wsName = `WebSocket-${Date.now()}`;
    const httpMockName = `HTTPMock-${Date.now()}`;
    const wsMockName = `WebSocketMock-${Date.now()}`;
    await expect(addFolderBtn).toBeVisible({ timeout: 5000 });
    await addFolderBtn.click();
    await expect(addFolderDialog).toBeVisible({ timeout: 5000 });
    await addFolderDialog.locator('[data-testid="add-folder-name-input"] input').fill(rootFolderAName);
    await addFolderDialog.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog).toBeHidden({ timeout: 5000 });
    await expect(bannerTree).toContainText(rootFolderAName);
    await addFolderBtn.click();
    await expect(addFolderDialog).toBeVisible({ timeout: 5000 });
    await addFolderDialog.locator('[data-testid="add-folder-name-input"] input').fill(rootFolderBName);
    await addFolderDialog.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog).toBeHidden({ timeout: 5000 });
    await expect(bannerTree).toContainText(rootFolderBName);
    await addFolderBtn.click();
    await expect(addFolderDialog).toBeVisible({ timeout: 5000 });
    await addFolderDialog.locator('[data-testid="add-folder-name-input"] input').fill(rootFolderCName);
    await addFolderDialog.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog).toBeHidden({ timeout: 5000 });
    await expect(bannerTree).toContainText(rootFolderCName);
    const rootFolderARow = bannerTree.locator('.el-tree-node__content', { hasText: rootFolderAName }).first();
    await rootFolderARow.scrollIntoViewIfNeeded();
    await rootFolderARow.click({ button: 'right' });
    await expect(contextmenu).toBeVisible({ timeout: 5000 });
    await expect(ctxAddFolderItem).toBeVisible({ timeout: 5000 });
    await ctxAddFolderItem.click();
    await expect(addFolderDialog).toBeVisible({ timeout: 5000 });
    await addFolderDialog.locator('[data-testid="add-folder-name-input"] input').fill(folderA1Name);
    await addFolderDialog.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog).toBeHidden({ timeout: 5000 });
    await expect(bannerTree).toContainText(folderA1Name);
    await bannerTree.locator('.el-tree-node__content', { hasText: folderA1Name }).first().click({ button: 'right' });
    await expect(contextmenu).toBeVisible({ timeout: 5000 });
    await expect(ctxAddFolderItem).toBeVisible({ timeout: 5000 });
    await ctxAddFolderItem.click();
    await expect(addFolderDialog).toBeVisible({ timeout: 5000 });
    await addFolderDialog.locator('[data-testid="add-folder-name-input"] input').fill(folderA111Name);
    await addFolderDialog.locator('[data-testid="add-folder-confirm-btn"]').click();
    await expect(addFolderDialog).toBeHidden({ timeout: 5000 });
    await expect(bannerTree).toContainText(folderA111Name);
    await bannerTree.locator('.el-tree-node__content', { hasText: folderA1Name }).first().locator('.el-tree-node__expand-icon').click();
    await addApiBtn.click();
    await expect(addApiDialog).toBeVisible({ timeout: 5000 });
    await addApiDialog.locator('input').first().fill(rootHttpName);
    await addApiDialog.locator('.el-dialog__footer .el-button--primary').click();
    await expect(addApiDialog).toBeHidden({ timeout: 5000 });
    await bannerTree.locator('.el-tree-node__content', { hasText: rootFolderAName }).first().click({ button: 'right' });
    await expect(contextmenu).toBeVisible({ timeout: 5000 });
    await expect(ctxAddApiItem).toBeVisible({ timeout: 5000 });
    await ctxAddApiItem.click();
    await expect(addApiDialog).toBeVisible({ timeout: 5000 });
    await addApiDialog.locator('input').first().fill(wsName);
    await addApiDialog.locator('.el-radio').filter({ hasText: /^WebSocket$/ }).click();
    await addApiDialog.locator('.el-dialog__footer .el-button--primary').click();
    await expect(addApiDialog).toBeHidden({ timeout: 5000 });
    const folderA1Row = bannerTree.locator('.el-tree-node__content', { hasText: folderA1Name }).first();
    const folderA111Row = bannerTree.locator('.el-tree-node__content', { hasText: folderA111Name }).first();
    const folderA1RowVisible = await folderA1Row.isVisible({ timeout: 500 }).catch(() => false);
    if (!folderA1RowVisible) {
      await bannerTree.locator('.el-tree-node__content', { hasText: rootFolderAName }).first().locator('.el-tree-node__expand-icon').click();
    }
    const folderA111RowVisible = await folderA111Row.isVisible({ timeout: 500 }).catch(() => false);
    if (!folderA111RowVisible) {
      await folderA1Row.locator('.el-tree-node__expand-icon').click();
    }
    await folderA111Row.click({ button: 'right' });
    await expect(contextmenu).toBeVisible({ timeout: 5000 });
    await expect(ctxAddApiItem).toBeVisible({ timeout: 5000 });
    await ctxAddApiItem.click();
    await expect(addApiDialog).toBeVisible({ timeout: 5000 });
    await addApiDialog.locator('input').first().fill(httpMockName);
    await addApiDialog.locator('.el-radio').filter({ hasText: 'HTTP Mock' }).click();
    await addApiDialog.locator('.el-dialog__footer .el-button--primary').click();
    await expect(addApiDialog).toBeHidden({ timeout: 5000 });
    await bannerTree.locator('.el-tree-node__content', { hasText: rootFolderBName }).first().click({ button: 'right' });
    await expect(contextmenu).toBeVisible({ timeout: 5000 });
    await expect(ctxAddApiItem).toBeVisible({ timeout: 5000 });
    await ctxAddApiItem.click();
    await expect(addApiDialog).toBeVisible({ timeout: 5000 });
    await addApiDialog.locator('input').first().fill(wsMockName);
    await addApiDialog.locator('.el-radio').filter({ hasText: 'WebSocket Mock' }).click();
    await addApiDialog.locator('.el-dialog__footer .el-button--primary').click();
    await expect(addApiDialog).toBeHidden({ timeout: 5000 });
    // 返回首页查看接口总数
    const logo = topBarPage.locator('.logo-img');
    const projectListPromise = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
      { timeout: 20000 },
    );
    const urlPromise = contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    await logo.click();
    await Promise.all([projectListPromise, urlPromise]);
    await contentPage.waitForTimeout(500);
    // 验证接口总数为4(folder不计入)
    const projectCardAfterReturn = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(projectCardAfterReturn).toBeVisible({ timeout: 5000 });
    const docNumInfo = projectCardAfterReturn.locator('.project-api-count .teal');
    await expect(docNumInfo).toContainText('4');
  });
});







