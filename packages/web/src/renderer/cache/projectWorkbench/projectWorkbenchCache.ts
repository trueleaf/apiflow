import type { ProjectNavItem } from '@src/types/projectWorkbench/nav';
import type { ApidocTab } from '@src/types/apidoc/tabs';
import { logger } from '@/helper/logger';
import { cacheKey } from '../cacheKey';
type ProjectWorkbenchPinOperation = {
  name: string;
  icon: string;
  op: string;
  shortcut: string[];
  pin: boolean;
  viewOnly?: boolean;
};
class ProjectWorkbenchCache {
  constructor() {
  }
  // 获取项目工作区navs
  getProjectNavs(): Record<string, ProjectNavItem[]> {
    try {
      const localData = JSON.parse(localStorage.getItem(cacheKey.projectWorkbench.node.navs) || '{}');
      return localData;
    } catch (error) {
      logger.error('获取项目工作区导航项失败', { error });
      localStorage.setItem(cacheKey.projectWorkbench.node.navs, '{}');
      return {};
    }
  }
  // 设置项目工作区navs
  setProjectNavs(navs: Record<string, ProjectNavItem[]>) {
    try {
      localStorage.setItem(cacheKey.projectWorkbench.node.navs, JSON.stringify(navs));
    } catch (error) {
      logger.error('设置项目工作区导航项失败', { error });
      localStorage.setItem(cacheKey.projectWorkbench.node.navs, '{}');
    }
  }
  // 兼容 share 目录 - 获取项目工作区tabs
  getProjectWorkbenchTabs(): Record<string, ApidocTab[]> {
    return this.getProjectNavs() as unknown as Record<string, ApidocTab[]>;
  }
  // 兼容 share 目录 - 设置项目工作区tabs
  setProjectWorkbenchTabs(tabs: Record<string, ApidocTab[]>) {
    this.setProjectNavs(tabs as unknown as Record<string, ProjectNavItem[]>);
  }
  // 获取项目工作区固定的工具栏操作
  getProjectWorkbenchPinToolbarOperations(): ProjectWorkbenchPinOperation[] {
    try {
      const localPinToolbarOperations = localStorage.getItem(cacheKey.projectWorkbench.pinToolbarOperations);
      if (localPinToolbarOperations) {
        return JSON.parse(localPinToolbarOperations);
      }
      return [];
    } catch (error) {
      logger.error('获取项目工作区固定工具栏操作失败', { error });
      localStorage.setItem(cacheKey.projectWorkbench.pinToolbarOperations, '[]');
      return [];
    }
  }
  // 设置项目工作区固定的工具栏操作
  setProjectWorkbenchPinToolbarOperations(operations: ProjectWorkbenchPinOperation[]) {
    try {
      localStorage.setItem(cacheKey.projectWorkbench.pinToolbarOperations, JSON.stringify(operations));
    } catch (error) {
      logger.error('设置项目工作区固定工具栏操作失败', { error });
    }
  }
  // 获取项目工作区布局方式
  getProjectWorkbenchLayout(): 'horizontal' | 'vertical' {
    try {
      const localLayout = localStorage.getItem(cacheKey.projectWorkbench.layout);
      if (localLayout !== 'horizontal' && localLayout !== 'vertical') {
        return 'horizontal';
      }
      return localLayout as 'horizontal' | 'vertical';
    } catch (error) {
      logger.error('获取项目工作区布局方式失败', { error });
      return 'horizontal';
    }
  }
  // 设置项目工作区布局方式
  setProjectWorkbenchLayout(layout: 'horizontal' | 'vertical') {
    try {
      localStorage.setItem(cacheKey.projectWorkbench.layout, layout);
    } catch (error) {
      logger.error('设置项目工作区布局方式失败', { error });
    }
  }
}
export const projectWorkbenchCache = new ProjectWorkbenchCache();