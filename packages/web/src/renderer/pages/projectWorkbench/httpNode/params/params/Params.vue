<template>
  <div class="query-path-params">
    <div class="title">Query&nbsp;{{ t("参数") }}</div>
    <SParamsTree show-checkbox :data="queryTreeData" edit-mode="multiline" @change="handleQueryParamsChange"></SParamsTree>
    <div v-show="hasPathParams" class="title">Path&nbsp;{{ t("参数") }}</div>
    <SParamsTree v-show="hasPathParams" :data="pathTreeData" @change="handlePathParamsChange"></SParamsTree>
  </div>
</template>

<script lang="ts" setup>
import { useHttpNode } from '@/store/apidoc/httpNodeStore';
import { computed } from 'vue'
import SParamsTree from '@/components/apidoc/paramsTree/ClParamsTree.vue'
import { useI18n } from 'vue-i18n'
import { useHttpRedoUndo } from '@/store/redoUndo/httpRedoUndoStore'
import { useApidocTas } from '@/store/apidoc/tabsStore'
import { router } from '@/router'
import { cloneDeep } from 'lodash-es'
import type { ApidocProperty } from '@src/types'

const httpNodeStore = useHttpNode()
const httpRedoUndoStore = useHttpRedoUndo()
const apidocTabsStore = useApidocTas()
const projectId = router.currentRoute.value.query.id as string;
const currentSelectTab = computed(() => {
  const tabs = apidocTabsStore.tabs[projectId];
  return tabs?.find((tab) => tab.selected) || null;
});
const { t } = useI18n()
const pathTreeData = computed(() => JSON.parse(JSON.stringify(httpNodeStore.apidoc.item.paths)));
const queryTreeData = computed(() => JSON.parse(JSON.stringify(httpNodeStore.apidoc.item.queryParams)));
//是否存在path参数
const hasPathParams = computed(() => {
  const { paths } = httpNodeStore.apidoc.item;
  const hasPathsParams = paths.some((data) => data.key);
  return hasPathsParams;
})

// 处理 Query 参数变化
const handleQueryParamsChange = (newData: ApidocProperty<'string' | 'file'>[]) => {
  const oldValue = cloneDeep(httpNodeStore.apidoc.item.queryParams);
  httpNodeStore.apidoc.item.queryParams = newData as ApidocProperty<'string'>[];
  if (!currentSelectTab.value) return;
  httpRedoUndoStore.recordOperation({
    nodeId: currentSelectTab.value._id,
    type: "queryParamsOperation",
    operationName: "修改查询参数",
    affectedModuleName: "queryParams",
    oldValue: cloneDeep(oldValue),
    newValue: cloneDeep(newData as ApidocProperty<'string'>[]),
    timestamp: Date.now()
  });
};

// 处理 Path 参数变化
const handlePathParamsChange = (newData: ApidocProperty<'string' | 'file'>[]) => {
  const oldValue = cloneDeep(httpNodeStore.apidoc.item.paths);
  httpNodeStore.apidoc.item.paths = newData as ApidocProperty<'string'>[];
  if (!currentSelectTab.value) return;
  httpRedoUndoStore.recordOperation({
    nodeId: currentSelectTab.value._id,
    type: "pathsOperation",
    operationName: "修改路径参数",
    affectedModuleName: "paths",
    oldValue: cloneDeep(oldValue),
    newValue: cloneDeep(newData as ApidocProperty<'string'>[]),
    timestamp: Date.now()
  });
};

</script>
<style lang='scss' scoped>
.query-path-params {
  .title {
    margin-left: 15px;
    font-size: 14px;
  }
}
</style>
