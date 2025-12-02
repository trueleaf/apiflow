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
      ref="editorContentRef"
      :editor="editor"
      class="cl-rich-input__editor"
      :style="{
        height: expandOnFocus && !isFocused ? `${minHeight + 2}px` : undefined,
        minHeight: `${minHeight}px`,
        maxHeight: `${maxHeight}px`
      }"
    />
    <Teleport to="body" v-if="variablePopover.visible && hasVariableSlot">
      <transition name="cl-rich-input-variable-popover">
        <div
          v-show="variablePopover.visible"
          ref="variablePopoverRef"
          :class="[
            'cl-rich-input__variable-popover',
            {
              'is-top': variablePopover.placement === 'top',
              'is-bottom': variablePopover.placement === 'bottom'
            }
          ]"
          :data-placement="variablePopover.placement"
          tabindex="-1"
        >
          <div class="cl-rich-input__variable-popover__content">
            <slot name="variable" :token="variablePopover.token" :label="variablePopover.label" />
          </div>
        </div>
      </transition>
    </Teleport>
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
import { useSlots, onMounted, onBeforeUnmount, reactive, ref, computed, watch, nextTick } from 'vue'
import type { ClRichInputProps, ClRichInputEmits } from '@src/types/components/components';
import './style/richInputStyle.css'

const props = withDefaults(defineProps<ClRichInputProps>(), {
  modelValue: '',
  placeholder: '',
  disabled: false,
  readonly: false,
  minHeight: 32,
  maxHeight: 300,
  class: '',
  expandOnFocus: false,
  trimOnPaste: false,
  disableHistory: false
})

const emits = defineEmits<ClRichInputEmits>()
const slots = useSlots()

const customClass = computed(() => props.class)
const isFocused = ref(false)
const lastEmittedValue = ref(props.modelValue)
const editorContentRef = ref<InstanceType<typeof EditorContent> | null>(null)
const variablePopoverRef = ref<HTMLDivElement | null>(null)

type VariablePopoverPlacement = 'bottom' | 'top'

type VariablePopoverState = {
  visible: boolean
  token: string
  label: string
  placement: VariablePopoverPlacement
  anchorElement: HTMLElement | null
}

const variablePopover = reactive<VariablePopoverState>({
  visible: false,
  token: '',
  label: '',
  placement: 'bottom',
  anchorElement: null
})

const hasVariableSlot = computed(() => Boolean(slots.variable))

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
  const editorElement = getEditorDom()
  if (!editorElement) {
    return
  }
  const paragraphs = editorElement.querySelectorAll('p')
  const hasMultipleParagraphs = paragraphs.length > 1
  const hasLineWrap = editorElement.scrollHeight > props.minHeight
  const isMultiline = hasMultipleParagraphs || hasLineWrap
  emits('multiline-change', isMultiline)
}

