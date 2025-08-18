<template>
  <div>
    <SParamsTree :drag="false" show-checkbox :data="headers" :mind-params="mindHeaderParams" no-required-checkbox></SParamsTree>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, Ref } from 'vue';
import { ApidocProperty } from '@src/types';
import mindHeaders from '../../../headers/mind-headers';
import { useApidoc } from '@/store/apidoc/apidoc';
import SParamsTree from '@/components/apidoc/params-tree/g-params-tree.vue'

const apidocStore = useApidoc()
const headers = computed(() => apidocStore.apidoc.mockInfo.responseHeaders);
const mindHeaderParams: Ref<ApidocProperty[]> = ref(mindHeaders);
</script>

<style lang='scss' scoped>

</style>
