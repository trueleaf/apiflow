import { openDB } from 'idb';


export type CacheManageWorkerGetIndexedDBData = {
  type: 'getIndexedDBData';
};
// 获取indexedDB数据
const getIndexedDBData = async (): Promise<void> => {
  try {
    const databases = await indexedDB.databases();
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
          let cursor = await db.transaction(storeName).store.openCursor();
          while (cursor) {
            const jsonString = JSON.stringify(cursor!.value);
            totalSize += new Blob([jsonString]).size;
            cursor = await cursor.continue();
            self.postMessage({
              type: 'changeStatus',
              data: {
                storeName,
                size: totalSize,
              }
            });
          }
        }
      } finally {
        db.close();
      } 
    }
    self.postMessage({
      type: 'finish',
      data: {}
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
