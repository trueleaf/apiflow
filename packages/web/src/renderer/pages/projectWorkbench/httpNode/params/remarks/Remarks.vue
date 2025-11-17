
<template>
  <div>
    <el-input
      v-model="description"
      :size="config.renderConfig.layout.size"
      :rows="15"
      type="textarea"
      show-word-limit
      name="name"
      :placeholder="t('在此处输入备注')"
      class="w-100"
      maxlength="1024"
      clearable
    >
    </el-input>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { config } from '@src/config/config';
import { computed, watch } from 'vue'
import { useApidoc } from '@/store/share/apidocStore';
import { useHttpRedoUndo } from '@/store/redoUndo/httpRedoUndoStore'
import { useApidocTas } from '@/store/share/tabsStore'
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
const { t } = useI18n()

const description = computed({
  get() {
    return apidocStore.apidoc.info.description
  },
  set(val: string) {
    apidocStore.changeDescription(val)
  }
})

// 防抖的基本信息记录函数
const debouncedRecordBasicInfoOperation = debounce((oldValue: { name: string, description: string }, newValue: { name: string, description: string }) => {
  if (!currentSelectTab.value) return;

  httpRedoUndoStore.recordOperation({
    nodeId: currentSelectTab.value._id,
    type: "basicInfoOperation",
    operationName: "修改基本信息",
    affectedModuleName: "basicInfo",
    oldValue: cloneDeep(oldValue),
    newValue: cloneDeep(newValue),
    timestamp: Date.now()
  });
}, 300);

// watch 监听 basicInfo 变化（包含 name 和 description）
watch(() => ({
  name: apidocStore.apidoc.info.name,
  description: apidocStore.apidoc.info.description
}), (newVal, oldVal) => {
  if (oldVal && newVal) {
    debouncedRecordBasicInfoOperation(oldVal, newVal);
  }
}, {
  deep: true
});
</script>
