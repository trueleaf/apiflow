import { CacheManageProgressUpdateMsg, CacheManageErrorMsg, CacheManageIndexedDBDetail, CacheManageDataResultMsg, CacheManageStoreResult, CacheManageDatabaseInfo, CacheManageDatabaseResult, CacheManageWorkerReadyMsg, CacheManageGetIndexedDBDataMsg } from "@src/types/apidoc/worker.ts";

/*
|--------------------------------------------------------------------------
| 工具函数，消息发送，闲时执行
|--------------------------------------------------------------------------
*/
/**
 * 发送进度更新消息到主线程
 * @param progress - 进度百分比 (0-100)
 * @param status - 当前处理状态描述
 */
const sendProgress = (progress: number, status: string): void => {
  const message: CacheManageProgressUpdateMsg = {
    type: 'progressUpdate',
    data: {
      progress: Math.round(progress),
      status
    }
  };
  self.postMessage(message);
};

/**
 * 发送错误消息到主线程
 * @param error - 错误信息
 */
const sendError = (error: Error | string): void => {
  const message = error instanceof Error ? error.message : error;
  const stack = error instanceof Error ? error.stack : undefined;
  
  const errorMsg: CacheManageErrorMsg = {
    type: 'error',
    data: { message, stack }
  };
  
  self.postMessage(errorMsg);
};

/**
 * 发送结果数据到主线程
 * @param result - 结果数据
 */
const sendResult = (result: { totalSize: number; details: CacheManageIndexedDBDetail[] }): void => {
  const message: CacheManageDataResultMsg = {
    type: 'dataResult',
    data: result
  };
  self.postMessage(message);
};

/**
 * 使用 requestIdleCallback 在浏览器空闲时执行任务
 * 如果不支持 requestIdleCallback，则使用 setTimeout 作为降级方案
 * @param callback - 要执行的回调函数
 * @param timeout - 超时时间（毫秒）
 */
const scheduleIdleTask = (callback: () => void, timeout: number = 5000): void => {
  if (typeof self.requestIdleCallback === 'function') {
    self.requestIdleCallback(callback, { timeout });
  } else {
    // 降级方案：使用 setTimeout
    setTimeout(callback, 0);
  }
};

/*
|--------------------------------------------------------------------------
| 数据处理函数
|--------------------------------------------------------------------------
*/
/**
 * 生成存储描述信息
 * @param dbName - 数据库名称
 * @param storeName - 存储名称
 * @returns 描述信息
 */
const generateDescription = (dbName: string, storeName: string): string => {
  if (dbName === 'standaloneCache') {
    // 独立缓存数据库
    switch (storeName) {
      case 'projects': return '项目信息缓存存储';
      case 'docs': return 'API文档数据缓存存储';
      case 'commonHeaders': return '通用请求头缓存存储';
      case 'rules': return '项目规则配置缓存存储';
      case 'variables': return '项目变量缓存存储';
      default: return `独立缓存-${storeName}存储`;
    }
  } 
  
  if (dbName === 'apiflowResponseCache') {
    // API 响应缓存数据库
    return storeName === 'responseCache' 
      ? '响应结果缓存存储' 
      : `API响应缓存-${storeName}存储`;
  }
  
  return `${dbName}-${storeName}存储`;
};

/**
 * 处理单个对象存储
 * @param db - 数据库实例
 * @param storeName - 存储名称
 * @param dbName - 数据库名称
 * @returns Promise 包含 size 和 detail 的对象
 */
const processSingleStore = (
  db: IDBDatabase,
  storeName: string,
  dbName: string,
): Promise<CacheManageStoreResult> => {
  return new Promise((resolve, reject) => {
    // 创建事务并获取对象存储
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    // 获取所有数据
    const request = store.getAll();

    request.onsuccess = () => {
      const allData = request.result || [];

      // 在空闲时计算数据大小
      scheduleIdleTask(() => {
        try {
          // 计算当前对象存储的数据大小
          let storeSize = 0;
          const totalItems = allData.length;

          // 逐个处理每个 item，并更新进度
          for (let i = 0; i < totalItems; i++) {
            const data = allData[i];
            // 将数据序列化为 JSON 字符串并计算字节大小
            const jsonString = JSON.stringify(data);
            storeSize += new Blob([jsonString]).size;

            // 每处理一个 item 就更新进度
            progressManager.incrementProcessed(dbName, storeName, i);
          }

          // 生成中文描述信息
          const description = generateDescription(dbName, storeName);

          resolve({
            size: storeSize,
            detail: {
              name: `${dbName}/${storeName}`,
              size: storeSize,
              description
            }
          });
        } catch (error) {
          sendError(`处理存储 ${dbName}/${storeName} 时出错: ${error}`);
          reject(error);
        }
      });
    };

    request.onerror = () => {
      sendError(`获取存储 ${dbName}/${storeName} 数据失败: ${request.error}`);
      reject(request.error);
    };
  });
};

/**
 * 处理单个数据库
 * @param dbInfo - 数据库信息
 * @returns Promise 包含 totalSize 和 details 的对象
 */
