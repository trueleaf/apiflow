<template>
  <div ref="sseViewContainerRef" class="sse-view">
    <div v-if="!dataList || dataList.length === 0" class="empty-state">
      暂无SSE数据
    </div>
    <el-scrollbar v-else ref="scrollBarRef" @scroll="handleScroll" :noresize="true" always :min-size="50"
      :height="`${scrollBarHeight}px`">
      <div ref="sseContentRef" class="sse-content" @wheel="handleCheckIsUserOperate"
        @touchstart="handleCheckIsUserOperate" @keydown="handleKeydownWithPopover">
        
        <!-- 虚拟滚动优化：只渲染可见区域的消息 -->
        <div v-if="virtualScrollEnabled" :style="{ height: `${totalHeight}px`, position: 'relative' }">
          <div
            v-for="sseMessage in visibleItems"
            :key="sseMessage.originalIndex"
            :ref="el => setMessageRef(el, sseMessage.originalIndex)"
            class="sse-message"
            :class="{ 'sse-message-hex': sseMessage.dataType === 'binary' }"
            :style="{ position: 'absolute', top: `${sseMessage.top}px`, width: '100%' }"
            @click="handleMessageClick(sseMessage.originalIndex, $event)"
          >
            <div class="message-index">{{ sseMessage.originalIndex + 1 }}</div>
            <pre class="message-content">
              {{ (sseMessage.event || '') + ' ' + (sseMessage.data || '') }}
            </pre>
            <div class="message-timestamp">
              {{ formatTimestamp(sseMessage.timestamp) }}
            </div>
          </div>
        </div>

        <!-- 常规渲染：数据量较少时使用 -->
        <template v-else>
          <div
            v-for="(sseMessage, index) in formattedData"
            :key="index"
            :ref="el => setMessageRef(el, index)"
            class="sse-message"
            :class="{ 'sse-message-hex': sseMessage.dataType === 'binary' }"
            @click="handleMessageClick(index, $event)"
          >
            <div class="message-index">{{ index + 1 }}</div>
            <pre class="message-content">
              {{ (sseMessage.event || '') + ' ' + (sseMessage.data || '') }}
            </pre>
            <div class="message-timestamp">
              {{ formatTimestamp(sseMessage.timestamp) }}
            </div>
          </div>
        </template>

        <!-- 单个 Popover -->
        <el-popover
          :visible="activePopoverIndex !== -1"
          placement="right-start"
          :width="600"
          :popper-style="{ padding: '0' }"
          :hide-after="0"
          transition="none"
          :virtual-ref="currentMessageRef"
          virtual-triggering
          @hide="handlePopoverHide"
        >
          <template #default>
            <div v-if="currentMessage" class="sse-message-detail">
              <div class="detail-header">
                <div class="header">消息详情</div>
                <div class="close-btn" @click="handleClosePopover">
                  <i class="iconfont iconguanbi" title="关闭"></i>
                </div>
              </div>
              <div class="detail-content-wrap">
                <div class="detail-row">
                  <div class="row-item w-20">
                    <label>序号:</label>
                    <span>{{ activePopoverIndex + 1 }}</span>
                  </div>
                  <div v-if="currentMessage.event" class="row-item w-30">
                    <label>事件类型:</label>
                    <span>{{ currentMessage.event }}</span>
                  </div>
                  <div class="row-item w-50">
                    <label>接受时间:</label>
                    <span>{{ formatFullTimestamp(currentMessage.timestamp) }}</span>
                  </div>
                </div>
                <div class="detail-content full-width">
                  <div class="content-tabs">
                    <div class="tab-header">
                      <div class="tab-item" :class="{ active: getActiveContentTab(activePopoverIndex) === 'content' }"
                        @click="setActiveContentTab(activePopoverIndex, 'content')">
                        完整内容
                      </div>
                      <div v-if="currentMessage.rawBlock && currentMessage.dataType !== 'binary'" class="tab-item"
                        :class="{ active: getActiveContentTab(activePopoverIndex) === 'raw' }"
                        @click="setActiveContentTab(activePopoverIndex, 'raw')">
                        原始数据块
                      </div>
                    </div>
                    <div class="tab-content">
                      <div v-if="getActiveContentTab(activePopoverIndex) === 'content'" class="content-wrapper">
                        <SJsonEditor
                          v-if="isJsonString(currentMessage.data || currentMessage.rawBlock)"
                          :model-value="getFormattedContent(activePopoverIndex, currentMessage.data || currentMessage.rawBlock)"
                          :read-only="true"
                          :min-height="100"
                          :max-height="350"
                          :auto-height="true"
                          :config="{ fontSize: 13, language: 'json' }"
                        />
                        <pre v-else class="full-content">{{ currentMessage.data || currentMessage.rawBlock }}</pre>
                      </div>
                      <div
                        v-if="getActiveContentTab(activePopoverIndex) === 'raw' && currentMessage.rawBlock && currentMessage.dataType !== 'binary'"
                        class="content-wrapper">
                        <SJsonEditor
                          :model-value="currentMessage.rawBlock"
                          :read-only="true"
                          :min-height="100"
                          :max-height="350"
                          :auto-height="true"
                          :config="{ fontSize: 13, language: 'text/plain', wordWrap: 'on' }"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </el-popover>
      </div>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { debounce, isJsonString } from '@/helper';
