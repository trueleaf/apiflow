import JSZip from 'jszip'
import { openDB, type IDBPDatabase } from 'idb'
import { config } from '@src/config/config'

type BackupManifestStoreV1 = {
  storeName: string
  keyPath: string | null
  indexes: Array<{ name: string; keyPath: string; unique: boolean }>
  count: number
  file: string
}

export type BackupManifestV1 = {
  schemaVersion: 1
  exportedAt: number
  appVersion: string
  includeResponseCache: boolean
  localStorage: { file: string; count: number }
  indexedDB: Array<{
    dbName: string
    version: number
    stores: BackupManifestStoreV1[]
  }>
}

type ManagedStoreSchema = {
  storeName: string
  keyPath: string | null
  indexes: Array<{ name: string; keyPath: string; unique: boolean }>
}

type ManagedDbSchema = {
  dbName: string
  version: number
  stores: ManagedStoreSchema[]
  isResponseCache: boolean
}

type BackupProgress = {
  phase: 'estimate' | 'export' | 'import'
  current: number
  total: number
  label?: string
}

const uint8ToBase64 = (bytes: Uint8Array): string => {
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    let chunkStr = ''
    for (let j = 0; j < chunk.length; j += 1) {
      chunkStr += String.fromCharCode(chunk[j])
    }
    binary += chunkStr
  }
  return btoa(binary)
}
const base64ToUint8 = (base64: string): Uint8Array => {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}
const isSerializedTaggedObject = (
  value: unknown
): value is { __afType: string } & Record<string, unknown> => {
  if (!value || typeof value !== 'object') {
    return false
  }
  return '__afType' in value
}
const backupJsonReplacer = (_key: string, value: unknown): unknown => {
  if (value instanceof Uint8Array) {
    return { __afType: 'Uint8Array', base64: uint8ToBase64(value) }
  }
  if (value instanceof ArrayBuffer) {
    return { __afType: 'ArrayBuffer', base64: uint8ToBase64(new Uint8Array(value)) }
  }
  if (value instanceof Date) {
    return { __afType: 'Date', value: value.toISOString() }
  }
  return value
}
const backupJsonReviver = (_key: string, value: unknown): unknown => {
  if (!isSerializedTaggedObject(value)) {
    return value
  }
  if (value.__afType === 'Uint8Array' && typeof value.base64 === 'string') {
    return base64ToUint8(value.base64)
  }
  if (value.__afType === 'ArrayBuffer' && typeof value.base64 === 'string') {
    return base64ToUint8(value.base64).buffer
  }
  if (value.__afType === 'Date' && typeof value.value === 'string') {
    return new Date(value.value)
  }
  return value
}
const stringifyBackupJson = (value: unknown): string => {
  return JSON.stringify(value, backupJsonReplacer)
}
const parseBackupJson = <T>(json: string): T => {
  return JSON.parse(json, backupJsonReviver) as T
}
const getManagedDbSchemas = (): ManagedDbSchema[] => {
  return [
    {
      dbName: config.cacheConfig.httpNodeResponseCache.dbName,
      version: config.cacheConfig.httpNodeResponseCache.version,
      stores: [{ storeName: 'responseMetadata', keyPath: null, indexes: [] }],
      isResponseCache: true,
    },
    {
      dbName: config.cacheConfig.websocketNodeResponseCache.dbName,
      version: config.cacheConfig.websocketNodeResponseCache.version,
      stores: [{ storeName: 'responses', keyPath: 'id', indexes: [{ name: 'nodeId', keyPath: 'nodeId', unique: false }] }],
      isResponseCache: true,
    },
    {
      dbName: config.cacheConfig.websocketHistoryCache.dbName,
      version: config.cacheConfig.websocketHistoryCache.version,
      stores: [{ storeName: config.cacheConfig.websocketHistoryCache.storeName, keyPath: '_id', indexes: [{ name: 'nodeId', keyPath: 'nodeId', unique: false }, { name: 'timestamp', keyPath: 'timestamp', unique: false }] }],
      isResponseCache: false,
    },
    {
      dbName: config.cacheConfig.httpHistoryCache.dbName,
      version: config.cacheConfig.httpHistoryCache.version,
      stores: [{ storeName: config.cacheConfig.httpHistoryCache.storeName, keyPath: '_id', indexes: [{ name: 'nodeId', keyPath: 'nodeId', unique: false }, { name: 'timestamp', keyPath: 'timestamp', unique: false }] }],
      isResponseCache: false,
    },
    {
      dbName: config.cacheConfig.sendHistoryCache.dbName,
      version: 2,
      stores: [{ storeName: config.cacheConfig.sendHistoryCache.storeName, keyPath: '_id', indexes: [{ name: 'nodeId', keyPath: 'nodeId', unique: false }, { name: 'timestamp', keyPath: 'timestamp', unique: false }, { name: 'networkType', keyPath: 'networkType', unique: false }] }],
      isResponseCache: false,
    },
    {
      dbName: config.cacheConfig.mockNodeVariableCache.dbName,
      version: config.cacheConfig.mockNodeVariableCache.version,
      stores: [{ storeName: config.cacheConfig.mockNodeVariableCache.storeName, keyPath: '_id', indexes: [{ name: 'projectId', keyPath: 'projectId', unique: false }] }],
      isResponseCache: false,
    },
    {
      dbName: config.cacheConfig.mockNodeLogsCache.dbName,
      version: config.cacheConfig.mockNodeLogsCache.version,
      stores: [{ storeName: config.cacheConfig.mockNodeLogsCache.storeName, keyPath: 'id', indexes: [{ name: 'nodeId', keyPath: 'nodeId', unique: false }, { name: 'projectId', keyPath: 'projectId', unique: false }, { name: 'timestamp', keyPath: 'timestamp', unique: false }, { name: 'type', keyPath: 'type', unique: false }] }],
      isResponseCache: false,
    },
    {
      dbName: config.cacheConfig.agentViewMessageCache.dbName,
      version: config.cacheConfig.agentViewMessageCache.version,
      stores: [{ storeName: config.cacheConfig.agentViewMessageCache.storeName, keyPath: 'id', indexes: [{ name: 'sessionId', keyPath: 'sessionId', unique: false }, { name: 'timestamp', keyPath: 'timestamp', unique: false }] }],
      isResponseCache: false,
    },
    {
      dbName: config.cacheConfig.projectCache.dbName,
      version: config.cacheConfig.projectCache.version,
      stores: [{ storeName: config.cacheConfig.projectCache.storeName, keyPath: null, indexes: [] }],
      isResponseCache: false,
    },
    {
      dbName: config.cacheConfig.apiNodesCache.dbName,
      version: config.cacheConfig.apiNodesCache.version,
      stores: [{ storeName: config.cacheConfig.apiNodesCache.storeName, keyPath: null, indexes: [{ name: config.cacheConfig.apiNodesCache.projectIdIndex, keyPath: config.cacheConfig.apiNodesCache.projectIdIndex, unique: false }] }],
      isResponseCache: false,
    },
    {
      dbName: config.cacheConfig.commonHeadersCache.dbName,
      version: config.cacheConfig.commonHeadersCache.version,
      stores: [{ storeName: config.cacheConfig.commonHeadersCache.storeName, keyPath: null, indexes: [] }],
      isResponseCache: false,
    },
    {
      dbName: config.cacheConfig.variablesCache.dbName,
      version: config.cacheConfig.variablesCache.version,
      stores: [{ storeName: config.cacheConfig.variablesCache.storeName, keyPath: null, indexes: [{ name: config.cacheConfig.variablesCache.projectIdIndex, keyPath: config.cacheConfig.variablesCache.projectIdIndex, unique: false }] }],
      isResponseCache: false,
    },
  ]
}
const getExistingDbVersionMap = async (): Promise<Map<string, number>> => {
  const databasesFn = (indexedDB as unknown as { databases?: () => Promise<IDBDatabaseInfo[]> }).databases
  if (!databasesFn) {
    return new Map()
  }
  const databases = await databasesFn.call(indexedDB)
  const map = new Map<string, number>()
  for (const item of databases) {
    if (!item.name || typeof item.version !== 'number') {
      continue
    }
    map.set(item.name, item.version)
  }
  return map
}
const openOrCreateManagedDB = async (
  schema: { dbName: string; version: number; stores: ManagedStoreSchema[] },
  existingVersion: number | undefined
): Promise<IDBPDatabase> => {
  const targetVersion = existingVersion ? Math.max(existingVersion, schema.version) : schema.version
  return openDB(schema.dbName, targetVersion, {
    upgrade(db, _oldVersion, _newVersion, transaction) {
      for (const storeSchema of schema.stores) {
        const store = db.objectStoreNames.contains(storeSchema.storeName)
          ? transaction.objectStore(storeSchema.storeName)
          : storeSchema.keyPath
            ? db.createObjectStore(storeSchema.storeName, { keyPath: storeSchema.keyPath })
            : db.createObjectStore(storeSchema.storeName)
        for (const indexSchema of storeSchema.indexes) {
          if (!store.indexNames.contains(indexSchema.name)) {
            store.createIndex(indexSchema.name, indexSchema.keyPath, { unique: indexSchema.unique })
          }
        }
      }
    },
  })
}
const readLocalStorageEntries = (): Array<{ key: string; value: string }> => {
  const entries: Array<{ key: string; value: string }> = []
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i)
    if (!key) {
      continue
    }
    const value = localStorage.getItem(key) ?? ''
    entries.push({ key, value })
  }
  entries.sort((a, b) => a.key.localeCompare(b.key))
  return entries
}
const buildTimestampFileName = (timestamp: number): string => {
  const d = new Date(timestamp)
  const pad2 = (n: number) => String(n).padStart(2, '0')
  const yyyy = d.getFullYear()
  const mm = pad2(d.getMonth() + 1)
  const dd = pad2(d.getDate())
  const hh = pad2(d.getHours())
  const mi = pad2(d.getMinutes())
  const ss = pad2(d.getSeconds())
  return `apiflow-backup-${yyyy}${mm}${dd}-${hh}${mi}${ss}.zip`
}
export const estimateLocalDataCount = async (includeResponseCache: boolean, onProgress?: (p: BackupProgress) => void): Promise<number> => {
  const entries = readLocalStorageEntries()
  const managedSchemas = getManagedDbSchemas().filter((db) => includeResponseCache || !db.isResponseCache)
  const existingVersions = await getExistingDbVersionMap()
  let total = entries.length
  let scannedStores = 0
  const allStores = managedSchemas.reduce((sum, db) => sum + db.stores.length, 0)
  onProgress?.({ phase: 'estimate', current: 0, total: allStores, label: 'indexedDB' })
  for (const dbSchema of managedSchemas) {
    const existingVersion = existingVersions.get(dbSchema.dbName)
    if (!existingVersion) {
      scannedStores += dbSchema.stores.length
      onProgress?.({ phase: 'estimate', current: scannedStores, total: allStores, label: 'indexedDB' })
      continue
    }
    const db = await openDB(dbSchema.dbName, existingVersion)
    try {
      for (const store of dbSchema.stores) {
        const count = await db.count(store.storeName)
        total += count
        scannedStores += 1
        onProgress?.({ phase: 'estimate', current: scannedStores, total: allStores, label: store.storeName })
      }
    } finally {
      db.close()
    }
  }
  return total
}
export const exportLocalDataToZip = async (includeResponseCache: boolean, onProgress: (p: BackupProgress) => void): Promise<{ blob: Blob; fileName: string; manifest: BackupManifestV1; totalCount: number }> => {
  const managedSchemas = getManagedDbSchemas().filter((db) => includeResponseCache || !db.isResponseCache)
  const existingVersions = await getExistingDbVersionMap()
  const localEntries = readLocalStorageEntries()
  const totalCount = await estimateLocalDataCount(includeResponseCache)
  const zip = new JSZip()
  const localStorageFile = 'localStorage.json'
  zip.file(localStorageFile, stringifyBackupJson({ entries: localEntries }))
  let processed = 0
  onProgress({ phase: 'export', current: processed, total: totalCount, label: 'localStorage' })
  processed += localEntries.length
  onProgress({ phase: 'export', current: processed, total: totalCount, label: 'localStorage' })
  const dbManifests: BackupManifestV1['indexedDB'] = []
  for (const dbSchema of managedSchemas) {
    const existingVersion = existingVersions.get(dbSchema.dbName)
    if (!existingVersion) {
      continue
    }
    const db = await openDB(dbSchema.dbName, existingVersion)
    try {
      const stores: BackupManifestStoreV1[] = []
      for (const storeSchema of dbSchema.stores) {
        const storeFile = `indexeddb/${dbSchema.dbName}/${storeSchema.storeName}.json`
        const tx = db.transaction(storeSchema.storeName, 'readonly')
        const store = tx.objectStore(storeSchema.storeName)
        const records: Array<{ key: unknown; value: unknown }> = []
        let cursor = await store.openCursor()
        while (cursor) {
          records.push({ key: cursor.key, value: cursor.value })
          processed += 1
          onProgress({ phase: 'export', current: processed, total: totalCount, label: storeSchema.storeName })
          cursor = await cursor.continue()
        }
        await tx.done
        zip.file(storeFile, stringifyBackupJson({ records }))
        stores.push({ storeName: storeSchema.storeName, keyPath: storeSchema.keyPath, indexes: storeSchema.indexes, count: records.length, file: storeFile })
      }
      dbManifests.push({ dbName: dbSchema.dbName, version: existingVersion, stores })
    } finally {
      db.close()
    }
  }
  const exportedAt = Date.now()
  const manifest: BackupManifestV1 = {
    schemaVersion: 1,
    exportedAt,
    appVersion: config.appConfig.version,
    includeResponseCache,
    localStorage: { file: localStorageFile, count: localEntries.length },
    indexedDB: dbManifests,
  }
  zip.file('manifest.json', stringifyBackupJson(manifest))
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
  const fileName = buildTimestampFileName(exportedAt)
  return { blob, fileName, manifest, totalCount }
}
export const downloadBlob = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
export const parseBackupManifest = async (file: File): Promise<{ zip: JSZip; manifest: BackupManifestV1; estimatedCount: number }> => {
  const zip = await JSZip.loadAsync(file)
  const manifestFile = zip.file('manifest.json')
  if (!manifestFile) {
    throw new Error('manifest.json not found')
  }
  const manifestText = await manifestFile.async('text')
  const manifest = parseBackupJson<BackupManifestV1>(manifestText)
  if (manifest.schemaVersion !== 1) {
    throw new Error('unsupported schemaVersion')
  }
  let total = manifest.localStorage.count
  for (const dbInfo of manifest.indexedDB) {
    for (const storeInfo of dbInfo.stores) {
      total += storeInfo.count
    }
  }
  return { zip, manifest, estimatedCount: total }
}
export const clearApiflowLocalData = async (): Promise<void> => {
  localStorage.clear()
  const managedSchemas = getManagedDbSchemas()
  const existingVersions = await getExistingDbVersionMap()
  for (const dbSchema of managedSchemas) {
    const existingVersion = existingVersions.get(dbSchema.dbName)
    if (!existingVersion) {
      continue
    }
    const db = await openDB(dbSchema.dbName, existingVersion)
    try {
      const storeNames = dbSchema.stores.map((s) => s.storeName)
      const tx = db.transaction(storeNames, 'readwrite')
      for (const storeName of storeNames) {
        await tx.objectStore(storeName).clear()
      }
      await tx.done
    } finally {
      db.close()
    }
  }
}
export const importLocalDataFromZip = async (zip: JSZip, manifest: BackupManifestV1, mode: 'merge' | 'override', onProgress: (p: BackupProgress) => void): Promise<{ importedCount: number }> => {
  if (mode === 'override') {
    await clearApiflowLocalData()
  }
  const existingVersions = await getExistingDbVersionMap()
  const totalCount = manifest.localStorage.count + manifest.indexedDB.reduce((sum, db) => sum + db.stores.reduce((s, store) => s + store.count, 0), 0)
  let processed = 0
  let inserted = 0
  const localStorageJson = zip.file(manifest.localStorage.file)
  if (localStorageJson) {
    const text = await localStorageJson.async('text')
    const parsed = parseBackupJson<{ entries: Array<{ key: string; value: string }> }>(text)
    for (const item of parsed.entries) {
      localStorage.setItem(item.key, item.value)
      processed += 1
      inserted += 1
      onProgress({ phase: 'import', current: processed, total: totalCount, label: 'localStorage' })
    }
  }
  for (const dbInfo of manifest.indexedDB) {
    const schema: { dbName: string; version: number; stores: ManagedStoreSchema[] } = {
      dbName: dbInfo.dbName,
      version: dbInfo.version,
      stores: dbInfo.stores.map((s) => ({ storeName: s.storeName, keyPath: s.keyPath, indexes: s.indexes })),
    }
    const db = await openOrCreateManagedDB(schema, existingVersions.get(dbInfo.dbName))
    try {
      for (const storeInfo of dbInfo.stores) {
        const storeFile = zip.file(storeInfo.file)
        if (!storeFile) {
          processed += storeInfo.count
          onProgress({ phase: 'import', current: processed, total: totalCount, label: storeInfo.storeName })
          continue
        }
        const storeText = await storeFile.async('text')
        const parsed = parseBackupJson<{ records: Array<{ key: unknown; value: unknown }> }>(storeText)
        const tx = db.transaction(storeInfo.storeName, 'readwrite')
        const store = tx.objectStore(storeInfo.storeName)
        for (const record of parsed.records) {
          if (storeInfo.keyPath) {
            await store.put(record.value)
          } else {
            if (typeof record.key !== 'string' && typeof record.key !== 'number') {
              throw new Error('invalid key type')
            }
            await store.put(record.value, record.key)
          }
          processed += 1
          inserted += 1
          onProgress({ phase: 'import', current: processed, total: totalCount, label: storeInfo.storeName })
        }
        await tx.done
      }
    } finally {
      db.close()
    }
  }
  return { importedCount: inserted }
}
