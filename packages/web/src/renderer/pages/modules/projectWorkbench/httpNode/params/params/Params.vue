<template>
  <div class="query-path-params">
    <div class="title">Query&nbsp;{{ t("参数") }}</div>
    <SParamsTree show-checkbox :data="queryTreeData"></SParamsTree>
    <div v-show="hasPathParams" class="title">Path&nbsp;{{ t("参数") }}</div>
    <SParamsTree v-show="hasPathParams" disable-add disable-delete :data="pathTreeData"></SParamsTree>
  </div>
</template>

<script lang="ts" setup>
import { useApidoc } from '@/store/apidoc/apidoc';
import { computed, watch } from 'vue'
import SParamsTree from '@/components/apidoc/paramsTree/GParamsTree.vue'
import { useI18n } from 'vue-i18n'
import { useHttpRedoUndo } from '@/store/redoUndo/httpRedoUndoStore'
import { useApidocTas } from '@/store/apidoc/tabs'
import { router } from '@/router'
import { debounce, cloneDeep } from 'lodash-es'
import type { ApidocProperty } from '@src/types'

const apidocStore = useApidoc()
const httpRedoUndoStore = useHttpRedoUndo()
const apidocTabsStore = useApidocTas()
const projectId = router.currentRoute.value.query.id as string;
const currentSelectTab = computed(() => {
  const tabs = apidocTabsStore.tabs[projectId];
  return tabs?.find((tab) => tab.selected) || null;
});
//path参数
const { t } = useI18n()

const pathTreeData = computed(() => apidocStore.apidoc.item.paths);

//query参数
const queryTreeData = computed(() => apidocStore.apidoc.item.queryParams)
//是否存在path参数
const hasPathParams = computed(() => {
  const { paths } = apidocStore.apidoc.item;
  const hasPathsParams = paths.some((data) => data.key);
  return hasPathsParams;
})

// 防抖的查询参数记录函数
const debouncedRecordQueryParamsOperation = debounce((oldValue: ApidocProperty<'string'>[], newValue: ApidocProperty<'string'>[]) => {
  if (!currentSelectTab.value) return;

  httpRedoUndoStore.recordOperation({
    nodeId: currentSelectTab.value._id,
    type: "queryParamsOperation",
    operationName: "修改查询参数",
    affectedModuleName: "queryParams",
    oldValue: cloneDeep(oldValue),
    newValue: cloneDeep(newValue),
    timestamp: Date.now()
  });
}, 800);

// 防抖的路径参数记录函数
const debouncedRecordPathsOperation = debounce((oldValue: ApidocProperty<'string'>[], newValue: ApidocProperty<'string'>[]) => {
  if (!currentSelectTab.value) return;

  httpRedoUndoStore.recordOperation({
    nodeId: currentSelectTab.value._id,
    type: "pathsOperation",
    operationName: "修改路径参数",
    affectedModuleName: "paths",
    oldValue: cloneDeep(oldValue),
    newValue: cloneDeep(newValue),
    timestamp: Date.now()
  });
}, 800);

// watch 监听 queryParams 变化
watch(() => queryTreeData.value, (newVal, oldVal) => {
  if (oldVal && newVal) {
    debouncedRecordQueryParamsOperation(oldVal, newVal);
  }
}, {
  deep: true
});

// watch 监听 paths 变化
watch(() => pathTreeData.value, (newVal, oldVal) => {
  if (oldVal && newVal) {
    debouncedRecordPathsOperation(oldVal, newVal);
  }
}, {
  deep: true
});

</script>
<style lang='scss' scoped>
.query-path-params {
  .title {
    margin-left: 15px;
    font-size: 14px;
  }
}
</style>
