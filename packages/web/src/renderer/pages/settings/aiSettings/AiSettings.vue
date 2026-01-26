<template>
  <div class="ai-settings-container">
    <div class="page-header">
      <h2>{{ t('AI 设置') }}</h2>
    </div>
    <div class="ai-settings-content">
      <div class="config-section">
        <ProviderConfigPanel
          :is-loading="isLoading"
          :is-streaming="isStreaming"
          @send="handleSend"
          @stream-send="handleStreamSend"
          @cancel="handleCancel"
        />
      </div>
      <div class="debug-section">
        <DebugPanel
          :response-content="responseContent"
          :reasoning-content="reasoningContent"
          :is-loading="isLoading"
          :is-streaming="isStreaming"
          :has-error="hasError"
          :response-time="responseTime"
          :use-markdown="useMarkdown"
          :request-body="requestBody"
        />
      </div>
    </div>
    <div v-if="isAppStore" class="report-section">
      <h3>{{ t('举报 AI 内容') }}</h3>
      <p class="report-description">
        {{ t('如果您发现 AI 生成的内容不恰当或令人不适，请通过以下方式向我们举报：') }}
      </p>
      <a href="mailto:2581105856@qq.com" class="report-email">2581105856@qq.com</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ProviderConfigPanel from './ConfigPanel.vue'
import DebugPanel from './DebugPanel.vue'
import { useLLMClientStore } from '@/store/ai/llmClientStore'
import { message } from '@/helper'
import type { ChatRequestBody, OpenAiStreamChunk } from '@src/types/ai/agent.type'

const { t } = useI18n()
const llmClientStore = useLLMClientStore()
const isAppStore = ref(false)

const responseContent = ref('')
const reasoningContent = ref('')
const isLoading = ref(false)
const isStreaming = ref(false)
const hasError = ref(false)
const responseTime = ref<number | null>(null)
const useMarkdown = ref(false)
const requestBody = ref<ChatRequestBody | null>(null)
let cancelStreamFn: { abort: () => void } | null = null
let streamBuffer = ''
// 判断配置是否有效
const isConfigValid = computed(() => {
  return llmClientStore.isAvailable()
})
// 发送测试请求（非流式）
const handleSend = async () => {
  if (!isConfigValid.value) {
    message.warning(t('请先完成 API 配置'))
    return
  }
  isLoading.value = true
  hasError.value = false
  useMarkdown.value = false
  responseContent.value = ''
  reasoningContent.value = ''
  responseTime.value = null
  const body: ChatRequestBody = {
    messages: [{ role: 'user', content: t('你的模型') }],
    max_tokens: 1000,
  }
  requestBody.value = body
  const startTime = Date.now()
  try {
    const response = await llmClientStore.chat(body)
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
  if (!isConfigValid.value) {
    message.warning(t('请先完成 API 配置'))
    return
  }
  isLoading.value = true
  isStreaming.value = true
  hasError.value = false
  useMarkdown.value = true
  responseContent.value = ''
  reasoningContent.value = ''
  responseTime.value = null
  streamBuffer = ''
  const body: ChatRequestBody = {
    messages: [{ role: 'user', content: t('你的模型') }],
    max_tokens: 1000,
  }
  requestBody.value = body
  const startTime = Date.now()
  const decoder = new TextDecoder()
  const parseSseChunk = (chunkText: string) => {
    const combined = `${streamBuffer}${chunkText}`
    const lines = combined.split('\n')
    streamBuffer = lines.pop() ?? ''
    for (const rawLine of lines) {
      const trimmed = rawLine.trim()
      if (!trimmed || trimmed === 'data: [DONE]') {
        continue
      }
      if (!trimmed.startsWith('data:')) {
        continue
      }
      const data = trimmed.replace(/^data:\s*/, '')
      try {
        const parsed = JSON.parse(data) as OpenAiStreamChunk
        const delta = parsed.choices?.[0]?.delta
        const reasoning = delta?.reasoning_content
        const content = delta?.content
        if (reasoning) {
          reasoningContent.value += reasoning
        }
        if (content) {
          responseContent.value += content
        }
      } catch {
        // 忽略解析错误
      }
    }
  }
  cancelStreamFn = llmClientStore.chatStream(
    body,
    {
      onData: (chunk: Uint8Array) => {
        const text = decoder.decode(chunk, { stream: true })
        parseSseChunk(text)
      },
      onEnd: () => {
        parseSseChunk(decoder.decode())
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
  streamBuffer = ''
  isLoading.value = false
  isStreaming.value = false
}

onUnmounted(() => {
  if (cancelStreamFn) {
    cancelStreamFn.abort()
    cancelStreamFn = null
  }
  streamBuffer = ''
})
onMounted(async () => {
  isAppStore.value = await window.electronAPI?.updateManager.isAppStore() || false
})
</script>

<style lang="scss" scoped>
.ai-settings-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 24px 24px;
  box-sizing: border-box;
  overflow: hidden;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 24px;

    h2 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
      color: var(--text-primary);
    }
  }
}

.ai-settings-content {
  flex: 1;
  display: flex;
  gap: 24px;
  min-height: 0;
}

.config-section {
  flex: 1;
  min-width: 0;
}

.debug-section {
  flex: 1;
  min-width: 0;
}

.report-section {
  margin-top: 24px;
  padding: 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;

  h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .report-description {
    margin: 0 0 12px 0;
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-secondary);
  }

  .report-email {
    display: inline-block;
    font-size: 14px;
    color: var(--primary);
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
