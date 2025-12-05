<template>
  <div class="agent-process-group">
    <div class="process-header" @click="toggleExpand">
      <div class="process-summary">
        <div class="process-icon">
          <LoaderCircle v-if="isRunning" :size="16" class="icon-spinning" />
          <CheckCircle v-else-if="isCompleted" :size="16" class="icon-success" />
          <XCircle v-else-if="isError" :size="16" class="icon-error" />
          <ListTree v-else :size="16" class="icon-default" />
        </div>
        <span class="process-title">
          {{ isRunning ? t('正在执行...') : t('执行过程') }}
          <span class="process-count">({{ steps.length }} {{ t('个步骤') }})</span>
        </span>
      </div>
      <ChevronRight :size="16" class="expand-icon" :class="{ expanded: isExpanded }" />
    </div>
    
    <Transition name="expand">
      <div v-show="isExpanded" class="process-body">
        <div class="process-timeline">
          <template v-for="(step, index) in steps" :key="step.id">
            <AgentStepItem 
              :step="step" 
              :is-waiting-confirmation="isWaitingConfirmation && index === steps.length - 1"
              @confirm="emit('confirm')"
              @reject="emit('reject')"
            />
          </template>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { LoaderCircle, CheckCircle, XCircle, ListTree, ChevronRight } from 'lucide-vue-next'
import type { AgentStep } from '@src/types/ai/agent.type'
import AgentStepItem from '../AgentStepItem.vue'

const props = defineProps<{
  steps: AgentStep[]
  isWaitingConfirmation?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  reject: []
}>()

const { t } = useI18n()
const isExpanded = ref(false)

const isRunning = computed(() => props.steps.some(s => s.status === 'running'))
const isError = computed(() => props.steps.some(s => s.status === 'error'))
const isCompleted = computed(() => !isRunning.value && !isError.value)

// Auto expand when running or waiting confirmation
watch(() => [isRunning.value, props.isWaitingConfirmation], ([running, waiting]) => {
  if (running || waiting) {
    isExpanded.value = true
  }
}, { immediate: true })

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
.agent-process-group {
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  background: var(--white);
  overflow: hidden;
  margin: 8px 0;
}

.process-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  cursor: pointer;
  background: var(--gray-050);
  transition: background-color 0.2s;
}

.process-header:hover {
  background: var(--gray-100);
}

.process-summary {
  display: flex;
  align-items: center;
  gap: 8px;
}

.process-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-500);
}

.icon-spinning {
  animation: spin 1s linear infinite;
  color: var(--theme-color);
}

.icon-success {
  color: var(--success-color);
}

.icon-error {
  color: var(--danger-color);
}

.process-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--gray-700);
  display: flex;
  align-items: center;
  gap: 4px;
}

.process-count {
  color: var(--gray-500);
  font-weight: normal;
  font-size: 12px;
}

.expand-icon {
  color: var(--gray-400);
  transition: transform 0.2s;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.process-body {
  border-top: 1px solid var(--gray-200);
  background: var(--white);
}

.process-timeline {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  opacity: 1;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