import { ScrollbarInstance } from 'element-plus';
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { parseChunkList } from '@/utils/utils';
import dayjs from 'dayjs';
import type { ChunkWithTimestampe } from '@src/types/types';
import SJsonEditor from '@/components/common/json-editor/g-json-editor.vue';


/*
|--------------------------------------------------------------------------
| 全局变量
|--------------------------------------------------------------------------
*/
const props = withDefaults(defineProps<{ dataList: ChunkWithTimestampe[]; }>(), {
  dataList: () => []
});
const scrollBarRef = ref<ScrollbarInstance | null>(null);
const sseViewContainerRef = ref<HTMLElement | null>(null);
const sseContentRef = ref<HTMLElement | null>(null);
const autoScrollEnabled = ref(true); // 是否启用自动滚动
const scrollThreshold = 200; // 距离底部多少像素内认为是"接近底部"（减少阈值提高精度）
const scrollBarHeight = ref(0);

// 滚动状态管理
const isUserScrolling = ref(false); // 用户是否正在手动滚动
const lastScrollTime = ref(0); // 最后一次滚动时间
const scrollTimeoutId = ref<NodeJS.Timeout | null>(null);

// 性能优化：增量数据处理
const lastDataLength = ref(0);
const incrementalData = ref<any[]>([]);

// 虚拟滚动配置
const ITEM_HEIGHT = 23; // 每条消息的高度
const VIRTUAL_SCROLL_THRESHOLD = 500; // 超过500条消息启用虚拟滚动
const BUFFER_SIZE = 10; // 缓冲区大小

// 虚拟滚动状态
const virtualScrollEnabled = computed(() => formattedData.value.length > VIRTUAL_SCROLL_THRESHOLD);
const scrollTop = ref(0);
const containerHeight = computed(() => scrollBarHeight.value);

// 计算总高度
const totalHeight = computed(() => formattedData.value.length * ITEM_HEIGHT);

// 计算可见项目
const visibleItems = computed(() => {
  if (!virtualScrollEnabled.value) return [];
  
  const startIndex = Math.max(0, Math.floor(scrollTop.value / ITEM_HEIGHT) - BUFFER_SIZE);
  const endIndex = Math.min(
    formattedData.value.length - 1,
    Math.ceil((scrollTop.value + containerHeight.value) / ITEM_HEIGHT) + BUFFER_SIZE
  );

  return formattedData.value.slice(startIndex, endIndex + 1).map((item, index) => ({
    ...item,
    originalIndex: startIndex + index,
    top: (startIndex + index) * ITEM_HEIGHT
  }));
});

