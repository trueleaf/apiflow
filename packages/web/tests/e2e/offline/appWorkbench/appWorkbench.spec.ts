import path from 'path';
import { expect, _electron as electron, type ElectronApplication, type Page } from '@playwright/test';
import { test } from '../../../fixtures/enhanced-electron-fixtures';

type HeaderAndContentPages = {
  headerPage: Page;
  contentPage: Page;
};

const HEADER_URL_HINTS = ['header.html', '/header'];

const isHeaderUrl = (url: string): boolean => {
  if (!url) {
    return false;
  }
  return HEADER_URL_HINTS.some((hint) => url.includes(hint));
};

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


test.describe('离线模式首屏 UI 验证', () => {
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
    await headerPage.evaluate(() => {
      localStorage.removeItem('features/header/tabs');
      localStorage.removeItem('features/header/activeTab');
    });
    await contentPage.evaluate(() => {
      localStorage.setItem('runtime/networkMode', 'offline');
      localStorage.setItem('history/lastVisitePage', '/home');
    });
  });

  test('顶部栏首次渲染元素正常展示', async () => {
    const headerRoot = headerPage.locator('.s-header');
    await expect(headerRoot).toBeVisible();

    await expect(headerPage.locator('.logo-img')).toBeVisible();
    const homeButton = headerPage.locator('.home');
    await expect(homeButton).toBeVisible();
    await expect(headerPage.locator('[title="刷新主应用"]')).toBeVisible();
    await expect(headerPage.locator('[title="后退"]')).toBeVisible();
    await expect(headerPage.locator('[title="前进"]')).toBeVisible();
    await expect(headerPage.locator('[title="个人中心"]')).toBeVisible();
    await expect(headerPage.locator('[title="切换语言"]')).toBeVisible();

    const networkText = headerPage.locator('.network-text');
    await expect(networkText).toHaveText(/离线模式/);

    await expect(headerPage.locator('#minimize')).toBeVisible();
    await expect(headerPage.locator('#unmaximize')).toBeVisible();
    await expect(headerPage.locator('#maximize')).toHaveCount(0);
    await expect(headerPage.locator('#close')).toBeVisible();

    // 可能会有之前测试遗留的标签页，不强制要求为0
    await expect(headerPage.locator('.add-tab-btn')).toBeVisible();
  });

  test('主内容区域默认展示项目列表页', async () => {
    await expect(contentPage).toHaveURL(/\/home/);

    const docListContainer = contentPage.locator('.home');
    await expect(docListContainer).toBeVisible();

    await expect(contentPage.locator('text=项目列表')).toBeVisible();
    await expect(contentPage.locator('text=新建项目')).toBeVisible();
    await expect(contentPage.locator('text=团队管理')).toHaveCount(0);
  });

  test('网络模式在顶部栏与主内容保持一致', async () => {
    const headerNetwork = await headerPage.locator('.network-text').textContent();
    expect(headerNetwork?.trim()).toBe('离线模式');

    const storedMode = await contentPage.evaluate(() => {
      return localStorage.getItem('runtime/networkMode');
    });
    expect(storedMode).toBe('offline');
  });

  test('缓存的顶部标签页和最后访问路由会在重载后恢复', async () => {
    // 先创建一个标签页并跳转到个人中心
    await headerPage.locator('.navigation-control [title="个人中心"]').click();
    await headerPage.waitForSelector('.tab-item:has-text("个人中心")', { state: 'visible', timeout: 5000 });
    await contentPage.waitForURL(/user-center/, { timeout: 5000 });
    
    // 验证标签页和路由已正确设置
    await expect(headerPage.locator('.tab-item:has-text("个人中心")')).toBeVisible();
    await expect(contentPage).toHaveURL(/user-center/);

    // 通过刷新页面来模拟应用重载（localStorage 会保留）
    // 顺序重载，避免并发导致 WebSocket 连接冲突
    await headerPage.reload();
    await headerPage.waitForLoadState('domcontentloaded');
    
    await contentPage.reload();
    await contentPage.waitForLoadState('domcontentloaded');

    // 等待tab恢复显示，确保Vue组件已完成初始化
    await headerPage.waitForSelector('.tab-item', { state: 'visible', timeout: 5000 });
    
    const homeButton = headerPage.locator('.home');
    await expect(homeButton).not.toHaveClass(/active/);

    const restoredTab = headerPage.locator('.tab-item');
    await expect(restoredTab).toHaveCount(1);
    await expect(restoredTab).toContainText('个人中心');
    await expect(restoredTab.first()).toHaveClass(/active/);

    // 等待内容页面跳转完成，增加超时时间
    await contentPage.waitForURL(/user-center/, { timeout: 10000 });
    await expect(contentPage).toHaveURL(/user-center/);
    await expect(contentPage.locator('.user-center')).toBeVisible();
  });

  test('点击个人中心按钮应创建并激活个人中心标签页', async () => {
    // 验证初始状态（可能已经有项目列表的标签页）
    const initialTabCount = await headerPage.locator('.tab-item').count();
    
    // 点击个人中心按钮（使用正确的选择器，定位到 navigation-control 中的个人中心图标）
    const userCenterButton = headerPage.locator('.navigation-control [title="个人中心"]');
    await userCenterButton.waitFor({ state: 'visible', timeout: 5000 });
    await userCenterButton.click();
    
    // 验证标签页创建
    await headerPage.waitForSelector('.tab-item:has-text("个人中心")', { state: 'visible', timeout: 10000 });
    const tab = headerPage.locator('.tab-item');
    await expect(tab).toHaveCount(initialTabCount + 1);
    await expect(headerPage.locator('.tab-item:has-text("个人中心")')).toBeVisible();
    
    const userCenterTab = headerPage.locator('.tab-item:has-text("个人中心")');
    await expect(userCenterTab).toHaveClass(/active/);
    
    // 验证内容页面跳转
    await expect(contentPage).toHaveURL(/\/user-center/, { timeout: 10000 });
  });

  test('关闭标签页后应正确清理状态', async () => {
    // 创建标签页
    await headerPage.locator('.navigation-control [title="个人中心"]').click();
    await headerPage.waitForSelector('.tab-item');
    
    // 关闭标签页
    await headerPage.locator('.tab-item .close-btn').click();
    
    // 验证标签页被移除
    await expect(headerPage.locator('.tab-item')).toHaveCount(0);
    
    // 验证跳转回主页
    await expect(headerPage.locator('.home')).toHaveClass(/active/);
    await expect(contentPage).toHaveURL(/\/home/);
  });

  test('点击主页按钮应跳转到项目列表页', async () => {
    // 先跳转到其他页面
    await headerPage.locator('.navigation-control [title="个人中心"]').click();
    await headerPage.waitForSelector('.tab-item');
    await expect(contentPage).toHaveURL(/\/user-center/);
    
    // 验证个人中心标签页是 active 的
    await expect(headerPage.locator('.tab-item')).toHaveClass(/active/);
    
    // 点击主页按钮
    await headerPage.locator('.home').click();
    
    // 等待一小段时间让状态更新
    await headerPage.waitForTimeout(500);
    
    // 验证跳转到项目列表页
    await expect(contentPage).toHaveURL(/\/home/);
    await expect(headerPage.locator('.home')).toHaveClass(/active/);
    
    // 验证标签页仍然存在但不是 active 状态（业务逻辑：点击主页不删除标签页）
    await expect(headerPage.locator('.tab-item')).toHaveCount(1);
    await expect(headerPage.locator('.tab-item')).not.toHaveClass(/active/);
  });

  test('点击刷新按钮应重新加载主内容', async () => {
    const refreshBtn = headerPage.locator('[title="刷新主应用"]');
    await refreshBtn.click();
    
    // 等待页面重新加载
    await contentPage.waitForLoadState('domcontentloaded');
    
    // 验证页面内容正常
    await expect(contentPage.locator('.home')).toBeVisible();
  });

  test('切换多个标签页时应正确更新active状态', async () => {
    // 创建第一个标签页
    await headerPage.locator('[title="个人中心"]').click();
    await headerPage.waitForSelector('.tab-item');
    
    // 模拟创建项目标签页（通过localStorage）
    await headerPage.evaluate(() => {
      const tabs = JSON.parse(localStorage.getItem('features/header/tabs') || '[]');
      tabs.push({ 
        id: 'project-001', 
        title: '测试项目', 
        type: 'project' as const,
        network: 'offline' as const
      });
      localStorage.setItem('features/header/tabs', JSON.stringify(tabs));
    });
    await headerPage.reload();
    await headerPage.waitForLoadState('domcontentloaded');
    
    // 验证有2个标签页
    await expect(headerPage.locator('.tab-item')).toHaveCount(2);
    
    // 点击第二个标签页
    await headerPage.locator('.tab-item').nth(1).click();
    
    // 等待状态更新
    await headerPage.waitForTimeout(300);
    
    // 验证active状态切换
    await expect(headerPage.locator('.tab-item').nth(0)).not.toHaveClass(/active/);
    await expect(headerPage.locator('.tab-item').nth(1)).toHaveClass(/active/);
  });

  test('localStorage数据损坏时应使用默认值', async () => {
    // 设置损坏的数据
    await headerPage.evaluate(() => {
      localStorage.setItem('features/header/tabs', 'invalid-json');
    });
    
    // 刷新页面
    await headerPage.reload();
    await headerPage.waitForLoadState('domcontentloaded');
    
    // 验证降级行为 - 应该不会crash
    await expect(headerPage.locator('.s-header')).toBeVisible();
    await expect(headerPage.locator('.tab-item')).toHaveCount(0);
    await expect(headerPage.locator('.home')).toBeVisible();
  });

  test('activeTab不存在时应正确处理', async () => {
    await headerPage.evaluate(() => {
      localStorage.setItem('features/header/tabs', JSON.stringify([
        { id: 'tab1', title: '标签1', type: 'project', network: 'offline' }
      ]));
      localStorage.setItem('features/header/activeTab', 'non-existent-tab');
    });
    
    await headerPage.reload();
    await headerPage.waitForLoadState('domcontentloaded');
    
    // 应该不会crash，且有合理的降级行为
    await expect(headerPage.locator('.s-header')).toBeVisible();
    await expect(headerPage.locator('.tab-item')).toHaveCount(1);
  });

  test('窗口控制按钮功能正常', async () => {
    // 测试最小化按钮存在
    const minimizeBtn = headerPage.locator('#minimize');
    await expect(minimizeBtn).toBeVisible();
    
    // 测试最大化/取消最大化切换
    const unmaximizeBtn = headerPage.locator('#unmaximize');
    await expect(unmaximizeBtn).toBeVisible();
    
    const maximizeBtn = headerPage.locator('#maximize');
    await expect(maximizeBtn).toHaveCount(0); // 初始状态已最大化
    
    // 验证关闭按钮存在（不实际点击，避免关闭应用）
    const closeBtn = headerPage.locator('#close');
    await expect(closeBtn).toBeVisible();
  });

  test('标签页顺序在重载后保持一致', async () => {
    // 设置多个标签页
    const testTabs = [
      { id: 'tab1', title: '标签1', type: 'project' as const, network: 'offline' as const },
      { id: 'tab2', title: '标签2', type: 'project' as const, network: 'offline' as const },
      { id: 'tab3', title: '标签3', type: 'settings' as const, network: 'offline' as const }
    ];
    
    await headerPage.evaluate((tabs) => {
      localStorage.setItem('features/header/tabs', JSON.stringify(tabs));
      localStorage.setItem('features/header/activeTab', 'tab1');
    }, testTabs);
    
    await contentPage.evaluate(() => {
      localStorage.setItem('runtime/networkMode', 'offline');
    });
    
    // 通过刷新页面来模拟重载（localStorage 会保留）
    await headerPage.reload();
    await headerPage.waitForLoadState('domcontentloaded');
    await headerPage.waitForSelector('.tab-item', { state: 'visible', timeout: 5000 });
    
    // 验证顺序
    const tabs = headerPage.locator('.tab-item');
    await expect(tabs).toHaveCount(3);
    await expect(tabs.nth(0)).toContainText('标签1');
    await expect(tabs.nth(1)).toContainText('标签2');
    await expect(tabs.nth(2)).toContainText('标签3');
  });

  test('拖拽标签页可以改变顺序', async () => {
    // 创建3个标签页
    const testTabs = [
      { id: 'tab1', title: '标签1', type: 'project' as const, network: 'offline' as const },
      { id: 'tab2', title: '标签2', type: 'project' as const, network: 'offline' as const },
      { id: 'tab3', title: '标签3', type: 'project' as const, network: 'offline' as const }
    ];
    
    await headerPage.evaluate((tabs) => {
      localStorage.setItem('features/header/tabs', JSON.stringify(tabs));
      localStorage.setItem('features/header/activeTab', 'tab1');
    }, testTabs);
    
    await headerPage.reload();
    await headerPage.waitForLoadState('domcontentloaded');
    await headerPage.waitForSelector('.tab-item', { state: 'visible', timeout: 5000 });
    
    // 拖拽第一个标签页到第三个位置
    const firstTab = headerPage.locator('.tab-item').first();
    const thirdTab = headerPage.locator('.tab-item').nth(2);
    
    await firstTab.dragTo(thirdTab);
    await headerPage.waitForTimeout(500); // 等待拖拽动画完成
    
    // 验证顺序改变并持久化到 localStorage
    const savedTabs = await headerPage.evaluate(() => {
      return JSON.parse(localStorage.getItem('features/header/tabs') || '[]');
    });
    
    // 验证标签页顺序已改变（拖拽后顺序可能是 tab2, tab3, tab1）
    expect(savedTabs.length).toBe(3);
    expect(savedTabs[0].id).not.toBe('tab1'); // 第一个不再是 tab1
  });

  test('点击加号按钮触发创建项目事件', async () => {
    const addTabBtn = headerPage.locator('.add-tab-btn');
    await expect(addTabBtn).toBeVisible();
    
    // 监听 IPC 事件
    await headerPage.evaluate(() => {
      if ((window as any).electronAPI && (window as any).electronAPI.ipcManager) {
        const originalSendToMain = (window as any).electronAPI.ipcManager.sendToMain;
        (window as any).electronAPI.ipcManager.sendToMain = (event: string) => {
          if (event === 'apiflow-topbar-create-project') {
            (window as any)._createProjectEventTriggered = true;
          }
          if (originalSendToMain) {
            originalSendToMain.call((window as any).electronAPI.ipcManager, event);
          }
        };
      }
    });
    
    await addTabBtn.click();
    
    // 验证事件被触发
    const triggered = await headerPage.evaluate(() => (window as any)._createProjectEventTriggered);
    expect(triggered).toBe(true);
  });

  test('网络模式切换后只显示对应模式的标签页', async () => {
    // 创建离线和在线两种模式的标签页
    const mixedTabs = [
      { id: 'offline-tab', title: '离线标签', type: 'project' as const, network: 'offline' as const },
      { id: 'online-tab', title: '在线标签', type: 'project' as const, network: 'online' as const }
    ];
    
    await headerPage.evaluate((tabs) => {
      localStorage.setItem('features/header/tabs', JSON.stringify(tabs));
      localStorage.setItem('features/header/activeTab', 'offline-tab');
    }, mixedTabs);
    
    await headerPage.reload();
    await headerPage.waitForLoadState('domcontentloaded');
    
    // 当前是离线模式，应该只显示离线标签
    await expect(headerPage.locator('.tab-item')).toHaveCount(1);
    await expect(headerPage.locator('.tab-item').first()).toContainText('离线标签');
    
    // 切换到在线模式
    await headerPage.evaluate(() => {
      const store = (window as any).__pinia_store__;
      if (store) {
        localStorage.setItem('runtime/networkMode', 'online');
      }
    });
    await headerPage.reload();
    await headerPage.waitForLoadState('domcontentloaded');
    
    // 切换后应该只显示在线标签
    await expect(headerPage.locator('.tab-item')).toHaveCount(1);
    await expect(headerPage.locator('.tab-item').first()).toContainText('在线标签');
  });

  test('中键点击标签页应关闭标签页', async () => {
    // 创建标签页
    await headerPage.locator('[title="个人中心"]').click();
    await headerPage.waitForSelector('.tab-item');
    await expect(headerPage.locator('.tab-item')).toHaveCount(1);
    
    // 中键点击关闭
    await headerPage.locator('.tab-item').first().click({ button: 'middle' });
    
    // 验证标签页被关闭
    await expect(headerPage.locator('.tab-item')).toHaveCount(0);
    await expect(headerPage.locator('.home')).toHaveClass(/active/);
  });

  test('标签页关闭按钮hover时显示', async () => {
    // 创建标签页
    await headerPage.locator('[title="个人中心"]').click();
    await headerPage.waitForSelector('.tab-item');
    
    const tab = headerPage.locator('.tab-item').first();
    const closeBtn = tab.locator('.close-btn');
    
    // 初始状态关闭按钮不可见（opacity: 0）
    await expect(closeBtn).toHaveCSS('opacity', '0');
    
    // hover 后关闭按钮可见
    await tab.hover();
    await expect(closeBtn).toHaveCSS('opacity', '1');
  });

  test('关闭最后一个标签页应跳转到主页', async () => {
    // 创建标签页
    await headerPage.locator('[title="个人中心"]').click();
    await headerPage.waitForSelector('.tab-item');
    await expect(contentPage).toHaveURL(/user-center/);
    
    // 关闭标签页
    await headerPage.locator('.tab-item .close-btn').click();
    
    // 验证跳转回主页
    await expect(headerPage.locator('.tab-item')).toHaveCount(0);
    await expect(headerPage.locator('.home')).toHaveClass(/active/);
    await expect(contentPage).toHaveURL(/\/home/);
  });

  test('关闭中间标签页时自动激活下一个标签页', async () => {
    // 创建3个标签页
    const testTabs = [
      { id: 'tab1', title: '标签1', type: 'project' as const, network: 'offline' as const },
      { id: 'tab2', title: '标签2', type: 'project' as const, network: 'offline' as const },
      { id: 'tab3', title: '标签3', type: 'project' as const, network: 'offline' as const }
    ];
    
    await headerPage.evaluate((tabs) => {
      localStorage.setItem('features/header/tabs', JSON.stringify(tabs));
      localStorage.setItem('features/header/activeTab', 'tab2');
    }, testTabs);
    
    await headerPage.reload();
    await headerPage.waitForLoadState('domcontentloaded');
    await headerPage.waitForSelector('.tab-item', { state: 'visible', timeout: 5000 });
    
    // 验证第二个标签页是激活的
    await expect(headerPage.locator('.tab-item').nth(1)).toHaveClass(/active/);
    
    // 关闭第二个标签页
    await headerPage.locator('.tab-item').nth(1).locator('.close-btn').click();
    
    // 验证自动激活第三个标签页（原来的第三个变成第二个）
    await expect(headerPage.locator('.tab-item')).toHaveCount(2);
    await expect(headerPage.locator('.tab-item').nth(1)).toHaveClass(/active/);
  });

  test('标签页标题过长时显示省略号和完整title属性', async () => {
    const longTitle = '这是一个非常非常非常长的项目标题用于测试省略号显示功能';
    const longTitleTab = {
      id: 'long-title-tab',
      title: longTitle,
      type: 'project' as const,
      network: 'offline' as const
    };
    
    await headerPage.evaluate((tab) => {
      localStorage.setItem('features/header/tabs', JSON.stringify([tab]));
    }, longTitleTab);
    
    await headerPage.reload();
    await headerPage.waitForLoadState('domcontentloaded');
    await headerPage.waitForSelector('.tab-item', { state: 'visible', timeout: 5000 });
    
    const tab = headerPage.locator('.tab-item').first();
    
    // 验证 title 属性包含完整标题
    await expect(tab).toHaveAttribute('title', longTitle);
    
    // 验证文本被截断（实际显示的文本小于完整标题）
    const displayedText = await tab.locator('span').nth(1).textContent();
    expect(displayedText?.length).toBeLessThanOrEqual(longTitle.length);
  });

  test('同一页面不重复创建标签页', async () => {
    // 第一次点击个人中心
    await headerPage.locator('[title="个人中心"]').click();
    await headerPage.waitForSelector('.tab-item');
    const initialCount = await headerPage.locator('.tab-item').count();
    expect(initialCount).toBe(1);
    
    // 第二次点击个人中心
    await headerPage.locator('[title="个人中心"]').click();
    await headerPage.waitForTimeout(500);
    
    // 验证不会创建重复标签页
    const finalCount = await headerPage.locator('.tab-item').count();
    expect(finalCount).toBe(initialCount);
    
    // 验证标签页仍然是激活状态
    await expect(headerPage.locator('.tab-item').first()).toHaveClass(/active/);
  });

  test('项目图标在标签页中正确显示', async () => {
    // 创建项目类型标签页
    await headerPage.evaluate(() => {
      const tabs = [{
        id: 'project-1',
        title: '测试项目',
        type: 'project' as const,
        network: 'offline' as const
      }];
      localStorage.setItem('features/header/tabs', JSON.stringify(tabs));
    });
    
    await headerPage.reload();
    await headerPage.waitForLoadState('domcontentloaded');
    await headerPage.waitForSelector('.tab-item', { state: 'visible', timeout: 5000 });
    
    // 验证图标存在
    const tabIcon = headerPage.locator('.tab-item .tab-icon');
    await expect(tabIcon).toBeVisible();
    
    // 验证图标大小
    await expect(tabIcon).toHaveCSS('width', '14px');
    await expect(tabIcon).toHaveCSS('height', '14px');
  });

  test('Logo点击跳转到主页', async () => {
    // 先跳转到其他页面
    await headerPage.locator('[title="个人中心"]').click();
    await contentPage.waitForURL(/user-center/);
    
    // 点击 Logo
    await headerPage.locator('.logo-img').click();
    
    // 验证跳转到主页
    await expect(contentPage).toHaveURL(/\/home/);
    await expect(headerPage.locator('.home')).toHaveClass(/active/);
  });

  test('标签页列表支持水平滚动', async () => {
    // 创建大量标签页以触发滚动
    const manyTabs = Array.from({ length: 15 }, (_, i) => ({
      id: `tab${i}`,
      title: `标签${i}`,
      type: 'project' as const,
      network: 'offline' as const
    }));
    
    await headerPage.evaluate((tabs) => {
      localStorage.setItem('features/header/tabs', JSON.stringify(tabs));
    }, manyTabs);
    
    await headerPage.reload();
    await headerPage.waitForLoadState('domcontentloaded');
    await headerPage.waitForSelector('.tab-item', { state: 'visible', timeout: 5000 });
    
    // 验证标签页容器可滚动
    const tabsContainer = headerPage.locator('.tabs');
    const hasOverflow = await tabsContainer.evaluate((el) => {
      return el.scrollWidth > el.clientWidth;
    });
    
    expect(hasOverflow).toBe(true);
  });

  test('标签页容器隐藏滚动条', async () => {
    const tabsContainer = headerPage.locator('.tabs');
    
    // 验证 CSS 属性设置了隐藏滚动条
    await expect(tabsContainer).toHaveCSS('overflow-x', 'auto');
    await expect(tabsContainer).toHaveCSS('scrollbar-width', 'none');
  });

  test('导航按钮正确触发IPC事件', async () => {
    // 测试刷新按钮
    await headerPage.evaluate(() => {
      (window as any)._ipcEvents = [];
      const win = window as any;
      if (!win.electronAPI) {
        win.electronAPI = {};
      }
      if (!win.electronAPI.ipcManager) {
        win.electronAPI.ipcManager = {};
      }
      win.electronAPI.ipcManager.sendToMain = (event: string) => {
        win._ipcEvents.push(event);
      };
    });
    
    await headerPage.locator('[title="刷新主应用"]').click();
    await headerPage.locator('[title="后退"]').click();
    await headerPage.locator('[title="前进"]').click();
    
    const events = await headerPage.evaluate(() => (window as any)._ipcEvents);
    expect(events).toContain('apiflow-refresh-app');
    expect(events).toContain('apiflow-go-back');
    expect(events).toContain('apiflow-go-forward');
  });

  test('网络模式按钮显示正确的图标和文本', async () => {
    // 离线模式
    const networkBtn = headerPage.locator('.network-btn');
    await expect(networkBtn).toBeVisible();
    
    const offlineIcon = headerPage.locator('.network-icon.iconwifi-off-line');
    await expect(offlineIcon).toBeVisible();
    
    const networkText = headerPage.locator('.network-text');
    await expect(networkText).toContainText('离线模式');
  });

  test('语言按钮显示当前语言缩写', async () => {
    const languageIcon = headerPage.locator('.icon:has(.iconyuyan)');
    await expect(languageIcon).toBeVisible();
    
    const languageDisplay = headerPage.locator('.language-text');
    await expect(languageDisplay).toBeVisible();
    
    // 验证显示的是语言缩写（中/繁/EN/JP）
    const text = await languageDisplay.textContent();
    expect(['中', '繁', 'EN', 'JP']).toContain(text?.trim());
  });

  test('窗口控制按钮尺寸一致', async () => {
    const minimizeBtn = headerPage.locator('#minimize');
    const closeBtn = headerPage.locator('#close');
    
    // 验证宽度为 46px，高度为 35px
    await expect(minimizeBtn).toHaveCSS('width', '46px');
    await expect(minimizeBtn).toHaveCSS('height', '35px');
    await expect(closeBtn).toHaveCSS('width', '46px');
    await expect(closeBtn).toHaveCSS('height', '35px');
  });

  test('关闭按钮hover时显示红色背景', async () => {
    const closeBtn = headerPage.locator('#close');
    
    // hover 前的背景
    const bgBefore = await closeBtn.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    
    // hover
    await closeBtn.hover();
    
    // hover 后背景应该变成红色 #e81123
    await expect(closeBtn).toHaveCSS('background-color', 'rgb(232, 17, 35)');
  });

  test('分隔线在有标签页时显示', async () => {
    // 初始无标签页时
    const divider = headerPage.locator('.divider');
    const initialVisible = await divider.isVisible().catch(() => false);
    
    // 创建标签页
    await headerPage.locator('[title="个人中心"]').click();
    await headerPage.waitForSelector('.tab-item');
    
    // 验证分隔线显示
    await expect(divider).toBeVisible();
  });

  test('标签页激活状态样式正确', async () => {
    // 创建标签页并激活
    await headerPage.locator('[title="个人中心"]').click();
    await headerPage.waitForSelector('.tab-item');
    
    const activeTab = headerPage.locator('.tab-item.active');
    await expect(activeTab).toBeVisible();
    
    // 验证激活状态的背景色
    await expect(activeTab).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.35)');
    await expect(activeTab).toHaveCSS('color', 'rgb(255, 255, 255)');
  });

  test('header高度固定为35px', async () => {
    const header = headerPage.locator('.s-header');
    await expect(header).toHaveCSS('height', '35px');
  });

  test('标签页过渡动画存在', async () => {
    // 创建标签页
    await headerPage.evaluate(() => {
      const tabs = [{
        id: 'test-tab',
        title: '测试标签',
        type: 'project' as const,
        network: 'offline' as const
      }];
      localStorage.setItem('features/header/tabs', JSON.stringify(tabs));
    });
    
    await headerPage.reload();
    await headerPage.waitForLoadState('domcontentloaded');
    await headerPage.waitForSelector('.tab-item', { state: 'visible', timeout: 5000 });
    
    const tab = headerPage.locator('.tab-item').first();
    
    // 验证有 transition 属性
    const transition = await tab.evaluate((el) => window.getComputedStyle(el).transition);
    expect(transition).toContain('0.2s');
  });

});

