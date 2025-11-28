<template>
  <section class="panel">
    <div class="panel-header">
      <div>
        <h3>{{ $t('调试测试') }}</h3>
        <p>{{ $t('测试当前 API 配置是否可用') }}</p>
      </div>
    </div>
    <div class="panel-body">
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
  </section>
</template>

<script setup lang="ts">
import { MessageSquare, Loader2 } from 'lucide-vue-next'
import VueMarkdownRender from 'vue-markdown-render'

defineProps<{
  responseContent: string
  isLoading: boolean
  isStreaming: boolean
  hasError: boolean
  responseTime: number | null
  useMarkdown: boolean
}>()

const markdownOptions = {
  html: false,
  breaks: true,
  linkify: true
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
