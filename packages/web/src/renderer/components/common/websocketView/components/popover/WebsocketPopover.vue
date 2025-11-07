<template>
  <el-popover 
    v-if="visible" 
    :visible="visible" 
    placement="right-start" 
    :width="600"
    :popper-style="{ padding: '0' }" 
    :hide-after="0" 
    transition="none" 
    :virtual-ref="virtualRef"
    virtual-triggering 
    @hide="handleHide"
  >
    <template #default>
      <div v-if="message" class="websocket-message-detail" @click.stop @mousedown.stop>
        <div class="detail-header">
          <div class="header">消息详情</div>
          <div class="close-btn" @click="handleClose">
            <i class="iconfont iconguanbi" title="关闭"></i>
          </div>
        </div>
        <div class="detail-content-wrap">
          <div class="detail-row">
            <div class="row-item w-15">
              <label>序号:</label>
              <span>{{ messageIndex }}</span>
            </div>
            <div class="row-item w-20">
              <label>类型:</label>
              <span class="message-type" :class="`type-${message.type}`">{{ getTypeDisplayName(message.type) }}</span>
            </div>
            <div v-if="getMessageSize(message)" class="row-item w-20">
              <label>大小:</label>
              <span>{{ formatSize(getMessageSize(message)) }}</span>
            </div>
            <div class="row-item w-45">
              <label>接收时间:</label>
              <span>{{ formatFullTimestamp(message.data.timestamp) }}</span>
            </div>
          </div>
          <div v-if="hasContent" class="detail-content full-width">
            <div class="content-tabs">
              <div class="tab-header">
                <div 
                  class="tab-item" 
                  :class="{ active: activeTab === 'content' }"
                  @click="setActiveTab('content')"
                >
                  {{ $t('消息内容') }}
                </div>
              </div>
              <div class="tab-content">
                <div v-if="activeTab === 'content'" class="content-wrapper">
                  <SJsonEditor 
                    v-if="isJsonString(messageContent)"
                    :model-value="getFormattedContent(messageContent)"
                    :read-only="true" 
                    :min-height="100" 
                    :max-height="350" 
                    :auto-height="true"
                    :config="{ fontSize: 13, language: 'json' }" 
                  />
                  <pre v-else class="full-content">{{ messageContent }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </el-popover>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue';
import { isJsonString } from '@/helper';
import dayjs from 'dayjs';
import SJsonEditor from '@/components/common/jsonEditor/ClJsonEditor.vue';
import type { WebsocketResponse } from '@src/types/websocketNode';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

/*
|--------------------------------------------------------------------------
| Props & Emits
|--------------------------------------------------------------------------
*/
type Props = {
  visible: boolean;
  message: WebsocketResponse | null;
  messageIndex: number;
  virtualRef: HTMLElement | null;
};

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  message: null,
  messageIndex: -1,
  virtualRef: null,
});

const emit = defineEmits<{
  hide: [];
  close: [];
}>();

/*
|--------------------------------------------------------------------------
| Local State
|--------------------------------------------------------------------------
*/
const activeTab = ref<'content'>('content');
const formattedContent = ref<string>('');

/*
|--------------------------------------------------------------------------
| Computed
|--------------------------------------------------------------------------
*/
const messageContent = computed(() => {
  if (!props.message) return '';
  
  const data = props.message.data as any;
  
  // 根据消息类型获取内容
  switch (props.message.type) {
    case 'send':
      return data.content || '';
    case 'receive':
      // 如果是 ArrayBuffer，使用 parseArrayBuffer 处理
      if (data.content instanceof ArrayBuffer) {
        return parseArrayBuffer(data.content, data.mimeType);
      }
      return data.content || '';
    case 'autoSend':
      return data.message || '';
    default:
      return data.content || data.message || '';
  }
});

const hasContent = computed(() => !!messageContent.value);

