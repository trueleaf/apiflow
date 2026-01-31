import { test as base, _electron as electron, expect } from '@playwright/test';
import type { ElectronApplication, Page } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
type ElectronFixtures = {
  electronApp: ElectronApplication;
  topBarPage: Page;
  contentPage: Page;
  clearCache: () => Promise<void>;
  createProject: (name?: string) => Promise<string>;
  createNode: (contentPage: Page, options: { nodeType: 'http' | 'httpMock' | 'websocket' | 'websocketMock' | 'folder', name?: string, pid?: string }) => Promise<string>;
  loginAccount: (options?: { loginName?: string; password?: string }) => Promise<void>;
  jumpToSettings: () => Promise<void>;
  reload: () => Promise<void>;
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
  electronApp: async ({}, use) => {
    const mainPath = path.resolve(__dirname, '../../dist/main/main.mjs');       
    const launchEnv: NodeJS.ProcessEnv = {
      ...process.env,
      NODE_ENV: 'test',
    };
    delete launchEnv.ELECTRON_RUN_AS_NODE;
    const app = await electron.launch({
      args: [mainPath],
      env: {
        ...launchEnv,
      } as any,
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
        localStorage.setItem('runtime/networkMode', 'online');
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
      await topBarPage.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await contentPage.evaluate(() => {
        (window as unknown as { electronAPI?: { ipcManager?: { sendToMain: (channel: string, payload: { tabs: unknown[]; activeTabId: string; language: string; networkMode: string }) => void } } }).electronAPI?.ipcManager?.sendToMain('apiflow:content:to:topbar:init-tabs', {
          tabs: [],
          activeTabId: '',
          language: 'zh-cn',
          networkMode: 'online'
        });
      });
      await expect(topBarPage.locator('[data-test-id^="header-tab-item-"]')).toHaveCount(0);
      const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
      await homeBtn.click();
      await contentPage.waitForTimeout(300);
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(500);
    };
    await use(clear);
  },
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
  // 创建节点
  createNode: async ({ contentPage }, use) => {
    const create = async (page: Page, options: { nodeType: 'http' | 'httpMock' | 'websocket' | 'websocketMock' | 'folder', name?: string, pid?: string }) => {
      const { nodeType, name, pid } = options;
      const nodeName = name || `测试节点-${Date.now()}`;
      if (pid) {
        const parentNode = page.locator(`[data-test-node-id="${pid}"]`);
        await expect(parentNode).toBeVisible({ timeout: 5000 });
        await parentNode.click({ button: 'right' });
        const contextMenu = page.locator('.s-contextmenu');
        await expect(contextMenu).toBeVisible({ timeout: 5000 });
        if (nodeType === 'folder') {
          const newFolderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建文件夹/ });
          await newFolderItem.click();
        } else if (nodeType === 'http') {
          const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
          await newInterfaceItem.click();
        } else if (nodeType === 'websocket') {
          const newWebsocketItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建WebSocket/ });
          await newWebsocketItem.click();
        } else if (nodeType === 'httpMock') {
          const newMockItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建Mock/ });
          await newMockItem.click();
        } else if (nodeType === 'websocketMock') {
          const newWsMockItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建WebSocket Mock/ });
          await newWsMockItem.click();
        }
      } else {
        if (nodeType === 'http') {
          const addFileBtn = page.getByTestId('banner-add-http-btn');
          await addFileBtn.click();
        } else if (nodeType === 'folder') {
          const treeWrap = page.locator('.tree-wrap');
          await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
          const contextMenu = page.locator('.s-contextmenu');
          await expect(contextMenu).toBeVisible({ timeout: 5000 });
          const newFolderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建文件夹/ });
          await newFolderItem.click();
        } else if (nodeType === 'websocket') {
          const addWebsocketBtn = page.getByTestId('banner-add-websocket-btn');
          await addWebsocketBtn.click();
        } else if (nodeType === 'httpMock') {
          const addMockBtn = page.getByTestId('banner-add-mock-btn');
          await addMockBtn.click();
        } else if (nodeType === 'websocketMock') {
          const addWsMockBtn = page.getByTestId('banner-add-ws-mock-btn');
          await addWsMockBtn.click();
        }
      }
      const dialogPattern = nodeType === 'folder' ? /新建文件夹|新增文件夹/ : nodeType === 'http' ? /新建接口|新增接口/ : nodeType === 'websocket' ? /新建WebSocket|新增WebSocket/ : nodeType === 'websocketMock' ? /新建WebSocket Mock|新增WebSocket Mock/ : /新建Mock|新增Mock/;
      const dialog = page.locator('.el-dialog').filter({ hasText: dialogPattern });
      await expect(dialog).toBeVisible({ timeout: 5000 });
      const nameInput = dialog.locator('input').first();
      await nameInput.fill(nodeName);
      const confirmBtn = dialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await expect(dialog).toBeHidden({ timeout: 5000 });
      await page.waitForTimeout(500);
      const createdNode = page.locator('.custom-tree-node').filter({ hasText: new RegExp(`^${nodeName}`) }).first();
      await expect(createdNode).toBeVisible({ timeout: 5000 });
      const nodeId = await createdNode.getAttribute('data-test-node-id');
      if (!nodeId) {
        throw new Error(`创建节点失败：无法获取 nodeId`);
      }
      return nodeId;
    };
    await use(create);
  },
  loginAccount: async ({ topBarPage, contentPage }, use) => {
    const login = async (options?: { loginName?: string; password?: string }) => {
      const serverUrl = process.env.TEST_SERVER_URL;
      const loginName = options?.loginName ?? process.env.TEST_LOGIN_NAME;
      const password = options?.password ?? process.env.TEST_LOGIN_PASSWORD;
      if (!serverUrl || !loginName || !password) {
        throw new Error('缺少登录相关环境变量');
      }
      const networkToggle = topBarPage.locator('[data-testid="header-network-toggle"]');
      await expect(networkToggle).toBeVisible({ timeout: 5000 });
      const networkText = await networkToggle.locator('.icon-text').innerText();
      if (/离线|Offline/i.test(networkText)) {
        await networkToggle.click();
        await topBarPage.waitForTimeout(500);
      } else {
        const userMenuBtn = topBarPage.locator('[data-testid="header-user-menu-btn"]');
        const hasUserMenu = await userMenuBtn.isVisible({ timeout: 1000 }).catch(() => false);
        if (hasUserMenu) {
          await userMenuBtn.click();
          const logoutBtn = contentPage.locator('[data-test-id="user-menu-logout-btn"]');
          await expect(logoutBtn).toBeVisible({ timeout: 5000 });
          await logoutBtn.click();
          await contentPage.waitForTimeout(500);
        }
      }
      await contentPage.waitForURL(/.*?#?\/login/, { timeout: 10000 });
      await expect(contentPage.locator('[data-testid="login-tabs"]')).toBeVisible({ timeout: 5000 });
      await contentPage.locator('.el-tabs__item').filter({ hasText: /设置|Setting/i }).click();
      const serverUrlInput = contentPage.getByPlaceholder(/请输入接口调用地址|Please enter.*address/i);
      await expect(serverUrlInput).toBeVisible({ timeout: 5000 });
      await serverUrlInput.fill(serverUrl);
      const saveBtn = contentPage.getByRole('button', { name: /^(保存|Save)$/i });
      const saveBtnEnabled = await saveBtn.isEnabled();
      if (saveBtnEnabled) {
        await saveBtn.click();
        await expect(contentPage.getByText(/保存成功|Saved successfully/i)).toBeVisible({ timeout: 5000 });
      }
      await contentPage.locator('.el-tabs__item').filter({ hasText: /用户登录|Sign In/i }).click();
      await expect(contentPage.locator('[data-testid="login-form"]')).toBeVisible({ timeout: 5000 });
      await contentPage.locator('[data-testid="login-username-input"]').fill(loginName);
      await contentPage.locator('[data-testid="login-password-input"]').fill(password);
      await contentPage.locator('[data-testid="login-submit-btn"]').click();
      await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
      await expect(contentPage.locator('[data-testid="home-add-project-btn"]')).toBeVisible({ timeout: 10000 });
    };
    await use(login);
  },
  jumpToSettings: async ({ topBarPage, contentPage }, use) => {
    const jump = async () => {
      const settingsBtn = topBarPage.locator('[data-testid="header-settings-btn"]');
      await settingsBtn.click();
      await contentPage.waitForURL(/.*?#?\/settings/, { timeout: 5000 });
    };
    await use(jump);
  },
  reload: async ({ topBarPage, contentPage }, use) => {
    const doReload = async () => {
      const refreshBtn = topBarPage.locator('[data-testid="header-refresh-btn"]');
      await refreshBtn.click();
      await topBarPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForLoadState('domcontentloaded');
      await topBarPage.waitForTimeout(1000);
    };
    await use(doReload);
  },
});

export { expect };
