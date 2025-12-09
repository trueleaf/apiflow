<template>
  <div class="message-item message-error">
    <div class="message-avatar error-avatar">
      <AlertCircle :size="20" />
    </div>
    <div class="message-content">
      <div class="message-bubble error-bubble">
        <div class="error-content">
          <span class="error-text">{{ errorText }}</span>
          <span v-if="message.errorDetail" class="error-detail">{{ message.errorDetail }}</span>
        </div>
        <button class="retry-btn" type="button" @click="handleRetry">
          <RotateCcw :size="14" />
          <span>{{ t('重试') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { AlertCircle, RotateCcw } from 'lucide-vue-next'
import type { ErrorMessage } from '@src/types/ai'

const props = defineProps<{
  message: ErrorMessage
}>()
const emit = defineEmits<{
  retry: [originalPrompt: string, mode: 'agent' | 'ask', messageId: string]
}>()
const { t } = useI18n()
const errorText = computed(() => {
  switch (props.message.errorType) {
    case 'network':
      return t('网络请求失败')
    case 'api':
      return t('API调用失败')
    default:
      return t('未知错误')
  }
})
const handleRetry = () => {
  emit('retry', props.message.originalPrompt, props.message.mode, props.message.id)
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
.message-error {
  justify-content: flex-start;
}
.message-error .message-content {
  max-width: 80%;
}
.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.error-avatar {
  background: var(--ai-error-avatar-bg, rgba(239, 68, 68, 0.15));
  color: var(--ai-error-color, #ef4444);
}
.message-bubble {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  word-break: break-word;
}
.error-bubble {
  background: var(--ai-error-bubble-bg, rgba(239, 68, 68, 0.08));
  border: 1px solid var(--ai-error-border, rgba(239, 68, 68, 0.2));
  border-top-left-radius: 4px;
}
.error-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.error-text {
  color: var(--ai-error-color, #ef4444);
  font-weight: 500;
}
.error-detail {
  color: var(--ai-text-secondary);
  font-size: 12px;
}
.retry-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  padding: 4px 10px;
  background: transparent;
  border: 1px solid var(--ai-error-border, rgba(239, 68, 68, 0.3));
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  color: var(--ai-error-color, #ef4444);
}
.retry-btn:hover {
  background: var(--ai-error-hover-bg, rgba(239, 68, 68, 0.1));
  border-color: var(--ai-error-color, #ef4444);
}
</style>
