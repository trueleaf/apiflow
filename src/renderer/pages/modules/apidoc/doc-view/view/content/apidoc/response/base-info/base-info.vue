/*
    创建者：shuxiaokai
    创建时间：2021-09-03 20:45
    模块名称：接口基础信息
    备注：
*/
<template>
  <div class="request-view">
    <div class="text-bold">{{ t("基本信息") }}</div>
    <div class="px-4">
      <s-label-value :label="`${t('请求地址')}：`" class="mt-2" one-line>
        <span class="text-ellipsis">{{ apidocInfo.item.url.host + apidocInfo.item.url.path }}</span>
      </s-label-value>
      <s-label-value :label="`${t('请求方式')}：`" one-line>
        <template v-for="(req) in validRequestMethods">
          <span v-if="apidocInfo.item.method === req.value.toUpperCase()" :key="req.name" class="label" :style="{color: req.iconColor}">{{ req.name.toUpperCase() }}</span>
        </template>
      </s-label-value>
      <div class="base-info">
        <s-label-value :label="`${t('维护人员：')}：`" :title="apidocInfo.info.maintainer || apidocInfo.info.creator" label-width="auto" class="w-30">
          <span class="text-ellipsis">{{ apidocInfo.info.maintainer || apidocInfo.info.creator }}</span>
        </s-label-value>
        <s-label-value :label="`${t('创建人员：')}：`" :title="apidocInfo.info.maintainer || apidocInfo.info.creator" label-width="auto" class="w-30">
          <span class="text-ellipsis">{{ apidocInfo.info.maintainer || apidocInfo.info.creator }}</span>
        </s-label-value>
        <s-label-value :label="`${t('更新日期：')}：`" :title="formatDate(apidocInfo.updatedAt)" label-width="auto" class="w-50">
          <span class="text-ellipsis">{{ formatDate(apidocInfo.updatedAt) }}</span>
        </s-label-value>
        <s-label-value :label="`${t('创建日期：')}：`" :title="formatDate(apidocInfo.createdAt)" label-width="auto" class="w-50">
          <span class="text-ellipsis">{{ formatDate(apidocInfo.createdAt) }}</span>
        </s-label-value>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { store } from '@/pages/modules/apidoc/doc-view/store/index'
import { formatDate } from '@/helper'

const apidocInfo = computed(() => store.state['apidoc/apidoc'].apidoc)

const validRequestMethods = computed(() => store.state['apidoc/baseInfo'].rules.requestMethods?.filter((val) => val.enabled))

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
