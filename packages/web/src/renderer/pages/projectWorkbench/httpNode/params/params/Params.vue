<template>
  <div class="query-path-params">
    <div class="title">
      <span>Query&nbsp;{{ t("参数") }}</span>
      <span
        class="mode-toggle-icon"
        role="button"
        tabindex="0"
        :title="isQueryMultiline ? t('返回表格') : t('多行编辑')"
        :class="{ active: isQueryMultiline }"
        @click="toggleQueryParamsMode"
        @keydown.enter.prevent="toggleQueryParamsMode"
        @keydown.space.prevent="toggleQueryParamsMode"
      >
        <el-icon size="13" class="toggle-icon">
          <Switch />
        </el-icon>
      </span>
    </div>
    <SParamsTree
      ref="queryParamsTreeRef"
      show-checkbox
      :data="queryTreeData"
      :edit-mode="isQueryMultiline ? 'multiline' : 'table'"
      @change="handleQueryParamsChange"
    ></SParamsTree>
    <div v-show="hasPathParams" class="title">Path&nbsp;{{ t("参数") }}</div>
    <SParamsTree v-show="hasPathParams" :data="pathTreeData" disable-key-edit @change="handlePathParamsChange"></SParamsTree>
  </div>
</template>

<script lang="ts" setup>
import { useHttpNode } from '@/store/httpNode/httpNodeStore';
import { computed, ref, watch } from 'vue'
import SParamsTree from '@/components/apidoc/paramsTree/ClParamsTree.vue'
import { useI18n } from 'vue-i18n'
import { useHttpRedoUndo } from '@/store/redoUndo/httpRedoUndoStore'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { router } from '@/router'
import { cloneDeep } from 'lodash-es'
import type { ApidocProperty } from '@src/types'
import { Switch } from '@element-plus/icons-vue'

const httpNodeStore = useHttpNode()
const httpRedoUndoStore = useHttpRedoUndo()
const projectNavStore = useProjectNav()
const projectId = router.currentRoute.value.query.id as string;
const currentSelectNav = computed(() => {
  const navs = projectNavStore.navs[projectId];
  return navs?.find((nav) => nav.selected) || null;
});
const { t } = useI18n()
type ParamsTreeInstance = InstanceType<typeof SParamsTree> & {
  onMultilineApplied?: (handler: () => void) => void
  onMultilineCancelled?: (handler: () => void) => void
}
const queryParamsTreeRef = ref<ParamsTreeInstance | null>(null)
const pathTreeData = computed(() => JSON.parse(JSON.stringify(httpNodeStore.httpNodeInfo.item.paths)));
const queryTreeData = computed(() => JSON.parse(JSON.stringify(httpNodeStore.httpNodeInfo.item.queryParams)));
const isQueryMultiline = ref(false)
//是否存在path参数
const hasPathParams = computed(() => {
  const { paths } = httpNodeStore.httpNodeInfo.item;
  const hasPathsParams = paths.some((data) => data.key);
  return hasPathsParams;
})
const toggleQueryParamsMode = () => {
  isQueryMultiline.value = !isQueryMultiline.value
}
const handleQueryMultilineApplied = () => {
  isQueryMultiline.value = false
}
const handleQueryMultilineCancelled = () => {
  isQueryMultiline.value = false
}
watch(queryParamsTreeRef, (instance) => {
  if (!instance?.onMultilineApplied) return
  instance.onMultilineApplied(handleQueryMultilineApplied)
  if (!instance?.onMultilineCancelled) return
  instance.onMultilineCancelled(handleQueryMultilineCancelled)
})

// 处理 Query 参数变化
const handleQueryParamsChange = (newData: ApidocProperty<'string' | 'file'>[]) => {
  const oldValue = cloneDeep(httpNodeStore.httpNodeInfo.item.queryParams);
  httpNodeStore.httpNodeInfo.item.queryParams = newData as ApidocProperty<'string'>[];
  if (!currentSelectNav.value) return;
  httpRedoUndoStore.recordOperation({
    nodeId: currentSelectNav.value._id,
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
  const oldValue = cloneDeep(httpNodeStore.httpNodeInfo.item.paths);
  httpNodeStore.httpNodeInfo.item.paths = newData as ApidocProperty<'string'>[];
  if (!currentSelectNav.value) return;
  httpRedoUndoStore.recordOperation({
    nodeId: currentSelectNav.value._id,
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
    display: flex;
    align-items: center;
    gap: 12px;
  }
}
.mode-toggle-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-1);
  transition: border-color 0.2s, color 0.2s;

  &.active {
    border-color: var(--theme-color);
    color: var(--theme-color);
  }

  &:hover {
    border-color: var(--theme-color);
    color: var(--theme-color);
  }

  .toggle-icon {
    margin-top: 1px;
    color: var(--color-text-2);
    width: 14px;
    height: 14px;
  }
}
</style>
