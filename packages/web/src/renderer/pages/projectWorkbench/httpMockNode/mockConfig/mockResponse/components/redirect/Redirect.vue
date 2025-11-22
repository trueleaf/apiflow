<template>
  <div class="redirect-config">
    <div class="form-row">
      <div class="form-item">
        <label class="form-label">{{ t('重定向状态码') }}</label>
        <el-select v-model="response.redirectConfig.statusCode" size="small" style="width: 200px">
          <el-option :label="`301 - ${t('永久重定向')}`" :value="301" />
          <el-option :label="`302 - ${t('临时重定向')}`" :value="302" />
          <el-option :label="`303 - ${t('查看其他位置')}`" :value="303" />
          <el-option :label="`307 - ${t('临时重定向(保持方法)')}`" :value="307" />
          <el-option :label="`308 - ${t('永久重定向(保持方法)')}`" :value="308" />
        </el-select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-item flex-full">
        <label class="form-label">{{ t('重定向目标URL') }}</label>
        <ClRichInput
          :model-value="response.redirectConfig.location"
          :placeholder="t('请输入重定向目标URL，支持变量替换，例如：' + '{{baseUrl}}' + '/new-path')"
          class="redirect-url"
          @update:modelValue="(v: string) => response.redirectConfig.location = v"
        >
          <template #variable="{ label }">
            <div class="variable-token">{{ label }}</div>
          </template>
        </ClRichInput>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import ClRichInput from '@/components/ui/cleanDesign/richInput/ClRichInput.vue'
import type { HttpMockNode } from '@src/types'
type ResponseItem = HttpMockNode['response'][0]
type Props = {
  response: ResponseItem
}
defineProps<Props>()
const { t } = useI18n()
</script>

<style scoped>
.redirect-config {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.form-row {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}
.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.flex-full {
  flex: 1;
}
.form-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: 500;
}
.variable-token {
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.variable-token:hover {
  background: var(--bg-hover);
}
.redirect-url {
  width: 300px;
  padding: 0px 12px;
  font-size: var(--font-size-base);
  border: 1px solid var(--border-base);
  border-radius: 6px;
  transition: all 0.2s ease;
}
.redirect-url:hover {
  border-color: var(--border-hover);
}
.redirect-url:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-alpha-10);
}
</style>
