<template>
  <div class="editor-wrap">
    <AfterEditor
      ref="editorRef"
      manual-undo-redo
      :model-value="afterRequest"
      @update:model-value="handleAfterRequestChange"
      @undo="handleEditorUndo"
      @redo="handleEditorRedo">
    </AfterEditor>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import AfterEditor from './editor/AfterEditor.vue'
import { useHttpNode } from '@/store/httpNode/httpNodeStore';
import { useHttpRedoUndo } from '@/store/redoUndo/httpRedoUndoStore'
import { useApidocTas } from '@/store/httpNode/httpTabsStore'
import { router } from '@/router'
import { cloneDeep } from 'lodash-es'
import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api'

const httpNodeStore = useHttpNode();
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

const afterRequest = computed<string>(() => httpNodeStore.apidoc?.afterRequest.raw)
//处理后置脚本变化
const handleAfterRequestChange = (newValue: string) => {
  const oldValue = { raw: httpNodeStore.apidoc.afterRequest.raw };
  httpNodeStore.changeAfterRequest(newValue);
  const newVal = { raw: newValue };
  recordAfterRequestOperation(oldValue, newVal);
}
//处理编辑器undo
const handleEditorUndo = () => {
  const nodeId = currentSelectTab.value?._id;
  if (nodeId) {
    const result = httpRedoUndoStore.httpUndo(nodeId);
    if (result.code === 0 && result.operation?.type === 'afterRequestOperation') {
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
    if (result.code === 0 && result.operation?.type === 'afterRequestOperation') {
      if (result.operation.cursorPosition) {
        editorRef.value?.setCursorPosition?.(result.operation.cursorPosition);
      }
    }
  }
}
//后置脚本记录函数
const recordAfterRequestOperation = (oldValue: { raw: string }, newValue: { raw: string }) => {
  if (!currentSelectTab.value || oldValue.raw === newValue.raw) return;

  const cursorPosition = editorRef.value?.getCursorPosition?.() || undefined;

  httpRedoUndoStore.recordOperation({
    nodeId: currentSelectTab.value._id,
    type: "afterRequestOperation",
    operationName: "修改后置脚本",
    affectedModuleName: "afterRequest",
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
