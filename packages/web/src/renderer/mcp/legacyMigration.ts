import { openDB } from 'idb'
import { config } from '@src/config/config'
import { getWorkspaceDataDB } from '@/cache/workspaceDataCache'
import type { McpLegacyData } from '@src/types/mcp'
import { publishWorkspaceChange } from '@/cache/workspaceDataEvents'

// 获取需要从旧 MCP 来源迁移的业务仓库
const getMigrationStores = () => [
  ...['projects', 'httpNodeList', 'variables', 'commonHeaders'].map(store => ({ database: config.cacheConfig.workspaceDataCache.dbName, store })),
  { database: config.cacheConfig.environmentCache.dbName, store: config.cacheConfig.environmentCache.storeName },
  { database: config.cacheConfig.environmentVariableCache.dbName, store: config.cacheConfig.environmentVariableCache.storeName },
]
// 导出旧来源中的离线业务数据
export const exportLegacyMcpData = async (): Promise<McpLegacyData> => {
  await getWorkspaceDataDB()
  const databases = await indexedDB.databases()
  const snapshot: McpLegacyData = []
  for (const source of getMigrationStores()) {
    if (!databases.some(database => database.name === source.database)) continue
    const database = await openDB(source.database)
    try {
      if (!database.objectStoreNames.contains(source.store)) continue
      const transaction = database.transaction(source.store, 'readonly')
      const [keys, values] = await Promise.all([transaction.store.getAllKeys(), transaction.store.getAll()])
      await transaction.done
      snapshot.push({ ...source, entries: keys.map((key, index) => ({ key, value: values[index] as unknown })) })
    } finally {
      database.close()
    }
  }
  return snapshot
}
// 合并旧来源数据并保留主界面已有记录
export const importLegacyMcpData = async (snapshot: McpLegacyData): Promise<void> => {
  const workspace = await getWorkspaceDataDB()
  if (await workspace.get('migrations', 'legacy-mcp-origin')) return
  const sources = getMigrationStores()
  for (const source of snapshot) {
    if (!sources.some(item => item.database === source.database && item.store === source.store)) throw new Error('INVALID_MIGRATION_STORE')
    const database = await openDB(source.database, undefined, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(source.store)) {
          const store = db.createObjectStore(source.store, { keyPath: 'id' })
          store.createIndex('projectId', 'projectId')
          if (source.database === config.cacheConfig.environmentVariableCache.dbName) store.createIndex('environmentId', 'environmentId')
        }
      },
    })
    try {
      if (!database.objectStoreNames.contains(source.store)) throw new Error('MIGRATION_STORE_NOT_FOUND')
      const transaction = database.transaction(source.store, 'readwrite')
      for (const entry of source.entries) {
        if (await transaction.store.getKey(entry.key) !== undefined) continue
        if (transaction.store.keyPath) await transaction.store.put(entry.value)
        else await transaction.store.put(entry.value, entry.key)
      }
      await transaction.done
    } finally {
      database.close()
    }
  }
  await workspace.put('migrations', true, 'legacy-mcp-origin')
  publishWorkspaceChange(['projects', 'httpNodeList', 'variables', 'commonHeaders'])
}
