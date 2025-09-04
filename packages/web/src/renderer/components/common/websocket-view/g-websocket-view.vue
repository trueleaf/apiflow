<template>
  <div class="websocket-view">
    <!-- 筛选框组件 -->
    <WebsocketFilter
      :has-data="dataList && dataList.length > 0"
      :is-raw-view="false"
      :filtered-count="filteredData.length"
      @update:filter-text="handleFilterTextUpdate"
      @update:is-regex-mode="handleRegexModeUpdate"
      @update:filter-error="handleFilterErrorUpdate"
      @download="handleDownloadData"
    />
    <el-empty v-if="!dataList || dataList.length === 0" :description="$t('点击发起连接建立WebSocket连接')"></el-empty>
    <!-- 虚拟滚动视图 -->
    <GVirtualScroll v-else class="websocket-content" :items="filteredData" :auto-scroll="true"
      :item-height="28">
      <template #default="{ item }">
        <div class="websocket-message" @click="handleMessageClick(item.originalIndex, $event)">
          <div class="message-index">{{ item.originalIndex + 1 }}</div>
          <div v-if="item.type === 'send' || item.type === 'receive' || item.type === 'heartbeat'" class="message-type" :class="`type-${item.type}`">
            <el-icon v-if="item.type === 'send' || item.type === 'heartbeat'">
              <Top />
            </el-icon>
            <el-icon v-else-if="item.type === 'receive'">
              <Bottom />
            </el-icon>
          </div>
          <pre class="message-content">{{ getMessagePreview(item) }}</pre>
          <div class="message-timestamp">
            {{ formatTimestamp(item.data.timestamp) }}
          </div>
        </div>
      </template>
    </GVirtualScroll>
    <!-- WebSocket 消息详情弹窗 -->
    <WebsocketPopover
      :visible="activePopoverIndex !== -1"
      :message="currentMessage"
      :message-index="activePopoverIndex"
      :virtual-ref="currentMessageRef"
      @hide="handleClosePopover"
      @close="handleClosePopover"
    />
  </div>
</template>

<script lang="ts" setup>
import { downloadStringAsText, formatDate } from '@/helper';
import { computed, ref, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue';
import type { WebsocketResponse } from '@src/types/websocket/websocket';
import GVirtualScroll from '@/components/apidoc/virtual-scroll/g-virtual-scroll.vue';
import WebsocketPopover from './components/popover/websocket-popover.vue';
import WebsocketFilter from './components/filter/websocket-filter.vue';
import { Top, Bottom } from '@element-plus/icons-vue';

const instance = getCurrentInstance();
const $t = instance?.appContext.config.globalProperties.$t;

const props = withDefaults(defineProps<{ 
  dataList: WebsocketResponse[]; 
  virtual?: boolean; 
}>(), {
  dataList: () => [],
});

const filterText = ref('');
const isRegexMode = ref(false);
const filterError = ref('');
const filteredData = computed(() => {
  // 过滤掉开始连接状态的消息
  const filteredList = props.dataList.filter(item => item.type !== 'startConnect');
  
  if (!filterText.value.trim()) {
    return filteredList.map((item, index) => ({ ...item, originalIndex: index }));
  }
  try {
    let regex: RegExp;
    if (isRegexMode.value) {
      const trimmedText = filterText.value.trim();
      const regexMatch = trimmedText.match(/^\/(.+)\/([gimuy]*)$/);
      if (regexMatch) {
        regex = new RegExp(regexMatch[1], regexMatch[2]);
      } else {
        regex = new RegExp(trimmedText, 'gi');
      }
    } else {
      const escapedText = filterText.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      regex = new RegExp(escapedText, 'gi');
    }
    filterError.value = '';
    return filteredList
      .map((item: WebsocketResponse, index: number) => ({ ...item, originalIndex: index }))
      .filter((item: WebsocketResponse & { originalIndex: number }) => {
        const content = getMessagePreview(item);
        return regex.test(content);
      });

  } catch (error) {
    filterError.value = `${$t?.('正则表达式错误') || '正则表达式错误'}: ${error instanceof Error ? error.message : $t?.('未知错误') || '未知错误'}`;
    return filteredList.map((item, index) => ({ ...item, originalIndex: index }));
  }
});
const activePopoverIndex = ref(-1);
const currentMessageRef = ref<HTMLElement | null>(null);
const currentMessage = computed(() => {
  return activePopoverIndex.value !== -1 ? props.dataList[activePopoverIndex.value] : null;
});
/*
|--------------------------------------------------------------------------
| 搜索、下载相关逻辑
|--------------------------------------------------------------------------
*/
// 处理筛选框组件的事件
const handleFilterTextUpdate = (value: string) => {
  filterText.value = value;
  activePopoverIndex.value = -1;
};
const handleRegexModeUpdate = (value: boolean) => {
  isRegexMode.value = value;
};
const handleFilterErrorUpdate = (value: string) => {
  filterError.value = value;
};
const handleDownloadData = () => {
  if (!props.dataList || props.dataList.length === 0) {
    return;
  }
  try {
    const jsonContent = JSON.stringify(props.dataList, null, 2);
    const timestamp = formatDate(Date.now(), 'YYYY-MM-DD_HH-mm-ss');
    const fileName = `websocket-messages_${timestamp}.json`;
    downloadStringAsText(jsonContent, fileName);
  } catch (error) {
    console.error($t?.('下载失败') || '下载失败:', error);
  }
};

/*
|--------------------------------------------------------------------------
| Popover 相关
|--------------------------------------------------------------------------
*/
const handleMessageClick = (index: number, event: Event) => {
  event.stopPropagation();
  if (activePopoverIndex.value === index) {
    return;
  }
  activePopoverIndex.value = index;
  currentMessageRef.value = event.currentTarget as HTMLElement;
}
const handleClosePopover = () => {
  activePopoverIndex.value = -1;
  currentMessageRef.value = null;
};
const handleGlobalKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && activePopoverIndex.value !== -1) {
    handleClosePopover();
  }
};
/*
|--------------------------------------------------------------------------
| WebSocket数据处理
|--------------------------------------------------------------------------
*/
// 获取消息预览内容
const getMessagePreview = (message: WebsocketResponse): string => {
  const data = message.data as any;
  
  switch (message.type) {
    case 'send':
    case 'receive':
    case 'heartbeat':
      return data.content || data.message || '';
    case 'connected':
      return `${$t?.('已连接到') || '已连接到'} ${data.url || ''}`;
    case 'disconnected':
      return `${$t?.('已断开连接') || '已断开连接'} ${data.url || ''}`;
    case 'error':
      return `${$t?.('错误') || '错误'}: ${data.error || ''}`;
    case 'reconnecting':
      return `${$t?.('重连中') || '重连中'} ${$t?.('重试第') || '重试第'} ${data.attempt} ${$t?.('次URL') || '次，URL:'} ${data.url}`;
    default:
      return JSON.stringify(data);
  }
};

