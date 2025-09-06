<template>
  <div class="message-content">
    <!-- 内容编辑器 -->
    <div class="content-wrapper">
      <!-- 编辑器 -->
      <div class="editor-wrap">
        <SJsonEditor v-model="websocketStore.websocket.item.sendMessage" :config="editorConfig" :auto-height="false" />
      </div>
      <!-- 操作按钮区域 -->
      <div class="content-actions">
        <div class="action-items">
          <el-tooltip v-if="!hideWaitingTip" placement="top" :disabled="connectionState === 'connected'">
            <template #content>
              <div class="ws-waiting-tip">
                <div>{{ t('等待连接') }}</div>
                <div class="no-more-tip-btn" @click.stop="handleHideWaitingTip">{{ t('不再提示') }}</div>
              </div>
            </template>
            <el-button type="primary" size="small"
              :disabled="!websocketStore.websocket.item.sendMessage.trim() || connectionState !== 'connected'"
              @click="handleSendMessage" :icon="Position">
              {{ t("发送消息") }}
            </el-button>
          </el-tooltip>
          <template v-else>
            <el-button type="primary" size="small"
              :disabled="!websocketStore.websocket.item.sendMessage.trim() || connectionState !== 'connected'"
              @click="handleSendMessage" :icon="Position">
              {{ t('发送消息') }}
            </el-button>
          </template>
          <!-- 模板选择器 -->
          <div v-if="quickOperations.includes('template')" class="template-selector">
            <el-select
              v-model="selectedTemplateId"
              :placeholder="t('选择模板')"
              size="small"
              clearable
              @change="handleSelectTemplate"
              class="template-select"
            >
              <template #empty>
                <div class="empty-template">
                  <div class="empty-text">{{ t('暂无模板数据') }}</div>
                  <el-button link type="primary" size="small" @click="handleOpenCreateTemplateDialog">
                    {{ t('创建模板') }}
                  </el-button>
                </div>
              </template>
              <el-option
                v-for="template in websocketStore.sendMessageTemplateList"
                :key="template.id"
                :label="template.name"
                :value="template.id"
              >
                <div class="template-option">
                  <span class="template-name">{{ template.name }}</span>
                  <el-icon
                    class="delete-icon"
                    @click.stop="handleDeleteTemplate(template.id)"
                    :title="t('删除')"
                  >
                    <Delete />
                  </el-icon>
                </div>
              </el-option>
            </el-select>
          </div>
          <!-- 自动配置功能 -->
          <div v-if="quickOperations.includes('autoSend')" class="config-controls">
            <div class="config-checkbox">
              <el-checkbox v-model="websocketStore.websocket.config.autoHeartbeat" @change="handleAutoConfigChange">
                {{ t("自动发送") }}
              </el-checkbox>
            </div>
          </div>
          <el-popover :visible="configPopoverVisible" placement="bottom" :width="320">
            <template #reference>
              <div @click="configPopoverVisible = !configPopoverVisible" class="config-button">
                <el-icon>
                  <Setting />
                </el-icon>
              </div>
            </template>

            <div class="config-popover">
              <div class="config-item">
                <label class="config-label">{{ t("发送间隔") }}:</label>
                <div class="config-input">
                  <el-input-number v-model="websocketStore.websocket.config.heartbeatInterval" :min="100"
                    :max="300000" :step="1000" size="small" @change="handleConfigIntervalChange"
                    style="width: 120px;" />
                  <span class="interval-unit">{{ t("毫秒") }}</span>
                </div>
              </div>

              <div class="config-item">
                <label class="config-label">{{ t("消息内容") }}:</label>
                <el-input v-model="websocketStore.websocket.config.defaultHeartbeatContent" type="textarea"
                  :rows="3" :placeholder="t('请输入消息内容')" @input="handleDefaultConfigContentChange"
                  class="config-content-input" />
              </div>

              <div class="config-item">
                <label class="config-label">{{ t("快捷操作") }}:</label>
                <div class="quick-operations">
                  <el-checkbox 
                    :model-value="quickOperations.includes('autoSend')"
                    @change="handleQuickOperationChange('autoSend', $event)"
                  >
                    {{ t("自动发送") }}
                  </el-checkbox>
                  <el-checkbox 
                    :model-value="quickOperations.includes('template')"
                    @change="handleQuickOperationChange('template', $event)"
                  >
                    {{ t("模板选择") }}
                  </el-checkbox>
                </div>
              </div>

              <div class="config-actions">
                <el-button size="small" @click="configPopoverVisible = false">
                  {{ t("关闭") }}
                </el-button>
              </div>
            </div>
          </el-popover>
          <!-- 数据类型选择器 -->
          <div class="message-type-selector">
            <el-select v-model="websocketStore.websocket.config.messageType" size="small"
              @change="handleMessageTypeChange" class="type-selector">
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

        </div>
      </div>
    </div>

    <!-- 创建模板弹窗 -->
    <AddTemplateDialog v-model="createTemplateDialogVisible" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useTranslation } from 'i18next-vue'
