<template>
  <div class="editor-wrap">
    <AfterEditor ref="editorWrap" v-model="afterRequest"></AfterEditor>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import AfterEditor from './editor/AfterEditor.vue'
import { useWebSocket } from '@/store/websocket/websocketStore';
import { useWsRedoUndo } from '@/store/redoUndo/wsRedoUndoStore'
import { debounce } from "lodash-es"

const websocketStore = useWebSocket()
const redoUndoStore = useWsRedoUndo()

// 防抖记录后置脚本操作
const debouncedRecordAfterRequestOperation = debounce((oldValue: string, newValue: string) => {
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
}, 500)

// 后置脚本内容的前值
let previousAfterScriptContent = websocketStore.websocket.afterRequest.raw

const afterRequest = computed<string>({
  get() {
    return websocketStore.websocket.afterRequest.raw;
  },
  set(val) {
    const oldValue = previousAfterScriptContent
    websocketStore.changeWebSocketAfterRequest(val);
    debouncedRecordAfterRequestOperation(oldValue, val)
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
