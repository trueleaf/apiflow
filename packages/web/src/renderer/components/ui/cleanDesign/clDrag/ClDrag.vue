<template>
  <div class="cl-drag" :style="containerStyle">
    <div class="cl-drag-header" @mousedown="handleDragStart">
      <slot name="header"></slot>
    </div>
    <slot></slot>
    <div
      class="cl-drag-resize-bar-right"
      :class="{ active: isResizingWidth }"
      @mousedown="handleResizeWidthStart"
      @dblclick="handleResetWidth"
      :title="resetTitle"
    ></div>
    <div v-if="isResizingWidth" class="cl-drag-resize-indicator-width">
      {{ currentWidth }}px
    </div>
    <div
      class="cl-drag-resize-bar-bottom"
      :class="{ active: isResizingHeight }"
      @mousedown="handleResizeHeightStart"
      @dblclick="handleResetHeight"
      :title="resetTitle"
    ></div>
    <div v-if="isResizingHeight" class="cl-drag-resize-indicator-height">
      {{ currentHeight }}px
    </div>
    <div
      class="cl-drag-resize-corner"
      :class="{ active: isResizingCorner }"
      @mousedown="handleResizeCornerStart"
      @dblclick="handleResetCorner"
      :title="resetTitle"
    ></div>
    <div v-if="isResizingCorner" class="cl-drag-resize-indicator-corner">
      {{ currentWidth }}px × {{ currentHeight }}px
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(defineProps<{
  width: number
  height: number
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
  defaultWidth?: number
  defaultHeight?: number
  position?: { x: number | null, y: number | null }
  defaultPosition?: { left?: string, top?: string, right?: string, transform?: string }
}>(), {
  minWidth: 200,
  maxWidth: 1200,
  minHeight: 200,
  maxHeight: 900,
  defaultWidth: 400,
  defaultHeight: 600,
  defaultPosition: () => ({ right: '20px', top: '60px' })
})

const emit = defineEmits<{
  (e: 'drag', position: { x: number, y: number }): void
  (e: 'drag-end', position: { x: number, y: number }): void
  (e: 'resize', size: { width: number, height: number }): void
  (e: 'resize-end', size: { width: number, height: number }): void
  (e: 'reset-width'): void
  (e: 'reset-height'): void
  (e: 'reset-corner'): void
  (e: 'update:width', width: number): void
  (e: 'update:height', height: number): void
  (e: 'update:position', position: { x: number | null, y: number | null }): void
}>()

const { t } = useI18n()
const resetTitle = computed(() => t('双击还原'))

const currentWidth = ref(props.width)
const currentHeight = ref(props.height)
const currentPosition = ref<{ x: number | null, y: number | null }>(
  props.position ?? { x: null, y: null }
)

const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const isResizingWidth = ref(false)
const isResizingHeight = ref(false)
const isResizingCorner = ref(false)
const initialMouseX = ref(0)
const initialMouseY = ref(0)
const initialWidth = ref(0)
const initialHeight = ref(0)

watch(() => props.width, (val) => {
  currentWidth.value = val
})
watch(() => props.height, (val) => {
  currentHeight.value = val
})
watch(() => props.position, (val) => {
  if (val) {
    currentPosition.value = { ...val }
  }
}, { deep: true })

