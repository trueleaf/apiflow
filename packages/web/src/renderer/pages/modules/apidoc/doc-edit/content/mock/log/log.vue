<template>
  <div class="mock-logs-content">
    <el-empty :description="t('日志功能暂未实现')" />
  </div>
</template>

<script lang="ts" setup>
import { ElEmpty } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.mock-logs-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gray-100);
  border-radius: var(--border-radius-base);
}
</style>
