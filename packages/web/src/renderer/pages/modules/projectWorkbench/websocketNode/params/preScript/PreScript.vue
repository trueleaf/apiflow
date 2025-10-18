<template>
  <div class="editor-wrap">
    <PreEditor ref="editorWrap" v-model="preRequest"></PreEditor>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import PreEditor from './editor/PreEditor.vue'
import { useWebSocket } from '@/store/websocket/websocket';
import { useRedoUndo } from '@/store/redoUndo/redoUndo'
import { debounce } from '@/helper'

const websocketStore = useWebSocket()
const redoUndoStore = useRedoUndo()

// 防抖记录前置脚本操作
const debouncedRecordPreRequestOperation = debounce((oldValue: string, newValue: string) => {
  if (oldValue === newValue) return;

  redoUndoStore.recordOperation({
    nodeId: websocketStore.websocket._id,
    type: "preRequestOperation",
    operationName: "修改前置脚本",
    affectedModuleName: "preScript",
    oldValue: { raw: oldValue },
    newValue: { raw: newValue },
    timestamp: Date.now()
  })
}, 500)

// 前置脚本内容的前值
let previousScriptContent = websocketStore.websocket.preRequest.raw

const preRequest = computed<string>({
  get() {
    return websocketStore.websocket.preRequest.raw;
  },
  set(val) {
    const oldValue = previousScriptContent
    websocketStore.changeWebSocketPreRequest(val);
    debouncedRecordPreRequestOperation(oldValue, val)
    previousScriptContent = val
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
