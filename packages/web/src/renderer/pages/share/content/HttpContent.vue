<template>
  <div class="share-doc-detail http-content">
    <div class="doc-detail">
      <template v-if="apidocInfo">
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
          <div class="api-doc-env-row">
            <el-select
              v-if="shareStore.environments.length > 0"
              v-model="shareStore.activeEnvironmentId"
              size="small"
              class="env-select"
              @change="onEnvironmentChange"
            >
              <el-option
                v-for="env in shareStore.environments"
                :key="env._id"
                :label="env.name"
                :value="env._id"
              />
            </el-select>
            <span v-if="currentBaseUrl" class="base-url-label">{{ currentBaseUrl }}</span>
            <div class="api-doc-base-info-inline">
              <span class="mr-1">{{ apidocInfo.info.maintainer || apidocInfo.info.creator }}</span>
              <span>{{ t('更新于') }}:</span>
              <span>{{ formatDate(apidocInfo.updatedAt) }}</span>
            </div>
          </div>
        </div>

        <div class="api-doc-tabs-bar">
          <div
            v-for="tab in viewTabs"
            :key="tab.key"
            :class="['api-doc-tab', { active: activeViewTab === tab.key }]"
            @click="activeViewTab = tab.key"
          >{{ tab.label }}</div>
        </div>

        <div class="api-doc-tab-content">
          <template v-if="activeViewTab === 'doc'">
            <div class="api-doc-blocks">
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

          <template v-if="activeViewTab === 'debug'">
            <div class="debug-panel">
              <div class="debug-request-section">
                <div class="debug-send-bar">
                  <span class="method-badge" :style="{ backgroundColor: getMethodColor(apidocInfo.item.method) }">
                    {{ apidocInfo.item.method.toUpperCase() }}
                  </span>
                  <span class="debug-url">{{ debugFullUrl }}</span>
                  <el-button type="primary" size="small" :loading="debugLoading" @click="handleSendDebug">
                    {{ t('发送') }}
                  </el-button>
                </div>
                <el-tabs v-model="debugRequestTab" type="card" class="debug-request-tabs">
                  <el-tab-pane :label="t('Query参数')" name="params">
                    <div class="debug-params-section">
                      <div v-if="debugQueryParams.length > 0" class="debug-params-table">
                        <table>
                          <thead>
                            <tr>
                              <th>{{ t('启用') }}</th>
                              <th>{{ t('参数名') }}</th>
                              <th>{{ t('参数值') }}</th>
                              <th>{{ t('操作') }}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(param, index) in debugQueryParams" :key="index">
                              <td><el-checkbox v-model="param.enabled" /></td>
                              <td><el-input v-model="param.key" size="small" /></td>
                              <td><el-input v-model="param.value" size="small" /></td>
                              <td><el-button size="small" @click="removeDebugQueryParam(index)">删除</el-button></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div v-else class="debug-params-empty">{{ t('暂无Query参数') }}</div>
                      <el-button size="small" @click="addDebugQueryParam">{{ t('添加参数') }}</el-button>
                    </div>
                  </el-tab-pane>
                  <el-tab-pane :label="t('请求头')" name="headers">
                    <div class="debug-params-section">
                      <div v-if="debugHeaders.length > 0" class="debug-params-table">
                        <table>
                          <thead>
                            <tr>
                              <th>{{ t('启用') }}</th>
                              <th>{{ t('参数名') }}</th>
                              <th>{{ t('参数值') }}</th>
                              <th>{{ t('操作') }}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(header, index) in debugHeaders" :key="index">
                              <td><el-checkbox v-model="header.enabled" /></td>
                              <td><el-input v-model="header.key" size="small" /></td>
                              <td><el-input v-model="header.value" size="small" /></td>
                              <td><el-button size="small" @click="removeDebugHeader(index)">删除</el-button></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div v-else class="debug-params-empty">{{ t('暂无请求头') }}</div>
                      <el-button size="small" @click="addDebugHeader">{{ t('添加请求头') }}</el-button>
                    </div>
                  </el-tab-pane>
                  <el-tab-pane :label="t('请求体')" name="body">
                    <div class="debug-body-section">
                      <div v-if="bodyType" class="editor-border">
                        <SJsonEditor
                          v-model="debugBody"
                          auto-height
                          min-height="150px"
                          max-height="400px"
                          :config="{ language: bodyType === 'json' ? 'json' : 'plaintext' }"
                        />
                      </div>
                      <div v-else class="debug-body-empty">{{ t('此接口无请求体') }}</div>
                    </div>
                  </el-tab-pane>
                </el-tabs>
              </div>
              <div class="debug-resize-bar" @mousedown="startResize"></div>
              <div class="debug-response-section">
                <div class="response-tabs-header">
                  <span class="response-label">{{ t('响应') }}</span>
                  <span v-if="debugResponse" class="debug-response-status" :class="debugResponse.statusCode < 400 ? 'success' : 'error'">
                    {{ debugResponse.statusCode }}
                  </span>
                  <span v-if="debugResponse" class="debug-response-time">{{ debugResponse.rt }}ms</span>
                  <span v-if="debugResponse" class="debug-response-size">{{ formatBytes(debugResponse.bodyByteLength || 0) }}</span>
                </div>
                <div v-if="debugResponse" class="response-content">
                  <el-tabs v-model="debugResponseTab" type="card" class="debug-response-tabs">
                    <el-tab-pane :label="t('响应体')" name="body">
                      <div class="editor-border">
                        <SJsonEditor
                          :modelValue="debugResponseBody"
                          auto-height
                          min-height="100px"
                          max-height="500px"
                          read-only
                          :config="{ language: debugResponseContentType }"
                        />
                      </div>
                    </el-tab-pane>
                    <el-tab-pane :label="t('响应头')" name="headers">
                      <div class="api-doc-table">
                      <table>
                        <thead>
                          <tr><th>Key</th><th>Value</th></tr>
                        </thead>
                        <tbody>
                          <tr v-for="(val, key) in debugResponse.headers" :key="key">
                            <td>{{ key }}</td>
                            <td>
                              {{ 
                                Array.isArray(val) 
                                  ? val.join('; ') 
                                  : (val && typeof val === 'object' ? JSON.stringify(val) : String(val)) 
                              }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    </el-tab-pane>
                  </el-tabs>
                </div>
                <div v-else-if="debugLoading" class="response-content">
                  <div class="debug-loading">
                    <el-icon class="is-loading"><Loading /></el-icon>
                    <span>{{ t('请求发送中...') }}</span>
                  </div>
                </div>
                <div v-else-if="debugError" class="response-content">
                  <div class="debug-error">{{ debugError }}</div>
                </div>
                <div v-else class="response-content">
                  <div class="response-empty">
                    <div class="empty-icon"><span class="el-icon-send"></span></div>
                    <span>{{ t('发送请求后，响应结果将在这里显示') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template v-if="activeViewTab === 'code'">
            <div class="code-gen-panel">
              <div class="code-gen-lang-bar">
                <el-select v-model="codeGenLang" size="small" class="code-gen-lang-select">
                  <el-option v-for="lang in codeGenLanguages" :key="lang.value" :label="lang.label" :value="lang.value" />
                </el-select>
                <el-button size="small" @click="copyCodeGen">{{ t('复制') }}</el-button>
              </div>
              <div class="editor-border code-gen-editor">
                <SJsonEditor
                  :modelValue="generatedCode"
                  read-only
                  auto-height
                  min-height="100px"
                  max-height="600px"
                  :auto-format="false"
                  :config="{ language: codeGenLangConfig }"
                />
              </div>
            </div>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watchEffect, defineAsyncComponent, onMounted } from 'vue';
import { storeToRefs } from 'pinia'
import { ArrowDown, Loading } from '@element-plus/icons-vue';
import { formatDate, getCompiledTemplate } from '../helper'
import { useShareStore } from '../store';
import { getShareCollapseState, updateShareBlockCollapseState } from '../cache/shareCache';
import type { ApidocProperty } from '@src/types';
import type { HttpNode } from '@src/types';
import { useI18n } from 'vue-i18n';
import { defaultRequestMethods } from '../common';
import { request } from '../api/shareApi';

const SJsonEditor = defineAsyncComponent(() => import('../common/SCodeViewer.vue'));
const SParamsView = defineAsyncComponent(() => import('./SParamsView.vue'));

const { t } = useI18n();
const shareStore = useShareStore();
const { activeDocInfo } = storeToRefs(shareStore);
const apidocInfo = computed(() => activeDocInfo.value as HttpNode | null);
const fullUrl = ref('');
const activeResponseTab = ref('0');

const viewTabs = computed(() => [
  { key: 'doc', label: t('文档') },
  { key: 'debug', label: t('调试') },
  { key: 'code', label: t('代码') },
]);
const activeViewTab = ref('doc');

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

const currentBaseUrl = computed(() => {
  const env = shareStore.activeEnvironment;
  if (env?.baseUrl) return env.baseUrl;
  const urlInfo = apidocInfo.value?.item?.url;
  if (urlInfo?.prefix) return urlInfo.prefix;
  return '';
});

const onEnvironmentChange = () => {};

watchEffect(async () => {
  if (!apidocInfo.value) return;
  const urlInfo = apidocInfo.value.item.url || { prefix: '', path: '' };
  const env = shareStore.activeEnvironment;
  const effectivePrefix = env?.baseUrl || urlInfo.prefix || '';
  const rawUrl = `${effectivePrefix}${urlInfo.path}`;
  const compiledUrl = await getCompiledTemplate(rawUrl, shareStore.mergedVariables);
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

const debugFullUrl = computed(() => fullUrl.value);
const debugLoading = ref(false);
const debugResponse = ref<any>(null);
const debugError = ref('');
const debugResponseTab = ref('body');
const debugRequestTab = ref('params');

const debugQueryParams = ref<Array<{ key: string; value: string; enabled: boolean }>>([]);
const debugHeaders = ref<Array<{ key: string; value: string; enabled: boolean }>>([]);
const debugBody = ref('');

const initDebugParams = () => {
  if (!apidocInfo.value) return;
  debugQueryParams.value = actualQueryParams.value.map((p: ApidocProperty) => ({
    key: p.key || '',
    value: p.value || '',
    enabled: p.select || false,
  }));
  debugHeaders.value = actualHeaders.value.map((p: ApidocProperty) => ({
    key: p.key || '',
    value: p.value || '',
    enabled: p.select || false,
  }));
  if (bodyType.value === 'json' && apidocInfo.value.item.requestBody?.rawJson) {
    try {
      const parsed = JSON.parse(apidocInfo.value.item.requestBody.rawJson);
      debugBody.value = JSON.stringify(parsed, null, 2);
    } catch {
      debugBody.value = apidocInfo.value.item.requestBody.rawJson || '';
    }
  } else if (bodyType.value === 'urlencoded' && apidocInfo.value.item.requestBody?.urlencoded) {
    const params = apidocInfo.value.item.requestBody.urlencoded.filter((p: ApidocProperty) => p.select && p.key);
    debugBody.value = params.map((p: ApidocProperty) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value || '')}`).join('&');
  } else if ((bodyType.value === 'raw' || bodyType.value === 'text') && apidocInfo.value.item.requestBody?.raw?.data) {
    debugBody.value = apidocInfo.value.item.requestBody.raw.data;
  } else {
    debugBody.value = '';
  }
};

watch(() => activeViewTab.value, (newTab) => {
  if (newTab === 'debug') {
    initDebugParams();
  }
});

const addDebugQueryParam = () => {
  debugQueryParams.value.push({ key: '', value: '', enabled: true });
};

const removeDebugQueryParam = (index: number) => {
  debugQueryParams.value.splice(index, 1);
};

const addDebugHeader = () => {
  debugHeaders.value.push({ key: '', value: '', enabled: true });
};

const removeDebugHeader = (index: number) => {
  debugHeaders.value.splice(index, 1);
};

const responseHeight = ref(300);
const isResizing = ref(false);

const startResize = () => {
  isResizing.value = true;
  document.addEventListener('mousemove', onResize);
  document.addEventListener('mouseup', stopResize);
};

const onResize = (e: MouseEvent) => {
  if (!isResizing.value) return;
  const debugPanel = document.querySelector('.debug-panel') as HTMLElement;
  if (!debugPanel) return;
  const panelRect = debugPanel.getBoundingClientRect();
  const newHeight = panelRect.height - (e.clientY - (panelRect.top + panelRect.height - responseHeight.value));
  responseHeight.value = Math.max(150, Math.min(600, newHeight));
};

const stopResize = () => {
  isResizing.value = false;
  document.removeEventListener('mousemove', onResize);
  document.removeEventListener('mouseup', stopResize);
};

const debugResponseContentType = computed(() => {
  if (!debugResponse.value?.contentType) return 'plaintext';
  const ct = debugResponse.value.contentType;
  if (ct.includes('json')) return 'json';
  if (ct.includes('html')) return 'html';
  if (ct.includes('xml')) return 'xml';
  return 'plaintext';
});

const debugResponseBody = computed(() => {
  if (!debugResponse.value?.body) return '';
  const body = debugResponse.value.body;
  
  try {
    if (typeof body === 'string') {
      // 尝试从 base64 解码
      try {
        const binaryString = atob(body);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const textContent = new TextDecoder('utf-8').decode(bytes);
        
        // 尝试解析为 JSON 并格式化
        try {
          return JSON.stringify(JSON.parse(textContent), null, 2);
        } catch {
          return textContent;
        }
      } catch {
        // base64 解码失败，直接当作字符串返回
        return body;
      }
    } else {
      // 不是字符串，直接返回字符串化
      return String(body);
    }
  } catch (e) {
    console.error('解析响应体失败:', e);
    return String(body);
  }
});

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const buildDebugRequest = async () => {
  if (!apidocInfo.value) return null;
  const urlInfo = apidocInfo.value.item.url || { prefix: '', path: '' };
  const env = shareStore.activeEnvironment;
  const effectivePrefix = env?.baseUrl || urlInfo.prefix || '';
  const rawUrl = `${effectivePrefix}${urlInfo.path}`;
  const compiledUrl = await getCompiledTemplate(rawUrl, shareStore.mergedVariables);
  let url = typeof compiledUrl === 'string' ? compiledUrl : String(compiledUrl ?? '');

  const queryParams: Record<string, string> = {};
  debugQueryParams.value.forEach((p) => {
    if (p.key && p.enabled) {
      queryParams[p.key] = p.value || '';
    }
  });

  if (Object.keys(queryParams).length > 0) {
    const queryString = Object.entries(queryParams)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    url += (url.includes('?') ? '&' : '?') + queryString;
  }

  const headers: Record<string, string> = {};
  debugHeaders.value.forEach((p) => {
    if (p.key && p.enabled) {
      headers[p.key] = p.value || '';
    }
  });

  let body: string | undefined;
  let bodyTypeVal: string = 'none';
  if (debugBody.value) {
    if (bodyType.value === 'json') {
      body = debugBody.value;
      bodyTypeVal = 'json';
    } else if (bodyType.value === 'urlencoded') {
      body = debugBody.value;
      bodyTypeVal = 'urlencoded';
    } else if (bodyType.value === 'raw' || bodyType.value === 'text') {
      body = debugBody.value;
      bodyTypeVal = 'raw';
    }
  }

  return {
    url,
    method: apidocInfo.value.item.method.toUpperCase(),
    headers,
    timeout: 30000,
    followRedirect: true,
    maxRedirects: 10,
    bodyType: bodyTypeVal,
    body,
    enableStream: false,
  };
};

const handleSendDebug = async () => {
  debugLoading.value = true;
  debugResponse.value = null;
  debugError.value = '';
  try {
    const params = await buildDebugRequest();
    if (!params) return;
    console.log('调试请求参数:', params);
    const res: any = await request.post('/api/proxy/http', params);
    console.log('调试响应:', res);
    
    // 处理三层嵌套响应：{ code, msg, data: { success, data: ProxyResponse } }
    let proxyData = res;
    
    // 第一层：检查是否有 code 和 data
    if (res?.code !== undefined && res?.data) {
      proxyData = res.data;
    }
    
    // 第二层：检查是否有 success 和 data
    if (proxyData?.success === false) {
      debugError.value = proxyData.message || t('请求失败');
      return;
    }
    
    if (proxyData?.success === true && proxyData?.data) {
      proxyData = proxyData.data;
    }
    
    if (!proxyData || typeof proxyData !== 'object') {
      debugError.value = t('响应格式错误');
      return;
    }

    if (!('statusCode' in proxyData)) {
      debugError.value = t('响应缺少必要字段');
      return;
    }

    debugResponse.value = proxyData;
  } catch (err: any) {
    console.error('调试请求失败:', err);
    debugError.value = err?.message || t('请求失败');
  } finally {
    debugLoading.value = false;
  }
};

const codeGenLang = ref('curl');
const codeGenLanguages = [
  { label: 'Shell/cURL', value: 'curl' },
  { label: 'HTTP', value: 'http' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'Go', value: 'go' },
  { label: 'PHP', value: 'php' },
  { label: 'Swift', value: 'swift' },
];

const codeGenLangConfig = computed(() => {
  const map: Record<string, string> = {
    curl: 'bash',
    http: 'plaintext',
    javascript: 'javascript',
    python: 'python',
    java: 'java',
    go: 'go',
    php: 'php',
    swift: 'swift',
  };
  return map[codeGenLang.value] || 'plaintext';
});

const generatedCode = computed(() => {
  if (!apidocInfo.value) return '';
  const urlInfo = apidocInfo.value.item.url || { prefix: '', path: '' };
  const env = shareStore.activeEnvironment;
  const effectivePrefix = env?.baseUrl || urlInfo.prefix || '';
  const rawUrl = `${effectivePrefix}${urlInfo.path}`;
  const method = apidocInfo.value.item.method.toUpperCase();
  const headers: Record<string, string> = {};
  actualHeaders.value.forEach((p: ApidocProperty) => {
    if (p.key && p.select) headers[p.key] = p.value || '';
  });
  const queryParams: Record<string, string> = {};
  actualQueryParams.value.forEach((p: ApidocProperty) => {
    if (p.key && p.select) queryParams[p.key] = p.value || '';
  });
  let bodyStr = '';
  if (bodyType.value === 'json' && apidocInfo.value.item.requestBody.rawJson) {
    bodyStr = apidocInfo.value.item.requestBody.rawJson;
  } else if (bodyType.value === 'urlencoded' && apidocInfo.value.item.requestBody.urlencoded?.length) {
    const params = apidocInfo.value.item.requestBody.urlencoded.filter((p: ApidocProperty) => p.select && p.key);
    bodyStr = params.map((p: ApidocProperty) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value || '')}`).join('&');
  } else if ((bodyType.value === 'raw' || bodyType.value === 'text') && apidocInfo.value.item.requestBody.raw?.data) {
    bodyStr = apidocInfo.value.item.requestBody.raw.data;
  }

  const queryString = Object.keys(queryParams).length > 0
    ? '?' + Object.entries(queryParams).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
    : '';
  const fullReqUrl = `${rawUrl}${queryString}`;

  switch (codeGenLang.value) {
    case 'curl':
      return generateCurl(method, fullReqUrl, headers, bodyStr);
    case 'http':
      return generateHttp(method, fullReqUrl, headers, bodyStr);
    case 'javascript':
      return generateJavaScript(method, fullReqUrl, headers, bodyStr);
    case 'python':
      return generatePython(method, fullReqUrl, headers, bodyStr);
    case 'java':
      return generateJava(method, fullReqUrl, headers, bodyStr);
    case 'go':
      return generateGo(method, fullReqUrl, headers, bodyStr);
    case 'php':
      return generatePhp(method, fullReqUrl, headers, bodyStr);
    case 'swift':
      return generateSwift(method, fullReqUrl, headers, bodyStr);
    default:
      return '';
  }
});

const generateCurl = (method: string, url: string, headers: Record<string, string>, body: string) => {
  let cmd = `curl --location --request ${method} '${url}'`;
  Object.entries(headers).forEach(([k, v]) => {
    cmd += ` \\\n--header '${k}: ${v}'`;
  });
  if (body) {
    if (bodyType.value === 'json') {
      try {
        const parsed = JSON.parse(body);
        const compact = JSON.stringify(parsed);
        cmd += ` \\\n--data-raw '${compact}'`;
      } catch {
        cmd += ` \\\n--data-raw '${body}'`;
      }
    } else {
      cmd += ` \\\n--data-raw '${body}'`;
    }
  }
  return cmd;
};

const generateHttp = (method: string, url: string, headers: Record<string, string>, body: string) => {
  let code = `${method} ${url}`;
  Object.entries(headers).forEach(([k, v]) => {
    code += `\n${k}: ${v}`;
  });
  if (body) {
    code += `\n\n${body}`;
  }
  return code;
};

const generateJavaScript = (method: string, url: string, headers: Record<string, string>, body: string) => {
  const headerEntries = Object.entries(headers);
  const headersStr = headerEntries.length > 0
    ? `,\n  headers: ${JSON.stringify(Object.fromEntries(headerEntries), null, 4).split('\n').join('\n  ')}`
    : '';
  const bodyStr = body ? `,\n  body: ${bodyType.value === 'json' ? body : JSON.stringify(body)}` : '';
  return `fetch('${url}', {\n  method: '${method}'${headersStr}${bodyStr}\n})\n.then(response => response.json())\n.then(data => console.log(data))\n.catch(error => console.error(error));`;
};

const generatePython = (method: string, url: string, headers: Record<string, string>, body: string) => {
  let code = `import requests\n\nurl = "${url}"\n`;
  if (Object.keys(headers).length > 0) {
    code += `headers = ${JSON.stringify(Object.fromEntries(Object.entries(headers)), null, 4)}\n`;
  }
  if (body) {
    if (bodyType.value === 'json') {
      try {
        const parsed = JSON.parse(body);
        code += `payload = ${JSON.stringify(parsed, null, 4)}\n\nresponse = requests.${method.toLowerCase()}(url, headers=headers, json=payload)\n`;
      } catch {
        code += `payload = '${body}'\n\nresponse = requests.${method.toLowerCase()}(url, headers=headers, data=payload)\n`;
      }
    } else {
      code += `payload = '${body}'\n\nresponse = requests.${method.toLowerCase()}(url, headers=headers, data=payload)\n`;
    }
  } else {
    code += `\nresponse = requests.${method.toLowerCase()}(url, headers=headers)\n`;
  }
  code += `print(response.status_code)\nprint(response.text)`;
  return code;
};

const generateJava = (method: string, url: string, headers: Record<string, string>, body: string) => {
  let code = `import java.net.http.HttpClient;\nimport java.net.http.HttpRequest;\nimport java.net.http.HttpResponse;\nimport java.net.URI;\n\n`;
  code += `HttpClient client = HttpClient.newHttpClient();\n`;
  const bodyStr = body ? `, HttpRequest.BodyPublishers.ofString("${body.replace(/"/g, '\\"')}")` : '';
  code += `HttpRequest request = HttpRequest.newBuilder()\n    .uri(URI.create("${url}"))\n    .${method.toLowerCase()}(${bodyStr})\n`;
  Object.entries(headers).forEach(([k, v]) => {
    code += `    .header("${k}", "${v}")\n`;
  });
  code += `    .build();\n\n`;
  code += `HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());\nSystem.out.println(response.statusCode());\nSystem.out.println(response.body());`;
  return code;
};

const generateGo = (method: string, url: string, headers: Record<string, string>, body: string) => {
  let code = `package main\n\nimport (\n    "fmt"\n    "io"\n    "net/http"`;
  if (body) code += `\n    "strings"`;
  code += `\n)\n\nfunc main() {\n`;
  if (body) {
    code += `    body := strings.NewReader(\`${body}\`)\n    req, _ := http.NewRequest("${method}", "${url}", body)\n`;
  } else {
    code += `    req, _ := http.NewRequest("${method}", "${url}", nil)\n`;
  }
  Object.entries(headers).forEach(([k, v]) => {
    code += `    req.Header.Set("${k}", "${v}")\n`;
  });
  code += `    client := &http.Client{}\n    resp, _ := client.Do(req)\n    defer resp.Body.Close()\n    respBody, _ := io.ReadAll(resp.Body)\n    fmt.Println(resp.StatusCode)\n    fmt.Println(string(respBody))\n}`;
  return code;
};

const generatePhp = (method: string, url: string, headers: Record<string, string>, body: string) => {
  let code = `<?php\n\n$ch = curl_init();\n\ncurl_setopt($ch, CURLOPT_URL, '${url}');\ncurl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\ncurl_setopt($ch, CURLOPT_CUSTOMREQUEST, '${method}');\n`;
  if (Object.keys(headers).length > 0) {
    const headerArr = Object.entries(headers).map(([k, v]) => `'${k}: ${v}'`).join(', ');
    code += `curl_setopt($ch, CURLOPT_HTTPHEADER, [${headerArr}]);\n`;
  }
  if (body) {
    code += `curl_setopt($ch, CURLOPT_POSTFIELDS, '${body.replace(/'/g, "\\'")}');\n`;
  }
  code += `\n$response = curl_exec($ch);\n$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);\n\ncurl_close($ch);\n\necho $httpCode . "\\n";\necho $response . "\\n";`;
  return code;
};

const generateSwift = (method: string, url: string, headers: Record<string, string>, body: string) => {
  let code = `import Foundation\n\nlet url = URL(string: "${url}")!\nvar request = URLRequest(url: url)\nrequest.httpMethod = "${method}"\n`;
  Object.entries(headers).forEach(([k, v]) => {
    code += `request.addValue("${v}", forHTTPHeaderField: "${k}")\n`;
  });
  if (body) {
    code += `request.httpBody = "${body.replace(/"/g, '\\"')}".data(using: .utf8)\n`;
  }
  code += `\nlet task = URLSession.shared.dataTask(with: request) { data, response, error in\n    if let error = error {\n        print(error)\n        return\n    }\n    if let data = data, let body = String(data: data, encoding: .utf8) {\n        print(body)\n    }\n}\ntask.resume()`;
  return code;
};

const copyCodeGen = async () => {
  try {
    await navigator.clipboard.writeText(generatedCode.value);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = generatedCode.value;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
};
</script>

<style scoped>
@import './contentCommon.css';

.method-label {
  padding: 3px 12px;
  border-radius: var(--border-radius-sm);
  color: var(--white);
  font-weight: bold;
  text-transform: uppercase;

  &.get { background-color: #28a745; }
  &.post { background-color: #ffc107; }
  &.put { background-color: #409EFF; }
  &.delete { background-color: #f56c6c; }
  &.patch { background-color: #17a2b8; }
  &.head { background-color: #17a2b8; }
  &.options { background-color: #17a2b8; }
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
  :deep(.el-tabs__header) { margin-bottom: 12px; }
  :deep(.el-tabs__item) { font-size: 12px; }
}

.api-doc-env-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.env-select {
  width: 160px;
}

.base-url-label {
  font-family: SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
  font-size: 12px;
  color: var(--gray-600);
  background: var(--gray-100);
  padding: 2px 8px;
  border-radius: var(--border-radius-sm);
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.api-doc-tabs-bar {
  display: flex;
  border-bottom: 1px solid var(--gray-200);
  padding: 0 20px;
  background: var(--white);
  position: sticky;
  top: 0;
  z-index: 1;
}

.api-doc-tab {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: var(--gray-600);
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  user-select: none;

  &:hover { color: var(--primary); }
  &.active {
    color: var(--primary);
    border-bottom-color: var(--primary);
    font-weight: 500;
  }
}

.api-doc-tab-content {
  min-height: 200px;
}

.debug-panel {
  padding: 16px 20px;
}

.debug-send-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--gray-100);
  border-radius: var(--border-radius-sm);
  margin-bottom: 16px;
}

.method-badge {
  padding: 2px 10px;
  border-radius: var(--border-radius-sm);
  color: var(--white);
  font-weight: bold;
  font-size: 12px;
  text-transform: uppercase;
  white-space: nowrap;
}

.debug-url {
  flex: 1;
  font-family: SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
  font-size: 13px;
  color: var(--gray-800);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.debug-request-tabs {
  :deep(.el-tabs__header) { margin-bottom: 8px; }
  :deep(.el-tabs__item) { font-size: 12px; }
}

.debug-params-section {
  padding: 8px 0;
}

.debug-params-table {
  margin-bottom: 12px;
  
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    
    th, td {
      padding: 6px 12px;
      text-align: left;
      border-bottom: 1px solid var(--gray-200);
    }
    
    th {
      background: var(--gray-50);
      font-weight: 500;
      color: var(--gray-600);
    }
    
    :deep(.el-checkbox) { margin: 0; }
    :deep(.el-input) { width: 100%; }
  }
}

.debug-params-empty {
  text-align: center;
  padding: 20px;
  color: var(--gray-400);
  font-size: 13px;
}

.debug-body-section {
  padding: 8px 0;
}

.debug-body-empty {
  text-align: center;
  padding: 20px;
  color: var(--gray-400);
  font-size: 13px;
}

.debug-panel {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 180px);
  min-height: 500px;
}

.debug-request-section {
  flex: 1;
  overflow-y: auto;
  border-bottom: 1px solid var(--gray-200);
}

.debug-resize-bar {
  height: 6px;
  background: var(--gray-200);
  cursor: ns-resize;
  position: relative;
  
  &:hover {
    background: var(--gray-300);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 4px;
    background: var(--gray-400);
    border-radius: 2px;
  }
}

.debug-response-section {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  min-height: 150px;
  max-height: 600px;
}

.response-tabs-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: var(--gray-50);
  border-bottom: 1px solid var(--gray-200);
  
  .response-label {
    font-weight: 600;
    color: var(--gray-800);
    font-size: 14px;
  }
}

.response-content {
  flex: 1;
  padding: 12px 16px;
  overflow-y: auto;
}

.response-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--gray-400);
  
  .empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
  }
}

.debug-response-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: var(--gray-100);
  border-radius: var(--border-radius-sm);
}

.debug-response-status {
  font-weight: bold;
  font-size: 16px;
  &.success { color: var(--success); }
  &.error { color: var(--danger); }
}

.debug-response-time {
  color: var(--gray-600);
  font-size: 13px;
}

.debug-response-size {
  color: var(--gray-600);
  font-size: 13px;
}

.debug-response-tabs {
  :deep(.el-tabs__header) { margin-bottom: 8px; }
}

.debug-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px;
  color: var(--gray-600);
  justify-content: center;
}

.debug-error {
  padding: 12px 16px;
  background: #fef0f0;
  color: var(--danger);
  border-radius: var(--border-radius-sm);
  margin-top: 16px;
  font-size: 14px;
}

.code-gen-panel {
  padding: 16px 20px;
}

.code-gen-lang-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.code-gen-lang-select {
  width: 160px;
}

.code-gen-editor {
  border-radius: var(--border-radius-sm);
}
</style>
