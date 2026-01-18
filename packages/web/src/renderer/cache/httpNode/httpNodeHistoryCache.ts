import { openDB, IDBPDatabase } from 'idb';
import { HttpHistory } from '@src/types/history/httpHistory';
import { HttpNode } from '@src/types/httpNode/httpNode';
import { config } from '@src/config/config';
import { nanoid } from 'nanoid/non-secure';
import { logger } from '@/helper/logger';
type HttpHistoryCacheData = {
  _id: string; // 历史记录唯一ID作为主键
  nodeId: string; // 节点ID，用于索引
  node: HttpNode; // 完整的HTTP节点信息
  operatorId: string; // 操作者ID
  operatorName: string; // 操作者名称
  timestamp: number; // 创建时间戳
};
class HttpNodeHistoryCache {
  private dbName = config.cacheConfig.httpHistoryCache.dbName;
  private storeName = config.cacheConfig.httpHistoryCache.storeName;
  private version = config.cacheConfig.httpHistoryCache.version;
  private maxHistoryPerNode = config.cacheConfig.httpHistoryCache.maxHistoryPerNode;
  private db: IDBPDatabase | null = null;
  constructor() {
    this.initDB().catch(error => {
      logger.error('初始化HTTP历史记录数据库失败', { error });
    });
  }
  // 初始化数据库
  private async initDB(): Promise<void> {
    if (this.db) {
      return;
    }
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
      logger.error('初始化HTTP历史记录数据库失败', { error });
      this.db = null;
    }
  }
  // 确保数据库已初始化
  async getDB(): Promise<IDBPDatabase> {
    if (!this.db) {
      await this.initDB();
    }
    if (!this.db) {
      throw new Error('无法初始化历史记录数据库');
    }
    return this.db;
  }
  // 根据HTTP节点ID获取历史记录
  async getHttpHistoryListByNodeId(nodeId: string): Promise<HttpHistory[]> {
    try {
      const db = await this.getDB();
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
      logger.error('获取历史记录列表失败', { error });
      return [];
    }
  }
  // 根据历史记录ID获取单条历史记录
  async getHttpHistoryById(historyId: string): Promise<HttpHistory | null> {
    try {
      const db = await this.getDB();
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
      logger.error('获取历史记录详情失败', { error });
      return null;
    }
  }
  // 为指定节点添加新的历史记录
  async addHttpHistoryByNodeId(nodeId: string, node: HttpNode, operatorId: string, operatorName: string): Promise<boolean> {
    try {
      const db = await this.getDB();
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
      const newRecord: HttpHistoryCacheData = {
        _id: nanoid(),
        nodeId,
        node: JSON.parse(JSON.stringify(node)), // 深拷贝节点数据
        operatorId,
        operatorName,
        timestamp: Date.now()
      };
      const tx3 = db.transaction(this.storeName, 'readwrite');
      await tx3.store.add(newRecord);
      await tx3.done;
      return true;
    } catch (error) {
      logger.error('添加历史记录失败', { error });
      return false;
    }
  }
  // 删除指定节点的历史记录
  async deleteHttpHistoryByNode(nodeId: string, historyIds: string[]): Promise<boolean> {
    try {
      const db = await this.getDB();
      if (historyIds.length === 0) {
        return true;
      }
      const tx = db.transaction(this.storeName, 'readwrite');
      for (const historyId of historyIds) {
        const record = await tx.store.get(historyId) as HttpHistoryCacheData | undefined;
        if (record?.nodeId === nodeId) {
          await tx.store.delete(historyId);
        }
      }
      await tx.done;
      return true;
    } catch (error) {
      logger.error('删除历史记录失败', { error });
      return false;
    }
  }
  // 清空所有历史记录数据
  async clearHttpHistory(): Promise<boolean> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(this.storeName, 'readwrite');
      await tx.store.clear();
      await tx.done;
      return true;
    } catch (error) {
      logger.error('清空历史记录失败', { error });
      return false;
    }
  }
}
export const httpNodeHistoryCache = new HttpNodeHistoryCache();