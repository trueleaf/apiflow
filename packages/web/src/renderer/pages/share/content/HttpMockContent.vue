<template>
  <div class="share-doc-detail mock-content">
    <div class="doc-detail">
      <template v-if="mockInfo">
        <!-- 顶部标题和Mock信息 -->
        <div class="api-doc-header">
          <div class="api-doc-title">{{ mockInfo.info.name }}</div>
          <div class="api-doc-meta">
            <span class="mock-label">HTTP MOCK</span>
            <span class="api-url">{{ mockInfo.requestCondition.url }}</span>
          </div>
          <div class="api-doc-base-info-inline">
            <span class="mr-1">{{ mockInfo.info.maintainer || mockInfo.info.creator }}</span>
            <span>{{ t('更新于') }}:</span>
            <span>{{ formatDate(mockInfo.updatedAt) }}</span>
          </div>
        </div>

        <!-- 参数块 -->
        <div class="api-doc-blocks">
          <!-- 匹配条件块 -->
          <div class="api-doc-block">
            <div class="api-doc-block-header" @click="toggleBlock('condition')">
              <div class="collapse-button" :class="{ 'collapsed': !expandedBlocks.condition }">
                <el-icon><ArrowDown /></el-icon>
              </div>
              <div class="api-doc-block-title">{{ t('匹配条件') }}</div>
            </div>
            <div class="api-doc-block-content" v-show="expandedBlocks.condition">
              <div class="mock-info-grid">
                <div class="mock-info-item">
                  <span class="label">{{ t('端口') }}:</span>
                  <span class="value">{{ mockInfo.requestCondition.port }}</span>
                </div>
                <div class="mock-info-item">
                  <span class="label">{{ t('路径') }}:</span>
                  <span class="value">{{ mockInfo.requestCondition.url }}</span>
                </div>
                <div class="mock-info-item">
                  <span class="label">{{ t('HTTP方法') }}:</span>
                  <span class="value">
                    <span v-for="method in mockInfo.requestCondition.method" :key="method" class="method-tag">
                      {{ method }}
                    </span>
                  </span>
                </div>
                <div class="mock-info-item">
                  <span class="label">{{ t('延迟') }}:</span>
                  <span class="value">{{ mockInfo.config.delay }}ms</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 响应配置块 -->
          <div class="api-doc-block">
            <div class="api-doc-block-header" @click="toggleBlock('response')">
              <div class="collapse-button" :class="{ 'collapsed': !expandedBlocks.response }">
                <el-icon><ArrowDown /></el-icon>
              </div>
              <div class="api-doc-block-title">{{ t('响应配置') }}</div>
            </div>
            <div class="api-doc-block-content" v-show="expandedBlocks.response">
              <template v-if="mockInfo.response.length > 0">
                <el-tabs v-model="activeResponseTab" type="card" class="response-tabs">
                  <el-tab-pane 
                    v-for="(resp, index) in mockInfo.response" 
                    :key="index"
                    :label="resp.name"
                    :name="String(index)">
                    <div class="response-detail">
                      <!-- 条件判断 -->
                      <template v-if="resp.conditions && resp.conditions.scriptCode">
                        <div class="response-section">
                          <div class="section-title">{{ t('条件判断') }}</div>
                          <div class="condition-info">
                            <span class="label">{{ t('名称') }}:</span>
                            <span class="value">{{ resp.conditions.name }}</span>
                            <span :class="['status-badge', resp.conditions.enabled ? 'enabled' : 'disabled']">
                              {{ resp.conditions.enabled ? t('已启用') : t('已禁用') }}
                            </span>
                          </div>
                          <div class="code-block">
                            <SJsonEditor 
                              :modelValue="resp.conditions.scriptCode" 
                              :config="{ language: 'javascript' }" 
                              read-only 
                              auto-height 
                              min-height="30px" 
                            />
                          </div>
                        </div>
                      </template>

                      <!-- 状态码和响应头 -->
                      <div class="response-section">
                        <div class="section-title">{{ t('响应配置') }}</div>
                        <div class="mock-info-grid">
                          <div class="mock-info-item">
                            <span class="label">{{ t('状态码') }}:</span>
                            <span class="value status-code">{{ resp.statusCode }}</span>
                          </div>
                          <div class="mock-info-item">
                            <span class="label">{{ t('数据类型') }}:</span>
                            <span class="value">{{ resp.dataType }}</span>
                          </div>
                        </div>

                        <!-- 响应头 -->
                        <template v-if="resp.headers.enabled && (resp.headers.defaultHeaders.length > 0 || resp.headers.customHeaders.length > 0)">
                          <div class="section-subtitle">{{ t('响应头') }}</div>
                          <div class="api-doc-table">
                            <table>
                              <thead>
                                <tr>
                                  <th>{{ t('参数名') }}</th>
                                  <th>{{ t('参数值') }}</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr v-for="header in [...resp.headers.defaultHeaders, ...resp.headers.customHeaders]" :key="header._id">
                                  <td>{{ header.key }}</td>
                                  <td>{{ header.value }}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </template>

                        <!-- 响应体内容 -->
                        <div class="section-subtitle">{{ t('响应内容') }}</div>
                        <div class="response-body">
                          <template v-if="resp.dataType === 'json'">
                            <div class="response-config-info">
                              <span class="label">{{ t('模式') }}:</span>
                              <span class="value">{{ getJsonModeLabel(resp.jsonConfig.mode) }}</span>
                            </div>
                            <template v-if="resp.jsonConfig.mode === 'fixed' && resp.jsonConfig.fixedData">
                              <SJsonEditor 
                                :modelValue="resp.jsonConfig.fixedData" 
                                :config="{ language: 'json' }" 
                                read-only 
                                auto-height 
                                min-height="30px" 
                              />
                            </template>
                            <template v-else-if="resp.jsonConfig.mode === 'random'">
                              <div class="response-config-info">
                                <span class="label">{{ t('随机数据大小') }}:</span>
                                <span class="value">{{ resp.jsonConfig.randomSize }} {{ t('条') }}</span>
                              </div>
                            </template>
                            <template v-else-if="resp.jsonConfig.mode === 'randomAi' && resp.jsonConfig.prompt">
                              <div class="response-config-info">
                                <span class="label">{{ t('AI提示词') }}:</span>
                                <span class="value">{{ resp.jsonConfig.prompt }}</span>
                              </div>
                            </template>
                          </template>

                          <template v-else-if="resp.dataType === 'text'">
                            <div class="response-config-info">
                              <span class="label">{{ t('模式') }}:</span>
                              <span class="value">{{ getTextModeLabel(resp.textConfig.mode) }}</span>
                              <span class="label ml-2">{{ t('文本类型') }}:</span>
                              <span class="value">{{ resp.textConfig.textType }}</span>
                            </div>
                            <template v-if="resp.textConfig.mode === 'fixed' && resp.textConfig.fixedData">
                              <SJsonEditor 
                                :modelValue="resp.textConfig.fixedData" 
                                :config="{ language: 'plaintext' }" 
                                read-only 
                                auto-height 
                                min-height="30px" 
                              />
                            </template>
                          </template>

                          <template v-else-if="resp.dataType === 'redirect'">
                            <div class="mock-info-grid">
                              <div class="mock-info-item">
                                <span class="label">{{ t('状态码') }}:</span>
                                <span class="value">{{ resp.redirectConfig.statusCode }}</span>
                              </div>
                              <div class="mock-info-item">
                                <span class="label">{{ t('重定向地址') }}:</span>
                                <span class="value">{{ resp.redirectConfig.location }}</span>
                              </div>
                            </div>
                          </template>

                          <template v-else>
                            <div class="api-doc-empty">{{ t('响应类型') }}: {{ resp.dataType }}</div>
                          </template>
                        </div>
                      </div>
                    </div>
                  </el-tab-pane>
                </el-tabs>
              </template>
              <div v-else class="api-doc-empty">{{ t('暂无响应配置') }}</div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, defineAsyncComponent } from 'vue';
