/**
 * websocket文档缓存
 */

import { WebSocketNode } from '@src/types/websocket/websocket';
import { ResponseCache } from './responseCache';
import type { ApidocCookie } from '@src/renderer/store/apidoc/cookies';

class WebSocketNodeCache extends ResponseCache {
  constructor() {
    super();
    if (!localStorage.getItem('websocket/paramsConfig')) {
      localStorage.setItem('websocket/paramsConfig', '{}');
    }
    if (!localStorage.getItem('websocket/websocket')) {
      localStorage.setItem('websocket/websocket', '{}');
    }
    this.initApiflowResponseCache();
  }

  /**
   * 获取当前被选中的tab
   */
  getActiveParamsTab(id: string): string | null {
    try {
      const localActiveTab: Record<string, string> = JSON.parse(localStorage.getItem('websocket/paramsActiveTab') || '{}');
      if (!localActiveTab[id]) {
        return null;
      }
      return localActiveTab[id];
    } catch (error) {
      console.error(error);
      localStorage.setItem('websocket/paramsActiveTab', '{}')
      return null;
    }
  }

  /**
   * 设置当前被选中的tab
   */
  setActiveParamsTab(id: string, val: string) {
    try {
      const localActiveTab = JSON.parse(localStorage.getItem('websocket/paramsActiveTab') || '{}');
      localActiveTab[id] = val;
      localStorage.setItem('websocket/paramsActiveTab', JSON.stringify(localActiveTab));
    } catch (error) {
      console.error(error);
      const data: Record<string, string> = {};
      data[id] = val;
      localStorage.setItem('websocket/paramsActiveTab', JSON.stringify(data));
    }
  }

  /*
   * 缓存websocket接口信息
   */
  setWebSocket(val: WebSocketNode) {
    try {
      const localWebSocket = JSON.parse(localStorage.getItem('websocket/websocket') || '{}');
      localWebSocket[val._id] = val;
      localStorage.setItem('websocket/websocket', JSON.stringify(localWebSocket));
    } catch (error) {
      console.error(error);
      const data: Record<string, WebSocketNode> = {};
      data[val._id] = val;
      localStorage.setItem('websocket/websocket', JSON.stringify(data));
    }
  }

  /*
   * 获取缓存websocket接口信息
   */
  getWebSocket(id: string): WebSocketNode | null {
    try {
      const localWebSocket: Record<string, WebSocketNode> = JSON.parse(localStorage.getItem('websocket/websocket') || '{}');
      if (!localWebSocket[id]) {
        return null;
      }
      return localWebSocket[id];
    } catch (error) {
      console.error(error);
      localStorage.setItem('websocket/websocket', '{}')
      return null;
    }
  }
  /*
   * 获取websocket连接状态折叠状态
   */
  getWebSocketCollapseState(): Record<string, boolean> {
    try {
      const localData: Record<string, boolean> = JSON.parse(localStorage.getItem('websocket/collapse') || '{}');
      return localData;
    } catch (error) {
      console.error(error);
      return {};
    }
  }

