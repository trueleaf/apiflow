<template>
  <div v-if="responseInfo.requestData.url" class="request-info" :class="{ vertical: layout === 'vertical' }">
    <div class="collapse-section">
      <div class="collapse-header" @click="collapseStates.basicInfo = !collapseStates.basicInfo">
        <span class="gray-700 icon-wrapper">
          <ChevronDown v-if="collapseStates.basicInfo" :size="16" />
          <ChevronRight v-else :size="16" />
        </span>
        <span class="ml-1">{{ t('基本信息') }}</span>
      </div>
      <div v-show="collapseStates.basicInfo" class="collapse-content">
        <div class="pl-1 d-flex a-top">
          <span class="flex0 text-bold mr-1">URL:</span>
          <span class="f-sm">{{ responseInfo.requestData.url }}</span>
        </div>
        <div class="mt-1 pl-1 d-flex a-top">
          <span class="flex0 text-bold mr-1">Method:</span>
          <span class="f-sm">{{ responseInfo.requestData.method }}</span>
        </div>
      </div>
    </div>
    <div class="collapse-section">
      <div class="collapse-header" @click="collapseStates.headers = !collapseStates.headers">
        <span class="gray-700 icon-wrapper">
          <ChevronDown v-if="collapseStates.headers" :size="16" />
          <ChevronRight v-else :size="16" />
        </span>
        <span class="ml-1">{{ t('请求头') }}</span>
      </div>
      <div v-show="collapseStates.headers" class="collapse-content">
        <div v-for="(value, key) in headers" :key="key" class="pl-1 mt-1 d-flex a-top">
          <div class="flex0 mr-1 text-bold">{{ upperHeaderKey(key) }}:</div>
          <div>{{ value }}</div>
        </div>
      </div>
    </div>
    <div class="collapse-section">
      <div class="collapse-header" @click="collapseStates.body = !collapseStates.body">
        <span class="gray-700 icon-wrapper">
          <ChevronDown v-if="collapseStates.body" :size="16" />
          <ChevronRight v-else :size="16" />
        </span>
        <span class="ml-1">
          <span>{{ t('请求body') }}</span>
          <span v-if="contentType">({{ contentType }})</span>
        </span>
      </div>
      <div v-show="collapseStates.body" class="collapse-content no-padding-x">
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
      </div>
    </div>
  </div>
  <div v-else class="d-flex a-center j-center">{{ t('等待发送请求') }}</div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { computed, reactive } from 'vue'
import beautify from 'js-beautify'
import { useHttpNode } from '@/store/httpNode/httpNodeStore';
import { ChevronDown, ChevronRight } from 'lucide-vue-next'
import { useProjectWorkbench } from '@/store/projectWorkbench/projectWorkbenchStore';
import { useHttpNodeResponse } from '@/store/httpNode/httpNodeResponseStore';
import { downloadStringAsText } from '@/helper'
import { formatUnit } from '@/helper'
import { storeToRefs } from 'pinia';
import SJsonEditor from '@/components/common/jsonEditor/ClJsonEditor.vue'

const httpNodeStore = useHttpNode();
const projectWorkbenchStore = useProjectWorkbench();
const httpNodeResponseStore = useHttpNodeResponse();
const { responseInfo } = storeToRefs(httpNodeResponseStore);
const { t } = useI18n()
const collapseStates = reactive({
  basicInfo: true,
  headers: true,
  body: true,
})

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

const contentType = computed(() => httpNodeStore.httpNodeInfo.item.contentType); //contentType
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
const { layout } = storeToRefs(projectWorkbenchStore)

</script>

<style lang='scss' scoped>
.request-info {
  width: 100%;
  word-break: break-all;
  height: calc(100vh - var(--apiflow-apidoc-request-view-height) - var(--apiflow-response-tabs-header-height) - var(--apiflow-response-summary-height) - var(--apiflow-doc-nav-height) - 10px);
  overflow-y: auto;

  &.vertical {
    height: calc(var(--apiflow-response-height) - var(--apiflow-response-tabs-header-height) - 10px);
  }
  .collapse-section {
    margin-bottom: 4px;

    .collapse-header {
      cursor: pointer;
      height: 25px;
      display: flex;
      align-items: center;
      user-select: none;
      color: var(--gray-800);
      font-size: 14px;
      font-weight: bold;

      &:hover {
        background: var(--gray-200);
      }

      .icon-wrapper {
        margin-top: 3px;
      }
    }

    .collapse-content {
      padding-right: 8px;
      padding-left: 20px;
      color: var(--gray-700);

      &.no-padding-x {
        padding-left: 0;
      }
    }
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
