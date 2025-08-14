<template>
  <div ref="sseViewContainerRef" class="sse-view">
    <!-- 筛选框 -->
    <div v-if="dataList && dataList.length > 0 && props.isDataComplete" class="filter-container">
      <!-- 收起状态：只显示搜索图标 -->
      <div v-if="!isFilterExpanded" class="filter-collapsed">
        <div v-if="isSearchInputVisible" class="compact-search-row">
          <el-input ref="filterInputRef" v-model="filterText"
            :placeholder="isRegexMode ? '支持正则表达式，如: /pattern/flags 或 pattern' : '输入关键词筛选消息内容...'" size="small"
            class="compact-filter-input" @input="handleFilterChange" @keyup.enter="handleFilterChange">
            <template #suffix>
              <div class="compact-regex-toggle-btn" :class="{ active: isRegexMode }" @click="toggleRegexMode"
                title="切换正则表达式模式">
                .*
              </div>
            </template>
          </el-input>
        </div>

        <div class="action-icons">
          <el-icon class="icon search-icon" :class="{ active: isSearchInputVisible }" @click="toggleSearchInput">
            <Search />
          </el-icon>
          <el-icon class="icon raw-view-icon" :class="{ active: isRawView }" @click="toggleRawView" title="切换原始数据视图">
            <Document />
          </el-icon>
          <el-icon class="icon download-icon" @click="downloadData" title="下载SSE数据">
            <Download />
          </el-icon>
        </div>

        <!-- 在收起状态下显示筛选统计信息 -->
        <div v-if="filterText && isSearchInputVisible" class="compact-filter-stats">
          <div v-if="filterError" class="filter-stats error">
            {{ filterError }}
          </div>
          <div v-else-if="filteredData.length > 0" class="filter-stats">
            找到 {{ filteredData.length }} 条匹配结果
          </div>
          <div v-else class="filter-stats no-result">
            未找到匹配结果
          </div>
        </div>
      </div>
      <!-- 展开状态：显示完整搜索框 -->
      <div v-else class="filter-expanded">
        <div class="filter-input-row">
          <el-input ref="filterInputRef" v-model="filterText"
            :placeholder="isRegexMode ? '支持正则表达式，如: /pattern/flags 或 pattern' : '输入关键词筛选消息内容...'" clearable size="small"
            class="filter-input" @input="handleFilterChange" @keyup.enter="handleFilterChange">
            <template #suffix>
              <div class="regex-toggle-btn" :class="{ active: isRegexMode }" @click="toggleRegexMode" title="切换正则表达式模式">
                .*
              </div>
            </template>
          </el-input>
          <el-icon class="close-btn" @click="toggleFilter">
            <Close />
          </el-icon>
        </div>

        <div v-if="filterText" class="filter-stats-row">
          <div v-if="filterError" class="filter-stats error">
            {{ filterError }}
          </div>
          <div v-else-if="filteredData.length > 0" class="filter-stats">
            找到 {{ filteredData.length }} 条匹配结果
          </div>
          <div v-else class="filter-stats no-result">
            未找到匹配结果
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
    <!-- json详情弹窗 -->
    <el-popover v-if="!isRawView" :visible="activePopoverIndex !== -1" placement="right-start" :width="600"
      :popper-style="{ padding: '0' }" :hide-after="0" transition="none" :virtual-ref="currentMessageRef"
      virtual-triggering @hide="handlePopoverHide">
      <template #default>
        <div v-if="currentMessage" class="sse-message-detail">
          <div class="detail-header">
            <div class="header">消息详情</div>
            <div class="close-btn" @click="handleClosePopover">
              <i class="iconfont iconguanbi" title="关闭"></i>
            </div>
          </div>
          <div class="detail-content-wrap">
            <div class="detail-row">
              <div class="row-item w-20">
                <label>序号:</label>
                <span>{{ activePopoverIndex + 1 }}</span>
              </div>
              <div v-if="currentMessage.event" class="row-item w-30">
                <label>事件类型:</label>
                <span>{{ currentMessage.event }}</span>
              </div>
              <div class="row-item w-50">
                <label>接受时间:</label>
                <span>{{ formatFullTimestamp(currentMessage.timestamp) }}</span>
              </div>
            </div>
            <div class="detail-content full-width">
              <div class="content-tabs">
                <div class="tab-header">
                  <div class="tab-item" :class="{ active: getActiveContentTab(activePopoverIndex) === 'content' }"
                    @click="setActiveContentTab(activePopoverIndex, 'content')">
                    完整内容
                  </div>
                  <div v-if="currentMessage.rawBlock && currentMessage.dataType !== 'binary'" class="tab-item"
                    :class="{ active: getActiveContentTab(activePopoverIndex) === 'raw' }"
                    @click="setActiveContentTab(activePopoverIndex, 'raw')">
                    原始数据块
                  </div>
                </div>
                <div class="tab-content">
                  <div v-if="getActiveContentTab(activePopoverIndex) === 'content'" class="content-wrapper">
                    <SJsonEditor v-if="isJsonString(currentMessage.data || currentMessage.rawBlock)"
                      :model-value="getFormattedContent(activePopoverIndex, currentMessage.data || currentMessage.rawBlock)"
                      :read-only="true" :min-height="100" :max-height="350" :auto-height="true"
                      :config="{ fontSize: 13, language: 'json' }" />
                    <pre v-else class="full-content">{{ currentMessage.data || currentMessage.rawBlock }}</pre>
                  </div>
                  <div
                    v-if="getActiveContentTab(activePopoverIndex) === 'raw' && currentMessage.rawBlock && currentMessage.dataType !== 'binary'"
                    class="content-wrapper">
                    <SJsonEditor :model-value="currentMessage.rawBlock" :read-only="true" :min-height="100"
                      :max-height="350" :auto-height="true"
                      :config="{ fontSize: 13, language: 'text/plain', wordWrap: 'on' }" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </el-popover>
  </div>
