<template>
  <div class="message-item message-agent-execution">
    <div class="message-avatar">
      <Bot :size="20" />
    </div>
    <div class="message-content">
      <div class="agent-execution-container">
        <div class="agent-execution-header" @click="toggleExpand">
          <div class="agent-header-left">
            <component :is="statusIcon" :size="16" class="agent-status-icon" :class="statusClass" />
            <span class="agent-title">{{ t('Agent执行') }}</span>
            <span class="agent-tool-count">{{ message.toolCalls.length }} {{ t('个工具调用') }}</span>
          </div>
          <div class="agent-header-right">
            <ChevronDown :size="16" class="agent-expand-icon" :class="{ 'is-expanded': isExpanded }" />
          </div>
        </div>
        <div v-show="isExpanded" class="agent-execution-body">
          <div class="agent-timeline">
            <div v-for="(toolCall, index) in message.toolCalls" :key="toolCall.id" class="tool-call-item" :class="{ 'is-last': index === message.toolCalls.length - 1 }">
              <div class="tool-call-timeline">
                <div class="timeline-dot" :class="`status-${toolCall.status}`" />
                <div v-if="index !== message.toolCalls.length - 1" class="timeline-line" />
              </div>
              <div class="tool-call-content">
                <div class="tool-call-header" @click="toggleToolCallExpand(toolCall.id)">
                  <div class="tool-header-left">
                    <component :is="getToolStatusIcon(toolCall.status)" :size="14" class="tool-status-icon" :class="`status-${toolCall.status}`" />
                    <span class="tool-name">{{ toolCall.name }}</span>
                    <span v-if="getTokenUsage(toolCall)" class="tool-token">{{ getTokenUsage(toolCall) }} {{ t('tokens') }}</span>
                  </div>
                  <div class="tool-header-right">
                    <ChevronRight :size="14" class="tool-expand-icon" :class="{ 'is-expanded': expandedToolCalls.has(toolCall.id) }" />
                  </div>
                </div>
                <div v-if="toolCall.status === 'waiting-confirm'" class="tool-confirm-actions">
                  <button class="confirm-btn confirm-yes">
                    <Check :size="14" />
                    <span>{{ t('确认执行') }}</span>
                  </button>
                  <button class="confirm-btn confirm-no">
                    <X :size="14" />
                    <span>{{ t('取消') }}</span>
                  </button>
                </div>
                <div v-show="expandedToolCalls.has(toolCall.id)" class="tool-call-details">
                  <div v-if="Object.keys(toolCall.arguments).length > 0" class="tool-section">
                    <div class="section-label">{{ t('参数') }}</div>
                    <pre class="section-content"><code>{{ JSON.stringify(toolCall.arguments, null, 2) }}</code></pre>
                  </div>
                  <div v-if="toolCall.result" class="tool-section">
                    <div class="section-label">{{ t('结果') }}</div>
                    <pre class="section-content" :class="{ 'is-error': toolCall.result.code !== 0 }"><code>{{ JSON.stringify(toolCall.result.data, null, 2) }}</code></pre>
                  </div>
                  <div v-if="toolCall.error" class="tool-section">
                    <div class="section-label">{{ t('错误') }}</div>
                    <pre class="section-content is-error"><code>{{ toolCall.error }}</code></pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="message.thinkingContent && message.toolCalls.length > 0" class="thinking-section">
        <div class="agent-thinking-item">
          <div class="thinking-header" @click="toggleThinkingExpand">
            <div class="thinking-header-left">
              <Brain :size="14" class="thinking-icon" />
              <span class="thinking-label">{{ t('思考过程') }}</span>
            </div>
            <ChevronDown :size="14" class="thinking-expand-icon" :class="{ 'is-expanded': isThinkingExpanded }" />
          </div>
          <div v-show="isThinkingExpanded" class="thinking-content thinking-markdown">
            <VueMarkdownRender :source="displayedThinkingContent" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Bot, ChevronDown, ChevronRight, Loader2, CheckCircle2, XCircle, Clock, AlertCircle, Check, X, Brain, StopCircle } from 'lucide-vue-next'
import VueMarkdownRender from 'vue-markdown-render'
import type { AgentExecutionMessage, AgentToolCallStatus } from '@src/types/ai'

