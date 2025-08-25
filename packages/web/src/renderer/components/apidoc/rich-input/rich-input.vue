<template>
  <div
    class="tiptap-variable-input"
    :class="componentClass"
    :style="(rootStyle as any)"
    v-bind="$attrs"
  >
    <EditorContent :editor="editor" />

    <!-- Popover slot rendered when a variable is clicked -->
    <div
      v-if="showPopover && popoverSlotPresent"
      class="variable-popover-wrapper"
      :style="(popoverStyle as any)"
    >
      <slot name="popover" :variable="selectedVariable" :close="closePopover" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed, useSlots } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import History from '@tiptap/extension-history'
import { Mark, mergeAttributes } from '@tiptap/core'

const props = defineProps({
  value: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  width: { type: [String, Number], default: '100%' },
  height: { type: [String, Number], default: '100%' },
  matchedHook: { type: Function, default: null },
})

const emits = defineEmits(['update:value', 'updateValue', 'undo', 'redo'])

const VariableMark = Mark.create({
  name: 'variable',
  inclusive: false,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      name: { default: null },
      style: { default: null },
      class: { default: null },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-variable]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const attrs: any = {
      'data-variable': 'true',
      'data-name': HTMLAttributes.name || '',
    }

    if (HTMLAttributes.class) attrs['class'] = HTMLAttributes.class
    if (HTMLAttributes.style) attrs['style'] = HTMLAttributes.style

    return ['span', mergeAttributes(attrs), 0]
  },

  addCommands(): any {
    return {
      setVariable:
        (attrs: any) =>
        ({ commands }: any) => {
          return commands.setMark(this.name, attrs)
        },
      unsetVariable:
        () =>
        ({ commands }: any) => {
          return commands.unsetMark(this.name)
        },
    }
  },
})

// Helper: try to run matchedHook and return attrs
function buildAttrsFromMatch(name: string) {
  if (!props.matchedHook) return { name }
  try {
    const res = props.matchedHook(name)
    if (!res) return { name }
    if (typeof res === 'string') return { name, class: res }
    if (typeof res === 'object') {
      if (res.class || res.style) return { name, class: res.class || null, style: res.style || null }
      const styleStr = Object.entries(res).map(([k, v]) => `${k}: ${v};`).join(' ')
      return { name, style: styleStr }
    }
    return { name }
  } catch (e) {
    console.warn('matchedHook error', e)
    return { name }
  }
}

const editor = useEditor({
  extensions: [
    StarterKit.configure({
    }),
    History,
    VariableMark,
  ],
  content: props.value || '',
  onUpdate({ editor }) {
    const html = editor.getHTML()
    const text = reconstructTextWithBraces(editor)
    emits('updateValue', { html, text })
    emits('update:value', html)
  },
})

function reconstructTextWithBraces(editorInstance: any) {
  if (!editorInstance) return ''
  const doc = editorInstance.state.doc
  let out = ''
  doc.descendants((node: any, _pos: any) => {
    if (node.isText) {
      const marks = node.marks
      if (marks && marks.length) {
        const variableMark = marks.find((m: any) => m.type.name === 'variable')
        if (variableMark) {
          out += `{{${node.text}}}`
          return
        }
      }
      out += node.text
    } else if (node.type.isBlock && node.type.name === 'paragraph') {
      // add newline between blocks
      // handled implicitly by text content
    }
  })
  return out
}

// Sync incoming prop value -> editor
watch(
  () => props.value,
  (v) => {
    if (!editor.value) return
    // naively set content to HTML value
    if (v !== editor.value.getHTML()) {
      // try to detect if v is HTML; if contains '<', treat as HTML, otherwise insert text
      if (typeof v === 'string' && v.includes('<')) {
        editor.value.commands.setContent(v)
      } else {
        // plain text: preserve variable braces
        // convert occurrences of {{name}} into variable marks
        const html = plainTextToHTMLWithVariables(v)
        editor.value.commands.setContent(html)
      }
    }
  }
)

