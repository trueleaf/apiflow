<template><article class="ai-source-message"><Link2 :size="14" /><div><span>{{ message.title }}</span><a v-if="safeUrl" :href="safeUrl" target="_blank" rel="noopener noreferrer">{{ safeUrl }}</a><small v-else>{{ message.mediaType || t('文档来源') }}</small></div></article></template>
<script setup lang="ts">
import { computed } from 'vue'
import { Link2 } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import type { PanelUIMessage } from '@src/types/ai'
const props = defineProps<{ message: Extract<PanelUIMessage, { kind: 'source' }> }>()
const { t } = useI18n()
const safeUrl = computed(() => {
  if (!props.message.url) return null
  try { const parsed = new URL(props.message.url); return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : null } catch { return null }
})
</script>
<style scoped>
.ai-source-message { display: flex; gap: 8px; padding: 8px; border: 1px solid var(--gray-300); border-radius: 7px; color: var(--gray-700); font-size: 12px; }
.ai-source-message div { display: grid; min-width: 0; gap: 2px; }
.ai-source-message a { overflow: hidden; color: var(--theme-color); text-overflow: ellipsis; white-space: nowrap; }
.ai-source-message small { color: var(--gray-600); }
</style>
