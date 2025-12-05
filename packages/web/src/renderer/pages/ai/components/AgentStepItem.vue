<template>
  <!-- User Message Bubble (Working Step) -->
  <div v-if="step.type === 'working'" class="message-item message-user">
    <div class="message-content">
      <div class="message-bubble">
        {{ step.content }}
      </div>
    </div>
  </div>

  <!-- Agent Message Bubble (Final Answer) -->
  <div v-else-if="step.type === 'final_answer'" class="message-item message-agent">
    <div class="message-avatar">
      <Bot :size="20" />
    </div>
    <div class="message-content">
      <div class="message-bubble">
        <div class="markdown-content">
          <VueMarkdownRender :source="step.content" :options="markdownOptions" />
        </div>
      </div>
    </div>
  </div>

  <!-- Timeline Item (Intermediate Steps) -->
  <div v-else class="timeline-item">
    <div class="timeline-icon">
      <LoaderCircle v-if="isRunning" :size="14" class="icon-spinning" />
      <CheckCircle v-else-if="isCompleted" :size="14" class="icon-success" />
      <XCircle v-else-if="isError" :size="14" class="icon-error" />
      <component v-else :is="stepIcon" :size="14" class="icon-default" />
    </div>
    
    <div class="timeline-content">
      <div class="timeline-header" @click="handleToggleExpand">
        <span class="timeline-title">{{ stepTitle }}</span>
        <span v-if="step.type === 'tool_call' && step.toolName" class="tool-badge">{{ step.toolName }}</span>
        <ChevronRight :size="14" class="expand-icon" :class="{ expanded: isExpanded }" />
      </div>
      
      <div v-show="isExpanded" class="timeline-body">
        <!-- Thinking -->
        <div v-if="step.type === 'thinking'" class="text-content">{{ step.content }}</div>
        
        <!-- Tool Call -->
        <template v-else-if="step.type === 'tool_call'">
          <div class="code-block" v-if="step.toolArgs && Object.keys(step.toolArgs).length > 0">
            <pre>{{ formatArgs(step.toolArgs) }}</pre>
          </div>
          <div v-if="step.needConfirmation && isWaitingConfirmation" class="action-buttons">
            <button class="btn-confirm" @click.stop="handleConfirm">
              <Check :size="14" /> {{ t('允许') }}
            </button>
            <button class="btn-reject" @click.stop="handleReject">
              <X :size="14" /> {{ t('拒绝') }}
            </button>
          </div>
        </template>
        
        <!-- Tool Result -->
        <template v-else-if="step.type === 'tool_result'">
          <div class="code-block" :class="step.toolResult?.success ? 'success' : 'error'">
            <pre>{{ step.content }}</pre>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Bot, Brain, Wrench, CheckCircle, MessageSquare, Check, X, LoaderCircle, ChevronRight, XCircle } from 'lucide-vue-next'
import VueMarkdownRender from 'vue-markdown-render'
import type { AgentStep } from '@src/types/ai/agent.type'

const props = defineProps<{
  step: AgentStep
  isWaitingConfirmation?: boolean
}>()
const emit = defineEmits<{
  confirm: []
  reject: []
}>()
const { t } = useI18n()
const isExpanded = ref(true)

const markdownOptions = {
  html: false,
  breaks: true,
  linkify: true
}

const isRunning = computed(() => props.step.status === 'running')
const isCompleted = computed(() => props.step.status === 'completed')
const isError = computed(() => props.step.status === 'error')

