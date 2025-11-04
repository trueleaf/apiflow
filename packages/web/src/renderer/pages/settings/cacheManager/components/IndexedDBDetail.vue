<template>
  <div class="indexeddb-detail">
    <!-- IndexedDB 详情表格 -->
    <div class="table-title">
      <h3>IndexedDB 本地数据详情</h3>
      <el-button 
        type="danger" 
        plain 
        @click="handleClearAllIndexedDB"
        :disabled="props.indexedDBDetails.length === 0"
      >
        清空所有数据
      </el-button>
    </div>
    <el-table :data="props.indexedDBDetails" border>
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="dbName" label="数据库名称" />
      <el-table-column prop="storeName" label="存储名称" />
      <el-table-column prop="size" label="大小">
        <template #default="scope">
          {{ formatUnit(scope.row.size, 'bytes') }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button link @click="handleOpenIndexedDBDetail(scope.row)">{{ $t('详情') }}</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row)">{{ $t('删除') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 空数据提示 -->
    <div v-if="!props.indexedDBLoading && props.indexedDBDetails.length === 0 && props.indexedDBSize !== -1" class="empty-data">
      <div class="empty-text">
        暂无数据，
        <el-button link type="primary" @click="emit('refresh')">点击刷新</el-button>
      </div>
    </div>
    <!-- IndexedDB 本地数据详情组件 -->
    <IndexedDBDialog
      v-if="detailDialogVisible"
      v-model:visible="detailDialogVisible"
      :current-store-info="currentIndexedDBItem!"
      :worker="props.indexedDBWorkerRef"
      @close="handleCloseIndexedDbDialog"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { IndexedDBItem } from '@src/types/share/cache'
import { formatUnit } from '@/helper'
import { ElMessageBox } from 'element-plus'
import IndexedDBDialog from '../dialog/IndexedDBDialog.vue'
import { message } from '@/helper'

type Props = {
  indexedDBDetails: IndexedDBItem[]
  indexedDBLoading: boolean
  indexedDBSize: number
  indexedDBWorkerRef: Worker | null
};

type Emits = {
  (e: 'refresh'): void
  (e: 'update-size', size: number): void
  (e: 'update-details', details: IndexedDBItem[]): void
};

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/*
|--------------------------------------------------------------------------
| 变量相关
|--------------------------------------------------------------------------
*/
const detailDialogVisible = ref(false)
const currentIndexedDBItem = ref<IndexedDBItem | null>(null)

/*
|--------------------------------------------------------------------------
| 方法
|--------------------------------------------------------------------------
*/
// 查看详情
const handleOpenIndexedDBDetail = (row: IndexedDBItem): void => {
  currentIndexedDBItem.value = row
  detailDialogVisible.value = true
}

// 删除单个store
const handleDelete = async (row: IndexedDBItem): Promise<void> => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 "${row.description}" 本地数据吗？此操作将清空该存储中的所有数据。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    if (!props.indexedDBWorkerRef) {
      message.error('Worker未初始化')
      return
    }

    // 发送删除消息到worker，附加size参数
    props.indexedDBWorkerRef.postMessage({
      type: 'deleteStore',
      dbName: row.dbName,
      storeName: row.storeName,
      size: row.size
    })

  } catch {
    // 用户取消删除操作，不做任何处理
  }
}

// 清空所有IndexedDB数据
const handleClearAllIndexedDB = async (): Promise<void> => {
  try {
    await ElMessageBox.prompt(
      '请输入 "清空所有数据" 确认清空所有IndexedDB中的数据。此操作将清空所有数据库中的数据内容，但保留数据库结构。此操作不可恢复！',
      '清空确认',
      {
        confirmButtonText: '确定清空',
        cancelButtonText: '取消',
        type: 'warning',
        inputPattern: /^清空所有数据$/,
        inputErrorMessage: '请输入"清空所有数据"进行确认'
      }
    )

    if (!props.indexedDBWorkerRef) {
      message.error('Worker未初始化')
      return
    }

    // 发送清空所有IndexedDB数据的消息到worker
    props.indexedDBWorkerRef.postMessage({
      type: 'clearAllIndexedDB'
    })

  } catch {
    // 用户取消或输入错误，不做任何处理
  }
}

// 关闭详情模态框
const handleCloseIndexedDbDialog = (): void => {
  detailDialogVisible.value = false
  currentIndexedDBItem.value = null
}
</script>

<style lang="scss" scoped>
.indexeddb-detail {
  .table-title {
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
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
      font-size: 16px;
      color: #999;
    }
  }
}
</style>
