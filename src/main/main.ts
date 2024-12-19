import { config } from '../config/config'
import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'
import fs from 'fs/promises'
import path from 'path'

const isDevelopment = process.env.NODE_ENV !== 'production'
const changeDevtoolsFont = (win: BrowserWindow) => {
  win.webContents.on('devtools-opened', () => {
    const css = `
    :root {
        --sys-color-base: var(--ref-palette-neutral100);
        --source-code-font-family: consolas;
        --source-code-font-size: 12px;
        --monospace-font-family: consolas;
        --monospace-font-size: 12px;
        --default-font-family: system-ui, sans-serif;
        --default-font-size: 12px;
    }
    .-theme-with-dark-background {
        --sys-color-base: var(--ref-palette-secondary25);
    }
    body {
        --default-font-family: system-ui,sans-serif;
    }`;
    win.webContents.devToolsWebContents?.executeJavaScript(`
    const overriddenStyle = document.createElement('style');
    overriddenStyle.innerHTML = '${css.replaceAll('\n', ' ')}';
    document.body.append(overriddenStyle);
    document.body.classList.remove('platform-windows');`);
  });
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    title: `${isDevelopment ? `${config.localization.title}(本地)` : config.localization.title} `,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  })
  mainWindow.loadURL('http://localhost:3000')
  mainWindow.webContents.openDevTools()
  mainWindow.maximize()
  changeDevtoolsFont(mainWindow);
}

app.whenReady().then(() => {
  ipcMain.handle('apiflow-open-dev-tools', () => {
    BrowserWindow.getAllWindows()?.forEach(win => {
      win.webContents.openDevTools()
    })
  })
  ipcMain.handle('apiflow-read-file-as-blob', async (_: IpcMainInvokeEvent, path: string) => {
    const buffer = await fs.readFile(path)
    return buffer
  })
  createWindow()
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