import { useApidocTas } from '@/store/apidoc/tabs'
import { useWebSocket } from '@/store/websocket/websocket'
import {
  Position,
  Setting,
  Delete,
} from '@element-plus/icons-vue'
import SJsonEditor from '@/components/common/json-editor/g-json-editor.vue'
import AddTemplateDialog from './dialog/add/add.vue'
import type { MessageType } from '@src/types/websocket/websocket'
import { uuid } from '@/helper'
import { websocketResponseCache } from '@/cache/websocket/websocketResponse'
import { webSocketNodeCache } from '@/cache/websocket/websocketNodeCache'
import { ElMessageBox, ElMessage } from 'element-plus'


const { t } = useTranslation()
const apidocTabsStore = useApidocTas()
const websocketStore = useWebSocket()
const connectionState = computed(() => websocketStore.connectionState)
const connectionId = computed(() => websocketStore.connectionId)
// 是否隐藏等待连接提示
const hideWaitingTip = ref(false)
// 获取当前选中的tab
const { currentSelectTab } = storeToRefs(apidocTabsStore)
const configPopoverVisible = ref(false)
let configTimer: NodeJS.Timeout | null = null
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

// 模板相关变量
const selectedTemplateId = ref<string>('')
const createTemplateDialogVisible = ref(false)

// 快捷操作配置
const quickOperations = ref<('autoSend' | 'template')[]>([])

// 初始化快捷操作配置
const initQuickOperations = () => {
  const tab = currentSelectTab.value
  if (tab) {
    const config = webSocketNodeCache.getWebsocketConfig(tab.projectId)
    quickOperations.value = config?.quickOperations || ['autoSend', 'template']
  }
}

// 处理快捷操作变化
const handleQuickOperationChange = (operation: 'autoSend' | 'template', enabled: boolean | string | number) => {
  const boolEnabled = Boolean(enabled)
  const tab = currentSelectTab.value
  if (!tab) return

  if (boolEnabled) {
    if (!quickOperations.value.includes(operation)) {
      quickOperations.value.push(operation)
    }
  } else {
    const index = quickOperations.value.indexOf(operation)
    if (index > -1) {
      quickOperations.value.splice(index, 1)
    }
  }

  // 保存到缓存
  webSocketNodeCache.setWebsocketConfig(tab.projectId, {
    quickOperations: quickOperations.value
  })
}

// 模板选择处理
const handleSelectTemplate = (templateId: string) => {
  if (!templateId) {
    selectedTemplateId.value = ''
    return
  }

  const template = websocketStore.getMessageTemplateById(templateId)
  if (template) {
    // 填充消息内容和类型
    websocketStore.changeWebSocketMessage(template.sendMessage)
    websocketStore.changeWebSocketMessageType(template.messageType)
    selectedTemplateId.value = templateId
  }
}

// 删除模板处理
const handleDeleteTemplate = async (templateId: string) => {
  try {
    await ElMessageBox.confirm(
      t('确定要删除此消息模板吗'),
      t('提示'),
      {
        confirmButtonText: t('确定'),
        cancelButtonText: t('取消'),
        type: 'warning'
      }
    )

    const success = websocketStore.deleteMessageTemplate(templateId)
    if (success) {
      ElMessage.success(t('消息模板删除成功'))
      // 如果删除的是当前选中的模板，清空选择
      if (selectedTemplateId.value === templateId) {
        selectedTemplateId.value = ''
      }
    } else {
      ElMessage.error(t('模板删除失败'))
    }
  } catch (error) {
    // 用户取消删除
    console.log('用户取消删除模板')
  }
}

// 打开创建模板弹窗
const handleOpenCreateTemplateDialog = () => {
  createTemplateDialogVisible.value = true
}

