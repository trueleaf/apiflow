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

  // 获取固定的工具栏操作
  getPinToolbarOperations(): any[] {
    try {
      const localPinToolbarOperations = localStorage.getItem('workbench/pinToolbarOperations');
      if (localPinToolbarOperations) {
        return JSON.parse(localPinToolbarOperations);
      }
      return [];
    } catch (error) {
      console.error('获取固定工具栏操作失败:', error);
      localStorage.setItem('workbench/pinToolbarOperations', '[]');
      return [];
    }
  }

  // 设置固定的工具栏操作
  setPinToolbarOperations(operations: any[]) {
    try {
      localStorage.setItem('workbench/pinToolbarOperations', JSON.stringify(operations));
    } catch (error) {
      console.error('设置固定工具栏操作失败:', error);
    }
  }

  // 获取布局方式
  getLayout(): 'horizontal' | 'vertical' {
    try {
      const localLayout = localStorage.getItem('workbench/layout');
      if (localLayout !== 'horizontal' && localLayout !== 'vertical') {
        return 'horizontal';
      }
      return localLayout as 'horizontal' | 'vertical';
    } catch (error) {
      console.error('获取布局方式失败:', error);
      return 'horizontal';
    }
  }

  // 设置布局方式
  setLayout(layout: 'horizontal' | 'vertical') {
    try {
      localStorage.setItem('workbench/layout', layout);
    } catch (error) {
      console.error('设置布局方式失败:', error);
    }
  }
}

export const workbenchCache = new WorkbenchCache();
