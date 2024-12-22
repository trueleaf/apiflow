
<template>
  <div ref="monacoDom" class="s-json-editor"></div>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted, onBeforeUnmount, onActivated, watch } from 'vue'
import beautify from 'js-beautify'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
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
  readOnly: {
    type: Boolean,
    default: false,
  },
  config: {
    type: Object,
    default() {
      return {};
    }
  },
});
const emits = defineEmits(['update:modelValue', 'change', 'ready'])

const monacoDom: Ref<HTMLElement | null> = ref(null);
let monacoInstance: monaco.editor.IStandaloneCodeEditor | null = null;

watch(() => props.modelValue, (newValue) => {
  const value = monacoInstance?.getValue();
  if (newValue !== value) {
    monacoInstance?.setValue(props.modelValue)
  }
})
watch(() => props.readOnly, (readOnly) => {
  monacoInstance?.updateOptions({
    readOnly,
  });
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
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    allowComments: true,
    validate: true,
    trailingCommas: 'ignore',
    schemaValidation: 'warning'
  })
  monaco.languages.json.jsonDefaults.setModeConfiguration({
    completionItems: false,
    tokens: true,
    colors: true,
    foldingRanges: true,
    diagnostics: true,
  })
  monacoInstance = monaco.editor.create(monacoDom.value as HTMLElement, {
    value: props.modelValue,
    language: 'json',
    automaticLayout: true,
    parameterHints: {
      enabled: true
    },
    minimap: {
      enabled: false,
    },
    // wordWrap: "bounded",
    wrappingStrategy: 'advanced',
    scrollBeyondLastLine: false,
    overviewRulerLanes: 0,
    scrollbar: {
      alwaysConsumeMouseWheel: false
    },
    hover: {
      enabled: true,
      above: false,
    },
    renderLineHighlight: 'none',
    fontSize: 14,
    readOnly: props.readOnly,
    ...props.config
  })
  // const container = document.querySelector(".s-json-editor")
  // const updateHeight = () => {
  //     const contentHeight = monacoInstance?.getContentHeight() || 300;
  //     const containerWidth = container?.getBoundingClientRect().width || 1000;
  //     (container as HTMLElement).style.height = `${contentHeight}px`;
  //     monacoInstance?.layout({ width: containerWidth, height: contentHeight });
  // };
  // monacoInstance.onDidContentSizeChange(updateHeight);
  // updateHeight()
  monacoInstance.onDidChangeModelContent(() => {
    emits('update:modelValue', monacoInstance?.getValue())
    emits('change', monacoInstance?.getValue())
  })
  emits('ready')
})
onActivated(() => {
  monacoInstance?.focus()
})
onBeforeUnmount(() => {
  monacoInstance?.dispose();
  // model?.dispose();
  // monacoHoverProvider?.dispose()
})
const format = () => {
  const formatStr = beautify(props.modelValue, { indent_size: 4 });
  monacoInstance?.setValue(formatStr)
}
const focus = () => {
  monacoInstance?.focus()
}
defineExpose({
  format,
  focus
});

</script>

<style lang='scss' scoped>
.s-json-editor {
    width: 100%;
    height: 100%;
}
</style>