/*
|--------------------------------------------------------------------------
| Popover 相关
|--------------------------------------------------------------------------
*/
const activePopoverIndex = ref<number>(-1);
// 内容标签页状态管理，key 为消息索引，value 为当前激活的标签页
const activeContentTabs = ref<Record<number, 'content' | 'raw'>>({});
// 消息元素引用管理
const messageRefs = ref<Record<number, HTMLElement>>({});
// 当前激活的消息引用
const currentMessageRef = computed(() => {
  return activePopoverIndex.value !== -1 ? messageRefs.value[activePopoverIndex.value] : null;
});
// 当前激活的消息数据
const currentMessage = computed(() => {
  return activePopoverIndex.value !== -1 ? formattedData.value[activePopoverIndex.value] : null;
});

// 设置消息元素引用
const setMessageRef = (el: any, index: number) => {
  if (el && el instanceof HTMLElement) {
    messageRefs.value[index] = el;
  }
};

/*
|--------------------------------------------------------------------------
| 格式化相关
|--------------------------------------------------------------------------
*/
const formattedContent = ref<Record<number, string>>({});

// 获取格式化后的内容
const getFormattedContent = (index: number, content: string): string => {
  // 如果是 JSON 格式且已格式化，返回格式化结果
  if (isJsonString(content) && formattedContent.value[index]) {
    return formattedContent.value[index];
  }
  // 否则返回原始内容
  return content;
};

// 格式化 JSON 内容
const formatJsonContent = (index: number, content: string) => {
  if (isJsonString(content) && !formattedContent.value[index]) {
    try {
      // 先尝试解析 JSON 确保格式正确
      const parsed = JSON.parse(content);
      const formatted = JSON.stringify(parsed, null, 2);
      formattedContent.value[index] = formatted;
    } catch (error) {
      // 如果解析失败，保持原始内容
      formattedContent.value[index] = content;
    }
  }
};

// 处理消息点击事件（添加防抖）
const handleMessageClick = debounce((index: number, event: Event) => {
  event.stopPropagation();

  // 如果点击的是同一条消息，保持 popover 打开状态
  if (activePopoverIndex.value === index) {
    return;
  }

  // 切换到新的消息或打开 popover
  activePopoverIndex.value = index;

  // 触发格式化
  const sseMessage = formattedData.value[index];
  if (sseMessage) {
    const content = sseMessage.data || sseMessage.rawBlock;
    if (content) {
      formatJsonContent(index, content);
    }
  }
}, 100);

// 处理 popover 隐藏事件
const handlePopoverHide = () => {
  activePopoverIndex.value = -1;
};

// 关闭 popover
const handleClosePopover = () => {
  activePopoverIndex.value = -1;
};

// 处理点击外部区域关闭 popover
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.sse-message') && !target.closest('.el-popover')) {
    activePopoverIndex.value = -1;
  }
};

// 处理全局 ESC 键关闭 popover
const handleGlobalKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && activePopoverIndex.value !== -1) {
    activePopoverIndex.value = -1;
    event.preventDefault();
    event.stopPropagation();
  }
};

// 处理 ESC 键关闭 popover 和滚动键盘事件
const handleKeydownWithPopover = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    activePopoverIndex.value = -1;
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'PageUp' || e.key === 'PageDown') {
    // 键盘滚动时，标记为用户操作
    isUserScrolling.value = true;
    
    // 检查是否会滚动到底部附近
    setTimeout(() => {
      const contentHeight = virtualScrollEnabled.value 
        ? totalHeight.value 
        : (sseContentRef.value?.scrollHeight || 0);
      
      if (isNearBottom(scrollTop.value, contentHeight, scrollBarHeight.value)) {
        autoScrollEnabled.value = true;
        isUserScrolling.value = false;
      } else {
        autoScrollEnabled.value = false;
      }
    }, 100);
  }
};

