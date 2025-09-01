<template>
  <div class="message-content">
    <!-- 数据类型选择器 -->
    <div class="message-type-selector">
      <el-select v-model="websocketStore.websocket.config.messageType" size="small" @change="handleMessageTypeChange" class="type-selector">
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
          v-model="websocketStore.websocket.item.message"
          :config="editorConfig"
          :auto-height="false"
        />
    </div>

    <!-- 操作按钮区域 -->
    <div class="content-actions">
      <div class="action-buttons">
        <el-tooltip
          :content="connectionState !== 'connected' ? t('等待连接') : ''"
          :disabled="connectionState === 'connected'"
          placement="top"
        >
          <el-button
            type="primary"
            :disabled="!websocketStore.websocket.item.message.trim() || connectionState !== 'connected'"
            @click="handleSendMessage"
            :icon="Position"
          >
            {{ t("发送消息") }}
          </el-button>
        </el-tooltip>

        <el-checkbox
          v-model="websocketStore.websocket.config.sendAndClear"
          @change="handleSendAndClearChange"
        >
          {{ t("发送并清空") }}
        </el-checkbox>

        <!-- 自动心跳功能 -->
        <div class="heartbeat-controls">
          <div class="heartbeat-checkbox">
            <el-checkbox
              v-model="websocketStore.websocket.config.autoHeartbeat"
              @change="handleAutoHeartbeatChange"
              :disabled="connectionState !== 'connected'"
            >
              {{ t("自动发送") }}
            </el-checkbox>

            <el-popover
              v-if="websocketStore.websocket.config.autoHeartbeat"
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
                      v-model="websocketStore.websocket.config.heartbeatInterval"
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
                    v-model="websocketStore.websocket.config.defaultHeartbeatContent"
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
import { ref, computed, watch, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useTranslation } from 'i18next-vue'
import { useApidocTas } from '@/store/apidoc/tabs'
import { useWebSocket } from '@/store/websocket/websocket'
import { ElMessage } from 'element-plus'
import {
  Position,
  Setting,
} from '@element-plus/icons-vue'
import SJsonEditor from '@/components/common/json-editor/g-json-editor.vue'
import type { MessageType } from '@src/types/websocket/websocket'
import { uuid } from '@/helper'


const { t } = useTranslation()
const apidocTabsStore = useApidocTas()
const websocketStore = useWebSocket()
const connectionState = computed(() => websocketStore.connectionState)
const connectionId = computed(() => websocketStore.connectionId)
// 获取当前选中的tab
const { currentSelectTab } = storeToRefs(apidocTabsStore)
const configPopoverVisible = ref(false)
let heartbeatTimer: NodeJS.Timeout | null = null
const editorConfig = computed(() => {
  switch (websocketStore.websocket.config.messageType) {
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


const handleSendMessage = async () => {
  if (!websocketStore.websocket.item.message.trim()) {
    ElMessage.warning(t('消息内容不能为空'))
    return
  }

  if (!connectionId.value) {
    ElMessage.error(t('WebSocket连接不存在'))
    return
  }

  if (connectionState.value !== 'connected') {
    ElMessage.error(t('WebSocket未连接'))
    return
  }

  try {
    const messageContent = websocketStore.websocket.item.message;
    const result = await window.electronAPI?.websocket.send(connectionId.value, messageContent)
    if (result?.success) {
      // 添加发送消息记录
      websocketStore.addMessage({
        type: 'send',
        data: {
          id: uuid(),
          content: messageContent,
          timestamp: Date.now(),
          contentType: websocketStore.websocket.config.messageType,
          size: new Blob([messageContent]).size
        }
      });

      if (websocketStore.websocket.config.sendAndClear) {
        websocketStore.changeWebSocketMessage('')
      }
    } else {
      ElMessage.error(t('消息发送失败') + ': ' + (result?.error || t('未知错误')))
      console.error('WebSocket消息发送失败:', result?.error)

      // 添加发送失败错误消息
      websocketStore.addMessage({
        type: 'error',
        data: {
          id: uuid(),
          error: result?.error || t('消息发送失败'),
          timestamp: Date.now()
        }
      });
    }
  } catch (error) {
    ElMessage.error(t('消息发送异常'))
    console.error('WebSocket消息发送异常:', error)

    // 添加发送异常错误消息
    websocketStore.addMessage({
      type: 'error',
      data: {
        id: uuid(),
        error: error instanceof Error ? error.message : t('消息发送异常'),
        timestamp: Date.now()
      }
    });
  }
}
const handleSendAndClearChange = (value: boolean | string | number) => {
  const boolValue = Boolean(value)
  websocketStore.changeWebSocketSendAndClear(boolValue)
}
const handleMessageTypeChange = (value: MessageType) => {
  websocketStore.changeWebSocketMessageType(value)
}
const handleAutoHeartbeatChange = (enabled: boolean | string | number) => {
  const boolEnabled = Boolean(enabled)
  websocketStore.changeWebSocketAutoHeartbeat(boolEnabled)

  if (boolEnabled && connectionState.value === 'connected') {
    startHeartbeat()
  } else {
    stopHeartbeat()
  }
}
const handleHeartbeatIntervalChange = (interval: number | undefined) => {
  if (interval !== undefined) {
    websocketStore.changeWebSocketHeartbeatInterval(interval)
    // 如果心跳正在运行，重新启动以应用新的间隔
    if (websocketStore.websocket.config.autoHeartbeat && connectionState.value === 'connected') {
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
    if (connectionState.value === 'connected' && connectionId.value) {
      try {
        const heartbeatContent = websocketStore.websocket.config.defaultHeartbeatContent || 'ping'
        const result = await window.electronAPI?.websocket.send(connectionId.value, heartbeatContent)
        if (result?.success) {
          // 添加心跳包发送记录
          websocketStore.addMessage({
            type: 'heartbeat',
            data: {
              id: uuid(),
              message: heartbeatContent,
              timestamp: Date.now()
            }
          });
        } else {
          console.error('心跳包发送失败:', result?.error)
          // 添加心跳包发送失败错误消息
          websocketStore.addMessage({
            type: 'error',
            data: {
              id: uuid(),
              error: result?.error || t('心跳包发送失败'),
              timestamp: Date.now()
            }
          });
        }
      } catch (error) {
        console.error('心跳包发送异常:', error)
        // 添加心跳包发送异常错误消息
        websocketStore.addMessage({
          type: 'error',
          data: {
            id: uuid(),
            error: error instanceof Error ? error.message : t('心跳包发送异常'),
            timestamp: Date.now()
          }
        });
      }
    }
  }, websocketStore.websocket.config.heartbeatInterval)
}
const stopHeartbeat = () => {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}

// 监听连接状态变化，管理心跳
watch(() => connectionState.value, (newState) => {
  if (newState === 'connected' && websocketStore.websocket.config.autoHeartbeat) {
    startHeartbeat()
  } else if (newState !== 'connected') {
    stopHeartbeat()
  }
})

// 监听当前选中tab变化，重新加载状态
watch(currentSelectTab, (newTab) => {
  if (newTab) {
    stopHeartbeat()
    if (connectionState.value === 'connected' && websocketStore.websocket.config.autoHeartbeat) {
      startHeartbeat()
    }
  }
})
onUnmounted(() => {
  stopHeartbeat()
})
</script>

<style lang="scss" scoped>
.message-content {
  // padding: 0 16px;
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
      margin-left: 8px;

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
