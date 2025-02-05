<template>
  <div v-if="responseInfo.requestData.url" class="request-info" :class="{ vertical: layout === 'vertical' }">
    <SCollapse :title="t('基本信息')" bold>
      <div class="pl-1 d-flex a-top">
        <span class="flex0 text-bold mr-1">URL:</span>
        <span class="f-sm">{{ responseInfo.requestData.url }}</span>
      </div>
      <div class="mt-1 pl-1 d-flex a-top">
        <span class="flex0 text-bold mr-1">Method:</span>
        <span class="f-sm">{{ responseInfo.requestData.method }}</span>
      </div>
    </SCollapse>
    <SCollapse :title="t('请求头')" bold>
      <div v-for="(value, key) in headers" :key="key" class="pl-1 mt-1 d-flex a-top">
        <div class="flex0 mr-1 text-bold">{{ upperHeaderKey(key) }}:</div>
        <div>{{ value }}</div>
      </div>
    </SCollapse>
    <SCollapse bold>
      <template #title>
        <span>{{ t('请求body') }}</span>
        <span v-if="contentType">({{ contentType }})</span>
      </template>
      <pre v-if="contentType === 'application/json'" class="pl-1 pre">{{ formatJsonStr(responseInfo.requestData.body as string) }}</pre>
      <pre v-else-if="contentType?.includes('multipart/')" class="pl-1 pre">{{ responseInfo.requestData.body }}</pre>
      <pre v-else-if="contentType === 'application/x-www-form-urlencoded'" class="pre">{{ responseInfo.requestData.body }}</pre>
      <pre v-else-if="contentType === 'text/html'" class="pre">{{ responseInfo.requestData.body }}</pre>
      <pre v-else-if="contentType === 'text/javascript'" class="pre">{{ responseInfo.requestData.body }}</pre>
      <pre v-else-if="contentType === 'text/plain'" class="pre">{{ responseInfo.requestData.body }}</pre>
      <pre v-else-if="contentType === 'application/xml'" class="pre">{{ responseInfo.requestData.body }}</pre>
    </SCollapse>
  </div>
  <div v-else class="d-flex a-center j-center">{{ t('等待发送请求') }}</div>
</template>

<script lang="ts" setup>
import { t } from 'i18next'
import { computed } from 'vue'
import beautify from 'js-beautify'
import { useApidoc } from '@/store/apidoc/apidoc';
import SCollapse from '@/components/common/collapse/g-collapse.vue'
import { useApidocBaseInfo } from '@/store/apidoc/base-info';
import { useApidocResponse } from '@/store/apidoc/response';
import { storeToRefs } from 'pinia';

const apidocStore = useApidoc();
const apidocBaseInfoStore = useApidocBaseInfo();
const apidocResponseStore = useApidocResponse();
const { responseInfo } = storeToRefs(apidocResponseStore);
const headers = computed(() => {
  const requestHeaders = responseInfo.value.requestData.headers;
  const kvHeaders: Record<string, string> = {};
  for (const key in requestHeaders) {
    if (Array.isArray(requestHeaders[key])) {
      kvHeaders[key] = requestHeaders[key].join('; ');
    } else {
      kvHeaders[key] = requestHeaders[key]?.toString() || '';
    }
  }
  return kvHeaders;
});

const contentType = computed(() => apidocStore.apidoc.item.contentType); //contentType
const formatJsonStr = (code: string) => beautify(code, { indent_size: 4 });
const upperHeaderKey = (key: string) => key.replace(/(^\w)|(-\w)/g, ($1) => $1.toUpperCase())
//布局
const layout = computed(() => apidocBaseInfoStore.layout)

</script>

<style lang='scss' scoped>
.request-info {
  width: 100%;
  word-break: break-all;
  height: calc(100vh - #{size(370)});
  overflow-y: auto;

  &.vertical {
    height: 100%;
  }
}
</style>