const stepIcon = computed(() => {
  switch (props.step.type) {
    case 'thinking': return Brain
    case 'tool_call': return Wrench
    case 'tool_result': return CheckCircle
    case 'final_answer': return MessageSquare
    default: return MessageSquare
  }
})
const stepTitle = computed(() => {
  switch (props.step.type) {
    case 'thinking': return t('思考中')
    case 'tool_call': return t('调用工具')
    case 'tool_result': return t('执行结果')
    case 'final_answer': return t('回答')
    default: return ''
  }
})
const formatArgs = (args: Record<string, unknown>) => {
  try {
    return JSON.stringify(args, null, 2)
  } catch {
    return String(args)
  }
}
const handleToggleExpand = () => {
  isExpanded.value = !isExpanded.value
}
const handleConfirm = () => {
  emit('confirm')
}
const handleReject = () => {
  emit('reject')
}
</script>

<style scoped lang="scss">
/* Message Bubbles */
.message-item {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  animation: slideIn 0.3s ease-out;
}

.message-user {
  justify-content: flex-end;
  
  .message-bubble {
    background-color: var(--theme-color);
    color: #fff;
    border-radius: 12px 12px 0 12px;
  }
}

.message-agent {
  justify-content: flex-start;
  
  .message-bubble {
    background-color: var(--gray-100);
    color: var(--gray-800);
    border-radius: 0 12px 12px 12px;
  }
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--gray-200);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--theme-color);
  flex-shrink: 0;
}

.message-content {
  max-width: 85%;
}

.message-bubble {
  padding: 10px 14px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

/* Timeline Items */
.timeline-item {
  display: flex;
  gap: 10px;
  padding: 4px 0;
  position: relative;
  
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 7px;
    top: 24px;
    bottom: -4px;
    width: 1px;
    background-color: var(--gray-200);
  }
}

.timeline-icon {
  width: 16px;
  height: 16px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 1;
  background: var(--white);
}

.timeline-content {
  flex: 1;
  min-width: 0;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 2px 0;
  
  &:hover .timeline-title {
    color: var(--theme-color);
  }
}

.timeline-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--gray-700);
}

.tool-badge {
  font-family: monospace;
  font-size: 11px;
  color: var(--gray-600);
  background-color: var(--gray-100);
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid var(--gray-200);
}

.expand-icon {
  margin-left: auto;
  color: var(--gray-400);
  transition: transform 0.2s;
  
  &.expanded {
    transform: rotate(90deg);
  }
}

.timeline-body {
  margin-top: 8px;
  font-size: 13px;
  color: var(--gray-600);
}

.text-content {
  white-space: pre-wrap;
  line-height: 1.5;
}

.code-block {
  background-color: var(--gray-050);
  border: 1px solid var(--gray-200);
  border-radius: 6px;
  padding: 8px;
  margin-top: 4px;
  
  pre {
    margin: 0;
    font-family: monospace;
    font-size: 12px;
    white-space: pre-wrap;
    word-break: break-all;
  }
  
  &.success {
    background-color: var(--success-light-9);
    border-color: var(--success-light-7);
  }
  
  &.error {
    background-color: var(--danger-light-9);
    border-color: var(--danger-light-7);
  }
}

.action-buttons {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  
  button {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: opacity 0.2s;
    
    &:hover {
      opacity: 0.9;
    }
  }
  
  .btn-confirm {
    background-color: var(--success-color);
    color: white;
  }
  
  .btn-reject {
    background-color: var(--danger-color);
    color: white;
  }
}

.icon-spinning {
  animation: spin 1s linear infinite;
  color: var(--theme-color);
}

.icon-success { color: var(--success-color); }
.icon-error { color: var(--danger-color); }
.icon-default { color: var(--gray-400); }

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Markdown Styles */
.markdown-content {
  :deep(p) {
    margin: 0 0 8px 0;
    &:last-child { margin-bottom: 0; }
  }
  
  :deep(pre) {
    background-color: var(--gray-800);
    color: var(--gray-100);
    padding: 12px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 8px 0;
  }
  
  :deep(code) {
    font-family: monospace;
    background-color: rgba(0, 0, 0, 0.05);
    padding: 2px 4px;
    border-radius: 4px;
  }
  
  :deep(pre code) {
    background-color: transparent;
    padding: 0;
  }
}
</style>
