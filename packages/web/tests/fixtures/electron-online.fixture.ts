import { test as base, _electron as electron, expect } from '@playwright/test';
import type { ElectronApplication, Page } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { startServer, stopServer } from '../mock-server/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
type ElectronFixtures = {
  mockServer: void;
  electronApp: ElectronApplication;
  topBarPage: Page;
  contentPage: Page;
  clearCache: () => Promise<void>;
};
// 等待指定窗口加载完成
const waitForWindow = async (electronApp: ElectronApplication, predicate: (url: string) => boolean, timeout = 10000): Promise<Page> => {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const windows = await electronApp.windows();
    const targetWindow = windows.find((w) => predicate(w.url()));
    if (targetWindow) {
      return targetWindow;
    }
    if (windows.length < 2) {
      try {
        await Promise.race([
          electronApp.waitForEvent('window', { timeout: 1000 }),
          new Promise((resolve) => setTimeout(resolve, 500)),
        ]);
      } catch {
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error(`等待窗口超时（${timeout}ms）`);
};
export const test = base.extend<ElectronFixtures>({
  mockServer: [
    async ({}, use: (fixture: void) => Promise<void>) => {
      try {
        await startServer();
      } catch (error) {
        const errnoError = error as NodeJS.ErrnoException;
        if (errnoError.code !== 'EADDRINUSE') {
          throw error;
        }
      }
      await use(undefined);
      await stopServer();
    },
    { auto: true },
  ],
  electronApp: async ({}, use) => {
    const mainPath = path.resolve(__dirname, '../../dist/main/main.mjs');
    const app = await electron.launch({
      args: [mainPath],
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await use(app);
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      await app.close();
    } catch {
    }
  },
  topBarPage: async ({ electronApp }, use) => {
    const topBarPage = await waitForWindow(electronApp, (url) => url.includes('header.html'));
    await topBarPage.waitForLoadState('domcontentloaded');
    await use(topBarPage);
  },
  contentPage: async ({ electronApp }, use) => {
    const contentPage = await waitForWindow(electronApp, (url) => {
      return url.includes('index.html') || (!url.includes('header.html') && (url.includes('app://') || url.includes('localhost:4000')));
    });
    await contentPage.waitForLoadState('domcontentloaded');
    await use(contentPage);
  },
  clearCache: async ({ contentPage, topBarPage }, use) => {
    const clear = async () => {
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
      const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
      await homeBtn.click();
      await contentPage.waitForTimeout(300);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(500);
    };
    await use(clear);
  },
});

export { expect };
