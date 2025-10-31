/**
 * 获取IndexedDB中的数据项数量
 */
export const getIndexedDBItemCount = async (excludeDbNames?: string[]): Promise<number> => {
  try {
    // 获取所有数据库
    const databases = await indexedDB.databases();
    let totalItemCount = 0;

    for (const { name: dbName } of databases) {
      if (!dbName) continue;

      // 如果数据库名在排除列表中，跳过
      if (excludeDbNames && excludeDbNames.includes(dbName)) {
        continue;
      }

      try {
        // 使用idb打开数据库
        const { openDB } = await import('idb');
        const db = await openDB(dbName);
        if (!db) continue;

        const storeNames = Array.from(db.objectStoreNames);

        try {
          for (const storeName of storeNames) {
            try {
              // 为每个store创建新的事务，避免事务超时
              const transaction = db.transaction(storeName, 'readonly');
              const store = transaction.store;
              const count = await store.count();
              totalItemCount += count;

              // 等待事务完成
              await transaction.done;
            } catch (storeError) {
              console.warn(`统计存储 ${storeName} 数量时出错:`, storeError);
              continue;
            }
          }
        } finally {
          db.close();
        }
      } catch (error) {
        console.warn(`无法打开数据库 ${dbName}:`, error);
        continue;
      }
    }

    return totalItemCount;
  } catch (error) {
    console.error('获取IndexedDB数据项数量失败:', error);
    // 如果获取失败，返回默认值
    return 0;
  }
};
