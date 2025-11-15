import type { ApidocProperty } from '@src/types';
import { openDB, type IDBPDatabase } from 'idb';
import { config } from '@src/config/config';

export class CommonHeaderCache {
  private db: IDBPDatabase | null = null;
  private storeName = config.cacheConfig.commonHeadersCache.storeName;
  constructor() {
    this.initDB().catch(error => {
      console.error('初始化公共请求头缓存数据库失败:', error);
    });
  }
  private async initDB() {
    if (this.db) {
      return;
    }
    try {
      this.db = await this.openDB();
    } catch (error) {
      this.db = null;
      throw error;
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
  async getHeaderById(headerId: string): Promise<ApidocProperty<'string'> | null> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readonly");
    const store = tx.objectStore(this.storeName);
    const header = await store.get(headerId);
    return header && !header.isDeleted ? header : null;
  }
  async addHeader(header: ApidocProperty<'string'>): Promise<boolean> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);
    await store.put(header, header._id);
    await tx.done;
    return true;
  }
  async updateHeader(headerId: string, header: Partial<ApidocProperty<'string'>>): Promise<boolean> {
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
  async deleteHeader(headerId: string): Promise<boolean> {
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
  async deleteHeaders(headerIds: string[]): Promise<boolean> {
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
}

// 导出单例
export const commonHeaderCache = new CommonHeaderCache();
