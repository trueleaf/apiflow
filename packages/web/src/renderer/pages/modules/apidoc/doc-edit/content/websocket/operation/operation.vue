<template>
  <div class="ws-operation">
    <div class="connection-wrap">
      <el-input 
        v-model="connectionUrl" 
        :placeholder="$t('请输入WebSocket连接地址')" 
        autocomplete="off" 
        autocorrect="off" 
        spellcheck="false"
        @blur="handleFormatUrl"
        @keyup.enter.stop="handleFormatUrl"
        class="connection-input"
      >
        <template #prepend>
          <div class="protocol-select">
            <el-select v-model="protocol" size="default">
              <el-option value="ws" label="WS"></el-option>
              <el-option value="wss" label="WSS"></el-option>
            </el-select>
          </div>
        </template>
      </el-input>
      
      <div class="action-buttons">
        <el-button 
          v-if="connectionState === 'disconnected' || connectionState === 'error'" 
          type="success" 
          :loading="connectionLoading"
          @click="handleConnect"
        >
          {{ connectButtonText }}
        </el-button>
        <el-button 
          v-if="connectionState === 'connected'" 
          type="danger" 
          :loading="connectionLoading"
          @click="handleDisconnect"
        >
          {{ t("断开连接") }}
        </el-button>
        <el-button 
          v-if="connectionState === 'connecting'" 
          type="warning" 
          loading
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
      <el-tag 
        :type="getStatusType(connectionState)" 
        size="small"
        class="status-tag"
      >
        {{ getStatusText(connectionState) }}
      </el-tag>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { useTranslation } from 'i18next-vue';
import { storeToRefs } from 'pinia';
import { Refresh } from '@element-plus/icons-vue';
import { useWebSocket } from '@/store/websocket/websocket';
import { useApidocTas } from '@/store/apidoc/tabs';
import { router } from '@/router';
import { ApidocProperty } from '@src/types';

const { t } = useTranslation();
const websocketStore = useWebSocket();
const apidocTabsStore = useApidocTas();
const { currentSelectTab } = storeToRefs(apidocTabsStore);

const saveLoading = computed(() => websocketStore.saveLoading);
const refreshLoading = ref(false);
const connectionLoading = ref(false);
const hasEverConnected = ref(false);
const fullUrl = computed(() => {
  return websocketStore.websocketFullUrl;
});
const connectionState = computed(() => websocketStore.connectionState);
const connectionId = computed(() => websocketStore.connectionId);
const protocol = computed({
  get: () => websocketStore.websocket.item.protocol,
  set: (value: 'ws' | 'wss') => websocketStore.changeWebSocketProtocol(value)
});
const connectionUrl = computed({
  get: () => websocketStore.websocket.item.url.path,
  set: (value: string) => websocketStore.changeWebSocketPath(value)
});


