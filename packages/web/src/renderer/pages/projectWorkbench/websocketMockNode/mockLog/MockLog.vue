<template>
  <div class="log-page">
    <div class="operation">
      <div class="operation-btn" @click="handleClearLogs">
        <Trash2 :size="16" />
        <span>{{ t('清除') }}</span>
      </div>
      <el-button type="primary" size="small" :loading="loading" @click="fetchLogs">
        {{ t('刷新日志') }}
      </el-button>
    </div>

    <div class="log-container">
      <div v-if="loading" class="log-loading">{{ t('正在加载日志...') }}</div>
      <ElEmpty
        v-else-if="!logs.length"
        :description="t('暂无日志')"
        class="log-empty"
      />
      <div v-else class="log-list">
        <div
          v-for="(log, index) in logs"
          :key="log.id || index"
          class="log-item"
          :class="getLogClass(log)"
        >
          <span class="log-time">{{ formatTime(log.timestamp) }}</span>
          <span class="log-type">{{ getLogTypeLabel(log.type) }}</span>
          <span class="log-content">{{ getLogContent(log) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Trash2 } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { IPC_EVENTS } from '@src/types/ipc'
import type { WebSocketMockLog } from '@src/types/mockNode'

const { t } = useI18n()
const projectNavStore = useProjectNav()
const { currentSelectNav } = storeToRefs(projectNavStore)
const logs = ref<WebSocketMockLog[]>([])
const loading = ref(false)

// 格式化时间
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  })
}
// 获取日志类型标签
const getLogTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    start: t('启动'),
    stop: t('停止'),
    connect: t('连接'),
    disconnect: t('断开'),
    receive: t('收到'),
    send: t('发送'),
    error: t('错误'),
  }
  return typeMap[type] || type
}
// 获取日志内容
const getLogContent = (log: WebSocketMockLog): string => {
  switch (log.type) {
    case 'start':
      return `${t('端口')}: ${log.data.port}, ${t('路径')}: ${log.data.path}`
    case 'stop':
      return `${t('端口')}: ${log.data.port}`
    case 'connect':
      return `${t('客户端')}: ${log.data.clientId}, IP: ${log.data.ip}`
    case 'disconnect':
      return `${t('客户端')}: ${log.data.clientId}, ${t('代码')}: ${log.data.code}`
    case 'receive':
      return `${t('客户端')}: ${log.data.clientId}, ${t('内容')}: ${truncate(log.data.content, 50)}`
    case 'send':
      return `${t('客户端')}: ${log.data.clientId}, ${t('类型')}: ${log.data.messageType}, ${t('内容')}: ${truncate(log.data.content, 50)}`
    case 'error':
      return log.data.errorMsg
    default:
      return ''
  }
}
// 截断字符串
const truncate = (str: string, maxLen: number): string => {
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen) + '...'
}
// 获取日志样式类
const getLogClass = (log: WebSocketMockLog): string => {
  switch (log.type) {
    case 'error':
      return 'log-error'
    case 'connect':
      return 'log-connect'
    case 'disconnect':
      return 'log-disconnect'
    case 'receive':
      return 'log-receive'
    case 'send':
      return 'log-send'
    default:
      return ''
  }
}
// 刷新日志（目前仅清空并等待新日志）
const fetchLogs = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 300)
}
// 清除日志
const handleClearLogs = () => {
  logs.value = []
}
// 处理收到的日志批次
const handleLogsBatch = (batchLogs: WebSocketMockLog[]) => {
  if (!currentSelectNav.value) return
  const nodeId = currentSelectNav.value._id
  const nodeLogs = batchLogs.filter(log => log.nodeId === nodeId)
  if (nodeLogs.length > 0) {
    logs.value = [...logs.value, ...nodeLogs]
    // 限制日志数量
    if (logs.value.length > 1000) {
      logs.value = logs.value.slice(-1000)
    }
  }
}
// 设置 IPC 监听
onMounted(() => {
  if (window.electronAPI?.ipcManager?.onMain) {
    window.electronAPI.ipcManager.onMain(
      IPC_EVENTS.websocketMock.mainToRenderer.logsBatch,
      handleLogsBatch
    )
  }
})
onUnmounted(() => {
  if (window.electronAPI?.ipcManager?.removeListener) {
    window.electronAPI.ipcManager.removeListener(
      IPC_EVENTS.websocketMock.mainToRenderer.logsBatch
    )
  }
})
</script>

<style lang="scss" scoped>
.log-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px 20px;
}

.operation {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;

  .operation-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    font-size: 13px;
    color: var(--gray-600);
    background: var(--gray-100);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      color: var(--gray-800);
      background: var(--gray-200);
    }
  }
}

.log-container {
  flex: 1;
  overflow-y: auto;
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: 4px;
}

.log-loading,
.log-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--gray-500);
}

.log-list {
  padding: 8px;
}

.log-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 6px 8px;
  font-size: 12px;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  border-radius: 4px;

  &:hover {
    background: var(--gray-100);
  }

  .log-time {
    flex-shrink: 0;
    color: var(--gray-500);
  }

  .log-type {
    flex-shrink: 0;
    min-width: 40px;
    font-weight: 500;
  }

  .log-content {
    flex: 1;
    word-break: break-all;
    color: var(--gray-700);
  }

  &.log-error {
    background: var(--red-50);
    .log-type { color: var(--red-600); }
  }

  &.log-connect {
    .log-type { color: var(--green-600); }
  }

  &.log-disconnect {
    .log-type { color: var(--orange-600); }
  }

  &.log-receive {
    .log-type { color: var(--blue-600); }
  }

  &.log-send {
    .log-type { color: var(--purple-600); }
  }
}
</style>
