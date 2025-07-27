<template>
  <div ref="sseViewContainerRef" class="sse-view">
    <div v-if="!dataList || dataList.length === 0" class="empty-state">
      暂无SSE数据
    </div>
    <el-scrollbar v-else ref="scrollBarRef" @scroll="handleScroll" :noresize="true" always :min-size="50" :height="`${scrollBarHeight}px`">
      <div
        ref="sseContentRef"
        class="sse-content"
        @wheel="handleCheckIsUserOperate"
        @touchstart="handleCheckIsUserOperate"
        @keydown="handleKeydown"
      >
        <div
          v-for="(sseMessage, index) in formattedData"
          :key="index"
          class="sse-message"
          :class="{ 'sse-message-hex': sseMessage.dataType === 'binary' }"
        >
          <div class="message-index">{{ index + 1 }}</div>
          <pre class="message-content">
            {{ (sseMessage.event || '') + (sseMessage.data || '') }}
          </pre>
          <div class="message-timestamp">
            {{ formatTimestamp(sseMessage.timestamp) }}
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
import { parseChunkList } from '@/utils/utils';
import dayjs from 'dayjs';
import type { ChunkWithTimestampe } from '@src/types/types';

/*
|--------------------------------------------------------------------------
| 全局变量
|--------------------------------------------------------------------------
*/
const props = withDefaults(defineProps<{dataList: ChunkWithTimestampe[];}>(), {
  dataList: () => []
});
const scrollBarRef = ref<ScrollbarInstance  | null>(null);
const sseViewContainerRef = ref<HTMLElement | null>(null);
const sseContentRef = ref<HTMLElement | null>(null);
const autoScrollEnabled = ref(true); // 是否启用自动滚动
const scrollThreshold = 300; // 距离底部多少像素内认为是"接近底部"
const scrollBarHeight = ref(0);
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
  return parseChunkList(props.dataList);
});

// 格式化时间戳为毫秒显示
const formatTimestamp = (timestamp: number): string => {
  return dayjs(timestamp).format('HH:mm:ss.SSS');
};

/*
|--------------------------------------------------------------------------
| 滚动相关
|--------------------------------------------------------------------------
*/
// 处理滚动事件
const handleScroll = (scrollInfo: {scrollTop: number}) => {
  if (scrollInfo.scrollTop + scrollThreshold + scrollBarHeight.value >= sseContentRef.value!.clientHeight) {
    autoScrollEnabled.value = true;
  }
};
// 处理用户交互事件（wheel, touchstart）
const handleCheckIsUserOperate = debounce(() => {
  autoScrollEnabled.value = false;
}, 100);
// 处理键盘事件
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'PageUp' || e.key === 'PageDown') {
    autoScrollEnabled.value = false;
  }
};
// 滚动到底部
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
);
onMounted(() => {
  scrollBarHeight.value = sseViewContainerRef.value!.clientHeight;
})
</script>

<style lang="scss" scoped>
.sse-view {
  width: 100%;
  height: 100%;
  padding: 0 5px;
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
    .sse-message {
      display: flex;
      align-items: center;
      padding: 8px 12px 8px 0;
      border-radius: 4px;
      background-color: var(--bg-color, #ffffff);
      border-bottom: 1px solid var(--border-color-lighter, #ebeef5);

      &.sse-message-hex {
        border-left: 3px solid var(--color-warning, #e6a23c);
        background-color: var(--color-warning-light-9, #fdf6ec);
      }

      .message-index {
        font-size: 12px;
        color: var(--color-primary, #409eff);
        font-weight: bold;
        min-width: 40px;
        text-align: right;
        margin-right: 12px;
        flex-shrink: 0;
      }

      .message-content {
        flex: 1;
        min-width: 0;
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        font-size: 13px;
        color: var(--text-color-primary, #303133);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-right: 12px;
        margin: 0;
      }

      .message-timestamp {
        font-size: 11px;
        color: var(--text-color-secondary, #909399);
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        min-width: 80px;
        text-align: right;
        flex-shrink: 0;
      }

      &:hover {
        background-color: var(--fill-color-lighter, #f2f6fc);

        &.sse-message-hex {
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
</style>
