<template>
  <div :class="['share-doc-detail', layout]">
    <SLoading :loading="loading" class="doc-detail">
      <div v-if="apidocInfo" class="params-view">
        <SFieldset v-if="apidocInfo.item.url" :title="t('基本信息')">
          <SLableValue v-if="!apidocInfo.isFolder" label="请求方式：" class="w-50">
            <template v-for="(req) in requestMethods">
              <span v-if="apidocInfo.item.method.toLowerCase() === req.value.toLowerCase()" :key="req.name" class="label"
                :style="{ color: req.iconColor }">{{ req.name.toUpperCase() }}</span>
            </template>
          </SLableValue>
          <SLableValue v-if="!apidocInfo.isFolder" label="接口名称：" class="w-50">
            <div>{{ apidocInfo.info.name }}</div>
          </SLableValue>
          <SLableValue v-if="!apidocInfo.isFolder" label="请求地址：" class="w-50 mt-2">
            <span class="text-ellipsis">{{ fullUrl }}</span>
          </SLableValue>
          <SLableValue v-if="apidocInfo.isFolder" label="目录名称：" class="w-50">
            <div>{{ apidocInfo.info.name }}</div>
          </SLableValue>
          <div v-if="apidocInfo" class="base-info">
            <SLableValue label="维护人员：" :title="apidocInfo.info.maintainer || apidocInfo.info.creator" label-width="auto" class="w-50">
              <span class="text-ellipsis">{{ apidocInfo.info.maintainer || apidocInfo.info.creator }}</span>
            </SLableValue>
            <SLableValue label="创建人员：" :title="apidocInfo.info.maintainer || apidocInfo.info.creator" label-width="auto" class="w-50">
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
        <SFieldset v-if="!apidocInfo.isFolder" :title="t('请求参数')" class="mb-5">
          <template v-if="hasQueryParams">
            <div class="title">{{ t('Query参数') }}</div>
            <SParamsView :data="apidocInfo.item.queryParams" plain class="mb-3" />
          </template>
          <template v-if="hasPathsParams">
            <div class="title">{{ t('Path参数') }}</div>
            <SParamsView :data="apidocInfo.item.paths" plain class="mb-3" />
          </template>
          <template v-if="hasJsonBodyParams">
            <div class="title">{{ t('Body参数') }}(application/json)</div>
            <SJsonEditor :value="apidocInfo.item.requestBody.rawJson" read-only />
          </template>
          <template v-if="hasFormDataParams">
            <div class="title">{{ t('Body参数') }}(multipart/formdata)</div>
            <SParamsView :data="apidocInfo.item.requestBody.formdata" plain />
          </template>
          <template v-if="hasUrlEncodedParams">
            <div class="title">{{ t('Body参数') }}(x-www-form-urlencoded)</div>
            <SParamsView :data="apidocInfo.item.requestBody.urlencoded" plain />
          </template>
          <template v-if="hasRawParams">
            <div class="title">{{ t('Body参数') }}({{ apidocInfo.item.requestBody.raw.dataType }})</div>
            <pre class="pre">{{ apidocInfo.item.requestBody.raw.data }}</pre>
          </template>
          <div v-if="!hasQueryParams && !hasPathsParams && !hasJsonBodyParams && !hasFormDataParams && !hasUrlEncodedParams && !hasRawParams">
            {{ t('暂无数据') }}
          </div>
        </SFieldset>
        <SFieldset v-if="!apidocInfo.isFolder" :title="t('返回参数')">
          <div v-for="(item, index) in apidocInfo.item.responseParams" :key="index" class="title">
            <div class="mb-2">
              <span>{{ t('名称') }}：</span>
              <span>{{ item.title }}</span>
              <el-divider direction="vertical" />
              <span>{{ t('状态码') }}：</span>
              <span>{{ item.statusCode }}</span>
              <el-divider direction="vertical" />
              <span>{{ t('返回格式') }}：</span>
              <span>{{ item.value.dataType }}</span>
            </div>
            <SRawEditor v-if="item.value.dataType === 'application/json'" :data="item.value.strJson" readonly />
            <div v-if="item.value.dataType === 'application/xml' || item.value.dataType === 'text/plain' || item.value.dataType === 'text/html'" class="h-150px">
              <SRawEditor :data="item.value.strJson" :type="item.value.dataType" readonly />
            </div>
          </div>
        </SFieldset>
        <SFieldset v-if="!apidocInfo.isFolder" :title="t('请求头')">
          <template v-if="hasHeaders">
            <SParamsView :data="apidocInfo.item.headers" plain class="mb-3" />
          </template>
          <div v-else>{{ t('暂无数据') }}</div>
        </SFieldset>
      </div>
    </SLoading>
  </div>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted, computed } from 'vue';