const props = defineProps<{
  message: AgentExecutionMessage
}>()
const { t } = useI18n()
const isExpanded = ref(true)
const expandedToolCalls = ref(new Set<string>())
const isThinkingExpanded = ref(true)
const displayedThinkingContent = ref('')
let typewriterTimer: ReturnType<typeof setTimeout> | null = null
// 打字效果：逐字显示思考内容，仅在流式生成时启用
watch(() => props.message.thinkingContent, (newContent) => {
  if (typewriterTimer) {
    clearTimeout(typewriterTimer)
    typewriterTimer = null
  }
  if (!newContent) {
    displayedThinkingContent.value = ''
    return
  }
  // 如果不是流式生成中（历史消息），直接显示完整内容
  if (props.message.isStreaming === false) {
    displayedThinkingContent.value = newContent
    return
  }
  const currentDisplayed = displayedThinkingContent.value
  if (newContent.startsWith(currentDisplayed)) {
    let index = currentDisplayed.length
    const typeNextChar = () => {
      if (index < newContent.length) {
        displayedThinkingContent.value = newContent.slice(0, index + 1)
        index++
        typewriterTimer = setTimeout(typeNextChar, 20)
      }
    }
    typeNextChar()
  } else {
    displayedThinkingContent.value = ''
    let index = 0
    const typeNextChar = () => {
      if (index < newContent.length) {
        displayedThinkingContent.value = newContent.slice(0, index + 1)
        index++
        typewriterTimer = setTimeout(typeNextChar, 20)
      }
    }
    typeNextChar()
  }
}, { immediate: true })
// 当流式状态变为false时，如果有思考内容，默认折叠思考过程
watch(() => props.message.isStreaming, (isStreaming) => {
  if (isStreaming === false && props.message.thinkingContent) {
    isThinkingExpanded.value = false
  }
})
onUnmounted(() => {
  if (typewriterTimer) {
    clearTimeout(typewriterTimer)
  }
})
const statusIcon = computed(() => {
  const icons = {
    pending: Clock,
    running: Loader2,
    success: CheckCircle2,
    error: XCircle,
    aborted: StopCircle
  }
  return icons[props.message.status]
})
const statusClass = computed(() => `status-${props.message.status}`)
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}
const toggleThinkingExpand = () => {
  isThinkingExpanded.value = !isThinkingExpanded.value
}
const toggleToolCallExpand = (toolCallId: string) => {
  if (expandedToolCalls.value.has(toolCallId)) {
    expandedToolCalls.value.delete(toolCallId)
  } else {
    expandedToolCalls.value.add(toolCallId)
  }
}
const getToolStatusIcon = (status: AgentToolCallStatus) => {
  const icons = {
    pending: Clock,
    running: Loader2,
    success: CheckCircle2,
    error: XCircle,
    'waiting-confirm': AlertCircle,
    cancelled: XCircle
  }
  return icons[status]
}
const getTokenUsage = (toolCall: { tokenUsage?: { total_tokens: number } }) => {
  const totalTokens = toolCall.tokenUsage?.total_tokens
  if (!totalTokens) return null
  if (totalTokens > 1000) {
    return `${(totalTokens / 1000).toFixed(1)}k`
  }
  return totalTokens
}
</script>