</template>

<script lang="ts" setup>
import { debounce, isJsonString, downloadStringAsText } from '@/helper';
import { computed, ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { parseChunkList } from '@/utils/utils';
import dayjs from 'dayjs';
import type { ChunkWithTimestampe } from '@src/types/types';
import SJsonEditor from '@/components/common/json-editor/g-json-editor.vue';
import GVirtualScroll from '@/components/apidoc/virtual-scroll/g-virtual-scroll.vue';
import { Loading, Search, Close, Download, Document } from '@element-plus/icons-vue';

/*
|--------------------------------------------------------------------------
| 全局变量
|--------------------------------------------------------------------------
*/
const props = withDefaults(defineProps<{ dataList: ChunkWithTimestampe[]; virtual?: boolean; isDataComplete?: boolean }>(), {
  dataList: () => [],
  isDataComplete: false,
});
const sseViewContainerRef = ref<HTMLElement | null>(null);
// 性能优化：增量数据处理
const lastDataLength = ref(0);
const incrementalData = ref<any[]>([]);
// 筛选相关
const filterText = ref('');
const isFilterExpanded = ref(false);
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

// 切换筛选框展开/收起状态
const toggleFilter = () => {
  isFilterExpanded.value = !isFilterExpanded.value;
  if (isFilterExpanded.value) {
    // 展开后自动聚焦到输入框
    nextTick(() => {
      filterInputRef.value?.focus();
    });
  } else {
    // 收起时清空筛选条件
    filterText.value = '';
    filterError.value = '';
  }
};

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
    filterError.value = `正则表达式错误: ${error instanceof Error ? error.message : '未知错误'}`;
    return formattedData.value;
  }
});

// 最终显示的数据
const displayData = computed(() => {
  return filterText.value.trim() ? filteredData.value : formattedData.value.map((item, index) => ({ ...item, originalIndex: index }));
});

/*
|--------------------------------------------------------------------------
| Popover 相关
|--------------------------------------------------------------------------
*/
const activePopoverIndex = ref<number>(-1);
const activeContentTabs = ref<Record<number, 'content' | 'raw'>>({});
const messageRefs = ref<Record<number, HTMLElement>>({});
const currentMessageRef = computed(() => {
  return activePopoverIndex.value !== -1 ? messageRefs.value[activePopoverIndex.value] : null;
});
const currentMessage = computed(() => {
  return activePopoverIndex.value !== -1 ? formattedData.value[activePopoverIndex.value] : null;
});
const setMessageRef = (el: any, index: number) => {
  if (el && el instanceof HTMLElement) {
    messageRefs.value[index] = el;
  }
};

/*
|--------------------------------------------------------------------------
| 格式化相关
|--------------------------------------------------------------------------
*/
const formattedContent = ref<Record<number, string>>({});