// 格式化时间戳为毫秒显示
const formatTimestamp = (timestamp: number): string => {
  return formatDate(timestamp, 'HH:mm:ss.SSS');
};

onMounted(() => {
  document.addEventListener('click', handleClosePopover);
  document.addEventListener('keydown', handleGlobalKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClosePopover);
  document.removeEventListener('keydown', handleGlobalKeydown);
});
</script>

<style lang="scss" scoped>
.websocket-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .el-empty {
    height: 100%;
  }

  .websocket-content {
    .websocket-message {
      display: flex;
      align-items: center;
      padding: 6px 12px 6px 0;
      height: 100%;
      border-radius: 4px;
      background-color: var(--bg-color, #ffffff);
      cursor: pointer;

      .message-index {
        font-size: 12px;
        color: var(--gray-500, #409eff);
        font-weight: bold;
        min-width: 30px;
        text-align: right;
        margin-right: 10px;
        flex-shrink: 0;
      }

      .message-type {
        border-radius: 3px;
        font-size: 14px;
        font-weight: 500;
        min-width: 20px;
        text-align: center;
        margin-right: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        &.type-send,
        &.type-heartbeat {
          color: var(--color-success, #67c23a);
        }

        &.type-receive {
          color: var(--color-danger, #f56c6c);
        }
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
        margin: 0 12px 0 0;
      }

      .message-timestamp {
        font-size: 11px;
        color: var(--text-color-secondary, #909399);
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        min-width: 90px;
        text-align: right;
        flex-shrink: 0;
      }

      &:hover {
        background-color: var(--fill-color-lighter, #f2f6fc);
      }

      &.message-error {
        border-left: 3px solid var(--color-danger, #f56c6c);
        background-color: var(--color-danger-light-9, #fef0f0);

        &:hover {
          background-color: var(--color-danger-light-8, #fde2e2);
        }
      }

      &.message-success {
        border-left: 3px solid var(--color-success, #67c23a);
        background-color: var(--color-success-light-9, #f0f9ff);

        &:hover {
          background-color: var(--color-success-light-8, #e1f3d8);
        }
      }

      &.message-warning {
        border-left: 3px solid var(--color-warning, #e6a23c);
        background-color: var(--color-warning-light-9, #fdf6ec);

        &:hover {
          background-color: var(--color-warning-light-8, #faecd8);
        }
      }
    }
  }
}
</style>
