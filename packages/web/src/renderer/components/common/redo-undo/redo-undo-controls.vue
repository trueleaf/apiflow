<template>
  <div class="redo-undo-controls">
    <el-button-group size="small">
      <el-button 
        :disabled="!canUndo" 
        :title="t('撤销') + ' (Ctrl+Z)'"
        @click="handleUndo"
        :icon="RefreshLeft"
      >
        {{ t('撤销') }}
      </el-button>
      <el-button 
        :disabled="!canRedo" 
        :title="t('重做') + ' (Ctrl+Y)'"
        @click="handleRedo"
        :icon="RefreshRight"
      >
        {{ t('重做') }}
      </el-button>
    </el-button-group>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { RefreshLeft, RefreshRight } from '@element-plus/icons-vue';
import { useTranslation } from 'i18next-vue';
import { useRedoUndo } from '@/store/redoUndo/redoUndo';
import { useWebSocket } from '@/store/websocket/websocket';
import { ShortcutHandler } from '@/helper/redoUndo';

const { t } = useTranslation();
const redoUndoStore = useRedoUndo();
const websocketStore = useWebSocket();

const canUndo = computed(() => {
  const nodeId = websocketStore.websocket._id;
  const undoList = redoUndoStore.wsUndoList[nodeId];
  return undoList && undoList.length > 0;
});
const canRedo = computed(() => {
  const nodeId = websocketStore.websocket._id;
  const redoList = redoUndoStore.wsRedoList[nodeId];
  return redoList && redoList.length > 0;
});

// 事件处理
const handleUndo = (): void => {
  const nodeId = websocketStore.websocket._id;
  redoUndoStore.wsUndo(nodeId);
};

const handleRedo = (): void => {
  const nodeId = websocketStore.websocket._id;
  redoUndoStore.wsRedo(nodeId);
};

// 快捷键支持
let cleanupShortcuts: (() => void) | null = null;

onMounted(() => {
  cleanupShortcuts = ShortcutHandler.registerShortcuts(
    handleUndo,
    handleRedo
  );
});

onUnmounted(() => {
  if (cleanupShortcuts) {
    cleanupShortcuts();
  }
});
</script>

<style lang="scss" scoped>
.redo-undo-controls {
  display: inline-flex;
  
  .el-button-group {
    .el-button {
      font-size: 12px;
      padding: 4px 8px;
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}
</style>
