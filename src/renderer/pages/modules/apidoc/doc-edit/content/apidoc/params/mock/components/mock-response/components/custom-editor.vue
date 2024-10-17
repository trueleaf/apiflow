
<template>
  <div ref="preEditor" class="s-monaco-editor">
  </div>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { event } from '@/helper/index'
import { useCompletionItem } from './registerCompletionItem'
import { useHoverProvider } from './registerHoverProvider'
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
});
const emits = defineEmits(['update:modelValue'])

const preEditor: Ref<HTMLElement | null> = ref(null);
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
  event.emit('apidoc/editor/removeAfterEditor');
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({ noLib: true, allowNonTsExtensions: true })
  monacoInstance = monaco.editor.create(preEditor.value as HTMLElement, {
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
  })
})
event.on('apidoc/editor/removeAfterEditor', () => {
  monacoCompletionItem?.dispose()
  monacoHoverProvider?.dispose()
});
onBeforeUnmount(() => {
  monacoInstance?.dispose();
  monacoCompletionItem?.dispose()
  monacoHoverProvider?.dispose()
})
</script>

<style lang="scss" scoped>
.s-monaco-editor {
    width: 100%;
    height: 100%;
    // border: 1px solid $gray-300;
    position: relative;
}
</style>
