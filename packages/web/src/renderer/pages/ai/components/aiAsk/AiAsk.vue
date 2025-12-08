<template>
  <div class="ai-chat-view">
    <div class="ai-messages" ref="messagesRef">
      <div v-if="!isConfigValid" class="ai-empty-state ai-empty-state-setup">
        <AlertTriangle class="ai-empty-icon" :size="48" />
        <p class="ai-empty-text mb-2">{{ t('请先前往AI设置配置apiKey与apiUrl') }}</p>
        <button class="ai-config-btn" type="button" @click="emit('open-settings')">
          <span>{{ t('配置ApiKey') }}</span>
          <ArrowRight :size="14" class="config-icon"/>
        </button>
      </div>
      <div v-else-if="filteredMessages.length === 0" class="ai-empty-state">
        <Bot class="ai-empty-icon" :size="48" />
        <p class="ai-empty-text">{{ t('问我任何问题') }}</p>
      </div>
      <template v-else>
        <template v-for="message in filteredMessages" :key="message.id">
          <AskMessageItem v-if="message.type === 'ask'" :message="message" />
          <LoadingMessageItem v-else-if="message.type === 'loading'" :message="message" />
          <TextResponseMessageItem v-else-if="message.type === 'textResponse'" :message="message" />
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Bot, AlertTriangle, ArrowRight } from 'lucide-vue-next'
import { useAgentViewStore } from '@/store/ai/agentViewStore'
import AskMessageItem from './components/AskMessageItem.vue'
import LoadingMessageItem from './components/LoadingMessageItem.vue'
import TextResponseMessageItem from './components/TextResponseMessageItem.vue'

defineProps<{
  isConfigValid: boolean
}>()
const emit = defineEmits<{
  'open-settings': []
}>()
const { t } = useI18n()
const agentViewStore = useAgentViewStore()
const messagesRef = ref<HTMLElement | null>(null)
const filteredMessages = computed(() => agentViewStore.agentViewMessageList.filter(msg => msg.mode === 'ask'))

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
