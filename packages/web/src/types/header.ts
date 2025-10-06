// header 相关类型定义
export type HeaderTab = {
  id: string;
  title: string;
  type: 'project' | 'settings';
  network: 'online' | 'offline';
};

export type HeaderInitData = {
  tabs: HeaderTab[];
  activeTabId: string;
};
