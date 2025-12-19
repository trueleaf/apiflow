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
      <AiHeader @close="handleClose" />
    </template>
    <div class="ai-dialog-body">
      <AiHistory v-if="agentViewStore.currentView === 'history'" />
      <AiAsk
        v-if="agentViewStore.currentView === 'chat'"
        @retry="handleRetry"
      />
      <AiAgent
        v-if="agentViewStore.currentView === 'agent'"
        @retry="handleRetry"
      />
      <AiConfig v-if="agentViewStore.currentView === 'config'" />
      <AiFooter
        v-if="agentViewStore.currentView === 'chat' || agentViewStore.currentView === 'agent'"
        ref="aiFooterRef"
        @send="handleSend"
        @stop="handleStop"
      />
    </div>
  </ClDrag>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { nanoid } from 'nanoid/non-secure'
import type { ErrorMessage } from '@src/types/ai'
import { config } from '@src/config/config'
import { appState } from '@/cache/appState/appStateCache'
import { useAgentViewStore } from '@/store/ai/agentView'
import { useLLMClientStore } from '@/store/ai/llmClientStore'
import { useAgentStore } from '@/store/ai/agentStore'
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
const agentStore = useAgentStore()
const aiFooterRef = ref<InstanceType<typeof AiFooter> | null>(null)
const { t } = useI18n()
const position = ref<{ x: number | null, y: number | null }>({ x: null, y: null })
const dialogWidth = ref(config.renderConfig.aiDialog.defaultWidth)
const dialogHeight = ref(config.renderConfig.aiDialog.defaultHeight)

