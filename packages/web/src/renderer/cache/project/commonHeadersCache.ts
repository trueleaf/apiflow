import type { ApidocProperty } from '@src/types';
import { openDB, type IDBPDatabase } from 'idb';
import { config } from '@src/config/config';
import { logger } from '@/helper';
import { cacheKey } from '../cacheKey';

export class CommonHeaderCache {
  private db: IDBPDatabase | null = null;
  private storeName = config.cacheConfig.commonHeadersCache.storeName;
  constructor() {
    this.initDB().catch(error => {
      logger.error('初始化公共请求头缓存数据库失败', { error });
    });
  }
  private async initDB() {
    if (this.db) {
      return;
    }
    try {
      this.db = await this.openDB();
    } catch (error) {
      logger.error('初始化公共请求头缓存数据库失败', { error });
      this.db = null;
    }
  }
  private async getDB() {
    if (!this.db) {
      await this.initDB();
    }
    if (!this.db) {
      throw new Error('公共请求头缓存数据库初始化失败');
    }
    return this.db;
  }
  private async openDB(): Promise<IDBPDatabase> {
    if (this.db) {
      return this.db;
    }
    this.db = await openDB(
      config.cacheConfig.commonHeadersCache.dbName,
      config.cacheConfig.commonHeadersCache.version,
      {
        upgrade(db) {
          if (!db.objectStoreNames.contains(config.cacheConfig.commonHeadersCache.storeName)) {
            db.createObjectStore(config.cacheConfig.commonHeadersCache.storeName);
          }
        },
      }
    );
    return this.db;
  }
  async getCommonHeaders(): Promise<ApidocProperty<'string'>[]> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readonly");
    const store = tx.objectStore(this.storeName);
    const keys = await store.getAllKeys();
    const headers: ApidocProperty<'string'>[] = [];

    for (const key of keys) {
      const header = await store.get(key);
      if (header && !header.isDeleted) {
        headers.push(header);
      }
    }

    return headers;
  }
  async getCommonHeaderById(headerId: string): Promise<ApidocProperty<'string'> | null> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readonly");
    const store = tx.objectStore(this.storeName);
    const header = await store.get(headerId);
    return header && !header.isDeleted ? header : null;
  }
  async addCommonHeader(header: ApidocProperty<'string'>): Promise<boolean> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);
    await store.put(header, header._id);
    await tx.done;
    return true;
  }
  async updateCommonHeader(headerId: string, header: Partial<ApidocProperty<'string'>>): Promise<boolean> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);
    const existingHeader = await store.get(headerId);

    if (!existingHeader) return false;

    const updatedHeader = {
      ...existingHeader,
      ...header
    };

    await store.put(updatedHeader, headerId);
    await tx.done;
    return true;
  }
  async deleteCommonHeader(headerId: string): Promise<boolean> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);
    const existingHeader = await store.get(headerId);

    if (!existingHeader) return false;

    const updatedHeader = {
      ...existingHeader,
      isDeleted: true
    };

    await store.put(updatedHeader, headerId);
    await tx.done;
    return true;
  }
  async deleteCommonHeaders(headerIds: string[]): Promise<boolean> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);

    for (const headerId of headerIds) {
      const existingHeader = await store.get(headerId);
      if (existingHeader) {
        await store.put({
          ...existingHeader,
          isDeleted: true
        }, headerId);
      }
    }

    await tx.done;
    return true;
  }
  async setCommonHeaders(headers: ApidocProperty<'string'>[]): Promise<boolean> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);

    const keys = await store.getAllKeys();
    for (const key of keys) {
      await store.delete(key);
    }

    for (const header of headers) {
      await store.put(header, header._id);
    }

    await tx.done;
    return true;
  }
  getIgnoredCommonHeaderByTabId(projectId: string, tabId: string): string[] {
    try {
      const localData = JSON.parse(localStorage.getItem(cacheKey.commonHeaders.ignore) || '{}') as Record<string, Record<string, string[]>>;
      if (localData[projectId] == null) {
        return [];
      }
      if (localData[projectId][tabId] == null) {
        return [];
      }
      return localData[projectId][tabId];
    } catch (error) {
      logger.error('获取忽略公共请求头配置失败', { error });
      return [];
    }
  }
  setIgnoredCommonHeader(options: { projectId: string; tabId: string; ignoreHeaderId: string }) {
    try {
      const { projectId, tabId, ignoreHeaderId } = options;
      const localData = JSON.parse(localStorage.getItem(cacheKey.commonHeaders.ignore) || '{}') as Record<string, Record<string, string[]>>;
      if (localData[projectId] == null) {
        localData[projectId] = {}
      }
      if (localData[projectId][tabId] == null) {
        localData[projectId][tabId] = []
      }
      const matchedTab = localData[projectId][tabId];
      matchedTab.push(ignoreHeaderId);
      localStorage.setItem(cacheKey.commonHeaders.ignore, JSON.stringify(localData));
    } catch (error) {
      logger.error('设置忽略公共请求头失败', { error });
      localStorage.setItem(cacheKey.commonHeaders.ignore, '{}');
    }
  }
  deleteIgnoredCommonHeader(options: { projectId: string; tabId: string; ignoreHeaderId: string }): boolean {
    try {
      const { projectId, tabId, ignoreHeaderId } = options;
      const localData = JSON.parse(localStorage.getItem(cacheKey.commonHeaders.ignore) || '{}') as Record<string, Record<string, string[]>>;
      if (localData[projectId] == null) {
        return false;
      }
      if (localData[projectId][tabId] == null) {
        return false;
      }
      const matchedTab = localData[projectId][tabId];
      const deleteIndex = matchedTab.findIndex(id => ignoreHeaderId === id);
      if (deleteIndex !== -1) {
        matchedTab.splice(deleteIndex, 1);
        localStorage.setItem(cacheKey.commonHeaders.ignore, JSON.stringify(localData));
      }
      return true;
    } catch (error) {
      logger.error('删除忽略公共请求头失败', { error });
      localStorage.setItem(cacheKey.commonHeaders.ignore, '{}');
      return false;
    }
  }
}

// 导出单例
export const commonHeaderCache = new CommonHeaderCache();
