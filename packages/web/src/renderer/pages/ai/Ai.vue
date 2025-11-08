<template>
  <div v-if="visible" class="ai-dialog" :style="dialogStyle">
    <div class="ai-dialog-header" @mousedown="handleDragStart">
      <span class="ai-dialog-title">{{ t('AI助手') }}</span>
      <button class="ai-dialog-close" type="button" @click="handleClose">
        <X :size="16" />
      </button>
    </div>
    <div class="ai-dialog-body">
      <div class="ai-messages">
        <div class="ai-empty-state">
          <Bot class="ai-empty-icon" :size="48" />
          <p class="ai-empty-text">{{ t('问我任何问题') }}</p>
        </div>
      </div>
      <div class="ai-dialog-footer">
        <div class="ai-input-wrapper" ref="inputWrapperRef">
          <textarea
            v-model="inputMessage"
            class="ai-input"
            :placeholder="t('输入消息...')"
            @keydown="handleKeydown"
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
                  <Check v-if="mode === item" :size="14" />
                  <span>{{ t(modeLabelMap[item]) }}</span>
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
                  <Check v-if="model === item" :size="14" />
                  <span>{{ t(modelLabelMap[item]) }}</span>
                </button>
              </div>
            </div>
          </div>
          <div class="ai-input-toolbar">
            <button
              class="ai-send-btn"
              type="button"
              :disabled="!inputMessage.trim()"
              @click="handleSend"
              :title="t('发送')"
            >
              <Send :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>
    <div
      class="resize-bar-right"
      :class="{ active: isResizingWidth }"
      @mousedown="handleResizeWidthStart"
      @dblclick="handleResetWidth"
      :title="t('双击还原')"
    ></div>
    <div v-if="isResizingWidth" class="resize-indicator-width">
      {{ dialogWidth }}px
    </div>
    <div
      class="resize-bar-bottom"
      :class="{ active: isResizingHeight }"
      @mousedown="handleResizeHeightStart"
      @dblclick="handleResetHeight"
      :title="t('双击还原')"
    ></div>
    <div v-if="isResizingHeight" class="resize-indicator-height">
      {{ dialogHeight }}px
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { X, Bot, Send, ChevronDown, Check } from 'lucide-vue-next'
import type { AnchorRect } from '@src/types/common'
import { config } from '@src/config/config'
import { userState } from '@/cache/userState/userStateCache'
import './ai.css'

const { t } = useI18n()
const props = defineProps<{ anchorRect: AnchorRect | null }>()
const visible = defineModel<boolean>('visible', { default: false })
const inputMessage = ref('')
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
const mode = ref<AiMode>('agent')
const model = ref<AiModel>('deepseek')
const position = ref<{ x: number | null, y: number | null }>({ x: null, y: null })
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const dialogWidth = ref(config.renderConfig.aiDialog.defaultWidth)
const dialogHeight = ref(config.renderConfig.aiDialog.defaultHeight)
const isResizingWidth = ref(false)
const isResizingHeight = ref(false)
const initialMouseX = ref(0)
const initialMouseY = ref(0)
const initialWidth = ref(0)
const initialHeight = ref(0)
const inputWrapperRef = ref<HTMLElement | null>(null)
const isModeMenuVisible = ref(false)
const isModelMenuVisible = ref(false)

const dialogStyle = computed(() => ({
  left: position.value.x !== null ? `${position.value.x}px` : 'auto',
  top: position.value.y !== null ? `${position.value.y}px` : '60px',
  right: position.value.x !== null ? 'auto' : '20px',
  width: `${dialogWidth.value}px`,
  height: `${dialogHeight.value}px`
}))
const modelDisplayName = computed(() => t(modelLabelMap[model.value]))

watch(visible, value => {
  if (!value) {
    isModeMenuVisible.value = false
    isModelMenuVisible.value = false
  }
})

