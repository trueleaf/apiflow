<template>
  <keep-alive>
    <SGuide v-if="!currentSelectTab || currentSelectTab?.tabType === 'guide'"></SGuide>
    <SVariable v-else-if="currentSelectTab.tabType === 'variable'"></SVariable>
    <SExportDoc v-else-if="currentSelectTab.tabType === 'exportDoc'"></SExportDoc>
    <SImportDoc v-else-if="currentSelectTab.tabType === 'importDoc'"></SImportDoc>
    <SOnlineLink v-else-if="currentSelectTab.tabType === 'onlineLink'"></SOnlineLink>
    <SRecycler v-else-if="currentSelectTab.tabType === 'recycler'"></SRecycler>
    <SHistory v-else-if="currentSelectTab.tabType === 'history'"></SHistory>
    <SConfig v-else-if="currentSelectTab.tabType === 'config'"></SConfig>
    <SHook v-else-if="currentSelectTab.tabType === 'hook'"></SHook>
    <SCommonHeader v-else-if="currentSelectTab.tabType === 'commonHeader'"></SCommonHeader>
    <SPackage v-else-if="currentSelectTab.tabType === 'package'"></SPackage>
    <SApidoc v-else-if="currentSelectTab.tabType === 'doc'"></SApidoc>
    <SCookies v-else-if="currentSelectTab.tabType === 'cookies'"></SCookies>
  </keep-alive>
  <!-- 
  <s-params-template v-else-if="currentSelectTab.tabType === 'paramsTemplate'"></s-params-template>
  <s-mind-params v-else-if="currentSelectTab.tabType === 'mindParams'"></s-mind-params>
  <s-apidoc v-else-if="currentSelectTab.tabType === 'doc'"></s-apidoc>
  <s-export v-else-if="currentSelectTab.tabType === 'exportDoc'"></s-export>
  <s-import-doc v-else-if="currentSelectTab.tabType === 'importDoc'"></s-import-doc>
  <s-online-link v-else-if="currentSelectTab.tabType === 'onlineLink'"></s-online-link>
  <s-recycler v-else-if="currentSelectTab.tabType === 'recycler'"></s-recycler>
  <s-history v-else-if="currentSelectTab.tabType === 'history'"></s-history>
  <s-config v-else-if="currentSelectTab.tabType === 'config'"></s-config>
  <s-hook v-else-if="currentSelectTab.tabType === 'hook'"></s-hook>
  <s-common-header v-else-if="currentSelectTab.tabType === 'commonHeader'"></s-common-header>
  <s-package v-else-if="currentSelectTab.tabType === 'package'"></s-package>
  <s-apiflow v-else-if="currentSelectTab.tabType === 'apiflow'"></s-apiflow> -->
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useApidocTas } from '@/store/apidoc/tabs';
import { useRoute } from 'vue-router';
import SApidoc from './apidoc/apidoc.vue';
import SGuide from './guide/guide.vue';
import SVariable from './variable/variable.vue';
// import mindParams from './mind-params/mind-params.vue';
// import SParamsTemplate from './params-template/params-template.vue';
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

const route = useRoute();
const apidocTabsStore = useApidocTas()
const currentSelectTab = computed(() => {
  const projectId = route.query.id as string;
  const tabs = apidocTabsStore.tabs[projectId];
  const currentSelectTab = tabs?.find((tab) => tab.selected) || null;
  return currentSelectTab;
})
</script>
