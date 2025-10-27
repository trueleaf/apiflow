import { expect, type Page } from '@playwright/test';
import { test, getPages } from './fixtures';
import type { TabData } from '../types/test.type';

// ==================== 数据工厂 ====================

// 创建模拟 Tab 数据
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

// ==================== Page 初始化 ====================

// 清理项目工作区测试状态，清除 localStorage 和重置页面状态
export async function clearProjectWorkbenchState(headerPage: Page, contentPage: Page) {
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

// 导航到项目工作区
export async function navigateToProjectWorkbench(
  contentPage: Page,
  projectId: string = 'test-project-001'
) {
  await contentPage.goto(`/#/project/workbench?id=${projectId}`);
  await contentPage.waitForLoadState('domcontentloaded');
  await contentPage.waitForTimeout(500);
}

// ==================== Tab 操作辅助 ====================

// 在 localStorage 中创建 Tab
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

// 设置当前激活的 Tab
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

// 期望 Tab 存在
export async function expectTabExists(page: Page, tabTitle: string) {
  const tabLocator = page.locator('.nav .tab-list .item').filter({ hasText: tabTitle });
  await expect(tabLocator).toBeVisible({ timeout: 5000 });
}

// 期望 Tab 已持久化到 localStorage
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

// ==================== 等待和延迟工具 ====================

// 等待 Vue 组件完成渲染
export async function waitForVueComponentReady(page: Page) {
  await page.waitForTimeout(500);
}

// 重新导出通用功能
export { test, expect, getPages };
