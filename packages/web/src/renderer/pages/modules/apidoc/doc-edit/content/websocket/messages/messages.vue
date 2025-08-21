<template>
  <div class="ws-messages">
    <div class="message-sender">
      <div class="sender-toolbar">
        <el-button-group size="small">
          <el-button 
            :type="messageType === 'text' ? 'primary' : 'default'"
            @click="messageType = 'text'"
          >
            文本
          </el-button>
          <el-button 
            :type="messageType === 'json' ? 'primary' : 'default'"
            @click="messageType = 'json'"
          >
            JSON
          </el-button>
          <el-button 
            :type="messageType === 'binary' ? 'primary' : 'default'"
            @click="messageType = 'binary'"
          >
            二进制
          </el-button>
        </el-button-group>
        
        <div class="sender-actions">
          <el-button size="small" @click="handleClearMessage">清空</el-button>
          <el-button size="small" @click="handleFormatMessage" v-if="messageType === 'json'">格式化</el-button>
          <el-button 
            type="success" 
            size="small" 
            :disabled="connectionState !== 'connected'"
            @click="handleSendMessage"
          >
            发送消息
          </el-button>
        </div>
      </div>

      <div class="message-input">
        <div v-if="messageType === 'text' || messageType === 'json'" class="text-input">
          <el-input
            v-model="messageContent"
            type="textarea"
            :rows="8"
            :placeholder="getPlaceholder()"
            style="font-family: 'Consolas', 'Monaco', 'Courier New', monospace;"
          ></el-input>
        </div>
        
        <div v-else-if="messageType === 'binary'" class="binary-input">
          <el-upload
            class="upload-demo"
            drag
            action=""
            :auto-upload="false"
            :on-change="handleFileChange"
            :show-file-list="false"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持任意格式的文件作为二进制数据发送
              </div>
            </template>
          </el-upload>
          
          <div v-if="binaryFile" class="file-info">
            <el-tag closable @close="handleRemoveFile">
              {{ binaryFile.name }} ({{ formatFileSize(binaryFile.size) }})
            </el-tag>
          </div>
        </div>
      </div>
    </div>

    <div class="message-templates">
      <div class="templates-header">
        <span>消息模板</span>
        <el-button size="small" text @click="templateDialogVisible = true">管理模板</el-button>
      </div>
      
      <div class="templates-list">
        <el-tag 
          v-for="template in messageTemplates" 
          :key="template.id"
          class="template-tag"
          @click="handleUseTemplate(template)"
        >
          {{ template.name }}
        </el-tag>
      </div>
    </div>

    <!-- 发送历史 -->
    <div class="send-history">
      <div class="history-header">
        <span>发送历史 ({{ sendHistory.length }})</span>
        <el-button size="small" text @click="handleClearHistory">清空</el-button>
      </div>
      
      <div class="history-list">
        <div 
          v-for="(item, index) in sendHistory" 
          :key="index"
          class="history-item"
          @click="handleReusMessage(item)"
        >
          <div class="history-content">
            <el-tag :type="getMessageTypeColor(item.type)" size="small">{{ item.type }}</el-tag>
            <span class="content-preview">{{ getContentPreview(item.content) }}</span>
          </div>
          <div class="history-time">{{ formatTime(item.timestamp) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'

interface MessageTemplate {
  id: string
  name: string
  type: string
  content: string
}

interface HistoryItem {
  type: string
  content: string
  timestamp: number
}

const messageType = ref<'text' | 'json' | 'binary'>('text')
const messageContent = ref('')
const binaryFile = ref<File | null>(null)
const connectionState = ref<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
const templateDialogVisible = ref(false)

const messageTemplates = ref<MessageTemplate[]>([
  { id: '1', name: '心跳消息', type: 'json', content: '{"type": "ping", "timestamp": ${Date.now()}}' },
  { id: '2', name: '用户登录', type: 'json', content: '{"type": "login", "userId": "", "token": ""}' },
  { id: '3', name: '发送消息', type: 'json', content: '{"type": "message", "content": "", "to": ""}' },
  { id: '4', name: '简单文本', type: 'text', content: 'Hello WebSocket!' }
])

const sendHistory = ref<HistoryItem[]>([])

const getPlaceholder = () => {
  switch (messageType.value) {
    case 'text':
      return '输入要发送的文本消息...'
    case 'json':
      return '输入JSON格式的消息...\n例如：\n{\n  "type": "message",\n  "content": "Hello World"\n}'
    default:
      return ''
  }
}

const handleSendMessage = () => {
  let content = ''
  let type = messageType.value
  
  if (type === 'binary' && binaryFile.value) {
    content = `[文件: ${binaryFile.value.name}]`
  } else {
    content = messageContent.value
  }
  
  if (!content.trim() && !binaryFile.value) {
    return
  }
  
  // 添加到发送历史
  sendHistory.value.unshift({
    type,
    content,
    timestamp: Date.now()
  })
  
  // 保持历史记录数量
  if (sendHistory.value.length > 50) {
    sendHistory.value = sendHistory.value.slice(0, 50)
  }
  
  console.log('发送消息:', { type, content })
  
  // 清空输入
  if (type !== 'binary') {
    messageContent.value = ''
  }
}

const handleClearMessage = () => {
  messageContent.value = ''
  binaryFile.value = null
}

const handleFormatMessage = () => {
  if (messageType.value === 'json') {
    try {
      const parsed = JSON.parse(messageContent.value)
      messageContent.value = JSON.stringify(parsed, null, 2)
    } catch (error) {
      console.error('JSON格式化失败:', error)
    }
  }
}

const handleFileChange = (file: UploadFile) => {
  binaryFile.value = file.raw || null
}

const handleRemoveFile = () => {
  binaryFile.value = null
}

const handleUseTemplate = (template: MessageTemplate) => {
  messageType.value = template.type as any
  messageContent.value = template.content
}

const handleReusMessage = (item: HistoryItem) => {
  messageType.value = item.type as any
  messageContent.value = item.content
}

const handleClearHistory = () => {
  sendHistory.value = []
}

const getMessageTypeColor = (type: string) => {
  switch (type) {
    case 'json': return 'success'
    case 'binary': return 'warning'
    default: return 'info'
  }
}

const getContentPreview = (content: string) => {
  return content.length > 50 ? content.substring(0, 50) + '...' : content
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style lang="scss" scoped>
.ws-messages {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .message-sender {
    border: 1px solid var(--gray-300);
    border-radius: 8px;
    padding: 16px;

    .sender-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .message-input {
      .text-input {
        :deep(.el-textarea__inner) {
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace !important;
          font-size: 13px;
        }
      }

      .binary-input {
        .file-info {
          margin-top: 12px;
        }
      }
    }
  }

  .message-templates {
    .templates-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 500;
    }

    .templates-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .template-tag {
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      }
    }
  }

  .send-history {
    flex: 1;
    border: 1px solid var(--gray-300);
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: var(--gray-50);
      border-bottom: 1px solid var(--gray-300);
      font-size: 14px;
      font-weight: 500;
    }

    .history-list {
      flex: 1;
      overflow-y: auto;
      padding: 8px;

      .history-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        margin-bottom: 4px;
        transition: background-color 0.2s;

        &:hover {
          background: var(--gray-50);
        }

        .history-content {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 0;

          .content-preview {
            font-size: 13px;
            color: var(--gray-600);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .history-time {
          font-size: 12px;
          color: var(--gray-500);
          flex-shrink: 0;
        }
      }
    }
  }
}
</style>
