import { openDB, IDBPDatabase } from 'idb';
import { WebsocketResponse } from '@src/types/websocketNode';
import { config } from '@src/config/config';
import { nanoid } from 'nanoid/non-secure';
import { logger } from '@/helper';

type WebsocketResponseCacheData = {
  id: string; // 数据唯一ID作为主键
  nodeId: string; // 节点ID
  response: WebsocketResponse; // 单个响应数据
  updatedAt: number; // 最后更新时间
};

class WebsocketResponseCache {
  private dbName = config.cacheConfig.websocketNodeResponseCache.dbName;
  private storeName = 'responses';
  private version = config.cacheConfig.websocketNodeResponseCache.version;
  private singleResponseSize = config.cacheConfig.websocketNodeResponseCache.singleResponseSize;
  private db: IDBPDatabase | null = null;

  constructor() {
    this.initDB().catch(error => {
      logger.error('初始化WebSocket响应缓存数据库失败', { error });
    });
  }

  /**
   * 初始化数据库
   */
  private async initDB(): Promise<void> {
    if (this.db) {
      return;
    }
    try {
      this.db = await openDB(this.dbName, this.version, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('responses')) {
            const store = db.createObjectStore('responses', { keyPath: 'id' });
            store.createIndex('nodeId', 'nodeId', { unique: false });
          }
        }
      });
    } catch (error) {
      logger.error('初始化WebSocket响应缓存数据库失败', { error });
      this.db = null;
    }
  }

  /**
   * 确保数据库已初始化
   */
  private async getDB(): Promise<IDBPDatabase> {
    if (!this.db) {
      await this.initDB();
    }
    if (!this.db) {
      throw new Error('数据库初始化失败');
    }
    return this.db;
  }
  // 存储单个响应数据
  async setResponseByNodeId(nodeId: string, response: WebsocketResponse): Promise<void> {
    try {
      // 检查单个响应大小限制
      const responseSize = new Blob([JSON.stringify(response)]).size;
      if (responseSize > this.singleResponseSize) {
        logger.warn(`单个WebSocket响应过大 (${responseSize} bytes)，超过限制 (${this.singleResponseSize} bytes)`);
        return;
      }

      const db = await this.getDB();
      // 为响应创建唯一ID
      const dataId = nanoid();
      
      const data: WebsocketResponseCacheData = {
        id: dataId,
        nodeId,
        response,
        updatedAt: Date.now()
      };

      const tx = db.transaction(this.storeName, 'readwrite');
      await tx.store.put(data);
      await tx.done;
    } catch (error) {
      logger.error('存储单个WebSocket响应数据失败', { error });
    }
  }
  // 获取数据
  async getResponseByNodeId(nodeId: string): Promise<WebsocketResponse[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(this.storeName, 'readonly');
      const index = tx.store.index('nodeId');
      const dataList = await index.getAll(nodeId);
      await tx.done;
      // 按时间排序并返回响应数据
      return dataList
        .sort((a, b) => a.updatedAt - b.updatedAt)
        .map(item => item.response);
    } catch (error) {
      logger.error('获取WebSocket响应数据失败', { error });
      return [];
    }
  }
  // 清空指定节点的响应数据
  async clearResponseByNodeId(nodeId: string): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(this.storeName, 'readwrite');
      const index = tx.store.index('nodeId');
      let cursor = await index.openCursor(nodeId);
      while (cursor) {
        await cursor.delete();
        cursor = await cursor.continue();
      }
      await tx.done;
    } catch (error) {
      logger.error('清空指定节点WebSocket响应数据失败', { error });
    }
  }
  // 清空所有响应数据
  async clearAllResponse(): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(this.storeName, 'readwrite');
      await tx.store.clear();
      await tx.done;
    } catch (error) {
      logger.error('清空所有WebSocket响应数据失败', { error });
    }
  }
}

export const websocketResponseCache = new WebsocketResponseCache();

