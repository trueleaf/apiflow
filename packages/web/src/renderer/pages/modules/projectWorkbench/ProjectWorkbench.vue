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
import { computed, onMounted } from 'vue'
// import { ref } from 'vue'
import SaveDocDialog from './dialog/saveDoc/SaveDoc.vue'
import Banner from './layout/banner/Banner.vue';
import Nav from './layout/nav/Nav.vue';
import Content from './layout/content/Content.vue';
import { useApidocTas } from '@/store/apidoc/tabs'
import { useApidoc } from '@/store/apidoc/apidoc'
import { useApidocBaseInfo } from '@/store/apidoc/base-info'
import { useRoute } from 'vue-router';
import { useCookies } from '@/store/apidoc/cookies';
import { useWebSocket } from '@/store/websocket/websocket';
import { useWindowEvent } from '@/hooks/useWindowEvent';

const route = useRoute();
const apidocTabsStore = useApidocTas();
const apidocStore = useApidoc()
const websocketStore = useWebSocket()
const apidocBaseInfoStroe = useApidocBaseInfo();
const { initCookies } = useCookies();
const projectId = route.query.id as string;
//当前选中的tab
const currentSelectTab = computed(() => {
  const currentTabs = apidocTabsStore.tabs[projectId];
  const selectedTab = currentTabs?.find((tab) => tab.selected) || null;
  return selectedTab;
})
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
  const currentTabIsDoc = currentSelectTab.value?.tabType === 'http' || currentSelectTab.value?.tabType === 'websocket';
  if (hasTabs && currentTabIsDoc && e.ctrlKey && (e.key === 'S' || e.key === 's')) {
    e.preventDefault();
    e.stopPropagation();
    if (currentSelectTab.value._id.includes('local_')) {
      saveDocDialogVisible.value = true
    } else if (currentSelectTab.value.tabType === 'http' && !apidocStore.saveLoading && !apidocStore.loading) {
      apidocStore.saveApidoc();
    } else if (currentSelectTab.value.tabType === 'websocket' && !websocketStore.saveLoading && !websocketStore.loading) {
      websocketStore.saveWebsocket();
    }
  } else if (hasTabs && e.ctrlKey && (e.key === 'W' || e.key === 'w')) {
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
//初始化布局
const initLayout = () => {
  apidocBaseInfoStroe.initLayout()
}
//初始化header信息
const initCommonHeaders = () => {
  apidocBaseInfoStroe.getCommonHeaders()
  apidocBaseInfoStroe.getGlobalCommonHeaders()
}
useWindowEvent('keydown', bindShortcut);
onMounted(() => {
  apidocBaseInfoStroe.changeProjectId(projectId);
  getProjectInfo();
  initCookies(projectId);
  initLayout();
  initCommonHeaders();
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
