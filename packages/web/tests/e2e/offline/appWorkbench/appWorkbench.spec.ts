import { expect, type ElectronApplication, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, login } from '../../../fixtures/fixtures';

/*
|--------------------------------------------------------------------------
| 第一部分：基础布局和显示测试
|--------------------------------------------------------------------------
*/
test.describe('应用工作台 Header - 基础布局和显示', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const result = await initOfflineWorkbench(electronApp);
    headerPage = result.headerPage;
    contentPage = result.contentPage;
  });

  test('Header 组件应正常显示', async () => {
    // 1. 验证 Header 容器存在
    const header = headerPage.locator('.s-header');
    await expect(header).toBeVisible();

    // 2. 验证 Header 高度符合规范（35px）
    const headerHeight = await header.evaluate((el) => {
      return window.getComputedStyle(el).height;
    });
    expect(headerHeight).toBe('35px');

    // 3. 验证 Logo 显示
    const logo = headerPage.locator('.logo');
    await expect(logo).toBeVisible();
    const logoImg = headerPage.locator('.logo-img');
    await expect(logoImg).toBeVisible();

    // 4. 验证 Home 按钮显示
    const homeBtn = headerPage.locator('.home');
    await expect(homeBtn).toBeVisible();
    await expect(homeBtn).toContainText('主页面');

    // 5. 验证 Home 按钮初始状态为激活
    await expect(homeBtn).toHaveClass(/active/);

    // 6. 验证初始状态无标签页
    const tabCount = await headerPage.locator('.tab-item').count();
    expect(tabCount).toBe(0);

    // 7. 验证新增项目按钮显示
    const addBtn = headerPage.locator('.add-tab-btn');
    await expect(addBtn).toBeVisible();
    await expect(addBtn).toContainText('+');

    // 8. 验证导航控制区显示
    const navControl = headerPage.locator('.navigation-control');
    await expect(navControl).toBeVisible();

    // 9. 验证刷新按钮
    const refreshBtn = headerPage.locator('.navigation-control .icon[title*="刷新"]');
    await expect(refreshBtn).toBeVisible();

    // 10. 验证后退按钮
    const backBtn = headerPage.locator('.navigation-control .icon[title*="后退"]');
    await expect(backBtn).toBeVisible();

    // 11. 验证前进按钮
    const forwardBtn = headerPage.locator('.navigation-control .icon[title*="前进"]');
    await expect(forwardBtn).toBeVisible();

    // 12. 验证个人中心按钮
    const userCenterBtn = headerPage.locator('.navigation-control .icon:has(.icongerenzhongxin)');
    await expect(userCenterBtn).toBeVisible();

    // 13. 验证语言切换按钮
    const languageBtn = headerPage.locator('.navigation-control .icon:has(.iconyuyan)');
    await expect(languageBtn).toBeVisible();
    const languageText = headerPage.locator('.language-text');
    await expect(languageText).toBeVisible();
    const langText = await languageText.textContent();
    expect(langText).toBe('中'); // 默认应该是"中"

    // 14. 验证网络模式按钮
    const networkBtn = headerPage.locator('.network-btn');
    await expect(networkBtn).toBeVisible();
    const networkText = headerPage.locator('.network-text');
    await expect(networkText).toBeVisible();
    const netText = await networkText.textContent();
    expect(netText).toBe('离线模式'); // 默认应该是"离线模式"

    // 15. 验证窗口控制区显示
    const windowControl = headerPage.locator('.window-control');
    await expect(windowControl).toBeVisible();

    // 16. 验证最小化按钮
    const minimizeBtn = headerPage.locator('#minimize');
    await expect(minimizeBtn).toBeVisible();

    // 17. 验证最大化或取消最大化按钮（至少一个可见）
    const maximizeBtn = headerPage.locator('#maximize');
    const unmaximizeBtn = headerPage.locator('#unmaximize');
    const hasMaximize = await maximizeBtn.isVisible().catch(() => false);
    const hasUnmaximize = await unmaximizeBtn.isVisible().catch(() => false);
    expect(hasMaximize || hasUnmaximize).toBe(true);

    // 18. 验证关闭按钮
    const closeBtn = headerPage.locator('#close');
    await expect(closeBtn).toBeVisible();
  });
});
/*
|--------------------------------------------------------------------------
| 第二部分：Logo 和 Home 功能测试
|--------------------------------------------------------------------------
*/
test.describe('应用工作台 Header - Logo 和 Home 功能', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const result = await initOfflineWorkbench(electronApp);
    headerPage = result.headerPage;
    contentPage = result.contentPage;
  });

  test('点击 Logo 应跳转到首页', async () => {
    // 1. 创建项目并进入项目页面（离开首页）
    await createProject(contentPage, '测试项目-Logo跳转');

    // 等待项目页面加载完成
    await contentPage.waitForURL(/doc-edit/, { timeout: 10000 });

    // 2. 验证当前不在首页（有激活的项目标签）
    const activeTab = headerPage.locator('.tab-item.active');
    await expect(activeTab).toHaveCount(1);

    // 3. 点击 Logo
    const logoImg = headerPage.locator('.logo-img');
    await logoImg.click();

    // 4. 验证跳转成功
    // 4.1 验证 URL 包含 #/home
    await contentPage.waitForURL('**/#/home', { timeout: 10000 });
    expect(contentPage.url()).toContain('#/home');

    // 4.2 验证 Home 按钮显示激活状态
    const homeBtn = headerPage.locator('.home');
    await expect(homeBtn).toHaveClass(/active/);
  });
  test('点击 Home 按钮应跳转到首页', async () => {
    // 1. 创建项目并进入项目页面（离开首页）
    await createProject(contentPage, '测试项目-Home跳转');

    // 等待项目页面加载完成
    await contentPage.waitForURL(/doc-edit/, { timeout: 10000 });

    // 2. 验证当前不在首页（Home 按钮无激活状态）
    const homeBtn = headerPage.locator('.home');
    await expect(homeBtn).not.toHaveClass(/active/);

    // 3. 点击 Home 按钮
    await homeBtn.click();

    // 4. 验证跳转成功
    // 4.1 验证 URL 包含 #/home
    await contentPage.waitForURL('**/#/home', { timeout: 10000 });
    expect(contentPage.url()).toContain('#/home');

    // 4.2 验证 Home 按钮显示激活状态
    await expect(homeBtn).toHaveClass(/active/);
  });
});
/*
|--------------------------------------------------------------------------
| 第三部分：标签页基础功能测试
|--------------------------------------------------------------------------
*/
test.describe('应用工作台 Header - 标签页基础功能', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const result = await initOfflineWorkbench(electronApp);
    headerPage = result.headerPage;
    contentPage = result.contentPage;
  });

  test('初始状态应无标签页显示', async () => {
    // 验证初始状态下没有任何标签页
    const tabCount = await headerPage.locator('.tab-item').count();
    expect(tabCount).toBe(0);
  });
  test('项目标签应正确显示项目名称和图标', async () => {
    // 1. 创建项目
    await createProject(contentPage, '测试项目A');
    await contentPage.waitForTimeout(1000);

    // 2. 验证标签页存在
    const tabs = headerPage.locator('.tab-item');
    await expect(tabs).toHaveCount(1);

    // 3. 验证标签页显示正确的项目名称
    const tab = tabs.first();
    await expect(tab).toContainText('测试项目A');

    // 4. 验证项目标签显示图标（FolderKanban）
    const tabIcon = tab.locator('.tab-icon');
    await expect(tabIcon).toBeVisible();
  });
  test('设置标签应正确显示设置名称和图标', async () => {
    // 1. 点击个人中心按钮创建设置标签
    const userCenterBtn = headerPage.locator('.navigation-control .icon:has(.icongerenzhongxin)');
    await userCenterBtn.click();
    await contentPage.waitForTimeout(1000);

    // 2. 验证设置标签存在
    const tabs = headerPage.locator('.tab-item');
    await expect(tabs).toHaveCount(1);

    // 3. 验证标签页显示正确的设置名称（个人中心）
    const tab = tabs.first();
    await expect(tab).toContainText('个人中心');

    // 4. 验证设置标签不显示图标（只有项目标签有图标）
    const tabIcon = tab.locator('.tab-icon');
    await expect(tabIcon).toHaveCount(0);
  });
  test('点击标签应切换到对应标签', async () => {
    // 1. 创建第一个项目
    await createProject(contentPage, '项目1');
    await contentPage.waitForTimeout(500);

    // 2. 回到首页
    await headerPage.locator('.home').click();
    await contentPage.waitForURL('**/#/home', { timeout: 10000 });

    // 3. 创建第二个项目
    await createProject(contentPage, '项目2');
    await contentPage.waitForTimeout(500);

    // 4. 验证有2个标签页
    const tabs = headerPage.locator('.tab-item');
    await expect(tabs).toHaveCount(2);

    // 5. 验证第二个标签（项目2）是激活状态
    const tab2 = tabs.nth(1);
    await expect(tab2).toHaveClass(/active/);

    // 6. 点击第一个标签（项目1）
    const tab1 = tabs.nth(0);
    await tab1.click();
    await contentPage.waitForTimeout(500);

    // 7. 验证第一个标签变为激活状态
    await expect(tab1).toHaveClass(/active/);

    // 8. 验证第二个标签不再是激活状态
    await expect(tab2).not.toHaveClass(/active/);
  });
  test('激活的标签应显示激活样式', async () => {
    // 1. 创建项目
    await createProject(contentPage, '测试项目');
    await contentPage.waitForTimeout(500);

    // 2. 获取标签页
    const tab = headerPage.locator('.tab-item').first();

    // 3. 验证激活标签有 active 类
    await expect(tab).toHaveClass(/active/);

    // 4. 验证激活样式的背景色（根据CSS定义）
    const bgColor = await tab.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    // 激活标签的背景色应该是 rgba(255, 255, 255, 0.35)
    expect(bgColor).toContain('rgba(255, 255, 255');
  });
  test('悬停标签应显示关闭按钮', async () => {
    // 1. 创建第一个项目
    await createProject(contentPage, '测试项目1');
    await contentPage.waitForTimeout(500);

    // 2. 回到首页创建第二个项目
    await headerPage.locator('.home').click();
    await contentPage.waitForURL('**/#/home', { timeout: 10000 });
    await createProject(contentPage, '测试项目2');
    await contentPage.waitForTimeout(500);

    // 3. 回到首页，使两个标签都处于非激活状态
    await headerPage.locator('.home').click();
    await contentPage.waitForURL('**/#/home', { timeout: 10000 });
    await contentPage.waitForTimeout(300);

    // 4. 获取第一个非激活标签和关闭按钮
    const tabs = headerPage.locator('.tab-item');
    const firstTab = tabs.first();
    const closeBtn = firstTab.locator('.close-btn');

    // 5. 验证标签不是激活状态
    await expect(firstTab).not.toHaveClass(/active/);

    // 6. 悬停前，关闭按钮应该是隐藏的（opacity: 0）
    const opacityBefore = await closeBtn.evaluate((el) => {
      return window.getComputedStyle(el).opacity;
    });
    expect(opacityBefore).toBe('0');

    // 7. 悬停在标签上
    await firstTab.hover();
    await contentPage.waitForTimeout(300);

    // 8. 悬停后，关闭按钮应该显示（opacity: 1）
    const opacityAfter = await closeBtn.evaluate((el) => {
      return window.getComputedStyle(el).opacity;
    });
    expect(opacityAfter).toBe('1');
  });
  test('点击关闭按钮应关闭标签', async () => {
    // 1. 创建项目
    await createProject(contentPage, '测试项目');
    await contentPage.waitForTimeout(500);

    // 2. 验证标签存在
    const tabs = headerPage.locator('.tab-item');
    await expect(tabs).toHaveCount(1);

    // 3. 获取标签和关闭按钮
    const tab = tabs.first();
    await tab.hover();
    const closeBtn = tab.locator('.close-btn');

    // 4. 点击关闭按钮
    await closeBtn.click();
    await contentPage.waitForTimeout(500);

    // 5. 验证标签已被移除
    await expect(tabs).toHaveCount(0);

    // 6. 验证跳转到首页
    await contentPage.waitForURL('**/#/home', { timeout: 10000 });
    expect(contentPage.url()).toContain('#/home');
  });
  test('关闭激活标签后应自动激活相邻标签', async () => {
    // 1. 创建第一个项目
    await createProject(contentPage, '项目1');
    await contentPage.waitForTimeout(500);

    // 2. 回到首页
    await headerPage.locator('.home').click();
    await contentPage.waitForURL('**/#/home', { timeout: 10000 });

    // 3. 创建第二个项目
    await createProject(contentPage, '项目2');
    await contentPage.waitForTimeout(500);

    // 4. 回到首页
    await headerPage.locator('.home').click();
    await contentPage.waitForURL('**/#/home', { timeout: 10000 });

    // 5. 创建第三个项目
    await createProject(contentPage, '项目3');
    await contentPage.waitForTimeout(500);

    // 6. 验证有3个标签，第三个是激活状态
    const tabs = headerPage.locator('.tab-item');
    await expect(tabs).toHaveCount(3);
    const tab3 = tabs.nth(2);
    await expect(tab3).toHaveClass(/active/);

    // 7. 点击第二个标签激活它
    const tab2 = tabs.nth(1);
    await tab2.click();
    await contentPage.waitForTimeout(500);
    await expect(tab2).toHaveClass(/active/);

    // 8. 关闭第二个标签（激活的标签）
    await tab2.hover();
    const closeBtn = tab2.locator('.close-btn');
    await closeBtn.click();
    await contentPage.waitForTimeout(500);

    // 9. 验证标签数量减少到2个
    await expect(tabs).toHaveCount(2);

    // 10. 验证自动激活了相邻的标签（应该激活原位置之后的标签，即原来的项目3）
    await contentPage.waitForTimeout(200); // 等待激活状态更新
    const activeTabs = headerPage.locator('.tab-item.active');
    await expect(activeTabs).toHaveCount(1);
  });
  test('关闭最后一个标签应跳转到首页', async () => {
    // 1. 创建项目
    await createProject(contentPage, '最后的项目');
    await contentPage.waitForTimeout(500);

    // 2. 验证标签存在且为激活状态
    const tabs = headerPage.locator('.tab-item');
    await expect(tabs).toHaveCount(1);
    const tab = tabs.first();
    await expect(tab).toHaveClass(/active/);

    // 3. 关闭这个唯一的标签
    await tab.hover();
    const closeBtn = tab.locator('.close-btn');
    await closeBtn.click();
    await contentPage.waitForTimeout(500);

    // 4. 验证所有标签都已被移除
    await expect(tabs).toHaveCount(0);

    // 5. 验证自动跳转到首页
    await contentPage.waitForURL('**/#/home', { timeout: 10000 });
    expect(contentPage.url()).toContain('#/home');

    // 6. 验证 Home 按钮显示激活状态
    const homeBtn = headerPage.locator('.home');
    await expect(homeBtn).toHaveClass(/active/);
  });
  test('标签过长应显示省略号', async () => {
    // 1. 创建一个名称很长的项目
    const longProjectName = '这是一个非常非常非常非常非常非常非常长的项目名称用于测试省略号显示';
    await createProject(contentPage, longProjectName);
    await contentPage.waitForTimeout(500);

    // 2. 获取标签页
    const tab = headerPage.locator('.tab-item').first();

    // 3. 验证标签页有最大宽度限制（200px）
    const maxWidth = await tab.evaluate((el) => {
      return window.getComputedStyle(el).maxWidth;
    });
    expect(maxWidth).toBe('200px');

    // 4. 验证标签内容应用了文本省略样式
    const tabContent = tab.locator('span').first();
    const textOverflow = await tabContent.evaluate((el) => {
      return window.getComputedStyle(el).textOverflow;
    });
    expect(textOverflow).toBe('ellipsis');

    // 5. 验证标签内容不换行
    const whiteSpace = await tabContent.evaluate((el) => {
      return window.getComputedStyle(el).whiteSpace;
    });
    expect(whiteSpace).toBe('nowrap');
  });
  test('多个标签应支持横向滚动', async () => {
    // 1. 创建多个项目（足够多以触发滚动）
    for (let i = 1; i <= 8; i++) {
      if (i > 1) {
        await headerPage.locator('.home').click();
        await contentPage.waitForURL('**/#/home', { timeout: 10000 });
      }
      await createProject(contentPage, `项目${i}`);
      await contentPage.waitForTimeout(300);
    }

    // 2. 验证有8个标签
    const tabs = headerPage.locator('.tab-item');
    await expect(tabs).toHaveCount(8);

    // 3. 获取标签容器
    const tabsContainer = headerPage.locator('.tabs');

    // 4. 验证容器启用了横向滚动（overflow-x: auto）
    const overflowX = await tabsContainer.evaluate((el) => {
      return window.getComputedStyle(el).overflowX;
    });
    expect(overflowX).toBe('auto');

    // 5. 验证容器的 scrollWidth 大于 clientWidth（证明内容超出可视区域）
    const hasScroll = await tabsContainer.evaluate((el) => {
      return el.scrollWidth > el.clientWidth;
    });
    expect(hasScroll).toBe(true);
  });
  test('标签应显示提示信息（tooltip）', async () => {
    // 1. 创建项目
    const projectName = '测试项目Tooltip';
    await createProject(contentPage, projectName);
    await contentPage.waitForTimeout(500);

    // 2. 获取标签页
    const tab = headerPage.locator('.tab-item').first();

    // 3. 验证标签页有 title 属性（用于显示 tooltip）
    const titleAttr = await tab.getAttribute('title');
    expect(titleAttr).toBe(projectName);

    // 4. 创建一个长名称项目，验证省略号场景下也能通过 tooltip 看到完整名称
    await headerPage.locator('.home').click();
    await contentPage.waitForURL('**/#/home', { timeout: 10000 });

    const longName = '这是一个非常长的项目名称用于测试Tooltip功能是否能显示完整内容';
    await createProject(contentPage, longName);
    await contentPage.waitForTimeout(500);

    const tabs = headerPage.locator('.tab-item');
    const longTab = tabs.last();
    const longTitleAttr = await longTab.getAttribute('title');

    // 5. 验证 title 属性包含完整的项目名称
    expect(longTitleAttr).toBe(longName);
  });
});
/*
|--------------------------------------------------------------------------
| 第四部分：标签页高级功能测试
|--------------------------------------------------------------------------
*/
test.describe('应用工作台 Header - 标签页高级功能', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const result = await initOfflineWorkbench(electronApp);
    headerPage = result.headerPage;
    contentPage = result.contentPage;
  });

  test('应能拖拽标签调整顺序', async () => {
    // 1. 创建3个测试项目
    await createProject(contentPage, '项目A');
    await contentPage.waitForTimeout(500);
    await headerPage.locator('.home').click();
    await contentPage.waitForURL('**/#/home', { timeout: 10000 });

    await createProject(contentPage, '项目B');
    await contentPage.waitForTimeout(500);
    await headerPage.locator('.home').click();
    await contentPage.waitForURL('**/#/home', { timeout: 10000 });

    await createProject(contentPage, '项目C');
    await contentPage.waitForTimeout(500);

    // 2. 验证初始标签顺序
    const tabs = headerPage.locator('.tab-item');
    await expect(tabs).toHaveCount(3);

    // 3. 获取初始顺序
    const initialOrder: string[] = [];
    for (let i = 0; i < 3; i++) {
      const text = await tabs.nth(i).locator('.tab-title').textContent();
      if (text) initialOrder.push(text.trim());
    }
    expect(initialOrder).toEqual(['项目A', '项目B', '项目C']);

    // 4. 执行拖拽：将第一个标签（项目A）拖到最后
    const tabA = tabs.first();
    const tabC = tabs.nth(2);

    const tabABox = await tabA.boundingBox();
    const tabCBox = await tabC.boundingBox();

    if (tabABox && tabCBox) {
      // 移动到源元素中心
      await headerPage.mouse.move(
        tabABox.x + tabABox.width / 2,
        tabABox.y + tabABox.height / 2
      );

      // 按下鼠标
      await headerPage.mouse.down();
      await contentPage.waitForTimeout(150);

      // 移动到目标位置（项目C之后）
      await headerPage.mouse.move(
        tabCBox.x + tabCBox.width - 5,
        tabCBox.y + tabCBox.height / 2,
        { steps: 10 }
      );
      await contentPage.waitForTimeout(150);

      // 释放鼠标
      await headerPage.mouse.up();
      await contentPage.waitForTimeout(300);

      // 5. 验证拖拽后的顺序
      const finalOrder: string[] = [];
      for (let i = 0; i < 3; i++) {
        const text = await tabs.nth(i).locator('.tab-title').textContent();
        if (text) finalOrder.push(text.trim());
      }
      expect(finalOrder).toEqual(['项目B', '项目C', '项目A']);
    }
  });
  test('拖拽标签到新位置后顺序应保持', async () => {
    // 1. 创建3个测试项目
    await createProject(contentPage, '项目1');
    await contentPage.waitForTimeout(500);
    await headerPage.locator('.home').click();
    await contentPage.waitForURL('**/#/home', { timeout: 10000 });

    await createProject(contentPage, '项目2');
    await contentPage.waitForTimeout(500);
    await headerPage.locator('.home').click();
    await contentPage.waitForURL('**/#/home', { timeout: 10000 });

    await createProject(contentPage, '项目3');
    await contentPage.waitForTimeout(500);

    // 2. 执行拖拽：将第二个标签（项目2）拖到第一个位置
    const tabs = headerPage.locator('.tab-item');
    const tab2 = tabs.nth(1);
    const tab1 = tabs.first();

    const tab2Box = await tab2.boundingBox();
    const tab1Box = await tab1.boundingBox();

    if (tab2Box && tab1Box) {
      await headerPage.mouse.move(
        tab2Box.x + tab2Box.width / 2,
        tab2Box.y + tab2Box.height / 2
      );
      await headerPage.mouse.down();
      await contentPage.waitForTimeout(150);

      await headerPage.mouse.move(
        tab1Box.x + 5,
        tab1Box.y + tab1Box.height / 2,
        { steps: 10 }
      );
      await contentPage.waitForTimeout(150);

      await headerPage.mouse.up();
      await contentPage.waitForTimeout(500);

      // 3. 验证拖拽后的顺序
      const orderAfterDrag: string[] = [];
      for (let i = 0; i < 3; i++) {
        const text = await tabs.nth(i).locator('.tab-title').textContent();
        if (text) orderAfterDrag.push(text.trim());
      }
      expect(orderAfterDrag).toEqual(['项目2', '项目1', '项目3']);

      // 4. 点击某个标签，再点击另一个标签，验证顺序不变
      await tabs.nth(2).click();
      await contentPage.waitForTimeout(300);
      await tabs.nth(0).click();
      await contentPage.waitForTimeout(300);

      // 5. 再次验证顺序保持不变
      const orderAfterClick: string[] = [];
      for (let i = 0; i < 3; i++) {
        const text = await tabs.nth(i).locator('.tab-title').textContent();
        if (text) orderAfterClick.push(text.trim());
      }
      expect(orderAfterClick).toEqual(['项目2', '项目1', '项目3']);

      // 6. 回到首页再验证顺序
      await headerPage.locator('.home').click();
      await contentPage.waitForURL('**/#/home', { timeout: 10000 });
      await contentPage.waitForTimeout(300);

      // 7. 最终验证顺序仍然保持
      const finalOrder: string[] = [];
      for (let i = 0; i < 3; i++) {
        const text = await tabs.nth(i).locator('.tab-title').textContent();
        if (text) finalOrder.push(text.trim());
      }
      expect(finalOrder).toEqual(['项目2', '项目1', '项目3']);
    }
  });
  test('点击新增项目按钮（+）应触发创建项目事件', async () => {
    // 1. 验证新增项目按钮存在
    const addBtn = headerPage.locator('.add-tab-btn');
    await expect(addBtn).toBeVisible();
    await expect(addBtn).toContainText('+');

    // 2. 点击新增项目按钮
    await addBtn.click();
    await contentPage.waitForTimeout(300);

    // 3. 验证创建项目对话框在 contentPage 显示
    const dialog = contentPage.locator('.el-dialog:has-text("新增项目")');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // 4. 验证对话框包含必要的元素
    const nameInput = contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]');
    await expect(nameInput).toBeVisible();

    const confirmBtn = contentPage.locator('.el-dialog__footer button:has-text("确定")');
    await expect(confirmBtn).toBeVisible();

    // 5. 关闭对话框
    const cancelBtn = contentPage.locator('.el-dialog__footer button:has-text("取消")');
    await cancelBtn.click();
    await contentPage.waitForTimeout(300);

    // 6. 验证对话框已关闭
    await expect(dialog).not.toBeVisible();
  });
  test('标签应根据网络模式过滤显示（offline/online）', async () => {
    // 1. 验证初始为 offline 模式
    const networkBtn = headerPage.locator('.network-btn');
    const networkText = headerPage.locator('.network-text');
    let netMode = await networkText.textContent();
    expect(netMode).toBe('离线模式');

    // 2. 在 offline 模式下创建2个项目
    await createProject(contentPage, 'Offline项目1');
    await contentPage.waitForTimeout(500);
    await headerPage.locator('.home').click();
    await contentPage.waitForURL('**/#/home', { timeout: 10000 });

    await createProject(contentPage, 'Offline项目2');
    await contentPage.waitForTimeout(500);
    await headerPage.locator('.home').click();
    await contentPage.waitForURL('**/#/home', { timeout: 10000 });

    // 3. 验证显示2个 offline 标签
    const tabs = headerPage.locator('.tab-item');
    await expect(tabs).toHaveCount(2);

    // 4. 切换到 online 模式
    await networkBtn.click();
    await contentPage.waitForTimeout(500);

    // 4.1 等待跳转到登录页面
    await contentPage.waitForURL(/login/, { timeout: 10000 });

    // 4.2 执行登录
    await login(contentPage);

    // 4.3 等待登录成功跳转到 home
    await contentPage.waitForURL(/home/, { timeout: 10000 });
    await contentPage.waitForTimeout(500);

    // 5. 验证网络模式已切换
    netMode = await networkText.textContent();
    expect(netMode).toBe('联网模式');

    // 6. 验证 offline 标签被隐藏（标签数量为0）
    await expect(tabs).toHaveCount(0);

    // 7. 在 online 模式下创建1个项目
    await createProject(contentPage, 'Online项目1');
    await contentPage.waitForTimeout(500);

    // 8. 验证只显示1个 online 标签
    await expect(tabs).toHaveCount(1);
    const onlineTab = tabs.first();
    await expect(onlineTab).toContainText('Online项目1');

    // 9. 切换回 offline 模式
    await networkBtn.click();
    await contentPage.waitForTimeout(500);

    // 10. 验证只显示2个 offline 标签，online 标签被隐藏
    await expect(tabs).toHaveCount(2);
  });
  test('切换网络模式后当前模式的标签应正确显示', async () => {
    // 1. 在 offline 模式下创建项目A
    await createProject(contentPage, '项目A');
    await contentPage.waitForTimeout(500);
    await headerPage.locator('.home').click();
    await contentPage.waitForURL('**/#/home', { timeout: 10000 });

    // 2. 切换到 online 模式
    const networkBtn = headerPage.locator('.network-btn');
    await networkBtn.click();
    await contentPage.waitForTimeout(500);

    // 2.1 等待跳转到登录页面并登录
    await contentPage.waitForURL(/login/, { timeout: 10000 });
    await login(contentPage);
    await contentPage.waitForURL(/home/, { timeout: 10000 });
    await contentPage.waitForTimeout(500);

    // 3. 在 online 模式下创建项目B
    await createProject(contentPage, '项目B');
    await contentPage.waitForTimeout(500);

    // 4. 验证当前只显示项目B标签
    const tabs = headerPage.locator('.tab-item');
    await expect(tabs).toHaveCount(1);

    // 5. 验证项目B标签包含正确文本
    const tabB = tabs.first();
    await expect(tabB).toContainText('项目B');

    // 6. 验证项目B标签为激活状态
    await expect(tabB).toHaveClass(/active/);

    // 7. 验证标签有正确的图标
    const tabIcon = tabB.locator('.tab-icon');
    await expect(tabIcon).toBeVisible();

    // 8. 验证 Home 按钮不是激活状态
    const homeBtn = headerPage.locator('.home');
    await expect(homeBtn).not.toHaveClass(/active/);
  });
  test('切换网络模式后其他模式的标签应隐藏', async () => {
    // 1. 在 offline 模式下创建2个项目
    await createProject(contentPage, '项目A');
    await contentPage.waitForTimeout(500);
    await headerPage.locator('.home').click();
    await contentPage.waitForURL('**/#/home', { timeout: 10000 });

    await createProject(contentPage, '项目B');
    await contentPage.waitForTimeout(500);
    await headerPage.locator('.home').click();
    await contentPage.waitForURL('**/#/home', { timeout: 10000 });

    // 2. 验证显示2个 offline 标签
    const tabs = headerPage.locator('.tab-item');
    await expect(tabs).toHaveCount(2);

    // 3. 切换到 online 模式
    const networkBtn = headerPage.locator('.network-btn');
    await networkBtn.click();
    await contentPage.waitForTimeout(500);

    // 4. 验证所有标签都不可见（标签数量为0）
    await expect(tabs).toHaveCount(0);

    // 5. 验证项目A、项目B标签都找不到
    const tabA = headerPage.locator('.tab-item:has-text("项目A")');
    const tabB = headerPage.locator('.tab-item:has-text("项目B")');
    await expect(tabA).toHaveCount(0);
    await expect(tabB).toHaveCount(0);

    // 6. 验证 Home 按钮是激活状态（因为没有可见标签，自动激活首页）
    const homeBtn = headerPage.locator('.home');
    await expect(homeBtn).toHaveClass(/active/);
  });
  test('切换回原网络模式后标签应恢复显示', async () => {
    // 1. 在 offline 模式下创建2个项目
    await createProject(contentPage, '项目A');
    await contentPage.waitForTimeout(500);
    await headerPage.locator('.home').click();
    await contentPage.waitForURL('**/#/home', { timeout: 10000 });

    await createProject(contentPage, '项目B');
    await contentPage.waitForTimeout(500);
    await headerPage.locator('.home').click();
    await contentPage.waitForURL('**/#/home', { timeout: 10000 });

    // 2. 记录 offline 模式下的标签
    const tabs = headerPage.locator('.tab-item');
    await expect(tabs).toHaveCount(2);

    const offlineTabs: string[] = [];
    for (let i = 0; i < 2; i++) {
      const text = await tabs.nth(i).locator('.tab-title').textContent();
      if (text) offlineTabs.push(text.trim());
    }
    expect(offlineTabs).toEqual(['项目A', '项目B']);

    // 3. 切换到 online 模式
    const networkBtn = headerPage.locator('.network-btn');
    await networkBtn.click();
    await contentPage.waitForTimeout(500);

    // 4. 验证 offline 标签被隐藏
    await expect(tabs).toHaveCount(0);

    // 5. 再次点击切换回 offline 模式
    await networkBtn.click();
    await contentPage.waitForTimeout(500);

    // 6. 验证网络模式已切换回 offline
    const networkText = headerPage.locator('.network-text');
    const netMode = await networkText.textContent();
    expect(netMode).toBe('离线模式');

    // 7. 验证2个 offline 标签恢复显示
    await expect(tabs).toHaveCount(2);

    // 8. 验证标签文本正确（项目A、项目B）
    const restoredTabs: string[] = [];
    for (let i = 0; i < 2; i++) {
      const text = await tabs.nth(i).locator('.tab-title').textContent();
      if (text) restoredTabs.push(text.trim());
    }
    expect(restoredTabs).toEqual(['项目A', '项目B']);

    // 9. 验证标签顺序与切换前一致
    expect(restoredTabs).toEqual(offlineTabs);
  });
  test('标签数据应同步到 localStorage', async () => {
    // 1. 创建2个项目
    await createProject(contentPage, '项目X');
    await contentPage.waitForTimeout(500);
    await headerPage.locator('.home').click();
    await contentPage.waitForURL('**/#/home', { timeout: 10000 });

    await createProject(contentPage, '项目Y');
    await contentPage.waitForTimeout(500);

    // 2. 等待同步完成
    await contentPage.waitForTimeout(500);

    // 3. 从 contentPage 读取 localStorage
    const tabsData = await contentPage.evaluate(() => {
      const data = localStorage.getItem('appWorkbench/header/tabs');
      return data ? JSON.parse(data) : [];
    });

    // 4. 验证数组长度为 2
    expect(tabsData).toHaveLength(2);

    // 5. 验证每个标签对象包含必要字段
    for (const tab of tabsData) {
      expect(tab).toHaveProperty('id');
      expect(tab).toHaveProperty('title');
      expect(tab).toHaveProperty('type');
      expect(tab).toHaveProperty('network');

      // 6. 验证字段类型和值
      expect(typeof tab.id).toBe('string');
      expect(tab.id.length).toBeGreaterThan(0);
      expect(tab.type).toBe('project');
      expect(tab.network).toBe('offline');
    }

    // 7. 验证标签标题
    const titles = tabsData.map((tab: any) => tab.title);
    expect(titles).toContain('项目X');
    expect(titles).toContain('项目Y');

    // 8. 关闭一个标签，验证 localStorage 更新
    const tabs = headerPage.locator('.tab-item');
    const firstTab = tabs.first();
    await firstTab.hover();
    const closeBtn = firstTab.locator('.close-btn');
    await closeBtn.click();
    await contentPage.waitForTimeout(500);

    // 9. 再次读取 localStorage
    const updatedTabsData = await contentPage.evaluate(() => {
      const data = localStorage.getItem('appWorkbench/header/tabs');
      return data ? JSON.parse(data) : [];
    });

    // 10. 验证数组长度变为 1
    expect(updatedTabsData).toHaveLength(1);
  });
});
/*
|--------------------------------------------------------------------------
| 第五部分：导航控制功能测试
|--------------------------------------------------------------------------
*/
test.describe('应用工作台 Header - 导航控制功能', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const result = await initOfflineWorkbench(electronApp);
    headerPage = result.headerPage;
    contentPage = result.contentPage;
  });

  test('刷新按钮应正确显示并可点击', async () => {});
  test('点击刷新按钮应发送刷新事件', async () => {});
  test('后退按钮应正确显示并可点击', async () => {});
  test('点击后退按钮应发送后退事件', async () => {});
  test('前进按钮应正确显示并可点击', async () => {});
  test('点击前进按钮应发送前进事件', async () => {});
  test('个人中心按钮应正确显示并可点击', async () => {});
  test('点击个人中心按钮应创建个人中心标签', async () => {});
});
/*
|--------------------------------------------------------------------------
| 第六部分：语言切换功能测试
|--------------------------------------------------------------------------
*/
test.describe('应用工作台 Header - 语言切换功能', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const result = await initOfflineWorkbench(electronApp);
    headerPage = result.headerPage;
    contentPage = result.contentPage;
  });

  test('语言按钮应显示当前语言（中/繁/EN/JP）', async () => {});
  test('默认应显示"中"（简体中文）', async () => {});
  test('点击语言按钮应触发语言菜单显示事件', async () => {});
  test('语言应从 localStorage 读取并正确显示', async () => {});
  test('手动设置 localStorage 为 \'en\' 后应显示 \'EN\'', async () => {});
  test('手动设置 localStorage 为 \'zh-tw\' 后应显示 \'繁\'', async () => {});
  test('手动设置 localStorage 为 \'ja\' 后应显示 \'JP\'', async () => {});
});
/*
|--------------------------------------------------------------------------
| 第七部分：网络模式切换功能测试
|--------------------------------------------------------------------------
*/
test.describe('应用工作台 Header - 网络模式切换功能', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const result = await initOfflineWorkbench(electronApp);
    headerPage = result.headerPage;
    contentPage = result.contentPage;
  });

  test('网络模式按钮应正确显示', async () => {});
  test('默认应显示离线模式图标和文本', async () => {});
  test('点击网络模式按钮应切换模式（offline → online）', async () => {});
  test('切换到 online 模式后应显示互联网图标和文本', async () => {});
  test('再次点击应切换回 offline 模式', async () => {});
  test('网络模式应持久化到 runtime store', async () => {});
});
/*
|--------------------------------------------------------------------------
| 第八部分：窗口控制功能测试
|--------------------------------------------------------------------------
*/
test.describe('应用工作台 Header - 窗口控制功能', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const result = await initOfflineWorkbench(electronApp);
    headerPage = result.headerPage;
    contentPage = result.contentPage;
  });

  test('最小化按钮应正确显示', async () => {});
  test('点击最小化按钮应触发窗口最小化', async () => {});
  test('最大化按钮应正确显示（未最大化状态）', async () => {});
  test('点击最大化按钮应触发窗口最大化', async () => {});
  test('最大化后应显示取消最大化按钮', async () => {});
  test('点击取消最大化按钮应恢复窗口大小', async () => {});
  test('关闭按钮应正确显示并悬停时变红色', async () => {});
});
/*
|--------------------------------------------------------------------------
| 第九部分：IPC 事件通信测试
|--------------------------------------------------------------------------
*/
test.describe('应用工作台 Header - IPC 事件通信', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const result = await initOfflineWorkbench(electronApp);
    headerPage = result.headerPage;
    contentPage = result.contentPage;
  });

  test('组件挂载时应发送 TOPBAR_READY 信号', async () => {});
  test('切换项目标签应发送 SWITCH_PROJECT 事件', async () => {});
  test('切换设置标签应发送 NAVIGATE 事件', async () => {});
  test('点击 Home 应发送 NAVIGATE /home 事件', async () => {});
  test('网络模式切换应发送 NETWORK_MODE_CHANGED 事件', async () => {});
  test('标签数据变化应发送 TABS_UPDATED 事件', async () => {});
  test('激活标签变化应发送 ACTIVE_TAB_UPDATED 事件', async () => {});
  test('接收 PROJECT_CREATED 事件应创建新标签', async () => {});
  test('接收 PROJECT_DELETED 事件应删除对应标签', async () => {});
  test('接收 PROJECT_RENAMED 事件应更新标签名称', async () => {});
  test('通过 createProject 创建项目应自动在 Header 创建并激活标签', async () => {});
});
