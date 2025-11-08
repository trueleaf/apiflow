<template>
  <div class="s-code-editor-wrapper">
    <div ref="editorDom" class="s-code-editor" :style="editorStyle"></div>
    <el-button v-if="showFormatButton" type="primary" text class="format-btn" @click="handleFormat">格式化</el-button>
  </div>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted, onBeforeUnmount, onActivated, watch, computed } from 'vue'
import beautify from 'js-beautify'
import * as monaco from 'monaco-editor'
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution'
import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker&inline'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker&inline'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker&inline'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker&inline'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker&inline'
import { useCompletionProvider } from './useCompletionProvider'
import { useHoverProvider } from './useHoverProvider'
import type { EditorConfig, CursorPosition } from './types'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
  language: {
    type: String as () => 'javascript' | 'typescript',
    default: 'javascript'
  },
  config: {
    type: Object as () => EditorConfig,
    default() {
      return {};
    }
  },
  autoHeight: {
    type: Boolean,
    default: false
  },
  maxHeight: {
    type: [String, Number],
    default: '500px'
  },
  minHeight: {
    type: [String, Number],
    default: '100px'
  },
  manualUndoRedo: {
    type: Boolean,
    default: false
  },
  showFormatButton: {
    type: Boolean,
    default: false
  }
});
const emits = defineEmits(['update:modelValue', 'change', 'ready', 'undo', 'redo'])
const editorDom: Ref<HTMLElement | null> = ref(null);
let monacoInstance: monaco.editor.IStandaloneCodeEditor | null = null;
let completionProvider: monaco.IDisposable | null = null;
let hoverProvider: monaco.IDisposable | null = null;
let resizeObserver: ResizeObserver | null = null;
let isComposing = false;
let isDisposed = false;
const editorStyle = computed(() => {
  if (!props.autoHeight) {
    return { width: '100%', height: '100%', maxWidth: '100%' };
  }
  return {
    width: '100%',
    maxWidth: '100%',
    minHeight: typeof props.minHeight === 'number' ? `${props.minHeight}px` : props.minHeight,
    maxHeight: typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight,
    overflow: 'hidden'
  };
});
watch(() => props.modelValue, (newValue) => {
  const value = monacoInstance?.getValue();
  if (newValue !== value) {
    const position = monacoInstance?.getPosition();
    monacoInstance?.setValue(props.modelValue)
    if (position) {
      monacoInstance?.setPosition(position);
    }
  }
})
watch(() => props.readOnly, (readOnly) => {
  monacoInstance?.updateOptions({
    readOnly,
  });
})
watch(() => props.autoHeight, (autoHeight) => {
  if (autoHeight && monacoInstance) {
    updateEditorHeight();
  }
});
watch(() => props.language, (newLang) => {
  if (newLang && monacoInstance) {
    changeLanguage(newLang);
  }
});
watch(() => props.config, (newConfig) => {
  if (newConfig) {
    disposeProviders();
    registerProviders();
  }
}, { deep: true });
const updateEditorHeight = () => {
  if (!props.autoHeight || !monacoInstance || !editorDom.value) return;
  const contentHeight = monacoInstance.getContentHeight();
  const parentElement = editorDom.value.parentElement;
  const containerWidth = parentElement ? parentElement.offsetWidth : editorDom.value.offsetWidth;
  let actualHeight = Math.max(contentHeight, getPixelValue(props.minHeight));
  actualHeight = Math.min(actualHeight, getPixelValue(props.maxHeight));
  editorDom.value.style.height = `${actualHeight}px`;
  monacoInstance.layout({ width: Math.max(containerWidth - 2, 100), height: actualHeight });
};
const getPixelValue = (value: string | number): number => {
  if (typeof value === 'number') {
    return value;
  }
  const match = value.match(/^(\d+(?:\.\d+)?)(px|vh|vw|rem|em)?$/);
  if (match) {
    const numValue = parseFloat(match[1]);
    const unit = match[2];
    if (!unit || unit === 'px') {
      return numValue;
    }
    switch (unit) {
      case 'vh':
        return (numValue / 100) * window.innerHeight;
      case 'vw':
        return (numValue / 100) * window.innerWidth;
      case 'rem':
        return numValue * 16;
      case 'em':
        return numValue * 14;
      default:
        return numValue;
    }
  }
  return 100;
};
const initResizeLister = () => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (!monacoInstance || !editorDom.value) return;
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        if (props.autoHeight) {
          updateEditorHeight();
        } else {
          monacoInstance.layout({ width, height });
        }
      }
    }
  });
  if (editorDom.value) {
    resizeObserver.observe(editorDom.value);
  }
};
const initManualUndoRedo = () => {
  if (!props.manualUndoRedo) return;
  monacoInstance?.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyZ, () => {
    const cursorPosition = getCursorPosition();
    emits('undo', { cursorPosition });
  });
  monacoInstance?.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyZ, () => {
    const cursorPosition = getCursorPosition();
    emits('redo', { cursorPosition });
  });
  monacoInstance?.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyY, () => {
    const cursorPosition = getCursorPosition();
    emits('redo', { cursorPosition });
  });
}
const registerProviders = () => {
  if (!monacoInstance) return;
  const enableCompletion = props.config?.enableCompletion !== false;
  const enableHover = props.config?.enableHover === true;
  if (enableCompletion && props.config?.completionSuggestions && props.config.completionSuggestions.length > 0) {
    const triggerChars = props.config?.triggerCharacters || ['.', '('];
    completionProvider = useCompletionProvider(
      props.language,
      props.config.completionSuggestions,
      triggerChars
    );
  }
  if (enableHover && props.config?.hoverInfos && props.config.hoverInfos.length > 0) {
    hoverProvider = useHoverProvider(props.language, props.config.hoverInfos);
  }
};
const disposeProviders = () => {
  try {
    if (completionProvider) {
      completionProvider.dispose();
      completionProvider = null;
    }
    if (hoverProvider) {
      hoverProvider.dispose();
      hoverProvider = null;
    }
  } catch (error) {
    // 忽略dispose异常
  }
};
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
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({ 
    noLib: true, 
    allowNonTsExtensions: true 
  });
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({ 
    noLib: true, 
    allowNonTsExtensions: true 
  });
  const defaultOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    value: props.modelValue,
    language: props.language,
    automaticLayout: false,
    parameterHints: {
      enabled: true
    },
    minimap: {
      enabled: false,
    },
    wordWrap: 'on',
    wrappingStrategy: 'advanced',
    scrollBeyondLastLine: false,
    overviewRulerLanes: 0,
    scrollbar: {
      alwaysConsumeMouseWheel: false,
      vertical: 'auto',
      horizontal: 'auto'
    },
    hover: {
      enabled: true,
      above: false,
    },
    renderLineHighlight: 'none',
    fontSize: 14,
    readOnly: props.readOnly,
    readOnlyMessage: {
      value: 'readOnly'
    }
  };
  const mergedOptions = {
    ...defaultOptions,
    ...props.config?.editorOptions
  };
  monacoInstance = monaco.editor.create(editorDom.value as HTMLElement, mergedOptions)
  registerProviders();
  monacoInstance.onDidChangeModelContent(() => {
    if (!isComposing) {
      emits('update:modelValue', monacoInstance?.getValue())
      emits('change', monacoInstance?.getValue())
    }
    if (props.autoHeight) {
      setTimeout(() => {
        updateEditorHeight();
      }, 0);
    }
  })
  monacoInstance.onDidContentSizeChange(() => {
    if (props.autoHeight) {
      updateEditorHeight();
    }
  });
  const editorDomElement = monacoInstance.getDomNode();
  if (editorDomElement) {
    editorDomElement.addEventListener('compositionstart', () => {
      isComposing = true;
    });
    editorDomElement.addEventListener('compositionend', () => {
      isComposing = false;
      emits('update:modelValue', monacoInstance?.getValue())
      emits('change', monacoInstance?.getValue())
    });
  }
  initResizeLister();
  if (props.autoHeight) {
    setTimeout(() => {
      updateEditorHeight();
    }, 100);
  }
  initManualUndoRedo();
  emits('ready')
})
onActivated(() => {
  monacoInstance?.focus()
  if (props.autoHeight) {
    updateEditorHeight();
  }
})
onBeforeUnmount(() => {
  if (isDisposed) {
    return;
  }
  try {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    disposeProviders();
    if (monacoInstance) {
      const model = monacoInstance.getModel();
      if (model) {
        model.dispose();
      }
      monacoInstance.dispose();
      monacoInstance = null;
    }
  } catch (error) {
    // 忽略dispose异常
  }
  isDisposed = true;
})
const handleFormat = () => {
  const formatStr = beautify(props.modelValue, { indent_size: 4 });
  monacoInstance?.setValue(formatStr)
}
const format = () => {
  handleFormat();
}
const focus = () => {
  monacoInstance?.focus()
}
const changeLanguage = (lang: string) => {
  const model = monacoInstance?.getModel();
  if (model) {
    monaco.editor.setModelLanguage(model, lang);
  }
}
const getCursorPosition = (): CursorPosition => {
  if (!monacoInstance) return null;
  return monacoInstance.getPosition();
}
const setCursorPosition = (position: monaco.Position) => {
  if (!monacoInstance) return;
  monacoInstance.setPosition(position);
  monacoInstance.focus();
}
const getValue = (): string | undefined => {
  return monacoInstance?.getValue();
}
const setValue = (value: string) => {
  monacoInstance?.setValue(value);
}
defineExpose({
  format,
  focus,
  changeLanguage,
  updateEditorHeight,
  getCursorPosition,
  setCursorPosition,
  getValue,
  setValue
});
</script>

<style lang='scss' scoped>
.s-code-editor-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    max-width: 100%;
    overflow: hidden;
}
.s-code-editor {
    width: 100%;
    height: 100%;
    max-width: 100%;
    border: 1px solid var(--gray-300);
    box-sizing: border-box;
}
.format-btn {
    position: absolute;
    right: 20px;
    top: 0;
    z-index: 10;
}
</style>
