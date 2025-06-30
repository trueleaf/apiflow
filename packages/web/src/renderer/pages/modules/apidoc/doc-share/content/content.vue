<template>
  <div class="share-doc-detail">
    <SLoading :loading="loading" class="doc-detail">
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
            <span v-if="apidocInfo.item.contentType" class="content-type-label">{{ apidocInfo.item.contentType }}</span>
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
              <div class="api-doc-block-title">Query 参数</div>
            </div>
            <div class="api-doc-block-content" v-show="expandedBlocks.query">
              <template v-if="hasQueryParams">
                <div class="api-doc-table">
                  <table>
                    <thead>
                      <tr>
                        <th>参数名</th>
                        <th>参数值</th>
                        <th>类型</th>
                        <th>必填</th>
                        <th>描述</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="param in filteredQueryParams" :key="param._id">
                        <td>{{ param.key }}</td>
                        <td>{{ param.value }}</td>
                        <td>{{ param.type }}</td>
                        <td>
                          <span :class="['required-badge', param.required ? 'required' : 'optional']">
                            {{ param.required ? '是' : '否' }}
                          </span>
                        </td>
                        <td>{{ param.description || '-' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </template>
              <div v-else class="api-doc-empty">暂无 Query 参数</div>
            </div>
          </div>

          <!-- 请求头块 -->
          <div class="api-doc-block">
            <div class="api-doc-block-header" @click="toggleBlock('headers')">
              <div class="collapse-button" :class="{ 'collapsed': !expandedBlocks.headers }">
                <el-icon><ArrowDown /></el-icon>
              </div>
              <div class="api-doc-block-title">请求头</div>
            </div>
            <div class="api-doc-block-content" v-show="expandedBlocks.headers">
              <template v-if="hasHeaders">
                <div class="api-doc-table">
                  <table>
                    <thead>
                      <tr>
                        <th>参数名</th>
                        <th>参数值</th>
                        <th>类型</th>
                        <th>必填</th>
                        <th>描述</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="header in filteredHeaders" :key="header._id">
                        <td>{{ header.key }}</td>
                        <td>{{ header.value }}</td>
                        <td>{{ header.type }}</td>
                        <td>
                          <span :class="['required-badge', header.required ? 'required' : 'optional']">
                            {{ header.required ? '是' : '否' }}
                          </span>
                        </td>
                        <td>{{ header.description || '-' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </template>
              <div v-else class="api-doc-empty">暂无请求头</div>
            </div>
          </div>

          <!-- Body参数 -->
          <div class="api-doc-block">
            <div class="api-doc-block-header" @click="toggleBlock('body')">
              <div class="collapse-button" :class="{ 'collapsed': !expandedBlocks.body }">
                <el-icon><ArrowDown /></el-icon>
              </div>
              <div class="api-doc-block-title">Body参数</div>
            </div>
            <div class="api-doc-block-content" v-show="expandedBlocks.body">
              <template v-if="hasJsonBodyParams">
                <div class="api-doc-subtitle">Body参数 (application/json)</div>
                <!-- <SJsonEditor :value="apidocInfo.item.requestBody.rawJson" read-only /> -->
              </template>
              <template v-if="hasFormDataParams">
                <div class="api-doc-subtitle">Body参数 (multipart/formdata)</div>
                <!-- <SParamsView :data="apidocInfo.item.requestBody.formdata" plain /> -->
              </template>
              <template v-if="hasUrlEncodedParams">
                <div class="api-doc-subtitle">Body参数 (x-www-form-urlencoded)</div>
                <!-- <SParamsView :data="apidocInfo.item.requestBody.urlencoded" plain /> -->
              </template>
              <template v-if="hasRawParams">
                <div class="api-doc-subtitle">Body参数 ({{ apidocInfo.item.requestBody.raw.dataType }})</div>
                <pre class="pre api-doc-raw-body">{{ apidocInfo.item.requestBody.raw.data }}</pre>
              </template>
              <div v-if="!hasJsonBodyParams && !hasFormDataParams && !hasUrlEncodedParams && !hasRawParams" class="api-doc-empty">暂无请求体参数</div>
            </div>
          </div>

          <!-- 响应块 -->
          <div class="api-doc-block">
            <div class="api-doc-block-header" @click="toggleBlock('response')">
              <div class="collapse-button" :class="{ 'collapsed': !expandedBlocks.response }">
                <el-icon><ArrowDown /></el-icon>
              </div>
              <div class="api-doc-block-title">响应</div>
            </div>
            <div class="api-doc-block-content" v-show="expandedBlocks.response">
              <div v-for="(item, index) in apidocInfo.item.responseParams" :key="index" class="api-doc-response-block">
                <div class="api-doc-response-meta">
                  <span class="api-doc-response-title">{{ item.title }}</span>
                  <span class="status-code success">{{ item.statusCode }}</span>
                  <span class="type-label">{{ item.value.dataType }}</span>
                </div>
                <!-- <SRawEditor v-if="item.value.dataType === 'application/json'" :data="item.value.strJson" readonly class="api-doc-response-example" /> -->
                <div v-if="item.value.dataType === 'application/xml' || item.value.dataType === 'text/plain' || item.value.dataType === 'text/html'" class="h-150px">
                  <!-- <SRawEditor :data="item.value.strJson" :type="item.value.dataType" readonly class="api-doc-response-example" /> -->
                </div>
              </div>
            </div>
          </div>

          <!-- 基本信息块 -->
          <div class="api-doc-block api-doc-base-info">
            <div class="api-doc-block-header" @click="toggleBlock('baseInfo')">
              <div class="collapse-button" :class="{ 'collapsed': !expandedBlocks.baseInfo }">
                <el-icon><ArrowDown /></el-icon>
              </div>
              <div class="api-doc-block-title">基本信息</div>
            </div>
            <div class="api-doc-block-content" v-show="expandedBlocks.baseInfo">
              <div class="api-doc-base-info-list">
                <div class="api-doc-base-info-item"><span>维护人员：</span><span>{{ apidocInfo.info.maintainer || apidocInfo.info.creator }}</span></div>
                <div class="api-doc-base-info-item"><span>创建人员：</span><span>{{ apidocInfo.info.creator }}</span></div>
                <div class="api-doc-base-info-item"><span>更新日期：</span><span>{{ formatDate(apidocInfo.updatedAt) }}</span></div>
                <div class="api-doc-base-info-item"><span>创建日期：</span><span>{{ formatDate(apidocInfo.createdAt) }}</span></div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </SLoading>
  </div>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted, computed, watch } from 'vue';
import { ApidocDetail, Response } from '@src/types/global';
import { request } from '@/api/api';
import SLoading from '@/components/common/loading/g-loading.vue';
import { ArrowDown } from '@element-plus/icons-vue';
// import SParamsView from '@/components/apidoc/params-view/g-params-view.vue';
// import SRawEditor from '@/components/apidoc/raw-editor/g-raw-editor.vue';
// import SJsonEditor from '@/components/common/json-editor/g-json-editor.vue';
import { formatDate } from '@/helper';
import { router } from '@/router';
import { apidocCache } from '@/cache/apidoc';
import { useApidocTas } from '@/store/apidoc/tabs';
import { defaultRequestMethods } from '../common';

const loading = ref(false);
const apidocInfo: Ref<ApidocDetail | null> = ref(null);
const shareId = computed(() => router.currentRoute.value.query.share_id as string);
const apidocTabsStore = useApidocTas();
const tabId = computed(() => {
  const tabs = apidocTabsStore.tabs[shareId.value];
  const selectedTab = tabs?.find((tab) => tab.selected);
  return selectedTab?._id || '';
});
const fullUrl = computed(() => {
  if (!apidocInfo.value) return '';
  const { host, path } = apidocInfo.value.item.url || { host: '', path: '' };
  return `${host}${path}`;
});
const requestMethods = ref(defaultRequestMethods);

// 折叠状态管理
const expandedBlocks = ref({
  query: true,
  headers: true,
  body: true,
  response: true,
  baseInfo: true
});

// 切换折叠状态
const toggleBlock = (blockName: keyof typeof expandedBlocks.value) => {
  expandedBlocks.value[blockName] = !expandedBlocks.value[blockName];
};

// 过滤出有效的 queryParams 和 headers
const filteredQueryParams = computed(() => {
  if (!apidocInfo.value) return [];
  return apidocInfo.value.item.queryParams.filter(p => p.select && p.key);
});

const filteredHeaders = computed(() => {
  if (!apidocInfo.value) return [];
  return apidocInfo.value.item.headers.filter(p => p.select && p.key);
});

onMounted(() => {
  fetchShareDoc();
});

// 监听 tabId 变化，当用户切换 tab 时重新获取数据
watch(tabId, (newTabId) => {
  if (newTabId) {
    fetchShareDoc();
  }
});

const fetchShareDoc = async () => {
  if (!tabId.value) return;
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

const getMethodColor = (method: string) => {
  const methodInfo = requestMethods.value.find(m => m.value.toLowerCase() === method.toLowerCase());
  return methodInfo?.iconColor || '#17a2b8'; // 默认颜色
};
</script>

<style lang='scss' scoped>
// 主容器样式
.share-doc-detail {
  height: calc(100vh - size(40));
  
  .doc-detail {
    height: 100%;
    padding: size(20);
    background: $white;
    width: 100%;
    margin: 0 auto;
    overflow-y: auto;
  }
}

// API文档头部样式
.api-doc-header {
  margin-bottom: 6px;
  
  .api-doc-title {
    font-size: fz(24);
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  
  .api-doc-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    
    .method-label {
      padding: 0.2em 0.8em;
      border-radius: 4px;
      color: #fff;
      font-weight: bold;
    }
    
    .api-url {
      font-family: 'Fira Mono', 'Consolas', monospace;
      background: #f6f8fa;
      padding: 0.2em 0.5em;
      border-radius: 3px;
      font-size: 1rem;
      color: #333;
      max-width: 420px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: normal;
      word-break: break-all;
      line-height: 1.4;
    }
    
    .content-type-label {
      background: #e6e6fa;
      color: #7c4dff;
      border-radius: 3px;
      padding: 0.2em 0.6em;
      font-size: 0.95em;
    }
  }
}

// API文档块容器
.api-doc-blocks {
  display: flex;
  flex-direction: column;
}

// 单个API文档块样式
.api-doc-block {
  margin-bottom: 12px;
  
  .api-doc-block-header {
    display: inline-flex;
    align-items: center;
    padding: 12px 0;
    cursor: pointer;
    &:hover {
      .api-doc-block-title {
        color: #409eff;
      }
      .collapse-button {
        color: #409eff;
      }
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
      color: #606266;
      
      &.collapsed {
        transform: rotate(-90deg);
      }
      
      .el-icon {
        font-size: 14px;
      }
    }
    
    .api-doc-block-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #303133;
      margin: 0;
      flex: 1;
      transition: color 0.2s ease;
    }
  }
  
  .api-doc-block-content {
    padding-left: 28px;
    margin-left: 10px;
  }
  
  .api-doc-subtitle {
    font-size: 0.95rem;
    color: #606266;
    margin-bottom: 12px;
    font-weight: 500;
  }
  
  .api-doc-empty {
    color: #909399;
    // padding: 16px 0;
  }
}

// 表格样式
.api-doc-table {
  overflow-x: auto;
  
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
    border: 1px solid #d1d5da;
    
    th, td {
      padding: 8px 12px;
      text-align: left;
      border: 1px solid #d1d5da;
    }
    
    th {
      background-color: #f6f8fa;
      color: #24292e;
      font-size: 0.90rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }
    
    td {
      color: #586069;
      vertical-align: middle;
      max-width: 200px;
      word-wrap: break-word;
      overflow: hidden;
      max-height: 7em;
      line-height: 1.4;
      
      &:first-child {
        font-weight: 500;
        color: #24292e;
      }
    }
    
    tr:hover {
      background-color: #f6f8fa;
    }
  }
}

// 必填/可选标签样式
.required-badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 500;
  
  &.required {
    background-color: #d73a49;
    color: white;
  }
  
  &.optional {
    background-color: #28a745;
    color: white;
  }
}

// 响应块样式
.api-doc-response-block {
  margin-bottom: 1.5em;
  
  .api-doc-response-meta {
    display: flex;
    align-items: center;
    gap: 1em;
    margin-bottom: 0.5em;
    
    .api-doc-response-title {
      font-weight: bold;
      color: #333;
    }
    
    .status-code.success {
      color: #28a745;
      font-weight: bold;
    }
    
    .type-label {
      background: #f0f1f3;
      color: #555;
      border-radius: 3px;
      padding: 0 0.5em;
      font-size: 0.95em;
    }
  }
  
  .api-doc-response-example {
    background: #23272e;
    color: #fff;
    border-radius: 6px;
    padding: 1em;
    overflow-x: auto;
    font-family: 'Fira Mono', 'Consolas', monospace;
    margin-top: 0.5em;
  }
}

// 原始数据样式
.api-doc-raw-body {
  background: #23272e;
  color: #fff;
  border-radius: 6px;
  padding: 1em;
  overflow-x: auto;
  font-family: 'Fira Mono', 'Consolas', monospace;
  margin-top: 0.5em;
}

// 基本信息块样式
.api-doc-base-info {
  .api-doc-base-info-list {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5em 2em;
    
    .api-doc-base-info-item {
      min-width: 180px;
      color: #666;
      font-size: 1em;
      
      span:first-child {
        color: #888;
      }
    }
  }
}
</style> 