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
        height: expandOnFocus && !isFocused ? minHeight + 1 : undefined,
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
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'
import type { Node as ProseMirrorNode } from 'prosemirror-model'
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

const variableDecorationPluginKey = new PluginKey('clRichInputVariableDecoration')

// 生成变量高亮装饰
const createVariableDecorations = (doc: ProseMirrorNode) => {
  const decorations: Decoration[] = []
  doc.descendants((node, pos) => {
    if (!node.isText || typeof node.text !== 'string') return
    const variablePattern = /{{[\s\S]+?}}/g
    let match: RegExpExecArray | null = variablePattern.exec(node.text)
    while (match) {
      const start = pos + match.index
      const end = start + match[0].length
      decorations.push(Decoration.inline(start, end, { class: 'cl-rich-input__variable', 'data-variable-token': 'true' }))
      match = variablePattern.exec(node.text)
    }
  })
  return DecorationSet.create(doc, decorations)
}

const VariableDecorationExtension = Extension.create({
  name: 'variableDecoration',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: variableDecorationPluginKey,
        state: {
          init: (_, { doc }) => createVariableDecorations(doc),
          apply: (tr, old) => {
            if (tr.docChanged) {
              return createVariableDecorations(tr.doc)
            }
            return old.map(tr.mapping, tr.doc)
          }
        },
        props: {
          decorations: (state) => variableDecorationPluginKey.getState(state)
        }
      })
    ]
  }
})

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
    }),
    VariableDecorationExtension
  ],
  content: props.modelValue,
  editable: !props.disabled && !props.readonly,
  editorProps: {
    attributes: {
      spellcheck: 'false'
    }
  },
  onUpdate: ({ editor }) => {
    const text = editor.getText()
    emits('update:modelValue', text)
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
  if (editor.value && editor.value.getText() !== newValue) {
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
