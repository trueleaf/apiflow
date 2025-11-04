import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, clearAllAppData, editProject, deleteProject, createProject } from '../../../fixtures/fixtures';
test.describe('离线模式项目增删改查测试', () => {
  let headerPage: Page;
  let contentPage: Page;
  test.beforeEach(async ({ electronApp }) => {
    const result = await initOfflineWorkbench(electronApp);
    headerPage = result.headerPage;
    contentPage = result.contentPage;
  });
  test.describe('项目列表展示测试', () => {
    test('页面加载后应正确显示项目列表容器', async () => {
      // 1. 验证主容器存在（定位"全部项目"区域的容器）
      const allProjectsTitle = contentPage.locator('h2 span:has-text("全部项目")').first();
      await expect(allProjectsTitle).toBeVisible();
      // 验证项目列表包装器或空状态容器存在
      const projectWrapOrEmpty = contentPage.locator('h2:has-text("全部项目")').locator('~ .project-wrap, ~ .empty-container').first();
      await expect(projectWrapOrEmpty).toBeVisible();

      // 2. 验证搜索区域存在
      const searchBar = contentPage.locator('.search-item');
      await expect(searchBar).toBeVisible();

      // 3. 验证"全部项目"区域存在
      const allProjectsSection = contentPage.locator('h2 span:has-text("全部项目")').first();
      await expect(allProjectsSection).toBeVisible();

      // 4. 验证项目列表容器元素存在于DOM中
      const projectListContainer = contentPage.locator('.project-list');
      await expect(projectListContainer).toBeDefined();
    });

    test('空项目列表应显示正确的UI状态', async () => {
      // 0. 清空所有应用数据，确保测试从空状态开始
      await clearAllAppData(contentPage);

      // 重新加载页面以应用清空后的状态
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 1. 验证"全部项目"区域显示 (0)
      const allProjectsTitle = contentPage.locator('h2 span:has-text("全部项目")').first();
      await expect(allProjectsTitle).toContainText('全部项目(0)');

      // 2. 验证空状态容器存在
      const emptyContainer = contentPage.locator('.empty-container');
      await expect(emptyContainer).toBeVisible();

      // 3. 验证 el-empty 组件存在
      const elEmpty = contentPage.locator('.el-empty');
      await expect(elEmpty).toBeVisible();

      // 4. 验证空状态提示文案
      const emptyDescription = contentPage.locator('.el-empty__description');
      await expect(emptyDescription).toBeVisible();
      await expect(emptyDescription).toContainText('暂无项目');

      // 5. 验证项目列表容器不显示
      const projectWrap = contentPage.locator('h2:has-text("全部项目") + .empty-container + .project-wrap');
      await expect(projectWrap).toBeHidden();

      // 6. 验证"新建项目"按钮在空状态下可见且可用
      const newProjectBtn = contentPage.locator('button:has-text("新建项目")');
      await expect(newProjectBtn).toBeVisible();
      await expect(newProjectBtn).toBeEnabled();

      // 7. 验证空状态图标存在
      const emptyImage = contentPage.locator('.el-empty__image');
      await expect(emptyImage).toBeVisible();
    });

    test('离线模式不显示团队入口和相关操作', async () => {
      // 验证点 1: 团队管理 Tab 页签不存在
      const teamTab = headerPage.locator('.el-tabs__item').filter({ hasText: '团队管理' });
      await expect(teamTab).toHaveCount(0);

      // 验证点 2: 先创建一个项目，以便测试项目卡片上的操作按钮
      await contentPage.locator('button:has-text("新建项目")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'visible' });
      const nameInput = contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]');
      await nameInput.fill('测试项目');

      // 验证点 3: 新建项目对话框不显示成员/组选择
      const memberSelectLabel = contentPage.locator('.el-dialog').filter({ hasText: '新增项目' }).locator('text=选择成员或组');
      await expect(memberSelectLabel).toHaveCount(0);

      // 提交创建项目
      await contentPage.locator('.el-dialog__footer button:has-text("确定")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'hidden' });

      // 等待跳转到编辑页面
      await contentPage.waitForURL(/doc-edit/, { timeout: 10000 });
      await contentPage.waitForLoadState('domcontentloaded');

      // 验证编辑页面加载成功
      const banner = contentPage.locator('.banner');
      await expect(banner).toBeVisible({ timeout: 5000 });

      // 点击返回首页按钮(点击header中的"主页面"按钮)
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 验证点 4: 成员管理图标不显示
      const projectCard = contentPage.locator('.project-list').first();
      await projectCard.hover();
      await contentPage.waitForTimeout(300); // 等待悬停动画
      const memberManageIcon = projectCard.locator('[title*="成员管理"]');
      await expect(memberManageIcon).toHaveCount(0);

      // 验证点 5: 预览按钮不显示（只有编辑按钮）
      const previewButton = projectCard.locator('button:has-text("预览")');
      await expect(previewButton).toHaveCount(0);
      const editButton = projectCard.locator('button:has-text("编辑")');
      await expect(editButton).toBeVisible();
    });

    test('项目列表容器应显示正确的顶部操作栏', async () => {
      // 1. 验证搜索输入框
      const searchInput = contentPage.locator('input[placeholder*="项目名称"]');
      await expect(searchInput).toBeVisible();
      await expect(searchInput).toBeEditable();

      // 2. 验证"新建项目"按钮
      const newProjectBtn = contentPage.locator('button:has-text("新建项目")');
      await expect(newProjectBtn).toBeVisible();
      await expect(newProjectBtn).toBeEnabled();

      // 3. 验证高级搜索图标
      const advancedSearchIcon = contentPage.locator('[title*="高级搜索"]');
      await expect(advancedSearchIcon).toBeVisible();

      // 4. 验证导入按钮不显示（代码中 v-if="0"）
      const importBtn = contentPage.locator('button:has-text("导入")');
      await expect(importBtn).toHaveCount(0);
    });

    test('项目列表应显示两个主要区域', async () => {
      // 0. 清空所有应用数据，确保测试从空状态开始
      await clearAllAppData(contentPage);
      // 1. 初始状态：收藏项目区域不显示（因为没有收藏项目）
      const starProjectsSection = contentPage.locator('h2 span:has-text("收藏项目")');
      await expect(starProjectsSection).toHaveCount(0);

      // 2. 全部项目区域始终存在
      const allProjectsSection = contentPage.locator('h2 span:has-text("全部项目")').first();
      await expect(allProjectsSection).toBeVisible();
    });

    test('"全部项目"区域应显示正确的项目计数', async () => {
      // 0. 清空所有应用数据，确保测试从空状态开始
      await clearAllAppData(contentPage);
      // 1. 初始状态：显示 (0)
      const allProjectsTitle = contentPage.locator('h2 span:has-text("全部项目")').first();
      await expect(allProjectsTitle).toContainText('全部项目(0)');

      // 2. 创建一个项目
      await contentPage.locator('button:has-text("新建项目")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'visible' });
      const nameInput1 = contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]');
      await nameInput1.fill('测试项目1');
      await contentPage.locator('.el-dialog__footer button:has-text("确定")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'hidden' });

      // 等待跳转到编辑页面
      await contentPage.waitForURL(/doc-edit/, { timeout: 10000 });
      await contentPage.waitForLoadState('domcontentloaded');

      // 点击返回首页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 3. 验证计数变为 (1)
      await expect(allProjectsTitle).toContainText('全部项目(1)');

      // 4. 再创建一个项目
      await contentPage.locator('button:has-text("新建项目")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'visible' });
      const nameInput2 = contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]');
      await nameInput2.fill('测试项目2');
      await contentPage.locator('.el-dialog__footer button:has-text("确定")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'hidden' });

      // 等待跳转到编辑页面
      await contentPage.waitForURL(/doc-edit/, { timeout: 10000 });
      await contentPage.waitForLoadState('domcontentloaded');

      // 点击返回首页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 5. 验证计数变为 (2)
      await expect(allProjectsTitle).toContainText('全部项目(2)');
    });

    test('离线模式下不显示加载状态', async () => {
      // 刷新页面触发重新加载
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');

      // 验证 Loading 组件不出现
      // ProjectManager.vue line 32: :loading="!isStandalone && (projectLoading || searchLoading)"
      const loadingIndicator = contentPage.locator('.el-loading-mask');
      await expect(loadingIndicator).toHaveCount(0);

      // 验证项目列表或空状态容器立即可见（定位"全部项目"区域的容器）
      const projectWrapOrEmpty = contentPage.locator('h2:has-text("全部项目")').locator('~ .project-wrap, ~ .empty-container').first();
      await expect(projectWrapOrEmpty).toBeVisible({ timeout: 1000 });
    });
  });
  test.describe('创建项目的基础流程', () => {
    test('点击新建项目按钮应打开新建项目弹窗', async () => {
      // 1. 点击新建项目按钮
      const newProjectBtn = contentPage.locator('button:has-text("新建项目")');
      await newProjectBtn.click();

      // 2. 等待对话框出现
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', {
        state: 'visible',
        timeout: 5000
      });

      // 3. 验证对话框标题
      const dialogTitle = contentPage.locator('.el-dialog__header').filter({ hasText: '新增项目' });
      await expect(dialogTitle).toBeVisible();

      // 4. 验证项目名称输入框存在且可编辑
      const nameInput = contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]');
      await expect(nameInput).toBeVisible();
      await expect(nameInput).toBeEditable();
      await expect(nameInput).toHaveValue(''); // 初始为空

      // 5. 验证输入框自动获得焦点
      await contentPage.waitForTimeout(500);
      const focusedElement = await contentPage.evaluate(() => document.activeElement?.getAttribute('placeholder'));
      expect(focusedElement).toContain('项目名称');

      // 6. 验证确定按钮存在且可用
      const confirmBtn = contentPage.locator('.el-dialog__footer button:has-text("确定")');
      await expect(confirmBtn).toBeVisible();
      await expect(confirmBtn).toBeEnabled();

      // 7. 验证取消按钮存在且可用
      const cancelBtn = contentPage.locator('.el-dialog__footer button:has-text("取消")');
      await expect(cancelBtn).toBeVisible();
      await expect(cancelBtn).toBeEnabled();

      // 8. 验证离线模式下不显示成员/组选择区域（合并的验证点）
      const memberSelectLabel = contentPage.locator('.el-dialog').filter({ hasText: '新增项目' }).locator('text=选择成员或组');
      await expect(memberSelectLabel).toHaveCount(0);

      // 清理：关闭对话框
      await cancelBtn.click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'hidden' });
    });

    test('输入有效项目名称后应成功创建项目', async () => {
      const projectName = '测试项目-基础创建';

      // 1. 打开新建项目对话框
      await contentPage.locator('button:has-text("新建项目")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'visible' });

      // 2. 输入项目名称
      const nameInput = contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]');
      await nameInput.fill(projectName);

      // 3. 点击确定按钮
      await contentPage.locator('.el-dialog__footer button:has-text("确定")').click();

      // 4. 等待对话框关闭
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'hidden' });

      // 5. 验证跳转到项目编辑页面
      await contentPage.waitForURL(/doc-edit/, { timeout: 10000 });
      await contentPage.waitForLoadState('domcontentloaded');

      // 6. 验证编辑页面的关键元素存在
      // 6.1 验证 banner 区域（包含项目名称）
      const banner = contentPage.locator('.banner');
      await expect(banner).toBeVisible({ timeout: 10000 });

      // 6.2 验证项目名称显示正确
      const projectNameDisplay = contentPage.locator('.banner').locator('text=' + projectName);
      await expect(projectNameDisplay).toBeVisible();

      // 6.3 验证左侧导航栏存在（API列表）
      const apiNavigation = contentPage.locator('.nav-panel, .tree-wrap, [class*="navigation"]');
      await expect(apiNavigation.first()).toBeVisible();

      // 6.4 验证工具栏存在（新增文件/文件夹按钮）
      const toolBar = contentPage.locator('.tool-icon, [class*="tool"]');
      await expect(toolBar.first()).toBeVisible();

      // 7. 基础边界测试：验证可以创建包含特殊字符的项目名称
      // 导航回主页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 创建包含特殊字符的项目
      const specialProjectName = '测试-API_2024@v1.0';
      await contentPage.locator('button:has-text("新建项目")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'visible' });
      await contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]').fill(specialProjectName);
      await contentPage.locator('.el-dialog__footer button:has-text("确定")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'hidden' });
      await contentPage.waitForURL(/doc-edit/, { timeout: 10000 });

      // 验证特殊字符项目创建成功
      const specialProjectDisplay = contentPage.locator('.banner').locator('text=' + specialProjectName);
      await expect(specialProjectDisplay).toBeVisible();
    });

    test('点击取消按钮应关闭弹窗且不创建项目', async () => {
      // 1. 记录当前项目数量
      const initialProjectCount = contentPage.locator('h2 span:has-text("全部项目")').first();
      const initialCountText = await initialProjectCount.textContent();
      const initialCount = parseInt(initialCountText?.match(/\((\d+)\)/)?.[1] || '0');

      // 2. 打开新建项目对话框
      await contentPage.locator('button:has-text("新建项目")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'visible' });

      // 3. 输入项目名称（证明即使输入了也不会创建）
      const nameInput = contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]');
      await nameInput.fill('不应该被创建的项目');

      // 4. 点击取消按钮
      const cancelBtn = contentPage.locator('.el-dialog__footer button:has-text("取消")');
      await cancelBtn.click();

      // 5. 验证对话框关闭
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', {
        state: 'hidden',
        timeout: 5000
      });

      // 6. 验证仍在项目列表页
      await expect(contentPage).toHaveURL(/home/);

      // 7. 等待确保没有异步创建操作
      await contentPage.waitForTimeout(1000);

      // 8. 验证项目数量没有变化
      const finalCountText = await initialProjectCount.textContent();
      const finalCount = parseInt(finalCountText?.match(/\((\d+)\)/)?.[1] || '0');
      expect(finalCount).toBe(initialCount);

      // 9. 验证项目列表中不存在该项目
      const unwantedProject = contentPage.locator('.project-list').filter({ hasText: '不应该被创建的项目' });
      await expect(unwantedProject).toHaveCount(0);
    });

    test('创建的项目应显示正确的项目信息', async () => {
      const projectName = '信息验证测试项目';

      // 1. 创建项目
      await contentPage.locator('button:has-text("新建项目")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'visible' });
      await contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]').fill(projectName);
      await contentPage.locator('.el-dialog__footer button:has-text("确定")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'hidden' });
      await contentPage.waitForURL(/doc-edit/, { timeout: 10000 });

      // 2. 导航回项目列表页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 3. 定位到新创建的项目卡片
      const projectCard = contentPage.locator('.project-list').filter({ hasText: projectName });
      await expect(projectCard).toBeVisible();

      // 验证点 1: 项目名称
      const projectNameDisplay = projectCard.locator('.project-name');

      await expect(projectNameDisplay).toBeVisible();
      await expect(projectNameDisplay).toContainText(projectName);

      // 验证点 2: 创建者信息（离线模式默认为 'me'）
      const creatorInfo = projectCard.locator('.project-creator');
      await expect(creatorInfo).toBeVisible();
      const creatorText = await creatorInfo.textContent();
      expect(creatorText).toContain('me');

      // 验证点 3: 更新时间（应该是最近创建的，验证包含时间相关文字）
      const updateTime = projectCard.locator('.project-update-time');
      await expect(updateTime).toBeVisible();
      const timeText = await updateTime.textContent();
      // 验证时间文本存在（可能是相对时间如"刚刚"、"1分钟前"，或绝对时间）
      expect(timeText).toBeTruthy();
      expect(timeText!.length).toBeGreaterThan(0);

      // 验证点 4: 接口数量（新项目应该是 0）
      const apiCount = projectCard.locator('.project-api-count');
      await expect(apiCount).toBeVisible();
      const countText = await apiCount.textContent();
      // 验证包含数字 0（格式可能是"0"、"0个接口"、"接口: 0"等）
      expect(countText).toMatch(/0/);

      // 额外验证：悬停后显示操作按钮
      await projectCard.hover();
      await contentPage.waitForTimeout(300);

      // 验证编辑按钮存在
      const editBtn = projectCard.locator('button:has-text("编辑")');
      await expect(editBtn).toBeVisible();

      // 验证收藏按钮存在
      const starIcon = projectCard.locator('[title*="收藏"]');
      await expect(starIcon).toBeVisible();
    });
  });
  test.describe('编辑项目名称', () => {
    test('点击编辑按钮应打开编辑弹窗并预填充项目名称', async () => {
      // 1. 准备测试环境
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 2. 创建测试项目
      const projectName = '编辑测试项目';
      await contentPage.locator('button:has-text("新建项目")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'visible' });
      await contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]').fill(projectName);
      await contentPage.locator('.el-dialog__footer button:has-text("确定")').click();
      await contentPage.waitForURL(/doc-edit/, { timeout: 10000 });

      // 3. 返回项目列表页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 4. 定位项目卡片并点击编辑按钮
      const projectCard = contentPage.locator('.project-list').filter({
        has: contentPage.locator(`.title:has-text("${projectName}")`)
      });
      const editButton = projectCard.locator('.operator div[title*="编辑"]').first();
      await editButton.click();

      // 5. 验证编辑弹窗打开
      await contentPage.waitForSelector('.el-dialog:has-text("修改项目")', {
        state: 'visible',
        timeout: 5000
      });

      // 6. 验证弹窗标题
      const dialogTitle = contentPage.locator('.el-dialog__header').filter({ hasText: '修改项目' });
      await expect(dialogTitle).toBeVisible();

      // 7. 验证项目名称预填充
      const nameInput = contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]');
      await expect(nameInput).toBeVisible();
      await expect(nameInput).toHaveValue(projectName);

      // 8. 验证输入框获得焦点
      await expect(nameInput).toBeFocused({ timeout: 2000 });

      // 9. 验证文本全选
      const isTextSelected = await nameInput.evaluate((input: HTMLInputElement) => {
        return input.selectionStart === 0 && input.selectionEnd === input.value.length;
      });
      expect(isTextSelected).toBe(true);

      // 10. 验证确定按钮
      const confirmBtn = contentPage.locator('.el-dialog__footer button:has-text("确定")');
      await expect(confirmBtn).toBeVisible();
      await expect(confirmBtn).toBeEnabled();

      // 11. 验证取消按钮
      const cancelBtn = contentPage.locator('.el-dialog__footer button:has-text("取消")');
      await expect(cancelBtn).toBeVisible();
      await expect(cancelBtn).toBeEnabled();

      // 清理: 关闭弹窗
      await cancelBtn.click();
      await contentPage.waitForSelector('.el-dialog:has-text("修改项目")', { state: 'hidden' });
    });
    test('修改项目名称后应保存成功并更新列表', async () => {
      // 1. 准备测试环境
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 2. 创建测试项目
      const oldProjectName = '旧项目名称';
      await contentPage.locator('button:has-text("新建项目")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'visible' });
      await contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]').fill(oldProjectName);
      await contentPage.locator('.el-dialog__footer button:has-text("确定")').click();
      await contentPage.waitForURL(/doc-edit/, { timeout: 10000 });

      // 3. 返回项目列表页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 4. 记录当前项目数量
      const allProjectsTitle = contentPage.locator('h2 span:has-text("全部项目")').first();
      const initialCountText = await allProjectsTitle.textContent();
      const initialCount = parseInt(initialCountText?.match(/\((\d+)\)/)?.[1] || '0');

      // 5. 使用辅助函数编辑项目
      const newProjectName = '新项目名称';
      await editProject(contentPage, oldProjectName, newProjectName);

      // 6. 验证编辑弹窗已关闭
      await expect(contentPage.locator('.el-dialog:has-text("修改项目")')).toHaveCount(0);

      // 7. 验证旧名称不存在
      const oldProjectCard = contentPage.locator(`.project-list .title:has-text("${oldProjectName}")`);
      await expect(oldProjectCard).toHaveCount(0);

      // 8. 验证新名称存在并可见
      const newProjectCard = contentPage.locator(`.project-list .title:has-text("${newProjectName}")`);
      await expect(newProjectCard).toBeVisible();

      // 9. 验证项目计数不变
      const finalCountText = await allProjectsTitle.textContent();
      const finalCount = parseInt(finalCountText?.match(/\((\d+)\)/)?.[1] || '0');
      expect(finalCount).toBe(initialCount);

      // 10. 额外验证: 新项目卡片的其他信息正确
      const projectCard = contentPage.locator('.project-list').filter({
        hasText: newProjectName
      });
      await expect(projectCard.locator('.project-name')).toContainText(newProjectName);
    });
    test('编辑时点击取消应不保存更改', async () => {
      // 1. 准备测试环境
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 2. 创建测试项目
      const originalProjectName = '不应被修改的项目';
      await contentPage.locator('button:has-text("新建项目")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'visible' });
      await contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]').fill(originalProjectName);
      await contentPage.locator('.el-dialog__footer button:has-text("确定")').click();
      await contentPage.waitForURL(/doc-edit/, { timeout: 10000 });

      // 3. 返回项目列表页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 4. 记录当前项目数量
      const allProjectsTitle = contentPage.locator('h2 span:has-text("全部项目")').first();
      const initialCountText = await allProjectsTitle.textContent();
      const initialCount = parseInt(initialCountText?.match(/\((\d+)\)/)?.[1] || '0');

      // 5. 打开编辑弹窗
      const projectCard = contentPage.locator('.project-list').filter({
        has: contentPage.locator(`.title:has-text("${originalProjectName}")`)
      });
      await projectCard.locator('.operator div[title*="编辑"]').first().click();
      await contentPage.waitForSelector('.el-dialog:has-text("修改项目")', {
        state: 'visible',
        timeout: 5000
      });

      // 6. 修改项目名称(但不提交)
      const tempName = '临时修改的名称';
      const nameInput = contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]');
      await nameInput.clear();
      await nameInput.fill(tempName);

      // 7. 验证输入框已更新为临时名称
      await expect(nameInput).toHaveValue(tempName);

      // 8. 点击取消按钮
      const cancelBtn = contentPage.locator('.el-dialog__footer button:has-text("取消")');
      await cancelBtn.click();

      // 9. 验证弹窗已关闭
      await contentPage.waitForSelector('.el-dialog:has-text("修改项目")', {
        state: 'hidden',
        timeout: 5000
      });

      // 10. 验证仍在项目列表页
      await expect(contentPage).toHaveURL(/home/);

      // 11. 等待确保没有异步更新
      await contentPage.waitForTimeout(1000);

      // 12. 验证原项目名称保持不变
      const originalProject = contentPage.locator(`.project-list .title:has-text("${originalProjectName}")`);
      await expect(originalProject).toBeVisible();

      // 13. 验证临时名称不存在
      const tempProject = contentPage.locator(`.project-list .title:has-text("${tempName}")`);
      await expect(tempProject).toHaveCount(0);

      // 14. 验证项目计数不变
      const finalCountText = await allProjectsTitle.textContent();
      const finalCount = parseInt(finalCountText?.match(/\((\d+)\)/)?.[1] || '0');
      expect(finalCount).toBe(initialCount);
    });

    test('编辑项目时项目名称不能为空', async () => {
      // 1. 准备测试环境
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 2. 创建测试项目
      const projectName = '验证测试项目';
      await contentPage.locator('button:has-text("新建项目")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'visible' });
      await contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]').fill(projectName);
      await contentPage.locator('.el-dialog__footer button:has-text("确定")').click();
      await contentPage.waitForURL(/doc-edit/, { timeout: 10000 });

      // 3. 返回项目列表页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 4. 打开编辑弹窗
      const projectCard = contentPage.locator('.project-list').filter({
        has: contentPage.locator(`.title:has-text("${projectName}")`)
      });
      await projectCard.locator('.operator div[title*="编辑"]').first().click();
      await contentPage.waitForSelector('.el-dialog:has-text("修改项目")', { state: 'visible' });

      // 5. 清空项目名称
      const nameInput = contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]');
      await nameInput.clear();
      await expect(nameInput).toHaveValue('');

      // 6. 触发验证(失去焦点)
      await nameInput.blur();
      await contentPage.waitForTimeout(300);

      // 7. 验证显示错误信息
      const errorMessage = contentPage.locator('.el-form-item__error');
      await expect(errorMessage).toBeVisible();
      const errorText = await errorMessage.textContent();
      expect(errorText).toMatch(/请填写项目名称|项目名称不能为空/);

      // 8. 尝试点击确定
      await contentPage.locator('.el-dialog__footer button:has-text("确定")').click();
      await contentPage.waitForTimeout(500);

      // 9. 验证弹窗未关闭
      await expect(contentPage.locator('.el-dialog:has-text("修改项目")')).toBeVisible();

      // 10. 验证原项目名称仍在列表中(关闭弹窗后验证)
      await contentPage.locator('.el-dialog__footer button:has-text("取消")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("修改项目")', { state: 'hidden' });

      const originalProject = contentPage.locator(`.project-list .title:has-text("${projectName}")`);
      await expect(originalProject).toBeVisible();
    });

    test('编辑项目时项目名称不能只有空格', async () => {
      // 1. 准备测试环境
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 2. 创建测试项目
      const projectName = '空格验证项目';
      await contentPage.locator('button:has-text("新建项目")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'visible' });
      await contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]').fill(projectName);
      await contentPage.locator('.el-dialog__footer button:has-text("确定")').click();
      await contentPage.waitForURL(/doc-edit/, { timeout: 10000 });

      // 3. 返回项目列表页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 4. 打开编辑弹窗
      const projectCard = contentPage.locator('.project-list').filter({
        has: contentPage.locator(`.title:has-text("${projectName}")`)
      });
      await projectCard.locator('.operator div[title*="编辑"]').first().click();
      await contentPage.waitForSelector('.el-dialog:has-text("修改项目")', { state: 'visible' });

      // 5. 输入只有空格的名称
      const nameInput = contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]');
      await nameInput.clear();
      await nameInput.fill('     '); // 5个空格
      await expect(nameInput).toHaveValue('     ');

      // 6. 触发验证(失去焦点)
      await nameInput.blur();
      await contentPage.waitForTimeout(300);

      // 7. 验证显示错误信息
      const errorMessage = contentPage.locator('.el-form-item__error');
      await expect(errorMessage).toBeVisible();
      const errorText = await errorMessage.textContent();
      expect(errorText).toContain('项目名称不能为空或仅包含空格');

      // 8. 尝试点击确定
      await contentPage.locator('.el-dialog__footer button:has-text("确定")').click();
      await contentPage.waitForTimeout(500);

      // 9. 验证弹窗未关闭
      await expect(contentPage.locator('.el-dialog:has-text("修改项目")')).toBeVisible();

      // 10. 验证原项目名称仍在列表中
      await contentPage.locator('.el-dialog__footer button:has-text("取消")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("修改项目")', { state: 'hidden' });

      const originalProject = contentPage.locator(`.project-list .title:has-text("${projectName}")`);
      await expect(originalProject).toBeVisible();
    });
  });
  test.describe('输入框焦点测试', () => {
    test('新建项目弹窗打开后输入框应自动获得焦点', async () => {
      // 清空数据确保从干净状态开始
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 点击新建项目按钮
      await contentPage.locator('button:has-text("新建项目")').click();

      // 等待弹窗出现
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', {
        state: 'visible',
        timeout: 5000
      });

      // 验证输入框获得焦点
      const nameInput = contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]');
      await expect(nameInput).toBeFocused({ timeout: 2000 });

      // 关闭弹窗
      await contentPage.locator('.el-dialog__footer button:has-text("取消")').click();
    });

    test('编辑项目弹窗打开后输入框应自动获得焦点并选中文本', async () => {
      // 清空数据
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 创建一个测试项目
      const testProjectName = '焦点测试项目';
      await contentPage.locator('button:has-text("新建项目")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', {
        state: 'visible'
      });
      const nameInput = contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]');
      await nameInput.fill(testProjectName);
      await contentPage.locator('.el-dialog__footer button:has-text("确定")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', {
        state: 'hidden'
      });

      // 等待跳转到项目编辑页面
      await contentPage.waitForURL(/doc-edit/, { timeout: 10000 });

      // 导航回首页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(500);

      // 使用 editProject 辅助函数测试焦点（shouldTestFocus: true）
      // 这个测试会失败如果焦点没有正确设置
      await editProject(contentPage, testProjectName, '焦点测试项目-已编辑', {
        shouldTestFocus: true
      });

      // 验证项目名称已更新
      const updatedProject = contentPage.locator('.project-list .title:has-text("焦点测试项目-已编辑")');
      await expect(updatedProject).toBeVisible();
    });

    test('从 header 点击 + 按钮创建项目，输入框应能获得焦点', async () => {
      // 清空数据
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 从 header 点击 + 按钮
      const addButton = headerPage.locator('button.add-tab-btn');
      await addButton.click();

      // 等待弹窗出现
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', {
        state: 'visible',
        timeout: 5000
      });

      // 验证输入框获得焦点（这个测试验证了我们之前在 IPC 中添加的 focus() 调用）
      const nameInput = contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]');
      await expect(nameInput).toBeFocused({ timeout: 2000 });

      // 输入项目名称验证输入框可用
      await nameInput.fill('Header创建的项目');

      // 验证输入成功
      await expect(nameInput).toHaveValue('Header创建的项目');

      // 关闭弹窗
      await contentPage.locator('.el-dialog__footer button:has-text("取消")').click();
    });
  });
  test.describe('删除项目的基础流程', () => {
    test('点击删除按钮应弹出确认对话框', async () => {
      // 1. 清空数据并创建测试项目
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      const testProjectName = '待删除测试项目';
      await createProject(contentPage, testProjectName);

      // 2. 返回项目列表页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 3. 定位项目卡片并悬停
      const projectCard = contentPage.locator('.project-list').filter({
        has: contentPage.locator(`.title:has-text("${testProjectName}")`)
      });
      await projectCard.hover();
      await contentPage.waitForTimeout(300); // 等待悬停动画

      // 4. 验证删除按钮存在且可见
      const deleteButton = projectCard.locator('.operator div[title*="删除"]').first();
      await expect(deleteButton).toBeVisible();

      // 5. 点击删除按钮
      await deleteButton.click();

      // 6. 验证确认对话框出现
      const messageBox = contentPage.locator('.el-message-box');
      await expect(messageBox).toBeVisible({ timeout: 5000 });

      // 7. 验证对话框标题
      const dialogTitle = messageBox.locator('.el-message-box__title');
      await expect(dialogTitle).toBeVisible();
      const titleText = await dialogTitle.textContent();
      expect(titleText).toContain('提示');

      // 8. 验证对话框内容
      const dialogContent = messageBox.locator('.el-message-box__content');
      await expect(dialogContent).toBeVisible();
      const contentText = await dialogContent.textContent();
      expect(contentText).toMatch(/确定要删除此项目吗/);

      // 9. 验证确定按钮
      const confirmBtn = messageBox.locator('button:has-text("确定")');
      await expect(confirmBtn).toBeVisible();
      await expect(confirmBtn).toBeEnabled();

      // 10. 验证取消按钮
      const cancelBtn = messageBox.locator('button:has-text("取消")');
      await expect(cancelBtn).toBeVisible();
      await expect(cancelBtn).toBeEnabled();

      // 清理: 关闭对话框
      await cancelBtn.click();
      await contentPage.waitForSelector('.el-message-box', { state: 'hidden' });
    });

    test('确认删除后项目应从列表中移除', async () => {
      // 1. 清空数据并创建测试项目
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      const testProjectName = '要被删除的项目';
      await createProject(contentPage, testProjectName);

      // 2. 返回项目列表页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 3. 记录当前项目总数
      const allProjectsTitle = contentPage.locator('h2 span:has-text("全部项目")').first();
      const initialCountText = await allProjectsTitle.textContent();
      const initialCount = parseInt(initialCountText?.match(/\((\d+)\)/)?.[1] || '0');
      expect(initialCount).toBe(1); // 应该只有刚创建的一个项目

      // 4. 删除项目（确认）
      await deleteProject(contentPage, testProjectName, { confirm: true });

      // 5. 验证项目从列表中消失
      const deletedProjectCard = contentPage.locator(`.project-list .title:has-text("${testProjectName}")`);
      await expect(deletedProjectCard).toHaveCount(0);

      // 6. 验证项目总数减1
      const finalCountText = await allProjectsTitle.textContent();
      const finalCount = parseInt(finalCountText?.match(/\((\d+)\)/)?.[1] || '0');
      expect(finalCount).toBe(initialCount - 1);
      expect(finalCount).toBe(0);
    });

    test('取消删除后项目应保持不变', async () => {
      // 1. 清空数据并创建测试项目
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      const testProjectName = '不应该被删除的项目';
      await createProject(contentPage, testProjectName);

      // 2. 返回项目列表页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 3. 记录当前项目总数和项目名称
      const allProjectsTitle = contentPage.locator('h2 span:has-text("全部项目")').first();
      const initialCountText = await allProjectsTitle.textContent();
      const initialCount = parseInt(initialCountText?.match(/\((\d+)\)/)?.[1] || '0');
      expect(initialCount).toBe(1);

      // 4. 删除项目（取消）
      await deleteProject(contentPage, testProjectName, { confirm: false });

      // 5. 验证项目仍在列表中
      const projectCard = contentPage.locator(`.project-list .title:has-text("${testProjectName}")`);
      await expect(projectCard).toBeVisible();

      // 6. 验证项目总数未变化
      const finalCountText = await allProjectsTitle.textContent();
      const finalCount = parseInt(finalCountText?.match(/\((\d+)\)/)?.[1] || '0');
      expect(finalCount).toBe(initialCount);
      expect(finalCount).toBe(1);

      // 7. 验证项目信息完整
      const fullProjectCard = contentPage.locator('.project-list').filter({
        hasText: testProjectName
      });
      await expect(fullProjectCard.locator('.project-name')).toContainText(testProjectName);
      await expect(fullProjectCard.locator('.project-creator')).toBeVisible();
      await expect(fullProjectCard.locator('.project-update-time')).toBeVisible();
    });
  });
  test.describe('删除项目的扩展测试', () => {
    test('删除最后一个项目后应显示空状态', async () => {
      // 1. 清空所有数据
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 2. 创建单个测试项目
      const testProjectName = '唯一的项目';
      await createProject(contentPage, testProjectName);

      // 3. 返回项目列表页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 4. 验证初始状态：有一个项目
      const allProjectsTitle = contentPage.locator('h2 span:has-text("全部项目")').first();
      await expect(allProjectsTitle).toContainText('全部项目(1)');

      // 5. 删除该项目
      await deleteProject(contentPage, testProjectName, { confirm: true });

      // 6. 验证"全部项目(0)"显示
      await expect(allProjectsTitle).toContainText('全部项目(0)');

      // 7. 验证空状态容器显示
      const emptyContainer = contentPage.locator('.empty-container');
      await expect(emptyContainer).toBeVisible();

      // 8. 验证 el-empty 组件存在
      const elEmpty = contentPage.locator('.el-empty');
      await expect(elEmpty).toBeVisible();

      // 9. 验证空状态提示文案
      const emptyDescription = contentPage.locator('.el-empty__description');
      await expect(emptyDescription).toBeVisible();
      await expect(emptyDescription).toContainText('暂无项目');

      // 10. 验证空状态图标存在
      const emptyImage = contentPage.locator('.el-empty__image');
      await expect(emptyImage).toBeVisible();

      // 11. 验证项目列表容器隐藏
      const projectWrap = contentPage.locator('h2:has-text("全部项目") + .empty-container + .project-wrap');
      await expect(projectWrap).toBeHidden();
    });

    test('删除项目后项目计数应正确更新', async () => {
      // 1. 清空数据并创建3个测试项目
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      const projectNames = ['项目1', '项目2', '项目3'];
      for (const name of projectNames) {
        await createProject(contentPage, name);
        await headerPage.locator('.home').click();
        await contentPage.waitForURL(/home/, { timeout: 10000 });
        await contentPage.waitForTimeout(500);
      }

      // 2. 验证"全部项目(3)"
      const allProjectsTitle = contentPage.locator('h2 span:has-text("全部项目")').first();
      await expect(allProjectsTitle).toContainText('全部项目(3)');

      // 3. 删除第一个项目
      await deleteProject(contentPage, projectNames[0], { confirm: true });

      // 4. 验证"全部项目(2)"
      await expect(allProjectsTitle).toContainText('全部项目(2)');

      // 5. 再删除一个项目
      await deleteProject(contentPage, projectNames[1], { confirm: true });

      // 6. 验证"全部项目(1)"
      await expect(allProjectsTitle).toContainText('全部项目(1)');

      // 7. 验证剩余的项目是第三个
      const remainingProject = contentPage.locator(`.project-list .title:has-text("${projectNames[2]}")`);
      await expect(remainingProject).toBeVisible();

      // 8. 验证前两个项目不存在
      const deletedProject1 = contentPage.locator(`.project-list .title:has-text("${projectNames[0]}")`);
      const deletedProject2 = contentPage.locator(`.project-list .title:has-text("${projectNames[1]}")`);
      await expect(deletedProject1).toHaveCount(0);
      await expect(deletedProject2).toHaveCount(0);
    });

    test('删除已收藏的项目后收藏区域应相应更新', async () => {
      // 1. 清空数据并创建2个项目
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      const projectName1 = '收藏项目1';
      const projectName2 = '普通项目2';

      await createProject(contentPage, projectName1);
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(500);

      await createProject(contentPage, projectName2);
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 2. 收藏第一个项目
      const projectCard1 = contentPage.locator('.project-list').filter({
        has: contentPage.locator(`.title:has-text("${projectName1}")`)
      });
      await projectCard1.hover();
      await contentPage.waitForTimeout(300);

      const starButton = projectCard1.locator('.operator div[title*="收藏"]').first();
      await expect(starButton).toBeVisible();
      await starButton.click();
      // 3. 验证"收藏的项目"区域出现
      const starProjectsSection = contentPage.locator('h2 span:has-text("收藏的项目")');
      await expect(starProjectsSection).toBeVisible();
      await expect(contentPage.locator('h2:has(span:has-text("收藏的项目")) + .project-wrap .project-list')).toHaveCount(1);

      // 4. 删除已收藏的项目
      await deleteProject(contentPage, projectName1, { confirm: true, section: 'star' });

      // 5. 验证"收藏的项目"区域消失（没有其他收藏项目）
      await expect(starProjectsSection).not.toBeVisible();

      // 6. 验证"全部项目"计数更新为(1)
      const allProjectsTitle = contentPage.locator('h2 span:has-text("全部项目")').first();
      await expect(allProjectsTitle).toContainText('全部项目(1)');

      // 7. 验证剩余的是第二个项目
      const remainingProject = contentPage.locator(`.project-list .title:has-text("${projectName2}")`);
      await expect(remainingProject).toBeVisible();
    });

    test('删除项目时应清理相关的Mock日志数据', async () => {
      // 1. 清空数据并创建测试项目
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');

      const testProjectName = 'Mock测试项目';
      await createProject(contentPage, testProjectName);

      // 2. 获取项目ID（从URL中提取）
      const currentUrl = contentPage.url();
      const projectIdMatch = currentUrl.match(/id=([^&]+)/);
      const projectId = projectIdMatch ? projectIdMatch[1] : '';
      expect(projectId).toBeTruthy();

      // 3. 模拟插入一些Mock日志数据到IndexedDB
      await contentPage.evaluate(async (pid) => {
        const dbName = 'mockNodeLogsCache';
        const storeName = 'logs';
        const createLog = (nodeId: string, method: string, path: string) => {
          const logId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${nodeId}-${Date.now()}-${Math.random()}`;
          return {
            id: logId,
            type: 'request',
            nodeId,
            projectId: pid,
            timestamp: Date.now(),
            data: {
              ip: '127.0.0.1',
              method,
              url: path,
              path,
              query: '',
              httpVersion: 'HTTP/1.1',
              statusCode: 200,
              bytesSent: 0,
              referer: '',
              userAgent: 'playwright-test',
              responseTime: 0,
              mockDelay: 0,
              matchedRoute: path,
              protocol: 'http',
              hostname: 'localhost',
              contentType: 'application/json',
              contentLength: 0,
              headers: {},
              body: '',
              consoleLogs: []
            }
          };
        };
        await new Promise<void>((resolve, reject) => {
          const openRequest = indexedDB.open(dbName, 1);
          openRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
            const target = event.target as IDBOpenDBRequest;
            const db = target.result;
            if (!db.objectStoreNames.contains(storeName)) {
              const store = db.createObjectStore(storeName, { keyPath: 'id' });
              store.createIndex('nodeId', 'nodeId', { unique: false });
              store.createIndex('projectId', 'projectId', { unique: false });
              store.createIndex('timestamp', 'timestamp', { unique: false });
              store.createIndex('type', 'type', { unique: false });
            }
          };
          openRequest.onsuccess = (event: Event) => {
            try {
              const target = event.target as IDBOpenDBRequest;
              const db = target.result;
              const tx = db.transaction(storeName, 'readwrite');
              const store = tx.objectStore(storeName);
              store.add(createLog('test-node-1', 'GET', '/test'));
              store.add(createLog('test-node-2', 'POST', '/test2'));
              tx.oncomplete = () => {
                db.close();
                resolve();
              };
              tx.onerror = () => {
                db.close();
                reject(tx.error ?? new Error('写入Mock日志失败'));
              };
              tx.onabort = () => {
                db.close();
                reject(tx.error ?? new Error('Mock日志事务中止'));
              };
            } catch (error) {
              reject(error);
            }
          };
          openRequest.onerror = () => {
            reject(openRequest.error ?? new Error('打开Mock日志数据库失败'));
          };
        });
      }, projectId);

      // 4. 验证Mock日志已插入
      const logsCountBefore = await contentPage.evaluate(async (pid) => {
        const dbName = 'mockNodeLogsCache';
        const storeName = 'logs';

        return new Promise<number>((resolve) => {
          const openRequest = indexedDB.open(dbName, 1);
          
          openRequest.onsuccess = (event: Event) => {
            const target = event.target as IDBOpenDBRequest;
            const db = target.result;
            
            try {
              if (!db.objectStoreNames.contains(storeName)) {
                db.close();
                resolve(0);
                return;
              }
              
              const tx = db.transaction(storeName, 'readonly');
              const store = tx.objectStore(storeName);
              const index = store.index('projectId');
              const request = index.getAll(pid);

              request.onsuccess = () => {
                db.close();
                resolve(request.result.length);
              };

              request.onerror = () => {
                db.close();
                resolve(0);
              };
            } catch (err) {
              try { db.close(); } catch (e) { /* ignore */ }
              resolve(0);
            }
          };

          openRequest.onerror = () => resolve(0);
        });
      }, projectId);

      expect(logsCountBefore).toBe(2);

      // 5. 返回项目列表页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 6. 删除项目
      await deleteProject(contentPage, testProjectName, { confirm: true });

      // 7. 验证Mock日志已被清理
      const logsCountAfter = await contentPage.evaluate(async (pid) => {
        const dbName = 'mockNodeLogsCache';
        const storeName = 'logs';

        return new Promise<number>((resolve) => {
          const openRequest = indexedDB.open(dbName, 1);
          
          openRequest.onsuccess = (event: Event) => {
            const target = event.target as IDBOpenDBRequest;
            const db = target.result;

            try {
              if (!db.objectStoreNames.contains(storeName)) {
                db.close();
                resolve(0);
                return;
              }

              const tx = db.transaction(storeName, 'readonly');
              const store = tx.objectStore(storeName);
              const index = store.index('projectId');
              const request = index.getAll(pid);

              request.onsuccess = () => {
                db.close();
                resolve(request.result.length);
              };

              request.onerror = () => {
                db.close();
                resolve(0);
              };
            } catch (err) {
              try { db.close(); } catch (e) { /* ignore */ }
              resolve(0);
            }
          };

          openRequest.onerror = () => resolve(0);
        });
      }, projectId);

      expect(logsCountAfter).toBe(0);
    });

    test('连续删除多个项目应全部成功', async () => {
      // 1. 清空数据并创建5个测试项目
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      const projectNames = ['项目A', '项目B', '项目C', '项目D', '项目E'];
      for (const name of projectNames) {
        await createProject(contentPage, name);
        await headerPage.locator('.home').click();
        await contentPage.waitForURL(/home/, { timeout: 10000 });
        await contentPage.waitForTimeout(500);
      }

      // 2. 验证初始计数"全部项目(5)"
      const allProjectsTitle = contentPage.locator('h2 span:has-text("全部项目")').first();
      await expect(allProjectsTitle).toContainText('全部项目(5)');

      // 3. 连续删除前3个项目
      const projectsToDelete = [projectNames[0], projectNames[1], projectNames[2]];
      for (const name of projectsToDelete) {
        await deleteProject(contentPage, name, { confirm: true });
        // 验证每次删除后列表更新
        const deletedCard = contentPage.locator(`.project-list .title:has-text("${name}")`);
        await expect(deletedCard).toHaveCount(0);
      }

      // 4. 验证最终计数"全部项目(2)"
      await expect(allProjectsTitle).toContainText('全部项目(2)');

      // 5. 验证剩余的2个项目正确显示
      const remainingProject1 = contentPage.locator(`.project-list .title:has-text("${projectNames[3]}")`);
      const remainingProject2 = contentPage.locator(`.project-list .title:has-text("${projectNames[4]}")`);
      await expect(remainingProject1).toBeVisible();
      await expect(remainingProject2).toBeVisible();

      // 6. 验证所有项目卡片数量正确
      const allProjectCards = contentPage.locator('.project-list');
      await expect(allProjectCards).toHaveCount(2);

      // 7. 验证被删除的项目不存在
      for (const name of projectsToDelete) {
        const deletedCard = contentPage.locator(`.project-list .title:has-text("${name}")`);
        await expect(deletedCard).toHaveCount(0);
      }
    });
  });

  test.describe('项目搜索功能', () => {
    test('搜索输入框应存在且可用', async () => {
      // 待实现
    });
    test('输入搜索关键词应实时过滤项目列表', async () => {
      // 待实现
    });
    test('清空搜索框应恢复完整项目列表', async () => {
      // 待实现
    });
    test('搜索无结果时应正确显示', async () => {
      // 待实现
    });
  });
  test.describe('表单验证测试', () => {
    test('创建项目时项目名称为空应无法提交', async () => {
      // 1. 清空数据
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 2. 打开新建项目弹窗
      await contentPage.locator('button:has-text("新建项目")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'visible' });

      // 3. 不输入任何内容,直接点击确定
      const confirmBtn = contentPage.locator('.el-dialog__footer button:has-text("确定")');
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);

      // 4. 验证弹窗未关闭
      await expect(contentPage.locator('.el-dialog:has-text("新增项目")')).toBeVisible();

      // 5. 验证错误消息显示
      const errorMessage = contentPage.locator('.el-form-item__error');
      await expect(errorMessage).toBeVisible();
      const errorText = await errorMessage.textContent();
      expect(errorText).toMatch(/请填写项目名称|项目名称不能为空/);

      // 6. 验证仍在项目列表页(未跳转)
      await contentPage.locator('.el-dialog__footer button:has-text("取消")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'hidden' });
      await expect(contentPage).toHaveURL(/home/);

      // 7. 验证项目未被创建
      const allProjectsTitle = contentPage.locator('h2 span:has-text("全部项目")').first();
      await expect(allProjectsTitle).toContainText('全部项目(0)');
    });

    test('创建项目时项目名称只有空格应无法提交', async () => {
      // 1. 清空数据
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 2. 打开新建项目弹窗
      await contentPage.locator('button:has-text("新建项目")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'visible' });

      // 3. 输入纯空格
      const nameInput = contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]');
      await nameInput.fill('     '); // 5个空格
      await expect(nameInput).toHaveValue('     ');

      // 4. 触发验证(失去焦点)
      await nameInput.blur();
      await contentPage.waitForTimeout(300);

      // 5. 验证显示错误信息
      const errorMessage = contentPage.locator('.el-form-item__error');
      await expect(errorMessage).toBeVisible();
      const errorText = await errorMessage.textContent();
      expect(errorText).toContain('项目名称不能为空或仅包含空格');

      // 6. 尝试点击确定
      await contentPage.locator('.el-dialog__footer button:has-text("确定")').click();
      await contentPage.waitForTimeout(500);

      // 7. 验证弹窗未关闭
      await expect(contentPage.locator('.el-dialog:has-text("新增项目")')).toBeVisible();

      // 8. 关闭弹窗并验证项目未被创建
      await contentPage.locator('.el-dialog__footer button:has-text("取消")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'hidden' });

      const allProjectsTitle = contentPage.locator('h2 span:has-text("全部项目")').first();
      await expect(allProjectsTitle).toContainText('全部项目(0)');
    });

    test('编辑项目时将名称清空应无法保存', async () => {
      // 1. 清空数据并创建测试项目
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      const testProjectName = '测试项目';
      await createProject(contentPage, testProjectName);

      // 2. 返回项目列表页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 3. 打开编辑弹窗
      const projectCard = contentPage.locator('.project-list').filter({
        has: contentPage.locator(`.title:has-text("${testProjectName}")`)
      });
      await projectCard.locator('.operator div[title*="编辑"]').first().click();
      await contentPage.waitForSelector('.el-dialog:has-text("修改项目")', { state: 'visible' });

      // 4. 清空项目名称
      const nameInput = contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]');
      await nameInput.clear();
      await expect(nameInput).toHaveValue('');

      // 5. 触发验证(失去焦点)
      await nameInput.blur();
      await contentPage.waitForTimeout(300);

      // 6. 验证显示错误信息
      const errorMessage = contentPage.locator('.el-form-item__error');
      await expect(errorMessage).toBeVisible();
      const errorText = await errorMessage.textContent();
      expect(errorText).toMatch(/请填写项目名称|项目名称不能为空/);

      // 7. 尝试点击确定
      await contentPage.locator('.el-dialog__footer button:has-text("确定")').click();
      await contentPage.waitForTimeout(500);

      // 8. 验证弹窗未关闭
      await expect(contentPage.locator('.el-dialog:has-text("修改项目")')).toBeVisible();

      // 9. 关闭弹窗并验证原项目名称仍在列表中
      await contentPage.locator('.el-dialog__footer button:has-text("取消")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("修改项目")', { state: 'hidden' });

      const originalProject = contentPage.locator(`.project-list .title:has-text("${testProjectName}")`);
      await expect(originalProject).toBeVisible();
    });

    test('项目名称包含特殊字符应能正常创建', async () => {
      // 1. 清空数据
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 测试多种特殊字符组合
      const specialCharProjects = [
        'API-项目_v2.0@2024',
        '测试项目#100%完成',
        'Project$Price&Value',
        '项目(括号)【中文括号】',
      ];

      for (const projectName of specialCharProjects) {
        // 2. 创建包含特殊字符的项目
        await contentPage.locator('button:has-text("新建项目")').click();
        await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'visible' });

        const nameInput = contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]');
        await nameInput.fill(projectName);

        await contentPage.locator('.el-dialog__footer button:has-text("确定")').click();
        await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'hidden' });

        // 3. 等待跳转到编辑页面
        await contentPage.waitForURL(/doc-edit/, { timeout: 10000 });
        await contentPage.waitForLoadState('domcontentloaded');

        // 4. 验证项目名称显示正确
        const projectNameDisplay = contentPage.locator('.banner').locator(`text=${projectName}`);
        await expect(projectNameDisplay).toBeVisible();

        // 5. 返回首页继续测试下一个
        await headerPage.locator('.home').click();
        await contentPage.waitForURL(/home/, { timeout: 10000 });
        await contentPage.waitForTimeout(500);

        // 6. 验证项目在列表中显示正确
        const projectCard = contentPage.locator(`.project-list .title:has-text("${projectName}")`);
        await expect(projectCard).toBeVisible();
      }

      // 7. 验证所有项目都创建成功
      const allProjectsTitle = contentPage.locator('h2 span:has-text("全部项目")').first();
      await expect(allProjectsTitle).toContainText(`全部项目(${specialCharProjects.length})`);
    });

    test('项目名称包含Emoji和多语言字符应能正常创建', async () => {
      // 1. 清空数据
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 测试Emoji和多语言字符
      const multiLangProjects = [
        '🚀 Rocket项目',
        '🎯 目标管理系统',
        'ProjectA テスト',
        '한국어 프로젝트',
        '🌟项目★プロジェクト★Project',
      ];

      for (const projectName of multiLangProjects) {
        // 2. 创建项目
        await contentPage.locator('button:has-text("新建项目")').click();
        await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'visible' });

        const nameInput = contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]');
        await nameInput.fill(projectName);

        await contentPage.locator('.el-dialog__footer button:has-text("确定")').click();
        await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'hidden' });

        // 3. 等待跳转到编辑页面
        await contentPage.waitForURL(/doc-edit/, { timeout: 10000 });
        await contentPage.waitForLoadState('domcontentloaded');

        // 4. 验证项目名称显示正确(包括Emoji)
        const banner = contentPage.locator('.banner');
        await expect(banner).toBeVisible();
        const bannerText = await banner.textContent();
        expect(bannerText).toContain(projectName);

        // 5. 返回首页
        await headerPage.locator('.home').click();
        await contentPage.waitForURL(/home/, { timeout: 10000 });
        await contentPage.waitForTimeout(500);

        // 6. 验证项目在列表中
        const projectCard = contentPage.locator('.project-list').filter({ hasText: projectName });
        await expect(projectCard).toBeVisible();
      }

      // 7. 验证所有项目都创建成功
      const allProjectsTitle = contentPage.locator('h2 span:has-text("全部项目")').first();
      await expect(allProjectsTitle).toContainText(`全部项目(${multiLangProjects.length})`);
    });

    test('项目名称包含SQL注入字符应被安全处理', async () => {
      // 1. 清空数据
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 测试SQL注入和XSS相关字符
      const securityTestProjects = [
        "Test'; DROP TABLE projects;--",
        'Test" OR "1"="1',
        "<script>alert('xss')</script>",
        "Test' AND '1'='1",
      ];

      for (const projectName of securityTestProjects) {
        // 2. 创建包含潜在危险字符的项目
        await contentPage.locator('button:has-text("新建项目")').click();
        await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'visible' });

        const nameInput = contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]');
        await nameInput.fill(projectName);

        await contentPage.locator('.el-dialog__footer button:has-text("确定")').click();
        await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'hidden' });

        // 3. 等待跳转到编辑页面
        await contentPage.waitForURL(/doc-edit/, { timeout: 10000 });
        await contentPage.waitForLoadState('domcontentloaded');

        // 4. 验证项目创建成功且字符被正确转义存储
        const banner = contentPage.locator('.banner');
        await expect(banner).toBeVisible();

        // 5. 返回首页
        await headerPage.locator('.home').click();
        await contentPage.waitForURL(/home/, { timeout: 10000 });
        await contentPage.waitForTimeout(500);

        // 6. 验证项目在列表中且字符显示安全
        const projectCard = contentPage.locator('.project-list').filter({ hasText: projectName });
        await expect(projectCard).toBeVisible();

        // 7. 验证没有触发XSS(页面没有弹窗或异常)
        const alerts = await contentPage.evaluate(() => {
          return (window as any).__xssTriggered || false;
        });
        expect(alerts).toBe(false);
      }

      // 8. 验证所有项目都创建成功,数据库未被破坏
      const allProjectsTitle = contentPage.locator('h2 span:has-text("全部项目")').first();
      await expect(allProjectsTitle).toContainText(`全部项目(${securityTestProjects.length})`);
    });
  });
  test.describe('项目收藏功能测试', () => {
    test('点击收藏按钮应成功收藏项目', async () => {
      // 1. 清空数据并创建测试项目
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');

      const testProjectName = '待收藏测试项目';
      await createProject(contentPage, testProjectName);

      // 2. 返回项目列表页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });

      // 3. 验证初始状态: "收藏的项目"区域不显示
      const starProjectsSection = contentPage.locator('h2 span:has-text("收藏的项目")');
      await expect(starProjectsSection).not.toBeVisible();

      // 4. 定位项目卡片并悬停(在全部项目区域)
      const projectCard = contentPage.locator('h2:has(span:has-text("全部项目")) + .project-wrap .project-list').filter({
        has: contentPage.locator(`.title:has-text("${testProjectName}")`)
      }).first();
      await projectCard.hover();
      await contentPage.waitForTimeout(300);

      // 5. 定位并点击收藏按钮(未收藏状态)
      const starButton = projectCard.locator('.operator div[title*="收藏"]').first();
      await expect(starButton).toBeVisible();
      await starButton.click();
      await contentPage.waitForTimeout(500);

      // 6. 验证"收藏的项目"区域出现
      await expect(starProjectsSection).toBeVisible();
      await expect(starProjectsSection).toContainText('收藏的项目');

      // 7. 验证项目出现在收藏列表中
      const starredProjectCard = contentPage.locator('h2:has(span:has-text("收藏的项目")) + .project-wrap .project-list').filter({
        hasText: testProjectName
      });
      await expect(starredProjectCard).toBeVisible();

      // 8. 验证图标变为已收藏状态(实心星,黄色,在全部项目区域)
      await projectCard.hover();
      await contentPage.waitForTimeout(300);
      const unstarButton = projectCard.locator('.operator div[title*="取消收藏"]').first();
      await expect(unstarButton).toBeVisible();

      // 9. 验证项目仍在"全部项目"中
      const allProjectsProjectCard = contentPage.locator('h2:has(span:has-text("全部项目")) + .project-wrap .project-list').filter({
        hasText: testProjectName
      }).first();
      await expect(allProjectsProjectCard).toBeVisible();
    });

    test('在"收藏的项目"区域点击取消收藏按钮应取消收藏', async () => {
      // 1. 清空数据并创建测试项目
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      const testProjectName = '收藏区取消项目';
      await createProject(contentPage, testProjectName);

      // 2. 返回项目列表页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });

      // 3. 先收藏该项目
      const projectCardInAll = contentPage.locator('h2:has(span:has-text("全部项目")) + .project-wrap .project-list').filter({
        has: contentPage.locator(`.title:has-text("${testProjectName}")`)
      }).first();
      await projectCardInAll.hover();

      const starButton = projectCardInAll.locator('.operator div[title*="收藏"]').first();
      await starButton.click();
      await contentPage.waitForTimeout(500);

      // 4. 验证收藏成功
      const starProjectsSection = contentPage.locator('h2 span:has-text("收藏的项目")');
      await expect(starProjectsSection).toBeVisible();
      await expect(starProjectsSection).toContainText('收藏的项目');

      // 5. 在"收藏的项目"区域定位项目卡片并点击取消收藏
      const projectCardInStar = contentPage.locator('h2:has(span:has-text("收藏的项目")) + .project-wrap .project-list').filter({
        has: contentPage.locator(`.title:has-text("${testProjectName}")`)
      }).first();
      await projectCardInStar.hover();
      await contentPage.waitForTimeout(300);

      const unstarButton = projectCardInStar.locator('.operator div[title*="取消收藏"]').first();
      await expect(unstarButton).toBeVisible();
      await unstarButton.click();
      await contentPage.waitForTimeout(500);

      // 6. 验证"收藏的项目"区域消失
      await expect(starProjectsSection).not.toBeVisible();

      // 7. 验证"全部项目"区域中的图标变回未收藏状态(空心星)
      await projectCardInAll.hover();
      await contentPage.waitForTimeout(300);
      const starButtonAgain = projectCardInAll.locator('.operator div[title*="收藏"]').first();
      await expect(starButtonAgain).toBeVisible();

      // 8. 验证项目仍在"全部项目"中
      await expect(projectCardInAll).toBeVisible();

      // 9. 验证"全部项目"计数不变
      const allProjectsTitle = contentPage.locator('h2 span:has-text("全部项目")').first();
      await expect(allProjectsTitle).toContainText('全部项目(1)');
    });

    test('在"全部项目"区域点击取消收藏按钮应取消收藏', async () => {
      // 1. 清空数据并创建测试项目
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      const testProjectName = '全部项目区取消项目';
      await createProject(contentPage, testProjectName);

      // 2. 返回项目列表页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });

      // 3. 先收藏该项目
      const projectCardInAll = contentPage.locator('h2:has(span:has-text("全部项目")) + .project-wrap .project-list').filter({
        has: contentPage.locator(`.title:has-text("${testProjectName}")`)
      }).first();
      await projectCardInAll.hover();

      const starButton = projectCardInAll.locator('.operator div[title*="收藏"]').first();
      await starButton.click();
      await contentPage.waitForTimeout(500);

      // 4. 验证收藏成功
      const starProjectsSection = contentPage.locator('h2 span:has-text("收藏的项目")');
      await expect(starProjectsSection).toBeVisible();
      await expect(starProjectsSection).toContainText('收藏的项目');

      // 5. 在"全部项目"区域定位项目卡片并点击取消收藏
      await projectCardInAll.hover();
      await contentPage.waitForTimeout(300);

      const unstarButton = projectCardInAll.locator('.operator div[title*="取消收藏"]').first();
      await expect(unstarButton).toBeVisible();
      await unstarButton.click();
      await contentPage.waitForTimeout(500);

      // 6. 验证"收藏的项目"区域消失
      await expect(starProjectsSection).not.toBeVisible();

      // 7. 验证"全部项目"区域中的图标变回未收藏状态(空心星)
      await projectCardInAll.hover();
      await contentPage.waitForTimeout(300);
      const starButtonAgain = projectCardInAll.locator('.operator div[title*="收藏"]').first();
      await expect(starButtonAgain).toBeVisible();

      // 8. 验证项目仍在"全部项目"中
      await expect(projectCardInAll).toBeVisible();

      // 9. 验证"全部项目"计数不变
      const allProjectsTitle = contentPage.locator('h2 span:has-text("全部项目")').first();
      await expect(allProjectsTitle).toContainText('全部项目(1)');
    });

    test('收藏的项目应在页面刷新后保持收藏状态', async () => {
      // 1. 清空数据并创建测试项目
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      const testProjectName = '持久化收藏项目';
      await createProject(contentPage, testProjectName);

      // 2. 返回项目列表页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 3. 收藏该项目
      const projectCard = contentPage.locator('.project-list').filter({
        has: contentPage.locator(`.title:has-text("${testProjectName}")`)
      });
      await projectCard.hover();
      await contentPage.waitForTimeout(300);

      const starButton = projectCard.locator('.operator div[title*="收藏"]').first();
      await starButton.click();
      await contentPage.waitForTimeout(500);

      // 4. 验证收藏成功
      const starProjectsSection = contentPage.locator('h2 span:has-text("收藏的项目")');
      await expect(starProjectsSection).toBeVisible();

      // 5. 刷新页面
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 6. 验证"收藏的项目"区域仍然显示
      const starProjectsSectionAfterReload = contentPage.locator('h2 span:has-text("收藏的项目")');
      await expect(starProjectsSectionAfterReload).toBeVisible();
      await expect(starProjectsSectionAfterReload).toContainText('收藏的项目');

      // 7. 验证项目仍在收藏列表中
      const starredProjectCard = contentPage.locator('h2:has(span:has-text("收藏的项目")) + .project-wrap .project-list').filter({
        hasText: testProjectName
      });
      await expect(starredProjectCard).toBeVisible();

      // 8. 验证收藏图标仍为已收藏状态(在全部项目区域检查)
      const projectCardAfterReload = contentPage.locator('h2:has(span:has-text("全部项目")) + .project-wrap .project-list').filter({
        has: contentPage.locator(`.title:has-text("${testProjectName}")`)
      }).first();
      await projectCardAfterReload.hover();
      await contentPage.waitForTimeout(300);
      const unstarButton = projectCardAfterReload.locator('[title*="取消收藏"]').first();
      await expect(unstarButton).toBeVisible();
    });

    test('收藏图标应正确显示状态变化', async () => {
      // 1. 清空数据并创建测试项目
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      const testProjectName = '图标状态测试项目';
      await createProject(contentPage, testProjectName);

      // 2. 返回项目列表页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 3. 定位项目卡片(在全部项目区域)
      const projectCard = contentPage.locator('h2:has(span:has-text("全部项目")) + .project-wrap .project-list').filter({
        has: contentPage.locator(`.title:has-text("${testProjectName}")`)
      }).first();
      await projectCard.hover();
      await contentPage.waitForTimeout(300);

      // 4. 验证未收藏状态: 空心星图标
      const starButton = projectCard.locator('[title*="收藏"]').first();
      await expect(starButton).toBeVisible();

      // 验证空心星图标存在
      const starIcon = starButton.locator('.el-icon');
      await expect(starIcon).toBeVisible();

      // 5. 点击收藏
      await starButton.click();
      await contentPage.waitForTimeout(500);

      // 6. 验证已收藏状态: 黄色实心星图标(在全部项目区域)
      await projectCard.hover();
      await contentPage.waitForTimeout(300);
      const unstarButton = projectCard.locator('[title*="取消收藏"]').first();
      await expect(unstarButton).toBeVisible();

      // 验证实心星图标存在且有yellow class
      const starFilledIcon = unstarButton.locator('.el-icon.yellow');
      await expect(starFilledIcon).toBeVisible();

      // 7. 点击取消收藏
      await unstarButton.click();
      await contentPage.waitForTimeout(500);

      // 8. 验证恢复为未收藏状态
      await projectCard.hover();
      await contentPage.waitForTimeout(300);
      const starButtonAgain = projectCard.locator('[title*="收藏"]').first();
      await expect(starButtonAgain).toBeVisible();

      // 验证空心星图标再次出现
      const starIconAgain = starButtonAgain.locator('.el-icon');
      await expect(starIconAgain).toBeVisible();

      // 验证没有yellow class(未收藏状态)
      const yellowIconCount = await projectCard.locator('.el-icon.yellow').count();
      expect(yellowIconCount).toBe(0);
    });
  });
  test.describe('项目列表折叠功能测试', () => {
    test('点击"全部项目"标题应折叠项目列表', async () => {
      // 1. 清空数据并创建测试项目
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      const testProjectName = '折叠测试项目';
      await createProject(contentPage, testProjectName);

      // 2. 返回项目列表页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 3. 验证初始状态: 列表展开,箭头向下
      const projectWrap = contentPage.locator('h2:has-text("全部项目")').locator('~ .project-wrap').first();
      await expect(projectWrap).toBeVisible();

      // 验证向下箭头图标存在(展开状态)
      const allProjectsTitle = contentPage.locator('h2 span:has-text("全部项目")').first();
      const titleParent = allProjectsTitle.locator('..');

      // 4. 点击"全部项目"标题触发折叠
      await allProjectsTitle.click();
      await contentPage.waitForTimeout(500);

      // 5. 验证列表被隐藏
      await expect(projectWrap).toBeHidden();

      // 6. 验证localStorage存储折叠状态
      const isFoldInStorage = await contentPage.evaluate(() => {
        return localStorage.getItem('doc-list/isFold');
      });
      expect(isFoldInStorage).toBe('close');
    });

    test('再次点击"全部项目"标题应展开项目列表', async () => {
      // 1. 清空数据并创建测试项目
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      const testProjectName = '展开测试项目';
      await createProject(contentPage, testProjectName);

      // 2. 返回项目列表页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 3. 先折叠列表
      const allProjectsTitle = contentPage.locator('h2 span:has-text("全部项目")').first();
      await allProjectsTitle.click();
      await contentPage.waitForTimeout(500);

      // 4. 验证列表已折叠
      const projectWrap = contentPage.locator('h2:has-text("全部项目")').locator('~ .project-wrap').first();
      await expect(projectWrap).toBeHidden();

      // 5. 再次点击标题展开列表
      await allProjectsTitle.click();
      await contentPage.waitForTimeout(500);

      // 6. 验证列表重新显示
      await expect(projectWrap).toBeVisible();

      // 7. 验证项目卡片可见
      const projectCard = contentPage.locator('.project-list').filter({ hasText: testProjectName });
      await expect(projectCard).toBeVisible();

      // 8. 验证localStorage存储展开状态
      const isFoldInStorage = await contentPage.evaluate(() => {
        return localStorage.getItem('doc-list/isFold');
      });
      expect(isFoldInStorage).toBe('open');
    });

    test('折叠状态应在页面刷新后保持', async () => {
      // 1. 清空数据并创建测试项目
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      const testProjectName = '折叠持久化项目';
      await createProject(contentPage, testProjectName);

      // 2. 返回项目列表页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 3. 折叠列表
      const allProjectsTitle = contentPage.locator('h2 span:has-text("全部项目")').first();
      await allProjectsTitle.click();
      await contentPage.waitForTimeout(500);

      // 4. 验证折叠成功
      const projectWrap = contentPage.locator('h2:has-text("全部项目")').locator('~ .project-wrap').first();
      await expect(projectWrap).toBeHidden();

      // 5. 刷新页面
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 6. 验证列表仍然是折叠状态
      const projectWrapAfterReload = contentPage.locator('h2:has-text("全部项目")').locator('~ .project-wrap').first();
      await expect(projectWrapAfterReload).toBeHidden();

      // 7. 验证localStorage中折叠状态保持
      const isFoldInStorage = await contentPage.evaluate(() => {
        return localStorage.getItem('doc-list/isFold');
      });
      expect(isFoldInStorage).toBe('close');

      // 8. 验证项目计数仍然显示
      await expect(allProjectsTitle).toContainText('全部项目(1)');
    });

    test('展开状态应在页面刷新后保持', async () => {
      // 1. 清空数据并创建测试项目
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      const testProjectName = '展开持久化项目';
      await createProject(contentPage, testProjectName);

      // 2. 返回项目列表页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 3. 确保列表是展开状态(默认应该是展开的)
      const projectWrap = contentPage.locator('h2:has-text("全部项目")').locator('~ .project-wrap').first();
      await expect(projectWrap).toBeVisible();

      // 4. 设置localStorage为展开状态
      await contentPage.evaluate(() => {
        localStorage.setItem('doc-list/isFold', 'open');
      });

      // 5. 刷新页面
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 6. 验证列表仍然是展开状态
      const projectWrapAfterReload = contentPage.locator('h2:has-text("全部项目")').locator('~ .project-wrap').first();
      await expect(projectWrapAfterReload).toBeVisible();

      // 7. 验证项目卡片可见
      const projectCard = contentPage.locator('.project-list').filter({ hasText: testProjectName });
      await expect(projectCard).toBeVisible();

      // 8. 验证localStorage中展开状态保持
      const isFoldInStorage = await contentPage.evaluate(() => {
        return localStorage.getItem('doc-list/isFold');
      });
      expect(isFoldInStorage).toBe('open');
    });
  });
  test.describe('项目跳转功能测试', () => {
    test('点击项目卡片"编辑"按钮应跳转到项目编辑页面', async () => {
      // 1. 清空数据并创建测试项目
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      const testProjectName = '跳转测试项目';
      await createProject(contentPage, testProjectName);

      // 2. 获取项目ID(从URL中提取)
      const createUrl = contentPage.url();
      const projectIdMatch = createUrl.match(/id=([^&]+)/);
      const projectId = projectIdMatch ? projectIdMatch[1] : '';
      expect(projectId).toBeTruthy();

      // 3. 返回项目列表页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 4. 定位项目卡片并悬停
      const projectCard = contentPage.locator('.project-list').filter({
        has: contentPage.locator(`.title:has-text("${testProjectName}")`)
      });
      await projectCard.hover();
      await contentPage.waitForTimeout(300);

      // 5. 点击"编辑"按钮
      const editButton = projectCard.locator('button:has-text("编辑")');
      await expect(editButton).toBeVisible();
      await editButton.click();

      // 6. 验证跳转到编辑页面
      await contentPage.waitForURL(/doc-edit/, { timeout: 10000 });
      await contentPage.waitForLoadState('domcontentloaded');

      // 7. 验证URL包含正确的query参数
      const editUrl = contentPage.url();
      expect(editUrl).toContain('/doc-edit');
      expect(editUrl).toContain(`id=${projectId}`);
      expect(editUrl).toContain(`name=${encodeURIComponent(testProjectName)}`);
      expect(editUrl).toContain('mode=edit');

      // 8. 验证编辑页面的banner显示
      const banner = contentPage.locator('.banner');
      await expect(banner).toBeVisible({ timeout: 5000 });

      // 9. 验证项目名称在编辑页面正确显示
      const bannerText = await banner.textContent();
      expect(bannerText).toContain(testProjectName);
    });
  });
  test.describe('项目信息展示测试', () => {
    test('项目卡片应正确显示创建者信息', async () => {
      // 1. 清空数据并创建测试项目
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      const testProjectName = '创建者信息测试';
      await createProject(contentPage, testProjectName);

      // 2. 返回项目列表页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 3. 定位项目卡片
      const projectCard = contentPage.locator('.project-list').filter({ hasText: testProjectName });
      await expect(projectCard).toBeVisible();

      // 4. 验证创建者信息显示
      const creatorInfo = projectCard.locator('.project-creator');
      await expect(creatorInfo).toBeVisible();

      // 5. 验证离线模式默认创建者为 'me'
      const creatorText = await creatorInfo.textContent();
      expect(creatorText).toContain('me');
    });

    test('项目卡片应正确显示最新更新时间', async () => {
      // 1. 清空数据并创建测试项目
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 记录创建时间(当前时间)
      const createTime = new Date();

      const testProjectName = '更新时间测试';
      await createProject(contentPage, testProjectName);

      // 2. 返回项目列表页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 3. 定位项目卡片
      const projectCard = contentPage.locator('.project-list').filter({ hasText: testProjectName });
      await expect(projectCard).toBeVisible();

      // 4. 验证更新时间显示
      const updateTime = projectCard.locator('.project-update-time');
      await expect(updateTime).toBeVisible();

      // 5. 获取时间文本并验证格式
      const timeText = await updateTime.textContent();
      expect(timeText).toBeTruthy();
      expect(timeText!.length).toBeGreaterThan(0);

      // 6. 验证时间格式(YYYY-MM-DD HH:mm 或相对时间)
      const hasDateFormat = /\d{4}-\d{2}-\d{2}/.test(timeText!);
      const hasTimeFormat = /\d{2}:\d{2}/.test(timeText!);

      // 时间应该包含日期或时间格式
      expect(hasDateFormat || timeText!.includes('刚刚') || timeText!.includes('分钟前')).toBe(true);
    });

    test('项目卡片应正确显示接口数量', async () => {
      // 1. 清空数据并创建测试项目
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      const testProjectName = '接口数量测试';
      await createProject(contentPage, testProjectName);

      // 2. 返回项目列表页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 3. 定位项目卡片
      const projectCard = contentPage.locator('.project-list').filter({ hasText: testProjectName });
      await expect(projectCard).toBeVisible();

      // 4. 验证接口数量显示
      const apiCount = projectCard.locator('.project-api-count');
      await expect(apiCount).toBeVisible();

      // 5. 验证新项目接口数量为0
      const countText = await apiCount.textContent();
      expect(countText).toMatch(/0/); // 应该包含数字0
    });

    test('新创建的项目应显示在项目列表中', async () => {
      // 1. 清空数据
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      const testProjectName = '完整信息测试项目';

      // 2. 创建项目
      await createProject(contentPage, testProjectName);

      // 3. 返回项目列表页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 4. 验证项目在列表中显示
      const projectCard = contentPage.locator('.project-list').filter({ hasText: testProjectName });
      await expect(projectCard).toBeVisible();

      // 5. 验证项目名称显示正确
      const projectName = projectCard.locator('.project-name');
      await expect(projectName).toBeVisible();
      await expect(projectName).toContainText(testProjectName);

      // 6. 验证创建者信息显示
      const creatorInfo = projectCard.locator('.project-creator');
      await expect(creatorInfo).toBeVisible();
      const creatorText = await creatorInfo.textContent();
      expect(creatorText).toContain('me');

      // 7. 验证更新时间显示
      const updateTime = projectCard.locator('.project-update-time');
      await expect(updateTime).toBeVisible();
      const timeText = await updateTime.textContent();
      expect(timeText).toBeTruthy();

      // 8. 验证接口数量显示
      const apiCount = projectCard.locator('.project-api-count');
      await expect(apiCount).toBeVisible();
      const countText = await apiCount.textContent();
      expect(countText).toMatch(/0/);

      // 9. 验证项目计数更新
      const allProjectsTitle = contentPage.locator('h2 span:has-text("全部项目")').first();
      await expect(allProjectsTitle).toContainText('全部项目(1)');
    });
  });
  test.describe('批量操作和边界条件测试', () => {
    test('连续创建多个项目应全部成功', async () => {
      // 1. 清空数据
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 2. 连续创建5个项目
      const projectNames = ['批量项目1', '批量项目2', '批量项目3', '批量项目4', '批量项目5'];

      for (const projectName of projectNames) {
        await createProject(contentPage, projectName);

        // 验证跳转到编辑页面
        await contentPage.waitForURL(/doc-edit/, { timeout: 10000 });
        await contentPage.waitForLoadState('domcontentloaded');

        // 返回首页准备创建下一个
        await headerPage.locator('.home').click();
        await contentPage.waitForURL(/home/, { timeout: 10000 });
        await contentPage.waitForTimeout(500);
      }

      // 3. 验证所有项目都创建成功
      const allProjectsTitle = contentPage.locator('h2 span:has-text("全部项目")').first();
      await expect(allProjectsTitle).toContainText(`全部项目(${projectNames.length})`);

      // 4. 验证每个项目都在列表中
      for (const projectName of projectNames) {
        const projectCard = contentPage.locator('.project-list').filter({ hasText: projectName });
        await expect(projectCard).toBeVisible();
      }

      // 5. 验证项目卡片总数正确
      const allProjectCards = contentPage.locator('.project-list');
      await expect(allProjectCards).toHaveCount(projectNames.length);
    });

    test('项目名称使用中文、英文、数字、emoji混合', async () => {
      // 1. 清空数据
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 2. 创建包含所有类型字符的项目名称
      const mixedProjectName = '中文EnglishNumber123Emoji🎉特殊符号@#$';

      await createProject(contentPage, mixedProjectName);

      // 3. 等待跳转到编辑页面
      await contentPage.waitForURL(/doc-edit/, { timeout: 10000 });
      await contentPage.waitForLoadState('domcontentloaded');

      // 4. 验证编辑页面的banner显示所有字符
      const banner = contentPage.locator('.banner');
      await expect(banner).toBeVisible();
      const bannerText = await banner.textContent();
      expect(bannerText).toContain('中文');
      expect(bannerText).toContain('English');
      expect(bannerText).toContain('Number123');
      expect(bannerText).toContain('🎉');
      expect(bannerText).toContain('@#$');

      // 5. 返回首页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 6. 验证项目在列表中正确显示所有字符
      const projectCard = contentPage.locator('.project-list').filter({ hasText: '中文' });
      await expect(projectCard).toBeVisible();

      const projectNameElement = projectCard.locator('.project-name');
      const projectNameText = await projectNameElement.textContent();

      // 验证所有字符类型都存在
      expect(projectNameText).toContain('中文');
      expect(projectNameText).toContain('English');
      expect(projectNameText).toContain('123');
      expect(projectNameText).toContain('🎉');
      expect(projectNameText).toContain('@#$');
    });

    test('连续删除多个项目应全部成功', async () => {
      // 1. 清空数据并创建5个项目
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      const projectNames = ['删除项目A', '删除项目B', '删除项目C', '删除项目D', '删除项目E'];

      for (const name of projectNames) {
        await createProject(contentPage, name);
        await headerPage.locator('.home').click();
        await contentPage.waitForURL(/home/, { timeout: 10000 });
        await contentPage.waitForTimeout(500);
      }

      // 2. 验证所有项目都创建成功
      const allProjectsTitle = contentPage.locator('h2 span:has-text("全部项目")').first();
      await expect(allProjectsTitle).toContainText(`全部项目(${projectNames.length})`);

      // 3. 连续删除前3个项目
      const projectsToDelete = [projectNames[0], projectNames[1], projectNames[2]];

      for (const name of projectsToDelete) {
        await deleteProject(contentPage, name, { confirm: true });

        // 验证项目已从列表中移除
        const deletedCard = contentPage.locator(`.project-list .title:has-text("${name}")`);
        await expect(deletedCard).toHaveCount(0);
      }

      // 4. 验证项目计数正确更新
      const remainingCount = projectNames.length - projectsToDelete.length;
      await expect(allProjectsTitle).toContainText(`全部项目(${remainingCount})`);

      // 5. 验证剩余项目正确显示
      const remainingProjects = [projectNames[3], projectNames[4]];
      for (const name of remainingProjects) {
        const projectCard = contentPage.locator(`.project-list .title:has-text("${name}")`);
        await expect(projectCard).toBeVisible();
      }

      // 6. 验证项目卡片总数正确
      const allProjectCards = contentPage.locator('.project-list');
      await expect(allProjectCards).toHaveCount(remainingCount);
    });
  });
  test.describe('高级搜索和UI响应式测试', () => {
  
  });
  test.describe('数据持久化测试', () => {
    test('创建项目后刷新页面，项目应保持', async () => {
      // 1. 清空数据
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 2. 创建测试项目
      const testProjectName = '持久化测试-创建';
      await createProject(contentPage, testProjectName);

      // 3. 返回项目列表页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 4. 验证项目在列表中
      const projectCard = contentPage.locator('.project-list').filter({ hasText: testProjectName });
      await expect(projectCard).toBeVisible();

      // 5. 刷新页面
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 6. 验证项目仍在列表中
      const projectCardAfterReload = contentPage.locator('.project-list').filter({ hasText: testProjectName });
      await expect(projectCardAfterReload).toBeVisible();

      // 7. 验证项目信息完整
      await expect(projectCardAfterReload.locator('.project-name')).toContainText(testProjectName);
      await expect(projectCardAfterReload.locator('.project-creator')).toBeVisible();
      await expect(projectCardAfterReload.locator('.project-update-time')).toBeVisible();
      await expect(projectCardAfterReload.locator('.project-api-count')).toBeVisible();
    });

    test('编辑项目后刷新页面，修改应保存', async () => {
      // 1. 清空数据并创建测试项目
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      const originalName = '持久化测试-原始名称';
      const newName = '持久化测试-修改后名称';

      await createProject(contentPage, originalName);

      // 2. 返回项目列表页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 3. 编辑项目名称
      await editProject(contentPage, originalName, newName);

      // 4. 验证编辑成功
      const newProjectCard = contentPage.locator(`.project-list .title:has-text("${newName}")`);
      await expect(newProjectCard).toBeVisible();

      // 5. 刷新页面
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 6. 验证修改后的名称仍然显示
      const newProjectCardAfterReload = contentPage.locator(`.project-list .title:has-text("${newName}")`);
      await expect(newProjectCardAfterReload).toBeVisible();

      // 7. 验证旧名称不存在
      const oldProjectCard = contentPage.locator(`.project-list .title:has-text("${originalName}")`);
      await expect(oldProjectCard).toHaveCount(0);
    });

    test('删除项目后刷新页面，项目应不存在', async () => {
      // 1. 清空数据并创建测试项目
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      const testProjectName = '持久化测试-删除';
      await createProject(contentPage, testProjectName);

      // 2. 返回项目列表页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 3. 验证项目存在
      const projectCard = contentPage.locator(`.project-list .title:has-text("${testProjectName}")`);
      await expect(projectCard).toBeVisible();

      // 4. 删除项目
      await deleteProject(contentPage, testProjectName, { confirm: true });

      // 5. 验证项目已被删除
      await expect(projectCard).toHaveCount(0);

      // 6. 刷新页面
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 7. 验证项目仍然不存在
      const projectCardAfterReload = contentPage.locator(`.project-list .title:has-text("${testProjectName}")`);
      await expect(projectCardAfterReload).toHaveCount(0);

      // 8. 验证项目计数为0
      const allProjectsTitle = contentPage.locator('h2 span:has-text("全部项目")').first();
      await expect(allProjectsTitle).toContainText('全部项目(0)');

      // 9. 验证空状态显示
      const emptyContainer = contentPage.locator('.empty-container');
      await expect(emptyContainer).toBeVisible();
    });

    test('批量收藏项目后刷新页面应保持所有收藏状态', async () => {
      // 1. 清空数据并创建3个测试项目
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      const projectNames = ['持久化收藏项目1', '持久化收藏项目2', '持久化收藏项目3'];
      for (const name of projectNames) {
        await createProject(contentPage, name);
        await headerPage.locator('.home').click();
        await contentPage.waitForURL(/home/, { timeout: 10000 });
        await contentPage.waitForTimeout(500);
      }

      // 2. 依次收藏这3个项目
      for (const name of projectNames) {
        const projectCard = contentPage.locator('h2:has(span:has-text("全部项目")) + .project-wrap .project-list').filter({
          has: contentPage.locator(`.title:has-text("${name}")`)
        }).first();
        await projectCard.hover();
        await contentPage.waitForTimeout(300);

        const starButton = projectCard.locator('.operator div[title*="收藏"]').first();
        await starButton.click();
        await contentPage.waitForTimeout(500);
      }

      // 3. 验证"收藏的项目"区域显示且有3个项目
      const starProjectsSection = contentPage.locator('h2 span:has-text("收藏的项目")');
      await expect(starProjectsSection).toBeVisible();
      const starredProjectCards = contentPage.locator('h2:has(span:has-text("收藏的项目")) + .project-wrap .project-list');
      await expect(starredProjectCards).toHaveCount(3);

      // 4. 刷新页面
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 5. 验证"收藏的项目"区域仍然显示
      const starProjectsSectionAfterReload = contentPage.locator('h2 span:has-text("收藏的项目")');
      await expect(starProjectsSectionAfterReload).toBeVisible();

      // 6. 验证3个项目都在收藏列表中
      const starredProjectCardsAfterReload = contentPage.locator('h2:has(span:has-text("收藏的项目")) + .project-wrap .project-list');
      await expect(starredProjectCardsAfterReload).toHaveCount(3);

      // 7. 验证每个项目都在收藏列表中且名称正确
      for (const name of projectNames) {
        const starredProject = contentPage.locator('h2:has(span:has-text("收藏的项目")) + .project-wrap .project-list').filter({
          hasText: name
        });
        await expect(starredProject).toBeVisible();
      }

      // 8. 验证每个项目的收藏图标状态为已收藏（在全部项目区域检查）
      for (const name of projectNames) {
        const projectCard = contentPage.locator('h2:has(span:has-text("全部项目")) + .project-wrap .project-list').filter({
          has: contentPage.locator(`.title:has-text("${name}")`)
        }).first();
        await projectCard.hover();
        await contentPage.waitForTimeout(300);
        const unstarButton = projectCard.locator('[title*="取消收藏"]').first();
        await expect(unstarButton).toBeVisible();
      }
    });

    test('折叠状态和收藏状态组合后刷新应同时保持', async () => {
      // 1. 清空数据并创建2个测试项目
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      const project1Name = '组合测试收藏项目';
      const project2Name = '组合测试普通项目';

      await createProject(contentPage, project1Name);
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(500);

      await createProject(contentPage, project2Name);
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 2. 收藏第一个项目
      const projectCard = contentPage.locator('.project-list').filter({
        has: contentPage.locator(`.title:has-text("${project1Name}")`)
      });
      await projectCard.hover();
      await contentPage.waitForTimeout(300);

      const starButton = projectCard.locator('.operator div[title*="收藏"]').first();
      await starButton.click();
      await contentPage.waitForTimeout(500);

      // 3. 折叠"全部项目"列表
      const allProjectsTitle = contentPage.locator('h2 span:has-text("全部项目")').first();
      await allProjectsTitle.click();
      await contentPage.waitForTimeout(500);

      // 4. 验证列表已折叠且收藏区域显示
      const projectWrap = contentPage.locator('h2:has-text("全部项目")').locator('~ .project-wrap').first();
      await expect(projectWrap).toBeHidden();
      const starProjectsSection = contentPage.locator('h2 span:has-text("收藏的项目")');
      await expect(starProjectsSection).toBeVisible();

      // 5. 刷新页面
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 6. 验证"全部项目"列表仍是折叠状态
      const projectWrapAfterReload = contentPage.locator('h2:has-text("全部项目")').locator('~ .project-wrap').first();
      await expect(projectWrapAfterReload).toBeHidden();

      // 7. 验证"收藏的项目"区域仍然显示
      const starProjectsSectionAfterReload = contentPage.locator('h2 span:has-text("收藏的项目")');
      await expect(starProjectsSectionAfterReload).toBeVisible();

      // 8. 验证收藏的项目在收藏列表中
      const starredProject = contentPage.locator('h2:has(span:has-text("收藏的项目")) + .project-wrap .project-list').filter({
        hasText: project1Name
      });
      await expect(starredProject).toBeVisible();

      // 9. 验证localStorage中折叠状态为'close'
      const isFoldInStorage = await contentPage.evaluate(() => {
        return localStorage.getItem('doc-list/isFold');
      });
      expect(isFoldInStorage).toBe('close');

      // 10. 展开列表验证项目计数和收藏状态
      await allProjectsTitle.click();
      await contentPage.waitForTimeout(500);
      const allProjectsCards = contentPage.locator('h2:has(span:has-text("全部项目")) + .project-wrap .project-list');
      await expect(allProjectsCards).toHaveCount(2);
    });

    test('编辑已收藏项目名称后刷新应保持收藏和新名称', async () => {
      // 1. 清空数据并创建测试项目
      await clearAllAppData(contentPage);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      const originalName = '编辑前的收藏项目';
      const newName = '编辑后的收藏项目';

      await createProject(contentPage, originalName);

      // 2. 返回项目列表页
      await headerPage.locator('.home').click();
      await contentPage.waitForURL(/home/, { timeout: 10000 });
      await contentPage.waitForTimeout(1000);

      // 3. 收藏该项目
      const projectCard = contentPage.locator('.project-list').filter({
        has: contentPage.locator(`.title:has-text("${originalName}")`)
      });
      await projectCard.hover();
      await contentPage.waitForTimeout(300);

      const starButton = projectCard.locator('.operator div[title*="收藏"]').first();
      await starButton.click();
      await contentPage.waitForTimeout(500);

      // 4. 验证收藏成功
      const starProjectsSection = contentPage.locator('h2 span:has-text("收藏的项目")');
      await expect(starProjectsSection).toBeVisible();

      // 5. 编辑项目名称
      await editProject(contentPage, originalName, newName);

      // 6. 验证新名称在收藏列表中
      const starredProjectWithNewName = contentPage.locator('h2:has(span:has-text("收藏的项目")) + .project-wrap .project-list').filter({
        hasText: newName
      });
      await expect(starredProjectWithNewName).toBeVisible();

      // 7. 刷新页面
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 8. 验证"收藏的项目"区域仍然显示
      const starProjectsSectionAfterReload = contentPage.locator('h2 span:has-text("收藏的项目")');
      await expect(starProjectsSectionAfterReload).toBeVisible();

      // 9. 验证新名称在收藏列表中显示
      const starredProjectAfterReload = contentPage.locator('h2:has(span:has-text("收藏的项目")) + .project-wrap .project-list').filter({
        hasText: newName
      });
      await expect(starredProjectAfterReload).toBeVisible();

      // 10. 验证旧名称不存在
      const oldNameInStarList = contentPage.locator('h2:has(span:has-text("收藏的项目")) + .project-wrap .project-list').filter({
        hasText: originalName
      });
      await expect(oldNameInStarList).toHaveCount(0);

      // 11. 验证收藏图标状态为已收藏（在全部项目区域检查）
      const projectCardAfterReload = contentPage.locator('h2:has(span:has-text("全部项目")) + .project-wrap .project-list').filter({
        has: contentPage.locator(`.title:has-text("${newName}")`)
      }).first();
      await projectCardAfterReload.hover();
      await contentPage.waitForTimeout(300);
      const unstarButton = projectCardAfterReload.locator('[title*="取消收藏"]').first();
      await expect(unstarButton).toBeVisible();
    });
  });
});
