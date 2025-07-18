import { app, BrowserWindow, Menu, shell, WebContentsView } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url';
import { changeDevtoolsFont, getWindowState } from './utils/index.ts';
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
    },
  })
  // 创建顶部栏视图
  const topBarView = new WebContentsView({
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: true,
      devTools: true,
    },
  })

  // 创建主内容视图
  const mainContentView = new WebContentsView({
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: true,
    },
  })

  // 添加子视图
  mainWindow.contentView.addChildView(topBarView);
  mainWindow.contentView.addChildView(mainContentView);

  // 设置顶部栏位置和大小
  const windowBounds = mainWindow.getBounds();
  topBarView.setBounds({ x: 0, y: 0, width: windowBounds.width, height: 35 })

  // 设置主内容位置和大小（在顶部栏下方）
  mainContentView.setBounds({
    x: 0,
    y: 35,
    width: windowBounds.width,
    height: windowBounds.height - 35
  })

  // 加载内容
  topBarView.webContents.loadURL('http://localhost:3000/header.html')
  mainContentView.webContents.loadURL('http://localhost:3000')
  topBarView.webContents.on('did-finish-load', () => {
    topBarView.webContents.openDevTools({ mode: 'detach' }) // 可以设置为 'right', 'bottom', 'undocked' 等
  })

  mainContentView.webContents.openDevTools()
  changeDevtoolsFont(mainWindow);
  bindMainProcessGlobalShortCut(mainWindow);
  // 设置窗口打开外部链接的默认行为
  mainContentView.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
  mainWindow.on('minimize', () => {
    const windowState = getWindowState(mainWindow)
    const windowBounds = mainWindow.getBounds();
    topBarView.setBounds({ x: 0, y: 0, width: windowBounds.width, height: 0 });
    mainContentView.setBounds({ x: 0, y: 0, width: windowBounds.width, height: windowBounds.height });
    mainContentView.webContents.send('apiflow-resize-window', windowState);
    topBarView.webContents.send('apiflow-resize-window', windowState);
  });

  mainWindow.on('maximize', () => {
    const windowState = getWindowState(mainWindow)
    const windowBounds = mainWindow.getBounds();
    topBarView.setBounds({ x: 0, y: 0, width: windowBounds.width, height: 35 })
    mainContentView.setBounds({ x: 0, y: 35, width: windowBounds.width, height: windowBounds.height - 35 })
    mainContentView.webContents.send('apiflow-resize-window', windowState);
    topBarView.webContents.send('apiflow-resize-window', windowState);
  });

  mainWindow.on('unmaximize', () => {
    const windowState = getWindowState(mainWindow)
    const windowBounds = mainWindow.getBounds();
    topBarView.setBounds({ x: 0, y: 0, width: windowBounds.width, height: 35 })
    mainContentView.setBounds({ x: 0, y: 35, width: windowBounds.width, height: windowBounds.height - 35 })
    mainContentView.webContents.send('apiflow-resize-window', windowState);
    topBarView.webContents.send('apiflow-resize-window', windowState);
  });

  mainWindow.on('restore', () => {
    const windowState = getWindowState(mainWindow)
    const windowBounds = mainWindow.getBounds();
    topBarView.setBounds({ x: 0, y: 0, width: windowBounds.width, height: 35 })
    mainContentView.setBounds({ x: 0, y: 35, width: windowBounds.width, height: windowBounds.height - 35 })
    mainContentView.webContents.send('apiflow-resize-window', windowState);
    topBarView.webContents.send('apiflow-resize-window', windowState);
  });
  mainWindow.maximize()
  return {
    mainWindow,
    topBarView,
    mainContentView
  };
}
const rebuildMenu = () => {
  Menu.setApplicationMenu(null)
}

app.whenReady().then(() => {
  const { mainWindow, topBarView, mainContentView } = createWindow()
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

