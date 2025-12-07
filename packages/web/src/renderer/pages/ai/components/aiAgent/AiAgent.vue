<template>
  <div class="agent-execution-container">
    <div class="agent-execution-header" @click="toggleExpand">
      <div class="agent-header-left">
        <component :is="statusIcon" :size="16" class="agent-status-icon" :class="statusClass" />
        <span class="agent-title">{{ t('Agent执行') }}</span>
        <span class="agent-tool-count">{{ toolCalls.length }} {{ t('个工具调用') }}</span>
      </div>
      <div class="agent-header-right">
        <ChevronDown :size="16" class="agent-expand-icon" :class="{ 'is-expanded': isExpanded }" />
      </div>
    </div>
    <div v-show="isExpanded" class="agent-execution-body">
      <div class="agent-timeline">
        <AgentToolCallItem
          v-for="(call, index) in toolCalls"
          :key="call.id"
          :tool-call="call"
          :is-last="index === toolCalls.length - 1"
          @confirm="handleConfirm"
          @cancel="handleCancel"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronDown, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-vue-next'
import AgentToolCallItem from './components/AgentToolCallItem.vue'
import type { AgentToolCallInfo } from '@src/types/ai'

const props = defineProps<{
  toolCalls: AgentToolCallInfo[]
  status: 'pending' | 'running' | 'success' | 'error'
}>()
const emit = defineEmits<{
  confirm: [toolCallId: string]
  cancel: [toolCallId: string]
}>()
const { t } = useI18n()
const isExpanded = ref(true)
const statusIcon = computed(() => {
  const icons = {
    pending: Clock,
    running: Loader2,
    success: CheckCircle2,
    error: XCircle
  }
  return icons[props.status]
})
const statusClass = computed(() => `status-${props.status}`)
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}
const handleConfirm = (toolCallId: string) => {
  emit('confirm', toolCallId)
}
const handleCancel = (toolCallId: string) => {
  emit('cancel', toolCallId)
}
</script>

<style scoped>
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
</style>
