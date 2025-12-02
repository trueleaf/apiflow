<template>
  <div class="message-content">
    <!-- 顶部操作栏 -->
    <div class="top-actions">
      <div class="left-actions"></div>
      <div class="right-actions">
        <!-- 自动发送配置 -->
        <div v-if="quickOperations.includes('autoSend')" class="config-controls">
          <el-checkbox v-model="websocketStore.websocket.config.autoSend" @change="handleAutoConfigChange">
            {{ t("自动发送") }}
          </el-checkbox>
        </div>
        <!-- 添加消息块按钮 -->
        <div class="add-block-button" :title="t('添加消息块')" @click="handleAddMessageBlock">
          <el-icon><Plus /></el-icon>
        </div>
        <el-popover v-model:visible="configPopoverVisible" placement="bottom" :width="400" trigger="click" transition="none" @show="handleConfigPopoverShow">
          <template #reference>
            <div class="config-button">
              <el-icon>
                <Setting />
              </el-icon>
            </div>
          </template>
          <div class="config-popover">
            <div class="config-item">
              <label class="config-label">{{ t("发送间隔") }}:</label>
              <div class="config-input">
                <el-input-number v-model="tempAutoSendInterval" :min="100" :max="300000"
                  :step="1000" size="small" style="width: 120px;" />
                <span class="interval-unit">{{ t("毫秒") }}</span>
              </div>
            </div>
            <div class="config-item">
              <label class="config-label">{{ t("消息类型") }}:</label>
              <el-select v-model="tempAutoSendMessageType" size="small" style="width: 100%;">
                <el-option value="text" :label="t('文本')" />
                <el-option value="json" label="JSON" />
                <el-option value="xml" label="XML" />
                <el-option value="html" label="HTML" />
              </el-select>
            </div>
            <div class="config-item">
              <label class="config-label">{{ t("消息内容") }}:</label>
              <div class="config-content-editor">
                <SJsonEditor
                  v-model="tempAutoSendContent"
                  :config="{ language: getLanguageByType(tempAutoSendMessageType) }"
                  :auto-height="false"
                  style="height: 100px;"
                />
              </div>
            </div>
            <div class="config-item">
              <label class="config-label">{{ t("快捷操作") }}:</label>
              <div class="quick-operations">
                <el-checkbox :model-value="tempQuickOperations.includes('autoSend')"
                  @change="handleTempQuickOperationChange('autoSend', $event)">
                  {{ t("自动发送") }}
                </el-checkbox>
              </div>
            </div>
            <div class="config-actions">
              <el-button size="small" type="primary" @click="handleSaveConfig">
                {{ t("保存") }}
              </el-button>
              <el-button size="small" @click="configPopoverVisible = false">
                {{ t("关闭") }}
              </el-button>
            </div>
          </div>
        </el-popover>
      </div>
    </div>

    <!-- 消息块列表 -->
    <div class="message-blocks-container">
      <draggable
        v-model="messageBlocks"
        item-key="id"
        handle=".drag-handle"
        @end="handleDragEnd"
        class="message-blocks-list"
      >
        <template #item="{ element, index }">
          <div class="message-block">
            <!-- 消息块头部 -->
            <div class="block-header">
              <div class="left-controls">
                <span class="collapse-icon" @click="handleToggleCollapse(element.id)">
                  <ChevronRight v-if="collapsedBlocks[element.id]" :size="16" />
                  <ChevronDown v-else :size="16" />
                </span>
                <el-icon class="drag-handle">
                  <Rank />
                </el-icon>
                <el-input
                  v-model="element.name"
                  :placeholder="t('消息块') + ' ' + (index + 1)"
                  size="small"
                  class="block-name-input"
                  @change="handleBlockNameChange(element.id, element.name)"
                />
              </div>
              <div class="right-controls">
                <el-select
                  v-model="element.messageType"
                  size="small"
                  class="type-selector"
                  @change="handleBlockTypeChange(element.id, element.messageType)"
                >
                  <el-option value="text" :label="t('文本')" />
                  <el-option value="json" label="JSON" />
                  <el-option value="xml" label="XML" />
                  <el-option value="html" label="HTML" />
                  <el-option value="binary-base64" :label="t('二进制(Base64)')" />
                  <el-option value="binary-hex" :label="t('二进制(Hex)')" />
                </el-select>
                <el-button
                  type="primary"
                  size="small"
                  :icon="Position"
                  @click="handleSendBlock(element)"
                >
                  {{ t("发送") }}
                </el-button>
                <el-button
                  v-if="messageBlocks.length > 1"
                  type="danger"
                  size="small"
                  :icon="Delete"
                  @click="handleDeleteBlock(element.id)"
                />
              </div>
            </div>
            <!-- 消息块编辑器 -->
            <div v-show="!collapsedBlocks[element.id]" class="block-editor">
              <SJsonEditor
                :model-value="element.content"
                :config="{ language: getLanguageByType(element.messageType) }"
                :auto-height="false"
                @update:model-value="handleBlockContentChange(element.id, $event)"
              />
              <!-- 格式化按钮 -->
              <div v-if="element.messageType === 'json'" class="format-op">
                <span class="btn" @click="handleFormatBlock(index)">{{ t("格式化") }}</span>
              </div>
            </div>
          </div>
        </template>
      </draggable>

      <!-- 空状态 -->
      <div v-if="messageBlocks.length === 0" class="empty-state">
        <el-empty :description="t('暂无消息块')">
          <el-button type="primary" size="small" @click="handleAddMessageBlock">
            {{ t("添加消息块") }}
          </el-button>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useApidocTas } from '@/store/httpNode/httpTabsStore'
