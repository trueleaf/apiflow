<template>
  <div>
    <SParamsTree :drag="false" show-checkbox :data="headers" no-required-checkbox></SParamsTree>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useApidoc } from '@/store/apidoc/apidoc';
import SParamsTree from '@/components/apidoc/params-tree/g-params-tree.vue'

const apidocStore = useApidoc()
const headers = computed(() => apidocStore.apidoc.mockInfo.responseHeaders);
</script>

<style lang='scss' scoped>

</style>
