<template>
  <div class="message-content">
    <!-- 内容编辑器 -->
    <div class="content-wrapper">
      <!-- 编辑器 -->
      <div class="editor-wrap">
        <SJsonEditor ref="jsonEditorRef" manual-undo-redo :model-value="websocketStore.websocket.item.sendMessage" @update:model-value="handleMessageChange" :config="editorConfig" :auto-height="false" @undo="handleEditorUndo" @redo="handleEditorRedo" @ready="handleEditorReady" />
      </div>
      <!-- 操作按钮区域 -->
      <div class="content-actions">
        <el-button type="primary" size="small"
          @click="handleSendMessage" :icon="Position">
          {{ t("发送消息") }}
        </el-button>
        <!-- 模板选择器 -->
        <div v-if="quickOperations.includes('template')" class="template-selector">
          <el-select v-model="selectedTemplateId" :placeholder="t('选择模板')" size="small" clearable
            @change="handleSelectTemplate" class="template-select">
            <template #empty>
              <div class="empty-template">
                <div class="empty-text">{{ t('暂无模板数据') }}</div>
                <el-button link type="primary" size="small" @click="handleOpenCreateTemplateDialog">
                  {{ t('创建模板') }}
                </el-button>
              </div>
            </template>
            <el-option v-for="template in websocketStore.sendMessageTemplateList" :key="template.id"
              :label="template.name" :value="template.id">
              <div class="template-option">
                <span class="template-name">{{ template.name }}</span>
                <el-icon class="delete-icon" @click.stop="handleDeleteTemplate(template.id)" :title="t('删除')">
                  <Delete />
                </el-icon>
              </div>
            </el-option>
          </el-select>
        </div>
        <!-- 自动配置功能 -->
        <div v-if="quickOperations.includes('autoSend')" class="config-controls">
          <div class="config-checkbox">
            <el-checkbox v-model="websocketStore.websocket.config.autoSend" @change="handleAutoConfigChange">
              {{ t("自动发送") }}
            </el-checkbox>
          </div>
        </div>
        <el-popover v-model:visible="configPopoverVisible" placement="bottom" :width="320" trigger="click" transition="none">
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
                <el-input-number v-model="websocketStore.websocket.config.autoSendInterval" :min="100" :max="300000"
                  :step="1000" size="small" @change="handleConfigIntervalChange" style="width: 120px;" />
                <span class="interval-unit">{{ t("毫秒") }}</span>
              </div>
            </div>

            <div class="config-item">
              <label class="config-label">{{ t("消息内容") }}:</label>
              <el-input v-model="websocketStore.websocket.config.defaultAutoSendContent" type="textarea" :rows="3"
                :placeholder="t('请输入消息内容')" @input="handleDefaultConfigContentChange" class="config-content-input" />
            </div>

            <div class="config-item">
              <label class="config-label">{{ t("快捷操作") }}:</label>
              <div class="quick-operations">
                <el-checkbox :model-value="quickOperations.includes('autoSend')"
                  @change="handleQuickOperationChange('autoSend', $event)">
                  {{ t("自动发送") }}
                </el-checkbox>
                <el-checkbox :model-value="quickOperations.includes('template')"
                  @change="handleQuickOperationChange('template', $event)">
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

    <!-- 创建模板弹窗 -->
    <AddTemplateDialog v-model="createTemplateDialogVisible" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useApidocTas } from '@/store/apidoc/tabs'
import { useWebSocket } from '@/store/websocket/websocket'
import { useRedoUndo } from '@/store/redoUndo/redoUndo'
import {
  Position,
  Setting,
  Delete,
} from '@element-plus/icons-vue'
import SJsonEditor from '@/components/common/json-editor/g-json-editor.vue'
import AddTemplateDialog from './dialog/add/add.vue'
import type { MessageType } from '@src/types/websocket/websocket'
import { uuid, debounce } from '@/helper'
import { websocketResponseCache } from '@/cache/websocket/websocketResponse'
import { webSocketNodeCache } from '@/cache/websocket/websocketNodeCache'
import { ElMessageBox, ElMessage } from 'element-plus'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'


