import { app, BrowserWindow, WebContentsView } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url';
import { getWindowState } from './utils/index.ts';
import { useIpcEvent } from './ipcMessage/index.ts';
import { bindMainProcessGlobalShortCut } from './shortcut/index.ts';
import { overrideBrowserWindow } from './override/index.ts';
import { WebSocketManager } from './websocket/websocket.ts';
import { MockManager } from './mock/mockManager.ts';
import { mainConfig } from '@src/config/mainConfig';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建全局实例
export const mockManager = new MockManager();
export const webSocketManager = new WebSocketManager();

/*
|--------------------------------------------------------------------------
| 创建窗口
|--------------------------------------------------------------------------
*/
const createWindow = () => {
  // 创建主窗口
  const mainWindow = new BrowserWindow({
    frame: false,
    minWidth: mainConfig.minWidth,
    minHeight: mainConfig.minHeight,
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
  const windowBounds = mainWindow.getContentBounds();
  topBarView.setBounds({ x: 0, y: 0, width: windowBounds.width, height: mainConfig.topbarViewHeight })

  // 设置主内容位置和大小（在顶部栏下方）
  contentView.setBounds({
    x: 0,
    y: mainConfig.topbarViewHeight,
    width: windowBounds.width,
    height: windowBounds.height - mainConfig.topbarViewHeight
  })

  // 加载内容 - 根据构建命令决定加载方式
  if (__COMMAND__ === 'build') {
    const headerFilePath = path.join(__dirname, '../renderer/header.html');
    const indexFilePath = path.join(__dirname, '../renderer/index.html');
    topBarView.webContents.loadFile(headerFilePath);
    contentView.webContents.loadFile(indexFilePath);
  } else {
    topBarView.webContents.loadURL('http://localhost:4000/header.html');
    contentView.webContents.loadURL('http://localhost:4000');
    topBarView.webContents.on('did-finish-load', () => {
      // topBarView.webContents.openDevTools({ mode: 'detach' })
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
    const windowBounds = mainWindow.getContentBounds();
    const windowState = getWindowState(mainWindow);
    topBarView.setBounds({ x: 0, y: 0, width: windowBounds.width, height: mainConfig.topbarViewHeight });
    contentView.setBounds({ x: 0, y: mainConfig.topbarViewHeight, width: windowBounds.width, height: windowBounds.height - mainConfig.topbarViewHeight });
    broadcastWindowState(windowState);
  };
  mainWindow.on('minimize', updateViewLayout);
  mainWindow.on('maximize', updateViewLayout);
  mainWindow.on('unmaximize', () => {
    updateViewLayout();
    mainWindow.center(); // 窗口取消最大化时居中显示
  });
  mainWindow.on('restore', updateViewLayout);
    mainWindow.on('resize', () => {
    const windowBounds = mainWindow.getBounds();
    topBarView.setBounds({ x: 0, y: 0, width: windowBounds.width, height: mainConfig.topbarViewHeight });
    contentView.setBounds({ x: 0, y: mainConfig.topbarViewHeight, width: windowBounds.width, height: windowBounds.height - mainConfig.topbarViewHeight });
  });
  mainWindow.maximize()

  //重写默认逻辑
  overrideBrowserWindow(mainWindow, contentView, topBarView);
}).catch((error) => {
  console.error('Error during app initialization:', error);
});

app.on('window-all-closed', () => {
  // 清理WebSocket连接
  webSocketManager.cleanup();
  if (process.platform !== 'darwin') app.quit()
})

