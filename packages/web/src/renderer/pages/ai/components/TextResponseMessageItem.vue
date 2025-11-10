<template>
  <div class="message-item message-text-response">
    <div class="message-avatar">
      <Bot :size="20" />
    </div>
    <div class="message-content">
      <div class="message-bubble">
        <div class="markdown-content">
          <VueMarkdownRender :source="message.content" :options="markdownOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bot } from 'lucide-vue-next'
import VueMarkdownRender from 'vue-markdown-render'
import type { TextResponseMessage } from '@src/types/ai'

defineProps<{
  message: TextResponseMessage
}>()

const markdownOptions = {
  html: false,
  breaks: true,
  linkify: true
}
</script>
