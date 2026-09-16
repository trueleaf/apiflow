<template><article class="ai-error-message" role="alert"><CircleAlert :size="16" /><div><strong>{{ t('运行失败') }}</strong><p>{{ te(message.text) ? t(message.text) : message.text }}</p><small>{{ message.errorCode }}</small><button v-if="canRetry" type="button" @click="$emit('retry')"><RotateCcw :size="13" />{{ t('重试') }}</button></div></article></template>
<script setup lang="ts">
import { CircleAlert, RotateCcw } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import type { PanelUIMessage } from '@src/types/ai'
defineProps<{ message: Extract<PanelUIMessage, { kind: 'error' }>; canRetry: boolean }>()
defineEmits<{ retry: [] }>()
const { t, te } = useI18n()
</script>
<style scoped>
.ai-error-message { display: flex; gap: 8px; padding: 10px; border: 1px solid var(--el-color-danger-light-7); border-radius: 7px; background: var(--el-color-danger-light-9); color: var(--el-color-danger); }
.ai-error-message p { margin: 3px 0; color: var(--gray-800); font-size: 12px; }
.ai-error-message small { color: var(--gray-600); }
.ai-error-message button { display: inline-flex; align-items: center; gap: 4px; margin-top: 5px; padding: 3px 7px; border: 1px solid var(--el-color-danger-light-7); border-radius: 5px; background: transparent; color: var(--el-color-danger); cursor: pointer; }
</style>
