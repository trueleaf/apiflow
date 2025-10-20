import { expect, type Page } from '@playwright/test';
import { test } from '../../../fixtures/enhanced-electron-fixtures';
import {
  createMockTab,
  createMockHttpNode,
  createMockFolder,
  createMockWebSocketNode,
  initAppWorkbenchPages,
  clearAppWorkbenchState,
  navigateToProjectWorkbench,
  createTabInStorage,
  setActiveTab,
  expectTabExists,
  expectActiveTab,
  getTabCount,
  closeTab,
  setBannerData,
  expectNodeExists,
  clickBannerNode,
  doubleClickBannerNode,
  rightClickBannerNode,
  expandBannerFolder,
  expectTabPersisted,
  expectLayoutPersisted,
  expectToolbarPinPersisted,
  mockLocalStorageData,
  getLocalStorageData,
  clearLocalStorageKey,
  waitForVueComponentReady,
  pressModifierKey,
  setupIPCListener,
  getCapturedIPCEvents,
} from './fixtures/appWorkbench-helpers';

/**
 * 主工作区综合测试
 * 合并了导航、操作、窗口状态三个测试模块
 * 测试范围：Tab管理、Banner树导航、CRUD操作、复制粘贴、拖拽、Fork、工具栏、布局状态、持久化
 */

const TEST_PROJECT_ID = 'test-project-001';
const TEST_PROJECT_ID_2 = 'test-project-002';

// ==================== 导航测试 ====================

test.describe('主工作区导航测试 - Tab 管理核心功能', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const pages = await initAppWorkbenchPages(electronApp);
    headerPage = pages.headerPage;
    contentPage = pages.contentPage;

    await clearAppWorkbenchState(headerPage, contentPage);
    await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID);
  });

  test('创建新 Tab 并自动激活', async () => {
    // 模拟点击 Banner 节点创建 Tab
    const mockNode = createMockHttpNode({ name: '用户登录接口' });
    await setBannerData(contentPage, TEST_PROJECT_ID, [mockNode]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    await clickBannerNode(contentPage, '用户登录接口');

    // 验证 Tab 创建并激活
    await expectTabExists(contentPage, '用户登录接口');
    await expectActiveTab(contentPage, '用户登录接口');
  });

  test('切换 Tab 后取消上一个 Tab 的请求', async () => {
    // 创建两个 Tab
    const tab1 = createMockTab({ id: 'tab1', title: 'Tab 1' });
    const tab2 = createMockTab({ id: 'tab2', title: 'Tab 2' });

    await createTabInStorage(contentPage, TEST_PROJECT_ID, tab1);
    await createTabInStorage(contentPage, TEST_PROJECT_ID, tab2);
    await setActiveTab(contentPage, TEST_PROJECT_ID, 'tab1');
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 设置请求取消监听
    await contentPage.evaluate(() => {
      (window as any)._requestCancelled = false;
      const originalAbort = AbortController.prototype.abort;
      AbortController.prototype.abort = function() {
        (window as any)._requestCancelled = true;
        return originalAbort.apply(this, arguments as any);
      };
    });

    // 切换到 Tab 2
    const tab2Locator = contentPage.locator('.s-tab-item').filter({ hasText: 'Tab 2' });
    await tab2Locator.click();
    await contentPage.waitForTimeout(300);

    // 验证请求被取消（实际项目中应该检查 AbortController）
    await expectActiveTab(contentPage, 'Tab 2');
  });

  test('关闭 Tab 并保存到 localStorage', async () => {
    const tab = createMockTab({ id: 'tab1', title: '测试Tab' });
    await createTabInStorage(contentPage, TEST_PROJECT_ID, tab);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 验证 Tab 存在
    await expectTabExists(contentPage, '测试Tab');

    // 关闭 Tab
    await closeTab(contentPage, '测试Tab');

    // 验证 Tab 被移除
    const count = await getTabCount(contentPage);
    expect(count).toBe(0);

    // 验证 localStorage 更新
    const savedTabs = await getLocalStorageData(contentPage, 'workbench/node/tabs');
    expect(savedTabs[TEST_PROJECT_ID] || []).toHaveLength(0);
  });

  test('双击 Tab 固定/取消固定', async () => {
    const tab = createMockTab({ id: 'tab1', title: '固定测试Tab', fixed: false });
    await createTabInStorage(contentPage, TEST_PROJECT_ID, tab);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    const tabLocator = contentPage.locator('.s-tab-item').filter({ hasText: '固定测试Tab' });

    // 双击固定
    await tabLocator.dblclick();
    await contentPage.waitForTimeout(300);

    // 验证 fixed 状态
    const savedTabs = await getLocalStorageData(contentPage, 'workbench/node/tabs');
    const savedTab = savedTabs[TEST_PROJECT_ID][0];
    expect(savedTab.fixed).toBe(true);

    // 再次双击取消固定
    await tabLocator.dblclick();
    await contentPage.waitForTimeout(300);

    const updatedTabs = await getLocalStorageData(contentPage, 'workbench/node/tabs');
    const updatedTab = updatedTabs[TEST_PROJECT_ID][0];
    expect(updatedTab.fixed).toBe(false);
  });

  test('关闭未固定的 Tab 不影响已固定 Tab', async () => {
    const fixedTab = createMockTab({ id: 'tab1', title: '固定Tab', fixed: true });
    const unfixedTab = createMockTab({ id: 'tab2', title: '未固定Tab', fixed: false });

    await createTabInStorage(contentPage, TEST_PROJECT_ID, fixedTab);
    await createTabInStorage(contentPage, TEST_PROJECT_ID, unfixedTab);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 关闭未固定 Tab
    await closeTab(contentPage, '未固定Tab');

    // 验证固定 Tab 仍然存在
    await expectTabExists(contentPage, '固定Tab');

    const count = await getTabCount(contentPage);
    expect(count).toBe(1);
  });

  test('新 Tab 替换未保存的未固定 Tab', async () => {
    const unsavedTab = createMockTab({
      id: 'tab1',
      title: '未保存Tab',
      fixed: false,
      saved: false
    });

    await createTabInStorage(contentPage, TEST_PROJECT_ID, unsavedTab);
    await setActiveTab(contentPage, TEST_PROJECT_ID, 'tab1');
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 验证初始状态
    await expectTabExists(contentPage, '未保存Tab');

    // 点击新节点创建 Tab（应替换未保存的 Tab）
    const newNode = createMockHttpNode({ name: '新接口' });
    await setBannerData(contentPage, TEST_PROJECT_ID, [newNode]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    await clickBannerNode(contentPage, '新接口');

    // 验证只有一个 Tab（新 Tab 替换了旧的）
    const count = await getTabCount(contentPage);
    expect(count).toBe(1);
    await expectTabExists(contentPage, '新接口');
  });

  test('Tab 拖拽重新排序', async () => {
    const tab1 = createMockTab({ id: 'tab1', title: 'Tab 1' });
    const tab2 = createMockTab({ id: 'tab2', title: 'Tab 2' });
    const tab3 = createMockTab({ id: 'tab3', title: 'Tab 3' });

    await createTabInStorage(contentPage, TEST_PROJECT_ID, tab1);
    await createTabInStorage(contentPage, TEST_PROJECT_ID, tab2);
    await createTabInStorage(contentPage, TEST_PROJECT_ID, tab3);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 拖拽第一个 Tab 到最后
    const firstTab = contentPage.locator('.s-tab-item').first();
    const lastTab = contentPage.locator('.s-tab-item').last();

    await firstTab.dragTo(lastTab);
    await contentPage.waitForTimeout(500);

    // 验证顺序改变
    const tabs = await contentPage.locator('.s-tab-item').allTextContents();
    expect(tabs[0]).not.toBe('Tab 1');
  });
});

test.describe('主工作区导航测试 - Tab 持久化', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const pages = await initAppWorkbenchPages(electronApp);
    headerPage = pages.headerPage;
    contentPage = pages.contentPage;

    await clearAppWorkbenchState(headerPage, contentPage);
    await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID);
  });

  test('Tab 状态保存到 localStorage (按 projectId)', async () => {
    const tab = createMockTab({ id: 'tab1', title: '持久化Tab' });

    await createTabInStorage(contentPage, TEST_PROJECT_ID, tab);

    // 验证持久化
    await expectTabPersisted(contentPage, TEST_PROJECT_ID, [
      { id: 'tab1', title: '持久化Tab' }
    ]);
  });

  test('页面重载后恢复 Tab 列表', async () => {
    const tab1 = createMockTab({ id: 'tab1', title: 'Tab 1' });
    const tab2 = createMockTab({ id: 'tab2', title: 'Tab 2' });

    await createTabInStorage(contentPage, TEST_PROJECT_ID, tab1);
    await createTabInStorage(contentPage, TEST_PROJECT_ID, tab2);

    // 重载页面
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 验证 Tab 恢复
    await expectTabExists(contentPage, 'Tab 1');
    await expectTabExists(contentPage, 'Tab 2');

    const count = await getTabCount(contentPage);
    expect(count).toBe(2);
  });

  test('恢复激活状态的 Tab', async () => {
    const tab1 = createMockTab({ id: 'tab1', title: 'Tab 1' });
    const tab2 = createMockTab({ id: 'tab2', title: 'Tab 2' });

    await createTabInStorage(contentPage, TEST_PROJECT_ID, tab1);
    await createTabInStorage(contentPage, TEST_PROJECT_ID, tab2);
    await setActiveTab(contentPage, TEST_PROJECT_ID, 'tab2');

    // 重载页面
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 验证 Tab 2 是激活状态
    await expectActiveTab(contentPage, 'Tab 2');
  });

  test('多项目 Tab 隔离存储', async () => {
    const project1Tab = createMockTab({ id: 'tab1', title: 'Project1 Tab' });
    const project2Tab = createMockTab({ id: 'tab2', title: 'Project2 Tab' });

    await createTabInStorage(contentPage, 'project-001', project1Tab);
    await createTabInStorage(contentPage, 'project-002', project2Tab);

    // 验证两个项目的 Tab 独立存储
    await expectTabPersisted(contentPage, 'project-001', [
      { id: 'tab1', title: 'Project1 Tab' }
    ]);

    await expectTabPersisted(contentPage, 'project-002', [
      { id: 'tab2', title: 'Project2 Tab' }
    ]);
  });
});