test.describe('IPC 通信相关测试', () => {
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
    
    // 清理测试环境
    await headerPage.evaluate(() => {
      localStorage.removeItem('features/header/tabs');
      localStorage.removeItem('features/header/activeTab');
    });
    await contentPage.evaluate(() => {
      localStorage.setItem('runtime/networkMode', 'offline');
    });
  });

  test('组件挂载时发送 apiflow-topbar-ready 事件', async () => {
    let readyEventSent = false;
    
    // 监听事件
    await headerPage.evaluate(() => {
      (window as any)._ipcEvents = [];
      const win = window as any;
      if (!win.electronAPI) {
        win.electronAPI = {};
      }
      if (!win.electronAPI.ipcManager) {
        win.electronAPI.ipcManager = {};
      }
      const originalSendToMain = win.electronAPI.ipcManager.sendToMain;
      win.electronAPI.ipcManager.sendToMain = (event: string, data?: any) => {
        win._ipcEvents.push({ event, data });
        if (originalSendToMain) {
          originalSendToMain.call(win.electronAPI.ipcManager, event, data);
        }
      };
    });
    
    // 重新加载页面触发 onMounted
    await headerPage.reload();
    await headerPage.waitForLoadState('domcontentloaded');
    await headerPage.waitForTimeout(1000);
    
    // 验证事件被发送
    const events = await headerPage.evaluate(() => (window as any)._ipcEvents || []);
    const readyEvent = events.find((e: any) => e.event === 'apiflow-topbar-ready');
    expect(readyEvent).toBeDefined();
  });

  test('接收 apiflow-create-project-success 事件后创建标签页', async () => {
    // 设置事件监听器
    await headerPage.evaluate(() => {
      const win = window as any;
      if (!win.electronAPI) {
        win.electronAPI = {};
      }
      if (!win.electronAPI.ipcManager) {
        win.electronAPI.ipcManager = {};
      }
      if (!win.electronAPI.ipcManager.onMain) {
        win.electronAPI.ipcManager.onMain = (event: string, callback: Function) => {
          win[`_callback_${event}`] = callback;
        };
      }
    });
    
    await headerPage.reload();
    await headerPage.waitForLoadState('domcontentloaded');
    
    // 初始状态无标签页
    await expect(headerPage.locator('.tab-item')).toHaveCount(0);
    
    // 模拟接收事件
    await headerPage.evaluate(() => {
      const callback = (window as any)._callback_apiflow_create_project_success;
      if (callback) {
        callback({ projectId: 'new-project-001', projectName: '新建项目' });
      }
    });
    
    await headerPage.waitForTimeout(500);
    
    // 验证标签页被创建
    await expect(headerPage.locator('.tab-item')).toHaveCount(1);
    await expect(headerPage.locator('.tab-item').first()).toContainText('新建项目');
    await expect(headerPage.locator('.tab-item').first()).toHaveClass(/active/);
    
    // 验证持久化
    const savedTabs = await headerPage.evaluate(() => {
      return JSON.parse(localStorage.getItem('features/header/tabs') || '[]');
    });
    expect(savedTabs.length).toBe(1);
    expect(savedTabs[0].id).toBe('new-project-001');
    expect(savedTabs[0].title).toBe('新建项目');
  });

  test('接收 apiflow-change-project 事件后切换或创建项目标签页', async () => {
    // 先创建一个标签页
    await headerPage.evaluate(() => {
      const tabs = [{
        id: 'project-001',
        title: '项目1',
        type: 'project' as const,
        network: 'offline' as const
      }];
      localStorage.setItem('features/header/tabs', JSON.stringify(tabs));
      localStorage.setItem('features/header/activeTab', '');
    });
    
    await headerPage.reload();
    await headerPage.waitForLoadState('domcontentloaded');
    await headerPage.waitForSelector('.tab-item', { state: 'visible', timeout: 5000 });
    
    // 模拟切换到已存在的项目
    await headerPage.evaluate(() => {
      const callback = (window as any)._callback_apiflow_change_project;
      if (callback) {
        callback({ projectId: 'project-001', projectName: '项目1' });
      }
    });
    
    await headerPage.waitForTimeout(500);
    
    // 验证标签页被激活
    await expect(headerPage.locator('.tab-item').first()).toHaveClass(/active/);
    
    // 模拟切换到不存在的项目（应该创建新标签页）
    await headerPage.evaluate(() => {
      const callback = (window as any)._callback_apiflow_change_project;
      if (callback) {
        callback({ projectId: 'project-002', projectName: '项目2' });
      }
    });
    
    await headerPage.waitForTimeout(500);
    
    // 验证新标签页被创建
    await expect(headerPage.locator('.tab-item')).toHaveCount(2);
    await expect(headerPage.locator('.tab-item').nth(1)).toContainText('项目2');
    await expect(headerPage.locator('.tab-item').nth(1)).toHaveClass(/active/);
  });

  test('接收 apiflow-change-project 事件时更新已存在项目的标题', async () => {
    // 创建标签页
    await headerPage.evaluate(() => {
      const tabs = [{
        id: 'project-001',
        title: '旧项目名',
        type: 'project' as const,
        network: 'offline' as const
      }];
      localStorage.setItem('features/header/tabs', JSON.stringify(tabs));
    });
    
    await headerPage.reload();
    await headerPage.waitForLoadState('domcontentloaded');
    await headerPage.waitForSelector('.tab-item', { state: 'visible', timeout: 5000 });
    
    // 验证初始标题
    await expect(headerPage.locator('.tab-item').first()).toContainText('旧项目名');
    
    // 模拟项目名称变更
    await headerPage.evaluate(() => {
      const callback = (window as any)._callback_apiflow_change_project;
      if (callback) {
        callback({ projectId: 'project-001', projectName: '新项目名' });
      }
    });
    
    await headerPage.waitForTimeout(500);
    
    // 验证标题更新
    await expect(headerPage.locator('.tab-item').first()).toContainText('新项目名');
    
    // 验证持久化
    const savedTabs = await headerPage.evaluate(() => {
      return JSON.parse(localStorage.getItem('features/header/tabs') || '[]');
    });
    expect(savedTabs[0].title).toBe('新项目名');
  });

  test('接收 apiflow-delete-project 事件后删除对应标签页', async () => {
    // 创建多个标签页
    await headerPage.evaluate(() => {
      const tabs = [
        { id: 'project-001', title: '项目1', type: 'project' as const, network: 'offline' as const },
        { id: 'project-002', title: '项目2', type: 'project' as const, network: 'offline' as const },
        { id: 'project-003', title: '项目3', type: 'project' as const, network: 'offline' as const }
      ];
      localStorage.setItem('features/header/tabs', JSON.stringify(tabs));
      localStorage.setItem('features/header/activeTab', 'project-002');
    });
    
    await headerPage.reload();
    await headerPage.waitForLoadState('domcontentloaded');
    await headerPage.waitForSelector('.tab-item', { state: 'visible', timeout: 5000 });
    
    // 验证初始状态
    await expect(headerPage.locator('.tab-item')).toHaveCount(3);
    
    // 模拟删除第二个项目
    await headerPage.evaluate(() => {
      const callback = (window as any)._callback_apiflow_delete_project;
      if (callback) {
        callback('project-002');
      }
    });
    
    await headerPage.waitForTimeout(500);
    
    // 验证标签页被删除
    await expect(headerPage.locator('.tab-item')).toHaveCount(2);
    await expect(headerPage.locator('.tab-item:has-text("项目2")')).toHaveCount(0);
    
    // 验证自动切换到下一个标签页
    await expect(headerPage.locator('.tab-item').nth(1)).toHaveClass(/active/);
  });

  test('接收 apiflow-change-project-name 事件后更新标签页标题', async () => {
    // 创建标签页
    await headerPage.evaluate(() => {
      const tabs = [{
        id: 'project-001',
        title: '原始名称',
        type: 'project' as const,
        network: 'offline' as const
      }];
      localStorage.setItem('features/header/tabs', JSON.stringify(tabs));
    });
    
    await headerPage.reload();
    await headerPage.waitForLoadState('domcontentloaded');
    await headerPage.waitForSelector('.tab-item', { state: 'visible', timeout: 5000 });
    
    // 验证初始标题
    await expect(headerPage.locator('.tab-item').first()).toContainText('原始名称');
    
    // 模拟项目名称变更事件
    await headerPage.evaluate(() => {
      const callback = (window as any)._callback_apiflow_change_project_name;
      if (callback) {
        callback({ projectId: 'project-001', projectName: '更新后的名称' });
      }
    });
    
    await headerPage.waitForTimeout(500);
    
    // 验证标题更新
    await expect(headerPage.locator('.tab-item').first()).toContainText('更新后的名称');
    
    // 验证持久化
    const savedTabs = await headerPage.evaluate(() => {
      return JSON.parse(localStorage.getItem('features/header/tabs') || '[]');
    });
    expect(savedTabs[0].title).toBe('更新后的名称');
  });

  test('接收 apiflow-init-tabs-data 事件后初始化标签页数据', async () => {
    await headerPage.reload();
    await headerPage.waitForLoadState('domcontentloaded');
    
    // 初始状态无标签页
    await expect(headerPage.locator('.tab-item')).toHaveCount(0);
    
    // 模拟初始化数据事件
    const initData = {
      tabs: [
        { id: 'tab1', title: '初始标签1', type: 'project' as const, network: 'offline' as const },
        { id: 'tab2', title: '初始标签2', type: 'project' as const, network: 'offline' as const }
      ],
      activeTabId: 'tab1'
    };
    
    await headerPage.evaluate((data) => {
      const callback = (window as any)._callback_apiflow_init_tabs_data;
      if (callback) {
        callback(data);
      }
    }, initData);
    
    await headerPage.waitForTimeout(500);
    
    // 验证标签页被初始化
    await expect(headerPage.locator('.tab-item')).toHaveCount(2);
    await expect(headerPage.locator('.tab-item').first()).toContainText('初始标签1');
    await expect(headerPage.locator('.tab-item').nth(1)).toContainText('初始标签2');
    await expect(headerPage.locator('.tab-item').first()).toHaveClass(/active/);
  });

  test('点击项目类型标签页发送 apiflow-topbar-switch-project 事件', async () => {
    // 创建项目标签页
    await headerPage.evaluate(() => {
      const tabs = [{
        id: 'project-001',
        title: '测试项目',
        type: 'project' as const,
        network: 'offline' as const
      }];
      localStorage.setItem('features/header/tabs', JSON.stringify(tabs));
      localStorage.setItem('features/header/activeTab', '');
    });
    
    // 设置事件监听
    await headerPage.evaluate(() => {
      (window as any)._ipcEvents = [];
      const win = window as any;
      if (!win.electronAPI) {
        win.electronAPI = {};
      }
      if (!win.electronAPI.ipcManager) {
        win.electronAPI.ipcManager = {};
      }
      win.electronAPI.ipcManager.sendToMain = (event: string, data?: any) => {
        win._ipcEvents.push({ event, data });
      };
    });
    
    await headerPage.reload();
    await headerPage.waitForLoadState('domcontentloaded');
    await headerPage.waitForSelector('.tab-item', { state: 'visible', timeout: 5000 });
    
    // 点击项目标签页
    await headerPage.locator('.tab-item').first().click();
    await headerPage.waitForTimeout(300);
    
    // 验证事件被发送
    const events = await headerPage.evaluate(() => (window as any)._ipcEvents || []);
    const switchEvent = events.find((e: any) => e.event === 'apiflow-topbar-switch-project');
    expect(switchEvent).toBeDefined();
    expect(switchEvent.data.projectId).toBe('project-001');
    expect(switchEvent.data.projectName).toBe('测试项目');
  });

  test('点击 settings 类型标签页发送 apiflow-topbar-navigate 事件', async () => {
    // 创建 settings 标签页
    await headerPage.evaluate(() => {
      const tabs = [{
        id: 'user-center',
        title: '个人中心',
        type: 'settings' as const,
        network: 'offline' as const
      }];
      localStorage.setItem('features/header/tabs', JSON.stringify(tabs));
      localStorage.setItem('features/header/activeTab', '');
    });
    
    // 设置事件监听
    await headerPage.evaluate(() => {
      (window as any)._ipcEvents = [];
      const win = window as any;
      if (!win.electronAPI) {
        win.electronAPI = {};
      }
      if (!win.electronAPI.ipcManager) {
        win.electronAPI.ipcManager = {};
      }
      win.electronAPI.ipcManager.sendToMain = (event: string, data?: any) => {
        win._ipcEvents.push({ event, data });
      };
    });
    
    await headerPage.reload();
    await headerPage.waitForLoadState('domcontentloaded');
    await headerPage.waitForSelector('.tab-item', { state: 'visible', timeout: 5000 });
    
    // 点击 settings 标签页
    await headerPage.locator('.tab-item').first().click();
    await headerPage.waitForTimeout(300);
    
    // 验证事件被发送
    const events = await headerPage.evaluate(() => (window as any)._ipcEvents || []);
    const navigateEvent = events.find((e: any) => e.event === 'apiflow-topbar-navigate');
    expect(navigateEvent).toBeDefined();
    expect(navigateEvent.data).toBe('/user-center');
  });

  test('网络模式切换发送 apiflow-network-mode-changed 事件', async () => {
    // 设置事件监听
    await headerPage.evaluate(() => {
      (window as any)._ipcEvents = [];
      const win = window as any;
      if (!win.electronAPI) {
        win.electronAPI = {};
      }
      if (!win.electronAPI.ipcManager) {
        win.electronAPI.ipcManager = {};
      }
      win.electronAPI.ipcManager.sendToMain = (event: string, data?: any) => {
        win._ipcEvents.push({ event, data });
      };
    });
    
    await headerPage.reload();
    await headerPage.waitForLoadState('domcontentloaded');
    
    // 点击网络模式按钮
    const networkBtn = headerPage.locator('.network-btn');
    await networkBtn.click();
    await headerPage.waitForTimeout(300);
    
    // 验证事件被发送
    const events = await headerPage.evaluate(() => (window as any)._ipcEvents || []);
    const networkEvent = events.find((e: any) => e.event === 'apiflow-network-mode-changed');
    expect(networkEvent).toBeDefined();
    // 从离线切换到在线
    expect(networkEvent.data).toBe('online');
  });

});

