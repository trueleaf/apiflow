import { app, ipcMain, IpcMainInvokeEvent, WebContentsView } from 'electron';
import { BrowserWindow } from 'electron';
import { StandaloneExportHtmlParams } from '@src/types/standalone.ts';
import fs from 'fs/promises';
import { exportHtml, exportWord, setMainWindow, setContentView, startExport, receiveRendererData, finishRendererData, getExportStatus, resetExport, selectExportPath } from './export/export.ts';
import { selectImportFile, analyzeImportFile, startImport, resetImport, setMainWindow as setImportMainWindow, setContentView as setImportContentView } from './import/import.ts';
import { getWindowState, execCodeInContext } from '../utils/index.ts';
// import { IPCProjectData, WindowState } from '@src/types/index.ts';
import type { RuntimeNetworkMode } from '@src/types/runtime';
import type { AnchorRect } from '@src/types/common';

import { mockManager, updateManager } from '../main.ts';
import { MockUtils } from '../mock/mockUtils.ts';
import { HttpMockNode } from '@src/types/mockNode';
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
  let handshakeCompleted = false;
  // 尝试完成握手
  const tryCompleteHandshake = () => {
    if (topBarReady && contentViewReady && !handshakeCompleted) {
      handshakeCompleted = true;
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

  ipcMain.on(IPC_EVENTS.apiflow.contentToTopBar.openSettingsTab, () => {
    topBarView.webContents.send(IPC_EVENTS.apiflow.topBarToContent.openSettingsTab)
  })

  ipcMain.on(IPC_EVENTS.apiflow.topBarToContent.networkModeChanged, (_, mode: RuntimeNetworkMode) => {
    contentView.webContents.send(IPC_EVENTS.apiflow.topBarToContent.networkModeChanged, mode)
    topBarView.webContents.send(IPC_EVENTS.apiflow.topBarToContent.networkModeChanged, mode)
  })
  ipcMain.on(IPC_EVENTS.apiflow.topBarToContent.showUpdateConfirm, (_, data: { version: string; releaseNotes: string }) => {
    contentView.webContents.send(IPC_EVENTS.apiflow.topBarToContent.showUpdateConfirm, data)
  })
  ipcMain.on(IPC_EVENTS.apiflow.topBarToContent.showNoUpdateMessage, () => {
    contentView.webContents.send(IPC_EVENTS.apiflow.topBarToContent.showNoUpdateMessage)
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

  ipcMain.on(IPC_EVENTS.apiflow.contentToTopBar.appSettingsChanged, () => {
    topBarView.webContents.send(IPC_EVENTS.apiflow.topBarToContent.appSettingsChanged)
  })
  ipcMain.on(IPC_EVENTS.apiflow.contentToTopBar.confirmDownloadUpdate, () => {
    topBarView.webContents.send(IPC_EVENTS.apiflow.contentToTopBar.confirmDownloadUpdate)
  })
  ipcMain.on(IPC_EVENTS.apiflow.contentToTopBar.cancelDownloadUpdate, () => {
    topBarView.webContents.send(IPC_EVENTS.apiflow.contentToTopBar.cancelDownloadUpdate)
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

  // 语言切换
  ipcMain.on(IPC_EVENTS.apiflow.contentToTopBar.languageChanged, (_, language: string) => {
    // 更新运行时语言状态
    mainRuntime.setLanguage(language as 'zh-cn' | 'zh-tw' | 'en' | 'ja');

    // 同时通知 topBarView 和 contentView 更新语言显示
    contentView.webContents.send(IPC_EVENTS.apiflow.topBarToContent.languageChanged, language)
    topBarView.webContents.send(IPC_EVENTS.apiflow.topBarToContent.languageChanged, language)
  })

  // 刷新contentView
  ipcMain.on(IPC_EVENTS.apiflow.rendererToMain.refreshContentView, () => {
    contentView.webContents.reloadIgnoringCache()
  })
  /*
  |---------------------------------------------------------------------------
  | 数据备份(导出进度) 事件监听
  |---------------------------------------------------------------------------
  */
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
  | 更新管理相关
  |---------------------------------------------------------------------------
  */
  if (updateManager) {
    // 检查更新
    ipcMain.handle(IPC_EVENTS.updater.rendererToMain.checkUpdate, async () => {
      return await updateManager!.checkForUpdates();
    });
    // 下载更新
    ipcMain.handle(IPC_EVENTS.updater.rendererToMain.downloadUpdate, async () => {
      return await updateManager!.downloadUpdate();
    });
    // 取消下载
    ipcMain.handle(IPC_EVENTS.updater.rendererToMain.cancelDownload, async () => {
      return updateManager!.cancelDownload();
    });
    // 安装更新并重启
    ipcMain.on(IPC_EVENTS.updater.rendererToMain.quitAndInstall, () => {
      updateManager!.quitAndInstall();
    });
    // 获取更新状态
    ipcMain.handle(IPC_EVENTS.updater.rendererToMain.getUpdateStatus, async () => {
      return updateManager!.getUpdateStatus();
    });
    // 切换自动检查
    ipcMain.handle(IPC_EVENTS.updater.rendererToMain.toggleAutoCheck, async (_: IpcMainInvokeEvent, params: { enabled: boolean }) => {
      if (params.enabled) {
        updateManager!.startAutoCheck();
      } else {
        updateManager!.stopAutoCheck();
      }
      return { success: true };
    });
  }

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

