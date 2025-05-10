<template>
  <div class="body-view" :class="{ vertical: layout === 'vertical' }">
    <template v-if="apidocResponseStore.responseInfo.contentType">
      <!-- 图片类型 -->
      <div v-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'image'" class="img-view-wrap">
        <el-image 
          v-if="apidocResponseStore.responseInfo.responseData.fileData.url"
          class="img-view" 
          :src="apidocResponseStore.responseInfo.responseData.fileData.url"
          :preview-src-list="[apidocResponseStore.responseInfo.responseData.fileData.url]" 
          fit="scale-down">
        </el-image>
        <div v-else class="img-view-empty">图片加载中</div>
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
        <div v-if="apidocResponseStore.responseInfo.responseData.textData.length > config.requestConfig.maxTextBodySize">
          <span>{{ t('数据大小为') }}</span>
          <span class="orange mr-3 ml-1">{{ formatBytes(apidocResponseStore.responseInfo.responseData.textData.length) }}</span>
          <span>{{ t('超过最大限制') }}</span>
          <span class="ml-1 mr-3">{{ formatBytes(config.requestConfig.maxJsonBodySize) }}</span>
          <el-button link type="primary" text @click="() => downloadStringAsText(apidocResponseStore.responseInfo.responseData.textData, 'response.xml')">{{ t("下载为文件") }}</el-button>
        </div>
        <SJsonEditor v-else :modelValue="apidocResponseStore.responseInfo.responseData.textData" read-only :config="{ fontSize: 13, language: 'xml' }"></SJsonEditor>
      </div>
      <!-- javascript -->
      <div v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'js'" class="text-wrap">
        <div v-if="apidocResponseStore.responseInfo.responseData.textData.length > config.requestConfig.maxTextBodySize">
          <span>{{ t('数据大小为') }}</span>
          <span class="orange mr-3 ml-1">{{ formatBytes(apidocResponseStore.responseInfo.responseData.textData.length) }}</span>
          <span>{{ t('超过最大限制') }}</span>
          <span class="ml-1 mr-3">{{ formatBytes(config.requestConfig.maxJsonBodySize) }}</span>
          <el-button link type="primary" text @click="() => downloadStringAsText(apidocResponseStore.responseInfo.responseData.textData, 'response.js')">{{ t("下载为文件") }}</el-button>
        </div>
        <SJsonEditor v-else :modelValue="apidocResponseStore.responseInfo.responseData.textData" read-only :config="{ fontSize: 13, language: 'javascript' }"></SJsonEditor>
      </div>
      <!-- html -->
      <div v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'html'" class="text-wrap">
        <div v-if="formatedHtml.length > config.requestConfig.maxTextBodySize">
          <span>{{ t('数据大小为') }}</span>
          <span class="orange mr-3 ml-1">{{ formatBytes(formatedHtml.length) }}</span>
          <span>{{ t('超过最大限制') }}</span>
          <span class="ml-1 mr-3">{{ formatBytes(config.requestConfig.maxJsonBodySize) }}</span>
          <el-button link type="primary" text @click="() => downloadStringAsText(formatedHtml, 'response.html')">{{ t("下载为文件") }}</el-button>
        </div>
        <div v-else-if="apidocResponseStore.responseInfo.responseData.textData.length > config.requestConfig.maxTextBodySize">
          <span>{{ t('数据大小为') }}</span>
          <span class="orange mr-3 ml-1">{{ formatBytes(apidocResponseStore.responseInfo.responseData.textData.length) }}</span>
          <span>{{ t('超过最大限制') }}</span>
          <span class="ml-1 mr-3">{{ formatBytes(config.requestConfig.maxJsonBodySize) }}</span>
          <el-button link type="primary" text @click="() => downloadStringAsText(apidocResponseStore.responseInfo.responseData.textData, 'response.html')">{{ t("下载为文件") }}</el-button>
        </div>
        <SJsonEditor v-else :modelValue="formatedHtml || apidocResponseStore.responseInfo.responseData.textData" read-only :config="{ fontSize: 13, language: 'html' }"></SJsonEditor>
      </div>
      <!-- css -->
      <div v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'css'" class="text-wrap">
        <div v-if="apidocResponseStore.responseInfo.responseData.textData.length > config.requestConfig.maxTextBodySize">
          <span>{{ t('数据大小为') }}</span>
          <span class="orange mr-3 ml-1">{{ formatBytes(apidocResponseStore.responseInfo.responseData.textData.length) }}</span>
          <span>{{ t('超过最大限制') }}</span>
          <span class="ml-1 mr-3">{{ formatBytes(config.requestConfig.maxJsonBodySize) }}</span>
          <el-button link type="primary" text @click="() => downloadStringAsText(apidocResponseStore.responseInfo.responseData.textData, 'response.css')">{{ t("下载为文件") }}</el-button>
        </div>
        <SJsonEditor v-else :modelValue="apidocResponseStore.responseInfo.responseData.textData" read-only :config="{ fontSize: 13, language: 'css' }"></SJsonEditor>
      </div>
      <!-- text/plain -->
      <div v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'text'" class="text-wrap">
        <div v-if="apidocResponseStore.responseInfo.responseData.textData.length > config.requestConfig.maxTextBodySize">
          <span>{{ t('数据大小为') }}</span>
          <span class="orange mr-3 ml-1">{{ formatBytes(apidocResponseStore.responseInfo.responseData.textData.length) }}</span>
          <span>{{ t('超过最大限制') }}</span>
          <span class="ml-1 mr-3">{{ formatBytes(config.requestConfig.maxJsonBodySize) }}</span>
          <el-button link type="primary" text @click="() => downloadStringAsText(apidocResponseStore.responseInfo.responseData.textData, 'response.txt')">{{ t("下载为文件") }}</el-button>
        </div>
        <SJsonEditor v-else :model-value="apidocResponseStore.responseInfo.responseData.textData" read-only :config="{ fontSize: 13, language: 'text' }"></SJsonEditor>
      </div>
      <!-- application/json -->
      <div v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'json'" class="text-wrap">
        <div v-if="formatedJson.length > config.requestConfig.maxJsonBodySize">
          <span>{{ t('数据大小为') }}</span>
          <span class="orange mr-3 ml-1">{{ formatBytes(formatedJson.length) }}</span>
          <span>{{ t('超过最大限制') }}</span>
          <span class="ml-1 mr-3">{{ formatBytes(config.requestConfig.maxJsonBodySize) }}</span>
          <el-button link type="primary" text @click="() => downloadStringAsText(formatedJson, 'response.json')">{{ t("下载为文件") }}</el-button>
        </div>
        <div v-else-if="apidocResponseStore.responseInfo.responseData.jsonData.length > config.requestConfig.maxJsonBodySize">
          <span>{{ t('数据大小为') }}</span>
          <span class="orange mr-3 ml-1">{{ formatBytes(apidocResponseStore.responseInfo.responseData.jsonData.length) }}</span>
          <span>{{ t('超过最大限制') }}</span>
          <span class="ml-1 mr-3">{{ formatBytes(config.requestConfig.maxJsonBodySize) }}</span>
          <el-button link type="primary" text @click="() => downloadStringAsText(apidocResponseStore.responseInfo.responseData.jsonData, 'response.json')">{{ t("下载为文件") }}</el-button>
        </div>
        <SJsonEditor v-else :model-value="formatedJson || apidocResponseStore.responseInfo.responseData.jsonData" read-only :config="{ fontSize: 13, language: 'json' }"></SJsonEditor>
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
      <iframe v-else-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'pdf'" :src="apidocResponseStore.responseInfo.responseData.fileData.url" class="pdf-view"></iframe>
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
        <div class="d-flex a-center j-center">
          <el-button link type="primary" text @click="handleDownload">{{ t("下载文件") }}</el-button>
        </div>
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
      返回值大于{{ formatBytes(config.requestConfig.maxStoreSingleBodySize) }}，返回body值缓存失效。
      需重新请求最新数据
    </div>
    <div v-if="apidocResponseStore.responseInfo.responseData.canApiflowParseType === 'error'" class="red">{{ apidocResponseStore.responseInfo.responseData.errorData }}</div>
    <video ref="videoRef" v-show="false"></video>
  </div>
