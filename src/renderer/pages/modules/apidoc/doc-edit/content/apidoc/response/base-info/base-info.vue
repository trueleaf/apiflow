<template>
  <div class="request-view">
    <div class="text-bold">{{ t("基本信息") }}</div>
    <div class="px-4">
      <SLabelValue :label="`${t('请求地址')}：`" class="mt-2" one-line>
        <span class="text-ellipsis">{{ apidocInfo.item.url.host + apidocInfo.item.url.path }}</span>
      </SLabelValue>
      <SLabelValue :label="`${t('请求方式')}：`" one-line>
        <template v-for="(req) in validRequestMethods">
          <span v-if="apidocInfo.item.method === req.value.toUpperCase()" :key="req.name" class="label"
            :style="{ color: req.iconColor }">{{ req.name.toUpperCase() }}</span>
        </template>
      </SLabelValue>
      <div class="base-info">
        <SLabelValue :label="`${t('维护人员：')}`" :title="apidocInfo.info.maintainer || apidocInfo.info.creator"
          label-width="auto" class="w-30">
          <span class="text-ellipsis">{{ apidocInfo.info.maintainer || apidocInfo.info.creator }}</span>
        </SLabelValue>
        <SLabelValue :label="`${t('创建人员：')}`" :title="apidocInfo.info.creator || apidocInfo.info.maintainer"
          label-width="auto" class="w-30">
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
import { useApidoc } from '@/store/apidoc/apidoc';
import { useApidocBaseInfo } from '@/store/apidoc/base-info';
import { t } from 'i18next'
import { computed } from 'vue';
import { formatDate } from '@/helper'
import SLabelValue from '@/components/common/label-value/g-label-value.vue'



const apidocStore = useApidoc();
const apidocBaseInfoStore = useApidocBaseInfo();
const apidocInfo = computed(() => apidocStore.apidoc);
const validRequestMethods = computed(() => apidocBaseInfoStore.rules.requestMethods?.filter((val) => val.enabled));
</script>

<style  scoped>
.request-view {
  flex-grow: 0;
  flex-shrink: 0;
  box-shadow: 0 3px 2px $gray-400;
  margin-bottom: size(10);
  padding: size(10);
  height: size(170);
  overflow: hidden;

  .svg-icon {
    width: size(15);
    height: size(15);
    cursor: pointer;
  }
}
</style>
