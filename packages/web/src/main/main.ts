import { app, BrowserView, BrowserWindow, Menu, shell, WebContentsView } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url';
import { changeDevtoolsFont } from './utils/index.ts';
import { bindIpcMainHandle } from './ipcMessage/index.ts';
import { bindMainProcessGlobalShortCut } from './shortcut/index.ts';
const isDevelopment = process.env.NODE_ENV !== 'production'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createWindow = () => {
  const headerPath = path.join(__dirname, '../../web/public/header.html');
  const mainWindow = new BrowserWindow({
    frame: false, // 无边框模式
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: true,
    }
  })
  mainWindow.loadURL('http://localhost:3000')
  // mainWindow.loadFile(headerPath)
  const topBarView = new WebContentsView({
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: true,
      devTools: true,
    }
  })
  mainWindow.contentView.addChildView(topBarView);
  topBarView.setBounds({ x: 0, y: 0, width: mainWindow.getBounds().width, height: 35 })
  topBarView.webContents.loadFile(headerPath)
  topBarView.webContents.on('did-finish-load', () => {
    topBarView.webContents.openDevTools({ mode: 'detach' }) // 可以设置为 'right', 'bottom', 'undocked' 等
  })

  mainWindow.webContents.openDevTools()
  changeDevtoolsFont(mainWindow);
  bindMainProcessGlobalShortCut(mainWindow);
  // 设置窗口打开外部链接的默认行为
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
  // 监听窗口状态变化
  mainWindow.on('minimize', () => {
    mainWindow.webContents.send('window-state-changed', 'minimized');
    topBarView.setBounds({ x: 0, y: 0, width: mainWindow.getBounds().width, height: 0 })
  });

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-state-changed', 'maximized');
    topBarView.setBounds({ x: 0, y: 0, width: mainWindow.getBounds().width, height: 35 })
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-state-changed', 'normal');
    topBarView.setBounds({ x: 0, y: 0, width: mainWindow.getBounds().width, height: 35 })
  });

  mainWindow.on('restore', () => {
    mainWindow.webContents.send('window-state-changed', mainWindow.isMaximized() ? 'maximized' : 'normal');
    topBarView.setBounds({ x: 0, y: 0, width: mainWindow.getBounds().width, height: 35 })
  });
  mainWindow.maximize()
  return {
    mainWindow,
    topBarView
  };
}
const rebuildMenu = () => {
  Menu.setApplicationMenu(null)
}

app.whenReady().then(() => {
  const { mainWindow, topBarView } = createWindow()
  bindIpcMainHandle(mainWindow, topBarView);
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

