
<template>
  <div class="body-view" :class="{ vertical: layout === 'vertical' }">
    <template v-if="remoteResponseData.type">
      <!-- 图片类型 -->
      <el-image
        v-if="remoteResponseData.type.includes('image/')"
        class="img-view"
        :src="remoteResponseData.file.url"
        :preview-src-list="[remoteResponseData.file.url]"
        fit="scale-down"
      >
      </el-image>
      <!-- 音频类型 -->
      <!-- 视频类型 -->
      <!-- 强制下载类型 -->
      <div v-else-if="remoteResponseData.type.includes('application/octet-stream')" class="d-flex flex-column a-center">
        <svg class="svg-icon" aria-hidden="true" :title="t('下载文件')">
          <use xlink:href="#iconicon_weizhiwenjian"></use>
        </svg>
        <div>{{ remoteResponseData.type }}</div>
        <el-button link type="primary" text @click="handleDownload">{{ t("下载文件") }}</el-button>
      </div>
      <div v-else-if="remoteResponseData.type.includes('application/force-download')" class="d-flex flex-column j-center">
        <svg class="svg-icon" aria-hidden="true" :title="t('下载文件')">
          <use xlink:href="#iconicon_weizhiwenjian"></use>
        </svg>
        <div>{{ remoteResponseData.type }}</div>
        <el-button link type="primary" text @click="handleDownload">{{ t("下载文件") }}</el-button>
      </div>
      <!-- excel -->
      <div v-else-if="remoteResponseData.type.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') || remoteResponseData.type.includes('application/vnd.ms-excel')" class="d-flex flex-column j-center">
        <svg class="svg-icon" aria-hidden="true" :title="t('下载文件')">
          <use xlink:href="#iconexcel"></use>
        </svg>
        <div>{{ remoteResponseData.type }}</div>
        <el-button link type="primary" text @click="handleDownload">{{ t("下载文件") }}</el-button>
      </div>
      <!-- word -->
      <div v-else-if="remoteResponseData.type.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || remoteResponseData.type.includes('application/msword')" class="d-flex flex-column j-center">
        <svg class="svg-icon" aria-hidden="true" :title="t('下载文件')">
          <use xlink:href="#iconWORD"></use>
        </svg>
        <div>{{ remoteResponseData.type }}</div>
        <el-button link type="primary" text @click="handleDownload">{{ t("下载文件") }}</el-button>
      </div>
      <!-- pdf -->
      <iframe v-else-if="remoteResponseData.type.includes('application/pdf')" :src="remoteResponseData.file.url" class="pdf-view"></iframe>
      <!-- xml -->
      <pre v-else-if="remoteResponseData.type.includes('application/xml')">{{ remoteResponseData.text }}</pre>
      <!-- javascript -->
      <pre v-else-if="remoteResponseData.type.includes('application/javascript')">{{ remoteResponseData.text }}</pre>
      <!-- 请求错误 -->
      <div v-else-if="remoteResponseData.type.includes('error')" class="red">{{ remoteResponseData.text }}</div>
      <!-- html -->
      <div v-else-if="remoteResponseData.type.includes('text/html')" class="text-wrap">
        <SRawEditor :model-value="htmlResponse" readonly type="text/plain"></SRawEditor>
      </div>
      <!-- 纯文本 -->
      <div v-else-if="remoteResponseData.type.includes('text/plain')" class="text-wrap">
        <SRawEditor
          :model-value="textResponse"
          readonly
          type="text/plain"
        >
        </SRawEditor>
      </div>
      <!-- 未知文件 -->
      <div v-else-if="!remoteResponseData.type.includes('application/json')">
        <svg class="svg-icon" aria-hidden="true" :title="t('下载文件')">
          <use xlink:href="#iconicon_weizhiwenjian"></use>
        </svg>
        <div>{{ remoteResponseData.type }}</div>
        <el-button link type="primary" text @click="handleDownload">{{ t("下载文件") }}</el-button>
      </div>
      <!-- json -->
      <div v-show="remoteResponseData.type.includes('application/json')">
        <div class="json-wrap">
          <SRawEditor :model-value="jsonResponse" readonly type="application/json"></SRawEditor>
          <div v-show="showTip" class="tip">
            <span>{{ t('由于性能原因，只能展示40kb数据') }}</span>
            <span v-show="!couldShowAllJsonStr" class="white cursor-pointer ml-3" @click="couldShowAllJsonStr = !couldShowAllJsonStr">{{ t('显示全部') }}</span>
            <span v-show="couldShowAllJsonStr" class="white cursor-pointer ml-3" @click="couldShowAllJsonStr = !couldShowAllJsonStr">{{ t('显示部分') }}</span>
          </div>
        </div>
      </div>
    </template>
    <div v-show="showProcess" class="d-flex j-center w-100">
      <span>{{ t("总大小") }}：{{ formatBytes(process.total) }}</span>
      <el-divider direction="vertical"></el-divider>
      <span>{{ t("已传输") }}：{{ formatBytes(process.transferred) }}</span>
      <el-divider direction="vertical"></el-divider>
      <span>{{ t("进度") }}：{{ (process.percent * 100 ).toFixed(2) + "%" }}</span>
    </div>
    <!-- <div v-show="remoteResponseData.data.type.includes('application/json')" class="apply-response">应用为响应值</div> -->
  </div>
