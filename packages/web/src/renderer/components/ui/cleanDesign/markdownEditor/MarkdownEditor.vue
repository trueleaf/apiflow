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
import { TextSelection } from '@tiptap/pm/state'
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
  manualUndoRedo: {
    type: Boolean,
    default: false
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
  'undo': []
  'redo': []
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
      if (!props.disableHistory && !props.manualUndoRedo) {
        return false
      }
      const isMod = event.ctrlKey || event.metaKey
      const isShift = event.shiftKey

      if (isMod && !isShift && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (props.manualUndoRedo) {
          emits('undo')
        }
        return true
      }

      if (isMod && (event.key.toLowerCase() === 'y' || (isShift && event.key.toLowerCase() === 'z'))) {
        event.preventDefault()
        if (props.manualUndoRedo) {
          emits('redo')
        }
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
//获取光标位置
const getCursorPosition = () => {
  if (!editor.value) return null
  const selection = editor.value.state.selection
  return {
    anchor: selection.anchor,
    head: selection.head
  }
}
//设置光标位置
const setCursorPosition = (position: { anchor: number, head: number }) => {
  if (!editor.value || !position) return
  const docSize = editor.value.state.doc.content.size
  const anchor = Math.min(position.anchor, docSize)
  const head = Math.min(position.head, docSize)
  const selection = TextSelection.create(editor.value.state.doc, anchor, head)
  editor.value.view.dispatch(
    editor.value.state.tr.setSelection(selection)
  )
  editor.value.commands.focus()
}

defineExpose({
  getCursorPosition,
  setCursorPosition
})
</script>

<style scoped>
@import './style/markdownEditorStyle.css';
</style>
