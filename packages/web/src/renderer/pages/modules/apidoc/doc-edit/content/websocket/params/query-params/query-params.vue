<template>
  <div class="ws-query-params">
    <div class="title">Query&nbsp;{{ t("参数") }}</div>
    <SParamsTree show-checkbox :data="queryTreeData"></SParamsTree>
  </div>
</template>

<script lang="ts" setup>
import { useWebSocket } from '@/store/websocket/websocket'
import { useRedoUndo } from '@/store/redoUndo/redoUndo'
import { useApidocTas } from '@/store/apidoc/tabs'
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import SParamsTree from '@/components/apidoc/params-tree/g-params-tree.vue'
import { useTranslation } from 'i18next-vue'
import { debounce, cloneDeep } from '@/helper'
import type { ApidocProperty } from '@src/types'

const websocketStore = useWebSocket()
const redoUndoStore = useRedoUndo()
const apidocTabsStore = useApidocTas()
const { websocket } = storeToRefs(websocketStore)
const { currentSelectTab } = storeToRefs(apidocTabsStore)
const { t } = useTranslation()

//query参数
const queryTreeData = computed(() => websocket.value.item.queryParams)

// 防抖的查询参数记录函数
const debouncedRecordQueryParamsOperation = debounce((oldValue: ApidocProperty<'string'>[], newValue: ApidocProperty<'string'>[]) => {
  if (!currentSelectTab.value) return;
  
  redoUndoStore.recordOperation({
    nodeId: currentSelectTab.value._id,
    type: "queryParamsOperation",
    operationName: "修改查询参数",
    affectedModuleName: "params",
    oldValue,
    newValue,
    timestamp: Date.now()
  });
}, 500);

// 监听查询参数变化
let previousQueryParams = cloneDeep(websocket.value.item.queryParams);
watch(() => websocket.value.item.queryParams, (newValue) => {
  const newValueClone = cloneDeep(newValue);
  debouncedRecordQueryParamsOperation(previousQueryParams, newValueClone);
  previousQueryParams = newValueClone;
}, { deep: true });

</script>

<style lang='scss' scoped>
.ws-query-params {
  .title {
    margin-left: 15px;
    font-size: 14px;
  }
}
</style>
