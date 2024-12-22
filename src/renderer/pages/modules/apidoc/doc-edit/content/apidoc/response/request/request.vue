<template>
  <div v-if="apidocRequestStore.url" class="request-info" :class="{ vertical: layout === 'vertical' }">
    <SCollapse :title="t('基本信息')" bold>
      <div class="pl-1 d-flex a-top">
        <span class="flex0 text-bold mr-1">URL:</span>
        <span class="f-sm">{{ apidocRequestStore.url }}</span>
      </div>
      <div class="mt-1 pl-1 d-flex a-top">
        <span class="flex0 text-bold mr-1">Method:</span>
        <span class="f-sm">{{ apidocRequestStore.method }}</span>
      </div>
    </SCollapse>
    <SCollapse :title="t('请求头')" bold>
      <div v-for="(value, key) in apidocRequestStore.headers" :key="key" class="pl-1 mt-1 d-flex a-top">
        <div class="flex0 mr-1 text-bold">{{ upperHeaderKey(key) }}:</div>
        <div>{{ value }}</div>
      </div>
    </SCollapse>
    <SCollapse bold>
      <template #title>
        <span>{{ t('请求body') }}</span>
        <span v-if="contentType">({{ contentType }})</span>
      </template>
      <pre v-if="contentType === 'application/json'" class="pl-1 pre">{{ formatJsonStr(apidocRequestStore.body as string) }}</pre>
      <div v-else-if="contentType?.includes('multipart/')" class="pl-1 pre">
        <pre>{{ formatFormadata() }}</pre>
      </div>
      <pre v-else-if="contentType === 'application/x-www-form-urlencoded'"
        class="pre">{{ apidocRequestStore.body }}</pre>
      <pre v-else-if="contentType === 'text/html'" class="pre">{{ apidocRequestStore.body }}</pre>
      <pre v-else-if="contentType === 'text/javascript'" class="pre">{{ apidocRequestStore.body }}</pre>
      <pre v-else-if="contentType === 'text/plain'" class="pre">{{ apidocRequestStore.body }}</pre>
      <pre v-else-if="contentType === 'application/xml'" class="pre">{{ apidocRequestStore.body }}</pre>
    </SCollapse>
  </div>
  <div v-else class="d-flex a-center j-center">{{ t('等待发送请求') }}</div>
</template>

<script lang="ts" setup>
import { t } from 'i18next'
import { computed } from 'vue'
import beautify from 'js-beautify'
import { useApidocRequest } from '@/store/apidoc/request';
import { useApidoc } from '@/store/apidoc/apidoc';
import SCollapse from '@/components/common/collapse/g-collapse.vue'
import { useApidocBaseInfo } from '@/store/apidoc/base-info';

const apidocRequestStore = useApidocRequest();
const apidocStore = useApidoc();
const apidocBaseInfoStore = useApidocBaseInfo();
const contentType = computed(() => apidocStore.apidoc.item.contentType); //contentType
const formatJsonStr = (code: string) => beautify(code, { indent_size: 4 });
const upperHeaderKey = (key: string) => key.replace(/(^\w)|(-\w)/g, ($1) => $1.toUpperCase())
const formatFormadata = () => {
  // todo
  // const bufferFormData = (apidocRequestStore.body as any)?.getBuffer();
  // const stringFormData = bufferFormData.toString();
  // const boundary = (apidocRequestStore.body as any)?.getBoundary();
  // const result: string[] = [];
  // stringFormData.split(boundary).forEach(v => {
  //   result.push(`${v.slice(0, 255)}${v.length > 255 ? '由于性能原因，仅展示255个字符' : ''}\n`); //最多展示255个字符
  // })
  // return result.join(boundary);
}
//布局
const layout = computed(() => apidocBaseInfoStore.layout)

</script>

<style  scoped>
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
