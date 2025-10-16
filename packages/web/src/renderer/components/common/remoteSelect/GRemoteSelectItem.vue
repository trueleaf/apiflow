<template>
  <div class="remote-select-item">
    <slot />
  </div>
</template>

<script lang="ts" setup>

</script>

<style lang='scss' scoped>
.remote-select-item {
  height: 38px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  cursor: pointer;

  &:hover {
    background: #eaf3fe;
  }
}
</style>
