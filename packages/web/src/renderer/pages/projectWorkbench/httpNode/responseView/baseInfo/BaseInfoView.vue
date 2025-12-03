<template>
  <div class="request-view">
    <div class="text-bold">{{ t("基本信息") }}</div>
    <div class="px-4">
      <SLabelValue :label="`${t('请求地址')}：`" class="mt-2" one-line>
        <div class="text-ellipsis" :title="httpNodeRequestStore.fullUrl">{{ httpNodeRequestStore.fullUrl }}</div>
      </SLabelValue>
      <SLabelValue :label="`${t('请求方式')}：`" one-line>
        <template v-for="(req) in validRequestMethods">
          <span v-if="apidocInfo.item.method === req.value.toUpperCase()" :key="req.name" class="label"
            :style="{ color: req.iconColor }">{{ req.name.toUpperCase() }}</span>
        </template>
      </SLabelValue>
      <div class="base-info">
        <SLabelValue :label="`${t('维护人员：')}`" :title="apidocInfo.info.maintainer || apidocInfo.info.creator"
          label-width="auto" class="w-50">
          <span class="text-ellipsis">{{ apidocInfo.info.maintainer || apidocInfo.info.creator }}</span>
        </SLabelValue>
        <SLabelValue :label="`${t('创建人员：')}`" :title="apidocInfo.info.creator || apidocInfo.info.maintainer"
          label-width="auto" class="w-50">
          <span class="text-ellipsis">{{ apidocInfo.info.creator || apidocInfo.info.maintainer }}</span>
        </SLabelValue>
        <SLabelValue :label="`${t('更新日期：')}`" :title="formatDate(apidocInfo.updatedAt)" label-width="auto"
          class="w-50">
          <span class="text-ellipsis">{{ formatDate(apidocInfo.updatedAt) }}</span>
        </SLabelValue>
        <SLabelValue :label="`${t('创建日期：')}`" :title="formatDate(apidocInfo.createdAt)" label-width="auto"
          class="w-50">
          <span class="text-ellipsis">{{ formatDate(apidocInfo.createdAt) }}</span>
        </SLabelValue>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useHttpNode } from '@/store/httpNode/httpNodeStore';
import { useI18n } from 'vue-i18n'
import { computed } from 'vue';
import { formatDate } from '@/helper'
import SLabelValue from '@/components/common/labelValue/ClLabelValue.vue'
import { useHttpNodeRequest } from '@/store/httpNode/httpNodeRequestStore';
import { requestMethods as validRequestMethods } from '@/data/data';



const httpNodeStore = useHttpNode();
const { t } = useI18n()

const apidocInfo = computed(() => httpNodeStore.httpNodeInfo);
const httpNodeRequestStore = useHttpNodeRequest();
</script>

<style lang='scss' scoped>
.request-view {
  flex-grow: 0;
  flex-shrink: 0;
  box-shadow: 0 3px 2px var(--gray-400);
  padding: 10px;
  height: var(--apiflow-apidoc-request-view-height);
  overflow: hidden;

  .svg-icon {
    width: 15px;
    height: 15px;
    cursor: pointer;
  }
}
</style>
