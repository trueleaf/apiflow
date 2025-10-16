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
import SResizeX from '@/components/common/resize/GResizeX.vue'
import SResizeY from '@/components/common/resize/GResizeY.vue'
import { httpNodeCache } from '@/cache/httpNode/httpNodeCache'
import { httpResponseCache } from '@/cache/httpNode/httpResponseCache'
import SOperation from './operation/Operation.vue'
import SParams from './params/Params.vue'
import SResponse from './response/Response.vue'
import SView from './view/View.vue'
import { computed, ref, watch } from 'vue'
import { useApidocBaseInfo } from '@/store/apidoc/base-info'
import { useApidocTas } from '@/store/apidoc/tabs'
import { useRoute } from 'vue-router'
import { useApidoc } from '@/store/apidoc/apidoc'
import { generateHttpNode } from '@/helper'
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
      apidocStore.changeApidoc(generateHttpNode(currentSelectTab.value._id));
      apidocStore.changeOriginApidoc();
      apidocResponseStore.clearResponse();
      apidocResponseStore.changeRequestState('waiting');
      return
    }
    apidocStore.getApidocDetail({
      id: currentSelectTab.value._id,
      projectId: route.query.id as string,
    })
  } else { //取缓存值
    const catchedApidoc = httpNodeCache.getHttpNode(currentSelectTab.value._id);
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
  // const localResponse = await httpResponseCache.getResponse(currentSelectTab.value._id);
  apidocStore.changeResponseBodyLoading(true);
  httpResponseCache.getResponse(currentSelectTab.value._id).then((localResponse) => {
    apidocResponseStore.clearResponse();
    if (localResponse) {
      const rawBody = localResponse.body;
      localResponse.body = null;
      apidocResponseStore.changeResponseInfo(localResponse)
      apidocResponseStore.changeResponseBody(rawBody as Uint8Array);
      apidocResponseStore.changeFileBlobUrl(rawBody as Uint8Array, localResponse.contentType)
      apidocResponseStore.changeLoadingProcess({
        percent: 1,
        total: localResponse.bodyByteLength,
        transferred: localResponse.bodyByteLength,
      })
      // 如果有缓存的响应数据，说明之前的请求已经完成，设置状态为finish
      apidocResponseStore.changeRequestState('finish');
    } else {
      // 只有在没有缓存数据时才设置为waiting
      apidocResponseStore.changeRequestState('waiting');
    }
  }).finally(() => {
    apidocStore.changeResponseBodyLoading(false);
  })
}

watch(currentSelectTab, (val, oldVal) => {
  const isApidoc = val?.tabType === 'http';
  if (isApidoc && val?._id !== oldVal?._id) {
    getApidocInfo();
  }
}, {
  deep: true,
  immediate: true,
})

</script>

<style lang='scss' scoped>
.apidoc {
  overflow-y: auto;
  height: calc(100vh - var(--apiflow-doc-nav-height));
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
      overflow-y: auto;
    }
  }

  // 返回编辑区域
  .response-layout {
    flex-grow: 0;
    flex-shrink: 0;
    width: 300px;
  }

  .el-divider--horizontal {
    margin: 0;
    z-index: var(--zIndex-drag-bar);
    font-size: 14px;
  }
}
</style>
