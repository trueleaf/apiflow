<template>
  <div class="message-item message-tool">
    <div class="message-avatar">
      <Wrench :size="20" />
    </div>
    <div class="message-content">
      <div class="message-bubble">
        <div class="tool-header">
          <Wrench :size="14" />
          <span class="tool-title">{{ t('工具执行') }}</span>
        </div>
        <div class="tool-content">
          <div class="message-text">{{ message.content }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Wrench } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import type { ToolMessage } from '@src/types/ai'

const { t } = useI18n()

defineProps<{
  message: ToolMessage
}>()
</script>
