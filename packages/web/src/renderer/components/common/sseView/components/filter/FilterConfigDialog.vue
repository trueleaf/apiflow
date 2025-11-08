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
import CodeEditor from '@/components/common/codeEditor/CodeEditor.vue';
import { Filter } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

const DEFAULT_FILTER_CODE = `function filter(chunk) {
  // chunk代表当前行的原始数据，例如：{ event: string, data: string, timestamp: number }
  // 如果返回null(falsly)则代表什么都不处理
  // 返回什么代表最后显示什么
  try {
    const json = JSON.parse(chunk.data);
    return json.choices[0]?.delta?.content;
  } catch {
    return null;
  }
}`;

const props = withDefaults(defineProps<{
  modelValue: boolean;
  sourceData: unknown[];
}>(), {
  modelValue: false,
  sourceData: () => [],
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'filteredDataChange', data: unknown[]): void;
}>();

const { t } = useI18n();
const isDialogVisible = ref(false);
const localFilterConfig = ref({
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
const executeFilterCode = (code: string, chunk: unknown): unknown => {
  try {
    const func = new Function('chunk', `
      ${code}
      return filter(chunk);
    `);
    return func(chunk);
  } catch (error) {
    throw error;
  }
};
const customFilteredData = computed(() => {
  if (!localFilterConfig.value.enabled) {
    localFilterConfigError.value = '';
    return [];
  }
  if (!localFilterConfig.value.code.trim()) {
    localFilterConfigError.value = '';
    return [];
  }
  try {
    const filtered = props.sourceData
      .map(item => {
        try {
          const result = executeFilterCode(localFilterConfig.value.code, item);
          return result;
        } catch (error) {
          return item;
        }
      })
      .filter(item => item !== null && item !== undefined);
    localFilterConfigError.value = '';
    return filtered;
  } catch (error) {
    localFilterConfigError.value = error instanceof Error ? error.message : '过滤函数执行错误';
    return [];
  }
});
watch(isDialogVisible, (newVal) => {
  emit('update:modelValue', newVal);
});
watch(() => props.modelValue, (newVal) => {
  isDialogVisible.value = newVal;
});
watch(localFilterConfig, (newVal) => {
  localStorage.setItem('sseFilterConfig', JSON.stringify(newVal));
}, { deep: true });
watch(customFilteredData, (newVal) => {
  emit('filteredDataChange', newVal);
});
onMounted(() => {
  const savedConfig = localStorage.getItem('sseFilterConfig');
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
      color: var(--primary, #409eff);
      background-color: #efefef;
    }
    &.active {
      color: var(--primary, #409eff);
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
