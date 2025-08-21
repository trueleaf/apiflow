<template>
  <div class="ws-connection">
    <div class="ws-operation">
      <div class="op-wrap">
        <el-input 
          v-model="connectionUrl" 
          placeholder="WebSocket连接地址 eg: ws://localhost:8080/websocket" 
          autocomplete="off" 
          autocorrect="off" 
          spellcheck="false"
        >
          <template #prepend>
            <div class="protocol-select">
              <el-select v-model="protocol" size="default">
                <el-option value="ws" label="WS"></el-option>
                <el-option value="wss" label="WSS"></el-option>
              </el-select>
            </div>
          </template>
        </el-input>
        <el-button 
          v-if="connectionState === 'disconnected' || connectionState === 'error'" 
          type="success" 
          @click="handleConnect"
        >
          {{ t("发起连接") }}
        </el-button>
        <el-button 
          v-if="connectionState === 'connected'" 
          type="danger" 
          @click="handleDisconnect"
        >
          {{ t("断开连接") }}
        </el-button>
        <el-button 
          v-if="connectionState === 'connecting'" 
          type="warning" 
          loading
        >
          {{ t("连接中") }}
        </el-button>
        <el-button type="primary" @click="handleSave">{{ t("保存接口") }}</el-button>
        <el-button type="primary" :icon="Refresh" @click="handleRefresh">{{ t("刷新") }}</el-button>
      </div>
      
      <!-- 连接状态显示 -->
      <pre class="pre-url-wrap">
        <span class="label">{{ t("连接地址") }}：</span>
        <span class="url">{{ fullUrl || connectionUrl }}</span>
        <el-tag 
          :type="getStatusType(connectionState)" 
          size="small"
          class="status-tag"
        >
          {{ getStatusText(connectionState) }}
        </el-tag>
      </pre>
    </div>

    <!-- 连接配置选项卡 -->
    <el-tabs v-model="activeTab" class="connection-tabs">
      <!-- 发送消息内容 -->
      <el-tab-pane label="发送消息内容" name="messageContent">
        <div class="message-content">
          <div class="content-editor">
            <el-input 
              v-model="messageContent" 
              type="textarea" 
              :rows="10"
              placeholder="请输入要发送的消息内容..."
              autocomplete="off"
              autocorrect="off"
              spellcheck="false"
            />
          </div>
          
          <div class="content-actions">
            <el-button type="primary" @click="handleSendMessage">
              {{ t("发送消息") }}
            </el-button>
            <el-button @click="handleClearContent">
              {{ t("清空内容") }}
            </el-button>
          </div>
        </div>
      </el-tab-pane>
      
      <!-- Params -->
      <el-tab-pane name="params">
        <template #label>
          <el-badge :is-dot="hasParams">Params</el-badge>
        </template>
        <SParams></SParams>
      </el-tab-pane>
      
      <!-- 请求头 -->
      <el-tab-pane name="headers">
        <template #label>
          <el-badge :is-dot="hasHeaders">{{ t("请求头") }}</el-badge>
        </template>
        <SHeaders></SHeaders>
      </el-tab-pane>
      
      <!-- 前置脚本 -->
      <el-tab-pane name="preScript">
        <template #label>
          <el-badge :is-dot="hasPreScript">{{ t("前置脚本") }}</el-badge>
        </template>
        <SPreScript></SPreScript>
      </el-tab-pane>
      
      <!-- 后置脚本 -->
      <el-tab-pane name="afterScript">
        <template #label>
          <el-badge :is-dot="hasAfterScript">{{ t("后置脚本") }}</el-badge>
        </template>
        <div class="after-script-content">
          <div class="script-editor">
            <el-input 
              v-model="afterScript" 
              type="textarea" 
              :rows="15"
              placeholder="// 在WebSocket消息发送后执行的JavaScript代码
// 可以访问 response 对象处理响应数据

console.log('WebSocket消息发送完成');"
              autocomplete="off"
              autocorrect="off"
              spellcheck="false"
            />
          </div>
          
          <div class="script-actions">
            <el-button type="primary" @click="handleTestAfterScript">
              {{ t("测试脚本") }}
            </el-button>
            <el-button @click="handleClearAfterScript">
              {{ t("清空脚本") }}
            </el-button>
          </div>
        </div>
      </el-tab-pane>
      
      <!-- 备注信息 -->
      <el-tab-pane :label="t('备注信息')" name="remarks">
        <div class="remarks-content">
          <div class="remarks-editor">
            <el-input 
              v-model="remarks" 
              type="textarea" 
              :rows="15"
              placeholder="请输入WebSocket接口的备注信息..."
              autocomplete="off"
              autocorrect="off"
              spellcheck="false"
            />
          </div>
          
          <div class="remarks-actions">
            <el-button type="primary" @click="handleSaveRemarks">
              {{ t("保存备注") }}
            </el-button>
            <el-button @click="handleClearRemarks">
              {{ t("清空备注") }}
            </el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useTranslation } from 'i18next-vue'
import { Refresh } from '@element-plus/icons-vue'
import SHeaders from './headers/headers.vue'
import SParams from './params/params.vue'
import SPreScript from './pre-script/pre-script.vue'

const { t } = useTranslation()

// 响应式数据
const protocol = ref('ws')
const connectionUrl = ref('')
const activeTab = ref('messageContent')
const connectionState = ref<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')

