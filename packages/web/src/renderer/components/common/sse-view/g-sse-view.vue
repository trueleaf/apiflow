<template>
  <div ref="sseViewRef" class="sse-view">
    <div v-if="!dataList || dataList.length === 0" class="empty-state">
      暂无SSE数据
    </div>
    <el-scrollbar v-else ref="scrollBarRef" @scroll="handleScroll" :noresize="true" always :min-size="50" :height="`${scrollContainerHeight}px`">
      <div
        ref="sseContentRef"
        class="sse-content"
        @wheel="handleUserInteraction"
        @touchstart="handleUserInteraction"
        @keydown="handleKeydown"
      >
        <div
          v-for="(sseMessage, index) in formattedData"
          :key="index"
          class="sse-message"
          :class="{ 'sse-message-error': sseMessage.isError }"
        >
          <span class="message-index">↓</span>
          <div class="message-content">
            <el-popover
              placement="top-start"
              :width="600"
              trigger="click"
              :content="sseMessage.content"
              popper-class="sse-message-popover"
            >
              <template #reference>
                <pre class="single-line-content">{{ sseMessage.content }}</pre>
              </template>
            </el-popover>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { debounce } from '@/helper';
import { ScrollbarInstance } from 'element-plus';
import { computed, ref, watch, nextTick, onMounted } from 'vue';

/*
|--------------------------------------------------------------------------
| 全局变量
|--------------------------------------------------------------------------
*/
const props = withDefaults(defineProps<{dataList: Uint8Array[];}>(), {
  dataList: () => []
});
const scrollBarRef = ref<ScrollbarInstance  | null>(null);
const sseViewRef = ref<HTMLElement | null>(null);
const sseContentRef = ref<HTMLElement | null>(null);
const autoScrollEnabled = ref(true); // 是否启用自动滚动
const scrollThreshold = 300; // 距离底部多少像素内认为是"接近底部"
const scrollContainerHeight = ref(0);
/*
|--------------------------------------------------------------------------
| sse数据处理
|--------------------------------------------------------------------------
*/
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
/*
|--------------------------------------------------------------------------
| 滚动相关
|--------------------------------------------------------------------------
*/

// 处理滚动事件
const handleScroll = (scrollInfo: {scrollTop: number}) => {
  if (scrollInfo.scrollTop + scrollThreshold + scrollContainerHeight.value >= sseContentRef.value!.clientHeight) {
    autoScrollEnabled.value = true;
  }
};

// 处理用户交互事件（wheel, touchstart）
const handleUserInteraction = debounce(() => {
  autoScrollEnabled.value = false;
}, 100);

// 处理键盘事件
const handleKeydown = (e: KeyboardEvent) => {
  // 判断是否为上下键、PageUp/PageDown
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'PageUp' || e.key === 'PageDown') {
    autoScrollEnabled.value = false;
  }
};

// 滚动到底部的函数
const scrollToBottom = () => {
  if (!autoScrollEnabled.value) {
    return;
  }
  nextTick(() => {
    const sseContent = sseContentRef.value!;
    const sseCOntentHeight = sseContent.clientHeight;
    scrollBarRef.value?.setScrollTop(sseCOntentHeight);
  });
};

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
onMounted(() => {
  scrollContainerHeight.value = sseViewRef.value!.clientHeight;
})
</script>

<style lang="scss" scoped>
.sse-view {
  width: 100%;
  height: 100%;
  padding: 0 8px;
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
    // flex: 1;
    .sse-message {
      display: flex;
      align-items: flex-start;
      // margin-bottom: 8px;
      // padding: 8px;
      border-radius: 4px;
      background-color: var(--bg-color, #ffffff);

      &.sse-message-error {
        border-left-color: var(--color-warning, #e6a23c);
        background-color: var(--color-warning-light-9, #fdf6ec);
      }

      .message-index {
        font-size: 12px;
        color: var(--color-primary, #409eff);
        margin-right: 8px;
        font-weight: bold;
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
          color: var(--text-color-primary, #303133);
          background: transparent;
        }

        .single-line-content {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: pointer;
          transition: color 0.2s ease;

          &:hover {
            color: var(--color-primary, #409eff);
          }
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

  ::v-deep(.el-scrollbar__thumb) {
    opacity: 1 !important;
  }

  ::v-deep(.el-scrollbar__bar.is-vertical) {
    width: 8px;
  }
}

// 全局样式，用于 Popover 内容
:global(.sse-message-popover) {
  .el-popover__content {
    white-space: pre-wrap;
    word-break: break-all;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.4;
    max-height: 400px;
    overflow-y: auto;
  }
}
</style>
