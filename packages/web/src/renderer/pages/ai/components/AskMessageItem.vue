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
