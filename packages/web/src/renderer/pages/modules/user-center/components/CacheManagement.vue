<template>
  <div class="cache-management">
    <div class="statistics"></div>
 </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { CacheInfo, LocalStorageItem, IndexedDBItem } from '@src/types/apidoc/cache'

// 加载状态管理
const indexedDBSizeLoading = ref(false)
const localStorageSizeLoading = ref(false)

// 缓存信息数据
const cacheInfo = ref<CacheInfo>({
  localStroageSize: 0,
  indexedDBSize: 0,
  localStorageDetails: [],
  indexedDBDetails: []
})

/*
|--------------------------------------------------------------------------
| 获取缓存数据大小和内容
|--------------------------------------------------------------------------
*/
//获取 localStorage 缓存信息
const getLocalStorage = () => {
  localStorageSizeLoading.value = true
  try {
    let totalSize = 0
    const details: LocalStorageItem[] = []

    // 遍历 localStorage 中的所有键值对
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const value = localStorage.getItem(key) || ''
        const byteSize = new Blob([key + value]).size
        totalSize += byteSize

        // 生成中文描述信息
        let description = '未知缓存数据'
        if (key.startsWith('apidoc/')) {
          // API 文档相关缓存
          if (key === 'apidoc/apidoc') {
            description = '未保存的API文档缓存'
          } else if (key === 'apidoc/cookies') {
            description = 'API请求Cookie缓存'
          } else if (key === 'apidoc/header/activeTab') {
            description = '顶部导航当前活跃标签页缓存'
          } else if (key === 'apidoc/header/tabs') {
            description = '顶部导航所有打开标签页缓存'
          } else if (key === 'apidoc/pinToolbarOperations') {
            description = '固定工具栏操作缓存'
          } else if (key === 'apidoc/tabs') {
            description = '接口管理标签页缓存'
          } else {
            description = '其他缓存'
          }
        }
        details.push({
          key,
          size: byteSize,
          description
        })
      }
    }
    // 按大小降序排序，方便查看占用空间最大的缓存项
    details.sort((a, b) => b.size - a.size)

    // 更新缓存信息
    cacheInfo.value.localStroageSize = totalSize
    cacheInfo.value.localStorageDetails = details

  } catch (error) {
    console.error('获取 localStorage 缓存信息失败:', error)
    // 发生错误时重置数据
    cacheInfo.value.localStroageSize = 0
    cacheInfo.value.localStorageDetails = []
  } finally {
    localStorageSizeLoading.value = false
  }
}

//获取 IndexedDB 缓存信息
const getIndexedDB = async () => {
  indexedDBSizeLoading.value = true

  try {
    let totalSize = 0
    const details: IndexedDBItem[] = []

    // 获取所有 IndexedDB 数据库
    const databases = await indexedDB.databases()

    // 遍历每个数据库
    for (const dbInfo of databases) {
      if (!dbInfo.name) continue

      try {
        // 打开数据库连接
        const db = await new Promise<IDBDatabase>((resolve, reject) => {
          const request = indexedDB.open(dbInfo.name!, dbInfo.version)
          request.onsuccess = () => resolve(request.result)
          request.onerror = () => reject(request.error)
          request.onblocked = () => reject(new Error('数据库被阻塞'))
        })

        // 遍历数据库中的所有对象存储
        const storeNames = Array.from(db.objectStoreNames)

        for (const storeName of storeNames) {
          try {
            // 创建事务并获取对象存储
            const transaction = db.transaction([storeName], 'readonly')
            const store = transaction.objectStore(storeName)

            // 获取所有数据
            const allData = await new Promise<any[]>((resolve, reject) => {
              const request = store.getAll()
              request.onsuccess = () => resolve(request.result || [])
              request.onerror = () => reject(request.error)
            })

            // 计算当前对象存储的数据大小
            let storeSize = 0
            for (const data of allData) {
              // 将数据序列化为 JSON 字符串并计算字节大小
              const jsonString = JSON.stringify(data)
              storeSize += new Blob([jsonString]).size
            }

            totalSize += storeSize

            // 生成中文描述信息
            let description = '未知数据库存储'
            const dbName = dbInfo.name

            if (dbName === 'standaloneCache') {
              // 独立缓存数据库
              if (storeName === 'projects') {
                description = '项目信息缓存存储'
              } else if (storeName === 'docs') {
                description = 'API文档数据缓存存储'
              } else if (storeName === 'commonHeaders') {
                description = '通用请求头缓存存储'
              } else if (storeName === 'rules') {
                description = '项目规则配置缓存存储'
              } else if (storeName === 'variables') {
                description = '项目变量缓存存储'
              } else {
                description = `独立缓存-${storeName}存储`
              }
            } else if (dbName === 'apiflowResponseCache') {
              // API 响应缓存数据库
              if (storeName === 'responseCache') {
                description = '响应结果缓存存储'
              } else {
                description = `API响应缓存-${storeName}存储`
              }
            }else {
              description = `${dbName}-${storeName}存储`
            }

            // 添加到详细信息列表
            details.push({
              name: `${dbName}/${storeName}`,
              size: storeSize,
              description
            })

          } catch (storeError) {
            console.warn(`获取对象存储 ${storeName} 数据失败:`, storeError)
          }
        }
        // 关闭数据库连接
        db.close()
      } catch (dbError) {
        console.warn(`打开数据库 ${dbInfo.name} 失败:`, dbError)
      }
    }

    // 按大小降序排序，方便查看占用空间最大的存储
    details.sort((a, b) => b.size - a.size)

    // 更新缓存信息
    cacheInfo.value.indexedDBSize = totalSize
    cacheInfo.value.indexedDBDetails = details

  } catch (error) {
    console.error('获取 IndexedDB 缓存信息失败:', error)
    // 发生错误时重置数据
    cacheInfo.value.indexedDBSize = 0
    cacheInfo.value.indexedDBDetails = []
  } finally {
    indexedDBSizeLoading.value = false
  }
}

/*
|--------------------------------------------------------------------------
| 组件生命周期
|--------------------------------------------------------------------------
*/
onMounted(() => {
  getLocalStorage()
  getIndexedDB()
})
</script>

<style lang="scss" scoped>


</style>
