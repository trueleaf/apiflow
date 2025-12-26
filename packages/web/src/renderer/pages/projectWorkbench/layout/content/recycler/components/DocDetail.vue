<template>
  <SLoading :loading="loading" class="doc-detail">
    <el-icon :size="18" class="close" @click="handleClose">
      <Close />
    </el-icon>
    <div class="params-view">
      <!-- 基本信息 -->
      <SFieldset v-if="apidocInfo" :title="t('基本信息')">
        <!-- HTTP 类型 -->
        <template v-if="apidocInfo.info.type === 'http'">
          <SLableValue :label="t('请求方式') + '：'" class="w-50">
            <template v-for="(req) in validRequestMethods">
              <span v-if="httpItem?.method?.toLowerCase() === req.value.toLowerCase()" :key="req.name" class="label"
                :style="{ color: req.iconColor }">{{ req.name.toUpperCase() }}</span>
            </template>
          </SLableValue>
          <SLableValue :label="t('接口名称') + '：'" class="w-50">
            <div>{{ apidocInfo.info.name }}</div>
          </SLableValue>
          <SLableValue :label="t('请求地址') + '：'" class="w-50 mt-2">
            <span class="text-ellipsis">{{ httpItem?.url?.prefix }}{{ httpItem?.url?.path }}</span>
          </SLableValue>
        </template>
        <!-- 文件夹类型 -->
        <template v-else-if="apidocInfo.info.type === 'folder'">
          <SLableValue :label="t('目录名称') + '：'" class="w-50">
            <div>{{ apidocInfo.info.name }}</div>
          </SLableValue>
        </template>
        <!-- WebSocket 类型 -->
        <template v-else-if="apidocInfo.info.type === 'websocket'">
          <SLableValue :label="t('协议类型') + '：'" class="w-50">
            <span>{{ wsItem?.protocol?.toUpperCase() }}</span>
          </SLableValue>
          <SLableValue :label="t('接口名称') + '：'" class="w-50">
            <div>{{ apidocInfo.info.name }}</div>
          </SLableValue>
          <SLableValue :label="t('请求地址') + '：'" class="w-50 mt-2">
            <span class="text-ellipsis">{{ wsItem?.url?.prefix }}{{ wsItem?.url?.path }}</span>
          </SLableValue>
        </template>
        <!-- HTTP Mock 类型 -->
        <template v-else-if="apidocInfo.info.type === 'httpMock'">
          <SLableValue :label="t('接口名称') + '：'" class="w-50">
            <div>{{ apidocInfo.info.name }}</div>
          </SLableValue>
          <SLableValue :label="t('Mock地址') + '：'" class="w-50 mt-2">
            <span class="text-ellipsis">{{ httpMockItem?.requestCondition?.url }}</span>
          </SLableValue>
          <SLableValue :label="t('端口') + '：'" class="w-50 mt-2">
            <span>{{ httpMockItem?.requestCondition?.port }}</span>
          </SLableValue>
        </template>
        <!-- WebSocket Mock 类型 -->
        <template v-else-if="apidocInfo.info.type === 'websocketMock'">
          <SLableValue :label="t('接口名称') + '：'" class="w-50">
            <div>{{ apidocInfo.info.name }}</div>
          </SLableValue>
          <SLableValue :label="t('Mock路径') + '：'" class="w-50 mt-2">
            <span class="text-ellipsis">{{ wsMockItem?.requestCondition?.path }}</span>
          </SLableValue>
          <SLableValue :label="t('端口') + '：'" class="w-50 mt-2">
            <span>{{ wsMockItem?.requestCondition?.port }}</span>
          </SLableValue>
        </template>
        <!-- Markdown 类型 -->
        <template v-else-if="apidocInfo.info.type === 'markdown'">
          <SLableValue :label="t('文档名称') + '：'" class="w-50">
            <div>{{ apidocInfo.info.name }}</div>
          </SLableValue>
        </template>
        <!-- 通用信息 -->
        <div class="base-info">
          <SLableValue :label="t('维护人员') + '：'" :title="apidocInfo.info.maintainer || apidocInfo.info.creator" label-width="auto"
            class="w-50">
            <span class="text-ellipsis">{{ apidocInfo.info.maintainer || apidocInfo.info.creator }}</span>
          </SLableValue>
          <SLableValue :label="t('创建人员') + '：'" :title="apidocInfo.info.creator" label-width="auto"
            class="w-50">
            <span class="text-ellipsis">{{ apidocInfo.info.creator }}</span>
          </SLableValue>
          <SLableValue :label="t('更新日期') + '：'" :title="formatDate(apidocInfo.updatedAt)" label-width="auto" class="w-50">
            <span class="text-ellipsis">{{ formatDate(apidocInfo.updatedAt) }}</span>
          </SLableValue>
          <SLableValue :label="t('创建日期') + '：'" :title="formatDate(apidocInfo.createdAt)" label-width="auto" class="w-50">
            <span class="text-ellipsis">{{ formatDate(apidocInfo.createdAt) }}</span>
          </SLableValue>
        </div>
      </SFieldset>
      <!-- HTTP 请求参数 -->
      <SFieldset v-if="apidocInfo?.info?.type === 'http'" :title="t('请求参数')" class="mb-5">
        <template v-if="hasQueryParams">
          <div class="title">{{ t("Query参数") }}</div>
          <table class="params-table mb-3">
            <thead>
              <tr>
                <th>{{ t('参数名') }}</th>
                <th>{{ t('参数值') }}</th>
                <th>{{ t('类型') }}</th>
                <th>{{ t('必填') }}</th>
                <th>{{ t('描述') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="param in httpItem?.queryParams?.filter(p => p.select && p.key)" :key="param._id">
                <td>{{ param.key }}</td>
                <td>{{ param.value }}</td>
                <td>{{ param.type }}</td>
                <td><span :class="['required-badge', param.required ? 'required' : 'optional']">{{ param.required ? t('是') : t('否') }}</span></td>
                <td>{{ param.description || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </template>
        <template v-if="hasPathsParams">
          <div class="title">{{ t("Path参数") }}</div>
          <table class="params-table mb-3">
            <thead>
              <tr>
                <th>{{ t('参数名') }}</th>
                <th>{{ t('参数值') }}</th>
                <th>{{ t('类型') }}</th>
                <th>{{ t('必填') }}</th>
                <th>{{ t('描述') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="param in httpItem?.paths?.filter(p => p.key)" :key="param._id">
                <td>{{ param.key }}</td>
                <td>{{ param.value }}</td>
                <td>{{ param.type }}</td>
                <td><span :class="['required-badge', param.required ? 'required' : 'optional']">{{ param.required ? t('是') : t('否') }}</span></td>
                <td>{{ param.description || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </template>
        <template v-if="hasJsonBodyParams">
          <div class="title">{{ t("Body参数") }}(application/json)</div>
          <SJsonEditor :value="httpItem?.requestBody?.rawJson" read-only></SJsonEditor>
        </template>
        <template v-if="hasFormDataParams">
          <div class="title">{{ t("Body参数") }}(multipart/formdata)</div>
          <table class="params-table">
            <thead>
              <tr>
                <th>{{ t('参数名') }}</th>
                <th>{{ t('参数值') }}</th>
                <th>{{ t('类型') }}</th>
                <th>{{ t('必填') }}</th>
                <th>{{ t('描述') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="param in httpItem?.requestBody?.formdata?.filter(p => p.select && p.key)" :key="param._id">
                <td>{{ param.key }}</td>
                <td>{{ param.value }}</td>
                <td>{{ param.type }}</td>
                <td><span :class="['required-badge', param.required ? 'required' : 'optional']">{{ param.required ? t('是') : t('否') }}</span></td>
                <td>{{ param.description || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </template>
        <template v-if="hasUrlEncodedParams">
          <div class="title">{{ t("Body参数") }}(x-www-form-urlencoded)</div>
          <table class="params-table">
            <thead>
              <tr>
                <th>{{ t('参数名') }}</th>
                <th>{{ t('参数值') }}</th>
                <th>{{ t('类型') }}</th>
                <th>{{ t('必填') }}</th>
                <th>{{ t('描述') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="param in httpItem?.requestBody?.urlencoded?.filter(p => p.select && p.key)" :key="param._id">
                <td>{{ param.key }}</td>
                <td>{{ param.value }}</td>
                <td>{{ param.type }}</td>
                <td><span :class="['required-badge', param.required ? 'required' : 'optional']">{{ param.required ? t('是') : t('否') }}</span></td>
                <td>{{ param.description || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </template>
        <template v-if="hasRawParams">
          <div class="title">{{ t("Body参数") }}({{ httpItem?.requestBody?.raw?.dataType }})</div>
          <pre class="pre">{{ httpItem?.requestBody?.raw?.data }}</pre>
        </template>
        <div
          v-if="!hasQueryParams && !hasPathsParams && !hasJsonBodyParams && !hasFormDataParams && !hasUrlEncodedParams && !hasRawParams">
          {{ t("暂无数据") }}</div>
      </SFieldset>
      <!-- HTTP 返回参数 -->
      <SFieldset v-if="apidocInfo?.info?.type === 'http'" :title="t('返回参数')">
        <div v-for="(item, index) in httpItem?.responseParams" :key="index" class="title">
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
          <SJsonEditor v-if="item.value.dataType === 'application/json'" :model-value="item.value.strJson" read-only></SJsonEditor>
          <div
            v-if="item.value.dataType === 'application/xml' || item.value.dataType === 'text/plain' || item.value.dataType === 'text/html'"
            class="h-150px">
            <SJsonEditor :model-value="item.value.strJson" :config="{ language: getLanguageFromMime(item.value.dataType) }" read-only></SJsonEditor>
          </div>
        </div>
        <div v-if="!httpItem?.responseParams?.length">{{ t("暂无数据") }}</div>
      </SFieldset>
      <!-- HTTP 请求头 -->
      <SFieldset v-if="apidocInfo?.info?.type === 'http'" :title="t('请求头')">
        <template v-if="hasHeaders">
          <table class="params-table mb-3">
            <thead>
              <tr>
                <th>{{ t('参数名') }}</th>
                <th>{{ t('参数值') }}</th>
                <th>{{ t('类型') }}</th>
                <th>{{ t('必填') }}</th>
                <th>{{ t('描述') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="param in httpItem?.headers?.filter(p => p.select && p.key)" :key="param._id">
                <td>{{ param.key }}</td>
                <td>{{ param.value }}</td>
                <td>{{ param.type }}</td>
                <td><span :class="['required-badge', param.required ? 'required' : 'optional']">{{ param.required ? t('是') : t('否') }}</span></td>
                <td>{{ param.description || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </template>
        <div v-else>{{ t("暂无数据") }}</div>
      </SFieldset>
    </div>
  </SLoading>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted, computed, defineAsyncComponent } from 'vue'
import { Close } from '@element-plus/icons-vue'
import type { ApiNode, HttpNode, WebSocketNode, HttpMockNode, WebSocketMockNode, CommonResponse } from '@src/types';
import { router } from '@/router/index'
import { request } from '@/api/api'
import { useI18n } from 'vue-i18n'
import SLoading from '@/components/common/loading/ClLoading.vue'
import SLableValue from '@/components/common/labelValue/ClLabelValue.vue'
import SFieldset from '@/components/common/fieldset/ClFieldset.vue'
import { formatDate } from '@/helper'
import { requestMethods as validRequestMethods } from '@/data/data'
import { apiNodesCache } from '@/cache/nodes/nodesCache';
import { useRuntime } from '@/store/runtime/runtimeStore';

const SJsonEditor = defineAsyncComponent(() => import('@/components/common/jsonEditor/ClJsonEditor.vue'))

const emits = defineEmits(['close'])
const props = defineProps({
  id: {
    type: String,
    default: ''
  },
});

const runtimeStore = useRuntime()
/*
|--------------------------------------------------------------------------
| 获取文档详情
|--------------------------------------------------------------------------
*/
const docDetail: Ref<ApiNode | null> = ref(null);
const projectId = router.currentRoute.value.query.id as string;
const { t } = useI18n()

const loading = ref(false);
const isOffline = () => runtimeStore.networkMode === 'offline';
//获取文档详情
const getDocDetail = async () => {
  if (isOffline()) {
    docDetail.value = await apiNodesCache.getNodeById(props.id, true) as ApiNode;
    return
  }
  loading.value = true;
  const params = {
    _id: props.id,
    projectId,
  };
  request.get<CommonResponse<HttpNode>, CommonResponse<HttpNode>>('/api/project/doc_detail', { params }).then((res) => {
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
//类型转换的 computed 属性
const httpItem = computed(() => {
  if (docDetail.value?.info.type === 'http') {
    return (docDetail.value as HttpNode).item;
  }
  return null;
});
const wsItem = computed(() => {
  if (docDetail.value?.info.type === 'websocket') {
    return (docDetail.value as WebSocketNode).item;
  }
  return null;
});
const httpMockItem = computed(() => {
  if (docDetail.value?.info.type === 'httpMock') {
    return docDetail.value as HttpMockNode;
  }
  return null;
});
const wsMockItem = computed(() => {
  if (docDetail.value?.info.type === 'websocketMock') {
    return docDetail.value as WebSocketMockNode;
  }
  return null;
});
//是否存在查询参数
const hasQueryParams = computed(() => {
  if (!httpItem.value) {
    return false;
  }
  const { queryParams } = httpItem.value;
  return queryParams?.filter(p => p.select).some((data) => data.key) ?? false;
})
//是否存在path参数
const hasPathsParams = computed(() => {
  if (!httpItem.value) {
    return false;
  }
  const { paths } = httpItem.value;
  return paths?.some((data) => data.key) ?? false;
})
//是否存在body参数
const hasJsonBodyParams = computed(() => {
  if (!httpItem.value) {
    return false;
  }
  const { contentType, requestBody } = httpItem.value;
  return contentType === 'application/json' && requestBody?.mode === 'json';
})
//是否存在formData参数
const hasFormDataParams = computed(() => {
  if (!httpItem.value) {
    return false;
  }
  const { contentType } = httpItem.value;
  return contentType === 'multipart/form-data';
})
//是否存在urlencoded参数
const hasUrlEncodedParams = computed(() => {
  if (!httpItem.value) {
    return false;
  }
  const { contentType } = httpItem.value;
  return contentType === 'application/x-www-form-urlencoded';
})
//raw类型返回参数
const hasRawParams = computed(() => {
  if (!httpItem.value) {
    return false;
  }
  const { requestBody } = httpItem.value;
  return requestBody?.mode === 'raw' && requestBody?.raw?.data;
})
//是否存在headers
const hasHeaders = computed(() => {
  if (!httpItem.value) {
    return false;
  }
  const { headers } = httpItem.value;
  return headers?.filter(p => p.select).some((data) => data.key) ?? false;
})

/*
|--------------------------------------------------------------------------
| 其他操作
|--------------------------------------------------------------------------
*/

//关闭弹窗
const handleClose = () => {
  emits('close');
}
const getLanguageFromMime = (mimeType: string): string => {
  const mimeToLanguage: Record<string, string> = {
    'text/plain': 'plaintext',
    'text/css': 'css',
    'text/html': 'html',
    'application/xml': 'xml',
    'application/javascript': 'javascript',
    'text/javascript': 'javascript',
  };
  return mimeToLanguage[mimeType] || 'plaintext';
}

</script>

<style lang='scss' scoped>
.doc-detail {
  width: 800px;
  overflow: hidden;
  position: relative;

  .params-view {
    max-height: 65vh;
    overflow-y: auto;
    padding: 0 10px;
    margin-top: 30px;

    .copy-json {
      cursor: pointer;

      &:hover {
        color: #f7f7fa;
      }
    }
  }

  .close {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    right: 5px;
    top: 5px;
    font-size: 18px;
    width: 22px;
    height: 22px;
    color: var(--el-color-danger);
    cursor: pointer;
    border-radius: 50%;
    &:hover {
      background: #dee2e6;
    }
  }

  .params-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;

    th,
    td {
      padding: 8px 12px;
      text-align: left;
      border: 1px solid var(--el-border-color-lighter);
    }

    th {
      background-color: var(--el-fill-color-light);
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    td {
      color: var(--el-text-color-regular);
      word-break: break-all;
    }

    tbody tr:hover {
      background-color: var(--el-fill-color-lighter);
    }

    .required-badge {
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;

      &.required {
        background-color: var(--el-color-danger-light-9);
        color: var(--el-color-danger);
      }

      &.optional {
        background-color: var(--el-fill-color);
        color: var(--el-text-color-secondary);
      }
    }
  }
}
</style>