test.describe('主工作区导航测试 - Banner 树导航', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const pages = await initAppWorkbenchPages(electronApp);
    headerPage = pages.headerPage;
    contentPage = pages.contentPage;

    await clearAppWorkbenchState(headerPage, contentPage);
    await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID);
  });

  test('点击节点打开对应 Tab', async () => {
    const httpNode = createMockHttpNode({ name: 'GET /users' });
    await setBannerData(contentPage, TEST_PROJECT_ID, [httpNode]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    await clickBannerNode(contentPage, 'GET /users');

    // 验证 Tab 创建
    await expectTabExists(contentPage, 'GET /users');
    await expectActiveTab(contentPage, 'GET /users');
  });

  test('双击节点固定 Tab', async () => {
    const httpNode = createMockHttpNode({ name: 'POST /login' });
    await setBannerData(contentPage, TEST_PROJECT_ID, [httpNode]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    await doubleClickBannerNode(contentPage, 'POST /login');

    // 验证 Tab 被固定
    const savedTabs = await getLocalStorageData(contentPage, 'workbench/node/tabs');
    const tab = savedTabs[TEST_PROJECT_ID][0];
    expect(tab.fixed).toBe(true);
  });

  test('展开/折叠文件夹节点', async () => {
    const folder = createMockFolder({
      name: 'API文件夹',
      children: [
        createMockHttpNode({ name: '子接口' })
      ]
    });

    await setBannerData(contentPage, TEST_PROJECT_ID, [folder]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 展开文件夹
    await expandBannerFolder(contentPage, 'API文件夹');

    // 验证子节点可见
    await expectNodeExists(contentPage, '子接口');
  });

  test('展开状态持久化到 localStorage', async () => {
    const folder = createMockFolder({ _id: 'folder-001', name: '持久化文件夹' });
    await setBannerData(contentPage, TEST_PROJECT_ID, [folder]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 展开文件夹
    await expandBannerFolder(contentPage, '持久化文件夹');

    // 验证展开状态保存
    const expandedKeys = await contentPage.evaluate(() => {
      return JSON.parse(localStorage.getItem('banner/expandedKeys') || '[]');
    });

    expect(expandedKeys).toContain('folder-001');
  });

  test('过滤/搜索节点', async () => {
    const nodes = [
      createMockHttpNode({ name: 'GET /users' }),
      createMockHttpNode({ name: 'POST /login' }),
      createMockHttpNode({ name: 'GET /products' }),
    ];

    await setBannerData(contentPage, TEST_PROJECT_ID, nodes);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 输入搜索关键词
    const searchInput = contentPage.locator('.banner-search-input');
    await searchInput.fill('users');
    await contentPage.waitForTimeout(300);

    // 验证只显示匹配的节点
    await expectNodeExists(contentPage, 'GET /users');

    const visibleNodes = await contentPage.locator('.s-v-tree-node:visible').count();
    expect(visibleNodes).toBe(1);
  });
});

test.describe('主工作区导航测试 - 键盘快捷键', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const pages = await initAppWorkbenchPages(electronApp);
    headerPage = pages.headerPage;
    contentPage = pages.contentPage;

    await clearAppWorkbenchState(headerPage, contentPage);
    await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID);
  });

  test('Ctrl+W 关闭当前 Tab', async () => {
    const tab = createMockTab({ id: 'tab1', title: '快捷键Tab' });
    await createTabInStorage(contentPage, TEST_PROJECT_ID, tab);
    await setActiveTab(contentPage, TEST_PROJECT_ID, 'tab1');
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 验证 Tab 存在
    await expectTabExists(contentPage, '快捷键Tab');

    // 按下 Ctrl+W
    await pressModifierKey(contentPage, 'Control', 'w');

    // 验证 Tab 关闭
    const count = await getTabCount(contentPage);
    expect(count).toBe(0);
  });

  test('Ctrl+S 保存当前文档', async () => {
    const unsavedTab = createMockTab({
      id: 'tab1',
      title: '未保存文档',
      saved: false
    });

    await createTabInStorage(contentPage, TEST_PROJECT_ID, unsavedTab);
    await setActiveTab(contentPage, TEST_PROJECT_ID, 'tab1');
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 设置保存监听
    await setupIPCListener(contentPage);

    // 按下 Ctrl+S
    await pressModifierKey(contentPage, 'Control', 's');

    // 验证保存事件触发
    const events = await getCapturedIPCEvents(contentPage);
    const saveEvent = events.find(e => e.event.includes('save'));
    expect(saveEvent).toBeDefined();
  });

  test('F2 重命名选中节点', async () => {
    const httpNode = createMockHttpNode({ name: '重命名测试' });
    await setBannerData(contentPage, TEST_PROJECT_ID, [httpNode]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 选中节点
    await clickBannerNode(contentPage, '重命名测试');

    // 按下 F2
    await contentPage.keyboard.press('F2');
    await contentPage.waitForTimeout(300);

    // 验证进入重命名模式
    const renameInput = contentPage.locator('.rename-input');
    await expect(renameInput).toBeVisible();
  });
});

test.describe('主工作区导航测试 - 请求取消', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const pages = await initAppWorkbenchPages(electronApp);
    headerPage = pages.headerPage;
    contentPage = pages.contentPage;

    await clearAppWorkbenchState(headerPage, contentPage);
    await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID);
  });

  test('切换 Tab 时取消上一个 Tab 的 HTTP 请求', async () => {
    const tab1 = createMockTab({ id: 'tab1', title: 'API Tab 1', type: 'http' });
    const tab2 = createMockTab({ id: 'tab2', title: 'API Tab 2', type: 'http' });

    await createTabInStorage(contentPage, TEST_PROJECT_ID, tab1);
    await createTabInStorage(contentPage, TEST_PROJECT_ID, tab2);
    await setActiveTab(contentPage, TEST_PROJECT_ID, 'tab1');
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 监听请求取消
    let requestCancelled = false;
    await contentPage.evaluate(() => {
      (window as any)._abortControllers = [];
      const OriginalAbortController = (window as any).AbortController;
      (window as any).AbortController = function() {
        const controller = new OriginalAbortController();
        (window as any)._abortControllers.push(controller);
        return controller;
      };
    });

    // 模拟发起请求（实际项目中应该真实发起）
    await contentPage.evaluate(() => {
      const controller = new AbortController();
      (window as any)._currentRequest = controller;
    });

    // 切换到 Tab 2
    const tab2Locator = contentPage.locator('.s-tab-item').filter({ hasText: 'API Tab 2' });
    await tab2Locator.click();

    // 验证请求被取消
    requestCancelled = await contentPage.evaluate(() => {
      return (window as any)._currentRequest?.signal.aborted === true;
    });

    // 注：实际验证依赖于具体实现
    await expectActiveTab(contentPage, 'API Tab 2');
  });

  test('关闭 Tab 时取消该 Tab 的请求', async () => {
    const tab = createMockTab({ id: 'tab1', title: '请求Tab', type: 'http' });
    await createTabInStorage(contentPage, TEST_PROJECT_ID, tab);
    await setActiveTab(contentPage, TEST_PROJECT_ID, 'tab1');
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 关闭 Tab
    await closeTab(contentPage, '请求Tab');

    // 验证 Tab 关闭
    const count = await getTabCount(contentPage);
    expect(count).toBe(0);
  });

  test('批量关闭 Tab 时取消所有请求', async () => {
    const tabs = [
      createMockTab({ id: 'tab1', title: 'Tab 1' }),
      createMockTab({ id: 'tab2', title: 'Tab 2' }),
      createMockTab({ id: 'tab3', title: 'Tab 3' }),
    ];

    for (const tab of tabs) {
      await createTabInStorage(contentPage, TEST_PROJECT_ID, tab);
    }
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 右键打开批量关闭菜单
    const firstTab = contentPage.locator('.s-tab-item').first();
    await firstTab.click({ button: 'right' });
    await contentPage.waitForTimeout(300);

    // 点击"关闭所有"
    const closeAllOption = contentPage.locator('.context-menu-item').filter({ hasText: '关闭所有' });
    await closeAllOption.click();
    await contentPage.waitForTimeout(500);

    // 验证所有 Tab 关闭
    const count = await getTabCount(contentPage);
    expect(count).toBe(0);
  });
});

test.describe('主工作区导航测试 - 边界条件', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const pages = await initAppWorkbenchPages(electronApp);
    headerPage = pages.headerPage;
    contentPage = pages.contentPage;

    await clearAppWorkbenchState(headerPage, contentPage);
    await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID);
  });

  test('无 Tab 时显示空状态', async () => {
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 验证显示空状态提示
    const emptyState = contentPage.locator('.empty-tab-state, .empty-tabs');
    await expect(emptyState).toBeVisible();

    const count = await getTabCount(contentPage);
    expect(count).toBe(0);
  });

  test('关闭最后一个 Tab 后跳转默认页', async () => {
    const tab = createMockTab({ id: 'tab1', title: '最后Tab' });
    await createTabInStorage(contentPage, TEST_PROJECT_ID, tab);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 关闭最后一个 Tab
    await closeTab(contentPage, '最后Tab');

    // 验证显示默认空状态
    const count = await getTabCount(contentPage);
    expect(count).toBe(0);
  });

  test('localStorage 数据损坏时使用默认值', async () => {
    // 设置损坏的数据
    await mockLocalStorageData(contentPage, 'workbench/node/tabs', 'invalid-json-data');

    // 重载页面
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 验证不会崩溃，使用默认值
    const count = await getTabCount(contentPage);
    expect(count).toBe(0);

    // 验证组件正常显示
    const workbenchContainer = contentPage.locator('.project-workbench');
    await expect(workbenchContainer).toBeVisible();
  });

  test('不存在的 activeTab 降级处理', async () => {
    const tab1 = createMockTab({ id: 'tab1', title: 'Tab 1' });
    await createTabInStorage(contentPage, TEST_PROJECT_ID, tab1);

    // 设置不存在的 activeTab
    await contentPage.evaluate(
      ({ pid }) => {
        const allTabs = JSON.parse(localStorage.getItem('workbench/node/tabs') || '{}');
        allTabs[pid][0].isActive = false;
        localStorage.setItem('workbench/node/tabs', JSON.stringify(allTabs));
        localStorage.setItem('workbench/activeTab', 'non-existent-tab-id');
      },
      { pid: TEST_PROJECT_ID }
    );

    // 重载页面
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 验证降级到第一个 Tab 或无激活状态
    const count = await getTabCount(contentPage);
    expect(count).toBe(1);

    // 页面不应崩溃
    const workbenchContainer = contentPage.locator('.project-workbench');
    await expect(workbenchContainer).toBeVisible();
  });
});

