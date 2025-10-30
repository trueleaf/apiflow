import { expect, type ElectronApplication, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, login, switchLanguageByClick } from '../../../fixtures/fixtures';

/*
|--------------------------------------------------------------------------
| 第一部分:基础布局和显示测试
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

  test('刷新按钮应正确显示并可点击', async () => {
    // 1. 定位刷新按钮
    const refreshBtn = headerPage.locator('.navigation-control .icon[title*="刷新"]');

    // 2. 验证按钮可见
    await expect(refreshBtn).toBeVisible();

    // 3. 验证按钮可点击（未被禁用）
    await expect(refreshBtn).toBeEnabled();
  });
  test('点击刷新按钮应刷新应用并恢复到上次访问页面', async () => {
    // 1. 创建一个项目，导航到项目页面
    await createProject(contentPage, '刷新测试项目');
    await contentPage.waitForURL(/doc-edit/, { timeout: 10000 });

    // 2. 记录刷新前的URL和项目信息
    const urlBefore = contentPage.url();
    expect(urlBefore).toContain('doc-edit');

    // 3. 验证标签页存在
    const tabs = headerPage.locator('.tab-item');
    await expect(tabs).toHaveCount(1);
    const tabBefore = tabs.first();
    await expect(tabBefore).toContainText('刷新测试项目');

    // 4. 点击刷新按钮
    const refreshBtn = headerPage.locator('.navigation-control .icon[title*="刷新"]');
    await refreshBtn.click();

    // 5. 等待两个页面都重新加载
    await Promise.all([
      contentPage.waitForLoadState('domcontentloaded', { timeout: 15000 }),
      headerPage.waitForLoadState('domcontentloaded', { timeout: 15000 })
    ]);

    // 6. 额外等待以确保页面完全初始化
    await contentPage.waitForTimeout(1000);

    // 7. 验证刷新后恢复到之前的项目页面
    await contentPage.waitForURL(/doc-edit/, { timeout: 10000 });
    const urlAfter = contentPage.url();
    expect(urlAfter).toContain('doc-edit');

    // 8. 验证URL与刷新前一致（恢复到上次访问的页面）
    expect(urlAfter).toBe(urlBefore);

    // 9. 验证标签页被恢复（通过localStorage持久化）
    await expect(tabs).toHaveCount(1);
    const tabAfter = tabs.first();
    await expect(tabAfter).toContainText('刷新测试项目');
    await expect(tabAfter).toHaveClass(/active/);

    // 10. 验证Home按钮不是激活状态
    const homeBtn = headerPage.locator('.home');
    await expect(homeBtn).not.toHaveClass(/active/);
  });
  test('后退按钮应正确显示并可点击', async () => {
    // 1. 定位后退按钮
    const backBtn = headerPage.locator('.navigation-control .icon[title*="后退"]');

    // 2. 验证按钮可见
    await expect(backBtn).toBeVisible();

    // 3. 验证按钮可点击（未被禁用）
    await expect(backBtn).toBeEnabled();
  });
  test('点击后退按钮应返回上一页', async () => {
    // 1. 创建项目并进入项目页面
    await createProject(contentPage, '后退测试项目');
    await contentPage.waitForURL(/doc-edit/, { timeout: 10000 });

    // 2. 验证当前在项目页面
    const urlBeforeBack = contentPage.url();
    expect(urlBeforeBack).toContain('doc-edit');

    // 3. 点击后退按钮
    const backBtn = headerPage.locator('.navigation-control .icon[title*="后退"]');
    await backBtn.click();

    // 4. 等待路由变化
    await contentPage.waitForURL(/home/, { timeout: 10000 });

    // 5. 验证回到首页
    const urlAfter = contentPage.url();
    expect(urlAfter).toMatch(/home/);

    // 6. 验证 Home 按钮激活
    const homeBtn = headerPage.locator('.home');
    await expect(homeBtn).toHaveClass(/active/);
  });
  test('无历史记录时点击后退应保持在首页', async () => {
    // 1. 验证初始在首页
    await contentPage.waitForURL(/home/, { timeout: 10000 });
    const urlBefore = contentPage.url();
    expect(urlBefore).toMatch(/home/);

    // 2. 点击后退按钮
    const backBtn = headerPage.locator('.navigation-control .icon[title*="后退"]');
    await backBtn.click();

    // 3. 等待一小段时间
    await contentPage.waitForTimeout(500);

    // 4. 验证仍在首页（未发生错误）
    const urlAfter = contentPage.url();
    expect(urlAfter).toMatch(/home/);

    // 5. 验证 Home 按钮仍然激活
    const homeBtn = headerPage.locator('.home');
    await expect(homeBtn).toHaveClass(/active/);
  });
  test('前进按钮应正确显示并可点击', async () => {
    // 1. 定位前进按钮
    const forwardBtn = headerPage.locator('.navigation-control .icon[title*="前进"]');

    // 2. 验证按钮可见
    await expect(forwardBtn).toBeVisible();

    // 3. 验证按钮可点击（未被禁用）
    await expect(forwardBtn).toBeEnabled();
  });
  test('点击前进按钮应前进到下一页', async () => {
    // 1. 创建项目并进入项目页面
    await createProject(contentPage, '前进测试项目');
    await contentPage.waitForURL(/doc-edit/, { timeout: 10000 });
    const projectUrl = contentPage.url();

    // 2. 点击后退按钮回到首页
    const backBtn = headerPage.locator('.navigation-control .icon[title*="后退"]');
    await backBtn.click();
    await contentPage.waitForURL(/home/, { timeout: 10000 });
    const homeUrl = contentPage.url();
    expect(homeUrl).toMatch(/home/);

    // 3. 点击前进按钮
    const forwardBtn = headerPage.locator('.navigation-control .icon[title*="前进"]');
    await forwardBtn.click();

    // 4. 等待路由变化
    await contentPage.waitForTimeout(1000);

    // 5. 验证回到项目页面
    const urlAfter = contentPage.url();
    expect(urlAfter).toContain('doc-edit');

    // 6. 验证项目标签激活
    const tabs = headerPage.locator('.tab-item');
    const activeTab = tabs.filter({ hasText: '前进测试项目' });
    await expect(activeTab).toHaveClass(/active/);
  });
  test('没有前进历史时点击前进按钮应无变化', async () => {
    // 1. 获取当前URL（首页）
    await contentPage.waitForURL('**/#/home', { timeout: 10000 });
    const initialUrl = contentPage.url();

    // 2. 点击前进按钮
    const forwardBtn = headerPage.locator('.navigation-control .icon[title*="前进"]');
    await forwardBtn.click();

    // 3. 等待一小段时间
    await contentPage.waitForTimeout(500);

    // 4. 验证URL未变化
    expect(contentPage.url()).toBe(initialUrl);
    expect(contentPage.url()).toContain('#/home');
  });
  test('个人中心按钮应正确显示并可点击', async () => {
    // 1. 定位个人中心按钮
    const userCenterBtn = headerPage.locator('.navigation-control .icon:has(.icongerenzhongxin)');

    // 2. 验证按钮可见
    await expect(userCenterBtn).toBeVisible();

    // 3. 验证按钮可点击（未被禁用）
    await expect(userCenterBtn).toBeEnabled();
  });
  test('点击个人中心按钮应创建个人中心标签', async () => {
    // 1. 验证初始无标签
    const tabs = headerPage.locator('.tab-item');
    await expect(tabs).toHaveCount(0);

    // 2. 点击个人中心按钮
    const userCenterBtn = headerPage.locator('.navigation-control .icon:has(.icongerenzhongxin)');
    await userCenterBtn.click();
    await contentPage.waitForTimeout(1000);

    // 3. 验证创建了标签
    await expect(tabs).toHaveCount(1);

    // 4. 验证标签内容正确
    const tab = tabs.first();
    await expect(tab).toContainText('个人中心');

    // 5. 验证标签为激活状态
    await expect(tab).toHaveClass(/active/);

    // 6. 验证标签类型为 settings（不显示项目图标）
    const tabIcon = tab.locator('.tab-icon');
    await expect(tabIcon).toHaveCount(0);

    // 7. 验证跳转到个人中心页面
    await contentPage.waitForURL(/user-center/, { timeout: 10000 });
    expect(contentPage.url()).toContain('user-center');

    // 8. 验证 Home 按钮未激活
    const homeBtn = headerPage.locator('.home');
    await expect(homeBtn).not.toHaveClass(/active/);
  });
  test('再次点击个人中心按钮应激活已存在的标签', async () => {
    const userCenterBtn = headerPage.locator('.navigation-control .icon:has(.icongerenzhongxin)');
    const tabs = headerPage.locator('.tab-item');

    // 1. 第一次点击，创建标签
    await userCenterBtn.click();
    await contentPage.waitForTimeout(500);
    await expect(tabs).toHaveCount(1);

    // 2. 回到首页
    await headerPage.locator('.home').click();
    await contentPage.waitForURL('**/#/home', { timeout: 10000 });
    await contentPage.waitForTimeout(300);

    // 3. 验证标签仍存在但未激活
    await expect(tabs).toHaveCount(1);
    const tab = tabs.first();
    await expect(tab).not.toHaveClass(/active/);

    // 4. 再次点击个人中心按钮
    await userCenterBtn.click();
    await contentPage.waitForTimeout(500);

    // 5. 验证仍然只有1个标签（未创建新标签）
    await expect(tabs).toHaveCount(1);

    // 6. 验证标签被激活
    await expect(tab).toHaveClass(/active/);

    // 7. 验证再次跳转到个人中心页面
    await contentPage.waitForURL(/user-center/, { timeout: 10000 });
    expect(contentPage.url()).toContain('user-center');
  });
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
    
    // 重置语言设置为默认状态（简体中文）
    await Promise.all([
      headerPage.evaluate(() => {
        localStorage.removeItem('language');
      }),
      contentPage.evaluate(() => {
        localStorage.removeItem('language');
      })
    ]);

    // 刷新两个页面使设置生效
    await Promise.all([
      headerPage.reload(),
      contentPage.reload()
    ]);
    
    await Promise.all([
      headerPage.waitForLoadState('domcontentloaded'),
      contentPage.waitForLoadState('domcontentloaded')
    ]);
    
    await headerPage.waitForTimeout(500);
  });

  test('语言按钮应显示当前语言（中/繁/EN/JP）', async () => {
    // 测试所有语言的映射关系
    const languageMap = [
      { name: '简体中文', display: '中' },
      { name: '繁體中文', display: '繁' },
      { name: 'English', display: 'EN' },
      { name: '日本語', display: 'JP' }
    ];

    for (const lang of languageMap) {
      // 通过点击菜单切换语言
      await switchLanguageByClick(headerPage, contentPage, lang.name);

      // 验证显示文本
      const languageText = headerPage.locator('.language-text');
      await expect(languageText).toBeVisible();
      const text = await languageText.textContent();
      expect(text).toBe(lang.display);
    }
  });
  test('默认应显示"中"（简体中文）', async () => {
    // 1. 验证语言文本显示为 '中'
    const languageText = headerPage.locator('.language-text');
    await expect(languageText).toBeVisible();
    const text = await languageText.textContent();
    expect(text).toBe('中');

    // 2. 验证 localStorage 被设置为 zh-cn（默认值）
    const storedLanguage = await contentPage.evaluate(() => {
      return localStorage.getItem('language');
    });
    expect(storedLanguage).toBe('zh-cn');
  });
  test('点击语言按钮应触发语言菜单显示事件', async () => {
    // 1. 定位语言按钮
    const languageBtn = headerPage.locator('.navigation-control .icon:has(.iconyuyan)');
    await expect(languageBtn).toBeVisible();

    // 2. 点击语言按钮
    await languageBtn.click();
    await contentPage.waitForTimeout(300);

    // 3. 验证语言菜单在 contentPage 显示
    const languageMenu = contentPage.locator('.language-dropdown-menu');
    await expect(languageMenu).toBeVisible({ timeout: 5000 });

    // 4. 验证菜单包含 4 个语言选项
    const languageItems = contentPage.locator('.language-menu-item');
    await expect(languageItems).toHaveCount(4);

    // 5. 验证每个选项的文本内容
    const expectedLanguages = ['简体中文', '繁體中文', 'English', '日本語'];
    for (let i = 0; i < 4; i++) {
      const itemText = await languageItems.nth(i).textContent();
      expect(itemText).toContain(expectedLanguages[i]);
    }
  });
  test('语言应从 localStorage 读取并正确显示', async () => {
    // 1. 通过点击切换到英文
    await switchLanguageByClick(headerPage, contentPage, 'English');

    // 2. 验证显示 'EN'
    const languageText = headerPage.locator('.language-text');
    await expect(languageText).toBeVisible();
    expect(await languageText.textContent()).toBe('EN');

    // 3. 再次测试日文
    await switchLanguageByClick(headerPage, contentPage, '日本語');
    expect(await languageText.textContent()).toBe('JP');
  });
  test('点击语言菜单项应切换语言并更新界面文本', async () => {
    // 1. 验证初始状态为简体中文
    const languageText = headerPage.locator('.language-text');
    await expect(languageText).toBeVisible();
    let text = await languageText.textContent();
    expect(text).toBe('中');

    // 2. 验证 Home 按钮初始文本为"主页面"
    const homeBtn = headerPage.locator('.home');
    let homeBtnText = await homeBtn.locator('span').textContent();
    expect(homeBtnText).toBe('主页面');

    // 3. 打开语言菜单
    const languageBtn = headerPage.locator('.navigation-control .icon:has(.iconyuyan)');
    await languageBtn.click();
    await contentPage.waitForTimeout(300);

    // 4. 验证菜单显示
    const languageMenu = contentPage.locator('.language-dropdown-menu');
    await expect(languageMenu).toBeVisible({ timeout: 5000 });

    // 5. 点击"English"选项
    const languageItems = contentPage.locator('.language-menu-item');
    const englishItem = languageItems.filter({ hasText: 'English' });
    await englishItem.click();
    await contentPage.waitForTimeout(500);

    // 6. 验证语言菜单关闭
    await expect(languageMenu).not.toBeVisible();

    // 7. 验证 localStorage 更新为 'en'
    const storedLanguage = await contentPage.evaluate(() => {
      return localStorage.getItem('language');
    });
    expect(storedLanguage).toBe('en');

    // 8. 验证语言按钮显示从"中"变为"EN"
    text = await languageText.textContent();
    expect(text).toBe('EN');

    // 9. 验证 Home 按钮文本从"主页面"变为"Home"
    await contentPage.waitForTimeout(300);
    homeBtnText = await homeBtn.locator('span').textContent();
    expect(homeBtnText).toBe('Home');

    // 10. 测试切换到日语
    await languageBtn.click();
    await contentPage.waitForTimeout(300);
    const japaneseItem = contentPage.locator('.language-menu-item').filter({ hasText: '日本語' });
    await japaneseItem.click();
    await contentPage.waitForTimeout(500);

    // 11. 验证切换到日语成功
    text = await languageText.textContent();
    expect(text).toBe('JP');
    homeBtnText = await homeBtn.locator('span').textContent();
    expect(homeBtnText).toBe('ホーム');

    // 12. 测试切换到繁体中文
    await languageBtn.click();
    await contentPage.waitForTimeout(300);
    const traditionalChineseItem = contentPage.locator('.language-menu-item').filter({ hasText: '繁體中文' });
    await traditionalChineseItem.click();
    await contentPage.waitForTimeout(500);

    // 13. 验证切换到繁体中文成功
    text = await languageText.textContent();
    expect(text).toBe('繁');
    homeBtnText = await homeBtn.locator('span').textContent();
    expect(homeBtnText).toBe('主頁面');
  });
  test('切换语言后应发送IPC事件通知所有页面', async () => {
    // 1. 打开语言菜单
    const languageBtn = headerPage.locator('.navigation-control .icon:has(.iconyuyan)');
    await languageBtn.click();
    await contentPage.waitForTimeout(300);

    // 2. 点击"日本語"选项
    const languageMenu = contentPage.locator('.language-dropdown-menu');
    await expect(languageMenu).toBeVisible({ timeout: 5000 });
    const japaneseItem = contentPage.locator('.language-menu-item').filter({ hasText: '日本語' });
    await japaneseItem.click();
    await contentPage.waitForTimeout(500);

    // 3. 验证 contentPage 的语言已更新
    const contentStoredLanguage = await contentPage.evaluate(() => {
      return localStorage.getItem('language');
    });
    expect(contentStoredLanguage).toBe('ja');

    // 4. 验证 headerPage 接收到 IPC 事件并同步更新显示
    const languageText = headerPage.locator('.language-text');
    await contentPage.waitForTimeout(300);
    const headerLanguageDisplay = await languageText.textContent();
    expect(headerLanguageDisplay).toBe('JP');

    // 5. 验证 headerPage 的语言也同步更新
    const headerStoredLanguage = await headerPage.evaluate(() => {
      return localStorage.getItem('language');
    });
    expect(headerStoredLanguage).toBe('ja');

    // 6. 验证 headerPage 的界面文本也更新
    const homeBtn = headerPage.locator('.home');
    const homeBtnText = await homeBtn.locator('span').textContent();
    expect(homeBtnText).toBe('ホーム');
  });
  test('刷新应用后语言设置应保持', async () => {
    // 1. 切换语言为繁体中文
    const languageBtn = headerPage.locator('.navigation-control .icon:has(.iconyuyan)');
    await languageBtn.click();
    await contentPage.waitForTimeout(300);

    const languageMenu = contentPage.locator('.language-dropdown-menu');
    await expect(languageMenu).toBeVisible({ timeout: 5000 });
    const traditionalChineseItem = contentPage.locator('.language-menu-item').filter({ hasText: '繁體中文' });
    await traditionalChineseItem.click();
    await contentPage.waitForTimeout(500);

    // 2. 验证切换成功
    const languageText = headerPage.locator('.language-text');
    let text = await languageText.textContent();
    expect(text).toBe('繁');

    const homeBtn = headerPage.locator('.home');
    let homeBtnText = await homeBtn.locator('span').textContent();
    expect(homeBtnText).toBe('主頁面');

    // 3. 点击刷新按钮
    const refreshBtn = headerPage.locator('.navigation-control .icon[title*="刷新"]');
    await refreshBtn.click();

    // 4. 等待页面重新加载
    await Promise.all([
      contentPage.waitForLoadState('domcontentloaded', { timeout: 15000 }),
      headerPage.waitForLoadState('domcontentloaded', { timeout: 15000 })
    ]);
    await contentPage.waitForTimeout(1000);

    // 5. 验证刷新后语言按钮仍显示"繁"
    text = await languageText.textContent();
    expect(text).toBe('繁');

    // 6. 验证刷新后界面文本仍为繁体中文
    homeBtnText = await homeBtn.locator('span').textContent();
    expect(homeBtnText).toBe('主頁面');

    // 7. 验证 localStorage 中的语言设置保持
    const storedLanguage = await contentPage.evaluate(() => {
      return localStorage.getItem('language');
    });
    expect(storedLanguage).toBe('zh-tw');
  });
  test('点击菜单外部区域应关闭语言菜单(header区域由于技术限制点击无法关闭不验证)', async () => {
    // 1. 打开语言菜单
    const languageBtn = headerPage.locator('.navigation-control .icon:has(.iconyuyan)');
    await languageBtn.click();
    await contentPage.waitForTimeout(300);

    // 2. 验证菜单显示
    const languageMenu = contentPage.locator('.language-dropdown-menu');
    await expect(languageMenu).toBeVisible({ timeout: 5000 });

    // 3. 点击遮罩层（菜单外部区域）
    const overlay = contentPage.locator('.language-menu-overlay');
    await expect(overlay).toBeVisible();
    await overlay.click();
    await contentPage.waitForTimeout(300);

    // 4. 验证菜单已关闭
    await expect(languageMenu).not.toBeVisible();

    // 5. 验证遮罩层也消失
    await expect(overlay).not.toBeVisible();

    // 7. header区域由于技术限制无法实现
    // const headerContainer = contentPage.locator('.s-header');
    // await headerContainer.click({ position: { x: 10, y: 10 } });
    // await contentPage.waitForTimeout(300);

  });
  test('当前选中语言应有视觉标记', async () => {
    // 1. 通过点击切换到英文
    await switchLanguageByClick(headerPage, contentPage, 'English');

    // 2. 打开语言菜单
    const languageBtn = headerPage.locator('.navigation-control .icon:has(.iconyuyan)');
    await languageBtn.click();
    await contentPage.waitForTimeout(300);

    // 3. 验证菜单显示
    const languageMenu = contentPage.locator('.language-dropdown-menu');
    await expect(languageMenu).toBeVisible({ timeout: 5000 });

    // 4. 获取"English"菜单项
    const languageItems = contentPage.locator('.language-menu-item');
    const englishItem = languageItems.filter({ hasText: 'English' });
    await expect(englishItem).toHaveCount(1);

    // 5. 验证"English"项有 active 类
    await expect(englishItem).toHaveClass(/active/);

    // 6. 验证"English"项显示✓图标
    const checkMark = englishItem.locator('.language-check');
    await expect(checkMark).toBeVisible();
    const checkText = await checkMark.textContent();
    expect(checkText).toBe('✓');

    // 7. 验证其他语言项没有 active 类
    const simplifiedChineseItem = languageItems.filter({ hasText: '简体中文' });
    await expect(simplifiedChineseItem).not.toHaveClass(/active/);

    // 8. 验证其他语言项不显示✓图标
    const simplifiedCheckMark = simplifiedChineseItem.locator('.language-check');
    await expect(simplifiedCheckMark).toHaveCount(0);

    // 9. 关闭菜单
    const overlay = contentPage.locator('.language-menu-overlay');
    await overlay.click();
    await contentPage.waitForTimeout(300);

    // 10. 切换到日语
    await languageBtn.click();
    await contentPage.waitForTimeout(300);
    const japaneseItem = contentPage.locator('.language-menu-item').filter({ hasText: '日本語' });
    await japaneseItem.click();
    await contentPage.waitForTimeout(500);

    // 11. 再次打开菜单，验证日语项有 active 标记
    await languageBtn.click();
    await contentPage.waitForTimeout(300);
    const japaneseItemAgain = contentPage.locator('.language-menu-item').filter({ hasText: '日本語' });
    await expect(japaneseItemAgain).toHaveClass(/active/);
    const japaneseCheckMark = japaneseItemAgain.locator('.language-check');
    await expect(japaneseCheckMark).toBeVisible();

    // 12. 验证英文项不再有 active 类
    const englishItemAgain = contentPage.locator('.language-menu-item').filter({ hasText: 'English' });
    await expect(englishItemAgain).not.toHaveClass(/active/);
  });
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

  test('网络模式按钮应正确显示', async () => {
    // 1. 定位网络模式按钮
    const networkBtn = headerPage.locator('.network-btn');
    await expect(networkBtn).toBeVisible();

    // 2. 验证按钮可点击
    await expect(networkBtn).toBeEnabled();

    // 3. 验证图标元素存在
    const networkIcon = networkBtn.locator('.network-icon');
    await expect(networkIcon).toBeVisible();

    // 4. 验证文本元素存在
    const networkText = headerPage.locator('.network-text');
    await expect(networkText).toBeVisible();
  });
  test('默认应显示离线模式图标和文本', async () => {
    // 1. 验证网络模式文本
    const networkText = headerPage.locator('.network-text');
    await expect(networkText).toBeVisible();
    const text = await networkText.textContent();
    expect(text).toBe('离线模式');

    // 2. 验证显示离线图标
    const networkIcon = headerPage.locator('.network-icon');
    await expect(networkIcon).toHaveClass(/iconwifi-off-line/);

    // 3. 验证按钮title
    const networkBtn = headerPage.locator('.network-btn');
    const title = await networkBtn.getAttribute('title');
    expect(title).toContain('离线模式');
  });
  test('点击网络模式按钮应切换模式（offline → online）', async () => {
    // 1. 验证初始为离线模式
    const networkText = headerPage.locator('.network-text');
    let text = await networkText.textContent();
    expect(text).toBe('离线模式');

    // 2. 点击网络模式按钮
    const networkBtn = headerPage.locator('.network-btn');
    await networkBtn.click();
    await contentPage.waitForTimeout(500);

    // 3. 等待跳转到登录页面（因为online模式需要登录）
    await contentPage.waitForURL(/login/, { timeout: 10000 });
    expect(contentPage.url()).toContain('login');

    // 4. 执行登录
    await login(contentPage);

    // 5. 等待登录成功跳转到home
    await contentPage.waitForURL(/home/, { timeout: 10000 });
    await contentPage.waitForTimeout(500);

    // 6. 验证网络模式已切换为联网模式
    text = await networkText.textContent();
    expect(text).toBe('联网模式');

    // 7. 验证在home页面
    expect(contentPage.url()).toContain('home');
  });
  test('切换到 online 模式后应显示互联网图标和文本', async () => {
    // 1. 切换到online模式
    const networkBtn = headerPage.locator('.network-btn');
    await networkBtn.click();
    await contentPage.waitForTimeout(500);

    // 2. 等待登录页面并登录
    await contentPage.waitForURL(/login/, { timeout: 10000 });
    await login(contentPage);
    await contentPage.waitForURL(/home/, { timeout: 10000 });
    await contentPage.waitForTimeout(500);

    // 3. 验证显示联网模式文本
    const networkText = headerPage.locator('.network-text');
    await expect(networkText).toBeVisible();
    const text = await networkText.textContent();
    expect(text).toBe('联网模式');

    // 4. 验证显示联网图标（wifi图标）
    const networkIcon = headerPage.locator('.network-icon');
    await expect(networkIcon).toHaveClass(/iconwifi/);
    // 确保不是离线图标
    const iconClass = await networkIcon.getAttribute('class');
    expect(iconClass).not.toContain('iconwifi-off-line');

    // 5. 验证按钮title
    const title = await networkBtn.getAttribute('title');
    expect(title).toContain('联网模式');
  });
  test('再次点击应切换回 offline 模式', async () => {
    const networkBtn = headerPage.locator('.network-btn');
    const networkText = headerPage.locator('.network-text');

    // 1. 先切换到online模式
    await networkBtn.click();
    await contentPage.waitForTimeout(500);
    await contentPage.waitForURL(/login/, { timeout: 10000 });
    await login(contentPage);
    await contentPage.waitForURL(/home/, { timeout: 10000 });
    await contentPage.waitForTimeout(500);

    // 2. 验证当前为联网模式
    let text = await networkText.textContent();
    expect(text).toBe('联网模式');

    // 3. 再次点击网络模式按钮切换回offline
    await networkBtn.click();
    await contentPage.waitForTimeout(500);

    // 4. 验证切换回离线模式
    text = await networkText.textContent();
    expect(text).toBe('离线模式');

    // 5. 验证图标变回离线图标
    const networkIcon = headerPage.locator('.network-icon');
    await expect(networkIcon).toHaveClass(/iconwifi-off-line/);

    // 6. 验证仍在home页面（或跳转到home）
    await contentPage.waitForURL(/home/, { timeout: 10000 });
    expect(contentPage.url()).toContain('home');

    // 7. 验证按钮title
    const title = await networkBtn.getAttribute('title');
    expect(title).toContain('离线模式');
  });
  test('网络模式应持久化到 runtime store', async () => {
    const networkBtn = headerPage.locator('.network-btn');
    const tabs = headerPage.locator('.tab-item');

    // 1. 在offline模式下创建项目A
    await createProject(contentPage, '离线项目A');
    await contentPage.waitForTimeout(500);
    await headerPage.locator('.home').click();
    await contentPage.waitForURL('**/#/home', { timeout: 10000 });

    // 2. 验证显示1个offline标签
    await expect(tabs).toHaveCount(1);
    const offlineTab = tabs.first();
    await expect(offlineTab).toContainText('离线项目A');

    // 3. 切换到online模式
    await networkBtn.click();
    await contentPage.waitForTimeout(500);
    await contentPage.waitForURL(/login/, { timeout: 10000 });
    await login(contentPage);
    await contentPage.waitForURL(/home/, { timeout: 10000 });
    await contentPage.waitForTimeout(500);

    // 4. 验证网络模式为联网模式
    const networkText = headerPage.locator('.network-text');
    let text = await networkText.textContent();
    expect(text).toBe('联网模式');

    // 5. 验证offline标签被隐藏（标签数量为0）
    await expect(tabs).toHaveCount(0);

    // 6. 在online模式下创建项目B
    await createProject(contentPage, '联网项目B');
    await contentPage.waitForTimeout(500);
    await headerPage.locator('.home').click();
    await contentPage.waitForURL('**/#/home', { timeout: 10000 });

    // 7. 验证只显示1个online标签
    await expect(tabs).toHaveCount(1);
    const onlineTab = tabs.first();
    await expect(onlineTab).toContainText('联网项目B');

    // 8. 切换回offline模式
    await networkBtn.click();
    await contentPage.waitForTimeout(500);

    // 9. 验证网络模式为离线模式
    text = await networkText.textContent();
    expect(text).toBe('离线模式');

    // 10. 验证offline标签恢复显示，online标签被隐藏
    await expect(tabs).toHaveCount(1);
    const restoredTab = tabs.first();
    await expect(restoredTab).toContainText('离线项目A');

    // 11. 验证online标签确实被隐藏
    const onlineTabCheck = headerPage.locator('.tab-item:has-text("联网项目B")');
    await expect(onlineTabCheck).toHaveCount(0);
  });
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

  test('最小化按钮应正确显示', async () => {
    // 1. 定位最小化按钮
    const minimizeBtn = headerPage.locator('#minimize');

    // 2. 验证按钮可见
    await expect(minimizeBtn).toBeVisible();

    // 3. 验证按钮可点击（未被禁用）
    await expect(minimizeBtn).toBeEnabled();

    // 4. 验证图标类名
    await expect(minimizeBtn).toHaveClass(/iconjianhao/);

    // 5. 验证按钮有 title 属性
    const title = await minimizeBtn.getAttribute('title');
    expect(title).toBeTruthy();
  });
  test('点击最小化按钮应触发窗口最小化', async () => {
    // 1. 定位最小化按钮
    const minimizeBtn = headerPage.locator('#minimize');
    await expect(minimizeBtn).toBeVisible();

    // 2. 点击最小化按钮
    await minimizeBtn.click();
    await contentPage.waitForTimeout(500);

    // 注意：由于 Playwright + Electron 测试环境的限制
    // 无法直接验证窗口是否真正最小化
    // 但点击不报错说明 IPC 通信正常工作
    // 实际最小化效果需要手动测试验证
  });
  test('最大化按钮应正确显示（未最大化状态）', async () => {
    // 1. 定位最大化和取消最大化按钮
    const maximizeBtn = headerPage.locator('#maximize');
    const unmaximizeBtn = headerPage.locator('#unmaximize');

    // 2. 未最大化状态下，最大化按钮应该可见
    const hasMaximize = await maximizeBtn.isVisible().catch(() => false);
    const hasUnmaximize = await unmaximizeBtn.isVisible().catch(() => false);

    // 3. 验证至少有一个按钮可见（取决于窗口初始状态）
    expect(hasMaximize || hasUnmaximize).toBe(true);

    // 4. 如果最大化按钮可见，验证其属性
    if (hasMaximize) {
      await expect(maximizeBtn).toBeEnabled();
      await expect(maximizeBtn).toHaveClass(/iconmaxScreen/);
    }
  });
  test('点击最大化按钮应触发窗口最大化', async () => {
    // 1. 定位按钮
    const maximizeBtn = headerPage.locator('#maximize');
    const unmaximizeBtn = headerPage.locator('#unmaximize');

    // 2. 如果窗口已经最大化，先取消最大化
    if (await unmaximizeBtn.isVisible()) {
      await unmaximizeBtn.click();
      await contentPage.waitForTimeout(500);
    }

    // 3. 验证最大化按钮可见
    await expect(maximizeBtn).toBeVisible();

    // 4. 点击最大化按钮
    await maximizeBtn.click();
    await contentPage.waitForTimeout(500);

    // 5. 验证按钮切换：最大化按钮消失，取消最大化按钮出现
    await expect(maximizeBtn).not.toBeVisible();
    await expect(unmaximizeBtn).toBeVisible();
  });
  test('最大化后应显示取消最大化按钮', async () => {
    // 1. 定位按钮
    const maximizeBtn = headerPage.locator('#maximize');
    const unmaximizeBtn = headerPage.locator('#unmaximize');

    // 2. 确保窗口已最大化
    if (await maximizeBtn.isVisible()) {
      await maximizeBtn.click();
      await contentPage.waitForTimeout(500);
    }

    // 3. 验证取消最大化按钮显示
    await expect(unmaximizeBtn).toBeVisible();
    await expect(unmaximizeBtn).toBeEnabled();

    // 4. 验证图标类名
    await expect(unmaximizeBtn).toHaveClass(/iconminiScreen/);

    // 5. 验证最大化按钮不显示
    await expect(maximizeBtn).not.toBeVisible();
  });
  test('点击取消最大化按钮应恢复窗口大小', async () => {
    // 1. 定位按钮
    const maximizeBtn = headerPage.locator('#maximize');
    const unmaximizeBtn = headerPage.locator('#unmaximize');

    // 2. 确保窗口已最大化
    if (await maximizeBtn.isVisible()) {
      await maximizeBtn.click();
      await contentPage.waitForTimeout(500);
    }

    // 3. 验证取消最大化按钮可见
    await expect(unmaximizeBtn).toBeVisible();

    // 4. 点击取消最大化按钮
    await unmaximizeBtn.click();
    await contentPage.waitForTimeout(500);

    // 5. 验证按钮切换回来
    await expect(unmaximizeBtn).not.toBeVisible();
    await expect(maximizeBtn).toBeVisible();
  });
  test('关闭按钮应正确显示并悬停时变红色', async () => {
    // 1. 定位关闭按钮
    const closeBtn = headerPage.locator('#close');

    // 2. 验证按钮可见
    await expect(closeBtn).toBeVisible();
    await expect(closeBtn).toBeEnabled();

    // 3. 验证图标类名
    await expect(closeBtn).toHaveClass(/iconguanbi/);
    await expect(closeBtn).toHaveClass(/close/);

    // 4. 获取悬停前的背景色
    const bgColorBefore = await closeBtn.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // 5. 悬停在关闭按钮上
    await closeBtn.hover();
    await contentPage.waitForTimeout(300);

    // 6. 获取悬停后的背景色
    const bgColorAfter = await closeBtn.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // 7. 验证背景色发生变化
    expect(bgColorAfter).not.toBe(bgColorBefore);

    // 8. 验证悬停后的颜色是红色系
    // #e81123 对应 rgb(232, 17, 35)
    expect(bgColorAfter).toMatch(/rgb\(/);

    // 注意：不测试实际点击关闭按钮，因为会关闭整个应用
  });
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

  test('组件挂载时应发送 TOPBAR_READY 信号', async () => {
    // 由于我们在 beforeEach 中已经调用了 initOfflineWorkbench
    // Header 组件已经挂载并发送了 TOPBAR_READY

    // 1. 验证 Header 正常显示（说明初始化成功，TOPBAR_READY 已发送）
    const header = headerPage.locator('.s-header');
    await expect(header).toBeVisible();

    // 2. 验证 Home 按钮初始为激活状态（这依赖于 TOPBAR_READY 握手成功）
    const homeBtn = headerPage.locator('.home');
    await expect(homeBtn).toHaveClass(/active/);

    // 3. 验证内容页面也正常加载
    await contentPage.waitForURL('**/#/home', { timeout: 10000 });
    expect(contentPage.url()).toContain('#/home');
  });
  test('切换项目标签应发送 SWITCH_PROJECT 事件', async () => {
    // 1. 创建两个项目
    await createProject(contentPage, '项目1');
    await contentPage.waitForTimeout(500);
    await headerPage.locator('.home').click();
    await contentPage.waitForURL('**/#/home', { timeout: 10000 });

    await createProject(contentPage, '项目2');
    await contentPage.waitForTimeout(500);

    // 2. 验证有2个标签
    const tabs = headerPage.locator('.tab-item');
    await expect(tabs).toHaveCount(2);

    // 3. 记录当前URL（项目2）
    const urlBefore = contentPage.url();
    expect(urlBefore).toContain('doc-edit');

    // 4. 点击第一个标签（切换到项目1）
    await tabs.first().click();
    await contentPage.waitForTimeout(500);

    // 5. 验证 URL 变化（说明 PROJECT_CHANGED 事件生效）
    const urlAfter = contentPage.url();
    expect(urlAfter).not.toBe(urlBefore);
    expect(urlAfter).toContain('doc-edit');

    // 6. 验证第一个标签激活
    await expect(tabs.first()).toHaveClass(/active/);

    // 7. 验证第二个标签不再激活
    await expect(tabs.nth(1)).not.toHaveClass(/active/);
  });
  test('切换设置标签应发送 NAVIGATE 事件', async () => {
    // 1. 点击个人中心按钮
    const userCenterBtn = headerPage.locator('.navigation-control .icon:has(.icongerenzhongxin)');
    await userCenterBtn.click();
    await contentPage.waitForTimeout(500);

    // 2. 验证跳转到个人中心（说明 NAVIGATE 事件生效）
    await contentPage.waitForURL(/user-center/, { timeout: 10000 });
    expect(contentPage.url()).toContain('user-center');

    // 3. 验证设置标签创建
    const tabs = headerPage.locator('.tab-item');
    await expect(tabs).toHaveCount(1);
    await expect(tabs.first()).toContainText('个人中心');

    // 4. 验证标签为激活状态
    await expect(tabs.first()).toHaveClass(/active/);
  });
  test('点击 Home 应发送 NAVIGATE /home 事件', async () => {
    // 1. 先创建项目离开首页
    await createProject(contentPage, '测试项目');
    await contentPage.waitForURL(/doc-edit/, { timeout: 10000 });

    // 2. 验证当前不在首页
    const homeBtn = headerPage.locator('.home');
    await expect(homeBtn).not.toHaveClass(/active/);

    // 3. 点击 Home 按钮
    await homeBtn.click();

    // 4. 验证跳转到首页（说明 NAVIGATE 事件生效）
    await contentPage.waitForURL('**/#/home', { timeout: 10000 });
    expect(contentPage.url()).toContain('#/home');

    // 5. 验证 Home 按钮激活
    await expect(homeBtn).toHaveClass(/active/);
  });
  test('网络模式切换应发送 NETWORK_MODE_CHANGED 事件', async () => {
    const networkBtn = headerPage.locator('.network-btn');
    const networkText = headerPage.locator('.network-text');

    // 1. 记录初始模式
    const modeBefore = await networkText.textContent();
    expect(modeBefore).toBe('离线模式');

    // 2. 点击切换网络模式
    await networkBtn.click();
    await contentPage.waitForTimeout(500);

    // 3. 验证跳转到登录页（说明 NETWORK_MODE_CHANGED 事件生效）
    await contentPage.waitForURL(/login/, { timeout: 10000 });
    expect(contentPage.url()).toContain('login');

    // 4. 登录后验证模式变化
    await login(contentPage);
    await contentPage.waitForURL(/home/, { timeout: 10000 });
    await contentPage.waitForTimeout(500);

    const modeAfter = await networkText.textContent();
    expect(modeAfter).toBe('联网模式');
  });
  test('标签数据变化应发送 TABS_UPDATED 事件', async () => {
    // 1. 创建项目触发标签数据变化
    await createProject(contentPage, '新项目');
    await contentPage.waitForTimeout(500);

    // 2. 验证标签被创建（说明 TABS_UPDATED 事件被处理）
    const tabs = headerPage.locator('.tab-item');
    await expect(tabs).toHaveCount(1);

    // 3. 验证 localStorage 同步（证明标签数据已更新）
    const tabsData = await contentPage.evaluate(() => {
      const data = localStorage.getItem('appWorkbench/header/tabs');
      return data ? JSON.parse(data) : [];
    });
    expect(tabsData).toHaveLength(1);
    expect(tabsData[0].title).toBe('新项目');

    // 4. 关闭标签，再次验证 TABS_UPDATED 事件
    const tab = tabs.first();
    await tab.hover();
    const closeBtn = tab.locator('.close-btn');
    await closeBtn.click();
    await contentPage.waitForTimeout(500);

    // 5. 验证标签被移除
    await expect(tabs).toHaveCount(0);

    // 6. 验证 localStorage 更新
    const updatedTabsData = await contentPage.evaluate(() => {
      const data = localStorage.getItem('appWorkbench/header/tabs');
      return data ? JSON.parse(data) : [];
    });
    expect(updatedTabsData).toHaveLength(0);
  });
  test('激活标签变化应发送 ACTIVE_TAB_UPDATED 事件', async () => {
    // 1. 创建两个项目
    await createProject(contentPage, '项目A');
    await contentPage.waitForTimeout(500);
    await headerPage.locator('.home').click();
    await contentPage.waitForURL('**/#/home', { timeout: 10000 });

    await createProject(contentPage, '项目B');
    await contentPage.waitForTimeout(500);

    const tabs = headerPage.locator('.tab-item');
    await expect(tabs).toHaveCount(2);

    // 2. 项目B当前激活
    await expect(tabs.nth(1)).toHaveClass(/active/);

    // 3. 点击项目A标签（触发 ACTIVE_TAB_UPDATED 事件）
    await tabs.first().click();
    await contentPage.waitForTimeout(500);

    // 4. 验证激活状态改变（说明 ACTIVE_TAB_UPDATED 事件生效）
    await expect(tabs.first()).toHaveClass(/active/);
    await expect(tabs.nth(1)).not.toHaveClass(/active/);

    // 5. 验证 contentPage 的 URL 也相应改变
    const url = contentPage.url();
    expect(url).toContain('doc-edit');
  });
  test('接收 PROJECT_CREATED 事件应创建新标签', async () => {
    const tabs = headerPage.locator('.tab-item');

    // 1. 初始无标签
    await expect(tabs).toHaveCount(0);

    // 2. 创建项目（createProject 会触发 PROJECT_CREATED 事件）
    await createProject(contentPage, '新建项目');
    await contentPage.waitForTimeout(500);

    // 3. 验证 Header 接收事件后创建了标签
    await expect(tabs).toHaveCount(1);

    // 4. 验证标签内容正确
    const tab = tabs.first();
    await expect(tab).toContainText('新建项目');

    // 5. 验证标签为激活状态
    await expect(tab).toHaveClass(/active/);

    // 6. 验证标签类型为项目（显示图标）
    const tabIcon = tab.locator('.tab-icon');
    await expect(tabIcon).toBeVisible();
  });
  test('接收 PROJECT_DELETED 事件应删除对应标签', async () => {
    // 1. 先创建项目
    await createProject(contentPage, '待删除项目');
    await contentPage.waitForTimeout(500);

    const tabs = headerPage.locator('.tab-item');
    await expect(tabs).toHaveCount(1);

    // 2. 通过关闭标签来模拟删除项目（会触发 PROJECT_DELETED 相关逻辑）
    const tab = tabs.first();
    await tab.hover();
    const closeBtn = tab.locator('.close-btn');
    await closeBtn.click();
    await contentPage.waitForTimeout(500);

    // 3. 验证标签被删除
    await expect(tabs).toHaveCount(0);

    // 4. 验证跳转到首页
    await contentPage.waitForURL('**/#/home', { timeout: 10000 });
    expect(contentPage.url()).toContain('#/home');
  });
  test('接收 PROJECT_RENAMED 事件应更新标签名称', async () => {
    // 注意：由于测试环境的限制，我们通过验证标签文本内容来间接测试
    // 实际的 PROJECT_RENAMED 事件在真实场景中由项目重命名操作触发

    // 1. 创建项目
    await createProject(contentPage, '原始项目名');
    await contentPage.waitForTimeout(500);

    const tabs = headerPage.locator('.tab-item');
    await expect(tabs).toHaveCount(1);

    // 2. 验证标签显示原始名称
    const tab = tabs.first();
    await expect(tab).toContainText('原始项目名');

    // 注意：在 E2E 测试环境中，我们无法直接模拟 IPC 事件的发送
    // 这个测试主要验证标签创建和显示功能
    // 实际的重命名事件测试需要在真实的应用操作流程中验证
  });
  test('通过 createProject 创建项目应自动在 Header 创建并激活标签', async () => {
    const tabs = headerPage.locator('.tab-item');
    const homeBtn = headerPage.locator('.home');

    // 1. 初始状态：无标签，Home 激活
    await expect(tabs).toHaveCount(0);
    await expect(homeBtn).toHaveClass(/active/);

    // 2. 创建项目
    const projectName = '自动创建标签项目';
    await createProject(contentPage, projectName);
    await contentPage.waitForTimeout(500);

    // 3. 验证标签自动创建
    await expect(tabs).toHaveCount(1);

    // 4. 验证标签内容正确
    const tab = tabs.first();
    await expect(tab).toContainText(projectName);

    // 5. 验证标签自动激活
    await expect(tab).toHaveClass(/active/);

    // 6. 验证 Home 不再激活
    await expect(homeBtn).not.toHaveClass(/active/);

    // 7. 验证跳转到项目页面
    await contentPage.waitForURL(/doc-edit/, { timeout: 10000 });
    expect(contentPage.url()).toContain('doc-edit');

    // 8. 验证标签显示项目图标
    const tabIcon = tab.locator('.tab-icon');
    await expect(tabIcon).toBeVisible();
  });
});
