<template>
  <div class="doc-view">
    <Banner></Banner>
    <div class="doc-wrap">
      <Nav></Nav>
      <Content></Content>
    </div>
    <SaveDocDialog v-if="saveDocDialogVisible" v-model="saveDocDialogVisible"></SaveDocDialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { apidocCache } from '@/cache/apidoc'
import SaveDocDialog from '@/pages/modules/apidoc/doc-edit/dialog/save-doc/save-doc.vue'
import Banner from './banner/banner.vue';
import Nav from './nav/nav.vue';
import Content from './content/content.vue';
import { useApidocTas } from '@/store/apidoc/tabs'
import { useApidoc } from '@/store/apidoc/apidoc'
import { useApidocBaseInfo } from '@/store/apidoc/base-info'
import { useApidocWorkerState } from '@/store/apidoc/worker-state'
import { useRoute } from 'vue-router';

const route = useRoute();
const apidocTabsStore = useApidocTas();
const apidocStore = useApidoc()
const apidocBaseInfoStroe = useApidocBaseInfo();
const apidocWorkerStateStore = useApidocWorkerState()
const projectId = route.query.id as string;
//当前选中的tab
const currentSelectTab = computed(() => {
  const currentTabs = apidocTabsStore.tabs[projectId];
  const selectedTab = currentTabs?.find((tab) => tab.selected) || null;
  return selectedTab;
})
//是否正在保存数据
const saveDocLoading = computed(() => apidocStore.loading);
//当前工作区状态
const isView = computed(() => apidocBaseInfoStroe.mode === 'view')
const saveDocDialogVisible = computed({
  get() {
    return apidocStore.saveDocDialogVisible;
  },
  set(val) {
    apidocStore.changeSaveDocDialogVisible(val);
    apidocStore.changeSavedDocId(currentSelectTab.value?._id || '');
  }
});
//=====================================绑定快捷键====================================//
const bindShortcut = (e: KeyboardEvent) => {
  if (isView.value) {
    return;
  }
  const currentTabs = apidocTabsStore.tabs[projectId];
  const hasTabs = currentTabs && currentTabs.length > 0;
  const currentTabIsDoc = currentSelectTab.value?.tabType === 'doc';
  if (hasTabs && currentTabIsDoc && e.ctrlKey && (e.key === 'S' || e.key === 's') && saveDocLoading.value === false) {
    e.preventDefault();
    e.stopPropagation();
    if (currentSelectTab.value._id.includes('local_')) {
      saveDocDialogVisible.value = true
    } else if (!apidocStore.saveLoading) {
      apidocStore.saveApidoc();
    }
  } else if (hasTabs && currentTabIsDoc && e.ctrlKey && (e.key === 'W' || e.key === 'w')) {
    const selectedTab = currentTabs.find(tab => tab.selected)
    if (selectedTab) {
      apidocTabsStore.deleteTabByIds({ projectId, ids: [selectedTab._id] });
    }
  }
}
//=====================================基本数据获取====================================//
//获取项目基本信息
const getProjectInfo = () => {
  apidocBaseInfoStroe.getProjectBaseInfo({ projectId });
}
//初始化cookie
const initCookies = () => {
  apidocBaseInfoStroe.initCookies()
}
//初始化布局
const initLayout = () => {
  apidocBaseInfoStroe.initLayout()
}
//初始化header信息
const initCommonHeaders = () => {
  apidocBaseInfoStroe.getCommonHeaders()
}
//初始化worker本地状态
const initWorkerLocalState = () => {
  const localState = apidocCache.getApidocWorkerLocalStateById(projectId);
  if (localState) {
    apidocWorkerStateStore.changeLocalState({ projectId, value: localState });
  }
}
onMounted(() => {
  window.addEventListener('keydown', bindShortcut);
  getProjectInfo();
  initCookies();
  initLayout();
  initCommonHeaders();
  initWorkerLocalState();
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', bindShortcut);
})
//初始化预览模式或者编辑模式
const routerMode = route.query.mode as string;
let mode: "view" | "edit" = 'view';
if (routerMode === 'view') {
  mode = 'view'
} else if (routerMode === 'edit') {
  mode = 'edit'
}
apidocBaseInfoStroe.changeMode(mode);
</script>

<style lang='scss' scoped>
.doc-view {
  display: flex;
  overflow: hidden;
  height: 100%;

  .doc-wrap {
    flex: 1;
    overflow: hidden;
  }
}
</style>
