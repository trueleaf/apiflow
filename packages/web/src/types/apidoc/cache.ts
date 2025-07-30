
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
  name: string;
  size: number;
}
export type CacheInfo = {
  localStroageSize: number;
  indexedDBSize: number;
  localStorageDetails: LocalStorageItem[];
  indexedDBDetails: IndexedDBItem[];
}