<template><article class="ai-file-message"><FileText :size="15" /><div><strong>{{ message.filename || t('文件') }}</strong><small>{{ message.mediaType }}</small></div><a v-if="safeUrl" :href="safeUrl" target="_blank" rel="noopener noreferrer">{{ t('打开') }}</a></article></template>
<script setup lang="ts">
import { computed } from 'vue'
import { FileText } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import type { PanelUIMessage } from '@src/types/ai'
const props = defineProps<{ message: Extract<PanelUIMessage, { kind: 'file' }> }>()
const { t } = useI18n()
const safeUrl = computed(() => {
  if (!props.message.url) return null
  try { const parsed = new URL(props.message.url); return parsed.protocol === 'https:' ? parsed.href : null } catch { return null }
})
</script>
<style scoped>.ai-file-message { display: flex; align-items: center; gap: 8px; padding: 8px; border: 1px solid var(--gray-300); border-radius: 7px; color: var(--gray-700); font-size: 12px; }.ai-file-message div { display: grid; flex: 1; }.ai-file-message small { color: var(--gray-600); }.ai-file-message a { color: var(--theme-color); }</style>
