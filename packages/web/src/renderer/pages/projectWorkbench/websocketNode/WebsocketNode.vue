<template>
  <div v-loading="loading" class="websocket" :class="{ vertical: layout === 'vertical' }">
    <div class="connection-layout" :class="{ vertical: layout === 'vertical' }">
      <SOperation></SOperation>
      <SParams></SParams>
    </div>
    <SResizeY 
      v-if="layout === 'vertical'" 
      class="y-bar" 
      :min="100" 
      :max="750" 
      :height="responseHeight" 
      :default-height="350" 
      name="ws-response-y" 
      tabindex="1"
      @dragStart="isVerticalDrag = true" 
      @dragEnd="isVerticalDrag = false" 
      @heightChange="handleResponseHeightChange"
    >
      <SResponse ref="responseRef"></SResponse>
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
      <SResponse ref="responseRef"></SResponse>
    </SResizeX>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import SResizeX from '@/components/common/resize/ClResizeX.vue'
import SResizeY from '@/components/common/resize/ClResizeY.vue'
import SOperation from './operation/Operation.vue'
import SParams from './params/Params.vue'
import SResponse from './response/Response.vue'
import { useApidocTas } from '@/store/httpNode/httpTabsStore'
import { useApidocBaseInfo } from '@/store/apidocProject/baseInfoStore'
import { useWebSocket } from '@/store/websocket/websocketStore'
import { checkPropertyIsEqual } from '@/helper'
import { nanoid } from 'nanoid/non-secure'
import { debounce } from "lodash-es"
import type { WebSocketNode } from '@src/types/websocketNode'
import { DebouncedFunc } from 'lodash-es'
import { websocketResponseCache } from '@/cache/websocketNode/websocketResponseCache'
import { router } from '@/router'
import { useWsRedoUndo } from '@/store/redoUndo/wsRedoUndoStore'
import { executeWebSocketAfterScript } from '@/server/websocket/executeAfterScript'
import { useVariable } from '@/store/apidocProject/variablesStore'
import { useCookies } from '@/store/httpNode/cookiesStore'
import { httpNodeCache } from '@/cache/httpNode/httpNodeCache'
import { IPC_EVENTS } from '@src/types/ipc'