  /*
   * 设置websocket连接状态折叠状态
   */
  setWebSocketCollapseState(id: string, isShow: boolean) {
    try {
      const localData = JSON.parse(localStorage.getItem('websocket/collapse') || '{}');
      localData[id] = isShow;
      localStorage.setItem('websocket/collapse', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      localStorage.setItem('websocket/collapse', '{}');
    }
  }

  /*
   * 获取缓存的websocket连接配置
   */
  getWebSocketConnectionConfig(projectId: string): Record<string, unknown> | null {
    try {
      const localData: Record<string, Record<string, unknown>> = JSON.parse(localStorage.getItem('websocket/connectionConfig') || '{}');
      if (localData[projectId] == null) {
        return null;
      }
      return localData[projectId];
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  /*
   * 设置缓存的websocket连接配置
   */
  setWebSocketConnectionConfig(projectId: string, config: Record<string, unknown>) {
    try {
      const localData = JSON.parse(localStorage.getItem('websocket/connectionConfig') || '{}');
      localData[projectId] = config;
      localStorage.setItem('websocket/connectionConfig', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      localStorage.setItem('websocket/connectionConfig', '{}');
    }
  }

  /*
   * 获取websocket消息历史记录
   */
  getWebSocketMessageHistory(connectionId: string): Array<{
    id: string;
    type: 'send' | 'receive';
    content: string;
    timestamp: number;
    messageType: 'text' | 'binary';
  }> {
    try {
      const localData: Record<string, Array<any>> = JSON.parse(localStorage.getItem('websocket/messageHistory') || '{}');
      if (!localData[connectionId]) {
        return [];
      }
      return localData[connectionId];
    } catch (error) {
      console.error(error);
      localStorage.setItem('websocket/messageHistory', '{}');
      return [];
    }
  }

  /*
   * 设置websocket消息历史记录
   */
  setWebSocketMessageHistory(connectionId: string, messages: Array<{
    id: string;
    type: 'send' | 'receive';
    content: string;
    timestamp: number;
    messageType: 'text' | 'binary';
  }>) {
    try {
      const localData = JSON.parse(localStorage.getItem('websocket/messageHistory') || '{}');
      localData[connectionId] = messages;
      localStorage.setItem('websocket/messageHistory', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const data: Record<string, Array<any>> = {};
      data[connectionId] = messages;
      localStorage.setItem('websocket/messageHistory', JSON.stringify(data));
    }
  }

  /*
   * 添加websocket消息到历史记录
   */
  addWebSocketMessage(connectionId: string, message: {
    id: string;
    type: 'send' | 'receive';
    content: string;
    timestamp: number;
    messageType: 'text' | 'binary';
  }) {
    try {
      const messages = this.getWebSocketMessageHistory(connectionId);
      messages.push(message);
      // 限制历史记录数量，避免占用过多存储空间
      const maxHistorySize = 1000;
      if (messages.length > maxHistorySize) {
        messages.splice(0, messages.length - maxHistorySize);
      }
      this.setWebSocketMessageHistory(connectionId, messages);
    } catch (error) {
      console.error(error);
    }
  }

  /*
   * 清除websocket消息历史记录
   */
  clearWebSocketMessageHistory(connectionId: string) {
    try {
      const localData = JSON.parse(localStorage.getItem('websocket/messageHistory') || '{}');
      delete localData[connectionId];
      localStorage.setItem('websocket/messageHistory', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      localStorage.setItem('websocket/messageHistory', '{}');
    }
  }

  /*
   * 获取websocket连接状态缓存
   */
  getWebSocketConnectionState(connectionId: string): {
    status: 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting';
    lastConnectedTime?: number;
    lastDisconnectedTime?: number;
    reconnectAttempts?: number;
  } | null {
    try {
      const localData: Record<string, any> = JSON.parse(localStorage.getItem('websocket/connectionState') || '{}');
      if (!localData[connectionId]) {
        return null;
      }
      return localData[connectionId];
    } catch (error) {
      console.error(error);
      localStorage.setItem('websocket/connectionState', '{}');
      return null;
    }
  }

  /*
   * 设置websocket连接状态缓存
   */
  setWebSocketConnectionState(connectionId: string, state: {
    status: 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting';
    lastConnectedTime?: number;
    lastDisconnectedTime?: number;
    reconnectAttempts?: number;
  }) {
    try {
      const localData = JSON.parse(localStorage.getItem('websocket/connectionState') || '{}');
      localData[connectionId] = state;
      localStorage.setItem('websocket/connectionState', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const data: Record<string, any> = {};
      data[connectionId] = state;
      localStorage.setItem('websocket/connectionState', JSON.stringify(data));
    }
  }

  /*
   * 获取缓存的websocket代码钩子
   */
  getWebSocketHookCodeById(projectId: string): string | null {
    try {
      const localData: Record<string, string> = JSON.parse(localStorage.getItem('websocket/hookCode') || '{}');
      if (localData[projectId] == null) {
        return null;
      }
      return localData[projectId];
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  /*
   * 设置缓存的websocket代码钩子
   */
  setWebSocketHookCode(projectId: string, code: string) {
    try {
      const localData = JSON.parse(localStorage.getItem('websocket/hookCode') || '{}');
      localData[projectId] = code;
      localStorage.setItem('websocket/hookCode', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      localStorage.setItem('websocket/hookCode', '{}');
    }
  }

  /*
   * 根据tabId获取不发送公共请求头
   */
  getIgnoredCommonHeaderByTabId(projectId: string, tabId: string): string[] | null {
    try {
      const localData = JSON.parse(localStorage.getItem('websocket/commonHeaders/ignore') || '{}') as Record<string, Record<string, string[]>>;
      if (localData[projectId] == null) {
        return [];
      }
      if (localData[projectId][tabId] == null) {
        return [];
      }
      return localData[projectId][tabId];
    } catch (error) {
      console.error(error);
      return []
    }
  }

  /*
   * 设置不发送的公共请求头
   */
  setIgnoredCommonHeader(options: { projectId: string; tabId: string; ignoreHeaderId: string }) {
    try {
      const { projectId, tabId, ignoreHeaderId } = options;
      const localData = JSON.parse(localStorage.getItem('websocket/commonHeaders/ignore') || '{}') as Record<string, Record<string, string[]>>;
      if (localData[projectId] == null) {
        localData[projectId] = {}
      }
      if (localData[projectId][tabId] == null) {
        localData[projectId][tabId] = []
      }
      const matchedTab = localData[projectId][tabId];
      matchedTab.push(ignoreHeaderId);
      localStorage.setItem('websocket/commonHeaders/ignore', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      localStorage.setItem('websocket/commonHeaders/ignore', '{}');
    }
  }

  /*
   * 删除不发送的公共请求头
   */
  removeIgnoredCommonHeader(options: { projectId: string; tabId: string; ignoreHeaderId: string }) {
    try {
      const { projectId, tabId, ignoreHeaderId } = options;
      const localData = JSON.parse(localStorage.getItem('websocket/commonHeaders/ignore') || '{}') as Record<string, Record<string, string[]>>;
      if (localData[projectId] == null) {
        return false;
      }
      if (localData[projectId][tabId] == null) {
        return false;
      }
      const matchedTab = localData[projectId][tabId];
      const deleteIndex = matchedTab.findIndex(id => ignoreHeaderId === id);
      if (deleteIndex !== -1) {
        matchedTab.splice(deleteIndex, 1);
        localStorage.setItem('websocket/commonHeaders/ignore', JSON.stringify(localData));
      }
    } catch (error) {
      console.error(error);
      localStorage.setItem('websocket/commonHeaders/ignore', '{}');
    }
  }

  /*
   * 缓存websocket cookie（ApidocCookie[]）
   */
  setWebSocketCookies(projectId: string, cookies: ApidocCookie[]) {
    try {
      const localData = JSON.parse(localStorage.getItem('websocket/cookies') || '{}');
      localData[projectId] = cookies;
      localStorage.setItem('websocket/cookies', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const data: Record<string, ApidocCookie[]> = {};
      data[projectId] = cookies;
      localStorage.setItem('websocket/cookies', JSON.stringify(data));
    }
  }

  /*
   * 获取缓存websocket cookie（ApidocCookie[]）
   */
  getWebSocketCookies(projectId: string): ApidocCookie[] {
    try {
      const localData: Record<string, ApidocCookie[]> = JSON.parse(localStorage.getItem('websocket/cookies') || '{}');
      if (!localData[projectId]) {
        return [];
      }
      return localData[projectId];
    } catch (error) {
      console.error(error);
      localStorage.setItem('websocket/cookies', '{}');
      return [];
    }
  }

  /*
   * 获取websocket pre-request的sessionStorage
   */
  getWebSocketPreRequestSessionStorage(projectId: string): Record<string, unknown> | null {
    try {
      const localData: Record<string, Record<string, unknown>> = JSON.parse(sessionStorage.getItem('websocket/preRequest/sessionStorage') || '{}');
      if (!localData[projectId]) {
        return null;
      }
      return localData[projectId];
    } catch (error) {
      console.error(error);
      sessionStorage.setItem('websocket/preRequest/sessionStorage', '{}');
      return null;
    }
  }

  /*
   * 设置websocket pre-request的sessionStorage
   */
  setWebSocketPreRequestSessionStorage(projectId: string, data: Record<string, unknown>) {
    try {
      const localData = JSON.parse(sessionStorage.getItem('websocket/preRequest/sessionStorage') || '{}');
      localData[projectId] = data;
      sessionStorage.setItem('websocket/preRequest/sessionStorage', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const newData: Record<string, Record<string, unknown>> = {};
      newData[projectId] = data;
      sessionStorage.setItem('websocket/preRequest/sessionStorage', JSON.stringify(newData));
    }
  }

  /*
   * 获取websocket pre-request的localStorage
   */
  getWebSocketPreRequestLocalStorage(projectId: string): Record<string, any> | null {
    try {
      const localData: Record<string, Record<string, any>> = JSON.parse(localStorage.getItem('websocket/preRequest/localStorage') || '{}');
      if (!localData[projectId]) {
        return null;
      }
      return localData[projectId];
    } catch (error) {
      console.error(error);
      localStorage.setItem('websocket/preRequest/localStorage', '{}');
      return null;
    }
  }

  /*
   * 设置websocket pre-request的localStorage
   */
  setWebSocketPreRequestLocalStorage(projectId: string, data: Record<string, any>) {
    try {
      const localData = JSON.parse(localStorage.getItem('websocket/preRequest/localStorage') || '{}');
      localData[projectId] = data;
      localStorage.setItem('websocket/preRequest/localStorage', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const newData: Record<string, Record<string, any>> = {};
      newData[projectId] = data;
      localStorage.setItem('websocket/preRequest/localStorage', JSON.stringify(newData));
    }
  }

  /*
   * 获取websocket worker全局local状态
   */
  getWebSocketWorkerLocalStateById(projectId: string): null | Record<string, unknown> {
    try {
      const localData: Record<string, Record<string, unknown>> = JSON.parse(localStorage.getItem('websocket/worker/localState') || '{}');
      if (localData[projectId] == null) {
        return null;
      }
      return localData[projectId];
    } catch (error) {
      console.error(error);
      return null
    }
  }

  /*
   * 设置websocket worker全局local状态
   */
  setWebSocketWorkerLocalState(projectId: string, state: Record<string, unknown>) {
    try {
      const localData = JSON.parse(localStorage.getItem('websocket/worker/localState') || '{}');
      localData[projectId] = state;
      localStorage.setItem('websocket/worker/localState', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      localStorage.setItem('websocket/worker/localState', '{}');
    }
  }

  /*
   * 获取websocket编辑tabs
   */
  getWebSocketEditTabs(): Record<string, any[]> {
    try {
      const localData = JSON.parse(localStorage.getItem('websocket/tabs') || '{}');
      return localData;
    } catch (error) {
      console.error(error);
      localStorage.setItem('websocket/tabs', '{}');
      return {};
    }
  }

  /*
   * 设置websocket编辑tabs
   */
  setWebSocketEditTabs(tabs: Record<string, any[]>) {
    try {
      localStorage.setItem('websocket/tabs', JSON.stringify(tabs));
    } catch (error) {
      console.error(error);
      localStorage.setItem('websocket/tabs', '{}');
    }
  }

  /*
   * 获取websocket自动重连配置
   */
  getWebSocketAutoReconnectConfig(projectId: string): {
    enabled: boolean;
    maxAttempts: number;
    delay: number;
    backoffFactor: number;
  } | null {
    try {
      const localData: Record<string, any> = JSON.parse(localStorage.getItem('websocket/autoReconnect') || '{}');
      if (!localData[projectId]) {
        return null;
      }
      return localData[projectId];
    } catch (error) {
      console.error(error);
      localStorage.setItem('websocket/autoReconnect', '{}');
      return null;
    }
  }

  /*
   * 设置websocket自动重连配置
   */
  setWebSocketAutoReconnectConfig(projectId: string, config: {
    enabled: boolean;
    maxAttempts: number;
    delay: number;
    backoffFactor: number;
  }) {
    try {
      const localData = JSON.parse(localStorage.getItem('websocket/autoReconnect') || '{}');
      localData[projectId] = config;
      localStorage.setItem('websocket/autoReconnect', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const data: Record<string, any> = {};
      data[projectId] = config;
      localStorage.setItem('websocket/autoReconnect', JSON.stringify(data));
    }
  }

  /*
   * 获取websocket连接页面的活跃tab
   */
  getActiveTab(id: string): string | null {
    try {
      const localActiveTab: Record<string, string> = JSON.parse(localStorage.getItem('websocket/connectionActiveTab') || '{}');
      if (!localActiveTab[id]) {
        return null;
      }
      return localActiveTab[id];
    } catch (error) {
      console.error(error);
      localStorage.setItem('websocket/connectionActiveTab', '{}')
      return null;
    }
  }

  /*
   * 设置websocket连接页面的活跃tab
   */
  setActiveTab(id: string, val: string) {
    try {
      const localActiveTab = JSON.parse(localStorage.getItem('websocket/connectionActiveTab') || '{}');
      localActiveTab[id] = val;
      localStorage.setItem('websocket/connectionActiveTab', JSON.stringify(localActiveTab));
    } catch (error) {
      console.error(error);
      const data: Record<string, string> = {};
      data[id] = val;
      localStorage.setItem('websocket/connectionActiveTab', JSON.stringify(data));
    }
  }

  /*
   * 获取websocket节点的"发送并清空"checkbox状态
   */
  getWebSocketSendAndClearState(nodeId: string): boolean {
    try {
      const localData: Record<string, boolean> = JSON.parse(localStorage.getItem('websocket/sendAndClearState') || '{}');
      return localData[nodeId] || false;
    } catch (error) {
      console.error(error);
      localStorage.setItem('websocket/sendAndClearState', '{}');
      return false;
    }
  }

  /*
   * 设置websocket节点的"发送并清空"checkbox状态
   */
  setWebSocketSendAndClearState(nodeId: string, state: boolean) {
    try {
      const localData = JSON.parse(localStorage.getItem('websocket/sendAndClearState') || '{}');
      localData[nodeId] = state;
      localStorage.setItem('websocket/sendAndClearState', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const data: Record<string, boolean> = {};
      data[nodeId] = state;
      localStorage.setItem('websocket/sendAndClearState', JSON.stringify(data));
    }
  }

  /*
   * 获取websocket节点的消息类型
   */
  getWebSocketMessageType(nodeId: string): string {
    try {
      const localData: Record<string, string> = JSON.parse(localStorage.getItem('websocket/messageType') || '{}');
      return localData[nodeId] || 'text';
    } catch (error) {
      console.error(error);
      localStorage.setItem('websocket/messageType', '{}');
      return 'text';
    }
  }

  /*
   * 设置websocket节点的消息类型
   */
  setWebSocketMessageType(nodeId: string, type: string) {
    try {
      const localData = JSON.parse(localStorage.getItem('websocket/messageType') || '{}');
      localData[nodeId] = type;
      localStorage.setItem('websocket/messageType', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const data: Record<string, string> = {};
      data[nodeId] = type;
      localStorage.setItem('websocket/messageType', JSON.stringify(data));
    }
  }
}

export const webSocketNodeCache = new WebSocketNodeCache();