// 获取当前激活的内容标签页
const getActiveContentTab = (index: number): 'content' | 'raw' => {
  return activeContentTabs.value[index] || 'content';
};

// 设置当前激活的内容标签页
const setActiveContentTab = (index: number, tab: 'content' | 'raw') => {
  activeContentTabs.value[index] = tab;
};


/*
|--------------------------------------------------------------------------
| sse数据处理
|--------------------------------------------------------------------------
*/

// 性能优化：增量解析SSE数据
const formattedData = computed(() => {
  if (!props.dataList || props.dataList.length === 0) {
    lastDataLength.value = 0;
    incrementalData.value = [];
    return [];
  }

  // 如果数据长度没有变化，直接返回缓存的结果
  if (props.dataList.length === lastDataLength.value && incrementalData.value.length > 0) {
    return incrementalData.value;
  }

  // 如果是新增数据，只解析新增部分
  if (props.dataList.length > lastDataLength.value && lastDataLength.value > 0) {
    const newChunks = props.dataList.slice(lastDataLength.value);
    const newParsedData = parseChunkList(newChunks);
    incrementalData.value = [...incrementalData.value, ...newParsedData];
    lastDataLength.value = props.dataList.length;
    
    // 新增数据时立即滚动到底部（如果启用了自动滚动）
    if (autoScrollEnabled.value) {
      // 延迟执行，确保 DOM 更新完成
      setTimeout(() => {
        scrollToBottom();
      }, 10);
    }
    
    return incrementalData.value;
  }

  // 完全重新解析（首次加载或数据重置）
  const parsed = parseChunkList(props.dataList);
  incrementalData.value = parsed;
  lastDataLength.value = props.dataList.length;
  return parsed;
});

// 格式化时间戳为毫秒显示
const formatTimestamp = (timestamp: number): string => {
  return dayjs(timestamp).format('HH:mm:ss');
};

// 格式化完整时间戳
const formatFullTimestamp = (timestamp: number): string => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
};

/*
|--------------------------------------------------------------------------
| 滚动相关
|--------------------------------------------------------------------------
*/

// 检查是否接近底部
const isNearBottom = (scrollTop: number, contentHeight: number, containerHeight: number): boolean => {
  return scrollTop + containerHeight + scrollThreshold >= contentHeight;
};

// 处理滚动事件
const handleScroll = (scrollInfo: { scrollTop: number }) => {
  scrollTop.value = scrollInfo.scrollTop;
  lastScrollTime.value = Date.now();
  
  // 计算内容高度
  const contentHeight = virtualScrollEnabled.value 
    ? totalHeight.value 
    : (sseContentRef.value?.scrollHeight || 0);
  
  // 检查是否滚动到底部附近
  const nearBottom = isNearBottom(scrollInfo.scrollTop, contentHeight, scrollBarHeight.value);
  
  if (nearBottom) {
    // 如果滚动到底部附近，启用自动滚动
    autoScrollEnabled.value = true;
    isUserScrolling.value = false;
  } else {
    // 如果不在底部，说明用户手动滚动了，禁用自动滚动
    if (!isUserScrolling.value) {
      isUserScrolling.value = true;
      autoScrollEnabled.value = false;
    }
  }
  
  // 清除之前的超时，设置新的超时来检测滚动结束
  if (scrollTimeoutId.value) {
    clearTimeout(scrollTimeoutId.value);
  }
  
  scrollTimeoutId.value = setTimeout(() => {
    isUserScrolling.value = false;
    // 滚动结束后，如果还在底部附近，重新启用自动滚动
    const currentContentHeight = virtualScrollEnabled.value 
      ? totalHeight.value 
      : (sseContentRef.value?.scrollHeight || 0);
    if (isNearBottom(scrollInfo.scrollTop, currentContentHeight, scrollBarHeight.value)) {
      autoScrollEnabled.value = true;
    }
  }, 150); // 150ms 内没有新的滚动事件则认为滚动结束
};
// 处理用户交互事件（wheel, touchstart）
const handleCheckIsUserOperate = debounce(() => {
  // 只有在不接近底部时才禁用自动滚动
  const contentHeight = virtualScrollEnabled.value 
    ? totalHeight.value 
    : (sseContentRef.value?.scrollHeight || 0);
  
  if (!isNearBottom(scrollTop.value, contentHeight, scrollBarHeight.value)) {
    autoScrollEnabled.value = false;
    isUserScrolling.value = true;
  }
}, 50); // 减少延迟，提高响应性

