export type CacheManageGetIndexedDBDataMsg = { type: 'getIndexedDBData' };
export type CacheManageProgressUpdateMsg = { 
  type: 'progressUpdate';
  data: { 
    progress: number; 
    status: string 
  } 
};
export type CacheManageDataResultMsg = { 
  type: 'dataResult'; 
  data: { 
    totalSize: number; 
    details: CacheManageIndexedDBDetail[] 
  } 
};
export type CacheManageErrorMsg = { 
  type: 'error'; 
  data: { 
    message: string; 
    stack?: string 
  } 
};
export type CacheManageWorkerReadyMsg = { 
  type: 'workerReady'; 
  data: { 
    message: string 
  } 
};

// 联合所有消息类型
export type CacheManageWorkerMessage = 
  | CacheManageGetIndexedDBDataMsg
  | CacheManageProgressUpdateMsg
  | CacheManageDataResultMsg
  | CacheManageErrorMsg
  | CacheManageWorkerReadyMsg;

/**
 * 数据库信息
 */
export type CacheManageDatabaseInfo = {
  name: string;
  version?: number;
}

/**
 * IndexedDB 详情项
 */
export type CacheManageIndexedDBDetail = {
  name: string;
  size: number;
  description: string;
}

/**
 * 数据库处理结果
 */
export type CacheManageDatabaseResult = {
  totalSize: number;
  details: CacheManageIndexedDBDetail[];
}

/**
 * 存储处理结果
 */
export type CacheManageStoreResult = {
  size: number;
  detail: CacheManageIndexedDBDetail;
}


/**
 * 缓存管理进度更新数据
 */
export type CacheManageProgressUpdateData = {
  progress: number;
  status: string;
}

/**
 * 缓存管理错误数据
 */
export type CacheManageErrorData = {
  message: string;
  stack?: string;
}

/**
 * 缓存管理 IndexedDB 结果数据
 */
export type CacheManageIndexedDBResult = {
  totalSize: number;
  details: CacheManageIndexedDBDetail[];
}

/*
|--------------------------------------------------------------------------
| Worker 回调函数类型定义
|--------------------------------------------------------------------------
*/

/**
 * 缓存管理 Worker 回调函数
 */
export type CacheManageWorkerCallbacks = {
  onReady?: () => void;
  onProgress?: (data: CacheManageProgressUpdateData) => void;
  onError?: (data: CacheManageErrorData) => void;
  onResult?: (data: CacheManageIndexedDBResult) => void;
}
