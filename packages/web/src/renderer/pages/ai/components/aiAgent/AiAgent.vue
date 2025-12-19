<template>
  <div class="ai-chat-view">
    <div class="ai-messages" ref="messagesRef">
      <div v-if="!agentViewStore.isAiConfigValid" class="ai-empty-state ai-empty-state-setup">
        <AlertTriangle class="ai-empty-icon" :size="48" />
        <p class="ai-empty-text mb-2">{{ t('请先前往AI设置配置apiKey与apiUrl') }}</p>
        <button class="ai-config-btn" type="button" @click="agentViewStore.switchToConfig()">
          <span>{{ t('配置ApiKey') }}</span>
          <ArrowRight :size="14" class="config-icon"/>
        </button>
      </div>
      <div v-else-if="filteredMessages.length === 0" class="ai-empty-state">
        <Sparkles class="ai-empty-icon" :size="48" />
        <p class="ai-empty-text">{{ t('Agent模式可以自动执行工具调用') }}</p>
      </div>
      <template v-else>
        <template v-for="message in filteredMessages" :key="message.id">
          <AskMessageItem v-if="message.type === 'ask'" :message="message" />
          <LoadingMessageItem v-else-if="message.type === 'loading'" :message="message" />
          <TextResponseMessageItem v-else-if="message.type === 'textResponse'" :message="message" />
          <InfoMessageItem v-else-if="message.type === 'info'" :message="message" />
          <AgentExecutionMessageItem v-else-if="message.type === 'agentExecution'" :message="message" />
          <ErrorMessageItem v-else-if="message.type === 'error'" :message="message" @retry="handleRetry" />
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Sparkles, AlertTriangle, ArrowRight } from 'lucide-vue-next'
import { useAgentViewStore } from '@/store/ai/agentView'
import AskMessageItem from '../aiAsk/components/AskMessageItem.vue'
import LoadingMessageItem from '../aiAsk/components/LoadingMessageItem.vue'
import TextResponseMessageItem from '../aiAsk/components/TextResponseMessageItem.vue'
import InfoMessageItem from '../aiAsk/components/InfoMessageItem.vue'
import ErrorMessageItem from '../aiAsk/components/ErrorMessageItem.vue'
import AgentExecutionMessageItem from './components/AgentExecutionMessageItem.vue'

const emit = defineEmits<{
  'retry': [originalPrompt: string, mode: 'agent' | 'ask', messageId: string]
}>()
const { t } = useI18n()
const agentViewStore = useAgentViewStore()
const messagesRef = ref<HTMLElement | null>(null)
const filteredMessages = computed(() => agentViewStore.currentMessageList.filter(msg => msg.mode === 'agent'))
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}
watch(() => filteredMessages.value.length, () => {
  scrollToBottom()
})
const handleRetry = (originalPrompt: string, mode: 'agent' | 'ask', messageId: string) => {
  emit('retry', originalPrompt, mode, messageId)
}
defineExpose({
  scrollToBottom
})
</script>

<style scoped>
.ai-chat-view {
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