const handleSendMessage = async () => {
  try {
    const messageContent = websocketStore.websocket.item.sendMessage;
    const result = await window.electronAPI?.websocket.send(connectionId.value, messageContent)
    if (result?.success) {
      const sendMessage = {
        type: 'send' as const,
        data: {
          id: uuid(),
          content: messageContent,
          timestamp: Date.now(),
          contentType: websocketStore.websocket.config.messageType,
          size: new Blob([messageContent]).size
        }
      };
      websocketStore.addMessage(sendMessage);
      const nodeId = currentSelectTab.value?._id;
      if (nodeId) {
        await websocketResponseCache.setSingleData(nodeId, sendMessage);
      }

      // 发送成功不再清空输入框
    } else {
      ElMessage.error(t('消息发送失败') + ': ' + (result?.error || t('未知错误')))
      console.error('WebSocket消息发送失败:', result?.error)

      // 创建错误消息记录
      const errorMessage = {
        type: 'error' as const,
        data: {
          id: uuid(),
          error: result?.error || t('消息发送失败'),
          timestamp: Date.now()
        }
      };

      // 添加发送失败错误消息
      websocketStore.addMessage(errorMessage);

      // 缓存错误消息到IndexedDB
      const nodeId = currentSelectTab.value?._id;
      if (nodeId) {
        await websocketResponseCache.setSingleData(nodeId, errorMessage);
      }
    }
  } catch (error) {
    ElMessage.error(t('消息发送异常'))
    console.error('WebSocket消息发送异常:', error)

    // 创建异常消息记录
    const exceptionMessage = {
      type: 'error' as const,
      data: {
        id: uuid(),
        error: error instanceof Error ? error.message : t('消息发送异常'),
        timestamp: Date.now()
      }
    };

    // 添加发送异常错误消息
    websocketStore.addMessage(exceptionMessage);

    // 缓存异常消息到IndexedDB
    const nodeId = currentSelectTab.value?._id;
    if (nodeId) {
      await websocketResponseCache.setSingleData(nodeId, exceptionMessage);
    }
  }
}
const handleMessageTypeChange = (value: MessageType) => {
  websocketStore.changeWebSocketMessageType(value)
}
const handleAutoConfigChange = (enabled: boolean | string | number) => {
  const boolEnabled = Boolean(enabled)
  websocketStore.changeWebSocketAutoHeartbeat(boolEnabled)

  if (boolEnabled && connectionState.value === 'connected') {
    startHeartbeat()
  } else {
    stopHeartbeat()
  }
}
const handleConfigIntervalChange = (interval: number | undefined) => {
  if (interval !== undefined) {
    websocketStore.changeWebSocketHeartbeatInterval(interval)
    // 如果心跳正在运行，重新启动以应用新的间隔
    if (websocketStore.websocket.config.autoHeartbeat && connectionState.value === 'connected') {
      stopHeartbeat()
      startHeartbeat()
    }
  }
}
const handleDefaultConfigContentChange = (content: string) => {
  websocketStore.changeWebSocketDefaultHeartbeatContent(content)
}
const startHeartbeat = () => {
  if (configTimer) {
    clearInterval(configTimer)
  }

  configTimer = setInterval(async () => {
    if (connectionState.value === 'connected' && connectionId.value) {
      try {
        const heartbeatContent = websocketStore.websocket.config.defaultHeartbeatContent || 'ping'
        const result = await window.electronAPI?.websocket.send(connectionId.value, heartbeatContent)
        if (result?.success) {
          // 创建心跳包发送记录
          const heartbeatMessage = {
            type: 'heartbeat' as const,
            data: {
              id: uuid(),
              message: heartbeatContent,
              timestamp: Date.now()
            }
          };

          // 添加心跳包发送记录
          websocketStore.addMessage(heartbeatMessage);

          // 缓存心跳包消息到IndexedDB
          const nodeId = currentSelectTab.value?._id;
          if (nodeId) {
            await websocketResponseCache.setSingleData(nodeId, heartbeatMessage);
          }
        } else {
          console.error('心跳包发送失败:', result?.error)

          // 创建心跳包发送失败错误消息
          const errorMessage = {
            type: 'error' as const,
            data: {
              id: uuid(),
              error: result?.error || t('心跳包发送失败'),
              timestamp: Date.now()
            }
          };

          // 添加心跳包发送失败错误消息
          websocketStore.addMessage(errorMessage);

          // 缓存错误消息到IndexedDB
          const nodeId = currentSelectTab.value?._id;
          if (nodeId) {
            await websocketResponseCache.setSingleData(nodeId, errorMessage);
          }
        }
      } catch (error) {
        console.error('心跳包发送异常:', error)

        // 创建心跳包发送异常错误消息
        const exceptionMessage = {
          type: 'error' as const,
          data: {
            id: uuid(),
            error: error instanceof Error ? error.message : t('心跳包发送异常'),
            timestamp: Date.now()
          }
        };

        // 添加心跳包发送异常错误消息
        websocketStore.addMessage(exceptionMessage);

        // 缓存异常消息到IndexedDB
        const nodeId = currentSelectTab.value?._id;
        if (nodeId) {
          await websocketResponseCache.setSingleData(nodeId, exceptionMessage);
        }
      }
    }
  }, websocketStore.websocket.config.heartbeatInterval)
}
const stopHeartbeat = () => {
  if (configTimer) {
    clearInterval(configTimer)
    configTimer = null
  }
}
// 监听连接状态变化，管理配置
watch(() => connectionState.value, (newState) => {
  if (newState === 'connected' && websocketStore.websocket.config.autoHeartbeat) {
    startHeartbeat()
  } else if (newState !== 'connected') {
    stopHeartbeat()
  }
})