<style scoped>
.message-item {
  display: flex;
  gap: 8px;
  animation: messageSlideIn 0.3s ease-out;
}
@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.message-agent-execution {
  justify-content: flex-start;
}
.message-agent-execution .message-content {
  width: 85%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--ai-avatar-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--ai-text-secondary);
}
.thinking-section {
  margin-top: 4px;
}
.agent-execution-container {
  background: var(--ai-bubble-ai-bg);
  border-radius: 12px;
  border: 1px solid var(--ai-tool-border);
  overflow: hidden;
}
.agent-execution-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s ease;
}
.agent-execution-header:hover {
  background: var(--ai-action-hover-bg);
}
.agent-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.agent-status-icon {
  flex-shrink: 0;
}
.agent-status-icon.status-pending {
  color: var(--ai-text-secondary);
}
.agent-status-icon.status-running {
  color: var(--theme-color);
  animation: spin 1s linear infinite;
}
.agent-status-icon.status-success {
  color: #10b981;
}
.agent-status-icon.status-error {
  color: #ef4444;
}
.agent-status-icon.status-aborted {
  color: #f59e0b;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.agent-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--ai-bubble-ai-text);
}
.agent-tool-count {
  font-size: 12px;
  color: var(--ai-text-secondary);
}
.agent-header-right {
  display: flex;
  align-items: center;
}
.agent-expand-icon {
  color: var(--ai-text-secondary);
  transition: transform 0.2s ease;
}
.agent-expand-icon.is-expanded {
  transform: rotate(180deg);
}
.agent-execution-body {
  border-top: 1px solid var(--ai-tool-border);
}
.agent-timeline {
  padding: 12px 14px;
}
.tool-call-item {
  display: flex;
  gap: 12px;
}
.tool-call-timeline {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 12px;
  flex-shrink: 0;
}
.timeline-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 5px;
}
.timeline-dot.status-pending {
  background: var(--ai-text-secondary);
}
.timeline-dot.status-running {
  background: var(--theme-color);
  animation: pulse 1.5s ease-in-out infinite;
}
.timeline-dot.status-success {
  background: #10b981;
}
.timeline-dot.status-error,
.timeline-dot.status-cancelled {
  background: #ef4444;
}
.timeline-dot.status-waiting-confirm {
  background: #f59e0b;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
}
.timeline-line {
  flex: 1;
  width: 2px;
  background: var(--ai-tool-border);
  margin-top: 4px;
  min-height: 20px;
}
.tool-call-content {
  flex: 1;
  min-width: 0;
  padding-bottom: 12px;
}
.tool-call-item.is-last .tool-call-content {
  padding-bottom: 0;
}
.tool-call-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 4px 0;
}
.tool-call-header:hover .tool-name {
  color: var(--theme-color);
}
.tool-header-left {
  display: flex;
  align-items: center;
  gap: 6px;
}
.tool-status-icon {
  flex-shrink: 0;
}
.tool-status-icon.status-pending {
  color: var(--ai-text-secondary);
}
.tool-status-icon.status-running {
  color: var(--theme-color);
  animation: spin 1s linear infinite;
}
.tool-status-icon.status-success {
  color: #10b981;
}
.tool-status-icon.status-error,
.tool-status-icon.status-cancelled {
  color: #ef4444;
}
.tool-status-icon.status-waiting-confirm {
  color: #f59e0b;
}
.tool-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--ai-bubble-ai-text);
  transition: color 0.2s ease;
}
.tool-token {
  font-size: 11px;
  color: var(--ai-text-secondary);
  background: var(--ai-action-hover-bg);
  padding: 1px 6px;
  border-radius: 10px;
}
.tool-header-right {
  display: flex;
  align-items: center;
}
.tool-expand-icon {
  color: var(--ai-text-secondary);
  transition: transform 0.2s ease;
}
.tool-expand-icon.is-expanded {
  transform: rotate(90deg);
}
.tool-confirm-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.confirm-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}
.confirm-btn.confirm-yes {
  background: var(--theme-color);
  color: #ffffff;
}
.confirm-btn.confirm-yes:hover {
  opacity: 0.9;
}
.confirm-btn.confirm-no {
  background: var(--ai-action-hover-bg);
  color: var(--ai-text-primary);
}
.confirm-btn.confirm-no:hover {
  background: var(--ai-history-delete-hover-bg);
  color: var(--ai-history-delete-hover-text);
}
.tool-call-details {
  margin-top: 8px;
}
.tool-section {
  margin-bottom: 8px;
}
.tool-section:last-child {
  margin-bottom: 0;
}
.section-label {
  font-size: 11px;
  color: var(--ai-text-secondary);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.section-content {
  margin: 0;
  padding: 8px 10px;
  background: var(--ai-code-bg);
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.5;
  overflow-x: auto;
  color: var(--ai-bubble-ai-text);
}
.section-content.is-error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}
.section-content code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
.agent-thinking-item {
  background: var(--ai-action-hover-bg);
  border-radius: 8px;
  overflow: hidden;
}
.thinking-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s ease;
}
.thinking-header:hover {
  background: rgba(0, 0, 0, 0.02);
}
.thinking-header-left {
  display: flex;
  align-items: center;
  gap: 6px;
}
.thinking-icon {
  color: var(--ai-text-secondary);
  flex-shrink: 0;
}
.thinking-label {
  font-size: 12px;
  color: var(--ai-text-secondary);
}
.thinking-expand-icon {
  color: var(--ai-text-secondary);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}
.thinking-expand-icon.is-expanded {
  transform: rotate(180deg);
}
.thinking-content {
  padding: 0 12px 12px;
}
.thinking-markdown {
  font-size: 13px;
  line-height: 1.6;
  color: var(--ai-text-primary);
}
.thinking-markdown :deep(p) {
  margin: 0 0 8px;
}
.thinking-markdown :deep(p:last-child) {
  margin-bottom: 0;
}
.thinking-markdown :deep(code) {
  background: var(--ai-code-bg);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}
.thinking-markdown :deep(pre) {
  background: var(--ai-code-bg);
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 8px 0;
}
.thinking-markdown :deep(pre code) {
  background: none;
  padding: 0;
}
.thinking-text {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--ai-text-primary);
  white-space: pre-wrap;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
