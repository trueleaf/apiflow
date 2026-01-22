<template>
  <div class="cache-management">
    <div class="page-title">
      <h2>{{ t('本地数据管理') }}</h2>
      <el-button 
        type="danger" 
        :loading="clearingAllCache"
        @click="handleClearAllCache"
      >
        {{ t('清空所有缓存') }}
      </el-button>
    </div>
    <div class="statistics">
      <!-- localStorage 本地数据卡片 -->
      <div 
        class="cache-card" 
        :class="{ 'selected': selectedCacheType === 'localStorage' }"
        @click="handleSelectCacheType('localStorage')"
      >
        <div class="card-header">
          <div class="card-icon">
            <i class="iconfont iconcipan"></i>
          </div>
          <div class="card-title">{{ t('localStorage 数据') }}</div>
          <div class="card-refresh">
            <div
              class="refresh-btn"
              @click.stop="getLocalStorage"
              :disabled="localStorageLoading"
            >
              <div :class="{ 'fresh-icon': true, 'loading': localStorageLoading }">
                <el-icon size="18"><RefreshRight /></el-icon>
              </div>
            </div>
          </div>
        </div>
        <div class="card-body">
          <div class="cache-size">{{ formatUnit(cacheInfo.localStroageSize, 'bytes') }}</div>
        </div>
      </div>
      <!-- IndexedDB 本地数据卡片 -->
      <div 
        class="cache-card"
        :class="{ 'selected': selectedCacheType === 'indexedDB' }"
        @click="handleSelectCacheType('indexedDB')"
      >
        <div class="card-header">
          <div class="card-icon">
            <i class="iconfont iconodbc"></i>
          </div>
          <div class="card-title">{{ t('IndexedDB 本地数据') }}</div>
          <div class="card-refresh">
            <div
              class="refresh-btn"
              :class="{ loading: indexedDBLoading }"
              @click.stop="getIndexedDB"
              :disabled="indexedDBLoading"
            >
               <div :class="{ 'fresh-icon': true, 'loading': indexedDBLoading }">
                <el-icon size="18"><RefreshRight /></el-icon>
              </div>
            </div>
          </div>
        </div>
        <div class="card-body">
          <div class="cache-size">{{ formatUnit(cacheInfo.indexedDBSize === -1 ? 0 : cacheInfo.indexedDBSize, 'bytes') }}</div>
        </div>
        <div v-if="!indexedDBLoading && cacheInfo.indexedDBSize === -1" class="gray-500" @click.stop="getIndexedDB">{{ t('点击计算本地数据大小') }}</div>
        <div v-if="indexedDBLoading" class="gray-500">{{ t('计算中...') }}</div>
      </div>
      <!-- 数据备份卡片 -->
      <div 
        class="cache-card"
        :class="{ 'selected': selectedCacheType === 'backup' }"
        @click="handleSelectCacheType('backup')"
      >
        <div class="card-header">
          <div class="card-icon">
            <i class="iconfont iconexport"></i>
          </div>
          <div class="card-title">{{ t('数据备份/导出') }}</div>
        </div>
        <div class="card-body">
          <div class="card-description">
            <div>{{ t('备份所有本地数据 | 导出本地数据') }}</div>
          </div>
        </div>
      </div>
      <!-- 数据恢复卡片 -->
      <div 
        class="cache-card"
        :class="{ 'selected': selectedCacheType === 'restore' }"
        @click="handleSelectCacheType('restore')"
      >
        <div class="card-header">
          <div class="card-icon">
            <i class="iconfont iconimport"></i>
          </div>
          <div class="card-title">{{ t('数据恢复/导入') }}</div>
        </div>
        <div class="card-body">
          <div class="card-description">{{ t('从备份中恢复数据') }}</div>
        </div>
      </div>
    </div>
    <LocalStorageDetail 
      v-if="selectedCacheType === 'localStorage'" 
      :local-storage-details="cacheInfo.localStorageDetails"
      :local-storage-loading="localStorageLoading"
      @refresh="getLocalStorage"
    />
    <IndexedDBDetail 
      v-if="selectedCacheType === 'indexedDB'" 
      :indexed-d-b-details="cacheInfo.indexedDBDetails"
      :indexed-d-b-loading="indexedDBLoading"
      :indexed-d-b-size="cacheInfo.indexedDBSize"
      :indexed-d-b-worker-ref="indexedDBWorkerRef"
      @refresh="getIndexedDB"
    />
    <DataBackup v-if="selectedCacheType === 'backup'" />
    <DataRestore v-if="selectedCacheType === 'restore'" />
 </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { CacheInfo, LocalStorageItem, IndexedDBItem } from '@src/types/apidoc/cache'
