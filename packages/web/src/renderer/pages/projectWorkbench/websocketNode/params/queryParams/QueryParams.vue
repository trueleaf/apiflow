<template>
  <div class="ws-query-params">
    <div class="title">Query&nbsp;{{ t("参数") }}</div>
    <SParamsTree show-checkbox :data="websocket.item.queryParams" @change="handleChange"></SParamsTree>
  </div>
</template>

<script lang="ts" setup>
import { useWebSocket } from '@/store/websocketNode/websocketNodeStore'
import { useWsRedoUndo } from '@/store/redoUndo/wsRedoUndoStore'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { storeToRefs } from 'pinia'
import SParamsTree from '@/components/apidoc/paramsTree/ClParamsTree.vue'
import { useI18n } from 'vue-i18n'
import { cloneDeep } from "lodash-es"
import type { ApidocProperty } from '@src/types'

const websocketStore = useWebSocket()
const redoUndoStore = useWsRedoUndo()
const projectNavStore = useProjectNav()
const { websocket } = storeToRefs(websocketStore)
const { currentSelectNav } = storeToRefs(projectNavStore)
const { t } = useI18n()
// 查询参数记录函数
const recordQueryParamsOperation = (oldValue: ApidocProperty<'string'>[], newValue: ApidocProperty<'string'>[]) => {
  if (!currentSelectNav.value) return;
  redoUndoStore.recordOperation({
    nodeId: currentSelectNav.value._id,
    type: "queryParamsOperation",
    operationName: "修改查询参数",
    affectedModuleName: "params",
    oldValue: cloneDeep(oldValue),
    newValue: cloneDeep(newValue),
    timestamp: Date.now()
  });
};
const handleChange = (newData: ApidocProperty<'string' | 'file'>[]) => {
  const oldValue = cloneDeep(websocket.value.item.queryParams);
  websocketStore.changeQueryParams(newData as ApidocProperty<'string'>[]);
  recordQueryParamsOperation(oldValue, newData as ApidocProperty<'string'>[]);
};
</script>

<style lang='scss' scoped>
.ws-query-params {
  .title {
    margin-left: 15px;
    font-size: 14px;
  }
}
</style>
