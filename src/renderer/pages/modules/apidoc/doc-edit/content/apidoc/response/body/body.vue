<template>
  <div class="body-view" :class="{ vertical: layout === 'vertical' }">
    <div v-if="selectedTab && apidocResponseStore.responseCacheAllowedMap[selectedTab._id] === false" class="response-tip">
      <!-- 返回数据大小超过单个允许缓存数据，数据无法被缓存，切换tab或者刷新页面缓存值将会清空 -->
      <div class="mb-1">
        <span class="mr-1">返回数据大小为</span>
        <span class="text-bold">{{ formatBytes(loadingProcess.total) }}</span>
        <span class="mx-1">超过单个允许缓存数据大小</span>
        <span class="text-bold">{{ formatBytes(config.cacheConfig.apiflowResponseCache.singleResponseBodySize) }}</span>
      </div>
      <span class="">数据无法被缓存，切换tab或者刷新页面缓存值将会清空</span>
    </div>
    <template v-if="apidocResponseStore.responseInfo.contentType">
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
        <svg class="svg-icon" aria-hidden="true" :title="t('下载文件')">
          <use xlink:href="#iconicon_weizhiwenjian"></use>
        </svg>
        <div  class="text-center">{{ apidocResponseStore.responseInfo.contentType }}</div>
        <el-button link type="primary" text @click="handleDownload">{{ t("下载文件") }}</el-button>
      </div>
      <!-- xml -->
      <div v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'xml'" class="text-wrap">
        <div v-if="formatedText.length > config.requestConfig.maxTextBodySize">
          <span>{{ t('数据大小为') }}</span>
          <span class="orange mr-3 ml-1">{{ formatBytes(formatedText.length) }}</span>
          <span>{{ t('超过最大预览限制') }}</span>
          <span class="ml-1 mr-3">{{ formatBytes(config.requestConfig.maxTextBodySize) }}</span>
          <el-button link type="primary" text @click="() => downloadStringAsText(formatedText, 'response.xml')">{{ t("下载到本地预览") }}</el-button>
        </div>
        <SJsonEditor v-else :modelValue="formatedText" read-only :config="{ fontSize: 13, language: 'xml' }"></SJsonEditor>
      </div>
      <!-- javascript -->
      <div v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'js'" class="text-wrap">
        <div v-if="formatedText.length > config.requestConfig.maxTextBodySize">
          <span>{{ t('数据大小为') }}</span>
          <span class="orange mr-3 ml-1">{{ formatBytes(formatedText.length) }}</span>
          <span>{{ t('超过最大预览限制') }}</span>
          <span class="ml-1 mr-3">{{ formatBytes(config.requestConfig.maxTextBodySize) }}</span>
          <el-button link type="primary" text @click="() => downloadStringAsText(formatedText, 'response.js')">{{ t("下载到本地预览") }}</el-button>
        </div>
        <SJsonEditor v-else :modelValue="formatedText || formatedText" read-only :config="{ fontSize: 13, language: 'javascript' }"></SJsonEditor>
      </div>
      <!-- html -->
      <div v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'html'" class="text-wrap">
        <div v-if="formatedText.length > config.requestConfig.maxTextBodySize">
          <span>{{ t('数据大小为') }}</span>
          <span class="orange mr-3 ml-1">{{ formatBytes(formatedText.length) }}</span>
          <span>{{ t('超过最大预览限制') }}</span>
          <span class="ml-1 mr-3">{{ formatBytes(config.requestConfig.maxTextBodySize) }}</span>
          <el-button link type="primary" text @click="() => downloadStringAsText(formatedText, 'response.html')">{{ t("下载到本地预览") }}</el-button>
        </div>
        <SJsonEditor v-else :modelValue="formatedText" read-only :config="{ fontSize: 13, language: 'html' }"></SJsonEditor>
      </div>
      <!-- css -->
      <div v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'css'" class="text-wrap">
        <div v-if="formatedText.length > config.requestConfig.maxTextBodySize">
          <span>{{ t('数据大小为') }}</span>
          <span class="orange mr-3 ml-1">{{ formatBytes(formatedText.length) }}</span>
          <span>{{ t('超过最大预览限制') }}</span>
          <span class="ml-1 mr-3">{{ formatBytes(config.requestConfig.maxTextBodySize) }}</span>
          <el-button link type="primary" text @click="() => downloadStringAsText(formatedText, 'response.css')">{{ t("下载到本地预览") }}</el-button>
        </div>
        <SJsonEditor v-else :modelValue="formatedText || formatedText" read-only :config="{ fontSize: 13, language: 'css' }"></SJsonEditor>
      </div>
      <!-- csv -->
      <div v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'csv'" class="text-wrap">
        <div v-if="formatedText.length > config.requestConfig.maxTextBodySize">
          <span>{{ t('数据大小为') }}</span>
          <span class="orange mr-3 ml-1">{{ formatBytes(formatedText.length) }}</span>
          <span>{{ t('超过最大预览限制') }}</span>
          <span class="ml-1 mr-3">{{ formatBytes(config.requestConfig.maxTextBodySize) }}</span>
          <el-button link type="primary" text @click="() => downloadStringAsText(formatedText, 'response.csv')">{{ t("下载到本地预览") }}</el-button>
        </div>
        <SJsonEditor v-else :modelValue="formatedText || formatedText" read-only :config="{ fontSize: 13, language: 'csv' }"></SJsonEditor>
      </div>
      <!-- text/plain -->
      <div v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'text'" class="text-wrap">
        <div v-if="formatedText.length > config.requestConfig.maxTextBodySize">
          <span>{{ t('数据大小为') }}</span>
          <span class="orange mr-3 ml-1">{{ formatBytes(formatedText.length) }}</span>
          <span>{{ t('超过最大预览限制') }}</span>
          <span class="ml-1 mr-3">{{ formatBytes(config.requestConfig.maxTextBodySize) }}</span>
          <el-button link type="primary" text @click="() => downloadStringAsText(formatedText, 'response.txt')">{{ t("下载到本地预览") }}</el-button>
        </div>
        <SJsonEditor v-else :model-value="formatedText" read-only :config="{ fontSize: 13, language: 'text' }"></SJsonEditor>
      </div>
      <!-- application/json -->
      <div v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'json'" class="text-wrap">
        <div v-if="formatedText.length > config.requestConfig.maxTextBodySize">
          <span>{{ t('数据大小为') }}</span>
          <span class="orange mr-3 ml-1">{{ formatBytes(formatedText.length) }}</span>
          <span>{{ t('超过最大预览限制') }}</span>
          <span class="ml-1 mr-3">{{ formatBytes(config.requestConfig.maxTextBodySize) }}</span>
          <el-button link type="primary" text @click="() => downloadStringAsText(formatedText, 'response.json')">{{ t("下载到本地预览") }}</el-button>
        </div>
        <SJsonEditor v-else :model-value="formatedText || apidocResponseStore.responseInfo.responseData.jsonData" read-only :config="{ fontSize: 13, language: 'json' }"></SJsonEditor>
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
      <span>{{ t("总大小") }}：{{ formatBytes(loadingProcess.total) }}</span>
      <el-divider direction="vertical"></el-divider>
      <span>{{ t("已传输") }}：{{ formatBytes(loadingProcess.transferred) }}</span>
      <el-divider direction="vertical"></el-divider>
      <span>{{ t("进度") }}：{{ (loadingProcess.total === 0) ? 100 : (loadingProcess.percent * 100).toFixed(2) }}%</span>
    </div>
    <div 
      v-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'cachedBodyIsTooLarge'" 
      class="d-flex a-center j-center red"
    >
      返回值大于{{ formatBytes(config.cacheConfig.apiflowResponseCache.singleResponseBodySize) }}，返回body值缓存失效。
      需重新请求最新数据
    </div>
    <div v-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'error'" class="red">{{ apidocResponseStore.responseInfo.responseData.errorData }}</div>
    <video ref="videoRef" v-show="false"></video>
  </div>
