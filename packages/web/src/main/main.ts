import { app, BrowserWindow, Menu, shell } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url';
import { changeDevtoolsFont } from './utils/index.ts';
import { bindIpcMainHandle } from './ipcMessage/index.ts';
import { bindMainProcessGlobalShortCut } from './shortcut/index.ts';
const isDevelopment = process.env.NODE_ENV !== 'production'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

