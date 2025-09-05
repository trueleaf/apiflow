<template>
  <div class="websocket-response">
    <!-- 基本信息部分 -->
    <div class="websocket-base-info">
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
      <SLoading :loading="responseCacheLoading">
        <GWebsocketView :dataList="messages" @clear-data="handleClearData" />
      </SLoading>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useTranslation } from 'i18next-vue';
import { useWebSocket } from '@/store/websocket/websocket';
import { formatDate } from '@/helper';
import SLabelValue from '@/components/common/label-value/g-label-value.vue';
import GWebsocketView from '@/components/common/websocket-view/g-websocket-view.vue';
import SLoading from '@/components/common/loading/g-loading.vue';
import { websocketResponseCache } from '@/cache/websocket/websocketResponse';

const { t } = useTranslation();
const websocketStore = useWebSocket();

// 基本信息计算属性
const websocketBaseInfo = computed(() => ({
  fullUrl: websocketStore.websocketFullUrl,
  maintainer: websocketStore.websocket.info.maintainer || '',
  creator: websocketStore.websocket.info.creator || '',
  updatedAt: websocketStore.websocket.updatedAt,
  createdAt: websocketStore.websocket.createdAt
}));
const messages = computed(() => websocketStore.responseMessage);
const responseCacheLoading = computed(() => websocketStore.responseCacheLoading);

// 清空WebSocket消息数据和缓存
const handleClearData = async () => {
  try {
    // 清空内存中的消息
    websocketStore.clearMessages();
    
    // 清空IndexedDB中的缓存
    const nodeId = websocketStore.websocket._id;
    if (nodeId) {
      await websocketResponseCache.clearData(nodeId);
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
    border-bottom: 1px solid #e4e7ed;
    background-color: #fff;
    flex-shrink: 0;
    box-shadow: 0 3px 2px var(--gray-400);
    .text-bold {
      font-weight: 600;
      color: #303133;
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
  }
}
</style>