const getEditorDom = (): HTMLElement | null => {
  try {
    return editor.value?.view.dom ?? null
  } catch (error) {
    return null
  }
}
//创建编辑器扩展列表
const createEditorExtensions = () => {
  const starterKitConfig: Record<string, boolean | undefined> = {
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
    listItem: false,
    dropcursor: false,
    gapcursor: false,
    link: false
  }
  if (props.disableHistory) {
    starterKitConfig.history = false
  }
  const extensions = [
    StarterKit.configure(starterKitConfig as Parameters<typeof StarterKit.configure>[0]),
    Placeholder.configure({
      placeholder: props.placeholder
    }),
    VariableDecorationExtension
  ]
  return extensions
}
const editor = useEditor({
  extensions: createEditorExtensions(),
  content: props.modelValue,
  editable: !props.disabled || !props.readonly,
  editorProps: {
    attributes: {
      spellcheck: 'false',
      autocorrect: 'off',
      autocapitalize: 'off'
    },
    handlePaste(view, event) {
      const clipboardData = event.clipboardData
      if (!clipboardData) {
        return false
      }
      const text = clipboardData.getData('text')
      // 发射 before-paste 事件，让父组件有机会拦截大数据粘贴
      const shouldPrevent = { value: false }
      emits('before-paste', text, shouldPrevent)
      if (shouldPrevent.value) {
        event.preventDefault()
        return true
      }
      emits('paste')
      if (!props.trimOnPaste) {
        return false
      }
      const trimmedText = text.trim()
      if (text === trimmedText) {
        return false
      }
      event.preventDefault()
      const { state } = view
      const { from, to } = state.selection
      if (trimmedText === '') {
        const transaction = state.tr.deleteRange(from, to)
        view.dispatch(transaction)
        return true
      }
      const transaction = state.tr.insertText(trimmedText, from, to)
      view.dispatch(transaction)
      return true
    },
    handleKeyDown(_view, event) {
      if (!props.disableHistory) {
        return false
      }
      const isMod = event.ctrlKey || event.metaKey
      const isShift = event.shiftKey
      
      // Undo: Ctrl+Z / Cmd+Z
      if (isMod && !isShift && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        return true
      }
      
      // Redo: Ctrl+Y / Cmd+Y / Ctrl+Shift+Z / Cmd+Shift+Z
      if (isMod && (event.key.toLowerCase() === 'y' || (isShift && event.key.toLowerCase() === 'z'))) {
        event.preventDefault()
        return true
      }
      
      return false
    }
  },
  onUpdate: ({ editor }) => {
    const text = editor.getText()
    if (props.disableHistory && text === lastEmittedValue.value) {
      return
    }
    lastEmittedValue.value = text
    emits('update:modelValue', text)
    nextTick(() => {
      checkMultiline()
      updateVariablePopoverPosition()
    })
  },
  onFocus: () => {
    isFocused.value = true
    emits('focus')
    nextTick(() => {
      checkMultiline()
      updateVariablePopoverPosition()
    })
  },
  onBlur: () => {
    isFocused.value = false
    emits('blur')
    nextTick(() => {
      checkMultiline()
      updateVariablePopoverPosition()
    })
  }
})

const normalizeVariableLabel = (token: string) => {
  if (!token) {
    return ''
  }
  const trimmed = token.trim()
  if (trimmed.startsWith('{{') && trimmed.endsWith('}}')) {
    return trimmed.slice(2, trimmed.length - 2).trim()
  }
  return trimmed
}

const updateVariablePopoverPosition = () => {
  if (!variablePopover.visible || !variablePopover.anchorElement || !variablePopoverRef.value) {
    return
  }
  const popover = variablePopoverRef.value
  const anchor = variablePopover.anchorElement.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const desiredTop = anchor.bottom + 6
  const popoverHeight = popover.offsetHeight
  const popoverWidth = popover.offsetWidth
  const shouldFlip = desiredTop + popoverHeight > viewportHeight
  let topPosition = desiredTop
  let placement: VariablePopoverPlacement = 'bottom'
  if (shouldFlip) {
    topPosition = anchor.top - popoverHeight - 6
    placement = 'top'
  }
  const anchorCenterX = anchor.left + anchor.width / 2
  const minX = popoverWidth / 2 + 8
  const maxX = window.innerWidth - popoverWidth / 2 - 8
  const clampedCenterX = Math.min(Math.max(anchorCenterX, minX), Math.max(minX, maxX))
  const leftPosition = clampedCenterX
  popover.style.setProperty('--cl-rich-input-popover-left', `${leftPosition}px`)
  popover.style.setProperty('--cl-rich-input-popover-top', `${topPosition}px`)
  variablePopover.placement = placement
}

const closeVariablePopover = () => {
  variablePopover.visible = false
  variablePopover.token = ''
  variablePopover.label = ''
  variablePopover.anchorElement = null
}

watch(hasVariableSlot, (available) => {
  if (!available && variablePopover.visible) {
    closeVariablePopover()
  }
})

