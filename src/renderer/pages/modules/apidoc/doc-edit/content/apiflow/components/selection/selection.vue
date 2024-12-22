<template>
  <div
    v-if="selectionStore.width"
    class="selection"
    :style="{
      left: selectionStore.offsetX + 'px',
      top: selectionStore.offsetY + 'px',
      width: selectionStore.width + 'px',
      height: selectionStore.height + 'px',
      zIndex: configStore.selectionZIndex
    }"
  >
  </div>
</template>

<script lang="ts" setup>
import { useFlowConfigStore } from '@/store/apiflow/config';
import { useFlowSelectionStore } from '@/store/apiflow/selection';

const selectionStore = useFlowSelectionStore()
const configStore = useFlowConfigStore()

</script>

<style lang='scss' scoped>
.selection {
    position: absolute;
    background-color: rgba(22,145,232,.1);
    border: 1px solid #6eb1eb;
}
</style>
