import { app, ipcMain, IpcMainInvokeEvent, WebContentsView, nativeImage } from 'electron';
import { BrowserWindow } from 'electron';
import { StandaloneExportHtmlParams } from '@src/types/standalone.ts';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { exportHtml, exportWord, setMainWindow, setContentView, startExport, receiveRendererData, finishRendererData, getExportStatus, resetExport, selectExportPath } from './export/export.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { selectImportFile, analyzeImportFile, startImport, resetImport, setMainWindow as setImportMainWindow, setContentView as setImportContentView } from './import/import.ts';
import { getWindowState, execCodeInContext } from '../utils/index.ts';
// import { IPCProjectData, WindowState } from '@src/types/index.ts';
import type { RuntimeNetworkMode } from '@src/types/runtime';
import type { AnchorRect } from '@src/types/common';
import type { PermissionUserInfo } from '@src/types/project';
import type { AppWorkbenchHeaderTabContextActionPayload, AppWorkbenchHeaderTabContextmenuData } from '@src/types/appWorkbench/appWorkbenchType';

import { mockManager, websocketMockManager } from '../main.ts';
import { MockUtils } from '../mock/mockUtils.ts';
import { HttpMockNode, WebSocketMockNode } from '@src/types/mockNode';
import { mainRuntime } from '../runtime/mainRuntime.ts';
import { IPCProjectData, WindowState } from '@src/types/index.ts';

// 导入 IPC 事件常量
import { IPC_EVENTS } from '@src/types/ipc';

