<template>
  <div class="s-code-viewer">
    <pre 
      :class="['language-' + language, 's-code-pre']"
      :style="viewerStyle"
    ><code ref="codeElement" :class="['language-' + language]">{{ formattedCode }}</code></pre>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import beautify from 'js-beautify'

const Prism = (window as unknown as Record<string, unknown>).Prism as {
  highlightElement: (element: HTMLElement) => void
} | undefined

const props = defineProps({
  // 代码内容
  modelValue: {
    type: String,
    default: ''
  },
  // 语言类型
  config: {
    type: Object,
    default() {
      return { language: 'json' }
    }
  },
  // 是否自动格式化
  autoFormat: {
    type: Boolean,
    default: true
  },
  // 是否启用自动高度调整
  autoHeight: {
    type: Boolean,
    default: false
  },
  // 最大高度限制
  maxHeight: {
    type: [String, Number],
    default: '500px'
  },
  // 最小高度
  minHeight: {
    type: [String, Number],
    default: '100px'
  },
})

const codeElement = ref<HTMLElement | null>(null)

const language = computed(() => {
  const lang = props.config?.language || 'json'
  const langMap: Record<string, string> = {
    json: 'json',
    html: 'markup',
    xml: 'markup',
    javascript: 'javascript',
    js: 'javascript',
    typescript: 'typescript',
    ts: 'typescript',
    css: 'css',
    plaintext: 'plaintext',
  }
  return langMap[lang] || 'plaintext'
})

const formattedCode = computed(() => {
  if (!props.modelValue) return ''
  
  if (!props.autoFormat) return props.modelValue
  
  try {
    const lang = props.config?.language || 'json'
    if (lang === 'json') {
      const parsed = JSON.parse(props.modelValue)
      return JSON.stringify(parsed, null, 2)
    } else if (lang === 'html' || lang === 'xml') {
      return beautify.html(props.modelValue, {
        indent_size: 2,
        wrap_line_length: 0,
      })
    } else if (lang === 'javascript' || lang === 'js') {
      return beautify.js(props.modelValue, {
        indent_size: 2,
      })
    } else if (lang === 'css') {
      return beautify.css(props.modelValue, {
        indent_size: 2,
      })
    }
    return props.modelValue
  } catch (error) {
    return props.modelValue
  }
})

const viewerStyle = computed(() => {
  if (!props.autoHeight) {
    return { width: '100%', height: '100%', margin: 0 }
  }
  
  return {
    width: '100%',
    minHeight: typeof props.minHeight === 'number' ? `${props.minHeight}px` : props.minHeight,
    maxHeight: typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight,
    overflow: 'auto',
    margin: 0,
  }
})

const highlightCode = () => {
  if (codeElement.value && Prism) {
    Prism.highlightElement(codeElement.value)
  }
}

onMounted(async () => {
  await nextTick()
  highlightCode()
})

watch([() => props.modelValue, () => props.config?.language], () => {
  nextTick(() => {
    highlightCode()
  })
})
</script>

<style scoped>
.s-code-viewer {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.s-code-pre {
  margin: 0;
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.6;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.s-code-pre code {
  background: none;
  padding: 0;
  font-size: inherit;
  color: inherit;
  display: block;
}
</style>
