import { app, ipcMain, IpcMainInvokeEvent, WebContentsView } from 'electron';
import { BrowserWindow } from 'electron';
import { StandaloneExportHtmlParams } from '@src/types/standalone.ts';
import fs from 'fs/promises';
import { exportHtml, exportWord, setMainWindow, setContentView, startExport, receiveRendererData, finishRendererData, getExportStatus, resetExport, selectExportPath } from './export/export.ts';
import { selectImportFile, analyzeImportFile, startImport, resetImport, setMainWindow as setImportMainWindow, setContentView as setImportContentView } from './import/import.ts';
import { getWindowState } from '../utils/index.ts';
import { IPCProjectData, WindowState } from '@src/types/types.ts';

export const useIpcEvent = (mainWindow: BrowserWindow, topBarView: WebContentsView, contentView: WebContentsView) => {
  // 设置窗口引用到导出模块
  setMainWindow(mainWindow);
  setContentView(contentView);
  // 设置窗口引用到导入模块
  setImportMainWindow(mainWindow);
  setImportContentView(contentView);
  /*
  |--------------------------------------------------------------------------
  | 其他操作
  | 1.读取文件
  | 2.打开开发者工具
  |--------------------------------------------------------------------------
  */
  ipcMain.handle('apiflow-open-dev-tools', () => {
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
  ipcMain.handle('apiflow-minimize-window', () => {
    mainWindow.minimize()
  })
  ipcMain.handle('apiflow-maximize-window', () => {
    mainWindow.maximize()
  })
  
  ipcMain.handle('apiflow-unmaximize-window', () => {
    mainWindow.unmaximize()
  })

  ipcMain.handle('apiflow-close-window', () => {
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
    // 同时通知 topBarView 和 contentView 更新语言显示
    contentView.webContents.send('apiflow-language-changed', language)
    topBarView.webContents.send('apiflow-language-changed', language)
  })
  /*
  |---------------------------------------------------------------------------
  | 数据备份(导出进度) 事件监听
  |---------------------------------------------------------------------------
  */
  // 选择导出路径
  ipcMain.on('export-select-path', async (event) => {
    try {
      const result = await selectExportPath();
      event.reply('export-select-path-reply', result);
    } catch (error) {
      console.error('选择导出路径失败:', error);
      event.reply('export-select-path-reply', { success: false, error: (error as Error).message });
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
  ipcMain.on('export-get-status', (event) => {
    const status = getExportStatus();
    event.reply('export-get-status-reply', status);
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
  ipcMain.on('import-select-file', async (event) => {
    try {
      const result = await selectImportFile();
      event.reply('import-select-file-reply', result);
    } catch (error) {
      console.error('选择导入文件失败:', error);
      event.reply('import-select-file-reply', { success: false, error: (error as Error).message });
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
