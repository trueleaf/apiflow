<template>
  <div class="data-restore todo-placeholder">
    {{ t('敬请期待') }}
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.todo-placeholder {
  padding: 24px;
  text-align: center;
}
</style>
