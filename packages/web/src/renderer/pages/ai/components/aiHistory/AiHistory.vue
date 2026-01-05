<template>
  <div class="ai-history">
    <div class="ai-history-header">
      <button
        class="ai-history-back"
        type="button"
        @click="handleBack"
        :title="t('返回对话')"
      >
        <ArrowLeft :size="18" />
      </button>
      <span class="ai-history-title">{{ t('历史会话') }}</span>
      <button
        class="ai-history-clear"
        type="button"
        @click="handleClearAll"
        :title="t('清空历史记录')"
        :disabled="sessionList.length === 0"
      >
        <Trash2 :size="16" />
      </button>
    </div>
    <div class="ai-history-body">
      <div v-if="loading" class="ai-history-loading">
        <Loader2 class="ai-history-loading-icon" :size="32" />
        <p class="ai-history-loading-text">{{ t('加载中') }}...</p>
      </div>
      <div v-else-if="sessionList.length === 0" class="ai-history-empty">
        <MessageSquare class="ai-history-empty-icon" :size="48" />
        <p class="ai-history-empty-text">{{ t('暂无历史会话') }}</p>
        <p class="ai-history-empty-hint">{{ t('开始新的对话创建历史记录') }}</p>
      </div>
      <div v-else class="ai-history-list">
        <div
          v-for="session in sessionList"
          :key="session.sessionId"
          class="ai-history-item"
          :class="{ 'is-current': session.sessionId === agentViewStore.currentSessionId }"
          @click="handleSelectSession(session.sessionId)"
        >
          <div class="ai-history-item-content">
            <div class="ai-history-item-title">
              <MessageSquare :size="16" class="ai-history-item-icon" />
              <span>{{ getSessionTitle(session.sessionId) }}</span>
              <span class="ai-history-item-mode" :class="`mode-${getSessionMode(session.sessionId)}`">{{ getSessionMode(session.sessionId) === 'agent' ? 'Agent' : 'Ask' }}</span>
              <span v-if="session.sessionId === agentViewStore.currentSessionId" class="ai-history-item-badge">{{ t('当前') }}</span>
            </div>
            <div class="ai-history-item-meta">
              <span class="ai-history-item-count">{{ session.messageCount }} {{ t('条消息') }}</span>
              <span class="ai-history-item-separator">•</span>
              <span class="ai-history-item-time">{{ formatTime(session.lastMessageTime) }}</span>
            </div>
          </div>
          <button
            v-if="session.sessionId !== agentViewStore.currentSessionId"
            class="ai-history-item-delete"
            type="button"
            @click.stop="handleDeleteSession(session.sessionId)"
            :title="t('删除会话')"
          >
            <Trash2 :size="16" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowLeft, MessageSquare, Trash2, Loader2 } from 'lucide-vue-next'
import { ElMessageBox } from 'element-plus'
import { agentViewCache } from '@/cache/ai/agentViewCache'
import { useAgentViewStore } from '@/store/ai/agentView'
import type { AgentViewMessage } from '@src/types/ai'

type SessionInfo = {
  sessionId: string
  lastMessageTime: string
  messageCount: number
}

const { t } = useI18n()
const agentViewStore = useAgentViewStore()

const sessionList = ref<SessionInfo[]>([])
const loading = ref(false)
const sessionTitles = ref<Map<string, string>>(new Map())
const sessionModes = ref<Map<string, 'agent' | 'ask'>>(new Map())

const loadSessionList = async () => {
  loading.value = true
  try {
    const list = await agentViewCache.getSessionList()
    sessionList.value = list
    for (const session of list) {
      await loadSessionTitle(session.sessionId)
    }
  } finally {
    loading.value = false
  }
}
const loadSessionTitle = async (sessionId: string) => {
  const messages = await agentViewCache.getMessagesBySessionId(sessionId)
  const firstAskMessage = messages.find((msg: AgentViewMessage) => msg.type === 'ask')
  if (firstAskMessage && firstAskMessage.type === 'ask') {
    const title = firstAskMessage.content.length > 30
      ? firstAskMessage.content.substring(0, 30) + '...'
      : firstAskMessage.content
    sessionTitles.value.set(sessionId, title)
    sessionModes.value.set(sessionId, firstAskMessage.mode)
  } else {
    sessionTitles.value.set(sessionId, t('新对话'))
    const firstMessage = messages[0]
    sessionModes.value.set(sessionId, firstMessage?.mode || 'ask')
  }
}
const getSessionMode = (sessionId: string): 'agent' | 'ask' => {
  return sessionModes.value.get(sessionId) || 'ask'
}
const getSessionTitle = (sessionId: string): string => {
  return sessionTitles.value.get(sessionId) || t('新对话')
}
const formatTime = (timestamp: string): string => {
  const now = new Date()
  const time = new Date(timestamp)
  const diff = now.getTime() - time.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) {
    return t('刚刚')
  } else if (minutes < 60) {
    return `${minutes}${t('分钟前')}`
  } else if (hours < 24) {
    return `${hours}${t('小时前')}`
  } else {
    return `${days}${t('天前')}`
  }
}
const handleBack = () => {
  agentViewStore.handleBackToChat()
}
const handleSelectSession = (sessionId: string) => {
  if (sessionId === agentViewStore.currentSessionId) {
    agentViewStore.handleBackToChat()
  } else {
    agentViewStore.handleSelectSession(sessionId, getSessionMode(sessionId))
  }
}
const handleDeleteSession = async (sessionId: string) => {
  await agentViewCache.deleteMessagesBySessionId(sessionId)
  await loadSessionList()
}
const handleClearAll = async () => {
  if (sessionList.value.length === 0) return
  try {
    await ElMessageBox.confirm(
      t('确定清空所有历史会话吗？此操作不可恢复'),
      t('确定清空'),
      {
        confirmButtonText: t('确定/AiHistoryClearAll'),
        cancelButtonText: t('取消'),
        type: 'warning'
      }
    )
    await agentViewStore.clearAllSessions()
    sessionList.value = []
    sessionTitles.value.clear()
  } catch {
    // 用户取消
  }
}
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    handleBack()
  }
}

