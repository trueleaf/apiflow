<template>
  <div class="message-item message-ask">
    <div class="message-content">
      <div class="message-bubble">
        <div class="message-text">{{ message.content }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AskMessage } from '@src/types/ai'

defineProps<{
  message: AskMessage
}>()
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
.message-ask {
  justify-content: flex-end;
}
.message-ask .message-content {
  max-width: 80%;
}
.message-bubble {
  padding: 5px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  word-break: break-word;
}
.message-ask .message-bubble {
  background: var(--ai-bubble-user-bg);
  color: var(--ai-bubble-user-text);
  border-top-right-radius: 4px;
}
.message-text {
  white-space: pre-wrap;
}
</style>
