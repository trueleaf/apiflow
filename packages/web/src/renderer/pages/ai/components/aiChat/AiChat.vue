<template>
  <div class="ai-chat-view">
    <div class="ai-message-list" ref="messagesRef">
      <div v-if="!agentViewStore.isAiConfigValid" class="ai-empty-state ai-empty-state-setup">
        <AlertTriangle class="ai-empty-icon" :size="48" />
        <p class="ai-empty-text mb-2">{{ t('请先前往AI设置配置apiKey与apiUrl') }}</p>
        <button class="ai-config-btn" type="button" @click="agentViewStore.openConfig()">
          <span>{{ t('配置ApiKey') }}</span>
          <ArrowRight :size="14" class="config-icon"/>
        </button>
      </div>
      <div v-else-if="currentMessages.length === 0" class="ai-empty-state">
        <Sparkles v-if="agentViewStore.mode === 'agent'" class="ai-empty-icon" :size="48" />
        <Bot v-else class="ai-empty-icon" :size="48" />
        <p class="ai-empty-text">{{ emptyText }}</p>
        <div v-if="llmClientStore.useFreeLLM" class="ai-free-api-tip">
          <span class="tip-text">{{ t('目前使用免费 API 可能不稳定，建议') }}</span>
          <button class="tip-link" type="button" @click="agentViewStore.openConfig()">
            {{ t('配置自定义 API Key') }}
          </button>
        </div>
      </div>
      <template v-else>
        <div
          v-for="message in currentMessages"
          :key="message.id"
          class="ai-message"
          :class="message.kind === 'question' ? 'is-user' : 'is-ai'"
        >
          <div class="ai-message-inner">
            <div class="ai-message-bubble" :class="`ai-bubble-${message.kind}`">
              <div v-if="message.kind === 'loading'" class="ai-loading-lines" :aria-label="t('生成中')">
                <span />
                <span />
                <span />
              </div>

              <div v-else-if="message.kind === 'thinking'" class="ai-message-thinking">
                <Loader2 :size="16" class="ai-thinking-icon" />
                <VueMarkdownRender class="ai-thinking-content" :source="message.content" :options="markdownOptions" :plugins="[customTagsPlugin]" />
              </div>

              <div v-else-if="message.kind === 'tool-group'" class="ai-message-tool-group">
                <button class="ai-tool-group-header" type="button" @click="toggleMessageCollapse(message.id)">
                  <ChevronRight v-if="collapsedMessages.has(message.id)" :size="14" />
                  <ChevronDown v-else :size="14" />
                  <span class="ai-tool-group-title">{{ message.content }}</span>
                </button>
                <div v-if="!collapsedMessages.has(message.id)" class="ai-tool-group-details">
                  <div v-for="toolName in message.toolGroup.tools" :key="toolName" class="ai-tool-group-item">
                    • {{ toolName }}
                  </div>
                </div>
              </div>

              <div v-else-if="message.kind === 'tool-call'" class="ai-message-tool-execution">
                <div class="ai-tool-execution-header">
                  <Loader2 v-if="message.status === 'loading'" :size="14" class="ai-tool-status-icon ai-tool-loading" />
                  <CheckCircle2 v-else-if="message.status === 'success'" :size="14" class="ai-tool-status-icon ai-tool-success" />
                  <XCircle v-else :size="14" class="ai-tool-status-icon ai-tool-error" />
                  <span class="ai-tool-execution-name">{{ message.content }}</span>
                  <span v-if="message.tokenUsage" class="ai-tool-token-usage">{{ formatTokens(message.tokenUsage.totalTokens) }}</span>
                  <button
                    v-if="message.status === 'success' || message.status === 'error'"
                    class="ai-tool-toggle"
                    type="button"
                    @click="toggleMessageCollapse(message.id)"
                  >
                    <ChevronRight v-if="collapsedMessages.has(message.id)" :size="14" />
                    <ChevronDown v-else :size="14" />
                  </button>
                </div>

                <div v-if="!collapsedMessages.has(message.id) && message.status === 'error' && message.toolCall?.error" class="ai-tool-details">
                  <div v-if="message.llmOutput" class="ai-tool-section">
                    <div class="ai-tool-section-label">{{ t('LLM 输出') }}:</div>
                    <VueMarkdownRender class="ai-tool-section-content" :source="message.llmOutput" :options="markdownOptions" :plugins="[customTagsPlugin]" />
                  </div>
                  <div class="ai-tool-section">
                    <div class="ai-tool-section-label">{{ t('错误') }}:</div>
                    <div class="ai-tool-section-content">{{ message.toolCall.error }}</div>
                  </div>
                  <div v-if="Object.keys(message.toolCall.arguments).length > 0" class="ai-tool-section">
                    <div class="ai-tool-section-label">{{ t('参数') }}:</div>
                    <pre class="ai-tool-section-code"><code>{{ JSON.stringify(message.toolCall.arguments, null, 2) }}</code></pre>
                  </div>
                </div>

                <div v-if="!collapsedMessages.has(message.id) && message.status === 'success'" class="ai-tool-details">
                  <div v-if="message.llmOutput" class="ai-tool-section">
                    <div class="ai-tool-section-label">{{ t('LLM 输出') }}:</div>
                    <VueMarkdownRender class="ai-tool-section-content" :source="message.llmOutput" :options="markdownOptions" :plugins="[customTagsPlugin]" />
                  </div>
                  <div v-if="message.toolCall.result" class="ai-tool-section">
                    <div class="ai-tool-section-label">{{ t('结果') }}:</div>
                    <div class="ai-tool-section-content">{{ message.toolCall.result }}</div>
                  </div>
                  <div v-if="Object.keys(message.toolCall.arguments).length > 0" class="ai-tool-section">
                    <div class="ai-tool-section-label">{{ t('参数') }}:</div>
                    <pre class="ai-tool-section-code"><code>{{ JSON.stringify(message.toolCall.arguments, null, 2) }}</code></pre>
                  </div>
                </div>
              </div>

              <div v-else class="ai-message-content">
                <VueMarkdownRender class="ai-markdown" :source="message.content || '...'" :options="markdownOptions" :plugins="[customTagsPlugin]" />
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Sparkles, Bot, AlertTriangle, ArrowRight, Loader2, ChevronDown, ChevronRight, CheckCircle2, XCircle } from 'lucide-vue-next'
import VueMarkdownRender from 'vue-markdown-render'
import type MarkdownIt from 'markdown-it'
import { useAgentViewStore } from '@/store/ai/agentView'
import { useLLMClientStore } from '@/store/ai/llmClientStore'
import type { ConversationMessage } from '@src/types/ai'

