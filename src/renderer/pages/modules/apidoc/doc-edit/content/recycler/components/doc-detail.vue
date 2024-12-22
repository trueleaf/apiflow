<template>
  <SLoading :loading="loading" class="doc-detail">
    <el-icon :size="18" class="close" @click="handleClose">
      <Close />
    </el-icon>
    <div class="params-view">
      <SFieldset v-if="apidocInfo?.item.url" :title="t('基本信息')">
        <SLableValue label="请求方式：" class="w-50">
          <template v-for="(req) in validRequestMethods">
            <span v-if="apidocInfo?.item.method.toLowerCase() === req.value.toLowerCase()" :key="req.name" class="label"
              :style="{ color: req.iconColor }">{{ req.name.toUpperCase() }}</span>
          </template>
        </SLableValue>
        <SLableValue label="请求地址：" class="w-50 mt-2">
          <span class="text-ellipsis">{{ apidocInfo?.item.url.path }}</span>
        </SLableValue>
        <SLableValue label="接口名称：" class="w-50">
          <div>{{ apidocInfo?.info.name }}</div>
        </SLableValue>
        <div v-if="apidocInfo" class="base-info">
          <SLableValue label="维护人员：" :title="apidocInfo.info.maintainer || apidocInfo.info.creator" label-width="auto"
            class="w-50">
            <span class="text-ellipsis">{{ apidocInfo.info.maintainer || apidocInfo.info.creator }}</span>
          </SLableValue>
          <SLableValue label="创建人员：" :title="apidocInfo.info.maintainer || apidocInfo.info.creator" label-width="auto"
            class="w-50">
            <span class="text-ellipsis">{{ apidocInfo.info.maintainer || apidocInfo.info.creator }}</span>
          </SLableValue>
          <SLableValue label="更新日期：" :title="formatDate(apidocInfo.updatedAt)" label-width="auto" class="w-50">
            <span class="text-ellipsis">{{ formatDate(apidocInfo.updatedAt) }}</span>
          </SLableValue>
          <SLableValue label="创建日期：" :title="formatDate(apidocInfo.createdAt)" label-width="auto" class="w-50">
            <span class="text-ellipsis">{{ formatDate(apidocInfo.createdAt) }}</span>
          </SLableValue>
        </div>
      </SFieldset>
      <SFieldset v-if="!apidocInfo?.isFolder" :title="t('请求参数')" class="mb-5">
        <template v-if="hasQueryParams">
          <div class="title">{{ t("Query参数") }}</div>
          <SParamsView :data="apidocInfo?.item.queryParams" plain class="mb-3"></SParamsView>
        </template>
        <template v-if="hasPathsParams">
          <div class="title">{{ t("Path参数") }}</div>
          <SParamsView :data="apidocInfo?.item.paths" plain class="mb-3"></SParamsView>
        </template>
        <template v-if="hasJsonBodyParams">
          <div class="title">{{ t("Body参数") }}(application/json)</div>
          <SJsonEditor :value="apidocInfo?.item.requestBody.rawJson" read-only></SJsonEditor>
        </template>
        <template v-if="hasFormDataParams">
          <div class="title">{{ t("Body参数") }}(multipart/formdata)</div>
          <SParamsView :data="apidocInfo?.item.requestBody.formdata" plain></SParamsView>
        </template>
        <template v-if="hasUrlEncodedParams">
          <div class="title">{{ t("Body参数") }}(x-www-form-urlencoded)</div>
          <SParamsView :data="apidocInfo?.item.requestBody.urlencoded" plain></SParamsView>
        </template>
        <template v-if="hasRawParams">
          <div class="title">{{ t("Body参数") }}({{ apidocInfo?.item.requestBody.raw.dataType }})</div>
          <pre class="pre">{{ apidocInfo?.item.requestBody.raw.data }}</pre>
        </template>
        <div
          v-if="!hasQueryParams && !hasPathsParams && !hasJsonBodyParams && !hasFormDataParams && !hasUrlEncodedParams && !hasRawParams">
          {{ t("暂无数据") }}</div>
      </SFieldset>
      <SFieldset v-if="!apidocInfo?.isFolder" :title="t('返回参数')">
        <div v-for="(item, index) in apidocInfo?.item.responseParams" :key="index" class="title">
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
          <SRawEditor v-if="item.value.dataType === 'application/json'" :data="item.value.strJson" readonly></SRawEditor>
          <div
            v-if="item.value.dataType === 'application/xml' || item.value.dataType === 'text/plain' || item.value.dataType === 'text/html'"
            class="h-150px">
            <SRawEditor :data="item.value.strJson" :type="item.value.dataType" readonly></SRawEditor>
          </div>
        </div>
      </SFieldset>
      <SFieldset v-if="!apidocInfo?.isFolder" :title="t('请求头')">
        <template v-if="hasHeaders">
          <SParamsView :data="apidocInfo?.item.headers" plain class="mb-3"></SParamsView>
        </template>
        <div v-else>{{ t("暂无数据") }}</div>
      </SFieldset>
    </div>
  </SLoading>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted, computed } from 'vue'
