<template>
  <transition name="el-fade-in">
    <div v-show="isVisible" class="advanced-search-panel">
      <el-card shadow="never" class="search-card">
        <div class="search-sections">
          <!-- 基础信息 -->
          <div class="search-section">
            <div class="section-header">
              <span class="section-title">{{ $t('基础信息') }}</span>
            </div>
            <div class="section-content">
              <el-input
                v-model="localConditions.basicInfo.docName"
                :placeholder="$t('文档名称')"
                size="small"
                clearable
                class="search-input"
              />
              <el-input
                v-model="localConditions.basicInfo.url"
                :placeholder="$t('请求URL')"
                size="small"
                clearable
                class="search-input"
              />
              <el-input
                v-model="localConditions.basicInfo.method"
                :placeholder="$t('请求方法')"
                size="small"
                clearable
                class="search-input"
              />
              <el-input
                v-if="!isStandalone"
                v-model="localConditions.basicInfo.creator"
                :placeholder="$t('创建者')"
                size="small"
                clearable
                class="search-input"
              />
              <el-input
                v-if="!isStandalone"
                v-model="localConditions.basicInfo.maintainer"
                :placeholder="$t('维护者')"
                size="small"
                clearable
                class="search-input"
              />
              <el-input
                v-model="localConditions.basicInfo.remark"
                :placeholder="$t('备注')"
                size="small"
                clearable
                class="search-input"
              />
            </div>
          </div>
          <!-- 节点类型 -->
          <div class="search-section">
            <div class="section-header">
              <span class="section-title">{{ $t('节点类型') }}</span>
            </div>
            <div class="section-content">
              <el-checkbox-group v-model="selectedNodeTypes" class="node-types-group">
                <el-checkbox label="folder">{{ $t('目录') }}</el-checkbox>
                <el-checkbox label="http">{{ $t('HTTP节点') }}</el-checkbox>
                <el-checkbox label="websocket">{{ $t('WebSocket节点') }}</el-checkbox>
                <el-checkbox label="httpMock">{{ $t('HTTP Mock节点') }}</el-checkbox>
              </el-checkbox-group>
            </div>
          </div>
          <!-- 请求参数 -->
          <div class="search-section">
            <div class="section-header">
              <span class="section-title">{{ $t('请求参数') }}</span>
            </div>
            <div class="section-content">
              <el-input
                v-model="localConditions.requestParams.query"
                :placeholder="$t('Query参数')"
                size="small"
                clearable
                class="search-input"
              />
              <el-input
                v-model="localConditions.requestParams.path"
                :placeholder="$t('Path参数')"
                size="small"
                clearable
                class="search-input"
              />
              <el-input
                v-model="localConditions.requestParams.headers"
                :placeholder="$t('请求头参数')"
                size="small"
                clearable
                class="search-input"
              />
              <el-input
                v-model="localConditions.requestParams.body"
                :placeholder="$t('Body参数')"
                size="small"
                clearable
                class="search-input"
              />
              <el-input
                v-model="localConditions.requestParams.response"
                :placeholder="$t('返回参数')"
                size="small"
                clearable
                class="search-input"
              />
              <el-input
                v-model="localConditions.requestParams.preScript"
                :placeholder="$t('前置脚本')"
                size="small"
                clearable
                class="search-input"
              />
              <el-input
                v-model="localConditions.requestParams.afterScript"
                :placeholder="$t('后置脚本')"
                size="small"
                clearable
                class="search-input"
              />
              <el-input
                v-model="localConditions.requestParams.wsMessage"
                :placeholder="$t('WebSocket消息')"
                size="small"
                clearable
                class="search-input"
              />
            </div>
          </div>
          <!-- 更新日期 -->
          <div class="search-section">
            <div class="section-header">
              <span class="section-title">{{ $t('更新日期') }}</span>
            </div>
            <div class="section-content">
              <el-radio-group v-model="localConditions.dateRange.type" class="date-radio-group">
                <el-radio label="all">{{ $t('全部') }}</el-radio>
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
          <el-button size="small" @click="handleReset">{{ $t('重置') }}</el-button>
        </div>
      </el-card>
    </div>
  </transition>
</template>
<script lang="ts" setup>
import type { AdvancedSearchConditions } from '@src/types/advancedSearch';
defineProps<{
  isStandalone: boolean;
  isVisible: boolean;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: AdvancedSearchConditions): void;
  (e: 'reset'): void;
}>();
const localConditions = defineModel<AdvancedSearchConditions>({ required: true });
const selectedNodeTypes = computed({
  get: () => {
    const types = localConditions.value.nodeTypes;
    const selected: string[] = [];
    if (types.folder) selected.push('folder');
    if (types.http) selected.push('http');
    if (types.websocket) selected.push('websocket');
    if (types.httpMock) selected.push('httpMock');
    return selected;
  },
  set: (value: string[]) => {
    localConditions.value.nodeTypes = {
      folder: value.includes('folder'),
      http: value.includes('http'),
      websocket: value.includes('websocket'),
      httpMock: value.includes('httpMock'),
    };
  }
});
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
  gap: 16px;
}
.search-section {
  .section-header {
    margin-bottom: 12px;
    .section-title {
      font-weight: 600;
      font-size: 14px;
      color: var(--el-text-color-primary);
    }
  }
  .section-content {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }
}
.node-types-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.date-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
}
.custom-date-picker {
  width: 100%;
  max-width: 400px;
}
.search-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
