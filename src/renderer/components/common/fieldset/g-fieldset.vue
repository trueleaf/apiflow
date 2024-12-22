<template>
  <div class="s-fieldset">
    <div class="legend">
      <slot v-if="slots.title" name="title"></slot>
      <span v-else>{{ title }}</span>
    </div>
    <div class="content" :style="{ height: height, 'maxHeight': maxHeight }">
      <slot></slot>
    </div>
    <div class="operation">
      <slot name="operation"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useSlots } from 'vue';


const slots = useSlots()
defineProps({
  title: {
    type: String,
    default: '',
  },
  height: {
    type: String,
    default: null,
  },
  maxHeight: {
    type: String,
    default: null,
  },
})

</script>

<style  scoped>
.s-fieldset {
  display: block;
  min-height: size(30);
  position: relative;
  border: 1px solid $gray-500;
  margin-top: 20px;
  background: inherit;

  &>.legend {
    position: absolute;
    height: size(30);
    left: 20px;
    top: -10px;
    color: $gray-700;
    background: #fff;
    padding: 0 20px;
    font-size: size(18);
    font-weight: bolder;
    z-index: $zIndex-fieldset;
  }

  &>.content {
    padding: 10px;
    width: 100%;
    padding-top: size(25);
    overflow-y: auto;
  }
}
</style>
