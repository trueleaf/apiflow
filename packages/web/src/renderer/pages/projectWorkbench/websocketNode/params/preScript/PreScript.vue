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
import { computed, defineAsyncComponent, ref } from 'vue'
import { useWebSocket } from '@/store/websocketNode/websocketNodeStore';
import { useWsRedoUndo } from '@/store/redoUndo/wsRedoUndoStore'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { storeToRefs } from 'pinia'
import { cloneDeep } from 'lodash-es'
import type * as Monaco from 'monaco-editor'
const PreEditor = defineAsyncComponent(() => import('./editor/PreEditor.vue'))

const websocketStore = useWebSocket()
const redoUndoStore = useWsRedoUndo()
const projectNavStore = useProjectNav()
const { currentSelectNav } = storeToRefs(projectNavStore)
const editorRef = ref<{
  getCursorPosition?: () => Monaco.Position | null,
  setCursorPosition?: (position: Monaco.Position) => void,
} | null>(null)

const preRequest = computed(() => websocketStore.websocket.preRequest.raw)
//处理前置脚本变化
const handlePreRequestChange = (newValue: string) => {
  const oldValue = { raw: websocketStore.websocket.preRequest.raw };
  websocketStore.changeWebSocketPreRequest(newValue);
  const newVal = { raw: newValue };
  recordPreRequestOperation(oldValue, newVal);
}
//处理编辑器undo
const handleEditorUndo = () => {
  const nodeId = currentSelectNav.value?._id;
  if (nodeId) {
    const result = redoUndoStore.wsUndo(nodeId);
    if (result.code === 0 && result.operation?.type === 'preRequestOperation') {
      if (result.operation.cursorPosition) {
        editorRef.value?.setCursorPosition?.(result.operation.cursorPosition);
      }
    }
  }
}
//处理编辑器redo
const handleEditorRedo = () => {
  const nodeId = currentSelectNav.value?._id;
  if (nodeId) {
    const result = redoUndoStore.wsRedo(nodeId);
    if (result.code === 0 && result.operation?.type === 'preRequestOperation') {
      if (result.operation.cursorPosition) {
        editorRef.value?.setCursorPosition?.(result.operation.cursorPosition);
      }
    }
  }
}
//前置脚本记录函数
const recordPreRequestOperation = (oldValue: { raw: string }, newValue: { raw: string }) => {
  const nodeId = currentSelectNav.value?._id
  if (!nodeId || oldValue.raw === newValue.raw) return
  const cursorPosition = editorRef.value?.getCursorPosition?.() || undefined;
  redoUndoStore.recordOperation({
    nodeId,
    type: "preRequestOperation",
    operationName: "修改前置脚本",
    affectedModuleName: "preScript",
    oldValue: cloneDeep(oldValue),
    newValue: cloneDeep(newValue),
    cursorPosition,
    timestamp: Date.now()
  })
};
</script>

<style lang='scss' scoped>
.editor-wrap {
  position: relative;
  width: 100%;
  height: calc(100vh - 320px);
}
</style>
