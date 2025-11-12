<template>
  <div
    class="clean-rich-input"
    :class="componentClass"
    :style="rootStyle"
    v-bind="$attrs"
    @mousedown="handleContainerMouseDown"
  >
    <EditorContent :editor="editor" class="editor-content" spellcheck="false" data-gramm="false"/>
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted, onBeforeUnmount, computed } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Editor, Mark, markInputRule, markPasteRule, mergeAttributes } from '@tiptap/core'
import type { Node as ProseMirrorNode } from 'prosemirror-model'
import type { CSSProperties } from 'vue'

const props = defineProps({
  value: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  width: { type: [String, Number], default: '100%' },
  height: { type: [String, Number], default: '100%' },
})
const emits = defineEmits<{
  (event: 'update:value', value: string): void
  (event: 'updateValue', value: string): void
  (event: 'undo'): void
  (event: 'redo'): void
}>()

// 创建变量标记用于高亮 {{ }}
const createVariableMark = () =>
  Mark.create({
    name: 'variable',
    inclusive: false,
    excludes: '',
    parseHTML() {
      return [
        {
          tag: 'span[data-variable]',
        },
      ]
    },
    renderHTML({ HTMLAttributes }) {
      return ['span', mergeAttributes({ 'data-variable': 'true' }, HTMLAttributes), 0]
    },
    addInputRules() {
      return [
        markInputRule({
          find: /\{\{([^{}]+)\}\}$/,
          type: this.type,
        }),
      ]
    },
    addPasteRules() {
      return [
        markPasteRule({
          find: /\{\{([^{}]+)\}\}/g,
          type: this.type,
        }),
      ]
    },
  })

// 将编辑器文档序列化为模板字符串
const toTemplateString = (editorInstance: Editor) => {
  const segments: string[] = []
  const doc = editorInstance.state.doc
  const pushFromNode = (node: ProseMirrorNode, isRoot: boolean) => {
    if (node.isText) {
      const textContent = node.text ?? ''
      if (node.marks.some((mark) => mark.type.name === 'variable')) {
        segments.push(`{{${textContent}}}`)
      } else {
        segments.push(textContent)
      }
      return
    }
    if (node.type.name === 'hardBreak') {
      segments.push('\n')
      return
    }
    node.forEach((child) => {
      pushFromNode(child, false)
    })
    if (!isRoot && node.isBlock) {
      segments.push('\n')
    }
  }
  pushFromNode(doc, true)
  while (segments.length > 0 && segments[segments.length - 1] === '\n') {
    segments.pop()
  }
  return segments.join('')
}

// 转义 HTML 特殊字符
const escapeHtml = (input: string) =>
  input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

// 判断片段是否为变量占位
const isVariableToken = (token: string) => /\{\{[\s\S]+?\}\}/.test(token)

// 根据模板切分行文本
const splitTemplateLine = (line: string) => line.split(/(\{\{[\s\S]+?\}\})/)

// 根据模板字符串生成 TipTap 所需 HTML
const toHTMLFromTemplate = (value: string) => {
  if (!value) {
    return '<p></p>'
  }
  const lines = value.split('\n')
  const htmlLines = lines.map((line) => {
    const tokens = splitTemplateLine(line)
    if (tokens.length === 1 && tokens[0] === '') {
      return '<p><br /></p>'
    }
    const converted = tokens
      .filter((token) => token !== '')
      .map((token) => {
        if (isVariableToken(token)) {
          const variableText = token.slice(2, -2)
          return `<span data-variable>${escapeHtml(variableText)}</span>`
        }
        return escapeHtml(token)
      })
      .join('')
    return `<p>${converted || '<br />'}</p>`
  })
  return htmlLines.join('')
}

const variableMark = createVariableMark()

const editor = useEditor({
  extensions: [StarterKit, variableMark],
  content: toHTMLFromTemplate(props.value),
  autofocus: false,
  onUpdate({ editor: instance }) {
    const templateValue = toTemplateString(instance)
    emits('updateValue', templateValue)
    emits('update:value', templateValue)
  },
})

// 同步外部传入的模板值到编辑器
const syncEditorContent = (nextTemplate: string) => {
  if (!editor.value) {
    return
  }
  const desiredHtml = toHTMLFromTemplate(nextTemplate)
  const currentHtml = editor.value.getHTML()
  if (desiredHtml === currentHtml) {
    return
  }
  editor.value.commands.setContent(desiredHtml, { emitUpdate: false })
}

watch(
  () => props.value,
  (next) => {
    if (typeof next !== 'string') {
      return
    }
    syncEditorContent(next)
  }
)

