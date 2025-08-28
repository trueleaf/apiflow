<template>
  <div class="ws-connection">
    <div class="ws-operation">
      <div class="op-wrap">
        <el-input 
          v-model="connectionUrl" 
:placeholder="$t('请输入WebSocket连接地址')" 
          autocomplete="off" 
          autocorrect="off" 
          spellcheck="false"
          @blur="handleFormatUrl"
          @keyup.enter.stop="handleFormatUrl"
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
        <!-- <RichInput></RichInput> -->
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
      
      <!-- 连接状态显示 -->
      <pre class="pre-url-wrap">
        <span class="label">{{ t("连接地址") }}：</span>
        <span class="url">{{ fullUrl }}</span>
        <el-tag 
          :type="getStatusType(connectionState)" 
          size="small"
          class="status-tag"
        >
          {{ getStatusText(connectionState) }}
        </el-tag>
      </pre>
    </div>

    <!-- 连接配置选项卡 -->
    <el-tabs v-model="activeTab" class="connection-tabs">
      <el-tab-pane name="messageContent">
        <template #label>
          <el-badge :is-dot="hasSendMessage">{{ t('消息内容') }}</el-badge>
        </template>
        <SMessageContent
          :connection-state="connectionState"
          :connection-id="connectionId"
        ></SMessageContent>
      </el-tab-pane>
      <el-tab-pane name="params">
        <template #label>
          <el-badge :is-dot="hasParams">Params</el-badge>
        </template>
        <SParams></SParams>
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
      <el-tab-pane :label="t('备注信息')" name="remarks">
        <SRemarks></SRemarks>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useTranslation } from 'i18next-vue'
import { Refresh } from '@element-plus/icons-vue'
import SHeaders from './headers/headers.vue'
import SParams from './params/params.vue'
import SPreScript from './pre-script/pre-script.vue'
import SMessageContent from './message-content/message-content.vue'
import SAfterScript from './after-script/after-script.vue'
import SRemarks from './remarks/remarks.vue'
import { useWebSocket } from '@/store/websocket/websocket'
import { useRoute } from 'vue-router'
import { useApidocTas } from '@/store/apidoc/tabs'
import { ApidocProperty } from '@src/types'
import { webSocketNodeCache } from '@/cache/websocketNode'
import { ElMessage } from 'element-plus'
// import RichInput from '@/components/apidoc/rich-input/rich-input.vue'

const { t } = useTranslation()
const websocketStore = useWebSocket();
const apidocTabsStore = useApidocTas();
const route = useRoute();
const saveLoading = computed(() => websocketStore.saveLoading);
const currentSelectTab = computed(() => {
  const projectId = route.query.id as string;
  const tabs = apidocTabsStore.tabs[projectId];
  const currentSelectTab = tabs?.find((tab) => tab.selected) || null;
  return currentSelectTab;
});
const activeTab = ref('')
const refreshLoading = ref(false);
const connectionState = ref<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
const connectionId = ref('');
const connectionLoading = ref(false)
const hasEverConnected = ref(false); // 跟踪是否曾经连接过


const protocol = computed({
  get: () => websocketStore.websocket.item.protocol,
  set: (value: 'ws' | 'wss') => websocketStore.changeWebSocketProtocol(value)
})
const connectionUrl = computed({
  get: () => websocketStore.websocket.item.url.path,
  set: (value: string) => websocketStore.changeWebSocketPath(value)
})
const fullUrl = computed(() => {
  return websocketStore.websocketFullUrl;
})

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
  return websocketStore.websocket.item.sendMessage.trim() !== ''
})

// 连接按钮文案
const connectButtonText = computed(() => {
  if (hasEverConnected.value) {
    return t("重新连接")
  } else {
    return t("发起连接")
  }
})

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
  connectionState.value = 'connecting';
  const nodeId = currentSelectTab.value._id;
  
  window.electronAPI?.websocket.connect(fullUrl.value, nodeId).then((result) => {
    if (result.success) {
      connectionId.value = result.connectionId!;
      connectionState.value = 'connected';
      hasEverConnected.value = true; // 标记已经连接过
    } else {
      connectionState.value = 'error';
      console.error('WebSocket连接失败:', result.error);
    }
  }).catch((error) => {
    connectionState.value = 'error';
    console.error('WebSocket连接异常:', error);
  }).finally(() => {
    connectionLoading.value = false;
  });
}

const handleDisconnect = () => {
  connectionLoading.value = true;
   window.electronAPI?.websocket.disconnect(connectionId.value).then((result) => {
     if (result.success) {
       connectionState.value = 'disconnected';
       connectionId.value = '';
     } else {
       connectionState.value = 'error';
       console.error('WebSocket断开连接失败:', result.error);
     }
   }).catch((error) => {
     connectionState.value = 'error';
     console.error('WebSocket断开连接异常:', error);
   }).finally(() => {
     connectionLoading.value = false;
   });
}

/*
|--------------------------------------------------------------------------
| 其他操作
|--------------------------------------------------------------------------
*/
const handleSave = () => {
  websocketStore.saveWebsocket()
}

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
          projectId: route.query.id as string,
        });
      }
      refreshLoading.value = false;
    }, 100);
  }
  // 这里可以添加从服务器重新获取数据的逻辑
}