const { t } = useI18n()
const apidocTabsStore = useApidocTas()
const websocketStore = useWebSocket()
const redoUndoStore = useRedoUndo()
const { connectionState, connectionId } = storeToRefs(websocketStore)
// const { changeMessageEditorRef } = websocketStore
// 获取当前选中的tab
const { currentSelectTab } = storeToRefs(apidocTabsStore)

const configPopoverVisible = ref(false)
let configTimer: NodeJS.Timeout | null = null

// 编辑器引用
interface JsonEditorRef {
  format: () => void;
  focus: () => void;
  changeLanguage: (language: string) => void;
  updateEditorHeight: () => void;
  getCursorPosition: () => monaco.Position | null;
  setCursorPosition: (position: monaco.Position) => void;
}

const jsonEditorRef = ref<JsonEditorRef | null>(null)

// 防抖的消息内容记录函数
const debouncedRecordMessageOperation = debounce((oldValue: string, newValue: string) => {
  if (!currentSelectTab.value || oldValue === newValue) return;
  
  // 获取当前光标位置
  const cursorPosition = jsonEditorRef.value?.getCursorPosition() || undefined;
  
  redoUndoStore.recordOperation({
    nodeId: currentSelectTab.value._id,
    type: "sendMessageOperation",
    operationName: "修改消息内容",
    affectedModuleName: "messageContent",
    oldValue,
    newValue,
    cursorPosition,
    timestamp: Date.now()
  });
}, 300, { leading: true, trailing: true });

// 处理消息内容变化
const handleMessageChange = (newValue: string) => {
  const oldValue = websocketStore.websocket.item.sendMessage;
  console.log('handleMessageChange', newValue, oldValue);
  websocketStore.changeWebSocketMessage(newValue);
  debouncedRecordMessageOperation(oldValue, newValue);
};

// 设置编辑器引用
const handleEditorReady = () => {
  // 编辑器准备就绪
};

// 处理编辑器undo事件
const handleEditorUndo = () => {
  const nodeId = currentSelectTab.value?._id;
  if (nodeId) {
    const result = redoUndoStore.wsUndo(nodeId);
    if (result.success && result.operation?.type === 'sendMessageOperation') {
      const operation = result.operation as any;
      if (operation.cursorPosition) {
        const editor = jsonEditorRef.value as any;
        editor?.setCursorPosition(operation.cursorPosition);
      }
    }
  }
};