import { useWebSocket } from '@/store/websocket/websocketStore'
import {
  Plus,
  Position,
  Setting,
  Delete,
  Rank,
} from '@element-plus/icons-vue'
import { ChevronDown, ChevronRight } from 'lucide-vue-next'
import SJsonEditor from '@/components/common/jsonEditor/ClJsonEditor.vue'
import draggable from 'vuedraggable'
import type { WebsocketMessageType, WebsocketMessageBlock } from '@src/types/websocketNode'
import { nanoid } from 'nanoid/non-secure'
import { websocketResponseCache } from '@/cache/websocketNode/websocketResponseCache'
import { webSocketNodeCache } from '@/cache/websocketNode/websocketNodeCache'
import { message, getCompiledTemplate } from '@/helper'
import { useVariable } from '@/store/apidocProject/variablesStore'
import { appState } from '@/cache/appState/appStateCache'

const { t } = useI18n()
const apidocTabsStore = useApidocTas()
const websocketStore = useWebSocket()
const { connectionState, connectionId } = storeToRefs(websocketStore)
const { currentSelectTab } = storeToRefs(apidocTabsStore)

const configPopoverVisible = ref(false)
let configTimer: NodeJS.Timeout | null = null

// 消息块列表
const messageBlocks = computed({
  get: () => websocketStore.websocket.item.messageBlocks,
  set: (value) => {
    websocketStore.updateMessageBlocksOrder(value)
  }
})

// 快捷操作配置
const quickOperations = ref<'autoSend'[]>([])

// 消息块折叠状态
const collapsedBlocks = ref<Record<string, boolean>>({})

// 弹窗临时配置状态
const tempAutoSendInterval = ref(1000)
const tempAutoSendContent = ref('')
const tempAutoSendMessageType = ref<WebsocketMessageType>('json')
const tempQuickOperations = ref<'autoSend'[]>([])

// 获取语言类型
const getLanguageByType = (type: WebsocketMessageType): string => {
  switch (type) {
    case 'json':
      return 'json'
    case 'xml':
      return 'xml'
    case 'html':
      return 'html'
    case 'text':
    default:
      return 'plaintext'
  }
}

// 初始化快捷操作配置
const initQuickOperations = () => {
  const tab = currentSelectTab.value
  if (tab) {
    const config = webSocketNodeCache.getWebsocketConfig(tab.projectId)
    quickOperations.value = (config?.quickOperations || []) as 'autoSend'[]
  }
}

// 初始化折叠状态
const initCollapseState = () => {
  const nodeId = currentSelectTab.value?._id
  if (!nodeId) return
  const states: Record<string, boolean> = {}
  messageBlocks.value.forEach(block => {
    states[block.id] = appState.getWsMessageBlockCollapseState(nodeId, block.id)
  })
  collapsedBlocks.value = states
}

// 切换折叠状态
const handleToggleCollapse = (blockId: string) => {
  const nodeId = currentSelectTab.value?._id
  if (!nodeId) return
  const newState = !collapsedBlocks.value[blockId]
  collapsedBlocks.value[blockId] = newState
  appState.setWsMessageBlockCollapseState(nodeId, blockId, newState)
}

// 弹窗打开时初始化临时变量
const handleConfigPopoverShow = () => {
  tempAutoSendInterval.value = websocketStore.websocket.config.autoSendInterval
  tempAutoSendContent.value = websocketStore.websocket.config.autoSendContent
  tempAutoSendMessageType.value = websocketStore.websocket.config.autoSendMessageType
  tempQuickOperations.value = [...quickOperations.value]
}

// 处理临时快捷操作变化
const handleTempQuickOperationChange = (operation: 'autoSend', enabled: boolean | string | number) => {
  const boolEnabled = Boolean(enabled)
  if (boolEnabled) {
    if (!tempQuickOperations.value.includes(operation)) {
      tempQuickOperations.value.push(operation)
    }
  } else {
    const index = tempQuickOperations.value.indexOf(operation)
    if (index > -1) {
      tempQuickOperations.value.splice(index, 1)
    }
  }
}