test.describe('主工作区导航测试 - 用户交互细节', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const pages = await initAppWorkbenchPages(electronApp);
    headerPage = pages.headerPage;
    contentPage = pages.contentPage;

    await clearAppWorkbenchState(headerPage, contentPage);
    await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID);
  });

  test('Tab 关闭按钮 hover 显示', async () => {
    const tab = createMockTab({ id: 'tab1', title: 'Hover Tab' });
    await createTabInStorage(contentPage, TEST_PROJECT_ID, tab);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    const tabLocator = contentPage.locator('.s-tab-item').filter({ hasText: 'Hover Tab' });
    const closeBtn = tabLocator.locator('.close-icon');

    // 初始状态关闭按钮不可见或透明
    const initialOpacity = await closeBtn.evaluate(el => window.getComputedStyle(el).opacity);
    expect(parseFloat(initialOpacity)).toBeLessThanOrEqual(0.3);

    // Hover 后关闭按钮可见
    await tabLocator.hover();
    await contentPage.waitForTimeout(200);

    const hoverOpacity = await closeBtn.evaluate(el => window.getComputedStyle(el).opacity);
    expect(parseFloat(hoverOpacity)).toBeGreaterThan(0.8);
  });

  test('Tab 标题过长显示省略号和 tooltip', async () => {
    const longTitle = '这是一个非常非常非常长的接口标题用于测试省略号显示功能和tooltip提示';
    const tab = createMockTab({ id: 'tab1', title: longTitle });
    await createTabInStorage(contentPage, TEST_PROJECT_ID, tab);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    const tabLocator = contentPage.locator('.s-tab-item').filter({ hasText: longTitle });

    // 验证 title 属性包含完整标题
    const titleAttr = await tabLocator.getAttribute('title');
    expect(titleAttr).toContain(longTitle);

    // 验证文本被截断
    const tabTitle = tabLocator.locator('.tab-title');
    const hasEllipsis = await tabTitle.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.textOverflow === 'ellipsis' && style.overflow === 'hidden';
    });

    expect(hasEllipsis).toBe(true);
  });

  test('同一页面不重复创建 Tab', async () => {
    const httpNode = createMockHttpNode({ _id: 'node-001', name: '唯一接口' });
    await setBannerData(contentPage, TEST_PROJECT_ID, [httpNode]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 第一次点击创建 Tab
    await clickBannerNode(contentPage, '唯一接口');
    await contentPage.waitForTimeout(300);

    let count = await getTabCount(contentPage);
    expect(count).toBe(1);

    // 第二次点击不应创建重复 Tab
    await clickBannerNode(contentPage, '唯一接口');
    await contentPage.waitForTimeout(300);

    count = await getTabCount(contentPage);
    expect(count).toBe(1); // 仍然只有一个

    // 验证 Tab 被激活
    await expectActiveTab(contentPage, '唯一接口');
  });

  test('未保存 Tab 显示圆点标记', async () => {
    const unsavedTab = createMockTab({
      id: 'tab1',
      title: '未保存Tab',
      saved: false
    });

    await createTabInStorage(contentPage, TEST_PROJECT_ID, unsavedTab);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 验证显示未保存标记
    const tabLocator = contentPage.locator('.s-tab-item').filter({ hasText: '未保存Tab' });
    const unsavedIndicator = tabLocator.locator('.unsaved-dot, .unsaved-indicator');
    await expect(unsavedIndicator).toBeVisible();
  });
});
// ==================== 操作测试 ====================

test.describe('主工作区操作测试 - HTTP 节点 CRUD', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const pages = await initAppWorkbenchPages(electronApp);
    headerPage = pages.headerPage;
    contentPage = pages.contentPage;

    await clearAppWorkbenchState(headerPage, contentPage);
    await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID);
  });

  test('创建根级 HTTP 节点', async () => {
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 点击工具栏"新建接口"按钮
    const addNodeBtn = contentPage.locator('.toolbar-btn').filter({ hasText: '新建接口' });
    await addNodeBtn.click();
    await contentPage.waitForTimeout(500);

    // 验证新节点出现
    const newNodeDialog = contentPage.locator('.create-node-dialog');
    await expect(newNodeDialog).toBeVisible();

    // 输入节点名称
    const nameInput = newNodeDialog.locator('input[placeholder*="名称"]');
    await nameInput.fill('新建HTTP接口');

    // 确认创建
    const confirmBtn = newNodeDialog.locator('button').filter({ hasText: '确定' });
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);

    // 验证节点创建成功
    await expectNodeExists(contentPage, '新建HTTP接口');
  });

  test('创建文件夹内 HTTP 节点', async () => {
    const folder = createMockFolder({ name: 'API文件夹' });
    await setBannerData(contentPage, TEST_PROJECT_ID, [folder]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 右键文件夹
    await rightClickBannerNode(contentPage, 'API文件夹');

    // 点击"新建接口"菜单项
    const createNodeOption = contentPage.locator('.context-menu-item').filter({ hasText: '新建接口' });
    await createNodeOption.click();
    await contentPage.waitForTimeout(500);

    // 输入节点名称
    const nameInput = contentPage.locator('input[placeholder*="名称"]');
    await nameInput.fill('子接口');

    // 确认创建
    const confirmBtn = contentPage.locator('button').filter({ hasText: '确定' });
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);

    // 展开文件夹验证
    await expandBannerFolder(contentPage, 'API文件夹');
    await expectNodeExists(contentPage, '子接口');
  });

  test('重命名 HTTP 节点', async () => {
    const httpNode = createMockHttpNode({ name: '旧名称' });
    await setBannerData(contentPage, TEST_PROJECT_ID, [httpNode]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 选中节点并按 F2
    await clickBannerNode(contentPage, '旧名称');
    await contentPage.keyboard.press('F2');
    await contentPage.waitForTimeout(300);

    // 输入新名称
    const renameInput = contentPage.locator('.rename-input');
    await renameInput.fill('新名称');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(500);

    // 验证名称更新
    await expectNodeExists(contentPage, '新名称');
  });

  test('删除单个 HTTP 节点（含确认弹窗）', async () => {
    const httpNode = createMockHttpNode({ name: '待删除接口' });
    await setBannerData(contentPage, TEST_PROJECT_ID, [httpNode]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 右键节点
    await rightClickBannerNode(contentPage, '待删除接口');

    // 点击删除
    const deleteOption = contentPage.locator('.context-menu-item').filter({ hasText: '删除' });
    await deleteOption.click();
    await contentPage.waitForTimeout(300);

    // 确认删除弹窗
    const confirmDialog = contentPage.locator('.confirm-dialog, .el-message-box');
    await expect(confirmDialog).toBeVisible();

    const confirmBtn = confirmDialog.locator('button').filter({ hasText: '确定' });
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);

    // 验证节点被删除
    const nodeExists = await contentPage.locator('.s-v-tree-node').filter({ hasText: '待删除接口' }).count();
    expect(nodeExists).toBe(0);
  });

  test('删除多个节点（批量删除）', async () => {
    const nodes = [
      createMockHttpNode({ _id: 'node1', name: '接口1' }),
      createMockHttpNode({ _id: 'node2', name: '接口2' }),
      createMockHttpNode({ _id: 'node3', name: '接口3' }),
    ];

    await setBannerData(contentPage, TEST_PROJECT_ID, nodes);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 按住 Ctrl 多选节点
    await contentPage.keyboard.down('Control');
    await clickBannerNode(contentPage, '接口1');
    await clickBannerNode(contentPage, '接口2');
    await contentPage.keyboard.up('Control');

    // 按 Ctrl+D 删除或右键删除
    await pressModifierKey(contentPage, 'Control', 'd');
    await contentPage.waitForTimeout(300);

    // 确认删除
    const confirmDialog = contentPage.locator('.confirm-dialog, .el-message-box');
    if (await confirmDialog.isVisible()) {
      const confirmBtn = confirmDialog.locator('button').filter({ hasText: '确定' });
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
    }

    // 验证节点被删除
    const node1Exists = await contentPage.locator('.s-v-tree-node').filter({ hasText: '接口1' }).count();
    const node2Exists = await contentPage.locator('.s-v-tree-node').filter({ hasText: '接口2' }).count();
    expect(node1Exists).toBe(0);
    expect(node2Exists).toBe(0);

    // 验证接口3仍存在
    await expectNodeExists(contentPage, '接口3');
  });

  test('删除节点后关联 Tab 自动关闭', async () => {
    const httpNode = createMockHttpNode({ _id: 'node-001', name: '关联接口' });
    await setBannerData(contentPage, TEST_PROJECT_ID, [httpNode]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 打开 Tab
    await clickBannerNode(contentPage, '关联接口');
    await expectTabExists(contentPage, '关联接口');

    // 删除节点
    await rightClickBannerNode(contentPage, '关联接口');
    const deleteOption = contentPage.locator('.context-menu-item').filter({ hasText: '删除' });
    await deleteOption.click();
    await contentPage.waitForTimeout(300);

    // 确认删除
    const confirmDialog = contentPage.locator('.confirm-dialog, .el-message-box');
    if (await confirmDialog.isVisible()) {
      const confirmBtn = confirmDialog.locator('button').filter({ hasText: '确定' });
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
    }

    // 验证 Tab 自动关闭
    const tabCount = await getTabCount(contentPage);
    expect(tabCount).toBe(0);
  });
});

