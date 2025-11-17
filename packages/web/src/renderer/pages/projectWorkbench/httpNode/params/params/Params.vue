<template>
  <div class="query-path-params">
    <div class="title">Query&nbsp;{{ t("参数") }}</div>
    <SParamsTree show-checkbox :data="queryTreeData" @change="handleQueryParamsChange"></SParamsTree>
    <div v-show="hasPathParams" class="title">Path&nbsp;{{ t("参数") }}</div>
    <SParamsTree v-show="hasPathParams" :data="pathTreeData" @change="handlePathParamsChange"></SParamsTree>
  </div>
</template>

<script lang="ts" setup>
import { useApidoc } from '@/store/share/apidocStore';
import { computed } from 'vue'
import SParamsTree from '@/components/apidoc/paramsTree/ClParamsTree.vue'
import { useI18n } from 'vue-i18n'
import { useHttpRedoUndo } from '@/store/redoUndo/httpRedoUndoStore'
import { useApidocTas } from '@/store/share/tabsStore'
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

// 处理 Query 参数变化
const handleQueryParamsChange = (newData: ApidocProperty<'string' | 'file'>[]) => {
  const oldValue = cloneDeep(apidocStore.apidoc.item.queryParams);
  apidocStore.apidoc.item.queryParams = newData as ApidocProperty<'string'>[];
  
  debouncedRecordQueryParamsOperation(oldValue, newData as ApidocProperty<'string'>[]);
};

// 处理 Path 参数变化
const handlePathParamsChange = (newData: ApidocProperty<'string' | 'file'>[]) => {
  const oldValue = cloneDeep(apidocStore.apidoc.item.paths);
  apidocStore.apidoc.item.paths = newData as ApidocProperty<'string'>[];
  
  debouncedRecordPathsOperation(oldValue, newData as ApidocProperty<'string'>[]);
};

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
}, 300);

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
}, 300);

</script>
<style lang='scss' scoped>
.query-path-params {
  .title {
    margin-left: 15px;
    font-size: 14px;
  }
}
</style>