</template>

<script lang="ts" setup>
import { useApidocBaseInfo } from '@/store/apidoc/base-info';
import { useApidocResponse } from '@/store/apidoc/response';
import { computed, onUnmounted, ref, watch } from 'vue';
import { t } from 'i18next'
import { formatBytes, downloadStringAsText } from '@/helper/index'
import { config } from '@/../config/config'
import * as prettier from 'prettier/standalone';
import esTreePlugin from 'prettier/plugins/estree';
import babelPlugin from "prettier/plugins/babel";
import htmlPlugin from "prettier/plugins/html";
import SJsonEditor from '@/components/common/json-editor/g-json-editor.vue'


const apidocResponseStore = useApidocResponse();
const apidocBaseInfoStore = useApidocBaseInfo();
const loadingProcess = computed(() => apidocResponseStore.loadingProcess);
const requestState = computed(() => apidocResponseStore.requestState);
const videoRef = ref<HTMLVideoElement>()
const formatedJson = ref('');
const formatedHtml = ref('')
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
  if (apidocResponseStore.responseInfo.contentType.includes('application/json')) {
    prettier.format(jsonData, {
      parser: "json",
      plugins: [babelPlugin, esTreePlugin],
      printWidth: 50,
      tabWidth: 4
    }).then((formatedCode) => {
      formatedJson.value = formatedCode;
    })
  } else if (apidocResponseStore.responseInfo.contentType.includes('text/html')) {
    prettier.format(textData, {
      parser: "html",
      plugins: [htmlPlugin, esTreePlugin],
    }).then((formatedCode) => {
      formatedHtml.value = formatedCode;
    })
  }
})
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
onUnmounted(() => {
  // console.log(2)
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
    .img-view {
      width: size(250);
      height: size(250);
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
