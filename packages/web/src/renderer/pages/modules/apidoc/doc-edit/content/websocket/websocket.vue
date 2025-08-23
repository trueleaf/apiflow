<template>
  <div v-loading="loading" class="websocket" :class="{ vertical: layout === 'vertical' }">
    <template v-if="mode === 'edit'">
      <div class="connection-layout" :class="{ vertical: layout === 'vertical' }">
        <SConnection></SConnection>
        <SMessages></SMessages>
      </div>
      <el-divider v-show="layout === 'vertical' && !isVerticalDrag" content-position="left">WebSocket信息</el-divider>
      <SResizeY v-if="layout === 'vertical'" :min="150" :max="550" :height="350" name="ws-info-y" tabindex="1"
        @dragStart="isVerticalDrag = true" @dragEnd="isVerticalDrag = false">
        <SWebSocketInfo></SWebSocketInfo>
      </SResizeY>
      <SResizeX 
        v-if="layout === 'horizontal'" 
        :min="500" 
        :max="750"
        :width="500" 
        name="ws-info" 
        bar-left
        class="info-layout" 
        tabindex="1"
      >
        <SWebSocketInfo></SWebSocketInfo>
      </SResizeX>
    </template>
    <template v-else>
      <SView></SView>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import SResizeX from '@/components/common/resize/g-resize-x.vue'
import SResizeY from '@/components/common/resize/g-resize-y.vue'
import SConnection from './connection/connection.vue'
import SMessages from './messages/messages.vue'
import SWebSocketInfo from './websocket-info/websocket-info.vue'
import SView from './view/view.vue'
import { useApidocBaseInfo } from '@/store/apidoc/base-info'
import { useApidocTas } from '@/store/apidoc/tabs'
import { useWebSocket } from '@/store/websocket/websocket'
import { useRoute } from 'vue-router'
import { debounce, checkPropertyIsEqual } from '@/helper'
import type { WebSocketNode } from '@src/types/websocket/websocket'
import { DebouncedFunc } from 'lodash'

const apidocBaseInfoStore = useApidocBaseInfo();
const apidocTabsStore = useApidocTas();
const websocketStore = useWebSocket();
const isVerticalDrag = ref(false);
const route = useRoute();
const debounceFn = ref(null as (null | DebouncedFunc<(websocket: WebSocketNode) => void>));

const mode = computed(() => apidocBaseInfoStore.mode);
const layout = computed(() => apidocBaseInfoStore.layout);
const loading = computed(() => websocketStore.loading);
const currentSelectTab = computed(() => {
  const projectId = route.query.id as string;
  const tabs = apidocTabsStore.tabs[projectId];
  const currentSelectTab = tabs?.find((tab) => tab.selected) || null;
  return currentSelectTab;
});

/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
//判断websocket是否发生改变
const checkWebsocketIsEqual = (websocket: WebSocketNode, originWebsocket: WebSocketNode) => {
  const cpWebsocket: WebSocketNode = JSON.parse(JSON.stringify(websocket));
  const cpOriginWebsocket: WebSocketNode = JSON.parse(JSON.stringify(originWebsocket));
  
  // 检查基本信息
  const nameIsEqual = cpWebsocket.info.name === cpOriginWebsocket.info.name;
  const descriptionIsEqual = cpWebsocket.info.description === cpOriginWebsocket.info.description;
  
  // 检查协议
  const protocolIsEqual = cpWebsocket.item.protocol === cpOriginWebsocket.item.protocol;
  
  // 检查URL
  const pathIsEqual = cpWebsocket.item.url.path === cpOriginWebsocket.item.url.path;
  const prefixIsEqual = cpWebsocket.item.url.prefix === cpOriginWebsocket.item.url.prefix;
  
  // 检查请求头
  const headerIsEqual = checkPropertyIsEqual(cpWebsocket.item.headers, cpOriginWebsocket.item.headers);
  
  // 检查前置和后置脚本
  const preRequestIsEqual = cpWebsocket.preRequest.raw === cpOriginWebsocket.preRequest.raw;
  const afterRequestIsEqual = cpWebsocket.afterRequest.raw === cpOriginWebsocket.afterRequest.raw;
  
  if (!nameIsEqual || !descriptionIsEqual || !protocolIsEqual || !pathIsEqual || 
      !prefixIsEqual || !headerIsEqual || !preRequestIsEqual || !afterRequestIsEqual) {
    return false;
  }
  
  return true;
};

//获取WebSocket数据
const getWebsocketInfo = async () => {
  if (!currentSelectTab.value) {
    return;
  }
  if (currentSelectTab.value.saved) { // 取最新值
    websocketStore.getWebsocketDetail({
      id: currentSelectTab.value._id,
      projectId: route.query.id as string,
    });
  } else { // 取缓存值
    console.log('缓存获取websocket');
  }
};

watch(currentSelectTab, (val, oldVal) => {
  const isWebSocket = val?.tabType === 'websocket';
  if (isWebSocket && val?._id !== oldVal?._id) {
    getWebsocketInfo();
  }
}, {
  deep: true,
  immediate: true,
});
watch(() => websocketStore.websocket, (websocket: WebSocketNode) => {
  if (debounceFn.value) {
    debounceFn.value(websocket);
  }
}, {
  deep: true,
});

onMounted(() => {
  debounceFn.value = debounce((websocket: WebSocketNode) => {
    const isEqual = checkWebsocketIsEqual(websocket, websocketStore.originWebsocket);
    if (!isEqual) {
      apidocTabsStore.changeTabInfoById({
        id: currentSelectTab.value?._id || "",
        field: 'saved',
        value: false,
      });
      apidocTabsStore.changeTabInfoById({
        id: currentSelectTab.value?._id || "",
        field: 'fixed',
        value: true,
      });
    } else {
      apidocTabsStore.changeTabInfoById({
        id: currentSelectTab.value?._id || "",
        field: 'saved',
        value: true,
      });
    }
    // TODO: 这里可以添加WebSocket缓存逻辑，类似apidocCache.setApidoc
  }, 200, {
    leading: true
  });
});

</script>

<style lang="scss" scoped>
.websocket {
  overflow-y: auto;
  height: calc(100vh - var(--apiflow-doc-nav-height));
  display: flex;

  &.vertical {
    flex-direction: column;
    overflow: hidden;

    .el-divider--horizontal {
      border-top: 1px dashed var(--gray-500);
    }
  }

  // 连接编辑区域
  .connection-layout {
    flex: 1;
    overflow: hidden;
    border-right: 1px solid var(--gray-400);

    &.vertical {
      flex: 1;
      overflow-y: auto;
    }
  }

  // WebSocket信息区域
  .info-layout {
    flex-grow: 0;
    flex-shrink: 0;
    width: 300px;
  }

  .el-divider--horizontal {
    margin: 0;
    z-index: var(--zIndex-drag-bar);
    font-size: 14px;
  }
}
</style>
