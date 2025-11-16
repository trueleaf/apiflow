<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="props.modelValue" class="draggable-dialog-overlay" :class="overlayClass">
        <div
          ref="dialogRef"
          class="draggable-dialog"
          :style="dialogStyle"
          @mousedown="bringToFront"
        >
          <div
            ref="headerRef"
            class="dialog-header"
            @mousedown="startDrag"
          >
            <div class="header-left">
              <span class="drag-icon">≡</span>
              <span class="dialog-title">{{ props.title }}</span>
            </div>
            <X
              class="close-button"
              :size="20"
              @click="closeDialog"
            />
          </div>
          <div class="dialog-body" :style="contentStyle">
            <slot></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { X } from 'lucide-vue-next'

interface DraggableDialogProps {
  modelValue: boolean
  title?: string
  width?: string | number
  overlay?: boolean
}
const props = withDefaults(defineProps<DraggableDialogProps>(), {
  title: '弹窗',
  width: '500px',
  overlay: false,
})
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
const dialogRef = ref<HTMLElement | null>(null)
const headerRef = ref<HTMLElement | null>(null)
const position = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const dialogStyle = computed(() => {
  const width = typeof props.width === 'number' ? `${props.width}px` : props.width
  if (isDragging.value || position.value.x !== 0 || position.value.y !== 0) {
    return {
      width,
      position: 'fixed' as const,
      left: '0',
      top: '0',
      transform: `translate(${position.value.x}px, ${position.value.y}px)`,
    }
  }
  return {
    width,
  }
})
const contentStyle = computed(() => ({
  maxHeight: '60vh',
}))
const overlayClass = computed(() => ({
  'has-overlay': props.overlay,
  'no-overlay': !props.overlay,
}))
const centerDialog = () => {
  if (!dialogRef.value) {
    return
  }
  const rect = dialogRef.value.getBoundingClientRect()
  const centerX = (window.innerWidth - rect.width) / 2
  const centerY = (window.innerHeight - rect.height) / 2
  position.value = { x: centerX, y: centerY }
}
const startDrag = (event: MouseEvent) => {
  if (!dialogRef.value) {
    return
  }
  isDragging.value = true
  const rect = dialogRef.value.getBoundingClientRect()
  dragOffset.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  event.preventDefault()
}
const onDrag = (event: MouseEvent) => {
  if (!isDragging.value) {
    return
  }
  position.value = {
    x: event.clientX - dragOffset.value.x,
    y: event.clientY - dragOffset.value.y,
  }
}
const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}
const closeDialog = () => {
  emit('update:modelValue', false)
}
const bringToFront = () => {
}
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      centerDialog()
    }, 0)
  }
})
onMounted(() => {
  if (props.modelValue) {
    centerDialog()
  }
})
onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>

<style lang="scss" scoped>
.draggable-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--zIndex-dialog);
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  pointer-events: none;

  &.has-overlay {
    background: var(--bg-overlay);
    pointer-events: auto;
  }

  .draggable-dialog {
    pointer-events: auto;
  }
}

.draggable-dialog {
  background: var(--bg-primary);
  box-shadow: 0 2px 12px var(--shadow-color);
  border: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  transition: background-color 0.2s ease,
              border-color 0.2s ease,
              box-shadow 0.2s ease;
}

.dialog-header {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: move;
  user-select: none;
  transition: background-color 0.2s ease, border-color 0.2s ease;

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .drag-icon {
    color: var(--text-tertiary);
    font-size: 14px;
    transition: color 0.2s ease;
  }

  .dialog-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    transition: color 0.2s ease;
  }

  .close-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 4px;
    min-width: 24px;
    min-height: 24px;
    transition: all 0.2s ease;

    &:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
  }
}

.dialog-body {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}
</style>