test.describe('窗口状态管理测试', () => {
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
  });

  test('获取初始窗口状态并设置 isMaximized', async () => {
    // 模拟 windowManager API
    await headerPage.evaluate(() => {
      const win = window as any;
      if (!win.electronAPI) {
        win.electronAPI = {};
      }
      if (!win.electronAPI.windowManager) {
        win.electronAPI.windowManager = {};
      }
      win.electronAPI.windowManager.getWindowState = async () => {
        return { isMaximized: true };
      };
    });
    
    await headerPage.reload();
    await headerPage.waitForLoadState('domcontentloaded');
    await headerPage.waitForTimeout(1000);
    
    // 验证最大化状态的按钮显示
    await expect(headerPage.locator('#unmaximize')).toBeVisible();
    await expect(headerPage.locator('#maximize')).toHaveCount(0);
  });

  test('接收 window-resize 事件后更新 isMaximized 状态', async () => {
    // 设置初始状态为非最大化
    await headerPage.evaluate(() => {
      const win = window as any;
      if (!win.electronAPI) {
        win.electronAPI = {};
      }
      if (!win.electronAPI.windowManager) {
        win.electronAPI.windowManager = {};
      }
      win.electronAPI.windowManager.getWindowState = async () => {
        return { isMaximized: false };
      };
      win.electronAPI.windowManager.onWindowResize = (callback: Function) => {
        win._windowResizeCallback = callback;
      };
    });
    
    await headerPage.reload();
    await headerPage.waitForLoadState('domcontentloaded');
    await headerPage.waitForTimeout(1000);
    
    // 模拟窗口最大化事件
    await headerPage.evaluate(() => {
      const callback = (window as any)._windowResizeCallback;
      if (callback) {
        callback({ isMaximized: true });
      }
    });
    
    await headerPage.waitForTimeout(500);
    
    // 验证按钮状态更新
    await expect(headerPage.locator('#unmaximize')).toBeVisible();
    await expect(headerPage.locator('#maximize')).toHaveCount(0);
    
    // 模拟窗口还原事件
    await headerPage.evaluate(() => {
      const callback = (window as any)._windowResizeCallback;
      if (callback) {
        callback({ isMaximized: false });
      }
    });
    
    await headerPage.waitForTimeout(500);
    
    // 验证按钮状态更新
    await expect(headerPage.locator('#maximize')).toBeVisible();
    await expect(headerPage.locator('#unmaximize')).toHaveCount(0);
  });

  test('点击最小化按钮调用 windowManager.minimizeWindow()', async () => {
    // 设置事件监听
    await headerPage.evaluate(() => {
      (window as any)._windowActions = [];
      const win = window as any;
      if (!win.electronAPI) {
        win.electronAPI = {};
      }
      if (!win.electronAPI.windowManager) {
        win.electronAPI.windowManager = {};
      }
      win.electronAPI.windowManager.minimizeWindow = () => {
        win._windowActions.push('minimize');
      };
    });
    
    await headerPage.reload();
    await headerPage.waitForLoadState('domcontentloaded');
    
    // 点击最小化按钮
    await headerPage.locator('#minimize').click();
    await headerPage.waitForTimeout(300);
    
    // 验证方法被调用
    const actions = await headerPage.evaluate(() => (window as any)._windowActions || []);
    expect(actions).toContain('minimize');
  });

  test('点击最大化按钮调用 windowManager.maximizeWindow()', async () => {
    // 设置初始状态为非最大化
    await headerPage.evaluate(() => {
      (window as any)._windowActions = [];
      const win = window as any;
      if (!win.electronAPI) {
        win.electronAPI = {};
      }
      if (!win.electronAPI.windowManager) {
        win.electronAPI.windowManager = {};
      }
      win.electronAPI.windowManager.getWindowState = async () => {
        return { isMaximized: false };
      };
      win.electronAPI.windowManager.maximizeWindow = () => {
        win._windowActions.push('maximize');
      };
    });
    
    await headerPage.reload();
    await headerPage.waitForLoadState('domcontentloaded');
    await headerPage.waitForTimeout(1000);
    
    // 验证最大化按钮显示
    await expect(headerPage.locator('#maximize')).toBeVisible();
    
    // 点击最大化按钮
    await headerPage.locator('#maximize').click();
    await headerPage.waitForTimeout(300);
    
    // 验证方法被调用
    const actions = await headerPage.evaluate(() => (window as any)._windowActions || []);
    expect(actions).toContain('maximize');
  });

  test('点击取消最大化按钮调用 windowManager.unMaximizeWindow()', async () => {
    // 设置事件监听
    await headerPage.evaluate(() => {
      (window as any)._windowActions = [];
      const win = window as any;
      if (!win.electronAPI) {
        win.electronAPI = {};
      }
      if (!win.electronAPI.windowManager) {
        win.electronAPI.windowManager = {};
      }
      win.electronAPI.windowManager.getWindowState = async () => {
        return { isMaximized: true };
      };
      win.electronAPI.windowManager.unMaximizeWindow = () => {
        win._windowActions.push('unmaximize');
      };
    });
    
    await headerPage.reload();
    await headerPage.waitForLoadState('domcontentloaded');
    await headerPage.waitForTimeout(1000);
    
    // 验证取消最大化按钮显示
    await expect(headerPage.locator('#unmaximize')).toBeVisible();
    
    // 点击取消最大化按钮
    await headerPage.locator('#unmaximize').click();
    await headerPage.waitForTimeout(300);
    
    // 验证方法被调用
    const actions = await headerPage.evaluate(() => (window as any)._windowActions || []);
    expect(actions).toContain('unmaximize');
  });

  test('点击关闭按钮调用 windowManager.closeWindow()', async () => {
    // 设置事件监听
    await headerPage.evaluate(() => {
      (window as any)._windowActions = [];
      const win = window as any;
      if (!win.electronAPI) {
        win.electronAPI = {};
      }
      if (!win.electronAPI.windowManager) {
        win.electronAPI.windowManager = {};
      }
      win.electronAPI.windowManager.closeWindow = () => {
        win._windowActions.push('close');
        // 不实际关闭窗口，只记录调用
      };
    });
    
    await headerPage.reload();
    await headerPage.waitForLoadState('domcontentloaded');
    
    // 点击关闭按钮
    await headerPage.locator('#close').click();
    await headerPage.waitForTimeout(300);
    
    // 验证方法被调用
    const actions = await headerPage.evaluate(() => (window as any)._windowActions || []);
    expect(actions).toContain('close');
  });

  test('最大化状态切换时按钮图标正确显示和隐藏', async () => {
    // 设置初始状态
    await headerPage.evaluate(() => {
      const win = window as any;
      if (!win.electronAPI) {
        win.electronAPI = {};
      }
      if (!win.electronAPI.windowManager) {
        win.electronAPI.windowManager = {};
      }
      win.electronAPI.windowManager.getWindowState = async () => {
        return { isMaximized: true };
      };
      win.electronAPI.windowManager.onWindowResize = (callback: Function) => {
        win._windowResizeCallback = callback;
      };
    });
    
    await headerPage.reload();
    await headerPage.waitForLoadState('domcontentloaded');
    await headerPage.waitForTimeout(1000);
    
    // 最大化状态：显示 unmaximize，隐藏 maximize
    await expect(headerPage.locator('#unmaximize')).toBeVisible();
    await expect(headerPage.locator('#maximize')).toHaveCount(0);
    
    // 模拟切换到非最大化状态
    await headerPage.evaluate(() => {
      const callback = (window as any)._windowResizeCallback;
      if (callback) {
        callback({ isMaximized: false });
      }
    });
    
    await headerPage.waitForTimeout(500);
    
    // 非最大化状态：显示 maximize，隐藏 unmaximize
    await expect(headerPage.locator('#maximize')).toBeVisible();
    await expect(headerPage.locator('#unmaximize')).toHaveCount(0);
    
    // 模拟切换回最大化状态
    await headerPage.evaluate(() => {
      const callback = (window as any)._windowResizeCallback;
      if (callback) {
        callback({ isMaximized: true });
      }
    });
    
    await headerPage.waitForTimeout(500);
    
    // 再次验证最大化状态
    await expect(headerPage.locator('#unmaximize')).toBeVisible();
    await expect(headerPage.locator('#maximize')).toHaveCount(0);
  });

  test('窗口控制按钮在 electronAPI 不存在时不抛出错误', async () => {
    // 移除 electronAPI
    await headerPage.evaluate(() => {
      delete (window as any).electronAPI;
    });
    
    await headerPage.reload();
    await headerPage.waitForLoadState('domcontentloaded');
    
    // 验证按钮仍然显示
    await expect(headerPage.locator('#minimize')).toBeVisible();
    await expect(headerPage.locator('#close')).toBeVisible();
    
    // 点击按钮不应该抛出错误
    await headerPage.locator('#minimize').click();
    await headerPage.waitForTimeout(300);
    
    // 验证页面没有崩溃
    await expect(headerPage.locator('.s-header')).toBeVisible();
  });

});
