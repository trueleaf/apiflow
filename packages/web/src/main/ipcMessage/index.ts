import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { BrowserWindow } from 'electron';
import { StandaloneExportHtmlParams } from '@src/types/standalone.ts';
import fs from 'fs/promises';
import { exportHtml, exportWord } from './export/export.ts';


export const bindIpcMainHandle = (mainWindow: BrowserWindow) => {
  ipcMain.handle('apiflow-open-dev-tools', () => {
    BrowserWindow.getAllWindows()?.forEach(win => {
      win.webContents.openDevTools()
    })
  })
  ipcMain.handle('apiflow-minimize-window', () => {
    BrowserWindow.getFocusedWindow()?.minimize()
  })
  ipcMain.handle('apiflow-maximize-window', () => {
    const win = BrowserWindow.getFocusedWindow()
    win?.maximize()
  })
  
  ipcMain.handle('apiflow-unmaximize-window', () => {
    const win = BrowserWindow.getFocusedWindow()
    win?.unmaximize()
  })

  ipcMain.handle('apiflow-close-window', () => {
    BrowserWindow.getFocusedWindow()?.close()
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

  // 添加获取窗口状态的方法
  ipcMain.handle('apiflow-get-window-state', () => {
    const win = BrowserWindow.getFocusedWindow()
    return win?.isMaximized() ? 'maximized' : 'normal';
  });

  // 导出HTML方法
  ipcMain.handle('apiflow-export-html', async (_: IpcMainInvokeEvent, exportHtmlParams: StandaloneExportHtmlParams) => {
    return exportHtml(exportHtmlParams)
  });
  // 导出为word方法
  ipcMain.handle('apiflow-export-word', async (_: IpcMainInvokeEvent, exportHtmlParams: StandaloneExportHtmlParams) => {
    return exportWord(exportHtmlParams)
  })
  ipcMain.on('apiflow-create-project', () => {
    mainWindow.webContents.send('on-apiflow-create-project')
  })
}