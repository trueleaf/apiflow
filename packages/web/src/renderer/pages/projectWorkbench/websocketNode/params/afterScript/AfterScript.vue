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
import { computed, defineAsyncComponent, ref } from 'vue'
import { useWebSocket } from '@/store/websocketNode/websocketNodeStore';
import { useWsRedoUndo } from '@/store/redoUndo/wsRedoUndoStore'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { storeToRefs } from 'pinia'
import { cloneDeep } from 'lodash-es'
import type * as Monaco from 'monaco-editor'
const AfterEditor = defineAsyncComponent(() => import('./editor/AfterEditor.vue'))

const websocketStore = useWebSocket()
const redoUndoStore = useWsRedoUndo()
const projectNavStore = useProjectNav()
const { currentSelectNav } = storeToRefs(projectNavStore)
const editorRef = ref<{
  getCursorPosition?: () => Monaco.Position | null,
  setCursorPosition?: (position: Monaco.Position) => void,
} | null>(null)

const afterRequest = computed(() => websocketStore.websocket.afterRequest.raw)
//处理后置脚本变化
const handleAfterRequestChange = (newValue: string) => {
  const oldValue = { raw: websocketStore.websocket.afterRequest.raw };
  websocketStore.changeWebSocketAfterRequest(newValue);
  const newVal = { raw: newValue };
  recordAfterRequestOperation(oldValue, newVal);
}
//处理编辑器undo
const handleEditorUndo = () => {
  const nodeId = currentSelectNav.value?._id;
  if (nodeId) {
    const result = redoUndoStore.wsUndo(nodeId);
    if (result.code === 0 && result.operation?.type === 'afterRequestOperation') {
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
    if (result.code === 0 && result.operation?.type === 'afterRequestOperation') {
      if (result.operation.cursorPosition) {
        editorRef.value?.setCursorPosition?.(result.operation.cursorPosition);
      }
    }
  }
}
//后置脚本记录函数
const recordAfterRequestOperation = (oldValue: { raw: string }, newValue: { raw: string }) => {
  const nodeId = currentSelectNav.value?._id
  if (!nodeId || oldValue.raw === newValue.raw) return
  const cursorPosition = editorRef.value?.getCursorPosition?.() || undefined;
  redoUndoStore.recordOperation({
    nodeId,
    type: "afterRequestOperation",
    operationName: "修改后置脚本",
    affectedModuleName: "afterScript",
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
