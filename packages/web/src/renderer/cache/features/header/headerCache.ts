import type { AppWorkbenchHeaderTab } from '@src/types/appWorkbench/appWorkbenchType';
class HeaderCache {
  // 设置header tabs
  setHeaderTabs(tabs: AppWorkbenchHeaderTab[]) {
    try {
      localStorage.setItem('features/header/tabs', JSON.stringify(tabs));
    } catch (error) {
      console.error(error);
      localStorage.setItem('features/header/tabs', '[]');
    }
  }

  // 获取header tabs
  getHeaderTabs(): AppWorkbenchHeaderTab[] {
    try {
      return JSON.parse(localStorage.getItem('features/header/tabs') || '[]');
    } catch (error) {
      console.error(error);
      localStorage.setItem('features/header/tabs', '[]');
      return [];
    }
  }

  // 设置header当前活跃的tab
  setHeaderActiveTab(tabId: string) {
    try {
      localStorage.setItem('features/header/activeTab', tabId);
    } catch (error) {
      console.error(error);
      localStorage.setItem('features/header/activeTab', '');
    }
  }

  // 获取header当前活跃的tab
  getHeaderActiveTab(): string {
    try {
      return localStorage.getItem('features/header/activeTab') || '';
    } catch (error) {
      console.error(error);
      localStorage.setItem('features/header/activeTab', '');
      return '';
    }
  }
}

export const headerCache = new HeaderCache();