// 滚动到底部
const scrollToBottom = () => {
  if (!autoScrollEnabled.value) {
    return;
  }
  
  // 标记这是程序自动滚动，不是用户操作
  const isAutoScroll = true;
  
  // 使用 requestAnimationFrame 确保在下一帧执行
  requestAnimationFrame(() => {
    nextTick(() => {
      if (virtualScrollEnabled.value) {
        // 虚拟滚动模式：滚动到虚拟内容的底部
        const maxScrollTop = Math.max(0, totalHeight.value - scrollBarHeight.value);
        scrollBarRef.value?.setScrollTop(maxScrollTop);
      } else {
        // 常规模式：等待 DOM 更新后滚动到实际内容底部
        const sseContent = sseContentRef.value;
        if (sseContent) {
          // 使用 scrollHeight 而不是 clientHeight
          const contentHeight = sseContent.scrollHeight;
          if (contentHeight > scrollBarHeight.value) {
            scrollBarRef.value?.setScrollTop(contentHeight);
          }
        }
      }
      
      // 确保自动滚动后保持自动滚动状态
      if (isAutoScroll) {
        autoScrollEnabled.value = true;
        isUserScrolling.value = false;
      }
    });
  });
};
// 监听formattedData变化，确保新消息能触发滚动（减少防抖延迟）
const debouncedScrollToBottom = debounce(() => {
  if (autoScrollEnabled.value) {
    scrollToBottom();
  }
}, 500); // 减少到一帧时间，提高响应速度

watch(
  formattedData,
  () => {
    // 立即触发滚动，不使用防抖
    if (autoScrollEnabled.value) {
      scrollToBottom();
    }
  },
  { flush: 'post' } // 确保在 DOM 更新后执行
);

// 直接监听 dataList 的变化，确保数据更新时能及时滚动
watch(
  () => props.dataList.length,
  (newLength, oldLength) => {
    // 当有新数据时，触发滚动
    if (newLength > oldLength && autoScrollEnabled.value) {
      nextTick(() => {
        scrollToBottom();
      });
    }
  }
);

// 清理函数
const cleanup = () => {
  // 清理 messageRefs 中超过限制的旧引用
  const maxRefs = 1000; // 最多保留1000条消息的引用
  const currentLength = Object.keys(messageRefs.value).length;
  if (currentLength > maxRefs) {
    const sortedKeys = Object.keys(messageRefs.value)
      .map(Number)
      .sort((a, b) => a - b);
    const keysToDelete = sortedKeys.slice(0, currentLength - maxRefs);
    keysToDelete.forEach(key => {
      delete messageRefs.value[key];
      delete formattedContent.value[key];
      delete activeContentTabs.value[key];
    });
  }
};

// 定期清理
const cleanupInterval = setInterval(cleanup, 30000); // 每30秒清理一次

onMounted(() => {
  scrollBarHeight.value = sseViewContainerRef.value!.clientHeight;
  // 添加全局点击事件监听器
  document.addEventListener('click', handleClickOutside);
  // 添加全局键盘事件监听器
  document.addEventListener('keydown', handleGlobalKeydown);
  
  // 初始化时如果有数据，滚动到底部
  if (formattedData.value.length > 0 && autoScrollEnabled.value) {
    nextTick(() => {
      scrollToBottom();
    });
  }
});

