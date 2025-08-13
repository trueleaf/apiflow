<template>
  <div ref="sseViewContainerRef" class="sse-view">
    <div v-if="!dataList || dataList.length === 0" class="empty-state">
      <el-icon class="loading-icon">
        <Loading />
      </el-icon>
      <span>等待数据返回中</span>
    </div>
    <GVirtualScroll
      class="sse-content"
      :items="formattedData"
      :auto-scroll="true"
      :virtual="virtual"
      :item-height="25"
    >
      <template #default="{ item, index }">
        <div   
          :ref="el => setMessageRef(el, index)"
          class="sse-message"
          :class="{ 'sse-message-hex': item.dataType === 'binary' }"
          @click="handleMessageClick(index, $event)"
        >
          <div class="message-index">{{ index + 1 }}</div>
            <pre class="message-content">
              {{ (item.event || '') + ' ' + (item.data || '') }}
            </pre>
            <div class="message-timestamp">
              {{ formatTimestamp(item.timestamp) }}
            </div>
        </div>
      </template>
    </GVirtualScroll>
    <!-- json详情弹窗 -->
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
</template>

<script lang="ts" setup>
import { debounce, isJsonString } from '@/helper';
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { parseChunkList } from '@/utils/utils';
import dayjs from 'dayjs';
import type { ChunkWithTimestampe } from '@src/types/types';
import SJsonEditor from '@/components/common/json-editor/g-json-editor.vue';
import GVirtualScroll from '@/components/apidoc/virtual-scroll/g-virtual-scroll.vue';
import { Loading } from '@element-plus/icons-vue';

/*
|--------------------------------------------------------------------------
| 全局变量
|--------------------------------------------------------------------------
*/
const props = withDefaults(defineProps<{ dataList: ChunkWithTimestampe[]; virtual?: boolean }>(), {
  dataList: () => [],
  virtual: false,
});
const sseViewContainerRef = ref<HTMLElement | null>(null);

// 性能优化：增量数据处理
const lastDataLength = ref(0);
const incrementalData = ref<any[]>([]);

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
  // 添加全局点击事件监听器
  document.addEventListener('click', handleClickOutside);
  // 添加全局键盘事件监听器
  document.addEventListener('keydown', handleGlobalKeydown);
});

onBeforeUnmount(() => {
  // 移除全局点击事件监听器
  document.removeEventListener('click', handleClickOutside);
  // 移除全局键盘事件监听器
  document.removeEventListener('keydown', handleGlobalKeydown);
  // 清理定时器
  clearInterval(cleanupInterval);
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
    flex-direction: column;
    height: 200px;
    color: var(--text-color-secondary, #909399);
    font-size: 14px;
    gap: 12px;

    .loading-icon {
      font-size: 24px;
      animation: loading-rotate 2s linear infinite;
    }

    span {
      font-size: 14px;
    }
  }

  @keyframes loading-rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .sse-content {
    .sse-message {
      display: flex;
      align-items: center;
      padding: 4px 12px 4px 0;
      height: 100%;
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
