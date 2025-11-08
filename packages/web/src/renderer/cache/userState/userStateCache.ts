import type { WebsocketActiveTabType } from '@src/types/websocketNode';
import type { MockNodeActiveTabType } from '@src/types/mockNode';
import { logger } from '@/helper';
import { cacheKey } from '../cacheKey';

class UserState {
  // 获取首页激活的tab（项目列表/团队管理）
  getActiveHomeTab(): string {
    try {
      const localData = localStorage.getItem(cacheKey.userState.home.activeTab) || 'projectList';
      return localData;
    } catch (error) {
      console.error(error);
      return 'projectList';
    }
  }
  // 设置首页激活的tab（项目列表/团队管理）
  setActiveHomeTab(activeTab: string) {
    try {
      localStorage.setItem(cacheKey.userState.home.activeTab, activeTab);
    } catch (error) {
      console.error(error);
      localStorage.setItem(cacheKey.userState.home.activeTab, 'projectList');
    }
  }
  // 获取websocket节点激活的参数tab
  getWsNodeActiveParamsTab(id: string): WebsocketActiveTabType | null {
    try {
      const localActiveTab: Record<string, WebsocketActiveTabType> = JSON.parse(localStorage.getItem(cacheKey.userState.websocketNode.activeParamsTab) || '{}');
      if (!localActiveTab[id]) {
        return null;
      }
      return localActiveTab[id];
    } catch (error) {
      console.error(error);
      localStorage.setItem(cacheKey.userState.websocketNode.activeParamsTab, '{}');
      return null;
    }
  }
  // 设置websocket节点激活的参数tab
  setWsNodeActiveParamsTab(id: string, val: WebsocketActiveTabType) {
    try {
      const localActiveTab = JSON.parse(localStorage.getItem(cacheKey.userState.websocketNode.activeParamsTab) || '{}');
      localActiveTab[id] = val;
      localStorage.setItem(cacheKey.userState.websocketNode.activeParamsTab, JSON.stringify(localActiveTab));
    } catch (error) {
      console.error(error);
      const data: Record<string, WebsocketActiveTabType> = {};
      data[id] = val;
      localStorage.setItem(cacheKey.userState.websocketNode.activeParamsTab, JSON.stringify(data));
    }
  }
  // 获取HTTP节点激活的参数tab
  getHttpNodeActiveParamsTab(id: string): string | null {
    try {
      const localActiveTab: Record<string, string> = JSON.parse(localStorage.getItem(cacheKey.userState.httpNode.activeParamsTab) || '{}');
      if (!localActiveTab[id]) {
        return null;
      }
      return localActiveTab[id];
    } catch (error) {
      console.error(error);
      localStorage.setItem(cacheKey.userState.httpNode.activeParamsTab, '{}');
      return null;
    }
  }
  // 设置HTTP节点激活的参数tab
  setHttpNodeActiveParamsTab(id: string, val: string) {
    try {
      const localActiveTab = JSON.parse(localStorage.getItem(cacheKey.userState.httpNode.activeParamsTab) || '{}');
      localActiveTab[id] = val;
      localStorage.setItem(cacheKey.userState.httpNode.activeParamsTab, JSON.stringify(localActiveTab));
    } catch (error) {
      console.error(error);
      const data: Record<string, string> = {};
      data[id] = val;
      localStorage.setItem(cacheKey.userState.httpNode.activeParamsTab, JSON.stringify(data));
    }
  }
  // 获取Mock节点激活的tab
  getMockNodeActiveTab(id: string): MockNodeActiveTabType {
    try {
      const localActiveTab: Record<string, MockNodeActiveTabType> = JSON.parse(localStorage.getItem(cacheKey.userState.mockNode.activeTab) || '{}');
      if (!localActiveTab[id]) {
        return 'config';
      }
      return localActiveTab[id];
    } catch (error) {
      console.error(error);
      localStorage.setItem(cacheKey.userState.mockNode.activeTab, '{}');
      return 'config';
    }
  }
  // 设置Mock节点激活的tab
  setMockNodeActiveTab(id: string, val: MockNodeActiveTabType) {
    try {
      const localActiveTab = JSON.parse(localStorage.getItem(cacheKey.userState.mockNode.activeTab) || '{}');
      localActiveTab[id] = val;
      localStorage.setItem(cacheKey.userState.mockNode.activeTab, JSON.stringify(localActiveTab));
    } catch (error) {
      console.error(error);
      const data: Record<string, MockNodeActiveTabType> = {};
      data[id] = val;
      localStorage.setItem(cacheKey.userState.mockNode.activeTab, JSON.stringify(data));
    }
  }
  // 设置分享文档参数块折叠状态
  setShareCollapseState(tabId: string, blockStates: Record<string, boolean>) {
    try {
      const localData = JSON.parse(localStorage.getItem(cacheKey.userState.share.collapse) || '{}');
      localData[tabId] = blockStates;
      localStorage.setItem(cacheKey.userState.share.collapse, JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const data: Record<string, Record<string, boolean>> = {};
      data[tabId] = blockStates;
      localStorage.setItem(cacheKey.userState.share.collapse, JSON.stringify(data));
    }
  }
  // 获取分享文档参数块折叠状态
  getShareCollapseState(tabId: string): Record<string, boolean> | null {
    try {
      const localData: Record<string, Record<string, boolean>> = JSON.parse(localStorage.getItem(cacheKey.userState.share.collapse) || '{}');
      if (!localData[tabId]) {
        return null;
      }
      return localData[tabId];
    } catch (error) {
      console.error(error);
      localStorage.setItem(cacheKey.userState.share.collapse, '{}');
      return null;
    }
  }
  // 更新单个分享文档参数块折叠状态
  updateShareBlockCollapseState(tabId: string, blockName: string, isExpanded: boolean) {
    try {
      const localData = JSON.parse(localStorage.getItem(cacheKey.userState.share.collapse) || '{}');
      if (!localData[tabId]) {
        localData[tabId] = {};
      }
      localData[tabId][blockName] = isExpanded;
      localStorage.setItem(cacheKey.userState.share.collapse, JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const data: Record<string, Record<string, boolean>> = {};
      data[tabId] = { [blockName]: isExpanded };
      localStorage.setItem(cacheKey.userState.share.collapse, JSON.stringify(data));
    }
  }
  // 获取当前活跃的本地数据管理菜单
  getActiveLocalDataMenu(): string {
    try {
      const activeMenu = localStorage.getItem(cacheKey.userState.localData.activeMenu) || 'common-settings';
      return activeMenu;
    } catch (error) {
      console.error(error);
      return 'localStorage';
    }
  }
  // 设置当前活跃的本地数据管理菜单
  setActiveLocalDataMenu(activeMenu: string) {
    try {
      localStorage.setItem(cacheKey.userState.localData.activeMenu, activeMenu);
    } catch (error) {
      console.error(error);
      localStorage.setItem(cacheKey.userState.localData.activeMenu, 'localStorage');
    }
  }
  // 设置选中的缓存卡片类型
  setSelectedCacheType(cacheType: 'localStorage' | 'indexedDB' | 'backup' | 'restore') {
    try {
      localStorage.setItem(cacheKey.userState.cacheManager.cacheType, cacheType);
    } catch (error) {
      logger.error('设置选中缓存类型失败', { error });
      localStorage.setItem(cacheKey.userState.cacheManager.cacheType, 'localStorage');
    }
  }
  // 获取选中的缓存卡片类型
  getSelectedCacheType(): 'localStorage' | 'indexedDB' | 'backup' | 'restore' {
    try {
      const cacheType = localStorage.getItem(cacheKey.userState.cacheManager.cacheType) as 'localStorage' | 'indexedDB' | 'backup' | 'restore';
      return cacheType || 'localStorage';
    } catch (error) {
      logger.error('获取选中缓存类型失败', { error });
      return 'localStorage';
    }
  }
  // 获取HttpMock响应触发条件配置折叠状态
  getHttpMockResponseCondtionCollapseState(mockNodeId: string, responseIndex: number): boolean {
    try {
      const localData: Record<string, Record<number, boolean>> = JSON.parse(localStorage.getItem(cacheKey.userState.mockNode.conditionCollapse) || '{}');
      if (!localData[mockNodeId] || localData[mockNodeId][responseIndex] === undefined) {
        return false;
      }
      return localData[mockNodeId][responseIndex];
    } catch (error) {
      console.error(error);
      localStorage.setItem(cacheKey.userState.mockNode.conditionCollapse, '{}');
      return false;
    }
  }
  // 设置HttpMock响应触发条件配置折叠状态
  setHttpMockResponseCondtionCollapseState(mockNodeId: string, responseIndex: number, isCollapsed: boolean) {
    try {
      const localData = JSON.parse(localStorage.getItem(cacheKey.userState.mockNode.conditionCollapse) || '{}');
      if (!localData[mockNodeId]) {
        localData[mockNodeId] = {};
      }
      localData[mockNodeId][responseIndex] = isCollapsed;
      localStorage.setItem(cacheKey.userState.mockNode.conditionCollapse, JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const data: Record<string, Record<number, boolean>> = {};
      data[mockNodeId] = { [responseIndex]: isCollapsed };
      localStorage.setItem(cacheKey.userState.mockNode.conditionCollapse, JSON.stringify(data));
    }
  }
  // 获取HttpMock响应返回头配置折叠状态
  getHttpMockResponseHeadersCollapseState(mockNodeId: string, responseIndex: number): boolean {
    try {
      const localData: Record<string, Record<number, boolean>> = JSON.parse(localStorage.getItem(cacheKey.userState.mockNode.headersCollapse) || '{}');
      if (!localData[mockNodeId] || localData[mockNodeId][responseIndex] === undefined) {
        return false;
      }
      return localData[mockNodeId][responseIndex];
    } catch (error) {
      console.error(error);
      localStorage.setItem(cacheKey.userState.mockNode.headersCollapse, '{}');
      return false;
    }
  }
  // 设置HttpMock响应返回头配置折叠状态
  setHttpMockResponseHeadersCollapseState(mockNodeId: string, responseIndex: number, isCollapsed: boolean) {
    try {
      const localData = JSON.parse(localStorage.getItem(cacheKey.userState.mockNode.headersCollapse) || '{}');
      if (!localData[mockNodeId]) {
        localData[mockNodeId] = {};
      }
      localData[mockNodeId][responseIndex] = isCollapsed;
      localStorage.setItem(cacheKey.userState.mockNode.headersCollapse, JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const data: Record<string, Record<number, boolean>> = {};
      data[mockNodeId] = { [responseIndex]: isCollapsed };
      localStorage.setItem(cacheKey.userState.mockNode.headersCollapse, JSON.stringify(data));
    }
  }
  // 获取 Mock JSON 随机大小提示是否可见
  getMockJsonRandomSizeHintVisible(): boolean {
    try {
      const value = localStorage.getItem(cacheKey.userState.hint.mockJsonRandomSizeHint)
      if (value === null) {
        return true
      }
      return value !== 'false'
    } catch (error) {
      return true
    }
  }
  // 设置 Mock JSON 随机大小提示是否可见
  setMockJsonRandomSizeHintVisible(visible: boolean): void {
    try {
      localStorage.setItem(cacheKey.userState.hint.mockJsonRandomSizeHint, visible ? 'true' : 'false')
    } catch (error) {
      // 忽略错误
    }
  }
  // 获取 Mock Text 随机大小提示是否可见
  getMockTextRandomSizeHintVisible(): boolean {
    try {
      const value = localStorage.getItem(cacheKey.userState.hint.mockTextRandomSizeHint)
      if (value === null) {
        return true
      }
      return value !== 'false'
    } catch (error) {
      return true
    }
  }
  // 设置 Mock Text 随机大小提示是否可见
  setMockTextRandomSizeHintVisible(visible: boolean): void {
    try {
      localStorage.setItem(cacheKey.userState.hint.mockTextRandomSizeHint, visible ? 'true' : 'false')
    } catch (error) {
      // 忽略错误
    }
  }
  // 获取 JSON Body 提示是否可见
  getJsonBodyHintVisible(): boolean {
    try {
      const value = localStorage.getItem(cacheKey.userState.hint.hideJsonBodyTip)
      if (value === null) {
        return true
      }
      return value !== 'false'
    } catch (error) {
      return true
    }
  }
  // 设置 JSON Body 提示是否可见
  setJsonBodyHintVisible(visible: boolean): void {
    try {
      localStorage.setItem(cacheKey.userState.hint.hideJsonBodyTip, visible ? 'true' : 'false')
    } catch (error) {
      // 忽略错误
    }
  }
  // 获取HTTP节点返回参数折叠状态
  getHttpNodeResponseCollapseState(): Record<string, boolean> {
    try {
      const localData: Record<string, boolean> = JSON.parse(localStorage.getItem(cacheKey.userState.httpNode.responseCollapse) || '{}');
      return localData;
    } catch (error) {
      console.error(error);
      return {};
    }
  }
  // 设置HTTP节点返回参数折叠状态
  setHttpNodeResponseCollapseState(id: string, isShow: boolean) {
    try {
      const localData = JSON.parse(localStorage.getItem(cacheKey.userState.httpNode.responseCollapse) || '{}');
      localData[id] = isShow;
      localStorage.setItem(cacheKey.userState.httpNode.responseCollapse, JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      localStorage.setItem(cacheKey.userState.httpNode.responseCollapse, '{}');
    }
  }
  // 获取AI对话框宽度
  getAiDialogWidth(): number | null {
    try {
      const width = localStorage.getItem(cacheKey.userState.aiDialog.width);
      return width ? parseInt(width, 10) : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  // 设置AI对话框宽度
  setAiDialogWidth(width: number) {
    try {
      localStorage.setItem(cacheKey.userState.aiDialog.width, width.toString());
    } catch (error) {
      console.error(error);
    }
  }
  // 获取AI对话框高度
  getAiDialogHeight(): number | null {
    try {
      const height = localStorage.getItem(cacheKey.userState.aiDialog.height);
      return height ? parseInt(height, 10) : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  // 设置AI对话框高度
  setAiDialogHeight(height: number) {
    try {
      localStorage.setItem(cacheKey.userState.aiDialog.height, height.toString());
    } catch (error) {
      console.error(error);
    }
  }
  // 获取AI对话框模式
  getAiDialogMode(): 'agent' | 'ask' | null {
    try {
      const mode = localStorage.getItem(cacheKey.userState.aiDialog.mode);
      if (mode === 'agent' || mode === 'ask') {
        return mode;
      }
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  // 设置AI对话框模式
  setAiDialogMode(mode: 'agent' | 'ask') {
    try {
      localStorage.setItem(cacheKey.userState.aiDialog.mode, mode);
    } catch (error) {
      console.error(error);
    }
  }
  // 获取AI对话框模型
  getAiDialogModel(): 'deepseek' | null {
    try {
      const model = localStorage.getItem(cacheKey.userState.aiDialog.model);
      if (model === 'deepseek') {
        return model;
      }
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  // 设置AI对话框模型
  setAiDialogModel(model: 'deepseek') {
    try {
      localStorage.setItem(cacheKey.userState.aiDialog.model, model);
    } catch (error) {
      console.error(error);
    }
  }
  // 获取AI对话框位置
  getAiDialogPosition(): { x: number, y: number } | null {
    try {
      const position = localStorage.getItem(cacheKey.userState.aiDialog.position);
      return position ? JSON.parse(position) : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  // 设置AI对话框位置
  setAiDialogPosition(position: { x: number, y: number }) {
    try {
      localStorage.setItem(cacheKey.userState.aiDialog.position, JSON.stringify(position));
    } catch (error) {
      console.error(error);
    }
  }
}

export const userState = new UserState();
