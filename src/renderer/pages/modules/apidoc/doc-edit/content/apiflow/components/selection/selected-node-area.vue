<template>
  <div
    class="selected-node-area"
    :style="{
      left: selectionStore.selectedNodeArea.offsetX - configStore.selectedNodeAreaPadding + 'px',
      top: selectionStore.selectedNodeArea.offsetY - configStore.selectedNodeAreaPadding + 'px',
      width: selectionStore.selectedNodeArea.width + 2 * configStore.selectedNodeAreaPadding + 'px',
      height: selectionStore.selectedNodeArea.height + 2 * configStore.selectedNodeAreaPadding + 'px',
      zIndex: configStore.selectedNodeAreaZIndex
    }"
  >
    <canvas ref="canvas"></canvas>
    <!-- 上左 -->
    <div
      class="resize-dot"
      :style="{
        width: configStore.resizeDotSize + 'px',
        height: configStore.resizeDotSize + 'px',
        left: -configStore.resizeDotSize / 2 + 'px',
        top: -configStore.resizeDotSize / 2 + 'px',
        cursor: 'nwse-resize'
      }"
    >
    </div>
    <!-- 上中 -->
    <div
      class="resize-dot"
      :style="{
        width: configStore.resizeDotSize + 'px',
        height: configStore.resizeDotSize + 'px',
        left: selectionStore.selectedNodeArea.width / 2 + 'px',
        top: -configStore.resizeDotSize / 2 + 'px',
        cursor: 'ns-resize'
      }"
    >
    </div>
    <!-- 上右 -->
    <div
      class="resize-dot"
      :style="{
        width: configStore.resizeDotSize + 'px',
        height: configStore.resizeDotSize + 'px',
        top: -configStore.resizeDotSize / 2 + 'px',
        right: -configStore.resizeDotSize / 2 + 'px',
        cursor: 'nesw-resize'
      }"
    >
    </div>
    <!-- 左中 -->
    <div
      class="resize-dot"
      :style="{
        width: configStore.resizeDotSize + 'px',
        height: configStore.resizeDotSize + 'px',
        left: -configStore.resizeDotSize / 2 + 'px',
        top: selectionStore.selectedNodeArea.height / 2 + 'px',
        cursor: 'ew-resize'
      }"
    >
    </div>
    <!-- 右中 -->
    <div
      class="resize-dot"
      :style="{
        width: configStore.resizeDotSize + 'px',
        height: configStore.resizeDotSize + 'px',
        right: -configStore.resizeDotSize / 2 + 'px',
        top: selectionStore.selectedNodeArea.height / 2 + 'px',
        cursor: 'ew-resize'
      }"
    >
    </div>
    <!-- 左下 -->
    <div
      class="resize-dot"
      :style="{
        width: configStore.resizeDotSize + 'px',
        height: configStore.resizeDotSize + 'px',
        left: -configStore.resizeDotSize / 2 + 'px',
        bottom: -configStore.resizeDotSize / 2 + 'px',
        cursor: 'nesw-resize'
      }"
    >
    </div>
    <!-- 下中 -->
    <div
      class="resize-dot"
      :style="{
        width: configStore.resizeDotSize + 'px',
        height: configStore.resizeDotSize + 'px',
        left: selectionStore.selectedNodeArea.width / 2 + 'px',
        bottom: -configStore.resizeDotSize / 2 + 'px',
        cursor: 'ns-resize'
      }"
    >
    </div>
    <div
      class="resize-dot"
      :style="{
        width: configStore.resizeDotSize + 'px',
        height: configStore.resizeDotSize + 'px',
        bottom: -configStore.resizeDotSize / 2 + 'px',
        right: -configStore.resizeDotSize / 2 + 'px',
        cursor: 'nwse-resize'
      }"
    >
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useFlowConfigStore } from '@/store/apiflow/config';
import { useFlowSelectionStore } from '@/store/apiflow/selection';
import { onMounted, ref } from 'vue';

const selectionStore = useFlowSelectionStore()
const configStore = useFlowConfigStore()
const canvas = ref<HTMLCanvasElement | null>(null)
const initCanvase = () => {
  if (!canvas.value) {
    return
  }
  const { width, height } = selectionStore.selectedNodeArea
  const realWidth = width + 2 * configStore.selectedNodeAreaPadding
  const realHeight = height + 2 * configStore.selectedNodeAreaPadding
  canvas.value.style.width = `${realWidth}px`;
  canvas.value.style.height = `${realHeight}px`;
  canvas.value.width = realWidth
  canvas.value.height = realHeight
  const ctx = canvas.value.getContext('2d') as CanvasRenderingContext2D;
  ctx.beginPath()
  ctx.strokeStyle = '#409EFF';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(0, 0, realWidth, realHeight)
  ctx.closePath()
}

onMounted(() => {
  initCanvase();
})

</script>

<style  scoped>
.selected-node-area {
    position: absolute;
    // border: 1px dashed #6eb1eb;
    .resize-dot {
        border: 1px solid $theme-color;
        position: absolute;
        background-color: $white;
        &:hover{
            background-color: $theme-color;
        }
    }
}
</style>