const apidocTabsStore = useApidocTas()
const websocketStore = useWebSocket()
const variableStore = useVariable()
const cookiesStore = useCookies()
const apidocBaseInfoStore = useApidocBaseInfo()
const { currentSelectTab } = storeToRefs(apidocTabsStore)
const { loading, } = storeToRefs(websocketStore)
const isVerticalDrag = ref(false)
const layout = computed(() => apidocBaseInfoStore.layout)
const responseHeight = computed(() => apidocBaseInfoStore.responseHeight)
const debounceWebsocketDataChange = ref(null as (null | DebouncedFunc<(websocket: WebSocketNode) => void>))
const redoUndoStore = useWsRedoUndo()
/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
//检查config配置是否相等
const checkConfigIsEqual = (config: WebSocketNode['config'], originConfig: WebSocketNode['config']) => {
  const autoSendIsEqual = config.autoSend === originConfig.autoSend;
  const autoSendIntervalIsEqual = config.autoSendInterval === originConfig.autoSendInterval;
  const autoSendContentIsEqual = config.autoSendContent === originConfig.autoSendContent;
  const autoSendMessageTypeIsEqual = config.autoSendMessageType === originConfig.autoSendMessageType;
  const autoReconnectIsEqual = config.autoReconnect === originConfig.autoReconnect;

  return autoSendIsEqual && autoSendIntervalIsEqual &&
         autoSendContentIsEqual && autoSendMessageTypeIsEqual && autoReconnectIsEqual;
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
  
  // 检查消息块
  const messageBlocksIsEqual = JSON.stringify(cpWebsocket.item.messageBlocks) === JSON.stringify(cpOriginWebsocket.item.messageBlocks);
  
  // 检查config配置
  const configIsEqual = checkConfigIsEqual(cpWebsocket.config, cpOriginWebsocket.config)
  
  // 检查前置和后置脚本
  const preRequestIsEqual = cpWebsocket.preRequest.raw === cpOriginWebsocket.preRequest.raw
  const afterRequestIsEqual = cpWebsocket.afterRequest.raw === cpOriginWebsocket.afterRequest.raw

  if (!nameIsEqual || !descriptionIsEqual || !protocolIsEqual || !pathIsEqual ||
      !headerIsEqual || !queryParamsIsEqual || !messageBlocksIsEqual ||
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
      websocketResponseCache.getResponseByNodeId(nodeId).then(cachedMessages => {
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

// 初始化防抖数据变化处理
const initDebouncDataChange = () => {
  debounceWebsocketDataChange.value = debounce(handleWebsocketDataChange, 200, {
    leading: true
  });
};
//处理响应区域高度变化
const handleResponseHeightChange = (height: number) => {
  apidocBaseInfoStore.changeResponseHeight(height)
}
//检查WebSocket连接状态
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
  window.electronAPI.ipcManager.onMain(IPC_EVENTS.websocket.mainToRenderer.opened, (data: { connectionId: string; nodeId: string; url: string }) => {
    if (currentSelectTab.value && data.nodeId === currentSelectTab.value._id) {
      websocketStore.changeConnectionId(data.connectionId);
      websocketStore.changeConnectionState('connected');

      // 添加连接成功消息
      const connectedMessage = {
        type: 'connected' as const,
        data: {
          id: nanoid(),
          nodeId: data.nodeId,
          url: data.url,
          timestamp: Date.now()
        }
      };
      websocketStore.addMessage(connectedMessage);

      // 缓存连接成功消息到IndexedDB
      if (currentSelectTab.value._id) {
        websocketResponseCache.setResponseByNodeId(currentSelectTab.value._id, connectedMessage);
      }
    }
  });
  // 监听WebSocket连接关闭事件
  window.electronAPI.ipcManager.onMain(IPC_EVENTS.websocket.mainToRenderer.closed, (data: { connectionId: string; nodeId: string; code: number; reason: string; url: string }) => {
    if (currentSelectTab.value && data.nodeId === currentSelectTab.value._id) {
      websocketStore.changeConnectionId('');
      websocketStore.changeConnectionState('disconnected');

      // 判断断开原因：1000为正常关闭（通常是手动断开），其他为异常断开
      const reasonType: 'manual' | 'auto' = data.code === 1000 ? 'manual' : 'auto';

      // 添加断开连接消息
      const disconnectedMessage = {
        type: 'disconnected' as const,
        data: {
          id: nanoid(),
          nodeId: data.nodeId,
          url: data.url,
          reasonType,
          timestamp: Date.now()
        }
      };
      websocketStore.addMessage(disconnectedMessage);

      // 缓存断开连接消息到IndexedDB
      if (currentSelectTab.value._id) {
        websocketResponseCache.setResponseByNodeId(currentSelectTab.value._id, disconnectedMessage);
      }
    }
  });
  // 监听WebSocket连接错误事件
  window.electronAPI.ipcManager.onMain(IPC_EVENTS.websocket.mainToRenderer.error, (data: { connectionId: string; nodeId: string; error: string; url: string }) => {
    if (currentSelectTab.value && data.nodeId === currentSelectTab.value._id) {
      websocketStore.changeConnectionId('');
      websocketStore.changeConnectionState('error');

      // 添加错误消息
      const wsErrorMessage = {
        type: 'error' as const,
        data: {
          id: nanoid(),
          nodeId: data.nodeId,
          error: data.error,
          timestamp: Date.now()
        }
      };
      websocketStore.addMessage(wsErrorMessage);

      // 缓存错误消息到IndexedDB
      if (currentSelectTab.value._id) {
        websocketResponseCache.setResponseByNodeId(currentSelectTab.value._id, wsErrorMessage);
      }
    }
  });

  // 监听WebSocket接收消息事件
  window.electronAPI.ipcManager.onMain(IPC_EVENTS.websocket.mainToRenderer.message, async (data: {
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
          id: nanoid(),
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
        websocketResponseCache.setResponseByNodeId(currentSelectTab.value._id, receiveMessage);
      }

      // 执行后置脚本
      if (websocketStore.websocket.afterRequest.raw && websocketStore.websocket.afterRequest.raw.trim() !== '') {
        console.log('执行WebSocket后置脚本...');

        // 将 cookies 数组转换为对象格式
        const cookiesObject = cookiesStore.cookies.reduce((acc, cookie) => {
          acc[cookie.name] = cookie.value;
          return acc;
        }, {} as Record<string, string>);

        // 获取 projectId 和实际的 localStorage 和 sessionStorage
        const projectId = router.currentRoute.value.query.id as string;
        const afterRequestLocalStorage = httpNodeCache.getPreRequestLocalStorage(projectId);
        const afterRequestSessionStorage = httpNodeCache.getPreRequestSessionStorage(projectId);

        // 准备响应数据（转换为可序列化的格式）
        let responseData: string | ArrayBuffer = arrayBuffer;
        if (data.contentType === 'text') {
          // 如果是文本消息，转换为字符串
          const decoder = new TextDecoder();
          responseData = decoder.decode(arrayBuffer);
        }

        const afterScriptResult = await executeWebSocketAfterScript(
          websocketStore.websocket,
          {
            data: responseData,
            type: data.contentType,
            timestamp: Date.now(),
            size: arrayBuffer.byteLength,
            mimeType: data.mimeType,
          },
          variableStore.objectVariable,
          cookiesObject,
          afterRequestLocalStorage,
          afterRequestSessionStorage,
          projectId
        );

        if (!afterScriptResult.success) {
          // 后置脚本执行失败，记录错误
          const errorMsg = afterScriptResult.error?.message || '后置脚本执行失败';
          console.error('WebSocket后置脚本执行失败:', errorMsg);

          // 可选：添加错误消息到响应列表
          const scriptErrorMessage = {
            type: 'error' as const,
            data: {
              id: nanoid(),
              nodeId: data.nodeId,
              error: `后置脚本执行失败: ${errorMsg}`,
              timestamp: Date.now()
            }
          };
          websocketStore.addMessage(scriptErrorMessage);
          websocketResponseCache.setResponseByNodeId(currentSelectTab.value._id, scriptErrorMessage);
        } else {
          console.log('WebSocket后置脚本执行成功');

          // 应用脚本更新的变量（如果有）
          if (afterScriptResult.updatedVariables) {
            // 遍历更新后的变量，更新到 variableStore
            Object.entries(afterScriptResult.updatedVariables).forEach(([key, value]) => {
              // 查找对应的变量
              const variable = variableStore.variables.find(v => v.name === key);
              if (variable) {
                // 更新已存在的变量值
                variableStore.changeVariableById(variable._id, {
                  ...variable,
                  value: String(value),
                });
              }
            });
            console.log('后置脚本更新的变量:', afterScriptResult.updatedVariables);
          }

          // 应用脚本更新的存储（如果有）
          // storage 的更新已经通过 Worker 的消息处理自动保存，这里不需要额外处理
          if (afterScriptResult.updatedStorage) {
            console.log('后置脚本更新的存储:', afterScriptResult.updatedStorage);
          }
        }
      }
    }
  });
};

// 清理WebSocket事件监听器
const cleanupWebSocketEventListeners = () => {
  if (!window.electronAPI) return;
  // 清理所有WebSocket事件监听器
  window.electronAPI.ipcManager.removeListener('websocket-opened');
  window.electronAPI.ipcManager.removeListener('websocket-closed');
  window.electronAPI.ipcManager.removeListener('websocket-error');
  window.electronAPI.ipcManager.removeListener('websocket-message');
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
  debounceWebsocketDataChange.value?.(websocket);
}, {
  deep: true,
})


onMounted(() => {
  initDebouncDataChange()
  initWebSocketEventListeners()
  apidocBaseInfoStore.initResponseHeight()
})
onUnmounted(() => {
  cleanupWebSocketEventListeners()
})
</script>

<style lang="scss" scoped>
.websocket {
  overflow-y: auto;
  height: calc(100vh - var(--apiflow-doc-nav-height));
  display: flex;

  &.vertical {
    flex-direction: column;
    overflow: hidden;
    .y-bar {
      border-top: 1px solid var(--gray-400);
    }
  }

  // 连接编辑区域
  .connection-layout {
    flex: 1;
    overflow: hidden;
    border-right: 1px solid var(--gray-400);
    display: flex;
    flex-direction: column;

    &.vertical {
      flex: 1;
      overflow-y: auto;
      border-right: none;
    }
  }

  // WebSocket信息区域
  .info-layout {
    flex-grow: 0;
    flex-shrink: 0;
    width: 300px;
  }
}
</style>
