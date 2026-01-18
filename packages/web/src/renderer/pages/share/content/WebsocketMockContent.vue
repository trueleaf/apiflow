<template>
  <div class="share-doc-detail mock-content">
    <div class="doc-detail">
      <template v-if="mockInfo">
        <!-- 顶部标题和Mock信息 -->
        <div class="api-doc-header">
          <div class="api-doc-title">{{ mockInfo.info.name }}</div>
          <div class="api-doc-meta">
            <span class="mock-label">WEBSOCKET MOCK</span>
            <span class="api-url">{{ mockInfo.requestCondition.path }}</span>
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
                  <span class="value">{{ mockInfo.requestCondition.path }}</span>
                </div>
                <div class="mock-info-item">
                  <span class="label">{{ t('延迟') }}:</span>
                  <span class="value">{{ mockInfo.config.delay }}ms</span>
                </div>
                <div class="mock-info-item">
                  <span class="label">{{ t('回声模式') }}:</span>
                  <span :class="['status-badge', mockInfo.config.echoMode ? 'enabled' : 'disabled']">
                    {{ mockInfo.config.echoMode ? t('已启用') : t('已禁用') }}
                  </span>
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
              <div class="response-detail">
                <template v-if="mockInfo.response.content">
                  <div class="section-title">{{ t('响应消息') }}</div>
                  <div class="code-block">
                    <SJsonEditor 
                      :modelValue="mockInfo.response.content" 
                      :config="{ language: 'plaintext' }" 
                      read-only 
                      auto-height 
                      min-height="30px" 
                    />
                  </div>
                </template>
                <div v-else class="api-doc-empty">{{ t('暂无响应内容') }}</div>
              </div>
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
import { formatDate } from '@/helper'
import { useShareStore } from '../store';
import { appStateCache } from '@/cache/appState/appStateCache.ts';
import type { WebSocketMockNode } from '@src/types/mockNode';
import { useI18n } from 'vue-i18n';

const SJsonEditor = defineAsyncComponent(() => import('@/components/common/jsonEditor/ClJsonEditor.vue'));

const { t } = useI18n();
const shareStore = useShareStore();
const { activeDocInfo } = storeToRefs(shareStore);
const mockInfo = computed(() => activeDocInfo.value as WebSocketMockNode | null);

const expandedBlocks = ref({
  condition: true,
  response: true,
});

onMounted(() => {
  if (mockInfo.value?._id) {
    const cache = appStateCache.getShareCollapseState(mockInfo.value._id);
    if (cache) {
      expandedBlocks.value = { ...expandedBlocks.value, ...cache };
    }
  }
});

const toggleBlock = (block: 'condition' | 'response') => {
  expandedBlocks.value[block] = !expandedBlocks.value[block];
  if (mockInfo.value?._id) {
    appStateCache.updateShareBlockCollapseState(mockInfo.value._id, block, expandedBlocks.value[block]);
  }
}
</script>

<style scoped>
@import './contentCommon.css';

.mock-label {
  padding: 3px 12px;
  border-radius: var(--border-radius-sm);
  color: var(--white);
  font-weight: bold;
  background-color: var(--warning);
}

.mock-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;

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
}

.response-detail {
  .section-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--gray-900);
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--gray-300);
  }

  .code-block {
    border: 1px solid var(--gray-300);
    border-radius: var(--border-radius-md);
    overflow: hidden;
  }
}
</style>
