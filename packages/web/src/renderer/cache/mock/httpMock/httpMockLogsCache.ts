import { IDBPDatabase } from 'idb';
import { MockLog } from '@src/types/mockNode';
import { config } from '@src/config/config';
import { getMockLogsDB } from '../../db';
class HttpMockLogsCache {
  private storeName = config.cacheConfig.mockLogsCache.storeName;
  private maxLogsPerNode = config.cacheConfig.mockLogsCache.maxLogsPerNode;
  private db: IDBPDatabase | null = null;
  constructor() {
    this.initDB();
  }
  // 初始化数据库
  private async initDB(): Promise<void> {
    try {
      this.db = await getMockLogsDB();
    } catch (error) {
      // 初始化数据库失败
    }
  }
  // 确保数据库已初始化
  private async ensureDB(): Promise<IDBPDatabase> {
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
      const db = await this.ensureDB();
      const tx = db.transaction(this.storeName, 'readwrite');
      await tx.store.add(log);
      await tx.done;
      await this.trimLogsForNode(log.nodeId);
      return true;
    } catch (error) {
      return false;
    }
  }
  // 根据 nodeId 获取日志列表
  async getLogsByNodeId(nodeId: string): Promise<MockLog[]> {
    try {
      const db = await this.ensureDB();
      const tx = db.transaction(this.storeName, 'readonly');
      const index = tx.store.index('nodeId');
      const logs = await index.getAll(nodeId);
      const sortedLogs = logs.sort((a, b) => b.timestamp - a.timestamp);
      return sortedLogs;
    } catch (error) {
      return [];
    }
  }
  // 清空指定 nodeId 的所有日志
  async clearLogsByNodeId(nodeId: string): Promise<boolean> {
    try {
      const db = await this.ensureDB();
      const tx1 = db.transaction(this.storeName, 'readonly');
      const index = tx1.store.index('nodeId');
      const logs = await index.getAll(nodeId);
      if (logs.length === 0) {
        return true;
      }
      const tx2 = db.transaction(this.storeName, 'readwrite');
      for (const log of logs) {
        await tx2.store.delete(log.id);
      }
      await tx2.done;
      return true;
    } catch (error) {
      return false;
    }
  }
  // 清空指定 projectId 的所有日志
  async clearLogsByProjectId(projectId: string): Promise<boolean> {
    try {
      const db = await this.ensureDB();
      const tx1 = db.transaction(this.storeName, 'readonly');
      const index = tx1.store.index('projectId');
      const logs = await index.getAll(projectId);
      if (logs.length === 0) {
        return true;
      }
      const tx2 = db.transaction(this.storeName, 'readwrite');
      for (const log of logs) {
        await tx2.store.delete(log.id);
      }
      await tx2.done;
      return true;
    } catch (error) {
      return false;
    }
  }
  // 限制指定 nodeId 的日志数量
  private async trimLogsForNode(nodeId: string): Promise<void> {
    try {
      const db = await this.ensureDB();
      const tx1 = db.transaction(this.storeName, 'readonly');
      const index = tx1.store.index('nodeId');
      const logs = await index.getAll(nodeId);
      if (logs.length <= this.maxLogsPerNode) {
        return;
      }
      const sortedLogs = logs.sort((a, b) => a.timestamp - b.timestamp);
      const logsToDelete = sortedLogs.slice(0, logs.length - this.maxLogsPerNode);
      const tx2 = db.transaction(this.storeName, 'readwrite');
      for (const log of logsToDelete) {
        await tx2.store.delete(log.id);
      }
      await tx2.done;
    } catch (error) {
      // 清理日志失败
    }
  }
}
export const httpMockLogsCache = new HttpMockLogsCache();
