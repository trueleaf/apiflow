import type { ApidocVariable, CommonResponse } from '@src/types';
import { nanoid } from "nanoid";
import { openDB, type IDBPDatabase } from 'idb';
import { config } from '@src/config/config';
import { logger } from '@/helper';
export class NodeVariableCache {
  private db: IDBPDatabase | null = null;
  private storeName = config.cacheConfig.variablesCache.storeName;
  private projectIdIndex = config.cacheConfig.variablesCache.projectIdIndex;
  constructor() {
    this.initDB().catch(error => {
      logger.error('初始化变量缓存数据库失败', { error });
    });
  }
  private async initDB() {
    if (this.db) {
      return;
    }
    try {
      this.db = await this.openDB();
    } catch (error) {
      logger.error('初始化变量缓存数据库失败', { error });
      this.db = null;
    }
  }
  private async getDB() {
    if (!this.db) {
      await this.initDB();
    }
    if (!this.db) {
      throw new Error('变量缓存数据库初始化失败');
    }
    return this.db;
  }
  private async openDB(): Promise<IDBPDatabase> {
    if (this.db) {
      return this.db;
    }
    this.db = await openDB(
      config.cacheConfig.variablesCache.dbName,
      config.cacheConfig.variablesCache.version,
      {
        upgrade(db) {
          if (!db.objectStoreNames.contains(config.cacheConfig.variablesCache.storeName)) {
            const variablesStore = db.createObjectStore(config.cacheConfig.variablesCache.storeName);
            variablesStore.createIndex(
              config.cacheConfig.variablesCache.projectIdIndex,
              config.cacheConfig.variablesCache.projectIdIndex,
              { unique: false }
            );
          }
        },
      }
    );
    return this.db;
  }
  // 新增变量
  async addVariable(variable: Omit<ApidocVariable, '_id'> & { _id?: string }): Promise<CommonResponse<ApidocVariable>> {
    try {
      const db = await this.getDB();
      try {
        const checkTx = db.transaction(this.storeName, "readonly");
        const checkStore = checkTx.objectStore(this.storeName);
        let projectVariables: ApidocVariable[] = [];
        try {
          const index = checkStore.index(this.projectIdIndex);
          projectVariables = await index.getAll(variable.projectId);
        } catch (indexError) {
          logger.error('按索引获取变量列表失败', { error: indexError });
          const allVariables = await checkStore.getAll();
          projectVariables = allVariables.filter(v => v.projectId === variable.projectId);
        }
        await checkTx.done;
        const nameExists = projectVariables.some(v => v.name === variable.name);
        if (nameExists) {
          return { code: 1, msg: "变量名称已存在", data: null as any };
        }
      } catch (checkError) {
        logger.error('变量重复校验失败', { error: checkError });
      }
      const id = nanoid()
      const variableWithId: ApidocVariable = {
        ...variable,
        _id: id
      };
      const addTx = db.transaction(this.storeName, "readwrite");
      const addStore = addTx.objectStore(this.storeName);
      await addStore.put(variableWithId, id);
      await addTx.done;
      return { code: 0, msg: "success", data: variableWithId };
    } catch (error) {
      logger.error('添加变量失败', { error });
      return {
        code: 1,
        msg: error instanceof Error ? error.message : "添加变量失败",
        data: null as any
      };
    }
  }
  // 修改变量
  async updateVariableById(id: string, updates: Partial<ApidocVariable>): Promise<CommonResponse<ApidocVariable>> {
    try {
      if (!id) {
        return { code: 1, msg: "变量ID不能为空", data: null as any };
      }
      const db = await this.getDB();
      const readTx = db.transaction(this.storeName, "readonly");
      const readStore = readTx.objectStore(this.storeName);
      const existingVariable = await readStore.get(id);
      await readTx.done;
      if (!existingVariable) {
        return { code: 1, msg: "变量不存在", data: null as any };
      }
      if (updates.name && updates.name !== existingVariable.name) {
        try {
          const checkTx = db.transaction(this.storeName, "readonly");
          const checkStore = checkTx.objectStore(this.storeName);
          let projectVariables: ApidocVariable[] = [];
          try {
            const index = checkStore.index(this.projectIdIndex);
            projectVariables = await index.getAll(existingVariable.projectId);
          } catch (indexError) {
            logger.error('按索引校验变量名称失败', { error: indexError });
            const allVariables = await checkStore.getAll();
            projectVariables = allVariables.filter(v => v.projectId === existingVariable.projectId);
          }
          await checkTx.done;
          const nameExists = projectVariables.some(v => v.name === updates.name && v._id !== id);
          if (nameExists) {
            return { code: 1, msg: "变量名称已存在", data: null as any };
          }
        } catch (checkError) {
          logger.error('变量名称重复校验失败', { error: checkError });
        }
      }
      const updateTx = db.transaction(this.storeName, "readwrite");
      const updateStore = updateTx.objectStore(this.storeName);
      const updatedVariable: ApidocVariable = {
        ...existingVariable,
        ...updates,
        _id: id
      };
      await updateStore.put(updatedVariable, id);
      await updateTx.done;
      return { code: 0, msg: "success", data: updatedVariable };
    } catch (error) {
      logger.error('更新变量失败', { error });
      return {
        code: 1,
        msg: error instanceof Error ? error.message : "更新变量失败",
        data: null as any
      };
    }
  }
  // 批量删除变量
  async deleteVariableByIds(ids: string[]): Promise<CommonResponse<void>> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(this.storeName, "readwrite");
      const store = tx.objectStore(this.storeName);
      for (const id of ids) {
        if (id) {
          const variable = await store.get(id);
          if (variable) {
            await store.delete(id);
          }
        }
      }
      await tx.done;
      return { code: 0, msg: "success", data: null as any };
    } catch (error) {
      logger.error('删除变量失败', { error });
      return {
        code: 1,
        msg: error instanceof Error ? error.message : "删除变量失败",
        data: null as any
      };
    }
  }
  // 查询所有变量
  async getVariableByProjectId(projectId: string): Promise<CommonResponse<ApidocVariable[]>> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(this.storeName, "readonly");
      const store = tx.objectStore(this.storeName);
      try {
        const index = store.index(this.projectIdIndex);
        const variables: ApidocVariable[] = await index.getAll(projectId);
        return { code: 0, msg: "success", data: variables };
      } catch (error) {
        logger.error('按索引获取变量列表失败，使用全量结果', { error });
        const allVariables: ApidocVariable[] = await store.getAll();
        const projectVariables = allVariables.filter(v => v.projectId === projectId);
        return { code: 0, msg: "success", data: projectVariables };
      }
    } catch (error) {
      logger.error('获取变量列表失败', { error });
      return {
        code: 1,
        msg: error instanceof Error ? error.message : "获取变量列表失败",
        data: []
      };
    }
  }
  // 根据变量ID获取单个变量
  async getVariableById(variableId: string): Promise<CommonResponse<ApidocVariable | null>> {
    try {
      if (!variableId) {
        return { code: 1, msg: "变量ID不能为空", data: null };
      }
      const db = await this.getDB();
      const tx = db.transaction(this.storeName, "readonly");
      const store = tx.objectStore(this.storeName);
      const variable = await store.get(variableId);
      return { code: 0, msg: "success", data: variable || null };
    } catch (error) {
      logger.error('根据ID获取变量失败', { error });
      return {
        code: 1,
        msg: error instanceof Error ? error.message : "获取变量失败",
        data: null
      };
    }
  }
}
// 导出单例
export const nodeVariableCache = new NodeVariableCache();