<template>
  <div class="body-view" :class="{ vertical: layout === 'vertical' }">
    <template v-if="responseInfo.contentType">
      <!-- 图片类型 -->
      <div v-if="responseInfo.contentType.includes('image/')" class="img-view-wrap">
        <el-image 
          v-if="responseInfo.responseData.fileData.url"
          class="img-view" 
          :src="responseInfo.responseData.fileData.url"
          :preview-src-list="[responseInfo.responseData.fileData.url]" 
          fit="scale-down">
        </el-image>
        <div v-else class="img-view-empty">图片加载中</div>
      </div>
      <!-- 音频类型、视频类型、流文件 -->
      <div v-else-if="responseInfo.contentType.includes('application/octet-stream')"
        class="d-flex flex-column a-center">
        <svg class="svg-icon" aria-hidden="true" :title="t('下载文件')">
          <use xlink:href="#iconicon_weizhiwenjian"></use>
        </svg>
        <div>{{ responseInfo.contentType }}</div>
        <el-button link type="primary" text @click="handleDownload">{{ t("下载文件") }}</el-button>
      </div>
      <div v-else-if="responseInfo.contentType.includes('application/force-download')"
        class="d-flex flex-column j-center">
        <svg class="svg-icon" aria-hidden="true" :title="t('下载文件')">
          <use xlink:href="#iconicon_weizhiwenjian"></use>
        </svg>
        <div>{{ responseInfo.contentType }}</div>
        <el-button link type="primary" text @click="handleDownload">{{ t("下载文件") }}</el-button>
      </div>
      <!-- excel -->
      <div
        v-else-if="responseInfo.contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') || responseInfo.contentType.includes('application/vnd.ms-excel')"
        class="d-flex flex-column j-center">
        <svg class="svg-icon" aria-hidden="true" :title="t('下载文件')">
          <use xlink:href="#iconexcel"></use>
        </svg>
        <div>{{ responseInfo.contentType }}</div>
        <el-button link type="primary" text @click="handleDownload">{{ t("下载文件") }}</el-button>
      </div>
      <!-- word -->
      <div
        v-else-if="responseInfo.contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || responseInfo.contentType.includes('application/msword')"
        class="d-flex flex-column j-center">
        <svg class="svg-icon" aria-hidden="true" :title="t('下载文件')">
          <use xlink:href="#iconWORD"></use>
        </svg>
        <div>{{ responseInfo.contentType }}</div>
        <el-button link type="primary" text @click="handleDownload">{{ t("下载文件") }}</el-button>
      </div>
      <!-- pdf -->
      <iframe v-else-if="responseInfo.contentType.includes('application/pdf')"
        :src="responseInfo.responseData.fileData.url" class="pdf-view"></iframe>
      <!-- xml -->
      <pre
        v-else-if="responseInfo.contentType.includes('application/xml')">{{ responseInfo.responseData.textData }}</pre>
      <!-- javascript -->
      <pre
        v-else-if="responseInfo.contentType.includes('application/javascript')">{{ responseInfo.responseData.textData }}</pre>
      <!-- html -->
      <div v-else-if="responseInfo.contentType.includes('text/html')" class="text-wrap">
        <SRawEditor :model-value="responseInfo.responseData.textData" readonly type="text/html"></SRawEditor>
      </div>
      <!-- 纯文本 -->
      <div v-else-if="responseInfo.contentType.includes('text/plain')" class="text-wrap">
        <SRawEditor :model-value="textResponse" readonly type="text/plain">
        </SRawEditor>
      </div>
      <!-- 未知文件 -->
      <div v-else-if="!responseInfo.contentType.includes('application/json')">
        <svg class="svg-icon" aria-hidden="true" :title="t('下载文件')">
          <use xlink:href="#iconicon_weizhiwenjian"></use>
        </svg>
        <div>{{ responseInfo.contentType }}</div>
        <el-button link type="primary" text @click="handleDownload">{{ t("下载文件") }}</el-button>
      </div>
      <!-- json -->
      <div v-show="responseInfo.contentType.includes('application/json')">
        <div class="json-wrap">
          <SRawEditor :model-value="jsonResponse" readonly type="application/json"></SRawEditor>
          <div v-show="showTip" class="tip">
            <span>{{ t('由于性能原因，只能展示40kb数据') }}</span>
            <span v-show="!couldShowAllJsonStr" class="white cursor-pointer ml-3"
              @click="couldShowAllJsonStr = !couldShowAllJsonStr">{{ t('显示全部') }}</span>
            <span v-show="couldShowAllJsonStr" class="white cursor-pointer ml-3"
              @click="couldShowAllJsonStr = !couldShowAllJsonStr">{{ t('显示部分') }}</span>
          </div>
        </div>
      </div>
    </template>

    <div v-show="showProcess" class="d-flex j-center w-100 gray-600">
      <span>{{ t("总大小") }}：{{ formatBytes(loadingProcess.total) }}</span>
      <el-divider direction="vertical"></el-divider>
      <span>{{ t("已传输") }}：{{ formatBytes(loadingProcess.transferred) }}</span>
      <el-divider direction="vertical"></el-divider>
      <span>{{ t("进度") }}：{{ (loadingProcess.percent * 100).toFixed(2) + "%" }}</span>
    </div>
    <div 
      v-if="responseInfo.responseData.canApiflowParseType === 'cachedBodyIsTooLarge'" 
      class="d-flex a-center j-center red"
    >
      返回值大于{{ formatBytes(config.requestConfig.maxStoreSingleBodySize) }}，返回body值缓存失效。
      需重新请求最新数据
    </div>
    <div v-if="responseInfo.responseData.canApiflowParseType === 'error'" class="red">{{ responseInfo.responseData.errorData }}</div>
  </div>