const { t } = useI18n()
const agentViewStore = useAgentViewStore()
const llmClientStore = useLLMClientStore()
const messagesRef = ref<HTMLElement | null>(null)
const collapsedMessages = ref(new Set<string>())
const processedToolCallIds = ref(new Set<string>())
const currentMessages = computed(() => (agentViewStore.mode === 'agent' ? agentViewStore.agentMessages : agentViewStore.askMessages))
const emptyText = computed(() => {
  return agentViewStore.mode === 'agent' ? t('Agent模式可以自动执行工具调用') : t('问我任何问题')
})
const markdownOptions = {
  html: true,
  breaks: true,
  linkify: true
}
const allowedTags = ['thinking', 'result', 'context', 'instruction']
const processCustomTags = (html: string, escapeHtml: (str: string) => string): string => {
  return html.replace(/<\/?(\w+)([^>]*)>/g, (match, tagName, _attrs) => {
    const lowerTag = String(tagName).toLowerCase()
    if (allowedTags.includes(lowerTag)) {
      const isClosing = match.startsWith('</')
      return isClosing ? '</div>' : `<div class="ai-tag ai-tag-${lowerTag}">`
    }
    return escapeHtml(match)
  })
}
const customTagsPlugin = (md: MarkdownIt) => {
  md.renderer.rules.html_block = (tokens, idx) => {
    return processCustomTags(tokens[idx].content, md.utils.escapeHtml)
  }
  md.renderer.rules.html_inline = (tokens, idx) => {
    return processCustomTags(tokens[idx].content, md.utils.escapeHtml)
  }
}
const formatTokens = (totalTokens: number) => {
  if (totalTokens >= 1000) {
    return `${(totalTokens / 1000).toFixed(1)}k`
  }
  return `${totalTokens}`
}
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}
const toggleMessageCollapse = (messageId: string) => {
  if (collapsedMessages.value.has(messageId)) {
    collapsedMessages.value.delete(messageId)
  } else {
    collapsedMessages.value.add(messageId)
  }
}
watch(() => currentMessages.value.length, () => {
  scrollToBottom()
})
watch(() => agentViewStore.agentMessages, (messages) => {
  const nextCollapsed = new Set(collapsedMessages.value)
  const nextProcessed = new Set(processedToolCallIds.value)
  messages.forEach((message: ConversationMessage) => {
    if (message.kind !== 'tool-call') {
      return
    }
    if (message.status !== 'success' && message.status !== 'error') {
      return
    }
    if (nextProcessed.has(message.id)) {
      return
    }
    nextProcessed.add(message.id)
    nextCollapsed.add(message.id)
  })
  processedToolCallIds.value = nextProcessed
  collapsedMessages.value = nextCollapsed
}, { deep: true })
</script>