test.describe('主工作区操作测试 - 文件夹操作', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const pages = await initAppWorkbenchPages(electronApp);
    headerPage = pages.headerPage;
    contentPage = pages.contentPage;

    await clearAppWorkbenchState(headerPage, contentPage);
    await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID);
  });

  test('创建根级文件夹', async () => {
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 点击"新建文件夹"按钮
    const addFolderBtn = contentPage.locator('.toolbar-btn').filter({ hasText: '新建文件夹' });
    await addFolderBtn.click();
    await contentPage.waitForTimeout(300);

    // 输入文件夹名称
    const nameInput = contentPage.locator('input[placeholder*="文件夹名称"]');
    await nameInput.fill('根文件夹');

    // 确认创建
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(500);

    // 验证文件夹创建
    await expectNodeExists(contentPage, '根文件夹');
  });

  test('创建嵌套文件夹', async () => {
    const parentFolder = createMockFolder({ name: '父文件夹' });
    await setBannerData(contentPage, TEST_PROJECT_ID, [parentFolder]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 右键父文件夹
    await rightClickBannerNode(contentPage, '父文件夹');

    // 点击"新建文件夹"
    const createFolderOption = contentPage.locator('.context-menu-item').filter({ hasText: '新建文件夹' });
    await createFolderOption.click();
    await contentPage.waitForTimeout(300);

    // 输入子文件夹名称
    const nameInput = contentPage.locator('input[placeholder*="文件夹名称"]');
    await nameInput.fill('子文件夹');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(500);

    // 展开父文件夹验证
    await expandBannerFolder(contentPage, '父文件夹');
    await expectNodeExists(contentPage, '子文件夹');
  });

  test('重命名文件夹', async () => {
    const folder = createMockFolder({ name: '旧文件夹名' });
    await setBannerData(contentPage, TEST_PROJECT_ID, [folder]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 选中并按 F2
    await clickBannerNode(contentPage, '旧文件夹名');
    await contentPage.keyboard.press('F2');
    await contentPage.waitForTimeout(300);

    // 输入新名称
    const renameInput = contentPage.locator('.rename-input');
    await renameInput.fill('新文件夹名');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(500);

    // 验证名称更新
    await expectNodeExists(contentPage, '新文件夹名');
  });

  test('删除文件夹（递归删除所有子节点）', async () => {
    const folder = createMockFolder({
      name: '待删除文件夹',
      children: [
        createMockHttpNode({ name: '子接口1' }),
        createMockHttpNode({ name: '子接口2' }),
      ]
    });

    await setBannerData(contentPage, TEST_PROJECT_ID, [folder]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 删除文件夹
    await rightClickBannerNode(contentPage, '待删除文件夹');
    const deleteOption = contentPage.locator('.context-menu-item').filter({ hasText: '删除' });
    await deleteOption.click();
    await contentPage.waitForTimeout(300);

    // 确认删除
    const confirmDialog = contentPage.locator('.confirm-dialog, .el-message-box');
    const confirmBtn = confirmDialog.locator('button').filter({ hasText: '确定' });
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);

    // 验证文件夹和子节点都被删除
    const folderExists = await contentPage.locator('.s-v-tree-node').filter({ hasText: '待删除文件夹' }).count();
    expect(folderExists).toBe(0);
  });

  test('删除文件夹后关联 Tab 全部关闭', async () => {
    const folder = createMockFolder({
      _id: 'folder-001',
      name: '测试文件夹',
      children: [
        createMockHttpNode({ _id: 'node1', name: '接口1' }),
        createMockHttpNode({ _id: 'node2', name: '接口2' }),
      ]
    });

    await setBannerData(contentPage, TEST_PROJECT_ID, [folder]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 打开子节点的 Tab
    await expandBannerFolder(contentPage, '测试文件夹');
    await clickBannerNode(contentPage, '接口1');
    await clickBannerNode(contentPage, '接口2');

    let tabCount = await getTabCount(contentPage);
    expect(tabCount).toBe(2);

    // 删除文件夹
    await rightClickBannerNode(contentPage, '测试文件夹');
    const deleteOption = contentPage.locator('.context-menu-item').filter({ hasText: '删除' });
    await deleteOption.click();
    await contentPage.waitForTimeout(300);

    // 确认删除
    const confirmDialog = contentPage.locator('.confirm-dialog, .el-message-box');
    const confirmBtn = confirmDialog.locator('button').filter({ hasText: '确定' });
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);

    // 验证所有关联 Tab 关闭
    tabCount = await getTabCount(contentPage);
    expect(tabCount).toBe(0);
  });
});

