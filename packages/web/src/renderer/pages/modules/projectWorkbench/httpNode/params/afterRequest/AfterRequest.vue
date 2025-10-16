<template>
  <div class="editor-wrap">
    <after-editor v-model="afterRequest"></after-editor>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import afterEditor from './editor/AfterEditor.vue'
import { useApidoc } from '@/store/apidoc/apidoc';

const apidocStore = useApidoc();
const afterRequest = computed<string>({
  get() {
    return apidocStore.apidoc?.afterRequest.raw;
  },
  set(val) {
    apidocStore.changeAfterRequest(val);
  },
})

</script>

<style lang='scss' scoped>
.editor-wrap {
  position: relative;
  width: 100%;
  height: calc(100vh - 320px);
  border-bottom: 1px solid var(--gray-400);
  padding: 0;
}
</style>
