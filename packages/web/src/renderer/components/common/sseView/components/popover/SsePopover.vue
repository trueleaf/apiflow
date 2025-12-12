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
      <div v-if="message" class="sse-message-detail">
        <div class="detail-header">
          <div class="header">{{ t('消息详情') }}</div>
          <div class="close-btn" @click="handleClose">
            <i class="iconfont iconguanbi" :title="t('关闭')"></i>
          </div>
        </div>
        <div class="detail-content-wrap">
          <div class="detail-row">
            <div class="row-item w-20">
              <label>{{ t('序号') }}:</label>
              <span>{{ messageIndex + 1 }}</span>
            </div>
            <div v-if="message.event" class="row-item w-30">
              <label>{{ t('事件类型') }}:</label>
              <span>{{ message.event }}</span>
            </div>
            <div class="row-item w-50">
              <label>{{ t('接受时间') }}:</label>
              <span>{{ formatFullTimestamp(message.timestamp) }}</span>
            </div>
          </div>
          <div class="detail-content full-width">
            <div class="content-tabs">
              <div class="tab-header">
                <div 
                  class="tab-item" 
                  :class="{ active: activeTab === 'content' }"
                  @click="setActiveTab('content')"
                >
                  {{ t('完整内容') }}
                </div>
                <div 
                  v-if="message.rawBlock && message.dataType !== 'binary'" 
                  class="tab-item"
                  :class="{ active: activeTab === 'raw' }"
                  @click="setActiveTab('raw')"
                >
                  {{ t('原始数据块') }}
                </div>
              </div>
              <div class="tab-content">
                <div v-if="activeTab === 'content'" class="content-wrapper">
                  <SJsonEditor 
                    v-if="isJsonString(message.data || message.rawBlock)"
                    :model-value="getFormattedContent(message.data || message.rawBlock)"
                    :read-only="true" 
                    :min-height="100" 
                    :max-height="350" 
                    :auto-height="true"
                    :config="{ fontSize: 13, language: 'json' }" 
                  />
                  <pre v-else class="full-content">{{ message.data || message.rawBlock }}</pre>
                </div>
                <div
                  v-if="activeTab === 'raw' && message.rawBlock && message.dataType !== 'binary'"
                  class="content-wrapper"
                >
                  <SJsonEditor 
                    :model-value="message.rawBlock" 
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
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { isJsonString } from '@/helper';
import dayjs from 'dayjs';
import SJsonEditor from '@/components/common/jsonEditor/ClJsonEditor.vue';
import type { SsePopoverProps, SsePopoverEmits } from '@src/types/components/components';

const { t } = useI18n();

/*
|--------------------------------------------------------------------------
| Props & Emits
|--------------------------------------------------------------------------
*/
const props = withDefaults(defineProps<SsePopoverProps>(), {
  visible: false,
  message: null,
  messageIndex: -1,
  virtualRef: null,
});

const emit = defineEmits<SsePopoverEmits>();

/*
|--------------------------------------------------------------------------
| Local State
|--------------------------------------------------------------------------
*/
const activeTab = ref<'content' | 'raw'>('content');
const formattedContent = ref('');

/*
|--------------------------------------------------------------------------
| Methods
|--------------------------------------------------------------------------
*/
// 格式化时间戳
const formatFullTimestamp = (timestamp: number): string => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
};

// 获取格式化后的内容
const getFormattedContent = (content: string): string => {
  // 如果是 JSON 格式且已格式化，返回格式化结果
  if (isJsonString(content) && formattedContent.value) {
    return formattedContent.value;
  }
  // 否则返回原始内容
  return content;
};

// 格式化 JSON 内容
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

// 设置当前激活的标签页
const setActiveTab = (tab: 'content' | 'raw') => {
  activeTab.value = tab;
};

// 处理 popover 隐藏事件
const handleHide = () => {
  emit('hide');
};

// 关闭 popover
const handleClose = () => {
  emit('close');
};

/*
|--------------------------------------------------------------------------
| Watchers
|--------------------------------------------------------------------------
*/
// 监听消息变化，格式化内容
watch(() => props.message, (newMessage) => {
  if (newMessage) {
    // 重置状态
    activeTab.value = 'content';
    formattedContent.value = '';
    
    // 格式化内容
    const content = newMessage.data || newMessage.rawBlock;
    if (content) {
      formatJsonContent(content);
    }
  }
}, { immediate: true });
</script>

<style lang="scss" scoped>
.sse-message-detail {
  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 16px;
    border-bottom: 1px solid var(--border-light);
    background: linear-gradient(to right, var(--bg-gradient-start), var(--bg-gradient-end));
    color: var(--text-white);
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;

    .header {
      margin: 0;
      font-size: 16px;
      color: var(--text-white);
    }

    .close-btn {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 5px;
      cursor: pointer;
      color: var(--text-white);
      transition: background-color 0.2s;

      .iconfont {
        font-size: 12px;
      }

      &:hover {
        background-color: var(--bg-hover-light);
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
        color: var(--text-secondary);
        margin-right: 12px;
        flex-shrink: 0;
      }

      span {
        color: var(--text-primary);
        word-break: break-all;
      }

      .content-tabs {
        width: 100%;
        margin-top: 8px;

        .tab-header {
          display: flex;
          border-bottom: 1px solid var(--border-light);
          margin-bottom: 12px;

          .tab-item {
            padding: 8px 16px;
            cursor: pointer;
            font-size: 14px;
            color: var(--text-secondary);
            border-bottom: 2px solid transparent;
            transition: all 0.2s;

            &:hover {
              color: var(--primary, var(--el-color-primary));
            }

            &.active {
              color: var(--primary, var(--el-color-primary));
              border-bottom-color: var(--primary, var(--el-color-primary));
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
            background-color: var(--bg-secondary);
            border: 1px solid var(--border-light);
            border-radius: 4px;
            padding: 12px;
            margin: 0;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 13px;
            color: var(--text-primary);
            white-space: pre-wrap;
            word-break: break-all;
            max-height: 350px;
            overflow-y: auto;
            line-height: 1.4;
          }

          .raw-block {
            background-color: var(--bg-tertiary);
            color: var(--text-tertiary);
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
