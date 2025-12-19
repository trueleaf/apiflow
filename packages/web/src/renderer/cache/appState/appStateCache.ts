import type { WebsocketActiveTabType } from '@src/types/websocketNode';
import type { MockNodeActiveTabType } from '@src/types/mockNode';
import type { AdvancedSearchConditions } from '@src/types/advancedSearch';
import { logger } from '@/helper';
import { cacheKey } from '../cacheKey';
type ProjectManagerSearchState = {
  keyword: string;
  showAdvancedSearch: boolean;
  searchMode: 'simple' | 'advanced';
  searchConditions: AdvancedSearchConditions;
  isFold: boolean;
};
class AppStateCache {
  // 获取项目管理页搜索状态
  getProjectManagerSearchState(): ProjectManagerSearchState | null {
    try {
      const data = localStorage.getItem(cacheKey.appState.home.projectManagerSearch);
      if (!data) return null;
      return JSON.parse(data) as ProjectManagerSearchState;
    } catch (error) {
      logger.error('获取项目管理搜索状态失败', { error });
      return null;
    }
  }
  // 设置项目管理页搜索状态
  setProjectManagerSearchState(state: ProjectManagerSearchState) {
    try {
      localStorage.setItem(cacheKey.appState.home.projectManagerSearch, JSON.stringify(state));
    } catch (error) {
      logger.error('设置项目管理搜索状态失败', { error });
    }
  }
  // 获取首页激活的tab（项目列表/团队管理）
  getActiveHomeTab(): string {
    try {
      const localData = localStorage.getItem(cacheKey.appState.home.activeTab) || 'projectList';
      return localData;
    } catch (error) {
      logger.error('获取首页激活Tab失败', { error });
      return 'projectList';
    }
  }
  // 设置首页激活的tab（项目列表/团队管理）
  setActiveHomeTab(activeTab: string) {
    try {
      localStorage.setItem(cacheKey.appState.home.activeTab, activeTab);
    } catch (error) {
      logger.error('设置首页激活Tab失败', { error });
      localStorage.setItem(cacheKey.appState.home.activeTab, 'projectList');
    }
  }
  // 获取websocket节点激活的参数tab
  getWsNodeActiveParamsTab(id: string): WebsocketActiveTabType | null {
    try {
      const localActiveTab: Record<string, WebsocketActiveTabType> = JSON.parse(localStorage.getItem(cacheKey.appState.websocketNode.activeParamsTab) || '{}');
      if (!localActiveTab[id]) {
        return null;
      }
      return localActiveTab[id];
    } catch (error) {
      logger.error('获取WebSocket节点参数Tab失败', { error });
      localStorage.setItem(cacheKey.appState.websocketNode.activeParamsTab, '{}');
      return null;
    }
  }
  // 设置websocket节点激活的参数tab
  setWsNodeActiveParamsTab(id: string, val: WebsocketActiveTabType) {
    try {
      const localActiveTab = JSON.parse(localStorage.getItem(cacheKey.appState.websocketNode.activeParamsTab) || '{}');
      localActiveTab[id] = val;
      localStorage.setItem(cacheKey.appState.websocketNode.activeParamsTab, JSON.stringify(localActiveTab));
    } catch (error) {
      logger.error('设置WebSocket节点参数Tab失败', { error });
      const data: Record<string, WebsocketActiveTabType> = {};
      data[id] = val;
      localStorage.setItem(cacheKey.appState.websocketNode.activeParamsTab, JSON.stringify(data));
    }
  }
  // 获取HTTP节点激活的参数tab
  getHttpNodeActiveParamsTab(id: string): string | null {
    try {
      const localActiveTab: Record<string, string> = JSON.parse(localStorage.getItem(cacheKey.appState.httpNode.activeParamsTab) || '{}');
      if (!localActiveTab[id]) {
        return null;
      }
      return localActiveTab[id];
    } catch (error) {
      logger.error('获取HTTP节点参数Tab失败', { error });
      localStorage.setItem(cacheKey.appState.httpNode.activeParamsTab, '{}');
      return null;
    }
  }
  // 设置HTTP节点激活的参数tab
  setHttpNodeActiveParamsTab(id: string, val: string) {
    try {
      const localActiveTab = JSON.parse(localStorage.getItem(cacheKey.appState.httpNode.activeParamsTab) || '{}');
      localActiveTab[id] = val;
      localStorage.setItem(cacheKey.appState.httpNode.activeParamsTab, JSON.stringify(localActiveTab));
    } catch (error) {
      logger.error('设置HTTP节点参数Tab失败', { error });
      const data: Record<string, string> = {};
      data[id] = val;
      localStorage.setItem(cacheKey.appState.httpNode.activeParamsTab, JSON.stringify(data));
    }
  }
  // 获取Mock节点激活的tab
  getMockNodeActiveTab(id: string): MockNodeActiveTabType {
    try {
      const localActiveTab: Record<string, MockNodeActiveTabType> = JSON.parse(localStorage.getItem(cacheKey.appState.mockNode.activeTab) || '{}');
      if (!localActiveTab[id]) {
        return 'config';
      }
      return localActiveTab[id];
    } catch (error) {
      logger.error('获取Mock节点Tab失败', { error });
      localStorage.setItem(cacheKey.appState.mockNode.activeTab, '{}');
      return 'config';
    }
  }
  // 设置Mock节点激活的tab
  setMockNodeActiveTab(id: string, val: MockNodeActiveTabType) {
    try {
      const localActiveTab = JSON.parse(localStorage.getItem(cacheKey.appState.mockNode.activeTab) || '{}');
      localActiveTab[id] = val;
      localStorage.setItem(cacheKey.appState.mockNode.activeTab, JSON.stringify(localActiveTab));
    } catch (error) {
      logger.error('设置Mock节点Tab失败', { error });
      const data: Record<string, MockNodeActiveTabType> = {};
      data[id] = val;
      localStorage.setItem(cacheKey.appState.mockNode.activeTab, JSON.stringify(data));
    }
  }
  // 设置分享文档参数块折叠状态
  setShareCollapseState(tabId: string, blockStates: Record<string, boolean>) {
    try {
      const localData = JSON.parse(localStorage.getItem(cacheKey.appState.share.collapse) || '{}');
      localData[tabId] = blockStates;
      localStorage.setItem(cacheKey.appState.share.collapse, JSON.stringify(localData));
    } catch (error) {
      logger.error('设置分享文档折叠状态失败', { error });
      const data: Record<string, Record<string, boolean>> = {};
      data[tabId] = blockStates;
      localStorage.setItem(cacheKey.appState.share.collapse, JSON.stringify(data));
    }
  }
  // 获取分享文档参数块折叠状态
  getShareCollapseState(tabId: string): Record<string, boolean> | null {
    try {
      const localData: Record<string, Record<string, boolean>> = JSON.parse(localStorage.getItem(cacheKey.appState.share.collapse) || '{}');
      if (!localData[tabId]) {
        return null;
      }
      return localData[tabId];
    } catch (error) {
      logger.error('获取分享文档折叠状态失败', { error });
      localStorage.setItem(cacheKey.appState.share.collapse, '{}');
      return null;
    }
  }
  // 更新单个分享文档参数块折叠状态
  updateShareBlockCollapseState(tabId: string, blockName: string, isExpanded: boolean) {
    try {
      const localData = JSON.parse(localStorage.getItem(cacheKey.appState.share.collapse) || '{}');
      if (!localData[tabId]) {
        localData[tabId] = {};
      }
      localData[tabId][blockName] = isExpanded;
      localStorage.setItem(cacheKey.appState.share.collapse, JSON.stringify(localData));
    } catch (error) {
      logger.error('更新分享文档折叠状态失败', { error });
      const data: Record<string, Record<string, boolean>> = {};
      data[tabId] = { [blockName]: isExpanded };
      localStorage.setItem(cacheKey.appState.share.collapse, JSON.stringify(data));
    }
  }
  // 获取当前活跃的本地数据管理菜单
  getActiveLocalDataMenu(): string {
    try {
      const activeMenu = localStorage.getItem(cacheKey.appState.localData.activeMenu) || 'common-settings';
      return activeMenu;
    } catch (error) {
      logger.error('获取本地数据菜单失败', { error });
      return 'localStorage';
    }
  }
  // 设置当前活跃的本地数据管理菜单
  setActiveLocalDataMenu(activeMenu: string) {
    try {
      localStorage.setItem(cacheKey.appState.localData.activeMenu, activeMenu);
    } catch (error) {
      logger.error('设置本地数据菜单失败', { error });
      localStorage.setItem(cacheKey.appState.localData.activeMenu, 'localStorage');
    }
  }
  // 设置选中的缓存卡片类型
  setSelectedCacheType(cacheType: 'localStorage' | 'indexedDB' | 'backup' | 'restore') {
    try {
      localStorage.setItem(cacheKey.appState.cacheManager.cacheType, cacheType);
    } catch (error) {
      logger.error('设置选中缓存类型失败', { error });
      localStorage.setItem(cacheKey.appState.cacheManager.cacheType, 'localStorage');
    }
  }
  // 获取选中的缓存卡片类型
  getSelectedCacheType(): 'localStorage' | 'indexedDB' | 'backup' | 'restore' {
    try {
      const cacheType = localStorage.getItem(cacheKey.appState.cacheManager.cacheType) as 'localStorage' | 'indexedDB' | 'backup' | 'restore';
      return cacheType || 'localStorage';
    } catch (error) {
      logger.error('获取选中缓存类型失败', { error });
      return 'localStorage';
    }
  }
  // 获取HttpMock响应触发条件配置折叠状态
  getHttpMockResponseCondtionCollapseState(mockNodeId: string, responseIndex: number): boolean {
    try {
      const localData: Record<string, Record<number, boolean>> = JSON.parse(localStorage.getItem(cacheKey.appState.mockNode.conditionCollapse) || '{}');
      if (!localData[mockNodeId] || localData[mockNodeId][responseIndex] === undefined) {
        return false;
      }
      return localData[mockNodeId][responseIndex];
    } catch (error) {
      logger.error('获取Mock响应条件折叠状态失败', { error });
      localStorage.setItem(cacheKey.appState.mockNode.conditionCollapse, '{}');
      return false;
    }
  }
  // 设置HttpMock响应触发条件配置折叠状态
  setHttpMockResponseCondtionCollapseState(mockNodeId: string, responseIndex: number, isCollapsed: boolean) {
    try {
      const localData = JSON.parse(localStorage.getItem(cacheKey.appState.mockNode.conditionCollapse) || '{}');
      if (!localData[mockNodeId]) {
        localData[mockNodeId] = {};
      }
      localData[mockNodeId][responseIndex] = isCollapsed;
      localStorage.setItem(cacheKey.appState.mockNode.conditionCollapse, JSON.stringify(localData));
    } catch (error) {
      logger.error('设置Mock响应条件折叠状态失败', { error });
      const data: Record<string, Record<number, boolean>> = {};
      data[mockNodeId] = { [responseIndex]: isCollapsed };
      localStorage.setItem(cacheKey.appState.mockNode.conditionCollapse, JSON.stringify(data));
    }
  }
  // 获取HttpMock响应返回头配置折叠状态
  getHttpMockResponseHeadersCollapseState(mockNodeId: string, responseIndex: number): boolean {
    try {
      const localData: Record<string, Record<number, boolean>> = JSON.parse(localStorage.getItem(cacheKey.appState.mockNode.headersCollapse) || '{}');
      if (!localData[mockNodeId] || localData[mockNodeId][responseIndex] === undefined) {
        return false;
      }
      return localData[mockNodeId][responseIndex];
    } catch (error) {
      logger.error('获取Mock响应头折叠状态失败', { error });
      localStorage.setItem(cacheKey.appState.mockNode.headersCollapse, '{}');
      return false;
    }
  }
  // 设置HttpMock响应返回头配置折叠状态
  setHttpMockResponseHeadersCollapseState(mockNodeId: string, responseIndex: number, isCollapsed: boolean) {
    try {
      const localData = JSON.parse(localStorage.getItem(cacheKey.appState.mockNode.headersCollapse) || '{}');
      if (!localData[mockNodeId]) {
        localData[mockNodeId] = {};
      }
      localData[mockNodeId][responseIndex] = isCollapsed;
      localStorage.setItem(cacheKey.appState.mockNode.headersCollapse, JSON.stringify(localData));
    } catch (error) {
      logger.error('设置Mock响应头折叠状态失败', { error });
      const data: Record<string, Record<number, boolean>> = {};
      data[mockNodeId] = { [responseIndex]: isCollapsed };
      localStorage.setItem(cacheKey.appState.mockNode.headersCollapse, JSON.stringify(data));
    }
  }
  // 获取 Mock JSON 随机大小提示是否可见
  getMockJsonRandomSizeHintVisible(): boolean {
    try {
      const value = localStorage.getItem(cacheKey.appState.hint.mockJsonRandomSizeHint)
      if (value === null) {
        return true
      }
      return value !== 'false'
    } catch (error) {
      logger.error('获取Mock JSON提示状态失败', { error });
      return true
    }
  }
  // 设置 Mock JSON 随机大小提示是否可见
  setMockJsonRandomSizeHintVisible(visible: boolean): void {
    try {
      localStorage.setItem(cacheKey.appState.hint.mockJsonRandomSizeHint, visible ? 'true' : 'false')
    } catch (error) {
      logger.error('设置Mock JSON提示状态失败', { error });
    }
  }
  // 获取 Mock Text 随机大小提示是否可见
  getMockTextRandomSizeHintVisible(): boolean {
    try {
      const value = localStorage.getItem(cacheKey.appState.hint.mockTextRandomSizeHint)
      if (value === null) {
        return true
      }
      return value !== 'false'
    } catch (error) {
      logger.error('获取Mock Text提示状态失败', { error });
      return true
    }
  }
  // 设置 Mock Text 随机大小提示是否可见
  setMockTextRandomSizeHintVisible(visible: boolean): void {
    try {
      localStorage.setItem(cacheKey.appState.hint.mockTextRandomSizeHint, visible ? 'true' : 'false')
    } catch (error) {
      logger.error('设置Mock Text提示状态失败', { error });
    }
  }
  // 获取网络模式横幅是否被关闭
  getNetworkModeBannerDismissed(): boolean {
    try {
      const value = localStorage.getItem(cacheKey.appState.hint.networkModeBannerHidden);
      if (value === null) {
        return false;
      }
      return value === 'true';
    } catch (error) {
      logger.error('获取网络模式横幅隐藏状态失败', { error });
      return false;
    }
  }
  // 设置网络模式横幅关闭状态
  setNetworkModeBannerDismissed(dismissed: boolean): void {
    try {
      localStorage.setItem(cacheKey.appState.hint.networkModeBannerHidden, dismissed ? 'true' : 'false');
    } catch (error) {
      logger.error('设置网络模式横幅隐藏状态失败', { error });
    }
  }
  // 获取 JSON Body 提示是否可见
  getJsonBodyHintVisible(): boolean {
    try {
      const value = localStorage.getItem(cacheKey.appState.hint.hideJsonBodyTip)
      if (value === null) {
        return true
      }
      return value !== 'false'
    } catch (error) {
      logger.error('获取JSON Body提示状态失败', { error });
      return true
    }
  }
  // 设置 JSON Body 提示是否可见
  setJsonBodyHintVisible(visible: boolean): void {
    try {
      localStorage.setItem(cacheKey.appState.hint.hideJsonBodyTip, visible ? 'true' : 'false')
    } catch (error) {
      logger.error('设置JSON Body提示状态失败', { error });
    }
  }
  // 获取HTTP节点返回参数折叠状态
  getHttpNodeResponseCollapseState(): Record<string, boolean> {
    try {
      const localData: Record<string, boolean> = JSON.parse(localStorage.getItem(cacheKey.appState.httpNode.responseCollapse) || '{}');
      return localData;
    } catch (error) {
      logger.error('获取HTTP节点响应折叠状态失败', { error });
      return {};
    }
  }
  // 设置HTTP节点返回参数折叠状态
  setHttpNodeResponseCollapseState(id: string, isShow: boolean) {
    try {
      const localData = JSON.parse(localStorage.getItem(cacheKey.appState.httpNode.responseCollapse) || '{}');
      localData[id] = isShow;
      localStorage.setItem(cacheKey.appState.httpNode.responseCollapse, JSON.stringify(localData));
    } catch (error) {
      logger.error('设置HTTP节点响应折叠状态失败', { error });
      localStorage.setItem(cacheKey.appState.httpNode.responseCollapse, '{}');
    }
  }
  // 获取AI对话框矩形信息
  getAiDialogRect(): { width: number | null, height: number | null, x: number | null, y: number | null } {
    try {
      const width = localStorage.getItem(cacheKey.appState.aiDialog.width);
      const height = localStorage.getItem(cacheKey.appState.aiDialog.height);
      const position = localStorage.getItem(cacheKey.appState.aiDialog.position);
      const rect: { width: number | null, height: number | null, x: number | null, y: number | null } = {
        width: width ? parseInt(width, 10) : null,
        height: height ? parseInt(height, 10) : null,
        x: null,
        y: null
      };
      if (position) {
        const parsedPosition = JSON.parse(position);
        if (parsedPosition && typeof parsedPosition.x === 'number' && typeof parsedPosition.y === 'number') {
          rect.x = parsedPosition.x;
          rect.y = parsedPosition.y;
        }
      }
      return rect;
    } catch (error) {
      logger.error('获取AI对话框矩形信息失败', { error });
      return {
        width: null,
        height: null,
        x: null,
        y: null
      };
    }
  }
  // 设置AI对话框矩形信息
  setAiDialogRect(rect: { width: number | null, height: number | null, x: number | null, y: number | null }) {
    try {
      if (rect.width === null) {
        localStorage.removeItem(cacheKey.appState.aiDialog.width);
      } else {
        localStorage.setItem(cacheKey.appState.aiDialog.width, rect.width.toString());
      }
      if (rect.height === null) {
        localStorage.removeItem(cacheKey.appState.aiDialog.height);
      } else {
        localStorage.setItem(cacheKey.appState.aiDialog.height, rect.height.toString());
      }
      if (rect.x === null || rect.y === null) {
        localStorage.removeItem(cacheKey.appState.aiDialog.position);
      } else {
        localStorage.setItem(cacheKey.appState.aiDialog.position, JSON.stringify({ x: rect.x, y: rect.y }));
      }
    } catch (error) {
      logger.error('设置AI对话框矩形信息失败', { error });
    }
  }
  // 获取AI对话框视图
  getAiDialogView(): 'chat' | 'history' | 'agent' | 'config' | null {
    try {
      const view = localStorage.getItem(cacheKey.appState.aiDialog.view);
      if (view === 'chat' || view === 'history' || view === 'agent' || view === 'config') {
        return view;
      }
      return null;
    } catch (error) {
      logger.error('获取AI对话框视图失败', { error });
      return null;
    }
  }
  // 设置AI对话框视图
  setAiDialogView(view: 'chat' | 'history' | 'agent' | 'config') {
    try {
      localStorage.setItem(cacheKey.appState.aiDialog.view, view);
    } catch (error) {
      logger.error('设置AI对话框视图失败', { error });
    }
  }
  // 获取AI对话框模式
  getAiDialogMode(): 'agent' | 'ask' | null {
    try {
      const mode = localStorage.getItem(cacheKey.appState.aiDialog.mode);
      if (mode === 'agent' || mode === 'ask') {
        return mode;
      }
      return null;
    } catch (error) {
      logger.error('获取AI对话框模式失败', { error });
      return null;
    }
  }
  // 设置AI对话框模式
  setAiDialogMode(mode: 'agent' | 'ask') {
    try {
      localStorage.setItem(cacheKey.appState.aiDialog.mode, mode);
    } catch (error) {
      logger.error('设置AI对话框模式失败', { error });
    }
  }
  // 获取AI对话框模型
  getAiDialogModel(): 'deepseek' | null {
    try {
      const model = localStorage.getItem(cacheKey.appState.aiDialog.model);
      if (model === 'deepseek') {
        return model;
      }
      return null;
    } catch (error) {
      logger.error('获取AI对话框模型失败', { error });
      return null;
    }
  }
  // 设置AI对话框模型
  setAiDialogModel(model: 'deepseek') {
    try {
      localStorage.setItem(cacheKey.appState.aiDialog.model, model);
    } catch (error) {
      logger.error('设置AI对话框模型失败', { error });
    }
  }
  // 获取HTTP Mock日志视图模式
  getHttpMockLogViewMode(nodeId: string): 'compact' | 'detailed' {
    try {
      const localData: Record<string, 'compact' | 'detailed'> = JSON.parse(localStorage.getItem(cacheKey.appState.mockNode.logViewMode) || '{}');
      return localData[nodeId] || 'compact';
    } catch (error) {
      logger.error('获取Mock日志视图模式失败', { error });
      return 'compact';
    }
  }
  // 设置HTTP Mock日志视图模式
  setHttpMockLogViewMode(nodeId: string, mode: 'compact' | 'detailed') {
    try {
      const localData = JSON.parse(localStorage.getItem(cacheKey.appState.mockNode.logViewMode) || '{}');
      localData[nodeId] = mode;
      localStorage.setItem(cacheKey.appState.mockNode.logViewMode, JSON.stringify(localData));
    } catch (error) {
      logger.error('设置Mock日志视图模式失败', { error });
      const data: Record<string, 'compact' | 'detailed'> = {};
      data[nodeId] = mode;
      localStorage.setItem(cacheKey.appState.mockNode.logViewMode, JSON.stringify(data));
    }
  }
  // 获取WebSocket消息块折叠状态
  getWsMessageBlockCollapseState(nodeId: string, blockId: string): boolean {
    try {
      const localData: Record<string, Record<string, boolean>> = JSON.parse(localStorage.getItem(cacheKey.appState.websocketNode.messageBlockCollapse) || '{}');
      if (!localData[nodeId] || localData[nodeId][blockId] === undefined) {
        return false;
      }
      return localData[nodeId][blockId];
    } catch (error) {
      logger.error('获取WebSocket消息块折叠状态失败', { error });
      localStorage.setItem(cacheKey.appState.websocketNode.messageBlockCollapse, '{}');
      return false;
    }
  }
  // 设置WebSocket消息块折叠状态
  setWsMessageBlockCollapseState(nodeId: string, blockId: string, isCollapsed: boolean) {
    try {
      const localData = JSON.parse(localStorage.getItem(cacheKey.appState.websocketNode.messageBlockCollapse) || '{}');
      if (!localData[nodeId]) {
        localData[nodeId] = {};
      }
      localData[nodeId][blockId] = isCollapsed;
      localStorage.setItem(cacheKey.appState.websocketNode.messageBlockCollapse, JSON.stringify(localData));
    } catch (error) {
      logger.error('设置WebSocket消息块折叠状态失败', { error });
      const data: Record<string, Record<string, boolean>> = {};
      data[nodeId] = { [blockId]: isCollapsed };
      localStorage.setItem(cacheKey.appState.websocketNode.messageBlockCollapse, JSON.stringify(data));
    }
  }
  // 获取Banner视图模式
  getBannerViewMode(): 'list' | 'history' {
    try {
      const mode = localStorage.getItem(cacheKey.appState.banner.viewMode);
      return (mode === 'list' || mode === 'history') ? mode : 'list';
    } catch (error) {
      logger.error('获取Banner视图模式失败', { error });
      return 'list';
    }
  }
  // 设置Banner视图模式
  setBannerViewMode(mode: 'list' | 'history') {
    try {
      localStorage.setItem(cacheKey.appState.banner.viewMode, mode);
    } catch (error) {
      logger.error('设置Banner视图模式失败', { error });
    }
  }
  // 获取历史记录过滤文案
  getHistoryFilterText(): string {
    try {
      return localStorage.getItem(cacheKey.appState.banner.historyFilterText) || '';
    } catch (error) {
      logger.error('获取历史记录过滤文案失败', { error });
      return '';
    }
  }
  // 设置历史记录过滤文案
  setHistoryFilterText(text: string) {
    try {
      localStorage.setItem(cacheKey.appState.banner.historyFilterText, text);
    } catch (error) {
      logger.error('设置历史记录过滤文案失败', { error });
    }
  }
  // 获取垂直布局下响应区域高度
  getResponseHeight(): number {
    try {
      const height = localStorage.getItem(cacheKey.projectWorkbench.responseHeight);
      const parsedHeight = height ? parseInt(height, 10) : 350;
      if (parsedHeight < 300) return 300;
      if (parsedHeight > 750) return 750;
      return parsedHeight;
    } catch (error) {
      logger.error('获取响应区域高度失败', { error });
      return 350;
    }
  }
  // 设置垂直布局下响应区域高度
  setResponseHeight(height: number) {
    try {
      localStorage.setItem(cacheKey.projectWorkbench.responseHeight, height.toString());
    } catch (error) {
      logger.error('设置响应区域高度失败', { error });
    }
  }
}
export const appStateCache = new AppStateCache();