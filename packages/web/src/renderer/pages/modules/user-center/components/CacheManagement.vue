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
          <div class="cache-size">{{ formatBytes(cacheInfo.indexedDBSize === -1 ? 0 : cacheInfo.indexedDBSize) }}</div>
        </div>
        <div v-if="!indexedDBSizeLoading && cacheInfo.indexedDBSize === -1" class="gray-500" @click="getIndexedDB">点击计算缓存大小</div>
        <div v-if="indexedDBSizeLoading" class="gray-500">计算中...</div>
      </div>
    </div>

    <!-- IndexedDB 详情表格 -->
    <div class="indexeddb-table-container">
      <div class="table-title">
        <h3>IndexedDB 缓存详情</h3>
      </div>
      <el-table :data="cacheInfo.indexedDBDetails" border>
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="dbName" label="数据库名称"  />
        <el-table-column prop="storeName" label="存储名称" />
        <el-table-column prop="size" label="大小">
          <template #default="scope">
            
            {{ formatBytes(scope.row.size) }}
          </template>

        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button link @click="handleViewDetail(scope.row)">{{ $t('详情') }}</el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)">{{ $t('删除') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 空数据提示 -->
    <div v-if="!indexedDBSizeLoading && cacheInfo.indexedDBDetails.length === 0 && cacheInfo.indexedDBSize !== -1" class="empty-data">
      <div class="empty-text">暂无数据</div>
    </div>

    <!-- 详情模态框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="详情信息"
      width="600px"
      :before-close="handleCloseDetail"
    >
      <div class="detail-content">
        详情内容待实现
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCloseDetail">关闭</el-button>
        </span>
      </template>
    </el-dialog>
 </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { CacheInfo, LocalStorageItem, IndexedDBItem } from '@src/types/apidoc/cache'
import { formatBytes } from '@/helper'
import { RefreshRight } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

// 加载状态管理
const indexedDBSizeLoading = ref(false)
const localStorageSizeLoading = ref(false)

// IndexedDB
const indexedDBWorkerRef = ref<Worker | null>(null)

// 模态框状态管理
const detailDialogVisible = ref(false)

// 缓存信息数据
const cacheInfo = ref<CacheInfo>({
  localStroageSize: 0,
  indexedDBSize: -1,
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
      cacheInfo.value.indexedDBSize = data.data.size;
    }  else if (data.type === 'finish') {
      indexedDBSizeLoading.value = false;
      cacheInfo.value.indexedDBDetails = data.data;
    } else if (data.type === 'error') {
      console.error(data.error)
      indexedDBSizeLoading.value = false
    }
  }
}

/*
|--------------------------------------------------------------------------
| IndexedDB 表格操作函数
|--------------------------------------------------------------------------
*/
// 查看详情
const handleViewDetail = (row: IndexedDBItem): void => {
  detailDialogVisible.value = true
}

// 删除操作
const handleDelete = async (row: IndexedDBItem): Promise<void> => {
  try {
    await ElMessageBox.confirm('确定要删除这条数据吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 仅在控制台打印被删除的数据，不实际删除
    console.log('删除的数据:', row)
  } catch {
    // 用户取消删除操作，不做任何处理
  }
}

// 关闭详情模态框
const handleCloseDetail = (): void => {
  detailDialogVisible.value = false
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
  width: 70%;
  margin: 0 auto;
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

  // IndexedDB 表格容器
  .indexeddb-table-container {
    margin-top: 24px;
    background: #fff;
    .table-title {
      margin-bottom: 16px;
      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }
    }
  }

  // 空数据提示
  .empty-data {
    margin-top: 24px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    padding: 40px 20px;
    text-align: center;

    .empty-text {
      font-size: 16px;
      color: #999;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
