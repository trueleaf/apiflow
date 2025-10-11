/**
 * 工作区缓存
 */

class WorkbenchCache {
  constructor() {
  }

  // 获取工作区tabs
  getWorkbenchTabs(): Record<string, any[]> {
    try {
      const localData = JSON.parse(localStorage.getItem('workbench/node/tabs') || '{}');
      return localData;
    } catch (error) {
      console.error(error);
      localStorage.setItem('workbench/node/tabs', '{}');
      return {};
    }
  }

  // 设置工作区tabs
  setWorkbenchTabs(tabs: Record<string, any[]>) {
    try {
      localStorage.setItem('workbench/node/tabs', JSON.stringify(tabs));
    } catch (error) {
      console.error(error);
      localStorage.setItem('workbench/node/tabs', '{}');
    }
  }
}

export const workbenchCache = new WorkbenchCache();
