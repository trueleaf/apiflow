<template>
  <div v-if="visible" class="ai-dialog" :style="dialogStyle">
    <div class="ai-dialog-header" @mousedown="handleDragStart">
      <span class="ai-dialog-title">{{ t('AI助手') }}</span>
      <div class="ai-dialog-header-actions" @mousedown.stop>
        <div class="ai-dialog-header-group">
          <button
            class="ai-dialog-action"
            type="button"
            @mousedown.stop
            @click="handleCreateConversation"
            :title="t('新增')"
            :aria-label="t('新增')"
          >
            <Plus :size="18" />
          </button>
          <button
            class="ai-dialog-action"
            type="button"
            @mousedown.stop
            @click="handleOpenHistory"
            :title="t('历史记录')"
            :aria-label="t('历史记录')"
          >
            <History :size="16" />
          </button>
          <button
            class="ai-dialog-action"
            type="button"
            @mousedown.stop
            @click="handleOpenAiSettings"
            :title="t('设置')"
            :aria-label="t('设置')"
          >
            <Settings :size="16" />
          </button>
        </div>
        <div class="ai-dialog-header-separator" aria-hidden="true"></div>
        <button class="ai-dialog-close" type="button" @mousedown.stop @click="handleClose" :title="t('关闭')" :aria-label="t('关闭')">
          <X :size="18" />
        </button>
      </div>
    </div>
    <div class="ai-dialog-body">
      <div class="ai-messages" ref="messagesRef">
        <div v-if="!isAiConfigValid()" class="ai-empty-state ai-empty-state-setup">
          <AlertTriangle class="ai-empty-icon" :size="48" />
          <p class="ai-empty-text mb-2">{{ t('请先前往AI设置配置apiKey与apiUrl') }}</p>
          <button class="ai-config-btn" type="button" @click="handleOpenAiSettings">
            <span>{{ t('配置ApiKey') }}</span>
            <ArrowRight :size="14" class="config-icon"/>
          </button>
        </div>
        <div v-else-if="agentStore.agentMessageList.length === 0" class="ai-empty-state">
          <Bot class="ai-empty-icon" :size="48" />
          <p class="ai-empty-text">{{ t('问我任何问题') }}</p>
        </div>
        <template v-else>
          <template v-for="message in agentStore.agentMessageList" :key="message.id">
            <AskMessageItem v-if="message.type === 'ask'" :message="message" />
            <LoadingMessageItem v-else-if="message.type === 'loading'" :message="message" />
            <ToolMessageItem v-else-if="message.type === 'tool'" :message="message" />
            <TextResponseMessageItem v-else-if="message.type === 'textResponse'" :message="message" />
          </template>
        </template>
      </div>
      <div class="ai-dialog-footer">
        <div class="ai-input-wrapper" ref="inputWrapperRef">
          <textarea
            v-model="inputMessage"
            class="ai-input"
            :placeholder="t('输入消息...')"
            @keydown="handleKeydown"
            @focus="handleInputFocus"
          ></textarea>
          <div class="ai-input-controls">
            <div class="ai-input-trigger-group">
              <button
                class="ai-input-trigger"
                type="button"
                @click="handleToggleModeMenu"
              >
                <span>{{ t(modeLabelMap[mode]) }}</span>
                <ChevronDown :size="14" />
              </button>
              <div v-if="isModeMenuVisible" class="ai-dropdown">
                <button
                  v-for="item in modeOptions"
                  :key="item"
                  type="button"
                  class="ai-dropdown-item"
                  @click="handleSelectMode(item)"
                >
                  <span class="ai-dropdown-icon">
                    <Check v-if="mode === item" :size="14" />
                  </span>
                  <span class="ai-dropdown-label">{{ t(modeLabelMap[item]) }}</span>
                </button>
              </div>
            </div>
            <div class="ai-input-trigger-group">
              <button
                class="ai-input-trigger"
                type="button"
                @click="handleToggleModelMenu"
              >
                <span>{{ modelDisplayName }}</span>
                <ChevronDown :size="14" />
              </button>
              <div v-if="isModelMenuVisible" class="ai-dropdown">
                <button
                  v-for="item in modelOptions"
                  :key="item"
                  type="button"
                  class="ai-dropdown-item"
                  @click="handleSelectModel(item)"
                >
                  <span class="ai-dropdown-icon">
                    <Check v-if="model === item" :size="14" />
                  </span>
                  <span class="ai-dropdown-label">{{ t(modelLabelMap[item]) }}</span>
                </button>
              </div>
            </div>
          </div>
          <div class="ai-input-toolbar">
            <button
              class="ai-send-btn"
              type="button"
              @click="handleSend"
              :title="t('发送')"
            >
              <Send :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>
    <div
      class="resize-bar-right"
      :class="{ active: isResizingWidth }"
      @mousedown="handleResizeWidthStart"
      @dblclick="handleResetWidth"
      :title="t('双击还原')"
    ></div>
    <div v-if="isResizingWidth" class="resize-indicator-width">
      {{ dialogWidth }}px
    </div>
    <div
      class="resize-bar-bottom"
      :class="{ active: isResizingHeight }"
      @mousedown="handleResizeHeightStart"
      @dblclick="handleResetHeight"
      :title="t('双击还原')"
    ></div>
    <div v-if="isResizingHeight" class="resize-indicator-height">
      {{ dialogHeight }}px
    </div>
    <div
      class="resize-corner"
      :class="{ active: isResizingCorner }"
      @mousedown="handleResizeCornerStart"
      @dblclick="handleResetCorner"
      :title="t('双击还原')"
    ></div>
    <div v-if="isResizingCorner" class="resize-indicator-corner">
      {{ dialogWidth }}px × {{ dialogHeight }}px
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { X, Bot, Send, ChevronDown, Check, AlertTriangle, ArrowRight, Plus, History, Settings } from 'lucide-vue-next'
import { nanoid } from 'nanoid/non-secure'
import type { AnchorRect } from '@src/types/common'
import type { DeepSeekRequestBody, DeepSeekMessage, AskMessage, TextResponseMessage, LoadingMessage } from '@src/types/ai'
import { IPC_EVENTS } from '@src/types/ipc'
import { config } from '@src/config/config'
import { userState } from '@/cache/userState/userStateCache'
import { aiCache } from '@/cache/ai/aiCache'
import { useAgentStore } from '@/store/agent/agentStore'
import AskMessageItem from './components/AskMessageItem.vue'
import LoadingMessageItem from './components/LoadingMessageItem.vue'
import ToolMessageItem from './components/ToolMessageItem.vue'
import TextResponseMessageItem from './components/TextResponseMessageItem.vue'
import './ai.css'

