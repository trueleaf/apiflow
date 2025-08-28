<template>
  <div class="message-content">
    <!-- 数据类型选择器 -->
    <div class="message-type-selector">
      <el-select v-model="messageType" size="small" @change="handleMessageTypeChange" class="type-selector">
        <el-option value="text" :label="t('文本')">
          <span class="option-content">
            <span>{{ t("文本") }}</span>
          </span>
        </el-option>
        <el-option value="json" :label="t('JSON')">
          <span class="option-content">
            <span>JSON</span>
          </span>
        </el-option>
        <el-option value="xml" :label="t('XML')">
          <span class="option-content">
            <span>XML</span>
          </span>
        </el-option>
        <el-option value="html" :label="t('HTML')">
          <span class="option-content">
            <span>HTML</span>
          </span>
        </el-option>
        <el-option value="binary-base64" :label="t('二进制(Base64)')">
          <span class="option-content">
            <span>{{ t("二进制(Base64)") }}</span>
          </span>
        </el-option>
        <el-option value="binary-hex" :label="t('二进制(Hex)')">
          <span class="option-content">
            <span>{{ t("二进制(Hex)") }}</span>
          </span>
        </el-option>
      </el-select>
    </div>

    <!-- 内容编辑器 -->
    <div class="content-editor">
      <SJsonEditor
          v-model="websocketStore.websocket.item.sendMessage"
          :config="editorConfig"
          :auto-height="false"
        />
    </div>

    <!-- 操作按钮区域 -->
    <div class="content-actions">
      <div class="action-buttons">
        <el-tooltip
          :content="props.connectionState !== 'connected' ? t('等待连接') : ''"
          :disabled="props.connectionState === 'connected'"
          placement="top"
        >
          <el-button
            type="primary"
            :disabled="!websocketStore.websocket.item.sendMessage.trim() || props.connectionState !== 'connected'"
            @click="handleSendMessage"
            :icon="Position"
          >
            {{ t("发送消息") }}
          </el-button>
        </el-tooltip>

        <el-checkbox
          v-model="sendAndClear"
          @change="handleSendAndClearChange"
        >
          {{ t("发送并清空") }}
        </el-checkbox>

        <!-- 自动心跳功能 -->
        <div class="heartbeat-controls">
          <div class="heartbeat-checkbox">
            <el-checkbox
              v-model="websocketStore.websocket.item.autoHeartbeat"
              @change="handleAutoHeartbeatChange"
              :disabled="props.connectionState !== 'connected'"
            >
              {{ t("自动发送") }}
            </el-checkbox>

            <el-popover
              v-if="websocketStore.websocket.item.autoHeartbeat"
              :visible="configPopoverVisible"
              placement="bottom"
              :width="320"
            >
              <template #reference>
                <el-button
                  type="text"
                  size="small"
                  @click="configPopoverVisible = !configPopoverVisible"
                  class="gear-button"
                >
                  <el-icon>
                    <Setting />
                  </el-icon>
                </el-button>
              </template>

              <div class="heartbeat-config-popover">
                <div class="config-item">
                  <label class="config-label">{{ t("发送间隔") }}:</label>
                  <div class="config-input">
                    <el-input-number
                      v-model="websocketStore.websocket.item.heartbeatInterval"
                      :min="1000"
                      :max="300000"
                      :step="1000"
                      size="small"
                      @change="handleHeartbeatIntervalChange"
                      style="width: 120px;"
                    />
                    <span class="interval-unit">{{ t("毫秒") }}</span>
                  </div>
                </div>

                <div class="config-item">
                  <label class="config-label">{{ t("心跳包内容") }}:</label>
                  <el-input
                    v-model="websocketStore.websocket.item.defaultHeartbeatContent"
                    type="textarea"
                    :rows="3"
                    :placeholder="t('请输入心跳包内容')"
                    @input="handleDefaultHeartbeatContentChange"
                    class="heartbeat-content-input"
                  />
                </div>

                <div class="config-actions">
                  <el-button size="small" @click="configPopoverVisible = false">
                    {{ t("关闭") }}
                  </el-button>
                </div>
              </div>
            </el-popover>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useTranslation } from 'i18next-vue'
