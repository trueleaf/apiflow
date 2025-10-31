import { IDBPDatabase, openDB } from 'idb';
import { MockLog } from '@src/types/mockNode';
import { config } from '@src/config/config';
let mockLogsDB: IDBPDatabase | null = null;
// 初始化 Mock Logs DB
async function initMockLogsDB(): Promise<IDBPDatabase> {
  if (mockLogsDB) return mockLogsDB;
  mockLogsDB = await openDB(
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
  return mockLogsDB;
}
// 获取 Mock Logs DB（自动初始化）
async function getMockLogsDB(): Promise<IDBPDatabase> {
  if (!mockLogsDB) {
    await initMockLogsDB();
  }
  return mockLogsDB!;
}
class HttpMockLogsCache {
  private storeName = config.cacheConfig.mockNodeLogsCache.storeName;
  private maxLogsPerNode = config.cacheConfig.mockNodeLogsCache.maxLogsPerNode;
  private db: IDBPDatabase | null = null;
  private logQueue: MockLog[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private logCounts: Map<string, number> = new Map();
  private readonly BATCH_INTERVAL = 100;
  private readonly TRIM_THRESHOLD = 50;
  constructor() {
    this.initDB();
    this.loadLogCounts();
  }
  // 初始化数据库
  private async initDB(): Promise<void> {
    try {
      this.db = await getMockLogsDB();
    } catch (error) {
      // 初始化数据库失败
    }
  }
  // 加载各节点的日志数量到内存
  private async loadLogCounts(): Promise<void> {
    try {
      const db = await this.ensureDB();
      const tx = db.transaction(this.storeName, 'readonly');
      const index = tx.store.index('nodeId');
      const allKeys = await index.getAllKeys();
      const nodeCounts = new Map<string, number>();
      for (const key of allKeys) {
        const nodeId = String(key);
        nodeCounts.set(nodeId, (nodeCounts.get(nodeId) || 0) + 1);
      }
      this.logCounts = nodeCounts;
    } catch (error) {
      // 加载计数失败
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
  // 添加日志（批量写入）
  async addLog(log: MockLog): Promise<boolean> {
    try {
      this.logQueue.push(log);
      if (!this.flushTimer) {
        this.flushTimer = setTimeout(() => this.flush(), this.BATCH_INTERVAL);
      }
      return true;
    } catch (error) {
      return false;
    }
  }
  // 批量刷新日志到数据库
  private async flush(): Promise<void> {
    if (this.logQueue.length === 0) {
      this.flushTimer = null;
      return;
    }
    const logsToFlush = [...this.logQueue];
    this.logQueue = [];
    this.flushTimer = null;
    try {
      const db = await this.ensureDB();
      const tx = db.transaction(this.storeName, 'readwrite');
      for (const log of logsToFlush) {
        await tx.store.add(log);
        const currentCount = this.logCounts.get(log.nodeId) || 0;
        this.logCounts.set(log.nodeId, currentCount + 1);
      }
      await tx.done;
      const nodeIdsToTrim = new Set<string>();
      for (const log of logsToFlush) {
        const count = this.logCounts.get(log.nodeId) || 0;
        if (count > this.maxLogsPerNode + this.TRIM_THRESHOLD) {
          nodeIdsToTrim.add(log.nodeId);
        }
      }
      for (const nodeId of nodeIdsToTrim) {
        await this.trimLogsForNode(nodeId);
      }
    } catch (error) {
      // 批量写入失败
    }
  }
  // 立即刷新（用于需要同步的场景）
  async forceFlush(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flush();
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
      await this.forceFlush();
      const db = await this.ensureDB();
      const tx1 = db.transaction(this.storeName, 'readonly');
      const index = tx1.store.index('nodeId');
      const logs = await index.getAll(nodeId);
      if (logs.length === 0) {
        this.logCounts.delete(nodeId);
        return true;
      }
      const tx2 = db.transaction(this.storeName, 'readwrite');
      for (const log of logs) {
        await tx2.store.delete(log.id);
      }
      await tx2.done;
      this.logCounts.delete(nodeId);
      return true;
    } catch (error) {
      return false;
    }
  }
  // 清空指定 projectId 的所有日志
  async clearLogsByProjectId(projectId: string): Promise<boolean> {
    try {
      await this.forceFlush();
      const db = await this.ensureDB();
      const tx1 = db.transaction(this.storeName, 'readonly');
      const index = tx1.store.index('projectId');
      const logs = await index.getAll(projectId);
      if (logs.length === 0) {
        return true;
      }
      const nodeIds = new Set(logs.map(log => log.nodeId));
      const tx2 = db.transaction(this.storeName, 'readwrite');
      for (const log of logs) {
        await tx2.store.delete(log.id);
      }
      await tx2.done;
      for (const nodeId of nodeIds) {
        this.logCounts.delete(nodeId);
      }
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
        this.logCounts.set(nodeId, logs.length);
        return;
      }
      const sortedLogs = logs.sort((a, b) => a.timestamp - b.timestamp);
      const logsToDelete = sortedLogs.slice(0, logs.length - this.maxLogsPerNode);
      const tx2 = db.transaction(this.storeName, 'readwrite');
      for (const log of logsToDelete) {
        await tx2.store.delete(log.id);
      }
      await tx2.done;
      this.logCounts.set(nodeId, this.maxLogsPerNode);
    } catch (error) {
      // 清理日志失败
    }
  }
}
export const httpMockLogsCache = new HttpMockLogsCache();