// 获取格式化后的内容
const getFormattedContent = (index: number, content: string): string => {
  // 如果是 JSON 格式且已格式化，返回格式化结果
  if (isJsonString(content) && formattedContent.value[index]) {
    return formattedContent.value[index];
  }
  // 否则返回原始内容
  return content;
};

// 格式化 JSON 内容
const formatJsonContent = (index: number, content: string) => {
  if (isJsonString(content) && !formattedContent.value[index]) {
    try {
      // 先尝试解析 JSON 确保格式正确
      const parsed = JSON.parse(content);
      const formatted = JSON.stringify(parsed, null, 2);
      formattedContent.value[index] = formatted;
    } catch (error) {
      // 如果解析失败，保持原始内容
      formattedContent.value[index] = content;
    }
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
  // 触发格式化
  const sseMessage = formattedData.value[index];
  if (sseMessage) {
    const content = sseMessage.data || sseMessage.rawBlock;
    if (content) {
      formatJsonContent(index, content);
    }
  }
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

// 获取当前激活的内容标签页
const getActiveContentTab = (index: number): 'content' | 'raw' => {
  return activeContentTabs.value[index] || 'content';
};

// 设置当前激活的内容标签页
const setActiveContentTab = (index: number, tab: 'content' | 'raw') => {
  activeContentTabs.value[index] = tab;
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

// 格式化完整时间戳
const formatFullTimestamp = (timestamp: number): string => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
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
      delete formattedContent.value[key];
      delete activeContentTabs.value[key];
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
            color: var(--text-color-regular, #606266);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            user-select: none;
            flex-shrink: 0;
            margin-left: 4px;

            &:hover {
              background-color: var(--fill-color, #f0f2f5);
              border-color: var(--border-color, #dcdfe6);
            }

            &.active {
              background-color: var(--color-primary, #409eff);
              border-color: var(--color-primary, #409eff);
              color: #ffffff;

              &:hover {
                background-color: var(--color-primary-light-3, #79bbff);
                border-color: var(--color-primary-light-3, #79bbff);
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
        color: var(--text-color-regular, #606266);
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          color: var(--color-primary, #409eff);
          background-color: #efefef;
        }

        &.active {
          color: var(--color-primary, #409eff);
          background-color: var(--color-primary-light-9, #ecf5ff);
        }
      }

      .download-icon {
        width: 28px;
        height: 28px;
        color: var(--text-color-regular, #606266);
        cursor: pointer;
        transition: color 0.2s;

        &:hover {
          color: var(--color-success, #67c23a);
          background-color: #efefef;
        }
      }

      .raw-view-icon {
        width: 28px;
        height: 28px;
        color: var(--text-color-regular, #606266);
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          color: var(--color-primary, #409eff);
          background-color: #efefef;
        }

        &.active {
          color: var(--color-primary, #409eff);
          background-color: var(--color-primary-light-9, #ecf5ff);
        }
      }

      .compact-filter-stats {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        z-index: 10;
        background-color: var(--bg-color, #ffffff);
        border: 1px solid var(--border-color-lighter, #ebeef5);
        border-top: none;
        border-radius: 0 0 4px 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        .filter-stats {
          font-size: 12px;
          padding: 8px 12px;
          margin: 0;

          &:not(.error):not(.no-result) {
            color: var(--color-success, #67c23a);
          }

          &.no-result {
            color: var(--color-warning, #e6a23c);
          }

          &.error {
            color: var(--color-danger, #f56c6c);
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
            background-color: var(--fill-color-light, #f5f7fa);
            border: 1px solid var(--border-color-light, #e4e7ed);
            border-radius: 3px;
            color: var(--text-color-regular, #606266);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            user-select: none;
            flex-shrink: 0;
            margin-left: 4px;

            &:hover {
              background-color: var(--fill-color, #f0f2f5);
              border-color: var(--border-color, #dcdfe6);
            }

            &.active {
              background-color: var(--color-primary, #409eff);
              border-color: var(--color-primary, #409eff);
              color: #ffffff;

              &:hover {
                background-color: var(--color-primary-light-3, #79bbff);
                border-color: var(--color-primary-light-3, #79bbff);
              }
            }
          }
        }

        .close-btn {
          width: 24px;
          height: 24px;
          color: var(--text-color-regular, #606266);
          cursor: pointer;
          transition: color 0.2s;
          flex-shrink: 0;

          &:hover {
            color: var(--color-danger, #f56c6c);
          }
        }
      }

      .filter-stats-row {
        margin-top: 8px;
        min-height: 18px;

        .filter-stats {
          font-size: 12px;

          &:not(.error):not(.no-result) {
            color: var(--color-success, #67c23a);
          }

          &.no-result {
            color: var(--color-warning, #e6a23c);
          }

          &.error {
            color: var(--color-danger, #f56c6c);
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
    color: var(--text-color-secondary, #909399);
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
    background-color: var(--fill-color-extra-light, #fafcff);
    border: 1px solid var(--border-color-lighter, #ebeef5);
    border-radius: 4px;
    margin: 0 12px 12px 12px;

    .raw-data {
      margin: 0;
      padding: 0;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 13px;
      color: var(--text-color-primary, #303133);
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
      background-color: var(--bg-color, #ffffff);

      &.sse-message-hex {
        border-left: 3px solid var(--color-warning, #e6a23c);
        background-color: var(--color-warning-light-9, #fdf6ec);
      }

      .message-index {
        font-size: 12px;
        color: var(--color-primary, #409eff);
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
        color: var(--text-color-primary, #303133);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin: 0 12px 0 0;
      }

      .message-timestamp {
        font-size: 11px;
        color: var(--text-color-secondary, #909399);
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        min-width: 80px;
        text-align: right;
        flex-shrink: 0;
      }

      &:hover {
        background-color: var(--fill-color-lighter, #f2f6fc);
        cursor: pointer;

        &.sse-message-hex {
          background-color: var(--color-warning-light-8, #faecd8);
        }
      }
    }
  }
}

.sse-message-detail {
  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 16px;
    border-bottom: 1px solid var(--border-color-lighter, #ebeef5);
    background: linear-gradient(to right, #2c3e50, #3a4a5f);
    color: var(--white, #ffffff);
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;

    .header {
      margin: 0;
      font-size: 16px;
      color: var(--white, #ffffff);
    }

    .close-btn {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 5px;
      cursor: pointer;
      color: var(--white, #ffffff);
      transition: background-color 0.2s;

      .iconfont {
        font-size: 12px;
      }

      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }
  }

  .detail-content-wrap {
    padding: 16px;
    max-height: 500px;
    overflow-y: auto;

    .detail-row {
      display: flex;

      .row-item {
        label {
          margin-right: 10px;
        }
      }
    }

    .detail-content {
      display: flex;
      margin-bottom: 12px;
      align-items: flex-start;

      &.full-width {
        flex-direction: column;
        margin-bottom: 16px;
      }

      label {
        min-width: 80px;
        font-weight: 600;
        color: var(--text-color-regular, #606266);
        margin-right: 12px;
        flex-shrink: 0;
      }

      span {
        color: var(--text-color-primary, #303133);
        word-break: break-all;
      }

      .content-tabs {
        width: 100%;
        margin-top: 8px;

        .tab-header {
          display: flex;
          border-bottom: 1px solid var(--border-color-lighter, #ebeef5);
          margin-bottom: 12px;

          .tab-item {
            padding: 8px 16px;
            cursor: pointer;
            font-size: 14px;
            color: var(--text-color-regular, #606266);
            border-bottom: 2px solid transparent;
            transition: all 0.2s;

            &:hover {
              color: var(--color-primary, #409eff);
            }

            &.active {
              color: var(--color-primary, #409eff);
              border-bottom-color: var(--color-primary, #409eff);
            }
          }
        }

        .tab-content {
          .content-wrapper {
            width: 100%;
            max-height: 350px;
          }

          .full-content,
          .raw-block {
            background-color: var(--fill-color-extra-light, #fafcff);
            border: 1px solid var(--border-color-lighter, #ebeef5);
            border-radius: 4px;
            padding: 12px;
            margin: 0;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 13px;
            color: var(--text-color-primary, #303133);
            white-space: pre-wrap;
            word-break: break-all;
            max-height: 350px;
            overflow-y: auto;
            line-height: 1.4;
          }

          .raw-block {
            background-color: var(--color-info-light-9, #f4f4f5);
            color: var(--text-color-secondary, #909399);
          }
        }
      }

      .content-wrapper {
        width: 100%;
        margin-top: 8px;
      }
    }
  }
}

// 高亮样式
:deep(.highlight) {
  background-color: var(--color-warning-light-7, #fdf2d5);
  color: var(--color-warning-dark-2, #b17a1a);
  font-weight: 600;
  padding: 1px 2px;
  border-radius: 2px;
}
</style>
