<template><div class="ai-compact-message"><Archive :size="14" />{{ message.state === 'start' ? t('正在压缩上下文') : t('上下文压缩完成') }}</div></template>
<script setup lang="ts">
import { Archive } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import type { PanelUIMessage } from '@src/types/ai'
defineProps<{ message: Extract<PanelUIMessage, { kind: 'compacting' }> }>()
const { t } = useI18n()
</script>
<style scoped>.ai-compact-message { display: flex; align-items: center; gap: 6px; color: var(--gray-600); font-size: 12px; }</style>