import { ApidocDetail, Response } from '@src/types/global';
import { request } from '@/api/api';
import { t } from 'i18next';
import SLoading from '@/components/common/loading/g-loading.vue';
import SLableValue from '@/components/common/label-value/g-label-value.vue';
import SFieldset from '@/components/common/fieldset/g-fieldset.vue';
import SParamsView from '@/components/apidoc/params-view/g-params-view.vue';
import SRawEditor from '@/components/apidoc/raw-editor/g-raw-editor.vue';
import SJsonEditor from '@/components/common/json-editor/g-json-editor.vue';
import { formatDate } from '@/helper';
import { router } from '@/router';
import { apidocCache } from '@/cache/apidoc';

const loading = ref(false);
const apidocInfo: Ref<ApidocDetail | null> = ref(null);
const shareId = computed(() => router.currentRoute.value.query.share_id as string);
const tabId = computed(() => router.currentRoute.value.query.id as string);

const requestMethods = ref([
  { name: 'GET', value: 'GET', iconColor: '#28a745' },
  { name: 'POST', value: 'POST', iconColor: '#ffc107' },
  { name: 'PUT', value: 'PUT', iconColor: '#409EFF' },
  { name: 'DEL', value: 'DELETE', iconColor: '#f56c6c' },
  { name: 'PATCH', value: 'PATCH', iconColor: '#17a2b8' },
  { name: 'HEAD', value: 'HEAD', iconColor: '#17a2b8' },
  { name: 'OPTIONS', value: 'OPTIONS', iconColor: '#17a2b8' },
  { name: 'Test', value: 'Test', iconColor: '#17a2b8' },
]);

const fullUrl = computed(() => {
  if (!apidocInfo.value) return '';
  const { host, path } = apidocInfo.value.item.url || { host: '', path: '' };
  return `${host}${path}`;
});

const layout = ref('horizontal');
const updateLayout = () => {
  layout.value = window.innerWidth > 1000 ? 'horizontal' : 'vertical';
};

onMounted(() => {
  updateLayout();
  window.addEventListener('resize', updateLayout);
  fetchShareDoc();
});

const fetchShareDoc = async () => {
  if (!tabId.value) return;
  loading.value = true;
  try {
    const password = apidocCache.getSharePassword(shareId.value);
    const params = { password, shareId: shareId.value };
    const res = await request.get<Response<ApidocDetail>, Response<ApidocDetail>>('/api/project/export/share_project_info', { params });
    apidocInfo.value = res.data;
  } catch (err) {
    apidocInfo.value = null;
  } finally {
    loading.value = false;
  }
};

const hasQueryParams = computed(() => apidocInfo.value?.item.queryParams?.filter(p => p.select).some(data => data.key));
const hasPathsParams = computed(() => apidocInfo.value?.item.paths?.some(data => data.key));
const hasJsonBodyParams = computed(() => {
  if (!apidocInfo.value) return false;
  const { contentType } = apidocInfo.value.item;
  const { mode } = apidocInfo.value.item.requestBody;
  return contentType === 'application/json' && mode === 'json';
});
const hasFormDataParams = computed(() => apidocInfo.value?.item.contentType === 'multipart/form-data');
const hasUrlEncodedParams = computed(() => apidocInfo.value?.item.contentType === 'application/x-www-form-urlencoded');
const hasRawParams = computed(() => {
  if (!apidocInfo.value) return false;
  const { mode, raw } = apidocInfo.value.item.requestBody;
  return mode === 'raw' && raw.data;
});
const hasHeaders = computed(() => apidocInfo.value?.item.headers?.filter(p => p.select).some(data => data.key));
</script>

<style lang='scss' scoped>
.share-doc-detail.horizontal {
  display: flex;
  flex-direction: row;
  .doc-detail {
    flex: 1;
    max-width: 900px;
    margin: 0 auto;
  }
}
.share-doc-detail.vertical {
  display: flex;
  flex-direction: column;
  .doc-detail {
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
  }
}
</style> 