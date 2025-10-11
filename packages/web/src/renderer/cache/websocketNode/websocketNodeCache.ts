/**
 * websocket文档缓存
 */

import { WebSocketNode, WebsocketConfig } from '@src/types/websocketNode';

class WebSocketNodeCache {
  constructor() {
    if (!localStorage.getItem('websocketNode/websocket')) {
      localStorage.setItem('websocketNode/websocket', '{}');
    }
  }

  /*
   * 缓存websocket接口信息
   */
  setWebSocketNode(val: WebSocketNode) {
    try {
      const localWebSocket = JSON.parse(localStorage.getItem('websocketNode/websocket') || '{}');
      localWebSocket[val._id] = val;
      localStorage.setItem('websocketNode/websocket', JSON.stringify(localWebSocket));
    } catch (error) {
      console.error(error);
      const data: Record<string, WebSocketNode> = {};
      data[val._id] = val;
      localStorage.setItem('websocketNode/websocket', JSON.stringify(data));
    }
  }

  /*
   * 获取缓存websocket接口信息
   */
  getWebSocketNode(id: string): WebSocketNode | null {
    try {
      const localWebSocket: Record<string, WebSocketNode> = JSON.parse(localStorage.getItem('websocketNode/websocket') || '{}');
      if (!localWebSocket[id]) {
        return null;
      }
      return localWebSocket[id];
    } catch (error) {
      console.error(error);
      localStorage.setItem('websocketNode/websocket', '{}')
      return null;
    }
  }

  /*
   * 根据tabId获取不发送公共请求头
   */
  getWsIgnoredCommonHeaderByTabId(projectId: string, tabId: string): string[] | null {
    try {
      const localData = JSON.parse(localStorage.getItem('websocketNode/commonHeaders/ignore') || '{}') as Record<string, Record<string, string[]>>;
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
  setWsIgnoredCommonHeader(options: { projectId: string; tabId: string; ignoreHeaderId: string }) {
    try {
      const { projectId, tabId, ignoreHeaderId } = options;
      const localData = JSON.parse(localStorage.getItem('websocketNode/commonHeaders/ignore') || '{}') as Record<string, Record<string, string[]>>;
      if (localData[projectId] == null) {
        localData[projectId] = {}
      }
      if (localData[projectId][tabId] == null) {
        localData[projectId][tabId] = []
      }
      const matchedTab = localData[projectId][tabId];
      matchedTab.push(ignoreHeaderId);
      localStorage.setItem('websocketNode/commonHeaders/ignore', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      localStorage.setItem('websocketNode/commonHeaders/ignore', '{}');
    }
  }

  /*
   * 删除不发送的公共请求头
   */
  removeWsIgnoredCommonHeader(options: { projectId: string; tabId: string; ignoreHeaderId: string }) {
    try {
      const { projectId, tabId, ignoreHeaderId } = options;
      const localData = JSON.parse(localStorage.getItem('websocketNode/commonHeaders/ignore') || '{}') as Record<string, Record<string, string[]>>;
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
        localStorage.setItem('websocketNode/commonHeaders/ignore', JSON.stringify(localData));
      }
    } catch (error) {
      console.error(error);
      localStorage.setItem('websocketNode/commonHeaders/ignore', '{}');
    }
  }

  /*
   * 获取websocket配置
   */
  getWebsocketConfig(projectId: string): WebsocketConfig | null {
    try {
      const localData: Record<string, WebsocketConfig> = JSON.parse(localStorage.getItem('websocketNode/config') || '{}');
      if (!localData[projectId]) {
        return null;
      }
      return localData[projectId];
    } catch (error) {
      console.error(error);
      localStorage.setItem('websocketNode/config', '{}');
      return null;
    }
  }

  /*
   * 设置websocket配置(覆盖/合并)
   */
  setWebsocketConfig(projectId: string, config: Partial<WebsocketConfig>) {
    try {
      const localData = JSON.parse(localStorage.getItem('websocketNode/config') || '{}');
      localData[projectId] = { ...(localData[projectId] || {}), ...config };
      localStorage.setItem('websocketNode/config', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const data: Record<string, any> = {};
      data[projectId] = config;
      localStorage.setItem('websocketNode/config', JSON.stringify(data));
    }
  }
}

export const webSocketNodeCache = new WebSocketNodeCache();
