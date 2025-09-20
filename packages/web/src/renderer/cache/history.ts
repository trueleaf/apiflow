/**
 * WebSocket历史记录缓存 - 基于IndexedDB存储
 */

import { openDB, IDBPDatabase } from 'idb';
import { WebSocketHistory } from '@src/types/history';
import { WebSocketNode } from '@src/types/websocket/websocket';
import { config } from '@src/config/config';
import { uuid } from '@/helper/index';

type WebSocketHistoryCacheData = {
  _id: string; // 历史记录唯一ID作为主键
  nodeId: string; // 节点ID，用于索引
  node: WebSocketNode; // 完整的WebSocket节点信息
  operatorId: string; // 操作者ID
  operatorName: string; // 操作者名称
  timestamp: number; // 创建时间戳
};

class WebSocketHistoryCache {
  private dbName = config.cacheConfig.websocketHistoryCache.dbName;
  private storeName = config.cacheConfig.websocketHistoryCache.storeName;
  private version = config.cacheConfig.websocketHistoryCache.version;
  private maxHistoryPerNode = config.cacheConfig.websocketHistoryCache.maxHistoryPerNode;
  private db: IDBPDatabase | null = null;

  constructor() {
    this.initDB();
  }

  /**
   * 初始化数据库
   */
  private async initDB(): Promise<void> {
    try {
      this.db = await openDB(this.dbName, this.version, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('histories')) {
            const store = db.createObjectStore('histories', { keyPath: '_id' });
            store.createIndex('nodeId', 'nodeId', { unique: false });
            store.createIndex('timestamp', 'timestamp', { unique: false });
          }
        }
      });
    } catch (error) {
      console.error('初始化WebSocket历史记录数据库失败:', error);
    }
  }

  /**
   * 确保数据库已初始化
   */
  private async ensureDB(): Promise<IDBPDatabase> {
    if (!this.db) {
      await this.initDB();
    }
    if (!this.db) {
      throw new Error('无法初始化历史记录数据库');
    }
    return this.db;
  }

  /**
   * 根据节点ID获取该节点的所有历史记录
   */
  async getWsHistoryListByNodeId(nodeId: string): Promise<WebSocketHistory[]> {
    try {
      const db = await this.ensureDB();
      const tx = db.transaction(this.storeName, 'readonly');
      const index = tx.store.index('nodeId');
      const records = await index.getAll(nodeId);
      
      // 按时间戳倒序排序（最新的在前）
      const sortedRecords = records.sort((a, b) => b.timestamp - a.timestamp);
      
      return sortedRecords.map(record => ({
        _id: record._id,
        node: record.node,
        operatorId: record.operatorId,
        operatorName: record.operatorName,
        timestamp: record.timestamp
      }));
    } catch (error) {
      console.error('获取历史记录列表失败:', error);
      return [];
    }
  }

  /**
   * 根据历史记录ID获取单条历史记录的详细信息
   */
  async getWsHistoryById(historyId: string): Promise<WebSocketHistory | null> {
    try {
      const db = await this.ensureDB();
      const record = await db.get(this.storeName, historyId);
      
      if (!record) {
        return null;
      }
      
      return {
        _id: record._id,
        node: record.node,
        operatorId: record.operatorId,
        operatorName: record.operatorName,
        timestamp: record.timestamp
      };
    } catch (error) {
      console.error('获取历史记录详情失败:', error);
      return null;
    }
  }

  /**
   * 为指定节点添加新的历史记录
   */
  async addWsHistoryByNodeId(nodeId: string, node: WebSocketNode, operatorId?: string, operatorName?: string): Promise<boolean> {
    try {
      const db = await this.ensureDB();
      
      
      // 获取当前节点的历史记录数量
      const tx1 = db.transaction(this.storeName, 'readonly');
      const index = tx1.store.index('nodeId');
      const existingRecords = await index.getAll(nodeId);
      
      // 如果超过限制，删除最旧的记录
      if (existingRecords.length >= this.maxHistoryPerNode) {
        const sortedRecords = existingRecords.sort((a, b) => a.timestamp - b.timestamp);
        const recordsToDelete = sortedRecords.slice(0, existingRecords.length - this.maxHistoryPerNode + 1);
        
        const tx2 = db.transaction(this.storeName, 'readwrite');
        for (const record of recordsToDelete) {
          await tx2.store.delete(record._id);
        }
        await tx2.done;
      }
      
      // 添加新的历史记录
      const newRecord: WebSocketHistoryCacheData = {
        _id: uuid(),
        nodeId,
        node: JSON.parse(JSON.stringify(node)), // 深拷贝节点数据
        operatorId: operatorId || 'me',
        operatorName: operatorName || 'me',
        timestamp: Date.now()
      };
      
      const tx3 = db.transaction(this.storeName, 'readwrite');
      await tx3.store.add(newRecord);
      await tx3.done;
      
      return true;
    } catch (error) {
      console.error('添加历史记录失败:', error);
      return false;
    }
  }

  /**
   * 删除指定节点的历史记录
   */
  async deleteWsHistoryByNode(nodeId: string, historyIds?: string[]): Promise<boolean> {
    try {
      const db = await this.ensureDB();
      
      if (historyIds && historyIds.length > 0) {
        // 删除指定的历史记录
        const tx = db.transaction(this.storeName, 'readwrite');
        for (const historyId of historyIds) {
          await tx.store.delete(historyId);
        }
        await tx.done;
      } else {
        // 删除该节点的所有历史记录
        const tx1 = db.transaction(this.storeName, 'readonly');
        const index = tx1.store.index('nodeId');
        const records = await index.getAll(nodeId);
        
        const tx2 = db.transaction(this.storeName, 'readwrite');
        for (const record of records) {
          await tx2.store.delete(record._id);
        }
        await tx2.done;
      }
      
      return true;
    } catch (error) {
      console.error('删除历史记录失败:', error);
      return false;
    }
  }

  /**
   * 清空所有历史记录数据
   */
  async clearWsHistory(): Promise<boolean> {
    try {
      const db = await this.ensureDB();
      const tx = db.transaction(this.storeName, 'readwrite');
      await tx.store.clear();
      await tx.done;
      return true;
    } catch (error) {
      console.error('清空历史记录失败:', error);
      return false;
    }
  }
}

export const webSocketHistoryCache = new WebSocketHistoryCache();
