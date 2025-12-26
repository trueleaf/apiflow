<template>
  <div class="editor-wrap">
    <AfterEditor ref="editorWrap" v-model="afterRequest"></AfterEditor>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent } from 'vue'
import { useWebSocket } from '@/store/websocketNode/websocketNodeStore';
import { useWsRedoUndo } from '@/store/redoUndo/wsRedoUndoStore'
const AfterEditor = defineAsyncComponent(() => import('./editor/AfterEditor.vue'))

const websocketStore = useWebSocket()
const redoUndoStore = useWsRedoUndo()
// 后置脚本记录函数
const recordAfterRequestOperation = (oldValue: string, newValue: string) => {
  if (oldValue === newValue) return;
  redoUndoStore.recordOperation({
    nodeId: websocketStore.websocket._id,
    type: "afterRequestOperation",
    operationName: "修改后置脚本",
    affectedModuleName: "afterScript",
    oldValue: { raw: oldValue },
    newValue: { raw: newValue },
    timestamp: Date.now()
  })
};
// 后置脚本内容的前值
let previousAfterScriptContent = websocketStore.websocket.afterRequest.raw
const afterRequest = computed({
  get() {
    return websocketStore.websocket.afterRequest.raw;
  },
  set(val) {
    const oldValue = previousAfterScriptContent
    websocketStore.changeWebSocketAfterRequest(val);
    recordAfterRequestOperation(oldValue, val)
    previousAfterScriptContent = val
  },
})

</script>

<style lang='scss' scoped>
.editor-wrap {
  position: relative;
  width: 100%;
  height: calc(100vh - 320px);
}
</style>
