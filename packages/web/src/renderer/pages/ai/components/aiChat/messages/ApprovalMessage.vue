<template>
  <section class="ai-approval-message" aria-live="polite">
    <div class="ai-approval-heading"><ShieldAlert :size="18" /><div><strong>{{ t('需要你的批准') }}</strong><p>{{ message.toolName }}</p></div></div>
    <div v-if="message.changeSetId" class="ai-approval-change"><span>ChangeSet</span><code>{{ message.changeSetId }}</code></div>
    <ChangeSetMessage v-if="previewMessage" :message="previewMessage" />
    <p v-if="affectsAllProjects" class="ai-approval-reason">{{ t('全局请求头影响所有项目') }}</p>
    <details v-if="message.data !== undefined" class="ai-approval-detail"><summary>{{ t('查看脱敏详情') }}</summary><pre class="ai-approval-preview">{{ formatValue(message.data) }}</pre></details>
    <p v-if="message.reason" class="ai-approval-reason">{{ message.reason }}</p>
    <div v-if="message.state === 'requested'" class="ai-approval-actions">
      <button type="button" @click="agentViewStore.respondApproval(false)">{{ t('拒绝') }}</button>
      <button class="is-primary" type="button" @click="agentViewStore.respondApproval(true)">{{ t('允许') }}</button>
      <button type="button" @click="agentViewStore.stopCurrentConversation()">{{ t('停止') }}</button>
    </div>
    <div v-else class="ai-approval-state">{{ stateLabel }}</div>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { ShieldAlert } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useAgentViewStore } from '@/store/ai/agentView'
import type { PanelUIMessage } from '@src/types/ai'
import ChangeSetMessage from './ChangeSetMessage.vue'
const props = defineProps<{ message: Extract<PanelUIMessage, { kind: 'approval' }> }>()
const { t } = useI18n()
const agentViewStore = useAgentViewStore()
const previewMessage = computed<Extract<PanelUIMessage, { kind: 'change-set' }> | null>(() => {
  const data = props.message.data
  if (!props.message.changeSetId || !data || typeof data !== 'object' || !('target' in data)) return null
  return { id: `${props.message.id}-preview`, kind: 'change-set', changeSetId: props.message.changeSetId, createdAt: props.message.createdAt, state: 'previewed', data: data.target }
})
const affectsAllProjects = computed(() => (JSON.stringify(props.message.data) ?? '').includes('GLOBAL: ALL PROJECTS'))
const stateLabel = computed(() => props.message.state === 'approved' ? t('已批准') : props.message.state === 'denied' ? t('已拒绝') : t('审批已过期'))
const formatValue = (value: unknown): string => typeof value === 'string' ? value : JSON.stringify(value, null, 2)
</script>
<style scoped>
.ai-approval-message { display: grid; gap: 10px; padding: 12px; border: 1px solid var(--el-color-warning-light-5); border-radius: 8px; background: var(--el-color-warning-light-9); }
.ai-approval-heading { display: flex; gap: 8px; color: var(--gray-800); }
.ai-approval-heading svg { color: var(--el-color-warning); }
.ai-approval-heading p { margin: 2px 0 0; color: var(--gray-600); font-size: 12px; }
.ai-approval-change { display: flex; gap: 8px; color: var(--gray-600); font-size: 12px; }
.ai-approval-reason { margin: 0; color: var(--gray-700); font-size: 12px; }
.ai-approval-preview { max-height: 190px; margin: 0; padding: 8px; overflow: auto; border-radius: 6px; background: var(--gray-100); font-size: 11px; white-space: pre-wrap; }
.ai-approval-detail summary { color: var(--gray-600); font-size: 12px; cursor: pointer; }
.ai-approval-actions { display: flex; gap: 7px; }
.ai-approval-actions button { padding: 5px 10px; border: 1px solid var(--gray-300); border-radius: 6px; background: var(--ai-button-bg); color: var(--gray-800); cursor: pointer; }
.ai-approval-actions .is-primary { border-color: var(--theme-color); background: var(--theme-color); color: var(--ai-bubble-user-text); }
.ai-approval-state { color: var(--gray-600); font-size: 12px; }
</style>
