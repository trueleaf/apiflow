import { IndexedDBItem } from '@src/types/apidoc/cache.ts';
import { openDB } from 'idb';


export type CacheManageWorkerGetIndexedDBData = {
  type: 'getIndexedDBData';
};
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
      let storeSize = 0;
      try {
        for(let i = 0; i < storeNames.length; i ++) {
          const storeName = storeNames[i]
          let cursor = await db.transaction(storeName).store.openCursor();
          while (cursor) {
            const jsonString = JSON.stringify(cursor!.value);
            const jsonSize = new Blob([jsonString]).size
            totalSize += jsonSize;
            storeSize += jsonSize;
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
      console.log(storeNames)
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

// 监听主线程消息
self.addEventListener('message', (event: MessageEvent<CacheManageWorkerGetIndexedDBData>) => {
  const { type } = event.data;
  if (type === 'getIndexedDBData') {
    getIndexedDBData();
  }
});