const applyVariableMark = (selectedText: string, originFrom: number) => {
  if (!editor.value) {
    return
  }
  const placeholder = selectedText || 'variable'
  const chain = editor.value.chain().focus()
  chain.insertContentAt(
    { from: originFrom, to: originFrom },
    {
      type: 'text',
      text: placeholder,
      marks: [
        {
          type: 'variable',
        },
      ],
    }
  )
  chain.setTextSelection({ from: originFrom, to: originFrom + placeholder.length })
    // 在指定位置插入变量标记
  chain.run()
}

let domKeydownHandler: ((event: KeyboardEvent) => void) | null = null
let pendingBrace: { position: number; capturedText: string } | null = null
onMounted(() => {
  if (!editor.value) {
    return
  }
  const view = editor.value.view
  if (!view) {
    return
  }
  // 监听 { 键以触发变量创建
  domKeydownHandler = (event: KeyboardEvent) => {
    if (!editor.value || event.isComposing || event.ctrlKey || event.metaKey || event.altKey) {
      if (event.key !== '{') {
        pendingBrace = null
      }
      return
    }
    if (event.key !== '{') {
      pendingBrace = null
      return
    }
    const currentEditor = editor.value
    const { state } = currentEditor
    const { from, to } = state.selection
    const selectedText = state.doc.textBetween(from, to)
    if (pendingBrace && from === pendingBrace.position + 1) {
      event.preventDefault()
      const chain = currentEditor.chain().focus()
      chain.deleteRange({ from: pendingBrace.position, to: from })
      chain.run()
      applyVariableMark(pendingBrace.capturedText, pendingBrace.position)
      pendingBrace = null
      return
    }
    event.preventDefault()
    const insertionChain = currentEditor.chain().focus()
    insertionChain.insertContentAt({ from, to }, '{')
    insertionChain.setTextSelection(from + 1)
    insertionChain.run()
    pendingBrace = { position: from, capturedText: selectedText }
  }
  view.dom.addEventListener('keydown', domKeydownHandler)
  internalHandlers.keydown = domKeydownHandler
})

const internalHandlers: { keydown: ((event: KeyboardEvent) => void) | null } = { keydown: null }
onBeforeUnmount(() => {
  if (!editor.value) {
    return
  }
  const view = editor.value.view
  if (!view || !internalHandlers.keydown) {
    return
  }
  view.dom.removeEventListener('keydown', internalHandlers.keydown)
  pendingBrace = null
})

const handleUndo = () => {
  editor.value?.commands.undo()
  emits('undo')
}
const handleRedo = () => {
  editor.value?.commands.redo()
  emits('redo')
}
const handleContainerMouseDown = (event: MouseEvent) => {
  if (!editor.value) {
    return
  }
  const target = event.target as HTMLElement | null
  if (!target) {
    return
  }
  if (target.closest('.ProseMirror')) {
    return
  }
  event.preventDefault()
  editor.value.chain().focus('end').run()
}

const componentClass = computed(() => '')
const rootStyle = computed<CSSProperties>(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  position: 'relative',
}))

defineExpose({
  undo: handleUndo,
  redo: handleRedo,
})
</script>

<style scoped>
.clean-rich-input {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--gray-200);
  border-radius: 6px;
  padding: 8px;
  box-sizing: border-box;
  overflow: auto;
  min-height: 40px;
  background: var(--white);
  transition: border-color 0.2s ease;
  cursor: text;
}

.clean-rich-input:focus-within {
  border-color: var(--theme-color);
  outline: none;
}

.clean-rich-input .editor-content {
  flex: 1;
}

.clean-rich-input :deep(.ProseMirror) {
  outline: none;
  min-height: 100%;
  color: var(--gray-900);
}

.clean-rich-input :deep(.ProseMirror p) {
  margin: 0;
  line-height: 1.5;
}

.clean-rich-input :deep(span[data-variable]) {
  background: #fff3cd;
  color: #856404;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-weight: 500;
}

.clean-rich-input :deep(span[data-variable]:hover) {
  background: #ffeaa7;
}

[data-theme="dark"] .clean-rich-input {
  background: var(--gray-800);
  border-color: var(--gray-700);
}

[data-theme="dark"] .clean-rich-input :deep(.ProseMirror) {
  color: var(--gray-100);
}

[data-theme="dark"] .clean-rich-input :deep(span[data-variable]) {
  background: #664d03;
  color: #ffc107;
}

[data-theme="dark"] .clean-rich-input :deep(span[data-variable]:hover) {
  background: #7d5e04;
}
</style>
