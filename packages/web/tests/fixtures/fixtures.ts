import { test as base, _electron as electron, ElectronApplication, Page, expect } from '@playwright/test';
import path from 'path';
import type { HeaderAndContentPages, CreateProjectOptions, CreateNodeOptions, CreateNodeResult, NodeType } from '../types/test.type';

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
  const { clearStorage = true, timeout = 10000 } = options;

  const pages = await getPages(electronApp);
  const { headerPage, contentPage } = pages;

  // 检查并切换到 offline 模式
  const networkText = headerPage.locator('.network-text');
  await networkText.waitFor({ state: 'visible', timeout: 5000 });
  const currentMode = await networkText.textContent();

  if (currentMode?.includes('联网') || currentMode?.includes('在线')) {
    // 当前是 online 模式，需要切换到 offline
    const networkBtn = headerPage.locator('.network-btn');
    await networkBtn.click();
    await contentPage.waitForURL(/home/, { timeout });
    await contentPage.waitForLoadState('domcontentloaded');
    await contentPage.waitForTimeout(500);
  }

  if (clearStorage) {
    await contentPage.evaluate(() => {
      localStorage.clear();
    });
  }

  // await contentPage.waitForTimeout(30000);
  await contentPage.reload();
  await contentPage.waitForURL(/home/, { timeout });
  await contentPage.waitForLoadState('domcontentloaded');
  await contentPage.waitForTimeout(1000);

  return { headerPage, contentPage };
};
// 创建单个节点的内部辅助方法
const createSingleNode = async (
  contentPage: Page,
  options: CreateNodeOptions
): Promise<CreateNodeResult> => {
  const { name, type, pid = '', timeout = 10000 } = options;
  try {
    if (type === 'folder') {
      const addFolderBtn = contentPage.locator('.tool-icon [title="新增文件夹"]').first();
      await addFolderBtn.waitFor({ state: 'visible', timeout: 5000 });
      await addFolderBtn.click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增文件夹")', { 
        state: 'visible', 
        timeout 
      });
      const folderInput = contentPage.locator('.el-dialog:has-text("新增文件夹")').locator('input[placeholder*="文件夹名称"], input[placeholder*="名称"]').first();
      await folderInput.fill(name);
      await contentPage.locator('.el-dialog:has-text("新增文件夹")').locator('button:has-text("确定")').click();
      await contentPage.waitForSelector('.el-dialog:has-text("新增文件夹")', { 
        state: 'hidden', 
        timeout 
      });
    } else {
      const addNodeBtn = contentPage.locator('.tool-icon [title="新增文件"]').first();
      await addNodeBtn.waitFor({ state: 'visible', timeout: 5000 });
      await addNodeBtn.click();
      await contentPage.waitForSelector('.el-dialog:has-text("新建接口")', { 
        state: 'visible', 
        timeout 
      });
      const nodeInput = contentPage.locator('.el-dialog:has-text("新建接口")').locator('input[placeholder*="接口名称"], input[placeholder*="名称"]').first();
      await nodeInput.fill(name);
      if (type !== 'http') {
        const typeRadio = contentPage.locator('.el-dialog:has-text("新建接口")').locator(`input[value="${type}"]`);
        await typeRadio.waitFor({ state: 'visible', timeout: 5000 });
        await typeRadio.check({ force: true });
        await contentPage.waitForTimeout(300);
      }
      const confirmBtn = contentPage.locator('.el-dialog:has-text("新建接口")').locator('button:has-text("确定")');
      await confirmBtn.waitFor({ state: 'visible', timeout: 5000 });
      await confirmBtn.click();
      await contentPage.waitForSelector('.el-dialog:has-text("新建接口")', { 
        state: 'hidden', 
        timeout 
      });
    }
    await contentPage.waitForTimeout(500);
    return {
      name,
      type,
      success: true,
    };
  } catch (error) {
    return {
      name,
      type,
      success: false,
    };
  }
};
// 批量创建节点方法，支持所有类型：http、websocket、httpMock、folder
export const createNodes = async (
  contentPage: Page,
  options: CreateNodeOptions | CreateNodeOptions[]
): Promise<CreateNodeResult[]> => {
  const nodeOptions = Array.isArray(options) ? options : [options];
  const results: CreateNodeResult[] = [];
  for (const option of nodeOptions) {
    const result = await createSingleNode(contentPage, option);
    results.push(result);
  }
  return results;
};
// 通过UI方式创建项目，创建后会自动跳转到项目编辑页面
export const createProject = async (
  contentPage: Page,
  projectName: string,
  options: CreateProjectOptions = {}
): Promise<void> => {
  const { waitForBanner = true, timeout = 15000 } = options;
  await contentPage.locator('button:has-text("新建项目")').click();
  await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { 
    state: 'visible', 
    timeout 
  });
  const nameInput = contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]');
  await nameInput.fill(projectName);
  await contentPage.locator('.el-dialog__footer button:has-text("确定")').click();
  await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { 
    state: 'hidden',
    timeout 
  });
  await contentPage.waitForURL(/doc-edit/, { timeout });
  await contentPage.waitForLoadState('domcontentloaded');
  if (waitForBanner) {
    await contentPage.waitForSelector('.banner', { timeout: 10000 });
  }
};

// 登录函数，用于在线模式下的用户认证
export const login = async (
  contentPage: Page,
  options: {
    username?: string;
    password?: string;
    timeout?: number;
  } = {}
): Promise<void> => {
  const {
    username = process.env.TEST_LOGIN_NAME || 'apiflow',
    password = process.env.TEST_LOGIN_PASSWORD || '111111',
    timeout = 10000
  } = options;

  // 等待登录表单加载
  await contentPage.waitForSelector('input[name="loginName"]', {
    state: 'visible',
    timeout
  });

  // 填写用户名
  await contentPage.fill('input[name="loginName"]', username);

  // 填写密码
  await contentPage.fill('input[name="password"]', password);
  // 点击登录按钮
  await contentPage.click('button:has-text("登录")');

  // 等待登录成功跳转到 home 页面
  await contentPage.waitForURL(/home/, { timeout });
};

// 切换到在线模式并执行登录
export const switchToOnlineMode = async (
  headerPage: Page,
  contentPage: Page,
  options: {
    username?: string;
    password?: string;
    timeout?: number;
  } = {}
): Promise<void> => {
  const { timeout = 10000 } = options;

  // 点击网络模式按钮切换到 online
  const networkBtn = headerPage.locator('.network-btn');
  await networkBtn.click();
  await contentPage.waitForTimeout(500);

  // 等待跳转到登录页面
  await contentPage.waitForURL(/login/, { timeout });

  // 执行登录
  await login(contentPage, options);

  // 等待登录成功并跳转到 home
  await contentPage.waitForURL(/home/, { timeout });
  await contentPage.waitForLoadState('domcontentloaded');
  await contentPage.waitForTimeout(500);
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
