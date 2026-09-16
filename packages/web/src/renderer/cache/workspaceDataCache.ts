import { openDB, unwrap, type IDBPDatabase } from 'idb'
import { observeWorkspaceTransactions } from './workspaceDataEvents'
import type { WorkspaceDataSchema } from '@src/types/ai/workspaceData'
import { config } from '@src/config/config'

const workspaceDatabaseName = config.cacheConfig.workspaceDataCache.dbName
const workspaceDatabaseVersion = config.cacheConfig.workspaceDataCache.version
let databasePromise: Promise<IDBPDatabase<WorkspaceDataSchema>> | null = null
// 判断旧数据库是否存在
const legacyDatabaseExists = async (name: string): Promise<boolean> => {
  if (!indexedDB.databases) return true
  return (await indexedDB.databases()).some(database => database.name === name)
}
// 迁移单个旧对象仓库
const migrateLegacyStore = async (database: IDBPDatabase<WorkspaceDataSchema>, legacyDatabaseName: string, legacyStoreName: string, targetStoreName: 'projects' | 'httpNodeList' | 'variables' | 'commonHeaders'): Promise<void> => {
  if (await database.get('migrations', targetStoreName)) return
  if (!await legacyDatabaseExists(legacyDatabaseName)) { await database.put('migrations', true, targetStoreName); return }
  const legacyDatabase = await openDB(legacyDatabaseName)
  try {
    if (!legacyDatabase.objectStoreNames.contains(legacyStoreName)) { await database.put('migrations', true, targetStoreName); return }
    const untypedDatabase = database as unknown as IDBPDatabase
    const targetCount = await untypedDatabase.count(targetStoreName)
    if (targetCount > 0) { await database.put('migrations', true, targetStoreName); return }
    const values = await legacyDatabase.getAll(legacyStoreName)
    const keys = await legacyDatabase.getAllKeys(legacyStoreName)
    const transaction = untypedDatabase.transaction(targetStoreName, 'readwrite')
    for (let index = 0; index < values.length; index += 1) await transaction.store.put(values[index], String(keys[index]))
    await transaction.done
    await database.put('migrations', true, targetStoreName)
  } finally {
    legacyDatabase.close()
  }
}
// 打开共享业务数据库并迁移旧缓存
export const getWorkspaceDataDB = async (): Promise<IDBPDatabase<WorkspaceDataSchema>> => {
  if (databasePromise) return databasePromise
  databasePromise = (async () => {
    const database = await openDB<WorkspaceDataSchema>(workspaceDatabaseName, workspaceDatabaseVersion, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('projects')) db.createObjectStore('projects')
        if (!db.objectStoreNames.contains('httpNodeList')) {
          const store = db.createObjectStore('httpNodeList')
          store.createIndex('projectId', 'projectId', { unique: false })
        }
        if (!db.objectStoreNames.contains('variables')) {
          const store = db.createObjectStore('variables')
          store.createIndex('projectId', 'projectId', { unique: false })
        }
        if (!db.objectStoreNames.contains('commonHeaders')) db.createObjectStore('commonHeaders')
        if (!db.objectStoreNames.contains('agentReceipts')) db.createObjectStore('agentReceipts')
        if (!db.objectStoreNames.contains('migrations')) db.createObjectStore('migrations')
      },
    })
    await migrateLegacyStore(database, config.cacheConfig.projectCache.dbName, config.cacheConfig.projectCache.storeName, 'projects')
    await migrateLegacyStore(database, config.cacheConfig.apiNodesCache.dbName, config.cacheConfig.apiNodesCache.storeName, 'httpNodeList')
    await migrateLegacyStore(database, config.cacheConfig.variablesCache.dbName, config.cacheConfig.variablesCache.storeName, 'variables')
    await migrateLegacyStore(database, config.cacheConfig.commonHeadersCache.dbName, config.cacheConfig.commonHeadersCache.storeName, 'commonHeaders')
    database.addEventListener('versionchange', () => { database.close(); databasePromise = null })
    observeWorkspaceTransactions(unwrap(database))
    return database
  })().catch(error => { databasePromise = null; throw error })
  return databasePromise
}