const getStatusType = (state: string) => {
  switch (state) {
    case 'connected': return 'success'
    case 'connecting': return 'warning'
    case 'error': return 'danger'
    default: return 'info'
  }
}
const getStatusText = (state: string) => {
  switch (state) {
    case 'connected': return '已连接'
    case 'connecting': return '连接中'
    case 'error': return '连接错误'
    default: return '未连接'
  }
}
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
      newParams.push(property)
    })
    
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
    })
    
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
}
const getInitialActiveTab = (): string => {
  if (currentSelectTab.value) {
    const cachedTab = webSocketNodeCache.getWebSocketConnectionActiveTab(currentSelectTab.value._id);
    return cachedTab || 'messageContent';
  }
  return 'messageContent';
};
// 监听activeTab变化并保存到缓存
watch(activeTab, (newVal) => {
  if (currentSelectTab.value) {
    webSocketNodeCache.setWebSocketConnectionActiveTab(currentSelectTab.value._id, newVal);
  }
});

// 监听当前选中tab变化，重新加载activeTab
watch(currentSelectTab, (newTab) => {
  if (newTab) {
    const cachedTab = webSocketNodeCache.getWebSocketConnectionActiveTab(newTab._id);
    activeTab.value = cachedTab || 'messageContent';
    connectionId.value = '';
    connectionState.value = 'disconnected';
    hasEverConnected.value = false; // 切换tab时重置连接历史
  }
});
const checkIsConnection = () => {
  if (!currentSelectTab.value) {
    return;
  }
  window.electronAPI?.websocket.checkNodeConnection(currentSelectTab.value._id).then((result) => {
    if (result.connected) {
      connectionId.value = result.connectionId!;
      connectionState.value = 'connected';
      hasEverConnected.value = true; // 如果检查发现已连接，说明之前连接过
    } else {
      connectionId.value = '';
      connectionState.value = 'disconnected';
    }
  }).catch((error) => {
    console.error('检查WebSocket连接状态异常:', error);
    connectionId.value = '';
    connectionState.value = 'error';
  });
}

// 监听WebSocket事件
const setupWebSocketEventListeners = () => {
  if (!window.electronAPI) return;
  window.electronAPI.onMain('websocket-opened', (data: { connectionId: string; nodeId: string; url: string }) => {
    if (currentSelectTab.value && data.nodeId === currentSelectTab.value._id) {
      connectionId.value = data.connectionId;
      connectionState.value = 'connected';
      hasEverConnected.value = true; // 标记已经连接过
    }
  });
  // 监听WebSocket连接关闭事件
  window.electronAPI.onMain('websocket-closed', (data: { connectionId: string; nodeId: string; code: number; reason: string; url: string }) => {
    if (currentSelectTab.value && data.nodeId === currentSelectTab.value._id) {
      connectionId.value = '';
      connectionState.value = 'disconnected';
      ElMessage.warning(`WebSocket连接已关闭`);
    }
  });
  // 监听WebSocket连接错误事件
  window.electronAPI.onMain('websocket-error', (data: { connectionId: string; nodeId: string; error: string; url: string }) => {
    if (currentSelectTab.value && data.nodeId === currentSelectTab.value._id) {
      connectionId.value = '';
      connectionState.value = 'error';
    }
  });
}

// 清理WebSocket事件监听器
const cleanupWebSocketEventListeners = () => {
  if (!window.electronAPI) return;
  
  // 清理所有WebSocket事件监听器
  window.electronAPI.removeListener('websocket-opened');
  window.electronAPI.removeListener('websocket-closed');
  window.electronAPI.removeListener('websocket-error');
  window.electronAPI.removeListener('websocket-message');
}
onMounted(() => {
  activeTab.value = getInitialActiveTab();
  checkIsConnection();
  setupWebSocketEventListeners(); 
});

onUnmounted(() => {
  cleanupWebSocketEventListeners();
});
</script>

<style lang="scss" scoped>
.ws-connection {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;

  .ws-operation {
    margin-bottom: 16px;
  }

  .connection-wrap {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 12px;

    .el-input {
      flex: 1;
    }

    .protocol-select {
      min-width: 80px;
      
      .el-select {
        width: 100%;
      }
    }
  }

  .op-wrap {
    display: flex;
    margin-top: 10px;

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

    .el-input__suffix {
      display: flex;
      align-items: center;
    }
  }

  .pre-url-wrap {
    height: 30px;
    width: 100%;
    white-space: nowrap;
    display: flex;
    margin: 0;
    align-items: center;
    overflow: hidden;
    padding: 0 10px;
    border: 1px solid #d1d5da;
    border-radius: 4px;
    background-color: #f0f0f0;
    white-space: pre-wrap;
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
    }
    
    .url {
      display: flex;
      align-items: center;
      height: 30px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow-x: auto;
      flex: 1;
      
      &::-webkit-scrollbar {
        height: 0px;
      }
    }
    
    .status-tag {
      flex: 0 0 auto;
      margin-left: 8px;
    }
  }

  .connection-status {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: var(--gray-700);

    .label {
      font-weight: 500;
    }

    .url {
      color: var(--gray-600);
      font-family: monospace;
      font-size: 13px;
    }
  }

  .connection-tabs {
    flex: 1;
    overflow: hidden;

    :deep(.el-tabs__content) {
      height: calc(100% - 40px);
      overflow-y: auto;
    }

    :deep(.el-tab-pane) {
      height: 100%;
    }
  }
}
</style>