</template>

<script lang="ts" setup>
import { useApidocBaseInfo } from '@/store/apidoc/base-info';
import { useApidocResponse } from '@/store/apidoc/response';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { t } from 'i18next'
import { formatBytes, downloadStringAsText } from '@/helper/index'
import { config } from '@/../config/config'
import SJsonEditor from '@/components/common/json-editor/g-json-editor.vue'
import { useApidocTas } from '@/store/apidoc/tabs';

const prettierWorker = new Worker(new URL('@/worker/prettier.worker.ts', import.meta.url), { type: 'module' });
const apidocResponseStore = useApidocResponse();
const apidocBaseInfoStore = useApidocBaseInfo();
const loadingProcess = computed(() => apidocResponseStore.loadingProcess);
const requestState = computed(() => apidocResponseStore.requestState);
const videoRef = ref<HTMLVideoElement>();
const formatedText = ref('');
const apidocTabsStore = useApidocTas();
const selectedTab = apidocTabsStore.getSelectedTab(apidocBaseInfoStore.projectId);
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
  return !isError && !isText && !isUnknow && !isHtml && !isCes && !isJs && !isXml && !isTooLargeBody && !isJson;
})
//布局
const layout = computed(() => {
  return apidocBaseInfoStore.layout;
});
//返回参数格式化
watch(() => apidocResponseStore.responseInfo.bodyByteLength, () => {
  const { jsonData, textData } = apidocResponseStore.responseInfo.responseData;
  // json 格式化
  if (apidocResponseStore.responseInfo.contentType.includes('application/json')) {
    prettierWorker?.postMessage({
      type: 'format-json',
      code: jsonData
    });
  }
  // html 格式化
  if (apidocResponseStore.responseInfo.contentType.includes('text/html')) {
    prettierWorker?.postMessage({
      type: 'format-html',
      code: textData
    });
  }
  // css 格式化
  if (apidocResponseStore.responseInfo.contentType.includes('text/css')) {
    prettierWorker?.postMessage({
      type: 'format-css',
      code: textData
    });
  }
  // js 格式化
  if (apidocResponseStore.responseInfo.contentType.includes('application/javascript') || apidocResponseStore.responseInfo.contentType.includes('text/javascript')) {
    prettierWorker?.postMessage({
      type: 'format-js',
      code: textData
    });
  }
  // xml 格式化
  if (apidocResponseStore.responseInfo.contentType.includes('application/xml') || apidocResponseStore.responseInfo.contentType.includes('text/xml')) {
    prettierWorker?.postMessage({
      type: 'format-xml',
      code: textData
    });
  }
  // csv 格式化
  if (apidocResponseStore.responseInfo.contentType.includes('text/csv')) {
    prettierWorker?.postMessage({
      type: 'format-csv',
      code: textData
    });
  }
  // 兜底
  formatedText.value = textData;
});
//下载文件
const handleDownload = () => {
  const { fileData } = apidocResponseStore.responseInfo.responseData;
  const downloadElement = document.createElement('a');
  downloadElement.href = fileData.url;
  downloadElement.download = fileData.name || t('未命名'); //下载后文件名
  document.body.appendChild(downloadElement);
  downloadElement.click(); //点击下载
  document.body.removeChild(downloadElement); //下载完成移除元素
  window.URL.revokeObjectURL(fileData.url); //释放掉blob对象
}
const canPlayVideo = computed(() => {
  const canPlayType = videoRef.value?.canPlayType(apidocResponseStore.responseInfo.contentType)
  return canPlayType === 'maybe' || canPlayType === 'probably'
})
onMounted(() => {
  prettierWorker.onmessage = (event) => {
    if (event.data.type === 'format-css-result') {
      formatedText.value = event.data.formatted;
    } else if (event.data.type === 'format-html-result') {
      formatedText.value = event.data.formatted;
    } else if (event.data.type === 'format-js-result') {
      formatedText.value = event.data.formatted;
    } else if (event.data.type === 'format-xml-result') {
      formatedText.value = event.data.formatted;
    } else if (event.data.type === 'format-json-result') {
      formatedText.value = event.data.formatted;
    }
  };
});
onUnmounted(() => {
  if (prettierWorker) {
    prettierWorker.terminate();
    prettierWorker != null;
  }
})
</script>

