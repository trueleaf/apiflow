<template>
  <div ref="sseViewContainerRef" class="sse-view">
    <!-- 筛选框 -->
    <div v-if="dataList && dataList.length > 0 && props.isDataComplete" class="filter-container">
      <!-- 收起状态：只显示搜索图标 -->
      <div class="filter-collapsed">
        <div v-if="isSearchInputVisible" class="compact-search-row">
          <el-input 
            ref="filterInputRef" 
            v-model="filterText"
:placeholder="isRegexMode ? t('支持正则表达式') : t('输入关键词筛选')"
            size="small"
            class="compact-filter-input" 
            @input="handleFilterChange" 
            @keyup.enter="handleFilterChange"
          >
            <template #suffix>
              <div 
                class="compact-regex-toggle-btn" 
                :class="{ active: isRegexMode }" 
                @click="toggleRegexMode"
:title="t('切换正则表达式模式')"
            >
                .*
              </div>
            </template>
          </el-input>
        </div>

        <div class="action-icons">
          <el-icon class="icon search-icon" :class="{ active: isSearchInputVisible }" @click="toggleSearchInput">
            <Search />
          </el-icon>
          <el-icon class="icon raw-view-icon" :class="{ active: isRawView }" @click="toggleRawView" :title="t('切换原始数据视图')">
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
      </div></div>
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
    <!-- 虚拟滚动视图 -->
    <GVirtualScroll v-else class="sse-content" :items="displayData" :auto-scroll="true" :virtual="isDataComplete"
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
    <SsePopover
      v-if="!isRawView"
      :visible="activePopoverIndex !== -1"
      :message="currentMessage"
      :message-index="activePopoverIndex"
      :virtual-ref="currentMessageRef"
      @hide="handlePopoverHide"
      @close="handleClosePopover"
    />
  </div>
</template>

