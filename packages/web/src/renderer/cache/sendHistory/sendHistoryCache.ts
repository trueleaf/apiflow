import { openDB, IDBPDatabase } from 'idb';
import { config } from '@src/config/config';
import { logger } from '@/helper';
import { nanoid } from 'nanoid/non-secure';
import type { SendHistoryItem, SendHistoryCacheData, AddSendHistoryParams } from '@src/types/history/sendHistory';

class SendHistoryCache {
  private db: IDBPDatabase | null = null;
  private dbName = config.cacheConfig.sendHistoryCache.dbName;
  private storeName = config.cacheConfig.sendHistoryCache.storeName;
  private version = config.cacheConfig.sendHistoryCache.version;
  private maxHistory = config.cacheConfig.sendHistoryCache.maxHistory;
  private onAddCallback: (() => void) | null = null;

  // 设置添加记录后的回调
  setOnAddCallback(callback: () => void): void {
    this.onAddCallback = callback;
  }

  constructor() {
    this.initDB().catch(error => {
      logger.error('初始化发送历史记录数据库失败', { error });
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
      logger.error('初始化发送历史记录数据库失败', { error });
      this.db = null;
    }
  }
  // 获取数据库实例
  private async getDB(): Promise<IDBPDatabase> {
    if (!this.db) {
      await this.initDB();
    }
    if (!this.db) {
      throw new Error('无法初始化发送历史记录数据库');
    }
    return this.db;
  }
  // 添加发送历史记录
  async addSendHistory(params: AddSendHistoryParams): Promise<boolean> {
    try {
      const db = await this.getDB();
      // 检查当前记录数量
      const tx1 = db.transaction(this.storeName, 'readonly');
      const count = await tx1.store.count();
      // 如果超过限制，删除最旧的记录
      if (count >= this.maxHistory) {
        const tx2 = db.transaction(this.storeName, 'readonly');
        const index = tx2.store.index('timestamp');
        const cursor = await index.openCursor();
        const recordsToDelete: string[] = [];
        let deleteCount = count - this.maxHistory + 1;
        let currentCursor = cursor;
        while (currentCursor && deleteCount > 0) {
          recordsToDelete.push(currentCursor.value._id);
          deleteCount--;
          currentCursor = await currentCursor.continue();
        }
        if (recordsToDelete.length > 0) {
          const tx3 = db.transaction(this.storeName, 'readwrite');
          for (const id of recordsToDelete) {
            await tx3.store.delete(id);
          }
          await tx3.done;
        }
      }
      // 添加新记录
      const newRecord: SendHistoryCacheData = {
        _id: nanoid(),
        nodeId: params.nodeId,
        nodeName: params.nodeName,
        nodeType: params.nodeType,
        method: params.method,
        protocol: params.protocol,
        url: params.url,
        timestamp: Date.now(),
        operatorName: params.operatorName
      };
      const tx4 = db.transaction(this.storeName, 'readwrite');
      await tx4.store.add(newRecord);
      await tx4.done;
      // 调用回调通知更新
      if (this.onAddCallback) {
        this.onAddCallback();
      }
      return true;
    } catch (error) {
      logger.error('添加发送历史记录失败', { error });
      return false;
    }
  }
  // 获取发送历史列表（分页）
  async getMergedSendHistoryList(limit: number = 50, offset: number = 0): Promise<SendHistoryItem[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(this.storeName, 'readonly');
      const index = tx.store.index('timestamp');
      const records: SendHistoryCacheData[] = [];
      let cursor = await index.openCursor(null, 'prev');
      let skipped = 0;
      let collected = 0;
      while (cursor && collected < limit) {
        if (skipped < offset) {
          skipped++;
        } else {
          records.push(cursor.value);
          collected++;
        }
        cursor = await cursor.continue();
      }
      return records;
    } catch (error) {
      logger.error('获取发送历史列表失败', { error });
      return [];
    }
  }
  // 搜索发送历史
  async searchSendHistory(keyword: string, limit: number = 50): Promise<SendHistoryItem[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(this.storeName, 'readonly');
      const allRecords = await tx.store.getAll() as SendHistoryCacheData[];
      const lowerKeyword = keyword.toLowerCase();
      const filteredRecords = allRecords.filter(record => {
        const name = record.nodeName?.toLowerCase() || '';
        const url = record.url?.toLowerCase() || '';
        return name.includes(lowerKeyword) || url.includes(lowerKeyword);
      });
      const sortedRecords = filteredRecords.sort((a, b) => b.timestamp - a.timestamp);
      return sortedRecords.slice(0, limit);
    } catch (error) {
      logger.error('搜索发送历史失败', { error });
      return [];
    }
  }
  // 获取发送历史总数
  async getMergedSendHistoryCount(): Promise<number> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(this.storeName, 'readonly');
      return await tx.store.count();
    } catch (error) {
      logger.error('获取发送历史总数失败', { error });
      return 0;
    }
  }
  // 根据节点ID获取发送历史
  async getSendHistoryByNodeId(nodeId: string, limit: number = 50): Promise<SendHistoryItem[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(this.storeName, 'readonly');
      const index = tx.store.index('nodeId');
      const records = await index.getAll(nodeId) as SendHistoryCacheData[];
      const sortedRecords = records.sort((a, b) => b.timestamp - a.timestamp);
      return sortedRecords.slice(0, limit);
    } catch (error) {
      logger.error('根据节点ID获取发送历史失败', { error });
      return [];
    }
  }
  // 删除指定节点的发送历史
  async deleteSendHistoryByNodeId(nodeId: string): Promise<boolean> {
    try {
      const db = await this.getDB();
      const tx1 = db.transaction(this.storeName, 'readonly');
      const index = tx1.store.index('nodeId');
      const records = await index.getAll(nodeId) as SendHistoryCacheData[];
      const tx2 = db.transaction(this.storeName, 'readwrite');
      for (const record of records) {
        await tx2.store.delete(record._id);
      }
      await tx2.done;
      return true;
    } catch (error) {
      logger.error('删除发送历史失败', { error });
      return false;
    }
  }
  // 清空所有发送历史
  async clearSendHistory(): Promise<boolean> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(this.storeName, 'readwrite');
      await tx.store.clear();
      await tx.done;
      return true;
    } catch (error) {
      logger.error('清空发送历史失败', { error });
      return false;
    }
  }
}

export const sendHistoryCache = new SendHistoryCache();
