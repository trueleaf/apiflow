import { test as base, _electron as electron, ElectronApplication, Page, expect } from '@playwright/test';
import path from 'path';

export type HeaderAndContentPages = {
  headerPage: Page;
  contentPage: Page;
};

const HEADER_URL_HINTS = ['header.html', '/header'];
const isHeaderUrl = (url: string): boolean => {
  if (!url) return false;
  return HEADER_URL_HINTS.some((hint) => url.includes(hint));
};
export const getPages = async (
  electronApp: ElectronApplication,
  timeout = 30000
): Promise<HeaderAndContentPages> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      const allPages = electronApp.context().pages();
      
      let headerPage: Page | undefined;
      let contentPage: Page | undefined;
      
      for (const page of allPages) {
        const url = page.url();
        if (url.includes('devtools://') || url.includes('chrome-error://') || url === 'about:blank') {
          continue;
        }
        
        if (isHeaderUrl(url)) {
          headerPage = page;
        } else if (url) {
          contentPage = page;
        }
      }
      
      if (headerPage && contentPage) {
        await Promise.all([
          headerPage.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {}),
          contentPage.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
        ]);
        return { headerPage, contentPage };
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      // 继续重试
    }
  }
  
  const allPages = electronApp.context().pages();
  throw new Error(`未能定位 header 与 content 页面，最终找到 ${allPages.length} 个页面: ${allPages.map(p => p.url()).join(', ')}`);
};

// 初始化离线工作台环境，设置离线模式并跳转到 home 页面
export const initOfflineWorkbench = async (
  electronApp: ElectronApplication,
  options: {
    clearStorage?: boolean;
    timeout?: number;
  } = {}
): Promise<HeaderAndContentPages> => {
  const { clearStorage = false, timeout = 10000 } = options;
  
  const pages = await getPages(electronApp);
  const { headerPage, contentPage } = pages;
  
  if (clearStorage) {
    await headerPage.evaluate(() => {
      localStorage.clear();
    });
    await contentPage.evaluate(() => {
      localStorage.clear();
    });
  }
  await contentPage.waitForURL(/home/, { timeout });
  await contentPage.waitForLoadState('domcontentloaded');
  await contentPage.waitForTimeout(1000);
  
  return { headerPage, contentPage };
};

export const test = base.extend<{
  electronApp: ElectronApplication;
}>({
  electronApp: async ({}, use) => {
    const mainPath = path.join(process.cwd(), 'dist', 'main', 'main.mjs');
    
    const launchArgs = [mainPath];
    
    if (process.env.CI) {
      launchArgs.push('--no-sandbox', '--disable-setuid-sandbox');
    }
    
    const electronApp = await electron.launch({
      args: launchArgs,
      env: {
        ...process.env,
        NODE_ENV: 'test',
        ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
      },
    });

    await electronApp.evaluate(async ({ app }) => {
      return app.whenReady();
    });

    await use(electronApp);

    await electronApp.close();
  },
});

export { expect };
