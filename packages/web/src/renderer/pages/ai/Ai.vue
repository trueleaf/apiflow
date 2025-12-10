<template>
  <ClDrag
    v-show="visible"
    class="ai-dialog"
    :width="dialogWidth"
    :height="dialogHeight"
    :min-width="config.renderConfig.aiDialog.minWidth"
    :max-width="config.renderConfig.aiDialog.maxWidth"
    :min-height="config.renderConfig.aiDialog.minHeight"
    :max-height="config.renderConfig.aiDialog.maxHeight"
    :default-width="config.renderConfig.aiDialog.defaultWidth"
    :default-height="config.renderConfig.aiDialog.defaultHeight"
    :position="position"
    @drag-end="handleDragEnd"
    @resize-end="handleResizeEnd"
    @reset-width="handleResetWidth"
    @reset-height="handleResetHeight"
    @reset-corner="handleResetCorner"
  >
    <template #header>
      <AiHeader
        @create-conversation="handleCreateConversation"
        @open-history="handleOpenHistory"
        @open-settings="handleOpenAiSettings"
        @close="handleClose"
      />
    </template>
    <div class="ai-dialog-body">
      <AiHistory
        v-if="currentView === 'history'"
        @back="handleBackToChat"
        @select="handleSelectSession"
      />
      <AiAsk
        v-if="currentView === 'chat'"
        :is-config-valid="isAiConfigValid()"
        @open-settings="handleOpenAiSettings"
        @retry="handleRetry"
      />
      <AiAgent
        v-if="currentView === 'agent'"
        :is-config-valid="isAiConfigValid()"
        @open-settings="handleOpenAiSettings"
        @retry="handleRetry"
      />
      <AiConfig
        v-if="currentView === 'config'"
        @back="handleBackFromConfig"
        @go-to-full-settings="handleGoToFullSettings"
      />
      <AiFooter
        v-if="currentView === 'chat' || currentView === 'agent'"
        ref="aiFooterRef"
        v-model:input-message="inputMessage"
        v-model:mode="mode"
        v-model:model="model"
        :is-working="agentViewStore.workingStatus === 'working'"
        @send="handleSend"
        @stop="stopCurrentConversation"
        @update:mode="handleModeChange"
        @create-conversation="handleCreateConversation"
      />
    </div>
  </ClDrag>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { nanoid } from 'nanoid/non-secure'
import type { ChatRequestBody, LLMessage } from '@src/types/ai/agent.type'
import type { AskMessage, TextResponseMessage, LoadingMessage, ErrorMessage } from '@src/types/ai'
import { IPC_EVENTS } from '@src/types/ipc'
import { config } from '@src/config/config'
import { appState } from '@/cache/appState/appStateCache'
import { llmProviderCache } from '@/cache/ai/llmProviderCache'
import { useAgentViewStore } from '@/store/ai/agentViewStore'
import { useLLMClientStore } from '@/store/ai/llmClientStore'
import { runAgent, stopAgent } from '@/store/ai/agentStore'
import AiHistory from './components/aiHistory/AiHistory.vue'
import ClDrag from '@/components/ui/cleanDesign/clDrag/ClDrag.vue'
import AiHeader from './components/aiHeader/AiHeader.vue'
import AiAsk from './components/aiAsk/AiAsk.vue'
import AiAgent from './components/aiAgent/AiAgent.vue'
import AiConfig from './components/aiConfig/AiConfig.vue'
import AiFooter from './components/aiFooter/AiFooter.vue'

const visible = defineModel<boolean>('visible', { default: false })
const agentViewStore = useAgentViewStore()
const llmClientStore = useLLMClientStore()
const aiFooterRef = ref<InstanceType<typeof AiFooter> | null>(null)
const { t } = useI18n()
const inputMessage = ref('')
const currentView = ref<'chat' | 'history' | 'agent' | 'config'>('chat')
const mode = ref<'agent' | 'ask'>('ask')
const model = ref<'deepseek'>('deepseek')
const position = ref<{ x: number | null, y: number | null }>({ x: null, y: null })
const dialogWidth = ref(config.renderConfig.aiDialog.defaultWidth)
const dialogHeight = ref(config.renderConfig.aiDialog.defaultHeight)
const isStreaming = ref(false)
const currentStreamRequestId = ref<string | null>(null)
const lastAskPrompt = ref('')
const streamingMessageId = ref<string | null>(null)
const loadingMessageId = ref<string | null>(null)
const isFirstChunk = ref(false)
const cancelCurrentStream = ref<(() => Promise<void>) | null>(null)
const router = useRouter()

