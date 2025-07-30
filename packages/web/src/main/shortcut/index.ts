import { BrowserWindow, globalShortcut, WebContentsView, app } from 'electron';

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

      // 注册开发者工具快捷键 (F12)
      const devToolsF12Success = globalShortcut.register('F12', () => {
        console.log('f12')
        this.handleToggleDevTools();
      });

      // 注册开发者工具快捷键 (Ctrl+Shift+I / Cmd+Option+I)
      const devToolsCtrlShiftISuccess = globalShortcut.register('CommandOrControl+Shift+I', () => {
        this.handleToggleDevTools();
      });

      if (reloadSuccess && forceReloadSuccess && devToolsF12Success && devToolsCtrlShiftISuccess) {
        this.isShortcutRegistered = true;
      } else {
        console.warn('⚠️ 部分快捷键注册失败，可能与其他应用冲突');
      }
    } catch (error) {
      console.error('❌ 快捷键注册失败:', error);
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
      console.error('❌ 快捷键注销失败:', error);
    }
  }

  /**
   * 处理开发者工具切换
   */
  private handleToggleDevTools() {
    try {
      this.contentView.webContents.openDevTools({ mode: 'detach' })
      this.topBarView.webContents.openDevTools({ mode: 'bottom' })
    } catch (error) {
      console.error('❌ 开发者工具切换失败:', error);
    }
  }

  /**
   * 处理页面刷新
   * @param ignoreCache 是否忽略缓存（强制刷新）
   */
  private handleReload(ignoreCache: boolean = false) {
    if (ignoreCache) {
      this.contentView.webContents.reloadIgnoringCache();
      this.topBarView.webContents.reloadIgnoringCache();
      this.mainWindow.webContents.reloadIgnoringCache();
    } else {
      this.contentView.webContents.reload();
      this.topBarView.webContents.reload();
      this.mainWindow.webContents.reload();
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
      console.error('❌ 检测视图焦点时出错:', error);
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
      console.error(`❌ 手动刷新${viewType}View失败:`, error);
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
      console.error(`❌ 手动切换${viewType}View开发者工具失败:`, error);
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
