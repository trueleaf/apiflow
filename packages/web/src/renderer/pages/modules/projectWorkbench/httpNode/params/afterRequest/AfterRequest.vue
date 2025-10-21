<template>
  <div class="editor-wrap">
    <AfterEditor v-model="afterRequest"></AfterEditor>
  </div>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue'
import AfterEditor from './editor/AfterEditor.vue'
import { useApidoc } from '@/store/apidoc/apidocStore';
import { useHttpRedoUndo } from '@/store/redoUndo/httpRedoUndoStore'
import { useApidocTas } from '@/store/apidoc/tabsStore'
import { router } from '@/router'
import { debounce, cloneDeep } from 'lodash-es'

const apidocStore = useApidoc();
const httpRedoUndoStore = useHttpRedoUndo()
const apidocTabsStore = useApidocTas()
const projectId = router.currentRoute.value.query.id as string;
const currentSelectTab = computed(() => {
  const tabs = apidocTabsStore.tabs[projectId];
  return tabs?.find((tab) => tab.selected) || null;
});

const afterRequest = computed<string>({
  get() {
    return apidocStore.apidoc?.afterRequest.raw;
  },
  set(val) {
    apidocStore.changeAfterRequest(val);
  },
})

// 防抖的后置脚本记录函数
const debouncedRecordAfterRequestOperation = debounce((oldValue: { raw: string }, newValue: { raw: string }) => {
  if (!currentSelectTab.value) return;

  httpRedoUndoStore.recordOperation({
    nodeId: currentSelectTab.value._id,
    type: "afterRequestOperation",
    operationName: "修改后置脚本",
    affectedModuleName: "afterRequest",
    oldValue: cloneDeep(oldValue),
    newValue: cloneDeep(newValue),
    timestamp: Date.now()
  });
}, 300);

// watch 监听 afterRequest 变化
watch(() => apidocStore.apidoc?.afterRequest, (newVal, oldVal) => {
  if (oldVal && newVal) {
    debouncedRecordAfterRequestOperation(oldVal, newVal);
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
  border-bottom: 1px solid var(--gray-400);
  padding: 0;
}
</style>