const { t } = useI18n()
const props = defineProps<{ anchorRect: AnchorRect | null }>()
const emit = defineEmits<{ (event: 'create'): void, (event: 'history'): void }>()
const visible = defineModel<boolean>('visible', { default: false })
const agentStore = useAgentStore()
const messagesRef = ref<HTMLElement | null>(null)
const inputMessage = ref('')
const modeOptions = ['agent', 'ask'] as const
type AiMode = typeof modeOptions[number]
const modeLabelMap: Record<AiMode, string> = {
  agent: 'Agent',
  ask: 'Ask'
}
const modelOptions = ['deepseek'] as const
type AiModel = typeof modelOptions[number]
const modelLabelMap: Record<AiModel, string> = {
  deepseek: 'DeepSeek'
}
const mode = ref<AiMode>('ask')
const model = ref<AiModel>('deepseek')
const position = ref<{ x: number | null, y: number | null }>({ x: null, y: null })
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const dialogWidth = ref(config.renderConfig.aiDialog.defaultWidth)
const dialogHeight = ref(config.renderConfig.aiDialog.defaultHeight)
const isResizingWidth = ref(false)
const isResizingHeight = ref(false)
const isResizingCorner = ref(false)
const initialMouseX = ref(0)
const initialMouseY = ref(0)
const initialWidth = ref(0)
const initialHeight = ref(0)
const inputWrapperRef = ref<HTMLElement | null>(null)
const isModeMenuVisible = ref(false)
const isModelMenuVisible = ref(false)
const isStreaming = ref(false)
const currentStreamRequestId = ref<string | null>(null)
const streamingMessageId = ref<string | null>(null)
const loadingMessageId = ref<string | null>(null)
const isFirstChunk = ref(false)
const router = useRouter()

const dialogStyle = computed(() => ({
  left: position.value.x !== null ? `${position.value.x}px` : 'auto',
  top: position.value.y !== null ? `${position.value.y}px` : '60px',
  right: position.value.x !== null ? 'auto' : '20px',
  width: `${dialogWidth.value}px`,
  height: `${dialogHeight.value}px`
}))
const modelDisplayName = computed(() => t(modelLabelMap[model.value]))

