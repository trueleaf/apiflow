<template>
  <ClDrag
    v-show="agentViewStore.agentViewDialogVisible"
    class="ai-dialog"
    :width="dialogWidth"
    :height="dialogHeight"
    :min-width="config.renderConfig.aiDialog.minWidth"
    :max-width="config.renderConfig.aiDialog.maxWidth"
    :min-height="config.renderConfig.aiDialog.minHeight"
    :max-height="config.renderConfig.aiDialog.maxHeight"
    :default-width="config.renderConfig.aiDialog.defaultWidth"
    :default-height="config.renderConfig.aiDialog.defaultHeight"
    v-model:position="position"
    :default-position="defaultDialogPosition"
    @drag-end="handleDragEnd"
    @resize-end="handleResizeEnd"
    @reset-width="handleResetWidth"
    @reset-height="handleResetHeight"
    @reset-corner="handleResetCorner"
  >
    <template #header>
      <AiHeader @close="handleClose" />
    </template>
    <div class="ai-dialog-body">
      <AiHistory v-if="agentViewStore.currentView === 'history'" />
      <AiAsk
        v-if="agentViewStore.currentView === 'chat'"
      />
      <AiAgent
        v-if="agentViewStore.currentView === 'agent'"
      />
      <AiConfig v-if="agentViewStore.currentView === 'config'" />
      <AiFooter
        v-if="agentViewStore.currentView === 'chat' || agentViewStore.currentView === 'agent'"
      />
    </div>
  </ClDrag>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { config } from '@src/config/config'
import { appStateCache } from '@/cache/appState/appStateCache'
import { useAgentViewStore } from '@/store/ai/agentView'
import AiHistory from './components/aiHistory/AiHistory.vue'
import ClDrag from '@/components/ui/cleanDesign/clDrag/ClDrag.vue'
import AiHeader from './components/aiHeader/AiHeader.vue'
import AiAsk from './components/aiAsk/AiAsk.vue'
import AiAgent from './components/aiAgent/AiAgent.vue'
import AiConfig from './components/aiConfig/AiConfig.vue'
import AiFooter from './components/aiFooter/AiFooter.vue'

const agentViewStore = useAgentViewStore()
const defaultDialogPosition = { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' } as const
const position = ref<{ x: number | null, y: number | null }>({ x: null, y: null })
const dialogWidth = ref(config.renderConfig.aiDialog.defaultWidth)        
const dialogHeight = ref(config.renderConfig.aiDialog.defaultHeight)      

/*
|--------------------------------------------------------------------------
| 拖拽相关
|--------------------------------------------------------------------------
*/
// 拖拽结束
const handleDragEnd = (pos: { x: number, y: number }) => {
  position.value = { x: pos.x, y: pos.y }
  appStateCache.setAiDialogRect({
    width: dialogWidth.value,
    height: dialogHeight.value,
    x: pos.x,
    y: pos.y
  })
}
// 调整大小结束
const handleResizeEnd = (size: { width: number, height: number }) => {
  dialogWidth.value = size.width
  dialogHeight.value = size.height
  appStateCache.setAiDialogRect({
    width: size.width,
    height: size.height,
    x: position.value.x,
    y: position.value.y
  })
}
// 重置宽度
const handleResetWidth = () => {
  dialogWidth.value = config.renderConfig.aiDialog.defaultWidth
  appStateCache.setAiDialogRect({
    width: dialogWidth.value,
    height: dialogHeight.value,
    x: position.value.x,
    y: position.value.y
  })
}
// 重置高度
const handleResetHeight = () => {
  dialogHeight.value = config.renderConfig.aiDialog.defaultHeight
  appStateCache.setAiDialogRect({
    width: dialogWidth.value,
    height: dialogHeight.value,
    x: position.value.x,
    y: position.value.y
  })
}
// 重置角落
const handleResetCorner = () => {
  dialogWidth.value = config.renderConfig.aiDialog.defaultWidth
  dialogHeight.value = config.renderConfig.aiDialog.defaultHeight
  appStateCache.setAiDialogRect({
    width: dialogWidth.value,
    height: dialogHeight.value,
    x: position.value.x,
    y: position.value.y
  })
}
// 限制位置在边界内
const clampPositionToBounds = (pos: { x: number, y: number }, width: number, height: number): { x: number, y: number } => {
  const maxX = window.innerWidth - width
  const maxY = window.innerHeight - height
  return {
    x: Math.max(0, Math.min(pos.x, maxX)),
    y: Math.max(0, Math.min(pos.y, maxY))
  }
}
/*
|--------------------------------------------------------------------------
| 其他操作
|--------------------------------------------------------------------------
*/
// 关闭对话框
const handleClose = () => {
  agentViewStore.hideAgentViewDialog()
}
// 初始化对话框状态
const initDialogState = () => {
  const cachedRect = appStateCache.getAiDialogRect()
  if (cachedRect.width !== null) {
    dialogWidth.value = cachedRect.width
  }
  if (cachedRect.height !== null) {
    dialogHeight.value = cachedRect.height
  }
  agentViewStore.initMode()
  agentViewStore.initView()
  if (cachedRect.x !== null && cachedRect.y !== null) {
    const cachedPosition = { x: cachedRect.x, y: cachedRect.y }
    const clampedPosition = clampPositionToBounds(cachedPosition, dialogWidth.value, dialogHeight.value)
    position.value = clampedPosition
    if (clampedPosition.x !== cachedPosition.x || clampedPosition.y !== cachedPosition.y) {
      appStateCache.setAiDialogRect({
        width: dialogWidth.value,
        height: dialogHeight.value,
        x: clampedPosition.x,
        y: clampedPosition.y
      })
    }
  }
}

onMounted(() => {
  initDialogState()
  agentViewStore.loadSessionData()
})

</script>

<style scoped>
.ai-dialog {
  background: var(--ai-dialog-bg);
  border: 1px solid var(--ai-dialog-border);
  border-radius: 5px;
  box-shadow: 0 16px 40px var(--ai-dialog-shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: var(--zIndex-ai-dialog);
  color: var(--ai-text-primary);
}
.ai-dialog-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--ai-dialog-bg);
}
</style>

