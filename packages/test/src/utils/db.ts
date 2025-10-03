import { openDB, DBSchema, IDBPDatabase } from 'idb'
import type { TestStatus } from '../types'

// 定义数据库结构
interface TestCaseDB extends DBSchema {
  testCases: {
    key: string
    value: TestCaseStorageData
  }
}

// 测试用例存储数据结构
export interface TestCaseStorageData {
  id: string
  status: TestStatus
  executedAt: string
  remark?: string
  images?: string[] // base64格式
}

const DB_NAME = 'test-case-db'
const DB_VERSION = 1
const STORE_NAME = 'testCases'

let dbInstance: IDBPDatabase<TestCaseDB> | null = null

// 初始化数据库
export const initDB = async (): Promise<IDBPDatabase<TestCaseDB>> => {
  if (dbInstance) {
    return dbInstance
  }

  dbInstance = await openDB<TestCaseDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 创建对象存储
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    },
  })

  return dbInstance
}

// 保存单个测试用例数据
export const saveTestCase = async (data: TestCaseStorageData): Promise<void> => {
  const db = await initDB()
  await db.put(STORE_NAME, data)
}

// 批量保存测试用例数据
export const saveTestCases = async (dataList: TestCaseStorageData[]): Promise<void> => {
  const db = await initDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  
  await Promise.all([
    ...dataList.map(data => tx.store.put(data)),
    tx.done,
  ])
}

// 获取单个测试用例数据
export const getTestCase = async (id: string): Promise<TestCaseStorageData | undefined> => {
  const db = await initDB()
  return await db.get(STORE_NAME, id)
}

// 获取所有测试用例数据
export const getAllTestCases = async (): Promise<TestCaseStorageData[]> => {
  const db = await initDB()
  return await db.getAll(STORE_NAME)
}

// 删除单个测试用例数据
export const deleteTestCase = async (id: string): Promise<void> => {
  const db = await initDB()
  await db.delete(STORE_NAME, id)
}

// 清空所有数据
export const clearAllTestCases = async (): Promise<void> => {
  const db = await initDB()
  await db.clear(STORE_NAME)
}

// 获取测试用例数据映射表（id -> data）
export const getTestCaseMap = async (): Promise<Record<string, TestCaseStorageData>> => {
  const allData = await getAllTestCases()
  const map: Record<string, TestCaseStorageData> = {}
  
  allData.forEach(data => {
    map[data.id] = data
  })
  
  return map
}
