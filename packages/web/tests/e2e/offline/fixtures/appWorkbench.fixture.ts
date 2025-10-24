import { test, expect, getPages } from '../../../fixtures/fixtures';
import { type Page } from '@playwright/test';
import { type ElectronApplication } from '@playwright/test';
import type { TabData, NodeData } from '../../../types/test.type';

// ==================== 数据工厂 ====================

/**
 * 创建模拟 Tab 数据
 */
export function createMockTab(overrides: Partial<TabData> = {}): TabData {
  return {
    id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: '测试接口',
    type: 'http',
    network: 'offline',
    saved: true,
    fixed: false,
    ...overrides,
  };
}

/**
 * 创建模拟 HTTP 节点数据
 */
export function createMockHttpNode(overrides: Partial<NodeData> = {}): NodeData {
  return {
    _id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: '测试接口',
    type: 'http',
    ...overrides,
  };
}

/**
 * 创建模拟文件夹数据
 */
export function createMockFolder(overrides: Partial<NodeData> = {}): NodeData {
  return {
    _id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: '测试文件夹',
    type: 'folder',
    children: [],
    ...overrides,
  };
}

/**
 * 创建模拟 WebSocket 节点数据
 */
export function createMockWebSocketNode(overrides: Partial<NodeData> = {}): NodeData {
  return {
    _id: `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: '测试WebSocket',
    type: 'websocket',
    ...overrides,
  };
}

// ==================== Page 初始化 ====================

// 清理 appWorkbench 测试状态，清除 localStorage 和重置页面状态

export async function clearAppWorkbenchState(headerPage: Page, contentPage: Page) {
  // 清理 header 页面状态
  await headerPage.evaluate(() => {
    localStorage.removeItem('features/header/tabs');
    localStorage.removeItem('features/header/activeTab');
  });

  // 清理 content 页面状态
  await contentPage.evaluate(() => {
    localStorage.removeItem('workbench/node/tabs');
    localStorage.removeItem('workbench/layout');
    localStorage.removeItem('workbench/pinToolbarOperations');
    localStorage.setItem('runtime/networkMode', 'offline');
    localStorage.setItem('history/lastVisitePage', '/home');
  });
}

/**
 * 导航到项目工作区
 */
export async function navigateToProjectWorkbench(
  contentPage: Page,
  projectId: string = 'test-project-001'
) {
  await contentPage.goto(`/#/project/workbench?id=${projectId}`);
  await contentPage.waitForLoadState('domcontentloaded');
  await contentPage.waitForTimeout(500); // 等待组件挂载
}

// ==================== Tab 操作辅助 ====================

/**
 * 在 localStorage 中创建 Tab
 */
export async function createTabInStorage(
  contentPage: Page,
  projectId: string,
  tabData: TabData
) {
  await contentPage.evaluate(
    ({ pid, tab }) => {
      const allTabs = JSON.parse(localStorage.getItem('workbench/node/tabs') || '{}');
      if (!allTabs[pid]) {
        allTabs[pid] = [];
      }
      allTabs[pid].push(tab);
      localStorage.setItem('workbench/node/tabs', JSON.stringify(allTabs));
    },
    { pid: projectId, tab: tabData }
  );
}

/**
 * 设置当前激活的 Tab
 */
export async function setActiveTab(
  contentPage: Page,
  projectId: string,
  tabId: string
) {
  await contentPage.evaluate(
    ({ pid, tid }) => {
      const allTabs = JSON.parse(localStorage.getItem('workbench/node/tabs') || '{}');
      if (allTabs[pid]) {
        allTabs[pid].forEach((tab: any) => {
          tab.isActive = tab.id === tid;
        });
        localStorage.setItem('workbench/node/tabs', JSON.stringify(allTabs));
      }
    },
    { pid: projectId, tid: tabId }
  );
}

/**
 * 期望 Tab 存在
 */
export async function expectTabExists(page: Page, tabTitle: string) {
  const tabLocator = page.locator('.s-tab-item').filter({ hasText: tabTitle });
  await expect(tabLocator).toBeVisible({ timeout: 5000 });
}

/**
 * 期望 Tab 是激活状态
 */
export async function expectActiveTab(page: Page, tabTitle: string) {
  const activeTabLocator = page.locator('.s-tab-item.active').filter({ hasText: tabTitle });
  await expect(activeTabLocator).toBeVisible({ timeout: 5000 });
}

/**
 * 获取 Tab 数量
 */
export async function getTabCount(page: Page): Promise<number> {
  return await page.locator('.s-tab-item').count();
}

/**
 * 关闭指定 Tab
 */
export async function closeTab(page: Page, tabTitle: string) {
  const tab = page.locator('.s-tab-item').filter({ hasText: tabTitle });
  await tab.hover();
  const closeBtn = tab.locator('.close-icon');
  await closeBtn.click();
  await page.waitForTimeout(300);
}

// ==================== Banner 操作辅助 ====================

/**
 * 在 localStorage 中设置 Banner 数据
 */
export async function setBannerData(
  contentPage: Page,
  projectId: string,
  bannerData: NodeData[]
) {
  await contentPage.evaluate(
    ({ pid, data }) => {
      localStorage.setItem(`project/banner/${pid}`, JSON.stringify(data));
    },
    { pid: projectId, data: bannerData }
  );
}

/**
 * 期望节点存在于 Banner 树中
 */
export async function expectNodeExists(page: Page, nodeName: string) {
  const nodeLocator = page.locator('.s-v-tree-node').filter({ hasText: nodeName });
  await expect(nodeLocator).toBeVisible({ timeout: 5000 });
}

/**
 * 点击 Banner 树节点
 */
export async function clickBannerNode(page: Page, nodeName: string) {
  const node = page.locator('.s-v-tree-node').filter({ hasText: nodeName }).first();
  await node.click();
  await page.waitForTimeout(300);
}

/**
 * 双击 Banner 树节点
 */
export async function doubleClickBannerNode(page: Page, nodeName: string) {
  const node = page.locator('.s-v-tree-node').filter({ hasText: nodeName }).first();
  await node.dblclick();
  await page.waitForTimeout(300);
}

/**
 * 右键点击 Banner 树节点
 */
export async function rightClickBannerNode(page: Page, nodeName: string) {
  const node = page.locator('.s-v-tree-node').filter({ hasText: nodeName }).first();
  await node.click({ button: 'right' });
  await page.waitForTimeout(300);
}

/**
 * 展开 Banner 树文件夹节点
 */
export async function expandBannerFolder(page: Page, folderName: string) {
  const folder = page.locator('.s-v-tree-node').filter({ hasText: folderName }).first();
  const expandIcon = folder.locator('.expand-icon');
  const isExpanded = await expandIcon.getAttribute('class').then(c => c?.includes('expanded'));

  if (!isExpanded) {
    await expandIcon.click();
    await page.waitForTimeout(300);
  }
}

// ==================== LocalStorage 操作 ====================

/**
 * 模拟设置 localStorage 数据
 */
export async function mockLocalStorageData(
  page: Page,
  key: string,
  value: any
) {
  await page.evaluate(
    ({ k, v }) => {
      localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
    },
    { k: key, v: value }
  );
}

/**
 * 获取 localStorage 数据
 */
export async function getLocalStorageData(page: Page, key: string): Promise<any> {
  return await page.evaluate(
    (k) => {
      const value = localStorage.getItem(k);
      if (!value) return null;
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    },
    key
  );
}

/**
 * 清除 localStorage 指定键
 */
export async function clearLocalStorageKey(page: Page, key: string) {
  await page.evaluate((k) => localStorage.removeItem(k), key);
}

// ==================== 断言工具 ====================

/**
 * 期望 Tab 已持久化到 localStorage
 */
export async function expectTabPersisted(
  page: Page,
  projectId: string,
  expectedTabs: Partial<TabData>[]
) {
  const savedTabs = await page.evaluate(
    (pid) => {
      const allTabs = JSON.parse(localStorage.getItem('workbench/node/tabs') || '{}');
      return allTabs[pid] || [];
    },
    projectId
  );

  expect(savedTabs.length).toBe(expectedTabs.length);

  expectedTabs.forEach((expectedTab, index) => {
    const savedTab = savedTabs[index];
    if (expectedTab.id) expect(savedTab.id).toBe(expectedTab.id);
    if (expectedTab.title) expect(savedTab.title).toBe(expectedTab.title);
    if (expectedTab.type) expect(savedTab.type).toBe(expectedTab.type);
  });
}

/**
 * 期望布局已持久化到 localStorage
 */
export async function expectLayoutPersisted(
  page: Page,
  expectedLayout: 'horizontal' | 'vertical'
) {
  const savedLayout = await page.evaluate(() => {
    return localStorage.getItem('workbench/layout');
  });

  expect(savedLayout).toBe(expectedLayout);
}

/**
 * 期望工具栏按钮固定状态已持久化
 */
export async function expectToolbarPinPersisted(
  page: Page,
  expectedPins: string[]
) {
  const savedPins = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('workbench/pinToolbarOperations') || '[]');
  });

  expect(savedPins).toEqual(expectedPins);
}

