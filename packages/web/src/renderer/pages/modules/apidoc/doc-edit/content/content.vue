<template>
  <keep-alive>
    <SGuide v-if="!currentSelectTab || currentSelectTab?.tabType === 'guide'"></SGuide>
    <SVariable v-else-if="currentSelectTab.tabType === 'variable'"></SVariable>
    <SExportDoc v-else-if="currentSelectTab.tabType === 'exportDoc'"></SExportDoc>
    <SImportDoc v-else-if="currentSelectTab.tabType === 'importDoc'"></SImportDoc>
    <SOnlineLink v-else-if="currentSelectTab.tabType === 'onlineLink'"></SOnlineLink>
    <SRecycler v-else-if="currentSelectTab.tabType === 'recycler'" :key="recyclerKey.toString()"></SRecycler>
    <SHistory v-else-if="currentSelectTab.tabType === 'history'"></SHistory>
    <SConfig v-else-if="currentSelectTab.tabType === 'config'"></SConfig>
    <SHook v-else-if="currentSelectTab.tabType === 'hook'"></SHook>
    <SCommonHeader v-else-if="currentSelectTab.tabType === 'commonHeader'"></SCommonHeader>
    <SPackage v-else-if="currentSelectTab.tabType === 'package'"></SPackage>
    <SApidoc v-else-if="currentSelectTab.tabType === 'http'"></SApidoc>
    <SCookies v-else-if="currentSelectTab.tabType === 'cookies'"></SCookies>
    <SHttpMock v-else-if="currentSelectTab.tabType === 'httpMock'"></SHttpMock>
    <SWebsocket v-else-if="currentSelectTab.tabType === 'websocket'"></SWebsocket>
  </keep-alive>

</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useApidocTas } from '@/store/apidoc/tabs';
import { event } from '@/helper'
import { useRoute } from 'vue-router';
import SApidoc from './apidoc/apidoc.vue';
import SGuide from './guide/guide.vue';
import SVariable from './variable/variable.vue';
// import mindParams from './mind-params/mind-params.vue';
import SHttpMock from './mock/mock.vue';
import SExportDoc from './export/export.vue';
import SImportDoc from './import/import.vue'
import SCookies from './cookies/cookies.vue'
import SOnlineLink from './link/link.vue'
import SRecycler from './recycler/recycler.vue'
import SHistory from './history/history.vue'
import SConfig from './config/config.vue'
import SHook from './hook/hook.vue'
import SCommonHeader from './common-header/common-header.vue'
import SPackage from './package/package.vue'
import SWebsocket from './websocket/websocket.vue'

const route = useRoute();
const apidocTabsStore = useApidocTas()
const currentSelectTab = computed(() => {
  const projectId = route.query.id as string;
  const tabs = apidocTabsStore.tabs[projectId];
  const currentSelectTab = tabs?.find((tab) => tab.selected) || null;
  return currentSelectTab;
})
const recyclerKey = ref(0);
onMounted(() => {
  event.on('tabs/deleteTab', () => {
    recyclerKey.value++;
  })
})
</script>
