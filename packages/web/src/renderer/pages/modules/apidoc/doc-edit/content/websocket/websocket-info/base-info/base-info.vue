<template>
  <div class="websocket-base-info">
    <div class="text-bold">{{ t("基本信息") }}</div>
    <div class="px-4">
      <div class="base-info">
        <SLabelValue :label="`${t('连接地址')}：`" class="mt-2" one-line>
          <div class="text-ellipsis" :title="fullUrl">{{ fullUrl }}</div>
        </SLabelValue>
        <SLabelValue :label="`${t('维护人员：')}`" 
          label-width="auto" class="w-50">
          <span class="text-ellipsis">{{ maintainer || '未设置' }}</span>
        </SLabelValue>
        <SLabelValue :label="`${t('创建人员：')}`" 
          label-width="auto" class="w-50">
          <span class="text-ellipsis">{{ creator || '未设置' }}</span>
        </SLabelValue>
        <SLabelValue :label="`${t('更新日期：')}`" 
          label-width="auto" class="w-50">
          <span class="text-ellipsis">{{ formatDate(updatedAt) || '未设置' }}</span>
        </SLabelValue>
        <SLabelValue :label="`${t('创建日期：')}`" 
          label-width="auto" class="w-50">
          <span class="text-ellipsis">{{ formatDate(createdAt) || '未设置' }}</span>
        </SLabelValue>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useTranslation } from 'i18next-vue'
import { computed } from 'vue'
import { formatDate } from '@/helper'
import SLabelValue from '@/components/common/label-value/g-label-value.vue'
import { useWebSocket } from '@/store/websocket/websocket'

const { t } = useTranslation()

// 使用WebSocket store
const websocketStore = useWebSocket()

const fullUrl = computed(() => {
  return websocketStore.websocketFullUrl;
})
const maintainer = computed(() => websocketStore.websocket.info.maintainer || '')
const creator = computed(() => websocketStore.websocket.info.creator || '')
const updatedAt = computed(() => websocketStore.websocket.updatedAt)
const createdAt = computed(() => websocketStore.websocket.createdAt)

</script>

<style lang="scss" scoped>
.websocket-base-info {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #fff;

  .text-bold {
    font-weight: 600;
    color: #303133;
  }

  .protocol-label {
    color: #67c23a;
    font-weight: 500;
  }

  .base-info {
    display: flex;
    flex-wrap: wrap;
    .w-50 {
      width: 50%;
    }
  }

  .text-ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
