<template><details class="ai-invocation-message" :open="message.state === 'running' || message.state === 'failed'"><summary><component :is="icon" :size="14" /><span>{{ message.title }}</span><small>{{ stateLabel }}</small></summary><pre v-if="message.output !== undefined">{{ formatValue(message.output) }}</pre><p v-if="message.error">{{ message.error }}</p></details></template>
<script setup lang="ts">
import { computed } from 'vue'
import { CircleAlert, CircleCheck, CirclePause, LoaderCircle, Workflow } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import type { PanelUIMessage } from '@src/types/ai'
const props = defineProps<{ message: Extract<PanelUIMessage, { kind: 'invocation' }> }>()
const { t } = useI18n()
const stateLabel = computed(() => ({ pending: t('等待运行'), running: t('运行中'), completed: t('运行完成'), failed: t('运行失败'), interrupted: t('运行已中断') })[props.message.state])
const icon = computed(() => props.message.state === 'pending' ? CirclePause : props.message.state === 'running' ? LoaderCircle : props.message.state === 'completed' ? CircleCheck : props.message.state === 'failed' ? CircleAlert : Workflow)
const formatValue = (value: unknown): string => typeof value === 'string' ? value : JSON.stringify(value, null, 2)
</script>
<style scoped>.ai-invocation-message { padding: 7px; border: 1px solid var(--gray-300); border-radius: 7px; color: var(--gray-700); font-size: 12px; }.ai-invocation-message summary { display: flex; align-items: center; gap: 7px; cursor: pointer; }.ai-invocation-message span { flex: 1; }.ai-invocation-message small { color: var(--gray-600); }.ai-invocation-message pre { max-height: 180px; overflow: auto; white-space: pre-wrap; }.ai-invocation-message p { color: var(--el-color-danger); }</style>