/*
|--------------------------------------------------------------------------
| Methods
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
    return `[${t('二进制数据')}] ${hexString.substring(0, 100)}${hexString.length > 100 ? '...' : ''}`;
  } catch (error) {
    return `[${t('解析错误')}] ${error instanceof Error ? error.message : t('未知错误')}`;
  }
};

const getMessageSize = (message: WebsocketResponse): number => {
  const data = message.data as any;
  return data.size || 0;
};

const getTypeDisplayName = (type: WebsocketResponse['type']): string => {
  const typeMap = {
    send: '发送',
    receive: '接收',
    connected: '已连接',
    disconnected: '已断开',
    error: '错误',
    autoSend: '自动发送',
    startConnect: '开始连接',
    reconnecting: '重连中'
  };
  return typeMap[type] || type;
};

const formatSize = (size: number): string => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

const formatFullTimestamp = (timestamp: number): string => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss.SSS');
};

const getFormattedContent = (content: string): string => {
  if (!props.message) return content;
  
  // 根据消息类型处理不同的数据展示
  let displayContent = '';
  switch (props.message.type) {
    case 'send':
      // 发送消息直接展示内容
      displayContent = content || (props.message.data as any).content || '';
      break;
    case 'receive': {
      // 接收消息可能是 ArrayBuffer，需要特殊处理
      const data = props.message.data as any;
      if (data.content instanceof ArrayBuffer) {
        displayContent = parseArrayBuffer(data.content, data.mimeType);
      } else {
        displayContent = content || data.content || '';
      }
      break;
    }
    case 'autoSend':
      // 自动发送消息展示 message 字段
      displayContent = content || (props.message.data as any).message || '';
      break;
    default:
      // 其他类型消息展示完整数据
      displayContent = content;
      break;
  }
  
  // 如果是 JSON 格式且已格式化，返回格式化结果
  if (isJsonString(displayContent) && formattedContent.value) {
    return formattedContent.value;
  }
  // 否则返回原始内容
  return displayContent;
};

const formatJsonContent = (content: string) => {
  if (isJsonString(content) && !formattedContent.value) {
    try {
      // 先尝试解析 JSON 确保格式正确
      const parsed = JSON.parse(content);
      const formatted = JSON.stringify(parsed, null, 2);
      formattedContent.value = formatted;
    } catch (error) {
      // 如果解析失败，保持原始内容
      formattedContent.value = content;
    }
  }
};

const setActiveTab = (tab: 'content') => {
  activeTab.value = tab;
};

const handleHide = () => {
  emit('hide');
};

const handleClose = () => {
  emit('close');
};

/*
|--------------------------------------------------------------------------
| Watchers
|--------------------------------------------------------------------------
*/
watch(() => props.message, (newMessage) => {
  if (newMessage) {
    activeTab.value = 'content';
    formattedContent.value = '';
    
    const content = messageContent.value;
    if (content) {
      formatJsonContent(content);
    }
  }
}, { immediate: true });
</script>

<style lang="scss" scoped>
.websocket-message-detail {
  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 16px;
    border-bottom: 1px solid var(--gray-200, #ebeef5);
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

        .message-type {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;

          &.type-send {
            background-color: var(--light, #ecf5ff);
            color: var(--primary, #409eff);
          }

          &.type-receive {
            background-color: var(--light, #f0f9ff);
            color: var(--success, #67c23a);
          }

          &.type-connected {
            background-color: var(--light, #f0f9ff);
            color: var(--success, #67c23a);
          }

          &.type-disconnected {
            background-color: var(--light, #fdf6ec);
            color: var(--warning, #e6a23c);
          }

          &.type-error {
            background-color: var(--light, #fef0f0);
            color: var(--danger, #f56c6c);
          }

          &.type-autoSend {
            background-color: var(--light, #f4f4f5);
            color: var(--info, #909399);
          }

          &.type-startConnect {
            background-color: var(--light, #ecf5ff);
            color: var(--primary, #409eff);
          }

          &.type-reconnecting {
            background-color: var(--light, #fdf6ec);
            color: var(--warning, #e6a23c);
          }
        }
      }
    }

    .detail-content {
      display: flex;
      align-items: flex-start;

      &.full-width {
        flex-direction: column;
        margin-bottom: 16px;
      }

      .content-tabs {
        width: 100%;
        margin-top: 8px;

        .tab-header {
          display: flex;
          border-bottom: 1px solid var(--gray-200, #ebeef5);
          margin-bottom: 12px;

          .tab-item {
            padding: 8px 16px;
            cursor: pointer;
            font-size: 14px;
            color: var(--gray-700, #606266);
            border-bottom: 2px solid transparent;
            transition: all 0.2s;

            &:hover {
              color: var(--primary, #409eff);
            }

            &.active {
              color: var(--primary, #409eff);
              border-bottom-color: var(--primary, #409eff);
            }
          }
        }

        .tab-content {
          .content-wrapper {
            width: 100%;
            max-height: 350px;
          }

          .full-content {
            background-color: var(--gray-100, #fafcff);
            border: 1px solid var(--gray-200, #ebeef5);
            border-radius: 4px;
            padding: 12px;
            margin: 0;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 13px;
            color: var(--gray-800, #303133);
            white-space: pre-wrap;
            word-break: break-all;
            max-height: 350px;
            overflow-y: auto;
            line-height: 1.4;
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
