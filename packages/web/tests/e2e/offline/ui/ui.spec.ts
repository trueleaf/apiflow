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

const launchElectronApp = async (): Promise<ElectronApplication> => {
  const mainPath = path.join(process.cwd(), 'dist', 'main', 'main.mjs');
  const electronApp = await electron.launch({
    args: [mainPath],
    env: {
      ...process.env,
      NODE_ENV: 'test',
      ELECTRON_DISABLE_SECURITY_WARNINGS: 'true'
    }
  });
  await electronApp.evaluate(async ({ app }) => app.whenReady());
  return electronApp;
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
      localStorage.removeItem('httpNode/header/tabs');
      localStorage.removeItem('httpNode/header/activeTab');
    });
    await contentPage.evaluate(() => {
      localStorage.setItem('runtime/networkMode', 'offline');
      localStorage.setItem('history/lastVisitePage', '/v1/apidoc/doc-list');
    });
  });

  test('顶部栏首次渲染元素正常展示', async () => {
    const headerRoot = headerPage.locator('.s-header');
    await expect(headerRoot).toBeVisible();

    await expect(headerPage.locator('.logo-img')).toBeVisible();
    const homeButton = headerPage.locator('.home');
    await expect(homeButton).toBeVisible();
    await expect(homeButton).toHaveClass(/active/);

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

    await expect(headerPage.locator('.tab-item')).toHaveCount(0);
    await expect(headerPage.locator('.add-tab-btn')).toBeVisible();
  });

  test('主内容区域默认展示项目列表页', async () => {
    await expect(contentPage).toHaveURL(/doc-list/);

    const docListContainer = contentPage.locator('.doc-list');
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
    // 清空并设置测试数据
    await headerPage.evaluate(() => {
      localStorage.clear();
    });
    await contentPage.evaluate(() => {
      localStorage.clear();
    });

    const cachedTabs = [
      { id: 'user-center', title: '个人中心', type: 'settings', network: 'offline' as const }
    ];

    await headerPage.evaluate((tabs) => {
      localStorage.setItem('httpNode/header/tabs', JSON.stringify(tabs));
      localStorage.setItem('httpNode/header/activeTab', 'user-center');
    }, cachedTabs);

    await contentPage.evaluate(() => {
      localStorage.setItem('history/lastVisitePage', '/user-center');
      localStorage.setItem('runtime/networkMode', 'offline');
    });

    // 通过刷新页面来模拟应用重载（localStorage 会保留）
    await Promise.all([
      headerPage.reload(),
      contentPage.reload()
    ]);
    
    await Promise.all([
      headerPage.waitForLoadState('domcontentloaded'),
      contentPage.waitForLoadState('domcontentloaded')
    ]);

    // 等待tab恢复显示，确保Vue组件已完成初始化
    await headerPage.waitForSelector('.tab-item', { state: 'visible', timeout: 5000 });
    
    const homeButton = headerPage.locator('.home');
    await expect(homeButton).not.toHaveClass(/active/);

    const restoredTab = headerPage.locator('.tab-item');
    await expect(restoredTab).toHaveCount(1);
    await expect(restoredTab).toContainText('个人中心');
    await expect(restoredTab.first()).toHaveClass(/active/);

    await expect(contentPage).toHaveURL(/user-center/);
    await expect(contentPage.locator('.user-center')).toBeVisible();
  });

  test('点击个人中心按钮应创建并激活个人中心标签页', async () => {
    // 验证初始状态
    await expect(headerPage.locator('.tab-item')).toHaveCount(0);
    
    // 点击个人中心按钮
    await headerPage.locator('[title="个人中心"]').click();
    
    // 验证标签页创建
    await headerPage.waitForSelector('.tab-item', { state: 'visible' });
    const tab = headerPage.locator('.tab-item');
    await expect(tab).toHaveCount(1);
    await expect(tab).toContainText('个人中心');
    await expect(tab).toHaveClass(/active/);
    
    // 验证内容页面跳转
    await expect(contentPage).toHaveURL(/user-center/);
  });

  test('关闭标签页后应正确清理状态', async () => {
    // 创建标签页
    await headerPage.locator('[title="个人中心"]').click();
    await headerPage.waitForSelector('.tab-item');
    
    // 关闭标签页
    await headerPage.locator('.tab-item .close-btn').click();
    
    // 验证标签页被移除
    await expect(headerPage.locator('.tab-item')).toHaveCount(0);
    
    // 验证跳转回主页
    await expect(headerPage.locator('.home')).toHaveClass(/active/);
    await expect(contentPage).toHaveURL(/doc-list/);
  });

  test('点击主页按钮应跳转到项目列表页', async () => {
    // 先跳转到其他页面
    await headerPage.locator('[title="个人中心"]').click();
    await headerPage.waitForSelector('.tab-item');
    await expect(contentPage).toHaveURL(/user-center/);
    
    // 验证个人中心标签页是 active 的
    await expect(headerPage.locator('.tab-item')).toHaveClass(/active/);
    
    // 点击主页按钮
    await headerPage.locator('.home').click();
    
    // 等待一小段时间让状态更新
    await headerPage.waitForTimeout(500);
    
    // 验证跳转到项目列表页
    await expect(contentPage).toHaveURL(/doc-list/);
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
    await expect(contentPage.locator('.doc-list')).toBeVisible();
  });

  test('切换多个标签页时应正确更新active状态', async () => {
    // 创建第一个标签页
    await headerPage.locator('[title="个人中心"]').click();
    await headerPage.waitForSelector('.tab-item');
    
    // 模拟创建项目标签页（通过localStorage）
    await headerPage.evaluate(() => {
      const tabs = JSON.parse(localStorage.getItem('httpNode/header/tabs') || '[]');
      tabs.push({ 
        id: 'project-001', 
        title: '测试项目', 
        type: 'project' as const,
        network: 'offline' as const
      });
      localStorage.setItem('httpNode/header/tabs', JSON.stringify(tabs));
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
      localStorage.setItem('httpNode/header/tabs', 'invalid-json');
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
      localStorage.setItem('httpNode/header/tabs', JSON.stringify([
        { id: 'tab1', title: '标签1', type: 'project', network: 'offline' }
      ]));
      localStorage.setItem('httpNode/header/activeTab', 'non-existent-tab');
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
      localStorage.setItem('httpNode/header/tabs', JSON.stringify(tabs));
      localStorage.setItem('httpNode/header/activeTab', 'tab1');
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
  
});
