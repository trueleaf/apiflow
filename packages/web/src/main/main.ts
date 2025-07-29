import { app, BrowserWindow, WebContentsView } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url';
import { getWindowState } from './utils/index.ts';
import { useIpcEvent } from './ipcMessage/index.ts';
import { bindMainProcessGlobalShortCut } from './shortcut/index.ts';
import { overrideBrowserWindow } from './override/index.ts';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
|--------------------------------------------------------------------------
| 创建窗口
|--------------------------------------------------------------------------
*/
const createWindow = () => {
  // 创建主窗口
  const mainWindow = new BrowserWindow({
    frame: false,
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
    },
  })
  // 创建主内容视图
  const contentView = new WebContentsView({
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: true,
    },
  })
  // 添加子视图
  mainWindow.contentView.addChildView(topBarView);
  mainWindow.contentView.addChildView(contentView);

  // 设置顶部栏位置和大小
  const windowBounds = mainWindow.getBounds();
  topBarView.setBounds({ x: 0, y: 0, width: windowBounds.width, height: 35 })

  // 设置主内容位置和大小（在顶部栏下方）
  contentView.setBounds({
    x: 0,
    y: 35,
    width: windowBounds.width,
    height: windowBounds.height - 35
  })

  // 加载内容 - 根据 __MODE__ 变量决定加载方式
  if (__MODE__ === 'standalone' && __COMMAND__ === 'build') {
    const headerFilePath = path.join(__dirname, '../renderer/header.html');
    const indexFilePath = path.join(__dirname, '../renderer/index.html');
    topBarView.webContents.loadFile(headerFilePath);
    contentView.webContents.loadFile(indexFilePath);
  } else {
    topBarView.webContents.loadURL('http://localhost:3000/header.html');
    contentView.webContents.loadURL('http://localhost:3000/index.html');
    topBarView.webContents.on('did-finish-load', () => {
      topBarView.webContents.openDevTools({ mode: 'detach' })
    })
    contentView.webContents.openDevTools({ mode: 'bottom' })
  }

  return {
    mainWindow,
    topBarView,
    contentView
  };
}
/*
|--------------------------------------------------------------------------
| 主进程启动
|--------------------------------------------------------------------------
*/
app.whenReady().then(() => {
  const { mainWindow, topBarView, contentView } = createWindow()
  const { broadcastWindowState } = useIpcEvent(mainWindow, topBarView, contentView);
  bindMainProcessGlobalShortCut(mainWindow, topBarView, contentView);
  // 窗口状态变化时的视图布局调整
  const updateViewLayout = () => {
    const windowBounds = mainWindow.getBounds();
    const windowState = getWindowState(mainWindow);
    topBarView.setBounds({ x: 0, y: 0, width: windowBounds.width, height: 35 });
    contentView.setBounds({ x: 0, y: 35, width: windowBounds.width, height: windowBounds.height - 35 });
    broadcastWindowState(windowState);
  };
  mainWindow.on('minimize', updateViewLayout);
  mainWindow.on('maximize', updateViewLayout);
  mainWindow.on('unmaximize', updateViewLayout);
  mainWindow.on('restore', updateViewLayout);
  mainWindow.on('resize', updateViewLayout);
  mainWindow.maximize()

  //重写默认逻辑
  overrideBrowserWindow(mainWindow, contentView, topBarView);
}).catch((error) => {
  console.error('Error during app initialization:', error);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

