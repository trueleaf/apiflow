import type { WebSocketNode } from '../websocketNode';

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
 * WebSocket历史记录缓存数据类型（IndexedDB存储结构）
 */
export type WebSocketHistoryCacheData = {
  /**
   * 历史记录唯一ID作为主键
   */
  _id: string;
  /**
   * 节点ID，用于索引
   */
  nodeId: string;
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