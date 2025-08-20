<template>
  <pre ref="editor" id="editor"></pre>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import type { WatchStopHandle } from 'vue'
import ace, { Editor } from 'brace';
import 'brace/mode/json';
import 'brace/mode/javascript';
import 'brace/mode/html';
import 'brace/mode/xml';
import 'brace/mode/text';
import 'brace/mode/css';
import 'brace/theme/github';
import type { HttpNodeBodyRawType } from '@src/types'

const TYPE_MAP: Record<string, string> = {
  'text/plain': 'text',
  'text/css': 'css',
  'text/html': 'html',
  'application/xml': 'xml',
  'application/json': 'json',
  'application/javascript': 'javascript',
}
const props = defineProps({
  type: {
    type: String,
    default: 'javascript',
  },
  modelValue: {
    type: String,
    default: '',
  },
  readonly: {
    type: Boolean,
    default: false,
  }
})
const emits = defineEmits(['change', 'ready', 'update:modelValue'])
const editorInstance = ref<Editor | null>(null);
const watchStoper = ref<WatchStopHandle | null>(null);
const editor = ref()
watch(() => props.type, () => {
  if (editorInstance.value) {
    if (TYPE_MAP[props.type]) {
      editorInstance.value.getSession().setMode(`ace/mode/${TYPE_MAP[props.type]}`);
    } else {
      editorInstance.value.getSession().setMode('ace/mode/text}');
    }
  }
}, {
  immediate: true
})
watch(() => props.modelValue, (newValue) => {
  const value = editorInstance.value?.getValue();
  if (newValue !== value) {
    editorInstance.value?.setValue(newValue);
  }
}, {
  immediate: true
})
/*
|--------------------------------------------------------------------------
| 函数定义
|--------------------------------------------------------------------------
*/
const initEditor = () => {
  editorInstance.value = ace.edit(editor.value);
  editorInstance.value.$blockScrolling = Infinity;
  editorInstance.value.getSession().setMode(`ace/mode/${TYPE_MAP[props.type as HttpNodeBodyRawType] || 'text'}`);
  editorInstance.value.setTheme('ace/theme/github');
  // console.log(33, editorInstance.value.getOptions())
  editorInstance.value.getSession().setUseWrapMode(true);
  editorInstance.value.getSession().setUseWorker(false); //禁用语法提示
  editorInstance.value.setOptions({
    fontSize: '13px',
    wrapBehavioursEnabled: true,
  });
  if (props.readonly) {
    editorInstance.value.setReadOnly(true);
  }
  editorInstance.value.on('change', () => {
    if (watchStoper && !props.readonly) {
      watchStoper.value?.();
    }
    const content = editorInstance.value?.getValue();
    emits('update:modelValue', content);
    emits('change', content);
  });
  emits('ready', editorInstance.value);
}
const setValue = (value: string) => {
  editorInstance.value?.setValue(value);
  editorInstance.value?.clearSelection();
}
/*
|--------------------------------------------------------------------------
| 生命周期
|--------------------------------------------------------------------------
*/
onMounted(() => {
  initEditor();
  watchStoper.value = watch(() => props.modelValue, (value: string) => {
    setValue(value)
  }, {
    immediate: true,
  })
})
onUnmounted(() => {
  editorInstance.value?.destroy()
})
</script>

<style lang='scss' scoped>
#editor {
  width: 100%;
  height: 100%;
}
</style>