// 处理编辑器redo事件
const handleEditorRedo = () => {
  const nodeId = currentSelectTab.value?._id;
  if (nodeId) {
    const result = redoUndoStore.wsRedo(nodeId);
    if (result.success && result.operation?.type === 'sendMessageOperation') {
      const operation = result.operation as any;
      if (operation.cursorPosition) {
        const editor = jsonEditorRef.value as any;
        editor?.setCursorPosition(operation.cursorPosition);
      }
    }
  }
};
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
          size: new Blob([messageContent]).size,
          nodeId: currentSelectTab.value?._id || ''
        }
      };
      websocketStore.addMessage(sendMessage);
      const nodeId = currentSelectTab.value!._id;
      await websocketResponseCache.setSingleData(nodeId, sendMessage);

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
          timestamp: Date.now(),
          nodeId: currentSelectTab.value?._id || ''
        }
      };

      // 添加发送失败错误消息
      websocketStore.addMessage(errorMessage);

      // 缓存错误消息到IndexedDB
      const nodeId = currentSelectTab.value!._id;
      await websocketResponseCache.setSingleData(nodeId, errorMessage);
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
        timestamp: Date.now(),
        nodeId: currentSelectTab.value?._id || ''
      }
    };

    // 添加发送异常错误消息
    websocketStore.addMessage(exceptionMessage);

    // 缓存异常消息到IndexedDB
    const nodeId = currentSelectTab.value!._id;
    await websocketResponseCache.setSingleData(nodeId, exceptionMessage);
  }
}
const handleMessageTypeChange = (value: MessageType) => {
  websocketStore.changeWebSocketMessageType(value)
}
const handleAutoConfigChange = (enabled: boolean | string | number) => {
  const boolEnabled = Boolean(enabled)
  websocketStore.changeWebSocketAutoSend(boolEnabled)

  if (boolEnabled && connectionState.value === 'connected') {
    startAutoSend()
  } else {
    stopAutoSend()
  }
}
const handleConfigIntervalChange = (interval: number | undefined) => {
  if (interval !== undefined) {
    websocketStore.changeWebSocketAutoSendInterval(interval)
    // 如果自动发送正在运行，重新启动以应用新的间隔
    if (websocketStore.websocket.config.autoSend && connectionState.value === 'connected') {
      stopAutoSend()
      startAutoSend()
    }
  }
}
const handleDefaultConfigContentChange = (content: string) => {
  websocketStore.changeWebSocketDefaultAutoSendContent(content)
}
const startAutoSend = () => {
  if (configTimer) {
    clearInterval(configTimer)
  }

  configTimer = setInterval(async () => {
    if (connectionState.value === 'connected' && connectionId.value) {
      try {
        const autoSendContent = websocketStore.websocket.config.defaultAutoSendContent || 'ping'
        const result = await window.electronAPI?.websocket.send(connectionId.value, autoSendContent)
        if (result?.success) {
          // 创建自动发送记录
          const autoSendMessage = {
            type: 'autoSend' as const,
            data: {
              id: uuid(),
              message: autoSendContent,
              timestamp: Date.now(),
              nodeId: currentSelectTab.value?._id || ''
            }
          };

          // 添加自动发送记录
          websocketStore.addMessage(autoSendMessage);

          // 缓存自动发送消息到IndexedDB
          const nodeId = currentSelectTab.value!._id;
          await websocketResponseCache.setSingleData(nodeId, autoSendMessage);
        } else {
          console.error('自动发送失败:', result?.error)

          // 创建自动发送失败错误消息
          const errorMessage = {
            type: 'error' as const,
            data: {
              id: uuid(),
              error: result?.error || t('自动发送失败'),
              timestamp: Date.now(),
              nodeId: currentSelectTab.value?._id || ''
            }
          };

          // 添加自动发送失败错误消息
          websocketStore.addMessage(errorMessage);

          // 缓存错误消息到IndexedDB
          const nodeId = currentSelectTab.value!._id;
          await websocketResponseCache.setSingleData(nodeId, errorMessage);
        }
      } catch (error) {
        console.error('自动发送异常:', error)

        // 创建自动发送异常错误消息
        const exceptionMessage = {
          type: 'error' as const,
          data: {
            id: uuid(),
            error: error instanceof Error ? error.message : t('自动发送异常'),
            timestamp: Date.now(),
            nodeId: currentSelectTab.value?._id || ''
          }
        };

        // 添加自动发送异常错误消息
        websocketStore.addMessage(exceptionMessage);

        // 缓存异常消息到IndexedDB
        const nodeId = currentSelectTab.value!._id;
        await websocketResponseCache.setSingleData(nodeId, exceptionMessage);
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
// 监听连接状态变化，管理配置
watch(() => connectionState.value, (newState) => {
  if (newState === 'connected' && websocketStore.websocket.config.autoSend) {
    startAutoSend()
  } else if (newState !== 'connected') {
    stopAutoSend()
  }
})

// 监听当前选中tab变化，重新加载状态
watch(currentSelectTab, async (newTab) => {
  if (newTab) {
    stopAutoSend()
    if (connectionState.value === 'connected' && websocketStore.websocket.config.autoSend) {
      startAutoSend()
    }
  }
})

// 初始化快捷操作配置
watch(currentSelectTab, (tab) => {
  if (tab) {
    // 初始化快捷操作配置
    initQuickOperations()
  }
}, { immediate: true })

onUnmounted(() => {
  stopAutoSend()
})

</script>

<style lang="scss" scoped>
.message-content {
  height: 100%;

  .content-wrapper {
    position: relative;
    height: calc(100vh - 245px);
    border: 1px solid var(--gray-400);

    .message-type-selector {
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: var(--zIndex-dropdown);

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
      z-index: var(--zIndex-dropdown);
      background: var(--el-bg-color);
      gap: 8px;
      flex-wrap: wrap;

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
