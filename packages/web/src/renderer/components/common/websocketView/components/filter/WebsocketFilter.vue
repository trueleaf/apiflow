<template>
  <div v-if="hasData" class="filter-container">
    <div class="filter-collapsed">
      <div v-if="isSearchInputVisible" class="compact-search-row">
        <el-input 
          ref="filterInputRef" 
          v-model="filterText"
          :placeholder="isRegexMode ? $t('支持正则表达式') : $t('输入关键词筛选')"
          size="small"
          class="compact-filter-input" 
          @input="handleFilterChange" 
          @keyup.enter="handleFilterChange"
        >
          <template #suffix>
            <div 
              class="compact-regex-toggle-btn" 
              :class="{ active: isRegexMode }" 
              @click="handleToggleRegexMode"
              :title="$t('切换正则表达式模式')"
            >
              .*
            </div>
          </template>
        </el-input>
      </div>

      <div class="action-icons">
        <el-select
          v-model="selectedMessageTypes"
          multiple
          collapse-tags
          collapse-tags-tooltip
          :max-collapse-tags="1"
          :placeholder="$t('全部消息')"
          size="small"
          class="message-type-filter"
          @change="handleMessageTypeChange"
        >
          <el-option
            v-for="option in messageTypeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <el-icon class="icon clear-icon" @click="handleClearData" :title="$t('清空历史')">
          <Delete />
        </el-icon>
        <el-icon class="icon search-icon" :class="{ active: isSearchInputVisible }" @click="handleToggleSearchInput">
          <Search />
        </el-icon>
        <el-icon class="icon download-icon" @click="handleDownloadData" :title="$t('下载WebSocket数据')">
          <Download />
        </el-icon>
      </div>

      <!-- 在收起状态下显示筛选统计信息 -->
      <div v-if="filterText && isSearchInputVisible" class="compact-filter-stats">
        <div v-if="filterError" class="filter-stats error">
          {{ filterError }}
        </div>
        <div v-else-if="filteredCount > 0" class="filter-stats">
          {{ $t('找到') }} {{ filteredCount }} {{ $t('条匹配结果') }}
        </div>
        <div v-else class="filter-stats no-result">
          {{ $t('未找到匹配结果') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick, computed } from 'vue';
import { Search, Download, Delete } from '@element-plus/icons-vue';
import { debounce } from "lodash-es";
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

type Props = {
  hasData: boolean;
  isRawView: boolean;
  filteredCount: number;
};

type Emits = {
  (e: 'update:filterText', value: string): void;
  (e: 'update:isRegexMode', value: boolean): void;
  (e: 'update:filterError', value: string): void;
  (e: 'update:isRawView', value: boolean): void;
  (e: 'update:selectedMessageTypes', value: string[]): void;
  (e: 'update:isSearchInputVisible', value: boolean): void;
  (e: 'download'): void;
  (e: 'clearData'): void;
};

withDefaults(defineProps<Props>(), {
  hasData: false,
  isRawView: false,
  filteredCount: 0,
});

const emit = defineEmits<Emits>();

const filterText = ref('');
const isRegexMode = ref(false);
const filterError = ref('');
const filterInputRef = ref<HTMLInputElement | null>(null);
const isSearchInputVisible = ref(false);
const selectedMessageTypes = ref<string[]>([]);

// 消息类型选项
const messageTypeOptions = computed(() => [
  { value: 'send', label: t?.('发送') || '发送' },
  { value: 'receive', label: t?.('接收') || '接收' },
  { value: 'connected', label: t?.('已连接') || '已连接' },
  { value: 'disconnected', label: t?.('已断开') || '已断开' },
  { value: 'error', label: t?.('错误') || '错误' },
  { value: 'autoSend', label: t?.('自动发送') || '自动发送' },
  { value: 'reconnecting', label: t?.('重连中') || '重连中' },
]);

// 切换搜索输入框显示状态
const handleToggleSearchInput = () => {
  isSearchInputVisible.value = !isSearchInputVisible.value;
  emit('update:isSearchInputVisible', isSearchInputVisible.value);
  if (isSearchInputVisible.value) {
    // 显示输入框后自动聚焦
    nextTick(() => {
      filterInputRef.value?.focus();
    });
  } else {
    // 隐藏输入框时清空筛选条件
    filterText.value = '';
    filterError.value = '';
    emit('update:filterText', '');
    emit('update:filterError', '');
  }
};

// 切换正则表达式模式
const handleToggleRegexMode = () => {
  isRegexMode.value = !isRegexMode.value;
  emit('update:isRegexMode', isRegexMode.value);
  // 切换模式时重新应用筛选
  handleFilterChange();
};

// 下载数据
const handleDownloadData = () => {
  emit('download');
};
// 清空数据
const handleClearData = () => {
  emit('clearData');
};

// 处理筛选输入变化
const handleFilterChange = debounce(() => {
  emit('update:filterText', filterText.value);
  emit('update:filterError', filterError.value);
}, 300);

// 处理消息类型过滤变化
const handleMessageTypeChange = (value: string[]) => {
  selectedMessageTypes.value = value;
  emit('update:selectedMessageTypes', value);
};

// 暴露方法给父组件
defineExpose({
  filterText: () => filterText.value,
  isRegexMode: () => isRegexMode.value,
  isSearchInputVisible: () => isSearchInputVisible.value,
  selectedMessageTypes: () => selectedMessageTypes.value,
});
</script>

<style lang="scss" scoped>
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
    height: 35px;

    .compact-search-row {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      margin-right: 35px;

      .compact-filter-input {
        flex: 1;
        transition: all 0.3s ease;
        margin-top: 3px;

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
            background-color: var(--bg-hover);
            border-color: var(--border-base);
          }

          &.active {
            background-color: var(--primary-color);
            border-color: var(--primary-color);
            color: var(--text-white);

            &:hover {
              background-color: color-mix(in srgb, var(--primary-color) 70%, white);
              border-color: color-mix(in srgb, var(--primary-color) 70%, white);
            }
          }
        }
      }
    }

    .action-icons {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      height: 35px;
      flex: 0 0 40%;
      margin-left: auto;
      .message-type-filter {
        min-width: 140px;
        width: 65%;
        margin-right: 8px;
      }
    }

    .icon {
      margin: 0 1px;
      width: 28px;
      height: 28px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        color: var(--primary-color);
        background-color: var(--bg-hover);
      }

      &.active {
        color: var(--primary-color);
        background-color: var(--bg-secondary);
      }
    }

    .download-icon:hover {
      color: var(--success-color);
    }
    .clear-icon:hover {
      color: var(--danger-color);
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
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .filter-stats {
        font-size: 12px;
        padding: 8px 12px;
        margin: 0;

        &:not(.error):not(.no-result) {
          color: var(--success-color);
        }

        &.no-result {
          color: var(--warning-color);
        }

        &.error {
          color: var(--danger-color);
        }
      }
    }
  }
}
</style>
