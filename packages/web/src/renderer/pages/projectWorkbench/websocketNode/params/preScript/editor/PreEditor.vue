<template>
  <div ref="preEditor" class="s-monaco-editor"></div>
  <div class="operation-btn">
    <el-button type="primary" text class="format-btn" @click="handleFormat">{{ t('格式化') }}</el-button>
  </div>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted, onBeforeUnmount, watch } from 'vue'
import beautify from 'js-beautify'

import { useCompletionItem } from './registerCompletionItem'
import { useHoverProvider } from './registerHoverProvider'
import { useI18n } from 'vue-i18n'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'

const { t } = useI18n()

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
let isDisposed = false; // 标记编辑器是否已被销毁

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
  event.emit('websocket/editor/removePreEditor');
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
event.on('websocket/editor/removePreEditor', () => {
  try {
    monacoCompletionItem?.dispose()
    monacoHoverProvider?.dispose()
  } catch (error) {
    // 捕获 dispose 异常
  }
});
onBeforeUnmount(() => {
  // 避免重复销毁
  if (isDisposed) {
    return;
  }

  try {
    // 按顺序销毁资源
    if (monacoInstance) {
      const model = monacoInstance.getModel();
      if (model) {
        model.dispose();
      }
      monacoInstance.dispose();
      monacoInstance = null;
    }
    if (monacoCompletionItem) {
      monacoCompletionItem.dispose();
      monacoCompletionItem = null;
    }
    if (monacoHoverProvider) {
      monacoHoverProvider.dispose();
      monacoHoverProvider = null;
    }

    isDisposed = true;
  } catch (error) {
    // 捕获 dispose 过程中的异常
  }
})
//格式化数据
const handleFormat = () => {
  const formatStr = beautify(props.modelValue, { indent_size: 4 });
  monacoInstance?.setValue(formatStr)
}
</script>

<style lang='scss' scoped>
.s-monaco-editor {
  width: 100%;
  height: 100%;
  border: 1px solid var(--gray-300);
  right: 20px;
  top: 0px;
}

.operation-btn {
  position: absolute;
  right: 20px;
  top: 0;

  .el-button+.el-button {
    margin-left: 0;
  }
}
</style>
