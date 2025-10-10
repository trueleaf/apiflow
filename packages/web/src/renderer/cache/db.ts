import { openDB, IDBPDatabase } from 'idb';
import { config } from '@src/config/config';

// ============================================================================
// Standalone Database（显式初始化 - 用于离线模式）
// ============================================================================
let standaloneDB: IDBPDatabase | null = null;

// 初始化 standalone 数据库
export async function initStandaloneDB(): Promise<IDBPDatabase> {
  if (standaloneDB) return standaloneDB;

  standaloneDB = await openDB(
    config.standaloneCache.dbName,
    config.standaloneCache.version,
    {
      upgrade(db) {
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects');
        }
        if (!db.objectStoreNames.contains('httpNodeList')) {
          const httpNodeListStore = db.createObjectStore('httpNodeList');
          // 添加 projectId 索引以优化按项目查询
          httpNodeListStore.createIndex('projectId', 'projectId', { unique: false });
        }
        if (!db.objectStoreNames.contains('commonHeaders')) {
          db.createObjectStore('commonHeaders');
        }
        if (!db.objectStoreNames.contains('rules')) {
          db.createObjectStore('rules');
        }
        if (!db.objectStoreNames.contains('variables')) {
          const variablesStore = db.createObjectStore('variables');
          // 添加 projectId 索引以优化按项目查询变量
          variablesStore.createIndex('projectId', 'projectId', { unique: false });
        }
      },
    }
  );

  return standaloneDB;
}

// 获取 standalone DB（必须先调用 initStandaloneDB）
export function getStandaloneDB(): IDBPDatabase {
  if (!standaloneDB) {
    throw new Error('Standalone DB not initialized. Call initStandaloneDB() first in offline mode.');
  }
  return standaloneDB;
}

// ============================================================================
// HTTP Response Cache Database（懒加载）
// ============================================================================
let httpResponseDB: IDBPDatabase | null = null;

async function initHttpResponseDB(): Promise<IDBPDatabase> {
  if (httpResponseDB) return httpResponseDB;

  httpResponseDB = await openDB(
    config.cacheConfig.apiflowResponseCache.dbName,
    config.cacheConfig.apiflowResponseCache.version,
    {
      upgrade(db: IDBPDatabase) {
        // 创建响应缓存存储
        if (!db.objectStoreNames.contains('httpResponseCache')) {
          db.createObjectStore('httpResponseCache');
        }
        // 创建分块存储
        if (!db.objectStoreNames.contains('responseChunks')) {
          db.createObjectStore('responseChunks');
        }
        // 创建元数据存储
        if (!db.objectStoreNames.contains('responseMetadata')) {
          db.createObjectStore('responseMetadata');
        }
      },
    }
  );

  return httpResponseDB;
}

// 获取 HTTP Response DB（自动初始化）
export async function getHttpResponseDB(): Promise<IDBPDatabase> {
  if (!httpResponseDB) {
    await initHttpResponseDB();
  }
  return httpResponseDB!;
}

// ============================================================================
// WebSocket Response Cache Database（懒加载）
// ============================================================================
let websocketResponseDB: IDBPDatabase | null = null;

async function initWebsocketResponseDB(): Promise<IDBPDatabase> {
  if (websocketResponseDB) return websocketResponseDB;

  websocketResponseDB = await openDB(
    config.cacheConfig.websocketNodeResponseCache.dbName,
    config.cacheConfig.websocketNodeResponseCache.version,
    {
      upgrade(db) {
        if (!db.objectStoreNames.contains('responses')) {
          const store = db.createObjectStore('responses', { keyPath: 'id' });
          store.createIndex('nodeId', 'nodeId', { unique: false });
        }
      },
    }
  );

  return websocketResponseDB;
}

// 获取 WebSocket Response DB（自动初始化）
export async function getWebsocketResponseDB(): Promise<IDBPDatabase> {
  if (!websocketResponseDB) {
    await initWebsocketResponseDB();
  }
  return websocketResponseDB!;
}

// ============================================================================
// WebSocket History Cache Database（懒加载）
// ============================================================================
let websocketHistoryDB: IDBPDatabase | null = null;

async function initWebsocketHistoryDB(): Promise<IDBPDatabase> {
  if (websocketHistoryDB) return websocketHistoryDB;

  websocketHistoryDB = await openDB(
    config.cacheConfig.websocketHistoryCache.dbName,
    config.cacheConfig.websocketHistoryCache.version,
    {
      upgrade(db) {
        if (!db.objectStoreNames.contains(config.cacheConfig.websocketHistoryCache.storeName)) {
          const store = db.createObjectStore(config.cacheConfig.websocketHistoryCache.storeName, {
            keyPath: 'id',
          });
          store.createIndex('nodeId', 'nodeId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      },
    }
  );

  return websocketHistoryDB;
}

// 获取 WebSocket History DB（自动初始化）
export async function getWebsocketHistoryDB(): Promise<IDBPDatabase> {
  if (!websocketHistoryDB) {
    await initWebsocketHistoryDB();
  }
  return websocketHistoryDB!;
}

// ============================================================================
// Mock Variable Cache Database（懒加载）
// ============================================================================
let mockVariableDB: IDBPDatabase | null = null;

async function initMockVariableDB(): Promise<IDBPDatabase> {
  if (mockVariableDB) return mockVariableDB;

  mockVariableDB = await openDB(
    config.cacheConfig.mockVariableCache.dbName,
    config.cacheConfig.mockVariableCache.version,
    {
      upgrade(database, _oldVersion, _newVersion, transaction) {
        const store = database.objectStoreNames.contains(config.cacheConfig.mockVariableCache.storeName)
          ? transaction.objectStore(config.cacheConfig.mockVariableCache.storeName)
          : database.createObjectStore(config.cacheConfig.mockVariableCache.storeName, { keyPath: '_id' });
        if (!store.indexNames.contains(config.cacheConfig.mockVariableCache.projectIdIndex)) {
          store.createIndex(config.cacheConfig.mockVariableCache.projectIdIndex, 'projectId', { unique: false });
        }
      },
    }
  );

  return mockVariableDB;
}

// 获取 Mock Variable DB（自动初始化）
export async function getMockVariableDB(): Promise<IDBPDatabase> {
  if (!mockVariableDB) {
    await initMockVariableDB();
  }
  return mockVariableDB!;
}
