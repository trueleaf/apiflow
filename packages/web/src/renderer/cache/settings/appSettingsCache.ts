import type { AppTheme } from '@src/types';
import { config } from '@src/config/config';
import { logger } from '@/helper';
import { cacheKey } from '../cacheKey';
class AppSettingsCache {
  constructor() {
  }
  // 获取应用标题
  getAppTitle(): string {
    try {
      const title = localStorage.getItem(cacheKey.settings.app.title);
      return title || config.appConfig.appTitle;
    } catch (error) {
      logger.error('获取应用标题失败', { error });
      return config.appConfig.appTitle;
    }
  }
  // 设置应用标题
  setAppTitle(title: string) {
    try {
      localStorage.setItem(cacheKey.settings.app.title, title);
    } catch (error) {
      logger.error('设置应用标题失败', { error });
    }
  }
  // 重置应用标题
  resetAppTitle() {
    try {
      localStorage.removeItem(cacheKey.settings.app.title);
    } catch (error) {
      logger.error('重置应用标题失败', { error });
    }
  }
  // 获取应用Logo
  getAppLogo(): string {
    try {
      const logo = localStorage.getItem(cacheKey.settings.app.logo);
      return logo || config.appConfig.appLogo;
    } catch (error) {
      logger.error('获取应用Logo失败', { error });
      return config.appConfig.appLogo;
    }
  }
  // 设置应用Logo
  setAppLogo(logo: string) {
    try {
      localStorage.setItem(cacheKey.settings.app.logo, logo);
    } catch (error) {
      logger.error('设置应用Logo失败', { error });
    }
  }
  // 重置应用Logo
  resetAppLogo() {
    try {
      localStorage.removeItem(cacheKey.settings.app.logo);
    } catch (error) {
      logger.error('重置应用Logo失败', { error });
    }
  }
  // 获取应用主题
  getAppTheme(): AppTheme {
    try {
      const theme = localStorage.getItem(cacheKey.settings.app.theme);
      if (theme === 'light' || theme === 'dark' || theme === 'auto') {
        return theme;
      }
      return config.appConfig.appTheme;
    } catch (error) {
      logger.error('获取应用主题失败', { error });
      return config.appConfig.appTheme;
    }
  }
  // 设置应用主题
  setAppTheme(theme: AppTheme) {
    try {
      localStorage.setItem(cacheKey.settings.app.theme, theme);
    } catch (error) {
      logger.error('设置应用主题失败', { error });
    }
  }
  // 重置应用主题
  resetAppTheme() {
    try {
      localStorage.removeItem(cacheKey.settings.app.theme);
    } catch (error) {
      logger.error('重置应用主题失败', { error });
    }
  }
  // 设置缓存管理信息
  setCacheManagerInfo(cacheInfo: { indexedDBSize: number; indexedDBDetails: unknown[] }) {
    try {
      const cacheData = {
        indexedDBSize: cacheInfo.indexedDBSize,
        indexedDBDetails: cacheInfo.indexedDBDetails,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey.settings.cacheManager.info, JSON.stringify(cacheData));
    } catch (error) {
      logger.error('设置缓存信息失败', { error });
    }
  }
  // 获取缓存管理信息
  getCacheManagerInfo(): { indexedDBSize: number; indexedDBDetails: unknown[] } | null {
    try {
      const cacheData = localStorage.getItem(cacheKey.settings.cacheManager.info);
      if (!cacheData) {
        return null;
      }
      const parsedData = JSON.parse(cacheData);
      return {
        indexedDBSize: parsedData.indexedDBSize || -1,
        indexedDBDetails: parsedData.indexedDBDetails || []
      };
    } catch (error) {
      logger.error('获取缓存信息失败', { error });
      return null;
    }
  }
  // 清除缓存管理信息
  clearCacheManagerInfo() {
    try {
      localStorage.removeItem(cacheKey.settings.cacheManager.info);
    } catch (error) {
      logger.error('清除缓存信息失败', { error });
    }
  }
}
export const appSettingsCache = new AppSettingsCache();