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
      @update:selected-message-types="handleSelectedMessageTypesUpdate"
      @update:is-search-input-visible="handleSearchInputVisibleUpdate"
      @download="handleDownloadData"
      @clear-data="handleClearData"
    />
    <el-empty v-if="!dataList || dataList.length === 0" :description="t('点击发起连接建立WebSocket连接')"></el-empty>
    <!-- 虚拟滚动视图 -->
    <GVirtualScroll v-else 
      class="websocket-content" 
      :class="{ 'with-filter-stats': shouldAddMarginTop }"
      :items="filteredData" 
      :virtual="false"
      :item-height="28">
      <template #default="{ item }">
        <div 
          class="websocket-message" 
          @click="handleMessageClick(item.originalIndex, $event)"
          @contextmenu.stop.prevent="handleContextmenu($event, item.originalIndex)"
        >
          <div class="message-index">{{ item.originalIndex }}</div>
          <div v-if="item.type === 'send' || item.type === 'receive' || item.type === 'autoSend'" class="message-type" :class="`type-${item.type}`">
            <el-icon v-if="item.type === 'send' || item.type === 'autoSend'">
              <Top />
            </el-icon>
            <el-icon v-else-if="item.type === 'receive'">
              <Bottom />
            </el-icon>
          </div>
          <!-- 发送、接收、自动发送消息使用 message-content 展示 -->
          <div v-if="item.type === 'send' || item.type === 'receive' || item.type === 'autoSend'" class="message-content">
            {{ getMessagePreview(item) }}
          </div>
          <!-- 其他类型消息使用 status-info 展示 -->
          <div v-else class="status-info">
            <el-icon v-if="item.type === 'connected'" class="status-icon success">
              <SuccessFilled />
            </el-icon>
            <el-icon v-else-if="item.type === 'disconnected'" class="status-icon warning">
              <WarnTriangleFilled />
            </el-icon>
            <el-icon v-else-if="item.type === 'error'" class="status-icon danger">
              <CircleCloseFilled />
            </el-icon>
            <div class="status-type">{{ getStatusTypeText(item.type) }}</div>
            <div class="status-data">{{ getStatusDataText(item) }}</div>
          </div>
          <div class="message-timestamp">
            {{ formatDate(item.data.timestamp, 'HH:mm:ss') }}
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
    <!-- 右键菜单 -->
    <teleport to="body">
      <SContextmenu 
        v-if="showContextmenu" 
        :left="contextmenuLeft" 
        :top="contextmenuTop"
      >
        <SContextmenuItem 
          v-if="canCopyMessage"
          :label="t('复制内容')" 
          @click="handleCopyMessage"
        ></SContextmenuItem>
      </SContextmenu>
    </teleport>
  </div>
</template>

<script lang="ts" setup>
import { downloadStringAsText } from '@/helper'
import { formatDate } from '@/helper';
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue';
import type { WebsocketResponse } from '@src/types/websocketNode';
import GVirtualScroll from '@/components/apidoc/virtualScroll/ClVirtualScroll.vue';
import WebsocketPopover from './components/popover/WebsocketPopover.vue';
import WebsocketFilter from './components/filter/WebsocketFilter.vue';
import SContextmenu from '@/components/common/contextmenu/ClContextmenu.vue';
import SContextmenuItem from '@/components/common/contextmenu/ClContextmenuItem.vue';
import { Top, Bottom, SuccessFilled, WarnTriangleFilled, CircleCloseFilled } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { message } from '@/helper';
import type { ClWebsocketViewProps, ClWebsocketViewEmits } from '@src/types/components/components';

const { t } = useI18n();

const props = withDefaults(defineProps<ClWebsocketViewProps>(), {
  dataList: () => [],
});
const emit = defineEmits<ClWebsocketViewEmits>();

const filterText = ref('');
const isRegexMode = ref(false);
const filterError = ref('');
const selectedMessageTypes = ref<string[]>([]);
const isSearchInputVisible = ref(false);

// 右键菜单相关状态
const showContextmenu = ref(false);
const contextmenuLeft = ref(0);
const contextmenuTop = ref(0);
const currentRightClickIndex = ref(-1);

