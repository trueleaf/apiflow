<template>
  <div class="ai-dialog-header">
    <span class="ai-dialog-title">{{ t('AI助手') }}</span>
    <div class="ai-dialog-header-actions" @mousedown.stop>
      <div class="ai-dialog-header-group">
        <button
          class="ai-dialog-action"
          type="button"
          @mousedown.stop
          @click="agentViewStore.clearConversation()"
          :disabled="agentViewStore.workingStatus === 'working'"
          :title="t('新建对话')"
          :aria-label="t('新建对话')"
        >
          <Plus :size="18" />
        </button>
        <button
          class="ai-dialog-action"
          type="button"
          @mousedown.stop
          @click="agentViewStore.openConfig()"
          :title="t('设置')"
          :aria-label="t('设置')"
        >
          <Settings :size="16" />
        </button>
        <button
          v-if="isAppStore"
          class="ai-dialog-action"
          type="button"
          @mousedown.stop
          @click="handleReport"
          :title="t('举报')"
          :aria-label="t('举报')"
        >
          <Flag :size="16" />
        </button>
      </div>
      <div class="ai-dialog-header-separator" aria-hidden="true"></div>
      <button
        class="ai-dialog-close"
        type="button"
        @mousedown.stop
        @click="emit('close')"
        :title="t('关闭')"
        :aria-label="t('关闭')"
      >
        <X :size="18" />
      </button>
    </div>
  </div>
  <ReportAiDialog v-model="showReportDialog" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Plus, Settings, X, Flag } from 'lucide-vue-next'
import { useAgentViewStore } from '@/store/ai/agentView'
import ReportAiDialog from '../aiReport/ReportAiDialog.vue'

const { t } = useI18n()
const agentViewStore = useAgentViewStore()
const isAppStore = ref(false)
const showReportDialog = ref(false)
const emit = defineEmits<{
  'close': []
}>()
const handleReport = () => {
  showReportDialog.value = true
}
onMounted(async () => {
  
  try {
    const result = await window.electronAPI?.updateManager?.isAppStore()
    isAppStore.value = result || false
  } catch (error) {
    isAppStore.value = false
  }
})
</script>

<style scoped>
.ai-dialog-header {
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--ai-header-border);
  background: var(--ai-header-bg);
  flex-shrink: 0;
  cursor: move;
  user-select: none;
}
.ai-dialog-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: default;
}
.ai-dialog-header-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ai-dialog-header-separator {
  width: 1px;
  height: 20px;
  background: var(--ai-separator-color);
}
.ai-dialog-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--gray-700);
}
.ai-dialog-action,
.ai-dialog-close {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--ai-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}
.ai-dialog-action:hover,
.ai-dialog-close:hover {
  background-color: var(--ai-action-hover-bg);
  color: var(--ai-text-primary);
}
</style>
