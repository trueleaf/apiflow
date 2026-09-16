<template><div class="ai-finish-message"><CircleCheck :size="14" /><span>{{ t('模型输出结束') }}</span><small>{{ usageLabel }}</small></div></template>
<script setup lang="ts">
import { computed } from 'vue'
import { CircleCheck } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import type { PanelUIMessage } from '@src/types/ai'
const props = defineProps<{ message: Extract<PanelUIMessage, { kind: 'finish' }> }>()
const { t } = useI18n()
const usageLabel = computed(() => props.message.usage.totalTokens === undefined ? props.message.finishReason : t('{count} Tokens', { count: props.message.usage.totalTokens }))
</script>
<style scoped>.ai-finish-message { display: flex; align-items: center; gap: 7px; color: var(--gray-600); font-size: 12px; }.ai-finish-message svg { color: var(--el-color-success); }.ai-finish-message small { margin-left: auto; }</style>
