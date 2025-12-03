<template>
  <div class="websocket-response">
    <!-- 基本信息部分（垂直布局时隐藏） -->
    <div v-if="layout === 'horizontal'" class="websocket-base-info">
      <div class="text-bold">{{ t("基本信息") }}</div>
      <div class="px-4">
        <div class="base-info">
          <SLabelValue :label="`${t('连接地址')}：`" class="mt-2" one-line>
            <div class="text-ellipsis" :title="websocketBaseInfo.fullUrl">{{ websocketBaseInfo.fullUrl }}</div>
          </SLabelValue>
          <SLabelValue :label="`${t('维护人员：')}`" 
            label-width="auto" class="w-50">
            <span class="text-ellipsis">{{ websocketBaseInfo.maintainer || t('未设置') }}</span>
          </SLabelValue>
          <SLabelValue :label="`${t('创建人员：')}`" 
            label-width="auto" class="w-50">
            <span class="text-ellipsis">{{ websocketBaseInfo.creator || t('未设置') }}</span>
          </SLabelValue>
          <SLabelValue :label="`${t('更新日期：')}`" 
            label-width="auto" class="w-50">
            <span class="text-ellipsis">{{ formatDate(websocketBaseInfo.updatedAt) || t('未设置') }}</span>
          </SLabelValue>
          <SLabelValue :label="`${t('创建日期：')}`" 
            label-width="auto" class="w-50">
            <span class="text-ellipsis">{{ formatDate(websocketBaseInfo.createdAt) || t('未设置') }}</span>
          </SLabelValue>
        </div>
      </div>
    </div>
    
    <!-- WebSocket消息内容部分 -->
    <div class="websocket-content">
      <div v-if="layout === 'vertical' && messages.length === 0" class="vertical-empty-title">Response</div>
      <SLoading :loading="responseCacheLoading" class="h-100">
        <GWebsocketView :dataList="messages" @clear-data="handleClearData" />
      </SLoading>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useWebSocket } from '@/store/websocketNode/websocketNodeStore';
import { useProjectWorkbench } from '@/store/projectWorkbench/projectWorkbenchStore';
import { formatDate } from '@/helper';
import SLabelValue from '@/components/common/labelValue/ClLabelValue.vue';
import GWebsocketView from '@/components/common/websocketView/ClWebsocketView.vue';
import SLoading from '@/components/common/loading/ClLoading.vue';
import { websocketResponseCache } from '@/cache/websocketNode/websocketResponseCache';

const { t } = useI18n();
const websocketStore = useWebSocket();
const projectWorkbenchStore = useProjectWorkbench();
const { websocketFullUrl, websocket, responseMessage: messages, responseCacheLoading } = storeToRefs(websocketStore);
const layout = computed(() => projectWorkbenchStore.layout);

// 基本信息计算属性
const websocketBaseInfo = computed(() => ({
  fullUrl: websocketFullUrl.value,
  maintainer: websocket.value.info.maintainer || '',
  creator: websocket.value.info.creator || '',
  updatedAt: websocket.value.updatedAt,
  createdAt: websocket.value.createdAt
}));

// 清空WebSocket消息数据和缓存
const handleClearData = async () => {
  try {
    // 清空内存中的消息
    websocketStore.clearMessages();
    
    // 清空IndexedDB中的缓存
    const nodeId = websocketStore.websocket._id;
    if (nodeId) {
      await websocketResponseCache.clearResponseByNodeId(nodeId);
    }
    
  } catch (error) {
    console.error('清空缓存失败:', error);
    // 即使缓存清空失败，也要清空内存中的消息
    websocketStore.clearMessages();
  }
};
</script>

<style lang="scss" scoped>
.websocket-response {
  height: 100%;
  display: flex;
  flex-direction: column;

  .websocket-base-info {
    padding: 16px;
    border-bottom: 1px solid var(--border-base);
    background-color: var(--white);
    flex-shrink: 0;
    box-shadow: var(--box-shadow-sm);
    .text-bold {
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .base-info {
      display: flex;
      flex-wrap: wrap;
    }

    .text-ellipsis {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .websocket-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }

  .vertical-empty-title {
    position: absolute;
    top: 8px;
    left: 12px;
    font-size: 15px;
    color: var(--gray-600);
    z-index: 11;
  }
}
</style>