// 计算是否显示统计信息并需要添加margin-top
const shouldAddMarginTop = computed(() => filterText.value && isSearchInputVisible.value);
const filteredData = computed(() => {
  // 预先绑定原始索引，确保与 props.dataList 对齐
  const withIndex = props.dataList.map((item, index) => ({ ...item, originalIndex: index }));
  // 过滤掉开始连接状态的消息
  let list = withIndex.filter(item => item.type !== 'startConnect');
  // 按消息类型过滤
  if (selectedMessageTypes.value.length > 0) list = list.filter(item => selectedMessageTypes.value.includes(item.type));
  if (!filterText.value.trim()) return list;
  try {
    let regex: RegExp;
    if (isRegexMode.value) {
      const trimmedText = filterText.value.trim();
      const regexMatch = trimmedText.match(/^\/(.+)\/([gimuy]*)$/);
      regex = regexMatch ? new RegExp(regexMatch[1], regexMatch[2]) : new RegExp(trimmedText, 'gi');
    } else {
      const escapedText = filterText.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      regex = new RegExp(escapedText, 'gi');
    }
    filterError.value = '';
    return list.filter(item => {
      // 修正 g 标志导致的 lastIndex 影响
      regex.lastIndex = 0;
      const content = getMessagePreview(item);
      return regex.test(content);
    });
  } catch (error) {
    filterError.value = `${t?.('正则表达式错误') || '正则表达式错误'}: ${error instanceof Error ? error.message : t?.('未知错误') || '未知错误'}`;
    return list;
  }
});
const activePopoverIndex = ref(-1);
const currentMessageRef = ref<HTMLElement | null>(null);
const currentMessage = computed(() => {
  const idx = activePopoverIndex.value;
  return idx !== -1 && idx >= 0 && idx < props.dataList.length ? props.dataList[idx] : null;
});

// 当前右键菜单对应的消息
const currentRightClickMessage = computed(() => {
  const idx = currentRightClickIndex.value;
  return idx !== -1 && idx >= 0 && idx < props.dataList.length ? props.dataList[idx] : null;
});

