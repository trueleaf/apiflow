
<template>
  <div>
    <MarkdownEditor
      ref="editorRef"
      :model-value="description"
      :placeholder="t('在此处输入备注')"
      :manual-undo-redo="true"
      :min-height="360"
      class="w-100"
      @update:model-value="handleDescriptionChange"
      @undo="handleEditorUndo"
      @redo="handleEditorRedo"
    />
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'
import { useHttpNode } from '@/store/apidoc/httpNodeStore';
import { useHttpRedoUndo } from '@/store/redoUndo/httpRedoUndoStore'
import { useApidocTas } from '@/store/apidoc/tabsStore'
import { router } from '@/router'
import { cloneDeep } from 'lodash-es'
import MarkdownEditor from '@/components/ui/cleanDesign/markdownEditor/MarkdownEditor.vue'

const httpNodeStore = useHttpNode()
const httpRedoUndoStore = useHttpRedoUndo()
const apidocTabsStore = useApidocTas()
const projectId = router.currentRoute.value.query.id as string;
const currentSelectTab = computed(() => {
  const tabs = apidocTabsStore.tabs[projectId];
  return tabs?.find((tab) => tab.selected) || null;
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
  const nodeId = currentSelectTab.value?._id;
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
  const nodeId = currentSelectTab.value?._id;
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
  if (!currentSelectTab.value || oldValue.description === newValue.description) return;

  const cursorPosition = editorRef.value?.getCursorPosition?.() || undefined;

  httpRedoUndoStore.recordOperation({
    nodeId: currentSelectTab.value._id,
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
