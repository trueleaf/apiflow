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
  ipcMain.on('apiflow-topbar-ready', () => {
    topBarReady = true;
    // 如果 contentView 也准备好了，通知双方可以通信
    if (contentViewReady) {
      contentView.webContents.send('apiflow-topbar-is-ready');
      topBarView.webContents.send('apiflow-content-is-ready');
    }
  });

  // contentView 就绪通知
  ipcMain.on('apiflow-content-ready', () => {
    contentViewReady = true;
    // 如果 topBar 也准备好了，通知双方可以通信
    if (topBarReady) {
      contentView.webContents.send('apiflow-topbar-is-ready');
      topBarView.webContents.send('apiflow-content-is-ready');
    }
  });

  /*
  |--------------------------------------------------------------------------
  | contentView → topBarView 初始化数据传递
  |--------------------------------------------------------------------------
  */
  // App.vue 发送初始化 tabs 数据给 header.vue
  ipcMain.on('apiflow-content-init-tabs', (_, data: { tabs: any[], activeTabId: string }) => {
    topBarView.webContents.send('apiflow-init-tabs-data', data);
  });

  /*
  |--------------------------------------------------------------------------
  | 其他操作
  | 1.读取文件
  | 2.打开开发者工具
  |--------------------------------------------------------------------------
  */
  ipcMain.on('apiflow-open-dev-tools', () => {
    mainWindow.webContents.openDevTools()
  })
  ipcMain.handle('apiflow-read-file-as-blob', async (_: IpcMainInvokeEvent, path: string) => {
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
  ipcMain.on('apiflow-minimize-window', () => {
    mainWindow.minimize()
  })
  ipcMain.on('apiflow-maximize-window', () => {
    mainWindow.maximize()
  })
  
  ipcMain.on('apiflow-unmaximize-window', () => {
    mainWindow.unmaximize()
  })

  ipcMain.on('apiflow-close-window', () => {
    mainWindow.close()
  })
  ipcMain.handle('apiflow-get-window-state', () => {
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
  ipcMain.handle('mock-get-by-node-id', async (_: IpcMainInvokeEvent, nodeId: string) => {
    return mockManager.getMockByNodeId(nodeId);
  });

  // 启动mock服务
  ipcMain.handle('mock-start-server', async (_: IpcMainInvokeEvent, httpMock: MockHttpNode) => {
    return await mockManager.addAndStartMockServer(httpMock);
  });

  // 停止mock服务
  ipcMain.handle('mock-stop-server', async (_: IpcMainInvokeEvent, nodeId: string) => {
    return await mockManager.removeMockByNodeIdAndStopMockServer(nodeId);
  });

  // 替换指定nodeId的Mock配置
  ipcMain.handle('mock-replace-by-id', async (_: IpcMainInvokeEvent, nodeId: string, httpMock: MockHttpNode) => {
    try {
      mockManager.replaceMockById(nodeId, httpMock);
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
  ipcMain.handle('mock-get-all-states', async (_: IpcMainInvokeEvent, projectId: string) => {
    return mockManager.getAllMockStates(projectId);
  });

  // 同步项目变量到主进程
  ipcMain.handle('mock-sync-project-variables', async (_: IpcMainInvokeEvent, projectId: string, variables: any[]) => {
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
  ipcMain.on('apiflow-topbar-create-project', () => {
    contentView.webContents.send('apiflow-create-project')
  })

  // 顶部栏路由切换请求
  ipcMain.on('apiflow-topbar-navigate', (_, path: string) => {
    contentView.webContents.send('apiflow-change-route', path)
  })

  // 顶部栏project切换请求,tabs切换就是项目切换
  ipcMain.on('apiflow-topbar-switch-project', (_, data: IPCProjectData) => {
    contentView.webContents.send('apiflow-change-project', data)
  })

  ipcMain.on('apiflow-network-mode-changed', (_, mode: RuntimeNetworkMode) => {
    contentView.webContents.send('apiflow-network-mode-changed', mode)
  })

  /*
  |---------------------------------------------------------------------------
  | contentView → topBarView 通信（
  |---------------------------------------------------------------------------
  */
  // 主内容区创建项目成功通知
  ipcMain.on('apiflow-content-project-created', (_, payload: IPCProjectData) => {
    topBarView.webContents.send('apiflow-create-project-success', payload)
  })

  // 主内容区项目切换通知
  ipcMain.on('apiflow-content-project-changed', (_, payload: IPCProjectData) => {
    topBarView.webContents.send('apiflow-change-project', payload)
  })

  // 主内容区删除项目
  ipcMain.on('apiflow-content-project-deleted', (_, projectId: string) => {
    topBarView.webContents.send('apiflow-delete-project', projectId)
  })

  // 主内容区修改项目名称请求
  ipcMain.on('apiflow-content-project-renamed', (_, payload: IPCProjectData) => {
    topBarView.webContents.send('apiflow-change-project-name', payload)
  })

  /*
  |---------------------------------------------------------------------------
  | 导航控制事件处理
  |---------------------------------------------------------------------------
  */
  // 刷新主应用
  ipcMain.on('apiflow-refresh-app', () => {
    if (app.isPackaged) {
      app.relaunch();
      app.exit();
    } else {
      topBarView.webContents.reloadIgnoringCache();
      contentView.webContents.reloadIgnoringCache();
    }
  })

  // 后退
  ipcMain.on('apiflow-go-back', () => {
    contentView.webContents.send('apiflow-go-back')
  })

  // 前进
  ipcMain.on('apiflow-go-forward', () => {
    contentView.webContents.send('apiflow-go-forward')
  })

  // 显示语言菜单
  ipcMain.on('apiflow-show-language-menu', (_, data: { position: any, currentLanguage: string }) => {
    contentView.webContents.send('apiflow-show-language-menu', data)
  })

  // 语言切换
  ipcMain.on('apiflow-language-changed', (_, language: string) => {
    // 更新运行时语言状态
    runtime.setLanguage(language as 'zh-cn' | 'zh-tw' | 'en' | 'ja');
    
    // 同时通知 topBarView 和 contentView 更新语言显示
    contentView.webContents.send('apiflow-language-changed', language)
    topBarView.webContents.send('apiflow-language-changed', language)
  })

  // 刷新contentView
  ipcMain.on('apiflow-refresh-content-view', () => {
    contentView.webContents.reloadIgnoringCache()
  })
  /*
  |---------------------------------------------------------------------------
  | 数据备份(导出进度) 事件监听
  |---------------------------------------------------------------------------
  */
  // 选择导出路径
  ipcMain.handle('export-select-path', async () => {
    try {
      const result = await selectExportPath();
      return result;
    } catch (error) {
      console.error('选择导出路径失败:', error);
      return { code: 1, msg: (error as Error).message, data: {} };
    }
  });

  // 开始导出
  ipcMain.on('export-start', async (_, params: { itemNum: number, config?: { includeResponseCache: boolean } }) => {
    try {
      await startExport(params.itemNum);
    } catch (error) {
      console.error('导出开始失败:', error);
      contentView.webContents.send('export-main-error', (error as Error).message);
    }
  });

  // 接收渲染进程传输的数据
  ipcMain.on('export-renderer-data', (_, data: any) => {
    try {
      receiveRendererData(data);
    } catch (error) {
      console.error('接收渲染进程数据失败:', error);
      contentView.webContents.send('export-main-error', (error as Error).message);
    }
  });

  // 渲染进程数据传输完毕
  ipcMain.on('export-renderer-data-finish', async () => {
    try {
      await finishRendererData();
    } catch (error) {
      console.error('完成渲染进程数据传输失败:', error);
      contentView.webContents.send('export-main-error', (error as Error).message);
    }
  });

  // 获取导出状态
  ipcMain.handle('export-get-status', () => {
    const status = getExportStatus();
    return status;
  });

  // 重置导出状态
  ipcMain.on('export-reset', () => {
    try {
      resetExport();
    } catch (error) {
      console.error('重置导出状态失败:', error);
      contentView.webContents.send('export-main-error', (error as Error).message);
    }
  });

  /*
  |---------------------------------------------------------------------------
  | 数据恢复(导入进度) 事件监听
  |---------------------------------------------------------------------------
  */
  // 选择导入文件
  ipcMain.handle('import-select-file', async () => {
    try {
      const result = await selectImportFile();
      return result;
    } catch (error) {
      console.error('选择导入文件失败:', error);
      return { code: 1, msg: (error as Error).message, data: {} };
    }
  });

  // 分析导入文件
  ipcMain.on('import-analyze-file', async (_, params: { filePath: string }) => {
    try {
      await analyzeImportFile(params.filePath);
    } catch (error) {
      console.error('分析导入文件失败:', error);
      contentView.webContents.send('import-main-error', (error as Error).message);
    }
  });

  // 开始导入
  ipcMain.on('import-start', async (_, params: { filePath: string, itemNum: number, config?: { importMode: 'merge' | 'override' } }) => {
    try {
      await startImport(params.filePath, params.itemNum);
    } catch (error) {
      console.error('导入开始失败:', error);
      contentView.webContents.send('import-main-error', (error as Error).message);
    }
  });

  // 重置导入状态
  ipcMain.on('import-reset', () => {
    try {
      resetImport();
    } catch (error) {
      console.error('重置导入状态失败:', error);
      contentView.webContents.send('import-main-error', (error as Error).message);
    }
  });

  /*
  |---------------------------------------------------------------------------
  | AI 配置同步
  |---------------------------------------------------------------------------
  */
  // 同步AI配置到主进程
  ipcMain.on('apiflow-sync-ai-config', (_, params: { apiKey: string; apiUrl: string; timeout?: number }) => {
    globalAiManager.updateConfig(params.apiUrl, params.apiKey, params.timeout);
  });

  /*
  |---------------------------------------------------------------------------
  | AI 测试请求
  |---------------------------------------------------------------------------
  */
  // AI 文本聊天
  ipcMain.handle('ai-text-chat', async (_: IpcMainInvokeEvent) => {
    return await globalAiManager.chatWithText(['你是什么模型'], { maxTokens: 2000 });
  });

  // AI 流式聊天
  ipcMain.handle('ai-text-chat-stream', async (_: IpcMainInvokeEvent, params: { requestId: string }) => {
    // 开始流式请求
    globalAiManager.chatWithTextStream(
      ['你是什么模型'],
      params.requestId,
      (chunk: string) => {
        // 发送数据块到渲染进程
        contentView.webContents.send('ai-stream-data', {
          requestId: params.requestId,
          chunk,
        });
      },
      () => {
        // 发送完成信号到渲染进程
        contentView.webContents.send('ai-stream-end', {
          requestId: params.requestId,
        });
      },
      (response) => {
        // 发送错误信号到渲染进程
        contentView.webContents.send('ai-stream-error', {
          requestId: params.requestId,
          ...response,
        });
      },
      { maxTokens: 2000 }
    );

    return { code: 0, data: { requestId: params.requestId }, msg: '流式请求已启动' };
  });

  // 取消 AI 流式请求
  ipcMain.handle('ai-cancel-stream', async (_: IpcMainInvokeEvent, requestId: string) => {
    globalAiManager.cancelStream(requestId);
    return { code: 0, data: null, msg: '已取消请求' };
  });

  // AI 生成JSON数据
  ipcMain.handle('ai-generate-json', async (_: IpcMainInvokeEvent, params: { prompt: string }) => {
    return await globalAiManager.chatWithJsonText([params.prompt], { maxTokens: 2000 });
  });

  // AI 生成文本数据
  ipcMain.handle('ai-generate-text', async (_: IpcMainInvokeEvent, params: { prompt: string }) => {
    return await globalAiManager.chatWithText([params.prompt], { maxTokens: 100 });
  });

  /*
  |---------------------------------------------------------------------------
  | 窗口状态同步
  |---------------------------------------------------------------------------
  */
  // 提供一个统一的窗口状态广播方法
  const broadcastWindowState = (windowState: WindowState) => {
    contentView.webContents.send('apiflow-resize-window', windowState);
    topBarView.webContents.send('apiflow-resize-window', windowState);
  }

  // 返回包含路由器和广播方法的对象
  return {
    broadcastWindowState
  };
}

