import { test as base, _electron as electron, expect } from '@playwright/test';
import type { ElectronApplication, Page } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Electron 测试 fixtures 类型定义
type ElectronFixtures = {
  electronApp: ElectronApplication;
  topBarPage: Page;
  contentPage: Page;
  clearCache: () => Promise<void>;
  createProject: (name?: string) => Promise<string>;
};

// 等待指定窗口加载完成的辅助函数
const waitForWindow = async (electronApp: ElectronApplication, predicate: (url: string) => boolean, timeout = 10000): Promise<Page> => {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const windows = await electronApp.windows();
    const targetWindow = windows.find((w) => predicate(w.url()));
    if (targetWindow) {
      return targetWindow;
    }
    // 如果当前窗口数量不足，等待新窗口事件
    if (windows.length < 2) {
      try {
        await Promise.race([
          electronApp.waitForEvent('window', { timeout: 1000 }),
          new Promise((resolve) => setTimeout(resolve, 500)),
        ]);
      } catch {
        // 超时继续重试
      }
    } else {
      // 窗口已足够但未找到目标窗口，等待一小段时间后重试
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error(`等待窗口超时（${timeout}ms）`);
};
// 扩展基础测试，添加 Electron 相关 fixtures
export const test = base.extend<ElectronFixtures>({
  // Electron 应用实例 fixture
  electronApp: async ({}, use) => {
    const mainPath = path.resolve(__dirname, '../../dist/main/main.mjs');       
    const app = await electron.launch({
      args: [mainPath],
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
    });
    // 等待应用完全启动并加载所有窗口
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await use(app);
    // 在关闭前等待一小段时间，避免 Playwright 内部 step id 错误
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      await app.close();
    } catch {
      // 忽略关闭时的错误（可能应用已经关闭）
    }
  },
  // 顶部栏视图 Page fixture（header.html）
  topBarPage: async ({ electronApp }, use) => {
    // 使用辅助函数等待 header.html 窗口加载完成
    const topBarPage = await waitForWindow(electronApp, (url) => url.includes('header.html'));
    await topBarPage.waitForLoadState('domcontentloaded');
    await use(topBarPage);
  },
  // 内容视图 Page fixture（index.html）
  contentPage: async ({ electronApp }, use) => {
    // 使用辅助函数等待 index.html 窗口加载完成
    const contentPage = await waitForWindow(electronApp, (url) => {
      return url.includes('index.html') || (!url.includes('header.html') && (url.includes('app://') || url.includes('localhost:4000')));
    });
    await contentPage.waitForLoadState('domcontentloaded');
    await use(contentPage);
  },
  // 清空所有缓存（localStorage、sessionStorage、IndexedDB）并重置到首页
  clearCache: async ({ contentPage, topBarPage }, use) => {
    const clear = async () => {
      // 清除所有存储
      await contentPage.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
        const dbNames = [
          'httpNodeResponseCache',
          'websocketNodeResponseCache',
          'websocketHistoryCache',
          'httpHistoryCache',
          'sendHistoryCache',
          'mockNodeVariableCache',
          'mockNodeLogsCache',
          'agentViewMessageCache',
          'projectCache',
          'apiNodesCache',
          'commonHeadersCache',
          'variablesCache',
        ];
        dbNames.forEach((dbName) => {
          indexedDB.deleteDatabase(dbName);
        });
      });
      // 点击首页按钮
      const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
      await homeBtn.click();
      await contentPage.waitForTimeout(300);
      // 刷新页面以应用缓存清除
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(500);
    };
    await use(clear);
  },
  // 创建项目
  createProject: async ({ topBarPage, contentPage }, use) => {
    const create = async (name?: string) => {
      const projectName = name || `测试项目-${Date.now()}`;
      const addProjectBtn = topBarPage.locator('[data-testid="header-add-project-btn"]');
      await addProjectBtn.click();
      const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
      await expect(projectDialog).toBeVisible({ timeout: 5000 });
      const projectNameInput = projectDialog.locator('input').first();
      await projectNameInput.fill(projectName);
      const confirmBtn = projectDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await expect(projectDialog).toBeHidden({ timeout: 5000 });
      await topBarPage.waitForTimeout(500);
      return projectName;
    };
    await use(create);
  },
});

export { expect };
