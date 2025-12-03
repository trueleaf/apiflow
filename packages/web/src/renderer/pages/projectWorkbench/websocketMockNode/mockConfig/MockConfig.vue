<template>
  <div class="mock-config-content">
    <!-- 触发条件配置 -->
    <div class="config-section condition-section">
      <div class="condition-header">
        <h3>{{ t('触发条件') }}</h3>
      </div>
      <div class="condition-form">
        <el-form label-width="80px" label-position="left">
          <el-form-item :label="t('名称')">
            <el-input
              v-model="websocketMock.info.name"
              :placeholder="t('请输入名称')"
              @input="(val: string) => websocketMockStore.changeWebSocketMockName(val)"
            />
          </el-form-item>
          <el-form-item :label="t('端口')">
            <el-input-number
              v-model="websocketMock.requestCondition.port"
              :min="1"
              :max="65535"
              controls-position="right"
              @change="(val) => websocketMockStore.changeWebSocketMockPort(val ?? 8080)"
            />
          </el-form-item>
          <el-form-item :label="t('路径')">
            <el-input
              v-model="websocketMock.requestCondition.path"
              :placeholder="t('例如: /ws')"
              @input="(val: string) => websocketMockStore.changeWebSocketMockPath(val)"
            />
          </el-form-item>
          <el-form-item :label="t('延迟')">
            <el-input-number
              v-model="websocketMock.config.delay"
              :min="0"
              :max="60000"
              :step="100"
              controls-position="right"
              @change="(val) => websocketMockStore.changeWebSocketMockDelay(val ?? 0)"
            />
            <span class="delay-unit">ms</span>
          </el-form-item>
        </el-form>
      </div>
    </div>
    
    <!-- 欢迎消息配置 -->
    <div class="config-section welcome-section">
      <div class="welcome-header">
        <h3>{{ t('欢迎消息') }}</h3>
        <el-switch
          v-model="websocketMock.config.welcomeMessage.enabled"
          @change="(val) => websocketMockStore.changeWebSocketMockWelcomeEnabled(val as boolean)"
        />
      </div>
      <div v-if="websocketMock.config.welcomeMessage.enabled" class="welcome-content">
        <CodeEditor
          v-model="websocketMock.config.welcomeMessage.content"
          language="javascript"
          :min-height="100"
          :max-height="200"
          :auto-height="true"
          :placeholder="t('客户端连接成功后发送的消息')"
          @update:model-value="(val: string) => websocketMockStore.changeWebSocketMockWelcomeContent(val)"
        />
      </div>
    </div>
    
    <!-- 响应配置 -->
    <div class="config-section response-section">
      <div class="response-header">
        <h3>{{ t('响应内容') }}</h3>
        <span class="response-tip">{{ t('收到消息后返回的固定内容') }}</span>
      </div>
      <div class="response-content">
        <CodeEditor
          v-model="websocketMock.response.content"
          language="javascript"
          :min-height="150"
          :max-height="300"
          :auto-height="true"
          :placeholder="t('收到客户端消息后返回的内容')"
          @update:model-value="(val: string) => websocketMockStore.changeWebSocketMockResponseContent(val)"
        />
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button type="primary" :loading="websocketMockStore.saveLoading" @click="handleSave">
        {{ t('保存配置') }}
      </el-button>
      <el-button type="default" :icon="Refresh" :loading="websocketMockStore.refreshLoading" @click="handleRefresh">
        {{ t('刷新') }}
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Refresh } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useWebSocketMock } from '@/store/websocketMock/websocketMockStore'
import { useApidocTas } from '@/store/httpNode/httpTabsStore'
import { useRuntime } from '@/store/runtime/runtimeStore'
import CodeEditor from '@/components/ui/cleanDesign/codeEditor/CodeEditor.vue'

const { t } = useI18n()
const websocketMockStore = useWebSocketMock()
const apidocTabsStore = useApidocTas()
const runtimeStore = useRuntime()
const { currentSelectTab } = storeToRefs(apidocTabsStore)
const { websocketMock } = storeToRefs(websocketMockStore)

// 保存 WebSocketMock
const handleSave = () => {
  websocketMockStore.saveWebSocketMockNode()
}
// 刷新 WebSocketMock
const handleRefresh = async () => {
  if (!currentSelectTab.value) {
    return
  }
  websocketMockStore.refreshLoading = true
  try {
    const isOffline = runtimeStore.networkMode === 'offline'
    if (isOffline) {
      websocketMockStore.replaceWebSocketMockNode(websocketMockStore.originWebSocketMock)
      websocketMockStore.cacheWebSocketMockNode()
    }
  } finally {
    setTimeout(() => {
      websocketMockStore.refreshLoading = false
    }, 100)
  }
}
</script>

<style lang="scss" scoped>
.mock-config-content {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--apiflow-header-height) - var(--apiflow-doc-nav-height) - 50px);
  margin: 0 auto;
}

.config-section {
  margin-bottom: 16px;
  padding: 16px 20px;
  background: var(--white);
  border-bottom: 1px dashed var(--gray-400);

  h3 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--gray-800);
  }
}

.condition-section {
  flex-shrink: 0;
}

.condition-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }

  :deep(.el-form-item__label) {
    font-size: 13px;
    color: var(--gray-700);
  }

  .delay-unit {
    margin-left: 8px;
    color: var(--gray-500);
    font-size: 13px;
  }
}

.welcome-section {
  flex-shrink: 0;

  .welcome-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    h3 {
      margin: 0;
    }
  }

  .welcome-content {
    margin-top: 12px;
  }
}

.response-section {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  .response-header {
    display: flex;
    align-items: center;
    gap: 12px;

    h3 {
      margin: 0;
    }

    .response-tip {
      font-size: 12px;
      color: var(--gray-500);
    }
  }

  .response-content {
    flex: 1;
    margin-top: 12px;
  }
}

.action-buttons {
  flex-shrink: 0;
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--gray-300);
  background: var(--white);
}
</style>
