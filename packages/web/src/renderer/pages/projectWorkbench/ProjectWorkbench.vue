<template>
  <div class="doc-view">
    <Banner></Banner>
    <div class="doc-wrap">
      <ProjectNav></ProjectNav>
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
import ProjectNav from './layout/projectNav/ProjectNav.vue';
import Content from './layout/content/Content.vue';
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { useHttpNode } from '@/store/httpNode/httpNodeStore'
import { useCommonHeader } from '@/store/projectWorkbench/commonHeaderStore'
import { useProjectWorkbench } from '@/store/projectWorkbench/projectWorkbenchStore'
import { useRoute } from 'vue-router';
import { useCookies } from '@/store/projectWorkbench/cookiesStore';
import { useWebSocket } from '@/store/websocket/websocketStore';
import { useWindowEvent } from '@/hooks/useWindowEvent';

const route = useRoute();
const projectNavStore = useProjectNav();
const httpNodeStore = useHttpNode()
const websocketStore = useWebSocket()
const commonHeaderStore = useCommonHeader();
const projectWorkbenchStore = useProjectWorkbench();
const { initCookies } = useCookies();
const projectId = route.query.id as string;
//当前选中的tab
const currentSelectNav = computed(() => {
  const currentNavs = projectNavStore.navs[projectId];
  const selectedNav = currentNavs?.find((nav) => nav.selected) || null;
  return selectedNav;
})
const saveDocDialogVisible = computed({
  get() {
    return httpNodeStore.saveDocDialogVisible;
  },
  set(val) {
    httpNodeStore.changeSaveDocDialogVisible(val);
    httpNodeStore.changeSavedDocId(currentSelectNav.value?._id || '');
  }
});
//=====================================绑定快捷键====================================//
const bindShortcut = (e: KeyboardEvent) => {
  const currentNavs = projectNavStore.navs[projectId];
  const hasNavs = currentNavs && currentNavs.length > 0;
  const currentTabIsDoc = currentSelectNav.value?.tabType === 'http' || currentSelectNav.value?.tabType === 'websocket';
  if (hasNavs && currentTabIsDoc && e.ctrlKey && (e.key === 'S' || e.key === 's')) {
    e.preventDefault();
    e.stopPropagation();
    if (currentSelectNav.value._id.includes('local_')) {
      saveDocDialogVisible.value = true
    } else if (currentSelectNav.value.tabType === 'http' && !httpNodeStore.saveLoading && !httpNodeStore.loading) {
      httpNodeStore.saveApidoc();
    } else if (currentSelectNav.value.tabType === 'websocket' && !websocketStore.saveLoading && !websocketStore.loading) {
      websocketStore.saveWebsocket();
    }
  } else if (hasNavs && e.ctrlKey && (e.key === 'W' || e.key === 'w')) {
    const selectedNav = currentNavs.find(nav => nav.selected)
    if (selectedNav) {
      projectNavStore.deleteNavByIds({ projectId, ids: [selectedNav._id] });
    }
  }
}
//=====================================基本数据获取====================================//
//获取项目基本信息
const getProjectInfo = () => {
  projectWorkbenchStore.initProjectBaseInfo({ projectId });
}
//初始化布局
const initLayout = () => {
  projectWorkbenchStore.initLayout()
}
//初始化header信息
const initCommonHeaders = () => {
  commonHeaderStore.getCommonHeaders()
  commonHeaderStore.getGlobalCommonHeaders()
}
useWindowEvent('keydown', bindShortcut);
onMounted(() => {
  getProjectInfo();
  initCookies(projectId);
  initLayout();
  initCommonHeaders();
})
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
