<template>
  <div class="key-recorder-wrapper">
    <div 
      class="key-recorder" 
      :class="{ 'is-focused': isRecording, 'has-error': hasConflict }"
      tabindex="0"
      @keydown="handleKeyDown"
      @click="handleClick"
    >
      <span v-if="displayKeys" class="key-text">{{ displayKeys }}</span>
      <span v-else class="key-placeholder">{{ placeholder }}</span>
    </div>
    <div class="error-message" v-if="hasConflict">{{ conflictMessage }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

type Props = {
  modelValue: string
  placeholder?: string
  conflictMessage?: string
}

type Emits = {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '按下快捷键组合',
  conflictMessage: ''
})
const emit = defineEmits<Emits>()
const isRecording = ref(false)
const pressedKeys = ref<Set<string>>(new Set())
const displayKeys = computed(() => {
  if (!props.modelValue) {
    return ''
  }
  const keys = props.modelValue.split(',')[0]
  return formatKeyDisplay(keys)
})
const hasConflict = computed(() => {
  return !!props.conflictMessage
})
const formatKeyDisplay = (keys: string): string => {
  const parts = keys.split('+').map(key => {
    const keyMap: Record<string, string> = {
      'ctrl': 'Ctrl',
      'command': '⌘',
      'shift': 'Shift',
      'alt': 'Alt',
      'option': 'Option',
      'meta': 'Meta'
    }
    const lowerKey = key.toLowerCase().trim()
    if (keyMap[lowerKey]) {
      return keyMap[lowerKey]
    }
    return key.toUpperCase()
  })
  return parts.join(' + ')
}
const normalizeKey = (key: string): string => {
  const keyMap: Record<string, string> = {
    'Control': 'ctrl',
    'Meta': 'command',
    'Shift': 'shift',
    'Alt': 'alt',
    ' ': 'space'
  }
  return keyMap[key] || key.toLowerCase()
}
const handleClick = () => {
  isRecording.value = true
  pressedKeys.value.clear()
}
const handleKeyDown = (event: KeyboardEvent) => {
  event.preventDefault()
  event.stopPropagation()
  
  if (!isRecording.value) {
    return
  }
  if (event.key === 'Escape') {
    isRecording.value = false
    pressedKeys.value.clear()
    return
  }
  const modifiers: string[] = []
  if (event.ctrlKey || event.metaKey) {
    if (event.ctrlKey) {
      modifiers.push('ctrl')
    }
    if (event.metaKey) {
      modifiers.push('command')
    }
  }
  if (event.shiftKey) {
    modifiers.push('shift')
  }
  if (event.altKey) {
    modifiers.push('alt')
  }
  const mainKey = normalizeKey(event.key)
  if (!['control', 'meta', 'shift', 'alt'].includes(mainKey)) {
    const keys = [...modifiers, mainKey].join('+')
    const hotkeyFormat = `${keys},${keys.replace('ctrl', 'command').replace('command', 'ctrl')}`
    emit('update:modelValue', hotkeyFormat)
    emit('change', hotkeyFormat)
    isRecording.value = false
    pressedKeys.value.clear()
  }
}
</script>

<style lang="scss" scoped>
.key-recorder-wrapper {
  flex: 1;
  min-width: 0;
}

.key-recorder {
  width: 100%;
  padding: 6px 0;
  border: none;
  border-bottom: 1px solid #dcdfe6;
  background-color: transparent;
  cursor: text;
  transition: border-color 0.2s;
  outline: none;

  &.is-focused {
    border-bottom-color: var(--border-focus);
  }

  &.has-error {
    border-bottom-color: var(--border-danger);
  }

  .key-text {
    font-size: 13px;
    color: var(--text-gray-900);
    font-weight: 500;
    letter-spacing: 0.5px;
  }

  .key-placeholder {
    font-size: 13px;
    color: var(--text-gray-400);
  }
}

.error-message {
  margin-top: 4px;
  font-size: 12px;
  color: var(--border-danger);
  line-height: 1.4;
}
</style>
