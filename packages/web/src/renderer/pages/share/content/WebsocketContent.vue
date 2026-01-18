<template>
  <div class="share-doc-detail websocket-content">
    <div class="doc-detail">
      <template v-if="websocketInfo">
        <!-- 顶部标题和连接信息 -->
        <div class="api-doc-header">
          <div class="api-doc-title">{{ websocketInfo.info.name }}</div>
          <div class="api-doc-meta">
            <span class="protocol-label">
              {{ websocketInfo.item.protocol.toUpperCase() }}
            </span>
            <span class="api-url">{{ fullUrl }}</span>
          </div>
          <div class="api-doc-base-info-inline">
            <span class="mr-1">{{ websocketInfo.info.maintainer || websocketInfo.info.creator }}</span>
            <span>{{ t('更新于') }}:</span>
            <span>{{ formatDate(websocketInfo.updatedAt) }}</span>
          </div>
        </div>

        <!-- 参数块 -->
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

          <!-- 消息块 -->
          <div class="api-doc-block">
            <div class="api-doc-block-header" @click="toggleBlock('messages')">
              <div class="collapse-button" :class="{ 'collapsed': !expandedBlocks.messages }">
                <el-icon><ArrowDown /></el-icon>
              </div>
              <div class="api-doc-block-title">{{ t('消息示例') }}</div>
            </div>
            <div class="api-doc-block-content" v-show="expandedBlocks.messages">
              <template v-if="hasMessageBlocks">
                <div v-for="block in sortedMessageBlocks" :key="block.id" class="message-block">
                  <div class="message-block-header">
                    <span class="message-block-name">{{ block.name }}</span>
                    <span class="message-type-label">{{ block.messageType }}</span>
                  </div>
                  <div class="message-block-content">
                    <SJsonEditor 
                      :modelValue="block.content" 
                      :config="{ language: getMessageLanguage(block.messageType) }" 
                      read-only 
                      auto-height 
                      min-height="30px" 
                    />
                  </div>
                </div>
              </template>
              <div v-else class="api-doc-empty">{{ t('暂无消息示例') }}</div>
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
import type { WebSocketNode } from '@src/types/websocketNode';
import { useI18n } from 'vue-i18n';

const SJsonEditor = defineAsyncComponent(() => import('../common/SCodeViewer.vue'));

const { t } = useI18n();
const shareStore = useShareStore();
const { activeDocInfo } = storeToRefs(shareStore);
const websocketInfo = computed(() => activeDocInfo.value as WebSocketNode | null);
const fullUrl = ref('');

const expandedBlocks = ref({
  query: true,
  headers: true,
  messages: true,
});

onMounted(() => {
  if (websocketInfo.value?._id) {
    const cache = getShareCollapseState(websocketInfo.value._id);
    if (cache) {
      expandedBlocks.value = { ...expandedBlocks.value, ...cache };
    }
  }
});

watchEffect(async () => {
  if (!websocketInfo.value) return '';
  const { prefix, path } = websocketInfo.value.item.url || { prefix: '', path: '' };
  const rawUrl = `${prefix}${path}`;
  fullUrl.value = await getCompiledTemplate(rawUrl, shareStore.varibles);
});

const hasQueryParams = computed(() => 
  websocketInfo.value?.item?.queryParams?.filter((p: ApidocProperty) => p.select).some((data: ApidocProperty) => data.key)
);
const actualQueryParams = computed(() => 
  websocketInfo.value?.item?.queryParams?.filter((p: ApidocProperty) => p.select && p.key) || []
);

const hasHeaders = computed(() => 
  websocketInfo.value?.item.headers?.filter((p: ApidocProperty) => p.select).some((data: ApidocProperty) => data.key)
);
const actualHeaders = computed(() => 
  websocketInfo.value?.item.headers?.filter((p: ApidocProperty) => p.select && p.key) || []
);

const hasMessageBlocks = computed(() => 
  websocketInfo.value?.item?.messageBlocks && websocketInfo.value.item.messageBlocks.length > 0
);

const sortedMessageBlocks = computed(() => {
  if (!websocketInfo.value?.item?.messageBlocks) return [];
  return [...websocketInfo.value.item.messageBlocks].sort((a, b) => a.order - b.order);
});

const toggleBlock = (block: 'query' | 'headers' | 'messages') => {
  expandedBlocks.value[block] = !expandedBlocks.value[block];
  if (websocketInfo.value?._id) {
    updateShareBlockCollapseState(websocketInfo.value._id, block, expandedBlocks.value[block]);
  }
}

const getMessageLanguage = (messageType: string) => {
  if (messageType === 'json') return 'json';
  if (messageType === 'xml') return 'xml';
  if (messageType === 'html') return 'html';
  return 'plaintext';
}
</script>

<style scoped>
@import './contentCommon.css';

.message-block {
  margin-bottom: 16px;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-md);
  overflow: hidden;

  &:last-child {
    margin-bottom: 0;
  }

  .message-block-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: var(--gray-100);
    border-bottom: 1px solid var(--gray-300);

    .message-block-name {
      font-weight: 500;
      color: var(--gray-900);
    }

    .message-type-label {
      font-size: 12px;
      background: var(--color-share-purple);
      color: var(--theme-color);
      border-radius: var(--border-radius-sm);
      padding: 2px 8px;
    }
  }

  .message-block-content {
    padding: 12px;
  }
}

.protocol-label {
  padding: 3px 12px;
  border-radius: var(--border-radius-sm);
  color: var(--white);
  font-weight: bold;
  background-color: var(--warning);
}
</style>
