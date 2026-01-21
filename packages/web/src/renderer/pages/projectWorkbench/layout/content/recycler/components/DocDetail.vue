<template>
  <SLoading :loading="loading" class="doc-detail">
    <div class="header-section">
      <el-descriptions :column="2" border size="small" class="mb-4">
        <el-descriptions-item :label="t('名称')">{{ apidocInfo?.info.name }}</el-descriptions-item>
        <el-descriptions-item :label="t('类型')">
          <el-tag size="small">{{ apidocInfo?.info.type.toUpperCase() }}</el-tag>
        </el-descriptions-item>

        <!-- HTTP Info -->
        <template v-if="apidocInfo?.info.type === 'http'">
          <el-descriptions-item :label="t('请求方式')">
            <span :style="{ color: methodColor, fontWeight: 'bold' }">
              {{ httpItem?.method?.toUpperCase() }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item :label="t('URL')">
            <span class="text-ellipsis" :title="httpItem?.url?.path">{{ httpItem?.url?.prefix }}{{ httpItem?.url?.path
              }}</span>
          </el-descriptions-item>
        </template>

        <!-- WebSocket Info -->
        <template v-else-if="apidocInfo?.info.type === 'websocket'">
          <el-descriptions-item :label="t('协议类型')">
            <span>{{ wsItem?.protocol?.toUpperCase() }}</span>
          </el-descriptions-item>
          <el-descriptions-item :label="t('URL')">
            <span class="text-ellipsis">{{ wsItem?.url?.prefix }}{{ wsItem?.url?.path }}</span>
          </el-descriptions-item>
        </template>

        <!-- Mock Info -->
        <template v-else-if="apidocInfo?.info.type === 'httpMock'">
          <el-descriptions-item :label="t('Mock地址')">
            <span class="text-ellipsis">{{ httpMockItem?.requestCondition?.url }}</span>
          </el-descriptions-item>
          <el-descriptions-item :label="t('端口')">{{ httpMockItem?.requestCondition?.port }}</el-descriptions-item>
        </template>
        <template v-else-if="apidocInfo?.info.type === 'websocketMock'">
          <el-descriptions-item :label="t('Mock路径')">
            <span class="text-ellipsis">{{ wsMockItem?.requestCondition?.path }}</span>
          </el-descriptions-item>
          <el-descriptions-item :label="t('端口')">{{ wsMockItem?.requestCondition?.port }}</el-descriptions-item>
        </template>

        <!-- Common Info -->
        <template v-if="!isOffline()">
          <el-descriptions-item :label="t('维护人员')">{{ apidocInfo?.info.maintainer || apidocInfo?.info.creator }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('创建人员')">{{ apidocInfo?.info.creator }}</el-descriptions-item>
        </template>
        <el-descriptions-item :label="t('更新时间')">{{ formatDate(apidocInfo?.updatedAt) }}</el-descriptions-item>
        <el-descriptions-item :label="t('创建时间')">{{ formatDate(apidocInfo?.createdAt) }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- HTTP Detailed Content -->
    <div v-if="apidocInfo?.info.type === 'http'" class="content-section">
      <el-tabs v-model="activeTab" class="detail-tabs">
        <!-- Request Tab -->
        <el-tab-pane :label="t('请求定义')" name="request">
          <!-- Params Section -->
          <div class="req-section mb-4">
            <div class="section-title mb-2">Params</div>
            <div v-if="hasQueryParams" class="mb-3">
              <div class="sub-title">{{ t('Query参数') }}</div>
              <el-table :data="httpItem?.queryParams?.filter(p => p.select && p.key)" border size="small"
                style="width: 100%">
                <el-table-column prop="key" :label="t('参数名')" show-overflow-tooltip min-width="120" />
                <el-table-column prop="value" :label="t('参数值')" show-overflow-tooltip min-width="120" />
                <el-table-column prop="type" :label="t('类型')" width="100" />
                <el-table-column :label="t('必填')" width="80">
                  <template #default="{ row }">
                    <el-tag :type="row.required ? 'danger' : 'info'" size="small" effect="plain">
                      {{ row.required ? t('是') : t('否') }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="description" :label="t('描述')" show-overflow-tooltip min-width="150" />
              </el-table>
            </div>

            <div v-if="hasPathsParams" class="mb-3">
              <div class="sub-title">{{ t('Path参数') }}</div>
              <el-table :data="httpItem?.paths?.filter(p => p.key)" border size="small" style="width: 100%">
                <el-table-column prop="key" :label="t('参数名')" show-overflow-tooltip min-width="120" />
                <el-table-column prop="value" :label="t('参数值')" show-overflow-tooltip min-width="120" />
                <el-table-column prop="type" :label="t('类型')" width="100" />
                <el-table-column :label="t('必填')" width="80">
                  <template #default="{ row }">
                    <el-tag :type="row.required ? 'danger' : 'info'" size="small" effect="plain">
                      {{ row.required ? t('是') : t('否') }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="description" :label="t('描述')" show-overflow-tooltip min-width="150" />
              </el-table>
            </div>

            <div v-if="!hasQueryParams && !hasPathsParams" class="empty-text">
              {{ t('暂无参数数据') }}
            </div>
          </div>

          <el-divider border-style="dashed" />

          <!-- Body Section -->
          <div class="req-section mb-4">
            <div class="section-title mb-2">Body</div>
            <template v-if="hasJsonBodyParams">
              <div class="sub-title">application/json</div>
              <SJsonEditor :value="httpItem?.requestBody?.rawJson" read-only height="300px"></SJsonEditor>
            </template>

            <template v-else-if="hasFormDataParams">
              <div class="sub-title">multipart/form-data</div>
              <el-table :data="httpItem?.requestBody?.formdata?.filter(p => p.select && p.key)" border size="small">
                <el-table-column prop="key" :label="t('参数名')" show-overflow-tooltip min-width="120" />
                <el-table-column prop="value" :label="t('参数值')" show-overflow-tooltip min-width="120" />
                <el-table-column prop="type" :label="t('类型')" width="100" />
                <el-table-column :label="t('必填')" width="80">
                  <template #default="{ row }">
                    <el-tag :type="row.required ? 'danger' : 'info'" size="small" effect="plain">
                      {{ row.required ? t('是') : t('否') }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="description" :label="t('描述')" show-overflow-tooltip min-width="150" />
              </el-table>
            </template>

            <template v-else-if="hasUrlEncodedParams">
              <div class="sub-title">x-www-form-urlencoded</div>
              <el-table :data="httpItem?.requestBody?.urlencoded?.filter(p => p.select && p.key)" border size="small">
                <el-table-column prop="key" :label="t('参数名')" show-overflow-tooltip min-width="120" />
                <el-table-column prop="value" :label="t('参数值')" show-overflow-tooltip min-width="120" />
                <el-table-column prop="type" :label="t('类型')" width="100" />
                <el-table-column :label="t('必填')" width="80">
                  <template #default="{ row }">
                    <el-tag :type="row.required ? 'danger' : 'info'" size="small" effect="plain">
                      {{ row.required ? t('是') : t('否') }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="description" :label="t('描述')" show-overflow-tooltip min-width="150" />
              </el-table>
            </template>

            <template v-else-if="hasRawParams">
              <div class="sub-title">{{ httpItem?.requestBody?.raw?.dataType }}</div>
              <pre class="raw-content">{{ httpItem?.requestBody?.raw?.data }}</pre>
            </template>

            <div v-else class="empty-text">
              {{ t('暂无Body数据') }}
            </div>
          </div>

          <el-divider border-style="dashed" />

          <!-- Headers Section -->
          <div class="req-section mb-4">
            <div class="section-title mb-2">Header</div>
            <el-table v-if="hasHeaders" :data="httpItem?.headers?.filter(p => p.select && p.key)" border size="small">
              <el-table-column prop="key" :label="t('参数名')" show-overflow-tooltip min-width="120" />
              <el-table-column prop="value" :label="t('参数值')" show-overflow-tooltip min-width="120" />
              <el-table-column :label="t('必填')" width="80">
                <template #default="{ row }">
                  <el-tag :type="row.required ? 'danger' : 'info'" size="small" effect="plain">
                    {{ row.required ? t('是') : t('否') }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="description" :label="t('描述')" show-overflow-tooltip min-width="150" />
            </el-table>
            <div v-else class="empty-text">
              {{ t('暂无Header数据') }}
            </div>
          </div>
        </el-tab-pane>

        <!-- Response Tab -->
        <el-tab-pane :label="t('响应定义')" name="response">
          <div v-if="httpItem?.responseParams?.length">
            <el-collapse v-model="activeResponseNames">
              <el-collapse-item v-for="(item, index) in httpItem?.responseParams" :key="index" :name="index">
                <template #title>
                  <div class="response-title">
                    <span class="fw-bold mr-2">{{ item.title }}</span>
                    <el-tag size="small" type="success" class="mr-2">{{ item.statusCode }}</el-tag>
                    <el-tag size="small" type="info">{{ item.value.dataType }}</el-tag>
                  </div>
                </template>

                <div class="response-content mt-2">
                  <SJsonEditor v-if="item.value.dataType === 'application/json'" :model-value="item.value.strJson"
                    read-only height="200px"></SJsonEditor>
                  <div
                    v-else-if="['application/xml', 'text/plain', 'text/html', 'application/javascript', 'text/javascript'].includes(item.value.dataType)">
                    <SJsonEditor :model-value="item.value.strJson"
                      :config="{ language: getLanguageFromMime(item.value.dataType) }" read-only
                      height="200px"></SJsonEditor>
                  </div>
                  <pre v-else class="raw-content">{{ item.value.strJson }}</pre>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
          <el-empty v-else :description="t('暂无响应数据')" :image-size="60" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </SLoading>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted, computed, defineAsyncComponent } from 'vue'
import type { ApiNode, HttpNode, WebSocketNode, HttpMockNode, WebSocketMockNode, CommonResponse } from '@src/types';
import { router } from '@/router/index'
import { request } from '@/api/api'
import { useI18n } from 'vue-i18n'
import SLoading from '@/components/common/loading/ClLoading.vue'
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
const { t } = useI18n()
const activeTab = ref('request')
const activeResponseNames = ref([0])

/*
|--------------------------------------------------------------------------
| 获取文档详情
|--------------------------------------------------------------------------
*/
const docDetail: Ref<ApiNode | null> = ref(null);
const projectId = router.currentRoute.value.query.id as string;

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
| 辅助函数
|--------------------------------------------------------------------------
*/
const methodColor = computed(() => {
  const method = httpItem.value?.method?.toLowerCase();
  const found = validRequestMethods.find(req => req.value.toLowerCase() === method);
  return found?.iconColor || 'var(--el-text-color-regular)';
});

//关闭弹窗
// const handleClose = () => {
//   emits('close');
// }
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
  width: 100%;
  position: relative;
  
  :deep(.el-descriptions__label) {
    font-weight: 600;
  }
}

.sub-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
  margin-top: 8px;
    &:first-child {
      margin-top: 0;
    }
}

.raw-content {
  background-color: var(--el-fill-color-light);
  padding: 10px;
  border-radius: 4px;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
  overflow-y: auto;
  font-family: monospace;
}

.detail-tabs {
  margin-top: 10px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  
  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 14px;
    background-color: var(--el-color-primary);
    margin-right: 8px;
    border-radius: 2px;
  }
}

.empty-text {
  color: var(--el-text-color-placeholder);
  font-size: 13px;
  padding: 8px 12px;
}
</style>
