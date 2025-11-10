<template>
  <div class="conversation-history">
    <div class="conversation-history-header">
      <button
        class="conversation-history-back"
        type="button"
        @click="handleBack"
        :title="t('返回对话')"
      >
        <ArrowLeft :size="18" />
      </button>
      <span class="conversation-history-title">{{ t('历史会话') }}</span>
    </div>
    <div class="conversation-history-body">
      <div v-if="loading" class="conversation-history-loading">
        <Loader2 class="conversation-history-loading-icon" :size="32" />
        <p class="conversation-history-loading-text">{{ t('加载中') }}...</p>
      </div>
      <div v-else-if="sessionList.length === 0" class="conversation-history-empty">
        <MessageSquare class="conversation-history-empty-icon" :size="48" />
        <p class="conversation-history-empty-text">{{ t('暂无历史会话') }}</p>
        <p class="conversation-history-empty-hint">{{ t('开始新的对话创建历史记录') }}</p>
      </div>
      <div v-else class="conversation-history-list">
        <div
          v-for="session in sessionList"
          :key="session.sessionId"
          class="conversation-history-item"
          :class="{ 'is-current': session.sessionId === agentStore.currentSessionId }"
          @click="handleSelectSession(session.sessionId)"
        >
          <div class="conversation-history-item-content">
            <div class="conversation-history-item-title">
              <MessageSquare :size="16" class="conversation-history-item-icon" />
              <span>{{ getSessionTitle(session.sessionId) }}</span>
              <span v-if="session.sessionId === agentStore.currentSessionId" class="conversation-history-item-badge">{{ t('当前') }}</span>
            </div>
            <div class="conversation-history-item-meta">
              <span class="conversation-history-item-count">{{ session.messageCount }} {{ t('条消息') }}</span>
              <span class="conversation-history-item-separator">•</span>
              <span class="conversation-history-item-time">{{ formatTime(session.lastMessageTime) }}</span>
            </div>
          </div>
          <button
            v-if="session.sessionId !== agentStore.currentSessionId"
            class="conversation-history-item-delete"
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
import { ElMessage } from 'element-plus'
import { agentCache } from '@/cache/ai/agentCache'
import { useAgentStore } from '@/store/agent/agentStore'
import type { AgentMessage } from '@src/types/ai'

type SessionInfo = {
  sessionId: string
  lastMessageTime: string
  messageCount: number
}

const { t } = useI18n()
const agentStore = useAgentStore()
const emit = defineEmits<{
  (event: 'back'): void
  (event: 'select', sessionId: string): void
}>()

const sessionList = ref<SessionInfo[]>([])
const loading = ref(false)
const sessionTitles = ref<Map<string, string>>(new Map())

const loadSessionList = async () => {
  loading.value = true
  try {
    const list = await agentCache.getSessionList()
    sessionList.value = list
    for (const session of list) {
      await loadSessionTitle(session.sessionId)
    }
  } finally {
    loading.value = false
  }
}
const loadSessionTitle = async (sessionId: string) => {
  const messages = await agentCache.getMessagesBySessionId(sessionId)
  const firstAskMessage = messages.find((msg: AgentMessage) => msg.type === 'ask')
  if (firstAskMessage && firstAskMessage.type === 'ask') {
    const title = firstAskMessage.content.length > 30
      ? firstAskMessage.content.substring(0, 30) + '...'
      : firstAskMessage.content
    sessionTitles.value.set(sessionId, title)
  } else {
    sessionTitles.value.set(sessionId, t('新对话'))
  }
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
  emit('back')
}
const handleSelectSession = (sessionId: string) => {
  if (sessionId === agentStore.currentSessionId) {
    emit('back')
  } else {
    emit('select', sessionId)
  }
}
const handleDeleteSession = async (sessionId: string) => {
  await agentCache.deleteMessagesBySessionId(sessionId)
  await loadSessionList()
  ElMessage.success(t('删除成功'))
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