import { storeToRefs } from 'pinia'
import { ArrowDown } from '@element-plus/icons-vue';
import { formatDate } from '../helper'
import { useShareStore } from '../store';
import { getShareCollapseState, updateShareBlockCollapseState } from '../cache/shareCache';
import type { HttpMockNode } from '@src/types/mockNode';
import { useI18n } from 'vue-i18n';

const SJsonEditor = defineAsyncComponent(() => import('../common/SCodeViewer.vue'));

const { t } = useI18n();
const shareStore = useShareStore();
const { activeDocInfo } = storeToRefs(shareStore);
const mockInfo = computed(() => activeDocInfo.value as HttpMockNode | null);
const activeResponseTab = ref('0');

const expandedBlocks = ref({
  condition: true,
  response: true,
});

onMounted(() => {
  if (mockInfo.value?._id) {
    const cache = getShareCollapseState(mockInfo.value._id);
    if (cache) {
      expandedBlocks.value = { ...expandedBlocks.value, ...cache };
    }
  }
});

const toggleBlock = (block: 'condition' | 'response') => {
  expandedBlocks.value[block] = !expandedBlocks.value[block];
  if (mockInfo.value?._id) {
    updateShareBlockCollapseState(mockInfo.value._id, block, expandedBlocks.value[block]);
  }
}

