import { WebSocketNode, WebsocketConfig } from '@src/types/websocketNode';
import { logger } from '@/helper';
import { cacheKey } from '../cacheKey';

class WebSocketNodeCache {
  constructor() {
    if (!localStorage.getItem(cacheKey.websocketNode.websocket)) {
      localStorage.setItem(cacheKey.websocketNode.websocket, '{}');
    }
  }

  /*
   * 缓存websocket接口信息
   */
  setWebSocketNode(val: WebSocketNode) {
    try {
      const localWebSocket = JSON.parse(localStorage.getItem(cacheKey.websocketNode.websocket) || '{}');
      localWebSocket[val._id] = val;
      localStorage.setItem(cacheKey.websocketNode.websocket, JSON.stringify(localWebSocket));
    } catch (error) {
      logger.error('缓存WebSocket节点失败', { error });
      const data: Record<string, WebSocketNode> = {};
      data[val._id] = val;
      localStorage.setItem(cacheKey.websocketNode.websocket, JSON.stringify(data));
    }
  }

  /*
   * 获取缓存websocket接口信息
   */
  getWebSocketNode(id: string): WebSocketNode | null {
    try {
      const localWebSocket: Record<string, WebSocketNode> = JSON.parse(localStorage.getItem(cacheKey.websocketNode.websocket) || '{}');
      if (!localWebSocket[id]) {
        return null;
      }
      return localWebSocket[id];
    } catch (error) {
      logger.error('获取WebSocket节点失败', { error });
      localStorage.setItem(cacheKey.websocketNode.websocket, '{}')
      return null;
    }
  }

  /*
   * 获取websocket配置
   */
  getWebsocketConfig(projectId: string): WebsocketConfig | null {
    try {
      const localData: Record<string, WebsocketConfig> = JSON.parse(localStorage.getItem(cacheKey.websocketNode.config) || '{}');
      if (!localData[projectId]) {
        return null;
      }
      return localData[projectId];
    } catch (error) {
      logger.error('获取WebSocket配置失败', { error });
      localStorage.setItem(cacheKey.websocketNode.config, '{}');
      return null;
    }
  }

  /*
   * 设置websocket配置(覆盖/合并)
   */
  setWebsocketConfig(projectId: string, config: Partial<WebsocketConfig>) {
    try {
      const localData = JSON.parse(localStorage.getItem(cacheKey.websocketNode.config) || '{}');
      localData[projectId] = { ...(localData[projectId] || {}), ...config };
      localStorage.setItem(cacheKey.websocketNode.config, JSON.stringify(localData));
    } catch (error) {
      logger.error('设置WebSocket配置失败', { error });
      const data: Record<string, Partial<WebsocketConfig>> = {};
      data[projectId] = config;
      localStorage.setItem(cacheKey.websocketNode.config, JSON.stringify(data));
    }
  }
}

export const webSocketNodeCache = new WebSocketNodeCache();
