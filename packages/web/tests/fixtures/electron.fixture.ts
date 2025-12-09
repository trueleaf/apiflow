import { test as base, _electron as electron } from '@playwright/test';
import type { ElectronApplication, Page } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Electron 测试 fixtures 类型定义
type ElectronFixtures = {
  electronApp: ElectronApplication;
  topBarPage: Page;
  contentPage: Page;
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
    await use(app);
    await app.close();
  },
  // 顶部栏视图 Page fixture（header.html）
  topBarPage: async ({ electronApp }, use) => {
    const windows = await electronApp.windows();
    // 等待窗口加载完成
    if (windows.length < 2) {
      await electronApp.waitForEvent('window');
    }
    const allWindows = await electronApp.windows();
    // topBarView 加载 header.html，通过 URL 识别
    const topBarPage = allWindows.find((w) => w.url().includes('header.html'));
    if (!topBarPage) {
      throw new Error('未找到 topBarView 窗口（header.html）');
    }
    await topBarPage.waitForLoadState('domcontentloaded');
    await use(topBarPage);
  },
  // 内容视图 Page fixture（index.html）
  contentPage: async ({ electronApp }, use) => {
    const windows = await electronApp.windows();
    // 等待窗口加载完成
    if (windows.length < 2) {
      await electronApp.waitForEvent('window');
    }
    const allWindows = await electronApp.windows();
    // contentView 加载 index.html，通过 URL 识别（不包含 header.html）
    const contentPage = allWindows.find((w) => {
      const url = w.url();
      return url.includes('index.html') || (!url.includes('header.html') && (url.includes('app://') || url.includes('localhost:4000')));
    });
    if (!contentPage) {
      throw new Error('未找到 contentView 窗口（index.html）');
    }
    await contentPage.waitForLoadState('domcontentloaded');
    await use(contentPage);
  },
});

export { expect } from '@playwright/test';
