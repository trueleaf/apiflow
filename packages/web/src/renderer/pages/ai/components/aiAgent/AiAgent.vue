<template>
  <div class="ai-agent-view">
    <div class="ai-messages" ref="messagesRef">
      <div v-if="!isConfigValid" class="ai-empty-state ai-empty-state-setup">
        <AlertTriangle class="ai-empty-icon" :size="48" />
        <p class="ai-empty-text mb-2">{{ t('请先前往AI设置配置apiKey与apiUrl') }}</p>
        <button class="ai-config-btn" type="button" @click="emit('open-settings')">
          <span>{{ t('配置ApiKey') }}</span>
          <ArrowRight :size="14" class="config-icon"/>
        </button>
      </div>
      <div v-else-if="reactAgentStore.steps.length === 0" class="ai-empty-state">
        <Bot class="ai-empty-icon" :size="48" />
        <p class="ai-empty-text">{{ t('Agent模式，我可以帮你执行操作') }}</p>
      </div>
      <template v-else>
        <template v-for="(item, index) in groupedSteps" :key="item.type === 'single' ? item.step.id : item.id">
          <AgentStepItem
            v-if="item.type === 'single'"
            :step="item.step"
            :is-waiting-confirmation="false"
          />
          <AgentProcessGroup
            v-else
            :steps="item.steps"
            :is-waiting-confirmation="reactAgentStore.status === 'waiting_confirmation' && index === groupedSteps.length - 1"
            @confirm="emit('confirm')"
            @reject="emit('reject')"
          />
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Bot, AlertTriangle, ArrowRight } from 'lucide-vue-next'
import { useReactAgentStore } from '@/store/ai/reactAgentStore'
import type { AgentStep } from '@src/types/ai/agent.type'
import AgentStepItem from '../AgentStepItem.vue'
import AgentProcessGroup from './AgentProcessGroup.vue'

defineProps<{
  isConfigValid: boolean
}>()
const emit = defineEmits<{
  'open-settings': []
  'confirm': []
  'reject': []
}>()
const { t } = useI18n()
const reactAgentStore = useReactAgentStore()
const messagesRef = ref<HTMLElement | null>(null)

type GroupedStep = {
  type: 'single'
  step: AgentStep
} | {
  type: 'group'
  id: string
  steps: AgentStep[]
}

const groupedSteps = computed(() => {
  const groups: GroupedStep[] = []
  let currentGroup: AgentStep[] = []
  
  const flushGroup = () => {
    if (currentGroup.length > 0) {
      groups.push({
        type: 'group',
        id: `group-${currentGroup[0].id}`,
        steps: [...currentGroup]
      })
      currentGroup = []
    }
  }
  
  for (const step of reactAgentStore.steps) {
    if (step.type === 'working' || step.type === 'final_answer') {
      flushGroup()
      groups.push({
        type: 'single',
        step
      })
    } else {
      currentGroup.push(step)
    }
  }
  flushGroup()
  
  return groups
})

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}
watch(() => reactAgentStore.steps.length, () => {
  scrollToBottom()
})
defineExpose({
  scrollToBottom
})
</script>

<style scoped>
.ai-agent-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.ai-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.ai-messages::-webkit-scrollbar {
  width: 8px;
}
.ai-messages::-webkit-scrollbar-track {
  background: transparent;
}
.ai-messages::-webkit-scrollbar-thumb {
  background: var(--ai-scrollbar-thumb);
  border-radius: 4px;
}
.ai-messages::-webkit-scrollbar-thumb:hover {
  background: var(--ai-scrollbar-hover);
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
</style>
