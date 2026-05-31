<template>
  <div class="share-doc-detail">
    <!-- 当tabs为空时显示提示信息 -->
    <div v-if="!tabs?.length" class="empty-tabs">
      <h2>{{ $t('暂无文档') }}</h2>
    </div>
    <div v-else class="doc-detail">
      <!-- HTTP节点 -->
      <HttpContent v-if="currentTabType === 'http'" />
      <!-- WebSocket节点 -->
      <WebsocketContent v-else-if="currentTabType === 'websocket'" />
      <!-- HTTP Mock节点 -->
      <HttpMockContent v-else-if="currentTabType === 'httpMock'" />
      <!-- WebSocket Mock节点 -->
      <WebsocketMockContent v-else-if="currentTabType === 'websocketMock'" />
      <!-- 文件夹类型 -->
      <div v-else-if="currentTabType === 'folder'" class="empty-tabs">
        <el-empty :description="t('这是一个文件夹')" />
      </div>
      <!-- 未知类型 -->
      <div v-else class="empty-tabs">
        <h2>{{ t('暂不支持此类型节点的预览') }}</h2>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { useShareStore } from '../store';

const { t } = useI18n();
const HttpContent = defineAsyncComponent(() => import('./HttpContent.vue'));
const WebsocketContent = defineAsyncComponent(() => import('./WebsocketContent.vue'));
const HttpMockContent = defineAsyncComponent(() => import('./HttpMockContent.vue'));
const WebsocketMockContent = defineAsyncComponent(() => import('./WebsocketMockContent.vue'));

const shareId = (() => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('share_id') || 'local_share';
})();
const shareStore = useShareStore();
const tabs = computed(() => shareStore.tabs[shareId]);

const currentTabType = computed(() => {
  const selectedTab = tabs.value?.find(tab => tab.selected);
  return selectedTab?.tabType || '';
});
</script>

<style scoped>
@import './contentCommon.css';
</style>