// 根据错误信息判断错误类型
const detectErrorType = (errorMsg: string): 'network' | 'api' | 'unknown' => {
  const networkKeywords = ['fetch', 'network', 'ECONNREFUSED', 'timeout', 'ETIMEDOUT', 'ENOTFOUND', 'connection', 'socket', 'net::']
  const lowerError = errorMsg.toLowerCase()
  if (networkKeywords.some(keyword => lowerError.includes(keyword.toLowerCase()))) {
    return 'network'
  }
  if (lowerError.includes('api') || lowerError.includes('401') || lowerError.includes('403') || lowerError.includes('429')) {
    return 'api'
  }
  return 'unknown'
}

watch(visible, value => {
  if (!value) {
    aiFooterRef.value?.closeMenus()
    currentView.value = mode.value === 'agent' ? 'agent' : 'chat'
  }
})
watch(() => agentViewStore.agentViewDialogVisible, (newValue) => {
  if (newValue) {
    nextTick(() => {
      const inputNode = document.querySelector<HTMLTextAreaElement>('.ai-input');
      inputNode?.focus();
    });
  }
});

const buildOpenAIRequestBody = (userMessage: string): ChatRequestBody => {
  const messages: LLMessage[] = []
  const recentMessages = agentViewStore.getLatestMessages(10)

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
    messages,
    max_tokens: 4096,
    temperature: 0.7
  }
}
const stopCurrentConversation = async () => {
  if (mode.value === 'agent') {
    stopAgent()
    agentViewStore.setWorkingStatus('finish')
    return
  }
  if (!isStreaming.value) return
  if (cancelCurrentStream.value) {
    await cancelCurrentStream.value()
    cancelCurrentStream.value = null
  }
  if (loadingMessageId.value) {
    agentViewStore.deleteAgentViewMessageById(loadingMessageId.value)
    loadingMessageId.value = null
  }
  isStreaming.value = false
  currentStreamRequestId.value = null
  streamingMessageId.value = null
  isFirstChunk.value = false
  agentViewStore.setWorkingStatus('finish')
}
const handleClose = () => {
  visible.value = false
}
const handleCreateConversation = async () => {
  await stopCurrentConversation()
  if (agentViewStore.agentViewMessageList.length > 0) {
    agentViewStore.createNewSession()
  }
  currentView.value = mode.value === 'agent' ? 'agent' : 'chat'
}
const handleOpenHistory = () => {
  currentView.value = 'history'
}
const handleBackToChat = () => {
  const firstMessage = agentViewStore.agentViewMessageList[0]
  const sessionMode = firstMessage?.mode || mode.value
  mode.value = sessionMode
  currentView.value = sessionMode === 'agent' ? 'agent' : 'chat'
}
const handleSelectSession = async (sessionId: string, sessionMode: 'agent' | 'ask') => {
  await agentViewStore.loadMessagesForSession(sessionId)
  mode.value = sessionMode
  currentView.value = sessionMode === 'agent' ? 'agent' : 'chat'
}
const isAiConfigValid = () => {
  const provider = llmProviderCache.getLLMProvider()
  return !!(provider?.apiKey?.trim() && provider?.baseURL?.trim())
}
const handleDragEnd = (pos: { x: number, y: number }) => {
  position.value = { x: pos.x, y: pos.y }
  appState.setAiDialogPosition(pos)
}
const handleResizeEnd = (size: { width: number, height: number }) => {
  dialogWidth.value = size.width
  dialogHeight.value = size.height
  appState.setAiDialogWidth(size.width)
  appState.setAiDialogHeight(size.height)
}
const handleModeChange = (value: 'agent' | 'ask') => {
  appState.setAiDialogMode(value)
  currentView.value = value === 'agent' ? 'agent' : 'chat'
}
const handleResetWidth = () => {
  dialogWidth.value = config.renderConfig.aiDialog.defaultWidth
  appState.setAiDialogWidth(dialogWidth.value)
}
const handleResetHeight = () => {
  dialogHeight.value = config.renderConfig.aiDialog.defaultHeight
  appState.setAiDialogHeight(dialogHeight.value)
}
const handleResetCorner = () => {
  dialogWidth.value = config.renderConfig.aiDialog.defaultWidth
  dialogHeight.value = config.renderConfig.aiDialog.defaultHeight
  appState.setAiDialogWidth(dialogWidth.value)
  appState.setAiDialogHeight(dialogHeight.value)
}
const handleSend = async () => {
  if (!isAiConfigValid()) {
    ElMessage.warning(t('请先配置 AI API Key'))
    return
  }
  const message = inputMessage.value.trim()
  if (!message) return
  
  inputMessage.value = ''
  lastAskPrompt.value = message
  
  // Agent 模式
  if (mode.value === 'agent') {
    const timestamp = new Date().toISOString()
    const askMessageId = nanoid()
    const askMessage: AskMessage = {
      id: askMessageId,
      type: 'ask',
      content: message,
      timestamp,
      sessionId: agentViewStore.currentSessionId,
      mode: 'agent'
    }
    await agentViewStore.addAgentViewMessage(askMessage)
    agentViewStore.setWorkingStatus('working')
    const result = await runAgent({ prompt: message })
    agentViewStore.setWorkingStatus('finish')
    if (!result.success) {
      const errorMessageId = nanoid()
      const errorMessage: ErrorMessage = {
        id: errorMessageId,
        type: 'error',
        errorType: detectErrorType(result.error),
        content: result.error,
        errorDetail: result.error,
        originalPrompt: message,
        timestamp: new Date().toISOString(),
        sessionId: agentViewStore.currentSessionId,
        mode: 'agent'
      }
      agentViewStore.addAgentViewMessage(errorMessage)
    }
    return
  }

  // Ask 模式
  if (isStreaming.value) return
  
  const timestamp = new Date().toISOString()
  const askMessageId = nanoid()
  const loadingMsgId = nanoid()
  const requestId = nanoid()
  
  const askMessage: AskMessage = {
    id: askMessageId,
    type: 'ask',
    content: message,
    timestamp,
    sessionId: agentViewStore.currentSessionId,
    mode: 'ask'
  }
  
  const loadingMessage: LoadingMessage = {
    id: loadingMsgId,
    type: 'loading',
    content: '',
    timestamp,
    sessionId: agentViewStore.currentSessionId,
    mode: 'ask'
  }
  
  await agentViewStore.addAgentViewMessage(askMessage)
  await agentViewStore.addAgentViewMessage(loadingMessage)
  
  isStreaming.value = true
  currentStreamRequestId.value = requestId
  loadingMessageId.value = loadingMsgId
  isFirstChunk.value = true
  streamingMessageId.value = null
  agentViewStore.setWorkingStatus('working')
  
  const requestBody = buildOpenAIRequestBody(message)
  
  if (!llmClientStore.isAvailable()) {
    if (loadingMessageId.value) {
      agentViewStore.deleteAgentViewMessageById(loadingMessageId.value)
      loadingMessageId.value = null
    }
    
    const timestamp = new Date().toISOString()
    const errorMessageId = nanoid()
    const errorMessage: ErrorMessage = {
      id: errorMessageId,
      type: 'error',
      errorType: 'api',
      content: t('AI功能不可用'),
      originalPrompt: message,
      timestamp,
      sessionId: agentViewStore.currentSessionId,
      mode: 'ask'
    }
    
    agentViewStore.addAgentViewMessage(errorMessage)
    isStreaming.value = false
    currentStreamRequestId.value = null
    streamingMessageId.value = null
    isFirstChunk.value = false
    agentViewStore.setWorkingStatus('finish')
    return
  }
  
  try {
    const textDecoder = new TextDecoder('utf-8')
    const streamController = llmClientStore.chatStream(
      requestBody,
      {
        onData: (chunk: Uint8Array) => {
          const chunkStr = textDecoder.decode(chunk, { stream: true })
          handleStreamData(requestId, chunkStr)
        },
        onEnd: () => {
          handleStreamEnd(requestId)
        },
        onError: (err: Error | string) => {
          const errorMsg = err instanceof Error ? err.message : String(err)
          handleStreamError(requestId, errorMsg)
        }
      }
    )
    cancelCurrentStream.value = async () => {
      streamController?.abort()
    }
  } catch (error) {
    if (loadingMessageId.value) {
      agentViewStore.deleteAgentViewMessageById(loadingMessageId.value)
      loadingMessageId.value = null
    }
    
    const timestamp = new Date().toISOString()
    const errorMessageId = nanoid()
    const errorDetail = error instanceof Error ? error.message : t('未知错误')
    const errorMessage: ErrorMessage = {
      id: errorMessageId,
      type: 'error',
      errorType: detectErrorType(errorDetail),
      content: errorDetail,
      errorDetail,
      originalPrompt: message,
      timestamp,
      sessionId: agentViewStore.currentSessionId,
      mode: 'ask'
    }
    
    agentViewStore.addAgentViewMessage(errorMessage)
    isStreaming.value = false
    currentStreamRequestId.value = null
    streamingMessageId.value = null
    isFirstChunk.value = false
    agentViewStore.setWorkingStatus('finish')
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
          agentViewStore.deleteAgentViewMessageById(loadingMessageId.value)
          
          const timestamp = new Date().toISOString()
          const responseMessageId = nanoid()
          const responseMessage: TextResponseMessage = {
            id: responseMessageId,
            type: 'textResponse',
            content,
            timestamp,
            sessionId: agentViewStore.currentSessionId,
            mode: 'ask'
          }
          
          agentViewStore.addAgentViewMessage(responseMessage)
          streamingMessageId.value = responseMessageId
          loadingMessageId.value = null
          isFirstChunk.value = false
        } else if (streamingMessageId.value) {
          const message = agentViewStore.getMessageById(streamingMessageId.value)
          if (message && message.type === 'textResponse') {
            message.content += content
            agentViewStore.updateAgentViewMessage(message)
          }
        }
      }
    } catch {
      // 忽略解析错误
    }
  }
}
const handleStreamEnd = (requestId: string) => {
  if (currentStreamRequestId.value !== requestId) return
  
  if (loadingMessageId.value) {
    agentViewStore.deleteAgentViewMessageById(loadingMessageId.value)
    loadingMessageId.value = null
  }
  
  isStreaming.value = false
  currentStreamRequestId.value = null
  streamingMessageId.value = null
  isFirstChunk.value = false
  cancelCurrentStream.value = null
  agentViewStore.setWorkingStatus('finish')
}
const handleStreamError = (requestId: string, error: string) => {
  if (currentStreamRequestId.value !== requestId) return

  if (loadingMessageId.value) {
    agentViewStore.deleteAgentViewMessageById(loadingMessageId.value)
    loadingMessageId.value = null
  }

  const timestamp = new Date().toISOString()
  const errorMessageId = nanoid()
  const errorMessage: ErrorMessage = {
    id: errorMessageId,
    type: 'error',
    errorType: detectErrorType(error),
    content: error,
    errorDetail: error,
    originalPrompt: lastAskPrompt.value,
    timestamp,
    sessionId: agentViewStore.currentSessionId,
    mode: 'ask'
  }

  agentViewStore.addAgentViewMessage(errorMessage)

  isStreaming.value = false
  currentStreamRequestId.value = null
  streamingMessageId.value = null
  isFirstChunk.value = false
  cancelCurrentStream.value = null
  agentViewStore.setWorkingStatus('finish')
}
// 处理重试
const handleRetry = async (originalPrompt: string, retryMode: 'agent' | 'ask', messageId: string) => {
  // 删除错误消息
  agentViewStore.deleteAgentViewMessageById(messageId)
  // 设置输入框内容并触发发送
  inputMessage.value = originalPrompt
  // 确保模式正确
  if (mode.value !== retryMode) {
    mode.value = retryMode
    currentView.value = retryMode === 'agent' ? 'agent' : 'chat'
  }
  await nextTick()
  await handleSend()
}
const handleOpenAiSettings = () => {
  currentView.value = 'config'
}
const handleBackFromConfig = () => {
  currentView.value = 'chat'
}
const handleGoToFullSettings = () => {
  appState.setActiveLocalDataMenu('ai-settings')
  window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.openSettingsTab)
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
  const cachedWidth = appState.getAiDialogWidth()
  const cachedHeight = appState.getAiDialogHeight()
  const cachedPosition = appState.getAiDialogPosition()
  const cachedMode = appState.getAiDialogMode()
  const cachedModel = appState.getAiDialogModel()
  
  if (cachedWidth !== null) {
    dialogWidth.value = cachedWidth
  }
  if (cachedHeight !== null) {
    dialogHeight.value = cachedHeight
  }
  if (cachedMode === 'agent' || cachedMode === 'ask') {
    mode.value = cachedMode
    currentView.value = cachedMode === 'agent' ? 'agent' : 'chat'
  } else {
    mode.value = 'ask'
    currentView.value = 'chat'
  }
  if (cachedModel === 'deepseek') {
    model.value = cachedModel
  }
  
  if (cachedPosition !== null) {
    const clampedPosition = clampPositionToBounds(cachedPosition, dialogWidth.value, dialogHeight.value)
    position.value = clampedPosition
    if (clampedPosition.x !== cachedPosition.x || clampedPosition.y !== cachedPosition.y) {
      appState.setAiDialogPosition(clampedPosition)
    }
    return
  }

  if (agentViewStore.agentViewAnchorRect) {
    const anchorCenterX = agentViewStore.agentViewAnchorRect.x + agentViewStore.agentViewAnchorRect.width / 2 - dialogWidth.value / 2
    const anchorTop = config.mainConfig.topbarViewHeight + agentViewStore.agentViewAnchorRect.y + agentViewStore.agentViewAnchorRect.height + 12
    const anchoredPosition = clampPositionToBounds({ x: anchorCenterX, y: anchorTop }, dialogWidth.value, dialogHeight.value)
    position.value = anchoredPosition
    appState.setAiDialogPosition(anchoredPosition)
  }
}

onMounted(() => {
  initDialogState()
  agentViewStore.initStore()
  llmClientStore.initFromCache()
})

</script>

<style scoped>
.ai-dialog {
  background: var(--ai-dialog-bg);
  border: 1px solid var(--ai-dialog-border);
  border-radius: 5px;
  box-shadow: 0 16px 40px var(--ai-dialog-shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: var(--zIndex-ai-dialog);
  color: var(--ai-text-primary);
}
.ai-dialog-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--ai-dialog-bg);
}
</style>
