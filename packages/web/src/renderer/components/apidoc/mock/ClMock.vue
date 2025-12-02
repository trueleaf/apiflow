<template>
  <div
    class="cl-mock-select"
    tabindex="-1"
    @click.stop
    @focusin="handlePanelFocusIn"
    @focusout="handlePanelFocusOut"
  >
    <!-- 顶部 Tab 切换数据源 -->
    <div class="source-tabs">
      <div
        class="source-tab"
        :class="{ active: activeSource === 'variable' }"
        @click="activeSource = 'variable'"
      >
        {{ t('变量') }}
      </div>
      <div
        class="source-tab"
        :class="{ active: activeSource === 'mockjs' }"
        @click="activeSource = 'mockjs'"
      >
        Mock.js
      </div>
      <div
        class="source-tab"
        :class="{ active: activeSource === 'faker' }"
        @click="activeSource = 'faker'"
      >
        Faker.js
      </div>
      <div class="search-box" @mousedown.stop>
        <el-input
          v-model="searchText"
          :placeholder="t('搜索')"
          size="small"
          clearable
          :prefix-icon="Search"
        />
      </div>
    </div>

    <div class="content-wrap">
      <!-- 左侧分类列表（变量模式下隐藏） -->
      <div v-if="activeSource !== 'variable'" class="category-list">
        <div
          v-for="category in mockCategories"
          :key="category.key"
          class="category-item"
          :class="{ active: activeCategory === category.key }"
          @click="activeCategory = category.key"
        >
          <span class="label">{{ category.label }}</span>
          <span class="count">{{ getCategoryCount(category.key) }}</span>
        </div>
      </div>

      <!-- 右侧内容区域 -->
      <div class="main-content">
        <!-- 变量列表 -->
        <div v-if="activeSource === 'variable'" class="data-list">
          <div
            v-for="item in filteredVariableList"
            :key="item._id"
            class="data-item"
            :class="{ active: currentVariableId === item._id }"
            @mouseenter="handleVariablePreview(item)"
            @click="handleSelectVariable(item)"
          >
            <span class="value">{{ item.name }}</span>
            <span class="name">{{ item.value }}</span>
          </div>
          <div v-if="filteredVariableList.length === 0" class="empty-tip">
            {{ t('无匹配数据') }}
          </div>
        </div>
        <!-- Mock 数据列表 -->
        <div v-else class="data-list">
          <div
            v-for="(item, index) in filteredMockList"
            :key="index"
            class="data-item"
            :class="{ active: currentItem?._id === item._id }"
            @mouseenter="handlePreview(item)"
            @click="handleSelect(item)"
          >
            <span class="value">{{ getDisplayValue(item) }}</span>
            <span class="name">{{ item.name }}</span>
          </div>
          <div v-if="filteredMockList.length === 0" class="empty-tip">
            {{ t('无匹配数据') }}
          </div>
        </div>

        <!-- 预览区域 -->
        <div class="preview-area">
          <div class="preview-label">{{ t('预览') }}</div>
          <div class="preview-content">
            <el-image
              v-if="isImagePreview"
              :src="previewValue"
              fit="contain"
            />
            <span v-else>{{ previewValue }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import type { MockItem, ApidocVariable } from '@src/types'
import Mock from '@/server/mock/mock'
import { faker } from '@faker-js/faker/locale/zh_CN'
import { mockCategories, mockjsList, fakerList } from './mock-enum';
import { computed, onMounted, ref, watch } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { useVariable } from '@/store/apidoc/variablesStore';

const props = defineProps({
  searchValue: {
    type: String,
    default: '',
  },
  closeOnClickModal: {
    type: Boolean,
    default: true
  },
  autoCopy: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits(['select', 'close', 'interaction']);
const { t } = useI18n();
const variableStore = useVariable();

// 响应式状态
const activeSource = ref<'variable' | 'mockjs' | 'faker'>('variable');
const currentVariableId = ref<string | null>(null);
const activeCategory = ref('common');
const searchText = ref('');
const previewValue = ref<string>('');
const isImagePreview = ref(false);
const currentItem = ref<(MockItem & { _id?: string }) | null>(null);
const handlePanelFocusIn = () => {
  emits('interaction', true);
};
const handlePanelFocusOut = (event: FocusEvent) => {
  const target = event.currentTarget as HTMLElement | null;
  if (target && event.relatedTarget instanceof Node && target.contains(event.relatedTarget)) {
    return;
  }
  emits('interaction', false);
};

// 过滤后的变量列表
const filteredVariableList = computed(() => {
  const search = searchText.value.trim().toLowerCase();
  let list = variableStore.variables;
  if (search) {
    list = list.filter(item =>
      item.name.toLowerCase().includes(search) ||
      item.value.toLowerCase().includes(search)
    );
  }
  return list;
});
// 根据数据源获取对应列表
const currentList = computed(() => {
  return activeSource.value === 'mockjs' ? mockjsList : fakerList;
});

// 过滤后的 mock 列表
const filteredMockList = computed(() => {
  let list = currentList.value.filter(item => item.category === activeCategory.value);

  const search = (searchText.value || props.searchValue || '').trim().toLowerCase().replace('@', '').replace('#', '');
  if (search) {
    list = list.filter(item =>
      item.value.toLowerCase().includes(search) ||
      item.name.toLowerCase().includes(search)
    );
  }

  return list.map((item, index) => ({ ...item, _id: `${item.source}-${item.value}-${index}` }));
});

// 获取分类下的数量
const getCategoryCount = (categoryKey: string) => {
  const search = (searchText.value || props.searchValue || '').trim().toLowerCase().replace('@', '').replace('#', '');
  let list = currentList.value.filter(item => item.category === categoryKey);

  if (search) {
    list = list.filter(item =>
      item.value.toLowerCase().includes(search) ||
      item.name.toLowerCase().includes(search)
    );
  }

  return list.length;
};

// 获取显示的值
const getDisplayValue = (item: MockItem) => {
  return item.source === 'mockjs' ? `@${item.value}` : `#${item.value}`;
};

// 生成预览数据
const generatePreview = (item: MockItem): string => {
  try {
    if (item.source === 'mockjs') {
      return Mock.mock(`@${item.value}`);
    } else {
      // Faker.js 预览
      const parts = item.value.split('.');
      if (parts.length === 2) {
        const [module, method] = parts;
        const fakerModule = (faker as unknown as Record<string, Record<string, () => unknown>>)[module];
        if (fakerModule && typeof fakerModule[method] === 'function') {
          const result = fakerModule[method]();
          if (result instanceof Date) {
            return result.toISOString();
          }
          return String(result);
        }
      }
      return '';
    }
  } catch {
    return '';
  }
};

// 预览处理
const handlePreview = (item: MockItem & { _id?: string }) => {
  currentItem.value = item;
  previewValue.value = generatePreview(item);
  isImagePreview.value = item.tags.includes('图片');
};

// 选择处理
const handleSelect = (item: MockItem) => {
  emits('select', item);
  emits('close');
};
// 变量预览
const handleVariablePreview = (item: ApidocVariable) => {
  currentVariableId.value = item._id;
  previewValue.value = item.value;
  isImagePreview.value = false;
};
// 选择变量
const handleSelectVariable = (item: ApidocVariable) => {
  emits('select', { source: 'variable', value: item.name, name: item.value });
  emits('close');
};

// 监听搜索值变化
watch([() => props.searchValue, searchText], () => {
  if (filteredMockList.value.length > 0) {
    handlePreview(filteredMockList.value[0]);
  }
});

// 切换数据源或分类时重置预览
watch([activeSource, activeCategory], () => {
  if (activeSource.value === 'variable') {
    if (filteredVariableList.value.length > 0) {
      handleVariablePreview(filteredVariableList.value[0]);
    } else {
      currentVariableId.value = null;
      previewValue.value = '';
    }
  } else if (filteredMockList.value.length > 0) {
    handlePreview(filteredMockList.value[0]);
  } else {
    currentItem.value = null;
    previewValue.value = '';
  }
});

onMounted(() => {
  // 初始化预览
  if (activeSource.value === 'variable') {
    if (filteredVariableList.value.length > 0) {
      handleVariablePreview(filteredVariableList.value[0]);
    }
  } else if (filteredMockList.value.length > 0) {
    handlePreview(filteredMockList.value[0]);
  }
});
</script>

<style lang='scss' scoped>
.cl-mock-select {
  width: 480px;
  height: 380px;
  background: var(--white);
  border-radius: 6px;
  display: flex;
  flex-direction: column;

  .source-tabs {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid var(--gray-300);
    gap: 8px;

    .source-tab {
      padding: 4px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      color: var(--gray-600);
      transition: all 0.2s;

      &:hover {
        background: var(--gray-100);
      }

      &.active {
        background: var(--theme-color);
        color: var(--white);
      }
    }

    .search-box {
      flex: 1;
      margin-left: auto;

      :deep(.el-input) {
        width: 140px;
      }
    }
  }

  .content-wrap {
    flex: 1;
    display: flex;
    overflow: hidden;

    .category-list {
      width: 100px;
      border-right: 1px solid var(--gray-300);
      overflow-y: auto;
      padding: 8px 0;

      .category-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        cursor: pointer;
        font-size: 12px;
        transition: background 0.2s;

        &:hover {
          background: var(--gray-100);
        }

        &.active {
          background: var(--gray-200);
          color: var(--theme-color);
          font-weight: 500;
        }

        .label {
          flex: 1;
        }

        .count {
          color: var(--gray-500);
          font-size: 11px;
        }
      }
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .data-list {
        flex: 1;
        overflow-y: auto;
        padding: 8px 0;

        .data-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 12px;
          cursor: pointer;
          font-size: 12px;
          transition: background 0.2s;

          &:hover,
          &.active {
            background: var(--gray-100);
          }

          .value {
            color: var(--theme-color);
            font-family: monospace;
            flex-shrink: 0;
            margin-right: 8px;
          }

          .name {
            color: var(--gray-600);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .empty-tip {
          text-align: center;
          color: var(--gray-500);
          padding: 20px;
          font-size: 12px;
        }
      }

      .preview-area {
        border-top: 1px solid var(--gray-300);
        padding: 8px 12px;
        min-height: 60px;

        .preview-label {
          font-size: 11px;
          color: var(--gray-500);
          margin-bottom: 4px;
        }

        .preview-content {
          font-size: 13px;
          word-break: break-all;
          max-height: 40px;
          overflow-y: auto;

          :deep(.el-image) {
            max-height: 36px;
            max-width: 100%;
          }
        }
      }
    }
  }
}
</style>