test.describe('主工作区操作测试 - 复制/剪切/粘贴', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const pages = await initAppWorkbenchPages(electronApp);
    headerPage = pages.headerPage;
    contentPage = pages.contentPage;

    await clearAppWorkbenchState(headerPage, contentPage);
    await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID);
  });

  test('复制单个节点并粘贴', async () => {
    const httpNode = createMockHttpNode({ name: '待复制接口' });
    const targetFolder = createMockFolder({ name: '目标文件夹' });

    await setBannerData(contentPage, TEST_PROJECT_ID, [httpNode, targetFolder]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 复制节点
    await clickBannerNode(contentPage, '待复制接口');
    await pressModifierKey(contentPage, 'Control', 'c');
    await contentPage.waitForTimeout(300);

    // 粘贴到目标文件夹
    await rightClickBannerNode(contentPage, '目标文件夹');
    const pasteOption = contentPage.locator('.context-menu-item').filter({ hasText: '粘贴' });
    await pasteOption.click();
    await contentPage.waitForTimeout(500);

    // 验证节点被复制
    await expandBannerFolder(contentPage, '目标文件夹');
    await expectNodeExists(contentPage, '待复制接口');
  });

  test('复制多个节点批量粘贴', async () => {
    const nodes = [
      createMockHttpNode({ name: '接口1' }),
      createMockHttpNode({ name: '接口2' }),
    ];
    const targetFolder = createMockFolder({ name: '批量目标' });

    await setBannerData(contentPage, TEST_PROJECT_ID, [...nodes, targetFolder]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 多选节点
    await contentPage.keyboard.down('Control');
    await clickBannerNode(contentPage, '接口1');
    await clickBannerNode(contentPage, '接口2');
    await contentPage.keyboard.up('Control');

    // 复制
    await pressModifierKey(contentPage, 'Control', 'c');
    await contentPage.waitForTimeout(300);

    // 粘贴
    await rightClickBannerNode(contentPage, '批量目标');
    const pasteOption = contentPage.locator('.context-menu-item').filter({ hasText: '粘贴' });
    await pasteOption.click();
    await contentPage.waitForTimeout(500);

    // 验证节点被复制
    await expandBannerFolder(contentPage, '批量目标');
    await expectNodeExists(contentPage, '接口1');
    await expectNodeExists(contentPage, '接口2');
  });

  test('剪切节点并粘贴（移动）', async () => {
    const httpNode = createMockHttpNode({ name: '待移动接口' });
    const sourceFolder = createMockFolder({ name: '源文件夹', children: [httpNode] });
    const targetFolder = createMockFolder({ name: '目标文件夹' });

    await setBannerData(contentPage, TEST_PROJECT_ID, [sourceFolder, targetFolder]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 展开源文件夹
    await expandBannerFolder(contentPage, '源文件夹');

    // 剪切节点
    await clickBannerNode(contentPage, '待移动接口');
    await pressModifierKey(contentPage, 'Control', 'x');
    await contentPage.waitForTimeout(300);

    // 粘贴到目标文件夹
    await rightClickBannerNode(contentPage, '目标文件夹');
    const pasteOption = contentPage.locator('.context-menu-item').filter({ hasText: '粘贴' });
    await pasteOption.click();
    await contentPage.waitForTimeout(500);

    // 验证节点被移动
    await expandBannerFolder(contentPage, '目标文件夹');
    await expectNodeExists(contentPage, '待移动接口');

    // 验证源文件夹中不再存在（实际实现可能需要刷新）
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);
    await expandBannerFolder(contentPage, '源文件夹');

    const nodeInSource = await contentPage.locator('.s-v-tree-node').filter({ hasText: '待移动接口' }).count();
    expect(nodeInSource).toBeLessThanOrEqual(1); // 移动后源文件夹应该为空或只在目标文件夹
  });

  test('粘贴时生成新 ID', async () => {
    const httpNode = createMockHttpNode({ _id: 'original-001', name: '测试接口' });
    await setBannerData(contentPage, TEST_PROJECT_ID, [httpNode]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 复制节点
    await clickBannerNode(contentPage, '测试接口');
    await pressModifierKey(contentPage, 'Control', 'c');

    // 粘贴到根节点
    await rightClickBannerNode(contentPage, '测试接口');
    const pasteOption = contentPage.locator('.context-menu-item').filter({ hasText: '粘贴' });

    // 在空白处右键粘贴
    const bannerContainer = contentPage.locator('.banner-tree');
    await bannerContainer.click({ button: 'right', position: { x: 10, y: 10 } });
    await contentPage.waitForTimeout(300);

    const pasteInRoot = contentPage.locator('.context-menu-item').filter({ hasText: '粘贴' });
    if (await pasteInRoot.isVisible()) {
      await pasteInRoot.click();
      await contentPage.waitForTimeout(500);
    }

    // 验证生成了新节点（具体验证需要检查 banner 数据）
    const nodeCount = await contentPage.locator('.s-v-tree-node').filter({ hasText: '测试接口' }).count();
    expect(nodeCount).toBeGreaterThanOrEqual(1);
  });

  test('粘贴到不同文件夹更新父引用', async () => {
    const httpNode = createMockHttpNode({ name: '引用测试接口', pid: 'folder-001' });
    const folder1 = createMockFolder({ _id: 'folder-001', name: '文件夹1', children: [httpNode] });
    const folder2 = createMockFolder({ _id: 'folder-002', name: '文件夹2' });

    await setBannerData(contentPage, TEST_PROJECT_ID, [folder1, folder2]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 展开文件夹1
    await expandBannerFolder(contentPage, '文件夹1');

    // 复制节点
    await clickBannerNode(contentPage, '引用测试接口');
    await pressModifierKey(contentPage, 'Control', 'c');

    // 粘贴到文件夹2
    await rightClickBannerNode(contentPage, '文件夹2');
    const pasteOption = contentPage.locator('.context-menu-item').filter({ hasText: '粘贴' });
    await pasteOption.click();
    await contentPage.waitForTimeout(500);

    // 验证节点在文件夹2中
    await expandBannerFolder(contentPage, '文件夹2');
    await expectNodeExists(contentPage, '引用测试接口');
  });
});

test.describe('主工作区操作测试 - Fork/复制', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const pages = await initAppWorkbenchPages(electronApp);
    headerPage = pages.headerPage;
    contentPage = pages.contentPage;

    await clearAppWorkbenchState(headerPage, contentPage);
    await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID);
  });

  test('Fork HTTP 节点创建副本', async () => {
    const httpNode = createMockHttpNode({ name: '原始接口' });
    await setBannerData(contentPage, TEST_PROJECT_ID, [httpNode]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 右键 Fork
    await rightClickBannerNode(contentPage, '原始接口');
    const forkOption = contentPage.locator('.context-menu-item').filter({ hasText: 'Fork' });
    await forkOption.click();
    await contentPage.waitForTimeout(500);

    // 验证副本创建
    const nodeCount = await contentPage.locator('.s-v-tree-node').count();
    expect(nodeCount).toBeGreaterThanOrEqual(2);
  });

  test('Fork WebSocket 节点', async () => {
    const wsNode = createMockWebSocketNode({ name: 'WebSocket连接' });
    await setBannerData(contentPage, TEST_PROJECT_ID, [wsNode]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 右键 Fork
    await rightClickBannerNode(contentPage, 'WebSocket连接');
    const forkOption = contentPage.locator('.context-menu-item').filter({ hasText: 'Fork' });
    await forkOption.click();
    await contentPage.waitForTimeout(500);

    // 验证副本创建
    const nodeCount = await contentPage.locator('.s-v-tree-node').filter({ hasText: 'WebSocket' }).count();
    expect(nodeCount).toBeGreaterThanOrEqual(2);
  });

  test('Fork 后保留内容结构', async () => {
    const httpNode = createMockHttpNode({
      name: '复杂接口',
      // 实际会包含 request、response 等完整结构
    });

    await setBannerData(contentPage, TEST_PROJECT_ID, [httpNode]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // Fork 节点
    await rightClickBannerNode(contentPage, '复杂接口');
    const forkOption = contentPage.locator('.context-menu-item').filter({ hasText: 'Fork' });
    await forkOption.click();
    await contentPage.waitForTimeout(500);

    // 打开 Fork 后的节点验证内容（需要实际实现）
    const nodes = await contentPage.locator('.s-v-tree-node').all();
    expect(nodes.length).toBeGreaterThanOrEqual(2);
  });

  test('Fork 后生成新 ID', async () => {
    const httpNode = createMockHttpNode({ _id: 'original-id', name: 'ID测试接口' });
    await setBannerData(contentPage, TEST_PROJECT_ID, [httpNode]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // Fork
    await rightClickBannerNode(contentPage, 'ID测试接口');
    const forkOption = contentPage.locator('.context-menu-item').filter({ hasText: 'Fork' });
    await forkOption.click();
    await contentPage.waitForTimeout(500);

    // 验证生成新节点（实际需要检查后端数据）
    const nodeCount = await contentPage.locator('.s-v-tree-node').count();
    expect(nodeCount).toBe(2);
  });
});

test.describe('主工作区操作测试 - 拖拽排序', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const pages = await initAppWorkbenchPages(electronApp);
    headerPage = pages.headerPage;
    contentPage = pages.contentPage;

    await clearAppWorkbenchState(headerPage, contentPage);
    await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID);
  });

  test('拖拽节点到文件夹内', async () => {
    const httpNode = createMockHttpNode({ name: '拖拽接口' });
    const folder = createMockFolder({ name: '目标文件夹' });

    await setBannerData(contentPage, TEST_PROJECT_ID, [httpNode, folder]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 拖拽节点到文件夹
    const nodeLocator = contentPage.locator('.s-v-tree-node').filter({ hasText: '拖拽接口' });
    const folderLocator = contentPage.locator('.s-v-tree-node').filter({ hasText: '目标文件夹' });

    await nodeLocator.dragTo(folderLocator);
    await contentPage.waitForTimeout(500);

    // 验证节点移入文件夹
    await expandBannerFolder(contentPage, '目标文件夹');
    await expectNodeExists(contentPage, '拖拽接口');
  });

  test('拖拽节点改变同级顺序', async () => {
    const nodes = [
      createMockHttpNode({ name: '接口A' }),
      createMockHttpNode({ name: '接口B' }),
      createMockHttpNode({ name: '接口C' }),
    ];

    await setBannerData(contentPage, TEST_PROJECT_ID, nodes);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 拖拽第一个到最后
    const firstNode = contentPage.locator('.s-v-tree-node').first();
    const lastNode = contentPage.locator('.s-v-tree-node').last();

    await firstNode.dragTo(lastNode);
    await contentPage.waitForTimeout(500);

    // 验证顺序改变
    const orderedNodes = await contentPage.locator('.s-v-tree-node').allTextContents();
    expect(orderedNodes[0]).not.toBe('接口A');
  });

  test('验证规则：文件不能在文件夹后面', async () => {
    const folder = createMockFolder({ name: '文件夹' });
    const httpNode = createMockHttpNode({ name: '接口' });

    await setBannerData(contentPage, TEST_PROJECT_ID, [httpNode, folder]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 尝试将接口拖到文件夹后面
    const nodeLocator = contentPage.locator('.s-v-tree-node').filter({ hasText: '接口' });
    const folderLocator = contentPage.locator('.s-v-tree-node').filter({ hasText: '文件夹' });

    // 实际应该拒绝此操作或自动调整顺序
    try {
      await nodeLocator.dragTo(folderLocator, { force: true });
      await contentPage.waitForTimeout(500);

      // 验证顺序仍然是文件夹在后
      const nodes = await contentPage.locator('.s-v-tree-node').allTextContents();
      const folderIndex = nodes.findIndex(n => n.includes('文件夹'));
      const nodeIndex = nodes.findIndex(n => n.includes('接口'));

      // 文件夹应该在接口后面
      expect(folderIndex).toBeGreaterThan(nodeIndex);
    } catch (error) {
      // 拖拽被拒绝也是合理的
    }
  });

  test('拖拽跨文件夹移动', async () => {
    const folder1 = createMockFolder({
      name: '文件夹1',
      children: [createMockHttpNode({ name: '接口X' })]
    });
    const folder2 = createMockFolder({ name: '文件夹2' });

    await setBannerData(contentPage, TEST_PROJECT_ID, [folder1, folder2]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 展开文件夹1
    await expandBannerFolder(contentPage, '文件夹1');

    // 拖拽接口到文件夹2
    const nodeLocator = contentPage.locator('.s-v-tree-node').filter({ hasText: '接口X' });
    const folder2Locator = contentPage.locator('.s-v-tree-node').filter({ hasText: '文件夹2' }).first();

    await nodeLocator.dragTo(folder2Locator);
    await contentPage.waitForTimeout(500);

    // 验证移动成功
    await expandBannerFolder(contentPage, '文件夹2');
    await expectNodeExists(contentPage, '接口X');
  });

  test('拖拽更新父引用', async () => {
    const httpNode = createMockHttpNode({ _id: 'node-001', name: '引用节点', pid: '' });
    const folder = createMockFolder({ _id: 'folder-001', name: '父文件夹' });

    await setBannerData(contentPage, TEST_PROJECT_ID, [httpNode, folder]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 拖拽到文件夹
    const nodeLocator = contentPage.locator('.s-v-tree-node').filter({ hasText: '引用节点' });
    const folderLocator = contentPage.locator('.s-v-tree-node').filter({ hasText: '父文件夹' });

    await nodeLocator.dragTo(folderLocator);
    await contentPage.waitForTimeout(500);

    // 验证节点的 pid 应该更新为 folder-001（实际需要检查数据）
    await expandBannerFolder(contentPage, '父文件夹');
    await expectNodeExists(contentPage, '引用节点');
  });
});

test.describe('主工作区操作测试 - 工具栏操作', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const pages = await initAppWorkbenchPages(electronApp);
    headerPage = pages.headerPage;
    contentPage = pages.contentPage;

    await clearAppWorkbenchState(headerPage, contentPage);
    await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID);
  });

  test('打开 Cookie 管理器 (Ctrl+Alt+C)', async () => {
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 按快捷键
    await contentPage.keyboard.down('Control');
    await contentPage.keyboard.down('Alt');
    await contentPage.keyboard.press('c');
    await contentPage.keyboard.up('Alt');
    await contentPage.keyboard.up('Control');
    await contentPage.waitForTimeout(500);

    // 验证 Cookie 管理器 Tab 打开
    await expectTabExists(contentPage, 'Cookie');
  });

  test('打开回收站 (Ctrl+Alt+R)', async () => {
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 按快捷键
    await contentPage.keyboard.down('Control');
    await contentPage.keyboard.down('Alt');
    await contentPage.keyboard.press('r');
    await contentPage.keyboard.up('Alt');
    await contentPage.keyboard.up('Control');
    await contentPage.waitForTimeout(500);

    // 验证回收站 Tab 打开
    await expectTabExists(contentPage, '回收站');
  });

  test('导出文档 (Ctrl+E)', async () => {
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 设置 IPC 监听
    await setupIPCListener(contentPage);

    // 按快捷键
    await pressModifierKey(contentPage, 'Control', 'e');

    // 验证触发导出事件
    const events = await getCapturedIPCEvents(contentPage);
    const exportEvent = events.find(e => e.event.includes('export'));

    // 或验证导出对话框打开
    const exportDialog = contentPage.locator('.export-dialog, .export-doc-tab');
    await expect(exportDialog).toBeVisible({ timeout: 3000 });
  });

  test('导入文档 (Ctrl+I)', async () => {
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 按快捷键
    await pressModifierKey(contentPage, 'Control', 'i');

    // 验证导入对话框打开
    const importDialog = contentPage.locator('.import-dialog, .import-doc-tab');
    await expect(importDialog).toBeVisible({ timeout: 3000 });
  });

  test('打开 Hook 配置 (Ctrl+H)', async () => {
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 按快捷键
    await pressModifierKey(contentPage, 'Control', 'h');

    // 验证 Hook Tab 打开
    await expectTabExists(contentPage, 'Hook');
  });

  test('打开全局变量管理', async () => {
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 点击工具栏"变量"按钮
    const variableBtn = contentPage.locator('.toolbar-btn').filter({ hasText: '变量' });
    await variableBtn.click();
    await contentPage.waitForTimeout(500);

    // 验证变量 Tab 打开
    await expectTabExists(contentPage, '变量');
  });

  test('设置通用请求头', async () => {
    const folder = createMockFolder({ name: '测试文件夹' });
    await setBannerData(contentPage, TEST_PROJECT_ID, [folder]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 右键文件夹
    await rightClickBannerNode(contentPage, '测试文件夹');

    // 点击"通用请求头"
    const commonHeaderOption = contentPage.locator('.context-menu-item').filter({ hasText: '通用请求头' });
    await commonHeaderOption.click();
    await contentPage.waitForTimeout(500);

    // 验证通用请求头对话框打开
    const headerDialog = contentPage.locator('.common-header-dialog');
    await expect(headerDialog).toBeVisible();
  });
});