</template>

<script lang="ts" setup>
import { useApidocBaseInfo } from '@/store/apidoc/base-info';
import { useApidocResponse } from '@/store/apidoc/response';
import { computed, ref } from 'vue';
import { t } from 'i18next'
import { formatBytes } from '@/helper/index'
import SRawEditor from '@/components/apidoc/raw-editor/g-raw-editor.vue'
import { config } from '@/../config/config'



const couldShowAllJsonStr = ref(false);
const apidocResponseStore = useApidocResponse();
const apidocBaseInfoStore = useApidocBaseInfo();
const responseInfo = computed(() => apidocResponseStore.responseInfo);
const loadingProcess = computed(() => apidocResponseStore.loadingProcess);
const requestState = computed(() => apidocResponseStore.requestState);

/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
//是否展示加载进度
const showProcess = computed(() => {
  const { canApiflowParseType } = apidocResponseStore.responseInfo.responseData;
  if (canApiflowParseType === 'none' && (requestState.value === 'sending' || requestState.value === 'response')) {
    return true;
  }
  const isError = canApiflowParseType === 'error';
  const isText = canApiflowParseType === 'text';
  const isHtml = canApiflowParseType === 'html';
  const isCes = canApiflowParseType === 'css';
  const isJs = canApiflowParseType === 'js';
  const isXml = canApiflowParseType === 'xml';
  const isUnknow = canApiflowParseType === 'unknown';
  const isTooLargeBody = canApiflowParseType === 'cachedBodyIsTooLarge';
  return !isError && !isText && !isUnknow && !isHtml && !isCes && !isJs && !isXml && !isTooLargeBody;
})
//布局
const layout = computed(() => {
  return apidocBaseInfoStore.layout;
});
//json返回参数
const jsonResponse = computed(() => {
  const { jsonData } = apidocResponseStore.responseInfo.responseData;
  const formatCode = window?.js_beautify(jsonData, { indent_size: 4 });
  if (couldShowAllJsonStr.value) {
    return formatCode;
  }
  if (formatCode.length > 1024 * 40) {
    return formatCode.slice(0, 1024 * 40);
  }
  try {
    return JSON.stringify(JSON.parse(formatCode), null, 4)
  } catch {
    return ''
  }
});
//json数据过大是否显示提示
const showTip = computed(() => {
  const { jsonData } = apidocResponseStore.responseInfo.responseData;
  const formatCode = window?.js_beautify(jsonData, { indent_size: 4 });
  return formatCode.length > 1024 * 40
});
//HTML返回参数
const htmlResponse = computed(() => {
  const { textData } = apidocResponseStore.responseInfo.responseData;
  return window?.js_beautify.html(textData, { indent_size: 4 });
});
//HTML返回时预览
// const htmlPreview = computed(() => {
//   const data = apidocResponseStore.data.text;
//   const blob = new Blob([data], {
//     type: 'text/html'
//   });
//   const url = URL.createObjectURL(blob);
//   return url;
// });
//纯文本返回参数
const textResponse = computed(() => {
  const { textData } = apidocResponseStore.responseInfo.responseData;
  return textData;
});

//美化html文件
// const beautifyHtml = (str: string) => {
//   return str;
// };
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

</script>

<style lang='scss' scoped>
.body-view {
  width: 100%;
  height: calc(100vh - #{size(370)});
  overflow-y: auto;
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

  .res-icon {
    width: size(200);
    height: size(200);
  }
}
</style>
