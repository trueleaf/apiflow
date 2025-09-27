<template>
  <div class="mock-layout">
    <CleanTabs v-model="activeTab" type="card" class="mock-tabs">
      <!-- 配置与响应 Tab -->
      <CleanTabPane :label="t('配置与响应')" name="config">
        <MockConfig />
      </CleanTabPane>
      <!-- 日志 Tab -->
      <CleanTabPane :label="t('日志')" name="logs">
        <MockLog />
      </CleanTabPane>
    </CleanTabs>
    <!-- 底部保存按钮 -->
    <div class="save-footer">
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
import { ref, watch, onMounted } from 'vue'
import { ElButton } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { CleanTabs, CleanTabPane } from '@/components/ui/cleanDesign/tabs'
import MockConfig from './config/config.vue'
import MockLog from './log/log.vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useHttpMock } from '@/store/httpMock/httpMock'
import { useApidocTas } from '@/store/apidoc/tabs'
import { debounce } from '@/helper'
import type { MockHttpNode } from '@src/types/mock/mock'
import type { DebouncedFunc } from 'lodash'
import { router } from '@/router'
import { useShortcut } from '@/hooks/use-shortcut'

const { t } = useI18n()
const activeTab = ref('config')
const httpMockStore = useHttpMock()
const apidocTabsStore = useApidocTas()
const { currentSelectTab } = storeToRefs(apidocTabsStore)
const { httpMock, originHttpMock } = storeToRefs(httpMockStore)
const debounceHttpMockDataChange = ref<null | DebouncedFunc<(mock: MockHttpNode) => void>>(null)

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
    httpMockStore.getHttpMockDetail({
      id: currentSelectTab.value._id,
      projectId: router.currentRoute.value.query.id as string,
    })
  } else { // 取缓存值
    const cachedHttpMock = httpMockStore.getCachedHttpMockById(currentSelectTab.value._id)
    if (cachedHttpMock) {
      httpMockStore.changeHttpMock(cachedHttpMock)
    } else {
      // 如果缓存中也没有，尝试获取最新数据
      httpMockStore.getHttpMockDetail({
        id: currentSelectTab.value._id,
        projectId: router.currentRoute.value.query.id as string,
      })
    }
  }
}
// 处理HttpMock数据变化
const handleHttpMockDataChange = (mock: MockHttpNode) => {
  const isEqual = httpMockStore.checkHttpMockIsEqual(mock, originHttpMock.value)
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
  httpMockStore.cacheHttpMock()
}
// 初始化防抖数据变化处理
const initDebouncDataChange = () => {
  debounceHttpMockDataChange.value = debounce(handleHttpMockDataChange, 200, {
    leading: true
  });
};
// 监听tab变化
watch(currentSelectTab, (val, oldVal) => {
  const isHttpMock = val?.tabType === 'httpMock'
  if (isHttpMock && val?._id !== oldVal?._id) {
    getHttpMockInfo();
  }
}, {
  deep: true,
  immediate: true,
})

// 监听httpMock数据变化
watch(() => httpMock.value, (mock: MockHttpNode) => {
  debounceHttpMockDataChange.value?.(mock);
}, {
  deep: true,
})


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
onMounted(() => {
  initDebouncDataChange()
})
</script>

<style lang="scss" scoped>
.mock-layout {
  --footer-height: 40px;
  height: calc(100vh - var(--apiflow-doc-nav-height));
  background: var(--white);
  padding: 30px 30px 0;
  overflow-y: auto;
  .save-footer {
    height: var(--footer-height);
    display: flex;
    justify-content: center;
    gap: 12px;
  }
}

.mock-tabs {
  height: calc(100% - var(--footer-height));
}

@media (max-width: 960px) {
  .mock-layout {
    padding: 12px;
  }
}

@media (max-width: 760px) {
  .mock-layout {
    padding: 8px;
  }
}
</style>