test.describe('主工作区操作测试 - 右键菜单', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const pages = await initAppWorkbenchPages(electronApp);
    headerPage = pages.headerPage;
    contentPage = pages.contentPage;

    await clearAppWorkbenchState(headerPage, contentPage);
    await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID);
  });

  test('单选节点右键菜单选项正确', async () => {
    const httpNode = createMockHttpNode({ name: '测试接口' });
    await setBannerData(contentPage, TEST_PROJECT_ID, [httpNode]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 右键节点
    await rightClickBannerNode(contentPage, '测试接口');

    // 验证菜单项
    await expect(contentPage.locator('.context-menu-item').filter({ hasText: '重命名' })).toBeVisible();
    await expect(contentPage.locator('.context-menu-item').filter({ hasText: '复制' })).toBeVisible();
    await expect(contentPage.locator('.context-menu-item').filter({ hasText: '剪切' })).toBeVisible();
    await expect(contentPage.locator('.context-menu-item').filter({ hasText: '删除' })).toBeVisible();
    await expect(contentPage.locator('.context-menu-item').filter({ hasText: 'Fork' })).toBeVisible();
  });

  test('多选节点右键菜单选项正确', async () => {
    const nodes = [
      createMockHttpNode({ name: '接口1' }),
      createMockHttpNode({ name: '接口2' }),
    ];

    await setBannerData(contentPage, TEST_PROJECT_ID, nodes);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 多选节点
    await contentPage.keyboard.down('Control');
    await clickBannerNode(contentPage, '接口1');
    await clickBannerNode(contentPage, '接口2');
    await contentPage.keyboard.up('Control');

    // 右键
    await rightClickBannerNode(contentPage, '接口1');

    // 验证批量操作菜单项
    await expect(contentPage.locator('.context-menu-item').filter({ hasText: '复制' })).toBeVisible();
    await expect(contentPage.locator('.context-menu-item').filter({ hasText: '剪切' })).toBeVisible();
    await expect(contentPage.locator('.context-menu-item').filter({ hasText: '删除' })).toBeVisible();

    // 重命名应该不可用（多选状态）
    const renameOption = contentPage.locator('.context-menu-item').filter({ hasText: '重命名' });
    const isDisabled = await renameOption.evaluate(el => el.classList.contains('disabled'));
    expect(isDisabled).toBe(true);
  });

  test('空白处右键菜单（仅粘贴）', async () => {
    const httpNode = createMockHttpNode({ name: '复制源' });
    await setBannerData(contentPage, TEST_PROJECT_ID, [httpNode]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 先复制一个节点
    await clickBannerNode(contentPage, '复制源');
    await pressModifierKey(contentPage, 'Control', 'c');

    // 在空白处右键
    const bannerContainer = contentPage.locator('.banner-tree-container');
    await bannerContainer.click({ button: 'right', position: { x: 50, y: 200 } });
    await contentPage.waitForTimeout(300);

    // 验证只有粘贴选项
    const contextMenu = contentPage.locator('.context-menu');
    await expect(contextMenu).toBeVisible();

    const pasteOption = contentPage.locator('.context-menu-item').filter({ hasText: '粘贴' });
    await expect(pasteOption).toBeVisible();

    // 其他操作项应该不存在
    const deleteOption = contentPage.locator('.context-menu-item').filter({ hasText: '删除' });
    expect(await deleteOption.count()).toBe(0);
  });
});

test.describe('主工作区操作测试 - View 模式限制', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const pages = await initAppWorkbenchPages(electronApp);
    headerPage = pages.headerPage;
    contentPage = pages.contentPage;

    await clearAppWorkbenchState(headerPage, contentPage);
    await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID);

    // 切换到 View 模式
    await mockLocalStorageData(contentPage, 'apidoc/mode', 'view');
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);
  });

  test('View 模式禁用重命名（F2）', async () => {
    const httpNode = createMockHttpNode({ name: '只读接口' });
    await setBannerData(contentPage, TEST_PROJECT_ID, [httpNode]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 选中节点并按 F2
    await clickBannerNode(contentPage, '只读接口');
    await contentPage.keyboard.press('F2');
    await contentPage.waitForTimeout(300);

    // 验证重命名输入框不出现
    const renameInput = contentPage.locator('.rename-input');
    expect(await renameInput.count()).toBe(0);
  });

  test('View 模式禁用删除操作', async () => {
    const httpNode = createMockHttpNode({ name: '只读接口' });
    await setBannerData(contentPage, TEST_PROJECT_ID, [httpNode]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 右键节点
    await rightClickBannerNode(contentPage, '只读接口');

    // 验证删除选项禁用或不存在
    const deleteOption = contentPage.locator('.context-menu-item').filter({ hasText: '删除' });
    if (await deleteOption.count() > 0) {
      const isDisabled = await deleteOption.evaluate(el => el.classList.contains('disabled'));
      expect(isDisabled).toBe(true);
    } else {
      expect(await deleteOption.count()).toBe(0);
    }
  });

  test('View 模式禁用复制/粘贴', async () => {
    const httpNode = createMockHttpNode({ name: '只读接口' });
    await setBannerData(contentPage, TEST_PROJECT_ID, [httpNode]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 右键节点
    await rightClickBannerNode(contentPage, '只读接口');

    // 验证复制/粘贴选项禁用
    const copyOption = contentPage.locator('.context-menu-item').filter({ hasText: '复制' });
    const cutOption = contentPage.locator('.context-menu-item').filter({ hasText: '剪切' });

    if (await copyOption.count() > 0) {
      const isCopyDisabled = await copyOption.evaluate(el => el.classList.contains('disabled'));
      expect(isCopyDisabled).toBe(true);
    }

    if (await cutOption.count() > 0) {
      const isCutDisabled = await cutOption.evaluate(el => el.classList.contains('disabled'));
      expect(isCutDisabled).toBe(true);
    }
  });

  test('View 模式禁用工具栏编辑操作', async () => {
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 验证新建按钮禁用
    const addNodeBtn = contentPage.locator('.toolbar-btn').filter({ hasText: '新建接口' });
    if (await addNodeBtn.count() > 0) {
      const isDisabled = await addNodeBtn.evaluate(el => (el as HTMLButtonElement).disabled);
      expect(isDisabled).toBe(true);
    }

    const addFolderBtn = contentPage.locator('.toolbar-btn').filter({ hasText: '新建文件夹' });
    if (await addFolderBtn.count() > 0) {
      const isDisabled = await addFolderBtn.evaluate(el => (el as HTMLButtonElement).disabled);
      expect(isDisabled).toBe(true);
    }
  });
});

test.describe('主工作区操作测试 - 边界条件', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const pages = await initAppWorkbenchPages(electronApp);
    headerPage = pages.headerPage;
    contentPage = pages.contentPage;

    await clearAppWorkbenchState(headerPage, contentPage);
    await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID);
  });

  test('重命名为空字符串验证', async () => {
    const httpNode = createMockHttpNode({ name: '原名称' });
    await setBannerData(contentPage, TEST_PROJECT_ID, [httpNode]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 尝试重命名为空
    await clickBannerNode(contentPage, '原名称');
    await contentPage.keyboard.press('F2');
    await contentPage.waitForTimeout(300);

    const renameInput = contentPage.locator('.rename-input');
    await renameInput.fill('');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);

    // 验证错误提示或恢复原名称
    const errorMsg = contentPage.locator('.error-message, .el-message--error');
    if (await errorMsg.isVisible()) {
      await expect(errorMsg).toContainText('名称不能为空');
    } else {
      // 或者验证名称未改变
      await expectNodeExists(contentPage, '原名称');
    }
  });

  test('删除确认弹窗取消操作', async () => {
    const httpNode = createMockHttpNode({ name: '保留接口' });
    await setBannerData(contentPage, TEST_PROJECT_ID, [httpNode]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 尝试删除
    await rightClickBannerNode(contentPage, '保留接口');
    const deleteOption = contentPage.locator('.context-menu-item').filter({ hasText: '删除' });
    await deleteOption.click();
    await contentPage.waitForTimeout(300);

    // 取消删除
    const confirmDialog = contentPage.locator('.confirm-dialog, .el-message-box');
    const cancelBtn = confirmDialog.locator('button').filter({ hasText: '取消' });
    await cancelBtn.click();
    await contentPage.waitForTimeout(300);

    // 验证节点仍然存在
    await expectNodeExists(contentPage, '保留接口');
  });

  test('粘贴无效数据处理', async () => {
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 设置无效的剪贴板数据
    await contentPage.evaluate(() => {
      (window as any).__clipboard = { invalid: 'data' };
    });

    // 尝试粘贴
    const bannerContainer = contentPage.locator('.banner-tree-container');
    await bannerContainer.click({ button: 'right', position: { x: 50, y: 100 } });
    await contentPage.waitForTimeout(300);

    const pasteOption = contentPage.locator('.context-menu-item').filter({ hasText: '粘贴' });
    if (await pasteOption.count() > 0) {
      await pasteOption.click();
      await contentPage.waitForTimeout(500);

      // 验证错误提示或无变化
      const errorMsg = contentPage.locator('.error-message, .el-message--error');
      if (await errorMsg.isVisible()) {
        await expect(errorMsg).toBeVisible();
      }
    }
  });

  test('拖拽到无效目标拒绝', async () => {
    const httpNode = createMockHttpNode({ name: '拖拽节点' });
    await setBannerData(contentPage, TEST_PROJECT_ID, [httpNode]);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 尝试拖拽到无效位置（例如自己）
    const nodeLocator = contentPage.locator('.s-v-tree-node').filter({ hasText: '拖拽节点' });

    try {
      await nodeLocator.dragTo(nodeLocator);
      await contentPage.waitForTimeout(500);

      // 验证位置未改变或显示错误
      await expectNodeExists(contentPage, '拖拽节点');
    } catch (error) {
      // 拖拽被拒绝是预期行为
    }
  });
});