// 连接按钮文案
const connectButtonText = computed(() => {
  if (hasEverConnected.value) {
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
const handleConnect = () => {
  if (!currentSelectTab.value) {
    console.error('未找到当前选中的标签页');
    return;
  }
  connectionLoading.value = true;
  websocketStore.changeConnectionState('connecting');
  const nodeId = currentSelectTab.value._id;
  window.electronAPI?.websocket.connect(fullUrl.value, nodeId).then((result) => {
    if (result.success) {
      websocketStore.changeConnectionId(result.connectionId!);
      websocketStore.changeConnectionState('connected');
      hasEverConnected.value = true;
      // 连接成功后，更新originWebsocket以避免checkWebsocketIsEqual返回false
      websocketStore.changeOriginWebsocket();
    } else {
      websocketStore.changeConnectionState('error');
      console.error('WebSocket连接失败:', result.error);
    }
  }).catch((error) => {
    websocketStore.changeConnectionState('error');
    console.error('WebSocket连接异常:', error);
  }).finally(() => {
    connectionLoading.value = false;
  });
};

const handleDisconnect = () => {
  connectionLoading.value = true;
  window.electronAPI?.websocket.disconnect(connectionId.value).then((result) => {
    if (result.success) {
      websocketStore.changeConnectionState('disconnected');
      websocketStore.changeConnectionId('');
    } else {
      websocketStore.changeConnectionState('error');
      console.error('WebSocket断开连接失败:', result.error);
    }
  }).catch((error) => {
    websocketStore.changeConnectionState('error');
    console.error('WebSocket断开连接异常:', error);
  }).finally(() => {
    connectionLoading.value = false;
  });
};

/*
|--------------------------------------------------------------------------
| 其他操作
|--------------------------------------------------------------------------
*/
const handleSave = () => {
  websocketStore.saveWebsocket();
};

const handleRefresh = () => {
  if (!currentSelectTab.value) {
    return;
  }
  if (__STANDALONE__) {
    refreshLoading.value = true;
    setTimeout(() => {
      if (currentSelectTab.value) {
        websocketStore.getWebsocketDetail({
          id: currentSelectTab.value._id,
          projectId: router.currentRoute.value.query.id as string,
        });
      }
      refreshLoading.value = false;
    }, 100);
  }
  // 这里可以添加从服务器重新获取数据的逻辑
};

const getStatusType = (state: string) => {
  switch (state) {
    case 'connected': return 'success';
    case 'connecting': return 'warning';
    case 'error': return 'danger';
    default: return 'info';
  }
};

const getStatusText = (state: string) => {
  switch (state) {
    case 'connected': return t('已连接');
    case 'connecting': return t('连接中');
    case 'error': return t('连接错误');
    default: return t('未连接');
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
        _id: Math.random().toString(36).substr(2, 9),
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
  
  // URL格式化处理
  const ipReg = /^wss?:\/\/((\d|[1-9]\d|1\d{2}|2[0-5]{2})\.){3}(2[0-5]{2}|1\d{2}|[1-9]\d|\d)/;
  const ipWithPortReg = /^wss?:\/\/((\d|[1-9]\d|1\d{2}|2[0-5]{2})\.){3}(2[0-5]{2}|1\d{2}|[1-9]\d|\d)(:\d{2,5})/;
  const dominReg = /^(wss?:\/\/)?([^./]{1,62}\.){1,}[^./]{1,62}/;
  const localhostReg = /^(wss?:\/\/)?(localhost)/;
  const startsWithVarReg = /^\{\{(.*)\}\}/;
  
  const matchedIp = currentPath.match(ipReg);
  const matchedIpWithPort = currentPath.match(ipWithPortReg);
  const matchedDomin = currentPath.match(dominReg);
  const matchedLocalhost = currentPath.match(localhostReg);
  const isStartsWithVar = currentPath.match(startsWithVarReg);
  
  let formatPath = currentPath;
  if (!matchedIp && !matchedDomin && !matchedIpWithPort && !matchedLocalhost && !isStartsWithVar) {
    // WebSocket路径处理
    if (formatPath.trim() === '') {
      formatPath = '';
    } else if (!formatPath.startsWith('ws://') && !formatPath.startsWith('wss://')) {
      // 如果没有协议前缀，添加当前选择的协议
      formatPath = `${protocol.value}://${formatPath}`;
    }
  }
  
  // 移除查询参数部分（因为已经转换为params）
  const queryReg = /(\?.*$)/;
  formatPath = formatPath.replace(queryReg, '');
  
  // 更新连接URL
  connectionUrl.value = formatPath;
};

const checkIsConnection = () => {
  if (!currentSelectTab.value) {
    return;
  }
  window.electronAPI?.websocket.checkNodeConnection(currentSelectTab.value._id).then((result) => {
    if (result.connected) {
      websocketStore.changeConnectionId(result.connectionId!);
      websocketStore.changeConnectionState('connected');
      hasEverConnected.value = true; // 如果检查发现已连接，说明之前连接过
    } else {
      websocketStore.changeConnectionId('');
      websocketStore.changeConnectionState('disconnected');
      hasEverConnected.value = false; // 如果未连接，重置连接历史
    }
  }).catch((error) => {
    console.error('检查WebSocket连接状态异常:', error);
    websocketStore.changeConnectionId('');
    websocketStore.changeConnectionState('error');
    hasEverConnected.value = false; // 出错时重置连接历史
  });
};

// 监听WebSocket事件
const setupWebSocketEventListeners = () => {
  if (!window.electronAPI) return;
  window.electronAPI.onMain('websocket-opened', (data: { connectionId: string; nodeId: string; url: string }) => {
    if (currentSelectTab.value && data.nodeId === currentSelectTab.value._id) {
      websocketStore.changeConnectionId(data.connectionId);
      websocketStore.changeConnectionState('connected');
      hasEverConnected.value = true;
    }
  });
  // 监听WebSocket连接关闭事件
  window.electronAPI.onMain('websocket-closed', (data: { connectionId: string; nodeId: string; code: number; reason: string; url: string }) => {
    if (currentSelectTab.value && data.nodeId === currentSelectTab.value._id) {
      websocketStore.changeConnectionId('');
      websocketStore.changeConnectionState('disconnected');
    }
  });
  // 监听WebSocket连接错误事件
  window.electronAPI.onMain('websocket-error', (data: { connectionId: string; nodeId: string; error: string; url: string }) => {
    if (currentSelectTab.value && data.nodeId === currentSelectTab.value._id) {
      websocketStore.changeConnectionId('');
      websocketStore.changeConnectionState('error');
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

// 监听当前选中tab变化，重新查询连接状态
watch(currentSelectTab, (newTab) => {
  if (newTab) {
    checkIsConnection();
  }
});

onMounted(() => {
  checkIsConnection();
  setupWebSocketEventListeners();
});

onUnmounted(() => {
  cleanupWebSocketEventListeners();
});

// 暴露连接状态供父组件使用
defineExpose({
  connectionState,
  connectionId
});
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

  .connection-wrap {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    margin-top: 10px;

    .connection-input {
      flex: 1;

      :deep(.el-input__inner) {
        font-size: 13px;
      }

      .protocol-select {
        display: flex;
        align-items: center;

        :deep(.el-select) {
          width: 80px;
        }
      }
    }

    .action-buttons {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
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
    border: 1px solid #d1d5da;
    border-radius: 4px;
    background-color: #f0f0f0;
    color: #212529;
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
      color: #303133;
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
      color: #606266;
      margin: 0 8px;
      min-width: 0; /* 允许flex item收缩到内容宽度以下 */
      
      &::-webkit-scrollbar {
        height: 0px;
      }
    }
    
    .status-tag {
      flex: 0 0 auto;
      margin-left: auto; /* 确保状态标签始终在最右侧 */
    }
  }
}
</style>
