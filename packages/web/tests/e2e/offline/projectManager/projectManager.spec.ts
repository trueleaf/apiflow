import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, clearAllAppData } from '../../../fixtures/fixtures';
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

      // 5. 验证确定按钮存在且可用
      const confirmBtn = contentPage.locator('.el-dialog__footer button:has-text("确定")');
      await expect(confirmBtn).toBeVisible();
      await expect(confirmBtn).toBeEnabled();

      // 6. 验证取消按钮存在且可用
      const cancelBtn = contentPage.locator('.el-dialog__footer button:has-text("取消")');
      await expect(cancelBtn).toBeVisible();
      await expect(cancelBtn).toBeEnabled();

      // 7. 验证离线模式下不显示成员/组选择区域（合并的验证点）
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
      const projectNameDisplay = projectCard.locator('.project-info-name, .name, [class*="name"]').filter({ hasText: projectName });
      await expect(projectNameDisplay).toBeVisible();
      await expect(projectNameDisplay).toContainText(projectName);

      // 验证点 2: 创建者信息（离线模式默认为 'me'）
      const creatorInfo = projectCard.locator('.creator, .owner, [class*="creator"], [class*="owner"]');
      await expect(creatorInfo).toBeVisible();
      const creatorText = await creatorInfo.textContent();
      expect(creatorText).toContain('me');

      // 验证点 3: 更新时间（应该是最近创建的，验证包含时间相关文字）
      const updateTime = projectCard.locator('.time, .date, [class*="time"], [class*="update"]');
      await expect(updateTime).toBeVisible();
      const timeText = await updateTime.textContent();
      // 验证时间文本存在（可能是相对时间如"刚刚"、"1分钟前"，或绝对时间）
      expect(timeText).toBeTruthy();
      expect(timeText!.length).toBeGreaterThan(0);

      // 验证点 4: 接口数量（新项目应该是 0）
      const apiCount = projectCard.locator('.count, .api-count, [class*="count"]');
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
    });
    test('修改项目名称后应保存成功并更新列表', async () => {
     
    });
    test('编辑时点击取消应不保存更改', async () => {
    
    });
  });
  test.describe('删除项目的基础流程', () => {
    test('点击删除按钮应弹出确认对话框', async () => {
      // 待实现
    });
    test('确认删除后项目应从列表中移除', async () => {
      // 待实现
    });
    test('取消删除后项目应保持不变', async () => {
      // 待实现
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
      // 待实现
    });
    test('创建项目时项目名称只有空格应无法提交', async () => {
      // 待实现
    });
    test('编辑项目时将名称清空应无法保存', async () => {
      // 待实现
    });
    test('项目名称包含特殊字符应能正常创建', async () => {
      // 待实现
    });
  });
  test.describe('项目收藏功能测试', () => {
    test('点击收藏按钮应成功收藏项目', async () => {
      // 待实现
    });
    test('点击取消收藏按钮应取消收藏', async () => {
      // 待实现
    });
    test('收藏的项目应在页面刷新后保持收藏状态', async () => {
      // 待实现
    });
    test('收藏图标应正确显示状态变化', async () => {
      // 待实现
    });
  });
  test.describe('项目列表折叠功能测试', () => {
    test('点击"全部项目"标题应折叠项目列表', async () => {
      // 待实现
    });
    test('再次点击"全部项目"标题应展开项目列表', async () => {
      // 待实现
    });
    test('折叠状态应在页面刷新后保持', async () => {
      // 待实现
    });
    test('展开状态应在页面刷新后保持', async () => {
      // 待实现
    });
  });
  test.describe('项目跳转功能测试', () => {
    test('点击项目卡片"编辑"按钮应跳转到项目编辑页面', async () => {
      // 待实现
    });
  });
  test.describe('项目信息展示测试', () => {
    test('项目卡片应正确显示创建者信息', async () => {
      // 待实现
    });
    test('项目卡片应正确显示最新更新时间', async () => {
      // 待实现
    });
    test('项目卡片应正确显示接口数量', async () => {
      // 待实现
    });
    test('新创建的项目应显示在项目列表中', async () => {
      // 待实现
    });
  });
  test.describe('批量操作和边界条件测试', () => {
    test('连续创建多个项目应全部成功', async () => {
      // 待实现
    });
    test('项目名称使用中文、英文、数字、emoji混合', async () => {
      // 待实现
    });
    test('连续删除多个项目应全部成功', async () => {
      // 待实现
    });
  });
  test.describe('高级搜索和UI响应式测试', () => {
    test('点击高级搜索图标应展开高级搜索区域', async () => {
      // 待实现
    });
    test('再次点击高级搜索图标应收起高级搜索区域', async () => {
      // 待实现
    });
    test('悬停项目卡片时操作按钮应正确显示', async () => {
      // 待实现
    });
  });
  test.describe('数据持久化测试', () => {
    test('创建项目后刷新页面，项目应保持', async () => {
      // 待实现
    });
    test('编辑项目后刷新页面，修改应保存', async () => {
      // 待实现
    });
    test('删除项目后刷新页面，项目应不存在', async () => {
      // 待实现
    });
  });
});
