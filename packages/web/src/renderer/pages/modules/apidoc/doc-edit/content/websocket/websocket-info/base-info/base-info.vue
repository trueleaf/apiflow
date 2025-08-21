<template>
  <div class="websocket-base-info">
    <div class="text-bold">{{ t("基本信息") }}</div>
    <div class="px-4">
      <SLabelValue :label="`${t('连接地址')}：`" class="mt-2" one-line>
        <div class="text-ellipsis" :title="connectionUrl">{{ connectionUrl || '未设置连接地址' }}</div>
      </SLabelValue>
      <SLabelValue :label="`${t('协议类型')}：`" one-line>
        <span class="label protocol-label">WebSocket</span>
      </SLabelValue>
      <SLabelValue :label="`${t('连接状态')}：`" one-line>
        <el-tag 
          :type="getStatusType()" 
          size="small"
        >
          {{ getStatusText() }}
        </el-tag>
      </SLabelValue>
      <div class="base-info">
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
import { ref } from 'vue'
import { formatDate } from '@/helper'
import SLabelValue from '@/components/common/label-value/g-label-value.vue'

const { t } = useTranslation()

// 这些数据在实际使用中应该从 WebSocket store 中获取
// 目前使用默认值演示
const connectionUrl = ref('')
const connectionState = ref<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
const maintainer = ref('')
const creator = ref('')
const updatedAt = ref('')
const createdAt = ref('')

const getStatusType = () => {
  switch (connectionState.value) {
    case 'connected': return 'success'
    case 'connecting': return 'warning'
    case 'error': return 'danger'
    default: return 'info'
  }
}

const getStatusText = () => {
  switch (connectionState.value) {
    case 'connected': return '已连接'
    case 'connecting': return '连接中'
    case 'error': return '连接错误'
    default: return '未连接'
  }
}
</script>

<style lang="scss" scoped>
.websocket-base-info {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #fff;

  .text-bold {
    font-weight: 600;
    margin-bottom: 12px;
    color: #303133;
  }

  .protocol-label {
    color: #67c23a;
    font-weight: 500;
  }

  .base-info {
    display: flex;
    flex-wrap: wrap;
    margin-top: 8px;

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
