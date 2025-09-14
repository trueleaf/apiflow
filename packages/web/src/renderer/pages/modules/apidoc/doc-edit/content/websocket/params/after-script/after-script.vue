<template>
  <div class="after-script-content">
    <div class="script-editor">
      <el-input 
        v-model="afterScript" 
        type="textarea" 
        :rows="15"
        placeholder="// 在WebSocket消息发送后执行的JavaScript代码
// 可以访问 response 对象处理响应数据

console.log('WebSocket消息发送完成');"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
      />
    </div>
    
    <div class="script-actions">
      <el-button type="primary" @click="handleTestAfterScript">
        {{ t("测试脚本") }}
      </el-button>
      <el-button @click="handleClearAfterScript">
        {{ t("清空脚本") }}
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useTranslation } from 'i18next-vue'
import { useWebSocket } from '@/store/websocket/websocket'
import { useRedoUndo } from '@/store/redoUndo/redoUndo'
import { debounce } from '@/helper'

const { t } = useTranslation()
const websocketStore = useWebSocket()
const redoUndoStore = useRedoUndo()

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

const afterScript = computed({
  get: () => websocketStore.websocket.afterRequest.raw,
  set: (value: string) => {
    const oldValue = previousAfterScriptContent
    websocketStore.changeWebSocketAfterRequest(value)
    debouncedRecordAfterRequestOperation(oldValue, value)
    previousAfterScriptContent = value
  }
})

const handleTestAfterScript = () => {
  if (!afterScript.value.trim()) {
    console.warn('脚本内容不能为空')
    return
  }
  console.log('测试后置脚本:', afterScript.value)
}

const handleClearAfterScript = () => {
  websocketStore.changeWebSocketAfterRequest('')
}
</script>

<style lang="scss" scoped>
.after-script-content {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;

  .script-editor {
    flex: 1;
    margin-bottom: 16px;

    :deep(.el-textarea__inner) {
      font-family: 'Courier New', monospace;
      font-size: 14px;
    }
  }

  .script-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-start;
  }
}
</style>
