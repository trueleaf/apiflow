<template>
  <div ref="preEditor" class="s-monaco-editor"></div>
  <div class="operation-btn">
    <el-button type="primary" text class="format-btn" @click="handleFormat">{{ t('格式化') }}</el-button>
    <el-button type="primary" text class="format-btn" @click="handleOpenLocalScript">{{ '本地包' }}</el-button>
  </div>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted, onBeforeUnmount, watch } from 'vue'
import beautify from 'js-beautify'
import { event } from '@/helper/index'
import { router } from '@/router';
import { useCompletionItem } from './registerCompletionItem'
import { useHoverProvider } from './registerHoverProvider'
import { t } from 'i18next'
import { useApidocTas } from '@/store/apidoc/tabs';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution'
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
const emits = defineEmits(['update:modelValue'])
const apidocTabsStore = useApidocTas()
const preEditor: Ref<HTMLElement | null> = ref(null);
const projectId = router.currentRoute.value.query.id as string;
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
//格式化数据
const handleFormat = () => {
  const formatStr = beautify(props.modelValue, { indent_size: 4 });
  monacoInstance?.setValue(formatStr)
}
//打开本地安装包
const handleOpenLocalScript = () => {
  apidocTabsStore.addTab({
    _id: 'package',
    projectId,
    tabType: 'package',
    label: '本地安装包',
    saved: true,
    fixed: true,
    selected: true,
    head: {
      icon: '',
      color: ""
    },
  })
}
</script>

<style lang="scss" scoped>
.s-monaco-editor {
  width: 100%;
  height: 100%;
  border: 1px solid $gray-300;
}

.operation-btn {
  position: absolute;
  right: size(20);
  top: size(0);

  .el-button+.el-button {
    margin-left: 0;
  }
}
</style>
