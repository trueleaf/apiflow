<template>
  <div ref="wrapper" :style="{ 'userSelect': isDragging ? 'none' : 'auto' }" class="drag-wrap">
    <div 
      ref="bar" 
      class="bar" 
      :class="{ active: isDragging }" 
      @mousedown="handleResizeMousedown"
      @dblclick="handleResetWidth">
    </div>
    <div v-show="isDragging" class="indicator">
      <div class="left"></div>
      <div class="ct">
        <div>{{ realTimeWidth.toFixed(0) }}px({{ t("双击还原") }})</div>
      </div>
      <div class="right"></div>
    </div>
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { onMounted, onUnmounted, ref, watch } from 'vue';

const props = defineProps({
  width: {
    type: Number,
    default: null,
  },
  min: {
    type: Number,
    default: 100,
  },
  max: {
    type: Number,
    default: 400,
  },
  remember: {
    type: Boolean,
    default: true,
  },
  name: {
    type: String,
    required: true,
  },
  barLeft: {
    type: Boolean,
    default: false,
  },
})
const { t } = useI18n();

const realTimeWidth = ref(0); //---------------实时宽度
const mousedownLeft = ref(0); //---------------鼠标点击距离
const wrapperWidth = ref(0); //----------------拖拽dom元素宽度
const isDragging = ref(false); //--------------是否正在拖拽
const bar = ref<HTMLDivElement | null>(null)
const wrapper = ref<HTMLDivElement | null>(null)
/*
|--------------------------------------------------------------------------
| 方法
|--------------------------------------------------------------------------
*/
//处理鼠标移动事件
const handleResizeMousemove = (e: MouseEvent) => {
  if (!bar.value || !wrapper.value) {
    return;
  }
  let moveLeft = 0;
  if (props.barLeft) {
    moveLeft = mousedownLeft.value - e.clientX;
  } else {
    moveLeft = e.clientX - mousedownLeft.value;
  }
  const wWidth = moveLeft + wrapperWidth.value;
  if (wWidth < props.min || wWidth > props.max) {
    return;
  }
  if (props.barLeft) {
    bar.value.style.left = `${0}px`;
  } else {
    bar.value.style.left = `${wWidth}px`;
  }
  wrapper.value.style.width = `${wWidth}px`;
  if (props.remember) {
    localStorage.setItem(`dragBar/${props.name}`, `${wWidth}px`);
  }
  realTimeWidth.value = wWidth;
}
//处理鼠标弹起事件
const handleResizeMouseup = () => {
  isDragging.value = false;
  document.documentElement.removeEventListener('mousemove', handleResizeMousemove);
}
//处理鼠标按下事件
const handleResizeMousedown = (e: MouseEvent) => {
  mousedownLeft.value = e.clientX;
  wrapperWidth.value = wrapper.value!.getBoundingClientRect().width;
  isDragging.value = true;
  document.documentElement.addEventListener('mousemove', handleResizeMousemove);
}
//还原宽度
const handleResetWidth = () => {
  const width = props.width ? `${props.width}px` : `${wrapper.value!.getBoundingClientRect().width}px`;
  if (props.barLeft) {
    bar.value!.style.left = `${0}`;
  } else {
    bar.value!.style.left = `${width}`;
  }
  wrapper.value!.style.width = width;
  realTimeWidth.value = parseFloat(width);
  if (props.remember) {
    localStorage.setItem(`dragBar/${props.name}`, width);
  }
}
//初始化拖拽相关事件
const initDrag = () => {
  document.documentElement.addEventListener('mouseup', handleResizeMouseup);
  const width = props.width ? `${props.width}px` : `${wrapper.value!.getBoundingClientRect().width}px`;
  if (props.remember) {
    const wrapperWidth = localStorage.getItem(`dragBar/${props.name}`) || width;
    if (props.barLeft) {
      bar.value!.style.left = `${0}`;
    } else {
      bar.value!.style.left = `${wrapperWidth}`;
    }
    wrapper.value!.style.width = `${wrapperWidth}`;
    realTimeWidth.value = parseFloat(wrapperWidth);
  } else {
    if (props.barLeft) {
      bar.value!.style.left = '0px';
    } else {
      bar.value!.style.left = `${width}`;
    }
    wrapper.value!.style.width = width;
    realTimeWidth.value = parseFloat(width);
  }
}
watch(isDragging, (dragging) => {
  if (dragging) {
    document.body.classList.add('cursor-ew-resize');
  } else {
    document.body.classList.remove('cursor-ew-resize');
  }
})
/*
|--------------------------------------------------------------------------
| 生命周期
|--------------------------------------------------------------------------
*/
onMounted(() => {
  initDrag();
})
onUnmounted(() => {
  document.documentElement.removeEventListener('mousemove', handleResizeMousemove);
  document.documentElement.removeEventListener('mouseup', handleResizeMouseup)
})

</script>

<style lang='scss' scoped>
.drag-wrap {
  position: relative;

  .indicator {
    width: 100%;
    position: absolute;
    top: 1px;
    display: flex;
    align-items: center;
    padding: 0 10px;
    z-index: var(--zIndex-drag-bar);

    .left,
    .right {
      border-bottom: 1px dashed var(--red);
      // width: 40%;
      flex: 1;
    }

    .ct {
      width: 150px;
      flex: 0 0 auto;
      text-align: center;
      color: var(--gray-600);
      position: relative;
    }
  }

  &>.bar {
    position: absolute;
    height: 100%;
    width: 6px;
    background: transparent;
    left: 300px;
    z-index: 1996;
    box-sizing: content-box;
    margin-left: -3px;
    cursor: ew-resize;
  }
  .bar.active {
    background: var(--el-color-primary);
  }
}
</style>