// 监听当前选中tab变化，重新加载状态
watch(currentSelectTab, async (newTab) => {
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

// 初始化隐藏提示状态
watch(currentSelectTab, (tab) => {
  if (tab) {
    const cfg = webSocketNodeCache.getWebsocketConfig(tab.projectId)
    hideWaitingTip.value = cfg?.connectionWaitingTip === true
    // 初始化快捷操作配置
    initQuickOperations()
  }
}, { immediate: true })

// 点击不再提示
const handleHideWaitingTip = () => {
  const tab = currentSelectTab.value
  if (!tab) return
  webSocketNodeCache.setWebsocketConfig(tab.projectId, { connectionWaitingTip: true })
  hideWaitingTip.value = true
}
</script>

<style lang="scss" scoped>
.message-content {
  height: 100%;

  .content-wrapper {
    position: relative;
    height: calc(100vh - 210px);
    border: 1px solid var(--gray-400);

    .message-type-selector {
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: var(--z-index-dropdown);

      .type-selector {
        width: 120px;
      }
    }

    .editor-wrap {
      height: calc(100% - 40px);
    }

    .content-actions {
      width: 100%;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      z-index: var(--z-index-dropdown);
      background: var(--el-bg-color);

      .action-items {
        display: flex;
        gap: 8px;
        align-items: center;
        flex-wrap: wrap;
      }

      .action-options {
        display: flex;
        align-items: center;
      }

      .template-selector {

        .template-select {
          width: 140px;
        }

        .empty-template {
          padding: 12px;
          text-align: center;

          .empty-text {
            color: var(--el-text-color-regular);
            margin-bottom: 8px;
            font-size: 12px;
          }
        }

        .template-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;

          .template-name {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .delete-icon {
            margin-left: 8px;
            color: var(--el-text-color-regular);
            cursor: pointer;
            transition: color 0.2s;

            &:hover {
              color: var(--el-color-danger);
            }
          }
        }
      }

      .config-controls {
        display: flex;
        flex-direction: column;
        .config-checkbox {
          display: flex;
          align-items: center;
        }
        .config-settings {
          display: flex;
          align-items: center;
          margin-left: 24px;

          .interval-unit {
            font-size: 12px;
            color: var(--el-text-color-regular);
          }
        }
      }
      .config-button {
        padding: 5px;
        cursor: pointer;
        transition: background-color 0.2s;

        &:hover {
          background-color: var(--el-fill-color-light);
        }
      }
    }
  }
}

.config-popover {
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

    .config-content-input {
      width: 100%;
    }

    .quick-operations {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .el-checkbox {
        margin: 0;
      }
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

.ws-waiting-tip {
  display: flex;
  align-items: center;

  .no-more-tip-btn {
    color: var(--gray-400);
    font-size: 12px;
    cursor: pointer;
    margin-left: 10px;
    margin-top: 5px;

    &:hover {
      color: var(--gray-200)
    }
  }
}
</style>
