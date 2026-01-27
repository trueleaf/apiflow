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
      <div class="ai-footer-actions">
        <div class="ai-input-controls">
          <div class="ai-input-trigger-group">
            <button
              class="ai-input-trigger"
              type="button"
              @click="handleToggleModeMenu"
            >
              <span>{{ modeLabelMap[agentViewStore.mode] }}</span>
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
                <span class="ai-dropdown-label">{{ modeLabelMap[item] }}</span>
              </button>
            </div>
          </div>
        </div>
        <div class="ai-input-toolbar">
          <button
            class="ai-new-chat-btn"
            type="button"
            @click="agentViewStore.clearConversation()"
            :title="t('新建对话')"
            :disabled="agentViewStore.workingStatus === 'working'"
          >
            <Plus :size="20" />
          </button>
          <button
            v-if="agentViewStore.workingStatus === 'working'"
            class="ai-stop-btn"
            type="button"
            @click="handleStop"
            :title="t('停止')"
          >
            <StopCircle :size="16" />
          </button>
          <button
            v-else
            class="ai-send-btn"
            type="button"
            @click="handleSend"
            :title="t('发送')"
            :disabled="isSendDisabled"
          >
            <Send :size="16" />
          </button>
        </div>
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
import { useAgentStore } from '@/store/ai/agentStore'
import { detectInputLanguage } from '@/i18n'
import type { Language } from '@src/types'

const isMacOS = navigator.platform.toUpperCase().includes('MAC')
const modeOptions = ['agent', 'ask'] as const
type AiMode = typeof modeOptions[number]
const modeLabelMap: Record<AiMode, string> = {
  agent: 'Agent',
  ask: 'Ask'
}
const { t } = useI18n()
const { locale } = useI18n()
const route = useRoute()
const projectWorkbench = useProjectWorkbench()
const agentViewStore = useAgentViewStore()
const agentStore = useAgentStore()
const inputWrapperRef = ref<HTMLElement | null>(null)
const isModeMenuVisible = ref(false)
const isProjectEditPage = computed(() => route.path.includes('/workbench'))
const projectName = computed(() => projectWorkbench.projectName)
const trimmedInput = computed(() => agentViewStore.inputMessage.trim())
const isSendDisabled = computed(() => !agentViewStore.isAiConfigValid || !trimmedInput.value)

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
    if (agentViewStore.workingStatus !== 'working' && !isSendDisabled.value) {
      handleSend()
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
const handleStop = async () => {
  if (agentViewStore.mode === 'agent') {
    agentStore.stopAgent()
    agentViewStore.stopCurrentAgentExecution()
    agentViewStore.setWorkingStatus('finish')
    return
  }
  await agentViewStore.stopCurrentConversation()
}
const handleSend = async () => {
  if (agentViewStore.mode === 'agent') {
    const message = trimmedInput.value
    if (!message) {
      return
    }
    agentViewStore.inputMessage = ''
    const detectedLanguage = detectInputLanguage(message, locale.value as Language)
    agentViewStore.addMessage('agent', agentViewStore.createQuestionMessage(message, detectedLanguage))
    agentViewStore.setWorkingStatus('working')
    await agentStore.runAgent({ prompt: message })
    agentViewStore.setWorkingStatus('finish')
    return
  }
  if (!trimmedInput.value) {
    return
  }
  await agentViewStore.sendAskFromInput()
}
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
defineExpose({
  closeMenus,
  handleSend,
  handleStop
})
</script>

<style scoped>
.ai-input-wrapper {
  position: relative;
  border-top: 1px solid var(--ai-input-border);
  background: var(--ai-input-bg);
}
.ai-input {
  width: 100%;
  min-height: 48px;
  max-height: 200px;
  padding: 12px;
  border: none;
  color: var(--ai-text-primary);
  font-size: 14px;
  font-family: inherit;
  line-height: 1.5;
  resize: none;
  background: transparent;
  transition: none;
  overflow-y: auto;
}
.ai-input:hover::-webkit-scrollbar {
  display: block;
}
.ai-input::-webkit-scrollbar {
  width: 5px;
  height: 5px;
  display: none;
}
.ai-input::-webkit-scrollbar-thumb {
  background: var(--gray-500);
}
.ai-input::placeholder {
  color: var(--ai-text-secondary);
}
.ai-input:focus {
  outline: none;
}
.ai-footer-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
}
.ai-input-controls {
  display: flex;
  align-items: center;
}
.ai-input-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ai-new-chat-btn {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background: transparent;
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
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: none;
  border-radius: 12px;
  background: var(--gray-100);
  color: var(--ai-text-secondary);
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s;
}
.ai-input-trigger:hover {
  background: var(--gray-200);
  color: var(--ai-text-primary);
}
.ai-dropdown {
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 8px;
  background: var(--ai-dropdown-bg);
  border: 1px solid var(--ai-dropdown-border);
  border-radius: 8px;
  box-shadow: 0 8px 20px var(--ai-dropdown-shadow);
  padding: 6px;
  min-width: 120px;
  z-index: 10;
}
.ai-dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 6px;
  font-size: 12px;
  color: var(--ai-text-primary);
  transition: background 0.2s;
}
.ai-dropdown-item:hover {
  background: var(--ai-action-hover-bg);
}
.ai-dropdown-icon {
  width: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--theme-color);
}
.ai-dropdown-label {
  flex: 1;
  text-align: left;
}
.ai-send-btn,
.ai-stop-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #fff;
}
.ai-send-btn {
  background: var(--theme-color);
}
.ai-send-btn:hover:not(:disabled) {
  background: var(--theme-color);
  opacity: 0.9;
  transform: translateY(-1px);
}
.ai-send-btn:disabled {
  background: var(--theme-color);
  opacity: 0.4;
  cursor: not-allowed;
}
.ai-stop-btn {
  background: var(--el-color-danger);
}
.ai-stop-btn:hover {
  opacity: 0.9;
}
</style>
