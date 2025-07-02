<template>
  <div class="share-doc-detail">
    <!-- 当tabs为空时显示提示信息 -->
    <div v-if="!tabId" class="empty-tabs">
      <h2>{{ $t('暂无文档') }}</h2>
    </div>
    
    <SLoading v-else :loading="loading" class="doc-detail">
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
            <span class="api-url">{{ realFullUrl }}</span>
          </div>
          <div class="api-doc-base-info-inline">
            <span class="mr-1">{{ apidocInfo.info.maintainer || apidocInfo.info.creator }}</span>
            <span>{{ $t('更新于') }}:</span>
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
              <div class="api-doc-block-title">{{ $t('Query 参数') }}</div>
            </div>
            <div class="api-doc-block-content" v-show="expandedBlocks.query">
              <template v-if="hasQueryParams">
                <div class="api-doc-table">
                  <table>
                    <thead>
                      <tr>
                        <th>{{ $t('参数名') }}</th>
                        <th>{{ $t('参数值') }}</th>
                        <th>{{ $t('类型') }}</th>
                        <th>{{ $t('必填') }}</th>
                        <th>{{ $t('描述') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="param in actualQueryParams" :key="param._id">
                        <td>{{ param.key }}</td>
                        <td>{{ param.value }}</td>
                        <td>{{ param.type }}</td>
                        <td>
                          <span :class="['required-badge', param.required ? 'required' : 'optional']">
                            {{ param.required ? $t('是') : $t('否') }}
                          </span>
                        </td>
                        <td>{{ param.description || '-' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </template>
              <div v-else class="api-doc-empty">{{ $t('暂无 Query 参数') }}</div>
            </div>
          </div>

          <!-- 请求头块 -->
          <div class="api-doc-block">
            <div class="api-doc-block-header" @click="toggleBlock('headers')">
              <div class="collapse-button" :class="{ 'collapsed': !expandedBlocks.headers }">
                <el-icon><ArrowDown /></el-icon>
              </div>
              <div class="api-doc-block-title">{{ $t('请求头') }}</div>
            </div>
            <div class="api-doc-block-content" v-show="expandedBlocks.headers">
              <template v-if="hasHeaders">
                <div class="api-doc-table">
                  <table>
                    <thead>
                      <tr>
                        <th>{{ $t('参数名') }}</th>
                        <th>{{ $t('参数值') }}</th>
                        <th>{{ $t('类型') }}</th>
                        <th>{{ $t('必填') }}</th>
                        <th>{{ $t('描述') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="header in actualHeaders" :key="header._id">
                        <td>{{ header.key }}</td>
                        <td>{{ header.value }}</td>
                        <td>{{ header.type }}</td>
                        <td>
                          <span :class="['required-badge', header.required ? 'required' : 'optional']">
                            {{ header.required ? $t('是') : $t('否') }}
                          </span>
                        </td>
                        <td>{{ header.description || '-' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </template>
              <div v-else class="api-doc-empty">{{ $t('暂无请求头') }}</div>
            </div>
          </div>

          <!-- Body参数 -->
          <div class="api-doc-block">
            <div class="api-doc-block-header" @click="toggleBlock('body')">
              <div class="collapse-button" :class="{ 'collapsed': !expandedBlocks.body }">
                <el-icon><ArrowDown /></el-icon>
              </div>
              <div class="api-doc-block-title">
                {{ $t('Body参数') }}
                <span v-if="apidocInfo?.item.contentType" class="content-format-label">{{ apidocInfo.item.contentType }}</span>
              </div>
            </div>
            <div class="api-doc-block-content" v-show="expandedBlocks.body">
              <template v-if="bodyType === 'json'">
                <div class="border-gray-300">
                  <SJsonEditor :modelValue="apidocInfo.item.requestBody.rawJson" auto-height min-height="30px" read-only />
                </div>
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
                <div class="border-gray-300">
                  <SJsonEditor :modelValue="apidocInfo.item.requestBody.raw?.data" read-only auto-height min-height="30px" :config="{ language: 'plaintext' }" />
                </div>
              </template>
              <div v-if="!bodyType" class="api-doc-empty">{{ $t('暂无请求体参数') }}</div>
            </div>
          </div>

          <!-- 响应块 -->
          <div class="api-doc-block">
            <div class="api-doc-block-header" @click="toggleBlock('response')">
              <div class="collapse-button" :class="{ 'collapsed': !expandedBlocks.response }">
                <el-icon><ArrowDown /></el-icon>
              </div>
              <div class="api-doc-block-title">{{ $t('响应') }}</div>
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
                      <div class="border-gray-300">
                        <SJsonEditor :modelValue="item.value.strJson" read-only auto-height min-height="30px" :config="{ language: 'json' }" />
                      </div>
                    </template>
                    <template v-else-if="getResponseLanguage(item.value.dataType) === 'xml'">
                      <div class="border-gray-300">
                        <SJsonEditor :modelValue="item.value.text" read-only auto-height min-height="30px" :config="{ language: 'xml' }" />
                      </div>
                    </template>
                    <template v-else-if="getResponseLanguage(item.value.dataType) === 'html'">
                      <div class="border-gray-300">
                        <SJsonEditor :modelValue="item.value.text" read-only auto-height min-height="30px" :config="{ language: 'html' }" />
                      </div>
                    </template>
                    <template v-else-if="getResponseLanguage(item.value.dataType) === 'plaintext'">
                      <div class="border-gray-300">
                        <SJsonEditor :modelValue="item.value.text" read-only auto-height min-height="30px" :config="{ language: 'plaintext' }" />
                      </div>
                    </template>
                    <template v-else>
                      <pre class="pre api-doc-raw-body">{{ item.value.text }}</pre>
                    </template>
                  </el-tab-pane>
                </el-tabs>
              </div>
              <div v-else class="api-doc-empty">{{ $t('暂无响应数据') }}</div>
            </div>
          </div>
        </div>
      </template>
    </SLoading>
  </div>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted, computed, watch } from 'vue';
import { ApidocDetail, Response, ApidocProperty } from '@src/types/global';
import { request } from '@/api/api';
import SLoading from '@/components/common/loading/g-loading.vue';
import { ArrowDown } from '@element-plus/icons-vue';
import SJsonEditor from '@/components/common/json-editor/g-json-editor.vue';
import { formatDate } from '@/helper';
import { apidocCache } from '@/cache/apidoc';
import { defaultRequestMethods } from '../common';
import { convertTemplateValueToRealValue } from '@/utils/utils';
import { $t } from '@/i18n/i18n';
import SParamsView from '@/components/apidoc/params-view/g-params-view.vue';
import { useShareTabsStore, useShareDocStore } from '../store';
import { ApidocTab } from '@src/types/apidoc/tabs';
import { useRoute } from 'vue-router';

/*
|--------------------------------------------------------------------------
| 变量定义
|--------------------------------------------------------------------------
*/
// 检查是否为HTML模式
const useForHtml = computed(() => {
  try {
    return !!(window as any).SHARE_DATA
  } catch {
    return false
  }
})

const loading = ref(false);
const apidocInfo: Ref<ApidocDetail | null> = ref(null);
const expandedBlocks = ref({
  query: true,
  headers: true,
  body: true,
  response: true, 
});
const actualQueryParams = ref<ApidocProperty[]>([]);
const actualHeaders = ref<ApidocProperty[]>([]);
const activeResponseTab = ref('0'); // 当前选中的响应 tab
const route = useRoute();
// Store 实例
const apidocTabsStore = useShareTabsStore();
const shareDocStore = useShareDocStore();
const tabs = apidocTabsStore.tabs;
const shareId = ref(route.query.share_id);

// 监听tabs变化，自动设置shareId为第一个key
watch(
  () => Object.keys(tabs.value),
  (keys) => {
    if (keys.length > 0) {
      shareId.value = keys[0];
    } else {
      shareId.value = '';
    }
  },
  { immediate: true }
);

const tabId = computed(() => {
  const tabArr = (tabs.value[shareId.value] || []) as ApidocTab[];
  const selectedTab = tabArr.find((tab: ApidocTab) => tab.selected);
  return selectedTab?._id || '';
});

const requestMethods = ref(defaultRequestMethods);

// Computed 属性
const realFullUrl = ref('');
watch([
  apidocInfo,
  () => shareDocStore.objectVariable
], async () => {
  if (!apidocInfo.value) {
    realFullUrl.value = '';
    return;
  }
  const { host, path } = apidocInfo.value.item.url || { host: '', path: '' };
  const rawUrl = `${host}${path}`;
  realFullUrl.value = await convertTemplateValueToRealValue(rawUrl, shareDocStore.objectVariable);
}, { immediate: true });

const filteredQueryParams = computed(() => {
  if (!apidocInfo.value) return [];
  return apidocInfo.value.item.queryParams.filter(p => p.select && p.key);
});

const filteredHeaders = computed(() => {
  if (!apidocInfo.value) return [];
  return apidocInfo.value.item.headers.filter(p => p.select && p.key);
});

const hasQueryParams = computed(() => apidocInfo.value?.item.queryParams?.filter(p => p.select).some(data => data.key));
const hasHeaders = computed(() => apidocInfo.value?.item.headers?.filter(p => p.select).some(data => data.key));

// Body参数类型优先级
const bodyType = computed(() => {
  if (!apidocInfo.value) return '';
  const { contentType, requestBody } = apidocInfo.value.item;
  if (contentType === 'application/json' && requestBody.mode === 'json') return 'json';
  if (contentType === 'multipart/form-data') return 'formdata';
  if (contentType === 'application/x-www-form-urlencoded') return 'urlencoded';
  if (requestBody.mode === 'raw' && requestBody.raw?.data) return 'raw';
  if (contentType && contentType.startsWith('text/')) return 'text';
  return '';
});

// 响应内容类型辅助
function getResponseLanguage(type: string) {
  if (type.includes('json')) return 'json';
  if (type.includes('xml')) return 'xml';
  if (type.includes('html')) return 'html';
  if (type.includes('plain')) return 'plaintext';
  return '';
}

/*
|--------------------------------------------------------------------------
| 初始化数据获取逻辑
|--------------------------------------------------------------------------
*/
// 从 window.SHARE_DATA 获取文档详情
const getDocDetailFromWindow = (docId: string) => {
  try {
    const shareData = (window as any).SHARE_DATA
    if (shareData && shareData.docs && Array.isArray(shareData.docs)) {
      const doc = shareData.docs.find((d: any) => d._id === docId)
      if (doc) {
        apidocInfo.value = doc
        return true
      }
    }
  } catch (error) {
    console.error('从 window.SHARE_DATA 获取文档详情失败:', error)
  }
  return false
}

const fetchShareDoc = async () => {
  if (!tabId.value) return;
  
  // 如果是HTML模式，从window.SHARE_DATA获取数据
  if (useForHtml.value) {
    const success = getDocDetailFromWindow(tabId.value)
    if (success) {
      return
    }
  }
  
  loading.value = true;
  try {
    const password = apidocCache.getSharePassword(shareId.value);
    const params = { password, shareId: shareId.value, _id: tabId.value };
    const res = await request.get<Response<ApidocDetail>, Response<ApidocDetail>>('/api/project/share_doc_detail', { params });
    apidocInfo.value = res.data;
  } catch (err) {
    apidocInfo.value = null;
  } finally {
    loading.value = false;
  }
};

// 初始化折叠状态
const initCollapseState = () => {
  if (!shareId.value) return;
  const savedState = apidocCache.getShareCollapseState(shareId.value);
  if (savedState) {
    expandedBlocks.value = { ...expandedBlocks.value, ...savedState };
  }
};

/*
|--------------------------------------------------------------------------
| 逻辑处理函数
|--------------------------------------------------------------------------
*/
// 切换折叠状态
const toggleBlock = (blockName: keyof typeof expandedBlocks.value) => {
  expandedBlocks.value[blockName] = !expandedBlocks.value[blockName];
  // 更新缓存
  if (shareId.value) {
    apidocCache.updateShareBlockCollapseState(
      shareId.value, 
      blockName, 
      expandedBlocks.value[blockName]
    );
  }
};

// 获取方法颜色
const getMethodColor = (method: string) => {
  const methodInfo = requestMethods.value.find(m => m.value.toLowerCase() === method.toLowerCase());
  return methodInfo?.iconColor || '#17a2b8'; // 默认颜色
};

// 简化数据类型显示
const simplifyDataType = (dataType: string) => {
  if (!dataType) return '';
  if (dataType.includes('json')) return 'JSON';
  if (dataType.includes('xml')) return 'XML';
  if (dataType.includes('html')) return 'HTML';
  if (dataType.includes('text/plain')) return 'TEXT';
  if (dataType.includes('form-data')) return 'FORM';
  if (dataType.includes('octet-stream')) return 'BINARY';
  return dataType.split('/').pop()?.toUpperCase() || '';
};

/*
|--------------------------------------------------------------------------
| 监听器
|--------------------------------------------------------------------------
*/
// 监听查询参数变化，更新变量替换
watch([filteredQueryParams, () => shareDocStore.objectVariable], async () => {
  const params = filteredQueryParams.value;
  const objectVariable = shareDocStore.objectVariable;
  
  const result = [];
  for (const param of params) {
    result.push({
      ...param,
      key: await convertTemplateValueToRealValue(param.key, objectVariable),
      value: await convertTemplateValueToRealValue(param.value, objectVariable)
    });
  }
  actualQueryParams.value = result;
}, { immediate: true });

// 监听请求头变化，更新变量替换
watch([filteredHeaders, () => shareDocStore.objectVariable], async () => {
  const headers = filteredHeaders.value;
  const objectVariable = shareDocStore.objectVariable;
  
  const result = [];
  for (const header of headers) {
    result.push({
      ...header,
      key: await convertTemplateValueToRealValue(header.key, objectVariable),
      value: await convertTemplateValueToRealValue(header.value, objectVariable)
    });
  }
  actualHeaders.value = result;
}, { immediate: true });

// 监听 tabId 变化，当用户切换 tab 时重新获取数据
watch(tabId, (newTabId) => {
  if (newTabId) {
    fetchShareDoc();
  }
}, { immediate: true });

// 当文档信息变更时，重置响应选项卡到第一个
watch(() => apidocInfo.value, (newApidocInfo) => {
  if (newApidocInfo && newApidocInfo.item.responseParams?.length > 0) {
    activeResponseTab.value = '0';
  }
});

/*
|--------------------------------------------------------------------------
| 生命周期函数
|--------------------------------------------------------------------------
*/
onMounted(() => {
  initCollapseState();
});
</script>

<style lang='scss' scoped>
// 主容器样式
.share-doc-detail {
  height: calc(100vh - 40px);
  
  .doc-detail {
    height: 100%;
    background: var(--white);
    width: 100%;
    margin: 0 auto;
    overflow-y: auto;
  }
}

.empty-tabs {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  background: var(--gray-100);
  
  h2 {
    color: var(--gray-600);
    font-size: 18px;
    font-weight: 500;
    margin: 0;
  }
}

// API文档头部样式
.api-doc-header {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: var(--white);
  width: 100%;
  border-bottom: 1px solid var(--gray-200);
  padding: 15px 20px 12px;
  
  .api-doc-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 8px;
  }
  
  .api-doc-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .method-label {
      padding: 3px 12px;
      border-radius: var(--border-radius-sm);
      color: var(--white);
      font-weight: bold;
    }
    
    .api-url {
      font-family: SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
      background: var(--gray-100);
      padding: 3px 8px;
      border-radius: var(--border-radius-sm);
      font-size: 16px;
      color: var(--gray-800);
      max-width: 420px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: normal;
      word-break: break-all;
      line-height: 1.4;
    }
  }
}

// API文档块容器
.api-doc-blocks {
  padding: 0 20px 10px;
  display: flex;
  flex-direction: column;
}

// 单个API文档块样式
.api-doc-block {
  margin-bottom: 12px;
  
  .api-doc-block-header {
    display: inline-flex;
    align-items: center;
    padding: 6px 0;
    cursor: pointer;
    &:hover {
      .api-doc-block-title {
        color: var(--primary);
      }
      .collapse-button {
        color: var(--primary);
      }
    }
    
    .content-format-label {
      font-size: 13px;
      background: #e5d6f6;
      color: var(--purple);
      border-radius: var(--border-radius-sm);
      padding: 2px 8px;
      margin-left: 8px;
      font-weight: normal;
    }
    
    .collapse-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      margin-right: 2px;
      margin-top: 2px;
      transition: all 0.2s ease;
      color: var(--gray-600);
      
      &.collapsed {
        transform: rotate(-90deg);
      }
      
      .el-icon {
        font-size: 14px;
      }
    }
    
    .api-doc-block-title {
      font-size: 16px;
      color: var(--gray-900);
      margin: 0;
      flex: 1;
      transition: color 0.2s ease;
    }
  }
  
  .api-doc-block-content {
    padding-left: 28px;
    margin-left: 10px;
    margin-top: 12px;
  }
  
  .api-doc-subtitle {
    font-size: 15px;
    color: var(--gray-600);
    margin-bottom: 12px;
    font-weight: 500;
  }
  
  .api-doc-empty {
    color: var(--gray-500);
  }
}

// 表格样式
.api-doc-table {
  overflow-x: auto;
  
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    border: 1px solid var(--gray-300);
    
    th, td {
      padding: 8px 12px;
      text-align: left;
      border: 1px solid var(--gray-300);
    }
    
    th {
      background-color: var(--gray-100);
      color: var(--gray-900);
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }
    
    td {
      color: var(--gray-700);
      vertical-align: middle;
      max-width: 200px;
      word-wrap: break-word;
      overflow: hidden;
      max-height: 7em;
      line-height: 1.4;
      
      &:first-child {
        font-weight: 500;
        color: var(--gray-900);
      }
    }
    
    tr:hover {
      background-color: var(--gray-100);
    }
  }
}

// 必填/可选标签样式
.required-badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: var(--border-radius-sm);
  font-size: 12px;
  font-weight: 500;
  
  &.required {
    background-color: var(--danger);
    color: var(--white);
  }
  
  &.optional {
    background-color: var(--success);
    color: var(--white);
  }
}

// 响应块样式
.api-doc-response-block {
  margin-bottom: 24px;
  
  .api-doc-response-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 8px;
    
    .api-doc-response-title {
      font-weight: bold;
      color: var(--gray-900);
    }
    
    .status-code.success {
      color: var(--success);
      font-weight: bold;
    }
    
    .type-label {
      background: var(--gray-200);
      color: var(--gray-700);
      border-radius: var(--border-radius-sm);
      padding: 0 8px;
      font-size: 15px;
    }
  }
}

// 原始数据样式
.api-doc-raw-body {
  background: var(--gray-900);
  color: var(--white);
  border-radius: var(--border-radius-lg);
  padding: 16px;
  overflow-x: auto;
  font-family: SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
  margin-top: 8px;
}

.api-doc-base-info-inline {
 color: var(--gray-600);
 margin-top: 5px;
}


// 响应 tabs 样式
.response-tabs {
  width: 100%;
  
  :deep(.el-tabs__header) {
    margin-bottom: 16px;
  }
  
  :deep(.el-tabs__item) {
    font-size: 14px;
    padding: 8px 16px;
    height: auto;
    line-height: 1.5;
    
    &.is-active {
      font-weight: bold;
    }
  }
  
  .api-doc-response-meta {
    margin-bottom: 12px;
  }
}
</style> 
