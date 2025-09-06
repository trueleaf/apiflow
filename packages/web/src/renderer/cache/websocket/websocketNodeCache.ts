/**
 * websocket文档缓存
 */

import { WebSocketNode } from '@src/types/websocket/websocket';
import { HttpResponseCache } from '../http/httpResponseCache';

class WebSocketNodeCache extends HttpResponseCache {
  constructor() {
    super();
    if (!localStorage.getItem('websocket/websocket')) {
      localStorage.setItem('websocket/websocket', '{}');
    }
    this.initApiflowHttpResponseCache();
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
}

export const webSocketNodeCache = new WebSocketNodeCache();
