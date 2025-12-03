<template>
  <keep-alive>
    <SGuide v-if="!currentSelectNav || currentSelectNav?.tabType === 'guide'"></SGuide>
    <SVariable v-else-if="currentSelectNav.tabType === 'variable'"></SVariable>
    <SExportDoc v-else-if="currentSelectNav.tabType === 'exportDoc'"></SExportDoc>
    <SImportDoc v-else-if="currentSelectNav.tabType === 'importDoc'"></SImportDoc>
    <SOnlineLink v-else-if="currentSelectNav.tabType === 'onlineLink'"></SOnlineLink>
    <SRecycler v-else-if="currentSelectNav.tabType === 'recycler'" :key="recyclerKey.toString()"></SRecycler>
    <SHistory v-else-if="currentSelectNav.tabType === 'history'"></SHistory>
    <SCommonHeader v-else-if="currentSelectNav.tabType === 'commonHeader'"></SCommonHeader>
    <SApidoc v-else-if="currentSelectNav.tabType === 'http'"></SApidoc>
    <SCookies v-else-if="currentSelectNav.tabType === 'cookies'"></SCookies>
    <SHttpMock v-else-if="currentSelectNav.tabType === 'httpMock'"></SHttpMock>
    <SWebsocket v-else-if="currentSelectNav.tabType === 'websocket'"></SWebsocket>
    <SWebSocketMock v-else-if="currentSelectNav.tabType === 'websocketMock'"></SWebSocketMock>
  </keep-alive>

</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore';
import { eventEmitter } from '@/helper';
import { useRoute } from 'vue-router';
import SApidoc from '../../httpNode/HttpNode.vue';
import SGuide from './guide/Guide.vue';
import SVariable from '../../variable/Variable.vue';
// import mindParams from './mind-params/mind-params.vue';
import SHttpMock from '../../httpMockNode/HttpMockNode.vue';
import SWebSocketMock from '../../websocketMockNode/WebSocketMockNode.vue';
import SExportDoc from '../../export/Export.vue';
import SImportDoc from './import/Import.vue'
import SCookies from '../../cookies/Cookies.vue'
import SOnlineLink from './link/Link.vue'
import SRecycler from './recycler/Recycler.vue'
import SHistory from '../../audit/Audit.vue'
import SCommonHeader from '../../commonHeader/CommonHeader.vue'
import SWebsocket from '../../websocketNode/WebsocketNode.vue'

const route = useRoute();
const projectNavStore = useProjectNav()
const currentSelectNav = computed(() => {
  const projectId = route.query.id as string;
  const navs = projectNavStore.navs[projectId];
  const selectedNav = navs?.find((nav) => nav.selected) || null;
  return selectedNav;
})
const recyclerKey = ref(0);
onMounted(() => {
  eventEmitter.on('tabs/deleteTab', () => {
    recyclerKey.value++;
  })
})
</script>

