<template>
  <div ref="sseViewContainerRef" class="sse-view">
    <!-- 筛选框 -->
    <div v-if="dataList && dataList.length > 0 && props.isDataComplete" class="filter-container">
      <!-- 收起状态：只显示搜索图标 -->
      <div class="filter-collapsed">
        <div v-if="isSearchInputVisible" class="compact-search-row">
          <el-input ref="filterInputRef" v-model="filterText" :placeholder="isRegexMode ? t('支持正则表达式') : t('输入关键词筛选')"
            size="small" class="compact-filter-input" @input="handleFilterChange" @keyup.enter="handleFilterChange">
            <template #suffix>
              <div class="compact-regex-toggle-btn" :class="{ active: isRegexMode }" @click="toggleRegexMode"
                :title="t('切换正则表达式模式')">
                .*
              </div>
            </template>
          </el-input>
        </div>

        <div class="action-icons">
          <el-icon class="icon search-icon" :class="{ active: isSearchInputVisible }" @click="toggleSearchInput">
            <Search />
          </el-icon>
          <FilterConfigDialog
            v-model="isFilterDialogVisible"
            :source-data="formattedData"
            @filtered-data-change="handleFilteredDataChange"
          />
          <el-icon class="icon raw-view-icon" :class="{ active: isRawView }" @click="toggleRawView"
            :title="t('切换原始数据视图')">
            <Document />
          </el-icon>
          <el-icon class="icon download-icon" @click="downloadData" :title="t('下载SSE数据')">
            <Download />
          </el-icon>
        </div>

        <!-- 在收起状态下显示筛选统计信息 -->
        <div v-if="filterText && isSearchInputVisible" class="compact-filter-stats">
          <div v-if="filterError" class="filter-stats error">
            {{ filterError }}
          </div>
          <div v-else-if="filteredData.length > 0" class="filter-stats">
            {{ t('找到') }} {{ filteredData.length }} {{ t('条匹配结果') }}
          </div>
          <div v-else class="filter-stats no-result">
            {{ t('未找到匹配结果') }}
          </div>
        </div>
      </div>
    </div>
    <div v-if="!dataList || dataList.length === 0" class="empty-state">
      <el-icon class="loading-icon">
        <Loading />
      </el-icon>
      <span>等待数据返回中</span>
    </div>
    <!-- 原始数据视图 -->
    <div v-else-if="isRawView" class="raw-content">
      <pre class="raw-data" v-html="rawDataContent"></pre>
    </div>
    <div v-else-if="overrideDisplayText" class="filtered-result-block">
      <pre class="filtered-result-text" v-html="highlightText(overrideDisplayText)"></pre>
    </div>
    <!-- 虚拟滚动视图 -->
    <GVirtualScroll v-else class="sse-content" :items="displayData" :auto-scroll="true" :virtual="isVirtualEnabled"
      :item-height="25">
      <template #default="{ item }">
        <div :ref="el => setMessageRef(el, item.originalIndex)" class="sse-message"
          :class="{ 'sse-message-hex': item.dataType === 'binary' }"
          @click="handleMessageClick(item.originalIndex, $event)">
          <div class="message-index">{{ item.originalIndex + 1 }}</div>
          <pre class="message-content" v-html="highlightText((item.event || '') + ' ' + (item.data || ''))"></pre>
          <div class="message-timestamp">
            {{ formatTimestamp(item.timestamp) }}
          </div>
        </div>
      </template>
    </GVirtualScroll>
    <!-- SSE 消息详情弹窗 -->
    <SsePopover v-if="!isRawView" :visible="activePopoverIndex !== -1" :message="currentMessage"
      :message-index="activePopoverIndex" :virtual-ref="popoverVirtualRef" @hide="handlePopoverHide"
      @close="handleClosePopover" />
  </div>
</template>

