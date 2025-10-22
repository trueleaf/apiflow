// App Workbench 缓存管理
import type { AppWorkbenchHeaderTab } from '@src/types/appWorkbench/appWorkbenchType';
class AppWorkbenchCache {
  // 设置header tabs
  setAppWorkbenchHeaderTabs(tabs: AppWorkbenchHeaderTab[]) {
    try {
      localStorage.setItem('appWorkbench/header/tabs', JSON.stringify(tabs));
    } catch (error) {
      localStorage.setItem('appWorkbench/header/tabs', '[]');
    }
  }
  // 获取header tabs
  getAppWorkbenchHeaderTabs(): AppWorkbenchHeaderTab[] {
    try {
      return JSON.parse(localStorage.getItem('appWorkbench/header/tabs') || '[]');
    } catch (error) {
      localStorage.setItem('appWorkbench/header/tabs', '[]');
      return [];
    }
  }
  // 设置header当前活跃的tab
  setAppWorkbenchHeaderActiveTab(tabId: string) {
    try {
      localStorage.setItem('appWorkbench/header/activeTab', tabId);
    } catch (error) {
      localStorage.setItem('appWorkbench/header/activeTab', '');
    }
  }
  // 获取header当前活跃的tab
  getAppWorkbenchHeaderActiveTab(): string {
    try {
      return localStorage.getItem('appWorkbench/header/activeTab') || '';
    } catch (error) {
      localStorage.setItem('appWorkbench/header/activeTab', '');
      return '';
    }
  }
}
export const appWorkbenchCache = new AppWorkbenchCache();