<script lang="ts" setup>
import { downloadStringAsText } from '@/helper';
import { debounce } from "lodash-es";
import { computed, ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { parseChunkList } from '@/utils/utils';
import dayjs from 'dayjs';
import type { ChunkWithTimestampe } from '@src/types/index.ts';
import GVirtualScroll from '@/components/apidoc/virtualScroll/GVirtualScroll.vue';
import SsePopover from './components/popover/SsePopover.vue';
import { Loading, Search, Download, Document } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';

/*
|--------------------------------------------------------------------------
| 全局变量
|--------------------------------------------------------------------------
*/
const props = withDefaults(defineProps<{ dataList: ChunkWithTimestampe[]; virtual?: boolean; isDataComplete?: boolean }>(), {
  dataList: () => [],
  isDataComplete: false,
});

// 获取翻译函数
const { t } = useI18n();
const sseViewContainerRef = ref<HTMLElement | null>(null);
// 性能优化：增量数据处理
const lastDataLength = ref(0);
const incrementalData = ref<any[]>([]);
// 筛选相关
const filterText = ref('');
const isRegexMode = ref(false);
const filterError = ref('');
const filterInputRef = ref<HTMLInputElement | null>(null);
const isSearchInputVisible = ref(false);
// 视图相关
const isRawView = ref(false);
// 切换原始视图模式
const toggleRawView = () => {
  isRawView.value = !isRawView.value;
  // 切换到原始视图时关闭 popover
  if (isRawView.value) {
    activePopoverIndex.value = -1;
  }
};

// 生成原始数据内容（计算属性）
const rawDataContent = computed(() => {
  if (!props.dataList || props.dataList.length === 0) {
    return '';
  }

  const lines: string[] = [];

  // 遍历原始数据列表，直接输出原始数据块
  props.dataList.forEach((chunkData) => {
    if (chunkData.chunk && chunkData.chunk.byteLength > 0) {
      // 将 Uint8Array 转换为字符串
      const textDecoder = new TextDecoder('utf-8');
      const chunkText = textDecoder.decode(chunkData.chunk);
      if (chunkText.trim()) {
        lines.push(chunkText);
      }
    }
  });

  const rawContent = lines.join('');

  // 如果有筛选条件，对原始内容进行高亮处理
  if (filterText.value.trim() && !filterError.value) {
    return highlightText(rawContent);
  }

  return rawContent;
});

// 切换搜索输入框显示状态
const toggleSearchInput = () => {
  isSearchInputVisible.value = !isSearchInputVisible.value;
  if (isSearchInputVisible.value) {
    // 显示输入框后自动聚焦
    nextTick(() => {
      filterInputRef.value?.focus();
    });
  } else {
    // 隐藏输入框时清空筛选条件
    filterText.value = '';
    filterError.value = '';
  }
};

// 切换正则表达式模式
const toggleRegexMode = () => {
  isRegexMode.value = !isRegexMode.value;
  // 切换模式时重新应用筛选
  handleFilterChange();
};

// 下载SSE数据
const downloadData = () => {
  if (!props.dataList || props.dataList.length === 0) {
    return;
  }

  try {
    // 生成原始返回数据内容
    const rawContent = generateRawContent();

    // 生成文件名
    const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
    const fileName = `sse-raw-data_${timestamp}.txt`;

    // 使用downloadStringAsText方法下载
    downloadStringAsText(rawContent, fileName);
  } catch (error) {
    console.error('下载失败:', error);
  }
};

// 生成原始返回数据内容
const generateRawContent = (): string => {
  const lines: string[] = [];

  // 遍历原始数据列表，直接输出原始数据块
  props.dataList.forEach((chunkData) => {
    if (chunkData.chunk && chunkData.chunk.byteLength > 0) {
      // 将 Uint8Array 转换为字符串
      const textDecoder = new TextDecoder('utf-8');
      const chunkText = textDecoder.decode(chunkData.chunk);
      if (chunkText.trim()) {
        lines.push(chunkText);
      }
    }
  });

  return lines.join('');
};

// 处理筛选输入变化
const handleFilterChange = debounce(() => {
  activePopoverIndex.value = -1;
  filterError.value = '';
}, 300);

// 高亮显示匹配的文本
const highlightText = (text: string): string => {
  if (!filterText.value.trim() || filterError.value) {
    return text;
  }

  try {
    let regex: RegExp;

    if (isRegexMode.value) {
      // 正则表达式模式
      const trimmedText = filterText.value.trim();

      // 检查是否是 /pattern/flags 格式
      const regexMatch = trimmedText.match(/^\/(.+)\/([gimuy]*)$/);
      if (regexMatch) {
        regex = new RegExp(regexMatch[1], regexMatch[2]);
      } else {
        // 普通正则表达式字符串
        regex = new RegExp(trimmedText, 'gi');
      }
    } else {
      // 普通文本模式，转义特殊字符
      const escapedText = filterText.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      regex = new RegExp(`(${escapedText})`, 'gi');
    }

    return text.replace(regex, '<mark class="highlight">$1</mark>');
  } catch (error) {
    // 正则表达式错误时不高亮
    return text;
  }
};
// 筛选后的数据
const filteredData = computed(() => {
  if (!filterText.value.trim()) {
    return formattedData.value;
  }
  try {
    let regex: RegExp;
    if (isRegexMode.value) {
      // 正则表达式模式
      const trimmedText = filterText.value.trim();

      // 检查是否是 /pattern/flags 格式
      const regexMatch = trimmedText.match(/^\/(.+)\/([gimuy]*)$/);
      if (regexMatch) {
        regex = new RegExp(regexMatch[1], regexMatch[2]);
      } else {
        // 普通正则表达式字符串
        regex = new RegExp(trimmedText, 'gi');
      }
    } else {
      // 普通文本模式，大小写不敏感
      const escapedText = filterText.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      regex = new RegExp(escapedText, 'gi');
    }

    // 清除错误状态
    filterError.value = '';

    return formattedData.value
      .map((item, index) => ({ ...item, originalIndex: index }))
      .filter((item) => {
        const content = (item.event || '') + ' ' + (item.data || '');
        return regex.test(content);
      });

  } catch (error) {
    // 正则表达式错误
    filterError.value = `${t('正则表达式错误')}: ${error instanceof Error ? error.message : t('未知错误')}`;
    return formattedData.value;
  }
});

// 最终显示的数据
const displayData = computed(() => filterText.value.trim() ? filteredData.value : formattedData.value.map((item, index) => ({ ...item, originalIndex: index })));

/*
|--------------------------------------------------------------------------
| Popover 相关
|--------------------------------------------------------------------------
*/
const activePopoverIndex = ref<number>(-1);
const messageRefs = ref<Record<number, HTMLElement>>({});
const currentMessageRef = computed(() => activePopoverIndex.value !== -1 ? messageRefs.value[activePopoverIndex.value] : null);
const currentMessage = computed(() => activePopoverIndex.value !== -1 ? formattedData.value[activePopoverIndex.value] : null);
const setMessageRef = (el: any, index: number) => {
  if (el && el instanceof HTMLElement) {
    messageRefs.value[index] = el;
  }
};

// 处理消息点击事件（添加防抖）
const handleMessageClick = debounce((index: number, event: Event) => {
  event.stopPropagation();
  // 如果点击的是同一条消息，保持 popover 打开状态
  if (activePopoverIndex.value === index) {
    return;
  }
  // 切换到新的消息或打开 popover
  activePopoverIndex.value = index;
}, 100);

// 处理 popover 隐藏事件
const handlePopoverHide = () => {
  activePopoverIndex.value = -1;
};

// 关闭 popover
const handleClosePopover = () => {
  activePopoverIndex.value = -1;
};

// 处理点击外部区域关闭 popover
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.sse-message') && !target.closest('.el-popover')) {
    activePopoverIndex.value = -1;
  }
};