export const useIpcEvent = (mainWindow: BrowserWindow, topBarView: WebContentsView, contentView: WebContentsView) => {
  // 设置窗口引用到导出模块
  setMainWindow(mainWindow);
  setContentView(contentView);
  // 设置窗口引用到导入模块
  setImportMainWindow(mainWindow);
  setImportContentView(contentView);

  /*
  |--------------------------------------------------------------------------   
  | 握手机制相关事件
  |--------------------------------------------------------------------------   
  */
  let topBarReady = false;
  let contentViewReady = false;
  // 尝试完成握手
  const tryCompleteHandshake = () => {
    if (topBarReady && contentViewReady) {
      contentView.webContents.send(IPC_EVENTS.apiflow.rendererToMain.topBarIsReady);
      topBarView.webContents.send(IPC_EVENTS.apiflow.rendererToMain.contentIsReady);
    }
  };
  // topBarView 就绪通知
  ipcMain.on(IPC_EVENTS.apiflow.topBarToContent.topBarReady, () => {
    topBarReady = true;
    tryCompleteHandshake();
  });
  // contentView 就绪通知
  ipcMain.on(IPC_EVENTS.apiflow.contentToTopBar.contentReady, () => {
    contentViewReady = true;
    tryCompleteHandshake();
  });

  /*
  |--------------------------------------------------------------------------
  | contentView → topBarView 初始化数据传递
  |--------------------------------------------------------------------------
  */
  // App.vue 发送初始化 tabs 数据给 header.vue
  ipcMain.on(IPC_EVENTS.apiflow.contentToTopBar.initTabs, (_, data: { tabs: any[], activeTabId: string, language: string, networkMode: string }) => {
    topBarView.webContents.send(IPC_EVENTS.apiflow.topBarToContent.initTabsData, data);
  });

  /*
  |--------------------------------------------------------------------------
  | 其他操作
  | 1.读取文件
  | 2.打开开发者工具
  |--------------------------------------------------------------------------
  */
  ipcMain.on(IPC_EVENTS.window.rendererToMain.openDevTools, () => {
    mainWindow.webContents.openDevTools()
  })
  ipcMain.handle(IPC_EVENTS.apiflow.rendererToMain.readFileAsBlob, async (_: IpcMainInvokeEvent, path: string) => {
    try {
      await fs.access(path, fs.constants.F_OK)
    } catch {
      return '文件不存在'
    }
    try {
      const fsStat = await fs.stat(path);
      if (!fsStat.isFile) {
        return '不是文件无法读取'
      }
      if (fsStat.size > 1024 * 1024 * 10) {
        return '文件大小超过10MB'

      }
      const buffer = await fs.readFile(path)
      return buffer
    } catch (error) {
      return (error as Error).message
    }
  })

  /*
  |---------------------------------------------------------------------------
  | 临时文件管理
  |---------------------------------------------------------------------------
  */
  const TEMP_DIR = path.join(os.tmpdir(), 'apiflow-temp');
  // 确保临时目录存在
  const ensureTempDir = async () => {
    try {
      await fs.access(TEMP_DIR);
    } catch {
      await fs.mkdir(TEMP_DIR, { recursive: true });
    }
  };
  // 创建临时文件
  ipcMain.handle(IPC_EVENTS.tempFile.rendererToMain.create, async (_: IpcMainInvokeEvent, content: string) => {
    try {
      await ensureTempDir();
      const fileName = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}.txt`;
      const filePath = path.join(TEMP_DIR, fileName);
      await fs.writeFile(filePath, content, 'utf-8');
      const stats = await fs.stat(filePath);
      return { code: 0, msg: '创建成功', data: { path: filePath, size: stats.size } };
    } catch (error) {
      return { code: 1, msg: (error as Error).message, data: null };
    }
  });
  // 删除临时文件
  ipcMain.handle(IPC_EVENTS.tempFile.rendererToMain.delete, async (_: IpcMainInvokeEvent, filePath: string) => {
    try {
      if (!filePath.startsWith(TEMP_DIR)) {
        return { code: 1, msg: '只能删除临时目录下的文件', data: null };
      }
      await fs.unlink(filePath);
      return { code: 0, msg: '删除成功', data: null };
    } catch (error) {
      return { code: 1, msg: (error as Error).message, data: null };
    }
  });
  // 读取临时文件内容
  ipcMain.handle(IPC_EVENTS.tempFile.rendererToMain.read, async (_: IpcMainInvokeEvent, filePath: string) => {
    try {
      if (!filePath.startsWith(TEMP_DIR)) {
        return { code: 1, msg: '只能读取临时目录下的文件', data: null };
      }
      const content = await fs.readFile(filePath, 'utf-8');
      return { code: 0, msg: '读取成功', data: { content } };
    } catch (error) {
      return { code: 1, msg: (error as Error).message, data: null };
    }
  });

  /*
  |---------------------------------------------------------------------------
  | 项目扫描（代码仓库导入）
  |---------------------------------------------------------------------------
  */
  // 代码文件扩展名白名单
  const CODE_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.vue', '.go', '.java', '.py', '.rb', '.php', '.rs', '.cs'];
  // 忽略的目录
  const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', '.next', '__pycache__', 'vendor', 'target', '.idea', '.vscode'];
  // 配置文件（用于框架识别）
  const CONFIG_FILES = ['package.json', 'go.mod', 'pom.xml', 'build.gradle', 'requirements.txt', 'pyproject.toml', 'Cargo.toml', 'composer.json'];
  // 选择项目文件夹
  ipcMain.handle(IPC_EVENTS.projectScan.rendererToMain.selectFolder, async () => {
    try {
      const { dialog } = await import('electron');
      const result = await dialog.showOpenDialog(mainWindow, {
        title: '选择项目文件夹',
        properties: ['openDirectory'],
      });
      if (result.canceled || result.filePaths.length === 0) {
        return { code: 1, msg: '用户取消', data: { folderPath: '', folderName: '', canceled: true } };
      }
      const folderPath = result.filePaths[0];
      const folderName = path.basename(folderPath);
      return { code: 0, msg: '选择成功', data: { folderPath, folderName, canceled: false } };
    } catch (error) {
      return { code: 1, msg: (error as Error).message, data: null };
    }
  });
  // 递归读取目录文件
  const readDirRecursive = async (dir: string, baseDir: string, files: { path: string; relativePath: string; size: number }[], maxFiles: number, maxFileSize: number) => {
    if (files.length >= maxFiles) return;
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (files.length >= maxFiles) break;
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath);
      if (entry.isDirectory()) {
        if (!IGNORE_DIRS.includes(entry.name)) {
          await readDirRecursive(fullPath, baseDir, files, maxFiles, maxFileSize);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        const isConfigFile = CONFIG_FILES.includes(entry.name);
        const isCodeFile = CODE_EXTENSIONS.includes(ext);
        if (isConfigFile || isCodeFile) {
          const stats = await fs.stat(fullPath);
          if (stats.size <= maxFileSize) {
            files.push({ path: fullPath, relativePath, size: stats.size });
          }
        }
      }
    }
  };
  // 读取项目文件
  ipcMain.handle(IPC_EVENTS.projectScan.rendererToMain.readFiles, async (_: IpcMainInvokeEvent, folderPath: string) => {
    try {
      const maxFiles = 100;
      const maxFileSize = 100 * 1024; // 100KB
      const files: { path: string; relativePath: string; size: number }[] = [];
      await readDirRecursive(folderPath, folderPath, files, maxFiles, maxFileSize);
      // 读取文件内容
      const fileContents: { relativePath: string; content: string }[] = [];
      for (const file of files) {
        const content = await fs.readFile(file.path, 'utf-8');
        fileContents.push({ relativePath: file.relativePath, content });
      }
      return { code: 0, msg: '读取成功', data: { files: fileContents, totalFiles: files.length } };
    } catch (error) {
      return { code: 1, msg: (error as Error).message, data: null };
    }
  });

  /*
  |---------------------------------------------------------------------------
  | 窗口操作
  |---------------------------------------------------------------------------
  */
  ipcMain.on(IPC_EVENTS.window.rendererToMain.minimize, () => {
    mainWindow.minimize()
  })
  ipcMain.on(IPC_EVENTS.window.rendererToMain.maximize, () => {
    mainWindow.maximize()
  })

  ipcMain.on(IPC_EVENTS.window.rendererToMain.unmaximize, () => {
    mainWindow.unmaximize()
  })

  ipcMain.on(IPC_EVENTS.window.rendererToMain.close, () => {
    mainWindow.close()
  })
  ipcMain.handle(IPC_EVENTS.window.rendererToMain.getState, () => {
    return getWindowState(mainWindow)
  });
  /*
  |---------------------------------------------------------------------------
  | 导出相关
  |---------------------------------------------------------------------------
  */
  ipcMain.handle('apiflow-export-html', async (_: IpcMainInvokeEvent, exportHtmlParams: StandaloneExportHtmlParams) => {
    return exportHtml(exportHtmlParams)
  });
  ipcMain.handle('apiflow-export-word', async (_: IpcMainInvokeEvent, exportHtmlParams: StandaloneExportHtmlParams) => {
    return exportWord(exportHtmlParams)
  })

  /*
  |---------------------------------------------------------------------------
  | Mock 服务相关
  |---------------------------------------------------------------------------
  */
  // 检查mock是否已启用
  ipcMain.handle(IPC_EVENTS.mock.rendererToMain.getByNodeId, async (_: IpcMainInvokeEvent, nodeId: string) => {
    return mockManager.getHttpMockByNodeId(nodeId);
  });

  // 启动mock服务
  ipcMain.handle(IPC_EVENTS.mock.rendererToMain.startServer, async (_: IpcMainInvokeEvent, httpMock: HttpMockNode) => {
    return await mockManager.addAndStartHttpServer(httpMock);
  });

  // 停止mock服务
  ipcMain.handle(IPC_EVENTS.mock.rendererToMain.stopServer, async (_: IpcMainInvokeEvent, nodeId: string) => {
    return await mockManager.removeHttpMockAndStopServer(nodeId);
  });

  // 替换指定nodeId的Mock配置
  ipcMain.handle(IPC_EVENTS.mock.rendererToMain.replaceById, async (_: IpcMainInvokeEvent, nodeId: string, httpMock: HttpMockNode) => {
    try {
      mockManager.replaceHttpMockById(nodeId, httpMock);
      return { code: 0, msg: '替换成功', data: null };
    } catch (error) {
      console.error('替换Mock配置失败:', error);
      return {
        code: 1,
        msg: error instanceof Error ? error.message : '未知错误',
        data: null
      };
    }
  });
  //获取项目所有Mock状态
  ipcMain.handle(IPC_EVENTS.mock.rendererToMain.getAllStates, async (_: IpcMainInvokeEvent, projectId: string) => {
    return mockManager.getAllHttpMockStates(projectId);
  });

  // 同步项目变量到主进程
  ipcMain.handle(IPC_EVENTS.mock.rendererToMain.syncProjectVariables, async (_: IpcMainInvokeEvent, projectId: string, variables: any[]) => {
    try {
      MockUtils.syncProjectVariables(projectId, variables);
      return { code: 0, msg: '同步成功', data: null };
    } catch (error) {
      console.error('同步项目变量失败:', error);
      return {
        code: 1,
        msg: error instanceof Error ? error.message : '未知错误',
        data: null
      };
    }
  });

  /*
  |---------------------------------------------------------------------------
  | WebSocket Mock 服务相关
  |---------------------------------------------------------------------------
  */
  // 检查 WebSocket Mock 是否已启用
  ipcMain.handle(IPC_EVENTS.websocketMock.rendererToMain.getByNodeId, async (_: IpcMainInvokeEvent, nodeId: string) => {
    return websocketMockManager.getWebSocketMockByNodeId(nodeId);
  });
  // 启动 WebSocket Mock 服务
  ipcMain.handle(IPC_EVENTS.websocketMock.rendererToMain.startServer, async (_: IpcMainInvokeEvent, wsMock: WebSocketMockNode) => {
    return await websocketMockManager.addAndStartServer(wsMock);
  });
  // 停止 WebSocket Mock 服务
  ipcMain.handle(IPC_EVENTS.websocketMock.rendererToMain.stopServer, async (_: IpcMainInvokeEvent, nodeId: string) => {
    return await websocketMockManager.removeWebSocketMockAndStopServer(nodeId);
  });
  // 替换指定 nodeId 的 WebSocket Mock 配置
  ipcMain.handle(IPC_EVENTS.websocketMock.rendererToMain.replaceById, async (_: IpcMainInvokeEvent, nodeId: string, wsMock: WebSocketMockNode) => {
    try {
      websocketMockManager.replaceWebSocketMockById(nodeId, wsMock);
      return { code: 0, msg: '替换成功', data: null };
    } catch (error) {
      return {
        code: 1,
        msg: error instanceof Error ? error.message : '未知错误',
        data: null
      };
    }
  });
  // 获取项目所有 WebSocket Mock 状态
  ipcMain.handle(IPC_EVENTS.websocketMock.rendererToMain.getAllStates, async (_: IpcMainInvokeEvent, projectId: string) => {
    return websocketMockManager.getAllWebSocketMockStates(projectId);
  });

  /*
  |---------------------------------------------------------------------------
  | topBarView → contentView 通信（使用新的路由器）
  |---------------------------------------------------------------------------
  */
  // 顶部栏创建项目请求
  ipcMain.on(IPC_EVENTS.apiflow.contentToTopBar.createProject, () => {
    // 将焦点转移到 contentView，确保弹窗中的输入框可以获取焦点
    contentView.webContents.focus()
    contentView.webContents.send(IPC_EVENTS.apiflow.rendererToMain.createProject)
  })

  // 顶部栏显示AI对话框请求
  ipcMain.on(IPC_EVENTS.apiflow.contentToTopBar.showAiDialog, (_, payload?: { position?: AnchorRect }) => {
    // 将焦点转移到 contentView，确保对话框中的输入框可以获取焦点
    contentView.webContents.focus()
    contentView.webContents.send(IPC_EVENTS.apiflow.rendererToMain.showAiDialog, payload ?? {})
  })

  // 顶部栏路由切换请求
  ipcMain.on(IPC_EVENTS.apiflow.topBarToContent.navigate, (_, path: string) => {
    // 将焦点转移到 contentView，确保用户可以在新页面中进行操作
    contentView.webContents.focus()
    contentView.webContents.send(IPC_EVENTS.apiflow.rendererToMain.changeRoute, path)
  })

  // 顶部栏project切换请求,tabs切换就是项目切换
  ipcMain.on(IPC_EVENTS.apiflow.contentToTopBar.switchProject, (_, data: IPCProjectData) => {
    // 将焦点转移到 contentView，确保用户可以在项目工作区中进行操作
    contentView.webContents.focus()
    contentView.webContents.send(IPC_EVENTS.apiflow.rendererToMain.changeProject, data)
  })

  // 内容区导航到首页通知 - 转发给 topBarView
  ipcMain.on(IPC_EVENTS.apiflow.contentToTopBar.navigateToHome, () => {
    topBarView.webContents.send(IPC_EVENTS.apiflow.contentToTopBar.navigateToHome)
  })
  // 内容区导航到登录页通知 - 转发给 topBarView
  ipcMain.on(IPC_EVENTS.apiflow.contentToTopBar.navigateToLogin, () => {
    topBarView.webContents.send(IPC_EVENTS.apiflow.contentToTopBar.navigateToLogin)
  })

  ipcMain.on(IPC_EVENTS.apiflow.contentToTopBar.openSettingsTab, () => {        
    topBarView.webContents.send(IPC_EVENTS.apiflow.topBarToContent.openSettingsTab)
  })

  ipcMain.on(IPC_EVENTS.apiflow.topBarToContent.networkModeChanged, (_, mode: RuntimeNetworkMode) => {
    contentView.webContents.send(IPC_EVENTS.apiflow.topBarToContent.networkModeChanged, mode)
    topBarView.webContents.send(IPC_EVENTS.apiflow.topBarToContent.networkModeChanged, mode)
  })

  /*
  |---------------------------------------------------------------------------
  | contentView → topBarView 通信（使用新的路由器）
  |---------------------------------------------------------------------------
  */
  // 主内容区创建项目成功通知
  ipcMain.on(IPC_EVENTS.apiflow.contentToTopBar.projectCreated, (_, payload: IPCProjectData) => {
    topBarView.webContents.send(IPC_EVENTS.apiflow.topBarToContent.projectCreated, payload)
  })

  // 主内容区项目切换通知
  ipcMain.on(IPC_EVENTS.apiflow.contentToTopBar.projectChanged, (_, payload: IPCProjectData) => {
    topBarView.webContents.send(IPC_EVENTS.apiflow.topBarToContent.projectChanged, payload)
  })

  // 主内容区删除项目
  ipcMain.on(IPC_EVENTS.apiflow.contentToTopBar.projectDeleted, (_, projectId: string) => {
    topBarView.webContents.send(IPC_EVENTS.apiflow.topBarToContent.projectDeleted, projectId)
  })

  // 主内容区修改项目名称请求
  ipcMain.on(IPC_EVENTS.apiflow.contentToTopBar.projectRenamed, (_, payload: IPCProjectData) => {
    topBarView.webContents.send(IPC_EVENTS.apiflow.topBarToContent.projectRenamed, payload)
  })

  ipcMain.on(IPC_EVENTS.apiflow.contentToTopBar.appSettingsChanged, (_, data?: { appTitle: string, appLogo: string, appTheme: string }) => {
    topBarView.webContents.send(IPC_EVENTS.apiflow.topBarToContent.appSettingsChanged, data)
  })
  // 设置窗口图标
  ipcMain.on(IPC_EVENTS.apiflow.rendererToMain.setWindowIcon, (_, iconDataUrl: string) => {
    // 如果iconDataUrl为空或非dataURL格式，恢复默认图标
    if (!iconDataUrl || !iconDataUrl.startsWith('data:')) {
      const defaultIconPath = app.isPackaged
        ? path.join(process.resourcesPath, 'icons', '256x256.png')
        : path.join(__dirname, '../../public/icons/256x256.png')
      const defaultIcon = nativeImage.createFromPath(defaultIconPath)
      if (!defaultIcon.isEmpty()) {
        mainWindow.setIcon(defaultIcon)
      }
      return
    }
    const icon = nativeImage.createFromDataURL(iconDataUrl)
    if (!icon.isEmpty()) {
      mainWindow.setIcon(icon)
    }
  })

  // Header Tabs 更新通知 - 转发给 contentView 进行缓存
  ipcMain.on(IPC_EVENTS.apiflow.topBarToContent.tabsUpdated, (_, tabs: any[]) => {
    contentView.webContents.send(IPC_EVENTS.apiflow.topBarToContent.tabsUpdated, tabs)
  })

  // Header 激活 Tab 更新通知 - 转发给 contentView 进行缓存
  ipcMain.on(IPC_EVENTS.apiflow.topBarToContent.activeTabUpdated, (_, activeTabId: string) => {
    contentView.webContents.send(IPC_EVENTS.apiflow.topBarToContent.activeTabUpdated, activeTabId)
  })

  /*
  |---------------------------------------------------------------------------
  | 导航控制事件处理
  |---------------------------------------------------------------------------
  */
  // 刷新主应用
  ipcMain.on(IPC_EVENTS.apiflow.rendererToMain.refreshApp, () => {
    if (app.isPackaged) {
      app.relaunch();
      app.exit();
    } else {
      topBarView.webContents.reloadIgnoringCache();
      contentView.webContents.reloadIgnoringCache();
    }
  })

  // 后退
  ipcMain.on(IPC_EVENTS.apiflow.rendererToMain.goBack, () => {
    contentView.webContents.send(IPC_EVENTS.apiflow.rendererToMain.goBack)
  })

  // 前进
  ipcMain.on(IPC_EVENTS.apiflow.rendererToMain.goForward, () => {
    contentView.webContents.send(IPC_EVENTS.apiflow.rendererToMain.goForward)
  })

  // 显示语言菜单
  ipcMain.on(IPC_EVENTS.apiflow.topBarToContent.showLanguageMenu, (_, data: { position: any, currentLanguage: string }) => {
    contentView.webContents.send(IPC_EVENTS.apiflow.topBarToContent.showLanguageMenu, data)
  })

  // 隐藏语言菜单
  ipcMain.on(IPC_EVENTS.apiflow.topBarToContent.hideLanguageMenu, () => {
    contentView.webContents.send(IPC_EVENTS.apiflow.topBarToContent.hideLanguageMenu)
  })

  // 显示用户菜单
  ipcMain.on(IPC_EVENTS.apiflow.topBarToContent.showUserMenu, (_, data: { position: AnchorRect }) => {
    contentView.webContents.send(IPC_EVENTS.apiflow.topBarToContent.showUserMenu, data)
  })

  // 隐藏用户菜单
  ipcMain.on(IPC_EVENTS.apiflow.topBarToContent.hideUserMenu, () => {
    contentView.webContents.send(IPC_EVENTS.apiflow.topBarToContent.hideUserMenu)
  })

  ipcMain.on(IPC_EVENTS.apiflow.topBarToContent.showHeaderTabContextmenu, (_, data: AppWorkbenchHeaderTabContextmenuData) => {
    contentView.webContents.send(IPC_EVENTS.apiflow.topBarToContent.showHeaderTabContextmenu, data)
  })

  ipcMain.on(IPC_EVENTS.apiflow.topBarToContent.hideHeaderTabContextmenu, () => {
    contentView.webContents.send(IPC_EVENTS.apiflow.topBarToContent.hideHeaderTabContextmenu)
  })

  // 语言切换
  ipcMain.on(IPC_EVENTS.apiflow.contentToTopBar.languageChanged, (_, language: string) => {
    // 更新运行时语言状态
    mainRuntime.setLanguage(language as 'zh-cn' | 'zh-tw' | 'en' | 'ja');

    // 同时通知 topBarView 和 contentView 更新语言显示
    contentView.webContents.send(IPC_EVENTS.apiflow.topBarToContent.languageChanged, language)
    topBarView.webContents.send(IPC_EVENTS.apiflow.topBarToContent.languageChanged, language)
  })

  // 用户信息变更
  ipcMain.on(IPC_EVENTS.apiflow.contentToTopBar.userInfoChanged, (_, payload: Partial<PermissionUserInfo>) => {
    topBarView.webContents.send(IPC_EVENTS.apiflow.contentToTopBar.userInfoChanged, payload)
  })

  ipcMain.on(IPC_EVENTS.apiflow.contentToTopBar.headerTabContextAction, (_, payload: AppWorkbenchHeaderTabContextActionPayload) => {
    topBarView.webContents.send(IPC_EVENTS.apiflow.contentToTopBar.headerTabContextAction, payload)
  })

  // 刷新contentView
  ipcMain.on(IPC_EVENTS.apiflow.rendererToMain.refreshContentView, () => {
    contentView.webContents.reloadIgnoringCache()
  })
  // 选择导出路径
  ipcMain.handle(IPC_EVENTS.export.rendererToMain.selectPath, async () => {     
    try {
      const result = await selectExportPath();
      return result;
    } catch (error) {
      console.error('选择导出路径失败:', error);
      return { code: 1, msg: (error as Error).message, data: {} };
    }
  });

  // 开始导出
  ipcMain.on(IPC_EVENTS.export.rendererNotifyMain.start, async (_, params: { itemNum: number, config?: { includeResponseCache: boolean } }) => {
    try {
      await startExport(params.itemNum);
    } catch (error) {
      console.error('导出开始失败:', error);
      contentView.webContents.send(IPC_EVENTS.export.mainToRenderer.error, (error as Error).message);
    }
  });

  // 接收渲染进程传输的数据
  ipcMain.on(IPC_EVENTS.export.rendererNotifyMain.rendererData, (_, data: any) => {
    try {
      receiveRendererData(data);
    } catch (error) {
      console.error('接收渲染进程数据失败:', error);
      contentView.webContents.send(IPC_EVENTS.export.mainToRenderer.error, (error as Error).message);
    }
  });

  // 渲染进程数据传输完毕
  ipcMain.on(IPC_EVENTS.export.rendererNotifyMain.rendererDataFinish, async () => {
    try {
      await finishRendererData();
    } catch (error) {
      console.error('完成渲染进程数据传输失败:', error);
      contentView.webContents.send(IPC_EVENTS.export.mainToRenderer.error, (error as Error).message);
    }
  });

  // 获取导出状态
  ipcMain.handle(IPC_EVENTS.export.rendererToMain.getStatus, () => {
    const status = getExportStatus();
    return status;
  });

  // 重置导出状态
  ipcMain.on(IPC_EVENTS.export.rendererNotifyMain.reset, () => {
    try {
      resetExport();
    } catch (error) {
      console.error('重置导出状态失败:', error);
      contentView.webContents.send(IPC_EVENTS.export.mainToRenderer.error, (error as Error).message);
    }
  });

  /*
  |---------------------------------------------------------------------------
  | 数据恢复(导入进度) 事件监听
  |---------------------------------------------------------------------------
  */
  // 选择导入文件
  ipcMain.handle(IPC_EVENTS.import.rendererToMain.selectFile, async () => {
    try {
      const result = await selectImportFile();
      return result;
    } catch (error) {
      console.error('选择导入文件失败:', error);
      return { code: 1, msg: (error as Error).message, data: {} };
    }
  });

  // 分析导入文件
  ipcMain.on(IPC_EVENTS.import.rendererNotifyMain.analyzeFile, async (_, params: { filePath: string }) => {
    try {
      await analyzeImportFile(params.filePath);
    } catch (error) {
      console.error('分析导入文件失败:', error);
      contentView.webContents.send(IPC_EVENTS.import.mainToRenderer.error, (error as Error).message);
    }
  });

  // 开始导入
  ipcMain.on(IPC_EVENTS.import.rendererNotifyMain.start, async (_, params: { filePath: string, itemNum: number, config?: { importMode: 'merge' | 'override' } }) => {
    try {
      await startImport(params.filePath, params.itemNum);
    } catch (error) {
      console.error('导入开始失败:', error);
      contentView.webContents.send(IPC_EVENTS.import.mainToRenderer.error, (error as Error).message);
    }
  });

  // 重置导入状态
  ipcMain.on(IPC_EVENTS.import.rendererNotifyMain.reset, () => {
    try {
      resetImport();
    } catch (error) {
      console.error('重置导入状态失败:', error);
      contentView.webContents.send(IPC_EVENTS.import.mainToRenderer.error, (error as Error).message);
    }
  });

  /*
  |---------------------------------------------------------------------------
  | 代码执行
  |---------------------------------------------------------------------------
  */
  // 使用 Node.js vm 模块安全执行代码
  ipcMain.handle(IPC_EVENTS.util.rendererToMain.execCode, async (_: IpcMainInvokeEvent, params: { code: string; variables: Record<string, any> }) => {
    return execCodeInContext(params.code, params.variables);
  });

  /*
  |---------------------------------------------------------------------------
  | 窗口状态同步
  |---------------------------------------------------------------------------
  */
  // 提供一个统一的窗口状态广播方法
  const broadcastWindowState = (windowState: WindowState) => {
    contentView.webContents.send(IPC_EVENTS.window.rendererToMain.resize, windowState);
    topBarView.webContents.send(IPC_EVENTS.window.rendererToMain.resize, windowState);
  }

  // 返回包含路由器和广播方法的对象
  return {
    broadcastWindowState
  };
}

