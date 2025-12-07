<template>
  <div class="message-item message-agent-execution">
    <div class="message-avatar">
      <Bot :size="20" />
    </div>
    <div class="message-content">
      <AiAgent
        :tool-calls="message.toolCalls"
        :status="message.status"
        @confirm="handleConfirm"
        @cancel="handleCancel"
      />
      <AgentThinkingItem
        v-if="message.thinkingContent"
        :content="message.thinkingContent"
        class="thinking-section"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bot } from 'lucide-vue-next'
import AiAgent from '../../aiAgent/AiAgent.vue'
import AgentThinkingItem from '../../aiAgent/components/AgentThinkingItem.vue'
import type { AgentExecutionMessage } from '@src/types/ai'

defineProps<{
  message: AgentExecutionMessage
}>()
const emit = defineEmits<{
  confirm: [toolCallId: string]
  cancel: [toolCallId: string]
}>()
const handleConfirm = (toolCallId: string) => {
  emit('confirm', toolCallId)
}
const handleCancel = (toolCallId: string) => {
  emit('cancel', toolCallId)
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
  max-width: 85%;
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
</style>