<style scoped>
.ai-chat-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.ai-message-list {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 10px 0;
  background: #ffffff;
  overflow-y: auto;
  scrollbar-gutter: stable;

  &::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--gray-500);
  }
}
.ai-empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--ai-text-secondary);
}
.ai-empty-icon {
  margin-bottom: 16px;
  opacity: 0.6;
}
.ai-empty-text {
  font-size: 14px;
  margin: 0;
}
.ai-free-api-tip {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--el-color-warning);
}
.tip-text {
  color: var(--ai-text-secondary);
}
.tip-link {
  background: none;
  border: none;
  color: var(--el-color-primary);
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  font-size: 12px;
}
.tip-link:hover {
  opacity: 0.8;
}
.ai-config-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 12px;
  background: var(--ai-button-bg);
  border: 1px solid var(--ai-button-border);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  color: var(--ai-text-primary);
  white-space: nowrap;
}
.config-icon {
  margin-top: 4px;
}
.ai-config-btn:hover {
  background: var(--ai-button-hover-bg);
}
.ai-message {
  display: flex;
  width: 100%;
  padding: 6px 12px;
  justify-content: flex-start;
}
.ai-message.is-user {
  justify-content: flex-end;
}
.ai-message.is-ai {
  background: transparent;
  border-top: none;
  border-bottom: none;
}
.ai-message-inner {
  width: 100%;
  max-width: 860px;
  margin: 0 auto;
  display: flex;
  justify-content: flex-start;
}
.ai-message.is-user .ai-message-inner {
  justify-content: flex-end;
}
.ai-message-bubble {
  width: fit-content;
  max-width: 90%;
  padding: 4px 0;
  border-radius: 0;
  border: none;
  background: transparent;
  color: #1f2328;
  box-shadow: none;
}
.ai-message.is-ai .ai-message-bubble {
  border-top-left-radius: 0;
}
.ai-bubble-question {
  background: #f3f4f6;
  border-radius: 8px;
  padding: 8px 12px;
  color: #1f2328;
}
.ai-bubble-response {
  background: transparent;
}
.ai-message.is-ai .ai-bubble-response {
  width: 100%;
  max-width: 100%;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}
