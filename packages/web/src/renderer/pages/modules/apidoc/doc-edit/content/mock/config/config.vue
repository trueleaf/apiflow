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
import { useRuntime } from '@/store/runtime/runtime'

const { t } = useI18n()
const httpMockStore = useHttpMock()
const apidocTabsStore = useApidocTas()
const runtimeStore = useRuntime()
const { currentSelectTab } = storeToRefs(apidocTabsStore)

// 保存HttpMock
const handleSave = () => {
  httpMockStore.saveHttpMockNode()
}

// 刷新HttpMock
const handleRefresh = async () => {
  if (!currentSelectTab.value) {
    return
  }
  httpMockStore.changeRefreshLoading(true)
  try {
    const isOffline = runtimeStore.networkMode === 'offline'
    if (isOffline) {
      httpMockStore.replaceHttpMockNode(httpMockStore.originHttpMock)
      httpMockStore.cacheHttpMockNode()
    } else {
      // todo
    }
  } catch (error) {
    console.error('刷新HttpMock数据失败:', error)
  } finally {
    setTimeout(() => {
      httpMockStore.changeRefreshLoading(false)
    }, 100)
  }
}
</script>

<style scoped>
.mock-config-content {
  margin: 0 auto;
  padding-bottom: 80px; /* 为按钮留出空间 */
}

.config-section {
  margin-bottom: 12px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
}
</style>