const getJsonModeLabel = (mode: string) => {
  const map: Record<string, string> = {
    fixed: t('固定数据'),
    random: t('随机数据'),
    randomAi: t('AI生成'),
  };
  return map[mode] || mode;
}

const getTextModeLabel = (mode: string) => {
  const map: Record<string, string> = {
    fixed: t('固定文本'),
    random: t('随机文本'),
    randomAi: t('AI生成'),
  };
  return map[mode] || mode;
}
</script>

<style scoped>
@import './contentCommon.css';

.mock-label {
  padding: 3px 12px;
  border-radius: var(--border-radius-sm);
  color: var(--white);
  font-weight: bold;
  background-color: var(--success);
}

.mock-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
  margin-bottom: 12px;

  .mock-info-item {
    display: flex;
    align-items: center;
    gap: 8px;

    .label {
      font-weight: 500;
      color: var(--gray-700);
    }

    .value {
      color: var(--gray-900);
      font-family: SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;

      &.status-code {
        font-weight: bold;
        color: var(--success);
      }
    }

    .method-tag {
      display: inline-block;
      padding: 2px 8px;
      margin-right: 4px;
      background: var(--primary);
      color: var(--white);
      border-radius: var(--border-radius-sm);
      font-size: 12px;
      font-weight: 500;
    }
  }
}

.response-detail {
  .response-section {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--gray-900);
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--gray-300);
    }

    .section-subtitle {
      font-size: 14px;
      font-weight: 500;
      color: var(--gray-800);
      margin: 16px 0 8px;
    }
  }

  .condition-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;

    .label {
      font-weight: 500;
      color: var(--gray-700);
    }

    .value {
      color: var(--gray-900);
    }

    .status-badge {
      padding: 2px 8px;
      border-radius: var(--border-radius-sm);
      font-size: 12px;
      font-weight: 500;

      &.enabled {
        background: var(--success);
        color: var(--white);
      }

      &.disabled {
        background: var(--gray-400);
        color: var(--white);
      }
    }
  }

  .code-block {
    margin-top: 8px;
    border: 1px solid var(--gray-300);
    border-radius: var(--border-radius-md);
    overflow: hidden;
  }

  .response-body {
    margin-top: 12px;
  }

  .response-config-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .label {
      font-weight: 500;
      color: var(--gray-700);
    }

    .value {
      color: var(--gray-900);
    }

    .ml-2 {
      margin-left: 16px;
    }
  }
}

.response-tabs {
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
}
</style>
