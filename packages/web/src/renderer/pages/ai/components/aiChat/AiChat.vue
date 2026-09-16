<template>
  <main ref="messagesRef" class="ai-chat-view" @scroll="handleScroll">
    <div v-if="!agentViewStore.isAiConfigValid" class="ai-empty-state">
      <AlertTriangle :size="42" />
      <h2>{{ t('配置AI助手') }}</h2>
      <p>{{ t('请先前往AI设置配置apiKey与apiUrl') }}</p>
      <button type="button" @click="agentViewStore.openConfig()">{{ t('配置ApiKey') }}<ArrowRight :size="14" /></button>
    </div>
    <div v-else-if="agentViewStore.currentMessages.length === 0" class="ai-empty-state">
      <Sparkles :size="42" />
      <h2>{{ t('今天想设计什么接口？') }}</h2>
      <p>{{ agentViewStore.mode === 'agent' ? t('Agent模式可以自动执行工具调用') : t('问我任何问题') }}</p>
    </div>
    <div v-else class="ai-message-list">
      <template v-for="message in agentViewStore.currentMessages" :key="message.id">
        <UserMessage v-if="message.kind === 'user'" :message="message" :editable="message.id === lastEditableUserId" @edit="agentViewStore.editUserMessage(message.runId)" />
        <template v-else-if="message.kind === 'assistant'">
          <ReasoningMessage v-if="message.reasoning" :message="message" />
          <AnswerMessage v-if="message.text || message.streaming" :message="message" :retryable="agentViewStore.workingStatus !== 'working' && hasUserRun(message.runId)" @retry="agentViewStore.retryRun(message.runId)" />
        </template>
        <ToolMessage v-else-if="message.kind === 'tool'" :message="message" />
        <ToolGroupMessage v-else-if="message.kind === 'tool-group'" :message="message" />
        <ApprovalMessage v-else-if="message.kind === 'approval'" :message="message" />
        <SourceMessage v-else-if="message.kind === 'source'" :message="message" />
        <FileMessage v-else-if="message.kind === 'file'" :message="message" />
        <ErrorMessage v-else-if="message.kind === 'error'" :message="message" :can-retry="message.retryable && agentViewStore.workingStatus !== 'working' && hasUserRun(message.runId)" @retry="agentViewStore.retryRun(message.runId)" />
        <RunStateMessage v-else-if="message.kind === 'run-state'" :message="message" />
        <FinishMessage v-else-if="message.kind === 'finish'" :message="message" />
        <CancelledMessage v-else-if="message.kind === 'abort'" :message="message" />
        <ChangeSetMessage v-else-if="message.kind === 'change-set'" :message="message" />
        <InvocationMessage v-else-if="message.kind === 'invocation'" :message="message" />
        <CompactingMessage v-else-if="message.kind === 'compacting'" :message="message" />
        <ActivityMessage v-else-if="message.kind === 'client-command' || message.kind === 'conversation-updated'" :message="message" />
      </template>
      <WorkingMessage v-if="agentViewStore.workingStatus === 'working'" :started-at="workingStartedAt" />
    </div>
  </main>
</template>
<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { AlertTriangle, ArrowRight, Sparkles } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useAgentViewStore } from '@/store/ai/agentView'
import AnswerMessage from './messages/AnswerMessage.vue'
import ActivityMessage from './messages/ActivityMessage.vue'
import ApprovalMessage from './messages/ApprovalMessage.vue'
import CancelledMessage from './messages/CancelledMessage.vue'
import ChangeSetMessage from './messages/ChangeSetMessage.vue'
import CompactingMessage from './messages/CompactingMessage.vue'
import ErrorMessage from './messages/ErrorMessage.vue'
import FileMessage from './messages/FileMessage.vue'
import FinishMessage from './messages/FinishMessage.vue'
import InvocationMessage from './messages/InvocationMessage.vue'
import ReasoningMessage from './messages/ReasoningMessage.vue'
import RunStateMessage from './messages/RunStateMessage.vue'
import SourceMessage from './messages/SourceMessage.vue'
import ToolMessage from './messages/ToolMessage.vue'
import ToolGroupMessage from './messages/ToolGroupMessage.vue'
import UserMessage from './messages/UserMessage.vue'
import WorkingMessage from './messages/WorkingMessage.vue'
const { t } = useI18n()
const agentViewStore = useAgentViewStore()
const messagesRef = ref<HTMLElement | null>(null)
const shouldFollow = ref(true)
const activeRunId = computed(() => [...agentViewStore.currentEvents].reverse().find(event => event.type === 'run-state' && !['completed', 'cancelled', 'failed', 'interrupted'].includes(event.state))?.runId)
const workingStartedAt = computed(() => agentViewStore.currentEvents.find(event => event.runId === activeRunId.value && event.type === 'run-state' && event.state === 'running')?.createdAt ?? Date.now())
const lastEditableUserId = computed(() => {
  if (agentViewStore.workingStatus === 'working') return ''
  return [...agentViewStore.currentMessages].reverse().find(message => message.kind === 'user')?.id ?? ''
})
const hasUserRun = (runId: string): boolean => agentViewStore.currentEvents.some(event => event.runId === runId && event.type === 'user-message')
const handleScroll = (): void => {
  if (!messagesRef.value) return
  shouldFollow.value = messagesRef.value.scrollHeight - messagesRef.value.scrollTop - messagesRef.value.clientHeight < 80
}
watch(() => agentViewStore.currentEvents, () => {
  if (!shouldFollow.value) return
  void nextTick(() => { if (messagesRef.value) messagesRef.value.scrollTop = messagesRef.value.scrollHeight })
}, { deep: true })
</script>
<style scoped>
.ai-chat-view { display: flex; min-height: 0; flex: 1; flex-direction: column; overflow-y: auto; background: var(--ai-dialog-bg); scrollbar-gutter: stable; }
.ai-message-list { display: flex; width: min(100% - 32px, 736px); flex-direction: column; gap: 21px; margin: 0 auto; padding: 62px 0 28px; }
.ai-empty-state { display: flex; min-height: 100%; align-items: center; flex-direction: column; justify-content: center; gap: 10px; color: var(--ai-text-secondary); text-align: center; }
.ai-empty-state p { margin: 0; }
.ai-empty-state h2 { margin: 6px 0 0; color: var(--ai-text-primary); font-size: 22px; font-weight: 600; line-height: 1.4; }
.ai-empty-state p { max-width: 440px; padding: 0 24px; font-size: 14px; line-height: 24px; }
.ai-empty-state button { display: inline-flex; align-items: center; gap: 5px; padding: 6px 10px; border: 1px solid var(--ai-dialog-border); border-radius: 6px; background: var(--ai-button-bg); color: var(--ai-text-primary); cursor: pointer; }
@media (max-width: 640px) { .ai-message-list { width: calc(100% - 24px); gap: 18px; padding: 56px 0 22px; } }
</style>
