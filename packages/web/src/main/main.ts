import { app, BrowserWindow, WebContentsView, protocol, net } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url';
import fs from 'fs';
import { getWindowState } from './utils/index.ts';
import { useIpcEvent } from './ipcMessage/index.ts';
import { bindMainProcessGlobalShortCut } from './shortcut/index.ts';
import { overrideBrowserWindow } from './override/index.ts';
import { WebSocketManager } from './websocket/websocket.ts';
import { HttpMockManager } from './mock/httpMock/httpMockManager.ts';
import { mainConfig } from '@src/config/mainConfig';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 注册自定义协议的 scheme privileges（必须在 app.ready 之前）
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: false
    }
  }
]);

// 创建全局实例
export const mockManager = new HttpMockManager();
export const webSocketManager = new WebSocketManager();

// 导出 contentView 供其他模块使用
export let contentViewInstance: WebContentsView | null = null;

// 单实例锁变量，用于存储主窗口引用
let mainWindowInstance: BrowserWindow | null = null;

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
    topBarView.webContents.loadURL('app://header.html');
    contentView.webContents.loadURL('app://index.html');
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
// 获取单实例锁（测试环境下禁用）
const isTestEnv = process.env.NODE_ENV === 'test';
const gotTheLock = isTestEnv ? true : app.requestSingleInstanceLock();

if (!gotTheLock) {
  // 如果没有获得锁，说明已经有实例在运行，直接退出
  app.quit();
} else {
  // 当第二个实例尝试启动时，激活第一个实例的窗口（测试环境下不需要）
  if (!isTestEnv) {
    app.on('second-instance', () => {
      if (mainWindowInstance) {
        if (mainWindowInstance.isMinimized()) {
          mainWindowInstance.restore();
        }
        mainWindowInstance.focus();
      }
    });
  }

  app.whenReady().then(() => {
    protocol.handle('app', async (request) => {
      let url = request.url.slice(6);
      if (url.endsWith('/')) {
        url = url.slice(0, -1);
      }
      url = url.replace(/^(header|index)\.html\//, '');
      
      let filePath = path.join(__dirname, '../renderer', url);
      filePath = path.normalize(filePath);
      
      if (/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico|json|mjs|map)$/i.test(filePath)) {
        if (fs.existsSync(filePath)) {
          return net.fetch(`file://${filePath}`);
        } else {
          return new Response('Not Found', { status: 404 });
        }
      }
      if (filePath.endsWith('.html') && fs.existsSync(filePath)) {
        return net.fetch(`file://${filePath}`);
      }
      const indexPath = path.join(__dirname, '../renderer/index.html');
      return net.fetch(`file://${indexPath}`);
    });
    const { mainWindow, topBarView, contentView } = createWindow();
    // 保存主窗口引用，用于单实例锁激活
    mainWindowInstance = mainWindow;
    // 保存 contentView 引用供其他模块使用
    contentViewInstance = contentView;
    
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
    mainWindow.maximize();

    //重写默认逻辑
    overrideBrowserWindow(mainWindow, contentView, topBarView);
  }).catch((error) => {
    console.error('Error during app initialization:', error);
  });
}

app.on('window-all-closed', () => {
  // 清理WebSocket连接
  webSocketManager.cleanup();
  if (process.platform !== 'darwin') app.quit()
})