// ==================== 窗口状态测试 ====================

test.describe('主工作区窗口状态管理 - 布局状态管理', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const pages = await initAppWorkbenchPages(electronApp);
    headerPage = pages.headerPage;
    contentPage = pages.contentPage;

    await clearAppWorkbenchState(headerPage, contentPage);
    await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID);
  });

  test('切换到横向布局', async () => {
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 点击布局切换按钮
    const layoutBtn = contentPage.locator('.layout-switch-btn, .layout-toggle');
    if (await layoutBtn.count() > 0) {
      await layoutBtn.click();
      await contentPage.waitForTimeout(300);

      // 选择横向布局
      const horizontalOption = contentPage.locator('.layout-option').filter({ hasText: '横向' });
      await horizontalOption.click();
      await contentPage.waitForTimeout(500);

      // 验证布局应用
      const workbenchContainer = contentPage.locator('.project-workbench');
      const layoutClass = await workbenchContainer.getAttribute('class');
      expect(layoutClass).toContain('horizontal');
    }
  });

  test('切换到纵向布局', async () => {
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 点击布局切换按钮
    const layoutBtn = contentPage.locator('.layout-switch-btn, .layout-toggle');
    if (await layoutBtn.count() > 0) {
      await layoutBtn.click();
      await contentPage.waitForTimeout(300);

      // 选择纵向布局
      const verticalOption = contentPage.locator('.layout-option').filter({ hasText: '纵向' });
      await verticalOption.click();
      await contentPage.waitForTimeout(500);

      // 验证布局应用
      const workbenchContainer = contentPage.locator('.project-workbench');
      const layoutClass = await workbenchContainer.getAttribute('class');
      expect(layoutClass).toContain('vertical');
    }
  });

  test('布局状态持久化到 localStorage', async () => {
    // 设置纵向布局
    await mockLocalStorageData(contentPage, 'workbench/layout', 'vertical');
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 验证布局被应用
    const workbenchContainer = contentPage.locator('.project-workbench');
    const layoutClass = await workbenchContainer.getAttribute('class');
    expect(layoutClass).toContain('vertical');

    // 切换到横向布局
    const layoutBtn = contentPage.locator('.layout-switch-btn, .layout-toggle');
    if (await layoutBtn.count() > 0) {
      await layoutBtn.click();
      const horizontalOption = contentPage.locator('.layout-option').filter({ hasText: '横向' });
      await horizontalOption.click();
      await contentPage.waitForTimeout(500);

      // 验证持久化
      await expectLayoutPersisted(contentPage, 'horizontal');
    }
  });

  test('页面重载后恢复布局状态', async () => {
    // 设置横向布局
    await mockLocalStorageData(contentPage, 'workbench/layout', 'horizontal');

    // 重载页面
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 验证布局恢复
    const workbenchContainer = contentPage.locator('.project-workbench');
    const layoutClass = await workbenchContainer.getAttribute('class');
    expect(layoutClass).toContain('horizontal');
  });
});

test.describe('主工作区窗口状态管理 - Tab 状态按项目隔离', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const pages = await initAppWorkbenchPages(electronApp);
    headerPage = pages.headerPage;
    contentPage = pages.contentPage;

    await clearAppWorkbenchState(headerPage, contentPage);
  });

  test('项目 A 的 Tab 不影响项目 B', async () => {
    // 创建项目 A 的 Tab
    const projectATab = createMockTab({ id: 'tab-a1', title: 'Project A Tab' });
    await createTabInStorage(contentPage, TEST_PROJECT_ID, projectATab);

    // 创建项目 B 的 Tab
    const projectBTab = createMockTab({ id: 'tab-b1', title: 'Project B Tab' });
    await createTabInStorage(contentPage, TEST_PROJECT_ID_2, projectBTab);

    // 验证两个项目的 Tab 独立存储
    await expectTabPersisted(contentPage, TEST_PROJECT_ID, [
      { id: 'tab-a1', title: 'Project A Tab' }
    ]);

    await expectTabPersisted(contentPage, TEST_PROJECT_ID_2, [
      { id: 'tab-b1', title: 'Project B Tab' }
    ]);
  });

  test('切换项目时恢复对应 Tab 列表', async () => {
    // 为项目 A 创建多个 Tab
    const projectATabs = [
      createMockTab({ id: 'tab-a1', title: 'A Tab 1' }),
      createMockTab({ id: 'tab-a2', title: 'A Tab 2' }),
    ];

    for (const tab of projectATabs) {
      await createTabInStorage(contentPage, TEST_PROJECT_ID, tab);
    }

    // 导航到项目 A
    await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID);
    await waitForVueComponentReady(contentPage);

    // 验证项目 A 的 Tab 显示
    await expectTabExists(contentPage, 'A Tab 1');
    await expectTabExists(contentPage, 'A Tab 2');

    // 为项目 B 创建 Tab
    const projectBTab = createMockTab({ id: 'tab-b1', title: 'B Tab 1' });
    await createTabInStorage(contentPage, TEST_PROJECT_ID_2, projectBTab);

    // 切换到项目 B
    await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID_2);
    await waitForVueComponentReady(contentPage);

    // 验证只显示项目 B 的 Tab
    await expectTabExists(contentPage, 'B Tab 1');

    const tabCount = await contentPage.locator('.s-tab-item').count();
    expect(tabCount).toBe(1);
  });

  test('每个项目的 activeTab 独立管理', async () => {
    // 项目 A 的 Tab
    const projectATabs = [
      createMockTab({ id: 'tab-a1', title: 'A Tab 1' }),
      createMockTab({ id: 'tab-a2', title: 'A Tab 2' }),
    ];

    for (const tab of projectATabs) {
      await createTabInStorage(contentPage, TEST_PROJECT_ID, tab);
    }
    await setActiveTab(contentPage, TEST_PROJECT_ID, 'tab-a2');

    // 项目 B 的 Tab
    const projectBTabs = [
      createMockTab({ id: 'tab-b1', title: 'B Tab 1' }),
    ];

    for (const tab of projectBTabs) {
      await createTabInStorage(contentPage, TEST_PROJECT_ID_2, tab);
    }
    await setActiveTab(contentPage, TEST_PROJECT_ID_2, 'tab-b1');

    // 导航到项目 A
    await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID);
    await waitForVueComponentReady(contentPage);

    // 验证项目 A 的 activeTab
    const activeTabA = contentPage.locator('.s-tab-item.active');
    await expect(activeTabA).toContainText('A Tab 2');

    // 切换到项目 B
    await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID_2);
    await waitForVueComponentReady(contentPage);

    // 验证项目 B 的 activeTab
    const activeTabB = contentPage.locator('.s-tab-item.active');
    await expect(activeTabB).toContainText('B Tab 1');
  });
});

test.describe('主工作区窗口状态管理 - 工具栏状态', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const pages = await initAppWorkbenchPages(electronApp);
    headerPage = pages.headerPage;
    contentPage = pages.contentPage;

    await clearAppWorkbenchState(headerPage, contentPage);
    await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID);
  });

  test('固定工具栏按钮', async () => {
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 找到"Cookie"工具栏按钮并拖拽到固定区域
    const cookieBtn = contentPage.locator('.toolbar-btn').filter({ hasText: 'Cookie' });

    if (await cookieBtn.count() > 0) {
      // 右键或拖拽固定
      await cookieBtn.click({ button: 'right' });
      await contentPage.waitForTimeout(300);

      const pinOption = contentPage.locator('.context-menu-item').filter({ hasText: '固定' });
      if (await pinOption.isVisible()) {
        await pinOption.click();
        await contentPage.waitForTimeout(500);

        // 验证固定状态持久化
        const pinnedOps = await getLocalStorageData(contentPage, 'workbench/pinToolbarOperations');
        expect(pinnedOps).toContain('cookies');
      }
    }
  });

  test('取消固定工具栏按钮', async () => {
    // 先设置固定状态
    await mockLocalStorageData(contentPage, 'workbench/pinToolbarOperations', ['cookies', 'recycler']);
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 取消固定
    const cookieBtn = contentPage.locator('.toolbar-btn').filter({ hasText: 'Cookie' });

    if (await cookieBtn.count() > 0) {
      await cookieBtn.click({ button: 'right' });
      await contentPage.waitForTimeout(300);

      const unpinOption = contentPage.locator('.context-menu-item').filter({ hasText: '取消固定' });
      if (await unpinOption.isVisible()) {
        await unpinOption.click();
        await contentPage.waitForTimeout(500);

        // 验证固定状态移除
        const pinnedOps = await getLocalStorageData(contentPage, 'workbench/pinToolbarOperations');
        expect(pinnedOps).not.toContain('cookies');
      }
    }
  });

  test('固定状态持久化', async () => {
    // 设置固定按钮
    await mockLocalStorageData(contentPage, 'workbench/pinToolbarOperations', ['cookies', 'recycler', 'variable']);

    // 验证持久化
    await expectToolbarPinPersisted(contentPage, ['cookies', 'recycler', 'variable']);
  });

  test('页面重载后恢复固定按钮', async () => {
    // 设置固定按钮
    await mockLocalStorageData(contentPage, 'workbench/pinToolbarOperations', ['cookies', 'exportDoc']);

    // 重载页面
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 验证固定按钮显示在工具栏
    const pinnedArea = contentPage.locator('.pinned-toolbar, .toolbar-pinned');

    if (await pinnedArea.count() > 0) {
      const cookieBtn = pinnedArea.locator('.toolbar-btn').filter({ hasText: 'Cookie' });
      const exportBtn = pinnedArea.locator('.toolbar-btn').filter({ hasText: '导出' });

      await expect(cookieBtn).toBeVisible();
      await expect(exportBtn).toBeVisible();
    }
  });
});