function plainTextToHTMLWithVariables(text: string) {
  if (!text) return ''
  // replace {{name}} occurrences with span[data-variable]
  const replaced = text.replace(/\{\{([^}]+)\}\}/g, (_m: string, p1: string) => {
    const attrs = buildAttrsFromMatch(p1)
    const styleAttr = attrs.style ? ` style="${attrs.style}"` : ''
    const classAttr = attrs.class ? ` class="${attrs.class}"` : ''
    return `<span data-variable data-name="${p1}"${classAttr}${styleAttr}>${p1}</span>`
  })
  // wrap in paragraph
  return `<p>${replaced}</p>`
}

// Input handling: auto-complete when typing '{' -> '{{}}' and place cursor in middle
let domKeydownHandler: ((e: any) => void) | null = null
onMounted(() => {
  if (!editor.value) return
  const view = editor.value.view
  if (!view) return

  domKeydownHandler = (e: any) => {
    // For simplicity detect single character '{'
    if (e.key === '{') {
      // prevent default input of single brace
      e.preventDefault()
      // insert '{{}}'
      editor.value!.chain().focus().insertContent('{{}}').run()
      // set selection inside the two braces
      const pos = editor.value!.state.selection.anchor - 2
      editor.value!.commands.setTextSelection(pos)
      return
    }
  }

  view.dom.addEventListener('keydown', domKeydownHandler)

  // click handler for variable elements -> show popover
  const clickHandler = (e: any) => {
    const el = e.target.closest && e.target.closest('span[data-variable]')
    if (el) {
      selectedVariable.value = el.getAttribute('data-name') || ''
      showPopover.value = true
      // compute position
      const rect = el.getBoundingClientRect()
      popoverPos.x = rect.left + rect.width / 2
      popoverPos.y = rect.bottom + window.scrollY + 6
    } else {
      // click outside
      // do not auto-close; closing handled by slot
    }
  }
  view.dom.addEventListener('click', clickHandler)

  // save to cleanup
  _internalHandlers.keydown = domKeydownHandler
  _internalHandlers.click = clickHandler
})

const _internalHandlers: { keydown: any; click: any } = { keydown: null, click: null }
onBeforeUnmount(() => {
  if (!editor.value) return
  const view = editor.value.view
  if (!view) return
  if (_internalHandlers.keydown) view.dom.removeEventListener('keydown', _internalHandlers.keydown)
  if (_internalHandlers.click) view.dom.removeEventListener('click', _internalHandlers.click)
})

// Popover state
const showPopover = ref(false)
const selectedVariable = ref('')
const popoverPos = { x: 0, y: 0 }

const slots = useSlots()
const popoverSlotPresent = computed(() => !!(slots && (slots as any).popover))

function closePopover() {
  showPopover.value = false
  selectedVariable.value = ''
}

const popoverStyle = computed(() => {
  return {
    position: 'absolute',
    transform: 'translate(-50%, 0)',
    left: `${popoverPos.x}px`,
    top: `${popoverPos.y}px`,
    zIndex: 1000,
  }
})

// expose undo/redo methods
function undo() {
  editor.value?.commands.undo()
  emits('undo')
}
function redo() {
  editor.value?.commands.redo()
  emits('redo')
}

// Expose via global properties? Also users can call via ref

// Helpers for styles and classes
const componentClass = computed(() => '')
const rootStyle = computed(() => ({ width: typeof props.width === 'number' ? props.width + 'px' : props.width, height: typeof props.height === 'number' ? props.height + 'px' : props.height, position: 'relative' }))

// Expose methods to parent component
defineExpose({
  undo,
  redo,
  closePopover
})

// A note: reconstructTextWithBraces is naive — for complex nodes you may want a more robust serializer.
</script>

<style scoped>
.tiptap-variable-input {
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  padding: 8px;
  box-sizing: border-box;
  overflow: auto;
  min-height: 40px;
}
.tiptap-variable-input :where(span[data-variable]) {
  background: #fff3cd;
  padding: 2px 4px;
  border-radius: 3px;
  cursor: pointer;
}
.variable-popover-wrapper {
  background: white;
  box-shadow: 0 6px 18px rgba(0,0,0,0.12);
  border-radius: 6px;
  padding: 8px;
}
</style>
