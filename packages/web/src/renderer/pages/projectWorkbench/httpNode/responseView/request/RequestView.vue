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
    <SCollapse bold no-padding-x>
      <template #title>
        <span>{{ t('请求body') }}</span>
        <span v-if="contentType">({{ contentType }})</span>
      </template>
  
      <div v-if="contentType === 'application/json'" class="body-wrap">
        <SJsonEditor 
          :modelValue="formatJsonStr(responseInfo.requestData.body as string)" 
          read-only 
          :config="{ fontSize: 13, language: 'json', lineNumbers: 'off' }"
        >
        </SJsonEditor>
      </div>
      <div v-if="contentType === 'application/x-www-form-urlencoded'" class="body-wrap">
        <SJsonEditor 
          :modelValue="formatJsonStr(responseInfo.requestData.body as string)" 
          read-only 
          :config="{ fontSize: 13, language: 'text/plain', lineNumbers: 'off', wordWrap: 'on' }"
        >
        </SJsonEditor>
      </div>
      <pre v-else-if="contentType?.includes('multipart/')" class="pl-1 pre pre-body">
        <div 
          class="theme-color cursor-pointer d-flex j-end mb-2 download" 
          @click="() => downloadStringAsText(responseInfo.requestData.body as string, 'multiPartBody.txt')"
        >
          <span>{{t('下载完整数据')}}</span>
          <span>({{ formatUnit((responseInfo.requestData.body as string).length, 'bytes') }})</span>
        </div>{{ safedMultipart((responseInfo.requestData.body as string)) }}
      </pre>
      <pre v-else-if="contentType === 'text/html'" class="pre pre-body">{{ responseInfo.requestData.body }}</pre>
      <pre v-else-if="contentType === 'text/javascript'" class="pre pre-body">{{ responseInfo.requestData.body }}</pre>
      <pre v-else-if="contentType === 'text/plain'" class="pre pre-body">{{ responseInfo.requestData.body }}</pre>
      <pre v-else-if="contentType === 'application/xml'" class="pre pre-body">{{ responseInfo.requestData.body }}</pre>
    </SCollapse>
  </div>
  <div v-else class="d-flex a-center j-center">{{ t('等待发送请求') }}</div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import beautify from 'js-beautify'
import { useHttpNode } from '@/store/apidoc/httpNodeStore';
import SCollapse from '@/components/common/collapse/ClCollapse.vue'
import { useApidocBaseInfo } from '@/store/apidoc/baseInfoStore';
import { useApidocResponse } from '@/store/apidoc/responseStore';
import { downloadStringAsText } from '@/helper'
import { formatUnit } from '@/helper'
import { storeToRefs } from 'pinia';
import SJsonEditor from '@/components/common/jsonEditor/ClJsonEditor.vue'

const httpNodeStore = useHttpNode();
const apidocBaseInfoStore = useApidocBaseInfo();
const apidocResponseStore = useApidocResponse();
const { responseInfo } = storeToRefs(apidocResponseStore);
const { t } = useI18n()

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

const contentType = computed(() => httpNodeStore.apidoc.item.contentType); //contentType
const formatJsonStr = (code: string) => beautify(code, { indent_size: 4 });
const upperHeaderKey = (key: string) => key.replace(/(^\w)|(-\w)/g, ($1) => $1.toUpperCase());
const safedMultipart = (strBody: string) => {
  const boundary = contentType.value.match(/boundary=(.*?);/)?.[1] as string;
  const arrBody = strBody.split(boundary);
  let result = ''
  arrBody.forEach((item) => {
    if (item.length > 1024) {
      item = item.slice(0, 1024) + `<...>${t('超长部分被截断')}`;
    }
    result += item + '\n';
  })
  return result;
};
const { layout } = storeToRefs(apidocBaseInfoStore)

</script>

<style lang='scss' scoped>
.request-info {
  width: 100%;
  word-break: break-all;
  height: calc(100vh - 370px);
  overflow-y: auto;

  &.vertical {
    height: 100%;
  }
  .body-wrap {
    height: 200px;
  }
  .pre-body {
    margin-left: 25px;
    .download {
      margin-top: -14px;
    }
  }
}
</style>
