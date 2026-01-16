declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const MEASUREMENT_ID = 'G-7GB2601HMR';

// 检查是否满足加载条件：生产环境 + 在线模式 + 用户同意
const shouldLoadAnalytics = (): boolean => {
  if (import.meta.env.DEV) {
    return false;
  }
  try {
    const networkMode = localStorage.getItem('runtime/networkMode');
    if (networkMode !== 'online') {
      return false;
    }
    const enabled = localStorage.getItem('runtime/analyticsEnabled');
    return enabled === 'true';
  } catch {
    return false;
  }
};
// 动态加载 Google Analytics 脚本
export const loadAnalytics = (): void => {
  if (!shouldLoadAnalytics()) {
    return;
  }
  if (window.gtag) {
    return;
  }
  try {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, {
      send_page_view: false,
    });
  } catch (error) {
    console.error('加载 Analytics 失败:', error);
  }
};
// 卸载 Analytics（用户关闭时）
export const unloadAnalytics = (): void => {
  if (!window.gtag) {
    return;
  }
  try {
    window.gtag('config', MEASUREMENT_ID, {
      send_page_view: false,
      analytics_storage: 'denied',
    });
  } catch (error) {
    console.error('卸载 Analytics 失败:', error);
  }
};
// 发送页面浏览事件
export const trackPageView = (pagePath: string, pageTitle?: string): void => {
  if (!shouldLoadAnalytics() || !window.gtag) {
    return;
  }
  try {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle || document.title,
    });
  } catch (error) {
    console.error('发送页面浏览事件失败:', error);
  }
};
// 发送自定义事件
export const trackEvent = (eventName: string, eventParams?: Record<string, unknown>): void => {
  if (!shouldLoadAnalytics() || !window.gtag) {
    return;
  }
  try {
    window.gtag('event', eventName, eventParams);
  } catch (error) {
    console.error('发送事件失败:', error);
  }
};
