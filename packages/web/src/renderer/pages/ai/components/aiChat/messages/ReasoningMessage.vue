<template><details class="ai-reasoning-message" :open="message.streaming"><summary><Brain :size="14" />{{ t('思考过程') }}</summary><VueMarkdownRender class="ai-reasoning-content" :source="message.reasoning" :options="markdownOptions" :plugins="[secureAIMarkdown]" /></details></template>
<script setup lang="ts">
import { Brain } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import VueMarkdownRender from 'vue-markdown-render'
import { secureAIMarkdown } from '@/helper/aiMarkdown'
import type { PanelUIMessage } from '@src/types/ai'
defineProps<{ message: Extract<PanelUIMessage, { kind: 'assistant' }> }>()
const { t } = useI18n()
const markdownOptions = { html: false, breaks: true, linkify: true }
</script>
<style scoped>
.ai-reasoning-message { width: 100%; color: var(--gray-600); font-size: 12px; }
.ai-reasoning-message summary { display: flex; align-items: center; gap: 6px; cursor: pointer; user-select: none; }
.ai-reasoning-content { padding: 4px 0 0 20px; line-height: 1.55; }
</style>
