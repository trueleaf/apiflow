<template>
  <div class="share-doc-detail http-content">
    <div class="doc-detail">
      <template v-if="apidocInfo">
        <!-- 顶部标题和接口信息 -->
        <div class="api-doc-header">
          <div class="api-doc-title">{{ apidocInfo.info.name }}</div>
          <div class="api-doc-meta">
            <span 
              class="method-label" 
              :class="apidocInfo.item.method.toLowerCase()" 
              :style="{ backgroundColor: getMethodColor(apidocInfo.item.method)}">
              {{ apidocInfo.item.method.toUpperCase() }}
            </span>
            <span class="api-url">{{ fullUrl }}</span>
          </div>
          <div class="api-doc-base-info-inline">
            <span class="mr-1">{{ apidocInfo.info.maintainer || apidocInfo.info.creator }}</span>
            <span>{{ t('更新于') }}:</span>
            <span>{{ formatDate(apidocInfo.updatedAt) }}</span>
          </div>
        </div>
        
        <!-- 参数块 - 每个块展示成一行 -->
        <div class="api-doc-blocks">
          <!-- Query 参数块 -->
          <div class="api-doc-block">
            <div class="api-doc-block-header" @click="toggleBlock('query')">
              <div class="collapse-button" :class="{ 'collapsed': !expandedBlocks.query }">
                <el-icon><ArrowDown /></el-icon>
              </div>
              <div class="api-doc-block-title">{{ t('Query 参数') }}</div>
            </div>
            <div class="api-doc-block-content" v-show="expandedBlocks.query">
              <template v-if="hasQueryParams">
                <div class="api-doc-table">
                  <table>
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
                      <tr v-for="param in actualQueryParams" :key="param._id">
                        <td>{{ param.key }}</td>
                        <td>{{ param.value }}</td>
                        <td>{{ param.type }}</td>
                        <td>
                          <span :class="['required-badge', param.required ? 'required' : 'optional']">
                            {{ param.required ? t('是') : t('否') }}
                          </span>
                        </td>
                        <td>{{ param.description || '-' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </template>
              <div v-else class="api-doc-empty">{{ t('暂无 Query 参数') }}</div>
            </div>
          </div>

          <!-- 请求头块 -->
          <div class="api-doc-block">
            <div class="api-doc-block-header" @click="toggleBlock('headers')">
              <div class="collapse-button" :class="{ 'collapsed': !expandedBlocks.headers }">
                <el-icon><ArrowDown /></el-icon>
              </div>
              <div class="api-doc-block-title">{{ t('请求头') }}</div>
            </div>
            <div class="api-doc-block-content" v-show="expandedBlocks.headers">
              <template v-if="hasHeaders">
                <div class="api-doc-table">
                  <table>
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
                      <tr v-for="header in actualHeaders" :key="header._id">
                        <td>{{ header.key }}</td>
                        <td>{{ header.value }}</td>
                        <td>{{ header.type }}</td>
                        <td>
                          <span :class="['required-badge', header.required ? 'required' : 'optional']">
                            {{ header.required ? t('是') : t('否') }}
                          </span>
                        </td>
                        <td>{{ header.description || '-' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </template>
              <div v-else class="api-doc-empty">{{ t('暂无请求头') }}</div>
            </div>
          </div>

          <!-- Body参数 -->
          <div class="api-doc-block">
            <div class="api-doc-block-header" @click="toggleBlock('body')">
              <div class="collapse-button" :class="{ 'collapsed': !expandedBlocks.body }">
                <el-icon><ArrowDown /></el-icon>
              </div>
              <div class="api-doc-block-title">
                {{ t('Body参数') }}
                <span v-if="apidocInfo?.item.contentType" class="content-format-label">{{ apidocInfo.item.contentType }}</span>
              </div>
            </div>
            <div class="api-doc-block-content" v-show="expandedBlocks.body">
              <template v-if="bodyType === 'json'">
                <div v-if="formattedBodyJson" class="editor-border">
                  <SJsonEditor :modelValue="formattedBodyJson" auto-height min-height="30px" read-only />
                </div>
                <div v-else class="api-doc-empty">{{ t('暂无Body数据') }}</div>
              </template>
              <template v-else-if="bodyType === 'formdata'">
                <div class="api-doc-table">
                  <SParamsView :data="apidocInfo.item.requestBody.formdata" plain />
                </div>
              </template>
              <template v-else-if="bodyType === 'urlencoded'">
                <div class="api-doc-table">
                  <SParamsView :data="apidocInfo.item.requestBody.urlencoded" plain />
                </div>
              </template>
              <template v-else-if="bodyType === 'raw'">
                <pre class="pre api-doc-raw-body">{{ apidocInfo.item.requestBody.raw.data }}</pre>
              </template>
              <template v-else-if="bodyType === 'text'">
                <div class="editor-border">
                  <SJsonEditor :modelValue="apidocInfo.item.requestBody.raw?.data" read-only auto-height min-height="30px" :config="{ language: 'plaintext' }" />
                </div>
              </template>
              <div v-if="!bodyType" class="api-doc-empty">{{ t('暂无请求体参数') }}</div>
            </div>
          </div>
          
          <!-- 响应块 -->
          <div class="api-doc-block">
            <div class="api-doc-block-header" @click="toggleBlock('response')">
              <div class="collapse-button" :class="{ 'collapsed': !expandedBlocks.response }">
                <el-icon><ArrowDown /></el-icon>
              </div>
              <div class="api-doc-block-title">{{ t('响应') }}</div>
            </div>
            <div class="api-doc-block-content" v-show="expandedBlocks.response">
              <div v-if="apidocInfo.item.responseParams.length > 0">
                <el-tabs v-model="activeResponseTab" type="card" class="response-tabs">
                  <el-tab-pane 
                    v-for="(item, index) in apidocInfo.item.responseParams" 
                    :key="index"
                    :label="`${item.title} (${item.statusCode}) ${simplifyDataType(item.value.dataType)}`"
                    :name="String(index)">
                    <template v-if="getResponseLanguage(item.value.dataType) === 'json'">
                      <div class="editor-border">
                        <SJsonEditor :modelValue="formatJsonString(item.value.strJson)" read-only auto-height min-height="30px" :config="{ language: 'json' }" />
                      </div>
                    </template>
                    <template v-else-if="getResponseLanguage(item.value.dataType) === 'xml'">
                      <div class="editor-border">
                        <SJsonEditor :modelValue="item.value.text" read-only auto-height min-height="30px" :config="{ language: 'xml' }" />
                      </div>
                    </template>
                    <template v-else-if="getResponseLanguage(item.value.dataType) === 'html'">
                      <div class="editor-border">
                        <SJsonEditor :modelValue="item.value.text" read-only auto-height min-height="30px" :config="{ language: 'html' }" />
                      </div>
                    </template>
                    <template v-else-if="getResponseLanguage(item.value.dataType) === 'plaintext'">
                      <div class="editor-border">
                        <SJsonEditor :modelValue="item.value.text" read-only auto-height min-height="30px" :config="{ language: 'plaintext' }" />
                      </div>
                    </template>
                    <template v-else>
                      <pre class="pre api-doc-raw-body">{{ item.value.text }}</pre>
                    </template>
                  </el-tab-pane>
                </el-tabs>
              </div>
              <div v-else class="api-doc-empty">{{ t('暂无响应数据') }}</div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watchEffect, defineAsyncComponent, onMounted } from 'vue';
import { storeToRefs } from 'pinia'
import { ArrowDown } from '@element-plus/icons-vue';
import { formatDate, getCompiledTemplate } from '../helper'
import { useShareStore } from '../store';
import { getShareCollapseState, updateShareBlockCollapseState } from '../cache/shareCache';
import type { ApidocProperty } from '@src/types';
import type { HttpNode } from '@src/types';
import { useI18n } from 'vue-i18n';
import { defaultRequestMethods } from '../common';

const SJsonEditor = defineAsyncComponent(() => import('../common/SCodeViewer.vue'));
const SParamsView = defineAsyncComponent(() => import('./SParamsView.vue'));

const { t } = useI18n();
const shareStore = useShareStore();
const { activeDocInfo } = storeToRefs(shareStore);
const apidocInfo = computed(() => activeDocInfo.value as HttpNode | null);
const fullUrl = ref('');
const activeResponseTab = ref('0');

const expandedBlocks = ref({
  query: true,
  headers: true,
  body: true,
  response: true,
});

onMounted(() => {
  if (apidocInfo.value?._id) {
    const cache = getShareCollapseState(apidocInfo.value._id);
    if (cache) {
      expandedBlocks.value = { ...expandedBlocks.value, ...cache };
    }
  }
});

watchEffect(async () => {
  if (!apidocInfo.value) return '';
  const { prefix, path } = apidocInfo.value.item.url || { prefix: '', path: '' };
  const rawUrl = `${prefix}${path}`;
  const compiledUrl = await getCompiledTemplate(rawUrl, shareStore.varibles);
  fullUrl.value = typeof compiledUrl === 'string' ? compiledUrl : String(compiledUrl ?? '');
});

const getMethodColor = (method: string) => {
  const methodItem = defaultRequestMethods.find(m => m.value.toLowerCase() === method.toLowerCase());
  return methodItem?.iconColor || '#17a2b8';
}

const hasQueryParams = computed(() => 
  apidocInfo.value?.item?.queryParams?.filter((p: ApidocProperty) => p.select).some((data: ApidocProperty) => data.key)
);
const actualQueryParams = computed(() => 
  apidocInfo.value?.item?.queryParams?.filter((p: ApidocProperty) => p.select && p.key) || []
);

const hasHeaders = computed(() => 
  apidocInfo.value?.item.headers?.filter((p: ApidocProperty) => p.select).some((data: ApidocProperty) => data.key)
);
const actualHeaders = computed(() => 
  apidocInfo.value?.item.headers?.filter((p: ApidocProperty) => p.select && p.key) || []
);

const bodyType = computed(() => {
  if (!apidocInfo.value?.item.requestBody) return '';
  const mode = apidocInfo.value.item.requestBody.mode;
  if (mode === 'json' && apidocInfo.value.item.requestBody.rawJson) return 'json';
  if (mode === 'formdata' && apidocInfo.value.item.requestBody.formdata?.length) return 'formdata';
  if (mode === 'urlencoded' && apidocInfo.value.item.requestBody.urlencoded?.length) return 'urlencoded';
  if (mode === 'raw' && apidocInfo.value.item.requestBody.raw?.data) {
    if (apidocInfo.value.item.requestBody.raw.dataType === 'text/plain') return 'text';
    return 'raw';
  }
  return '';
});

const formattedBodyJson = computed(() => {
  if (!apidocInfo.value?.item.requestBody?.rawJson) return '';
  try {
    const parsed = JSON.parse(apidocInfo.value.item.requestBody.rawJson);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return apidocInfo.value.item.requestBody.rawJson;
  }
});

const toggleBlock = (block: 'query' | 'headers' | 'body' | 'response') => {
  expandedBlocks.value[block] = !expandedBlocks.value[block];
  if (apidocInfo.value?._id) {
    updateShareBlockCollapseState(apidocInfo.value._id, block, expandedBlocks.value[block]);
  }
}

const simplifyDataType = (dataType: string) => {
  if (dataType.includes('json')) return 'JSON';
  if (dataType.includes('xml')) return 'XML';
  if (dataType.includes('html')) return 'HTML';
  if (dataType.includes('text')) return 'Text';
  return dataType;
}

const getResponseLanguage = (dataType: string) => {
  if (dataType.includes('json')) return 'json';
  if (dataType.includes('xml')) return 'xml';
  if (dataType.includes('html')) return 'html';
  return 'plaintext';
}

const formatJsonString = (jsonStr: string) => {
  if (!jsonStr) return '';
  try {
    const parsed = JSON.parse(jsonStr);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return jsonStr;
  }
}
</script>

<style scoped>
@import './contentCommon.css';

.method-label {
  padding: 3px 12px;
  border-radius: var(--border-radius-sm);
  color: var(--white);
  font-weight: bold;
  text-transform: uppercase;
  
  &.get {
    background-color: #28a745;
  }
  
  &.post {
    background-color: #ffc107;
  }
  
  &.put {
    background-color: #409EFF;
  }
  
  &.delete {
    background-color: #f56c6c;
  }
  
  &.patch {
    background-color: #17a2b8;
  }
  
  &.head {
    background-color: #17a2b8;
  }
  
  &.options {
    background-color: #17a2b8;
  }
}

.content-format-label {
  font-size: 12px;
  background: var(--color-share-purple);
  color: var(--theme-color);
  border-radius: var(--border-radius-sm);
  padding: 2px 8px;
  margin-left: 8px;
}

.response-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 12px;
  }
  
  :deep(.el-tabs__item) {
    font-size: 12px;
  }
}
</style>
