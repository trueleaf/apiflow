import { expect, type ElectronApplication, type Page } from '@playwright/test';
import { test } from '../../../fixtures/enhanced-electron-fixtures';

type HeaderAndContentPages = {
  headerPage: Page;
  contentPage: Page;
};

const HEADER_URL_HINTS = ['header.html', '/header'];

// 判断是否为header页面
const isHeaderUrl = (url: string): boolean => {
  if (!url) {
    return false;
  }
  return HEADER_URL_HINTS.some((hint) => url.includes(hint));
};

// 解析获取header和content两个页面
const resolveHeaderAndContentPages = async (
  electronApp: ElectronApplication,
  timeout = 10000
): Promise<HeaderAndContentPages> => {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const windows = electronApp.windows();
    let headerPage: Page | undefined;
    let contentPage: Page | undefined;
    windows.forEach((page) => {
      const url = page.url();
      if (isHeaderUrl(url)) {
        headerPage = page;
        return;
      }
      if (url && url !== 'about:blank') {
        contentPage = page;
      }
    });
    if (headerPage && contentPage) {
      return { headerPage, contentPage };
    }
    try {
      await electronApp.waitForEvent('window', {
        timeout: 500,
        predicate: (page) => {
          const url = page.url();
          return isHeaderUrl(url) || (!!url && url !== 'about:blank');
        }
      });
    } catch {
      // 忽略短暂超时，继续轮询
    }
  }
  throw new Error('未能定位 header 与 content 页面');
};