// 保存配置
const handleSaveConfig = async () => {
  const tab = currentSelectTab.value
  if (!tab) return

  websocketStore.changeWebSocketAutoSendInterval(tempAutoSendInterval.value)
  websocketStore.changeWebSocketAutoSendContent(tempAutoSendContent.value)
  websocketStore.changeWebSocketAutoSendMessageType(tempAutoSendMessageType.value)

  quickOperations.value = [...tempQuickOperations.value]
  webSocketNodeCache.setWebsocketConfig(tab.projectId, {
    quickOperations: quickOperations.value
  })

  if (websocketStore.websocket.config.autoSend && connectionState.value === 'connected') {
    stopAutoSend()
    startAutoSend()
  }

  configPopoverVisible.value = false
  message.success(t('配置保存成功'))
}

// 添加消息块
const handleAddMessageBlock = () => {
  websocketStore.addMessageBlock({
    name: '',
    content: '',
    messageType: 'json',
  })
}

// 删除消息块
const handleDeleteBlock = (id: string) => {
  websocketStore.deleteMessageBlockById(id)
}

// 处理消息块名称变化
const handleBlockNameChange = (id: string, name: string) => {
  websocketStore.updateMessageBlockById(id, { name })
}

// 处理消息块类型变化
const handleBlockTypeChange = (id: string, messageType: WebsocketMessageType) => {
  websocketStore.updateMessageBlockById(id, { messageType })
}

// 处理消息块内容变化
const handleBlockContentChange = (id: string, content: string) => {
  websocketStore.updateMessageBlockById(id, { content })
}

// 处理拖拽结束
const handleDragEnd = () => {
  // 拖拽结束后，消息块顺序已通过 computed setter 更新
}

// 格式化消息块
const handleFormatBlock = (index: number) => {
  const block = messageBlocks.value[index]
  if (block && block.messageType === 'json') {
    try {
      const formatted = JSON.stringify(JSON.parse(block.content), null, 2)
      websocketStore.updateMessageBlockById(block.id, { content: formatted })
    } catch {
      message.error(t('JSON格式错误'))
    }
  }
}

// 发送单个消息块
const handleSendBlock = async (block: WebsocketMessageBlock) => {
  try {
    let messageContent = block.content
    // 变量替换
    try {
      const { variables } = useVariable()
      messageContent = await getCompiledTemplate(messageContent, variables)
    } catch (error) {
      console.warn('变量替换失败，使用原始内容', error)
    }

    const result = await window.electronAPI?.websocket.send(connectionId.value, messageContent)
    if (result?.code === 0) {
      const sendMessage = {
        type: 'send' as const,
        data: {
          id: nanoid(),
          content: messageContent,
          timestamp: Date.now(),
          contentType: block.messageType,
          size: new Blob([messageContent]).size,
          nodeId: currentSelectTab.value?._id || ''
        }
      }
      websocketStore.addMessage(sendMessage)
      const nodeId = currentSelectTab.value!._id
      await websocketResponseCache.setResponseByNodeId(nodeId, sendMessage)
    } else {
      console.error('WebSocket消息发送失败:', result?.msg)
      const errorMessage = {
        type: 'error' as const,
        data: {
          id: nanoid(),
          error: result?.msg || t('消息发送失败'),
          timestamp: Date.now(),
          nodeId: currentSelectTab.value?._id || ''
        }
      }
      websocketStore.addMessage(errorMessage)
      const nodeId = currentSelectTab.value!._id
      await websocketResponseCache.setResponseByNodeId(nodeId, errorMessage)
    }
  } catch (error) {
    message.error(t('消息发送异常'))
    console.error('WebSocket消息发送异常:', error)
    const exceptionMessage = {
      type: 'error' as const,
      data: {
        id: nanoid(),
        error: error instanceof Error ? error.message : t('消息发送异常'),
        timestamp: Date.now(),
        nodeId: currentSelectTab.value?._id || ''
      }
    }
    websocketStore.addMessage(exceptionMessage)
    const nodeId = currentSelectTab.value!._id
    await websocketResponseCache.setResponseByNodeId(nodeId, exceptionMessage)
  }
}

// 自动发送相关
const handleAutoConfigChange = (enabled: boolean | string | number) => {
  const boolEnabled = Boolean(enabled)
  websocketStore.changeWebSocketAutoSend(boolEnabled)

  if (boolEnabled && connectionState.value === 'connected') {
    startAutoSend()
  } else {
    stopAutoSend()
  }
}

