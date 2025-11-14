<template>
  <div
    class="cl-rich-input"
    :class="[
      customClass,
      {
        'is-disabled': disabled,
        'is-readonly': readonly,
        'is-focused': isFocused,
        'expand-on-focus': expandOnFocus
      }
    ]"
  >
    <EditorContent
      :editor="editor"
      class="cl-rich-input__editor"
      :style="{
        height: expandOnFocus && !isFocused ? minHeight : undefined,
        minHeight: minHeight,
        maxHeight: maxHeight
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import type { ClRichInputProps, ClRichInputEmits } from './types'
import './style/richInputStyle.css'

const props = withDefaults(defineProps<ClRichInputProps>(), {
  modelValue: '',
  placeholder: '',
  disabled: false,
  readonly: false,
  minHeight: '32px',
  maxHeight: '300px',
  class: '',
  expandOnFocus: false
})

const emits = defineEmits<ClRichInputEmits>()

const customClass = computed(() => props.class)
const isFocused = ref(false)

const checkMultiline = () => {
  if (!editor.value) return
  if (props.expandOnFocus && !isFocused.value) {
    emits('multiline-change', false)
    return
  }
  const editorElement = editor.value.view.dom
  const paragraphs = editorElement.querySelectorAll('p')
  const hasMultipleParagraphs = paragraphs.length > 1
  const hasLineWrap = editorElement.scrollHeight > parseInt(props.minHeight)
  const isMultiline = hasMultipleParagraphs || hasLineWrap
  emits('multiline-change', isMultiline)
}

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: false,
      codeBlock: false,
      blockquote: false,
      horizontalRule: false,
      bold: false,
      italic: false,
      strike: false,
      code: false,
      bulletList: false,
      orderedList: false,
      listItem: false
    }),
    Placeholder.configure({
      placeholder: props.placeholder
    })
  ],
  content: props.modelValue,
  editable: !props.disabled && !props.readonly,
  onUpdate: ({ editor }) => {
    const html = editor.getHTML()
    emits('update:modelValue', html)
    nextTick(() => {
      checkMultiline()
    })
  },
  onFocus: () => {
    isFocused.value = true
    emits('focus')
    nextTick(() => {
      checkMultiline()
    })
  },
  onBlur: () => {
    isFocused.value = false
    emits('blur')
    nextTick(() => {
      checkMultiline()
    })
  }
})

watch(() => props.modelValue, (newValue) => {
  if (editor.value && editor.value.getHTML() !== newValue) {
    editor.value.commands.setContent(newValue)
  }
})

watch(() => props.disabled, (newValue) => {
  if (editor.value) {
    editor.value.setEditable(!newValue && !props.readonly)
  }
})

watch(() => props.readonly, (newValue) => {
  if (editor.value) {
    editor.value.setEditable(!props.disabled && !newValue)
  }
})

watch(() => props.placeholder, (newValue) => {
  if (editor.value) {
    editor.value.extensionManager.extensions.forEach((extension) => {
      if (extension.name === 'placeholder') {
        extension.options.placeholder = newValue
      }
    })
  }
})

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})
</script>
