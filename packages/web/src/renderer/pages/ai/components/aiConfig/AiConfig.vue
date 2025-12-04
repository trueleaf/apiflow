<template>
  <div class="ai-config-view">
    <div class="ai-config-header">
      <button class="ai-back-btn" type="button" @click="emit('back')">
        <ArrowLeft :size="16" />
        <span>{{ t('返回') }}</span>
      </button>
      <span class="ai-config-title">{{ t('AI设置') }}</span>
    </div>
    <div class="ai-config-content">
      <p class="ai-config-hint">{{ t('完整的AI配置请前往设置页面') }}</p>
      <button class="ai-config-btn" type="button" @click="emit('go-to-full-settings')">
        <span>{{ t('前往设置') }}</span>
        <ArrowRight :size="14" class="config-icon"/>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ArrowLeft, ArrowRight } from 'lucide-vue-next'

const { t } = useI18n()
const emit = defineEmits<{
  'back': []
  'go-to-full-settings': []
}>()
</script>

<style scoped>
.ai-config-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.ai-config-header {
  height: 44px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--ai-header-border);
  flex-shrink: 0;
}
.ai-back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--ai-text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.ai-back-btn:hover {
  background-color: var(--ai-action-hover-bg);
  color: var(--ai-text-primary);
}
.ai-config-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--ai-text-primary);
}
.ai-config-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  gap: 16px;
}
.ai-config-hint {
  font-size: 14px;
  color: var(--ai-text-secondary);
  text-align: center;
}
.ai-config-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 12px;
  background: var(--ai-button-bg);
  border: 1px solid var(--ai-button-border);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  color: var(--ai-text-primary);
  white-space: nowrap;
}
.config-icon {
  margin-top: 4px;
}
.ai-config-btn:hover {
  background: var(--ai-button-hover-bg);
}
</style>
