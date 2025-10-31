<template>
  <div class="editor-wrap">
    <PreEditor ref="editorWrap" v-model="preRequest"></PreEditor>
  </div>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue'
import PreEditor from './editor/PreEditor.vue'
import { useApidoc } from '@/store/apidoc/apidocStore';
import { useHttpRedoUndo } from '@/store/redoUndo/httpRedoUndoStore'
import { useApidocTas } from '@/store/apidoc/tabsStore'
import { router } from '@/router'
import { debounce, cloneDeep } from 'lodash-es'

const apidocStore = useApidoc()
const httpRedoUndoStore = useHttpRedoUndo()
const apidocTabsStore = useApidocTas()
const projectId = router.currentRoute.value.query.id as string;
const currentSelectTab = computed(() => {
  const tabs = apidocTabsStore.tabs[projectId];
  return tabs?.find((tab) => tab.selected) || null;
});

const preRequest = computed<string>({
  get() {
    return apidocStore.apidoc?.preRequest.raw;
  },
  set(val) {
    apidocStore.changePreRequest(val);
  },
})

// 防抖的前置脚本记录函数
const debouncedRecordPreRequestOperation = debounce((oldValue: { raw: string }, newValue: { raw: string }) => {
  if (!currentSelectTab.value) return;

  httpRedoUndoStore.recordOperation({
    nodeId: currentSelectTab.value._id,
    type: "preRequestOperation",
    operationName: "修改前置脚本",
    affectedModuleName: "preRequest",
    oldValue: cloneDeep(oldValue),
    newValue: cloneDeep(newValue),
    timestamp: Date.now()
  });
}, 300);

// watch 监听 preRequest 变化
watch(() => apidocStore.apidoc?.preRequest, (newVal, oldVal) => {
  if (oldVal && newVal) {
    debouncedRecordPreRequestOperation(oldVal, newVal);
  }
}, {
  deep: true
});

</script>

<style lang='scss' scoped>
.editor-wrap {
  position: relative;
  width: 100%;
  height: calc(100vh - 320px);
}
</style>
