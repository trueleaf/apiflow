<template>
  <section class="panel">
    <div class="panel-header">
      <div>
        <h3>{{ $t('调试测试') }}</h3>
        <p>{{ $t('测试当前 API 配置是否可用') }}</p>
      </div>
    </div>
    <div class="panel-body">
      <div class="debug-container">
        <div class="input-area">
          <el-input
            v-model="inputMessage"
            type="textarea"
            :rows="4"
            :placeholder="$t('输入测试消息...')"
            :disabled="isLoading"
            class="message-input"
          />
          <div class="input-actions">
            <el-button
              type="primary"
              :loading="isLoading && !isStreaming"
              :disabled="!canSend"
              @click="handleSend"
            >
              <Send :size="16" v-if="!isLoading || isStreaming" />
              {{ isLoading && !isStreaming ? $t('发送中...') : $t('发送') }}
            </el-button>
            <el-button
              type="primary"
              :loading="isStreaming"
              :disabled="!canSend"
              @click="handleStreamSend"
            >
              <Zap :size="16" v-if="!isStreaming" />
              {{ isStreaming ? $t('接收中...') : $t('流式发送') }}
            </el-button>
            <el-button
              v-if="isLoading"
              type="danger"
              @click="handleCancel"
            >
              <Square :size="16" />
              {{ $t('取消') }}
            </el-button>
            <el-button @click="handleClear">
              <Eraser :size="16" />
              {{ $t('清空') }}
            </el-button>
          </div>
        </div>

        <div class="response-area">
          <div class="response-header">
            <span class="response-title">
              <MessageSquare :size="16" />
              {{ $t('响应结果') }}
            </span>
            <span v-if="responseTime" class="response-time">
              {{ responseTime }}ms
            </span>
          </div>
          <div class="response-content" :class="{ 'has-error': hasError }">
            <div v-if="isLoading && !isStreaming" class="response-loading">
              <Loader2 :size="24" class="loading-icon" />
              <span>{{ $t('正在请求...') }}</span>
            </div>
            <div v-else-if="responseContent && useMarkdown" class="response-markdown">
              <VueMarkdownRender :source="responseContent" :options="markdownOptions" />
            </div>
            <div v-else-if="responseContent" class="response-text">
              {{ responseContent }}
            </div>
            <div v-else class="response-empty">
              {{ $t('发送消息以测试 API 配置') }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Send, Square, Eraser, MessageSquare, Loader2, Zap } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import VueMarkdownRender from 'vue-markdown-render'
import { useLLMProvider } from '@/store/ai/llmProviderStore'
import { useAiChatStore } from '@/store/ai/aiChatStore'
import { message } from '@/helper'

const { t } = useI18n()
const llmProviderStore = useLLMProvider()
const aiChatStore = useAiChatStore()

const inputMessage = ref('')
const responseContent = ref('')
const isLoading = ref(false)
const isStreaming = ref(false)
const useMarkdown = ref(false)
const hasError = ref(false)
const responseTime = ref<number | null>(null)
let cancelStreamFn: { abort: () => void } | null = null

