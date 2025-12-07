<template>
  <div class="tool-call-item" :class="{ 'is-last': isLast }">
    <div class="tool-call-timeline">
      <div class="timeline-dot" :class="statusClass" />
      <div v-if="!isLast" class="timeline-line" />
    </div>
    <div class="tool-call-content">
      <div class="tool-call-header" @click="toggleExpand">
        <div class="tool-header-left">
          <component :is="statusIcon" :size="14" class="tool-status-icon" :class="statusClass" />
          <span class="tool-name">{{ toolCall.name }}</span>
          <span v-if="duration" class="tool-duration">{{ duration }}ms</span>
        </div>
        <div class="tool-header-right">
          <ChevronRight :size="14" class="tool-expand-icon" :class="{ 'is-expanded': isExpanded }" />
        </div>
      </div>
      <div v-if="toolCall.status === 'waiting-confirm'" class="tool-confirm-actions">
        <button class="confirm-btn confirm-yes" @click="handleConfirm">
          <Check :size="14" />
          <span>{{ t('确认执行') }}</span>
        </button>
        <button class="confirm-btn confirm-no" @click="handleCancel">
          <X :size="14" />
          <span>{{ t('取消') }}</span>
        </button>
      </div>
      <div v-show="isExpanded" class="tool-call-details">
        <div v-if="hasArguments" class="tool-section">
          <div class="section-label">{{ t('参数') }}</div>
          <pre class="section-content"><code>{{ formattedArguments }}</code></pre>
        </div>
        <div v-if="toolCall.result" class="tool-section">
          <div class="section-label">{{ t('结果') }}</div>
          <pre class="section-content" :class="{ 'is-error': toolCall.result.code !== 0 }"><code>{{ formattedResult }}</code></pre>
        </div>
        <div v-if="toolCall.error" class="tool-section">
          <div class="section-label">{{ t('错误') }}</div>
          <pre class="section-content is-error"><code>{{ toolCall.error }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronRight, Loader2, CheckCircle2, XCircle, Clock, AlertCircle, Check, X } from 'lucide-vue-next'
import type { AgentToolCallInfo } from '@src/types/ai'

const props = defineProps<{
  toolCall: AgentToolCallInfo
  isLast: boolean
}>()
const emit = defineEmits<{
  confirm: [toolCallId: string]
  cancel: [toolCallId: string]
}>()
const { t } = useI18n()
const isExpanded = ref(false)
const statusIcon = computed(() => {
  const icons = {
    pending: Clock,
    running: Loader2,
    success: CheckCircle2,
    error: XCircle,
    'waiting-confirm': AlertCircle,
    cancelled: XCircle
  }
  return icons[props.toolCall.status]
})
const statusClass = computed(() => `status-${props.toolCall.status}`)
const duration = computed(() => {
  if (props.toolCall.startTime && props.toolCall.endTime) {
    return props.toolCall.endTime - props.toolCall.startTime
  }
  return null
})
const hasArguments = computed(() => Object.keys(props.toolCall.arguments).length > 0)
const formattedArguments = computed(() => JSON.stringify(props.toolCall.arguments, null, 2))
const formattedResult = computed(() => {
  if (!props.toolCall.result) return ''
  return JSON.stringify(props.toolCall.result.data, null, 2)
})
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}
const handleConfirm = () => {
  emit('confirm', props.toolCall.id)
}
const handleCancel = () => {
  emit('cancel', props.toolCall.id)
}
</script>

<style scoped>
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
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.tool-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--ai-bubble-ai-text);
  transition: color 0.2s ease;
}
.tool-duration {
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
</style>
