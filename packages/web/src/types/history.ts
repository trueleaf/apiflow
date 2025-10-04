import type { WebSocketNode } from './websocketNode';

/**
 * WebSocket历史记录数据类型
 */
export type WebSocketHistory = {
  /**
   * 历史记录唯一标识
   */
  _id: string;
  /**
   * 完整的WebSocket节点信息
   */
  node: WebSocketNode;
  /**
   * 操作者ID
   */
  operatorId: string;
  /**
   * 操作者名称
   */
  operatorName: string;
  /**
   * 创建时间戳
   */
  timestamp: number;
};

/**
 * WebSocket历史记录存储类型
 * key为nodeId，value为该节点的历史记录数组
 */
export type WebsocketHistoryStore = Record<string, WebSocketHistory[]>;