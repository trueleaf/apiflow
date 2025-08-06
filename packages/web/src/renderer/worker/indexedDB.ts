import { IndexedDBItem, StoreDetailItem, StoreDetailResponse } from '@src/types/apidoc/cache.ts';
import { openDB } from 'idb';


export type CacheManageWorkerGetIndexedDBData = {
  type: 'getIndexedDBData';
};

export type CacheManageWorkerGetStoreDetail = {
  type: 'getStoreDetail';
  dbName: string;
  storeName: string;
  pageNum: number;
  pageSize: number;
};

export type CacheManageWorkerDeleteStore = {
  type: 'deleteStore';
  dbName: string;
  storeName: string;
  size?: number;
};

export type CacheManageWorkerDeleteStoreItem = {
  type: 'deleteStoreItem';
  dbName: string;
  storeName: string;
  key: string;
  size: number;
};

export type CacheManageWorkerMessage =
  | CacheManageWorkerGetIndexedDBData
  | CacheManageWorkerGetStoreDetail
  | CacheManageWorkerDeleteStore
  | CacheManageWorkerDeleteStoreItem;
const storeNameMap: Record<string, string> = {
  "responseCache": "返回值缓存",
  "commonHeaders": "公共请求头缓存",
  "docs": "文档缓存",
  "projects": "项目缓存",
  "rules": "规则缓存",
  "variables": "变量缓存",
}
// 获取indexedDB数据
const getIndexedDBData = async (): Promise<void> => {
  try {
    const databases = await indexedDB.databases();
    const indexedDBList: IndexedDBItem[] = [];
    let totalSize = 0;
    for(let { name: dbName } of databases) {
      if (!dbName) {
        return
      }
      // 使用idb打开数据库
      const db = await openDB(dbName)
      if (!db) return;
      const storeNames = Array.from(db.objectStoreNames);
      try {
        for(let i = 0; i < storeNames.length; i ++) {
          const storeName = storeNames[i]
          let storeSize = 0;
          let cursor = await db.transaction(storeName).store.openCursor();
          while (cursor) {
            const jsonString = JSON.stringify(cursor!.value);
            const jsonSize = new Blob([jsonString]).size
            totalSize += jsonSize;
            storeSize += jsonSize;
            if (jsonSize > 1025 * 1024 * 100) {
              console.log(`Store ${storeName} item size exceeds 100KB:`, cursor!.key, cursor.value);

            }
            cursor = await cursor.continue();
            self.postMessage({
              type: 'changeStatus',
              data: {
                storeName,
                size: totalSize,
              }
            });
          }
          indexedDBList.push({
            size: storeSize,
            storeName,
            dbName,
            description: storeNameMap[storeName] || '未知类型缓存'
          })
        }
      } finally {
        db.close();
      } 
    }
    self.postMessage({
      type: 'finish',
      data: indexedDBList
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error
    });
    console.error(error);
  }
};

/*
|--------------------------------------------------------------------------
| 获取指定store的详细数据（分页）
|--------------------------------------------------------------------------
*/
const getStoreDetail = async (dbName: string, storeName: string, pageNum: number, pageSize: number): Promise<void> => {
  
  try {
    const db = await openDB(dbName);
    if (!db) {
      self.postMessage({
        type: 'error',
        error: new Error(`无法打开数据库: ${dbName}`)
      });
      return;
    }

    try {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.store;
      // 获取所有数据
      const allData: StoreDetailItem[] = [];
      let cursor = await store.openCursor();

      while (cursor) {
        const key = cursor.key as string;
        const value = cursor.value;
        const blob = new Blob([JSON.stringify(value)], { type: 'application/json' });
        allData.push({
          key,
          value,
          size: blob.size
        });
        cursor = await cursor.continue();
      }

      // 计算分页数据
      const total = allData.length;
      const startIndex = (pageNum - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const data = allData.slice(startIndex, endIndex);
      const response: StoreDetailResponse = {
        data,
        total,
        currentPage: pageNum,
        pageSize
      };

      self.postMessage({
        type: 'storeDetailResult',
        data: response
      });

    } finally {
      db.close();
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error
    });
    console.error('获取store详情失败:', error);
  }
};

/*
|--------------------------------------------------------------------------
| 删除指定的store
|--------------------------------------------------------------------------
*/
const deleteStore = async (dbName: string, storeName: string, size?: number): Promise<void> => {
  try {
    const db = await openDB(dbName);
    if (!db) {
      self.postMessage({
        type: 'error',
        error: new Error(`无法打开数据库: ${dbName}`)
      });
      return;
    }

    try {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.store;

      // 清空store中的所有数据
      await store.clear();
      await transaction.done;

      self.postMessage({
        type: 'deleteStoreResult',
        data: { success: true, dbName, storeName, size }
      });

    } finally {
      db.close();
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error
    });
    console.error('删除store失败:', error);
  }
};

// 删除store中的单个数据项
const deleteStoreItem = async (dbName: string, storeName: string, key: string, size: number): Promise<void> => {
  try {
    const db = await openDB(dbName);
    if (!db) {
      throw new Error(`无法打开数据库: ${dbName}`);
    }

    if (!db.objectStoreNames.contains(storeName)) {
      throw new Error(`数据库 ${dbName} 中不存在存储 ${storeName}`);
    }

    try {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.store;

      // 删除指定key的数据
      await store.delete(key);
      await transaction.done;

      self.postMessage({
        type: 'deleteStoreItemResult',
        data: { success: true, dbName, storeName, key, size }
      });

    } finally {
      db.close();
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error
    });
    console.error('删除数据项失败:', error);
  }
};

// 监听主线程消息
self.addEventListener('message', (event: MessageEvent<CacheManageWorkerMessage>) => {
  const { type } = event.data;

  if (type === 'getIndexedDBData') {
    getIndexedDBData();
  } else if (type === 'getStoreDetail') {
    const { dbName, storeName, pageNum, pageSize } = event.data;
    getStoreDetail(dbName, storeName, pageNum, pageSize);
  } else if (type === 'deleteStore') {
    const { dbName, storeName, size } = event.data;
    deleteStore(dbName, storeName, size);
  } else if (type === 'deleteStoreItem') {
    const { dbName, storeName, key, size } = event.data;
    deleteStoreItem(dbName, storeName, key, size);
  }
});
