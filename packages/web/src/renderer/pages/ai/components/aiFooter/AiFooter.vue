<template>
  <div class="ai-dialog-footer">
    <div class="ai-input-wrapper" ref="inputWrapperRef">
      <div v-if="isProjectEditPage && projectName" class="ai-context-area">
        <div class="ai-context-tag">
          <FolderKanban :size="14" />
          <span class="ai-context-name">{{ projectName }}</span>
        </div>
      </div>
      <textarea
        v-model="agentViewStore.inputMessage"
        class="ai-input"
        :placeholder="inputPlaceholder"
        @keydown="handleKeydown"
        @focus="handleInputFocus"
      ></textarea>
      <div class="ai-input-controls">
        <div class="ai-input-trigger-group">
          <button
            class="ai-input-trigger"
            type="button"
            @click="handleToggleModeMenu"
          >
            <span>{{ t(modeLabelMap[agentViewStore.mode]) }}</span>
            <ChevronDown :size="14" />
          </button>
          <div v-if="isModeMenuVisible" class="ai-dropdown">
            <button
              v-for="item in modeOptions"
              :key="item"
              type="button"
              class="ai-dropdown-item"
              @click="handleSelectMode(item)"
            >
              <span class="ai-dropdown-icon">
                <Check v-if="agentViewStore.mode === item" :size="14" />
              </span>
              <span class="ai-dropdown-label">{{ t(modeLabelMap[item]) }}</span>
            </button>
          </div>
        </div>
      </div>
      <div class="ai-input-toolbar">
        <button
          class="ai-new-chat-btn"
          type="button"
          @click="agentViewStore.handleCreateConversation()"
          :title="t('新建对话')"
        >
          <Plus :size="20" />
        </button>
        <button
          v-if="agentViewStore.workingStatus === 'working'"
          class="ai-stop-btn"
          type="button"
          @click="emit('stop')"
          :title="t('停止')"
        >
          <StopCircle :size="16" />
        </button>
        <button
          v-else
          class="ai-send-btn"
          type="button"
          @click="emit('send')"
          :title="t('发送')"
        >
          <Send :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Send, ChevronDown, Check, StopCircle, Plus, FolderKanban } from 'lucide-vue-next'
import { useProjectWorkbench } from '@/store/projectWorkbench/projectWorkbenchStore'
import { useAgentViewStore } from '@/store/ai/agentView'

const isMacOS = navigator.platform.toUpperCase().includes('MAC')
const modeOptions = ['agent', 'ask'] as const
type AiMode = typeof modeOptions[number]
const modeLabelMap: Record<AiMode, string> = {
  agent: 'Agent',
  ask: 'Ask'
}
const emit = defineEmits<{
  'send': []
  'stop': []
}>()
const { t } = useI18n()
const route = useRoute()
const projectWorkbench = useProjectWorkbench()
const agentViewStore = useAgentViewStore()
const inputWrapperRef = ref<HTMLElement | null>(null)
const isModeMenuVisible = ref(false)
const isProjectEditPage = computed(() => route.path.includes('/v1/apidoc/doc-edit'))
const projectName = computed(() => projectWorkbench.projectName)

const inputPlaceholder = computed(() => {
  const shortcutKey = isMacOS ? 'Shift+Return' : 'Shift+Enter'
  return t('描述你的问题...（{shortcut} 换行）', { shortcut: shortcutKey })
})
const handleToggleModeMenu = (event: MouseEvent) => {
  event.stopPropagation()
  isModeMenuVisible.value = !isModeMenuVisible.value
}
const handleSelectMode = (value: AiMode) => {
  agentViewStore.setMode(value)
  isModeMenuVisible.value = false
}
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    if (agentViewStore.workingStatus !== 'working') {
      emit('send')
    }
  }
}
const handleInputFocus = () => {
  isModeMenuVisible.value = false
}
const handleClickOutside = (event: MouseEvent) => {
  if (!inputWrapperRef.value) return
  const target = event.target as Node
  if (inputWrapperRef.value.contains(target)) {
    return
  }
  isModeMenuVisible.value = false
}
const closeMenus = () => {
  isModeMenuVisible.value = false
}
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
defineExpose({
  closeMenus
})
</script>

<style scoped>
.ai-input-wrapper {
  position: relative;
  border-top: 1px solid var(--ai-input-border);
}
.ai-input {
  width: 100%;
  min-height: 72px;
  max-height: 200px;
  padding: 10px 12px;
  padding-bottom: 56px;
  border: none;
  color: var(--ai-text-primary);
  font-size: 13px;
  font-family: inherit;
  line-height: 1.5;
  resize: none;
  background: var(--ai-input-bg);
  transition: border-color 0.2s, background-color 0.2s;
}
.ai-input::placeholder {
  color: var(--ai-text-secondary);
}
.ai-input:focus {
  outline: none;
}
.ai-input-controls {
  position: absolute;
  left: 16px;
  bottom: 10px;
  display: flex;
  align-items: center;
}
.ai-input-toolbar {
  position: absolute;
  right: 16px;
  bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.ai-new-chat-btn {
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  background: var(--ai-button-bg);
  color: var(--gray-600);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.ai-new-chat-btn:hover {
  background: var(--gray-200);
  color: var(--theme-color);
}
.ai-context-area {
  padding: 8px 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.ai-context-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: var(--gray-100);
  border-radius: 4px;
  font-size: 12px;
  color: var(--gray-600);
}
.ai-context-name {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ai-input-trigger-group {
  position: relative;
}
.ai-input-trigger {
  height: 28px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--ai-button-border);
  background: var(--ai-button-bg);
  color: var(--gray-600);
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}
.ai-input-trigger:hover {
  background: var(--ai-input-hover-bg);
}
.ai-dropdown {
  position: absolute;
  bottom: 30px;
  left: 0;
  min-width: 132px;
  padding: 6px;
  background: var(--ai-dropdown-bg);
  border-radius: 2px;
  border: 1px solid var(--ai-dropdown-border);
  box-shadow: 0 12px 24px var(--ai-dropdown-shadow);
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 3;
}
.ai-dropdown-item {
  height: 30px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  border-radius: 2px;
  color: var(--ai-text-primary);
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.ai-dropdown-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ai-dropdown-item:hover {
  background: var(--ai-dropdown-item-hover);
}
.ai-dropdown-item[disabled] {
  cursor: not-allowed;
  opacity: 0.5;
}
.ai-send-btn,
.ai-stop-btn {
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  background: var(--ai-button-bg);
  color: var(--theme-color);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.ai-send-btn:disabled,
.ai-stop-btn:disabled {
  background: var(--ai-send-disabled-bg);
  color: var(--ai-send-disabled-text);
  cursor: not-allowed;
}
.ai-send-btn:not(:disabled):hover,
.ai-stop-btn:not(:disabled):hover {
  background: var(--gray-200);
}
</style>