const containerStyle = computed(() => ({
  left: currentPosition.value.x !== null
    ? `${currentPosition.value.x}px`
    : (props.defaultPosition.left ?? 'auto'),
  top: currentPosition.value.y !== null
    ? `${currentPosition.value.y}px`
    : (props.defaultPosition.top ?? 'auto'),
  right: currentPosition.value.x !== null ? 'auto' : (props.defaultPosition.right ?? 'auto'),
  transform: currentPosition.value.x === null && currentPosition.value.y === null
    ? (props.defaultPosition.transform ?? 'none')
    : 'none',
  width: `${currentWidth.value}px`,
  height: `${currentHeight.value}px`
}))
const clampPositionToBounds = (pos: { x: number, y: number }, width: number, height: number) => {
  const maxX = window.innerWidth - width
  const maxY = window.innerHeight - height
  return {
    x: Math.max(0, Math.min(pos.x, maxX)),
    y: Math.max(0, Math.min(pos.y, maxY))
  }
}
const handleDragStart = (event: MouseEvent) => {
  isDragging.value = true
  const container = (event.currentTarget as HTMLElement).parentElement
  if (!container) return
  const rect = container.getBoundingClientRect()
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
  const clamped = clampPositionToBounds({ x: newX, y: newY }, currentWidth.value, currentHeight.value)
  currentPosition.value = { x: clamped.x, y: clamped.y }
  emit('drag', { x: clamped.x, y: clamped.y })
}
const handleDragEnd = () => {
  isDragging.value = false
  if (currentPosition.value.x !== null && currentPosition.value.y !== null) {
    emit('drag-end', { x: currentPosition.value.x, y: currentPosition.value.y })
    emit('update:position', { ...currentPosition.value })
  }
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
}
const handleResizeWidthStart = (event: MouseEvent) => {
  event.stopPropagation()
  isResizingWidth.value = true
  initialMouseX.value = event.clientX
  initialWidth.value = currentWidth.value
  document.addEventListener('mousemove', handleResizeWidthMove)
  document.addEventListener('mouseup', handleResizeWidthEnd)
}
const handleResizeWidthMove = (event: MouseEvent) => {
  if (!isResizingWidth.value) return
  const deltaX = event.clientX - initialMouseX.value
  let newWidth = initialWidth.value + deltaX
  newWidth = Math.max(props.minWidth, Math.min(newWidth, props.maxWidth))
  currentWidth.value = newWidth
  emit('resize', { width: newWidth, height: currentHeight.value })
}
const handleResizeWidthEnd = () => {
  isResizingWidth.value = false
  emit('resize-end', { width: currentWidth.value, height: currentHeight.value })
  emit('update:width', currentWidth.value)
  if (currentPosition.value.x !== null) {
    const maxX = window.innerWidth - currentWidth.value
    if (currentPosition.value.x > maxX) {
      currentPosition.value = {
        x: Math.max(0, maxX),
        y: currentPosition.value.y ?? 0
      }
      emit('update:position', { ...currentPosition.value })
    }
  }
  document.removeEventListener('mousemove', handleResizeWidthMove)
  document.removeEventListener('mouseup', handleResizeWidthEnd)
}
const handleResetWidth = () => {
  currentWidth.value = props.defaultWidth
  emit('reset-width')
  emit('update:width', currentWidth.value)
}
const handleResizeHeightStart = (event: MouseEvent) => {
  event.stopPropagation()
  isResizingHeight.value = true
  initialMouseY.value = event.clientY
  initialHeight.value = currentHeight.value
  document.addEventListener('mousemove', handleResizeHeightMove)
  document.addEventListener('mouseup', handleResizeHeightEnd)
}
const handleResizeHeightMove = (event: MouseEvent) => {
  if (!isResizingHeight.value) return
  const deltaY = event.clientY - initialMouseY.value
  let newHeight = initialHeight.value + deltaY
  newHeight = Math.max(props.minHeight, Math.min(newHeight, props.maxHeight))
  currentHeight.value = newHeight
  emit('resize', { width: currentWidth.value, height: newHeight })
}
const handleResizeHeightEnd = () => {
  isResizingHeight.value = false
  emit('resize-end', { width: currentWidth.value, height: currentHeight.value })
  emit('update:height', currentHeight.value)
  if (currentPosition.value.y !== null) {
    const maxY = window.innerHeight - currentHeight.value
    if (currentPosition.value.y > maxY) {
      currentPosition.value = {
        x: currentPosition.value.x ?? 0,
        y: Math.max(0, maxY)
      }
      emit('update:position', { ...currentPosition.value })
    }
  }
  document.removeEventListener('mousemove', handleResizeHeightMove)
  document.removeEventListener('mouseup', handleResizeHeightEnd)
}
const handleResetHeight = () => {
  currentHeight.value = props.defaultHeight
  emit('reset-height')
  emit('update:height', currentHeight.value)
}
const handleResizeCornerStart = (event: MouseEvent) => {
  event.stopPropagation()
  isResizingCorner.value = true
  initialMouseX.value = event.clientX
  initialMouseY.value = event.clientY
  initialWidth.value = currentWidth.value
  initialHeight.value = currentHeight.value
  document.addEventListener('mousemove', handleResizeCornerMove)
  document.addEventListener('mouseup', handleResizeCornerEnd)
}
const handleResizeCornerMove = (event: MouseEvent) => {
  if (!isResizingCorner.value) return
  const deltaX = event.clientX - initialMouseX.value
  const deltaY = event.clientY - initialMouseY.value
  let newWidth = initialWidth.value + deltaX
  let newHeight = initialHeight.value + deltaY
  newWidth = Math.max(props.minWidth, Math.min(newWidth, props.maxWidth))
  newHeight = Math.max(props.minHeight, Math.min(newHeight, props.maxHeight))
  currentWidth.value = newWidth
  currentHeight.value = newHeight
  emit('resize', { width: newWidth, height: newHeight })
}
const handleResizeCornerEnd = () => {
  isResizingCorner.value = false
  emit('resize-end', { width: currentWidth.value, height: currentHeight.value })
  emit('update:width', currentWidth.value)
  emit('update:height', currentHeight.value)
  if (currentPosition.value.x !== null) {
    const maxX = window.innerWidth - currentWidth.value
    if (currentPosition.value.x > maxX) {
      currentPosition.value = {
        x: Math.max(0, maxX),
        y: currentPosition.value.y ?? 0
      }
    }
  }
  if (currentPosition.value.y !== null) {
    const maxY = window.innerHeight - currentHeight.value
    if (currentPosition.value.y > maxY) {
      currentPosition.value = {
        x: currentPosition.value.x ?? 0,
        y: Math.max(0, maxY)
      }
    }
  }
  emit('update:position', { ...currentPosition.value })
  document.removeEventListener('mousemove', handleResizeCornerMove)
  document.removeEventListener('mouseup', handleResizeCornerEnd)
}
const handleResetCorner = () => {
  currentWidth.value = props.defaultWidth
  currentHeight.value = props.defaultHeight
  emit('reset-corner')
  emit('update:width', currentWidth.value)
  emit('update:height', currentHeight.value)
}

