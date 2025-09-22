<template>
  <div class="mock-layout">
    <el-empty :description="t('HTTP Mock 编辑能力开发中')" />
  </div>
</template>

<script lang="ts" setup>
import { ElEmpty } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.mock-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: var(--gray-100);
}
</style>
