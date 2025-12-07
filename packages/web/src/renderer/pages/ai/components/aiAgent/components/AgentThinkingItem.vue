<template>
  <div class="agent-thinking-item">
    <div class="thinking-header" @click="toggleExpand">
      <div class="thinking-header-left">
        <Brain :size="14" class="thinking-icon" />
        <span class="thinking-label">{{ t('思考过程') }}</span>
      </div>
      <ChevronRight :size="14" class="thinking-expand-icon" :class="{ 'is-expanded': isExpanded }" />
    </div>
    <div v-show="isExpanded" class="thinking-content">
      <p class="thinking-text">{{ content }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Brain, ChevronRight } from 'lucide-vue-next'

defineProps<{
  content: string
}>()
const { t } = useI18n()
const isExpanded = ref(false)
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
.agent-thinking-item {
  background: var(--ai-action-hover-bg);
  border-radius: 8px;
  overflow: hidden;
}
.thinking-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
}
.thinking-header:hover {
  background: var(--ai-tool-border);
}
.thinking-header-left {
  display: flex;
  align-items: center;
  gap: 6px;
}
.thinking-icon {
  color: var(--ai-text-secondary);
}
.thinking-label {
  font-size: 12px;
  color: var(--ai-text-secondary);
}
.thinking-expand-icon {
  color: var(--ai-text-secondary);
  transition: transform 0.2s ease;
}
.thinking-expand-icon.is-expanded {
  transform: rotate(90deg);
}
.thinking-content {
  padding: 0 12px 12px;
}
.thinking-text {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--ai-text-primary);
  white-space: pre-wrap;
}
</style>
