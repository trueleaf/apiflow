
<template>
  <div>
    <MarkdownEditor
      ref="editorRef"
      :model-value="description"
      :placeholder="t('在此处输入备注')"
      :manual-undo-redo="true"
      class="w-100 h-100"
      @update:model-value="handleDescriptionChange"
      @undo="handleEditorUndo"
      @redo="handleEditorRedo"
    />
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'
import { useHttpNode } from '@/store/httpNode/httpNodeStore';
import { useHttpRedoUndo } from '@/store/redoUndo/httpRedoUndoStore'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { router } from '@/router'
import { cloneDeep } from 'lodash-es'
import MarkdownEditor from '@/components/ui/cleanDesign/markdownEditor/MarkdownEditor.vue'

const httpNodeStore = useHttpNode()
const httpRedoUndoStore = useHttpRedoUndo()
const projectNavStore = useProjectNav()
const projectId = router.currentRoute.value.query.id as string;
const currentSelectNav = computed(() => {
  const navs = projectNavStore.navs[projectId];
  return navs?.find((nav) => nav.selected) || null;
});
const { t } = useI18n()

const editorRef = ref<{
  getCursorPosition?: () => { anchor: number, head: number } | null,
  setCursorPosition?: (position: { anchor: number, head: number }) => void,
} | null>(null)

const description = computed<string>(() => httpNodeStore.apidoc.info.description)
//处理备注变化
const handleDescriptionChange = (newValue: string) => {
  const oldValue = { description: httpNodeStore.apidoc.info.description };
  httpNodeStore.changeDescription(newValue);
  const newVal = { description: newValue };
  recordRemarksOperation(oldValue, newVal);
}
//处理编辑器undo
const handleEditorUndo = () => {
  const nodeId = currentSelectNav.value?._id;
  if (nodeId) {
    const result = httpRedoUndoStore.httpUndo(nodeId);
    if (result.code === 0 && result.operation?.type === 'remarksOperation') {
      if (result.operation.cursorPosition) {
        editorRef.value?.setCursorPosition?.(result.operation.cursorPosition);
      }
    }
  }
}
//处理编辑器redo
const handleEditorRedo = () => {
  const nodeId = currentSelectNav.value?._id;
  if (nodeId) {
    const result = httpRedoUndoStore.httpRedo(nodeId);
    if (result.code === 0 && result.operation?.type === 'remarksOperation') {
      if (result.operation.cursorPosition) {
        editorRef.value?.setCursorPosition?.(result.operation.cursorPosition);
      }
    }
  }
}
//备注记录函数
const recordRemarksOperation = (oldValue: { description: string }, newValue: { description: string }) => {
  if (!currentSelectNav.value || oldValue.description === newValue.description) return;

  const cursorPosition = editorRef.value?.getCursorPosition?.() || undefined;

  httpRedoUndoStore.recordOperation({
    nodeId: currentSelectNav.value._id,
    type: "remarksOperation",
    operationName: "修改备注",
    affectedModuleName: "remarks",
    oldValue: cloneDeep(oldValue),
    newValue: cloneDeep(newValue),
    cursorPosition,
    timestamp: Date.now()
  });
};
</script>

<style lang="scss" scoped>
.w-100 {
  width: 100%;
}
</style>
