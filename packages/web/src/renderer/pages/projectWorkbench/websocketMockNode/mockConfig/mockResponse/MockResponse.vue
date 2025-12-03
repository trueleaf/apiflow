<template>
  <div class="response-content">
    <div class="config-title">{{ t('响应配置') }}</div>
    <div class="config-form">
      <!-- 响应延时配置 -->
      <div class="form-row">
        <div class="form-item flex-item">
          <label class="form-label">{{ t('响应延时(单位：毫秒)') }}</label>
          <el-input-number
            v-model="websocketMock.config.delay"
            size="small"
            :placeholder="t('响应延时 (ms)')"
            :min="0"
            :max="60000"
            :step="100"
            :controls="false"
            class="delay-input"
            @change="(val) => websocketMockNodeStore.changeWebSocketMockDelay(val ?? 0)"
          />
        </div>
      </div>
      <!-- Echo 模式配置 -->
      <div class="form-row">
        <div class="form-item echo-item">
          <div class="echo-header">
            <label class="form-label">{{ t('Echo 模式') }}</label>
            <el-switch
              v-model="websocketMock.config.echoMode"
              size="small"
              @change="(val) => websocketMockNodeStore.changeWebSocketMockEchoMode(val as boolean)"
            />
          </div>
          <div class="echo-tip">{{ t('开启后原样返回客户端发送的消息') }}</div>
        </div>
      </div>
      <!-- 响应内容配置 -->
      <div class="form-row">
        <div class="form-item response-item">
          <label class="form-label">{{ t('响应内容') }}</label>
          <div class="response-tip">
            {{ t('收到客户端消息后返回的内容') }}
            <span class="variable-hint">
              {{ t('支持') }}
              <code>{{ '\{\{ variableName \}\}' }}</code>
              {{ t('变量语法和') }}
              <code>@name</code>、<code>@id</code>
              {{ t('等 Mock 语法') }}
            </span>
          </div>
          <div :class="['response-editor', { 'response-editor-disabled': websocketMock.config.echoMode }]">
            <CodeEditor
              v-model="websocketMock.response.content"
              language="json"
              :min-height="150"
              :max-height="300"
              :auto-height="true"
              :placeholder="t('收到客户端消息后返回的内容')"
              @update:model-value="(val: string) => websocketMockNodeStore.changeWebSocketMockResponseContent(val)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useWebSocketMockNode } from '@/store/websocketMockNode/websocketMockNodeStore'
import CodeEditor from '@/components/ui/cleanDesign/codeEditor/CodeEditor.vue'

const { t } = useI18n()
const websocketMockNodeStore = useWebSocketMockNode()
const { websocketMock } = storeToRefs(websocketMockNodeStore)
</script>

<style scoped>
.response-content {
  margin-bottom: 12px;
}

.config-title {
  font-size: var(--font-size-base);
  font-weight: bold;
  color: var(--gray-800);
  margin-bottom: 10px;
}

.config-form {
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.flex-item {
  flex: 0 0 auto;
}

.form-label {
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--gray-700);
  font-weight: 500;
}

.delay-input {
  max-width: 200px;
}

.echo-item {
  width: 100%;
}

.echo-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.echo-tip {
  font-size: var(--font-size-xs);
  color: var(--gray-500);
}

.response-item {
  width: 100%;
}

.response-tip {
  font-size: var(--font-size-xs);
  color: var(--gray-500);
}

.variable-hint {
  margin-left: 8px;
  color: var(--gray-400);
}

.variable-hint code {
  padding: 1px 4px;
  background: var(--gray-100);
  border-radius: 3px;
  font-family: var(--font-family-mono, monospace);
  font-size: var(--font-size-xs);
  color: var(--purple);
}

.response-editor {
  margin-top: 8px;
  max-width: 800px;
}

.response-editor-disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
