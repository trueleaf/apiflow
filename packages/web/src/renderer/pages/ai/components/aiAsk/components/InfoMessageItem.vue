<template>
  <div class="message-item message-info">
    <div class="message-avatar">
      <Info :size="20" />
    </div>
    <div class="message-content">
      <div class="message-bubble">
        <div class="info-content" :class="{ 'is-expanded': isExpanded }">
          <span class="info-text">{{ message.content }}</span>
          <span v-if="message.totalTokens" class="token-count">
            {{ t('Tokens') }}: {{ message.totalTokens }}
          </span>
        </div>
        <button
          v-if="hasToolNames || isOverflowing"
          class="expand-btn"
          type="button"
          @click="toggleExpand"
        >
          <ChevronDown v-if="!isExpanded" :size="14" />
          <ChevronUp v-else :size="14" />
          {{ isExpanded ? t('收起') : t('展开') }}
        </button>
        <div v-if="hasToolNames && isExpanded" class="tool-list">
          <span v-for="toolName in message.toolNames" :key="toolName" class="tool-tag">
            {{ toolName }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Info, ChevronDown, ChevronUp } from 'lucide-vue-next'
import type { InfoMessage } from '@src/types/ai'

const props = defineProps<{
  message: InfoMessage
}>()
const { t } = useI18n()
const isExpanded = ref(false)
const isOverflowing = ref(false)

const hasToolNames = computed(() => {
  return props.message.toolNames && props.message.toolNames.length > 0
})

const checkOverflow = () => {
  nextTick(() => {
    const el = document.querySelector('.info-text') as HTMLElement
    if (el) {
      isOverflowing.value = el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight
    }
  })
}
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}
onMounted(() => {
  checkOverflow()
})
</script>

<style scoped>
.message-item {
  display: flex;
  gap: 8px;
  animation: messageSlideIn 0.3s ease-out;
}
@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.message-info {
  justify-content: flex-start;
}
.message-info .message-content {
  max-width: 80%;
}
.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--ai-avatar-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--ai-text-secondary);
}
.message-bubble {
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.5;
  background: var(--ai-bubble-ai-bg);
  color: var(--ai-bubble-ai-text);
  border-top-left-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.info-content {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  max-width: 100%;
}
.info-content:not(.is-expanded) {
  white-space: nowrap;
  text-overflow: ellipsis;
}
.info-content.is-expanded {
  white-space: normal;
  word-break: break-word;
}
.info-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
.info-content:not(.is-expanded) .info-text {
  white-space: nowrap;
}
.token-count {
  flex-shrink: 0;
  padding: 2px 8px;
  background: var(--ai-tag-bg);
  border-radius: 4px;
  font-size: 12px;
  color: var(--ai-text-secondary);
}
.expand-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border: none;
  background: transparent;
  color: var(--ai-text-secondary);
  cursor: pointer;
  font-size: 12px;
  border-radius: 4px;
  transition: background-color 0.2s;
  flex-shrink: 0;
}
.expand-btn:hover {
  background: var(--ai-hover-bg);
}
.tool-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
  width: 100%;
}
.tool-tag {
  display: inline-block;
  padding: 4px 10px;
  background: var(--ai-tag-bg);
  border-radius: 6px;
  font-size: 12px;
  color: var(--ai-text-primary);
  font-family: 'Consolas', 'Monaco', monospace;
  border: 1px solid var(--ai-border-color);
  transition: all 0.2s;
}
.tool-tag:hover {
  background: var(--ai-hover-bg);
  border-color: var(--ai-primary-color);
}
</style>
