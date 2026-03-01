import { openDB, type IDBPDatabase } from 'idb'
import { config } from '@src/config/config'
import type { CommonResponse, EnvironmentVariableEntity } from '@src/types'
import { logger } from '@/helper/logger'
export class EnvironmentVariableCache {
  private db: IDBPDatabase | null = null
  private storeName = config.cacheConfig.environmentVariableCache.storeName
  private projectIdIndex = config.cacheConfig.environmentVariableCache.projectIdIndex
  private environmentIdIndex = config.cacheConfig.environmentVariableCache.environmentIdIndex
  constructor() {
    this.initDB().catch(error => {
      logger.error('初始化环境变量缓存数据库失败', { error })
    })
  }
  private async initDB() {
    if (this.db) {
      return
    }
    try {
      this.db = await this.openDB()
    } catch (error) {
      logger.error('初始化环境变量缓存数据库失败', { error })
      this.db = null
    }
  }
  async getDB() {
    if (!this.db) {
      await this.initDB()
    }
    if (!this.db) {
      throw new Error('环境变量缓存数据库初始化失败')
    }
    return this.db
  }
  private async openDB(): Promise<IDBPDatabase> {
    if (this.db) {
      return this.db
    }
    this.db = await openDB(
      config.cacheConfig.environmentVariableCache.dbName,
      config.cacheConfig.environmentVariableCache.version,
      {
        upgrade(db) {
          if (!db.objectStoreNames.contains(config.cacheConfig.environmentVariableCache.storeName)) {
            const store = db.createObjectStore(config.cacheConfig.environmentVariableCache.storeName, { keyPath: 'id' })
            store.createIndex(
              config.cacheConfig.environmentVariableCache.projectIdIndex,
              config.cacheConfig.environmentVariableCache.projectIdIndex,
              { unique: false }
            )
            store.createIndex(
              config.cacheConfig.environmentVariableCache.environmentIdIndex,
              config.cacheConfig.environmentVariableCache.environmentIdIndex,
              { unique: false }
            )
          }
        },
      }
    )
    return this.db
  }
  // 查询项目环境变量列表
  async getVariablesByProjectId(projectId: string): Promise<CommonResponse<EnvironmentVariableEntity[]>> {
    try {
      const db = await this.getDB()
      const tx = db.transaction(this.storeName, 'readonly')
      const store = tx.objectStore(this.storeName)
      const index = store.index(this.projectIdIndex)
      const rows = await index.getAll(projectId) as EnvironmentVariableEntity[]
      await tx.done
      return {
        code: 0,
        msg: 'success',
        data: rows.sort((a, b) => a.order - b.order),
      }
    } catch (error) {
      logger.error('获取环境变量列表失败', { error })
      return {
        code: 1,
        msg: error instanceof Error ? error.message : '获取环境变量列表失败',
        data: [],
      }
    }
  }
  // 查询某个环境变量列表
  async getVariablesByEnvironmentId(environmentId: string): Promise<CommonResponse<EnvironmentVariableEntity[]>> {
    try {
      const db = await this.getDB()
      const tx = db.transaction(this.storeName, 'readonly')
      const store = tx.objectStore(this.storeName)
      const index = store.index(this.environmentIdIndex)
      const rows = await index.getAll(environmentId) as EnvironmentVariableEntity[]
      await tx.done
      return {
        code: 0,
        msg: 'success',
        data: rows.sort((a, b) => a.order - b.order),
      }
    } catch (error) {
      logger.error('获取环境变量列表失败', { error })
      return {
        code: 1,
        msg: error instanceof Error ? error.message : '获取环境变量列表失败',
        data: [],
      }
    }
  }
  // 覆盖写入项目环境变量列表
  async replaceVariablesByProjectId(projectId: string, rows: EnvironmentVariableEntity[]): Promise<CommonResponse<null>> {
    try {
      const db = await this.getDB()
      const tx = db.transaction(this.storeName, 'readwrite')
      const store = tx.objectStore(this.storeName)
      const index = store.index(this.projectIdIndex)
      const oldKeys = await index.getAllKeys(projectId)
      for (const key of oldKeys) {
        await store.delete(key)
      }
      for (let i = 0; i < rows.length; i += 1) {
        const item = rows[i]
        await store.put({
          ...item,
          projectId,
        })
      }
      await tx.done
      return {
        code: 0,
        msg: 'success',
        data: null,
      }
    } catch (error) {
      logger.error('写入环境变量列表失败', { error })
      return {
        code: 1,
        msg: error instanceof Error ? error.message : '写入环境变量列表失败',
        data: null,
      }
    }
  }
}
export const environmentVariableCache = new EnvironmentVariableCache()
