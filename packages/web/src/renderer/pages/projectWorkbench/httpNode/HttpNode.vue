<template>
  <div v-loading="loading" class="apidoc" :class="{ vertical: layout === 'vertical' }">
    <div class="request-layout" :class="{ vertical: layout === 'vertical' }">
      <SOperation></SOperation>
      <SParams></SParams>
    </div>
    <SResizeY v-if="layout === 'vertical'" class="y-bar" :min="100" :max="750" :height="responseHeight" :default-height="350" name="response-y" tabindex="1"
      @dragStart="isVerticalDrag = true" @dragEnd="isVerticalDrag = false" @heightChange="handleResponseHeightChange">
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
  </div>
</template>

<script lang="ts" setup>
import SResizeX from '@/components/common/resize/ClResizeX.vue'
import SResizeY from '@/components/common/resize/ClResizeY.vue'
import { httpNodeCache } from '@/cache/httpNode/httpNodeCache'
import { httpResponseCache } from '@/cache/httpNode/httpResponseCache'
import SOperation from './operation/Operation.vue'
import SParams from './params/Params.vue'
import SResponse from './responseView/ResponseView.vue'
import { computed, ref, watch, onMounted } from 'vue'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { useProjectWorkbench } from '@/store/projectWorkbench/projectWorkbenchStore'
import { useRoute } from 'vue-router'
import { useHttpNode } from '@/store/httpNode/httpNodeStore'
import { generateHttpNode } from '@/helper'
import { useHttpNodeResponse } from '@/store/httpNode/httpNodeResponseStore'
import { useHttpRedoUndo } from '@/store/redoUndo/httpRedoUndoStore'

const projectNavStore = useProjectNav();
const projectWorkbenchStore = useProjectWorkbench();
const httpNodeStore = useHttpNode();
const httpNodeResponseStore = useHttpNodeResponse();
const httpRedoUndoStore = useHttpRedoUndo();
const isVerticalDrag = ref(false);
const route = useRoute()

const currentSelectNav = computed(() => {
  const projectId = route.query.id as string;
  const navs = projectNavStore.navs[projectId];
  const selectedNav = navs?.find((nav) => nav.selected) || null;
  return selectedNav;
});
const loading = computed(() => httpNodeStore.httpContentLoading);
const layout = computed(() => projectWorkbenchStore.layout);
const responseHeight = computed(() => projectWorkbenchStore.responseHeight);

/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
//获取api文档数据
const getApidocInfo = async () => {
  if (!currentSelectNav.value) {
    return
  }
  if (currentSelectNav.value.saved) { //取最新值
    if (currentSelectNav.value._id?.startsWith('local_')) {
      httpNodeStore.changeHttpNodeInfo(generateHttpNode(currentSelectNav.value._id));
      httpNodeStore.changeOriginHttpNodeInfo();
      httpNodeResponseStore.clearResponse();
      httpNodeResponseStore.changeRequestState('waiting');
      return
    }
    httpNodeStore.getHttpNodeDetail({
      id: currentSelectNav.value._id,
      projectId: route.query.id as string,
    })
  } else { //取缓存值
    const catchedApidoc = httpNodeCache.getHttpNode(currentSelectNav.value._id);
    if (!catchedApidoc) {
      httpNodeStore.getHttpNodeDetail({
        id: currentSelectNav.value._id,
        projectId: route.query.id as string,
      })
    } else {
      httpNodeStore.changeHttpNodeInfo(catchedApidoc);
    }
  }
  //=====================================获取缓存的返回参数====================================//
  // const localResponse = await httpResponseCache.getResponse(currentSelectNav.value._id);
  httpNodeStore.changeResponseBodyLoading(true);
  httpResponseCache.getResponse(currentSelectNav.value._id).then((localResponse) => {
    httpNodeResponseStore.clearResponse();
    if (localResponse) {
      const rawBody = localResponse.body;
      localResponse.body = null;
      httpNodeResponseStore.changeResponseInfo(localResponse)
      httpNodeResponseStore.changeResponseBody(rawBody as Uint8Array);
      httpNodeResponseStore.changeFileBlobUrl(rawBody as Uint8Array, localResponse.contentType)
      httpNodeResponseStore.changeLoadingProcess({
        percent: 1,
        total: localResponse.bodyByteLength,
        transferred: localResponse.bodyByteLength,
      })
      // 如果有缓存的响应数据，说明之前的请求已经完成，设置状态为finish
      httpNodeResponseStore.changeRequestState('finish');
    } else {
      // 只有在没有缓存数据时才设置为waiting
      httpNodeResponseStore.changeRequestState('waiting');
    }
  }).finally(() => {
    httpNodeStore.changeResponseBodyLoading(false);
  })
}
// 处理响应区域高度变化
const handleResponseHeightChange = (height: number) => {
  projectWorkbenchStore.changeResponseHeight(height);
}

watch(currentSelectNav, (val, oldVal) => {
  const isApidoc = val?.tabType === 'http';
  if (isApidoc && val?._id !== oldVal?._id) {
    getApidocInfo();
    httpRedoUndoStore.initFromCache(val._id);
  }
}, {
  deep: true,
  immediate: true,
})

onMounted(() => {
  projectWorkbenchStore.initResponseHeight();
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
    .y-bar {
      border-top: 1px solid var(--gray-400);
    }
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
