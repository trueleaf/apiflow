import { test as base, _electron as electron, ElectronApplication, Page, expect } from '@playwright/test';
import path from 'path';
import type { Locator } from '@playwright/test';

/**
 * 增强的 Electron 测试 Fixtures
 * 提供更丰富的测试辅助功能
 * 
 * @module enhanced-electron-fixtures
 */

// 扩展 Fixtures 类型定义
type EnhancedElectronFixtures = {
  electronApp: ElectronApplication;
  mainWindow: Page;
  testHelpers: {
    screenshot: (name: string) => Promise<void>;
    waitForSelector: (selector: string, timeout?: number) => Promise<void>;
    clickAndWait: (selector: string, waitForNavigation?: boolean) => Promise<void>;
    fillForm: (formData: Record<string, string>) => Promise<void>;
    navigateTo: (path: string) => Promise<void>;
    getLocalStorage: (key: string) => Promise<string | null>;
    setLocalStorage: (key: string, value: string) => Promise<void>;
    clearAppData: () => Promise<void>;
    findByText: (text: string) => Locator;
    findByTestId: (testId: string) => Locator;
  };
};

// 扩展基础测试，添加增强的 Electron Fixtures
export const test = base.extend<EnhancedElectronFixtures>({
  // Electron 应用实例 fixture
  electronApp: async ({}, use) => {
    // 构建 Electron 主进程入口路径
    const mainPath = path.join(process.cwd(), 'dist', 'main', 'main.mjs');
    
    // 启动 Electron 应用
    const electronApp = await electron.launch({
      args: [mainPath],
      env: {
        ...process.env,
        NODE_ENV: 'test',
        ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
      },
    });

    // 等待应用就绪
    await electronApp.evaluate(async ({ app }) => {
      return app.whenReady();
    });

    // 将应用实例传递给测试
    await use(electronApp);

    // 测试完成后关闭应用
    await electronApp.close();
  },

  // 主窗口 fixture
  mainWindow: async ({ electronApp }, use) => {
    // 等待第一个窗口出现
    const window = await electronApp.firstWindow();
    
    // 等待窗口加载完成
    await window.waitForLoadState('domcontentloaded');

    // 将窗口传递给测试
    await use(window);
  },

  // 测试辅助工具集合
  testHelpers: async ({ mainWindow }, use) => {
    const helpers = {
      // 截图辅助函数
      screenshot: async (name: string) => {
        const timestamp = Date.now();
        const filename = `${name}-${timestamp}.png`;
        await mainWindow.screenshot({
          path: path.join('test-results', 'screenshots', filename),
          fullPage: true,
        });
      },

      // 等待元素出现
      waitForSelector: async (selector: string, timeout = 10000) => {
        await mainWindow.waitForSelector(selector, { 
          timeout, 
          state: 'visible' 
        });
      },

      // 点击并等待
      clickAndWait: async (selector: string, waitForNavigation = false) => {
        await mainWindow.waitForSelector(selector, { state: 'visible' });
        
        if (waitForNavigation) {
          await Promise.all([
            mainWindow.waitForLoadState('networkidle'),
            mainWindow.click(selector),
          ]);
        } else {
          await mainWindow.click(selector);
          await mainWindow.waitForTimeout(300);
        }
      },

      // 填充表单
      fillForm: async (formData: Record<string, string>) => {
        for (const [selector, value] of Object.entries(formData)) {
          await mainWindow.waitForSelector(selector, { state: 'visible' });
          await mainWindow.fill(selector, value);
        }
      },

      // 页面导航
      navigateTo: async (urlPath: string) => {
        const currentUrl = mainWindow.url();
        const baseUrl = new URL(currentUrl).origin;
        const targetUrl = `${baseUrl}${urlPath}`;
        
        await mainWindow.goto(targetUrl);
        await mainWindow.waitForLoadState('domcontentloaded');
      },

      // 获取 localStorage
      getLocalStorage: async (key: string): Promise<string | null> => {
        return await mainWindow.evaluate((storageKey: string) => {
          return localStorage.getItem(storageKey);
        }, key);
      },

      // 设置 localStorage
      setLocalStorage: async (key: string, value: string) => {
        await mainWindow.evaluate(
          ({ storageKey, storageValue }: { storageKey: string; storageValue: string }) => {
            localStorage.setItem(storageKey, storageValue);
          },
          { storageKey: key, storageValue: value }
        );
      },

      // 清理应用数据
      clearAppData: async () => {
        await mainWindow.evaluate(() => {
          localStorage.clear();
          sessionStorage.clear();
        });
      },

      // 通过文本查找元素
      findByText: (text: string): Locator => {
        return mainWindow.locator(`text=${text}`);
      },

      // 通过 testId 查找元素
      findByTestId: (testId: string): Locator => {
        return mainWindow.locator(`[data-testid="${testId}"]`);
      },
    };

    await use(helpers);
  },
});

export { expect };