<script lang="ts" setup>
import { downloadStringAsText } from '@/helper'
import { parseChunkList } from '@/helper';
import { debounce } from "lodash-es";
import { computed, ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import type { ComponentPublicInstance } from 'vue';

import dayjs from 'dayjs';
import type { ChunkWithTimestampe, ParsedSSeData } from '@src/types/index.ts';
import GVirtualScroll from '@/components/apidoc/virtualScroll/ClVirtualScroll.vue';
import SsePopover from './components/popover/SsePopover.vue';
import FilterConfigDialog from './components/filter/FilterConfigDialog.vue';
import { Loading, Search, Download, Document } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { useApidocTas } from '@/store/httpNode/httpTabsStore';
import { router } from '@/router';
import type { ClSseViewProps } from '@src/types/components/components';

/*
|--------------------------------------------------------------------------
| Props / Emits
|--------------------------------------------------------------------------
*/
const props = withDefaults(defineProps<ClSseViewProps>(), {
  dataList: () => [],
  isDataComplete: false,
});

/*
|--------------------------------------------------------------------------
| 响应式状态
|--------------------------------------------------------------------------
*/
const { t } = useI18n();
const apidocTabsStore = useApidocTas();
const sseViewContainerRef = ref<HTMLElement | null>(null);
const lastDataLength = ref(0);
const lastDataSignature = ref('');
const incrementalData = ref<ParsedSSeData[]>([]);
const filterText = ref('');
const isRegexMode = ref(false);
const filterError = ref('');
const filterInputRef = ref<HTMLInputElement | null>(null);
const isSearchInputVisible = ref(false);
const isRawView = ref(false);
const popoverVirtualRef = ref<HTMLElement | null>(null);
const activePopoverIndex = ref<number>(-1);
const messageRefs = ref<Record<number, HTMLElement>>({});

type FilteredDataPayload = {
  list: unknown[];
  finalValue: unknown | null;
};

const isFilterDialogVisible = ref(false);
const customFilteredDataFromChild = ref<FilteredDataPayload>({ list: [], finalValue: null });

type SseDisplayItem = ParsedSSeData & { originalIndex: number };

/*
|--------------------------------------------------------------------------
| 计算属性
|--------------------------------------------------------------------------
*/
const isVirtualEnabled = computed(() => props.isDataComplete && activePopoverIndex.value === -1);
const currentMessage = computed<ParsedSSeData | null>(() => activePopoverIndex.value !== -1 ? formattedData.value[activePopoverIndex.value] : null);
const formattedData = computed<ParsedSSeData[]>(() => {
  if (!props.dataList || props.dataList.length === 0) {
    lastDataLength.value = 0;
    lastDataSignature.value = '';
    incrementalData.value = [];
    resetPopoverState();
    messageRefs.value = {};
    return [];
  }
  const currentSignature = buildChunkSignature(props.dataList);
  const isLengthIncreased = props.dataList.length > lastDataLength.value;
  const shouldReuseCache = !isLengthIncreased && currentSignature === lastDataSignature.value && incrementalData.value.length > 0;
  if (shouldReuseCache) {
    return incrementalData.value;
  }
  if (isLengthIncreased && lastDataLength.value > 0 && lastDataSignature.value) {
    const [previousFirstKey] = lastDataSignature.value.split('|');
    if (previousFirstKey && currentSignature.startsWith(previousFirstKey)) {
      const newChunks = props.dataList.slice(lastDataLength.value);
      const newParsedData = parseChunkList(newChunks);
      incrementalData.value = [...incrementalData.value, ...newParsedData];
    } else {
      const parsed = parseChunkList(props.dataList);
      incrementalData.value = parsed;
      cleanupAfterDataReset();
    }
  } else {
    const newChunks = props.dataList.slice(lastDataLength.value);
    if (isLengthIncreased && newChunks.length > 0) {
      const newParsedData = parseChunkList(newChunks);
      incrementalData.value = [...incrementalData.value, ...newParsedData];
    } else {
      const parsed = parseChunkList(props.dataList);
      incrementalData.value = parsed;
      cleanupAfterDataReset();
    }
  }
  lastDataLength.value = props.dataList.length;
  lastDataSignature.value = currentSignature;
  return incrementalData.value;
});
const customFilteredData = computed<ParsedSSeData[]>(() => {
  if (customFilteredDataFromChild.value.list.length === 0) {
    return formattedData.value;
  }
  return processFilteredData(customFilteredDataFromChild.value.list);
});
const overrideDisplayText = computed<string | null>(() => {
  const value = customFilteredDataFromChild.value.finalValue;
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
});
const filteredData = computed<SseDisplayItem[]>(() => {
  const baseData = customFilteredData.value;
  if (!filterText.value.trim()) {
    return baseData.map((item, index) => ({ ...item, originalIndex: index }));
  }
  try {
    let regex: RegExp;
    if (isRegexMode.value) {
      const trimmedText = filterText.value.trim();
      const regexMatch = trimmedText.match(/^\/(.+)\/([gimuy]*)$/);
      if (regexMatch) {
        regex = new RegExp(regexMatch[1], regexMatch[2]);
      } else {
        regex = new RegExp(trimmedText, 'gi');
      }
    } else {
      const escapedText = filterText.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      regex = new RegExp(escapedText, 'gi');
    }
    filterError.value = '';
    const mappedData: SseDisplayItem[] = baseData.map((item, index) => ({ ...item, originalIndex: index }));
    return mappedData.filter(item => {
      const content = (item.event || '') + ' ' + (item.data || '');
      return regex.test(content);
    });
  } catch (error) {
    filterError.value = `${t('正则表达式错误')}: ${error instanceof Error ? error.message : t('未知错误')}`;
    return baseData.map((item, index) => ({ ...item, originalIndex: index }));
  }
});
const displayData = computed<SseDisplayItem[]>(() => {
  if (filterText.value.trim()) {
    return filteredData.value;
  }
  return customFilteredData.value.map((item, index) => ({ ...item, originalIndex: index }));
});
const rawDataContent = computed(() => {
  if (!props.dataList || props.dataList.length === 0) {
    return '';
  }
  const lines: string[] = [];
  props.dataList.forEach((chunkData) => {
    if (chunkData.chunk && chunkData.chunk.byteLength > 0) {
      const textDecoder = new TextDecoder('utf-8');
      const chunkText = textDecoder.decode(chunkData.chunk);
      if (chunkText.trim()) {
        lines.push(chunkText);
      }
    }
  });
  const rawContent = lines.join('');
  if (filterText.value.trim() && !filterError.value) {
    return highlightText(rawContent);
  }
  return rawContent;
});

/*
|--------------------------------------------------------------------------
| 函数方法 - 数据处理
|--------------------------------------------------------------------------
*/
const processFilteredData = (data: unknown[]): ParsedSSeData[] => {
  return data.map((item) => {
    let processedData: string;
    if (typeof item === 'string') {
      processedData = item;
    } else {
      try {
        processedData = JSON.stringify(item);
      } catch (error) {
        processedData = '[Invalid Data]';
      }
    }
    return {
      id: '',
      type: '',
      retry: 0,
      data: processedData,
      event: '',
      timestamp: Date.now(),
      dataType: 'normal',
      rawBlock: '',
    };
  });
};

/*
|--------------------------------------------------------------------------
| 函数方法 - 筛选相关
|--------------------------------------------------------------------------
*/
const toggleSearchInput = () => {
  isSearchInputVisible.value = !isSearchInputVisible.value;
  if (isSearchInputVisible.value) {
    nextTick(() => {
      filterInputRef.value?.focus();
    });
  } else {
    filterText.value = '';
    filterError.value = '';
  }
};
const toggleRegexMode = () => {
  isRegexMode.value = !isRegexMode.value;
  handleFilterChange();
};
const handleFilterChange = debounce(() => {
  activePopoverIndex.value = -1;
  filterError.value = '';
}, 300);
const highlightText = (text: string): string => {
  if (!filterText.value.trim() || filterError.value) {
    return text;
  }
  try {
    let regex: RegExp;
    if (isRegexMode.value) {
      const trimmedText = filterText.value.trim();
      const regexMatch = trimmedText.match(/^\/(.+)\/([gimuy]*)$/);
      if (regexMatch) {
        regex = new RegExp(regexMatch[1], regexMatch[2]);
      } else {
        regex = new RegExp(trimmedText, 'gi');
      }
    } else {
      const escapedText = filterText.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      regex = new RegExp(`(${escapedText})`, 'gi');
    }
    return text.replace(regex, '<mark class="highlight">$1</mark>');
  } catch (error) {
    return text;
  }
};

/*
|--------------------------------------------------------------------------
| 函数方法 - 视图切换相关
|--------------------------------------------------------------------------
*/
const toggleRawView = () => {
  isRawView.value = !isRawView.value;
  if (isRawView.value) {
    activePopoverIndex.value = -1;
  }
};

/*
|--------------------------------------------------------------------------
| 函数方法 - 下载相关
|--------------------------------------------------------------------------
*/
const downloadData = () => {
  if (!props.dataList || props.dataList.length === 0) {
    return;
  }
  try {
    const rawContent = generateRawContent();
    const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
    const fileName = `sse-raw-data_${timestamp}.txt`;
    downloadStringAsText(rawContent, fileName);
  } catch (error) {
    console.error('下载失败:', error);
  }
};
const generateRawContent = (): string => {
  const lines: string[] = [];
  props.dataList.forEach((chunkData) => {
    if (chunkData.chunk && chunkData.chunk.byteLength > 0) {
      const textDecoder = new TextDecoder('utf-8');
      const chunkText = textDecoder.decode(chunkData.chunk);
      if (chunkText.trim()) {
        lines.push(chunkText);
      }
    }
  });
  return lines.join('');
};

const handleFilteredDataChange = (data: FilteredDataPayload) => {
  customFilteredDataFromChild.value = data;
};

/*
|--------------------------------------------------------------------------
| 函数方法 - Popover相关
|--------------------------------------------------------------------------
*/
const resolveMessageElement = (node: Element | ComponentPublicInstance | null): HTMLElement | null => {
  if (!node) {
    return null;
  }
  if (node instanceof HTMLElement) {
    return node;
  }
  const component = node as ComponentPublicInstance;
  if (component.$el instanceof HTMLElement) {
    return component.$el;
  }
  return null;
};
const setMessageRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  const element = resolveMessageElement(el);
  if (!element) {
    delete messageRefs.value[index];
    if (index === activePopoverIndex.value) {
      popoverVirtualRef.value = null;
    }
    return;
  }
  messageRefs.value[index] = element;
  if (index === activePopoverIndex.value) {
    popoverVirtualRef.value = element;
  }
};
const handleMessageClick = debounce((index: number, event: Event) => {
  event.stopPropagation();
  if (activePopoverIndex.value === index) {
    return;
  }
  activePopoverIndex.value = index;
}, 100);
const handlePopoverHide = () => {
  activePopoverIndex.value = -1;
  popoverVirtualRef.value = null;
};
const handleClosePopover = () => {
  activePopoverIndex.value = -1;
  popoverVirtualRef.value = null;
};
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.sse-message') && !target.closest('.el-popover')) {
    activePopoverIndex.value = -1;
  }
};
const handleGlobalKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && activePopoverIndex.value !== -1) {
    activePopoverIndex.value = -1;
    event.preventDefault();
    event.stopPropagation();
  }
};
const syncPopoverRef = () => {
  if (activePopoverIndex.value === -1) {
    popoverVirtualRef.value = null;
    return;
  }
  nextTick(() => {
    const target = messageRefs.value[activePopoverIndex.value];
    popoverVirtualRef.value = target ?? null;
  });
};