.ai-message.is-ai .ai-bubble-response .ai-message-content {
  padding: 2px 0;
}
.ai-bubble-loading {
  background: transparent;
  color: #636c76;
}
.ai-bubble-error {
  background: #fff8f8;
  border: 1px solid #ffdede;
  border-radius: 6px;
  padding: 8px;
  color: #b4231f;
}
.ai-bubble-thinking {
  background: transparent;
  color: #636c76;
  border-radius: 0;
}
.ai-bubble-tool-call,
.ai-bubble-tool-group {
  background: transparent;
  border: none;
  width: 100%;
  max-width: 100%;
  padding: 0;
}
.ai-message-content {
  margin: 0;
  font-size: 14px;
  line-height: 1.75;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: anywhere;
}
.ai-message-content .ai-markdown {
  line-height: 1.55;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
}
.ai-message-content .ai-markdown :deep(> :first-child) {
  margin-top: 0;
}
.ai-message-content .ai-markdown :deep(> :last-child) {
  margin-bottom: 0;
}
.ai-message-content .ai-markdown :deep(p) {
  margin: 6px 0;
}
.ai-message-content .ai-markdown :deep(h1),
.ai-message-content .ai-markdown :deep(h2),
.ai-message-content .ai-markdown :deep(h3),
.ai-message-content .ai-markdown :deep(h4),
.ai-message-content .ai-markdown :deep(h5),
.ai-message-content .ai-markdown :deep(h6) {
  margin: 10px 0 6px;
  line-height: 1.35;
}
.ai-message-content .ai-markdown :deep(ul),
.ai-message-content .ai-markdown :deep(ol) {
  margin: 6px 0;
  padding-left: 18px;
}
.ai-message-content .ai-markdown :deep(li) {
  margin: 2px 0;
}
.ai-message-content .ai-markdown :deep(blockquote) {
  margin: 8px 0;
  padding: 4px 10px;
  border-left: 3px solid #d0d7de;
  color: #636c76;
}
.ai-message-content .ai-markdown :deep(pre) {
  margin: 8px 0;
  padding: 8px 10px;
  border: 1px solid #e6eaef;
  border-radius: 6px;
  background: #f6f8fa;
  overflow: auto;
}
.ai-message-content .ai-markdown :deep(code) {
  padding: 0 4px;
  border-radius: 4px;
  background: #f6f8fa;
  font-size: 0.95em;
}
.ai-message-content .ai-markdown :deep(pre code) {
  padding: 0;
  background: transparent;
}
.ai-message-content .ai-markdown :deep(hr) {
  margin: 10px 0;
  border: 0;
  border-top: 1px solid #e6eaef;
}
.ai-message-content .ai-markdown :deep(table) {
  margin: 8px 0;
  border-collapse: collapse;
}
.ai-message-content .ai-markdown :deep(th),
.ai-message-content .ai-markdown :deep(td) {
  padding: 4px 8px;
  border: 1px solid #e6eaef;
}
.ai-message-content .ai-markdown :deep(th) {
  background: #f6f8fa;
  font-weight: 600;
}
.ai-loading-lines {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ai-loading-lines span {
  height: 10px;
  border-radius: 6px;
  background: linear-gradient(90deg, #e9ecf1 0%, #f5f7fa 40%, #e9ecf1 100%);
  background-size: 200% 100%;
  animation: ai-loading-shimmer 1.2s ease-in-out infinite;
}
.ai-loading-lines span:nth-child(2) {
  width: 88%;
}
.ai-loading-lines span:nth-child(3) {
  width: 72%;
}
@keyframes ai-loading-shimmer {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
.ai-message-thinking {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 2px 0;
  font-size: 14px;
  color: #636c76;
}
.ai-thinking-icon {
  flex-shrink: 0;
  margin-top: 2px;
  animation: ai-tool-spin 1s linear infinite;
  color: #0969da;
}
.ai-thinking-content {
  flex: 1;
  line-height: 1.55;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
}
.ai-thinking-content :deep(> :first-child) {
  margin-top: 0;
}
.ai-thinking-content :deep(> :last-child) {
  margin-bottom: 0;
}
.ai-thinking-content :deep(p) {
  margin: 6px 0;
}
.ai-thinking-content :deep(h1),
.ai-thinking-content :deep(h2),
.ai-thinking-content :deep(h3),
.ai-thinking-content :deep(h4),
.ai-thinking-content :deep(h5),
.ai-thinking-content :deep(h6) {
  margin: 10px 0 6px;
  line-height: 1.35;
}
.ai-thinking-content :deep(ul),
.ai-thinking-content :deep(ol) {
  margin: 6px 0;
  padding-left: 18px;
}
.ai-thinking-content :deep(li) {
  margin: 2px 0;
}
.ai-thinking-content :deep(blockquote) {
  margin: 8px 0;
  padding: 4px 10px;
  border-left: 3px solid #d0d7de;
  color: #636c76;
}
.ai-thinking-content :deep(pre) {
  margin: 8px 0;
  padding: 8px 10px;
  border: 1px solid #e6eaef;
  border-radius: 6px;
  background: #f6f8fa;
  overflow: auto;
}
.ai-thinking-content :deep(code) {
  padding: 0 4px;
  border-radius: 4px;
  background: #f6f8fa;
  font-size: 0.95em;
}
.ai-thinking-content :deep(pre code) {
  padding: 0;
  background: transparent;
}
.ai-thinking-content :deep(hr) {
  margin: 10px 0;
  border: 0;
  border-top: 1px solid #e6eaef;
}
.ai-thinking-content :deep(table) {
  margin: 8px 0;
  border-collapse: collapse;
}
.ai-thinking-content :deep(th),
.ai-thinking-content :deep(td) {
  padding: 4px 8px;
  border: 1px solid #e6eaef;
}
.ai-thinking-content :deep(th) {
  background: #f6f8fa;
  font-weight: 600;
}
.ai-thinking-content :deep(strong) {
  font-weight: 600;
}
.ai-thinking-content :deep(em) {
  font-style: italic;
}
.ai-message-tool-group {
  width: 100%;
}
.ai-tool-group-header {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 6px 10px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 12px;
  color: #0969da;
  transition: background 0.15s ease;
  border-radius: 4px;
  font-weight: 500;
}
.ai-tool-group-header:hover {
  background: #e6eaef;
}
.ai-tool-group-title {
  flex: 1;
}
.ai-tool-group-details {
  padding: 2px 10px 8px 28px;
  font-size: 12px;
  color: #636c76;
  line-height: 1.6;
}
.ai-tool-group-item {
  padding: 2px 0;
}
.ai-message-tool-execution {
  width: 100%;
  padding: 4px 10px;
}
.ai-tool-execution-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #24292f;
  line-height: 1.5;
}
.ai-tool-status-icon {
  flex-shrink: 0;
}
.ai-tool-loading {
  color: #656d76;
  animation: ai-tool-spin 1s linear infinite;
}
.ai-tool-success {
  color: #1a7f37;
}
.ai-tool-error {
  color: #cf222e;
}
@keyframes ai-tool-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.ai-tool-execution-name {
  flex: 1;
  font-weight: 400;
}
.ai-tool-token-usage {
  padding: 2px 6px;
  background: #ddf4ff;
  border-radius: 3px;
  font-size: 11px;
  color: #0969da;
  font-weight: 500;
  white-space: nowrap;
}
.ai-tool-toggle {
  padding: 2px 4px;
  background: none;
  border: none;
  cursor: pointer;
  color: #656d76;
  transition: color 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ai-tool-toggle:hover {
  color: #24292f;
}
.ai-tool-details {
  margin-top: 8px;
  padding: 10px;
  background: #f6f8fa;
  border: 1px solid #d0d7de;
  border-radius: 4px;
  font-size: 12px;
}
.ai-tool-section {
  margin-bottom: 10px;
}
.ai-tool-section:last-child {
  margin-bottom: 0;
}
.ai-tool-section-label {
  font-size: 12px;
  color: #636c76;
  font-weight: 500;
  margin-bottom: 4px;
}
.ai-tool-section-content {
  font-size: 14px;
  color: #24292f;
  line-height: 1.55;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
  max-height: 200px;
  overflow-y: auto;
}
.ai-tool-section-content :deep(> :first-child) {
  margin-top: 0;
}
.ai-tool-section-content :deep(> :last-child) {
  margin-bottom: 0;
}
.ai-tool-section-content :deep(p) {
  margin: 6px 0;
}
.ai-tool-section-content :deep(h1),
.ai-tool-section-content :deep(h2),
.ai-tool-section-content :deep(h3),
.ai-tool-section-content :deep(h4),
.ai-tool-section-content :deep(h5),
.ai-tool-section-content :deep(h6) {
  margin: 10px 0 6px;
  line-height: 1.35;
}
.ai-tool-section-content :deep(ul),
.ai-tool-section-content :deep(ol) {
  margin: 6px 0;
  padding-left: 18px;
}
.ai-tool-section-content :deep(li) {
  margin: 2px 0;
}
.ai-tool-section-content :deep(blockquote) {
  margin: 8px 0;
  padding: 4px 10px;
  border-left: 3px solid #d0d7de;
  color: #636c76;
}
.ai-tool-section-content :deep(pre) {
  margin: 8px 0;
  padding: 8px 10px;
  border: 1px solid #e6eaef;
  border-radius: 6px;
  background: #f6f8fa;
  overflow: auto;
}
.ai-tool-section-content :deep(code) {
  padding: 0 4px;
  border-radius: 4px;
  background: #f6f8fa;
  font-size: 0.95em;
}
.ai-tool-section-content :deep(pre code) {
  padding: 0;
  background: transparent;
}
.ai-tool-section-content :deep(hr) {
  margin: 10px 0;
  border: 0;
  border-top: 1px solid #e6eaef;
}
.ai-tool-section-content :deep(table) {
  margin: 8px 0;
  border-collapse: collapse;
}
.ai-tool-section-content :deep(th),
.ai-tool-section-content :deep(td) {
  padding: 4px 8px;
  border: 1px solid #e6eaef;
}
.ai-tool-section-content :deep(th) {
  background: #f6f8fa;
  font-weight: 600;
}
.ai-tool-section-content :deep(strong) {
  font-weight: 600;
}
.ai-tool-section-content :deep(em) {
  font-style: italic;
}
.ai-tool-section-code {
  margin: 0;
  padding: 6px 8px;
  background: #ffffff;
  border: 1px solid #d0d7de;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 11px;
  color: #24292f;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: anywhere;
  max-height: 150px;
  overflow-y: auto;
}
</style>
