<template>
  <div ref="editor" class="editor"></div>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as monaco from 'monaco-editor';
import { useCompletionItem } from './registerCompletionItem'
import { useHoverProvider } from './registerHoverProvider'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'


const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
});
const emits = defineEmits(['update:modelValue', 'change'])

const editor: Ref<HTMLElement | null> = ref(null);
let monacoInstance: monaco.editor.IStandaloneCodeEditor | null = null;
let monacoCompletionItem: monaco.IDisposable | null = null;
let monacoHoverProvider: monaco.IDisposable | null = null;

watch(() => props.modelValue, (newValue) => {
  const value = monacoInstance?.getValue();
  if (newValue !== value) {
    monacoInstance?.setValue(props.modelValue)
  }
})
onMounted(() => {
  self.MonacoEnvironment = {
    getWorker(_: string, label: string) {
      if (label === 'json') {
        return new jsonWorker()
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return new cssWorker()
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return new htmlWorker()
      }
      if (['typescript', 'javascript'].includes(label)) {
        return new tsWorker()
      }
      return new EditorWorker()
    },
  }
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({ noLib: true, allowNonTsExtensions: true });
  monacoInstance = monaco.editor.create(editor.value as HTMLElement, {
    value: props.modelValue,
    language: 'javascript',
    automaticLayout: true,
    parameterHints: {
      enabled: true
    },
    minimap: {
      enabled: false,
    },
    wrappingStrategy: 'advanced',
    scrollBeyondLastLine: false,
    overviewRulerLanes: 0,
    hover: {
      enabled: true,
      above: false,
    },
    renderLineHighlight: 'none',
  })
  monacoCompletionItem = useCompletionItem();
  monacoHoverProvider = useHoverProvider();
  monacoInstance.onDidChangeModelContent(() => {
    emits('update:modelValue', monacoInstance?.getValue())
    emits('change', monacoInstance?.getValue())
  })
})

onBeforeUnmount(() => {
  monacoInstance?.dispose();
  monacoCompletionItem?.dispose()
  monacoHoverProvider?.dispose()
})

</script>

<style lang='scss' scoped>
.editor {
  width: 100%;
  height: 100%;
}
</style>