const openVariablePopover = (token: string, target: HTMLElement) => {
  if (!hasVariableSlot.value) {
    return
  }
  variablePopover.token = token
  variablePopover.label = normalizeVariableLabel(token)
  variablePopover.anchorElement = target
  variablePopover.visible = true
  nextTick(() => {
    updateVariablePopoverPosition()
    if (variablePopoverRef.value) {
      variablePopoverRef.value.focus()
    }
  })
}

const handleEditorClick = (event: MouseEvent) => {
  if (props.disabled || props.readonly) {
    return
  }
  const target = event.target
  if (!(target instanceof HTMLElement)) {
    closeVariablePopover()
    return
  }
  if (target.dataset.variableToken === 'true') {
    openVariablePopover(target.textContent ?? '', target)
    return
  }
  const anchor = target.closest('[data-variable-token="true"]') as HTMLElement | null
  if (anchor) {
    openVariablePopover(anchor.textContent ?? '', anchor)
    return
  }
  closeVariablePopover()
}

const handleOutsideClick = (event: MouseEvent) => {
  if (!variablePopover.visible) {
    return
  }
  const target = event.target
  if (!(target instanceof HTMLElement)) {
    closeVariablePopover()
    return
  }
  if (variablePopoverRef.value && variablePopoverRef.value.contains(target)) {
    return
  }
  if (target.dataset.variableToken === 'true' || target.closest('[data-variable-token="true"]')) {
    return
  }
  closeVariablePopover()
}

const handleEscapeKey = (event: KeyboardEvent) => {
  if (!variablePopover.visible) {
    return
  }
  if (event.key === 'Escape') {
    event.preventDefault()
    closeVariablePopover()
  }
}

const handleScrollOrResize = () => {
  if (!variablePopover.visible) {
    return
  }
  if (!variablePopover.anchorElement) {
    closeVariablePopover()
    return
  }
  if (variablePopover.anchorElement.dataset.variableToken !== 'true') {
    closeVariablePopover()
    return
  }
  if (!document.body.contains(variablePopover.anchorElement)) {
    closeVariablePopover()
    return
  }
  updateVariablePopoverPosition()
}

onMounted(() => {
  nextTick(() => {
    const editorElement = getEditorDom()
    if (editorElement) {
      editorElement.addEventListener('click', handleEditorClick)
    }
  })
  window.addEventListener('click', handleOutsideClick, true)
  window.addEventListener('resize', handleScrollOrResize)
  document.addEventListener('scroll', handleScrollOrResize, true)
  window.addEventListener('keydown', handleEscapeKey)
})

watch(() => props.modelValue, (newValue) => {
  if (editor.value && editor.value.getText() !== newValue) {
    lastEmittedValue.value = newValue
    editor.value.commands.setContent(newValue)
  }
})

watch(() => props.disabled, (newValue) => {
  if (editor.value) {
    editor.value.setEditable(!newValue && !props.readonly)
  }
  if (newValue) {
    closeVariablePopover()
  }
})

watch(() => props.readonly, (newValue) => {
  if (editor.value) {
    editor.value.setEditable(!props.disabled && !newValue)
  }
  if (newValue) {
    closeVariablePopover()
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

watch(() => variablePopover.visible, (visible) => {
  if (!visible) {
    return
  }
  nextTick(() => {
    updateVariablePopoverPosition()
  })
})

onBeforeUnmount(() => {
  const editorElement = getEditorDom()
  if (editorElement) {
    editorElement.removeEventListener('click', handleEditorClick)
  }
  if (editor.value) {
    editor.value.destroy()
  }
  window.removeEventListener('click', handleOutsideClick, true)
  window.removeEventListener('resize', handleScrollOrResize)
  document.removeEventListener('scroll', handleScrollOrResize, true)
  window.removeEventListener('keydown', handleEscapeKey)
})

defineExpose({
  hideVariablePopover: closeVariablePopover
})
</script>