test.describe('离线模式项目增删改查测试', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const pages = await resolveHeaderAndContentPages(electronApp);
    headerPage = pages.headerPage;
    contentPage = pages.contentPage;
    
    await Promise.all([
      headerPage.waitForLoadState('domcontentloaded'),
      contentPage.waitForLoadState('domcontentloaded')
    ]);

    // 先设置离线模式，再清空数据和设置lastVisitePage
    await contentPage.evaluate(() => {
      localStorage.setItem('runtime/networkMode', 'offline');
      localStorage.setItem('history/lastVisitePage', '/v1/apidoc/doc-list');
    });

    await headerPage.evaluate(() => {
      localStorage.clear();
    });

    // 导航到项目列表页面，而不是刷新
    await contentPage.evaluate(() => {
      window.location.hash = '#/v1/apidoc/doc-list';
    });
    
    // 等待导航完成
    await contentPage.waitForURL(/doc-list/, { timeout: 5000 });
    await contentPage.waitForLoadState('domcontentloaded');
    await contentPage.waitForTimeout(1000); // 等待IndexedDB初始化
  });

  test.describe('P0: 项目列表展示测试', () => {
    test('页面加载后应正确显示项目列表容器', async () => {
      await contentPage.waitForTimeout(1000);
      // 验证页面URL
      await expect(contentPage).toHaveURL(/doc-list/);

      // 验证项目列表容器存在
      const docListContainer = contentPage.locator('.doc-list');
      await expect(docListContainer).toBeVisible();

      // 验证页面标题
      await expect(contentPage.locator('text=项目列表')).toBeVisible();
      
      // 验证新建项目按钮存在
      await expect(contentPage.locator('button:has-text("新建项目")')).toBeVisible();
    });

    test('空项目列表应显示正确的UI状态', async () => {
      // 等待加载完成
      await contentPage.waitForTimeout(1000);

      // 验证没有项目卡片或有空状态提示
      const projectCards = contentPage.locator('.project-item, .project-card');
      const count = await projectCards.count();
      
      // 空列表时应该没有项目卡片
      expect(count).toBe(0);
    });
  });

  test.describe('P0: 创建项目的基础流程', () => {
    test('点击新建项目按钮应打开新建项目弹窗', async () => {
      // 点击新建项目按钮
      const addButton = contentPage.locator('button:has-text("新建项目")');
      await addButton.click();

      // 验证弹窗出现
      const dialog = contentPage.locator('.el-dialog:has-text("新增项目")');
      await expect(dialog).toBeVisible({ timeout: 5000 });

      // 验证弹窗标题
      await expect(contentPage.locator('.el-dialog__header:has-text("新增项目")')).toBeVisible();

      // 验证项目名称输入框
      const nameInput = contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]');
      await expect(nameInput).toBeVisible();

      // 验证确定和取消按钮
      await expect(contentPage.locator('.el-dialog__footer button:has-text("确定")')).toBeVisible();
      await expect(contentPage.locator('.el-dialog__footer button:has-text("取消")')).toBeVisible();
    });

    test('输入有效项目名称后应成功创建项目', async () => {
      await contentPage.waitForTimeout(1000);
      const testProjectName = `测试项目_${Date.now()}`;
      // 点击新建项目按钮
      await contentPage.locator('button:has-text("新建项目")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'visible' });

      // 输入项目名称
      const nameInput = contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]');
      await nameInput.fill(testProjectName);

      // 点击确定按钮
      const confirmButton = contentPage.locator('.el-dialog__footer button:has-text("确定")');
      await confirmButton.click();

      // 等待弹窗关闭
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'hidden', timeout: 5000 });

      // 验证页面跳转到了项目编辑页面（这是业务预期行为）
      await contentPage.waitForURL(/doc-edit/, { timeout: 5000 });
      await expect(contentPage).toHaveURL(/doc-edit/);
      
      // 返回项目列表验证项目是否被创建
      await contentPage.evaluate(() => {
        window.location.hash = '#/v1/apidoc/doc-list';
      });
      await contentPage.waitForURL(/doc-list/, { timeout: 5000 });
      await contentPage.waitForTimeout(2000); // 增加等待时间，确保页面和数据完全加载

      // 验证项目出现在列表中
      const projectCard = contentPage.locator(`.project-list:has-text("${testProjectName}")`);
      await expect(projectCard.first()).toBeVisible({ timeout: 10000 });
    });

    test('点击取消按钮应关闭弹窗且不创建项目', async () => {
      // 获取创建前的项目数量
      await contentPage.waitForTimeout(500);
      const beforeCount = await contentPage.locator('.project-list').count();

      // 点击新建项目按钮
      await contentPage.locator('button:has-text("新建项目")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'visible' });

      // 输入项目名称
      const nameInput = contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]');
      await nameInput.fill('应该不会被创建的项目');

      // 点击取消按钮
      const cancelButton = contentPage.locator('.el-dialog__footer button:has-text("取消")');
      await cancelButton.click();

      // 验证弹窗关闭
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'hidden' });

      // 验证项目数量没有变化
      await contentPage.waitForTimeout(500);
      const afterCount = await contentPage.locator('.project-list').count();
      expect(afterCount).toBe(beforeCount);
    });

    test('创建的项目应显示正确的项目信息', async () => {
      const testProjectName = `完整信息项目_${Date.now()}`;

      // 创建项目
      await contentPage.locator('button:has-text("新建项目")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'visible' });
      
      const nameInput = contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]');
      await nameInput.fill(testProjectName);
      
      await contentPage.locator('.el-dialog__footer button:has-text("确定")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'hidden' });
      
      // 验证页面跳转到了项目编辑页面
      await contentPage.waitForURL(/doc-edit/, { timeout: 5000 });
      
      // 返回项目列表
      await contentPage.evaluate(() => {
        window.location.hash = '#/v1/apidoc/doc-list';
      });
      await contentPage.waitForURL(/doc-list/, { timeout: 5000 });
      await contentPage.waitForTimeout(1000);

      // 找到创建的项目卡片
      const projectCard = contentPage.locator(`.project-list:has-text("${testProjectName}")`).first();
      await expect(projectCard).toBeVisible();

      // 验证项目名称正确显示
      await expect(projectCard.locator(`:text("${testProjectName}")`)).toBeVisible();

      // 验证文档数量为0（新建项目应该没有文档）
      const docCountElement = projectCard.locator('.teal');
      if (await docCountElement.count() > 0) {
        const text = await docCountElement.first().textContent();
        expect(text).toMatch(/0/);
      }
    });
  });

  test.describe('P0: 编辑项目名称', () => {
    let testProjectName: string;

    test.beforeEach(async () => {
      // 先创建一个测试项目
      testProjectName = `待编辑项目_${Date.now()}`;
      
      await contentPage.locator('button:has-text("新建项目")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'visible' });
      
      const nameInput = contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]');
      await nameInput.fill(testProjectName);
      
      await contentPage.locator('.el-dialog__footer button:has-text("确定")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'hidden' });
      
      // 等待跳转到项目编辑页面
      await contentPage.waitForURL(/doc-edit/, { timeout: 5000 });
      
      // 返回项目列表
      await contentPage.evaluate(() => {
        window.location.hash = '#/v1/apidoc/doc-list';
      });
      await contentPage.waitForURL(/doc-list/, { timeout: 5000 });
      await contentPage.waitForTimeout(1000);
    });

    test('点击编辑按钮应打开编辑弹窗并预填充项目名称', async () => {
      // 找到项目卡片
      const projectCard = contentPage.locator(`.project-list:has-text("${testProjectName}")`).first();
      await expect(projectCard).toBeVisible();

      // 悬停以显示操作按钮（如果需要）
      await projectCard.hover();
      await contentPage.waitForTimeout(300);

      // 点击编辑按钮
      const editButton = projectCard.locator('[title="编辑"]').first();
      await editButton.click();

      // 验证编辑弹窗出现
      const editDialog = contentPage.locator('.el-dialog:has-text("修改项目")');
      await expect(editDialog).toBeVisible({ timeout: 5000 });

      // 验证项目名称输入框已预填充
      const nameInput = editDialog.locator('.el-input input');
      await expect(nameInput).toHaveValue(testProjectName);
    });

    test('修改项目名称后应保存成功并更新列表', async () => {
      const newProjectName = `已修改项目_${Date.now()}`;

      // 打开编辑弹窗
      const projectCard = contentPage.locator(`.project-list:has-text("${testProjectName}")`).first();
      await projectCard.hover();
      await contentPage.waitForTimeout(300);

      const editButton = projectCard.locator('[title="编辑"]').first();
      await editButton.click();      await contentPage.waitForSelector('.el-dialog:has-text("修改项目")', { state: 'visible' });

      // 修改项目名称
      const nameInput = contentPage.locator('.el-dialog:has-text("修改项目") .el-input input');
      await nameInput.clear();
      await nameInput.fill(newProjectName);

      // 保存修改
      const confirmButton = contentPage.locator('.el-dialog:has-text("修改项目") .el-dialog__footer button:has-text("确定")');
      await confirmButton.click();

      // 等待弹窗关闭
      await contentPage.waitForSelector('.el-dialog:has-text("修改项目")', { state: 'hidden' });
      await contentPage.waitForTimeout(1000);

      // 验证新项目名称出现在列表中
      const newProjectCard = contentPage.locator(`:text("${newProjectName}")`);
      await expect(newProjectCard.first()).toBeVisible();

      // 验证旧项目名称不再存在
      const oldProjectCard = contentPage.locator(`:text("${testProjectName}")`);
      expect(await oldProjectCard.count()).toBe(0);
    });

    test('编辑时点击取消应不保存更改', async () => {
      // 打开编辑弹窗
      const projectCard = contentPage.locator(`.project-list:has-text("${testProjectName}")`).first();
      await projectCard.hover();
      await contentPage.waitForTimeout(300);

      const editButton = projectCard.locator('[title="编辑"]').first();
      await editButton.click();      await contentPage.waitForSelector('.el-dialog:has-text("修改项目")', { state: 'visible' });

      // 修改项目名称
      const nameInput = contentPage.locator('.el-dialog:has-text("修改项目") .el-input input');
      await nameInput.clear();
      await nameInput.fill('这个名称不应该被保存');

      // 点击取消
      const cancelButton = contentPage.locator('.el-dialog:has-text("修改项目") .el-dialog__footer button:has-text("取消")');
      await cancelButton.click();

      // 等待弹窗关闭
      await contentPage.waitForSelector('.el-dialog:has-text("修改项目")', { state: 'hidden' });
      await contentPage.waitForTimeout(500);

      // 验证原项目名称仍然存在
      const originalProjectCard = contentPage.locator(`:text("${testProjectName}")`);
      await expect(originalProjectCard.first()).toBeVisible();
    });
  });

  test.describe('P0: 删除项目的基础流程', () => {
    let testProjectName: string;

    test.beforeEach(async () => {
      // 先创建一个测试项目
      testProjectName = `待删除项目_${Date.now()}`;
      
      await contentPage.locator('button:has-text("新建项目")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'visible' });
      
      const nameInput = contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]');
      await nameInput.fill(testProjectName);
      
      await contentPage.locator('.el-dialog__footer button:has-text("确定")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'hidden' });
      
      // 等待跳转到项目编辑页面
      await contentPage.waitForURL(/doc-edit/, { timeout: 5000 });
      
      // 返回项目列表
      await contentPage.evaluate(() => {
        window.location.hash = '#/v1/apidoc/doc-list';
      });
      await contentPage.waitForURL(/doc-list/, { timeout: 5000 });
      await contentPage.waitForTimeout(1000);
    });

    test('点击删除按钮应弹出确认对话框', async () => {
      // 找到项目卡片
      const projectCard = contentPage.locator(`.project-list:has-text("${testProjectName}")`).first();
      await expect(projectCard).toBeVisible();

      // 悬停以显示操作按钮
      await projectCard.hover();
      await contentPage.waitForTimeout(300);

      // 点击删除按钮
      const deleteButton = projectCard.locator('[title="删除"]').first();
      await deleteButton.click();

      // 验证确认对话框出现
      await contentPage.waitForTimeout(500);
      const confirmDialog = contentPage.locator('.el-message-box, .el-dialog:has-text("提示")');
      await expect(confirmDialog).toBeVisible({ timeout: 5000 });

      // 验证对话框包含删除相关的文字
      const dialogText = await confirmDialog.textContent();
      expect(dialogText).toMatch(/删除|确定/);
    });

    test('确认删除后项目应从列表中移除', async () => {
      // 找到项目卡片
      const projectCard = contentPage.locator(`.project-list:has-text("${testProjectName}")`).first();
      await projectCard.hover();
      await contentPage.waitForTimeout(300);

      // 点击删除按钮
      const deleteButton = projectCard.locator('[title="删除"]').first();
      await deleteButton.click();

      // 等待确认对话框并点击确定
      await contentPage.waitForTimeout(500);
      const confirmButton = contentPage.locator('.el-message-box button:has-text("确定"), .el-dialog button:has-text("确定")').first();
      await confirmButton.click();

      // 等待删除完成
      await contentPage.waitForTimeout(1000);

      // 验证项目已从列表中移除
      const deletedProject = contentPage.locator(`:text("${testProjectName}")`);
      expect(await deletedProject.count()).toBe(0);
    });

    test('取消删除后项目应保持不变', async () => {
      // 找到项目卡片
      const projectCard = contentPage.locator(`.project-list:has-text("${testProjectName}")`).first();
      await projectCard.hover();
      await contentPage.waitForTimeout(300);

      // 点击删除按钮
      const deleteButton = projectCard.locator('[title="删除"]').first();
      await deleteButton.click();

      // 等待确认对话框并点击取消
      await contentPage.waitForTimeout(500);
      const cancelButton = contentPage.locator('.el-message-box button:has-text("取消"), .el-dialog button:has-text("取消")').first();
      await cancelButton.click();

      // 等待对话框关闭
      await contentPage.waitForTimeout(500);

      // 验证项目仍然存在
      const existingProject = contentPage.locator(`:text("${testProjectName}")`);
      await expect(existingProject.first()).toBeVisible();
    });
  });

  test.describe('P0: 项目搜索功能', () => {
    test.beforeEach(async () => {
      // 创建多个测试项目用于搜索
      const projectNames = ['搜索测试项目A', '搜索测试项目B', '其他项目C'];
      
      for (const name of projectNames) {
        await contentPage.locator('button:has-text("新建项目")').click();
        await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'visible' });
        
        const nameInput = contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]');
        await nameInput.fill(name);
        
        await contentPage.locator('.el-dialog__footer button:has-text("确定")').click();
        await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'hidden' });
        
        // 等待跳转到项目编辑页面
        await contentPage.waitForURL(/doc-edit/, { timeout: 5000 });
        
        // 返回项目列表
        await contentPage.evaluate(() => {
          window.location.hash = '#/v1/apidoc/doc-list';
        });
        await contentPage.waitForURL(/doc-list/, { timeout: 5000 });
        await contentPage.waitForTimeout(800);
      }
    });

    test('搜索输入框应存在且可用', async () => {
      // 验证搜索输入框存在
      const searchInput = contentPage.locator('.el-input input[placeholder*="项目名称"]').first();
      await expect(searchInput).toBeVisible();
      
      // 验证可以输入
      await searchInput.fill('测试搜索');
      await expect(searchInput).toHaveValue('测试搜索');
    });

    test('输入搜索关键词应实时过滤项目列表', async () => {
      // 等待项目列表加载完成
      await contentPage.waitForTimeout(1000);

      // 获取搜索前的项目数量
      const beforeSearchCount = await contentPage.locator('.project-list').count();
      expect(beforeSearchCount).toBeGreaterThanOrEqual(3);

      // 输入搜索关键词
      const searchInput = contentPage.locator('.el-input input[placeholder*="项目名称"]').first();
      await searchInput.fill('搜索测试');

      // 等待搜索结果更新
      await contentPage.waitForTimeout(800);

      // 验证只显示匹配的项目
      const searchResultA = contentPage.locator(':text("搜索测试项目A")');
      const searchResultB = contentPage.locator(':text("搜索测试项目B")');
      const otherProject = contentPage.locator(':text("其他项目C")');

      await expect(searchResultA.first()).toBeVisible();
      await expect(searchResultB.first()).toBeVisible();
      
      // "其他项目C"不应该显示
      expect(await otherProject.count()).toBe(0);
    });

    test('清空搜索框应恢复完整项目列表', async () => {
      // 输入搜索关键词
      const searchInput = contentPage.locator('.el-input input[placeholder*="项目名称"]').first();
      await searchInput.fill('搜索测试项目A');
      await contentPage.waitForTimeout(800);

      // 验证只显示匹配的项目（搜索"搜索测试项目A"可能会匹配到多个包含这个关键词的项目，包括之前测试遗留的）
      // 主要验证搜索功能是否工作，不强制要求精确数量
      let visibleProjects = await contentPage.locator('.project-list').count();
      expect(visibleProjects).toBeGreaterThan(0); // 至少有一个匹配项

      // 清空搜索框
      await searchInput.clear();
      await contentPage.waitForTimeout(800);

      // 验证所有项目都显示了
      visibleProjects = await contentPage.locator('.project-list').count();
      expect(visibleProjects).toBeGreaterThanOrEqual(3);
    });

    test('搜索无结果时应正确显示', async () => {
      // 输入不存在的搜索关键词
      const searchInput = contentPage.locator('.el-input input[placeholder*="项目名称"]').first();
      await searchInput.fill('不存在的项目名称XYZ123');
      await contentPage.waitForTimeout(800);

      // 验证没有项目显示
      const visibleProjects = await contentPage.locator('.project-list').count();
      expect(visibleProjects).toBe(0);
    });
  });
});
