/*
模块名称：可拖拽左右组件
备注：
*/
<template>
  <div ref="leftRight" class="left-right">
    <!-- 左侧 -->
    <div ref="leftDom" class="left-wrap">
      <slot name="left" />
    </div>
    <div ref="resizeBar" class="resize-bar" @mousedown="handleResizeMousedown"></div>
    <!-- 右侧 -->
    <div ref="rightDom" class="right-wrap">
      <slot name="right" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';


const props = defineProps({
  leftWidth: {
    type: Number,
    default: 350
  },
  minLeftWidth: {
    type: Number,
    default: 150,
  },
})
const leftDomWidth = ref(props.leftWidth);
const mousedownLeft = ref(0);
const mousedownTop = ref(0);
const leftDom = ref<HTMLElement>();
const rightDom = ref<HTMLElement>();
/*
|--------------------------------------------------------------------------
| 函数定义
|--------------------------------------------------------------------------
*/
//初始化
const init = () => {
  leftDom.value!.style.width = `${leftDomWidth.value}px`;
  document.documentElement.addEventListener('mouseup', handleMouseup)
}
//处理全局鼠标松开
const handleMouseup = (e: MouseEvent) => {
  e.stopPropagation()
  leftDomWidth.value = leftDom.value?.getBoundingClientRect().width || props.minLeftWidth;
  document.documentElement.removeEventListener('mousemove', handleResizeMousemove);
}
//处理鼠标按下事件
const handleResizeMousedown = (e: MouseEvent) => {
  mousedownLeft.value = e.clientX;
  mousedownTop.value = e.clientY;
  document.documentElement.addEventListener('mousemove', handleResizeMousemove);
}
//处理鼠标移动事件
const handleResizeMousemove = (e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  let moveLeft = 0;
  moveLeft = e.clientX - mousedownLeft.value + leftDomWidth.value;
  if (moveLeft < props.minLeftWidth) {
    return;
  }
  if (leftDom.value) {
    leftDom.value.style.width = `${moveLeft}px`
  }
}

onMounted(() => {
  init();
})
onUnmounted(() => {
  document.documentElement.removeEventListener('mouseup', handleMouseup); //清除事件
  document.documentElement.removeEventListener('mousemove', handleResizeMousemove); //清除事件
})

</script>

<style  scoped>
.left-right {
  height: 100%;
  width: 100%;
  display: flex;

  .left-wrap {
    flex: 0 0 auto;
    padding: 0 size(10);
  }

  .resize-bar {
    flex: 0 0 3px;
    padding: 0 4px;
    cursor: col-resize;
    background: $gray-300;
  }

  .right-wrap {
    flex-grow: 1;
    flex-shrink: 1;
    padding: 0 size(10);
  }
}
</style>
