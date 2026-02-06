import { WebContentsView } from 'electron';
import { generateErrorPageHtml } from '../errorPage/errorPage.ts';

// 加载状态类型
type ContentViewLoadState = 'idle' | 'loading' | 'loaded' | 'failed';
// 加载失败信息
type LoadFailureInfo = {
  errorCode: number;
  errorDescription: string;
  validatedURL: string;
  timestamp: number;
};
// 生命周期管理器配置
type LifecycleConfig = {
  loadTimeout: number;       // 加载超时时间（毫秒）
  maxRetries: number;        // 最大重试次数
  retryDelay: number;        // 重试延迟（毫秒）
};
// 默认配置
const DEFAULT_CONFIG: LifecycleConfig = {
  loadTimeout: 30000,  // 30秒超时
  maxRetries: 2,       // 最多重试2次
  retryDelay: 2000,    // 重试延迟2秒
};
// 内部状态
let contentView: WebContentsView | null = null;
let loadState: ContentViewLoadState = 'idle';
let failureInfo: LoadFailureInfo | null = null;
let loadTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
let retryDelayTimer: ReturnType<typeof setTimeout> | null = null;
let retryCount = 0;
let isShowingErrorPage = false;
let currentUrl = '';
let fallbackUrl = '';
let config: LifecycleConfig = { ...DEFAULT_CONFIG };
let onLoadSuccessCallback: (() => void) | null = null;
let onLoadFailureCallback: ((info: LoadFailureInfo) => void) | null = null;
// 初始化生命周期管理器
export const initContentViewLifecycle = (
  view: WebContentsView,
  localFallbackUrl: string,
  customConfig?: Partial<LifecycleConfig>
) => {
  contentView = view;
  fallbackUrl = localFallbackUrl;
  config = { ...DEFAULT_CONFIG, ...customConfig };
  retryCount = 0;
  loadState = 'idle';
  failureInfo = null;
  // 注册 WebContents 事件
  registerWebContentsEvents();
};
// 注册 WebContents 加载事件
const registerWebContentsEvents = () => {
  if (!contentView) return;
  const webContents = contentView.webContents;
  // 开始加载
  webContents.on('did-start-loading', handleStartLoading);
  // 加载完成
  webContents.on('did-finish-load', handleFinishLoad);
  // 加载失败
  webContents.on('did-fail-load', handleFailLoad);
  // 页面崩溃
  webContents.on('render-process-gone', handleRenderProcessGone);
};
// 处理开始加载
const handleStartLoading = () => {
  // 错误页 loadURL 触发的 did-start-loading，跳过状态重置
  if (isShowingErrorPage) return;
  loadState = 'loading';
  failureInfo = null;
  startLoadTimeout();
};
// 处理加载完成
const handleFinishLoad = () => {
  clearLoadTimeout();
  if (isShowingErrorPage) {
    isShowingErrorPage = false;
    return;
  }
  loadState = 'loaded';
  retryCount = 0;
  onLoadSuccessCallback?.();
};
// 处理加载失败
const handleFailLoad = (
  _event: Electron.Event,
  errorCode: number,
  errorDescription: string,
  validatedURL: string,
  isMainFrame: boolean
) => {
  // 只处理主框架的加载失败
  if (!isMainFrame) return;
  // 忽略取消的请求 (ERR_ABORTED)
  if (errorCode === -3) return;
  clearLoadTimeout();
  loadState = 'failed';
  failureInfo = {
    errorCode,
    errorDescription,
    validatedURL,
    timestamp: Date.now(),
  };
  // 尝试重试
  if (retryCount < config.maxRetries) {
    retryCount++;
    retryDelayTimer = setTimeout(() => {
      retryDelayTimer = null;
      retryLoad();
    }, config.retryDelay);
    return;
  }
  // 重试次数用尽，显示错误页面
  const savedInfo = failureInfo;
  showErrorPage();
  if (savedInfo) onLoadFailureCallback?.(savedInfo);
};
// 处理渲染进程崩溃
const handleRenderProcessGone = (_event: Electron.Event, details: Electron.RenderProcessGoneDetails) => {
  clearLoadTimeout();
  loadState = 'failed';
  failureInfo = {
    errorCode: -1,
    errorDescription: `Render process gone: ${details.reason}`,
    validatedURL: currentUrl,
    timestamp: Date.now(),
  };
  const savedInfo = failureInfo;
  showErrorPage();
  if (savedInfo) onLoadFailureCallback?.(savedInfo);
};
// 开始加载超时计时器
const startLoadTimeout = () => {
  clearLoadTimeout();
  loadTimeoutTimer = setTimeout(() => {
    if (loadState === 'loading') {
      // 停止当前加载
      contentView?.webContents.stop();
      loadState = 'failed';
      failureInfo = {
        errorCode: -7,  // ERR_TIMED_OUT
        errorDescription: 'Page load timeout',
        validatedURL: currentUrl,
        timestamp: Date.now(),
      };
      // 显示错误页面
      const savedInfo = failureInfo;
      showErrorPage();
      if (savedInfo) onLoadFailureCallback?.(savedInfo);
    }
  }, config.loadTimeout);
};
// 清除加载超时计时器
const clearLoadTimeout = () => {
  if (loadTimeoutTimer) {
    clearTimeout(loadTimeoutTimer);
    loadTimeoutTimer = null;
  }
};
// 清除重试延迟计时器
const clearRetryDelayTimer = () => {
  if (retryDelayTimer) {
    clearTimeout(retryDelayTimer);
    retryDelayTimer = null;
  }
};
// 重试加载
const retryLoad = () => {
  if (!contentView || !currentUrl) return;
  contentView.webContents.loadURL(currentUrl);
};
// 显示错误页面
const showErrorPage = () => {
  if (!contentView || !failureInfo) return;
  const errorHtml = generateErrorPageHtml({
    errorCode: failureInfo.errorCode,
    errorDescription: failureInfo.errorDescription,
    failedUrl: failureInfo.validatedURL,
    retryCount,
    maxRetries: config.maxRetries,
  });
  // 标记正在显示错误页，防止 loadURL 触发的 did-start-loading 重置状态
  isShowingErrorPage = true;
  contentView.webContents.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`);
};
// 手动重试加载原URL
export const manualRetry = () => {
  if (!contentView || !currentUrl) return;
  isShowingErrorPage = false;
  retryCount = 0;
  loadState = 'idle';
  failureInfo = null;
  contentView.webContents.loadURL(currentUrl);
};
// 降级到本地版本
export const fallbackToLocal = () => {
  if (!contentView || !fallbackUrl) return;
  isShowingErrorPage = false;
  retryCount = 0;
  loadState = 'idle';
  failureInfo = null;
  currentUrl = fallbackUrl;
  contentView.webContents.loadURL(fallbackUrl);
};
// 加载URL（替代直接调用 webContents.loadURL）
export const loadUrl = (url: string) => {
  if (!contentView) return;
  isShowingErrorPage = false;
  currentUrl = url;
  retryCount = 0;
  contentView.webContents.loadURL(url);
};
// 获取当前加载状态
export const getLoadState = (): ContentViewLoadState => loadState;
// 检查是否已加载完成
export const isContentViewReady = (): boolean => loadState === 'loaded';
// 检查是否加载失败
export const isContentViewFailed = (): boolean => loadState === 'failed';
// 获取失败信息
export const getFailureInfo = (): LoadFailureInfo | null => failureInfo;
// 获取当前URL
export const getCurrentUrl = (): string => currentUrl;
// 获取降级URL
export const getFallbackUrl = (): string => fallbackUrl;
// 设置加载成功回调
export const onLoadSuccess = (callback: () => void) => {
  onLoadSuccessCallback = callback;
};
// 设置加载失败回调
export const onLoadFailure = (callback: (info: LoadFailureInfo) => void) => {
  onLoadFailureCallback = callback;
};
// 重置状态（用于刷新场景）
export const resetLoadState = () => {
  clearLoadTimeout();
  isShowingErrorPage = false;
  loadState = 'idle';
  failureInfo = null;
  retryCount = 0;
};
// 销毁生命周期管理器
export const destroyContentViewLifecycle = () => {
  clearLoadTimeout();
  clearRetryDelayTimer();
  if (contentView) {
    const webContents = contentView.webContents;
    webContents.removeListener('did-start-loading', handleStartLoading);
    webContents.removeListener('did-finish-load', handleFinishLoad);
    webContents.removeListener('did-fail-load', handleFailLoad);
    webContents.removeListener('render-process-gone', handleRenderProcessGone);
  }
  contentView = null;
  loadState = 'idle';
  failureInfo = null;
  isShowingErrorPage = false;
  retryCount = 0;
  currentUrl = '';
  onLoadSuccessCallback = null;
  onLoadFailureCallback = null;
};
