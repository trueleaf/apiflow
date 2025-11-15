import { IDBPDatabase, openDB } from 'idb';
import { MockLog } from '@src/types/mockNode';
import { config } from '@src/config/config';
import { logger } from '@/helper';
class HttpMockLogsCache {
  private storeName = config.cacheConfig.mockNodeLogsCache.storeName;
  private maxLogsPerNode = config.cacheConfig.mockNodeLogsCache.maxLogsPerNode;
  private db: IDBPDatabase | null = null;
  constructor() {
    this.initDB().catch(error => {
      logger.error('初始化Mock日志数据库失败', { error });
    });
  }
  // 初始化数据库
  private async initDB(): Promise<void> {
    try {
      if (this.db) {
        return;
      }
      this.db = await openDB(
        config.cacheConfig.mockNodeLogsCache.dbName,
        config.cacheConfig.mockNodeLogsCache.version,
        {
          upgrade(db) {
            if (!db.objectStoreNames.contains(config.cacheConfig.mockNodeLogsCache.storeName)) {
              const store = db.createObjectStore(config.cacheConfig.mockNodeLogsCache.storeName, {
                keyPath: 'id',
              });
              store.createIndex('nodeId', 'nodeId', { unique: false });
              store.createIndex('projectId', 'projectId', { unique: false });
              store.createIndex('timestamp', 'timestamp', { unique: false });
              store.createIndex('type', 'type', { unique: false });
            }
          },
        }
      );
    } catch (error) {
      logger.error('初始化Mock日志数据库失败', { error });
      this.db = null;
    }
  }
  // 确保数据库已初始化
  private async getDB(): Promise<IDBPDatabase> {
    if (!this.db) {
      await this.initDB();
    }
    if (!this.db) {
      throw new Error('无法初始化日志数据库');
    }
    return this.db;
  }
  // 添加日志
  async addLog(log: MockLog): Promise<boolean> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(this.storeName, 'readwrite');
      await tx.store.add(log);
      await tx.done;
      await this.trimLogs(log.nodeId);
      return true;
    } catch (error) {
      logger.error('写入Mock日志失败', { error });
      return false;
    }
  }
  // 根据 nodeId 获取日志列表
  async getLogsByNodeId(nodeId: string): Promise<MockLog[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(this.storeName, 'readonly');
      const index = tx.store.index('nodeId');
      const logs = await index.getAll(nodeId);
      const sortedLogs = logs.sort((a, b) => b.timestamp - a.timestamp);
      return sortedLogs;
    } catch (error) {
      logger.error('获取Mock日志列表失败', { error });
      return [];
    }
  }
  // 清空指定 nodeId 的所有日志
  async clearLogsByNodeId(nodeId: string): Promise<boolean> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(this.storeName, 'readwrite');
      const index = tx.store.index('nodeId');
      const logs = await index.getAll(nodeId);
      if (logs.length === 0) {
        await tx.done;
        return true;
      }
      for (const log of logs) {
        await tx.store.delete(log.id);
      }
      await tx.done;
      return true;
    } catch (error) {
      logger.error('清空节点Mock日志失败', { error });
      return false;
    }
  }
  // 清空指定 projectId 的所有日志
  async clearLogsByProjectId(projectId: string): Promise<boolean> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(this.storeName, 'readwrite');
      const index = tx.store.index('projectId');
      const logs = await index.getAll(projectId);
      if (logs.length === 0) {
        await tx.done;
        return true;
      }
      for (const log of logs) {
        await tx.store.delete(log.id);
      }
      await tx.done;
      return true;
    } catch (error) {
      logger.error('按项目清空Mock日志失败', { error });
      return false;
    }
  }
  // 限制指定 nodeId 的日志数量
  private async trimLogs(nodeId: string): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(this.storeName, 'readwrite');
      const index = tx.store.index('nodeId');
      const logs = await index.getAll(nodeId);
      if (logs.length <= this.maxLogsPerNode) {
        await tx.done;
        return;
      }
      const sortedLogs = logs.sort((a, b) => a.timestamp - b.timestamp);
      const logsToDelete = sortedLogs.slice(0, logs.length - this.maxLogsPerNode);
      for (const log of logsToDelete) {
        await tx.store.delete(log.id);
      }
      await tx.done;
    } catch (error) {
      logger.error('清理Mock日志失败', { error });
    }
  }
}
export const httpMockLogsCache = new HttpMockLogsCache();
