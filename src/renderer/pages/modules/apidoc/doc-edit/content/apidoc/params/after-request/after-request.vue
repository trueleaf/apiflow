<template>
  <div class="editor-wrap">
    <after-editor v-model="afterRequest"></after-editor>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import afterEditor from './editor/after-editor.vue'
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

<style  scoped>
.editor-wrap {
  position: relative;
  width: 100%;
  height: calc(100vh - #{size(320)});
  border-bottom: 1px solid $gray-400;
  padding: 0;
}
</style>
