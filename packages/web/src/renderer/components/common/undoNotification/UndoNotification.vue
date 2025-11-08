<template>
  <Transition name="slide-up">
    <div v-if="visible" class="undo-notification">
      <div class="notification-content">
        <span class="message">{{ message }}</span>
        <span class="btn-undo" @click="handleUndo">{{ $t('撤回') }}</span>
        <button class="btn-close" @click="handleClose">
          <CloseIcon />
        </button>
      </div>
      <div v-if="showProgress" class="progress-bar" :style="{ width: progressWidth + '%' }"></div>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import { Close as CloseIcon } from '@element-plus/icons-vue'
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps<{
  message: string
  duration?: number
  showProgress?: boolean
}>()

const emit = defineEmits<{
  undo: []
  close: []
}>()

const visible = ref(true)
const progressWidth = ref(100)
let timer: NodeJS.Timeout | null = null
let progressTimer: NodeJS.Timeout | null = null

const startTimer = () => {
  const duration = props.duration || 5000
  const interval = 50
  const steps = duration / interval
  let currentStep = 0

  if (props.showProgress) {
    progressTimer = setInterval(() => {
      currentStep++
      progressWidth.value = 100 - (currentStep / steps) * 100
      if (currentStep >= steps) {
        clearProgressTimer()
      }
    }, interval)
  }

  timer = setTimeout(() => {
    handleClose()
  }, duration)
}

const clearTimers = () => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  clearProgressTimer()
}

const clearProgressTimer = () => {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

const handleUndo = () => {
  clearTimers()
  visible.value = false
  emit('undo')
}

const handleClose = () => {
  clearTimers()
  visible.value = false
  emit('close')
}

watch(
  () => props.duration,
  () => {
    clearTimers()
    progressWidth.value = 100
    startTimer()
  },
  { immediate: true }
)

onUnmounted(() => {
  clearTimers()
})
</script>

<style lang="scss" scoped>
.undo-notification {
  position: fixed;
  bottom: 24px;
  left: 24px;
  z-index: 9999;
  background: var(--white);
  border: 1px solid var(--gray-300);
  border-radius: 6px;
  box-shadow: var(--box-shadow);
  overflow: hidden;
  min-width: 360px;
  max-width: 480px;

  .notification-content {
    display: flex;
    align-items: center;
    padding: 14px 16px;
    gap: 8px;

    .message {
      font-size: var(--font-size-sm);
      line-height: 1.5;
      color: var(--gray-900);
    }

    .btn-undo {
      font-size: var(--font-size-sm);
      font-weight: 500;
      color: var(--theme-color);
      cursor: pointer;
      transition: opacity 0.2s;
      white-space: nowrap;
      user-select: none;

      &:hover {
        opacity: 0.8;
      }

      &:active {
        opacity: 0.6;
      }
    }

    .btn-close {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-radius: var(--border-radius-sm);
      cursor: pointer;
      color: var(--gray-500);
      transition: all 0.2s;
      flex-shrink: 0;
      margin-left: auto;

      &:hover {
        background: var(--gray-100);
        color: var(--gray-700);
      }

      :deep(svg) {
        width: 16px;
        height: 16px;
      }
    }
  }

  .progress-bar {
    height: 2px;
    background: var(--theme-color);
    transition: width 0.05s linear;
  }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