// 判断当前右键的消息是否可以复制
const canCopyMessage = computed(() => {
  const msg = currentRightClickMessage.value;
  if (!msg) return false;
  // 只有 send、receive、autoSend 类型的消息才可以复制
  return msg.type === 'send' || msg.type === 'receive' || msg.type === 'autoSend';
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
const handleSelectedMessageTypesUpdate = (value: string[]) => {
  selectedMessageTypes.value = value;
  activePopoverIndex.value = -1;
};
const handleSearchInputVisibleUpdate = (value: boolean) => {
  isSearchInputVisible.value = value;
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
    console.error(t?.('下载失败') || '下载失败:', error);
  }
};
const handleClearData = () => {
  activePopoverIndex.value = -1;
  currentMessageRef.value = null;
  emit('clearData');
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
| 右键菜单相关
|--------------------------------------------------------------------------
*/
// 处理右键菜单
const handleContextmenu = (e: MouseEvent, index: number) => {
  e.stopPropagation();
  currentRightClickIndex.value = index;
  contextmenuLeft.value = e.clientX;
  contextmenuTop.value = e.clientY;
  showContextmenu.value = true;
  // 关闭详情弹窗
  if (activePopoverIndex.value !== -1) {
    handleClosePopover();
  }
};

// 复制消息内容
const handleCopyMessage = async () => {
  const msg = currentRightClickMessage.value;
  if (!msg) return;
  
  try {
    let contentToCopy = '';
    
    // 根据消息类型提取内容
    switch (msg.type) {
      case 'send':
        contentToCopy = (msg.data as { content: string }).content || '';
        break;
      case 'receive': {
        const receiveData = msg.data as { content: ArrayBuffer | string; mimeType?: string };
        if (receiveData.content instanceof ArrayBuffer) {
          contentToCopy = parseArrayBuffer(receiveData.content, receiveData.mimeType);
        } else {
          contentToCopy = receiveData.content || '';
        }
        break;
      }
      case 'autoSend':
        contentToCopy = (msg.data as { message: string }).message || '';
        break;
      default:
        return;
    }
    
    // 复制到剪贴板
    await navigator.clipboard.writeText(contentToCopy);
    message.success(t('复制成功'));
  } catch (error) {
    console.error('复制失败:', error);
    message.error(t('复制失败'));
  } finally {
    showContextmenu.value = false;
  }
};

// 全局点击关闭右键菜单
const handleGlobalClickForContextmenu = () => {
  showContextmenu.value = false;
};

/*
|--------------------------------------------------------------------------
| WebSocket数据处理
|--------------------------------------------------------------------------
*/
// 解析 ArrayBuffer 为字符串
const parseArrayBuffer = (buffer: ArrayBuffer, mimeType?: string): string => {
  try {
    // 检查是否为文本类型
    if (mimeType && (mimeType.startsWith('text/') || mimeType.includes('json') || mimeType.includes('xml'))) {
      const decoder = new TextDecoder('utf-8');
      return decoder.decode(buffer);
    }
    
    // 尝试解码为文本
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(buffer);
    
    // 检查是否包含有效的文本字符
    if (/^[\x20-\x7E\s\u4e00-\u9fff]*$/.test(text)) {
      return text;
    }
    
    // 如果不是文本，显示为十六进制
    const uint8Array = new Uint8Array(buffer);
    const hexString = Array.from(uint8Array)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join(' ');
    return `[${t?.('二进制数据') || '二进制数据'}] ${hexString.substring(0, 100)}${hexString.length > 100 ? '...' : ''}`;
  } catch (error) {
    return `[${t?.('解析错误') || '解析错误'}] ${error instanceof Error ? error.message : t?.('未知错误') || '未知错误'}`;
  }
};

// 获取消息预览内容
const getMessagePreview = (message: WebsocketResponse): string => {
  switch (message.type) {
    case 'send':
      return message.data.content || '';
    case 'receive':
      return parseArrayBuffer(message.data.content, message.data.mimeType);
    case 'autoSend':
      return message.data.message || '';
    default:
      return '';
  }
};

// 获取状态类型文本
const getStatusTypeText = (type: string): string => {
  switch (type) {
    case 'connected':
      return t?.('已连接到：') || '已连接到：';
    case 'disconnected':
      return t?.('已断开连接：') || '已断开连接：';
    case 'error':
      return t?.('错误') || '错误';
    case 'reconnecting':
      return t?.('重连中') || '重连中';
    case 'startConnect':
      return t?.('开始连接') || '开始连接';
    default:
      return type;
  }
};

// 获取状态数据文本
const getStatusDataText = (message: WebsocketResponse): string => {
  switch (message.type) {
    case 'connected':
    case 'disconnected':
    case 'startConnect':
      return message.data.url || '';
    case 'error':
      return message.data.error || '';
    case 'reconnecting':
      return `${t?.('重试第') || '重试第'} ${message.data.attempt} ${t?.('次') || '次'}`;
    default:
      // 处理未知类型，使用类型断言确保类型安全
      const unknownData = (message as { data: Record<string, unknown> }).data;
      return JSON.stringify(unknownData);
  }
};

onMounted(() => {
  document.addEventListener('click', handleClosePopover);
  document.addEventListener('keydown', handleGlobalKeydown);
  document.body.addEventListener('click', handleGlobalClickForContextmenu);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClosePopover);
  document.removeEventListener('keydown', handleGlobalKeydown);
  document.body.removeEventListener('click', handleGlobalClickForContextmenu);
});

// 当数据源变化导致索引失效时，关闭弹窗
watch(
  () => props.dataList.length,
  (len) => {
    if (activePopoverIndex.value !== -1 && (activePopoverIndex.value < 0 || activePopoverIndex.value >= len)) {
      handleClosePopover();
    }
  }
);
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
    &.with-filter-stats {
      margin-top: 30px;
    }
    
    .websocket-message {
      display: flex;
      align-items: center;
      padding: 6px 12px 6px 0;
      height: 100%;
      border-radius: 4px;
      background-color: var(--bg-primary);
      cursor: pointer;

      .message-index {
        font-size: 12px;
        color: var(--text-tertiary);
        min-width: 30px;
        text-align: right;
        margin-right: 10px;
      }

      .message-type {
        border-radius: 3px;
        font-size: 14px;
        min-width: 20px;
        text-align: center;
        margin-right: 10px;
        display: flex;
        align-items: center;
        justify-content: center;

        &.type-send,
        &.type-autoSend {
          color: var(--success-color);
        }

        &.type-receive {
          color: var(--danger-color);
        }
      }

      .message-content {
        flex: 1;
        min-width: 0;
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        font-size: 12px;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin: 0 12px 0 0;
      }

      .status-info {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        margin: 0 12px 0 0;
        font-family: var(--font-family);
        .status-icon {
          margin-top: 2px;
          margin-right: 10px;
          font-size: 14px;
          flex-shrink: 0;
          min-width: 20px;
          &.success {
            color: var(--success-color);
          }

          &.warning {
            color: var(--warning-color);
          }

          &.danger {
            color: var(--danger-color);
          }
        }

        .status-type {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
          margin-right: 4px;
          white-space: nowrap;
        }

        .status-data {
          flex: 1;
          min-width: 0;
          font-size: 13px;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .message-timestamp {
        font-size: 12px;
        color: var(--text-tertiary);
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        min-width: 60px;
        text-align: right;
        flex-shrink: 0;
      }

      &:hover {
        background-color: var(--bg-hover);
      }

      &.message-error {
        border-left: 3px solid var(--danger-color);
        background-color: var(--bg-secondary);

        &:hover {
          background-color: var(--bg-hover);
        }
      }

      &.message-success {
        border-left: 3px solid var(--success-color);
        background-color: var(--bg-secondary);

        &:hover {
          background-color: var(--bg-hover);
        }
      }

      &.message-warning {
        border-left: 3px solid var(--warning-color);
        background-color: var(--bg-secondary);

        &:hover {
          background-color: var(--bg-hover);
        }
      }
    }
  }
}
</style>
