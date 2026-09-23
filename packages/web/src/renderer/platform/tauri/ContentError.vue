<template>
  <main class="content-error">
    <CloudOff :size="48" />
    <h1>{{ t('desktop.loadFailed') }}</h1>
    <p>{{ t('desktop.loadFailedDescription') }}</p>
    <p class="failed-url">{{ failedUrl }}</p>
    <div class="actions">
      <button @click="load('retry')"><RefreshCw :size="16" />{{ t('desktop.retry') }}</button>
      <button @click="load('fallback')"><HardDrive :size="16" />{{ t('desktop.useLocal') }}</button>
    </div>
    <p role="alert">{{ error }}</p>
  </main>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { invoke } from '@tauri-apps/api/core';
import { CloudOff, RefreshCw, HardDrive } from 'lucide-vue-next';
const { t } = useI18n();
const failedUrl = ref('');
const error = ref('');
// 重新加载工作区或打开本地版本
const load = async (action: 'retry' | 'fallback') => {
  try { await invoke('content_load', { action }); }
  catch (failure) { error.value = String(failure); }
};
onMounted(async () => {
  try { const state = await invoke<{ failureInfo: { validatedURL: string } | null }>('content_load', { action: 'state' }); failedUrl.value = state.failureInfo?.validatedURL ?? ''; }
  catch (failure) { error.value = String(failure); }
});
</script>
<style scoped>
.content-error { min-height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #334155; font-family: system-ui, sans-serif; padding: 24px; }
.content-error h1 { font-size: 24px; }
.failed-url { max-width: 80%; overflow-wrap: anywhere; color: #64748b; }
.actions { display: flex; gap: 16px; margin-top: 16px; }
.actions button { display: flex; align-items: center; gap: 8px; padding: 12px 20px; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; color: #334155; cursor: pointer; }
.actions button:hover { background: #f1f5f9; }
</style>
