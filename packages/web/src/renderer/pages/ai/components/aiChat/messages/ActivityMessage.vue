<template><div class="ai-activity-message"><PanelTop :size="13" /><span>{{ label }}</span></div></template>
<script setup lang="ts">
import { computed } from 'vue'
import { PanelTop } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import type { PanelUIMessage } from '@src/types/ai'
const props = defineProps<{ message: Extract<PanelUIMessage, { kind: 'client-command' | 'conversation-updated' }> }>()
const { t } = useI18n()
const label = computed(() => props.message.kind === 'client-command' ? t('正在执行本地工具：{name}', { name: props.message.toolName }) : props.message.title || t('会话已更新'))
</script>
<style scoped>.ai-activity-message { display: flex; align-items: center; gap: 6px; color: var(--gray-600); font-size: 11px; }</style>
