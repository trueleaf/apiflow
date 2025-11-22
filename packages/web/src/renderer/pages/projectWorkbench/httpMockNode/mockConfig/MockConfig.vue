<template>
  <div class="mock-config-content">
    <!-- 触发条件配置（不滚动） -->
    <div class="config-section condition-section">
      <Condition />
    </div>
    
    <!-- 响应配置（可滚动区域） -->
    <div class="config-section response-section">
      <Response />
    </div>
    
    <!-- 操作按钮（固定在底部） -->
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
import Condition from './mockCondition/MockCondition.vue'
import Response from './mockResponse/MockResponse.vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useHttpMock } from '@/store/httpMock/httpMockStore'
import { useApidocTas } from '@/store/apidoc/tabsStore'
import { useRuntime } from '@/store/runtime/runtimeStore'

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
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--apiflow-header-height) - var(--apiflow-doc-nav-height) - 50px);
  margin: 0 auto;
}

.config-section {
  margin-bottom: 12px;
}

/* 触发条件区域 - 不滚动 */
.condition-section {
  flex-shrink: 0;
  padding: 0 20px;
  background: var(--white);
  border-bottom: 1px dashed var(--gray-400);
}

/* 响应配置区域 - 可滚动 */
.response-section {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 0 20px;
  background: var(--white);
}

/* 自定义滚动条样式 */
.response-section::-webkit-scrollbar {
  width: 8px;
}

.response-section::-webkit-scrollbar-track {
  background: var(--gray-100);
  border-radius: 4px;
}

.response-section::-webkit-scrollbar-thumb {
  background: var(--gray-400);
  border-radius: 4px;
}

.response-section::-webkit-scrollbar-thumb:hover {
  background: var(--gray-500);
}

/* 操作按钮 - 固定在底部 */
.action-buttons {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding: 0 16px 20px;
  background: var(--white);
}
</style>
