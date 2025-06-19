<template>
  <div class="params-view px-3">
    <div class="api-name">{{ apidoc.info.name }}</div>
    <div class="d-flex a-center mb-5 mt-4">
      <template v-for="(req) in requestMethods">
        <span v-if="apidoc.item.method.toLowerCase() === req.value.toLowerCase()" :key="req.value" class="method mr-2"
          :style="{ color: req.iconColor }">
          {{ apidoc.item.method }}
        </span>
      </template>
      <div class="url">{{ fullUrl }}</div>
    </div>
    <div class="view-block">{{ t('请求参数') }}</div>
    <template v-if="hasQueryParams">
      <div class="title">{{ t("Query参数") }}</div>
      <s-params-view :data="apidoc.item.queryParams" plain class="mb-3"></s-params-view>
    </template>
    <template v-if="hasPathsParams">
      <div class="title">{{ t("Path参数") }}</div>
      <s-params-view :data="apidoc.item.paths" plain class="mb-3"></s-params-view>
    </template>
    <template v-if="hasJsonBodyParams">
      <div class="title">{{ t("Body参数") }}(application/json)</div>
      <pre v-if="apidoc.item.requestBody.rawJson">{{ apidoc.item.requestBody.rawJson }}</pre>
      <s-params-view v-else :data="apidoc.item.requestBody.rawJson"></s-params-view>
    </template>
    <template v-if="hasFormDataParams">
      <div class="title">{{ t("Body参数") }}(multipart/formdata)</div>
      <s-params-view :data="apidoc.item.requestBody.formdata" plain></s-params-view>
    </template>
    <template v-if="hasUrlEncodedParams">
      <div class="title">{{ t("Body参数") }}(x-www-form-urlencoded)</div>
      <s-params-view :data="apidoc.item.requestBody.urlencoded" plain></s-params-view>
    </template>
    <template v-if="hasRawParams">
      <div class="title">{{ t("Body参数") }}({{ apidoc.item.requestBody.raw.dataType }})</div>
      <pre>{{ apidoc.item.requestBody.raw.data }}</pre>
    </template>
    <div
      v-if="!hasQueryParams && !hasPathsParams && !hasJsonBodyParams && !hasFormDataParams && !hasUrlEncodedParams && !hasRawParams"
      class="ml-2 gray-500">{{ t("暂无数据") }}</div>
    <div class="view-block mt-5">{{ t('返回参数') }}</div>
    <div v-for="(item, index) in apidoc.item.responseParams" :key="index" class="title">
      <div class="mb-2">
        <span>{{ t("名称") }}：</span>
        <span>{{ item.title }}</span>
        <el-divider direction="vertical"></el-divider>
        <span>{{ t("状态码") }}：</span>
        <span v-if="item.statusCode >= 100 && item.statusCode < 200" class="green">{{ item.statusCode }}</span>
        <span v-else-if="item.statusCode >= 200 && item.statusCode < 300" class="green">{{ item.statusCode }}</span>
        <span v-else-if="item.statusCode >= 300 && item.statusCode < 400" class="orange">{{ item.statusCode }}</span>
        <span v-else-if="item.statusCode >= 400 && item.statusCode < 500" class="red">{{ item.statusCode }}</span>
        <span v-else class="red">{{ item.statusCode }}</span>
        <el-divider direction="vertical"></el-divider>
        <span>{{ t("返回格式") }}：</span>
        <span>{{ item.value.dataType }}</span>
      </div>
      <pre
        v-if="item.value.dataType === 'application/json' && item.value.strJson.length > 0">{{ item.value.strJson }}</pre>
      <div v-if="item.value.dataType === 'application/json' && !item.value.strJson.length" class="ml-2 gray-500">{{
        t('暂无数据') }}</div>
      <div
        v-if="item.value.dataType === 'application/xml' || item.value.dataType === 'text/plain' || item.value.dataType === 'text/html'">
        <pre v-if="item.value.text">{{ item.value.text }}</pre>
        <div v-else class="ml-2 gray-500">{{ t('暂无数据') }}</div>
      </div>
    </div>
    <div class="view-block mt-5">请求头</div>
    <template v-if="hasHeaders">
      <s-params-view :data="apidoc.item.headers" plain class="mb-3"></s-params-view>
    </template>
    <div v-else class="ml-2 gray-500">{{ t("暂无数据") }}</div>
    <SFieldset :title="t('备注')">
      <div v-if="apidoc.info.description" class="remark">{{ apidoc.info.description }}</div>
      <div v-else class="ml-2 gray-500">{{ t("暂无数据") }}</div>
    </SFieldset>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { t } from 'i18next'
import { useApidocBaseInfo } from '@/store/apidoc/base-info';
import { useApidoc } from '@/store/apidoc/apidoc';

const apidocBaseInfoStore = useApidocBaseInfo()
const apidocStore = useApidoc()
const requestMethods = computed(() => {
  return apidocBaseInfoStore.rules.requestMethods
})
const apidoc = computed(() => {
  return apidocStore.apidoc
})
const fullUrl = computed(() => {
  const { paths } = apidocStore.apidoc.item
  const { host, path: requestPath } = apidocStore.apidoc.item.url;
  const { queryParams } = apidocStore.apidoc.item;
  let queryString = '';
  queryParams.forEach((v) => {
    if (v.key && v.select) {
      queryString += `${v.key}=${v.value}&`
    }
  })
  queryString = queryString.replace(/&$/, '');
  if (queryString) {
    queryString = `?${queryString}`;
  }
  const pathMap: Record<string, string> = {};
  paths.forEach((v) => {
    if (v.key) {
      pathMap[v.key] = v.value;
    }
  })
  const validPath = requestPath.replace(/\{([^\\}]+)\}/g, (_, $2) => pathMap[$2] || $2)
  return host + validPath + queryString
})
const hasQueryParams = computed(() => {
  const { queryParams } = apidocStore.apidoc.item;
  return queryParams.filter(p => p.select).some((data) => data.key);
})
const hasPathsParams = computed(() => {
  const { paths } = apidocStore.apidoc.item;
  return paths.some((data) => data.key);
})
const hasJsonBodyParams = computed(() => {
  const { contentType } = apidocStore.apidoc.item;
  const { mode } = apidocStore.apidoc.item.requestBody;
  return contentType === 'application/json' && mode === 'json';
})
const hasFormDataParams = computed(() => {
  const { contentType } = apidocStore.apidoc.item;
  return contentType === 'multipart/form-data';
})
const hasUrlEncodedParams = computed(() => {
  const { contentType } = apidocStore.apidoc.item;
  return contentType === 'application/x-www-form-urlencoded';
})
const hasRawParams = computed(() => {
  const { mode, raw } = apidocStore.apidoc.item.requestBody;
  return mode === 'raw' && raw.data;
})
const hasHeaders = computed(() => {
  const { headers } = apidocStore.apidoc.item;
  return headers.filter(p => p.select).some((data) => data.key);
})

</script>

<style lang='scss' scoped>
.params-view {
  width: 100%;

  .api-name {
    font-size: fz(24);
    font-weight: bold;
    margin-top: size(15);
  }

  .method {
    font-size: fz(20);
  }

  .url {
    font-size: fz(16);
  }

  .view-block {
    font-size: fz(18);
    font-weight: bold;
    color: $gray-700;
  }

  .title {
    font-size: fz(14);
    color: $gray-600;
    padding: size(5) 0;
  }

  .remark {
    white-space: pre;
  }
}
</style>
