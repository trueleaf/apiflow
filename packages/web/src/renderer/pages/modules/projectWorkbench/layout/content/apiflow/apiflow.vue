<template>
  <div
    ref="apiflow"
    class="apiflow"
    :style="{
      cursor: cursor,
      userSelect: nodeStateStore.isMove ? 'none' : 'auto'
    }"
  >
    <s-node v-for="(item, index) in nodesStore.nodeList" :key="index" :node-id="item.id"></s-node>
    <s-line v-for="(item, index) in linesStore.lineList" :key="index" :line-info="item"></s-line>
    <s-tools></s-tools>
    <s-selection v-if="selectionStore.isMouseDown"></s-selection>
    <s-selected-node-area v-if="selectionStore.selectedNodeIds.length > 0"></s-selected-node-area>
    <teleport to="body">
      <pre v-if="1" style="position: absolute; right: 420px; top: 40px;max-height: 500px;overflow-y: auto;">
        <!-- resizeNodeDotState: {{ resizeNodeDotState }} -->
        nodesStore: {{ nodesStore }}
        nodeStateStore: {{ nodeStateStore }}
        <!-- linesStore: {{ linesStore }} -->
        <!-- lineStateStore: {{ lineStateStore }} -->
        <!-- createLineDotStore: {{ createLineDotStore }} -->
        <!-- historyStore: {{ historyStore.doingList.map(v => v.nodeList[0].styleInfo.offsetX) }} -->
        <!-- selectionStore: {{ selectionStore }} -->
        <!-- renderAreaStore: {{ renderAreaStore }} -->
      </pre>
    </teleport>
  </div>
  <canvas
    id="renderArea"
    ref="renderArea"
    :width="renderAreaStore.width"
    :height="renderAreaStore.height"
    :style="{
      width: `${renderAreaStore.width}px`,
      height: `${renderAreaStore.height}px`,
    }"
  >
  </canvas>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, onUnmounted, ref, toRaw } from 'vue';
import { debounce } from '@/helper';
import { useFlowContainerStore } from '@/store/apiflow/container';
import { useFlowNodesStore } from '@/store/apiflow/nodes';
import { useFlowResizeNodeStateStore } from '@/store/apiflow/resize-node-state';
import { useFlowCreateLineDotStateStore } from '@/store/apiflow/create-line-state';
import { useFlowLineStateStore } from '@/store/apiflow/line-state';
import { useFlowNodeStateStore } from '@/store/apiflow/node-state';
import { useFlowLinesStore } from '@/store/apiflow/lines';
import { FlowNodeInfo } from '@src/types/apiflow';
import { useFlowConfigStore } from '@/store/apiflow/config';
import { useFlowRenderAreaStore } from '@/store/apiflow/render-area';
import { useFlowSelectionStore } from '@/store/apiflow/selection';
import { useFlowHistoryStore } from '@/store/apiflow/history';
import { changeCreateLineDotWhenMouseDown, changeLineStateWhenMouseDown, changeNodeStateWhenMouseDown, changeResizeDotStateWhenMouseDown, changeSelectionWhenMouseDown } from './mouse-handler/mousedown';
import sNode from './components/node/node.vue'
import sLine from './components/line/line.vue'
import sTools from './components/tools/tools.vue'
import sSelection from './components/selection/selection.vue'
import sSelectedNodeArea from './components/selection/selected-node-area.vue'
import { changeCreateLineDotStateWhenMouseMove, changeSelectionStateWhenMouseMove, drawLineWhenMouseMove, changeNodeStateWhenMouseMove, changeNodeWhenMouseMove, changeResizeDotStateWhenMouseMove, resizeNodeWhenMouseMove, changeLineStateWhenMouseMove, createSelectionWhenMouseMove, moveSelectedAreaWhenMouseMove } from './mouse-handler/mousemove';
import { changeStateWhenMouseUp } from './mouse-handler/mouseup';
import { repaintRenderArea } from './common/common';

