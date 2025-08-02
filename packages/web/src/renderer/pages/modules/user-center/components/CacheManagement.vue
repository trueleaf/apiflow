<template>
  <div class="cache-management">
    <!-- 页面标题区域 -->
    <div class="page-title">
      <h2>缓存管理</h2>
    </div>

    <!-- 缓存统计区域 -->
    <div class="statistics">
      <!-- localStorage 缓存卡片 -->
      <div class="cache-card">
        <div class="card-header">
          <div class="card-icon">
            <i class="iconfont iconcipan"></i>
          </div>
          <div class="card-title">localStorage 缓存</div>
          <div class="card-refresh">
            <div
              class="refresh-btn"
              @click="getLocalStorage"
              :disabled="localStorageSizeLoading"
            >
              <div :class="{ 'fresh-icon': true, 'loading': localStorageSizeLoading }">
                <el-icon size="18"><RefreshRight /></el-icon>
              </div>
            </div>
          </div>
        </div>
        <div class="card-body">
          <div class="cache-size">{{ formatBytes(cacheInfo.localStroageSize) }}</div>
        </div>
      </div>

      <!-- IndexedDB 缓存卡片 -->
      <div class="cache-card">
        <div class="card-header">
          <div class="card-icon">
            <i class="iconfont iconodbc"></i>
          </div>
          <div class="card-title">IndexedDB 缓存</div>
          <div class="card-refresh">
            <div
              class="refresh-btn"
              :class="{ loading: indexedDBSizeLoading }"
              @click="getIndexedDB"
              :disabled="indexedDBSizeLoading"
            >
               <div :class="{ 'fresh-icon': true, 'loading': indexedDBSizeLoading }">
                <el-icon size="18"><RefreshRight /></el-icon>
              </div>
            </div>
          </div>
        </div>
        <div class="card-body">
          <div class="cache-size">{{ formatBytes(indexedDBDataSize === -1 ? 0 : indexedDBDataSize) }}</div>
        </div>
        <div v-if="!indexedDBSizeLoading && indexedDBDataSize === -1" class="gray-500" @click="getIndexedDB">点击计算缓存大小</div>
        <div v-if="indexedDBSizeLoading" class="gray-500">计算中...</div>
      </div>
    </div>
 </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { CacheInfo, LocalStorageItem } from '@src/types/apidoc/cache'
import { formatBytes } from '@/helper'
import { RefreshRight } from '@element-plus/icons-vue'

// 加载状态管理
const indexedDBSizeLoading = ref(false)
const localStorageSizeLoading = ref(false)

// IndexedDB
const indexedDBDataSize = ref(-1)
const indexedDBWorkerRef = ref<Worker | null>(null)

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

//获取 IndexedDB 缓存信息 (使用 Web Worker)
const getIndexedDB = async () => {
  if (!indexedDBWorkerRef.value || indexedDBSizeLoading.value) {
    return
  }
  indexedDBWorkerRef.value.postMessage({
    type: 'getIndexedDBData'
  })
  indexedDBSizeLoading.value = true;
  indexedDBWorkerRef.value.onmessage = (event) => {
    const { data } = event
    if (data.type === 'changeStatus') {
      indexedDBDataSize.value = data.data.size
    }  else if (data.type === 'finish') {
      indexedDBSizeLoading.value = false
    } else if (data.type === 'error') {
      console.error(data.error)
      indexedDBSizeLoading.value = false
    }
  }
}

/*
|--------------------------------------------------------------------------
| 组件生命周期
|--------------------------------------------------------------------------
*/
onMounted(async () => {
  getLocalStorage()
  indexedDBWorkerRef.value = new Worker(new URL('@/worker/indexedDB.ts', import.meta.url), { type: 'module' })
})

</script>

<style lang="scss" scoped>
.cache-management {
  padding: 20px;

  .page-title {
    margin-bottom: 24px;

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }
  }

  .statistics {
    display: flex;
    gap: 20px;

    .cache-card {
      width: 250px;
      height: 110px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      padding: 16px;

      .card-header {
        display: flex;
        align-items: center;
        margin-bottom: 5px;

        .card-icon {
          margin-right: 8px;

          .iconfont {
            font-size: 18px;
            color: #409eff;
          }
        }

        .card-title {
          flex: 1;
          font-size: 17px;
          font-weight: bolder;
          color: #333;
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
                background-color: #eee;
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
          color: #409eff;
          line-height: 1;
        }
      }
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
