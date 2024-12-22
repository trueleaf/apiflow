<template>
  <div class="remote-select-item">
    <slot />
  </div>
</template>

<script lang="ts" setup>

</script>

<style  scoped>
.remote-select-item {
  height: size(38);
  display: flex;
  align-items: center;
  padding: 0 size(20);
  cursor: pointer;

  &:hover {
    background: mix($white, $theme-color, 90%);
  }
}
</style>
