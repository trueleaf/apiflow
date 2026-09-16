<template>
  <div class="ai-settings-container">
    <div class="page-header">
      <h2>{{ t('AI 设置') }}</h2>
    </div>
    <div class="ai-settings-content">
      <div class="config-section">
        <div class="security-notice"><ShieldAlert :size="17" /><span>{{ t('AI Key 仅保存在当前设备的 localStorage 中，不会进入本地备份；共享设备上请谨慎使用。后续将迁移到系统安全存储。') }}</span></div>
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
          :request-meta="requestMeta"
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ShieldAlert } from 'lucide-vue-next'
import ProviderConfigPanel from './ConfigPanel.vue'
import DebugPanel from './DebugPanel.vue'
import { useLLMClientStore } from '@/store/ai/llmClientStore'
import { message } from '@/helper'
import type { ChatRequestBody, OpenAiStreamChunk, LLMProviderSetting, LLMThinkingMode, LLMVendor } from '@src/types/ai/agent.type'
import { buildLLMRequestBody, getLLMConfigError, resolveLLMProvider } from '@src/config/llmProviders'

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
const requestBody = ref<Record<string, unknown> | null>(null)
const requestMeta = ref<{ vendor: LLMVendor; model: string; stream: boolean; thinkingMode: LLMThinkingMode } | null>(null)
let cancelStreamFn: { abort: () => void } | null = null
let streamBuffer = ''
let requestVersion = 0
let requestAbort: AbortController | null = null
// 更新调试请求详情
const updateDebugRequest = (body: ChatRequestBody, provider: LLMProviderSetting, stream: boolean) => {
  const resolved = resolveLLMProvider(provider)
  requestBody.value = buildLLMRequestBody(body, resolved, stream)
  requestMeta.value = { vendor: resolved.vendor ?? 'custom', model: resolved.model, stream, thinkingMode: resolved.thinkingMode }
}
// 发送测试请求（非流式）
const handleSend = async (provider: LLMProviderSetting) => {
  if (isLoading.value) return
  const validationError = getLLMConfigError(provider)
  if (validationError) {
    message.warning(t(validationError))
    return
  }
  const version = ++requestVersion
  requestAbort = new AbortController()
  isLoading.value = true
  hasError.value = false
  useMarkdown.value = false
  responseContent.value = ''
  reasoningContent.value = ''
  responseTime.value = null
  const body: ChatRequestBody = {
    messages: [{ role: 'user', content: t('你的模型') }],
  }
  updateDebugRequest(body, provider, false)
  const startTime = Date.now()
  try {
    const response = await llmClientStore.chat(body, requestAbort.signal, provider)
    if (version !== requestVersion) return
    responseTime.value = Date.now() - startTime
    reasoningContent.value = response.choices?.[0]?.message?.reasoning_content || ''
    responseContent.value = response.choices?.[0]?.message?.content || t('无响应内容')
  } catch (error) {
    if (version !== requestVersion) return
    hasError.value = true
    responseContent.value = `${t('请求失败')}: ${t((error as Error).message)}`
    responseTime.value = Date.now() - startTime
  } finally {
    if (version === requestVersion) {
      isLoading.value = false
      requestAbort = null
    }
  }
}
// 流式发送测试请求
const handleStreamSend = (provider: LLMProviderSetting) => {
  if (isLoading.value) return
  const validationError = getLLMConfigError(provider)
  if (validationError) {
    message.warning(t(validationError))
    return
  }
  const version = ++requestVersion
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
  }
  updateDebugRequest(body, provider, true)
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
        if (version !== requestVersion) return
        const text = decoder.decode(chunk, { stream: true })
        parseSseChunk(text)
      },
      onEnd: () => {
        if (version !== requestVersion) return
        parseSseChunk(`${decoder.decode()}\n`)
        responseTime.value = Date.now() - startTime
        isLoading.value = false
        isStreaming.value = false
        cancelStreamFn = null
        if (!responseContent.value) {
          responseContent.value = t('无响应内容')
        }
      },
      onError: (err: Error | string) => {
        if (version !== requestVersion) return
        hasError.value = true
        responseContent.value = `${t('请求失败')}: ${t(typeof err === 'string' ? err : err.message)}`
        responseTime.value = Date.now() - startTime
        isLoading.value = false
        isStreaming.value = false
        cancelStreamFn = null
      },
    },
    provider,
  )
}
// 取消请求
const handleCancel = () => {
  requestVersion += 1
  requestAbort?.abort()
  requestAbort = null
  if (cancelStreamFn) {
    cancelStreamFn.abort()
    cancelStreamFn = null
  }
  streamBuffer = ''
  isLoading.value = false
  isStreaming.value = false
}

onUnmounted(() => {
  handleCancel()
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
.security-notice {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  margin-bottom: 12px;
  padding: 9px 10px;
  border: 1px solid var(--el-color-warning-light-5);
  border-radius: 7px;
  background: var(--el-color-warning-light-9);
  color: var(--gray-700);
  font-size: 12px;
  line-height: 1.5;
}
.security-notice svg { flex: 0 0 auto; color: var(--el-color-warning); }

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