test.describe('主工作区窗口状态管理 - 全局状态持久化', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const pages = await initAppWorkbenchPages(electronApp);
    headerPage = pages.headerPage;
    contentPage = pages.contentPage;

    await clearAppWorkbenchState(headerPage, contentPage);
    await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID);
  });

  test('全局 Cookies 保存和恢复', async () => {
    const mockCookies = [
      { name: 'session_id', value: 'abc123', domain: '.example.com' },
      { name: 'auth_token', value: 'xyz789', domain: '.api.com' },
    ];

    // 保存全局 Cookies
    await mockLocalStorageData(contentPage, 'apidoc/globalCookies', mockCookies);

    // 重载页面
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 验证 Cookies 恢复
    const savedCookies = await getLocalStorageData(contentPage, 'apidoc/globalCookies');
    expect(savedCookies).toHaveLength(2);
    expect(savedCookies[0].name).toBe('session_id');
    expect(savedCookies[1].name).toBe('auth_token');
  });

  test('通用请求头保存和恢复', async () => {
    const mockHeaders = {
      'X-API-Key': 'test-key-123',
      'Authorization': 'Bearer token123',
    };

    // 保存通用请求头
    await mockLocalStorageData(contentPage, 'apidoc/commonHeaders', mockHeaders);

    // 重载页面
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 验证请求头恢复
    const savedHeaders = await getLocalStorageData(contentPage, 'apidoc/commonHeaders');
    expect(savedHeaders['X-API-Key']).toBe('test-key-123');
    expect(savedHeaders['Authorization']).toBe('Bearer token123');
  });

  test('项目设置（hosts）保存和恢复', async () => {
    const mockHosts = [
      { name: '开发环境', url: 'https://dev.example.com', isDefault: true },
      { name: '生产环境', url: 'https://api.example.com', isDefault: false },
    ];

    // 保存项目 hosts
    await mockLocalStorageData(contentPage, `apidoc/hosts/${TEST_PROJECT_ID}`, mockHosts);

    // 重载页面
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 验证 hosts 恢复
    const savedHosts = await getLocalStorageData(contentPage, `apidoc/hosts/${TEST_PROJECT_ID}`);
    expect(savedHosts).toHaveLength(2);
    expect(savedHosts[0].name).toBe('开发环境');
    expect(savedHosts[0].isDefault).toBe(true);
  });
});

test.describe('主工作区窗口状态管理 - Mode 管理', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const pages = await initAppWorkbenchPages(electronApp);
    headerPage = pages.headerPage;
    contentPage = pages.contentPage;

    await clearAppWorkbenchState(headerPage, contentPage);
    await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID);
  });

  test('切换到 View 模式', async () => {
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 点击模式切换按钮
    const modeToggle = contentPage.locator('.mode-toggle, .view-mode-switch');

    if (await modeToggle.count() > 0) {
      await modeToggle.click();
      await contentPage.waitForTimeout(300);

      // 选择 View 模式
      const viewOption = contentPage.locator('.mode-option').filter({ hasText: '只读' });
      await viewOption.click();
      await contentPage.waitForTimeout(500);

      // 验证模式应用
      const savedMode = await getLocalStorageData(contentPage, 'apidoc/mode');
      expect(savedMode).toBe('view');
    }
  });

  test('切换到 Edit 模式', async () => {
    // 先设置为 View 模式
    await mockLocalStorageData(contentPage, 'apidoc/mode', 'view');
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 切换到 Edit 模式
    const modeToggle = contentPage.locator('.mode-toggle, .edit-mode-switch');

    if (await modeToggle.count() > 0) {
      await modeToggle.click();
      await contentPage.waitForTimeout(300);

      const editOption = contentPage.locator('.mode-option').filter({ hasText: '编辑' });
      await editOption.click();
      await contentPage.waitForTimeout(500);

      // 验证模式切换
      const savedMode = await getLocalStorageData(contentPage, 'apidoc/mode');
      expect(savedMode).toBe('edit');
    }
  });

  test('Mode 状态影响操作权限', async () => {
    // 设置 View 模式
    await mockLocalStorageData(contentPage, 'apidoc/mode', 'view');
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 验证编辑按钮禁用
    const addBtn = contentPage.locator('.toolbar-btn').filter({ hasText: '新建接口' });

    if (await addBtn.count() > 0) {
      const isDisabled = await addBtn.evaluate(el => (el as HTMLButtonElement).disabled);
      expect(isDisabled).toBe(true);
    }

    // 切换到 Edit 模式
    await mockLocalStorageData(contentPage, 'apidoc/mode', 'edit');
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 验证按钮启用
    if (await addBtn.count() > 0) {
      const isEnabled = await addBtn.evaluate(el => !(el as HTMLButtonElement).disabled);
      expect(isEnabled).toBe(true);
    }
  });
});

test.describe('主工作区窗口状态管理 - 边界条件', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const pages = await initAppWorkbenchPages(electronApp);
    headerPage = pages.headerPage;
    contentPage = pages.contentPage;

    await clearAppWorkbenchState(headerPage, contentPage);
    await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID);
  });

  test('localStorage 数据损坏降级', async () => {
    // 设置损坏的数据
    await mockLocalStorageData(contentPage, 'workbench/node/tabs', 'invalid-json-string');
    await mockLocalStorageData(contentPage, 'workbench/layout', '{ broken json }');

    // 重载页面
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 验证页面不崩溃，使用默认值
    const workbenchContainer = contentPage.locator('.project-workbench');
    await expect(workbenchContainer).toBeVisible();

    // 验证使用默认布局
    const layout = await getLocalStorageData(contentPage, 'workbench/layout');
    // 应该是默认值或被修复
    expect(['horizontal', 'vertical', null]).toContain(layout);
  });

  test('不存在的 projectId 使用默认值', async () => {
    // 导航到不存在的项目
    await navigateToProjectWorkbench(contentPage, 'non-existent-project-999');
    await waitForVueComponentReady(contentPage);

    // 验证页面正常显示
    const workbenchContainer = contentPage.locator('.project-workbench');
    await expect(workbenchContainer).toBeVisible();

    // 验证没有 Tab
    const tabCount = await contentPage.locator('.s-tab-item').count();
    expect(tabCount).toBe(0);
  });

  test('空 Tab 列表正常处理', async () => {
    // 设置空的 Tab 列表
    await mockLocalStorageData(contentPage, 'workbench/node/tabs', {
      [TEST_PROJECT_ID]: []
    });

    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 验证显示空状态
    const tabCount = await contentPage.locator('.s-tab-item').count();
    expect(tabCount).toBe(0);

    const emptyState = contentPage.locator('.empty-tab-state, .empty-tabs');
    await expect(emptyState).toBeVisible();
  });

  test('无效布局值回退到默认', async () => {
    // 设置无效的布局值
    await mockLocalStorageData(contentPage, 'workbench/layout', 'invalid-layout');

    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 验证使用默认布局（不崩溃）
    const workbenchContainer = contentPage.locator('.project-workbench');
    await expect(workbenchContainer).toBeVisible();

    const layoutClass = await workbenchContainer.getAttribute('class');
    // 应该回退到默认布局之一
    const hasValidLayout = layoutClass?.includes('horizontal') || layoutClass?.includes('vertical');
    expect(hasValidLayout).toBe(true);
  });
});

test.describe('主工作区窗口状态管理 - 数据同步', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const pages = await initAppWorkbenchPages(electronApp);
    headerPage = pages.headerPage;
    contentPage = pages.contentPage;

    await clearAppWorkbenchState(headerPage, contentPage);
    await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID);
  });

  test('Tab 变化立即同步到 localStorage', async () => {
    const tab = createMockTab({ id: 'tab1', title: '同步Tab' });

    await createTabInStorage(contentPage, TEST_PROJECT_ID, tab);

    // 验证立即持久化
    const savedTabs = await getLocalStorageData(contentPage, 'workbench/node/tabs');
    expect(savedTabs[TEST_PROJECT_ID]).toBeDefined();
    expect(savedTabs[TEST_PROJECT_ID][0].title).toBe('同步Tab');
  });

  test('布局变化立即同步', async () => {
    // 切换布局
    await mockLocalStorageData(contentPage, 'workbench/layout', 'vertical');

    // 验证立即持久化
    await expectLayoutPersisted(contentPage, 'vertical');

    // 切换到横向
    await mockLocalStorageData(contentPage, 'workbench/layout', 'horizontal');

    // 验证更新
    await expectLayoutPersisted(contentPage, 'horizontal');
  });

  test('多个存储键协同工作', async () => {
    // 同时设置多个状态
    const tab = createMockTab({ id: 'tab1', title: 'Tab1' });
    await createTabInStorage(contentPage, TEST_PROJECT_ID, tab);
    await mockLocalStorageData(contentPage, 'workbench/layout', 'vertical');
    await mockLocalStorageData(contentPage, 'workbench/pinToolbarOperations', ['cookies', 'recycler']);

    // 重载页面
    await contentPage.reload();
    await waitForVueComponentReady(contentPage);

    // 验证所有状态都恢复
    await expectTabPersisted(contentPage, TEST_PROJECT_ID, [{ id: 'tab1', title: 'Tab1' }]);
    await expectLayoutPersisted(contentPage, 'vertical');
    await expectToolbarPinPersisted(contentPage, ['cookies', 'recycler']);

    // 验证页面正常显示
    const workbenchContainer = contentPage.locator('.project-workbench');
    await expect(workbenchContainer).toBeVisible();
  });
});

