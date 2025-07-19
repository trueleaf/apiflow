import { ipcMain, IpcMainInvokeEvent, WebContentsView } from 'electron';
import { BrowserWindow } from 'electron';
import { StandaloneExportHtmlParams } from '@src/types/standalone.ts';
import fs from 'fs/promises';
import { exportHtml, exportWord } from './export/export.ts';
import { getWindowState } from '../utils/index.ts';
import { IPCProjectData, WindowState } from '@src/types/types.ts';

export const useIpcEvent = (mainWindow: BrowserWindow, topBarView: WebContentsView, contentView: WebContentsView) => {
  /*
  |--------------------------------------------------------------------------
  | 其他操作
  | 1.读取文件
  | 2.打开开发者工具
  |
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
  ipcMain.on('apiflow-topbar-create-project', async () => {
    contentView.webContents.send('apiflow-create-project')
  })

  // 顶部栏路由切换请求
  ipcMain.on('apiflow-topbar-navigate', async (_, path: string) => {
    contentView.webContents.send('apiflow-change-route', path)
  })

  // 顶部栏project切换请求,tabs切换就是项目切换
  ipcMain.on('apiflow-topbar-switch-project', async (_, data: IPCProjectData) => {
    contentView.webContents.send('apiflow-change-project', data)
  })

  /*
  |---------------------------------------------------------------------------
  | contentView → topBarView 通信（
  |---------------------------------------------------------------------------
  */
  // 主内容区创建项目成功通知
  ipcMain.on('apiflow-content-project-created', async (_, payload: IPCProjectData) => {
    topBarView.webContents.send('apiflow-create-project-success', payload)
  })

  // 主内容区项目切换通知
  ipcMain.on('apiflow-content-project-changed', async (_, payload: IPCProjectData) => {
    topBarView.webContents.send('apiflow-change-project', payload)
  })

  // 主内容区删除项目
  ipcMain.on('apiflow-content-project-deleted', async (_, projectId: string) => {
    topBarView.webContents.send('apiflow-delete-project', projectId)
  })

  // 主内容区修改项目名称请求
  ipcMain.on('apiflow-content-project-renamed', async (_, payload: IPCProjectData) => {
    topBarView.webContents.send('apiflow-change-project-name', payload)
  })
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