<template>
  <el-dialog v-model="visible" :title="`${currentStoreInfo?.description || '详情信息'} - 数据详情`" width="80%"
    :before-close="handleClose">
    <div class="detail-content">
      <div v-if="currentStoreInfo" class="store-info">
        <div class="info-item">
          <span class="label">数据库名称：</span>
          <span class="value">{{ currentStoreInfo.dbName }}</span>
        </div>
        <div class="info-item">
          <span class="label">存储名称：</span>
          <span class="value">{{ currentStoreInfo.storeName }}</span>
        </div>
        <div class="info-item">
          <span class="label">总大小：</span>
          <span class="value">{{ formatUnit(currentStoreInfo.size, 'bytes') }}</span>
        </div>
      </div>

      <div v-if="!tableLoading && storeDetailData" class="data-table">
        <div class="table-header">
          <span>数据列表 (共 {{ storeDetailData.total }} 条记录)</span>
        </div>

        <el-table :data="storeDetailData.data" border max-height="400">
          <el-table-column prop="key" label="键名" width="200" />
          <el-table-column prop="size" label="大小" width="100">
            <template #default="scope">
              {{ formatUnit(scope.row.size, 'bytes') }}
            </template>
          </el-table-column>
          <el-table-column prop="value" label="值">
            <template #default="scope">
              <div class="value-content">
                <div class="value-preview clickable" @click="handleValueClick(scope.row, $event)">
                  {{ getValuePreview(scope.row.value) }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="scope">
              <el-button link type="danger" size="small" @click="handleDeleteItem(scope.row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页器 -->
        <div class="pagination-container" v-if="storeDetailData.total > pageSize">
          <el-pagination v-model:current-page="currentPage" size="small" :page-size="pageSize" :total="storeDetailData.total"
            layout="prev, pager, next, total, sizes" background @size-change="handleSizeChange"
            @current-change="handlePageChange" />
        </div>
      </div>
      <div v-if="!storeDetailData && !tableLoading" class="empty-detail">
        <div class="empty-text">暂无数据</div>
      </div>
      <el-skeleton v-if="tableLoading" :rows="12" animated />
      <el-popover :visible="isShowPopover" placement="right" :width="600"
        trigger="click" transition="none">
        <template #reference>
          <span></span>
        </template>
        <div class="json-popover-content">
          <div class="popover-header">
            <span class="popover-title">JSON数据详情</span>
            <el-button link type="primary" @click="closePopover">
              关闭
            </el-button>
          </div>
          <div class="json-editor-container">
            <SJsonEditor :model-value="formatValueForEditor(activePopoverData)" :read-only="true" :auto-height="true"
              :max-height="400" :min-height="150" />
          </div>
        </div>
      </el-popover>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { IndexedDBItem, StoreDetailResponse, StoreDetailItem } from '@src/types/share/cache'
import { formatUnit } from '@/helper'
import { ElMessageBox } from 'element-plus'
import SJsonEditor from '@/components/common/jsonEditor/ClJsonEditor.vue'
import { message } from '@/helper'

/*
|--------------------------------------------------------------------------
| 变量相关
|--------------------------------------------------------------------------
*/
const props = defineProps<{
  visible: boolean
  currentStoreInfo: IndexedDBItem
  worker: Worker | null
}>()

const emits = defineEmits<{
  'update:visible': [value: boolean]
  'close': []
}>()
const currentPage = ref(1);
const pageSize = ref(20);
const activePopoverData = ref<unknown>(null);
const tableLoading = ref(false);
const deletingItems = ref<Set<string>>(new Set());
const storeDetailData = ref<StoreDetailResponse | null>(null);
const isShowPopover = ref(false);
const visible = computed({
  get: () => props.visible,
  set: (value: boolean) => emits('update:visible', value)
})
/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
// 定义消息处理函数，以便可以在卸载时移除
const detailMessageHandler = (event: MessageEvent) => {
  const { type, data } = event.data;
  if (props.currentStoreInfo.dbName === 'httpNodeResponseCache' && props.currentStoreInfo.storeName === 'httpResponseCache') {
    data.data?.forEach((item: StoreDetailItem) => {
      (item as any).value.data.body = "<数据过大，无法显示>";
    });
  }
  switch (type) {
    case 'storeDetailResult':
      tableLoading.value = false
      storeDetailData.value = data
      break
    case 'deleteStoreItemResult':
      props.currentStoreInfo.size -= data.size;
      getStoreDetail(props.currentStoreInfo.dbName, props.currentStoreInfo.storeName)
      deletingItems.value.delete(data.key)
      break
    case 'error':
      console.error('操作失败:', data.error)
      message.error('操作失败: ' + (data.error?.message || '未知错误'))
      tableLoading.value = false
      break
  }
};

// 初始化消息监听器
const initMessageListener = (): void => {
  if (!props.worker) return
  
  // 使用addEventListener而不是直接赋值onmessage，防止覆盖其他监听器
  props.worker.addEventListener('message', detailMessageHandler);
}
// 获取store详情数据
const getStoreDetail = (dbName: string, storeName: string): void => {
  if (!props.worker) return
  tableLoading.value = true
  props.worker.postMessage({
    type: 'getStoreDetail',
    dbName,
    storeName,
    pageNum: currentPage.value,
    pageSize: pageSize.value
  })
}
// 分页切换
const handlePageChange = (page: number): void => {
  currentPage.value = page
  getStoreDetail(props.currentStoreInfo.dbName, props.currentStoreInfo.storeName)
}
const handleSizeChange = (size: number): void => {
  pageSize.value = size
  currentPage.value = 1
  getStoreDetail(props.currentStoreInfo.dbName, props.currentStoreInfo.storeName)
}


// 获取值的预览文本
const getValuePreview = (value: unknown): string => {
  if (value === null || value === undefined) {
    return String(value)
  }

  const str = typeof value === 'string' ? value : JSON.stringify(value)
  // 限制预览长度为100个字符
  return str.length > 255 ? str.substring(0, 255) + '...' : str
}

// 格式化值用于编辑器显示
const formatValueForEditor = (value: unknown): string => {
  if (typeof value === 'string') {
    try {
      // 尝试解析为JSON并格式化
      const parsed = JSON.parse(value)
      return JSON.stringify(parsed, null, 2)
    } catch {
      // 如果不是JSON，直接返回字符串
      return value
    }
  }
  return JSON.stringify(value, null, 2)
}

/*
|--------------------------------------------------------------------------
| Popover 相关逻辑
|--------------------------------------------------------------------------
*/
// 关闭详情模态框
const handleClose = (): void => {
  closePopover()
  currentPage.value = 1
  emits('close')
}
// 处理值点击事件 - 确保只有一个 popover 处于显示状态
const handleValueClick = (row: StoreDetailItem, event: Event): void => {
  event.stopPropagation()
  isShowPopover.value = true
  activePopoverData.value = row.value
}

// 关闭popover - 全局状态重置
const closePopover = (): void => {
  activePopoverData.value = null;
  isShowPopover.value = false;
}

/*
|--------------------------------------------------------------------------
| 数据删除和同步处理
|--------------------------------------------------------------------------
*/
// 删除单个数据项 - 删除后自动刷新数据
const handleDeleteItem = async (row: StoreDetailItem): Promise<void> => {
  if (!props.currentStoreInfo || !props.worker) return

  // 如果正在删除，直接返回
  if (deletingItems.value.has(row.key)) return

  try {
    await ElMessageBox.confirm(
      `确定要删除键名为 "${row.key}" 的数据吗？此操作不可撤销。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    // 添加到删除loading状态
    deletingItems.value.add(row.key)
    // 发送删除单个数据项的消息到worker
    props.worker.postMessage({
      type: 'deleteStoreItem',
      dbName: props.currentStoreInfo.dbName,
      storeName: props.currentStoreInfo.storeName,
      key: row.key,
      size: row.size
    })
  } catch {
    // 用户取消删除操作，不做任何处理
  }
}

/*
|--------------------------------------------------------------------------
| 键盘事件处理机制
|--------------------------------------------------------------------------
*/
// ESC键事件处理 - 专门用于关闭popover，阻止对话框关闭
const handleKeydown = (e: KeyboardEvent): void => {
  if (e.key === 'Escape') {
    if (isShowPopover.value) {
      e.stopPropagation()
      e.preventDefault()
      closePopover()
      return
    }
  }
}

/*
|--------------------------------------------------------------------------
| 生命周期钩子
|--------------------------------------------------------------------------
*/
onMounted(() => {
  document.addEventListener('keydown', handleKeydown, true);
  initMessageListener();
  getStoreDetail(props.currentStoreInfo.dbName, props.currentStoreInfo.storeName)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown, true)
  // 移除Worker的消息监听器
  if (props.worker) {
    props.worker.removeEventListener('message', detailMessageHandler)
  }
})



</script>

<style lang="scss" scoped>
/* 详情内容容器 */
.detail-content {
  padding: 0;
  min-height: 200px;
}

/* 存储信息区域 */
.store-info {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.info-item {
  display: flex;
  align-items: center;
  min-width: 200px;
}

.info-item .label {
  font-weight: 500;
  color: #495057;
  margin-right: 8px;
  white-space: nowrap;
}

.info-item .value {
  color: #212529;
  font-size: 13px;
}

/* 数据表格区域 */
.data-table {
  background: #fff;
  border-radius: 6px;
  overflow: hidden;
}

.table-header {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-bottom: none;
  padding: 12px 16px;
  font-weight: 500;
  color: #495057;
}


/* 值内容区域 */
.value-content {
  position: relative;
  width: 100%;
}

.value-preview {
  font-size: 12px;
  line-height: 1.4;
  color: #495057;
  word-break: break-all;
  white-space: pre-wrap;
  max-height: 60px;
  overflow: hidden;
  padding: 4px 8px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.value-preview.clickable {
  cursor: pointer;
  user-select: none;
}

.value-preview.clickable:hover {
  background: #e9ecef;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.json-popover-content {
  width: 100%;
  max-height: 500px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.popover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.popover-title {
  font-weight: 500;
  color: #495057;
  font-size: 14px;
}

.json-editor-container {
  flex: 1;
  overflow: auto;
  padding: 8px;
  background: #fff;
  border-radius: 0 0 8px 8px;
}

/* 分页器容器 */
.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 20px 0;
  margin: 0;
}

/* 空数据状态 */
.empty-detail {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: #6c757d;
}

.empty-text {
  font-size: 14px;
  color: #adb5bd;
}
</style>