watch(visible, value => {
  if (!value) {
    aiFooterRef.value?.closeMenus()
    agentViewStore.switchToChat()
  }
})
watch(() => agentViewStore.agentViewDialogVisible, (newValue) => {
  if (newValue) {
    nextTick(() => {
      const inputNode = document.querySelector<HTMLTextAreaElement>('.ai-input')
      inputNode?.focus()
    })
  }
})
// 关闭对话框
const handleClose = () => {
  visible.value = false
}
// 拖拽结束
const handleDragEnd = (pos: { x: number, y: number }) => {
  position.value = { x: pos.x, y: pos.y }
  appState.setAiDialogRect({
    width: dialogWidth.value,
    height: dialogHeight.value,
    x: pos.x,
    y: pos.y
  })
}
// 调整大小结束
const handleResizeEnd = (size: { width: number, height: number }) => {
  dialogWidth.value = size.width
  dialogHeight.value = size.height
  appState.setAiDialogRect({
    width: size.width,
    height: size.height,
    x: position.value.x,
    y: position.value.y
  })
}
// 重置宽度
const handleResetWidth = () => {
  dialogWidth.value = config.renderConfig.aiDialog.defaultWidth
  appState.setAiDialogRect({
    width: dialogWidth.value,
    height: dialogHeight.value,
    x: position.value.x,
    y: position.value.y
  })
}
// 重置高度
const handleResetHeight = () => {
  dialogHeight.value = config.renderConfig.aiDialog.defaultHeight
  appState.setAiDialogRect({
    width: dialogWidth.value,
    height: dialogHeight.value,
    x: position.value.x,
    y: position.value.y
  })
}
// 重置角落
const handleResetCorner = () => {
  dialogWidth.value = config.renderConfig.aiDialog.defaultWidth
  dialogHeight.value = config.renderConfig.aiDialog.defaultHeight
  appState.setAiDialogRect({
    width: dialogWidth.value,
    height: dialogHeight.value,
    x: position.value.x,
    y: position.value.y
  })
}
// 停止对话
const handleStop = async () => {
  if (agentViewStore.mode === 'agent') {
    agentStore.stopAgent()
    agentViewStore.setWorkingStatus('finish')
    return
  }
  await agentViewStore.stopCurrentConversation()
}
// 发送消息
const handleSend = async () => {
  if (!agentViewStore.isAiConfigValid) {
    ElMessage.warning(t('请先配置 AI API Key'))
    return
  }
  const message = agentViewStore.inputMessage.trim()
  if (!message) return
  agentViewStore.inputMessage = ''
  agentViewStore.lastAskPrompt = message
  // Agent 模式
  if (agentViewStore.mode === 'agent') {
    const askMessage = agentViewStore.createAskMessage(message, 'agent')
    await agentViewStore.addCurrentMessage(askMessage)
    agentViewStore.setWorkingStatus('working')
    const result = await agentStore.runAgent({ prompt: message })
    agentViewStore.setWorkingStatus('finish')
    if (result.code !== 0) {
      const errorMessage = agentViewStore.createErrorMessage(result.msg, message, 'agent')
      agentViewStore.addCurrentMessage(errorMessage)
    }
    return
  }
  // Ask 模式
  if (agentViewStore.isStreaming) return
  const askMessage = agentViewStore.createAskMessage(message, 'ask')
  const loadingMessage = agentViewStore.createLoadingMessage()
  const requestId = nanoid()
  await agentViewStore.addCurrentMessage(askMessage)
  await agentViewStore.addCurrentMessage(loadingMessage)
  agentViewStore.isStreaming = true
  agentViewStore.currentStreamRequestId = requestId
  agentViewStore.loadingMessageId = loadingMessage.id
  agentViewStore.isFirstChunk = true
  agentViewStore.streamingMessageId = null
  agentViewStore.setWorkingStatus('working')
  const requestBody = agentViewStore.buildOpenAIRequestBody(message)
  if (!llmClientStore.isAvailable()) {
    if (agentViewStore.loadingMessageId) {
      agentViewStore.deleteCurrentMessageById(agentViewStore.loadingMessageId)
      agentViewStore.loadingMessageId = null
    }
    const errorMessage = agentViewStore.createErrorMessage(t('AI功能不可用'), message, 'ask')
    agentViewStore.addCurrentMessage(errorMessage)
    agentViewStore.resetStreamState()
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
          agentViewStore.handleStreamData(requestId, chunkStr)
        },
        onEnd: () => {
          agentViewStore.handleStreamEnd(requestId)
        },
        onError: (err: Error | string) => {
          const errorMsg = err instanceof Error ? err.message : String(err)
          agentViewStore.handleStreamError(requestId, errorMsg)
        }
      }
    )
    agentViewStore.cancelCurrentStream = async () => {
      streamController?.abort()
    }
  } catch (error) {
    if (agentViewStore.loadingMessageId) {
      agentViewStore.deleteCurrentMessageById(agentViewStore.loadingMessageId)
      agentViewStore.loadingMessageId = null
    }
    const errorDetail = error instanceof Error ? error.message : t('未知错误')
    const errorMessage = agentViewStore.createErrorMessage(errorDetail, message, 'ask')
    agentViewStore.addCurrentMessage(errorMessage)
    agentViewStore.resetStreamState()
    agentViewStore.setWorkingStatus('finish')
  }
}
// 处理重试
const handleRetry = async (originalPrompt: string, retryMode: 'agent' | 'ask', messageId: string) => {
  agentViewStore.deleteCurrentMessageById(messageId)
  if (agentViewStore.mode !== retryMode) {
    agentViewStore.setMode(retryMode)
  }
  if (retryMode === 'agent') {
    agentViewStore.setWorkingStatus('working')
    const result = await agentStore.runAgent({ prompt: originalPrompt })
    agentViewStore.setWorkingStatus('finish')
    if (result.code !== 0 && result.code !== -2) {
      const errorMessage: ErrorMessage = {
        id: nanoid(),
        type: 'error',
        errorType: agentViewStore.detectErrorType(result.msg),
        content: result.msg,
        errorDetail: result.msg,
        originalPrompt,
        timestamp: new Date().toISOString(),
        sessionId: agentViewStore.currentSessionId,
        mode: 'agent',
        canBeContext: false
      }
      agentViewStore.addCurrentMessage(errorMessage)
    }
    return
  }
  agentViewStore.inputMessage = originalPrompt
  await nextTick()
  await handleSend()
}
// 限制位置在边界内
const clampPositionToBounds = (pos: { x: number, y: number }, width: number, height: number): { x: number, y: number } => {
  const maxX = window.innerWidth - width
  const maxY = window.innerHeight - height
  return {
    x: Math.max(0, Math.min(pos.x, maxX)),
    y: Math.max(0, Math.min(pos.y, maxY))
  }
}
// 初始化对话框状态
const initDialogState = () => {
  const cachedRect = appState.getAiDialogRect()
  if (cachedRect.width !== null) {
    dialogWidth.value = cachedRect.width
  }
  if (cachedRect.height !== null) {
    dialogHeight.value = cachedRect.height
  }
  agentViewStore.initMode()
  if (cachedRect.x !== null && cachedRect.y !== null) {
    const cachedPosition = { x: cachedRect.x, y: cachedRect.y }
    const clampedPosition = clampPositionToBounds(cachedPosition, dialogWidth.value, dialogHeight.value)
    position.value = clampedPosition
    if (clampedPosition.x !== cachedPosition.x || clampedPosition.y !== cachedPosition.y) {
      appState.setAiDialogRect({
        width: dialogWidth.value,
        height: dialogHeight.value,
        x: clampedPosition.x,
        y: clampedPosition.y
      })
    }
    return
  }
  if (agentViewStore.agentViewAnchorRect) {
    const anchorCenterX = agentViewStore.agentViewAnchorRect.x + agentViewStore.agentViewAnchorRect.width / 2 - dialogWidth.value / 2
    const anchorTop = config.mainConfig.topbarViewHeight + agentViewStore.agentViewAnchorRect.y + agentViewStore.agentViewAnchorRect.height + 12
    const anchoredPosition = clampPositionToBounds({ x: anchorCenterX, y: anchorTop }, dialogWidth.value, dialogHeight.value)
    position.value = anchoredPosition
    appState.setAiDialogRect({
      width: dialogWidth.value,
      height: dialogHeight.value,
      x: anchoredPosition.x,
      y: anchoredPosition.y
    })
  }
}

onMounted(() => {
  initDialogState()
  agentViewStore.loadSessionData()
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

