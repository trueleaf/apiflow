import { openDB, type IDBPDatabase } from 'idb'
import { config } from '@src/config/config'
import type { CommonResponse, EnvironmentEntity } from '@src/types'
import { logger } from '@/helper/logger'
export class EnvironmentCache {
  private db: IDBPDatabase | null = null
  private storeName = config.cacheConfig.environmentCache.storeName
  private projectIdIndex = config.cacheConfig.environmentCache.projectIdIndex
  constructor() {
    this.initDB().catch(error => {
      logger.error('初始化环境缓存数据库失败', { error })
    })
  }
  private async initDB() {
    if (this.db) {
      return
    }
    try {
      this.db = await this.openDB()
    } catch (error) {
      logger.error('初始化环境缓存数据库失败', { error })
      this.db = null
    }
  }
  async getDB() {
    if (!this.db) {
      await this.initDB()
    }
    if (!this.db) {
      throw new Error('环境缓存数据库初始化失败')
    }
    return this.db
  }
  private async openDB(): Promise<IDBPDatabase> {
    if (this.db) {
      return this.db
    }
    this.db = await openDB(
      config.cacheConfig.environmentCache.dbName,
      config.cacheConfig.environmentCache.version,
      {
        upgrade(db) {
          if (!db.objectStoreNames.contains(config.cacheConfig.environmentCache.storeName)) {
            const store = db.createObjectStore(config.cacheConfig.environmentCache.storeName, { keyPath: 'id' })
            store.createIndex(
              config.cacheConfig.environmentCache.projectIdIndex,
              config.cacheConfig.environmentCache.projectIdIndex,
              { unique: false }
            )
          }
        },
      }
    )
    return this.db
  }
  // 查询项目环境列表
  async getEnvironmentByProjectId(projectId: string): Promise<CommonResponse<EnvironmentEntity[]>> {
    try {
      const db = await this.getDB()
      const tx = db.transaction(this.storeName, 'readonly')
      const store = tx.objectStore(this.storeName)
      const index = store.index(this.projectIdIndex)
      const rows = await index.getAll(projectId) as EnvironmentEntity[]
      await tx.done
      return {
        code: 0,
        msg: 'success',
        data: rows.sort((a, b) => a.order - b.order),
      }
    } catch (error) {
      logger.error('获取环境列表失败', { error })
      return {
        code: 1,
        msg: error instanceof Error ? error.message : '获取环境列表失败',
        data: [],
      }
    }
  }
  // 覆盖写入项目环境列表
  async replaceEnvironmentByProjectId(projectId: string, rows: EnvironmentEntity[]): Promise<CommonResponse<null>> {
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
          order: i,
        })
      }
      await tx.done
      return {
        code: 0,
        msg: 'success',
        data: null,
      }
    } catch (error) {
      logger.error('写入环境列表失败', { error })
      return {
        code: 1,
        msg: error instanceof Error ? error.message : '写入环境列表失败',
        data: null,
      }
    }
  }
}
export const environmentCache = new EnvironmentCache()
