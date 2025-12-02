<template>
  <div class="ws-operation">
    <div class="op-wrap">
      <div class="protocol-select">
        <el-select v-model="protocol" size="default">
          <el-option value="ws" label="WS"></el-option>
          <el-option value="wss" label="WSS"></el-option>
        </el-select>
      </div>
      <ClRichInput
        v-model="connectionUrl"
        class="url-rich-input"
        :placeholder="$t('请输入WebSocket连接地址')"
        :trim-on-paste="true"
        :min-height="30"
        disable-history
        @blur="handleFormatUrl"
        @keyup.enter.stop="handleFormatUrl"
      >
        <template #variable="{ label }">
          <div class="variable-token">{{ label }}</div>
        </template>
      </ClRichInput>
      
      <div class="action-buttons">
        <el-button 
          v-if="connectionState === 'disconnected' || connectionState === 'error'" 
          type="success" 
          @click="handleConnect"
        >
          {{ connectButtonText }}
        </el-button>
        <el-button 
          v-if="connectionState === 'connected'" 
          type="danger" 
          @click="handleDisconnect"
        >
          {{ t("断开连接") }}
        </el-button>
        <el-button 
          v-if="connectionState === 'connecting'" 
          type="warning" 
        >
          {{ t("连接中") }}
        </el-button>
        <el-button type="primary" :loading="saveLoading" @click="handleSave">{{ t("保存接口") }}</el-button>
        <el-button type="primary" :icon="Refresh" :loading="refreshLoading" @click="handleRefresh">{{ t("刷新") }}</el-button>
      </div>
    </div>
    
    <!-- 连接状态显示 -->
    <div class="status-wrap">
      <span class="label">{{ t("连接地址") }}：</span>
      <span class="url">{{ fullUrl }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { Refresh } from '@element-plus/icons-vue';
import ClRichInput from '@/components/ui/cleanDesign/richInput/ClRichInput.vue';
import { useWebSocket } from '@/store/websocket/websocketStore';
import { useApidocTas } from '@/store/apidoc/tabsStore';
import { router } from '@/router';
import { ApidocProperty } from '@src/types';
import { WebsocketConnectParams } from '@src/types/websocketNode';
import { nanoid } from 'nanoid/non-secure';
import { websocketResponseCache } from '@/cache/websocketNode/websocketResponseCache';
import { getWebSocketHeaders } from '@/server/request/request';
import { useWsRedoUndo } from '@/store/redoUndo/wsRedoUndoStore';
import { useRuntime } from '@/store/runtime/runtimeStore';
import { executeWebSocketPreScript } from '@/server/websocket/executePreScript';
import { useVariable } from '@/store/apidoc/variablesStore';
import { useCookies } from '@/store/apidoc/cookiesStore';
import { httpNodeCache } from '@/cache/httpNode/httpNodeCache';
import { sendHistoryCache } from '@/cache/sendHistory/sendHistoryCache';

import { message } from '@/helper'
const { t } = useI18n();
const websocketStore = useWebSocket();
const apidocTabsStore = useApidocTas();
const redoUndoStore = useWsRedoUndo();
const runtimeStore = useRuntime();
const variableStore = useVariable();
const cookiesStore = useCookies();
const isStandalone = computed(() => runtimeStore.networkMode === 'offline');
const { currentSelectTab } = storeToRefs(apidocTabsStore);
const { saveLoading, refreshLoading, websocketFullUrl: fullUrl, connectionState, connectionId } = storeToRefs(websocketStore);

const protocol = computed({
  get: () => websocketStore.websocket.item.protocol,
  set: (value: 'ws' | 'wss') => {
    if (!currentSelectTab.value) return;
    const oldValue = websocketStore.websocket.item.protocol;
    if (oldValue !== value) {
      // 记录协议变化操作
      redoUndoStore.recordOperation({
        nodeId: currentSelectTab.value._id,
        type: "protocolOperation",
        operationName: "修改协议",
        affectedModuleName: "operation",
        oldValue,
        newValue: value,
        timestamp: Date.now()
      });
    }
    websocketStore.changeWebSocketProtocol(value);
  }
});
const connectionUrl = computed({
  get: () => websocketStore.websocket.item.url.path,
  set: (value: string) => {
    if (!currentSelectTab.value) return;
    const oldValue = websocketStore.websocket.item.url.path;
    if (oldValue !== value) {
      // 记录URL变化操作
      redoUndoStore.recordOperation({
        nodeId: currentSelectTab.value._id,
        type: "urlOperation",
        operationName: "修改连接地址",
        affectedModuleName: "operation",
        oldValue,
        newValue: value,
        timestamp: Date.now()
      });
    }
    websocketStore.changeWebSocketPath(value);
  }
});


// 连接按钮文案
const connectButtonText = computed(() => {
  // 根据连接状态判断按钮文案
  if (connectionState.value === 'connected' || connectionState.value === 'error') {
    return t("重新连接");
  } else {
    return t("发起连接");
  }
});

/*
|--------------------------------------------------------------------------
| websocket相关操作
|--------------------------------------------------------------------------
*/
const handleConnect = async () => {
  if (!currentSelectTab.value) {
    console.error('未找到当前选中的标签页');
    return;
  }
  const currentTab = currentSelectTab.value;
  websocketStore.changeConnectionState('connecting');

  // 添加发起连接消息
  const startConnectMessage = {
    type: 'startConnect' as const,
    data: {
      id: nanoid(),
      nodeId: currentTab._id,
      url: fullUrl.value,
      timestamp: Date.now()
    }
  };
  websocketStore.addMessage(startConnectMessage);

  // 缓存发起连接消息到IndexedDB
  websocketResponseCache.setResponseByNodeId(currentTab._id, startConnectMessage);

  // 添加发送历史记录
  sendHistoryCache.addSendHistory({
    nodeId: currentTab._id,
    nodeName: websocketStore.websocket.info.name,
    nodeType: 'websocket',
    protocol: websocketStore.websocket.item.protocol,
    url: websocketStore.websocket.item.url.path,
    operatorName: 'me',
    networkType: runtimeStore.networkMode
  });

  try {
    // 执行前置脚本
    let websocketToConnect = websocketStore.websocket;

    if (websocketStore.websocket.preRequest.raw && websocketStore.websocket.preRequest.raw.trim() !== '') {
      console.log('执行WebSocket前置脚本...');

      // 获取 projectId
      const projectId = router.currentRoute.value.query.id as string;

      // 将 cookies 数组转换为对象格式
      const cookiesObject = cookiesStore.cookies.reduce((acc, cookie) => {
        acc[cookie.name] = cookie.value;
        return acc;
      }, {} as Record<string, string>);

      // 获取实际的 localStorage 和 sessionStorage
      const preRequestLocalStorage = httpNodeCache.getPreRequestLocalStorage(projectId);
      const preRequestSessionStorage = httpNodeCache.getPreRequestSessionStorage(projectId);

      const preScriptResult = await executeWebSocketPreScript(
        websocketStore.websocket,
        variableStore.objectVariable,
        cookiesObject,
        preRequestLocalStorage,
        preRequestSessionStorage,
        projectId
      );

      if (!preScriptResult.success) {
        // 前置脚本执行失败
        websocketStore.changeConnectionState('error');

        const errorMsg = preScriptResult.error?.message || '前置脚本执行失败';
        message.error({
          message: `前置脚本执行失败: ${errorMsg}`,
          duration: 5000,
        });

        const scriptErrorMessage = {
          type: 'error' as const,
          data: {
            id: nanoid(),
            nodeId: currentTab._id,
            error: `前置脚本执行失败: ${errorMsg}`,
            timestamp: Date.now()
          }
        };
        websocketStore.addMessage(scriptErrorMessage);
        websocketResponseCache.setResponseByNodeId(currentTab._id, scriptErrorMessage);

        return;
      }

      // 应用前置脚本的修改
      if (preScriptResult.modifiedWebsocket) {
        console.log('应用前置脚本修改:', preScriptResult.modifiedWebsocket);
        websocketToConnect = {
          ...websocketStore.websocket,
          ...preScriptResult.modifiedWebsocket,
        };
      }
    }

    // 获取处理后的请求头（使用可能被脚本修改过的 websocket 数据）
    const headers = await getWebSocketHeaders(
      websocketToConnect,
      websocketStore.defaultHeaders,
      fullUrl.value
    );
    const nodeId = currentTab._id;
    const connectParams: WebsocketConnectParams = {
      url: fullUrl.value,
      nodeId,
      headers
    };
    window.electronAPI?.websocket.connect(connectParams).then((result) => {
    if (result.code !== 0) {
      websocketStore.changeConnectionState('error');
      console.error('WebSocket连接失败:', result.msg);

      // 添加连接错误消息
      const connectErrorMessage = {
        type: 'error' as const,
        data: {
          id: nanoid(),
          nodeId: currentTab._id,
          error: result.msg || t('连接失败'),
          timestamp: Date.now()
        }
      };
      websocketStore.addMessage(connectErrorMessage);

      // 缓存连接错误消息到IndexedDB
      websocketResponseCache.setResponseByNodeId(currentTab._id, connectErrorMessage);

    }
  }).catch((error) => {
    websocketStore.changeConnectionState('error');
    console.error('WebSocket连接异常:', error);

    // 添加连接异常消息
    const connectExceptionMessage = {
      type: 'error' as const,
      data: {
        id: nanoid(),
        nodeId: currentTab._id,
        error: error.message || t('连接异常'),
        timestamp: Date.now()
      }
    };
    websocketStore.addMessage(connectExceptionMessage);

    // 缓存连接异常消息到IndexedDB
    websocketResponseCache.setResponseByNodeId(currentTab._id, connectExceptionMessage);

  });
  } catch (error) {
    websocketStore.changeConnectionState('error');
    console.error('WebSocket连接参数处理异常:', error);
    
    // 添加连接参数处理异常消息
    const paramErrorMessage = {
      type: 'error' as const,
      data: {
        id: nanoid(),
        nodeId: currentTab._id,
        error: `请求头处理异常: ${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: Date.now()
      }
    };
    websocketStore.addMessage(paramErrorMessage);
    
    // 缓存连接参数处理异常消息到IndexedDB
    websocketResponseCache.setResponseByNodeId(currentTab._id, paramErrorMessage);
  }
};

const handleDisconnect = async () => {
  if (!currentSelectTab.value) {
    return;
  }
  const currentTab = currentSelectTab.value;
  window.electronAPI?.websocket.disconnect(connectionId.value).then((result) => {
    if (result.code !== 0) {
      websocketStore.changeConnectionState('error');
      console.error('WebSocket断开连接失败:', result.msg);

      // 添加断开连接错误消息
      const disconnectErrorMessage = {
        type: 'error' as const,
        data: {
          id: nanoid(),
          nodeId: currentTab._id,
          error: result.msg || t('断开连接失败'),
          timestamp: Date.now()
        }
      };
      websocketStore.addMessage(disconnectErrorMessage);

      // 缓存断开连接错误消息到IndexedDB
      websocketResponseCache.setResponseByNodeId(currentTab._id, disconnectErrorMessage);
    }
  }).catch((error) => {
    websocketStore.changeConnectionState('error');
    console.error('WebSocket断开连接异常:', error);

    // 添加断开连接异常消息
    const disconnectExceptionMessage = {
      type: 'error' as const,
      data: {
        id: nanoid(),
        nodeId: currentTab._id,
        error: error.message || t('断开连接异常'),
        timestamp: Date.now()
      }
    };
    websocketStore.addMessage(disconnectExceptionMessage);

    // 缓存断开连接异常消息到IndexedDB
    websocketResponseCache.setResponseByNodeId(currentTab._id, disconnectExceptionMessage);
  });
};


/*
|--------------------------------------------------------------------------
| 其他操作
|--------------------------------------------------------------------------
*/
const handleSave = () => {
  websocketStore.saveWebsocket()
};
const handleRefresh = async () => {
  if (!currentSelectTab.value) {
    return;
  }
  websocketStore.refreshLoading = true;
  try {
    websocketStore.clearMessages();
    const nodeId = currentSelectTab.value._id;
    if (nodeId) {
      redoUndoStore.clearRedoUndoListByNodeId(nodeId);
      await websocketResponseCache.clearResponseByNodeId(nodeId);
    }
    
    if (isStandalone.value) {
      if (currentSelectTab.value) {
        websocketStore.getWebsocketDetail({
          id: currentSelectTab.value._id,
          projectId: router.currentRoute.value.query.id as string,
        });
      }
    }
    // 这里可以添加从服务器重新获取数据的逻辑
  } catch (error) {
    console.error('清空缓存失败:', error);
    // 即使缓存清空失败，也要清空内存中的消息
    websocketStore.clearMessages();
  } finally {
    setTimeout(() => {
      websocketStore.refreshLoading = false;
    }, 100);
  }
};

const handleFormatUrl = () => {
  // 将请求url后面查询参数转换为params
  const convertQueryToParams = (requestPath: string): void => {
    const stringParams = requestPath.split('?')[1] || '';
    if (!stringParams) return;

    const objectParams: Record<string, string> = {};
    stringParams.split('&').forEach(pair => {
      const [encodedKey, encodedValue] = pair.split(/=(.*)/s);
      if (encodedKey) {
        objectParams[encodedKey] = encodedValue || '';
      }
    });
    
    const newParams: ApidocProperty<'string'>[] = [];
    Object.keys(objectParams).forEach(field => {
      const property: ApidocProperty<'string'> = {
        _id: nanoid(),
        key: field,
        value: objectParams[field] || '',
        description: '',
        required: true,
        type: 'string',
        select: true,
      };
      newParams.push(property);
    });
    
    const uniqueData: ApidocProperty<'string'>[] = [];
    const originParams = websocketStore.websocket.item.queryParams;
    newParams.forEach(item => {
      const matchedItem = originParams.find(v => v.key === item.key);
      if (originParams.every(v => v.key !== item.key)) {
        uniqueData.push(item);
      }
      if (matchedItem) {
        matchedItem.value = item.value;
      }
    });
    
    // 添加新的唯一参数到查询参数列表
    if (uniqueData.length > 0) {
      websocketStore.websocket.item.queryParams.unshift(...uniqueData);
    }
  };

  const currentPath = connectionUrl.value;
  convertQueryToParams(currentPath);
  
  // 如果URL不为空且不以ws://或wss://开头，且不是以变量开头，则添加协议前缀
  let formatPath = currentPath;
  if (formatPath.trim() !== '' && !formatPath.startsWith('ws://') && !formatPath.startsWith('wss://') && !formatPath.startsWith('{{')) {
    formatPath = `${protocol.value}://${formatPath}`;
  }
  
  // 移除查询参数部分（因为已经转换为params）
  const queryReg = /(\?.*$)/;
  formatPath = formatPath.replace(queryReg, '');
  
  // 更新连接URL
  connectionUrl.value = formatPath;
};

</script>

<style lang="scss" scoped>
.ws-operation {
  position: sticky;
  top: 0;
  padding: 10px 20px;
  box-shadow: 0 3px 2px var(--gray-400);
  background: var(--white);
  z-index: var(--zIndex-request-info-wrap);
  height: var(--apiflow-apidoc-operation-height);

  .op-wrap {
    display: flex;
    margin-top: 10px;

    .protocol-select {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      margin-right: -1px;

      :deep(.el-select) {
        width: 80px;
      }

      :deep(.el-input__wrapper) {
        border-radius: 4px 0 0 4px;
      }
    }

    .url-rich-input {
      flex: 1;
      border: 1px solid var(--el-border-color);
      margin-right: 10px;
      
      :deep(.cl-rich-input__editor .ProseMirror p) {
        font-size: 13px;
        height: 28px;
        line-height: 28px;
      }
      &:focus-within {
        border-color: var(--el-color-primary);
      }
    }

    .variable-token {
      color: var(--el-color-warning);
      cursor: pointer;
    }

    .action-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      
      .el-button {
        margin-left: 0;
      }
    }
  }

  .status-wrap {
    height: 30px;
    width: 100%;
    display: flex;
    margin: 0;
    align-items: center;
    overflow: hidden;
    padding: 0 10px;
    border: 1px solid var(--border-base);
    border-radius: 4px;
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    font-size: 12px;
    font-family: SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
    
    &::-webkit-scrollbar {
      height: 0px;
    }
    
    .label {
      font-family: var(--font-family);
      user-select: none;
      flex: 0 0 auto;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }
    
    .url {
      display: flex;
      align-items: center;
      flex: 1;
      height: 30px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow-x: auto;
      color: var(--el-text-color-regular);
      margin: 0 8px;
      min-width: 0; /* 允许flex item收缩到内容宽度以下 */
      
      &::-webkit-scrollbar {
        height: 0px;
      }
    }
    
  }

}
</style>

