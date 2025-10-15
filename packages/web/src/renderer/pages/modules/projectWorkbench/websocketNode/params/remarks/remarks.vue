<template>
  <div class="remarks">
    <div class="remarks-editor">
      <el-input 
        v-model="remarks" 
        type="textarea" 
        :rows="15"
        placeholder="请输入WebSocket接口的备注信息..."
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
      />
    </div>
    
    <div class="remarks-actions">
      <el-button type="primary" @click="handleSaveRemarks">
        {{ t("保存备注") }}
      </el-button>
      <el-button @click="handleClearRemarks">
        {{ t("清空备注") }}
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWebSocket } from '@/store/websocket/websocket'
import { useRedoUndo } from '@/store/redoUndo/redoUndo'
import { debounce } from '@/helper'

const { t } = useI18n()
const websocketStore = useWebSocket()
const redoUndoStore = useRedoUndo()

// 防抖记录备注操作
const debouncedRecordRemarksOperation = debounce((oldValue: string, newValue: string) => {
  if (oldValue === newValue) return;
  
  redoUndoStore.recordOperation({
    nodeId: websocketStore.websocket._id,
    type: "basicInfoOperation",
    operationName: "修改备注信息",
    affectedModuleName: "remarks",
    oldValue: { 
      name: websocketStore.websocket.info.name,
      description: oldValue 
    },
    newValue: { 
      name: websocketStore.websocket.info.name,
      description: newValue 
    },
    timestamp: Date.now()
  })
}, 500)

// 备注内容的前值
let previousRemarksContent = websocketStore.websocket.info.description

const remarks = computed({
  get: () => websocketStore.websocket.info.description,
  set: (value: string) => {
    const oldValue = previousRemarksContent
    websocketStore.changeWebSocketDescription(value)
    debouncedRecordRemarksOperation(oldValue, value)
    previousRemarksContent = value
  }
})

const handleSaveRemarks = () => {
  console.log('保存备注信息:', remarks.value)
}

const handleClearRemarks = () => {
  websocketStore.changeWebSocketDescription('')
}
</script>

<style lang="scss" scoped>
.remarks {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;

  .remarks-editor {
    flex: 1;
    margin-bottom: 16px;
  }

  .remarks-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-start;
  }
}
</style>
