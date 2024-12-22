/*
    创建者：shuxiaokai
    创建时间：2021-09-03 20:45
    模块名称：返回body
    备注：
*/
<template>
  <SLoading :loading="loading" class="body-view" :class="{ vertical: layout === 'vertical' }">
    <template v-if="remoteResponse.data.type">
      <!-- 图片类型 -->
      <el-image
        v-if="remoteResponse.data.type.includes('image/')"
        class="img-view"
        :src="remoteResponse.data.file.url"
        :preview-src-list="[remoteResponse.data.file.url]"
        fit="scale-down"
      >
      </el-image>
      <!-- 音频类型 -->
      <!-- 视频类型 -->
      <!-- 强制下载类型 -->
      <div v-else-if="remoteResponse.data.type.includes('application/octet-stream')">
        <i class="iconicon_weizhiwenjian"></i>
        <s-download :url="remoteResponse.data.file.url" static>
          <span class="cursor-pointer theme-color">{{ t("下载") }}</span>
        </s-download>
      </div>
      <div v-else-if="remoteResponse.data.type.includes('application/force-download')">
        <i class="iconicon_weizhiwenjian"></i>
        <s-download :url="remoteResponse.data.file.url" static>
          <span class="cursor-pointer theme-color">{{ t("下载") }}</span>
        </s-download>
      </div>
      <!-- excel -->
      <div v-else-if="remoteResponse.data.type.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') || remoteResponse.data.type.includes('application/vnd.ms-excel')">
        <svg class="res-icon" aria-hidden="true" title="Excel">
          <use xlink:href="#iconexcel"></use>
        </svg>
        <s-download :url="remoteResponse.data.file.url" static>
          <span class="cursor-pointer theme-color">{{ t("下载") }}</span>
        </s-download>
      </div>
      <!-- word -->
      <div v-else-if="remoteResponse.data.type.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || remoteResponse.data.type.includes('application/msword')">
        <svg class="res-icon" aria-hidden="true" title="Excel">
          <use xlink:href="#iconWORD"></use>
        </svg>
        <s-download :url="remoteResponse.data.file.url" static>
          <span class="cursor-pointer theme-color">{{ t("下载") }}</span>
        </s-download>
      </div>
      <!-- pdf -->
      <iframe v-else-if="remoteResponse.data.type.includes('application/pdf')" :src="remoteResponse.data.file.url" class="pdf-view"></iframe>
      <!-- xml -->
      <pre v-else-if="remoteResponse.data.type.includes('application/xml')" class="pre">{{ remoteResponse.data.text }}</pre>
      <!-- javascript -->
      <pre v-else-if="remoteResponse.data.type.includes('application/javascript')" class="pre">{{ remoteResponse.data.text }}</pre>
      <!-- 请求错误 -->
      <div v-else-if="remoteResponse.data.type.includes('error')">{{ remoteResponse.data.text }}</div>
    </template>
    <div v-show="remoteResponse?.data?.type?.includes('text/html')" class="text-wrap">
      <s-raw-editor
        :model-value="htmlResponse"
        readonly
        type="text/html"
      >
      </s-raw-editor>
    </div>
    <div v-show="remoteResponse?.data?.type?.includes('text/plain')" class="text-wrap">
      <s-raw-editor
        :model-value="textResponse"
        readonly
        type="text/plain"
      >
      </s-raw-editor>
    </div>
    <div v-show="remoteResponse?.data?.type?.includes('application/json')" class="text-wrap">
      <s-raw-editor
        :model-value="jsonResponse"
        readonly
        type="application/json"
      >
      </s-raw-editor>
    </div>
  </SLoading>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import beautify from 'js-beautify'

export default defineComponent({
  data() {
    return {
    };
  },
  computed: {
    //远端返回数据结果
    remoteResponse() {
      return this.$store.state['apidoc/response']
    },
    //发送请求状态
    loading() {
      return this.$store.state['apidoc/response'].loading;
    },
    //布局
    layout() {
      return this.$store.state['apidoc/baseInfo'].layout;
    },
    //json返回参数
    jsonResponse() {
      const data = this.$store.state['apidoc/response'].data.text
      return beautify(data, { indent_size: 4 });
    },
    //HTML返回参数
    htmlResponse() {
      const data = this.$store.state['apidoc/response'].data.text;
      return beautify.html(data, { indent_size: 4 });
    },
    //纯文本返回参数
    textResponse() {
      const data = this.$store.state['apidoc/response'].data.text;
      return data;
    },
    //返回值类型
    responseApplyEnum() {
      return this.$store.state['apidoc/apidoc'].apidoc.item.responseParams.map((v, index) => ({
        index,
        title: v.title,
        contentType: v.value.dataType
      }));
    },
  },
  methods: {
    //美化html文件
    beautifyHtml(str: string) {
      return str;
    },
  },
})
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
    .apply-response {
        position: absolute;
        cursor: pointer;
        right: size(15);
        top: size(10);
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
