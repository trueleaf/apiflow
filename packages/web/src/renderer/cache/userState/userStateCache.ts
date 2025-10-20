import type { WebsocketActiveTabType } from '@src/types/websocketNode';
import type { MockNodeActiveTabType } from '@src/types/mockNode';

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
  // 获取Mock节点激活的tab
  getMockNodeActiveTab(id: string): MockNodeActiveTabType {
    try {
      const localActiveTab: Record<string, MockNodeActiveTabType> = JSON.parse(localStorage.getItem('userState/mockNode/activeTab') || '{}');
      if (!localActiveTab[id]) {
        return 'config';
      }
      return localActiveTab[id];
    } catch (error) {
      console.error(error);
      localStorage.setItem('userState/mockNode/activeTab', '{}');
      return 'config';
    }
  }
  // 设置Mock节点激活的tab
  setMockNodeActiveTab(id: string, val: MockNodeActiveTabType) {
    try {
      const localActiveTab = JSON.parse(localStorage.getItem('userState/mockNode/activeTab') || '{}');
      localActiveTab[id] = val;
      localStorage.setItem('userState/mockNode/activeTab', JSON.stringify(localActiveTab));
    } catch (error) {
      console.error(error);
      const data: Record<string, MockNodeActiveTabType> = {};
      data[id] = val;
      localStorage.setItem('userState/mockNode/activeTab', JSON.stringify(data));
    }
  }
  // 设置分享文档参数块折叠状态
  setShareCollapseState(tabId: string, blockStates: Record<string, boolean>) {
    try {
      const localData = JSON.parse(localStorage.getItem('userState/share/collapse') || '{}');
      localData[tabId] = blockStates;
      localStorage.setItem('userState/share/collapse', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const data: Record<string, Record<string, boolean>> = {};
      data[tabId] = blockStates;
      localStorage.setItem('userState/share/collapse', JSON.stringify(data));
    }
  }
  // 获取分享文档参数块折叠状态
  getShareCollapseState(tabId: string): Record<string, boolean> | null {
    try {
      const localData: Record<string, Record<string, boolean>> = JSON.parse(localStorage.getItem('userState/share/collapse') || '{}');
      if (!localData[tabId]) {
        return null;
      }
      return localData[tabId];
    } catch (error) {
      console.error(error);
      localStorage.setItem('userState/share/collapse', '{}');
      return null;
    }
  }
  // 更新单个分享文档参数块折叠状态
  updateShareBlockCollapseState(tabId: string, blockName: string, isExpanded: boolean) {
    try {
      const localData = JSON.parse(localStorage.getItem('userState/share/collapse') || '{}');
      if (!localData[tabId]) {
        localData[tabId] = {};
      }
      localData[tabId][blockName] = isExpanded;
      localStorage.setItem('userState/share/collapse', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const data: Record<string, Record<string, boolean>> = {};
      data[tabId] = { [blockName]: isExpanded };
      localStorage.setItem('userState/share/collapse', JSON.stringify(data));
    }
  }
  // 获取当前活跃的本地数据管理菜单
  getActiveLocalDataMenu(): string {
    try {
      const activeMenu = localStorage.getItem('userState/localData/activeMenu') || 'localStorage';
      return activeMenu;
    } catch (error) {
      console.error(error);
      return 'localStorage';
    }
  }
  // 设置当前活跃的本地数据管理菜单
  setActiveLocalDataMenu(activeMenu: string) {
    try {
      localStorage.setItem('userState/localData/activeMenu', activeMenu);
    } catch (error) {
      console.error(error);
      localStorage.setItem('userState/localData/activeMenu', 'localStorage');
    }
  }
  // 设置选中的缓存卡片类型
  setSelectedCacheType(cacheType: 'localStorage' | 'indexedDB' | 'backup' | 'restore') {
    try {
      localStorage.setItem('userState/cacheManager/cacheType', cacheType);
    } catch (error) {
      console.error('设置选中缓存类型失败:', error);
      localStorage.setItem('userState/cacheManager/cacheType', 'localStorage');
    }
  }
  // 获取选中的缓存卡片类型
  getSelectedCacheType(): 'localStorage' | 'indexedDB' | 'backup' | 'restore' {
    try {
      const cacheType = localStorage.getItem('userState/cacheManager/cacheType') as 'localStorage' | 'indexedDB' | 'backup' | 'restore';
      return cacheType || 'localStorage';
    } catch (error) {
      console.error('获取选中缓存类型失败:', error);
      return 'localStorage';
    }
  }
  // 获取HttpMock响应触发条件配置折叠状态
  getHttpMockResponseCondtionCollapseState(mockNodeId: string, responseIndex: number): boolean {
    try {
      const localData: Record<string, Record<number, boolean>> = JSON.parse(localStorage.getItem('userState/mockNode/conditionCollapse') || '{}');
      if (!localData[mockNodeId] || localData[mockNodeId][responseIndex] === undefined) {
        return false;
      }
      return localData[mockNodeId][responseIndex];
    } catch (error) {
      console.error(error);
      localStorage.setItem('userState/mockNode/conditionCollapse', '{}');
      return false;
    }
  }
  // 设置HttpMock响应触发条件配置折叠状态
  setHttpMockResponseCondtionCollapseState(mockNodeId: string, responseIndex: number, isCollapsed: boolean) {
    try {
      const localData = JSON.parse(localStorage.getItem('userState/mockNode/conditionCollapse') || '{}');
      if (!localData[mockNodeId]) {
        localData[mockNodeId] = {};
      }
      localData[mockNodeId][responseIndex] = isCollapsed;
      localStorage.setItem('userState/mockNode/conditionCollapse', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const data: Record<string, Record<number, boolean>> = {};
      data[mockNodeId] = { [responseIndex]: isCollapsed };
      localStorage.setItem('userState/mockNode/conditionCollapse', JSON.stringify(data));
    }
  }
  // 获取HttpMock响应返回头配置折叠状态
  getHttpMockResponseHeadersCollapseState(mockNodeId: string, responseIndex: number): boolean {
    try {
      const localData: Record<string, Record<number, boolean>> = JSON.parse(localStorage.getItem('userState/mockNode/headersCollapse') || '{}');
      if (!localData[mockNodeId] || localData[mockNodeId][responseIndex] === undefined) {
        return false;
      }
      return localData[mockNodeId][responseIndex];
    } catch (error) {
      console.error(error);
      localStorage.setItem('userState/mockNode/headersCollapse', '{}');
      return false;
    }
  }
  // 设置HttpMock响应返回头配置折叠状态
  setHttpMockResponseHeadersCollapseState(mockNodeId: string, responseIndex: number, isCollapsed: boolean) {
    try {
      const localData = JSON.parse(localStorage.getItem('userState/mockNode/headersCollapse') || '{}');
      if (!localData[mockNodeId]) {
        localData[mockNodeId] = {};
      }
      localData[mockNodeId][responseIndex] = isCollapsed;
      localStorage.setItem('userState/mockNode/headersCollapse', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const data: Record<string, Record<number, boolean>> = {};
      data[mockNodeId] = { [responseIndex]: isCollapsed };
      localStorage.setItem('userState/mockNode/headersCollapse', JSON.stringify(data));
    }
  }
}

export const userState = new UserState();