const startAutoSend = () => {
  if (configTimer) {
    clearInterval(configTimer)
  }

  configTimer = setInterval(async () => {
    if (connectionState.value === 'connected' && connectionId.value) {
      try {
        let autoSendContent = websocketStore.websocket.config.autoSendContent || 'ping'
        try {
          const { variables } = useVariable()
          autoSendContent = await getCompiledTemplate(autoSendContent, variables)
        } catch (error) {
          console.warn('自动发送变量替换失败，使用原始内容', error)
        }

        const result = await window.electronAPI?.websocket.send(connectionId.value, autoSendContent)
        if (result?.code === 0) {
          const autoSendMessage = {
            type: 'autoSend' as const,
            data: {
              id: nanoid(),
              message: autoSendContent,
              timestamp: Date.now(),
              nodeId: currentSelectTab.value?._id || ''
            }
          }
          websocketStore.addMessage(autoSendMessage)
          const nodeId = currentSelectTab.value!._id
          await websocketResponseCache.setResponseByNodeId(nodeId, autoSendMessage)
        } else {
          console.error(t('自动发送失败'), result?.msg)
          const errorMessage = {
            type: 'error' as const,
            data: {
              id: nanoid(),
              error: result?.msg || t('自动发送失败'),
              timestamp: Date.now(),
              nodeId: currentSelectTab.value?._id || ''
            }
          }
          websocketStore.addMessage(errorMessage)
          const nodeId = currentSelectTab.value!._id
          await websocketResponseCache.setResponseByNodeId(nodeId, errorMessage)
        }
      } catch (error) {
        console.error(t('自动发送异常'), error)
        const exceptionMessage = {
          type: 'error' as const,
          data: {
            id: nanoid(),
            error: error instanceof Error ? error.message : t('自动发送异常'),
            timestamp: Date.now(),
            nodeId: currentSelectTab.value?._id || ''
          }
        }
        websocketStore.addMessage(exceptionMessage)
        const nodeId = currentSelectTab.value!._id
        await websocketResponseCache.setResponseByNodeId(nodeId, exceptionMessage)
      }
    }
  }, websocketStore.websocket.config.autoSendInterval)
}

const stopAutoSend = () => {
  if (configTimer) {
    clearInterval(configTimer)
    configTimer = null
  }
}

// 监听连接状态变化
watch(() => connectionState.value, (newState) => {
  if (newState === 'connected' && websocketStore.websocket.config.autoSend) {
    startAutoSend()
  } else if (newState !== 'connected') {
    stopAutoSend()
  }
})

// 监听当前选中tab变化
watch(currentSelectTab, (newTab) => {
  if (newTab) {
    stopAutoSend()
    if (connectionState.value === 'connected' && websocketStore.websocket.config.autoSend) {
      startAutoSend()
    }
  }
})

// 初始化快捷操作配置和折叠状态
watch(currentSelectTab, (tab) => {
  if (tab) {
    initQuickOperations()
    initCollapseState()
  }
}, { immediate: true })

onUnmounted(() => {
  stopAutoSend()
})
</script>

<style lang="scss" scoped>
.message-content {
  height: 100%;
  display: flex;
  flex-direction: column;

  .top-actions {
    height: 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: var(--box-shadow-sm);
    position: relative;
    z-index: 1;
    .right-actions {
      display: flex;
      align-items: center;
      gap: 8px;

      .config-controls {
        display: flex;
        align-items: center;
      }

      .add-block-button {
        padding: 5px;
        cursor: pointer;
        transition: background-color 0.2s;

        &:hover {
          background-color: var(--el-fill-color-light);
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

  .message-blocks-container {
    height: calc(100vh - 280px);
    overflow-y: auto;
    padding: 12px 0;

    .message-blocks-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .message-block {
      border: 1px solid var(--gray-400);
      border-radius: 4px;
      overflow: hidden;

      .block-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: var(--el-fill-color-light);
        .left-controls {
          display: flex;
          align-items: center;
          gap: 8px;

          .collapse-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: var(--el-text-color-secondary);
            transition: color 0.2s;

            &:hover {
              color: var(--el-text-color-primary);
            }
          }

          .drag-handle {
            cursor: grab;
            color: var(--el-text-color-secondary);

            &:active {
              cursor: grabbing;
            }
          }

          .block-name-input {
            width: 150px;
          }
        }

        .right-controls {
          display: flex;
          align-items: center;
          gap: 8px;

          .type-selector {
            width: 120px;
          }
        }
      }

      .block-editor {
        position: relative;
        height: 150px;

        .format-op {
          position: absolute;
          right: 8px;
          top: 8px;
          z-index: var(--zIndex-dropdown);

          .btn {
            color: var(--theme-color);
            cursor: pointer;
            font-size: 12px;
          }
        }
      }
    }

    .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
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

    .config-content-editor {
      border: 1px solid var(--el-border-color);
      border-radius: 4px;
      overflow: hidden;
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
</style>
