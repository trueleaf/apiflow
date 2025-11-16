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
import MockConfig from './config/Config.vue'
import MockLog from './log/Log.vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useHttpMock } from '@/store/httpMock/httpMockStore'
import { useApidocTas } from '@/store/share/tabsStore'
import { debounce } from "lodash-es"
import type { HttpMockNode, MockNodeActiveTabType } from '@src/types/mockNode'
import type { DebouncedFunc } from 'lodash-es'
import { router } from '@/router'
import { userState } from '@/cache/userState/userStateCache'

const { t } = useI18n()
const activeTab = ref<MockNodeActiveTabType>('config')
const httpMockStore = useHttpMock()
const apidocTabsStore = useApidocTas()
const { currentSelectTab } = storeToRefs(apidocTabsStore)
const { httpMock, originHttpMock } = storeToRefs(httpMockStore)
const debounceHttpMockDataChange = ref<null | DebouncedFunc<(mock: HttpMockNode) => void>>(null)

/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
// 获取HttpMock数据
const getHttpMockInfo = () => {
  if (!currentSelectTab.value) {
    return
  }
  if (currentSelectTab.value.saved) { // 取最新值
    httpMockStore.getHttpMockNodeDetail({
      id: currentSelectTab.value._id,
      projectId: router.currentRoute.value.query.id as string,
    })
  } else { // 取缓存值
    const cachedHttpMock = httpMockStore.getCachedHttpMockNodeById(currentSelectTab.value._id)
    if (cachedHttpMock) {
      httpMockStore.replaceHttpMockNode(cachedHttpMock)
    } else {
      // 如果缓存中也没有，尝试获取最新数据
      httpMockStore.getHttpMockNodeDetail({
        id: currentSelectTab.value._id,
        projectId: router.currentRoute.value.query.id as string,
      })
    }
  }
}
// 处理HttpMock数据变化
const handleHttpMockDataChange = (mock: HttpMockNode) => {
  const isEqual = httpMockStore.checkHttpMockNodeIsEqual(mock, originHttpMock.value)
  if (!isEqual) {
    apidocTabsStore.changeTabInfoById({
      id: currentSelectTab.value?._id || "",
      field: 'saved',
      value: false,
    })
    apidocTabsStore.changeTabInfoById({
      id: currentSelectTab.value?._id || "",
      field: 'fixed',
      value: true,
    })
  } else {
    apidocTabsStore.changeTabInfoById({
      id: currentSelectTab.value?._id || "",
      field: 'saved',
      value: true,
    })
  }
  // 缓存HttpMock数据
  httpMockStore.cacheHttpMockNode()
}
// 初始化防抖数据变化处理
const initDebouncDataChange = () => {
  debounceHttpMockDataChange.value = debounce(handleHttpMockDataChange, 200, {
    leading: true
  });
};
// 初始化激活的tab
const initActiveTab = (): void => {
  const cachedTab = userState.getMockNodeActiveTab(currentSelectTab.value?._id || '')
  activeTab.value = cachedTab
}
// 监听tab变化
watch(currentSelectTab, (val, oldVal) => {
  const isHttpMock = val?.tabType === 'httpMock'
  if (isHttpMock && val?._id !== oldVal?._id) {
    getHttpMockInfo();
    initActiveTab()
  }
}, {
  deep: true,
  immediate: true,
})
// 监听activeTab变化，保存到缓存
watch(activeTab, (val) => {
  if (currentSelectTab.value?._id) {
    userState.setMockNodeActiveTab(currentSelectTab.value._id, val)
  }
})

// 监听httpMock数据变化
watch(() => httpMock.value, (mock: HttpMockNode) => {
  debounceHttpMockDataChange.value?.(mock);
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

