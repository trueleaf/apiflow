import { openDB, IDBPDatabase } from 'idb';
import type { ApidocVariable } from '@src/types';
import { config } from '@src/config/config';

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
      console.error('Failed to init MockVariableCache database:', error);
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
      this.db = null;
      throw error;
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
      console.error('Failed to persist variable:', error);
      throw error;
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
      console.error('Failed to update variable:', error);
      throw error;
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
      console.error('Failed to delete variables:', error);
      throw error;
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
      console.error('Failed to query variables by project:', error);
      return [];
    }
  }

  async getVariablesById(variableId: string): Promise<ApidocVariable | null> {
    try {
      const store = await this.getStore('readonly');
      const variable = await store.get(variableId);
      await store.transaction.done;
      return variable ?? null;
    } catch (error) {
      console.error('Failed to query variable by id:', error);
      return null;
    }
  }
}

export const mockVariableCache = new MockVariableCache();