</template>

<script lang="ts" setup>
import { useApidocBaseInfo } from '@/store/apidoc/base-info';
import { useApidocResponse } from '@/store/apidoc/response';
import { computed, ref } from 'vue';
import { t } from 'i18next'
import { formatBytes } from '@/helper/index'
import SRawEditor from '@/components/apidoc/raw-editor/g-raw-editor.vue'


const couldShowAllJsonStr = ref(false);
const apidocResponseStore = useApidocResponse();
const apidocBaseInfoStore = useApidocBaseInfo();
const remoteResponseData = computed(() => apidocResponseStore.data);
const process = computed(() => apidocResponseStore.process);
const showProcess = computed(() => { //是否展示数据加载进度
  const dataType = apidocResponseStore.data.type;
  if (!dataType) { //没有返回类型，不显示进度
    return false;
  }
  const isError = dataType.includes('error');
  const isText = dataType.includes('text');
  const isJson = dataType.includes('application/json');
  // const isPdf = dataType.includes("application/pdf");
  const isXml = dataType.includes('application/xml');
  const isJavascript = dataType.includes('application/javascript');
  return !isError && !isText && !isJson && !isXml && !isJavascript;
});
//布局
const layout = computed(() => {
  return apidocBaseInfoStore.layout;
});
//json返回参数
const jsonResponse = computed(() => {
  const data = apidocResponseStore.data.text;
  const formatCode = window?.js_beautify(data, { indent_size: 4 });
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
  const data = apidocResponseStore.data.text;
  const formatCode = window?.js_beautify(data, { indent_size: 4 });
  return formatCode.length > 1024 * 40
});
//HTML返回参数
const htmlResponse = computed(() => {
  const data = apidocResponseStore.data.text;
  return window?.js_beautify.html(data, { indent_size: 4 });
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
  const data = apidocResponseStore.data.text;
  return data;
});
/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
//美化html文件
// const beautifyHtml = (str: string) => {
//   return str;
// };
//下载文件
const handleDownload = () => {
  const fileInfo = apidocResponseStore.data.file
  const downloadElement = document.createElement('a');
  downloadElement.href = fileInfo.url;
  downloadElement.download = fileInfo.name || t('未命名'); //下载后文件名
  document.body.appendChild(downloadElement);
  downloadElement.click(); //点击下载
  document.body.removeChild(downloadElement); //下载完成移除元素
  window.URL.revokeObjectURL(fileInfo.url); //释放掉blob对象
}

</script>

<style  scoped>
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
    .img-view {
        width: size(200);
        height: size(200);
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