const markdownOptions = {
  html: false,
  breaks: true,
  linkify: true
}
// 判断配置是否有效
const isConfigValid = computed(() => {
  const p = llmProviderStore.activeProvider
  return p.apiKey.trim() !== '' && p.baseURL.trim() !== '' && p.model.trim() !== ''
})
const canSend = computed(() => {
  return isConfigValid.value && inputMessage.value.trim() !== ''
})
// 发送测试请求（非流式）
const handleSend = async () => {
  if (!canSend.value) {
    if (!isConfigValid.value) {
      message.warning(t('请先完成 API 配置'))
    }
    return
  }
  isLoading.value = true
  hasError.value = false
  useMarkdown.value = false
  responseContent.value = ''
  responseTime.value = null
  const startTime = Date.now()
  try {
    const response = await aiChatStore.chat({
      model: llmProviderStore.activeProvider.model,
      messages: [{ role: 'user', content: inputMessage.value }],
      max_tokens: 1000,
    })
    responseTime.value = Date.now() - startTime
    responseContent.value = response.choices?.[0]?.message?.content || t('无响应内容')
  } catch (error) {
    hasError.value = true
    responseContent.value = `${t('请求失败')}: ${(error as Error).message}`
    responseTime.value = Date.now() - startTime
  } finally {
    isLoading.value = false
  }
}
// 流式发送测试请求
const handleStreamSend = () => {
  if (!canSend.value) {
    if (!isConfigValid.value) {
      message.warning(t('请先完成 API 配置'))
    }
    return
  }
  isLoading.value = true
  isStreaming.value = true
  hasError.value = false
  useMarkdown.value = true
  responseContent.value = ''
  responseTime.value = null
  const startTime = Date.now()
  const decoder = new TextDecoder()
  cancelStreamFn = aiChatStore.chatStream(
    {
      model: llmProviderStore.activeProvider.model,
      messages: [{ role: 'user', content: inputMessage.value }],
      max_tokens: 1000,
    },
    {
      onData: (chunk: Uint8Array) => {
        const text = decoder.decode(chunk, { stream: true })
        const lines = text.split('\n').filter(line => line.trim() !== '')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) {
                responseContent.value += content
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      },
      onEnd: () => {
        responseTime.value = Date.now() - startTime
        isLoading.value = false
        isStreaming.value = false
        cancelStreamFn = null
        if (!responseContent.value) {
          responseContent.value = t('无响应内容')
        }
      },
      onError: (err: Error | string) => {
        hasError.value = true
        responseContent.value = `${t('请求失败')}: ${typeof err === 'string' ? err : err.message}`
        responseTime.value = Date.now() - startTime
        isLoading.value = false
        isStreaming.value = false
        cancelStreamFn = null
      },
    }
  )
}
// 取消请求
const handleCancel = () => {
  if (cancelStreamFn) {
    cancelStreamFn.abort()
    cancelStreamFn = null
  }
  isLoading.value = false
  isStreaming.value = false
}
// 清空
const handleClear = () => {
  inputMessage.value = ''
  responseContent.value = ''
  hasError.value = false
  useMarkdown.value = false
  responseTime.value = null
}
</script>

<style lang="scss" scoped>
.panel {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  box-shadow: 0 10px 30px var(--shadow-light);
  padding: 32px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.panel-header {
  margin-bottom: 24px;

  h3 {
    margin: 0 0 6px;
    font-size: 20px;
    color: var(--text-primary);
  }

  p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 14px;
  }
}

.panel-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.debug-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.input-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-input {
  :deep(.el-textarea__inner) {
    resize: none;
  }
}

.input-actions {
  display: flex;
  gap: 8px;

  .el-button {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.response-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.response-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.response-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: var(--text-primary);
}

.response-time {
  font-size: 12px;
  color: var(--text-tertiary);
  padding: 2px 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
}

.response-content {
  flex: 1;
  padding: 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.6;

  &.has-error {
    border-color: var(--el-color-danger);
    background: var(--el-color-danger-light-9);
  }
}

.response-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 100%;
  color: var(--text-tertiary);
}

.loading-icon {
  animation: spin 1s linear infinite;
}

.response-text {
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--text-primary);
}

.response-markdown {
  color: var(--text-primary);

  :deep(p) {
    margin: 0 0 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(pre) {
    background: var(--bg-tertiary);
    padding: 12px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 8px 0;
  }

  :deep(code) {
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 13px;
  }

  :deep(ul),
  :deep(ol) {
    padding-left: 20px;
    margin: 8px 0;
  }

  :deep(blockquote) {
    border-left: 3px solid var(--el-color-primary);
    padding-left: 12px;
    margin: 8px 0;
    color: var(--text-secondary);
  }
}

.response-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-tertiary);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
