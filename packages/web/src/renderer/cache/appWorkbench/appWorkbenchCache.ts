// App Workbench 缓存管理
import type { AppWorkbenchHeaderTab } from '@src/types/appWorkbench/appWorkbenchType';
import { logger } from '@/helper';
import { cacheKey } from '../cacheKey';
class AppWorkbenchCache {
  // 设置header tabs
  setAppWorkbenchHeaderTabs(tabs: AppWorkbenchHeaderTab[]) {
    try {
      localStorage.setItem(cacheKey.appWorkbench.header.tabs, JSON.stringify(tabs));
    } catch (error) {
      logger.error('保存AppWorkbench页签失败', { error });
      localStorage.setItem(cacheKey.appWorkbench.header.tabs, '[]');
    }
  }
  // 获取header tabs
  getAppWorkbenchHeaderTabs(): AppWorkbenchHeaderTab[] {
    try {
      return JSON.parse(localStorage.getItem(cacheKey.appWorkbench.header.tabs) || '[]');
    } catch (error) {
      logger.error('获取AppWorkbench页签失败', { error });
      localStorage.setItem(cacheKey.appWorkbench.header.tabs, '[]');
      return [];
    }
  }
  // 设置header当前活跃的tab
  setAppWorkbenchHeaderActiveTab(tabId: string) {
    try {
      localStorage.setItem(cacheKey.appWorkbench.header.activeTab, tabId);
    } catch (error) {
      logger.error('保存AppWorkbench活跃页签失败', { error });
      localStorage.setItem(cacheKey.appWorkbench.header.activeTab, '');
    }
  }
  // 获取header当前活跃的tab
  getAppWorkbenchHeaderActiveTab(): string {
    try {
      return localStorage.getItem(cacheKey.appWorkbench.header.activeTab) || '';
    } catch (error) {
      logger.error('获取AppWorkbench活跃页签失败', { error });
      localStorage.setItem(cacheKey.appWorkbench.header.activeTab, '');
      return '';
    }
  }
}
export const appWorkbenchCache = new AppWorkbenchCache();
