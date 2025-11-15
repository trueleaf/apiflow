import type { ApidocProjectRules } from "@src/types";
import { openDB, type IDBPDatabase } from 'idb';
import { config } from '@src/config/config';

export class StandaloneRuleCache {
  private db: IDBPDatabase | null = null;
  private storeName = config.cacheConfig.rulesCache.storeName;
  constructor() {
    this.initDB().catch(error => {
      console.error('初始化规则缓存数据库失败:', error);
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
      throw new Error('规则缓存数据库初始化失败');
    }
    return this.db;
  }
  private async openDB(): Promise<IDBPDatabase> {
    if (this.db) {
      return this.db;
    }
    this.db = await openDB(
      config.cacheConfig.rulesCache.dbName,
      config.cacheConfig.rulesCache.version,
      {
        upgrade(db) {
          if (!db.objectStoreNames.contains(config.cacheConfig.rulesCache.storeName)) {
            db.createObjectStore(config.cacheConfig.rulesCache.storeName);
          }
        },
      }
    );
    return this.db;
  }
  async getAllProjectRules(): Promise<Record<string, ApidocProjectRules>> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readonly");
    const store = tx.objectStore(this.storeName);
    const keys = await store.getAllKeys();
    const rules: Record<string, ApidocProjectRules> = {};

    for (const key of keys) {
      const rule = await store.get(key);
      if (rule && !rule.isDeleted) {
        rules[key as string] = rule;
      }
    }

    return rules;
  }
  async setAllProjectRules(rules: Record<string, ApidocProjectRules>): Promise<boolean> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);

    const keys = await store.getAllKeys();
    for (const key of keys) {
      await store.delete(key);
    }

    for (const [projectId, rule] of Object.entries(rules)) {
      await store.put(rule, projectId);
    }

    await tx.done;
    return true;
  }
  async getProjectRules(projectId: string): Promise<ApidocProjectRules | null> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readonly");
    const store = tx.objectStore(this.storeName);
    const rule = await store.get(projectId);
    return rule && !rule.isDeleted ? rule : null;
  }
  async setProjectRules(projectId: string, rules: ApidocProjectRules): Promise<boolean> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);
    await store.put({ ...rules, isDeleted: false }, projectId);
    await tx.done;
    return true;
  }
  async updateProjectRules(projectId: string, rules: Partial<ApidocProjectRules>): Promise<boolean> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);
    const existingRules = await store.get(projectId);

    if (!existingRules) return false;

    const updatedRules = {
      ...existingRules,
      ...rules
    };

    await store.put(updatedRules, projectId);
    await tx.done;
    return true;
  }
  async deleteProjectRules(projectId: string): Promise<boolean> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);
    const existingRules = await store.get(projectId);

    if (!existingRules) return false;

    const updatedRules = {
      ...existingRules,
      isDeleted: true
    };

    await store.put(updatedRules, projectId);
    await tx.done;
    return true;
  }
} 
// 导出单例
export const standaloneRuleCache = new StandaloneRuleCache();
