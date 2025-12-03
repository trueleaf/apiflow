<template>
  <div class="mock-layout">
    <CleanTabs v-model="activeTab" type="card" class="mock-tabs">
      <CleanTabPane :label="t('配置与响应')" name="config">
        <MockConfig />
      </CleanTabPane>
      <CleanTabPane :label="t('日志')" name="logs">
        <MockLog />
      </CleanTabPane>
    </CleanTabs>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'
import { CleanTabs, CleanTabPane } from '@/components/ui/cleanDesign/tabs'
import MockConfig from './mockConfig/MockConfig.vue'
import MockLog from './mockLog/MockLog.vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useWebSocketMockNode } from '@/store/websocketMockNode/websocketMockNodeStore'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { debounce } from "lodash-es"
import type { WebSocketMockNode, MockNodeActiveTabType } from '@src/types/mockNode'
import type { DebouncedFunc } from 'lodash-es'
import { router } from '@/router'
import { appState } from '@/cache/appState/appStateCache'

const { t } = useI18n()
const activeTab = ref<MockNodeActiveTabType>('config')
const websocketMockNodeStore = useWebSocketMockNode()
const projectNavStore = useProjectNav()
const { currentSelectNav } = storeToRefs(projectNavStore)
const { websocketMock, originWebSocketMock } = storeToRefs(websocketMockNodeStore)
const debounceWebSocketMockDataChange = ref<null | DebouncedFunc<(mock: WebSocketMockNode) => void>>(null)

// 获取 WebSocketMock 数据
const getWebSocketMockInfo = () => {
  if (!currentSelectNav.value) {
    return
  }
  if (currentSelectNav.value.saved) {
    websocketMockNodeStore.getWebSocketMockNodeDetail({
      id: currentSelectNav.value._id,
      projectId: router.currentRoute.value.query.id as string,
    })
  } else {
    const cachedWebSocketMock = websocketMockNodeStore.getCachedWebSocketMockNodeById(currentSelectNav.value._id)
    if (cachedWebSocketMock) {
      websocketMockNodeStore.replaceWebSocketMockNode(cachedWebSocketMock)
    } else {
      websocketMockNodeStore.getWebSocketMockNodeDetail({
        id: currentSelectNav.value._id,
        projectId: router.currentRoute.value.query.id as string,
      })
    }
  }
}
// 处理 WebSocketMock 数据变化
const handleWebSocketMockDataChange = (mock: WebSocketMockNode) => {
  const isEqual = websocketMockNodeStore.checkWebSocketMockNodeIsEqual(mock, originWebSocketMock.value)
  if (!isEqual) {
    projectNavStore.changeNavInfoById({
      id: currentSelectNav.value?._id || "",
      field: 'saved',
      value: false,
    })
    projectNavStore.changeNavInfoById({
      id: currentSelectNav.value?._id || "",
      field: 'fixed',
      value: true,
    })
  } else {
    projectNavStore.changeNavInfoById({
      id: currentSelectNav.value?._id || "",
      field: 'saved',
      value: true,
    })
  }
  websocketMockNodeStore.cacheWebSocketMockNode()
}
// 初始化防抖数据变化处理
const initDebouncDataChange = () => {
  debounceWebSocketMockDataChange.value = debounce(handleWebSocketMockDataChange, 200, {
    leading: true
  });
};
// 初始化激活的 tab
const initActiveTab = (): void => {
  const cachedTab = appState.getMockNodeActiveTab(currentSelectNav.value?._id || '')
  activeTab.value = cachedTab
}
// 监听 tab 变化
watch(currentSelectNav, (val, oldVal) => {
  const isWebSocketMock = val?.tabType === 'websocketMock'
  if (isWebSocketMock && val?._id !== oldVal?._id) {
    getWebSocketMockInfo();
    initActiveTab()
  }
}, {
  deep: true,
  immediate: true,
})
// 监听 activeTab 变化，保存到缓存
watch(activeTab, (val) => {
  if (currentSelectNav.value?._id) {
    appState.setMockNodeActiveTab(currentSelectNav.value._id, val)
  }
})
// 监听 websocketMock 数据变化
watch(() => websocketMock.value, (mock: WebSocketMockNode) => {
  debounceWebSocketMockDataChange.value?.(mock);
}, {
  deep: true,
})

onMounted(() => {
  initDebouncDataChange()
})
</script>

<style lang="scss" scoped>
.mock-layout {
  height: calc(100vh - var(--apiflow-doc-nav-height));
  background: var(--white);
  padding: 30px 30px 0;
  overflow-y: auto;
}

.mock-tabs {
  height: 100%;
}
</style>
