<template><details class="ai-change-set-message"><summary><GitCompareArrows :size="15" /><strong>{{ t('变更集') }}</strong><code>{{ message.changeSetId }}</code><span>{{ stateLabel }}</span></summary><div v-if="previewItems.length" class="ai-change-items"><article v-for="(item, index) in previewItems" :key="`${operationLabel(item)}-${index}`"><header><strong>{{ operationLabel(item) }}</strong><span>{{ item.target }}</span><small>{{ item.risk }}</small></header><div v-if="item.before !== undefined"><b>{{ t('变更前') }}</b><pre>{{ formatValue(item.before) }}</pre></div><div v-if="item.after !== undefined"><b>{{ t('变更后') }}</b><pre>{{ formatValue(item.after) }}</pre></div></article></div><pre v-else-if="message.data !== undefined">{{ formatValue(message.data) }}</pre></details></template>
<script setup lang="ts">
import { GitCompareArrows } from 'lucide-vue-next'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { PanelUIMessage } from '@src/types/ai'
const props = defineProps<{ message: Extract<PanelUIMessage, { kind: 'change-set' }> }>()
const { t } = useI18n()
const toRecord = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
const previewItems = computed(() => {
  const record = toRecord(props.message.data)
  return Array.isArray(record.items) ? record.items.map(toRecord) : []
})
const stateLabel = computed(() => ({ draft: t('草案'), previewed: t('已预览'), approved: t('已批准'), applying: t('正在应用'), applied: t('已应用'), discarded: t('已丢弃'), failed: t('应用失败'), expired: t('审批已过期') } as Record<string, string>)[props.message.state] ?? props.message.state)
const operationLabel = (item: Record<string, unknown>): string => typeof item.operation === 'string' ? item.operation : t('变更操作')
const formatValue = (value: unknown): string => typeof value === 'string' ? value : JSON.stringify(value, null, 2)
</script>
<style scoped>.ai-change-set-message { padding: 8px; border: 1px solid var(--gray-300); border-radius: 7px; color: var(--gray-700); font-size: 12px; }.ai-change-set-message summary { display: flex; align-items: center; gap: 7px; cursor: pointer; }.ai-change-set-message code { flex: 1; overflow: hidden; text-overflow: ellipsis; }.ai-change-set-message pre { max-height: 160px; margin: 4px 0 0; padding: 6px; overflow: auto; border-radius: 5px; background: var(--gray-100); overflow-wrap: anywhere; white-space: pre-wrap; }.ai-change-items { display: grid; gap: 8px; padding-top: 8px; }.ai-change-items article { padding: 7px; border: 1px solid var(--gray-200); border-radius: 6px; }.ai-change-items header { display: flex; align-items: center; gap: 7px; }.ai-change-items header span { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.ai-change-items header small { color: var(--el-color-warning); }.ai-change-items b { display: block; margin-top: 6px; }</style>