const handleClose = () => {
  visible.value = false
}
const handleDragStart = (event: MouseEvent) => {
  isDragging.value = true
  const dialog = (event.currentTarget as HTMLElement).parentElement
  if (!dialog) return

  const rect = dialog.getBoundingClientRect()
  dragOffset.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }

  document.addEventListener('mousemove', handleDragMove)
  document.addEventListener('mouseup', handleDragEnd)
}
const handleDragMove = (event: MouseEvent) => {
  if (!isDragging.value) return

  const newX = event.clientX - dragOffset.value.x
  const newY = event.clientY - dragOffset.value.y

  const maxX = window.innerWidth - dialogWidth.value
  const maxY = window.innerHeight - dialogHeight.value

  const clampedX = Math.max(0, Math.min(newX, maxX))
  const clampedY = Math.max(0, Math.min(newY, maxY))

  position.value = { x: clampedX, y: clampedY }
}
const handleDragEnd = () => {
  isDragging.value = false
  if (position.value.x !== null || position.value.y !== null) {
    userState.setAiDialogPosition({
      x: position.value.x ?? 0,
      y: position.value.y ?? 0
    })
  }
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
}
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
  userState.setAiDialogMode(value)
  isModeMenuVisible.value = false
}
const handleSelectModel = (value: AiModel) => {
  model.value = value
  userState.setAiDialogModel(value)
  isModelMenuVisible.value = false
}
const handleResizeWidthStart = (event: MouseEvent) => {
  event.stopPropagation()
  isResizingWidth.value = true
  initialMouseX.value = event.clientX
  initialWidth.value = dialogWidth.value

  document.addEventListener('mousemove', handleResizeWidthMove)
  document.addEventListener('mouseup', handleResizeWidthEnd)
}
const handleResizeWidthMove = (event: MouseEvent) => {
  if (!isResizingWidth.value) return

  const deltaX = event.clientX - initialMouseX.value
  let newWidth = initialWidth.value + deltaX

  newWidth = Math.max(
    config.renderConfig.aiDialog.minWidth,
    Math.min(newWidth, config.renderConfig.aiDialog.maxWidth)
  )

  dialogWidth.value = newWidth
}
const handleResizeWidthEnd = () => {
  isResizingWidth.value = false
  userState.setAiDialogWidth(dialogWidth.value)
  
  if (position.value.x !== null) {
    const maxX = window.innerWidth - dialogWidth.value
    if (position.value.x > maxX) {
      position.value = {
        x: Math.max(0, maxX),
        y: position.value.y ?? 0
      }
    }
  }
  
  document.removeEventListener('mousemove', handleResizeWidthMove)
  document.removeEventListener('mouseup', handleResizeWidthEnd)
}
const handleResetWidth = () => {
  dialogWidth.value = config.renderConfig.aiDialog.defaultWidth
  userState.setAiDialogWidth(dialogWidth.value)
}
const handleResizeHeightStart = (event: MouseEvent) => {
  event.stopPropagation()
  isResizingHeight.value = true
  initialMouseY.value = event.clientY
  initialHeight.value = dialogHeight.value

  document.addEventListener('mousemove', handleResizeHeightMove)
  document.addEventListener('mouseup', handleResizeHeightEnd)
}
const handleResizeHeightMove = (event: MouseEvent) => {
  if (!isResizingHeight.value) return

  const deltaY = event.clientY - initialMouseY.value
  let newHeight = initialHeight.value + deltaY

  newHeight = Math.max(
    config.renderConfig.aiDialog.minHeight,
    Math.min(newHeight, config.renderConfig.aiDialog.maxHeight)
  )

  dialogHeight.value = newHeight
}
const handleResizeHeightEnd = () => {
  isResizingHeight.value = false
  userState.setAiDialogHeight(dialogHeight.value)
  
  if (position.value.y !== null) {
    const maxY = window.innerHeight - dialogHeight.value
    if (position.value.y > maxY) {
      position.value = {
        x: position.value.x ?? 0,
        y: Math.max(0, maxY)
      }
    }
  }
  
  document.removeEventListener('mousemove', handleResizeHeightMove)
  document.removeEventListener('mouseup', handleResizeHeightEnd)
}
const handleResetHeight = () => {
  dialogHeight.value = config.renderConfig.aiDialog.defaultHeight
  userState.setAiDialogHeight(dialogHeight.value)
}
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}
const handleSend = () => {
  if (!inputMessage.value.trim()) return
  inputMessage.value = ''
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
const clampPositionToBounds = (pos: { x: number, y: number }, width: number, height: number): { x: number, y: number } => {
  const maxX = window.innerWidth - width
  const maxY = window.innerHeight - height
  
  return {
    x: Math.max(0, Math.min(pos.x, maxX)),
    y: Math.max(0, Math.min(pos.y, maxY))
  }
}
const initDialogState = () => {
  const cachedWidth = userState.getAiDialogWidth()
  const cachedHeight = userState.getAiDialogHeight()
  const cachedPosition = userState.getAiDialogPosition()
  const cachedMode = userState.getAiDialogMode()
  const cachedModel = userState.getAiDialogModel()
  
  if (cachedWidth !== null) {
    dialogWidth.value = cachedWidth
  }
  if (cachedHeight !== null) {
    dialogHeight.value = cachedHeight
  }
  if (cachedMode === 'agent' || cachedMode === 'ask') {
    mode.value = cachedMode
  }
  if (cachedModel === 'deepseek') {
    model.value = cachedModel
  }
  
  if (cachedPosition !== null) {
    const clampedPosition = clampPositionToBounds(cachedPosition, dialogWidth.value, dialogHeight.value)
    position.value = clampedPosition
    if (clampedPosition.x !== cachedPosition.x || clampedPosition.y !== cachedPosition.y) {
      userState.setAiDialogPosition(clampedPosition)
    }
    return
  }

  if (props.anchorRect) {
    const anchorCenterX = props.anchorRect.x + props.anchorRect.width / 2 - dialogWidth.value / 2
    const anchorTop = config.mainConfig.topbarViewHeight + props.anchorRect.y + props.anchorRect.height + 12
    const anchoredPosition = clampPositionToBounds({ x: anchorCenterX, y: anchorTop }, dialogWidth.value, dialogHeight.value)
    position.value = anchoredPosition
    userState.setAiDialogPosition(anchoredPosition)
  }
}

onMounted(() => {
  initDialogState()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
  document.removeEventListener('mousemove', handleResizeWidthMove)
  document.removeEventListener('mouseup', handleResizeWidthEnd)
  document.removeEventListener('mousemove', handleResizeHeightMove)
  document.removeEventListener('mouseup', handleResizeHeightEnd)
  document.removeEventListener('click', handleClickOutside)
})
</script>
