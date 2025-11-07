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
          <div class="header">消息详情</div>
          <div class="close-btn" @click="handleClose">
            <i class="iconfont iconguanbi" title="关闭"></i>
          </div>
        </div>
        <div class="detail-content-wrap">
          <div class="detail-row">
            <div class="row-item w-20">
              <label>序号:</label>
              <span>{{ messageIndex + 1 }}</span>
            </div>
            <div v-if="message.event" class="row-item w-30">
              <label>事件类型:</label>
              <span>{{ message.event }}</span>
            </div>
            <div class="row-item w-50">
              <label>接受时间:</label>
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
                  完整内容
                </div>
                <div 
                  v-if="message.rawBlock && message.dataType !== 'binary'" 
                  class="tab-item"
                  :class="{ active: activeTab === 'raw' }"
                  @click="setActiveTab('raw')"
                >
                  原始数据块
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
import { isJsonString } from '@/helper';
import dayjs from 'dayjs';
import SJsonEditor from '@/components/common/jsonEditor/ClJsonEditor.vue';

/*
|--------------------------------------------------------------------------
| Props & Emits
|--------------------------------------------------------------------------
*/
type Props = {
  visible: boolean;
  message: any;
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
const activeTab = ref<'content' | 'raw'>('content');
const formattedContent = ref<string>('');

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
        color: var(--gray-700, #606266);
        margin-right: 12px;
        flex-shrink: 0;
      }

      span {
        color: var(--gray-800, #303133);
        word-break: break-all;
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

          .full-content,
          .raw-block {
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

          .raw-block {
            background-color: var(--light, #f4f4f5);
            color: var(--gray-600, #909399);
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