watch(visible, value => {
  if (!value) {
    isModeMenuVisible.value = false
    isModelMenuVisible.value = false
  }
})
watch(() => agentStore.agentMessageList.length, () => {
  scrollToBottom()
})

const buildDeepSeekRequestBody = (userMessage: string): DeepSeekRequestBody & { stream: true } => {
  const messages: DeepSeekMessage[] = []
  const recentMessages = agentStore.getLatestMessages(10)
  
  for (const msg of recentMessages) {
    if (msg.type === 'ask') {
      messages.push({
        role: 'user',
        content: msg.content
      })
    } else if (msg.type === 'textResponse') {
      messages.push({
        role: 'assistant',
        content: msg.content
      })
    }
  }
  
  messages.push({
    role: 'user',
    content: userMessage
  })
  
  return {
    model: 'deepseek-chat',
    messages,
    stream: true,
    max_tokens: 4096,
    temperature: 0.7
  }
}
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

const handleClose = () => {
  visible.value = false
}
const handleCreateConversation = () => {
  emit('create')
}
const handleOpenHistory = () => {
  emit('history')
}
const isAiConfigValid = () => {
  const configState = aiCache.getAiConfig()
  return configState.apiKey.trim() !== '' && configState.apiUrl.trim() !== ''
}
const handleDragStart = (event: MouseEvent) => {
  isDragging.value = true
  const dialog = (event.currentTarget as HTMLElement).parentElement
  if (!dialog) return

  const rect = dialog.getBoundingClientRect()
  dragOffset.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }

  document.addEventListener('mousemove', handleDragMove)
  document.addEventListener('mouseup', handleDragEnd)
}
const handleDragMove = (event: MouseEvent) => {
  if (!isDragging.value) return

  const newX = event.clientX - dragOffset.value.x
  const newY = event.clientY - dragOffset.value.y

  const maxX = window.innerWidth - dialogWidth.value
  const maxY = window.innerHeight - dialogHeight.value

  const clampedX = Math.max(0, Math.min(newX, maxX))
  const clampedY = Math.max(0, Math.min(newY, maxY))

  position.value = { x: clampedX, y: clampedY }
}
const handleDragEnd = () => {
  isDragging.value = false
  if (position.value.x !== null || position.value.y !== null) {
    userState.setAiDialogPosition({
      x: position.value.x ?? 0,
      y: position.value.y ?? 0
    })
  }
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
}
const handleToggleModeMenu = (event: MouseEvent) => {
  event.stopPropagation()
  isModeMenuVisible.value = !isModeMenuVisible.value
  if (isModeMenuVisible.value) {
    isModelMenuVisible.value = false
  }
}
const handleToggleModelMenu = (event: MouseEvent) => {
  event.stopPropagation()
  isModelMenuVisible.value = !isModelMenuVisible.value
  if (isModelMenuVisible.value) {
    isModeMenuVisible.value = false
  }
}
const handleSelectMode = (value: AiMode) => {
  mode.value = value
  userState.setAiDialogMode(value)
  isModeMenuVisible.value = false
}
const handleSelectModel = (value: AiModel) => {
  model.value = value
  userState.setAiDialogModel(value)
  isModelMenuVisible.value = false
}
const handleResizeWidthStart = (event: MouseEvent) => {
  event.stopPropagation()
  isResizingWidth.value = true
  initialMouseX.value = event.clientX
  initialWidth.value = dialogWidth.value

  document.addEventListener('mousemove', handleResizeWidthMove)
  document.addEventListener('mouseup', handleResizeWidthEnd)
}
const handleResizeWidthMove = (event: MouseEvent) => {
  if (!isResizingWidth.value) return

  const deltaX = event.clientX - initialMouseX.value
  let newWidth = initialWidth.value + deltaX

  newWidth = Math.max(
    config.renderConfig.aiDialog.minWidth,
    Math.min(newWidth, config.renderConfig.aiDialog.maxWidth)
  )

  dialogWidth.value = newWidth
}
const handleResizeWidthEnd = () => {
  isResizingWidth.value = false
  userState.setAiDialogWidth(dialogWidth.value)
  
  if (position.value.x !== null) {
    const maxX = window.innerWidth - dialogWidth.value
    if (position.value.x > maxX) {
      position.value = {
        x: Math.max(0, maxX),
        y: position.value.y ?? 0
      }
    }
  }
  
  document.removeEventListener('mousemove', handleResizeWidthMove)
  document.removeEventListener('mouseup', handleResizeWidthEnd)
}
const handleResetWidth = () => {
  dialogWidth.value = config.renderConfig.aiDialog.defaultWidth
  userState.setAiDialogWidth(dialogWidth.value)
}
const handleResizeHeightStart = (event: MouseEvent) => {
  event.stopPropagation()
  isResizingHeight.value = true
  initialMouseY.value = event.clientY
  initialHeight.value = dialogHeight.value

  document.addEventListener('mousemove', handleResizeHeightMove)
  document.addEventListener('mouseup', handleResizeHeightEnd)
}
const handleResizeHeightMove = (event: MouseEvent) => {
  if (!isResizingHeight.value) return

  const deltaY = event.clientY - initialMouseY.value
  let newHeight = initialHeight.value + deltaY

  newHeight = Math.max(
    config.renderConfig.aiDialog.minHeight,
    Math.min(newHeight, config.renderConfig.aiDialog.maxHeight)
  )

  dialogHeight.value = newHeight
}
const handleResizeHeightEnd = () => {
  isResizingHeight.value = false
  userState.setAiDialogHeight(dialogHeight.value)
  
  if (position.value.y !== null) {
    const maxY = window.innerHeight - dialogHeight.value
    if (position.value.y > maxY) {
      position.value = {
        x: position.value.x ?? 0,
        y: Math.max(0, maxY)
      }
    }
  }
  
  document.removeEventListener('mousemove', handleResizeHeightMove)
  document.removeEventListener('mouseup', handleResizeHeightEnd)
}
const handleResetHeight = () => {
  dialogHeight.value = config.renderConfig.aiDialog.defaultHeight
  userState.setAiDialogHeight(dialogHeight.value)
}
const handleResizeCornerStart = (event: MouseEvent) => {
  event.stopPropagation()
  isResizingCorner.value = true
  initialMouseX.value = event.clientX
  initialMouseY.value = event.clientY
  initialWidth.value = dialogWidth.value
  initialHeight.value = dialogHeight.value

  document.addEventListener('mousemove', handleResizeCornerMove)
  document.addEventListener('mouseup', handleResizeCornerEnd)
}
const handleResizeCornerMove = (event: MouseEvent) => {
  if (!isResizingCorner.value) return

  const deltaX = event.clientX - initialMouseX.value
  const deltaY = event.clientY - initialMouseY.value
  
  let newWidth = initialWidth.value + deltaX
  let newHeight = initialHeight.value + deltaY

  newWidth = Math.max(
    config.renderConfig.aiDialog.minWidth,
    Math.min(newWidth, config.renderConfig.aiDialog.maxWidth)
  )
  
  newHeight = Math.max(
    config.renderConfig.aiDialog.minHeight,
    Math.min(newHeight, config.renderConfig.aiDialog.maxHeight)
  )

  dialogWidth.value = newWidth
  dialogHeight.value = newHeight
}
const handleResizeCornerEnd = () => {
  isResizingCorner.value = false
  userState.setAiDialogWidth(dialogWidth.value)
  userState.setAiDialogHeight(dialogHeight.value)
  
  if (position.value.x !== null) {
    const maxX = window.innerWidth - dialogWidth.value
    if (position.value.x > maxX) {
      position.value = {
        x: Math.max(0, maxX),
        y: position.value.y ?? 0
      }
    }
  }
  
  if (position.value.y !== null) {
    const maxY = window.innerHeight - dialogHeight.value
    if (position.value.y > maxY) {
      position.value = {
        x: position.value.x ?? 0,
        y: Math.max(0, maxY)
      }
    }
  }
  
  document.removeEventListener('mousemove', handleResizeCornerMove)
  document.removeEventListener('mouseup', handleResizeCornerEnd)
}
const handleResetCorner = () => {
  dialogWidth.value = config.renderConfig.aiDialog.defaultWidth
  dialogHeight.value = config.renderConfig.aiDialog.defaultHeight
  userState.setAiDialogWidth(dialogWidth.value)
  userState.setAiDialogHeight(dialogHeight.value)
}
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}
const handleSend = async () => {
  if (!isAiConfigValid()) return
  const message = inputMessage.value.trim()
  if (!message) return
  if (isStreaming.value) return
  
  inputMessage.value = ''
  
  const timestamp = new Date().toISOString()
  const askMessageId = nanoid()
  const loadingMsgId = nanoid()
  const requestId = nanoid()
  
  const askMessage: AskMessage = {
    id: askMessageId,
    type: 'ask',
    content: message,
    timestamp,
    sessionId: agentStore.currentSessionId
  }
  
  const loadingMessage: LoadingMessage = {
    id: loadingMsgId,
    type: 'loading',
    content: '',
    timestamp,
    sessionId: agentStore.currentSessionId
  }
  
  await agentStore.addAgentMessage(askMessage)
  await agentStore.addAgentMessage(loadingMessage)
  
  isStreaming.value = true
  currentStreamRequestId.value = requestId
  loadingMessageId.value = loadingMsgId
  isFirstChunk.value = true
  streamingMessageId.value = null
  
  const requestBody = buildDeepSeekRequestBody(message)
  
  if (!window.electronAPI?.aiManager?.textChatWithStream) {
    if (loadingMessageId.value) {
      agentStore.deleteAgentMessageById(loadingMessageId.value)
      loadingMessageId.value = null
    }
    
    const timestamp = new Date().toISOString()
    const errorMessageId = nanoid()
    const errorMessage: TextResponseMessage = {
      id: errorMessageId,
      type: 'textResponse',
      content: '错误: AI功能不可用',
      timestamp,
      sessionId: agentStore.currentSessionId
    }
    
    agentStore.addAgentMessage(errorMessage)
    isStreaming.value = false
    currentStreamRequestId.value = null
    streamingMessageId.value = null
    isFirstChunk.value = false
    return
  }
  
  try {
    window.electronAPI.aiManager.textChatWithStream(
      { requestId, requestBody },
      (chunk: string) => {
        handleStreamData(requestId, chunk)
      },
      () => {
        handleStreamEnd(requestId)
      },
      (response) => {
        handleStreamError(requestId, response)
      }
    )
  } catch (error) {
    if (loadingMessageId.value) {
      agentStore.deleteAgentMessageById(loadingMessageId.value)
      loadingMessageId.value = null
    }
    
    const timestamp = new Date().toISOString()
    const errorMessageId = nanoid()
    const errorMessage: TextResponseMessage = {
      id: errorMessageId,
      type: 'textResponse',
      content: `错误: ${error instanceof Error ? error.message : '未知错误'}`,
      timestamp,
      sessionId: agentStore.currentSessionId
    }
    
    agentStore.addAgentMessage(errorMessage)
    isStreaming.value = false
    currentStreamRequestId.value = null
    streamingMessageId.value = null
    isFirstChunk.value = false
  }
}
const handleStreamData = (requestId: string, chunk: string) => {
  if (currentStreamRequestId.value !== requestId) return
  
  const lines = chunk.split('\n')
  for (const line of lines) {
    if (!line.trim() || !line.startsWith('data: ')) continue
    
    const data = line.substring(6).trim()
    if (data === '[DONE]') continue
    
    try {
      const parsed = JSON.parse(data)
      const content = parsed.choices?.[0]?.delta?.content
      
      if (content) {
        if (isFirstChunk.value && loadingMessageId.value) {
          agentStore.deleteAgentMessageById(loadingMessageId.value)
          
          const timestamp = new Date().toISOString()
          const responseMessageId = nanoid()
          const responseMessage: TextResponseMessage = {
            id: responseMessageId,
            type: 'textResponse',
            content,
            timestamp,
            sessionId: agentStore.currentSessionId
          }
          
          agentStore.addAgentMessage(responseMessage)
          streamingMessageId.value = responseMessageId
          loadingMessageId.value = null
          isFirstChunk.value = false
        } else if (streamingMessageId.value) {
          const message = agentStore.getMessageById(streamingMessageId.value)
          if (message && message.type === 'textResponse') {
            message.content += content
          }
        }
      }
    } catch (error) {
      // 忽略解析错误
    }
  }
}
const handleStreamEnd = (requestId: string) => {
  if (currentStreamRequestId.value !== requestId) return
  
  if (loadingMessageId.value) {
    agentStore.deleteAgentMessageById(loadingMessageId.value)
    loadingMessageId.value = null
  }
  
  isStreaming.value = false
  currentStreamRequestId.value = null
  streamingMessageId.value = null
  isFirstChunk.value = false
}
const handleStreamError = (requestId: string, response: { code: number; msg: string; data: string }) => {
  if (currentStreamRequestId.value !== requestId) return
  
  if (loadingMessageId.value) {
    agentStore.deleteAgentMessageById(loadingMessageId.value)
    loadingMessageId.value = null
  }
  
  const timestamp = new Date().toISOString()
  const errorMessageId = nanoid()
  const errorMessage: TextResponseMessage = {
    id: errorMessageId,
    type: 'textResponse',
    content: `错误: ${response.msg}`,
    timestamp,
    sessionId: agentStore.currentSessionId
  }
  
  agentStore.addAgentMessage(errorMessage)
  
  isStreaming.value = false
  currentStreamRequestId.value = null
  streamingMessageId.value = null
  isFirstChunk.value = false
}
const handleInputFocus = () => {
  isModeMenuVisible.value = false
  isModelMenuVisible.value = false
}
const handleClickOutside = (event: MouseEvent) => {
  if (!inputWrapperRef.value) return
  const target = event.target as Node
  if (inputWrapperRef.value.contains(target)) {
    return
  }
  isModeMenuVisible.value = false
  isModelMenuVisible.value = false
}
const handleOpenAiSettings = () => {
  userState.setActiveLocalDataMenu('ai-settings')
  window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.openSettingsTab)
  visible.value = false
  router.push('/settings')
}
const clampPositionToBounds = (pos: { x: number, y: number }, width: number, height: number): { x: number, y: number } => {
  const maxX = window.innerWidth - width
  const maxY = window.innerHeight - height
  
  return {
    x: Math.max(0, Math.min(pos.x, maxX)),
    y: Math.max(0, Math.min(pos.y, maxY))
  }
}
const initDialogState = () => {
  const cachedWidth = userState.getAiDialogWidth()
  const cachedHeight = userState.getAiDialogHeight()
  const cachedPosition = userState.getAiDialogPosition()
  const cachedMode = userState.getAiDialogMode()
  const cachedModel = userState.getAiDialogModel()
  
  if (cachedWidth !== null) {
    dialogWidth.value = cachedWidth
  }
  if (cachedHeight !== null) {
    dialogHeight.value = cachedHeight
  }
  if (cachedMode === 'agent' || cachedMode === 'ask') {
    mode.value = cachedMode
  } else {
    mode.value = 'ask'
  }
  if (cachedModel === 'deepseek') {
    model.value = cachedModel
  }
  
  if (cachedPosition !== null) {
    const clampedPosition = clampPositionToBounds(cachedPosition, dialogWidth.value, dialogHeight.value)
    position.value = clampedPosition
    if (clampedPosition.x !== cachedPosition.x || clampedPosition.y !== cachedPosition.y) {
      userState.setAiDialogPosition(clampedPosition)
    }
    return
  }

  if (props.anchorRect) {
    const anchorCenterX = props.anchorRect.x + props.anchorRect.width / 2 - dialogWidth.value / 2
    const anchorTop = config.mainConfig.topbarViewHeight + props.anchorRect.y + props.anchorRect.height + 12
    const anchoredPosition = clampPositionToBounds({ x: anchorCenterX, y: anchorTop }, dialogWidth.value, dialogHeight.value)
    position.value = anchoredPosition
    userState.setAiDialogPosition(anchoredPosition)
  }
}

onMounted(() => {
  initDialogState()
  document.addEventListener('click', handleClickOutside)
  
  const aiConfig = aiCache.getAiConfig()
  if (window.electronAPI?.aiManager?.updateConfig) {
    window.electronAPI.aiManager.updateConfig({
      apiKey: aiConfig.apiKey,
      apiUrl: aiConfig.apiUrl,
      timeout: aiConfig.timeout
    })
  }
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
  document.removeEventListener('mousemove', handleResizeWidthMove)
  document.removeEventListener('mouseup', handleResizeWidthEnd)
  document.removeEventListener('mousemove', handleResizeHeightMove)
  document.removeEventListener('mouseup', handleResizeHeightEnd)
  document.removeEventListener('mousemove', handleResizeCornerMove)
  document.removeEventListener('mouseup', handleResizeCornerEnd)
  document.removeEventListener('click', handleClickOutside)
})
</script>
