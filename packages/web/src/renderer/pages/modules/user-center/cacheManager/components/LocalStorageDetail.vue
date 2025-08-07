<template>
  <div class="localstorage-detail">
    <!-- localStorage 详情表格 -->
    <div class="table-title">
      <h3>localStorage 数据详情</h3>
    </div>
    <el-table :data="props.localStorageDetails" border>
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="key" label="键名" show-overflow-tooltip />
      <el-table-column prop="size" label="大小">
        <template #default="scope">
          {{ formatBytes(scope.row.size) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button link @click="handleOpenLocalStorageDetail(scope.row)">{{ $t('详情') }}</el-button>
          <el-button link type="danger" @click="handleDeleteLocalStorage(scope.row)">{{ $t('删除') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 空数据提示 -->
    <div v-if="!props.localStorageLoading && props.localStorageDetails.length === 0" class="empty-data">
      <div class="empty-text">
        <span>暂无数据</span>
        <el-button link type="primary" :loading="props.localStorageLoading" @click="emit('refresh')">点击计算</el-button>
      </div>
    </div>

    <!-- localStorage 本地数据详情组件 -->
    <LocalStorageDialog
      v-if="localStorageDialogVisible"
      v-model:visible="localStorageDialogVisible"
      :current-item="currentLocalStorageItem!"
      @close="handleCloseLocalStorageDialog"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue'
import { LocalStorageItem } from '@src/types/apidoc/cache'
import { formatBytes } from '@/helper'
import { ElMessageBox, ElMessage } from 'element-plus'
import LocalStorageDialog from '../dialog/localStorageDialog.vue'

interface Props {
  localStorageDetails: LocalStorageItem[]
  localStorageLoading: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'refresh'): void
}>()

/*
|--------------------------------------------------------------------------
| 变量相关
|--------------------------------------------------------------------------
*/
const localStorageDialogVisible = ref(false)
const currentLocalStorageItem = ref<LocalStorageItem | null>(null)

/*
|--------------------------------------------------------------------------
| 方法
|--------------------------------------------------------------------------
*/
// 查看localStorage详情
const handleOpenLocalStorageDetail = (row: LocalStorageItem): void => {
  currentLocalStorageItem.value = row
  localStorageDialogVisible.value = true
}

// 删除localStorage本地数据项
const handleDeleteLocalStorage = async (row: LocalStorageItem): Promise<void> => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 "${row.description}" 本地数据吗？此操作将永久删除该本地数据项。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    localStorage.removeItem(row.key)
    emit('refresh')
    ElMessage.success('删除成功')

  } catch {
    // 用户取消删除操作，不做任何处理
  }
}

// 关闭localStorage详情模态框
const handleCloseLocalStorageDialog = (): void => {
  localStorageDialogVisible.value = false
  currentLocalStorageItem.value = null
}
</script>

<style lang="scss" scoped>
.localstorage-detail {
  .table-title {
    margin-bottom: 16px;
    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
  }

  .empty-data {
    margin-top: 24px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    padding: 40px 20px;
    text-align: center;

    .empty-text {
      color: #999;
    }
  }
}
</style>
