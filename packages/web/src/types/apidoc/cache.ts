
export type LocalStorageItem = {
  /**
   * 描述信息
   */
  description: string;
  key: string;
  size: number;
}

export type IndexedDBItem = {
  /**
   * 描述信息
   */
  description: string;
  storeName: string;
  dbName: string;
  size: number;
}
export type StoreDetailItem = {
  key: string;
  value: unknown;
  size: number;
}

export type StoreDetailResponse = {
  data: StoreDetailItem[];
  total: number;
  currentPage: number;
  pageSize: number;
}

export type CacheInfo = {
  localStroageSize: number;
  indexedDBSize: number;
  localStorageDetails: LocalStorageItem[];
  indexedDBDetails: IndexedDBItem[];
}