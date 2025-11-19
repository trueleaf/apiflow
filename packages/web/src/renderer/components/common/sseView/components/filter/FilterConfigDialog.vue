<template>
  <div class="filter-config-wrapper">
    <el-badge :is-dot="localFilterConfig.enabled" class="filter-badge-wrapper">
      <el-icon class="icon filter-icon" :class="{ active: isDialogVisible }" @click="toggleDialog"
        :title="t('过滤配置')">
        <Filter :size="16" />
      </el-icon>
    </el-badge>
    <DraggableDialog v-model="isDialogVisible" :title="t('过滤配置')" :width="800">
      <div class="filter-dialog-content">
        <div class="editor-header">
          <div class="header-left">
            <label class="switch-label">{{ t('启用') }}</label>
            <el-switch v-model="localFilterConfig.enabled" />
          </div>
        </div>
        <div class="editor-container">
          <CodeEditor
            v-model="localFilterConfig.code"
            language="javascript"
            :auto-height="true"
            :min-height="300"
            :max-height="500"
          >
            <template #toolbar>
              <el-button text type="primary" @click="handleResetFilterCode">
                {{ t('重置') }}
              </el-button>
            </template>
          </CodeEditor>
        </div>
        <div v-if="localFilterConfigError" class="config-error">
          <el-alert :title="t('函数执行错误')" :description="localFilterConfigError" type="error" :closable="false" show-icon />
        </div>
      </div>
    </DraggableDialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, computed } from 'vue';
import DraggableDialog from '@/components/ui/cleanDesign/draggableDialog/DraggableDialog.vue';
import CodeEditor from '@/components/ui/cleanDesign/codeEditor/CodeEditor.vue';
import { Filter } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

const DEFAULT_FILTER_CODE = `const buffer = [];
function filter(chunk) {
  // chunk代表当前行的原始数据，例如：{ event: string, data: string, timestamp: number }
  // 如果返回null(falsy)则代表什么都不处理
  // 返回内容会覆盖最终展示，例如返回“测试数据”则界面展示“测试数据”
  try {
    const json = JSON.parse(chunk.data);
    const text = json.choices?.[0]?.delta?.content;
    if (text) {
      buffer.push(text);
      return buffer.join('');
    }
    return null;
  } catch {
    return null;
  }
}`;

type FilterConfigState = {
  enabled: boolean;
  code: string;
};

type FilteredDataPayload = {
  list: unknown[];
  finalValue: unknown | null;
};

type FilterExecutor = (chunk: unknown) => unknown;

const FILTER_STORAGE_KEY = 'sseFilterConfig';

const props = withDefaults(defineProps<{
  modelValue: boolean;
  sourceData: unknown[];
}>(), {
  modelValue: false,
  sourceData: () => [],
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'filteredDataChange', data: FilteredDataPayload): void;
}>();

const { t } = useI18n();
const isDialogVisible = ref(false);
const localFilterConfig = ref<FilterConfigState>({
  enabled: false,
  code: DEFAULT_FILTER_CODE,
});
const localFilterConfigError = ref('');
const toggleDialog = () => {
  isDialogVisible.value = !isDialogVisible.value;
};
const handleResetFilterCode = () => {
  localFilterConfig.value.code = DEFAULT_FILTER_CODE;
};
const createFilterExecutor = (code: string): FilterExecutor => {
  try {
    const executor = new Function(`
      ${code}
      if (typeof filter !== 'function') {
        throw new Error('filter函数未定义');
      }
      return filter;
    `) as () => FilterExecutor;
    return executor();
  } catch (error) {
    throw error;
  }
};
const customFilteredData = computed<FilteredDataPayload>(() => {
  if (!localFilterConfig.value.enabled) {
    localFilterConfigError.value = '';
    return { list: [], finalValue: null };
  }
  if (!localFilterConfig.value.code.trim()) {
    localFilterConfigError.value = '';
    return { list: [], finalValue: null };
  }
  try {
    const filterExecutor = createFilterExecutor(localFilterConfig.value.code);
    const filteredList: unknown[] = [];
    let latestValue: unknown | null = null;
    props.sourceData.forEach(item => {
      try {
        const result = filterExecutor(item);
        if (result !== null && result !== undefined) {
          filteredList.push(result);
          latestValue = result;
        }
      } catch (error) {
        filteredList.push(item);
      }
    });
    localFilterConfigError.value = '';
    return { list: filteredList, finalValue: latestValue };
  } catch (error) {
    localFilterConfigError.value = error instanceof Error ? error.message : '过滤函数执行错误';
    return { list: [], finalValue: null };
  }
});
watch(isDialogVisible, (newVal) => {
  emit('update:modelValue', newVal);
});
watch(() => props.modelValue, (newVal) => {
  isDialogVisible.value = newVal;
});
watch(localFilterConfig, (newVal) => {
  localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(newVal));
}, { deep: true });
watch(customFilteredData, (newVal) => {
  emit('filteredDataChange', newVal);
});
onMounted(() => {
  const savedConfig = localStorage.getItem(FILTER_STORAGE_KEY);
  if (savedConfig) {
    try {
      const parsed = JSON.parse(savedConfig);
      localFilterConfig.value = {
        enabled: parsed.enabled ?? false,
        code: parsed.code || DEFAULT_FILTER_CODE,
      };
    } catch {
    }
  }
});
</script>

<style lang="scss" scoped>
.filter-config-wrapper {
  display: inline-flex;
  align-items: center;
  .filter-badge-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 23px;
    height: 23px;
  }
  .filter-icon {
    width: 28px;
    height: 28px;
    color: var(--gray-700, #606266);
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
      color: var(--primary, var(--el-color-primary));
      background-color: #efefef;
    }
    &.active {
      color: var(--primary, var(--el-color-primary));
      background-color: var(--light, #ecf5ff);
    }
  }
}
.filter-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 5px;
  .editor-header {
    display: flex;
    align-items: center;
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
      .switch-label {
        font-size: 14px;
        color: var(--gray-800, #303133);
        font-weight: 500;
        user-select: none;
      }
    }
  }
  .editor-container {
    width: 100%;
    min-height: 300px;
  }
  .config-error {
    margin-top: 8px;
  }
}
</style>
