<template>
  <div class="toolbar">
    <div class="op-item" @click.stop="handleSave">
      <i class="iconfont iconbaocun"></i>
    </div>
    <div class="op-item" :class="{disabled: historyStore.doingList.length <= 1}" @click.stop="handleUndo">
      <i class="iconfont iconshangyibu"></i>
    </div>
    <div class="op-item" :class="{disabled: historyStore.redoList.length === 0}" @click.stop="handleRedo">
      <i class="iconfont iconxiayibu"></i>
    </div>
    <el-divider direction="vertical" />
    <div class="op-item" @click.stop="handleZoomOut">
      <i class="iconfont iconjianhao"></i>
    </div>
    <div class="mx-1 f-xs">{{ (configStore.zoom * 100).toFixed(0) }}%</div>
    <div class="op-item" @click.stop="handleZoomIn">
      <i class="iconfont iconjiahao"></i>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useFlowConfigStore } from '@/store/apiflow/config';
import { useFlowHistoryStore } from '@/store/apiflow/history';
import { useFlowLinesStore } from '@/store/apiflow/lines';
import { useFlowNodesStore } from '@/store/apiflow/nodes';
import { nextTick, toRaw } from 'vue';
import { drawLineWhenMoveOrResize } from '../../common/common';

const nodesStore = useFlowNodesStore();
const linesStore = useFlowLinesStore()
const configStore = useFlowConfigStore();
const historyStore = useFlowHistoryStore()
const nodeListStore = useFlowNodesStore()
//保存数据
const handleSave = () => {
  console.log(22, nodesStore.nodeList)
}
//放大
const handleZoomIn = () => {
  if (configStore.zoom >= 1.5) {
    return;
  }
  configStore.$patch({
    zoom: configStore.zoom + 0.1
  })
  historyStore.doingList.push({
    nodeList: JSON.parse(JSON.stringify(toRaw(nodeListStore.nodeList))),
    lineList: JSON.parse(JSON.stringify(toRaw(linesStore.lineList))),
    configInfo: JSON.parse(JSON.stringify(toRaw(configStore.$state)))
  })
  nodesStore.nodeList.forEach(node => {
    drawLineWhenMoveOrResize(node)
  })
}
//缩小
const handleZoomOut = () => {
  if (configStore.zoom <= 0.8) {
    return;
  }
  configStore.$patch({
    zoom: configStore.zoom - 0.1
  })
  historyStore.doingList.push({
    nodeList: JSON.parse(JSON.stringify(toRaw(nodeListStore.nodeList))),
    lineList: JSON.parse(JSON.stringify(toRaw(linesStore.lineList))),
    configInfo: JSON.parse(JSON.stringify(toRaw(configStore.$state)))
  })
  nodesStore.nodeList.forEach(node => {
    drawLineWhenMoveOrResize(node)
  })
}
//撤销
const handleUndo = () => {
  if (historyStore.doingList.length <= 1) {
    return
  }
  const popedItem = historyStore.doingList.pop()
  const last = historyStore.doingList[historyStore.doingList.length - 1];
  if (popedItem) {
    historyStore.redoList.push(JSON.parse(JSON.stringify(popedItem)))
  }
  if (last) {
    nodesStore.$patch(state => {
      state.nodeList = JSON.parse(JSON.stringify(last.nodeList));
    })
    linesStore.$patch(state => {
      state.lineList = JSON.parse(JSON.stringify(last.lineList))
    })
    configStore.$patch(state => {
      Object.assign(state, last.configInfo)
    })
    nextTick(() => {
      nodesStore.nodeList.forEach(node => {
        drawLineWhenMoveOrResize(node)
      })
    })
  }
}
//重做
const handleRedo = () => {
  if (historyStore.redoList.length === 0) {
    return
  }
  const popedItem = historyStore.redoList.pop();
  if (popedItem) {
    historyStore.doingList.push(JSON.parse(JSON.stringify(popedItem)));
    nodesStore.$patch({
      nodeList: popedItem.nodeList
    })
    linesStore.$patch({
      lineList: popedItem.lineList
    })
    configStore.$patch(state => {
      Object.assign(state, popedItem.configInfo)
    })
    nextTick(() => {
      nodesStore.nodeList.forEach(node => {
        drawLineWhenMoveOrResize(node)
      })
    })
  }
}
</script>

<style lang='scss' scoped>
.toolbar {
    position: absolute;
    background-color: #fff;
    box-shadow: 1px 1px 5px var(--gray-500);
    top: 1px;
    left: 100px;
    user-select: none;
    padding: 0 20px;
    height: 30px;
    display: flex;
    align-items: center;
    cursor: move;
    .op-item {
        height: 100%;
        width: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        &.disabled {
            color: var(--gray-300);
            cursor: default;
            &:hover {
                background-color: inherit;
            }
        }
        &:hover {
            background-color: var(--gray-200);
        }
    }
}
</style>
