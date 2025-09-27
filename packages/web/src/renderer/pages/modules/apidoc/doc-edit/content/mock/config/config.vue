<template>
  <div class="mock-config-content">
    <div class="config-section">
      <ConditionVue />
    </div>
    <div class="config-section">
      <ResponseVue />
    </div>
    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button type="primary" :loading="httpMockStore.saveLoading" @click="handleSave">
        {{ t('保存配置') }}
      </el-button>
      <el-button type="default" :icon="Refresh" :loading="httpMockStore.refreshLoading" @click="handleRefresh">
        {{ t('刷新') }}
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ElButton } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import ConditionVue from './condition/condition.vue'
import ResponseVue from './response/response.vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useHttpMock } from '@/store/httpMock/httpMock'
import { useApidocTas } from '@/store/apidoc/tabs'
import { router } from '@/router'
import { useShortcut } from '@/hooks/use-shortcut'

const { t } = useI18n()
const httpMockStore = useHttpMock()
const apidocTabsStore = useApidocTas()
const { currentSelectTab } = storeToRefs(apidocTabsStore)

// 保存HttpMock
const handleSave = () => {
  httpMockStore.saveHttpMock()
}

// 刷新HttpMock
const handleRefresh = async () => {
  if (!currentSelectTab.value) {
    return
  }
  httpMockStore.refreshLoading = true
  try {
    const nodeId = currentSelectTab.value._id
    if (nodeId) {
      // 清除缓存的HttpMock数据
      httpMockStore.cacheHttpMock()
    }
    
    // 重新获取HttpMock数据
    if (currentSelectTab.value) {
      await httpMockStore.getHttpMockDetail({
        id: currentSelectTab.value._id,
        projectId: router.currentRoute.value.query.id as string,
      })
    }
  } catch (error) {
    console.error('刷新HttpMock数据失败:', error)
  } finally {
    setTimeout(() => {
      httpMockStore.refreshLoading = false
    }, 100)
  }
}

// 快捷键保存
useShortcut('ctrl+s', (event: KeyboardEvent) => {
  event.preventDefault();
  handleSave();
})
</script>

<style scoped>
.mock-config-content {
  margin: 0 auto;
}

.config-section {
  margin-bottom: 12px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
  padding: 16px 0;
  border-top: 1px solid #e2e8f0;
}
</style>
