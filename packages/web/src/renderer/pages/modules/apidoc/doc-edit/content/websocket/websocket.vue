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
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import SResizeX from '@/components/common/resize/g-resize-x.vue'
import SOperation from './operation/operation.vue'
import SParams from './params/params.vue'
import SResponse from './response/response.vue'
import { useApidocTas } from '@/store/apidoc/tabs'
import { useWebSocket } from '@/store/websocket/websocket'
import { debounce, checkPropertyIsEqual } from '@/helper'
import type { WebSocketNode } from '@src/types/websocket/websocket'
import { DebouncedFunc } from 'lodash'
import { websocketResponseCache } from '@/cache/websocket/websocketResponse'
import { websocketTemplateCache } from '@/cache/websocket/websocketTemplateCache'
import { uuid } from '@/helper'
import { router } from '@/router'
import { useRedoUndo } from '@/store/redoUndo/redoUndo'
import { useShortcut } from '@/hooks/use-shortcut'

const apidocTabsStore = useApidocTas()
const websocketStore = useWebSocket()
const { currentSelectTab } = storeToRefs(apidocTabsStore)
const { loading, } = storeToRefs(websocketStore)
const debounceWebsocketDataChange = ref(null as (null | DebouncedFunc<(websocket: WebSocketNode) => void>))
const redoUndoStore = useRedoUndo()
/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
//检查config配置是否相等
const checkConfigIsEqual = (config: WebSocketNode['config'], originConfig: WebSocketNode['config']) => {
  const messageTypeIsEqual = config.messageType === originConfig.messageType;
  const autoSendIsEqual = config.autoSend === originConfig.autoSend;
  const autoSendIntervalIsEqual = config.autoSendInterval === originConfig.autoSendInterval;
  const defaultAutoSendContentIsEqual = config.defaultAutoSendContent === originConfig.defaultAutoSendContent;
  const autoReconnectIsEqual = config.autoReconnect === originConfig.autoReconnect;
  
  return messageTypeIsEqual && autoSendIsEqual && autoSendIntervalIsEqual && 
         defaultAutoSendContentIsEqual && autoReconnectIsEqual;
}

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
  
  // 检查请求头
  const headerIsEqual = checkPropertyIsEqual(cpWebsocket.item.headers, cpOriginWebsocket.item.headers)
  
  // 检查查询参数
  const queryParamsIsEqual = checkPropertyIsEqual(cpWebsocket.item.queryParams, cpOriginWebsocket.item.queryParams)
  
  // 检查消息内容
  const messageIsEqual = cpWebsocket.item.sendMessage === cpOriginWebsocket.item.sendMessage;
  
  // 检查config配置
  const configIsEqual = checkConfigIsEqual(cpWebsocket.config, cpOriginWebsocket.config)
  
  // 检查前置和后置脚本
  const preRequestIsEqual = cpWebsocket.preRequest.raw === cpOriginWebsocket.preRequest.raw
  const afterRequestIsEqual = cpWebsocket.afterRequest.raw === cpOriginWebsocket.afterRequest.raw

  if (!nameIsEqual || !descriptionIsEqual || !protocolIsEqual || !pathIsEqual || 
      !headerIsEqual || !queryParamsIsEqual || !messageIsEqual || 
      !configIsEqual || !preRequestIsEqual || !afterRequestIsEqual) {
    return false
  }

  return true
}

//处理WebSocket数据变化
const handleWebsocketDataChange = (websocket: WebSocketNode) => {
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
}

