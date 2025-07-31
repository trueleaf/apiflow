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
          <!-- <div class="cache-count">{{ cacheInfo.localStorageDetails.length }} 项</div> -->
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
          <div class="cache-size">{{ formatBytes(cacheInfo.indexedDBSize) }}</div>
          <!-- <div class="cache-count">{{ cacheInfo.indexedDBDetails.length }} 项</div> -->
          <!-- 进度显示 -->
          <div v-if="indexedDBSizeLoading && indexedDBProgress > 0" class="progress-info">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: indexedDBProgress + '%' }"></div>
            </div>
            <div class="progress-text"> ({{ indexedDBProgress }}%)</div>
          </div>
        </div>
      </div>
    </div>
 </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { CacheInfo, LocalStorageItem } from '@src/types/apidoc/cache'
import { formatBytes } from '@/helper'
import { RefreshRight } from '@element-plus/icons-vue'
import { indexedDBWorkerManager } from '@/utils/utils'
import { CacheManageProgressUpdateData, CacheManageErrorData, CacheManageIndexedDBResult } from '@src/types/apidoc/worker'

// 加载状态管理
const indexedDBSizeLoading = ref(false)
const localStorageSizeLoading = ref(false)

// IndexedDB 进度状态
const indexedDBProgress = ref(0)
const indexedDBStatus = ref('')

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
  indexedDBSizeLoading.value = true
  indexedDBProgress.value = 0
  indexedDBStatus.value = '初始化中...'

  try {
    // 确保 Worker 已初始化
    if (!indexedDBWorkerManager.ready) {
      await indexedDBWorkerManager.init()
    }

    // 设置 Worker 回调
    indexedDBWorkerManager.setCallbacks({
      onProgress: (data: CacheManageProgressUpdateData) => {
        indexedDBProgress.value = data.progress
        indexedDBStatus.value = data.status
      },
      onError: (data: CacheManageErrorData) => {
        console.error('IndexedDB Worker 错误:', data.message)
        if (data.stack) {
          console.error('错误堆栈:', data.stack)
        }
        // 发生错误时重置数据
        cacheInfo.value.indexedDBSize = 0
        cacheInfo.value.indexedDBDetails = []
        indexedDBSizeLoading.value = false
      },
      onResult: (data: CacheManageIndexedDBResult) => {
        // 更新缓存信息
        cacheInfo.value.indexedDBSize = data.totalSize
        cacheInfo.value.indexedDBDetails = data.details.map((item: {name: string, size: number, description: string}) => ({
          name: item.name,
          size: item.size,
          description: item.description
        }))
        indexedDBSizeLoading.value = false
        indexedDBProgress.value = 100
        indexedDBStatus.value = '完成'
      }
    })

    // 开始获取数据
    await indexedDBWorkerManager.getIndexedDBData()

  } catch (error) {
    console.error('获取 IndexedDB 缓存信息失败:', error)
    // 发生错误时重置数据
    cacheInfo.value.indexedDBSize = 0
    cacheInfo.value.indexedDBDetails = []
    indexedDBSizeLoading.value = false
    indexedDBProgress.value = 0
    indexedDBStatus.value = '获取失败'
  }
}

/*
|--------------------------------------------------------------------------
| 组件生命周期
|--------------------------------------------------------------------------
*/
onMounted(async () => {
  getLocalStorage()

  // 初始化 IndexedDB Worker
  try {
    await indexedDBWorkerManager.init()
  } catch (error) {
    console.error('初始化 IndexedDB Worker 失败:', error)
  }
})

onUnmounted(() => {
  // 清理 Worker 资源
  indexedDBWorkerManager.destroy()
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
      height: 120px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      padding: 16px;
      display: flex;
      flex-direction: column;

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
          font-size: 16px;
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
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;

        .cache-size {
          font-size: 28px;
          font-weight: 600;
          color: #409eff;
          margin-bottom: 8px;
          line-height: 1;
        }

        .cache-count {
          font-size: 14px;
          color: #666;
        }

        .progress-info {
          margin-top: 8px;

          .progress-bar {
            width: 100%;
            height: 4px;
            background-color: #f0f0f0;
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 4px;

            .progress-fill {
              height: 100%;
              background-color: #409eff;
              transition: width 0.3s ease;
            }
          }

          .progress-text {
            font-size: 12px;
            color: #666;
            text-align: center;
          }
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
