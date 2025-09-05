<template>
  <div class="ws-params">
    <!-- 连接配置选项卡 -->
    <el-tabs v-model="activeTab" class="params-tabs">
      <el-tab-pane name="messageContent">
        <template #label>
          <el-badge :is-dot="hasSendMessage">{{ t('消息内容') }}</el-badge>
        </template>
        <SMessageContent></SMessageContent>
      </el-tab-pane>
      <el-tab-pane name="params">
        <template #label>
          <el-badge :is-dot="hasParams">Params</el-badge>
        </template>
        <SQueryParams></SQueryParams>
      </el-tab-pane>
      <el-tab-pane name="headers">
        <template #label>
          <el-badge :is-dot="hasHeaders">{{ t("请求头") }}</el-badge>
        </template>
        <SHeaders></SHeaders>
      </el-tab-pane>
      <el-tab-pane name="preScript">
        <template #label>
          <el-badge :is-dot="hasPreScript">{{ t("前置脚本") }}</el-badge>
        </template>
        <SPreScript></SPreScript>
      </el-tab-pane>
      <el-tab-pane name="afterScript">
        <template #label>
          <el-badge :is-dot="hasAfterScript">{{ t("后置脚本") }}</el-badge>
        </template>
        <SAfterScript></SAfterScript>
      </el-tab-pane>
      <el-tab-pane name="config">
        <template #label>
          {{ t("连接配置") }}
        </template>
        <SConfig></SConfig>
      </el-tab-pane>
      <el-tab-pane :label="t('备注信息')" name="remarks">
        <SRemarks></SRemarks>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useTranslation } from 'i18next-vue'
import { storeToRefs } from 'pinia'
import SHeaders from './headers/headers.vue'
import SQueryParams from './query-params/query-params.vue'
import SPreScript from './pre-script/pre-script.vue'
import SMessageContent from './message/message.vue'
import SAfterScript from './after-script/after-script.vue'
import SConfig from './config/config.vue'
import SRemarks from './remarks/remarks.vue'
import { useWebSocket } from '@/store/websocket/websocket'
import { useApidocTas } from '@/store/apidoc/tabs'
import { webSocketNodeCache } from '@/cache/websocket/websocketNode'

const { t } = useTranslation()
const websocketStore = useWebSocket()
const apidocTabsStore = useApidocTas()
const { currentSelectTab } = storeToRefs(apidocTabsStore)
const activeTab = ref('')

const hasParams = computed(() => {
  return websocketStore.websocket.item.queryParams.some(param => param.key.trim() !== '' || param.value.trim() !== '')
})

const hasHeaders = computed(() => {
  return websocketStore.websocket.item.headers.some(header => header.key.trim() !== '' || header.value.trim() !== '')
})

const hasPreScript = computed(() => {
  return websocketStore.websocket.preRequest.raw.trim() !== ''
})

const hasAfterScript = computed(() => {
  return websocketStore.websocket.afterRequest.raw.trim() !== ''
})

const hasSendMessage = computed(() => {
  return websocketStore.websocket.item.message.trim() !== ''
})

const getInitialActiveTab = (): string => {
  if (currentSelectTab.value) {
    const cachedTab = webSocketNodeCache.getActiveTab(currentSelectTab.value._id)
    return cachedTab || 'messageContent'
  }
  return 'messageContent'
}

// 监听activeTab变化并保存到缓存
watch(activeTab, (newVal) => {
  if (currentSelectTab.value) {
    webSocketNodeCache.setActiveTab(currentSelectTab.value._id, newVal)
  }
})

// 监听当前选中tab变化，重新加载activeTab
watch(currentSelectTab, (newTab) => {
  if (newTab) {
    const cachedTab = webSocketNodeCache.getActiveTab(newTab._id)
    activeTab.value = cachedTab || 'messageContent'
  }
})
onMounted(() => {
  activeTab.value = getInitialActiveTab()
})
</script>

<style lang="scss" scoped>
.ws-params {
  padding: 0 0 10px;
  height: calc(100vh - var(--apiflow-apidoc-operation-height) - var(--apiflow-doc-nav-height));
  overflow-y: auto;
  position: relative;

  .params-tabs,
  .workbench {
    padding-right: 20px;
    padding-left: 20px;
  }
}
</style>
