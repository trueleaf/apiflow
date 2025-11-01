import { logger } from '@/utils/logger';

class SettingsCache {
  constructor() {
  }
  // 设置缓存管理信息
  setCacheManagerInfo(cacheInfo: { indexedDBSize: number; indexedDBDetails: unknown[] }) {
    try {
      const cacheData = {
        indexedDBSize: cacheInfo.indexedDBSize,
        indexedDBDetails: cacheInfo.indexedDBDetails,
        timestamp: Date.now()
      };
      localStorage.setItem('settings/cacheManager/info', JSON.stringify(cacheData));
    } catch (error) {
      logger.error('设置缓存信息失败', { error });
    }
  }
  // 获取缓存管理信息
  getCacheManagerInfo(): { indexedDBSize: number; indexedDBDetails: unknown[] } | null {
    try {
      const cacheData = localStorage.getItem('settings/cacheManager/info');
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
      localStorage.removeItem('settings/cacheManager/info');
    } catch (error) {
      logger.error('清除缓存信息失败', { error });
    }
  }
}

export const settingsCache = new SettingsCache();
