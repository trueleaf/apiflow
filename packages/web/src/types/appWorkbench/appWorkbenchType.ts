// App Workbench 相关类型定义
export type AppWorkbenchHeaderTab = {
  id: string;
  title: string;
  type: 'project' | 'settings';
  network: 'online' | 'offline';
};
export type AppWorkbenchHeaderInitData = {
  tabs: AppWorkbenchHeaderTab[];
  activeTabId: string;
};
