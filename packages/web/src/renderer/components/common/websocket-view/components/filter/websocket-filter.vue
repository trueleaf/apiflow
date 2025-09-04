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
import { ref, nextTick, defineEmits, defineProps } from 'vue';
import { Search, Download } from '@element-plus/icons-vue';
import { debounce } from '@/helper';

interface Props {
  hasData: boolean;
  isRawView: boolean;
  filteredCount: number;
}

interface Emits {
  (e: 'update:filterText', value: string): void;
  (e: 'update:isRegexMode', value: boolean): void;
  (e: 'update:filterError', value: string): void;
  (e: 'update:isRawView', value: boolean): void;
  (e: 'download'): void;
}

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

// 切换搜索输入框显示状态
const handleToggleSearchInput = () => {
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

// 处理筛选输入变化
const handleFilterChange = debounce(() => {
  emit('update:filterText', filterText.value);
  emit('update:filterError', filterError.value);
}, 300);

// 暴露方法给父组件
defineExpose({
  filterText: () => filterText.value,
  isRegexMode: () => isRegexMode.value,
  isSearchInputVisible: () => isSearchInputVisible.value,
});
</script>

<style lang="scss" scoped>
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
    height: 30px;
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
        margin-top: 3px;

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
      height: 30px;
      margin-left: auto;
    }

    .icon {
      margin: 0 1px;
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

    .download-icon:hover {
      color: var(--color-success, #67c23a);
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
}
</style>
