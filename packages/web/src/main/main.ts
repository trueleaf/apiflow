import { app, BrowserWindow, globalShortcut, ipcMain, IpcMainInvokeEvent, Menu, shell } from 'electron'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url';
import { changeDevtoolsFont } from './utils/index.ts';
import { StandaloneExportHtmlParams } from '@src/types/standalone.ts';
const isDevelopment = process.env.NODE_ENV !== 'production'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let isShortcutRegistered = false; //

// 定义窗口状态类型
let currentWindowState: 'normal' | 'minimized' | 'maximized' = 'normal';


const createWindow = () => {
  const mainWindow = new BrowserWindow({
    frame: false, // 无边框模式
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: true,
    }
  })
  mainWindow.loadURL('http://localhost:3000')
  mainWindow.webContents.openDevTools()
  mainWindow.maximize()

  // 监听窗口状态变化
  mainWindow.on('minimize', () => {
    currentWindowState = 'minimized';
    mainWindow.webContents.send('window-state-changed', currentWindowState);
  });

  mainWindow.on('maximize', () => {
    currentWindowState = 'maximized';
    mainWindow.webContents.send('window-state-changed', currentWindowState);
  });

  mainWindow.on('unmaximize', () => {
    currentWindowState = 'normal';
    mainWindow.webContents.send('window-state-changed', currentWindowState);
  });

  mainWindow.on('restore', () => {
    currentWindowState = mainWindow.isMaximized() ? 'maximized' : 'normal';
    mainWindow.webContents.send('window-state-changed', currentWindowState);
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
  changeDevtoolsFont(mainWindow);
  bindMainProcessGlobalShortCut(mainWindow)
}
const rebuildMenu = () => {
  Menu.setApplicationMenu(null)
}
const bindIpcMainHandle = () => {
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
    return currentWindowState;
  });

  // 导出HTML方法
  ipcMain.handle('apiflow-export-html', async (_: IpcMainInvokeEvent, exportHtmlParams: StandaloneExportHtmlParams) => {
    try {
      const htmlPath = path.join(__dirname, '../public/share.html');
      let htmlContent = await fs.readFile(htmlPath, 'utf-8');
      htmlContent = htmlContent.replace(/<\/script>/gi, '\\u003c/script>')
      htmlContent = htmlContent.replace(/<title>[^<]*<\/title>/, `<title>${exportHtmlParams.projectInfo.projectName}</title>`)
      return htmlContent.replace(/window.SHARE_DATA = null/g, `window.SHARE_DATA = ${JSON.stringify(exportHtmlParams)}`);
    } catch (error) {
      console.error('Export HTML failed:', error);
      throw error;
    }
  });
}
//防止web页面卡死时候无法刷新页面
const bindMainProcessGlobalShortCut = (win: BrowserWindow) => {
  win.on('focus', () => {
    if (!isShortcutRegistered) {
      globalShortcut.register('CommandOrControl+R', () => {
        const wins = BrowserWindow.getAllWindows();
        wins.forEach(win => {
          win.reload(); // 重新加载当前窗口
        })
      });
      globalShortcut.register('CommandOrControl+Shift+R', () => {
        const wins = BrowserWindow.getAllWindows();
        wins.forEach(win => {
          win.webContents.reloadIgnoringCache();
        })
      });
      isShortcutRegistered = true;
    }
  });
  win.on('blur', () => {
    if (isShortcutRegistered) {
      globalShortcut.unregister('CommandOrControl+R');
      globalShortcut.unregister('CommandOrControl+Shift+R');
      isShortcutRegistered = false;
    }
  });
}

app.whenReady().then(() => {
  bindIpcMainHandle();
  createWindow()
  rebuildMenu();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      console.log('receive', data)
    })
  } else {
    process.on('SIGTERM', () => {
      console.log(222)
    })
  }
}

