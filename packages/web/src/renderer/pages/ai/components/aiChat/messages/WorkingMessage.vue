<template><div class="ai-working-message" role="status"><LoaderCircle :size="14" />{{ t('已运行 {seconds} 秒', { seconds: elapsedSeconds }) }}</div></template>
<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { LoaderCircle } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
const props = defineProps<{ startedAt: number }>()
const { t } = useI18n()
const elapsedSeconds = ref(Math.max(0, Math.floor((Date.now() - props.startedAt) / 1000)))
const timer = window.setInterval(() => { elapsedSeconds.value = Math.max(0, Math.floor((Date.now() - props.startedAt) / 1000)) }, 1000)
onBeforeUnmount(() => window.clearInterval(timer))
</script>
<style scoped>
.ai-working-message { display: flex; align-items: center; gap: 6px; color: var(--gray-600); font-size: 12px; }
.ai-working-message svg { animation: ai-working-spin 800ms linear infinite; }
@keyframes ai-working-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .ai-working-message svg { animation: none; } }
</style>
