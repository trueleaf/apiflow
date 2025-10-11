/**
 * 用户操作状态缓存
 */

import type { WebsocketActiveTabType } from '@src/types/websocketNode';

class UserState {
  // 获取首页激活的tab（项目列表/团队管理）
  getActiveHomeTab(): string {
    try {
      const localData = localStorage.getItem('userState/home/activeTab') || 'projectList';
      return localData;
    } catch (error) {
      console.error(error);
      return 'projectList';
    }
  }

  // 设置首页激活的tab（项目列表/团队管理）
  setActiveHomeTab(activeTab: string) {
    try {
      localStorage.setItem('userState/home/activeTab', activeTab);
    } catch (error) {
      console.error(error);
      localStorage.setItem('userState/home/activeTab', 'projectList');
    }
  }

  // 获取websocket节点激活的参数tab
  getWsNodeActiveParamsTab(id: string): WebsocketActiveTabType | null {
    try {
      const localActiveTab: Record<string, WebsocketActiveTabType> = JSON.parse(localStorage.getItem('userState/websocketNode/activeParamsTab') || '{}');
      if (!localActiveTab[id]) {
        return null;
      }
      return localActiveTab[id];
    } catch (error) {
      console.error(error);
      localStorage.setItem('userState/websocketNode/activeParamsTab', '{}');
      return null;
    }
  }

  // 设置websocket节点激活的参数tab
  setWsNodeActiveParamsTab(id: string, val: WebsocketActiveTabType) {
    try {
      const localActiveTab = JSON.parse(localStorage.getItem('userState/websocketNode/activeParamsTab') || '{}');
      localActiveTab[id] = val;
      localStorage.setItem('userState/websocketNode/activeParamsTab', JSON.stringify(localActiveTab));
    } catch (error) {
      console.error(error);
      const data: Record<string, WebsocketActiveTabType> = {};
      data[id] = val;
      localStorage.setItem('userState/websocketNode/activeParamsTab', JSON.stringify(data));
    }
  }

  // 获取HTTP节点激活的参数tab
  getHttpNodeActiveParamsTab(id: string): string | null {
    try {
      const localActiveTab: Record<string, string> = JSON.parse(localStorage.getItem('userState/httpNode/activeParamsTab') || '{}');
      if (!localActiveTab[id]) {
        return null;
      }
      return localActiveTab[id];
    } catch (error) {
      console.error(error);
      localStorage.setItem('userState/httpNode/activeParamsTab', '{}');
      return null;
    }
  }

  // 设置HTTP节点激活的参数tab
  setHttpNodeActiveParamsTab(id: string, val: string) {
    try {
      const localActiveTab = JSON.parse(localStorage.getItem('userState/httpNode/activeParamsTab') || '{}');
      localActiveTab[id] = val;
      localStorage.setItem('userState/httpNode/activeParamsTab', JSON.stringify(localActiveTab));
    } catch (error) {
      console.error(error);
      const data: Record<string, string> = {};
      data[id] = val;
      localStorage.setItem('userState/httpNode/activeParamsTab', JSON.stringify(data));
    }
  }
}

export const userState = new UserState();