const apiflow = ref<HTMLDivElement | null>(null);
const renderArea = ref<HTMLCanvasElement | null>(null);
const containerStore = useFlowContainerStore();
const nodesStore = useFlowNodesStore();
const renderAreaStore = useFlowRenderAreaStore()
const createLineDotStore = useFlowCreateLineDotStateStore()
const lineStateStore = useFlowLineStateStore()
const nodeStateStore = useFlowNodeStateStore()
const resizeNodeStateStore = useFlowResizeNodeStateStore()
const linesStore = useFlowLinesStore()
const configStore = useFlowConfigStore();
const selectionStore = useFlowSelectionStore()
const historyStore = useFlowHistoryStore()
// const resizeNodeDotState = useFlowResizeNodeStateStore()
const cursor = computed(() => {
  if (createLineDotStore.hoverNodeId) {
    return 'crosshair'
  }
  if (lineStateStore.hoverLineId) {
    return 'pointer'
  }
  if (nodeStateStore.activeNodeId && resizeNodeStateStore.hoverPosition === 'leftTop') {
    return 'se-resize'
  }
  if (nodeStateStore.activeNodeId && resizeNodeStateStore.hoverPosition === 'rightTop') {
    return 'ne-resize'
  }
  if (nodeStateStore.activeNodeId && resizeNodeStateStore.hoverPosition === 'leftBottom') {
    return 'sw-resize'
  }
  if (nodeStateStore.activeNodeId && resizeNodeStateStore.hoverPosition === 'rightBottom') {
    return 'se-resize'
  }
  if (selectionStore.isHover) {
    return 'move'
  }
  if (nodeStateStore.isMouseHoverDragArea) {
    return 'move'
  }
  if (lineStateStore.hoverDragLineId) {
    return 'move'
  }
  return ''
})
//初始化容器信息
const changeContainerInfo = () => {
  if (apiflow.value !== null) {
    const apiflowRect = apiflow.value.getBoundingClientRect();
    containerStore.width = apiflowRect.width;
    containerStore.height = apiflowRect.height;
    containerStore.clientX = Math.ceil(apiflowRect.x);
    containerStore.clientY = Math.ceil(apiflowRect.y);
  }
}
//初始化renderArea
const changeRenderAreaInfo = () => {
  if (!Date && apiflow.value !== null && renderArea.value !== null) {
    const apiflowRect = apiflow.value.getBoundingClientRect();
    renderAreaStore.$patch({
      width: Math.ceil(apiflowRect.width),
      height: Math.ceil(apiflowRect.height),
      offsetX: apiflowRect.x,
      offsetY: apiflowRect.y,
    })
    nextTick(() => {
      repaintRenderArea();
    })
  }
}
const handleResize = debounce(() => {
  changeContainerInfo()
  changeRenderAreaInfo()
}, 300)
/*
|--------------------------------------------------------------------------
| 鼠标事件
|--------------------------------------------------------------------------
|
*/
const handleMouseMove = (e: MouseEvent) => {
  changeSelectionStateWhenMouseMove(e);
  changeCreateLineDotStateWhenMouseMove(e);
  changeResizeDotStateWhenMouseMove(e);
  changeNodeStateWhenMouseMove(e);
  changeNodeWhenMouseMove(e);
  resizeNodeWhenMouseMove(e);
  drawLineWhenMouseMove(e);
  changeLineStateWhenMouseMove(e);
  createSelectionWhenMouseMove(e);
  moveSelectedAreaWhenMouseMove(e);
}
const handleMouseDown = (e: MouseEvent) => {
  changeNodeStateWhenMouseDown(e);
  changeLineStateWhenMouseDown();
  changeResizeDotStateWhenMouseDown(e);
  changeCreateLineDotWhenMouseDown();
  changeSelectionWhenMouseDown(e);
}
const handleMouseUp = () => {
  changeStateWhenMouseUp()
}
const initNodes = () => {
  const nodeList: FlowNodeInfo[] = []
  for (let i = 0; i < 2; i += 1) {
    nodeList.push({
      id: `start${i}`,
      nodeType: 'rect',
      styleInfo: {
        offsetX: 240 * (i + 1),
        offsetY: 30 + 50 * i,
        width: 200,
        height: 130,
        zIndex: i + 1,
        dragZIndex: 1,
      },
      outcomingIds: [],
      incomingIds: [],
      canDragArea: {
        leftTopPosition: {
          offsetX: 0,
          offsetY: 0,
        },
        rightBottomPosition: {
          offsetX: 200,
          offsetY: 30,
        }
      }
    })
  }
  historyStore.doingList.push({
    nodeList: JSON.parse(JSON.stringify(nodeList)),
    lineList: [],
    configInfo: JSON.parse(JSON.stringify(toRaw(configStore.$state)))
  })
  nodesStore.$patch((state) => {
    state.nodeList = nodeList
  })
}
onMounted(() => {
  changeContainerInfo();
  initNodes();
  changeRenderAreaInfo();
  window.addEventListener('resize', handleResize)
  document.documentElement.addEventListener('mousemove', handleMouseMove);
  document.documentElement.addEventListener('mousedown', handleMouseDown);
  document.documentElement.addEventListener('mouseup', handleMouseUp);
})
onUnmounted(() => {
  document.documentElement.removeEventListener('mousemove', handleMouseMove);
  document.documentElement.removeEventListener('mousedown', handleMouseDown);
  document.documentElement.removeEventListener('mouseup', handleMouseUp);
})
</script>

<style lang='scss' scoped>
.apiflow {
    overflow: auto;
    position: absolute;
    width: 100%;
    height: calc(100vh - 100px);
    border-right: 1px solid var(--gray-400);
}
#renderArea {
    position: absolute;
}
</style>