const processSingleDatabase = (
  dbInfo: CacheManageDatabaseInfo
): Promise<CacheManageDatabaseResult> => {
  return new Promise((resolve, reject) => {
    // 打开数据库连接
    const request = indexedDB.open(dbInfo.name, dbInfo.version);

    request.onsuccess = async () => {
      const db = request.result;
      let totalSize = 0;
      const details: CacheManageIndexedDBDetail[] = [];

      try {
        // 遍历数据库中的所有对象存储
        const storeNames = Array.from(db.objectStoreNames);

        // 顺序处理所有存储，确保进度计算的准确性
        for (const storeName of storeNames) {
          try {
            const storeResult = await processSingleStore(db, storeName, dbInfo.name);
            totalSize += storeResult.size;
            details.push(storeResult.detail);
          } catch (error) {
            console.warn(`获取对象存储 ${storeName} 数据失败:`, error);
          }
        }

        // 关闭数据库连接
        db.close();

        resolve({ totalSize, details });

      } catch (error) {
        db.close();
        reject(error);
      }
    };

    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('数据库被阻塞'));
  });
};

/*
|--------------------------------------------------------------------------
| 进度管理
|--------------------------------------------------------------------------
*/
/**
 * 进度管理器
 */
class ProgressManager {
  private totalItems = 0;
  private processedItems = 0;

  /**
   * 设置总 item 数量
   */
  setTotalItems(total: number): void {
    this.totalItems = total;
    this.processedItems = 0;
  }

  /**
   * 增加已处理的 item 数量并发送进度更新
   */
  incrementProcessed(dbName: string, storeName: string, itemIndex: number): void {
    this.processedItems++;
    const progress = this.totalItems > 0 ? Math.min(100, (this.processedItems / this.totalItems) * 100) : 0;
    const status = `${dbName}/${storeName}/item${itemIndex + 1}`;
    sendProgress(progress, status);
  }

  /**
   * 获取当前进度百分比
   */
  getCurrentProgress(): number {
    return this.totalItems > 0 ? Math.min(100, (this.processedItems / this.totalItems) * 100) : 0;
  }
}

// 创建全局进度管理器实例
const progressManager = new ProgressManager();

/*
|--------------------------------------------------------------------------
| 主逻辑函数
|--------------------------------------------------------------------------
*/
/**
 * 获取 IndexedDB 缓存信息的主要函数
 */
const getIndexedDBData = async (): Promise<void> => {
  try {
    sendProgress(0, '开始获取 IndexedDB 数据库列表...');

    let totalSize = 0;
    const details: CacheManageIndexedDBDetail[] = [];

    // 获取所有 IndexedDB 数据库
    const databases = await indexedDB.databases();
    sendProgress(5, `发现 ${databases.length} 个数据库`);

    if (databases.length === 0) {
      sendResult({
        totalSize: 0,
        details: []
      });
      return;
    }

    const validDatabases = databases.filter(dbInfo => dbInfo.name);

    // 第一步：计算所有数据库中所有 store 的总 item 数量
    sendProgress(10, '正在计算总 item 数量...');
    let totalItems = 0;

    for (const dbInfo of validDatabases) {
      const dbName = dbInfo.name || '未知数据库';
      try {
        const request = indexedDB.open(dbName, dbInfo.version);
        const db = await new Promise<IDBDatabase>((resolve, reject) => {
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
          request.onblocked = () => reject(new Error('数据库被阻塞'));
        });

        const storeNames = Array.from(db.objectStoreNames);

        // 计算每个 store 的 item 数量
        for (const storeName of storeNames) {
          try {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const countRequest = store.count();

            const itemCount = await new Promise<number>((resolve, reject) => {
              countRequest.onsuccess = () => resolve(countRequest.result);
              countRequest.onerror = () => reject(countRequest.error);
            });

            totalItems += itemCount;
          } catch (error) {
            console.warn(`无法获取 store ${dbName}/${storeName} 的 item 数量:`, error);
          }
        }

        db.close();
      } catch (error) {
        console.warn(`无法打开数据库 ${dbName}:`, error);
      }
    }

    sendProgress(15, `总共发现 ${totalItems} 个 items`);

    // 如果没有找到任何 items
    if (totalItems === 0) {
      sendResult({
        totalSize: 0,
        details: []
      });
      return;
    }

    // 设置总 item 数量到进度管理器
    progressManager.setTotalItems(totalItems);

    // 第二步：处理所有数据库和 stores
    for (const dbInfo of validDatabases) {
      const dbName = dbInfo.name || '未知数据库';

      try {
        const dbResult = await processSingleDatabase({
          name: dbName,
          version: dbInfo.version
        });

        totalSize += dbResult.totalSize;
        details.push(...dbResult.details);
      } catch (error) {
        console.warn(`处理数据库 ${dbName} 失败:`, error);
      }
    }

    sendProgress(95, '正在整理数据...');

    // 按大小降序排序，方便查看占用空间最大的存储
    details.sort((a, b) => b.size - a.size);

    sendProgress(100, '数据获取完成');

    // 发送最终结果
    sendResult({
      totalSize,
      details
    });

  } catch (error) {
    console.error('获取 IndexedDB 缓存信息失败:', error);
    sendError(error as Error);
  }
};

/*
|--------------------------------------------------------------------------
| Worker 初始化
|--------------------------------------------------------------------------
*/
// Worker 初始化完成
const workerReadyMsg: CacheManageWorkerReadyMsg = {
  type: 'workerReady',
  data: { message: 'IndexedDB Worker 已准备就绪' }
};
self.postMessage(workerReadyMsg);

// 监听主线程消息
self.addEventListener('message', (event: MessageEvent<CacheManageGetIndexedDBDataMsg>) => {
  const { type } = event.data;

  if (type === 'getIndexedDBData') {
    getIndexedDBData();
  } else {
    sendError(`未知的消息类型: ${type}`);
  }
});
