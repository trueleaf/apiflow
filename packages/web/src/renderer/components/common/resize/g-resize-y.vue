<template>
  <div ref="wrapper" :style="{ 'userSelect': isDragging ? 'none' : 'auto' }" class="drag-wrap-y">
    <div ref="bar" class="bar" :class="{ active: isDragging }" @mousedown="handleResizeMousedown" @dblclick="handleReset">
    </div>
    <div v-if="isDragging" class="indicator">
      <div class="top"></div>
      <div class="ct">
        <div>{{ realTimeHeight }}px({{ t("双击还原") }})</div>
        <!-- <div></div> -->
      </div>
      <div class="bottom"></div>
    </div>
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useTranslation } from 'i18next-vue'

const props = defineProps({
  height: {
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
})

const emits = defineEmits(['dragStart', 'dragEnd'])
const { t } = useTranslation()
const realTimeHeight = ref(0); //---------------实时高度
const mousedownTop = ref(0); //---------------鼠标点击距离
const wrapperHeight = ref(0); //----------------拖拽dom元素高度
const isDragging = ref(false); //--------------是否正在拖拽
const bar = ref<HTMLElement>(); //-------------------拖拽元素
const wrapper = ref<HTMLElement>(); //-----------------拖拽容器
/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
//处理鼠标移动事件
const handleResizeMousemove = (e: MouseEvent) => {
  let moveTop = 0;
  moveTop = mousedownTop.value - e.clientY;
  const height = moveTop + wrapperHeight.value;
  if (height < props.min || height > props.max) {
    return;
  }
  bar.value!.style.top = '-3px';
  wrapper.value!.style.height = `${moveTop + wrapperHeight.value}px`;
  if (props.remember) {
    localStorage.setItem(`dragBar/${name}`, `${moveTop + wrapperHeight.value}px`);
  }
  realTimeHeight.value = moveTop + wrapperHeight.value;
}
//处理鼠标弹起事件
const handleResizeMouseup = () => {
  isDragging.value = false;
  document.documentElement.removeEventListener('mousemove', handleResizeMousemove);
  emits('dragEnd');
}
//处理鼠标按下事件
const handleResizeMousedown = (e: MouseEvent) => {
  mousedownTop.value = e.clientY;
  wrapperHeight.value = wrapper.value!.getBoundingClientRect().height;
  isDragging.value = true;
  document.documentElement.addEventListener('mousemove', handleResizeMousemove);
  emits('dragStart')
}

//还原高度
const handleReset = () => {
  const height = props.height ? `${props.height}px` : `${wrapper.value?.getBoundingClientRect().height}px`;
  bar.value!.style.height = '-3px';
  wrapper.value!.style.height = height;
  realTimeHeight.value = parseFloat(height);
  if (props.remember) {
    localStorage.setItem(`dragBar/${props.name}`, height);
  }
}
//初始化拖拽相关事件
const initDrag = () => {
  document.documentElement.addEventListener('mouseup', handleResizeMouseup);
  const height = props.height ? `${props.height}px` : `${wrapper.value?.getBoundingClientRect().height}px`;
  if (props.remember) {
    const wrapperHeight = localStorage.getItem(`dragBar/${props.name}`) || height;
    bar.value!.style.top = '-3px';
    wrapper.value!.style.height = `${wrapperHeight}`;
    realTimeHeight.value = parseFloat(wrapperHeight);
  } else {
    bar.value!.style.top = '-3px';
    wrapper.value!.style.height = height;
    realTimeHeight.value = parseFloat(height);
  }
}
onMounted(() => {
  initDrag();
})
onUnmounted(() => {
  document.documentElement.removeEventListener('mousemove', handleResizeMousemove);
  document.documentElement.removeEventListener('mouseup', handleResizeMouseup)
})
</script>

<style lang='scss' scoped>
.drag-wrap-y {
  position: relative;

  .indicator {
    width: 100%;
    position: absolute;
    top: 1px;
    z-index: 1;
    display: flex;
    align-items: center;
    padding: 0 10px;

    .top,
    .bottom {
      border-bottom: 1px dashed var(--red);
      flex: 1;
    }

    .ct {
      width: 150px;
      flex: 0 0 auto;
      text-align: center;
      color: var(--gray-600);
    }
  }

  &>.bar {
    position: absolute;
    height: 6px;
    width: 100%;
    background: transparent;
    z-index: var(--zIndex-drag-bar);
    box-sizing: content-box;
    cursor: ns-resize;
    left: 0;

    &.active {
      background: var(--theme-color);
    }
  }
}
</style>