//获取WebSocket数据
const getWebsocketInfo = () => {
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

// 从缓存初始化响应数据
const initResponseFromCache = () => {
  if (!currentSelectTab.value) {
    return
  }
  websocketStore.setResponseCacheLoading(true)
  try {
    const nodeId = currentSelectTab.value._id;
    if (nodeId) {
      websocketResponseCache.getData(nodeId).then(cachedMessages => {
        websocketStore.replaceMessages(cachedMessages);
      }).finally(() => {
        websocketStore.setResponseCacheLoading(false)
      })
    }
  } catch (error) {
    console.error('从缓存加载消息失败:', error);
    websocketStore.setResponseCacheLoading(false);
  }
}

// 初始化模板数据
const initTemplate = () => {
  const templates = websocketTemplateCache.getAllTemplates();
  websocketStore.setSendMessageTemplateList(templates);
};
// 初始化防抖数据变化处理
const initDebouncDataChange = () => {
  debounceWebsocketDataChange.value = debounce(handleWebsocketDataChange, 200, {
    leading: true
  });
};
// 检查WebSocket连接状态
const checkIsConnection = () => {
  if (!currentSelectTab.value) {
    return;
  }
  window.electronAPI?.websocket.checkNodeConnection(currentSelectTab.value._id).then((result) => {
    if (result.connected) {
      websocketStore.changeConnectionId(result.connectionId!);
      websocketStore.changeConnectionState('connected');
    } else {
      websocketStore.changeConnectionId('');
      websocketStore.changeConnectionState('disconnected');
    }
  }).catch((error) => {
    console.error('检查WebSocket连接状态异常:', error);
    websocketStore.changeConnectionId('');
    websocketStore.changeConnectionState('error');
  });
};
const initWebSocketEventListeners = () => {
  if (!window.electronAPI) return;
  window.electronAPI.onMain('websocket-opened', (data: { connectionId: string; nodeId: string; url: string }) => {
    if (currentSelectTab.value && data.nodeId === currentSelectTab.value._id) {
      websocketStore.changeConnectionId(data.connectionId);
      websocketStore.changeConnectionState('connected');

      // 添加连接成功消息
      const connectedMessage = {
        type: 'connected' as const,
        data: {
          id: uuid(),
          nodeId: data.nodeId,
          url: data.url,
          timestamp: Date.now()
        }
      };
      websocketStore.addMessage(connectedMessage);

      // 缓存连接成功消息到IndexedDB
      if (currentSelectTab.value._id) {
        websocketResponseCache.setSingleData(currentSelectTab.value._id, connectedMessage);
      }
    }
  });
  // 监听WebSocket连接关闭事件
  window.electronAPI.onMain('websocket-closed', (data: { connectionId: string; nodeId: string; code: number; reason: string; url: string }) => {
    if (currentSelectTab.value && data.nodeId === currentSelectTab.value._id) {
      websocketStore.changeConnectionId('');
      websocketStore.changeConnectionState('disconnected');

      // 判断断开原因：1000为正常关闭（通常是手动断开），其他为异常断开
      const reasonType: 'manual' | 'auto' = data.code === 1000 ? 'manual' : 'auto';

      // 添加断开连接消息
      const disconnectedMessage = {
        type: 'disconnected' as const,
        data: {
          id: uuid(),
          nodeId: data.nodeId,
          url: data.url,
          reasonType,
          timestamp: Date.now()
        }
      };
      websocketStore.addMessage(disconnectedMessage);

      // 缓存断开连接消息到IndexedDB
      if (currentSelectTab.value._id) {
        websocketResponseCache.setSingleData(currentSelectTab.value._id, disconnectedMessage);
      }
    }
  });
  // 监听WebSocket连接错误事件
  window.electronAPI.onMain('websocket-error', (data: { connectionId: string; nodeId: string; error: string; url: string }) => {
    if (currentSelectTab.value && data.nodeId === currentSelectTab.value._id) {
      websocketStore.changeConnectionId('');
      websocketStore.changeConnectionState('error');

      // 添加错误消息
      const wsErrorMessage = {
        type: 'error' as const,
        data: {
          id: uuid(),
          nodeId: data.nodeId,
          error: data.error,
          timestamp: Date.now()
        }
      };
      websocketStore.addMessage(wsErrorMessage);

      // 缓存错误消息到IndexedDB
      if (currentSelectTab.value._id) {
        websocketResponseCache.setSingleData(currentSelectTab.value._id, wsErrorMessage);
      }
    }
  });

  // 监听WebSocket接收消息事件
  window.electronAPI.onMain('websocket-message', (data: { 
    connectionId: string; 
    nodeId: string; 
    message: Uint8Array; 
    mimeType: string; 
    contentType: 'text' | 'binary';
    url: string 
  }) => {
    if (currentSelectTab.value && data.nodeId === currentSelectTab.value._id) {
      // 将 Uint8Array 转换为 ArrayBuffer
      const arrayBuffer = data.message.buffer.slice(
        data.message.byteOffset, 
        data.message.byteOffset + data.message.byteLength
      ) as ArrayBuffer;
      
      // 添加接收消息记录
      const receiveMessage = {
        type: 'receive' as const,
        data: {
          id: uuid(),
          nodeId: data.nodeId,
          content: arrayBuffer,
          timestamp: Date.now(),
          contentType: data.contentType,
          mimeType: data.mimeType,
          size: arrayBuffer.byteLength
        }
      };
      websocketStore.addMessage(receiveMessage);

      // 缓存接收消息到IndexedDB
      if (currentSelectTab.value._id) {
        websocketResponseCache.setSingleData(currentSelectTab.value._id, receiveMessage);
      }
    }
  });
};

// 清理WebSocket事件监听器
const cleanupWebSocketEventListeners = () => {
  if (!window.electronAPI) return;
  // 清理所有WebSocket事件监听器
  window.electronAPI.removeListener('websocket-opened');
  window.electronAPI.removeListener('websocket-closed');
  window.electronAPI.removeListener('websocket-error');
  window.electronAPI.removeListener('websocket-message');
};

watch(currentSelectTab, (val, oldVal) => {
  const isWebSocket = val?.tabType === 'websocket'
  if (isWebSocket && val?._id !== oldVal?._id) {
    getWebsocketInfo();
    initResponseFromCache();
    checkIsConnection();
    redoUndoStore.initFromCache(val._id);
  }
}, {
  deep: true,
  immediate: true,
})
watch(() => websocketStore.websocket, (websocket: WebSocketNode) => {
  if (debounceWebsocketDataChange.value) {
    debounceWebsocketDataChange.value(websocket)
  }
}, {
  deep: true,
})


onMounted(() => {
  initTemplate()
  initDebouncDataChange()
  initWebSocketEventListeners();
})
// 组件卸载时清理事件监听器
onUnmounted(() => {
  cleanupWebSocketEventListeners()
})
useShortcut('ctrl+z', (event: KeyboardEvent) => {
  event.preventDefault();
  const nodeId = websocketStore.websocket._id;
  redoUndoStore.wsUndo(nodeId);
})
useShortcut('ctrl+y', (event: KeyboardEvent) => {
  event.preventDefault();
  const nodeId = websocketStore.websocket._id;
  redoUndoStore.wsRedo(nodeId);
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
