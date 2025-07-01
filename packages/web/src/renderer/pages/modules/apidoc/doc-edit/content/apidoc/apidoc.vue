<template>
  <div v-loading="loading" class="apidoc" :class="{ vertical: layout === 'vertical' }">
    <template v-if="mode === 'edit'">
      <div class="request-layout" :class="{ vertical: layout === 'vertical' }">
        <SOperation></SOperation>
        <SParams></SParams>
      </div>
      <el-divider v-show="layout === 'vertical' && !isVerticalDrag" content-position="left">Response</el-divider>
      <SResizeY v-if="layout === 'vertical'" :min="150" :max="550" :height="350" name="response-y" tabindex="1"
        @dragStart="isVerticalDrag = true" @dragEnd="isVerticalDrag = false">
        <SResponse></SResponse>
      </SResizeY>
      <SResizeX 
        v-if="layout === 'horizontal'" 
        :min="500" 
        :max="750"
        :width="500" 
        name="response" 
        bar-left
        class="response-layout" 
        tabindex="1"
      >
        <SResponse></SResponse>
      </SResizeX>
    </template>
    <template v-else>
      <SView></SView>
    </template>
  </div>
</template>

<script lang="ts" setup>
import SResizeX from '@/components/common/resize/g-resize-x.vue'
import SResizeY from '@/components/common/resize/g-resize-y.vue'
import { apidocCache } from '@/cache/apidoc'
import SOperation from './operation/operation.vue'
import SParams from './params/params.vue'
import SResponse from './response/response.vue'
import SView from './view/view.vue'
import { computed, ref, watch } from 'vue'
import { useApidocBaseInfo } from '@/store/apidoc/base-info'
import { useApidocTas } from '@/store/apidoc/tabs'
import { useRoute } from 'vue-router'
import { useApidoc } from '@/store/apidoc/apidoc'
import { apidocGenerateApidoc } from '@/helper'
import { useApidocResponse } from '@/store/apidoc/response'

const apidocBaseInfoStore = useApidocBaseInfo();
const apidocTabsStore = useApidocTas();
const apidocStore = useApidoc();
const apidocResponseStore = useApidocResponse();
const isVerticalDrag = ref(false);
const route = useRoute()

const mode = computed(() => apidocBaseInfoStore.mode);
const currentSelectTab = computed(() => {
  const projectId = route.query.id as string;
  const tabs = apidocTabsStore.tabs[projectId];
  const currentSelectTab = tabs?.find((tab) => tab.selected) || null;
  return currentSelectTab;
});
const loading = computed(() => apidocStore.loading);
const layout = computed(() => apidocBaseInfoStore.layout);

/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
//获取api文档数据
const getApidocInfo = async () => {
  if (!currentSelectTab.value) {
    return
  }
  if (currentSelectTab.value.saved) { //取最新值
    if (currentSelectTab.value._id?.startsWith('local_')) {
      apidocStore.changeApidoc(apidocGenerateApidoc(currentSelectTab.value._id));
      apidocStore.changeOriginApidoc();
      apidocResponseStore.clearResponse();
      return
    }
    apidocStore.getApidocDetail({
      id: currentSelectTab.value._id,
      projectId: route.query.id as string,
    })
  } else { //取缓存值
    const catchedApidoc = apidocCache.getApidoc(currentSelectTab.value._id);
    if (!catchedApidoc) {
      apidocStore.getApidocDetail({
        id: currentSelectTab.value._id,
        projectId: route.query.id as string,
      })
    } else {
      apidocStore.changeApidoc(catchedApidoc);
    }
  }
  //=====================================获取缓存的返回参数====================================//
  const localResponse = await apidocCache.getResponse(currentSelectTab.value._id);
  apidocResponseStore.clearResponse();
  if (localResponse) {
    // console.log('localResponse', localResponse)
    const rawBody = localResponse.body;
    localResponse.body = null;
    apidocResponseStore.changeResponseInfo(localResponse)
    apidocResponseStore.changeResponseBody(rawBody as Uint8Array);
    apidocResponseStore.changeFileBlobUrl(rawBody as Uint8Array, localResponse.contentType)
  }
}

watch(currentSelectTab, (val, oldVal) => {
  const isApidoc = val?.tabType === 'doc';
  if (isApidoc && val?._id !== oldVal?._id) {
    getApidocInfo();
    apidocResponseStore.changeRequestState('waiting')
  }
}, {
  deep: true,
  immediate: true,
})

</script>

<style lang='scss' scoped>
.apidoc {
  overflow-y: auto;
  height: calc(100vh - 100px);
  display: flex;

  &.vertical {
    flex-direction: column;
    overflow: hidden;

    .el-divider--horizontal {
      border-top: 1px dashed var(--gray-500);
    }
  }

  // 请求编辑区域
  .request-layout {
    flex: 1;
    overflow: hidden;
    border-right: 1px solid var(--gray-400);

    &.vertical {
      flex: 1;
      // border-bottom: 1px solid var(--gray-500);
      overflow-y: auto;
      // margin-top: -2px;
      // box-shadow: 0 3px 1px var(--gray-400);
    }
  }

  // 返回编辑区域
  .response-layout {
    flex-grow: 0;
    flex-shrink: 0;
    width: 300px;
    // flex: 0 0 500px;
  }

  .el-divider--horizontal {
    margin: 0;
    z-index: var(--zIndex-drag-bar);
    font-size: 14px;
  }
}
</style>
