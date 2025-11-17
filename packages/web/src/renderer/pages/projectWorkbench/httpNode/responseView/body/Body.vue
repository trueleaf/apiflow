<template>
  <div class="body-view" :class="{ vertical: layout === 'vertical' }">
    <div v-if="selectedTab && apidocResponseStore.responseCacheAllowedMap[selectedTab._id] === false" class="response-tip">
      <!-- 返回数据大小超过单个允许缓存数据，数据无法被缓存，切换tab或者刷新页面缓存值将会清空 -->
      <div class="mb-1">
        <span class="mr-1">返回数据大小为</span>
        <span class="text-bold">{{ formatUnit(loadingProcess.total, 'bytes') }}</span>
        <span class="mx-1">超过单个允许缓存数据大小</span>
        <span class="text-bold">{{ formatUnit(config.cacheConfig.httpNodeResponseCache.singleResponseBodySize, 'bytes') }}</span>
      </div>
      <span class="">数据无法被缓存，切换tab或者刷新页面缓存值将会清空</span>
    </div>
    <div v-if="redirectList.length > 0" class="mb-1 ml-5">
      <span>{{ t('重定向') }}</span>
      <span class="orange px-1 text-underline cursor-pointer" @click="showRedirectDialog = true">{{ redirectList.length }}</span>
      <span>{{ t('次') }}</span>
    </div>
    <el-dialog
      v-model="showRedirectDialog"
      width="60vw"
      height="80vh"
      :title="t('重定向信息')"
      class="redirect-dialog"
      :close-on-click-modal="true"
    >
      <div v-for="(item, idx) in (redirectList)" :key="idx" class="mb-2 redirect-item">
        <div class="mb-1">
          <h3>第{{ idx + 1 }}次重定向</h3>
        </div>
        <div class="mb-1">
          <span class="text-bold">{{ t('请求方法') }}:</span>
          <span class="ml-2 green">{{ item.method }}</span>
        </div>
        <div class="mb-1">
          <span class="text-bold">{{ t('状态码') }}:</span>
          <span class="ml-2 orange">{{ item.statusCode }}</span>
        </div>
        <div class="mb-1">
          <span class="text-bold">{{ t('请求URL') }}:</span>
          <span class="ml-2">{{ item.url }}</span>
        </div>
        <div class="mb-1">
          <div class="text-bold mb-2">{{ t('请求头') }}:</div>
          <div class="redirect-headers">
            <div v-for="(v, k) in item.requestHeaders" :key="k" class="header-row">
              <span class="header-key">{{ formatHeader(k as string) }}:</span> <span class="header-value">{{ v }}</span>
            </div>
          </div>
        </div>
        <div class="mb-1">
          <div class="text-bold mb-2">{{ t('返回头') }}:</div>
          <div class="redirect-headers">
            <div v-for="(v, k) in item.responseHeaders" :key="k" class="header-row">
              <span class="header-key">{{ formatHeader(k as string) }}:</span> <span class="header-value">{{ v }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
    <template v-if="apidocResponseStore.responseInfo.contentType">
      <!-- eventStream -->
      <div v-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'textEventStream'" class="sse-view-wrap">
        <SSseView :data-list="apidocResponseStore.responseInfo.responseData.streamData" :is-data-complete="apidocResponseStore.requestState === 'finish'"/>
      </div>
      <!-- 图片类型 -->
      <div v-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'image'" class="img-view-wrap">
        <el-image 
          v-if="apidocResponseStore.responseInfo.responseData.fileData.url"
          class="img-view" 
          :src="apidocResponseStore.responseInfo.responseData.fileData.url"
          :preview-src-list="[apidocResponseStore.responseInfo.responseData.fileData.url]" 
          fit="contain">
        </el-image>
        <div v-else class="img-view-empty">图片加载中</div>
        <div class="text-center">{{ apidocResponseStore.responseInfo.contentType }}</div>
        <el-button link type="primary" text @click="handleDownload">{{ t("下载文件") }}</el-button>
      </div>
      <!-- 流文件 -->
      <div v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'octetStream'"
        class="d-flex flex-column a-center">
        <svg class="svg-icon" aria-hidden="true" :title="t('下载文件')">
          <use xlink:href="#iconicon_weizhiwenjian"></use>
        </svg>
        <div class="text-center">{{ apidocResponseStore.responseInfo.contentType }}</div>
        <el-button link type="primary" text @click="handleDownload">{{ t("下载文件") }}</el-button>
      </div>
      <!-- 下载类型文件 -->
      <div v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'forceDownload'"
        class="d-flex flex-column j-center">
        <el-icon class="download-icon"  :title="t('下载文件')">
          <Download />
        </el-icon>
        <div  class="text-center">{{ apidocResponseStore.responseInfo.contentType }}</div>
        <el-button link type="primary" text @click="handleDownload">{{ t("下载文件") }}</el-button>
      </div>
      <!-- xml -->
      <div v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'xml'" class="text-wrap">
        <div v-if="formatedText.length > config.httpNodeConfig.maxTextBodySize">
          <span>{{ t('数据大小为') }}</span>
          <span class="orange mr-3 ml-1">{{ formatUnit(formatedText.length, 'bytes') }}</span>
          <span>{{ t('超过最大预览限制') }}</span>
          <span class="ml-1 mr-3">{{ formatUnit(config.httpNodeConfig.maxTextBodySize, 'bytes') }}</span>
          <el-button link type="primary" text @click="() => downloadStringAsText(formatedText, 'response.xml')">{{ t("下载到本地预览") }}</el-button>
        </div>
        <SJsonEditor v-else :modelValue="formatedText" read-only :config="{ fontSize: 13, language: 'xml' }"></SJsonEditor>
      </div>
      <!-- javascript -->
      <div v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'js'" class="text-wrap">
        <div v-if="formatedText.length > config.httpNodeConfig.maxTextBodySize">
          <span>{{ t('数据大小为') }}</span>
          <span class="orange mr-3 ml-1">{{ formatUnit(formatedText.length, 'bytes') }}</span>
          <span>{{ t('超过最大预览限制') }}</span>
          <span class="ml-1 mr-3">{{ formatUnit(config.httpNodeConfig.maxTextBodySize, 'bytes') }}</span>
          <el-button link type="primary" text @click="() => downloadStringAsText(formatedText, 'response.js')">{{ t("下载到本地预览") }}</el-button>
        </div>
        <SJsonEditor v-else :modelValue="formatedText || formatedText" read-only :config="{ fontSize: 13, language: 'javascript' }"></SJsonEditor>
      </div>
      <!-- html -->
      <div v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'html'" class="text-wrap">
        <div v-if="formatedText.length > config.httpNodeConfig.maxTextBodySize">
          <span>{{ t('数据大小为') }}</span>
          <span class="orange mr-3 ml-1">{{ formatUnit(formatedText.length, 'bytes') }}</span>
          <span>{{ t('超过最大预览限制') }}</span>
          <span class="ml-1 mr-3">{{ formatUnit(config.httpNodeConfig.maxTextBodySize, 'bytes') }}</span>
          <el-button link type="primary" text @click="() => downloadStringAsText(formatedText, 'response.html')">{{ t("下载到本地预览") }}</el-button>
        </div>
        <SJsonEditor v-else :modelValue="formatedText" read-only :config="{ fontSize: 13, language: 'html' }"></SJsonEditor>
      </div>
      <!-- css -->
      <div v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'css'" class="text-wrap">
        <div v-if="formatedText.length > config.httpNodeConfig.maxTextBodySize">
          <span>{{ t('数据大小为') }}</span>
          <span class="orange mr-3 ml-1">{{ formatUnit(formatedText.length, 'bytes') }}</span>
          <span>{{ t('超过最大预览限制') }}</span>
          <span class="ml-1 mr-3">{{ formatUnit(config.httpNodeConfig.maxTextBodySize, 'bytes') }}</span>
          <el-button link type="primary" text @click="() => downloadStringAsText(formatedText, 'response.css')">{{ t("下载到本地预览") }}</el-button>
        </div>
        <SJsonEditor v-else :modelValue="formatedText || formatedText" read-only :config="{ fontSize: 13, language: 'css' }"></SJsonEditor>
      </div>
      <!-- csv -->
      <div v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'csv'" class="text-wrap">
        <div v-if="formatedText.length > config.httpNodeConfig.maxTextBodySize">
          <span>{{ t('数据大小为') }}</span>
          <span class="orange mr-3 ml-1">{{ formatUnit(formatedText.length, 'bytes') }}</span>
          <span>{{ t('超过最大预览限制') }}</span>
          <span class="ml-1 mr-3">{{ formatUnit(config.httpNodeConfig.maxTextBodySize, 'bytes') }}</span>
          <el-button link type="primary" text @click="() => downloadStringAsText(formatedText, 'response.csv')">{{ t("下载到本地预览") }}</el-button>
        </div>
        <SJsonEditor v-else :modelValue="formatedText || formatedText" read-only :config="{ fontSize: 13, language: 'csv' }"></SJsonEditor>
      </div>
      <!-- text/plain -->
      <div v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'text'" class="text-wrap">
        <div v-if="formatedText.length > config.httpNodeConfig.maxTextBodySize">
          <span>{{ t('数据大小为') }}</span>
          <span class="orange mr-3 ml-1">{{ formatUnit(formatedText.length, 'bytes') }}</span>
          <span>{{ t('超过最大预览限制') }}</span>
          <span class="ml-1 mr-3">{{ formatUnit(config.httpNodeConfig.maxTextBodySize, 'bytes') }}</span>
          <el-button link type="primary" text @click="() => downloadStringAsText(formatedText, 'response.txt')">{{ t("下载到本地预览") }}</el-button>
        </div>
        <SJsonEditor v-else :model-value="formatedText" read-only :config="{ fontSize: 13, language: 'text' }"></SJsonEditor>
      </div>
      <!-- application/json -->
      <div v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'json'" class="text-wrap">
        <div v-if="formatedText.length > config.httpNodeConfig.maxTextBodySize">
          <span>{{ t('数据大小为') }}</span>
          <span class="orange mr-3 ml-1">{{ formatUnit(formatedText.length, 'bytes') }}</span>
          <span>{{ t('超过最大预览限制') }}</span>
          <span class="ml-1 mr-3">{{ formatUnit(config.httpNodeConfig.maxTextBodySize, 'bytes') }}</span>
          <el-button link type="primary" text @click="() => downloadStringAsText(formatedText, 'response.json')">{{ t("下载到本地预览") }}</el-button>
        </div>
        <SJsonEditor v-else-if="apidocResponseStore.requestState === 'finish'" :model-value="formatedText || apidocResponseStore.responseInfo.responseData.jsonData" read-only :config="{ fontSize: 13, language: 'json' }"></SJsonEditor>
        <div v-else-if="formatedText.length === 0 && apidocResponseStore.requestState === 'response'" class="json-loading">
          <el-icon size="16"><Loading /></el-icon>
          <span>{{ $t('等待数据返回') }}</span>
        </div>
      </div>
      <!-- excel -->
      <div v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'excel'" class="d-flex flex-column j-center">
        <svg class="svg-icon" aria-hidden="true" :title="t('下载文件')">
          <use xlink:href="#iconexcel"></use>
        </svg>
        <div class="text-center">{{ apidocResponseStore.responseInfo.contentType }}</div>
        <el-button link type="primary" text @click="handleDownload">{{ t("下载文件") }}</el-button>
      </div>
      <!-- word -->
      <div v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'word'" class="d-flex flex-column j-center">
        <svg class="svg-icon" aria-hidden="true" :title="t('下载文件')">
          <use xlink:href="#iconWORD"></use>
        </svg>
        <div class="text-center">{{ apidocResponseStore.responseInfo.contentType }}</div>
        <el-button link type="primary" text @click="handleDownload">{{ t("下载文件") }}</el-button>
      </div>
       <!-- ppt -->
       <div v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'ppt'" class="d-flex flex-column j-center">
        <svg class="svg-icon" aria-hidden="true" :title="t('下载文件')">
          <use xlink:href="#iconppt"></use>
        </svg>
        <div class="text-center">{{ apidocResponseStore.responseInfo.contentType }}</div>
        <el-button link type="primary" text @click="handleDownload">{{ t("下载文件") }}</el-button>
      </div>
      <!-- pdf -->
      <div v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'pdf'" class="d-flex flex-column j-center">
        <iframe :src="apidocResponseStore.responseInfo.responseData.fileData.url" class="pdf-view"></iframe>
        <div class="text-center">{{ apidocResponseStore.responseInfo.contentType }}</div>
        <el-button link type="primary" text @click="handleDownload">{{ t('下载文件') }}</el-button>
      </div>
      <!-- vidoe视频 -->
      <div v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'video'" class="d-flex flex-column j-center">
        <video 
          v-if="canPlayVideo"
          :src="apidocResponseStore.responseInfo.responseData.fileData.url" 
          controls 
          class="video-view"
        >
        </video>
        <template v-else>
          <svg class="svg-icon" aria-hidden="true" :title="t('下载文件')">
            <use xlink:href="#icontubiaozhizuomoban-"></use>
          </svg>
          <div class="text-center">{{ apidocResponseStore.responseInfo.contentType }}</div>
        </template>
        <div class="d-flex a-center j-center mt-2">
          <el-button link type="primary" text @click="handleDownload">{{ t("下载文件") }}</el-button>
        </div>
      </div>
      <!-- audio 音频文件 -->
      <div v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'audio'" class="d-flex flex-column a-center j-center">
        <audio
          v-if="apidocResponseStore.responseInfo.responseData.fileData.url"
          :src="apidocResponseStore.responseInfo.responseData.fileData.url"
          controls
          class="audio-view"
        ></audio>
        <div v-else class="text-center">音频加载中</div>
        <div class="text-center">{{ apidocResponseStore.responseInfo.contentType }}</div>
        <el-button link type="primary" text @click="handleDownload">{{ t('下载文件') }}</el-button>
      </div>
      <!-- 压缩包格式文件 -->
      <div v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'archive'" class="d-flex flex-column j-center">
        <svg class="svg-icon" aria-hidden="true" :title="t('下载文件')">
          <use xlink:href="#iconyasuobao"></use>
        </svg>
        <div class="text-center">{{ apidocResponseStore.responseInfo.contentType }}</div>
        <el-button link type="primary" text @click="handleDownload">{{ t('下载文件') }}</el-button>
      </div>
      <!-- exe格式 -->
      <div v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'exe'" class="d-flex flex-column j-center">
        <svg class="svg-icon" aria-hidden="true" :title="t('下载文件')">
          <use xlink:href="#iconexe"></use>
        </svg>
        <div class="text-center">{{ apidocResponseStore.responseInfo.contentType }}</div>
        <el-button link type="primary" text @click="handleDownload">{{ t('下载文件') }}</el-button>
      </div>
      <!-- epub -->
      <div v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'epub'" class="d-flex flex-column j-center">
        <svg class="svg-icon" aria-hidden="true" :title="t('下载文件')">
          <use xlink:href="#iconepub"></use>
        </svg>
        <div class="text-center">{{ apidocResponseStore.responseInfo.contentType }}</div>
        <el-button link type="primary" text @click="handleDownload">{{ t('下载文件') }}</el-button>
      </div>
      <!-- 无法解析的文件 -->
      <div v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'unknown'" class="d-flex j-center flex-column">
        <svg class="svg-icon" aria-hidden="true" :title="t('下载文件')">
          <use xlink:href="#iconicon_weizhiwenjian"></use>
        </svg>
        <div class="text-center">{{ apidocResponseStore.responseInfo.contentType }}</div>
        <!-- <span class="unknown-text">{{ apidocResponseStore.responseInfo.responseData.textData }}</span> -->
        <div class="d-flex a-center j-center">
          <el-button link type="primary" text @click="handleDownload">{{ t("下载文件") }}</el-button>
        </div>
      </div>
    </template>
    <div v-show="showProcess" class="process">
      <span>{{ t("总大小") }}：{{ formatUnit(loadingProcess.total, 'bytes') }}</span>
      <el-divider direction="vertical"></el-divider>
      <span>{{ t("已传输") }}：{{ formatUnit(loadingProcess.transferred, 'bytes') }}</span>
      <el-divider direction="vertical"></el-divider>
      <span>{{ t("进度") }}：{{ (loadingProcess.total === 0) ? 100 : (loadingProcess.percent * 100).toFixed(2) }}%</span>
    </div>
    <div 
      v-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'cachedBodyIsTooLarge'" 
      class="d-flex a-center j-center red"
    >
      返回值大于{{ formatUnit(config.cacheConfig.httpNodeResponseCache.singleResponseBodySize, 'bytes') }}，返回body值缓存失效。
      需重新请求最新数据
    </div>
    <div v-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'error'" class="red">{{ apidocResponseStore.responseInfo.responseData.errorData }}</div>
    <video ref="videoRef" v-show="false"></video>
  </div>
</template>

<script lang="ts" setup>
import { useApidocBaseInfo } from '@/store/apidoc/baseInfoStore';
import { useApidocResponse } from '@/store/apidoc/responseStore';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n'
import { downloadStringAsText } from '@/helper'
import { formatHeader, formatUnit } from '@/helper'
import { config } from '@src/config/config'
import SJsonEditor from '@/components/common/jsonEditor/ClJsonEditor.vue'
import SSseView from '@/components/common/sseView/ClSseView.vue'
import { useApidocTas } from '@/store/apidoc/tabsStore';
import { useHttpNode } from '@/store/apidoc/httpNodeStore';
import { ElDialog } from 'element-plus';
import beautify, { html as htmlBeautify, css as cssBeautify } from 'js-beautify';
import worker from '@/worker/prettier.worker.ts?worker&inline';
import { Download, Loading } from '@element-plus/icons-vue';

const prettierWorker = new worker();
type WorkerFormatType = 'format-json' | 'format-html' | 'format-css' | 'format-js' | 'format-xml' | 'format-csv';
type FormatPayload = { type: WorkerFormatType, code: string };
type WorkerResultMessage = { type: `${WorkerFormatType}-result`, formatted: string, taskId?: number };
let workerTaskIdSeed = 0;
let activeWorkerTaskId: number | null = null;
let pendingWorkerSource: string | null = null;
let pendingWorkerType: WorkerFormatType | null = null;
let lastFormattedSource: string | null = null;
let lastFormattedType: WorkerFormatType | null = null;
const apidocResponseStore = useApidocResponse();
const apidocBaseInfoStore = useApidocBaseInfo();
const httpNodeStore = useHttpNode();
const loadingProcess = computed(() => apidocResponseStore.loadingProcess);
const requestState = computed(() => apidocResponseStore.requestState);
const redirectList = computed(() => apidocResponseStore.responseInfo.redirectList);
const videoRef = ref<HTMLVideoElement>();
const { t } = useI18n()

const formatedText = ref('');
const apidocTabsStore = useApidocTas();
const selectedTab = apidocTabsStore.getSelectedTab(apidocBaseInfoStore.projectId);
const showRedirectDialog = ref(false);
/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
//是否展示加载进度
const showProcess = computed(() => {
  const { canApiflowParseType } = apidocResponseStore.responseInfo.responseData;
  if (canApiflowParseType === 'unknown' && (requestState.value === 'sending' || requestState.value === 'response')) {
    return true;
  }
  const isError = canApiflowParseType === 'error';
  const isJson = canApiflowParseType === 'json';
  const isText = canApiflowParseType === 'text';
  const isHtml = canApiflowParseType === 'html';
  const isCes = canApiflowParseType === 'css';
  const isJs = canApiflowParseType === 'js';
  const isXml = canApiflowParseType === 'xml';
  const isUnknow = canApiflowParseType === 'unknown';
  const isTooLargeBody = canApiflowParseType === 'cachedBodyIsTooLarge';
  const isTextEventSteam = canApiflowParseType === 'textEventStream'
  return !isError && !isText && !isUnknow && !isHtml && !isCes && !isJs && !isXml && !isTooLargeBody && !isJson && !isTextEventSteam;
})
//布局
const layout = computed(() => apidocBaseInfoStore.layout);
const resolveFormatPayload = (): FormatPayload | null => {
  const { responseData, contentType } = apidocResponseStore.responseInfo;
  const safeContentType = contentType || '';
  const textData = responseData.textData || '';
  const targetType = responseData.canApiflowParseType;
  if (!textData) {
    return null;
  }
  if (targetType === 'json' || safeContentType.includes('application/json')) {
    const jsonSource = typeof responseData.jsonData === 'string' ? responseData.jsonData : textData;
    return { type: 'format-json', code: jsonSource };
  }
  if (targetType === 'html' || safeContentType.includes('text/html')) {
    return { type: 'format-html', code: textData };
  }
  if (targetType === 'css' || safeContentType.includes('text/css')) {
    return { type: 'format-css', code: textData };
  }
  if (targetType === 'js' || safeContentType.includes('application/javascript') || safeContentType.includes('text/javascript')) {
    return { type: 'format-js', code: textData };
  }
  if (targetType === 'xml' || safeContentType.includes('application/xml') || safeContentType.includes('text/xml')) {
    return { type: 'format-xml', code: textData };
  }
  if (targetType === 'csv' || safeContentType.includes('text/csv')) {
    return { type: 'format-csv', code: textData };
  }
  return null;
};

const formatInline = (payload: FormatPayload): string => {
  const { type, code } = payload;
  if (!code) {
    return '';
  }
  try {
    if (type === 'format-json') {
      return beautify(code, { indent_size: 2 });
    }
    if (type === 'format-js') {
      return beautify(code, { indent_size: 2 });
    }
    if (type === 'format-css') {
      return cssBeautify(code, { indent_size: 2 });
    }
    if (type === 'format-html' || type === 'format-xml') {
      return htmlBeautify(code, { indent_size: 2 });
    }
  } catch (error) {
    return code;
  }
  return code;
};

const scheduleWorkerFormat = (payload: FormatPayload): void => {
  const source = payload.code;
  if (pendingWorkerSource === source && pendingWorkerType === payload.type && activeWorkerTaskId !== null) {
    return;
  }
  workerTaskIdSeed += 1;
  const taskId = workerTaskIdSeed;
  activeWorkerTaskId = taskId;
  pendingWorkerSource = source;
  pendingWorkerType = payload.type;
  httpNodeStore.changeResponseBodyLoading(true);
  prettierWorker?.postMessage({
    type: payload.type,
    code: source,
    taskId,
  });
};

const resetWorkerState = () => {
  activeWorkerTaskId = null;
  pendingWorkerSource = null;
  pendingWorkerType = null;
};

watch(() => [
  apidocResponseStore.responseInfo.bodyByteLength,
  apidocResponseStore.responseInfo.responseData.textData,
  apidocResponseStore.requestState,
], () => {
  const payload = resolveFormatPayload();
  const textData = apidocResponseStore.responseInfo.responseData.textData || '';
  const requestStatus = apidocResponseStore.requestState;
  if (!payload) {
    formatedText.value = textData;
    lastFormattedSource = textData;
    lastFormattedType = null;
    resetWorkerState();
    httpNodeStore.changeResponseBodyLoading(false);
    return;
  }
  if (!payload.code) {
    formatedText.value = '';
    lastFormattedSource = '';
    lastFormattedType = payload.type;
    resetWorkerState();
    httpNodeStore.changeResponseBodyLoading(false);
    return;
  }
  if (requestStatus === 'waiting' || requestStatus === 'sending') {
    formatedText.value = textData;
    lastFormattedSource = null;
    lastFormattedType = null;
    resetWorkerState();
    httpNodeStore.changeResponseBodyLoading(false);
    return;
  }
  if (lastFormattedSource === payload.code && lastFormattedType === payload.type && requestStatus === 'finish') {
    httpNodeStore.changeResponseBodyLoading(false);
    return;
  }
  if (payload.code.length <= 1024 * 10) {
    formatedText.value = formatInline(payload);
    lastFormattedSource = payload.code;
    lastFormattedType = payload.type;
    resetWorkerState();
    httpNodeStore.changeResponseBodyLoading(false);
    return;
  }
  if (requestStatus !== 'finish') {
    formatedText.value = textData;
    httpNodeStore.changeResponseBodyLoading(false);
    lastFormattedSource = null;
    lastFormattedType = null;
    resetWorkerState();
    return;
  }
  scheduleWorkerFormat(payload);
});
//下载文件
const handleDownload = () => {
  const { fileData } = apidocResponseStore.responseInfo.responseData;
  const downloadElement = document.createElement('a');
  downloadElement.href = fileData.url;
  downloadElement.download = fileData.name || `${t('未命名')}${fileData.ext ? `.${fileData.ext}` : ''}`; //下载后文件名
  document.body.appendChild(downloadElement);
  downloadElement.click(); //点击下载
  document.body.removeChild(downloadElement); //下载完成移除元素
  window.URL.revokeObjectURL(fileData.url); //释放掉blob对象
}
const canPlayVideo = computed(() => {
  const canPlayType = videoRef.value?.canPlayType(apidocResponseStore.responseInfo.contentType);
  return canPlayType === 'maybe' || canPlayType === 'probably'
})
onMounted(() => {
  prettierWorker.onmessage = (event: MessageEvent<WorkerResultMessage>) => {
    const message = event.data;
    if (!message || typeof message.formatted !== 'string') {
      return;
    }
    if (pendingWorkerSource === null && pendingWorkerType === null && activeWorkerTaskId === null) {
      return;
    }
    if (typeof message.taskId === 'number' && activeWorkerTaskId !== null && message.taskId !== activeWorkerTaskId) {
      return;
    }
    const sourceCache = pendingWorkerSource ?? message.formatted;
    const typeCache = pendingWorkerType;
    formatedText.value = message.formatted;
    lastFormattedSource = sourceCache;
    lastFormattedType = typeCache ?? null;
    resetWorkerState();
    httpNodeStore.changeResponseBodyLoading(false);
  };
});
onUnmounted(() => {
  resetWorkerState();
  httpNodeStore.changeResponseBodyLoading(false);
  if (prettierWorker) {
    prettierWorker.terminate();
    prettierWorker != null;
  }
})
</script>

<style lang='scss' scoped>
.body-view {
  width: 100%;
  margin-top: 2px;
  height: calc(100vh - var(--apiflow-apidoc-request-view-height) - var(--apiflow-doc-nav-height) - 80px);
  position: relative;
  .response-tip {
    width: 100%;
    padding: 5px 10px;
    background-color: var(--warning-color);
    color: var(--bg-primary);
  }
  .json-wrap {
    height: calc(100vh - 400px);
    position: relative;
    .tip {
      width: 100%;
      padding: 5px 10px;
      background-color: var(--warning-color);
      position: absolute;
      bottom: -30px;
      z-index: var(--zIndex-contextmenu);
      color: var(--bg-primary);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .apply-response {
    position: absolute;
    cursor: pointer;
    right: 15px;
    top: 0px;
    z-index: var(--zIndex-contextmenu);
  }
  .text-wrap {
    height: 100%;
    .text-tool {
      display: flex;
      align-items: center;
      height: 20px;
      border-bottom: 1px solid var(--border-light);
    }
    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
    .json-loading {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      .el-icon {
        animation: spin 1s infinite linear;
      }
    }
  }
  .operation {
    height: 30px;
    padding: 0 20px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    color: var(--text-tertiary);
  }
  .img-view-wrap {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    .img-view {
      border: 1px solid var(--border-base);
      width: 80%;
      height: 250px;
      padding: 0 5px;
    }
    .img-view-empty {
      width: 250px;
      height: 250px;
      background-color: var(--el-fill-color-light);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
    }
  }
  .sse-view-wrap {
    height: 100%;
    padding-right: 5px;
  }
  .process {
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-primary);
  }
}
:deep(.redirect-dialog) {
  max-height: 70vh;
  overflow-y: auto;
}
:deep(.redirect-dialog .el-dialog__body) {
  padding: 0 20px 16px 20px;
  box-sizing: border-box;
  max-height: 60vh;
  overflow-y: auto;
}
.redirect-headers {
  padding-left: 16px;
  padding-top: 5px;
  padding-bottom: 5px;
  font-size: 13px;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  border-radius: 4px;
  margin-bottom: 4px;
  word-break: break-all;
}
.header-row {
  line-height: 1.7;
  display: flex;
  gap: 8px;
}

.redirect-item {
  margin-bottom: 18px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-light);
}
.redirect-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.download-icon {
  width: 100%;
  height: 150px;
  font-size: 150px;
}
</style>
