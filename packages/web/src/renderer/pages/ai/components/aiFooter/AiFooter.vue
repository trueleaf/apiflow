<template>
  <div class="ai-dialog-footer">
    <div class="ai-input-wrapper" ref="inputWrapperRef">
      <textarea
        v-model="localInputMessage"
        class="ai-input"
        :placeholder="t('输入消息...')"
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
            <span>{{ t(modeLabelMap[mode]) }}</span>
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
                <Check v-if="mode === item" :size="14" />
              </span>
              <span class="ai-dropdown-label">{{ t(modeLabelMap[item]) }}</span>
            </button>
          </div>
        </div>
        <div class="ai-input-trigger-group">
          <button
            class="ai-input-trigger"
            type="button"
            @click="handleToggleModelMenu"
          >
            <span>{{ modelDisplayName }}</span>
            <ChevronDown :size="14" />
          </button>
          <div v-if="isModelMenuVisible" class="ai-dropdown">
            <button
              v-for="item in modelOptions"
              :key="item"
              type="button"
              class="ai-dropdown-item"
              @click="handleSelectModel(item)"
            >
              <span class="ai-dropdown-icon">
                <Check v-if="model === item" :size="14" />
              </span>
              <span class="ai-dropdown-label">{{ t(modelLabelMap[item]) }}</span>
            </button>
          </div>
        </div>
      </div>
      <div class="ai-input-toolbar">
        <button
          v-if="isWorking"
          class="ai-stop-btn"
          type="button"
          @click="emit('stop')"
          :title="t('停止')"
        >
          <Square :size="12" />
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
import { useI18n } from 'vue-i18n'
import { Send, ChevronDown, Check, Square } from 'lucide-vue-next'

const modeOptions = ['agent', 'ask'] as const
type AiMode = typeof modeOptions[number]
const modeLabelMap: Record<AiMode, string> = {
  agent: 'Agent',
  ask: 'Ask'
}
const modelOptions = ['deepseek'] as const
type AiModel = typeof modelOptions[number]
const modelLabelMap: Record<AiModel, string> = {
  deepseek: 'DeepSeek'
}
const props = defineProps<{
  isWorking: boolean
}>()
const inputMessage = defineModel<string>('inputMessage', { required: true })
const mode = defineModel<AiMode>('mode', { required: true })
const model = defineModel<AiModel>('model', { required: true })
const emit = defineEmits<{
  'send': []
  'stop': []
}>()
const { t } = useI18n()
const inputWrapperRef = ref<HTMLElement | null>(null)
const isModeMenuVisible = ref(false)
const isModelMenuVisible = ref(false)
const localInputMessage = computed({
  get: () => inputMessage.value,
  set: (val) => { inputMessage.value = val }
})

const modelDisplayName = computed(() => t(modelLabelMap[model.value]))
const handleToggleModeMenu = (event: MouseEvent) => {
  event.stopPropagation()
  isModeMenuVisible.value = !isModeMenuVisible.value
  if (isModeMenuVisible.value) {
    isModelMenuVisible.value = false
  }
}
const handleToggleModelMenu = (event: MouseEvent) => {
  event.stopPropagation()
  isModelMenuVisible.value = !isModelMenuVisible.value
  if (isModelMenuVisible.value) {
    isModeMenuVisible.value = false
  }
}
const handleSelectMode = (value: AiMode) => {
  mode.value = value
  isModeMenuVisible.value = false
}
const handleSelectModel = (value: AiModel) => {
  model.value = value
  isModelMenuVisible.value = false
}
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    if (!props.isWorking) {
      emit('send')
    }
  }
}
const handleInputFocus = () => {
  isModeMenuVisible.value = false
  isModelMenuVisible.value = false
}
const handleClickOutside = (event: MouseEvent) => {
  if (!inputWrapperRef.value) return
  const target = event.target as Node
  if (inputWrapperRef.value.contains(target)) {
    return
  }
  isModeMenuVisible.value = false
  isModelMenuVisible.value = false
}
const closeMenus = () => {
  isModeMenuVisible.value = false
  isModelMenuVisible.value = false
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
}
.ai-input {
  width: 100%;
  min-height: 72px;
  max-height: 200px;
  padding: 10px 12px;
  padding-bottom: 56px;
  border: none;
  border-top: 1px solid var(--ai-input-border);
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
