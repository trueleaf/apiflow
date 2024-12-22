<template>
  <div class="s-card" :class="{ shadow: shadow }" :style="{ width: width }">
    <header v-if="slots.operation || title">
      <div class="title">{{ title }}</div>
      <div>
        <slot name="operation"></slot>
      </div>
    </header>
    <!-- 搜索 -->
    <section ref="content" class="content" :style="{ padding: padding }">
      <slot></slot>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { useSlots } from 'vue';

const slots = useSlots()
defineProps({
  title: { // card头部标题
    type: String,
    default: '',
  },
  width: { //宽度
    type: String,
    default: '100%',
  },
  shadow: { //是否显示阴影
    type: Boolean,
    default: false,
  },
  padding: { //内容区域内边距
    type: String,
    default: '5px 10px',
  },
})

</script>

<style lang='scss' scoped>
.s-card {
  width: 100%;
  border: 1px solid $gray-300;
  background: $white;
  border-radius: $border-radius-base;
  display: flex;
  flex-direction: column;

  &>header {
    font-size: fz(16);
    height: size(35);
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid $gray-300;
    color: $theme-color;
    padding: 0 1em;

    &.active {
      cursor: pointer;
      transition: background-color 0.3s;

      &:hover {
        background: $gray-100;
      }
    }
  }

  // 内容区域
  .content {
    position: relative;
    overflow-y: auto;

    &.active {
      padding: 0rem !important;
      height: 0px !important;
    }
  }
}
</style>