import { formatUnit, isElectron } from '@/helper'
import { RefreshRight } from '@element-plus/icons-vue'
import { appStateCache } from '@/cache/appState/appStateCache.ts'
import { appSettingsCache } from '@/cache/settings/appSettingsCache'
import LocalStorageDetail from './components/LocalStorageDetail.vue'
import IndexedDBDetail from './components/IndexedDBDetail.vue'
import DataBackup from './components/DataBackup.vue'
import DataRestore from './components/DataRestore.vue'
import { message } from '@/helper'
import { ClConfirm } from '@/components/ui/cleanDesign/clConfirm/ClConfirm2'
import { IPC_EVENTS } from '@src/types/ipc'

const { t } = useI18n()

/*
|--------------------------------------------------------------------------
| 变量相关
|--------------------------------------------------------------------------
*/
const indexedDBLoading = ref(false)
const localStorageLoading = ref(false)
const clearingAllCache = ref(false)
const indexedDBWorkerRef = ref<Worker | null>(null)
const selectedCacheType = ref<'localStorage' | 'indexedDB' | 'backup' | 'restore'>(appStateCache.getSelectedCacheType())
const cacheInfo = ref<CacheInfo>({
  localStroageSize: 0,
  indexedDBSize: -1,
  localStorageDetails: [],
  indexedDBDetails: []
})
type IdleScheduler = (callback: () => void, options?: { timeout?: number }) => number
const scheduleDeferredTask = (task: () => void) => {
  if (typeof window === 'undefined') {
    task()
    return
  }
  const idle = (window as unknown as { requestIdleCallback?: IdleScheduler }).requestIdleCallback
  if (idle) {
    idle(() => task(), { timeout: 200 })
    return
  }
  window.setTimeout(task, 50)
}
/*
|--------------------------------------------------------------------------
| 初始化相关
|--------------------------------------------------------------------------
*/
//初始化 Web Worker
const initWorker = () => {
  if (indexedDBWorkerRef.value) {
    return
  }
  indexedDBWorkerRef.value = new Worker(new URL('@/worker/indexedDB.ts', import.meta.url), { type: 'module' });
  indexedDBWorkerRef.value.addEventListener('message', handleMessage);
}
//消息处理
const handleMessage = (event: MessageEvent) => {
  const { data } = event
  if (data.type === 'changeStatus') {
    cacheInfo.value.indexedDBSize = data.data.size;
  } else if (data.type === 'finish') {
    indexedDBLoading.value = false;
    // 翻译 Worker 返回的 description
    cacheInfo.value.indexedDBDetails = data.data.map((item: IndexedDBItem) => ({
      ...item,
      description: t(item.description)
    }));
    saveCacheData() // 保存本地数据
  } else if (data.type === 'deleteStoreResult') {
    if (data.data.success) {
      message.success(t('删除成功'))
      // 更新总本地数据大小
      if (data.data.size) {
        cacheInfo.value.indexedDBSize -= data.data.size;
        // 找到并更新对应的store项
        const index = cacheInfo.value.indexedDBDetails.findIndex(
          item => item.dbName === data.data.dbName && item.storeName === data.data.storeName
        );
        if (index !== -1) {
          cacheInfo.value.indexedDBDetails[index].size = 0;
        }
        saveCacheData(); // 保存更新后的本地数据
      } else {
        getIndexedDB(); // 如果没有size信息，刷新所有数据
      }
    }
  } else if (data.type === 'deleteStoreItemResult') {
    if (data.data.success && data.data.size) {
      // 更新总本地数据大小
      cacheInfo.value.indexedDBSize -= data.data.size;
      // 找到并更新对应的store项
      const index = cacheInfo.value.indexedDBDetails.findIndex(
        item => item.dbName === data.data.dbName && item.storeName === data.data.storeName
      );
      if (index !== -1) {
        cacheInfo.value.indexedDBDetails[index].size -= data.data.size;
      }
      saveCacheData(); // 保存更新后的本地数据
    }
  } else if (data.type === 'clearAllResult') {
    if (data.data.success) {
      message.success(t('已清空所有IndexedDB中的数据'))
      // 重置IndexedDB相关数据
      cacheInfo.value.indexedDBSize = 0;
      cacheInfo.value.indexedDBDetails = [];
      saveCacheData(); // 保存更新后的本地数据
      getIndexedDB();
    } else {
      message.error(t('清空IndexedDB数据失败'))
    }
  } else if (data.type === 'error') {
    console.error('操作失败:', data.error)
    message.error(t('操作失败') + ': ' + (data.error?.message || t('未知错误')))
  }
};
const getLocalStorage = () => {
  localStorageLoading.value = true
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
        let description = t('未知本地数据')
        if (key === 'apidoc/apidoc') {
          description = t('未保存的API文档本地数据')
        } else if (key === 'apidoc/cookies') {
          description = t('API请求Cookie本地数据')
        } else if (key === 'apidoc/header/activeTab') {
          description = t('顶部导航当前活跃标签页本地数据')
        } else if (key === 'apidoc/header/tabs') {
          description = t('顶部导航所有打开标签页本地数据')
        } else if (key === 'apidoc/pinToolbarOperations') {
          description = t('固定工具栏操作本地数据')
        } else if (key === 'apidoc/tabs') {
          description = t('接口管理标签页本地数据')
        } else if (key === 'history/lastVisitePage') {
          description = t('最近一次访问的页面')
        } else if (key === 'language') {
          description = t('语言设置')
        } else if (key === 'appState/localData/activeMenu') {
          description = t('个人中心被选中菜单')
        } else if (key === 'apidoc/cache/info') {
          description = t('缓存已计算的本地数据')
        } else if (key === 'appState/cacheManager/cacheType') {
          description = t('选中的缓存卡片类型')
        } else {
          description = t('其他本地数据')
        }
        details.push({
          key,
          size: byteSize,
          description
        })
      }
    }
    details.sort((a, b) => b.size - a.size)
    cacheInfo.value.localStroageSize = totalSize
    cacheInfo.value.localStorageDetails = details
  } catch (error) {
    console.error('获取 localStorage 本地数据信息失败:', error)
    // 发生错误时重置数据
    cacheInfo.value.localStroageSize = 0
    cacheInfo.value.localStorageDetails = []
  } finally {
    localStorageLoading.value = false
  }
}
const getIndexedDB = async () => {
  if (!indexedDBWorkerRef.value || indexedDBLoading.value) {
    return
  }
  indexedDBWorkerRef.value.postMessage({
    type: 'getIndexedDBData'
  })
  indexedDBLoading.value = true;
}
//清空所有缓存
const handleClearAllCache = async () => {
  try {
    await ClConfirm({
      content: t('确认清空所有缓存吗？此操作将清空localStorage、sessionStorage、IndexedDB和应用配置中的所有缓存数据，不可恢复！'),
      type: 'warning',
      confirmButtonText: t('确定'),
      cancelButtonText: t('取消'),
    })
  } catch {
    return
  }
  clearingAllCache.value = true
  try {
    localStorage.clear()
    sessionStorage.clear()
    if (indexedDBWorkerRef.value) {
      indexedDBWorkerRef.value.postMessage({ type: 'clearAll' })
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    if (isElectron()) {
      await window.electronAPI?.ipcManager.invoke(IPC_EVENTS.apiflow.rendererToMain.clearElectronStore)
    }
    message.success(t('清空缓存成功，即将刷新页面'))
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } catch (error) {
    message.error(t('清空缓存失败'))
  } finally {
    clearingAllCache.value = false
  }
}
// 处理本地数据类型选择
const handleSelectCacheType = (type: 'localStorage' | 'indexedDB' | 'backup' | 'restore'): void => {
  selectedCacheType.value = type
  // 缓存用户选择的卡片类型
  appStateCache.setSelectedCacheType(type)
  if (type === 'localStorage' && cacheInfo.value.localStorageDetails.length === 0) {
    scheduleDeferredTask(() => {
      getLocalStorage()
    })
  }
  if (type === 'indexedDB') {
    if (!indexedDBWorkerRef.value) {
      initWorker()
    }
    if (cacheInfo.value.indexedDBDetails.length === 0) {
      scheduleDeferredTask(() => {
        getIndexedDB()
      })
    }
  }
}
/*
|--------------------------------------------------------------------------
| 缓存已加载的indexedDB数据
|--------------------------------------------------------------------------
*/
// 加载本地数据
const getIndexedDBCacheData = (): void => {
  const cachedInfo = appSettingsCache.getCacheManagerInfo()
  if (cachedInfo) {
    cacheInfo.value.indexedDBSize = cachedInfo.indexedDBSize
    cacheInfo.value.indexedDBDetails = cachedInfo.indexedDBDetails as IndexedDBItem[]
  }
}
// 保存本地数据
const saveCacheData = (): void => {
  appSettingsCache.setCacheManagerInfo({
    indexedDBSize: cacheInfo.value.indexedDBSize,
    indexedDBDetails: cacheInfo.value.indexedDBDetails
  })
}
/*
|--------------------------------------------------------------------------     
| 组件生命周期
|--------------------------------------------------------------------------     
*/
onMounted(() => {
  scheduleDeferredTask(() => {
    getLocalStorage()
    getIndexedDBCacheData() // 如果计算过indexedDB则默认取缓存数据
    initWorker()
    const cachedType = selectedCacheType.value
    if (cachedType === 'indexedDB' && cacheInfo.value.indexedDBDetails.length === 0) {
      getIndexedDB()
    }
  })
})
// 组件卸载时移除事件监听器，防止内存泄漏
onUnmounted(() => {
  if (indexedDBWorkerRef.value) {
    indexedDBWorkerRef.value.removeEventListener('message', handleMessage)
    indexedDBWorkerRef.value.terminate()
    indexedDBWorkerRef.value = null
  }
})

</script>

<style lang="scss" scoped>
.cache-management {
  padding: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .page-title {
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  .statistics {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    .cache-card {
      width: 250px;
      height: 110px;
      background: var(--bg-primary);
      border-radius: 8px;
      border: 1px solid var(--border-light);
      padding: 16px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        border-color: var(--el-color-primary-light-7);
        box-shadow: 0 2px 12px 0 var(--shadow-light);
      }
      
      &.selected {
        border-color: var(--el-color-primary);
        background-color: var(--el-color-primary-light-9);
      }

      .card-header {
        display: flex;
        align-items: center;
        margin-bottom: 5px;

        .card-icon {
          margin-right: 8px;

          .iconfont {
            font-size: 18px;
            color: var(--el-color-primary);
          }
        }

        .card-title {
          flex: 1;
          font-size: 17px;
          font-weight: bolder;
          color: var(--el-text-color-primary);
        }

        .card-refresh {
          .refresh-btn {
            width: 24px;
            height: 24px;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            .fresh-icon {
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 3px;
              &:hover {
                background-color: var(--bg-hover);
              }
              &.loading:hover {
                background-color: inherit;
              }
              &.loading {
                animation: spin 1s linear infinite;
              }
            }
          }
        }
      }

      .card-body {
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 40px;
        .cache-size {
          font-size: 28px;
          font-weight: 600;
          color: var(--el-color-primary);
          line-height: 1;
        }
        .card-description {
          font-size: 14px;
          color: var(--el-text-color-regular);
          line-height: 1.4;
        }
      }
    }
  }

  // 添加灰色文本样式
  .gray-500 {
    color: var(--el-text-color-secondary);
    font-size: 14px;
    cursor: pointer;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
