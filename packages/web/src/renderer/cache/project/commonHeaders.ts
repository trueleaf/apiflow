import { IDBPDatabase } from "idb";
import type { ApidocProperty } from '@src/types';

export class CommonHeaderCache {
  constructor(private db: IDBPDatabase | null = null) {}

  async getCommonHeaders(): Promise<ApidocProperty<'string'>[]> {
    if (!this.db) throw new Error("Database not initialized");
    const tx = this.db.transaction("commonHeaders", "readonly");
    const store = tx.objectStore("commonHeaders");
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
    if (!this.db) throw new Error("Database not initialized");
    const tx = this.db.transaction("commonHeaders", "readonly");
    const store = tx.objectStore("commonHeaders");
    const header = await store.get(headerId);
    return header && !header.isDeleted ? header : null;
  }

  async addHeader(header: ApidocProperty<'string'>): Promise<boolean> {
    if (!this.db) throw new Error("Database not initialized");
    const tx = this.db.transaction("commonHeaders", "readwrite");
    const store = tx.objectStore("commonHeaders");
    await store.put(header, header._id);
    await tx.done;
    return true;
  }

  async updateHeader(headerId: string, header: Partial<ApidocProperty<'string'>>): Promise<boolean> {
    if (!this.db) throw new Error("Database not initialized");
    const tx = this.db.transaction("commonHeaders", "readwrite");
    const store = tx.objectStore("commonHeaders");
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
    if (!this.db) throw new Error("Database not initialized");
    const tx = this.db.transaction("commonHeaders", "readwrite");
    const store = tx.objectStore("commonHeaders");
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
    if (!this.db) throw new Error("Database not initialized");
    const tx = this.db.transaction("commonHeaders", "readwrite");
    const store = tx.objectStore("commonHeaders");
    
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
    if (!this.db) throw new Error("Database not initialized");
    const tx = this.db.transaction("commonHeaders", "readwrite");
    const store = tx.objectStore("commonHeaders");
    
    // Clear existing data
    const keys = await store.getAllKeys();
    for (const key of keys) {
      await store.delete(key);
    }
    
    // Store new headers
    for (const header of headers) {
      await store.put(header, header._id);
    }
    
    await tx.done;
    return true;
  }
}
