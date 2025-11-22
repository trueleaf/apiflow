<template>
  <div class="markdown-editor" :class="{ 'is-disabled': disabled, 'is-focused': isFocused }">
    <MarkdownToolbar
      v-if="showToolbar && editor"
      :editor="editor"
      class="markdown-editor__toolbar"
    />
    <div
      ref="editorContainer"
      class="markdown-editor__content"
      :style="{ minHeight: minHeight + 'px', maxHeight: maxHeight ? maxHeight + 'px' : 'none' }"
      @click="handleContainerClick"
    >
      <EditorContent :editor="editor" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Link from '@tiptap/extension-link'
import MarkdownToolbar from './MarkdownToolbar.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  disableHistory: {
    type: Boolean,
    default: true
  },
  showToolbar: {
    type: Boolean,
    default: true
  },
  minHeight: {
    type: Number,
    default: 360
  },
  maxHeight: {
    type: Number,
    default: 0
  }
})

const emits = defineEmits<{
  'update:modelValue': [value: string]
  'focus': []
  'blur': []
}>()

const editorContainer = ref<HTMLElement | null>(null)
const isFocused = ref(false)

//点击容器区域聚焦编辑器
const handleContainerClick = (event: MouseEvent) => {
  if (props.disabled || !editor.value) return
  const target = event.target as HTMLElement
  if (target === editorContainer.value || target.classList.contains('markdown-editor__content')) {
    editor.value.commands.focus('end')
  }
}

const createEditorExtensions = () => {
  const starterKitConfig = {
    heading: {
      levels: [1, 2, 3]
    }
  }
  if (props.disableHistory) {
    // @ts-ignore - history属性在运行时存在
    starterKitConfig.history = false
  }
  return [
    StarterKit.configure(starterKitConfig as Parameters<typeof StarterKit.configure>[0]),
    Placeholder.configure({
      placeholder: props.placeholder
    }),
    TaskList,
    TaskItem.configure({
      nested: true
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'markdown-link'
      }
    })
  ]
}

const editor = useEditor({
  extensions: createEditorExtensions(),
  content: props.modelValue,
  editable: !props.disabled,
  editorProps: {
    handleKeyDown: (_view, event) => {
      if (!props.disableHistory) {
        return false
      }
      const isMod = event.ctrlKey || event.metaKey
      const isShift = event.shiftKey
      
      if (isMod && !isShift && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        return true
      }
      
      if (isMod && (event.key.toLowerCase() === 'y' || (isShift && event.key.toLowerCase() === 'z'))) {
        event.preventDefault()
        return true
      }
      
      return false
    }
  },
  onUpdate: ({ editor }) => {
    emits('update:modelValue', editor.getText())
  },
  onFocus: () => {
    isFocused.value = true
    emits('focus')
  },
  onBlur: () => {
    isFocused.value = false
    emits('blur')
  }
})

watch(() => props.modelValue, (newValue) => {
  if (editor.value && newValue !== editor.value.getText()) {
    editor.value.commands.setContent(newValue)
  }
})

watch(() => props.disabled, (newValue) => {
  if (editor.value) {
    editor.value.setEditable(!newValue)
  }
})

onMounted(() => {
  // 确保编辑器正确初始化
})

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})
</script>

<style scoped>
@import './style/markdownEditorStyle.css';
</style>