// 计算属性
const fullUrl = computed(() => {
  if (!connectionUrl.value) return ''
  return `${protocol.value}://${connectionUrl.value.replace(/^(ws|wss):\/\//, '')}`
})

// 检查各tab是否有内容的计算属性
const hasParams = computed(() => {
  // 这里应该检查是否有参数配置
  return false
})

const hasHeaders = computed(() => {
  // 这里应该检查是否有请求头配置
  return false
})

const hasPreScript = computed(() => {
  // 这里应该检查是否有前置脚本
  return false
})

const hasAfterScript = computed(() => {
  // 这里应该检查是否有后置脚本
  return false
})

// 新增的响应式数据
const messageContent = ref('')
const afterScript = ref('')
const remarks = ref('')

// 方法
// 消息内容相关方法
const handleSendMessage = () => {
  if (!messageContent.value.trim()) {
    console.warn('消息内容不能为空')
    return
  }
  console.log('发送WebSocket消息:', messageContent.value)
  // 这里实现发送消息的逻辑
}

const handleClearContent = () => {
  messageContent.value = ''
}

const handleConnect = () => {
  connectionState.value = 'connecting'
  // 这里只是样式演示，实际连接逻辑会在后续实现
  setTimeout(() => {
    connectionState.value = 'connected'
  }, 1000)
}

const handleDisconnect = () => {
  connectionState.value = 'disconnected'
}

const handleSave = () => {
  console.log('保存WebSocket配置')
}

const handleRefresh = () => {
  console.log('刷新WebSocket配置')
}

// 后置脚本相关方法
const handleTestAfterScript = () => {
  if (!afterScript.value.trim()) {
    console.warn('脚本内容不能为空')
    return
  }
  console.log('测试后置脚本:', afterScript.value)
  // 这里实现测试脚本的逻辑
}

const handleClearAfterScript = () => {
  afterScript.value = ''
}

// 备注信息相关方法
const handleSaveRemarks = () => {
  console.log('保存备注信息:', remarks.value)
  // 这里实现保存备注的逻辑
}

const handleClearRemarks = () => {
  remarks.value = ''
}

const getStatusType = (state: string) => {
  switch (state) {
    case 'connected': return 'success'
    case 'connecting': return 'warning'
    case 'error': return 'danger'
    default: return 'info'
  }
}

const getStatusText = (state: string) => {
  switch (state) {
    case 'connected': return '已连接'
    case 'connecting': return '连接中'
    case 'error': return '连接错误'
    default: return '未连接'
  }
}
</script>

<style lang="scss" scoped>
.ws-connection {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;

  .ws-operation {
    margin-bottom: 16px;
  }

  .connection-wrap {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 12px;

    .el-input {
      flex: 1;
    }

    .protocol-select {
      min-width: 80px;
      
      .el-select {
        width: 100%;
      }
    }
  }

  .op-wrap {
    display: flex;
    margin-top: 10px;

    :deep(.el-input__inner) {
      font-size: 13px;
    }

    .protocol-select {
      display: flex;
      align-items: center;

      :deep(.el-select) {
        width: 80px;
      }
    }

    .el-input__suffix {
      display: flex;
      align-items: center;
    }
  }

  .pre-url-wrap {
    height: 30px;
    width: 100%;
    white-space: nowrap;
    display: flex;
    margin: 0;
    align-items: center;
    overflow: hidden;
    padding: 0 10px;
    border: 1px solid #d1d5da;
    border-radius: 4px;
    background-color: #f0f0f0;
    white-space: pre-wrap;
    color: #212529;
    font-size: 12px;
    font-family: SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
    
    &::-webkit-scrollbar {
      height: 0px;
    }
    
    .label {
      user-select: none;
      flex: 0 0 auto;
    }
    
    .url {
      display: flex;
      align-items: center;
      height: 30px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow-x: auto;
      flex: 1;
      
      &::-webkit-scrollbar {
        height: 0px;
      }
    }
    
    .status-tag {
      flex: 0 0 auto;
      margin-left: 8px;
    }
  }

  .connection-status {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: var(--gray-700);

    .label {
      font-weight: 500;
    }

    .url {
      color: var(--gray-600);
      font-family: monospace;
      font-size: 13px;
    }
  }

  .connection-tabs {
    flex: 1;
    overflow: hidden;

    :deep(.el-tabs__content) {
      height: calc(100% - 40px);
      overflow-y: auto;
    }

    :deep(.el-tab-pane) {
      height: 100%;
    }

    // 发送消息内容样式
    .message-content {
      padding: 16px;
      height: 100%;
      display: flex;
      flex-direction: column;

      .content-editor {
        flex: 1;
        margin-bottom: 16px;
      }

      .content-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-start;
      }
    }

    // 后置脚本样式
    .after-script-content {
      padding: 16px;
      height: 100%;
      display: flex;
      flex-direction: column;

      .script-editor {
        flex: 1;
        margin-bottom: 16px;

        :deep(.el-textarea__inner) {
          font-family: 'Courier New', monospace;
          font-size: 14px;
        }
      }

      .script-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-start;
      }
    }

    // 备注信息样式
    .remarks-content {
      padding: 16px;
      height: 100%;
      display: flex;
      flex-direction: column;

      .remarks-editor {
        flex: 1;
        margin-bottom: 16px;
      }

      .remarks-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-start;
      }
    }
  }
}
</style>
