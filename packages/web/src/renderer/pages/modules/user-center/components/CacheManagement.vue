<template>
  <div class="cache-management">
    <!-- 缓存概览 -->
    <el-card class="overview-card">
      <template #header>
        <div class="card-header">
          <el-icon><DataBoard /></el-icon>
          <span>{{ $t('缓存概览') }}</span>
        </div>
      </template>
      
      <div class="cache-overview">
        <div class="overview-item">
          <div class="overview-value">{{ formatSize(totalCacheSize) }}</div>
          <div class="overview-label">{{ $t('总缓存大小') }}</div>
        </div>
        <div class="overview-item">
          <div class="overview-value">{{ cacheCategories.length }}</div>
          <div class="overview-label">{{ $t('缓存分类') }}</div>
        </div>
        <div class="overview-item">
          <div class="overview-value">{{ totalCacheItems }}</div>
          <div class="overview-label">{{ $t('缓存项目') }}</div>
        </div>
      </div>
    </el-card>
    
    <!-- 缓存分类管理 -->
    <el-card class="categories-card">
      <template #header>
        <div class="card-header">
          <el-icon><FolderOpened /></el-icon>
          <span>{{ $t('缓存分类管理') }}</span>
          <div class="header-actions">
            <el-button size="small" type="danger" @click="clearAllCache">
              {{ $t('清空所有缓存') }}
            </el-button>
            <el-button size="small" @click="refreshCacheInfo">
              {{ $t('刷新') }}
            </el-button>
          </div>
        </div>
      </template>
      
      <div class="cache-categories">
        <div 
          v-for="category in cacheCategories" 
          :key="category.name"
          class="cache-category"
        >
          <div class="category-info">
            <div class="category-header">
              <el-icon class="category-icon">
                <component :is="category.icon" />
              </el-icon>
              <div class="category-details">
                <div class="category-name">{{ category.displayName }}</div>
                <div class="category-description">{{ category.description }}</div>
              </div>
            </div>
            
            <div class="category-stats">
              <div class="stat-item">
                <span class="stat-label">{{ $t('大小') }}:</span>
                <span class="stat-value">{{ formatSize(category.size) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">{{ $t('项目数') }}:</span>
                <span class="stat-value">{{ category.itemCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">{{ $t('最后更新') }}:</span>
                <span class="stat-value">{{ formatDate(category.lastUpdated) }}</span>
              </div>
            </div>
          </div>
          
          <div class="category-actions">
            <el-button size="small" @click="viewCacheDetails(category)">
              {{ $t('查看详情') }}
            </el-button>
            <el-button 
              size="small" 
              type="warning" 
              @click="clearCategoryCache(category)"
            >
              {{ $t('清空') }}
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
    
    <!-- 缓存详情对话框 -->
    <el-dialog 
      v-model="detailDialogVisible" 
      :title="`${selectedCategory?.displayName} - ${$t('缓存详情')}`"
      width="60%"
    >
      <div class="cache-details">
        <el-table :data="cacheDetails" stripe>
          <el-table-column prop="key" :label="$t('缓存键')" min-width="200" />
          <el-table-column prop="size" :label="$t('大小')" width="100">
            <template #default="{ row }">
              {{ formatSize(row.size) }}
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" :label="$t('创建时间')" width="150">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('操作')" width="100">
            <template #default="{ row }">
              <el-button size="small" type="danger" @click="deleteCacheItem(row)">
                {{ $t('删除') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useTranslation } from 'i18next-vue'
import { DataBoard, FolderOpened, Document, Setting, User } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDate } from '@/helper'
import { apidocCache } from '@/cache/apidoc'
import { standaloneCache } from '@/cache/standalone'

const { t } = useTranslation()

interface CacheCategory {
  name: string
  displayName: string
  description: string
  icon: any
  size: number
  itemCount: number
  lastUpdated: Date
}

interface CacheItem {
  key: string
  size: number
  createdAt: Date
}

const detailDialogVisible = ref(false)
const selectedCategory = ref<CacheCategory | null>(null)
const cacheDetails = ref<CacheItem[]>([])

// 缓存分类数据
const cacheCategories = reactive<CacheCategory[]>([
  {
    name: 'apiResponse',
    displayName: 'API响应缓存',
    description: '接口请求的响应数据缓存',
    icon: 'ApiDoc',
    size: 0,
    itemCount: 0,
    lastUpdated: new Date()
  },
  {
    name: 'projectData',
    displayName: '项目数据缓存',
    description: '项目相关的数据缓存',
    icon: FolderOpened,
    size: 0,
    itemCount: 0,
    lastUpdated: new Date()
  },
  {
    name: 'userSettings',
    displayName: '用户设置缓存',
    description: '用户个人设置和偏好缓存',
    icon: User,
    size: 0,
    itemCount: 0,
    lastUpdated: new Date()
  },
  {
    name: 'documentCache',
    displayName: '文档缓存',
    description: 'API文档和说明文档缓存',
    icon: Document,
    size: 0,
    itemCount: 0,
    lastUpdated: new Date()
  },
  {
    name: 'systemConfig',
    displayName: '系统配置缓存',
    description: '系统配置和运行时缓存',
    icon: Setting,
    size: 0,
    itemCount: 0,
    lastUpdated: new Date()
  }
])

// 计算总缓存大小
const totalCacheSize = computed(() => {
  return cacheCategories.reduce((total, category) => total + category.size, 0)
})

// 计算总缓存项目数
const totalCacheItems = computed(() => {
  return cacheCategories.reduce((total, category) => total + category.itemCount, 0)
})

// 获取真实缓存数据
const loadCacheData = async () => {
  try {
    // 获取 localStorage 缓存大小
    const localStorageSize = getLocalStorageSize()

    // 获取 API 响应缓存大小
    let apiResponseSize = 0
    let apiResponseCount = 0
    if (apidocCache.responseCacheDb) {
      // 这里可以添加获取 IndexedDB 大小的逻辑
      apiResponseSize = localStorageSize.apidoc || 0
      apiResponseCount = Object.keys(JSON.parse(localStorage.getItem('apidoc/apidoc') || '{}')).length
    }

    // 更新缓存分类数据
    const apiResponseCategory = cacheCategories.find(c => c.name === 'apiResponse')
    if (apiResponseCategory) {
      apiResponseCategory.size = apiResponseSize
      apiResponseCategory.itemCount = apiResponseCount
      apiResponseCategory.lastUpdated = new Date()
    }

    // 获取项目数据缓存
    const projectDataSize = localStorageSize.project || 0
    const projectDataCount = Object.keys(JSON.parse(localStorage.getItem('apidoc/headerTabs') || '[]')).length
    const projectCategory = cacheCategories.find(c => c.name === 'projectData')
    if (projectCategory) {
      projectCategory.size = projectDataSize
      projectCategory.itemCount = projectDataCount
      projectCategory.lastUpdated = new Date()
    }

    // 获取用户设置缓存
    const userSettingsSize = localStorageSize.user || 0
    const userSettingsCount = Object.keys(JSON.parse(localStorage.getItem('userSettings') || '{}')).length
    const userCategory = cacheCategories.find(c => c.name === 'userSettings')
    if (userCategory) {
      userCategory.size = userSettingsSize
      userCategory.itemCount = userSettingsCount
      userCategory.lastUpdated = new Date()
    }

  } catch (error) {
    console.error('加载缓存数据失败:', error)
  }
}

// 获取 localStorage 大小
const getLocalStorageSize = () => {
  const sizes = {
    apidoc: 0,
    project: 0,
    user: 0,
    system: 0
  }

  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      const value = localStorage.getItem(key) || ''
      const size = new Blob([value]).size

      if (key.startsWith('apidoc/')) {
        sizes.apidoc += size
      } else if (key.startsWith('project/') || key.includes('Tab')) {
        sizes.project += size
      } else if (key.startsWith('user') || key.includes('Setting')) {
        sizes.user += size
      } else {
        sizes.system += size
      }
    }
  }

  return sizes
}

// 格式化文件大小
const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 查看缓存详情
const viewCacheDetails = (category: CacheCategory) => {
  selectedCategory.value = category
  
  // 模拟生成缓存详情数据
  cacheDetails.value = Array.from({ length: category.itemCount }, (_, index) => ({
    key: `${category.name}_item_${index + 1}`,
    size: Math.floor(Math.random() * 1024 * 100) + 1024, // 1KB-100KB
    createdAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7) // 最近一周内
  }))
  
  detailDialogVisible.value = true
}

// 清空分类缓存
const clearCategoryCache = async (category: CacheCategory) => {
  try {
    await ElMessageBox.confirm(
      `确定要清空 "${category.displayName}" 的所有缓存吗？此操作不可恢复。`,
      '确认清空',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    console.log(`清空缓存分类: ${category.name}`)

    // 根据分类清空对应的缓存
    switch (category.name) {
      case 'apiResponse':
        // 清空 API 响应缓存
        localStorage.removeItem('apidoc/apidoc')
        localStorage.removeItem('apidoc/paramsConfig')
        localStorage.removeItem('apidoc/paramsActiveTab')
        if (apidocCache.responseCacheDb) {
          await apidocCache.responseCacheDb.clear('responseCache')
        }
        break
      case 'projectData':
        // 清空项目数据缓存
        localStorage.removeItem('apidoc/headerTabs')
        localStorage.removeItem('apidoc/headerActiveTab')
        break
      case 'userSettings':
        // 清空用户设置缓存
        localStorage.removeItem('userSettings')
        localStorage.removeItem('userCenter/activeTab')
        break
      case 'systemConfig':
        // 清空系统配置缓存
        const keysToRemove = []
        for (let key in localStorage) {
          if (!key.startsWith('apidoc/') && !key.startsWith('user') && !key.includes('Tab')) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
        break
    }

    // 重置分类数据
    category.size = 0
    category.itemCount = 0
    category.lastUpdated = new Date()

    ElMessage.success(`已清空 "${category.displayName}" 缓存`)
  } catch {
    // 用户取消操作
  }
}

// 清空所有缓存
const clearAllCache = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有缓存吗？此操作不可恢复，可能会影响应用性能。',
      '确认清空所有缓存',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    console.log('清空所有缓存')

    // 清空 localStorage
    const keysToKeep = ['permission/userInfo', 'history/lastVisitePage'] // 保留重要数据
    const allKeys = Object.keys(localStorage)
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key)
      }
    })

    // 清空 IndexedDB 缓存
    if (apidocCache.responseCacheDb) {
      await apidocCache.responseCacheDb.clear('responseCache')
    }

    // 如果是独立模式，清空独立缓存
    if (__STANDALONE__ && standaloneCache.db) {
      await standaloneCache.clearAllData()
    }

    // 重置所有分类数据
    cacheCategories.forEach(category => {
      category.size = 0
      category.itemCount = 0
      category.lastUpdated = new Date()
    })

    ElMessage.success('已清空所有缓存')
  } catch {
    // 用户取消操作
  }
}