import { useRoute } from 'vue-router'
import { useApidocTas } from '@/store/apidoc/tabs'
import { useWebSocket } from '@/store/websocket/websocket'
import { webSocketNodeCache } from '@/cache/websocketNode'
import { ElMessage } from 'element-plus'
import {
  Position,
  Setting,
} from '@element-plus/icons-vue'
import SJsonEditor from '@/components/common/json-editor/g-json-editor.vue'

const props = withDefaults(defineProps<{
  connectionState?: string
  connectionId?: string
}>(), {
  connectionState: 'disconnected',
  connectionId: ''
})

const { t } = useTranslation()
const route = useRoute()
const apidocTabsStore = useApidocTas()
const websocketStore = useWebSocket()

// 消息类型定义
type MessageType = 'text' | 'json' | 'xml' | 'html' | 'binary-base64' | 'binary-hex'

// 获取当前选中的tab
const currentSelectTab = computed(() => {
  const projectId = route.query.id as string
  const tabs = apidocTabsStore.tabs[projectId]
  const currentSelectTab = tabs?.find((tab) => tab.selected) || null
  return currentSelectTab
})

// 响应式数据
const sendAndClear = ref(false)
const messageType = ref<MessageType>('text')
const configPopoverVisible = ref(false)
let heartbeatTimer: NodeJS.Timeout | null = null

const editorConfig = computed(() => {
  switch (messageType.value) {
    case 'json':
      return { language: 'json' }
    case 'xml':
      return { language: 'xml' }
    case 'html':
      return { language: 'html' }
    case 'text':
    default:
      return { language: 'plaintext' }
  }
})


// 初始化状态
const initStates = () => {
  if (currentSelectTab.value) {
    sendAndClear.value = webSocketNodeCache.getWebSocketSendAndClearState(currentSelectTab.value._id)
    messageType.value = webSocketNodeCache.getWebSocketMessageType(currentSelectTab.value._id) as MessageType
  }
}

// 方法
const handleSendMessage = async () => {
  if (!websocketStore.websocket.item.sendMessage.trim()) {
    ElMessage.warning(t('消息内容不能为空'))
    return
  }

  if (!props.connectionId) {
    ElMessage.error(t('WebSocket连接不存在'))
    return
  }

  if (props.connectionState !== 'connected') {
    ElMessage.error(t('WebSocket未连接'))
    return
  }

  try {
    const result = await window.electronAPI?.websocket.send(props.connectionId, websocketStore.websocket.item.sendMessage)
    if (result?.success) {
      if (sendAndClear.value) {
        websocketStore.changeWebSocketSendMessage('')
      }
    } else {
      ElMessage.error(t('消息发送失败') + ': ' + (result?.error || t('未知错误')))
      console.error('WebSocket消息发送失败:', result?.error)
    }
  } catch (error) {
    ElMessage.error(t('消息发送异常'))
    console.error('WebSocket消息发送异常:', error)
  }
}

const handleSendAndClearChange = (value: boolean | string | number) => {
  const boolValue = Boolean(value)
  if (currentSelectTab.value) {
    webSocketNodeCache.setWebSocketSendAndClearState(currentSelectTab.value._id, boolValue)
  }
}

const handleMessageTypeChange = (value: MessageType) => {
  messageType.value = value
  if (currentSelectTab.value) {
    webSocketNodeCache.setWebSocketMessageType(currentSelectTab.value._id, value)
  }
}

// 心跳相关方法
const handleAutoHeartbeatChange = (enabled: boolean | string | number) => {
  const boolEnabled = Boolean(enabled)
  websocketStore.changeWebSocketAutoHeartbeat(boolEnabled)

  if (boolEnabled && props.connectionState === 'connected') {
    startHeartbeat()
  } else {
    stopHeartbeat()
  }
}

