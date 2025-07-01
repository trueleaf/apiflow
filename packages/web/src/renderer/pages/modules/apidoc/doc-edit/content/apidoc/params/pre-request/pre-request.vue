<template>
  <div class="editor-wrap">
    <pre-editor ref="editorWrap" v-model="preRequest"></pre-editor>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import preEditor from './editor/pre-editor.vue'
import { useApidoc } from '@/store/apidoc/apidoc';

const apidocStore = useApidoc()
const preRequest = computed<string>({
  get() {
    return apidocStore.apidoc?.preRequest.raw;
  },
  set(val) {
    apidocStore.changePreRequest(val);
  },
})

</script>

<style lang='scss' scoped>
.editor-wrap {
  position: relative;
  width: 100%;
  height: calc(100vh - 320px);
}
</style>