onUnmounted(() => {
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
  document.removeEventListener('mousemove', handleResizeWidthMove)
  document.removeEventListener('mouseup', handleResizeWidthEnd)
  document.removeEventListener('mousemove', handleResizeHeightMove)
  document.removeEventListener('mouseup', handleResizeHeightEnd)
  document.removeEventListener('mousemove', handleResizeCornerMove)
  document.removeEventListener('mouseup', handleResizeCornerEnd)
})
</script>

<style scoped>
.cl-drag {
  position: fixed;
}
.cl-drag-header {
  cursor: move;
  user-select: none;
}
.cl-drag-resize-bar-right {
  position: absolute;
  right: -3px;
  top: 0;
  width: 6px;
  height: 100%;
  background: transparent;
  cursor: ew-resize;
  z-index: 1;
  transition: background 0.2s;
}
.cl-drag-resize-bar-right:hover,
.cl-drag-resize-bar-right.active {
  background: var(--theme-color);
}
.cl-drag-resize-bar-bottom {
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 100%;
  height: 6px;
  background: transparent;
  cursor: ns-resize;
  z-index: 1;
  transition: background 0.2s;
}
.cl-drag-resize-bar-bottom:hover,
.cl-drag-resize-bar-bottom.active {
  background: var(--theme-color);
}
.cl-drag-resize-indicator-width {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  padding: 4px 8px;
  background: var(--ai-resize-indicator-bg);
  color: var(--ai-resize-indicator-text);
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  z-index: 2;
}
.cl-drag-resize-indicator-height {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 8px;
  background: var(--ai-resize-indicator-bg);
  color: var(--ai-resize-indicator-text);
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  z-index: 2;
}
.cl-drag-resize-corner {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 15px;
  height: 15px;
  background: transparent;
  cursor: nwse-resize;
  z-index: 2;
  transition: background 0.2s;
}
.cl-drag-resize-corner:hover,
.cl-drag-resize-corner.active {
  background: var(--theme-color);
}
.cl-drag-resize-indicator-corner {
  position: absolute;
  right: 20px;
  bottom: 20px;
  padding: 4px 8px;
  background: var(--ai-resize-indicator-bg);
  color: var(--ai-resize-indicator-text);
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  z-index: 3;
  white-space: nowrap;
}
</style>
