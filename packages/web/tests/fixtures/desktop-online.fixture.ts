import { test as base, chromium, expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import type { Browser, Page } from '@playwright/test';
import path from 'path';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'url';
import { startServer, isServerRunning, isMockServerOnPort, PORT } from '../mock-server/index';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
type DesktopFixtures = {
  desktopApp: Browser;
  topBarPage: Page;
  contentPage: Page;
  clearCache: () => Promise<void>;
  createProject: (name?: string) => Promise<string>;
  createNode: (contentPage: Page, options: { nodeType: 'http' | 'httpMock' | 'websocket' | 'websocketMock' | 'folder', name?: string, pid?: string }) => Promise<string>;
  loginAccount: (options?: { loginName?: string; password?: string }) => Promise<void>;
  jumpToSettings: () => Promise<void>;
  reload: () => Promise<void>;
};
// 启动隔离的 Tauri 应用并连接 WebView2 调试端口
export const test = base.extend<DesktopFixtures>({
  desktopApp: async ({}, use) => {
    if (process.platform !== 'win32') throw new Error('Tauri 界面测试使用 Windows WebView2 CDP；其他平台由原生测试和构建验证');
    const portServer = createServer();
    await new Promise<void>(resolve => portServer.listen(0, '127.0.0.1', resolve));
    const address = portServer.address();
    if (!address || typeof address === 'string') throw new Error('无法分配调试端口');
    const port = address.port;
    await new Promise<void>((resolve, reject) => portServer.close(error => error ? reject(error) : resolve()));
    const testUserDataDir = await mkdtemp(path.join(tmpdir(), 'apiflow-e2e-'));
    const executable = path.resolve(__dirname, '../../src-tauri/target/debug/apiflow-desktop.exe');
    const child = spawn(executable, [], { windowsHide: true, env: {
      ...process.env, APIFLOW_TEST_DATA_DIR: testUserDataDir,
      WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: '--remote-debugging-port=' + port + ' --disable-backgrounding-occluded-windows --disable-renderer-backgrounding --disable-background-timer-throttling',
    }, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    child.stdout?.on('data', bytes => { output += String(bytes); });
    child.stderr?.on('data', bytes => { output += String(bytes); });
    let app: Browser | undefined;
    try {
      const deadline = Date.now() + 20000;
      while (Date.now() < deadline) {
        if (child.exitCode !== null) throw new Error('Tauri 启动失败: ' + output);
        try { app = await chromium.connectOverCDP('http://127.0.0.1:' + port, { timeout: 1000 }); break; } catch { await new Promise(resolve => setTimeout(resolve, 100)); }
      }
      if (!app) throw new Error('连接 Tauri 超时: ' + output);
      const disconnect = app.close.bind(app);
      app.close = async options => {
        if (child.exitCode === null && !child.killed) {
          const exited = new Promise<void>(resolve => child.once('exit', () => resolve()));
          child.kill();
          await exited;
        }
        await disconnect(options);
      };
      await use(app);
    } finally {
      await app?.close().catch(() => undefined);
      if (child.exitCode === null && !child.killed) {
        const exited = new Promise<void>(resolve => child.once('exit', () => resolve()));
        child.kill();
        await exited;
      }
      const directory = path.resolve(testUserDataDir);
      if (path.dirname(directory) !== path.resolve(tmpdir()) || !path.basename(directory).startsWith('apiflow-e2e-')) throw new Error('拒绝清理非测试目录');
      await rm(directory, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
    }
  },
  topBarPage: async ({ desktopApp }, use) => {
    let page: Page | undefined;
    await expect.poll(() => {
      page = desktopApp.contexts().flatMap(context => context.pages()).find(item => item.url().includes('header.html'));
      return !!page;
    }, { timeout: 15000 }).toBe(true);
    if (!page) throw new Error('未找到顶部栏');
    await page.waitForLoadState('domcontentloaded');
    const session = await page.context().newCDPSession(page);
    await session.send('Emulation.setFocusEmulationEnabled', { enabled: true });
    await use(page);
  },
  contentPage: async ({ desktopApp }, use, testInfo) => {
    let page: Page | undefined;
    await expect.poll(() => {
      page = desktopApp.contexts().flatMap(context => context.pages()).find(item => item.url().includes('tauri.localhost') && !item.url().includes('header.html') && !item.url().includes('mcp.html'));
      return !!page;
    }, { timeout: 15000 }).toBe(true);
    if (!page) throw new Error('未找到内容视图');
    await page.waitForLoadState('domcontentloaded');
    const session = await page.context().newCDPSession(page);
    await session.send('Emulation.setFocusEmulationEnabled', { enabled: true });
    const pageErrors: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.stack || error.message));
    page.on('console', message => { if (message.type() === 'error') pageErrors.push(message.text()); });
    await page.waitForFunction(() => !!window.desktopAPI);
    const directory = await page.evaluate(async () => {
      const internals = (window as unknown as { __TAURI_INTERNALS__: { invoke: (command: string) => Promise<{ testDataDirectory: string }> } }).__TAURI_INTERNALS__;
      return (await internals.invoke('desktop_info')).testDataDirectory;
    });
    expect(path.dirname(directory)).toBe(path.resolve(tmpdir()));
    expect(path.basename(directory)).toMatch(/^apiflow-e2e-/);
    await use(page);
    if (testInfo.status !== testInfo.expectedStatus) await testInfo.attach('content-dom', { body: await page.content().catch(() => ''), contentType: 'text/html' });
    if (pageErrors.length) await testInfo.attach('webview-errors', { body: pageErrors.join('\n'), contentType: 'text/plain' });
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
        (window as unknown as { desktopAPI?: { ipcManager?: { sendToMain: (channel: string, payload: { tabs: unknown[]; activeTabId: string; language: string; networkMode: string }) => void } } }).desktopAPI?.ipcManager?.sendToMain('apiflow:content:to:topbar:init-tabs', {
          tabs: [],
          activeTabId: '',
          language: 'zh-cn',
          networkMode: 'online'
        });
      });
      const tabCount = await topBarPage.locator('[data-test-id^="header-tab-item-"]').count();
      expect(tabCount).toBeLessThanOrEqual(1);
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
      const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
      await homeBtn.click();
      await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 }).catch(async () => {
        await contentPage.evaluate(() => {
          window.location.hash = '#/home';
        });
        await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
      });
      const projectTab = contentPage.locator('.el-tabs__item').filter({ hasText: /项目列表|Project/i }).first();
      const hasProjectTab = await projectTab.isVisible({ timeout: 1000 }).catch(() => false);
      if (hasProjectTab) {
        const isSelected = await projectTab.getAttribute('aria-selected').then((value) => value === 'true').catch(() => true);
        if (!isSelected) {
          await projectTab.click().catch(async () => {
            const latestProjectTab = contentPage.locator('.el-tabs__item').filter({ hasText: /项目列表|Project/i }).first();
            await latestProjectTab.click({ force: true }).catch(() => undefined);
          });
          await contentPage.waitForTimeout(200);
        }
      }
      const addProjectBtn = topBarPage.locator('[data-testid="header-add-project-btn"]');
      await addProjectBtn.click();
      const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|创建项目|Create Project/ });
      const hasProjectDialog = await projectDialog.isVisible({ timeout: 2000 }).catch(() => false);
      if (!hasProjectDialog) {
        const homeAddProjectBtn = contentPage.locator('[data-testid="home-add-project-btn"]');
        const hasHomeAddProjectBtn = await homeAddProjectBtn.isVisible({ timeout: 1000 }).catch(() => false);
        if (hasHomeAddProjectBtn) {
          await homeAddProjectBtn.click();
        }
      }
      await expect(projectDialog).toBeVisible({ timeout: 5000 });
      const projectNameInput = projectDialog.locator('input').first();
      await projectNameInput.fill(projectName);
      const blockingDialog = contentPage.locator('.el-overlay-message-box:visible');
      const hasBlockingDialog = await blockingDialog.isVisible({ timeout: 500 }).catch(() => false);
      if (hasBlockingDialog) {
        const blockingDialogConfirmBtn = blockingDialog.locator('.el-button--primary').last();
        await blockingDialogConfirmBtn.click({ force: true }).catch(() => undefined);
        await expect(blockingDialog).toBeHidden({ timeout: 3000 }).catch(() => undefined);
      }
      const confirmBtn = projectDialog.locator('.el-button--primary').last();
      await confirmBtn.click({ force: true });
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
        const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口|New Interface/i }).first();
        if (nodeType === 'folder') {
          const newFolderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建文件夹/ });
          await newFolderItem.click();
        } else if (nodeType === 'http') {
          await newInterfaceItem.click();
        } else if (nodeType === 'websocket') {
          const newWebsocketItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建WebSocket|New WebSocket/i }).first();
          const hasNewWebsocketItem = await newWebsocketItem.isVisible({ timeout: 500 }).catch(() => false);
          if (hasNewWebsocketItem) {
            await newWebsocketItem.click();
          } else {
            await newInterfaceItem.click();
          }
        } else if (nodeType === 'httpMock') {
          const newMockItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建Mock|New Mock|HTTP Mock/i }).first();
          const hasNewMockItem = await newMockItem.isVisible({ timeout: 500 }).catch(() => false);
          if (hasNewMockItem) {
            await newMockItem.click();
          } else {
            await newInterfaceItem.click();
          }
        } else if (nodeType === 'websocketMock') {
          const newWsMockItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建WebSocket Mock|New WebSocket Mock/i }).first();
          const hasNewWsMockItem = await newWsMockItem.isVisible({ timeout: 500 }).catch(() => false);
          if (hasNewWsMockItem) {
            await newWsMockItem.click();
          } else {
            await newInterfaceItem.click();
          }
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
          const hasAddWebsocketBtn = await addWebsocketBtn.isVisible({ timeout: 500 }).catch(() => false);
          if (hasAddWebsocketBtn) {
            await addWebsocketBtn.click();
          } else {
            await page.getByTestId('banner-add-http-btn').click();
          }
        } else if (nodeType === 'httpMock') {
          const addMockBtn = page.getByTestId('banner-add-mock-btn');
          const hasAddMockBtn = await addMockBtn.isVisible({ timeout: 500 }).catch(() => false);
          if (hasAddMockBtn) {
            await addMockBtn.click();
          } else {
            await page.getByTestId('banner-add-http-btn').click();
          }
        } else if (nodeType === 'websocketMock') {
          const addWsMockBtn = page.getByTestId('banner-add-ws-mock-btn');
          const hasAddWsMockBtn = await addWsMockBtn.isVisible({ timeout: 500 }).catch(() => false);
          if (hasAddWsMockBtn) {
            await addWsMockBtn.click();
          } else {
            await page.getByTestId('banner-add-http-btn').click();
          }
        }
      }
      const dialogPattern = nodeType === 'folder' ? /新建文件夹|新增文件夹/ : /新建接口|新增接口/;
      const dialog = page.locator('.el-dialog').filter({ hasText: dialogPattern });
      await expect(dialog).toBeVisible({ timeout: 5000 });
      const nameInput = dialog.locator('input').first();
      await nameInput.fill(nodeName);
      if (nodeType !== 'folder' && nodeType !== 'http') {
        const typeRadioPattern = nodeType === 'websocket'
          ? /^WebSocket$/i
          : nodeType === 'httpMock'
            ? /^HTTP Mock$/i
            : /^WebSocket Mock$/i;
        const typeRadio = dialog.locator('.el-radio').filter({ hasText: typeRadioPattern }).first();
        await expect(typeRadio).toBeVisible({ timeout: 5000 });
        await typeRadio.click();
      }
      const confirmBtn = dialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await expect(dialog).toBeHidden({ timeout: 5000 });
      await page.waitForTimeout(500);
      const createdNode = page.locator('.custom-tree-node').filter({ hasText: nodeName }).first();
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
      const shouldForceRelogin = Boolean(options?.loginName || options?.password);
      if (!serverUrl || !loginName || !password) {
        throw new Error('缺少登录相关环境变量');
      }
      const networkToggle = topBarPage.locator('[data-testid="header-network-toggle"]');
      await expect(networkToggle).toBeVisible({ timeout: 5000 });
      const networkText = await networkToggle.locator('.icon-text').innerText();
      if (/离线|Offline/i.test(networkText)) {
        await networkToggle.click();
        await topBarPage.waitForTimeout(500);
      }
      const userMenuBtn = topBarPage.locator('[data-testid="header-user-menu-btn"]');
      const hasUserMenu = await userMenuBtn.isVisible({ timeout: 1000 }).catch(() => false);
      const isLoginRoute = /#\/login(?:$|\?)/.test(contentPage.url());
      if (!shouldForceRelogin && hasUserMenu && !isLoginRoute) {
        const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
        await homeBtn.click();
        await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 }).catch(async () => {
          await contentPage.evaluate(() => {
            window.location.hash = '#/home';
          });
          await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
        });
        return;
      }
      if (hasUserMenu) {
        await userMenuBtn.click();
        const logoutBtn = contentPage.locator('[data-test-id="user-menu-logout-btn"]');
        await expect(logoutBtn).toBeVisible({ timeout: 5000 });
        await logoutBtn.click();
        await contentPage.waitForTimeout(500);
      }
      const loginRouteVisible = /#\/login(?:$|\?)/.test(contentPage.url());
      if (!loginRouteVisible) {
        await contentPage.evaluate(() => {
          window.location.hash = '#/login';
        });
      }
      await contentPage.waitForURL(/.*?#?\/login/, { timeout: 10000 }).catch(() => undefined);
      const loginTabs = contentPage.locator('[data-testid="login-tabs"]');
      const hasLoginTabs = await loginTabs.isVisible({ timeout: 2000 }).catch(() => false);
      if (!hasLoginTabs) {
        const fallbackUserMenuVisible = await userMenuBtn.isVisible({ timeout: 1000 }).catch(() => false);
        if (fallbackUserMenuVisible) {
          const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
          await homeBtn.click();
          await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 }).catch(async () => {
            await contentPage.evaluate(() => {
              window.location.hash = '#/home';
            });
            await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
          });
          return;
        }
      }
      const settingsTab = contentPage.locator('.el-tabs__item').filter({ hasText: /设置|Setting/i }).first();
      const hasSettingsTab = await settingsTab.isVisible({ timeout: 2000 }).catch(() => false);
      if (hasSettingsTab) {
        await settingsTab.click().catch(async () => {
          await contentPage.waitForTimeout(300);
          await settingsTab.click();
        });
        const serverUrlInput = contentPage.getByPlaceholder(/请输入接口调用地址|Please enter.*address/i);
        await expect(serverUrlInput).toBeVisible({ timeout: 5000 });
        await serverUrlInput.fill(serverUrl);
        const saveBtn = contentPage.getByRole('button', { name: /^(保存|Save)$/i });
        const saveBtnEnabled = await saveBtn.isEnabled();
        if (saveBtnEnabled) {
          await saveBtn.click();
          await expect(contentPage.getByText(/保存成功|Saved successfully/i)).toBeVisible({ timeout: 5000 });
        }
      }
      const loginTab = contentPage.locator('.el-tabs__item').filter({ hasText: /用户登录|Sign In/i }).first();
      const hasLoginTab = await loginTab.isVisible({ timeout: 2000 }).catch(() => false);
      if (hasLoginTab) {
        await loginTab.click().catch(async () => {
          await contentPage.waitForTimeout(300);
          await loginTab.click();
        });
      }
      const loginForm = contentPage.locator('[data-testid="login-form"]');
      const hasLoginForm = await loginForm.isVisible({ timeout: 2000 }).catch(() => false);
      if (!hasLoginForm) {
        const fallbackUserMenuVisible = await userMenuBtn.isVisible({ timeout: 1000 }).catch(() => false);
        if (fallbackUserMenuVisible) {
          const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
          await homeBtn.click();
          await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 }).catch(async () => {
            await contentPage.evaluate(() => {
              window.location.hash = '#/home';
            });
            await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
          });
          return;
        }
      }
      const usernameInput = contentPage.locator('[data-testid="login-username-input"]');
      const passwordInput = contentPage.locator('[data-testid="login-password-input"]');
      const hasUsernameInput = await usernameInput.isVisible({ timeout: 2000 }).catch(() => false);
      const hasPasswordInput = await passwordInput.isVisible({ timeout: 2000 }).catch(() => false);
      if (!hasUsernameInput || !hasPasswordInput) {
        const fallbackUserMenuVisible = await userMenuBtn.isVisible({ timeout: 1000 }).catch(() => false);
        if (fallbackUserMenuVisible) {
          const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
          await homeBtn.click();
          await contentPage.waitForURL(/.*?#?\/(home|workbench)/, { timeout: 10000 }).catch(() => undefined);
          return;
        }
        const quickLoginBtn = contentPage.locator('[data-testid="login-quick-login-btn"]');
        const hasQuickLoginBtn = await quickLoginBtn.isVisible({ timeout: 1500 }).catch(() => false);
        if (hasQuickLoginBtn) {
          await quickLoginBtn.click();
          const startTime = Date.now();
          while (Date.now() - startTime < 20000) {
            const currentUrl = contentPage.url();
            if (/.*?#?\/(home|workbench)/.test(currentUrl)) {
              break;
            }
            const hasUserMenuInLoop = await userMenuBtn.isVisible({ timeout: 200 }).catch(() => false);
            if (hasUserMenuInLoop) {
              break;
            }
            await contentPage.waitForTimeout(300);
          }
        } else {
          await contentPage.reload().catch(() => undefined);
          await contentPage.waitForLoadState('domcontentloaded').catch(() => undefined);
          const fallbackUserMenuVisible = await userMenuBtn.isVisible({ timeout: 1000 }).catch(() => false);
          if (!fallbackUserMenuVisible) {
            const fallbackQuickLoginBtn = contentPage.locator('[data-testid="login-quick-login-btn"]');
            const hasFallbackQuickLoginBtn = await fallbackQuickLoginBtn.isVisible({ timeout: 1000 }).catch(() => false);
            if (hasFallbackQuickLoginBtn) {
              await fallbackQuickLoginBtn.click();
            }
          }
        }
        const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
        await homeBtn.click();
        await contentPage.waitForURL(/.*?#?\/(home|workbench)/, { timeout: 10000 }).catch(() => undefined);
        return;
      }
      await usernameInput.fill(loginName);
      await passwordInput.fill(password);
      const submitBtn = contentPage.locator('[data-testid="login-submit-btn"]');
      const hasSubmitBtn = await submitBtn.isVisible({ timeout: 2000 }).catch(() => false);
      if (hasSubmitBtn) {
        await submitBtn.click();
      } else {
        const quickLoginBtn = contentPage.locator('[data-testid="login-quick-login-btn"]');
        await expect(quickLoginBtn).toBeVisible({ timeout: 5000 });
        await quickLoginBtn.click();
      }
      // 统一判断是否已登录成功
      const waitLoginSuccess = async (timeout: number) => {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
          const currentUrl = contentPage.url();
          if (/.*?#?\/(home|workbench)/.test(currentUrl)) {
            return true;
          }
          const hasUserMenu = await userMenuBtn.isVisible({ timeout: 200 }).catch(() => false);
          if (hasUserMenu) {
            return true;
          }
          await contentPage.waitForTimeout(300);
        }
        return false;
      };
      // 优先使用账号密码登录，失败时退化到快捷登录，避免卡在登录页
      const loginByPasswordSuccess = await waitLoginSuccess(10000);
      if (!loginByPasswordSuccess) {
        const quickLoginBtn = contentPage.locator('[data-testid="login-quick-login-btn"]');
        const hasQuickLoginBtn = await quickLoginBtn.isVisible({ timeout: 2000 }).catch(() => false);
        if (hasQuickLoginBtn) {
          let quickLoginSuccess = false;
          for (let i = 0; i < 2; i += 1) {
            await quickLoginBtn.click().catch(async () => {
              const messageBox = contentPage.locator('.el-overlay-message-box');
              const hasMessageBox = await messageBox.isVisible({ timeout: 1000 }).catch(() => false);
              if (hasMessageBox) {
                const confirmBtn = messageBox.locator('.el-button--primary').first();
                const hasConfirmBtn = await confirmBtn.isVisible({ timeout: 1000 }).catch(() => false);
                if (hasConfirmBtn) {
                  await confirmBtn.click();
                }
              }
              await contentPage.waitForTimeout(1500);
            });
            quickLoginSuccess = await waitLoginSuccess(10000);
            if (quickLoginSuccess) {
              break;
            }
            const messageBox = contentPage.locator('.el-overlay-message-box');
            const hasMessageBox = await messageBox.isVisible({ timeout: 800 }).catch(() => false);
            if (hasMessageBox) {
              const confirmBtn = messageBox.locator('.el-button--primary').first();
              const hasConfirmBtn = await confirmBtn.isVisible({ timeout: 1000 }).catch(() => false);
              if (hasConfirmBtn) {
                await confirmBtn.click();
              }
              await contentPage.waitForTimeout(1500);
            }
          }
          if (!quickLoginSuccess) {
            throw new Error('快捷登录后仍未进入首页');
          }
        } else {
          throw new Error('账号密码登录失败，且不存在快捷登录入口');
        }
      }
      const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
      await homeBtn.click();
      await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 }).catch(async () => {
        await contentPage.evaluate(() => {
          window.location.hash = '#/home';
        });
        await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
      });
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

test.beforeAll(async () => {
  if (!isServerRunning()) {
    const isMockRunning = await isMockServerOnPort(PORT);
    if (!isMockRunning) {
      console.log('🚀 单测模式：启动 Mock 服务器...');
      await startServer();
      console.log(`✅ Mock 服务器已在端口 ${PORT} 上成功启动`);
    }
  }
});

export { expect };
