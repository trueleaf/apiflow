<template>
  <div class="message-item message-loading">
    <div class="message-avatar">
      <Bot :size="20" />
    </div>
    <div class="message-content">
      <div class="message-bubble">
        <div class="loading-dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bot } from 'lucide-vue-next'
import type { LoadingMessage } from '@src/types/ai'

defineProps<{
  message: LoadingMessage
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
.message-loading {
  justify-content: flex-start;
}
.message-loading .message-content {
  max-width: 80%;
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
.message-bubble {
  padding: 5px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  word-break: break-word;
}
.message-loading .message-bubble {
  background: var(--ai-bubble-ai-bg);
  color: var(--ai-bubble-ai-text);
  border-top-left-radius: 4px;
}
.loading-dots {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 4px 0;
}
.loading-dots .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ai-loading-dot);
  animation: dotBounce 1.4s infinite ease-in-out both;
}
.loading-dots .dot:nth-child(1) {
  animation-delay: -0.32s;
}
.loading-dots .dot:nth-child(2) {
  animation-delay: -0.16s;
}
@keyframes dotBounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