// 处理全局 ESC 键关闭 popover
const handleGlobalKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && activePopoverIndex.value !== -1) {
    activePopoverIndex.value = -1;
    event.preventDefault();
    event.stopPropagation();
  }
};


/*
|--------------------------------------------------------------------------
| sse数据处理
|--------------------------------------------------------------------------
*/

// 性能优化：增量解析SSE数据
const formattedData = computed(() => {
  if (!props.dataList || props.dataList.length === 0) {
    lastDataLength.value = 0;
    incrementalData.value = [];
    return [];
  }

  // 如果数据长度没有变化，直接返回缓存的结果
  if (props.dataList.length === lastDataLength.value && incrementalData.value.length > 0) {
    return incrementalData.value;
  }

  // 如果是新增数据，只解析新增部分
  if (props.dataList.length > lastDataLength.value && lastDataLength.value > 0) {
    const newChunks = props.dataList.slice(lastDataLength.value);
    const newParsedData = parseChunkList(newChunks);
    incrementalData.value = [...incrementalData.value, ...newParsedData];
    lastDataLength.value = props.dataList.length;

    return incrementalData.value;
  }

  // 完全重新解析（首次加载或数据重置）
  const parsed = parseChunkList(props.dataList);
  incrementalData.value = parsed;
  lastDataLength.value = props.dataList.length;
  return parsed;
});

// 格式化时间戳为毫秒显示
const formatTimestamp = (timestamp: number): string => {
  return dayjs(timestamp).format('HH:mm:ss');
};

