<template>
  <div class="s-content">
    <!-- <Header /> -->
    <div class="page-wrap">
      <router-view></router-view>
    </div>
  </div>
</template>

<script lang="ts" setup>
// import Header from './header.vue'
</script>

<style lang='scss' scoped>
.s-content {
  width: 100%;
  height: 100%;

  .page-wrap {
    overflow-y: auto;
    height: 100vh;
  }
}
</style>
