/*
    创建者：shuxiaokai
    创建时间：2021-09-10 22:44
    模块名称：预览界面
    备注：
*/
<template>
  <div class="params-view px-3">
    <SFieldset :title="t('请求参数')" class="mb-5">
      <template v-if="hasQueryParams">
        <div class="title">{{ t("Query参数") }}</div>
        <s-params-view :data="apidocInfo.queryParams" plain class="mb-3"></s-params-view>
      </template>
      <template v-if="hasPathsParams">
        <div class="title">{{ t("Path参数") }}</div>
        <s-params-view :data="apidocInfo.paths" plain class="mb-3"></s-params-view>
      </template>
      <template v-if="hasJsonBodyParams">
        <div class="title">{{ t("Body参数") }}(application/json)</div>
        <s-json-editor :value="apidocInfo.requestBody.rawJson" read-only></s-json-editor>
      </template>
      <template v-if="hasFormDataParams">
        <div class="title">{{ t("Body参数") }}(multipart/formdata)</div>
        <s-params-view :data="apidocInfo.requestBody.formdata" plain></s-params-view>
      </template>
      <template v-if="hasUrlEncodedParams">
        <div class="title">{{ t("Body参数") }}(x-www-form-urlencoded)</div>
        <s-params-view :data="apidocInfo.requestBody.urlencoded" plain></s-params-view>
      </template>
      <template v-if="hasRawParams">
        <div class="title">{{ t("Body参数") }}({{ apidocInfo.requestBody.raw.dataType }})</div>
        <pre class="pre">{{ apidocInfo.requestBody.raw.data }}</pre>
      </template>
      <div v-if="!hasQueryParams && !hasPathsParams && !hasJsonBodyParams && !hasFormDataParams && !hasUrlEncodedParams && !hasRawParams">{{ t("暂无数据") }}</div>
    </SFieldset>
    <SFieldset :title="t('返回参数')">
      <div v-for="(item, index) in apidocInfo.responseParams" :key="index" class="title">
        <div class="mb-2">
          <span>{{ t("名称") }}：</span>
          <span>{{ item.title }}</span>
          <el-divider direction="vertical"></el-divider>
          <span>{{ t("状态码") }}：</span>
          <span>{{ item.statusCode }}</span>
          <el-divider direction="vertical"></el-divider>
          <span>{{ t("返回格式") }}：</span>
          <span>{{ item.value.dataType }}</span>
        </div>
        <s-params-view v-if="item.value.dataType === 'application/json'" :data="item.value.strJson"></s-params-view>
        <div v-if="item.value.dataType === 'application/xml' || item.value.dataType === 'text/plain' || item.value.dataType === 'text/html'" class="h-150px">
          <s-raw-editor :data="item.value.strJson" :type="item.value.dataType" readonly></s-raw-editor>
        </div>
      </div>
    </SFieldset>
    <SFieldset :title="t('请求头')"></SFieldset>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
    };
  },
  computed: {
    apidocInfo() {
      return this.$store.state['apidoc/apidoc'].apidoc.item
    },
    //是否存在查询参数
    hasQueryParams() {
      const { queryParams } = this.$store.state['apidoc/apidoc'].apidoc.item;
      const hasQueryParams = queryParams.filter(p => p.select).some((data) => data.key);
      return hasQueryParams;
    },
    //是否存在path参数
    hasPathsParams() {
      const { paths } = this.$store.state['apidoc/apidoc'].apidoc.item;
      const hasPathsParams = paths.some((data) => data.key);
      return hasPathsParams;
    },
    //是否存在body参数
    hasJsonBodyParams() {
      const { contentType } = this.$store.state['apidoc/apidoc'].apidoc.item;
      const { mode } = this.$store.state['apidoc/apidoc'].apidoc.item.requestBody;
      return contentType === 'application/json' && mode === 'json';
    },
    //是否存在formData参数
    hasFormDataParams() {
      const { contentType } = this.$store.state['apidoc/apidoc'].apidoc.item;
      return contentType === 'multipart/form-data';
    },
    //是否存在formData参数
    hasUrlEncodedParams() {
      const { contentType } = this.$store.state['apidoc/apidoc'].apidoc.item;
      return contentType === 'application/x-www-form-urlencoded';
    },
    //raw类型返回参数
    hasRawParams() {
      const { mode, raw } = this.$store.state['apidoc/apidoc'].apidoc.item.requestBody;
      return mode === 'raw' && raw.data;
    },
    //返回参数个数
    // responseNum() {
    //     const { responseParams } = this.$store.state["apidoc/apidoc"].apidoc.item;
    //     let resNum = 0;
    //     responseParams.forEach(response => {
    //         const resValue = response.value;
    //         const { dataType } = resValue;
    //         if (dataType === "application/json") {
    //             const converJsonData = apidocConvertParamsToJsonData(resValue.json);
    //             const hasJsonData = converJsonData && Object.keys(converJsonData).length > 0
    //             if (hasJsonData) {
    //                 resNum ++;
    //             }
    //         } else if (dataType === "text/javascript" || dataType === "text/plain" || dataType === "text/html" || dataType === "application/xml") {
    //             if (resValue.text.length > 0) {
    //                 resNum ++;
    //             }
    //         } else {
    //             console.warn(`未实现的返回类型${dataType}`);
    //         }
    //     });
    //     return resNum;
    // },
    //是否存在headers
    hasHeaders() {
      const { headers } = this.$store.state['apidoc/apidoc'].apidoc.item;
      const hasHeaders = headers.filter(p => p.select).some((data) => data.key);
      return hasHeaders;
    },
  },
  methods: {
  },
})
</script>

<style lang='scss' scoped>
.params-view {
    .title {
        margin-bottom: size(10);
        font-size: fz(15);
    }
}
</style>
