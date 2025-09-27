import { BrowserWindow, globalShortcut, WebContentsView, app } from 'electron';
import { webSocketManager } from '../main.ts';

/**
 * 快捷键管理器
 * 处理页面刷新快捷键的注册、注销和执行
 */
class ShortcutManager {
  private mainWindow: BrowserWindow;
  private topBarView: WebContentsView;
  private contentView: WebContentsView;
  private isShortcutRegistered = false;

  constructor(mainWindow: BrowserWindow, topBarView: WebContentsView, contentView: WebContentsView) {
    this.mainWindow = mainWindow;
    this.topBarView = topBarView;
    this.contentView = contentView;

    this.setupEventListeners();
    this.setupAppExitHandler();
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners() {
    // 窗口获得焦点时注册快捷键
    this.mainWindow.on('focus', () => {
      this.registerShortcuts();
    });

    // 窗口失去焦点时注销快捷键
    this.mainWindow.on('blur', () => {
      this.unregisterShortcuts();
    });

    // 窗口最小化时注销快捷键
    this.mainWindow.on('minimize', () => {
      this.unregisterShortcuts();
    });

    // 窗口关闭时清理快捷键
    this.mainWindow.on('closed', () => {
      this.unregisterShortcuts();
    });
    
  }

  /**
   * 设置应用退出时的清理处理
   */
  private setupAppExitHandler() {
    app.on('before-quit', () => {
      this.unregisterShortcuts();
    });
  }

  /**
   * 注册快捷键
   */
  private registerShortcuts() {
    if (this.isShortcutRegistered) {
      return;
    }

    try {
      // 注册普通刷新快捷键 (Ctrl+R / Cmd+R)
      const reloadSuccess = globalShortcut.register('CommandOrControl+R', () => {
        this.handleReload(false);
      });

      // 注册强制刷新快捷键 (Ctrl+Shift+R / Cmd+Shift+R)
      const forceReloadSuccess = globalShortcut.register('CommandOrControl+Shift+R', () => {
        this.handleReload(true);
      });

      // 注册开发者工具快捷键 (Ctrl+Shift+I / Cmd+Option+I)
      const devToolsCtrlShiftISuccess = globalShortcut.register('CommandOrControl+Shift+I', () => {
        this.handleToggleDevTools();
      });

      if (reloadSuccess && forceReloadSuccess && devToolsCtrlShiftISuccess) {
        this.isShortcutRegistered = true;
      } else {
        console.warn('部分快捷键注册失败，可能与其他应用冲突');
      }
    } catch (error) {
      console.error('快捷键注册失败:', error);
    }
  }

  /**
   * 注销快捷键
   */
  private unregisterShortcuts() {
    if (!this.isShortcutRegistered) {
      return;
    }

    try {
      globalShortcut.unregister('CommandOrControl+R');
      globalShortcut.unregister('CommandOrControl+Shift+R');
      globalShortcut.unregister('F12');
      globalShortcut.unregister('CommandOrControl+Shift+I');
      this.isShortcutRegistered = false;
    } catch (error) {
      console.error('快捷键注销失败:', error);
    }
  }

  /**
   * 处理开发者工具切换
   */
  private handleToggleDevTools() {
    try {
      this.contentView.webContents.openDevTools({ mode: 'bottom' })
      this.topBarView.webContents.openDevTools({ mode: 'detach' })
    } catch (error) {
      console.error('开发者工具切换失败:', error);
    }
  }

  /**
   * 处理页面刷新
   * @param forceRecreate 是否释放内存完全重新加载
   */
  private handleReload(forceRecreate: boolean = false) {
    webSocketManager.clearAllConnections()
    if (forceRecreate) {
      // 在开发模式下，不使用 app.relaunch() 避免终止 Vite 服务器
      // 而是通过强制重新加载所有 WebContents 来实现类似效果
      if (__COMMAND__ === 'build') {
        // 生产模式下可以安全使用 relaunch
        app.relaunch();
        app.exit(0);
      } else {
        // 开发模式下使用强制刷新替代重启
        this.contentView.webContents.reloadIgnoringCache();
        this.topBarView.webContents.reloadIgnoringCache();
        this.mainWindow.webContents.reloadIgnoringCache();
        
        // 清理一些可能的缓存和状态
        this.contentView.webContents.session.clearCache();
        this.topBarView.webContents.session.clearCache();
        this.mainWindow.webContents.session.clearCache();
      }
    } else {
      this.contentView.webContents.reloadIgnoringCache();
      this.topBarView.webContents.reloadIgnoringCache();
      this.mainWindow.webContents.reloadIgnoringCache();
      // 清理一些可能的缓存和状态
      this.contentView.webContents.session.clearCache();
      this.topBarView.webContents.session.clearCache();
      this.mainWindow.webContents.session.clearCache();

    }
  }

  /**
   * 获取当前具有焦点的视图
   * @returns 具有焦点的视图，如果无法确定则返回null
   */
  private getFocusedView(): WebContentsView | null {
    try {
      // 检查主内容视图是否有焦点
      if (this.contentView.webContents.isFocused()) {
        return this.contentView;
      }

      // 检查顶部栏视图是否有焦点
      if (this.topBarView.webContents.isFocused()) {
        return this.topBarView;
      }

      // 如果都没有焦点，返回null
      return null;
    } catch (error) {
      console.error('检测视图焦点时出错:', error);
      return null;
    }
  }

  /**
   * 手动刷新指定视图
   * @param viewType 视图类型：'topBar' | 'mainContent'
   * @param ignoreCache 是否忽略缓存
   */
  public manualReload(viewType: 'topBar' | 'mainContent', ignoreCache: boolean = false) {
    try {
      const targetView = viewType === 'topBar' ? this.topBarView : this.contentView;
      const reloadMethod = ignoreCache ? 'reloadIgnoringCache' : 'reload';

      targetView.webContents[reloadMethod]();
    } catch (error) {
      console.error(`手动刷新${viewType}View失败:`, error);
    }
  }

  /**
   * 手动切换开发者工具
   * @param viewType 视图类型：'topBar' | 'mainContent'
   */
  public manualToggleDevTools(viewType: 'topBar' | 'mainContent') {
    try {
      const targetView = viewType === 'topBar' ? this.topBarView : this.contentView;

      if (targetView.webContents.isDevToolsOpened()) {
        targetView.webContents.closeDevTools();
      } else {
        const mode = viewType === 'topBar' ? 'detach' : 'bottom';
        targetView.webContents.openDevTools({ mode });
      }
    } catch (error) {
      console.error(`手动切换${viewType}View开发者工具失败:`, error);
    }
  }

  /**
   * 获取快捷键状态
   */
  public getStatus() {
    return {
      isRegistered: this.isShortcutRegistered,
      shortcuts: [
        'CommandOrControl+R',           // 刷新
        'CommandOrControl+Shift+R',     // 强制刷新
        'F12',                          // 开发者工具
        'CommandOrControl+Shift+I'      // 开发者工具
      ],
      focusedView: this.getFocusedView() === this.topBarView ? 'topBar' :
                   this.getFocusedView() === this.contentView ? 'mainContent' : 'none'
    };
  }
}

// 全局快捷键管理器实例
let shortcutManager: ShortcutManager | null = null;

/**
 * 绑定主进程全局快捷键
 * @param mainWindow 主窗口
 * @param topBarView 顶部栏视图
 * @param contentView 主内容视图
 */
export const bindMainProcessGlobalShortCut = (
  mainWindow: BrowserWindow,
  topBarView: WebContentsView,
  contentView: WebContentsView
) => {
  // 如果已经存在管理器，先清理
  if (shortcutManager) {
    shortcutManager = null;
  }

  // 创建新的快捷键管理器
  shortcutManager = new ShortcutManager(mainWindow, topBarView, contentView);

  return shortcutManager;
};

/**
 * 获取快捷键管理器实例（用于调试和手动操作）
 */
export const getShortcutManager = () => shortcutManager;
