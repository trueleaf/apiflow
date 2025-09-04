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
      <div v-if="message" class="websocket-message-detail">
        <div class="detail-header">
          <div class="header">{{ $t('消息详情') }}</div>
          <div class="close-btn" @click="handleClose">
            <i class="iconfont iconguanbi" :title="$t('关闭')"></i>
          </div>
        </div>
        <div class="detail-content-wrap">
          <div class="detail-row">
            <div class="row-item w-20">
              <label>{{ $t('序号') }}:</label>
              <span>{{ messageIndex + 1 }}</span>
            </div>
            <div class="row-item w-30">
              <label>{{ $t('类型') }}:</label>
              <span class="message-type" :class="`type-${message.type}`">{{ getTypeDisplayName(message.type) }}</span>
            </div>
            <div class="row-item w-50">
              <label>{{ $t('时间') }}:</label>
              <span>{{ formatFullTimestamp(message.data.timestamp) }}</span>
            </div>
          </div>
          <div v-if="message.data.id" class="detail-row">
            <div class="row-item w-100">
              <label>ID:</label>
              <span>{{ message.data.id }}</span>
            </div>
          </div>
          <div v-if="getMessageUrl(message)" class="detail-row">
            <div class="row-item w-100">
              <label>URL:</label>
              <span>{{ getMessageUrl(message) }}</span>
            </div>
          </div>
          <div v-if="getMessageError(message)" class="detail-row">
            <div class="row-item w-100">
              <label>{{ $t('错误信息') }}:</label>
              <span class="error-text">{{ getMessageError(message) }}</span>
            </div>
          </div>
          <div v-if="getMessageSize(message)" class="detail-row">
            <div class="row-item w-50">
              <label>{{ $t('大小') }}:</label>
              <span>{{ formatSize(getMessageSize(message)) }}</span>
            </div>
            <div v-if="getMessageContentType(message)" class="row-item w-50">
              <label>{{ $t('内容类型') }}:</label>
              <span>{{ getMessageContentType(message) }}</span>
            </div>
          </div>
          <div v-if="getMessageAttempt(message)" class="detail-row">
            <div class="row-item w-50">
              <label>{{ $t('重连次数') }}:</label>
              <span>{{ getMessageAttempt(message) }}</span>
            </div>
            <div v-if="getMessageNextRetryTime(message)" class="row-item w-50">
              <label>{{ $t('下次重试') }}:</label>
              <span>{{ formatFullTimestamp(getMessageNextRetryTime(message)) }}</span>
            </div>
          </div>
          <div v-if="getMessageReasonType(message)" class="detail-row">
            <div class="row-item w-50">
              <label>{{ $t('断开原因') }}:</label>
              <span>{{ getMessageReasonType(message) === 'manual' ? $t('手动断开') : $t('自动断开') }}</span>
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
import SJsonEditor from '@/components/common/json-editor/g-json-editor.vue';
import type { WebsocketResponse } from '@src/types/websocket/websocket';

/*
|--------------------------------------------------------------------------
| Props & Emits
|--------------------------------------------------------------------------
*/
interface Props {
  visible: boolean;
  message: WebsocketResponse | null;
  messageIndex: number;
  virtualRef: HTMLElement | null;
}

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
  return data.content || data.message || '';
});

const hasContent = computed(() => {
  return !!messageContent.value;
});

/*
|--------------------------------------------------------------------------
| Methods
|--------------------------------------------------------------------------
*/
const getMessageUrl = (message: WebsocketResponse): string => {
  const data = message.data as any;
  return data.url || '';
};

const getMessageError = (message: WebsocketResponse): string => {
  const data = message.data as any;
  return data.error || '';
};

const getMessageSize = (message: WebsocketResponse): number => {
  const data = message.data as any;
  return data.size || 0;
};

const getMessageContentType = (message: WebsocketResponse): string => {
  const data = message.data as any;
  return data.contentType || data.mimeType || '';
};

const getMessageAttempt = (message: WebsocketResponse): number => {
  const data = message.data as any;
  return data.attempt || 0;
};

const getMessageNextRetryTime = (message: WebsocketResponse): number => {
  const data = message.data as any;
  return data.nextRetryTime || 0;
};

const getMessageReasonType = (message: WebsocketResponse): string => {
  const data = message.data as any;
  return data.reasonType || '';
};
const getTypeDisplayName = (type: WebsocketResponse['type']): string => {
  const typeMap = {
    send: '发送',
    receive: '接收',
    connected: '已连接',
    disconnected: '已断开',
    error: '错误',
    heartbeat: '心跳',
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
  if (isJsonString(content) && formattedContent.value) {
    return formattedContent.value;
  }
  return content;
};

const formatJsonContent = (content: string) => {
  if (isJsonString(content) && !formattedContent.value) {
    try {
      const parsed = JSON.parse(content);
      const formatted = JSON.stringify(parsed, null, 2);
      formattedContent.value = formatted;
    } catch (error) {
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
      margin-bottom: 12px;

      .row-item {
        display: flex;
        align-items: center;

        label {
          min-width: 60px;
          font-weight: 600;
          color: var(--text-color-regular, #606266);
          margin-right: 8px;
          flex-shrink: 0;
        }

        span {
          color: var(--text-color-primary, #303133);
          word-break: break-all;
          flex: 1;
        }

        .message-type {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;

          &.type-send {
            background-color: var(--color-primary-light-9, #ecf5ff);
            color: var(--color-primary, #409eff);
          }

          &.type-receive {
            background-color: var(--color-success-light-9, #f0f9ff);
            color: var(--color-success, #67c23a);
          }

          &.type-connected {
            background-color: var(--color-success-light-9, #f0f9ff);
            color: var(--color-success, #67c23a);
          }

          &.type-disconnected {
            background-color: var(--color-warning-light-9, #fdf6ec);
            color: var(--color-warning, #e6a23c);
          }

          &.type-error {
            background-color: var(--color-danger-light-9, #fef0f0);
            color: var(--color-danger, #f56c6c);
          }

          &.type-heartbeat {
            background-color: var(--color-info-light-9, #f4f4f5);
            color: var(--color-info, #909399);
          }

          &.type-startConnect {
            background-color: var(--color-primary-light-9, #ecf5ff);
            color: var(--color-primary, #409eff);
          }

          &.type-reconnecting {
            background-color: var(--color-warning-light-9, #fdf6ec);
            color: var(--color-warning, #e6a23c);
          }
        }

        .error-text {
          color: var(--color-danger, #f56c6c);
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

          .full-content {
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
