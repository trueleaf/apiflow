<template>
  <div class="s-params-view">
    <table>
      <thead>
        <tr>
          <th>{{ t('参数名') }}</th>
          <th>{{ t('参数值') }}</th>
          <th>{{ t('类型') }}</th>
          <th>{{ t('必填') }}</th>
          <th>{{ t('描述') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="param in filteredParams" :key="param._id">
          <td>{{ param.key }}</td>
          <td>{{ formatValue(param) }}</td>
          <td>{{ param.type }}</td>
          <td>
            <span :class="['required-badge', param.required ? 'required' : 'optional']">
              {{ param.required ? t('是') : t('否') }}
            </span>
          </td>
          <td>{{ param.description || '-' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" setup>
import { computed, PropType } from 'vue';
import type { ApidocProperty } from '@src/types';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  data: {
    type: Array as PropType<ApidocProperty[]>,
    default: () => [],
  },
  plain: {
    type: Boolean,
    default: false,
  },
});
const { t } = useI18n();
const filteredParams = computed(() => {
  return props.data.filter((p: ApidocProperty) => p.select && p.key);
});
const formatValue = (param: ApidocProperty) => {
  if (param.type === 'file') {
    return param.value ? `[文件] ${param.value}` : '[文件]';
  }
  return param.value || '-';
};
</script>

<style scoped>
.s-params-view {
  width: 100%;
  overflow-x: auto;
}
.s-params-view table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.s-params-view th,
.s-params-view td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}
.s-params-view th {
  background: var(--bg-secondary);
  font-weight: 500;
  color: var(--text-secondary);
}
.s-params-view td {
  color: var(--text-primary);
}
.required-badge {
  padding: 2px 6px;
  border-radius: var(--border-radius-sm);
  font-size: 12px;
}
.required-badge.required {
  background-color: var(--color-danger-light);
  color: var(--color-danger);
}
.required-badge.optional {
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
}
</style>