<style lang='scss' scoped>
.body-view {
  width: 100%;
  height: calc(100vh - #{size(400)});
  // overflow-y: auto;
  position: relative;

  &.vertical {
    height: 100%;
  }
  .response-tip {
    width: 100%;
    padding: size(5) size(10);
    background-color: #f19d1f;
    color: $white;
  }
  .json-wrap {
    height: calc(100vh - #{size(400)});
    position: relative;

    .tip {
      width: 100%;
      padding: size(5) size(10);
      background-color: $orange;
      position: absolute;
      bottom: -size(30);
      z-index: $zIndex-contextmenu;
      color: $white;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .apply-response {
    position: absolute;
    cursor: pointer;
    right: size(15);
    top: size(0);
    z-index: $zIndex-contextmenu;
  }

  .text-wrap {
    height: 100%;
    .text-tool {
      display: flex;
      align-items: center;
      height: size(20);
      border-bottom: 1px solid $gray-200;
    }
    .text-view {
      height: calc(100% - #{size(20)});
    }
  }

  .operation {
    height: size(30);
    padding: 0 size(20);
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    color: $gray-300;
  }

  .img-view-wrap {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    .img-view {
      border: 1px solid $gray-400;
      width: 80%;
      height: size(250);
      padding: 0 size(5);
    }
    .img-view-empty {
      width: size(250);
      height: size(250);
      background-color: var(--el-fill-color-light);
      display: flex;
      align-items: center;
      justify-content: center;
      color: $gray-500;
    }
  }

  .pdf-view {
    width: 100%;
    height: size(300);
  }
  .video-view {
    width: 100%;
    height: size(300);
  }
  .res-icon {
    width: size(200);
    height: size(200);
  }
  .process {
    height: size(30);
    display: flex;
    align-items: center;
    justify-content: center;
    color: $gray-600;
  }
}
</style>