// ==================== 等待和延迟工具 ====================

/**
 * 等待 Vue 组件完成渲染
 */
export async function waitForVueComponentReady(page: Page) {
  await page.waitForTimeout(500); // 等待 Vue 组件挂载和初始化
}

/**
 * 等待请求完成
 */
export async function waitForRequestComplete(page: Page, urlPattern: string | RegExp) {
  await page.waitForResponse(
    response => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout: 10000 }
  );
}

// ==================== 键盘操作工具 ====================

/**
 * 按下键盘快捷键
 */
export async function pressShortcut(page: Page, keys: string) {
  await page.keyboard.press(keys);
  await page.waitForTimeout(300);
}

/**
 * 组合键操作
 */
export async function pressModifierKey(
  page: Page,
  modifier: 'Control' | 'Alt' | 'Shift',
  key: string
) {
  await page.keyboard.down(modifier);
  await page.keyboard.press(key);
  await page.keyboard.up(modifier);
  await page.waitForTimeout(300);
}

// ==================== 模拟 IPC 通信 ====================

/**
 * 模拟触发 IPC 事件
 */
export async function triggerIPCEvent(
  page: Page,
  eventName: string,
  data?: any
) {
  await page.evaluate(
    ({ event, payload }) => {
      const callback = (window as any)[`_callback_${event.replace(/-/g, '_')}`];
      if (callback) {
        callback(payload);
      }
    },
    { event: eventName, payload: data }
  );
}

/**
 * 监听 IPC 事件发送
 */
export async function setupIPCListener(page: Page) {
  await page.evaluate(() => {
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
}

/**
 * 获取捕获的 IPC 事件
 */
export async function getCapturedIPCEvents(page: Page): Promise<Array<{ event: string; data?: any }>> {
  return await page.evaluate(() => (window as any)._ipcEvents || []);
}
// 重新导出通用功能
export { test, expect, getPages };
