<template>
  <div class="ws-pre-script">
    <div class="script-toolbar">
      <el-button-group size="small">
        <el-button @click="handleInsertVariable">{{ t("插入变量") }}</el-button>
        <el-button @click="handleInsertFunction">{{ t("插入函数") }}</el-button>
        <el-button @click="handleFormatScript">{{ t("格式化") }}</el-button>
      </el-button-group>
      <el-button size="small" type="primary" @click="handleTestScript">{{ t("测试脚本") }}</el-button>
    </div>

    <div class="script-help">
      <el-alert 
        title="前置脚本说明" 
        type="info" 
        :closable="false"
        show-icon
      >
        <template #default>
          <div>此脚本在建立WebSocket连接前执行，可用于设置连接参数、认证信息等</div>
          <div class="mt-1">
            <strong>可用方法：</strong>
            <code>ws.setHeader(key, value)</code>、
            <code>ws.setParam(key, value)</code>、
            <code>ws.setVariable(key, value)</code>
          </div>
        </template>
      </el-alert>
    </div>

    <div class="script-editor">
      <el-input
        v-model="scriptContent"
        type="textarea"
        :rows="15"
        placeholder="// 连接前脚本示例：
// 设置认证头
ws.setHeader('Authorization', 'Bearer ' + ws.getVariable('token'));

// 设置连接参数
ws.setParam('userId', ws.getVariable('currentUserId'));

// 打印日志
console.log('正在连接到WebSocket服务器...');"
        style="font-family: 'Consolas', 'Monaco', 'Courier New', monospace;"
      ></el-input>
    </div>

    <div class="script-actions">
      <el-button @click="handleClearScript">{{ t("清空") }}</el-button>
      <el-button @click="handleLoadTemplate">{{ t("加载模板") }}</el-button>
      <el-button type="primary" @click="handleSaveScript">{{ t("保存") }}</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useTranslation } from 'i18next-vue'
import { useWebSocket } from '@/store/websocket/websocket'

const { t } = useTranslation()

// 使用WebSocket store
const websocketStore = useWebSocket()

// 从store获取脚本内容
const scriptContent = computed({
  get: () => websocketStore.websocket.preRequest.raw,
  set: (value: string) => websocketStore.changeWebSocketPreRequest(value)
})

const handleInsertVariable = () => {
  const variable = 'ws.getVariable("variableName")'
  insertTextAtCursor(variable)
}

const handleInsertFunction = () => {
  const func = 'ws.setHeader("key", "value")'
  insertTextAtCursor(func)
}

const handleFormatScript = () => {
  // 简单的格式化处理
  try {
    // 这里可以集成代码格式化库
    console.log('格式化脚本')
  } catch (error) {
    console.error('格式化失败:', error)
  }
}

const handleTestScript = () => {
  console.log('测试脚本执行')
}

const handleClearScript = () => {
  websocketStore.changeWebSocketPreRequest('')
}

const handleLoadTemplate = () => {
  const template = `// WebSocket连接前脚本模板
// 获取环境变量
const env = ws.getVariable('environment') || 'development';

// 根据环境设置不同的参数
if (env === 'production') {
  ws.setHeader('Authorization', 'Bearer ' + ws.getVariable('prodToken'));
} else {
  ws.setHeader('Authorization', 'Bearer ' + ws.getVariable('devToken'));
}

// 设置用户信息
ws.setParam('userId', ws.getVariable('userId'));
ws.setParam('clientType', 'apiflow');

// 记录日志
console.log('连接环境:', env);
console.log('连接地址:', ws.getUrl());`
  websocketStore.changeWebSocketPreRequest(template)
}

const handleSaveScript = () => {
  console.log('保存脚本:', scriptContent.value)
  websocketStore.updateWebSocketUpdatedAt()
}

const insertTextAtCursor = (text: string) => {
  // 在光标位置插入文本的简单实现
  const textarea = document.querySelector('.script-editor textarea') as HTMLTextAreaElement
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const value = scriptContent.value
    scriptContent.value = value.substring(0, start) + text + value.substring(end)
    
    // 设置光标位置
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length
      textarea.focus()
    }, 0)
  }
}
</script>

<style lang="scss" scoped>
.ws-pre-script {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .script-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--gray-300);
  }

  .script-help {
    :deep(.el-alert__content) {
      font-size: 13px;
      line-height: 1.4;
    }

    code {
      background: var(--gray-100);
      padding: 2px 4px;
      border-radius: 2px;
      font-size: 12px;
      color: var(--primary-color);
    }
  }

  .script-editor {
    flex: 1;
    
    :deep(.el-textarea__inner) {
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace !important;
      font-size: 13px;
      line-height: 1.4;
    }
  }

  .script-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding-top: 12px;
    border-top: 1px solid var(--gray-300);
  }
}
</style>