import { Close } from '@element-plus/icons-vue'
import { ApidocDetail, Response } from '@src/types/global';
import { router } from '@/router/index'
import { request } from '@/api/api'
import { t } from 'i18next'
import SLoading from '@/components/common/loading/g-loading.vue'
import SLableValue from '@/components/common/label-value/g-label-value.vue'
import SFieldset from '@/components/common/fieldset/g-fieldset.vue'
import SParamsView from '@/components/apidoc/params-view/g-params-view.vue'
import SRawEditor from '@/components/apidoc/raw-editor/g-raw-editor.vue'
import SJsonEditor from '@/components/common/json-editor/g-json-editor.vue'
import { formatDate } from '@/helper'
import { useApidocBaseInfo } from '@/store/apidoc/base-info';

const emits = defineEmits(['close'])
const props = defineProps({
  id: {
    type: String,
    default: ''
  },
});

const apidocBaseInfoStore = useApidocBaseInfo()
/*
|--------------------------------------------------------------------------
| 获取文档详情
|--------------------------------------------------------------------------
*/
const docDetail: Ref<ApidocDetail | null> = ref(null); //文档详情
const projectId = router.currentRoute.value.query.id as string;
const loading = ref(false); //数据加载
//获取文档详情
const getDocDetail = () => {
  loading.value = true;
  const params = {
    _id: props.id,
    projectId,
  };
  request.get<Response<ApidocDetail>, Response<ApidocDetail>>('/api/project/doc_detail', { params }).then((res) => {
    docDetail.value = res.data
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    loading.value = false;
  });
}
onMounted(() => {
  getDocDetail();
})
/*
|--------------------------------------------------------------------------
| 参数是否存在判断
|--------------------------------------------------------------------------
*/
const apidocInfo = computed(() => docDetail.value);
//是否存在查询参数
const hasQueryParams = computed(() => {
  if (!docDetail.value) {
    return false;
  }
  const { queryParams } = docDetail.value.item;
  return queryParams.filter(p => p.select).some((data) => data.key);
})
//是否存在path参数
const hasPathsParams = computed(() => {
  if (!docDetail.value) {
    return false;
  }
  const { paths } = docDetail.value.item;
  return paths.some((data) => data.key);
})
//是否存在body参数
const hasJsonBodyParams = computed(() => {
  if (!docDetail.value) {
    return false;
  }
  const { contentType } = docDetail.value.item;
  const { mode } = docDetail.value.item.requestBody;
  return contentType === 'application/json' && mode === 'json';
})
//是否存在formData参数
const hasFormDataParams = computed(() => {
  if (!docDetail.value) {
    return false;
  }
  const { contentType } = docDetail.value.item;
  return contentType === 'multipart/form-data';
})
//是否存在formData参数
const hasUrlEncodedParams = computed(() => {
  if (!docDetail.value) {
    return false;
  }
  const { contentType } = docDetail.value.item;
  return contentType === 'application/x-www-form-urlencoded';
})
//raw类型返回参数
const hasRawParams = computed(() => {
  if (!docDetail.value) {
    return false;
  }
  const { mode, raw } = docDetail.value.item.requestBody;
  return mode === 'raw' && raw.data;
})
//是否存在headers
const hasHeaders = computed(() => {
  if (!docDetail.value) {
    return false;
  }
  const { headers } = docDetail.value.item;
  return headers.filter(p => p.select).some((data) => data.key);
})
const validRequestMethods = computed(() => apidocBaseInfoStore.rules.requestMethods)

/*
|--------------------------------------------------------------------------
| 其他操作
|--------------------------------------------------------------------------
*/

//关闭弹窗
const handleClose = () => {
  emits('close');
}

</script>

<style lang='scss' scoped>
.doc-detail {
  width: size(800);
  overflow: hidden;
  position: relative;

  .params-view {
    max-height: 65vh;
    overflow-y: auto;
    padding: 0 size(10);
    margin-top: size(30);

    .copy-json {
      cursor: pointer;

      &:hover {
        color: lighten($gray-300, 20%);
      }
    }
  }

  .close {
    @include rt-close;
    font-size: fz(22);
  }
}
</style>
