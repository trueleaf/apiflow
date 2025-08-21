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
          <template #default="{ row }">
            <el-checkbox v-model="row.enabled"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column prop="key" label="键" min-width="150">
          <template #default="{ row }">
            <el-input v-model="row.key" placeholder="请输入键名" size="small"></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="value" label="值" min-width="200">
          <template #default="{ row }">
            <el-input v-model="row.value" placeholder="请输入值" size="small"></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="150">
          <template #default="{ row }">
            <el-input v-model="row.description" placeholder="请输入描述" size="small"></el-input>
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
import { ref } from 'vue'
import { useTranslation } from 'i18next-vue'
import { Plus, Delete } from '@element-plus/icons-vue'

const { t } = useTranslation()

interface Header {
  enabled: boolean
  key: string
  value: string
  description: string
}

const headers = ref<Header[]>([
  { enabled: true, key: 'Authorization', value: '', description: '认证头' },
  { enabled: true, key: 'User-Agent', value: 'ApiFlow WebSocket Client', description: '用户代理' }
])

const handleAddHeader = () => {
  headers.value.push({
    enabled: true,
    key: '',
    value: '',
    description: ''
  })
}

const handleDeleteHeader = (index: number) => {
  headers.value.splice(index, 1)
}

const handleClearHeaders = () => {
  headers.value = []
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
