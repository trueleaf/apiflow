import { openDB, IDBPDatabase } from 'idb';
import type { ApidocVariable } from '@src/types';
import { config } from '@src/config/config';
import { logger } from '@/helper/logger';
type MockVariableCacheDBSchema = {
  mockVariables: {
    key: string;
    value: ApidocVariable;
    indexes: {
      projectId: string;
    };
  };
};
export class MockVariableCache {
  private readonly dbName = config.cacheConfig.mockNodeVariableCache.dbName;
  private readonly version = config.cacheConfig.mockNodeVariableCache.version;
  private db: IDBPDatabase<MockVariableCacheDBSchema> | null = null;
  constructor() {
    this.initDB().catch((error) => {
      logger.error('初始化Mock变量数据库失败', { error });
    });
  }
  private async initDB(): Promise<void> {
    if (this.db) {
      return;
    }
    try {
      this.db = await openDB<MockVariableCacheDBSchema>(this.dbName, this.version, {
        upgrade(database, _oldVersion, _newVersion, transaction) {
          const store = database.objectStoreNames.contains('mockVariables')
            ? transaction.objectStore('mockVariables')
            : database.createObjectStore('mockVariables', { keyPath: '_id' });
          if (!store.indexNames.contains('projectId')) {
            store.createIndex('projectId', 'projectId', { unique: false });
          }
        },
      });
    } catch (error) {
      logger.error('初始化Mock变量数据库失败', { error });
      this.db = null;
    }
  }
  private async getDB(): Promise<IDBPDatabase<MockVariableCacheDBSchema>> {
    if (!this.db) {
      await this.initDB();
    }
    if (!this.db) {
      throw new Error('Mock变量数据库初始化失败');
    }
    return this.db;
  }
  private async getStore(mode: IDBTransactionMode) {
    const db = await this.getDB();
    return db.transaction('mockVariables', mode).store;
  }
  async addVariable(variable: ApidocVariable): Promise<ApidocVariable> {
    try {
      const store = await this.getStore('readwrite');
      await store.put?.(variable);
      await store.transaction.done;
      return variable;
    } catch (error) {
      logger.error('写入Mock变量失败', { error });
      return variable;
    }
  }
  async updateVariableById(id: string, updates: Partial<ApidocVariable>): Promise<ApidocVariable | null> {
    try {
      const store = await this.getStore('readwrite');
      const target = await store.get(id);
      if (!target) {
        return null;
      }
      const updated: ApidocVariable = { ...target, ...updates };
      await store.put?.(updated);
      await store.transaction.done;
      return updated;
    } catch (error) {
      logger.error('更新Mock变量失败', { error });
      return null;
    }
  }
  async deleteVariables(ids: string[]): Promise<void> {
    if (!ids.length) {
      return;
    }
    try {
      const store = await this.getStore('readwrite');
      await Promise.all(ids.map((variableId) => store.delete?.(variableId)));
      await store.transaction.done;
    } catch (error) {
      logger.error('删除Mock变量失败', { error });
    }
  }
  async getVariablesByProjectId(projectId: string): Promise<ApidocVariable[]> {
    try {
      const store = await this.getStore('readonly');
      const index = store.index('projectId');
      const variables = await index.getAll(projectId);
      await store.transaction.done;
      return variables;
    } catch (error) {
      logger.error('获取Mock变量列表失败', { error });
      return [];
    }
  }
}
export const mockVariableCache = new MockVariableCache();