onBeforeUnmount(() => {
  // 移除全局点击事件监听器
  document.removeEventListener('click', handleClickOutside);
  // 移除全局键盘事件监听器
  document.removeEventListener('keydown', handleGlobalKeydown);
  // 清理定时器
  clearInterval(cleanupInterval);
  // 取消防抖函数
  debouncedScrollToBottom.cancel();
  // 清理滚动检测定时器
  if (scrollTimeoutId.value) {
    clearTimeout(scrollTimeoutId.value);
  }
});
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
    .sse-message {
      display: flex;
      align-items: center;
      padding: 4px 12px 4px 0;
      border-radius: 4px;
      background-color: var(--bg-color, #ffffff);

      &.sse-message-hex {
        border-left: 3px solid var(--color-warning, #e6a23c);
        background-color: var(--color-warning-light-9, #fdf6ec);
      }

      .message-index {
        font-size: 12px;
        color: var(--color-primary, #409eff);
        font-weight: bold;
        min-width: 30px;
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
        cursor: pointer;

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

.sse-message-detail {
  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 16px;
    border-bottom: 1px solid var(--border-color-lighter, #ebeef5);
    background: linear-gradient(to right, #2c3e50, #3a4a5f);
    color: var(--white, #ffffff);
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;

    .header {
      margin: 0;
      font-size: 16px;
      color: var(--white, #ffffff);
    }

    .close-btn {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 5px;
      cursor: pointer;
      color: var(--white, #ffffff);
      transition: background-color 0.2s;

      .iconfont {
        font-size: 12px;
      }

      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }
  }

  .detail-content-wrap {
    padding: 16px;
    max-height: 500px;
    overflow-y: auto;

    .detail-row {
      display: flex;

      .row-item {
        label {
          margin-right: 10px;
        }
      }
    }

    .detail-content {
      display: flex;
      margin-bottom: 12px;
      align-items: flex-start;

      &.full-width {
        flex-direction: column;
        margin-bottom: 16px;
      }

      label {
        min-width: 80px;
        font-weight: 600;
        color: var(--text-color-regular, #606266);
        margin-right: 12px;
        flex-shrink: 0;
      }

      span {
        color: var(--text-color-primary, #303133);
        word-break: break-all;
      }

      .content-tabs {
        width: 100%;
        margin-top: 8px;

        .tab-header {
          display: flex;
          border-bottom: 1px solid var(--border-color-lighter, #ebeef5);
          margin-bottom: 12px;

          .tab-item {
            padding: 8px 16px;
            cursor: pointer;
            font-size: 14px;
            color: var(--text-color-regular, #606266);
            border-bottom: 2px solid transparent;
            transition: all 0.2s;

            &:hover {
              color: var(--color-primary, #409eff);
            }

            &.active {
              color: var(--color-primary, #409eff);
              border-bottom-color: var(--color-primary, #409eff);
            }
          }
        }

        .tab-content {
          .content-wrapper {
            width: 100%;
            max-height: 350px;
          }

          .full-content,
          .raw-block {
            background-color: var(--fill-color-extra-light, #fafcff);
            border: 1px solid var(--border-color-lighter, #ebeef5);
            border-radius: 4px;
            padding: 12px;
            margin: 0;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 13px;
            color: var(--text-color-primary, #303133);
            white-space: pre-wrap;
            word-break: break-all;
            max-height: 350px;
            overflow-y: auto;
            line-height: 1.4;
          }

          .raw-block {
            background-color: var(--color-info-light-9, #f4f4f5);
            color: var(--text-color-secondary, #909399);
          }
        }
      }

      .content-wrapper {
        width: 100%;
        margin-top: 8px;
      }
    }
  }
}
</style>
