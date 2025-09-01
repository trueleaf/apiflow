<template>
  <div v-loading="loading" class="websocket">
    <div class="connection-layout">
      <SOperation></SOperation>
      <SParams></SParams>
    </div>
    <SResizeX 
      :min="500" 
      :max="750"
      :width="500" 
      name="ws-info" 
      bar-left
      class="info-layout" 
      tabindex="1"
    >
      <!-- WebSocket 响应信息区域 -->
      <SResponse ref="responseRef"></SResponse>
    </SResizeX>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import SResizeX from '@/components/common/resize/g-resize-x.vue'
import SOperation from './operation/operation.vue'
import SParams from './params/params.vue'
import SResponse from './response/response.vue'
import { useApidocTas } from '@/store/apidoc/tabs'
import { useWebSocket } from '@/store/websocket/websocket'
import { router } from '@/router'
import { debounce, checkPropertyIsEqual } from '@/helper'
import type { WebSocketNode } from '@src/types/websocket/websocket'
import { DebouncedFunc } from 'lodash'

const apidocTabsStore = useApidocTas()
const websocketStore = useWebSocket()
const { currentSelectTab } = storeToRefs(apidocTabsStore)
const debounceFn = ref(null as (null | DebouncedFunc<(websocket: WebSocketNode) => void>))
const responseRef = ref()
const loading = computed(() => websocketStore.loading)

/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
//判断websocket是否发生改变
const checkWebsocketIsEqual = (websocket: WebSocketNode, originWebsocket: WebSocketNode) => {
  const cpWebsocket: WebSocketNode = JSON.parse(JSON.stringify(websocket))
  const cpOriginWebsocket: WebSocketNode = JSON.parse(JSON.stringify(originWebsocket))
  
  // 检查基本信息
  const nameIsEqual = cpWebsocket.info.name === cpOriginWebsocket.info.name
  const descriptionIsEqual = cpWebsocket.info.description === cpOriginWebsocket.info.description
  
  // 检查协议
  const protocolIsEqual = cpWebsocket.item.protocol === cpOriginWebsocket.item.protocol
  
  // 检查URL
  const pathIsEqual = cpWebsocket.item.url.path === cpOriginWebsocket.item.url.path
  const prefixIsEqual = cpWebsocket.item.url.prefix === cpOriginWebsocket.item.url.prefix
  
  // 检查请求头
  const headerIsEqual = checkPropertyIsEqual(cpWebsocket.item.headers, cpOriginWebsocket.item.headers)
  
  // 检查查询参数
  const queryParamsIsEqual = checkPropertyIsEqual(cpWebsocket.item.queryParams, cpOriginWebsocket.item.queryParams)
  
  // 检查消息内容
  const messageIsEqual = cpWebsocket.item.message === cpOriginWebsocket.item.message
  
  // 检查心跳配置
  const autoHeartbeatIsEqual = cpWebsocket.item.autoHeartbeat === cpOriginWebsocket.item.autoHeartbeat
  const heartbeatIntervalIsEqual = cpWebsocket.item.heartbeatInterval === cpOriginWebsocket.item.heartbeatInterval
  const defaultHeartbeatContentIsEqual = cpWebsocket.item.defaultHeartbeatContent === cpOriginWebsocket.item.defaultHeartbeatContent

  console.log(autoHeartbeatIsEqual, heartbeatIntervalIsEqual, defaultHeartbeatContentIsEqual)

  // 检查前置和后置脚本
  const preRequestIsEqual = cpWebsocket.preRequest.raw === cpOriginWebsocket.preRequest.raw
  const afterRequestIsEqual = cpWebsocket.afterRequest.raw === cpOriginWebsocket.afterRequest.raw

  if (!nameIsEqual || !descriptionIsEqual || !protocolIsEqual || !pathIsEqual || 
      !prefixIsEqual || !headerIsEqual || !queryParamsIsEqual || !messageIsEqual || 
      !autoHeartbeatIsEqual || !heartbeatIntervalIsEqual || !defaultHeartbeatContentIsEqual ||
      !preRequestIsEqual || !afterRequestIsEqual) {
    return false
  }

  return true
}

//获取WebSocket数据
const getWebsocketInfo = async () => {
  if (!currentSelectTab.value) {
    return
  }
  if (currentSelectTab.value.saved) { // 取最新值
    websocketStore.getWebsocketDetail({
      id: currentSelectTab.value._id,
      projectId: router.currentRoute.value.query.id as string,
    })
  } else { // 取缓存值
    const cachedWebSocket = websocketStore.getCachedWebSocket(currentSelectTab.value._id)
    if (cachedWebSocket) {
      websocketStore.changeWebsocket(cachedWebSocket)
    } else {
      // 如果缓存中也没有，尝试获取最新数据
      websocketStore.getWebsocketDetail({
        id: currentSelectTab.value._id,
        projectId: router.currentRoute.value.query.id as string,
      })
    }
  }
}

watch(currentSelectTab, (val, oldVal) => {
  const isWebSocket = val?.tabType === 'websocket'
  if (isWebSocket && val?._id !== oldVal?._id) {
    getWebsocketInfo()
  }
}, {
  deep: true,
  immediate: true,
})
watch(() => websocketStore.websocket, (websocket: WebSocketNode) => {
  if (debounceFn.value) {
    debounceFn.value(websocket)
  }
}, {
  deep: true,
})

onMounted(() => {
  debounceFn.value = debounce((websocket: WebSocketNode) => {
    const isEqual = checkWebsocketIsEqual(websocket, websocketStore.originWebsocket)
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
    // 缓存WebSocket数据
    websocketStore.cacheWebSocket()
  }, 200, {
    leading: true
  })
})

</script>

<style lang="scss" scoped>
.websocket {
  overflow-y: auto;
  height: calc(100vh - var(--apiflow-doc-nav-height));
  display: flex;

  // 连接编辑区域
  .connection-layout {
    flex: 1;
    overflow: hidden;
    border-right: 1px solid var(--gray-400);
    display: flex;
    flex-direction: column;
  }

  // WebSocket信息区域
  .info-layout {
    flex-grow: 0;
    flex-shrink: 0;
    width: 300px;
  }
}
</style>
