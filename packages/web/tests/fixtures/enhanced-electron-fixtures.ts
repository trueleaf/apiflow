import { test as base, _electron as electron, ElectronApplication, Page, expect } from '@playwright/test';
import path from 'path';

/**
 * 增强的 Electron 测试 Fixtures
 * 提供测试辅助功能
 */

// Header 和 Content 页面类型定义
export type HeaderAndContentPages = {
  headerPage: Page;
  contentPage: Page;
};

// Header URL 识别提示
const HEADER_URL_HINTS = ['header.html', '/header'];

// 判断是否为 header 页面
const isHeaderUrl = (url: string): boolean => {
  if (!url) return false;
  return HEADER_URL_HINTS.some((hint) => url.includes(hint));
};

// 解析获取 header 和 content 两个页面
export const resolveHeaderAndContentPages = async (
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

// 扩展 Fixtures 类型定义
type EnhancedElectronFixtures = {
  electronApp: ElectronApplication;
};

// 扩展基础测试，添加 Electron Fixtures
export const test = base.extend<EnhancedElectronFixtures>({
  // Electron 应用实例 fixture
  electronApp: async ({}, use) => {
    // 构建 Electron 主进程入口路径
    const mainPath = path.join(process.cwd(), 'dist', 'main', 'main.mjs');
    
    // 准备启动参数
    const launchArgs = [mainPath];
    
    // CI 环境下添加沙箱禁用参数
    if (process.env.CI) {
      launchArgs.push('--no-sandbox', '--disable-setuid-sandbox');
    }
    
    // 启动 Electron 应用
    const electronApp = await electron.launch({
      args: launchArgs,
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
});

export { expect };