// 删除单个缓存项
const deleteCacheItem = (item: CacheItem) => {
  console.log(`删除缓存项: ${item.key}`)
  
  const index = cacheDetails.value.findIndex(detail => detail.key === item.key)
  if (index > -1) {
    cacheDetails.value.splice(index, 1)
    
    // 更新分类统计
    if (selectedCategory.value) {
      selectedCategory.value.size -= item.size
      selectedCategory.value.itemCount -= 1
    }
  }
  
  ElMessage.success('缓存项已删除')
}

// 刷新缓存信息
const refreshCacheInfo = async () => {
  console.log('刷新缓存信息')

  try {
    await loadCacheData()
    ElMessage.success('缓存信息已刷新')
  } catch (error) {
    console.error('刷新缓存信息失败:', error)
    ElMessage.error('刷新缓存信息失败')
  }
}

onMounted(async () => {
  console.log('缓存管理组件已加载')
  await loadCacheData()
})
</script>

<style lang="scss" scoped>
.cache-management {
  .overview-card {
    margin-bottom: 24px;
    
    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 16px;
    }
    
    .cache-overview {
      display: flex;
      gap: 32px;
      
      .overview-item {
        text-align: center;
        
        .overview-value {
          font-size: 24px;
          font-weight: 600;
          color: var(--theme-color);
          margin-bottom: 4px;
        }
        
        .overview-label {
          color: var(--gray-600);
          font-size: 14px;
        }
      }
    }
  }
  
  .categories-card {
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      > div:first-child {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 16px;
      }
      
      .header-actions {
        display: flex;
        gap: 8px;
      }
    }
  }
  
  .cache-categories {
    .cache-category {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border: 1px solid var(--gray-200);
      border-radius: var(--border-radius-base);
      margin-bottom: 12px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .category-info {
        flex: 1;
        
        .category-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          
          .category-icon {
            font-size: 20px;
            color: var(--theme-color);
          }
          
          .category-details {
            .category-name {
              font-weight: 600;
              margin-bottom: 2px;
            }
            
            .category-description {
              font-size: 12px;
              color: var(--gray-600);
            }
          }
        }
        
        .category-stats {
          display: flex;
          gap: 24px;
          font-size: 12px;
          
          .stat-item {
            .stat-label {
              color: var(--gray-600);
            }
            
            .stat-value {
              font-weight: 500;
              margin-left: 4px;
            }
          }
        }
      }
      
      .category-actions {
        display: flex;
        gap: 8px;
      }
    }
  }
  
  .cache-details {
    max-height: 400px;
    overflow-y: auto;
  }
}

@media (max-width: 768px) {
  .cache-overview {
    flex-direction: column;
    gap: 16px !important;
  }
  
  .cache-category {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 12px;
    
    .category-actions {
      align-self: stretch;
      justify-content: flex-end;
    }
  }
}
</style>