const handleHeartbeatIntervalChange = (interval: number | undefined) => {
  if (interval !== undefined) {
    websocketStore.changeWebSocketHeartbeatInterval(interval)

    // 如果心跳正在运行，重新启动以应用新的间隔
    if (websocketStore.websocket.item.autoHeartbeat && props.connectionState === 'connected') {
      stopHeartbeat()
      startHeartbeat()
    }
  }
}

const handleDefaultHeartbeatContentChange = (content: string) => {
  websocketStore.changeWebSocketDefaultHeartbeatContent(content)
}

const startHeartbeat = () => {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
  }

  heartbeatTimer = setInterval(async () => {
    if (props.connectionState === 'connected' && props.connectionId) {
      try {
        const heartbeatContent = websocketStore.websocket.item.defaultHeartbeatContent || 'ping'
        const result = await window.electronAPI?.websocket.send(props.connectionId, heartbeatContent)
        if (!result?.success) {
          console.error('心跳包发送失败:', result?.error)
        }
      } catch (error) {
        console.error('心跳包发送异常:', error)
      }
    }
  }, websocketStore.websocket.item.heartbeatInterval)
}

const stopHeartbeat = () => {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}



// 监听连接状态变化，管理心跳
watch(() => props.connectionState, (newState) => {
  if (newState === 'connected' && websocketStore.websocket.item.autoHeartbeat) {
    startHeartbeat()
  } else if (newState !== 'connected') {
    stopHeartbeat()
  }
})

// 监听当前选中tab变化，重新加载状态
watch(currentSelectTab, (newTab) => {
  if (newTab) {
    // 停止之前的心跳
    stopHeartbeat()

    // 重新加载状态
    sendAndClear.value = webSocketNodeCache.getWebSocketSendAndClearState(newTab._id)
    messageType.value = webSocketNodeCache.getWebSocketMessageType(newTab._id) as MessageType

    // 如果连接状态是已连接且启用了自动心跳，启动心跳
    if (props.connectionState === 'connected' && websocketStore.websocket.item.autoHeartbeat) {
      startHeartbeat()
    }
  }
})

onMounted(() => {
  initStates()
})

onUnmounted(() => {
  stopHeartbeat()
})
</script>

<style lang="scss" scoped>
.message-content {
  padding: 0 16px;
  height: 100%;
  .message-type-selector {
    margin-bottom: 5px;
    .type-selector {
      width: 120px;
    }
  }

  .content-editor {
    height: calc(100vh - 300px);
    border: 1px solid var(--gray-400);
    .binary-editor {
      flex: 1;
      .binary-input {
        height: 100%;

        :deep(.el-textarea__inner) {
          height: 100% !important;
          resize: none;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.5;
        }
      }
    }
  }

  .content-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 8px;
    border-top: 1px solid var(--el-border-color-lighter);

    .action-buttons {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }

    .action-options {
      display: flex;
      align-items: center;
    }

    .heartbeat-controls {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-left: 16px;

      .heartbeat-checkbox {
        display: flex;
        align-items: center;
        gap: 8px;

        .gear-button {
          padding: 4px 8px;
          font-size: 14px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 4px;
          transition: background-color 0.2s;

          &:hover {
            background-color: var(--el-fill-color-light);
          }
        }
      }

      .heartbeat-config {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-left: 24px;

        .interval-unit {
          font-size: 12px;
          color: var(--el-text-color-regular);
        }
      }
    }
  }
}

.heartbeat-config-popover {
  .config-item {
    margin-bottom: 16px;

    .config-label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    .config-input {
      display: flex;
      align-items: center;
      gap: 8px;

      .interval-unit {
        font-size: 12px;
        color: var(--el-text-color-regular);
      }
    }

    .heartbeat-content-input {
      width: 100%;
    }
  }

  .config-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}
</style>
