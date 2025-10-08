<template>
  <div class="share-doc-detail">
    <!-- 当tabs为空时显示提示信息 -->
    <div v-if="!tabs?.length" class="empty-tabs">
      <h2>{{ $t('暂无文档') }}</h2>
    </div>
    <div v-else class="doc-detail">
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
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watchEffect } from 'vue';
import { ArrowDown } from '@element-plus/icons-vue';
import SJsonEditor from '@/components/common/json-editor/g-json-editor.vue';
import { formatDate } from '@/helper';
import { defaultRequestMethods } from '../common';
import SParamsView from '@/components/apidoc/params-view/g-params-view.vue';
import { useShareStore } from '../store';
import { useRoute } from 'vue-router';
import { httpNodeCache } from '@/cache/http/httpNodeCache.ts';
import { convertTemplateValueToRealValue } from '@/utils/utils';

const route = useRoute();
const shareId = route.query?.share_id as string || 'local_share';
const shareStore = useShareStore();
const apidocInfo = computed(() => shareStore.activeDocInfo);
const tabs = computed(() => shareStore.tabs[shareId]);
const activeResponseTab = ref('0');
const fullUrl = ref('');
/*
|--------------------------------------------------------------------------
| 变量定义
|--------------------------------------------------------------------------
*/
const expandedBlocks = ref({
  query: true,
  headers: true,
  body: true,
  response: true,
});

watchEffect(() => {
  if (apidocInfo.value?._id) {
    const cache = httpNodeCache.getShareCollapseState(apidocInfo.value._id);
    if (cache) {
      expandedBlocks.value = { ...expandedBlocks.value, ...cache };
    }
  }
});

/*
|--------------------------------------------------------------------------
| 初始化数据获取逻辑
|--------------------------------------------------------------------------
*/
watchEffect(async () => {
  if (!apidocInfo.value) return '';
  const { prefix, path } = apidocInfo.value.item.url || { prefix: '', path: '' };
  const rawUrl = `${prefix}${path}`;
  fullUrl.value = await convertTemplateValueToRealValue(rawUrl, shareStore.objectVariable);
});

const hasQueryParams = computed(() => apidocInfo.value?.item?.queryParams?.filter(p => p.select).some((data) => data.key));
const actualQueryParams = computed(() => apidocInfo.value?.item?.queryParams?.filter(p => p.select && p.key) || []);

const hasHeaders = computed(() => apidocInfo.value?.item.headers?.filter(p => p.select).some((data) => data.key));
const actualHeaders = computed(() => apidocInfo.value?.item.headers?.filter(p => p.select && p.key) || []);

const bodyType = computed(() => {
  if (!apidocInfo.value) return '';
  const { mode } = apidocInfo.value.item.requestBody;
  if (mode === 'json') return 'json';
  if (mode === 'formdata') return 'formdata';
  if (mode === 'urlencoded') return 'urlencoded';
  if (mode === 'raw') {
    const dataType = apidocInfo.value.item.requestBody.raw?.dataType;
    if (dataType === 'text/plain') return 'text';
    return 'raw';
  }
  return '';
});

/*
|--------------------------------------------------------------------------
| 逻辑处理函数
|--------------------------------------------------------------------------
*/
const toggleBlock = (block: 'query' | 'headers' | 'body' | 'response') => {
  expandedBlocks.value[block] = !expandedBlocks.value[block];
  if (apidocInfo.value?._id) {
    httpNodeCache.updateShareBlockCollapseState(apidocInfo.value._id, block, expandedBlocks.value[block]);
  }
}

const simplifyDataType = (dataType: string) => {
  if (!dataType) return '';
  if (dataType.includes('json')) return 'JSON';
  if (dataType.includes('xml')) return 'XML';
  if (dataType.includes('html')) return 'HTML';
  if (dataType.includes('plain')) return 'Text';
  return dataType.split('/').pop()?.toUpperCase() || dataType;
}

const getResponseLanguage = (dataType: string) => {
  if (!dataType) return '';
  if (dataType.includes('json')) return 'json';
  if (dataType.includes('xml')) return 'xml';
  if (dataType.includes('html')) return 'html';
  if (dataType.includes('plain')) return 'plaintext';
  return '';
}

const getMethodColor = (method: string) => {
  return defaultRequestMethods.find(item => item.value === method)?.iconColor;
}

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
  z-index: var(--zIndex-share-header);
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
      max-width: calc(100% - 150px);
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
      color: var(--theme-color);
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
