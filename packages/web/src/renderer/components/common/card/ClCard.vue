<template>
  <div class="s-card">
    <header v-if="slots.operation || title">
      <div class="title">{{ title }}</div>
      <div>
        <slot name="operation"></slot>
      </div>
    </header>
    <section ref="content" class="content">
      <slot></slot>
    </section>
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
})
</script>

<style lang='scss' scoped>
.s-card {
  width: 100%;
  border: 1px solid var(--gray-300);
  background: var(--white);
  border-radius: var(--border-radius-base);
  display: flex;
  flex-direction: column;
  &>header {
    font-size: 16px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--gray-300);
    color: var(--theme-color);
    padding: 0 1em;
  }
  .content {
    position: relative;
    overflow-y: auto;
    padding: 5px 10px;
  }
}
</style>