/*
|--------------------------------------------------------------------------
| 函数方法 - SSE数据处理
|--------------------------------------------------------------------------
*/
const formatTimestamp = (timestamp: number): string => {
  return dayjs(timestamp).format('HH:mm:ss');
};
const cleanup = () => {
  const maxRefs = 1000;
  const currentLength = Object.keys(messageRefs.value).length;
  if (currentLength > maxRefs) {
    const sortedKeys = Object.keys(messageRefs.value)
      .map(Number)
      .sort((a, b) => a - b);
    const keysToDelete = sortedKeys.slice(0, currentLength - maxRefs);
    keysToDelete.forEach(key => {
      delete messageRefs.value[key];
    });
  }
};
const cleanupInterval = setInterval(cleanup, 30000);

const buildChunkSignature = (chunkList: ChunkWithTimestampe[]): string => {
  if (!chunkList || chunkList.length === 0) {
    return '';
  }
  const firstItem = chunkList[0];
  const lastItem = chunkList[chunkList.length - 1];
  const firstKey = `${firstItem.timestamp}-${firstItem.chunk.byteLength}`;
  const lastKey = `${lastItem.timestamp}-${lastItem.chunk.byteLength}`;
  return `${firstKey}|${lastKey}|${chunkList.length}`;
};
const resetPopoverState = () => {
  activePopoverIndex.value = -1;
  popoverVirtualRef.value = null;
};
const cleanupAfterDataReset = () => {
  resetPopoverState();
  messageRefs.value = {};
};

