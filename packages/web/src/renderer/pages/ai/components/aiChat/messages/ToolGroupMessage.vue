<template><details class="ai-tool-group" :open="running"><summary><Boxes :size="15" /><strong>{{ t('{count} 个工具调用', { count: message.tools.length }) }}</strong><span>{{ running ? t('运行中') : t('已完成') }}</span></summary><div class="ai-tool-group-list"><ToolMessage v-for="tool in message.tools" :key="tool.toolCallId" :message="tool" /></div></details></template>
<script setup lang="ts">
import { computed } from 'vue'
import { Boxes } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import type { PanelUIMessage } from '@src/types/ai'
import ToolMessage from './ToolMessage.vue'
const props = defineProps<{ message: Extract<PanelUIMessage, { kind: 'tool-group' }> }>()
const { t } = useI18n()
const running = computed(() => props.message.tools.some(tool => tool.state === 'created' || tool.state === 'running'))
</script>
<style scoped>.ai-tool-group { padding: 8px; border: 1px solid var(--ai-tool-border); border-radius: 8px; }.ai-tool-group summary { display: flex; align-items: center; gap: 7px; color: var(--gray-700); cursor: pointer; font-size: 12px; }.ai-tool-group summary span { margin-left: auto; color: var(--gray-600); }.ai-tool-group-list { display: grid; gap: 7px; padding-top: 8px; }</style>
