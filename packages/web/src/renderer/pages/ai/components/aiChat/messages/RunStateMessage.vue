<template><div v-if="visible" class="ai-run-state-message"><component :is="icon" :size="14" /><span>{{ label }}</span><small>{{ durationLabel }}</small><small v-if="message.detail">{{ message.detail }}</small></div></template>
<script setup lang="ts">
import { computed } from 'vue'
import { CircleAlert, CircleCheck, CirclePause, CircleStop, Clock3, LoaderCircle } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import type { PanelUIMessage } from '@src/types/ai'
const props = defineProps<{ message: Extract<PanelUIMessage, { kind: 'run-state' }> }>()
const { t } = useI18n()
const visible = computed(() => !['queued', 'running'].includes(props.message.state))
const label = computed(() => ({ waiting_client_tool: t('等待本地工具'), waiting_approval: t('等待审批'), waiting_user_input: t('等待用户输入'), cancelling: t('正在停止'), completed: t('运行完成'), cancelled: t('本次生成已取消'), failed: t('运行失败'), interrupted: t('运行已中断'), queued: t('等待运行'), running: t('运行中') })[props.message.state])
const icon = computed(() => props.message.state === 'completed' ? CircleCheck : props.message.state === 'failed' || props.message.state === 'interrupted' ? CircleAlert : props.message.state === 'cancelled' ? CircleStop : props.message.state === 'waiting_approval' || props.message.state === 'waiting_user_input' ? CirclePause : props.message.state === 'waiting_client_tool' ? LoaderCircle : Clock3)
const durationLabel = computed(() => props.message.startedAt === undefined ? '' : t('运行 {seconds} 秒', { seconds: Math.max(0, Math.floor((props.message.createdAt - props.message.startedAt) / 1000)) }))
</script>
<style scoped>.ai-run-state-message { display: flex; align-items: center; gap: 7px; color: var(--gray-600); font-size: 12px; }.ai-run-state-message small { overflow: hidden; margin-left: auto; text-overflow: ellipsis; white-space: nowrap; }</style>
