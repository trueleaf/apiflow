<template>
  <canvas
    :id="`line__${props.lineInfo.id}`"
    class="line"
    :data-id="props.lineInfo.id"
    :style="{
      left: props.lineInfo.offsetX + 'px',
      top: props.lineInfo.offsetY + 'px',
      width: props.lineInfo.width + 'px',
      height: props.lineInfo.height + 'px',
      zIndex: props.lineInfo.zIndex,
      cursor: lineStateStore.isHoverDragArrow ? 'move' : 'inherit',
    }"
  >
  </canvas>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'
import { FlowLineInfo } from '@src/types/apiflow';
import { useFlowLineStateStore } from '@/store/apiflow/line-state';

const props = defineProps({
  lineInfo: {
    type: Object as PropType<FlowLineInfo>,
    default() {
      return {}
    }
  }
});
const lineStateStore = useFlowLineStateStore()

</script>

<style lang='scss' scoped>
.line {
    position: absolute;
}
</style>
