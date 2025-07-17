import { ipcMain, IpcMainInvokeEvent, WebContentsView } from 'electron';
import { BrowserWindow } from 'electron';
import { StandaloneExportHtmlParams } from '@src/types/standalone.ts';
import fs from 'fs/promises';
import { exportHtml, exportWord } from './export/export.ts';
import { getWindowState } from '../utils/index.ts';


export const bindIpcMainHandle = (mainWindow: BrowserWindow, topBarView: WebContentsView) => {
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
  | tab与内容区域相关交互
  |---------------------------------------------------------------------------
  */
  ipcMain.on('apiflow-create-project-from-header', () => {
    mainWindow.webContents.send('apiflow-create-project')
  })
  ipcMain.on('apiflow-create-project-success-from-app', (_, data: { projectId: string, projectName: string }) => {
    topBarView.webContents.send('apiflow-create-project-success', data)
  })
  ipcMain.on('apiflow-change-route-from-header', (_, path: string) => {
    mainWindow.webContents.send('apiflow-change-route', path)
  })
  ipcMain.on('apiflow-change-project-from-app', (_, data: { projectId: string, projectName: string }) => {
    topBarView.webContents.send('apiflow-change-project', data)
  })
  //顶部切换tab
  ipcMain.on('apiflow-change-topbar-tab-from-header', (_, projectId: string) => {
    mainWindow.webContents.send('apiflow-change-topbar-tab', projectId)
  })
  //删除顶部tab
  ipcMain.on('apiflow-delete-topbar-tab-from-app', (_, projectId: string) => {
    topBarView.webContents.send('apiflow-delete-topbar-tab', projectId)
  })
  //改变顶部tab名称
  ipcMain.on('apiflow-change-topbar-tab-name-from-app', (_, data: { projectId: string, projectName: string }) => {
    topBarView.webContents.send('apiflow-change-topbar-tab-name', data)
  })
}