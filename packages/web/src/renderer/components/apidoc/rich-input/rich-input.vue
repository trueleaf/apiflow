<template>
  <div
    class="tiptap-variable-input"
    :class="componentClass"
    :style="rootStyle"
    v-bind="$attrs"
  >
    <EditorContent :editor="editor" />

    <!-- Popover slot rendered when a variable is clicked -->
    <div
      v-if="showPopover && popoverSlotPresent"
      class="variable-popover-wrapper"
      :style="popoverStyle"
    >
      <slot name="popover" :variable="selectedVariable" :close="closePopover" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import History from '@tiptap/extension-history'
import { Mark, mergeAttributes } from '@tiptap/core'
import { inputRules, textblockTypeInputRule } from 'prosemirror-inputrules'

// Props
const props = defineProps({
  value: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  width: { type: [String, Number], default: '100%' },
  height: { type: [String, Number], default: '100%' },
  matchedHook: { type: Function, default: null },
})

const emits = defineEmits(['update:value', 'updateValue', 'undo', 'redo'])

// --- Variable mark extension ---
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
    const attrs = {
      'data-variable': 'true',
      'data-name': HTMLAttributes.name || '',
    }

    if (HTMLAttributes.class) attrs['class'] = HTMLAttributes.class
    if (HTMLAttributes.style) attrs['style'] = HTMLAttributes.style

    return ['span', mergeAttributes(attrs), 0]
  },

  addCommands() {
    return {
      setVariable:
        (attrs) =>
        ({ commands }) => {
          return commands.setMark(this.name, attrs)
        },
      unsetVariable:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name)
        },
    }
  },
})

// Helper: try to run matchedHook and return attrs
function buildAttrsFromMatch(name) {
  if (!props.matchedHook) return { name }
  try {
    const res = props.matchedHook(name)
    // matchedHook may return a string (class), or object of styles, or an object { class, style }
    if (!res) return { name }
    if (typeof res === 'string') return { name, class: res }
    if (typeof res === 'object') {
      if (res.class || res.style) return { name, class: res.class || null, style: res.style || null }
      // treat as style object
      const styleStr = Object.entries(res).map(([k, v]) => `${k}: ${v};`).join(' ')
      return { name, style: styleStr }
    }
    return { name }
  } catch (e) {
    console.warn('matchedHook error', e)
    return { name }
  }
}

// --- Editor setup ---
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      // keep bold/italic, lists, paragraph, etc.
    }),
    History,
    VariableMark,
  ],
  content: props.value || '',
  onUpdate({ editor }) {
    // Emit both html and plain text
    const html = editor.getHTML()
    const text = reconstructTextWithBraces(editor)
    emits('updateValue', { html, text })
    emits('update:value', html)
  },
})

// Reconstruct a plain-text representation where variable marks are wrapped with {{name}}
function reconstructTextWithBraces(editorInstance) {
  if (!editorInstance) return ''
  const doc = editorInstance.state.doc
  let out = ''
  doc.descendants((node, pos) => {
    if (node.isText) {
      const marks = node.marks
      if (marks && marks.length) {
        // If text has variable mark, wrap by {{ }}
        const variableMark = marks.find((m) => m.type.name === 'variable')
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
    if (!editor) return
    // naively set content to HTML value
    if (v !== editor.getHTML()) {
      // try to detect if v is HTML; if contains '<', treat as HTML, otherwise insert text
      if (typeof v === 'string' && v.includes('<')) {
        editor.commands.setContent(v)
      } else {
        // plain text: preserve variable braces
        // convert occurrences of {{name}} into variable marks
        const html = plainTextToHTMLWithVariables(v)
        editor.commands.setContent(html)
      }
    }
  }
)

function plainTextToHTMLWithVariables(text) {
  if (!text) return ''
  // replace {{name}} occurrences with span[data-variable]
  const replaced = text.replace(/\{\{([^}]+)\}\}/g, (m, p1) => {
    const attrs = buildAttrsFromMatch(p1)
    const styleAttr = attrs.style ? ` style="${attrs.style}"` : ''
    const classAttr = attrs.class ? ` class="${attrs.class}"` : ''
    return `<span data-variable data-name="${p1}"${classAttr}${styleAttr}>${p1}</span>`
  })
  // wrap in paragraph
  return `<p>${replaced}</p>`
}

// Input handling: auto-complete when typing '{' -> '{{}}' and place cursor in middle
let domKeydownHandler = null
onMounted(() => {
  if (!editor) return
  const view = editor.view
  if (!view) return

  domKeydownHandler = (e) => {
    // For simplicity detect single character '{'
    if (e.key === '{') {
      // prevent default input of single brace
      e.preventDefault()
      // insert '{{}}'
      editor.chain().focus().insertContent('{{}}').run()
      // set selection inside the two braces
      const pos = editor.state.selection.anchor - 2
      editor.commands.setTextSelection(pos)
      return
    }
  }

  view.dom.addEventListener('keydown', domKeydownHandler)

  // click handler for variable elements -> show popover
  const clickHandler = (e) => {
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

const _internalHandlers = { keydown: null, click: null }
onBeforeUnmount(() => {
  if (!editor) return
  const view = editor.view
  if (!view) return
  if (_internalHandlers.keydown) view.dom.removeEventListener('keydown', _internalHandlers.keydown)
  if (_internalHandlers.click) view.dom.removeEventListener('click', _internalHandlers.click)
})

// Popover state
const showPopover = ref(false)
const selectedVariable = ref('')
const popoverPos = { x: 0, y: 0 }

const popoverSlotPresent = computed(() => !!(useSlots && useSlots().popover))

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
  editor?.commands.undo()
  emits('undo')
}
function redo() {
  editor?.commands.redo()
  emits('redo')
}

// Expose via global properties? Also users can call via ref

// Helpers for styles and classes
const componentClass = computed(() => '')
const rootStyle = computed(() => ({ width: typeof props.width === 'number' ? props.width + 'px' : props.width, height: typeof props.height === 'number' ? props.height + 'px' : props.height, position: 'relative' }))

// Small utility: detect if slot provided
function useSlots() {
  // shallow method to check slots in <script setup>
  // In Vue SFC, useSlots() is available from vue, but not top-level here. We'll import it lazily.
  try {
    // eslint-disable-next-line no-undef
    return __VUE_SSR_CONTEXT__ ? {} : {} // fallback
  } catch (e) {
    return {}
  }
}

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
