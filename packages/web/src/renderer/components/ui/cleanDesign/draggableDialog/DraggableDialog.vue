<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="props.modelValue" class="draggable-dialog-overlay">
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
            <span
              class="close-button iconfont iconguanbi"
              @click="closeDialog"
            ></span>
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

interface DraggableDialogProps {
  modelValue: boolean
  title?: string
  width?: string | number
}
const props = withDefaults(defineProps<DraggableDialogProps>(), {
  title: '弹窗',
  width: '500px',
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
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
}
.draggable-dialog {
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
}
.dialog-header {
  background: #f9f9f9;
  border-bottom: 1px solid #e5e5e5;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: move;
  user-select: none;
  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .drag-icon {
    color: #c0c4cc;
    font-size: 14px;
  }
  .dialog-title {
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }
  .close-button {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 50%;
    color: #909399;
    cursor: pointer;
    font-size: 10px;
    transition: all 0.2s;
    &:hover {
      background: rgba(0, 0, 0, 0.1);
      color: #606266;
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
