<template><div class="ai-cancelled-message"><CircleStop :size="14" />{{ message.reason || t('本次生成已取消') }}</div></template>
<script setup lang="ts">
import { CircleStop } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import type { PanelUIMessage } from '@src/types/ai'
defineProps<{ message: Extract<PanelUIMessage, { kind: 'abort' }> }>()
const { t } = useI18n()
</script>
<style scoped>.ai-cancelled-message { display: flex; align-items: center; gap: 6px; color: var(--gray-600); font-size: 12px; }</style>
