<template>
  <div class="agent-step-item" :class="[stepTypeClass, stepStatusClass]">
    <!-- Working 步骤 - 特殊样式 -->
    <template v-if="step.type === 'working'">
      <div class="step-header step-header-working">
        <div class="step-status-icon">
          <LoaderCircle v-if="isRunning" :size="16" class="icon-spinning" />
          <CheckCircle v-else-if="isCompleted" :size="16" class="icon-success" />
          <XCircle v-else-if="isError" :size="16" class="icon-error" />
          <Circle v-else :size="16" class="icon-pending" />
        </div>
        <span class="step-title">{{ isRunning ? t('Working...') : t('已完成') }}</span>
      </div>
      <div class="step-content step-content-working">
        <span class="working-message">{{ step.content }}</span>
      </div>
    </template>
    <!-- 其他步骤 - 可折叠卡片 -->
    <template v-else>
      <div class="step-header step-header-collapsible" @click="handleToggleExpand">
        <div class="step-status-icon">
          <LoaderCircle v-if="isRunning" :size="16" class="icon-spinning" />
          <CheckCircle v-else-if="isCompleted && step.type !== 'final_answer'" :size="16" class="icon-success" />
          <XCircle v-else-if="isError" :size="16" class="icon-error" />
          <component v-else :is="stepIcon" :size="16" class="icon-default" />
        </div>
        <span class="step-title">{{ stepTitle }}</span>
        <span v-if="step.type === 'tool_call' && step.toolName" class="step-tool-name">{{ step.toolName }}</span>
        <ChevronRight :size="14" class="step-expand-icon" :class="{ expanded: isExpanded }" />
      </div>
      <Transition name="collapse">
        <div v-show="isExpanded" class="step-content">
          <!-- Thinking 内容 -->
          <template v-if="step.type === 'thinking'">
            <div class="thinking-content">{{ step.content }}</div>
          </template>
          <!-- Tool Call 内容 -->
          <template v-else-if="step.type === 'tool_call'">
            <div class="tool-call-info">
              <pre v-if="step.toolArgs && Object.keys(step.toolArgs).length > 0" class="tool-args">{{ formatArgs(step.toolArgs) }}</pre>
            </div>
            <div v-if="step.needConfirmation && isWaitingConfirmation" class="confirmation-actions">
              <button class="confirm-btn" type="button" @click.stop="handleConfirm">
                <Check :size="14" />
                <span>{{ t('确认执行') }}</span>
              </button>
              <button class="reject-btn" type="button" @click.stop="handleReject">
                <X :size="14" />
                <span>{{ t('拒绝') }}</span>
              </button>
            </div>
          </template>
          <!-- Tool Result 内容 -->
          <template v-else-if="step.type === 'tool_result'">
            <div class="tool-result" :class="{ success: step.toolResult?.success, error: !step.toolResult?.success }">
              <pre class="result-content">{{ step.content }}</pre>
            </div>
          </template>
          <!-- Final Answer 内容 -->
          <template v-else-if="step.type === 'final_answer'">
            <div class="final-answer">{{ step.content }}</div>
          </template>
        </div>
      </Transition>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Brain, Wrench, CheckCircle, MessageSquare, Check, X, LoaderCircle, ChevronRight, Circle, XCircle } from 'lucide-vue-next'
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
const isRunning = computed(() => props.step.status === 'running')
const isCompleted = computed(() => props.step.status === 'completed')
const isError = computed(() => props.step.status === 'error')
const stepTypeClass = computed(() => ({
  working: props.step.type === 'working',
  thinking: props.step.type === 'thinking',
  'tool-call': props.step.type === 'tool_call',
  'tool-result': props.step.type === 'tool_result',
  'final-answer': props.step.type === 'final_answer',
}))
const stepStatusClass = computed(() => ({
  'status-running': isRunning.value,
  'status-completed': isCompleted.value,
  'status-error': isError.value,
}))
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
.agent-step-item {
  margin: 4px 0;
  border-radius: 6px;
  background-color: var(--el-fill-color-lighter);
  overflow: hidden;
  transition: background-color 0.2s;
  &:hover {
    background-color: var(--el-fill-color-light);
  }
  &.working {
    background-color: var(--el-color-primary-light-9);
    border: 1px solid var(--el-color-primary-light-7);
  }
  &.status-running {
    border-left: 3px solid var(--el-color-primary);
  }
  &.status-completed:not(.working) {
    border-left: 3px solid var(--el-color-success);
  }
  &.status-error {
    border-left: 3px solid var(--el-color-danger);
  }
}
.step-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  font-size: 13px;
  color: var(--el-text-color-primary);
}
.step-header-collapsible {
  cursor: pointer;
  user-select: none;
  &:hover {
    background-color: var(--el-fill-color);
  }
}
.step-header-working {
  padding: 12px;
}
.step-status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.icon-spinning {
  color: var(--el-color-primary);
  animation: spin 1s linear infinite;
}
.icon-success {
  color: var(--el-color-success);
}
.icon-error {
  color: var(--el-color-danger);
}
.icon-pending {
  color: var(--el-text-color-placeholder);
}
.icon-default {
  color: var(--el-text-color-secondary);
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.step-title {
  font-weight: 500;
  flex-shrink: 0;
}
.step-tool-name {
  font-family: monospace;
  font-size: 12px;
  color: var(--el-color-warning);
  background-color: var(--el-color-warning-light-9);
  padding: 2px 6px;
  border-radius: 4px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.step-expand-icon {
  margin-left: auto;
  color: var(--el-text-color-placeholder);
  transition: transform 0.2s;
  flex-shrink: 0;
  &.expanded {
    transform: rotate(90deg);
  }
}
.step-content {
  padding: 0 12px 12px 36px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--el-text-color-regular);
}
.step-content-working {
  padding: 0 12px 12px 12px;
}
.working-message {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 500px;
}
.thinking-content {
  white-space: pre-wrap;
  word-break: break-word;
}
.tool-call-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.tool-args {
  margin: 0;
  padding: 8px;
  background-color: var(--el-fill-color);
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: monospace;
}
.confirmation-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.confirm-btn,
.reject-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.confirm-btn {
  background-color: var(--el-color-success);
  color: #fff;
  &:hover {
    background-color: var(--el-color-success-dark-2);
  }
}
.reject-btn {
  background-color: var(--el-color-danger);
  color: #fff;
  &:hover {
    background-color: var(--el-color-danger-dark-2);
  }
}
.tool-result {
  padding: 8px;
  border-radius: 4px;
  &.success {
    background-color: var(--el-color-success-light-9);
  }
  &.error {
    background-color: var(--el-color-danger-light-9);
  }
}
.result-content {
  margin: 0;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: monospace;
}
.final-answer {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
