<template>
  <div class="sse-view">
    <div v-if="!dataList || dataList.length === 0" class="empty-state">
      暂无SSE数据
    </div>
    <div
      v-else
      ref="sseContentRef"
      class="sse-content"
      @scroll="handleScroll"
    >
      <div
        v-for="(sseMessage, index) in formattedData"
        :key="index"
        class="sse-message"
        :class="{ 'sse-message-error': sseMessage.isError }"
      >
        <span class="message-index">{{ index + 1 }}</span>
        <div class="message-content">
          <pre>{{ sseMessage.content }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, nextTick } from 'vue';

const props = withDefaults(defineProps<{dataList: Uint8Array[];}>(), {
  dataList: () => []
});

// 滚动相关的响应式状态
const sseContentRef = ref<HTMLElement | null>(null);
const isUserScrolled = ref(false); // 用户是否手动滚动过
const autoScrollEnabled = ref(true); // 是否启用自动滚动
const scrollThreshold = 100; // 距离底部多少像素内认为是"接近底部"

// 处理滚动事件
const handleScroll = () => {
  if (!sseContentRef.value) return;
  console.log("scroll")
};

// 滚动到底部的函数
const scrollToBottom = () => {
  nextTick(() => {
    if (sseContentRef.value) {
      sseContentRef.value.scrollTop = sseContentRef.value.scrollHeight;
    }
  });
};

// 解析SSE格式数据，将Uint8Array转换为标准SSE消息
const formattedData = computed(() => {
  if (!props.dataList || props.dataList.length === 0) {
    return [];
  }

  const sseMessages: Array<{ content: string; isError: boolean }> = [];

  props.dataList.forEach((chunk) => {
    try {
      // 将Uint8Array转换为UTF-8字符串
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const chunkText = decoder.decode(chunk);

      // 解析SSE格式数据
      const messages = parseSSEChunk(chunkText);
      sseMessages.push(...messages);
    } catch (error) {
      // 如果解码失败，显示十六进制表示
      const hexContent = Array.from(chunk)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join(' ');

      sseMessages.push({
        content: `[二进制数据] ${hexContent}`,
        isError: true
      });
    }
  });

  return sseMessages;
});

// 监听formattedData变化，确保新消息能触发滚动
watch(
  formattedData,
  () => {
    if (autoScrollEnabled.value) {
      scrollToBottom();
    }
  },
  { flush: 'post' } // 确保DOM更新后再执行
);

// 解析单个chunk中的SSE消息
const parseSSEChunk = (chunkText: string): Array<{ content: string; isError: boolean }> => {
  const messages: Array<{ content: string; isError: boolean }> = [];

  // 按行分割
  const lines = chunkText.split(/\r?\n/);
  let currentMessage = '';

  for (const line of lines) {
    const trimmedLine = line.trim();

    // 跳过空行（SSE消息结束标志）
    if (trimmedLine === '') {
      if (currentMessage) {
        messages.push({
          content: currentMessage.trim(),
          isError: false
        });
        currentMessage = '';
      }
      continue;
    }

    // 跳过注释行
    if (trimmedLine.startsWith(':')) {
      continue;
    }

    // 处理SSE字段
    if (trimmedLine.includes(':')) {
      const colonIndex = trimmedLine.indexOf(':');
      const field = trimmedLine.substring(0, colonIndex).trim();
      const value = trimmedLine.substring(colonIndex + 1).trim();

      if (field === 'data') {
        if (currentMessage) {
          currentMessage += '\n' + value;
        } else {
          currentMessage = value;
        }
      } else if (field === 'event' || field === 'id' || field === 'retry') {
        // 显示其他SSE字段
        if (currentMessage) {
          currentMessage += '\n' + `${field}: ${value}`;
        } else {
          currentMessage = `${field}: ${value}`;
        }
      }
    } else {
      // 处理没有冒号的行（可能是data字段的简写）
      if (currentMessage) {
        currentMessage += '\n' + trimmedLine;
      } else {
        currentMessage = trimmedLine;
      }
    }
  }

  // 处理最后一条消息（如果没有以空行结尾）
  if (currentMessage) {
    messages.push({
      content: currentMessage.trim(),
      isError: false
    });
  }

  return messages;
};
</script>

<style lang="scss" scoped>
.sse-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: var(--text-color-secondary, #909399);
    font-size: 14px;
  }

  .sse-content {
    flex: 1;
    overflow-y: auto;
    padding: 8px;

    .sse-message {
      display: flex;
      align-items: flex-start;
      margin-bottom: 8px;
      padding: 8px;
      border-radius: 4px;
      background-color: var(--bg-color, #ffffff);

      &.sse-message-error {
        border-left-color: var(--color-warning, #e6a23c);
        background-color: var(--color-warning-light-9, #fdf6ec);
      }

      .message-index {
        font-weight: 600;
        color: var(--color-primary, #409eff);
        margin-right: 15px;
        margin-top: 2px;
      }

      .message-content {
        flex: 1;
        min-width: 0;

        pre {
          margin: 0;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.4;
          white-space: pre-wrap;
          word-break: break-all;
          color: var(--text-color-primary, #303133);
          background: transparent;
        }
      }

      &:hover {
        background-color: var(--fill-color-lighter, #f2f6fc);

        &.sse-message-error {
          background-color: var(--color-warning-light-8, #faecd8);
        }
      }
    }
  }
}
</style>
