<template>
  <div class="ws-params">
    <div class="params-toolbar">
      <el-button type="primary" size="small" @click="handleAddParam">
        <el-icon><Plus /></el-icon>
        {{ t("添加参数") }}
      </el-button>
      <el-button size="small" @click="handleClearParams">{{ t("清空") }}</el-button>
    </div>
    
    <div class="params-table">
      <el-table :data="params" style="width: 100%" size="small">
        <el-table-column prop="enabled" label="" width="50">
          <template #default="{ row }">
            <el-checkbox v-model="row.enabled"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column prop="key" label="参数名" min-width="150">
          <template #default="{ row }">
            <el-input v-model="row.key" placeholder="请输入参数名" size="small"></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="value" label="参数值" min-width="200">
          <template #default="{ row }">
            <el-input v-model="row.value" placeholder="请输入参数值" size="small"></el-input>
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
              @click="handleDeleteParam($index)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <div v-if="params.length === 0" class="empty-state">
      <el-empty description="暂无连接参数" :image-size="80">
        <el-button type="primary" @click="handleAddParam">添加参数</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useTranslation } from 'i18next-vue'
import { Plus, Delete } from '@element-plus/icons-vue'

const { t } = useTranslation()

interface Param {
  enabled: boolean
  key: string
  value: string
  description: string
}

const params = ref<Param[]>([
  { enabled: true, key: 'token', value: '', description: '认证令牌' },
  { enabled: true, key: 'userId', value: '', description: '用户ID' }
])

const handleAddParam = () => {
  params.value.push({
    enabled: true,
    key: '',
    value: '',
    description: ''
  })
}

const handleDeleteParam = (index: number) => {
  params.value.splice(index, 1)
}

const handleClearParams = () => {
  params.value = []
}
</script>

<style lang="scss" scoped>
.ws-params {
  height: 100%;
  display: flex;
  flex-direction: column;

  .params-toolbar {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--gray-300);
  }

  .params-table {
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
