<template>
  <div ref="monacoDom" class="s-json-editor" :style="editorStyle"></div>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted, onBeforeUnmount, onActivated, watch, computed } from 'vue'
import beautify from 'js-beautify'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'

/*
|--------------------------------------------------------------------------
| 变量定义
|--------------------------------------------------------------------------
*/
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
  }
});

const emits = defineEmits(['update:modelValue', 'change', 'ready'])

const monacoDom: Ref<HTMLElement | null> = ref(null);
let monacoInstance: monaco.editor.IStandaloneCodeEditor | null = null;
let resizeObserver: ResizeObserver | null = null;

/*
|--------------------------------------------------------------------------
| 计算属性
|--------------------------------------------------------------------------
*/
const editorStyle = computed(() => {
  if (!props.autoHeight) {
    return { width: '100%', height: '100%' };
  }
  
  return {
    width: '100%',
    minHeight: typeof props.minHeight === 'number' ? `${props.minHeight}px` : props.minHeight,
    maxHeight: typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight,
    overflow: 'hidden'
  };
});

/*
|--------------------------------------------------------------------------
| 监听器
|--------------------------------------------------------------------------
*/
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

watch(() => props.autoHeight, (autoHeight) => {
  if (autoHeight && monacoInstance) {
    updateEditorHeight();
  }
});

/*
|--------------------------------------------------------------------------
| 逻辑处理函数
|--------------------------------------------------------------------------
*/
const updateEditorHeight = () => {
  if (!props.autoHeight || !monacoInstance || !monacoDom.value) return;
  
  const contentHeight = monacoInstance.getContentHeight();
  const containerWidth = monacoDom.value.getBoundingClientRect().width;
  
  // 计算实际高度，考虑最小和最大高度限制
  let actualHeight = Math.max(contentHeight, getPixelValue(props.minHeight));
  actualHeight = Math.min(actualHeight, getPixelValue(props.maxHeight));
  
  // 设置容器高度
  monacoDom.value.style.height = `${actualHeight}px`;
  
  // 重新布局编辑器
  monacoInstance.layout({ width: containerWidth, height: actualHeight });
};

const getPixelValue = (value: string | number): number => {
  if (typeof value === 'number') {
    return value;
  }
  
  // 处理带单位的字符串，如 '500px', '50vh' 等
  const match = value.match(/^(\d+(?:\.\d+)?)(px|vh|vw|rem|em)?$/);
  if (match) {
    const numValue = parseFloat(match[1]);
    const unit = match[2];
    
    if (!unit || unit === 'px') {
      return numValue;
    }
    
    // 简单处理其他单位，实际项目中可能需要更复杂的计算
    switch (unit) {
      case 'vh':
        return (numValue / 100) * window.innerHeight;
      case 'vw':
        return (numValue / 100) * window.innerWidth;
      case 'rem':
        return numValue * 16; // 假设根字体大小为16px
      case 'em':
        return numValue * 14; // 假设当前字体大小为14px
      default:
        return numValue;
    }
  }
  
  return 100; // 默认值
};

const initResizeLister = () => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  
  resizeObserver = new ResizeObserver((entries) => {
    entries.forEach((entry) => {
      const { width, height } = entry.contentRect;
      if (width && height) {
        if (props.autoHeight) {
          updateEditorHeight();
        } else {
          monacoInstance?.layout(); // 修复切换tab时候，宽高为0导致卡顿问题
        }
      }
    });
  });
  
  if (monacoDom.value) {
    resizeObserver.observe(monacoDom.value);
  }
};

/*
|--------------------------------------------------------------------------
| 生命周期函数
|--------------------------------------------------------------------------
*/
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
    parameterHints: {
      enabled: true,
    },
    minimap: {
      enabled: false,
    },
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
    readOnlyMessage: {
      value: 'readOnly'
    },
    ...props.config
  })
  
  // 监听内容变化，自动调整高度
  monacoInstance.onDidChangeModelContent(() => {
    emits('update:modelValue', monacoInstance?.getValue())
    emits('change', monacoInstance?.getValue())
    
    if (props.autoHeight) {
      // 使用 nextTick 确保内容更新后再调整高度
      setTimeout(() => {
        updateEditorHeight();
      }, 0);
    }
  })
  
  // 监听内容大小变化
  monacoInstance.onDidContentSizeChange(() => {
    if (props.autoHeight) {
      updateEditorHeight();
    }
  });
  
  initResizeLister();
  
  // 初始化时调整高度
  if (props.autoHeight) {
    setTimeout(() => {
      updateEditorHeight();
    }, 100);
  }
  
  emits('ready')
})

onActivated(() => {
  monacoInstance?.focus()
  if (props.autoHeight) {
    updateEditorHeight();
  }
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  monacoInstance?.dispose();
})

const format = () => {
  const formatStr = beautify(props.modelValue, { indent_size: 4 });
  monacoInstance?.setValue(formatStr)
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

watch(() => props.config?.language, () => {
  if (props.config?.language) {
    changeLanguage(props.config.language)
  }
}, {
  immediate: true
})

defineExpose({
  format,
  focus,
  changeLanguage,
  updateEditorHeight
});

</script>

<style lang='scss' scoped>
.s-json-editor {
    width: 100%;
    height: 100%;
}
</style>
