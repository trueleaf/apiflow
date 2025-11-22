<template>
  <div class="editor-wrap">
    <PreEditor
      ref="editorRef"
      manual-undo-redo
      :model-value="preRequest"
      @update:model-value="handlePreRequestChange"
      @undo="handleEditorUndo"
      @redo="handleEditorRedo">
    </PreEditor>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import PreEditor from './editor/PreEditor.vue'
import { useHttpNode } from '@/store/apidoc/httpNodeStore';
import { useHttpRedoUndo } from '@/store/redoUndo/httpRedoUndoStore'
import { useApidocTas } from '@/store/apidoc/tabsStore'
import { router } from '@/router'
import { cloneDeep } from 'lodash-es'
import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api'

const httpNodeStore = useHttpNode()
const httpRedoUndoStore = useHttpRedoUndo()
const apidocTabsStore = useApidocTas()
const projectId = router.currentRoute.value.query.id as string;
const currentSelectTab = computed(() => {
  const tabs = apidocTabsStore.tabs[projectId];
  return tabs?.find((tab) => tab.selected) || null;
});

const editorRef = ref<{
  getCursorPosition?: () => Monaco.Position | null,
  setCursorPosition?: (position: Monaco.Position) => void,
} | null>(null)

const preRequest = computed<string>(() => httpNodeStore.apidoc?.preRequest.raw)
//处理前置脚本变化
const handlePreRequestChange = (newValue: string) => {
  const oldValue = { raw: httpNodeStore.apidoc.preRequest.raw };
  httpNodeStore.changePreRequest(newValue);
  const newVal = { raw: newValue };
  recordPreRequestOperation(oldValue, newVal);
}
//处理编辑器undo
const handleEditorUndo = () => {
  const nodeId = currentSelectTab.value?._id;
  if (nodeId) {
    const result = httpRedoUndoStore.httpUndo(nodeId);
    if (result.code === 0 && result.operation?.type === 'preRequestOperation') {
      if (result.operation.cursorPosition) {
        editorRef.value?.setCursorPosition?.(result.operation.cursorPosition);
      }
    }
  }
}
//处理编辑器redo
const handleEditorRedo = () => {
  const nodeId = currentSelectTab.value?._id;
  if (nodeId) {
    const result = httpRedoUndoStore.httpRedo(nodeId);
    if (result.code === 0 && result.operation?.type === 'preRequestOperation') {
      if (result.operation.cursorPosition) {
        editorRef.value?.setCursorPosition?.(result.operation.cursorPosition);
      }
    }
  }
}
//前置脚本记录函数
const recordPreRequestOperation = (oldValue: { raw: string }, newValue: { raw: string }) => {
  if (!currentSelectTab.value || oldValue.raw === newValue.raw) return;

  const cursorPosition = editorRef.value?.getCursorPosition?.() || undefined;

  httpRedoUndoStore.recordOperation({
    nodeId: currentSelectTab.value._id,
    type: "preRequestOperation",
    operationName: "修改前置脚本",
    affectedModuleName: "preRequest",
    oldValue: cloneDeep(oldValue),
    newValue: cloneDeep(newValue),
    cursorPosition,
    timestamp: Date.now()
  });
};

</script>

<style lang='scss' scoped>
.editor-wrap {
  position: relative;
  width: 100%;
  height: calc(100vh - 320px);
}
</style>
