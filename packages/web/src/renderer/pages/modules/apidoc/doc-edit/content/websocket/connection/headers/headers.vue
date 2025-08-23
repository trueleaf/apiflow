<template>
  <div class="ws-headers">
    <div class="headers-toolbar">
      <el-button type="primary" size="small" @click="handleAddHeader">
        <el-icon><Plus /></el-icon>
        {{ t("添加连接头") }}
      </el-button>
      <el-button size="small" @click="handleClearHeaders">{{ t("清空") }}</el-button>
    </div>
    
    <div class="headers-table">
      <el-table :data="headers" style="width: 100%" size="small">
        <el-table-column prop="enabled" label="" width="50">
          <template #default="{ row, $index }">
            <el-checkbox 
              :model-value="row.enabled" 
              @update:model-value="updateHeader($index, 'enabled', $event)"
            ></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column prop="key" label="键" min-width="150">
          <template #default="{ row, $index }">
            <el-input 
              :model-value="row.key" 
              @update:model-value="updateHeader($index, 'key', $event)"
              placeholder="请输入键名" 
              size="small"
            ></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="value" label="值" min-width="200">
          <template #default="{ row, $index }">
            <el-input 
              :model-value="row.value" 
              @update:model-value="updateHeader($index, 'value', $event)"
              placeholder="请输入值" 
              size="small"
            ></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="150">
          <template #default="{ row, $index }">
            <el-input 
              :model-value="row.description" 
              @update:model-value="updateHeader($index, 'description', $event)"
              placeholder="请输入描述" 
              size="small"
            ></el-input>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="{ $index }">
            <el-button 
              type="danger" 
              size="small" 
              link 
              @click="handleDeleteHeader($index)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <div v-if="headers.length === 0" class="empty-state">
      <el-empty description="暂无连接头" :image-size="80">
        <el-button type="primary" @click="handleAddHeader">添加连接头</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useTranslation } from 'i18next-vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { useWebSocket } from '@/store/websocket/websocket'

const { t } = useTranslation()

// 使用WebSocket store
const websocketStore = useWebSocket()

// 从store获取headers数据
const headers = computed(() => {
  return websocketStore.websocket.item.headers.map(header => ({
    _id: header._id,
    enabled: !header.disabled,
    key: header.key,
    value: header.value,
    description: header.description
  }))
})

const handleAddHeader = () => {
  websocketStore.addWebSocketHeader()
}

const handleDeleteHeader = (index: number) => {
  const headerId = websocketStore.websocket.item.headers[index]?._id
  if (headerId) {
    websocketStore.deleteWebSocketHeaderById(headerId)
  }
}

const handleClearHeaders = () => {
  // 清空所有headers
  const headerIds = websocketStore.websocket.item.headers.map(h => h._id)
  headerIds.forEach(id => websocketStore.deleteWebSocketHeaderById(id))
}

// 监听输入变化并更新store
const updateHeader = (index: number, field: string, value: any) => {
  const headerId = websocketStore.websocket.item.headers[index]?._id
  if (headerId) {
    const updateData: any = {}
    if (field === 'enabled') {
      updateData.disabled = !value
    } else {
      updateData[field] = value
    }
    websocketStore.updateWebSocketHeaderById(headerId, updateData)
  }
}
</script>

<style lang="scss" scoped>
.ws-headers {
  height: 100%;
  display: flex;
  flex-direction: column;

  .headers-toolbar {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--gray-300);
  }

  .headers-table {
    flex: 1;
    overflow-y: auto;
  }

  .empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
