<template>
  <div class="ws-message-history">
    <div class="history-toolbar">
      <div class="toolbar-left">
        <span class="title">消息记录</span>
        <el-tag :type="getConnectionStatusType()" size="small">
          {{ getConnectionStatusText() }}
        </el-tag>
        <span class="message-count">({{ filteredMessages.length }})</span>
      </div>
      
      <div class="toolbar-right">
        <el-button-group size="small">
          <el-button 
            :type="messageFilter === 'all' ? 'primary' : 'default'"
            @click="messageFilter = 'all'"
          >
            全部
          </el-button>
          <el-button 
            :type="messageFilter === 'send' ? 'primary' : 'default'"
            @click="messageFilter = 'send'"
          >
            发送
          </el-button>
          <el-button 
            :type="messageFilter === 'receive' ? 'primary' : 'default'"
            @click="messageFilter = 'receive'"
          >
            接收
          </el-button>
        </el-button-group>
        <el-button size="small" @click="handleClearMessages">清空</el-button>
        <el-button size="small" @click="handleExportMessages">导出</el-button>
      </div>
    </div>

    <div class="messages-container">
      <div v-if="filteredMessages.length === 0" class="empty-state">
        <el-empty description="暂无消息记录" :image-size="80">
          <div v-if="connectionState === 'disconnected'">
            <p>请先连接到WebSocket服务器</p>
          </div>
          <div v-else>
            <p>开始发送或接收消息后，消息记录将显示在这里</p>
          </div>
        </el-empty>
      </div>
      
      <div v-else class="messages-list" ref="messagesListRef">
        <div 
          v-for="message in filteredMessages" 
          :key="message.id"
          class="message-item"
          :class="{ 
            'message-send': message.direction === 'send',
            'message-receive': message.direction === 'receive'
          }"
        >
          <div class="message-header">
            <div class="message-info">
              <el-tag 
                :type="message.direction === 'send' ? 'success' : 'info'" 
                size="small"
              >
                {{ message.direction === 'send' ? '发送' : '接收' }}
              </el-tag>
              <el-tag 
                :type="getMessageTypeColor(message.type)" 
                size="small"
              >
                {{ message.type }}
              </el-tag>
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
              <span class="message-size">{{ formatSize(message.size) }}</span>
            </div>
            
            <div class="message-actions">
              <el-button 
                size="small" 
                text 
                @click="handleCopyMessage(message)"
                title="复制消息"
              >
                <el-icon><CopyDocument /></el-icon>
              </el-button>
              <el-button 
                v-if="message.direction === 'receive'" 
                size="small" 
                text 
                @click="handleReplyMessage(message)"
                title="回复消息"
              >
                <el-icon><Promotion /></el-icon>
              </el-button>
            </div>
          </div>
          
          <div class="message-content">
            <div v-if="message.type === 'text' || message.type === 'json'" class="text-content">
              <pre>{{ formatMessageContent(message) }}</pre>
            </div>
            <div v-else-if="message.type === 'binary'" class="binary-content">
              <div class="binary-info">
                <el-icon><Document /></el-icon>
                <span>二进制数据 ({{ formatSize(message.size) }})</span>
                <el-button size="small" text @click="handleDownloadBinary(message)">
                  下载
                </el-button>
              </div>
            </div>
            <div v-else class="special-content">
              <el-tag>{{ message.type }}</el-tag>
              <span class="special-text">{{ message.data }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="history-stats">
      <div class="stats-item">
        <span class="label">总消息：</span>
        <span class="value">{{ messages.length }}</span>
      </div>
      <div class="stats-item">
        <span class="label">发送：</span>
        <span class="value text-success">{{ sendCount }}</span>
      </div>
      <div class="stats-item">
        <span class="label">接收：</span>
        <span class="value text-info">{{ receiveCount }}</span>
      </div>
      <div class="stats-item">
        <span class="label">总流量：</span>
        <span class="value">{{ formatSize(totalBytes) }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { CopyDocument, Promotion, Document } from '@element-plus/icons-vue'

interface Message {
  id: string
  type: 'text' | 'json' | 'binary' | 'ping' | 'pong' | 'close'
  data: string | ArrayBuffer | Blob
  direction: 'send' | 'receive'
  timestamp: number
  size: number
}

const messageFilter = ref<'all' | 'send' | 'receive'>('all')
const connectionState = ref<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
const messagesListRef = ref<HTMLElement>()

// 模拟消息数据
const messages = ref<Message[]>([
  {
    id: '1',
    type: 'text',
    data: 'Hello WebSocket!',
    direction: 'send',
    timestamp: Date.now() - 60000,
    size: 16
  },
  {
    id: '2',
    type: 'json',
    data: '{"type": "welcome", "message": "Connected successfully", "timestamp": 1234567890}',
    direction: 'receive',
    timestamp: Date.now() - 50000,
    size: 78
  },
  {
    id: '3',
    type: 'json',
    data: '{"type": "ping", "timestamp": 1234567890}',
    direction: 'send',
    timestamp: Date.now() - 30000,
    size: 34
  },
  {
    id: '4',
    type: 'pong',
    data: 'pong',
    direction: 'receive',
    timestamp: Date.now() - 29000,
    size: 4
  }
])

const filteredMessages = computed(() => {
  if (messageFilter.value === 'all') return messages.value
  return messages.value.filter(msg => msg.direction === messageFilter.value)
})

const sendCount = computed(() => 
  messages.value.filter(msg => msg.direction === 'send').length
)

const receiveCount = computed(() => 
  messages.value.filter(msg => msg.direction === 'receive').length
)

const totalBytes = computed(() => 
  messages.value.reduce((total, msg) => total + msg.size, 0)
)

const getConnectionStatusType = () => {
  switch (connectionState.value) {
    case 'connected': return 'success'
    case 'connecting': return 'warning'
    case 'error': return 'danger'
    default: return 'info'
  }
}

const getConnectionStatusText = () => {
  switch (connectionState.value) {
    case 'connected': return '已连接'
    case 'connecting': return '连接中'
    case 'error': return '连接错误'
    default: return '未连接'
  }
}

const getMessageTypeColor = (type: string) => {
  switch (type) {
    case 'json': return 'success'
    case 'binary': return 'warning'
    case 'ping':
    case 'pong': return 'info'
    case 'close': return 'danger'
    default: return ''
  }
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatMessageContent = (message: Message) => {
  if (message.type === 'json') {
    try {
      const parsed = JSON.parse(message.data as string)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return message.data
    }
  }
  return message.data
}

const handleCopyMessage = (message: Message) => {
  navigator.clipboard.writeText(message.data as string).then(() => {
    console.log('消息已复制到剪贴板')
  })
}

const handleReplyMessage = (message: Message) => {
  console.log('回复消息:', message)
  // 这里可以触发事件到父组件，设置要发送的消息内容
}

const handleDownloadBinary = (message: Message) => {
  console.log('下载二进制数据:', message)
}

const handleClearMessages = () => {
  messages.value = []
}

const handleExportMessages = () => {
  const data = messages.value.map(msg => ({
    timestamp: new Date(msg.timestamp).toISOString(),
    direction: msg.direction,
    type: msg.type,
    size: msg.size,
    data: msg.type === 'binary' ? '[Binary Data]' : msg.data
  }))
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `websocket-messages-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// 自动滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesListRef.value) {
      messagesListRef.value.scrollTop = messagesListRef.value.scrollHeight
    }
  })
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style lang="scss" scoped>
.ws-message-history {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;

  .history-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--gray-300);
    background: var(--gray-50);

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 8px;

      .title {
        font-weight: 500;
        font-size: 14px;
      }

      .message-count {
        color: var(--gray-600);
        font-size: 13px;
      }
    }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .messages-container {
    flex: 1;
    overflow: hidden;
    position: relative;

    .empty-state {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .messages-list {
      height: 100%;
      overflow-y: auto;
      padding: 8px;

      .message-item {
        margin-bottom: 12px;
        border: 1px solid var(--gray-300);
        border-radius: 8px;
        overflow: hidden;

        &.message-send {
          border-left: 3px solid var(--color-success);
        }

        &.message-receive {
          border-left: 3px solid var(--color-info);
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: var(--gray-50);
          border-bottom: 1px solid var(--gray-200);

          .message-info {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;

            .message-time {
              color: var(--gray-600);
            }

            .message-size {
              color: var(--gray-500);
            }
          }

          .message-actions {
            display: flex;
            gap: 4px;
          }
        }

        .message-content {
          padding: 12px;

          .text-content {
            pre {
              margin: 0;
              font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
              font-size: 13px;
              line-height: 1.4;
              white-space: pre-wrap;
              word-break: break-all;
              color: var(--gray-700);
            }
          }

          .binary-content {
            .binary-info {
              display: flex;
              align-items: center;
              gap: 8px;
              color: var(--gray-600);
              font-size: 13px;
            }
          }

          .special-content {
            display: flex;
            align-items: center;
            gap: 8px;

            .special-text {
              font-size: 13px;
              color: var(--gray-600);
            }
          }
        }
      }
    }
  }

  .history-stats {
    display: flex;
    justify-content: space-around;
    padding: 12px 16px;
    background: var(--gray-50);
    border-top: 1px solid var(--gray-300);
    font-size: 12px;

    .stats-item {
      text-align: center;

      .label {
        color: var(--gray-600);
      }

      .value {
        font-weight: 500;
        margin-left: 4px;

        &.text-success {
          color: var(--color-success);
        }

        &.text-info {
          color: var(--color-info);
        }
      }
    }
  }
}
</style>
