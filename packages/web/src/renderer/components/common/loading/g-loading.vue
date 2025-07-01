<template>
  <div v-loading="loading" element-loading-background="rgba(255, 255, 255, 0.9)" class="s-loading">
    <slot />
    <div v-show="loading" class="loading-text">{{ loadingText }}</div>
  </div>
</template>

<script lang="ts" setup>
import { randomTip } from '@/helper/index'
import { ref, watch } from 'vue';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  }
})
const loadingText = ref('');

watch(() => props.loading, () => {
  loadingText.value = randomTip()
}, {
  immediate: true
})
</script>

<style lang='scss' scoped>
.s-loading {
  .loading-text {
    position: absolute;
    top: 60%;
    z-index: var(--zIndex-loading-text);
    font-size: 16px;
    color: var(--theme-color);
    width: 100%;
    padding: 0 1em;
    text-align: center;
  }
}
</style>
