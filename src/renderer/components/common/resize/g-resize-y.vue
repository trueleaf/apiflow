/*
    创建者：shuxiaokai
    创建时间：2021-07-28 22:11
    模块名称：左右拖动组件
    备注：
*/
<template>
  <div ref="wrapper" :style="{'userSelect': isDragging ? 'none' : 'auto'}" class="drag-wrap-y">
    <div ref="bar" class="bar" :class="{active: isDragging}" @mousedown="handleResizeMousedown" @dblclick="handleReset"></div>
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

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    /**
         * 初始高度
         */
    height: {
      type: Number,
      default: null,
    },
    /**
         * 最小高度
         */
    min: {
      type: Number,
      default: 100,
    },
    /**
         * 最大高度
         */
    max: {
      type: Number,
      default: 400,
    },
    /**
         * 是否记忆上次位置信息
         */
    remember: {
      type: Boolean,
      default: true,
    },
    /**
         * 组件名称(必填，用于localstorage存储)
         */
    name: {
      type: String,
      required: true,
    },
  },
  emits: ['dragStart', 'dragEnd'],
  data() {
    return {
      realTimeHeight: 0, //---------------实时高度
      mousedownTop: 0, //---------------鼠标点击距离
      wrapperHeight: 0, //----------------拖拽dom元素高度
      isDragging: false, //--------------是否正在拖拽
    };
  },
  mounted() {
    this.initDrag();
  },
  unmounted() {
    document.documentElement.removeEventListener('mousemove', this.handleResizeMousemove);
    document.documentElement.removeEventListener('mouseup', this.handleResizeMouseup)
  },
  methods: {
    //初始化拖拽相关事件
    initDrag() {
      document.documentElement.addEventListener('mouseup', this.handleResizeMouseup);
      const { wrapper, bar } = this.$refs;
      const height = this.height ? `${this.height}px` : `${(this.$refs.wrapper as HTMLElement).getBoundingClientRect().height}px`;
      if (this.remember) {
        const wrapperHeight = localStorage.getItem(`dragBar/${this.name}`) || height;
        (bar as HTMLElement).style.top = '-3px';
        (wrapper as HTMLElement).style.height = `${wrapperHeight}`;
        this.realTimeHeight = parseFloat(wrapperHeight);
      } else {
        (bar as HTMLElement).style.top = '-3px';
        (wrapper as HTMLElement).style.height = height;
        this.realTimeHeight = parseFloat(height);
      }
    },
    //处理鼠标弹起事件
    handleResizeMouseup() {
      this.isDragging = false;
      document.documentElement.removeEventListener('mousemove', this.handleResizeMousemove);
      emits('dragEnd');
    },
    //处理鼠标按下事件
    handleResizeMousedown(e: MouseEvent) {
      this.mousedownTop = e.clientY;
      this.wrapperHeight = (this.$refs.wrapper as HTMLElement).getBoundingClientRect().height;
      this.isDragging = true;
      document.documentElement.addEventListener('mousemove', this.handleResizeMousemove);
      emits('dragStart')
    },
    //处理鼠标移动事件
    handleResizeMousemove(e: MouseEvent) {
      const { bar, wrapper } = this.$refs;
      let moveTop = 0;
      moveTop = this.mousedownTop - e.clientY;
      const wrapperHeight = moveTop + this.wrapperHeight;
      if (wrapperHeight < this.min || wrapperHeight > this.max) {
        return;
      }
      (bar as HTMLElement).style.top = '-3px';
      (wrapper as HTMLElement).style.height = `${moveTop + this.wrapperHeight}px`;
      if (this.remember) {
        localStorage.setItem(`dragBar/${this.name}`, `${moveTop + this.wrapperHeight}px`);
      }
      this.realTimeHeight = moveTop + this.wrapperHeight;
    },
    //还原高度
    handleReset() {
      const { bar, wrapper } = this.$refs;
      const height = this.height ? `${this.height}px` : `${(wrapper as HTMLElement).getBoundingClientRect().height}px`;
      (bar as HTMLElement).style.height = '-3px';
      (wrapper as HTMLElement).style.height = height;
      this.realTimeHeight = parseFloat(height);
      if (this.remember) {
        localStorage.setItem(`dragBar/${this.name}`, height);
      }
    },
  },
})
</script>

<style lang="scss" scoped>
.drag-wrap-y {
    position: relative;
    .indicator {
        width: 100%;
        position: absolute;
        top: 1px;
        z-index: 1;
        display: flex;
        align-items: center;
        padding: 0 size(10);
        .top, .bottom {
            border-bottom: 1px dashed $red;
            flex: 1;
        }
        .ct {
            width: size(150);
            flex: 0 0 auto;
            text-align: center;
            color: $gray-600;
        }
    }
    &>.bar {
        position: absolute;
        height: size(6);
        width: 100%;
        background: transparent;
        z-index: $zIndex-drag-bar;
        box-sizing: content-box;
        cursor: ns-resize;
        left: 0;
        &.active {
            background: $theme-color;
        }
    }
}
</style>