onMounted(() => {
  loadSessionList()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.ai-history {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.ai-history-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--ai-history-border);
  flex-shrink: 0;
}
.ai-history-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: var(--ai-text-secondary);
  transition: all 0.2s;
  flex-shrink: 0;
  margin-left: auto;
}
.ai-history-clear:hover:not(:disabled) {
  background: var(--ai-history-delete-hover-bg);
  color: var(--ai-history-delete-hover-text);
}
.ai-history-clear:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.ai-history-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: var(--ai-text-primary);
  transition: all 0.2s;
  flex-shrink: 0;
}
.ai-history-back:hover {
  background: var(--ai-action-hover-bg);
  color: var(--theme-color);
}
.ai-history-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-900);
}
.ai-history-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}
.ai-history-body::-webkit-scrollbar {
  width: 6px;
}
.ai-history-body::-webkit-scrollbar-track {
  background: transparent;
}
.ai-history-body::-webkit-scrollbar-thumb {
  background: var(--ai-scrollbar-thumb);
  border-radius: 3px;
}
.ai-history-body::-webkit-scrollbar-thumb:hover {
  background: var(--ai-scrollbar-hover);
}
.ai-history-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
}
.ai-history-loading-icon {
  color: var(--theme-color);
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.ai-history-loading-text {
  font-size: 14px;
  color: var(--gray-500);
}
.ai-history-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  padding: 24px;
  text-align: center;
}
.ai-history-empty-icon {
  color: var(--gray-300);
}
.ai-history-empty-text {
  font-size: 16px;
  font-weight: 500;
  color: var(--gray-700);
  margin: 0;
}
.ai-history-empty-hint {
  font-size: 14px;
  color: var(--gray-500);
  margin: 0;
}
.ai-history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ai-history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--ai-history-border);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--ai-history-item-bg);
}
.ai-history-item:hover {
  border-color: var(--theme-color);
  background: var(--ai-history-item-hover-bg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.ai-history-item.is-current {
  border-color: var(--theme-color);
  background: var(--ai-history-item-current-bg);
}
.ai-history-item.is-current:hover {
  background: var(--ai-history-item-current-hover);
}
.ai-history-item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ai-history-item-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--gray-900);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ai-history-item-badge {
  padding: 2px 6px;
  background: var(--ai-history-badge-bg);
  color: var(--ai-history-badge-text);
  font-size: 11px;
  font-weight: 500;
  border-radius: 3px;
  white-space: nowrap;
  flex-shrink: 0;
}
.ai-history-item-mode {
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 500;
  border-radius: 3px;
  white-space: nowrap;
  flex-shrink: 0;
}
.ai-history-item-mode.mode-agent {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}
.ai-history-item-mode.mode-ask {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}
.ai-history-item-icon {
  flex-shrink: 0;
  color: var(--theme-color);
}
.ai-history-item-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--gray-500);
}
.ai-history-item-count {
  white-space: nowrap;
}
.ai-history-item-separator {
  color: var(--gray-300);
}
.ai-history-item-time {
  white-space: nowrap;
}
.ai-history-item-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: var(--gray-400);
  transition: all 0.2s;
  flex-shrink: 0;
  opacity: 0;
}
.ai-history-item:hover .ai-history-item-delete {
  opacity: 1;
}
.ai-history-item-delete:hover {
  background: var(--ai-history-delete-hover-bg);
  color: var(--ai-history-delete-hover-text);
}
</style>
