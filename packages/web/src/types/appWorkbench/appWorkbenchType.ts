// App Workbench 相关类型定义
import type { AnchorRect } from '@src/types/common';

export type AppWorkbenchHeaderTab = {
  id: string;
  title: string;
  type: 'project' | 'settings';
  network: 'online' | 'offline';
};
export type AppWorkbenchHeaderTabContextAction = 'close' | 'closeLeft' | 'closeRight' | 'closeOther' | 'closeAll';
export type AppWorkbenchHeaderTabContextmenuData = {
  position: AnchorRect;
  tabId: string;
  hasLeft: boolean;
  hasRight: boolean;
  hasOther: boolean;
  hasAny: boolean;
};
export type AppWorkbenchHeaderTabContextActionPayload = {
  action: AppWorkbenchHeaderTabContextAction;
  tabId: string;
};
export type AppWorkbenchHeaderInitData = {
  tabs: AppWorkbenchHeaderTab[];
  activeTabId: string;
};