/*
|--------------------------------------------------------------------------
| 生命周期钩子
|--------------------------------------------------------------------------
*/
watch(() => props.dataList.length, () => {
  if (activePopoverIndex.value === -1) {
    return;
  }
  syncPopoverRef();
});
watch(() => props.isDataComplete, () => {
  if (activePopoverIndex.value === -1) {
    return;
  }
  syncPopoverRef();
});
watch(activePopoverIndex, () => {
  syncPopoverRef();
});
watch(() => apidocTabsStore.currentSelectTab?._id, () => {
  isFilterDialogVisible.value = false;
});
watch(() => router.currentRoute.value.query.id, () => {
  isFilterDialogVisible.value = false;
});
watch(() => router.currentRoute.value.path, () => {
  isFilterDialogVisible.value = false;
});
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleGlobalKeydown);
});
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleGlobalKeydown);
  clearInterval(cleanupInterval);
  isFilterDialogVisible.value = false;
});
</script>

<style lang="scss" scoped>
.sse-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .filter-container {
    position: relative;
    display: flex;
    align-items: flex-start;
    padding: 0 12px 0;
    border-bottom: 1px solid var(--border-light);

    .filter-collapsed {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
      height: 28px;
      opacity: 1;
      transition: opacity 0.2s ease;

      .compact-search-row {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        margin-right: 30px;

        .compact-filter-input {
          flex: 1;
          transition: all 0.3s ease;

          :deep(.el-input__suffix) {
            display: flex;
            align-items: center;
          }

          .compact-regex-toggle-btn {
            height: 100%;
            width: 25px;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-weight: bold;
            font-size: 10px;
            border-radius: 3px;
            color: var(--text-secondary);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            user-select: none;
            flex-shrink: 0;
            margin-left: 4px;

            &:hover {
              background-color: var(--bg-secondary);
              border-color: var(--border-base);
            }

            &.active {
              background-color: var(--primary, var(--el-color-primary));
              border-color: var(--primary, var(--el-color-primary));
              color: var(--text-white);

              &:hover {
                background-color: color-mix(in srgb, var(--primary) 70%, white);
                border-color: color-mix(in srgb, var(--primary) 70%, white);
              }
            }
          }
        }
      }

      .action-icons {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        height: 28px;
        margin-left: auto;
      }

      .icon {
        margin: 0 1px;
      }

      .search-icon {
        width: 28px;
        height: 28px;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          color: var(--primary, var(--el-color-primary));
          background-color: var(--bg-hover);
        }

        &.active {
          color: var(--primary, var(--el-color-primary));
          background-color: var(--bg-active);
        }
      }

      .download-icon {
        width: 28px;
        height: 28px;
        color: var(--text-secondary);
        cursor: pointer;
        transition: color 0.2s;

        &:hover {
          color: var(--success, var(--el-color-success));
          background-color: var(--bg-hover);
        }
      }

      .raw-view-icon {
        width: 28px;
        height: 28px;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          color: var(--primary, var(--el-color-primary));
          background-color: var(--bg-hover);
        }

        &.active {
          color: var(--primary, var(--el-color-primary));
          background-color: var(--bg-active);
        }
      }

      .compact-filter-stats {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        z-index: 10;
        background-color: var(--bg-primary);
        border: 1px solid var(--border-light);
        border-top: none;
        border-radius: 0 0 4px 4px;
        box-shadow: 0 2px 8px var(--shadow-color);

        .filter-stats {
          font-size: 12px;
          padding: 8px 12px;
          margin: 0;

          &:not(.error):not(.no-result) {
            color: var(--success, var(--el-color-success));
          }

          &.no-result {
            color: var(--warning, var(--el-color-warning));
          }

          &.error {
            color: var(--danger, var(--el-color-danger));
          }
        }
      }
    }

    .filter-expanded {
      width: 100%;
      opacity: 1;
      transition: opacity 0.2s ease;

      .filter-input-row {
        display: flex;
        align-items: center;
        height: 28px;

        .filter-input {
          flex: 1;
          max-width: none;

          :deep(.el-input__suffix) {
            display: flex;
            align-items: center;
          }

          .regex-toggle-btn {
            height: 25px;
            width: 25px;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-weight: bold;
            font-size: 10px;
            background-color: var(--gray-100, #f5f7fa);
            border: 1px solid var(--gray-200, var(--el-border-color-light));
            border-radius: 3px;
            color: var(--gray-700, #606266);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            user-select: none;
            flex-shrink: 0;
            margin-left: 4px;

            &:hover {
              background-color: var(--white, #f0f2f5);
              border-color: var(--gray-300, var(--el-border-color));
            }

            &.active {
              background-color: var(--primary, var(--el-color-primary));
              border-color: var(--primary, var(--el-color-primary));
              color: var(--text-white);

              &:hover {
                background-color: color-mix(in srgb, var(--primary) 70%, white);
                border-color: color-mix(in srgb, var(--primary) 70%, white);
              }
            }
          }
        }

        .close-btn {
          width: 24px;
          height: 24px;
          color: var(--gray-700, #606266);
          cursor: pointer;
          transition: color 0.2s;
          flex-shrink: 0;

          &:hover {
            color: var(--danger, var(--el-color-danger));
          }
        }
      }

      .filter-stats-row {
        margin-top: 8px;
        min-height: 18px;

        .filter-stats {
          font-size: 12px;

          &:not(.error):not(.no-result) {
            color: var(--success, var(--el-color-success));
          }

          &.no-result {
            color: var(--warning, var(--el-color-warning));
          }

          &.error {
            color: var(--danger, var(--el-color-danger));
          }
        }
      }
    }
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    height: 200px;
    color: var(--text-tertiary);
    font-size: 14px;
    gap: 12px;

    .loading-icon {
      font-size: 24px;
      animation: loading-rotate 2s linear infinite;
    }

    span {
      font-size: 14px;
    }
  }

  @keyframes loading-rotate {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  .raw-content {
    flex: 1;
    overflow: auto;
    padding: 12px;
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-light);
    border-radius: 4px;
    margin: 0 12px 12px 12px;

    .raw-data {
      margin: 0;
      padding: 0;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 13px;
      color: var(--text-primary);
      white-space: pre-wrap;
      word-break: break-all;
      line-height: 1.4;
      background: none;
      border: none;
    }
  }

  .filtered-result-block {
    flex: 1;
    display: flex;
    padding: 12px;
    margin: 0 12px 12px 12px;
    border: 1px solid var(--border-light);
    border-radius: 4px;
    background-color: var(--bg-primary);
    overflow: auto;

    .filtered-result-text {
      margin: 0;
      width: 100%;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 14px;
      color: var(--text-primary);
      white-space: pre-wrap;
      word-break: break-word;
    }
  }

  .sse-content {
    .sse-message {
      display: flex;
      align-items: center;
      padding: 4px 12px 4px 0;
      height: 100%;
      border-radius: 4px;
      background-color: var(--bg-primary);

      &.sse-message-hex {
        border-left: 3px solid var(--warning, var(--el-color-warning));
        background-color: var(--bg-warning-light);
      }

      .message-index {
        font-size: 12px;
        color: var(--primary, var(--el-color-primary));
        font-weight: bold;
        min-width: 30px;
        text-align: right;
        margin-right: 12px;
        flex-shrink: 0;
      }

      .message-content {
        flex: 1;
        min-width: 0;
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        font-size: 13px;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin: 0 12px 0 0;
      }

      .message-timestamp {
        font-size: 11px;
        color: var(--text-tertiary);
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        min-width: 80px;
        text-align: right;
        flex-shrink: 0;
      }

      &:hover {
        background-color: var(--bg-hover);
        cursor: pointer;

        &.sse-message-hex {
          background-color: var(--bg-warning-hover);
        }
      }
    }
  }
}

:deep(.highlight) {
  background-color: var(--bg-highlight);
  color: var(--text-highlight);
  font-weight: 600;
  padding: 1px 2px;
  border-radius: 2px;
}
</style>
