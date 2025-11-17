<template>
  <div v-loading="loading" element-loading-background="var(--bg-white-9)" class="s-loading">
    <slot />
    <div v-show="loading" class="loading-text">{{ loadingText }}</div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

type LoadingProps = {
  loading?: boolean
}

withDefaults(defineProps<LoadingProps>(), {
  loading: false
})
const loadingText = ref('')
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