// 清理函数
const cleanup = () => {
  // 清理 messageRefs 中超过限制的旧引用
  const maxRefs = 1000; // 最多保留1000条消息的引用
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
// 定期清理
const cleanupInterval = setInterval(cleanup, 30000); // 每30秒清理一次

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleGlobalKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleGlobalKeydown);
  clearInterval(cleanupInterval);
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
    border-bottom: 1px solid #ebeef5;

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
              border-color: var(--gray-300, #dcdfe6);
            }

            &.active {
              background-color: var(--primary, #409eff);
              border-color: var(--primary, #409eff);
              color: #ffffff;

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
        color: var(--gray-700, #606266);
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          color: var(--primary, #409eff);
          background-color: #efefef;
        }

        &.active {
          color: var(--primary, #409eff);
          background-color: var(--light, #ecf5ff);
      }
      }

      .download-icon {
        width: 28px;
        height: 28px;
        color: var(--gray-700, #606266);
        cursor: pointer;
        transition: color 0.2s;

        &:hover {
          color: var(--success, #67c23a);
          background-color: #efefef;
        }
      }

      .raw-view-icon {
        width: 28px;
        height: 28px;
        color: var(--gray-700, #606266);
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          color: var(--primary, #409eff);
          background-color: #efefef;
        }

        &.active {
          color: var(--primary, #409eff);
          background-color: var(--light, #ecf5ff);
        }
      }

      .compact-filter-stats {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        z-index: 10;
        background-color: var(--white, #ffffff);
        border: 1px solid var(--gray-200, #ebeef5);
        border-top: none;
        border-radius: 0 0 4px 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        .filter-stats {
          font-size: 12px;
          padding: 8px 12px;
          margin: 0;

          &:not(.error):not(.no-result) {
            color: var(--success, #67c23a);
          }

          &.no-result {
            color: var(--warning, #e6a23c);
          }

          &.error {
            color: var(--danger, #f56c6c);
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
            border: 1px solid var(--gray-200, #e4e7ed);
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
              border-color: var(--gray-300, #dcdfe6);
            }

            &.active {
              background-color: var(--primary, #409eff);
              border-color: var(--primary, #409eff);
              color: #ffffff;

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
            color: var(--danger, #f56c6c);
          }
        }
      }

      .filter-stats-row {
        margin-top: 8px;
        min-height: 18px;

        .filter-stats {
          font-size: 12px;

          &:not(.error):not(.no-result) {
            color: var(--success, #67c23a);
          }

          &.no-result {
            color: var(--warning, #e6a23c);
          }

          &.error {
            color: var(--danger, #f56c6c);
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
    color: var(--gray-600, #909399);
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
    background-color: var(--gray-100, #fafcff);
    border: 1px solid var(--gray-200, #ebeef5);
    border-radius: 4px;
    margin: 0 12px 12px 12px;

    .raw-data {
      margin: 0;
      padding: 0;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 13px;
      color: var(--gray-800, #303133);
      white-space: pre-wrap;
      word-break: break-all;
      line-height: 1.4;
      background: none;
      border: none;
    }
  }

  .sse-content {
    .sse-message {
      display: flex;
      align-items: center;
      padding: 4px 12px 4px 0;
      height: 100%;
      border-radius: 4px;
      background-color: var(--white, #ffffff);

      &.sse-message-hex {
        border-left: 3px solid var(--warning, #e6a23c);
        background-color: var(--light, #fdf6ec);
      }

      .message-index {
        font-size: 12px;
        color: var(--primary, #409eff);
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
        color: var(--gray-800, #303133);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin: 0 12px 0 0;
      }

      .message-timestamp {
        font-size: 11px;
        color: var(--gray-600, #909399);
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        min-width: 80px;
        text-align: right;
        flex-shrink: 0;
      }

      &:hover {
        background-color: var(--gray-100, #f2f6fc);
        cursor: pointer;

        &.sse-message-hex {
          background-color: var(--gray-100, #faecd8);
        }
      }
    }
  }
}

// 高亮样式
:deep(.highlight) {
  background-color: var(--gray-100, #fdf2d5);
  color: var(--orange, #b17a1a);
  font-weight: 600;
  padding: 1px 2px;
  border-radius: 2px;
}
</style>
