<template>
  <keep-alive>
    <SGuide v-if="!currentSelectTab || currentSelectTab?.tabType === 'guide'"></SGuide>
    <SVariable v-else-if="currentSelectTab.tabType === 'variable'"></SVariable>
    <SExportDoc v-else-if="currentSelectTab.tabType === 'exportDoc'"></SExportDoc>
    <SImportDoc v-else-if="currentSelectTab.tabType === 'importDoc'"></SImportDoc>
    <SOnlineLink v-else-if="currentSelectTab.tabType === 'onlineLink'"></SOnlineLink>
    <SRecycler v-else-if="currentSelectTab.tabType === 'recycler'" :key="recyclerKey.toString()"></SRecycler>
    <SHistory v-else-if="currentSelectTab.tabType === 'history'"></SHistory>
    <SHook v-else-if="currentSelectTab.tabType === 'hook'"></SHook>
    <SCommonHeader v-else-if="currentSelectTab.tabType === 'commonHeader'"></SCommonHeader>
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
import SApidoc from '../../httpNode/HttpNode.vue';
import SGuide from './guide/Guide.vue';
import SVariable from '../../variable/Variable.vue';
// import mindParams from './mind-params/mind-params.vue';
import SHttpMock from '../../httpMockNode/HttpMockNode.vue';
import SExportDoc from '../../export/Export.vue';
import SImportDoc from './import/Import.vue'
import SCookies from '../../cookies/Cookies.vue'
import SOnlineLink from './link/Link.vue'
import SRecycler from './recycler/Recycler.vue'
import SHistory from '../../audit/Audit.vue'
import SHook from './hook/Hook.vue'
import SCommonHeader from '../../commonHeader/CommonHeader.vue'
import SWebsocket from '../../websocketNode/WebsocketNode.vue'

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
