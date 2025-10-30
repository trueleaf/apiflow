import { app, ipcMain, IpcMainInvokeEvent, WebContentsView } from 'electron';
import { BrowserWindow } from 'electron';
import { StandaloneExportHtmlParams } from '@src/types/standalone.ts';
import fs from 'fs/promises';
import { exportHtml, exportWord, setMainWindow, setContentView, startExport, receiveRendererData, finishRendererData, getExportStatus, resetExport, selectExportPath } from './export/export.ts';
import { selectImportFile, analyzeImportFile, startImport, resetImport, setMainWindow as setImportMainWindow, setContentView as setImportContentView } from './import/import.ts';
import { getWindowState } from '../utils/index.ts';
// import { IPCProjectData, WindowState } from '@src/types/index.ts';
import type { RuntimeNetworkMode } from '@src/types/runtime';

import { mockManager } from '../main.ts';
import { MockUtils } from '../mock/mockUtils.ts';
import { MockHttpNode } from '@src/types/mockNode';
import { runtime } from '../runtime/runtime.ts';
import { globalAiManager } from '../ai/ai.ts';
import { IPCProjectData, WindowState } from '@src/types/index.ts';
import type { CommonResponse } from '@src/types/project';
import vm from 'vm';

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

  // topBarView 就绪通知
  ipcMain.on(IPC_EVENTS.APIFLOW.TOPBAR_TO_CONTENT.TOPBAR_READY, () => {
    topBarReady = true;
    // 如果 contentView 也准备好了，通知双方可以通信
    if (contentViewReady) {
      contentView.webContents.send(IPC_EVENTS.APIFLOW.RENDERER_TO_MAIN.TOPBAR_IS_READY);
      topBarView.webContents.send(IPC_EVENTS.APIFLOW.RENDERER_TO_MAIN.CONTENT_IS_READY);
    }
  });

  // contentView 就绪通知
  ipcMain.on(IPC_EVENTS.APIFLOW.CONTENT_TO_TOPBAR.CONTENT_READY, () => {
    contentViewReady = true;
    // 如果 topBar 也准备好了，通知双方可以通信
    if (topBarReady) {
      contentView.webContents.send(IPC_EVENTS.APIFLOW.RENDERER_TO_MAIN.TOPBAR_IS_READY);
      topBarView.webContents.send(IPC_EVENTS.APIFLOW.RENDERER_TO_MAIN.CONTENT_IS_READY);
    }
  });

  /*
  |--------------------------------------------------------------------------
  | contentView → topBarView 初始化数据传递
  |--------------------------------------------------------------------------
  */
  // App.vue 发送初始化 tabs 数据给 header.vue
  ipcMain.on(IPC_EVENTS.APIFLOW.CONTENT_TO_TOPBAR.INIT_TABS, (_, data: { tabs: any[], activeTabId: string }) => {
    topBarView.webContents.send(IPC_EVENTS.APIFLOW.TOPBAR_TO_CONTENT.INIT_TABS_DATA, data);
  });

  /*
  |--------------------------------------------------------------------------
  | 其他操作
  | 1.读取文件
  | 2.打开开发者工具
  |--------------------------------------------------------------------------
  */
  ipcMain.on(IPC_EVENTS.WINDOW.RENDERER_TO_MAIN.OPEN_DEV_TOOLS, () => {
    mainWindow.webContents.openDevTools()
  })
  ipcMain.handle(IPC_EVENTS.APIFLOW.RENDERER_TO_MAIN.READ_FILE_AS_BLOB, async (_: IpcMainInvokeEvent, path: string) => {
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
  ipcMain.on(IPC_EVENTS.WINDOW.RENDERER_TO_MAIN.MINIMIZE, () => {
    mainWindow.minimize()
  })
  ipcMain.on(IPC_EVENTS.WINDOW.RENDERER_TO_MAIN.MAXIMIZE, () => {
    mainWindow.maximize()
  })

  ipcMain.on(IPC_EVENTS.WINDOW.RENDERER_TO_MAIN.UNMAXIMIZE, () => {
    mainWindow.unmaximize()
  })

  ipcMain.on(IPC_EVENTS.WINDOW.RENDERER_TO_MAIN.CLOSE, () => {
    mainWindow.close()
  })
  ipcMain.handle(IPC_EVENTS.WINDOW.RENDERER_TO_MAIN.GET_STATE, () => {
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
  ipcMain.handle(IPC_EVENTS.MOCK.RENDERER_TO_MAIN.GET_BY_NODE_ID, async (_: IpcMainInvokeEvent, nodeId: string) => {
    return mockManager.getHttpMockByNodeId(nodeId);
  });

  // 启动mock服务
  ipcMain.handle(IPC_EVENTS.MOCK.RENDERER_TO_MAIN.START_SERVER, async (_: IpcMainInvokeEvent, httpMock: MockHttpNode) => {
    return await mockManager.addAndStartHttpServer(httpMock);
  });

  // 停止mock服务
  ipcMain.handle(IPC_EVENTS.MOCK.RENDERER_TO_MAIN.STOP_SERVER, async (_: IpcMainInvokeEvent, nodeId: string) => {
    return await mockManager.removeHttpMockAndStopServer(nodeId);
  });

  // 替换指定nodeId的Mock配置
  ipcMain.handle(IPC_EVENTS.MOCK.RENDERER_TO_MAIN.REPLACE_BY_ID, async (_: IpcMainInvokeEvent, nodeId: string, httpMock: MockHttpNode) => {
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
  ipcMain.handle(IPC_EVENTS.MOCK.RENDERER_TO_MAIN.GET_ALL_STATES, async (_: IpcMainInvokeEvent, projectId: string) => {
    return mockManager.getAllHttpMockStates(projectId);
  });

  // 同步项目变量到主进程
  ipcMain.handle(IPC_EVENTS.MOCK.RENDERER_TO_MAIN.SYNC_PROJECT_VARIABLES, async (_: IpcMainInvokeEvent, projectId: string, variables: any[]) => {
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
  ipcMain.on(IPC_EVENTS.APIFLOW.CONTENT_TO_TOPBAR.CREATE_PROJECT, () => {
    contentView.webContents.send(IPC_EVENTS.APIFLOW.RENDERER_TO_MAIN.CREATE_PROJECT)
  })

  // 顶部栏路由切换请求
  ipcMain.on(IPC_EVENTS.APIFLOW.TOPBAR_TO_CONTENT.NAVIGATE, (_, path: string) => {
    contentView.webContents.send(IPC_EVENTS.APIFLOW.RENDERER_TO_MAIN.CHANGE_ROUTE, path)
  })

  // 顶部栏project切换请求,tabs切换就是项目切换
  ipcMain.on(IPC_EVENTS.APIFLOW.CONTENT_TO_TOPBAR.SWITCH_PROJECT, (_, data: IPCProjectData) => {
    contentView.webContents.send(IPC_EVENTS.APIFLOW.RENDERER_TO_MAIN.CHANGE_PROJECT, data)
  })

  // 内容区导航到首页通知 - 转发给 topBarView
  ipcMain.on(IPC_EVENTS.APIFLOW.CONTENT_TO_TOPBAR.NAVIGATE_TO_HOME, () => {
    topBarView.webContents.send(IPC_EVENTS.APIFLOW.CONTENT_TO_TOPBAR.NAVIGATE_TO_HOME)
  })

  ipcMain.on(IPC_EVENTS.APIFLOW.TOPBAR_TO_CONTENT.NETWORK_MODE_CHANGED, (_, mode: RuntimeNetworkMode) => {
    contentView.webContents.send(IPC_EVENTS.APIFLOW.TOPBAR_TO_CONTENT.NETWORK_MODE_CHANGED, mode)
  })

  /*
  |---------------------------------------------------------------------------
  | contentView → topBarView 通信（
  |---------------------------------------------------------------------------
  */
  // 主内容区创建项目成功通知
  ipcMain.on(IPC_EVENTS.APIFLOW.TOPBAR_TO_CONTENT.PROJECT_CREATED, (_, payload: IPCProjectData) => {
    topBarView.webContents.send(IPC_EVENTS.APIFLOW.TOPBAR_TO_CONTENT.PROJECT_CREATED, payload)
  })

  // 主内容区项目切换通知
  ipcMain.on(IPC_EVENTS.APIFLOW.TOPBAR_TO_CONTENT.PROJECT_CHANGED, (_, payload: IPCProjectData) => {
    topBarView.webContents.send(IPC_EVENTS.APIFLOW.TOPBAR_TO_CONTENT.PROJECT_CHANGED, payload)
  })

  // 主内容区删除项目
  ipcMain.on(IPC_EVENTS.APIFLOW.TOPBAR_TO_CONTENT.PROJECT_DELETED, (_, projectId: string) => {
    topBarView.webContents.send(IPC_EVENTS.APIFLOW.TOPBAR_TO_CONTENT.PROJECT_DELETED, projectId)
  })

  // 主内容区修改项目名称请求
  ipcMain.on(IPC_EVENTS.APIFLOW.TOPBAR_TO_CONTENT.PROJECT_RENAMED, (_, payload: IPCProjectData) => {
    topBarView.webContents.send(IPC_EVENTS.APIFLOW.TOPBAR_TO_CONTENT.PROJECT_RENAMED, payload)
  })

  // Header Tabs 更新通知 - 转发给 contentView 进行缓存
  ipcMain.on(IPC_EVENTS.APIFLOW.TOPBAR_TO_CONTENT.TABS_UPDATED, (_, tabs: any[]) => {
    contentView.webContents.send(IPC_EVENTS.APIFLOW.TOPBAR_TO_CONTENT.TABS_UPDATED, tabs)
  })

  // Header 激活 Tab 更新通知 - 转发给 contentView 进行缓存
  ipcMain.on(IPC_EVENTS.APIFLOW.TOPBAR_TO_CONTENT.ACTIVE_TAB_UPDATED, (_, activeTabId: string) => {
    contentView.webContents.send(IPC_EVENTS.APIFLOW.TOPBAR_TO_CONTENT.ACTIVE_TAB_UPDATED, activeTabId)
  })

  /*
  |---------------------------------------------------------------------------
  | 导航控制事件处理
  |---------------------------------------------------------------------------
  */
  // 刷新主应用
  ipcMain.on(IPC_EVENTS.APIFLOW.RENDERER_TO_MAIN.REFRESH_APP, () => {
    if (app.isPackaged) {
      app.relaunch();
      app.exit();
    } else {
      topBarView.webContents.reloadIgnoringCache();
      contentView.webContents.reloadIgnoringCache();
    }
  })

  // 后退
  ipcMain.on(IPC_EVENTS.APIFLOW.RENDERER_TO_MAIN.GO_BACK, () => {
    contentView.webContents.send(IPC_EVENTS.APIFLOW.RENDERER_TO_MAIN.GO_BACK)
  })

  // 前进
  ipcMain.on(IPC_EVENTS.APIFLOW.RENDERER_TO_MAIN.GO_FORWARD, () => {
    contentView.webContents.send(IPC_EVENTS.APIFLOW.RENDERER_TO_MAIN.GO_FORWARD)
  })

  // 显示语言菜单
  ipcMain.on(IPC_EVENTS.APIFLOW.CONTENT_TO_TOPBAR.SHOW_LANGUAGE_MENU, (_, data: { position: any, currentLanguage: string }) => {
    contentView.webContents.send(IPC_EVENTS.APIFLOW.CONTENT_TO_TOPBAR.SHOW_LANGUAGE_MENU, data)
  })

  // 语言切换
  ipcMain.on(IPC_EVENTS.APIFLOW.TOPBAR_TO_CONTENT.LANGUAGE_CHANGED, (_, language: string) => {
    // 更新运行时语言状态
    runtime.setLanguage(language as 'zh-cn' | 'zh-tw' | 'en' | 'ja');

    // 同时通知 topBarView 和 contentView 更新语言显示
    contentView.webContents.send(IPC_EVENTS.APIFLOW.TOPBAR_TO_CONTENT.LANGUAGE_CHANGED, language)
    topBarView.webContents.send(IPC_EVENTS.APIFLOW.TOPBAR_TO_CONTENT.LANGUAGE_CHANGED, language)
  })

  // 刷新contentView
  ipcMain.on(IPC_EVENTS.APIFLOW.RENDERER_TO_MAIN.REFRESH_CONTENT_VIEW, () => {
    contentView.webContents.reloadIgnoringCache()
  })
  /*
  |---------------------------------------------------------------------------
  | 数据备份(导出进度) 事件监听
  |---------------------------------------------------------------------------
  */
  // 选择导出路径
  ipcMain.handle(IPC_EVENTS.EXPORT.RENDERER_TO_MAIN.SELECT_PATH, async () => {
    try {
      const result = await selectExportPath();
      return result;
    } catch (error) {
      console.error('选择导出路径失败:', error);
      return { code: 1, msg: (error as Error).message, data: {} };
    }
  });

  // 开始导出
  ipcMain.on(IPC_EVENTS.EXPORT.RENDERER_NOTIFY_MAIN.START, async (_, params: { itemNum: number, config?: { includeResponseCache: boolean } }) => {
    try {
      await startExport(params.itemNum);
    } catch (error) {
      console.error('导出开始失败:', error);
      contentView.webContents.send(IPC_EVENTS.EXPORT.MAIN_TO_RENDERER.ERROR, (error as Error).message);
    }
  });

  // 接收渲染进程传输的数据
  ipcMain.on(IPC_EVENTS.EXPORT.RENDERER_NOTIFY_MAIN.RENDERER_DATA, (_, data: any) => {
    try {
      receiveRendererData(data);
    } catch (error) {
      console.error('接收渲染进程数据失败:', error);
      contentView.webContents.send(IPC_EVENTS.EXPORT.MAIN_TO_RENDERER.ERROR, (error as Error).message);
    }
  });

  // 渲染进程数据传输完毕
  ipcMain.on(IPC_EVENTS.EXPORT.RENDERER_NOTIFY_MAIN.RENDERER_DATA_FINISH, async () => {
    try {
      await finishRendererData();
    } catch (error) {
      console.error('完成渲染进程数据传输失败:', error);
      contentView.webContents.send(IPC_EVENTS.EXPORT.MAIN_TO_RENDERER.ERROR, (error as Error).message);
    }
  });

  // 获取导出状态
  ipcMain.handle(IPC_EVENTS.EXPORT.RENDERER_TO_MAIN.GET_STATUS, () => {
    const status = getExportStatus();
    return status;
  });

  // 重置导出状态
  ipcMain.on(IPC_EVENTS.EXPORT.RENDERER_NOTIFY_MAIN.RESET, () => {
    try {
      resetExport();
    } catch (error) {
      console.error('重置导出状态失败:', error);
      contentView.webContents.send(IPC_EVENTS.EXPORT.MAIN_TO_RENDERER.ERROR, (error as Error).message);
    }
  });

  /*
  |---------------------------------------------------------------------------
  | 数据恢复(导入进度) 事件监听
  |---------------------------------------------------------------------------
  */
  // 选择导入文件
  ipcMain.handle(IPC_EVENTS.IMPORT.RENDERER_TO_MAIN.SELECT_FILE, async () => {
    try {
      const result = await selectImportFile();
      return result;
    } catch (error) {
      console.error('选择导入文件失败:', error);
      return { code: 1, msg: (error as Error).message, data: {} };
    }
  });

  // 分析导入文件
  ipcMain.on(IPC_EVENTS.IMPORT.RENDERER_NOTIFY_MAIN.ANALYZE_FILE, async (_, params: { filePath: string }) => {
    try {
      await analyzeImportFile(params.filePath);
    } catch (error) {
      console.error('分析导入文件失败:', error);
      contentView.webContents.send(IPC_EVENTS.IMPORT.MAIN_TO_RENDERER.ERROR, (error as Error).message);
    }
  });

  // 开始导入
  ipcMain.on(IPC_EVENTS.IMPORT.RENDERER_NOTIFY_MAIN.START, async (_, params: { filePath: string, itemNum: number, config?: { importMode: 'merge' | 'override' } }) => {
    try {
      await startImport(params.filePath, params.itemNum);
    } catch (error) {
      console.error('导入开始失败:', error);
      contentView.webContents.send(IPC_EVENTS.IMPORT.MAIN_TO_RENDERER.ERROR, (error as Error).message);
    }
  });

  // 重置导入状态
  ipcMain.on(IPC_EVENTS.IMPORT.RENDERER_NOTIFY_MAIN.RESET, () => {
    try {
      resetImport();
    } catch (error) {
      console.error('重置导入状态失败:', error);
      contentView.webContents.send(IPC_EVENTS.IMPORT.MAIN_TO_RENDERER.ERROR, (error as Error).message);
    }
  });

  /*
  |---------------------------------------------------------------------------
  | AI 配置同步
  |---------------------------------------------------------------------------
  */
  // 同步AI配置到主进程
  ipcMain.on(IPC_EVENTS.APIFLOW.TOPBAR_TO_CONTENT.SYNC_AI_CONFIG, (_, params: { apiKey: string; apiUrl: string; timeout?: number }) => {
    globalAiManager.updateConfig(params.apiUrl, params.apiKey, params.timeout);
  });

  /*
  |---------------------------------------------------------------------------
  | AI 测试请求
  |---------------------------------------------------------------------------
  */
  // AI 文本聊天
  ipcMain.handle(IPC_EVENTS.AI.RENDERER_TO_MAIN.TEXT_CHAT, async (_: IpcMainInvokeEvent, params?: { prompt: string }) => {
    const prompt = params?.prompt || '你是什么模型';
    return await globalAiManager.chatWithText([prompt], { maxTokens: 2000 });
  });

  // AI JSON聊天
  ipcMain.handle(IPC_EVENTS.AI.RENDERER_TO_MAIN.JSON_CHAT, async (_: IpcMainInvokeEvent, params?: { prompt: string }) => {
    const prompt = params?.prompt || '生成一个简单的测试JSON对象，包含name和age字段';
    return await globalAiManager.chatWithJsonText([prompt], { maxTokens: 2000 });
  });

  // AI 流式聊天
  ipcMain.handle(IPC_EVENTS.AI.RENDERER_TO_MAIN.TEXT_CHAT_STREAM, async (_: IpcMainInvokeEvent, params: { requestId: string }) => {
    // 开始流式请求
    globalAiManager.chatWithTextStream(
      ['你是什么模型'],
      {
        requestId: params.requestId,
        onData: (chunk: string) => {
          // 发送数据块到渲染进程
          contentView.webContents.send(IPC_EVENTS.AI.MAIN_TO_RENDERER.STREAM_DATA, {
            requestId: params.requestId,
            chunk,
          });
        },
        onEnd: () => {
          // 发送完成信号到渲染进程
          contentView.webContents.send(IPC_EVENTS.AI.MAIN_TO_RENDERER.STREAM_END, {
            requestId: params.requestId,
          });
        },
        onError: (response: CommonResponse<string>) => {
          // 发送错误信号到渲染进程
          contentView.webContents.send(IPC_EVENTS.AI.MAIN_TO_RENDERER.STREAM_ERROR, {
            requestId: params.requestId,
            ...response,
          });
        },
        maxTokens: 2000
      }
    );

    return { code: 0, data: { requestId: params.requestId }, msg: '流式请求已启动' };
  });

  // 取消 AI 流式请求
  ipcMain.handle(IPC_EVENTS.AI.RENDERER_TO_MAIN.CANCEL_STREAM, async (_: IpcMainInvokeEvent, requestId: string) => {
    globalAiManager.cancelStream(requestId);
    return { code: 0, data: null, msg: '已取消请求' };
  });

  /*
  |---------------------------------------------------------------------------
  | 代码执行
  |---------------------------------------------------------------------------
  */
  // 使用 Node.js vm 模块安全执行代码
  ipcMain.handle(IPC_EVENTS.UTIL.RENDERER_TO_MAIN.EXEC_CODE, async (_: IpcMainInvokeEvent, params: { code: string; variables: Record<string, any> }) => {
    try {
      const { code, variables } = params;
      const sandbox = {
        ...variables,
        Math: Math,
        Date: Date,
        JSON: JSON,
        String: String,
        Number: Number,
        Boolean: Boolean,
        Array: Array,
        Object: Object,
      };
      const context = vm.createContext(sandbox);
      const script = new vm.Script(code);
      const result = script.runInContext(context, { timeout: 1000 });
      return { code: 0, data: result, msg: 'success' };
    } catch (error) {
      return { code: 1, data: null, msg: `代码执行错误: ${(error as Error).message}` };
    }
  });

  /*
  |---------------------------------------------------------------------------
  | 窗口状态同步
  |---------------------------------------------------------------------------
  */
  // 提供一个统一的窗口状态广播方法
  const broadcastWindowState = (windowState: WindowState) => {
    contentView.webContents.send(IPC_EVENTS.WINDOW.RENDERER_TO_MAIN.RESIZE, windowState);
    topBarView.webContents.send(IPC_EVENTS.WINDOW.RENDERER_TO_MAIN.RESIZE, windowState);
  }

  // 返回包含路由器和广播方法的对象
  return {
    broadcastWindowState
  };
}

