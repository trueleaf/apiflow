<template>
  <div v-show="isVisible" class="advanced-search-panel">
    <el-card shadow="never" class="search-card">
      <div class="search-sections">
        <!-- 基础信息 -->
        <div class="search-section">
          <div class="section-header">
            <span class="section-title">{{ $t('基础信息') }}:</span>
          </div>
          <div class="section-content">
            <el-checkbox v-model="localConditions.searchScope.projectName">{{ $t('项目名称') }}</el-checkbox>
            <el-checkbox v-model="localConditions.searchScope.docName">{{ $t('文档名称') }}</el-checkbox>
            <el-checkbox v-model="localConditions.searchScope.url">{{ $t('请求URL') }}</el-checkbox>
            <el-checkbox v-if="!isStandalone" v-model="localConditions.searchScope.creator">{{ $t('创建者') }}</el-checkbox>
            <el-checkbox v-if="!isStandalone" v-model="localConditions.searchScope.maintainer">{{ $t('维护者') }}</el-checkbox>
            <el-checkbox v-model="localConditions.searchScope.method">{{ $t('请求方法') }}</el-checkbox>
            <el-checkbox v-model="localConditions.searchScope.remark">{{ $t('备注') }}</el-checkbox>
          </div>
        </div>
        <!-- 节点类型 -->
        <div class="search-section">
          <div class="section-header">
            <span class="section-title">{{ $t('节点类型') }}:</span>
          </div>
          <div class="section-content">
            <el-checkbox v-model="localConditions.searchScope.folder">{{ $t('目录') }}</el-checkbox>
            <el-checkbox v-model="localConditions.searchScope.http">{{ $t('HTTP节点') }}</el-checkbox>
            <el-checkbox v-model="localConditions.searchScope.websocket">{{ $t('WebSocket节点') }}</el-checkbox>
            <el-checkbox v-model="localConditions.searchScope.httpMock">{{ $t('HTTP Mock节点') }}</el-checkbox>
          </div>
        </div>
        <!-- 请求参数 -->
        <div class="search-section">
          <div class="section-header">
            <span class="section-title">{{ $t('请求参数') }}:</span>
          </div>
          <div class="section-content">
            <el-checkbox v-model="localConditions.searchScope.query">{{ $t('Query参数') }}</el-checkbox>
            <el-checkbox v-model="localConditions.searchScope.path">{{ $t('Path参数') }}</el-checkbox>
            <el-checkbox v-model="localConditions.searchScope.headers">{{ $t('请求头参数') }}</el-checkbox>
            <el-checkbox v-model="localConditions.searchScope.body">{{ $t('Body参数') }}</el-checkbox>
            <el-checkbox v-model="localConditions.searchScope.response">{{ $t('返回参数') }}</el-checkbox>
            <el-checkbox v-model="localConditions.searchScope.preScript">{{ $t('前置脚本') }}</el-checkbox>
            <el-checkbox v-model="localConditions.searchScope.afterScript">{{ $t('后置脚本') }}</el-checkbox>
            <el-checkbox v-model="localConditions.searchScope.wsMessage">{{ $t('WebSocket消息') }}</el-checkbox>
          </div>
        </div>
        <!-- 更新日期 -->
        <div class="search-section">
          <div class="section-header">
            <span class="section-title">{{ $t('更新日期') }}:</span>
          </div>
          <div class="section-content date-content">
            <el-radio-group v-model="localConditions.dateRange.type" class="date-radio-group">
              <el-radio label="unlimited">{{ $t('不限制') }}</el-radio>
              <el-radio label="recent3days">{{ $t('最近3天') }}</el-radio>
              <el-radio label="recent1week">{{ $t('最近1周') }}</el-radio>
              <el-radio label="recent1month">{{ $t('最近1月') }}</el-radio>
              <el-radio label="recent3months">{{ $t('最近3月') }}</el-radio>
              <el-radio label="custom">{{ $t('自定义') }}</el-radio>
            </el-radio-group>
            <el-date-picker
              v-if="localConditions.dateRange.type === 'custom'"
              v-model="customDateRange"
              type="daterange"
              size="small"
              :start-placeholder="$t('开始日期')"
              :end-placeholder="$t('结束日期')"
              class="custom-date-picker"
              @change="handleDateChange"
            />
          </div>
        </div>
      </div>
      <!-- 操作按钮 -->
      <div class="search-actions">
        <el-button size="small" @click="handleToggleSelectAll">{{ isAllSelected ? t('取消全选') : t('全选') }}</el-button>
        <el-button size="small" @click="handleReset">{{ t('重置') }}</el-button>
      </div>
    </el-card>
  </div>
</template>
<script lang="ts" setup>
import type { AdvancedSearchConditions } from '@src/types/advancedSearch';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const props = defineProps<{
  isStandalone: boolean;
  isVisible: boolean;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: AdvancedSearchConditions): void;
  (e: 'reset'): void;
}>();
const localConditions = defineModel<AdvancedSearchConditions>({ required: true });
const customDateRange = ref<[Date, Date] | null>(null);
watch(() => localConditions.value.dateRange.customStart, (start) => {
  if (start && localConditions.value.dateRange.customEnd) {
    customDateRange.value = [
      new Date(start),
      new Date(localConditions.value.dateRange.customEnd)
    ];
  }
}, { immediate: true });
const handleDateChange = (value: [Date, Date] | null) => {
  if (value && value.length === 2) {
    localConditions.value.dateRange.customStart = value[0].toISOString().split('T')[0];
    localConditions.value.dateRange.customEnd = value[1].toISOString().split('T')[0];
  } else {
    localConditions.value.dateRange.customStart = undefined;
    localConditions.value.dateRange.customEnd = undefined;
  }
};
// 判断是否全选（仅检查checkbox，不包含日期范围radio）
const isAllSelected = computed(() => {
  const scope = localConditions.value.searchScope;
  const checkboxKeys: Array<keyof typeof scope> = [
    'projectName', 'docName', 'url', 'method', 'remark',
    'folder', 'http', 'websocket', 'httpMock',
    'query', 'path', 'headers', 'body', 'response', 'preScript', 'afterScript', 'wsMessage'
  ];
  if (!props.isStandalone) {
    checkboxKeys.push('creator', 'maintainer');
  }
  return checkboxKeys.every(key => scope[key]);
});
// 切换全选/取消全选
const handleToggleSelectAll = () => {
  const newValue = !isAllSelected.value;
  const scope = localConditions.value.searchScope;
  const keys = Object.keys(scope) as Array<keyof typeof scope>;
  keys.forEach(key => {
    if (props.isStandalone && (key === 'creator' || key === 'maintainer')) return;
    scope[key] = newValue;
  });
};
const handleReset = () => {
  emit('reset');
};
</script>
<style scoped lang="scss">
.advanced-search-panel {
  margin-bottom: 16px;
}
.search-card {
  border: 1px solid var(--el-border-color-light);
  :deep(.el-card__body) {
    padding: 16px;
  }
}
.search-sections {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.search-section {
  display: flex;
  align-items: center;
  gap: 12px;
  .section-header {
    flex-shrink: 0;
    .section-title {
      font-weight: 500;
      font-size: 13px;
      color: var(--el-text-color-regular);
    }
  }
  .section-content {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    flex: 1;
    :deep(.el-checkbox) {
      margin-right: 0;
    }
  }
  .date-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}
.date-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  :deep(.el-radio) {
    margin-right: 0;
  }
}
.custom-date-picker {
  width: 100%;
  max-width: 300px;
}
.search-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
