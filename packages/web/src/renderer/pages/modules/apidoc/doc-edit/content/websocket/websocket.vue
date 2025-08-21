<template>
  <div v-loading="loading" class="websocket" :class="{ vertical: layout === 'vertical' }">
    <template v-if="mode === 'edit'">
      <div class="connection-layout" :class="{ vertical: layout === 'vertical' }">
        <SConnection></SConnection>
        <SMessages></SMessages>
      </div>
      <el-divider v-show="layout === 'vertical' && !isVerticalDrag" content-position="left">WebSocket信息</el-divider>
      <SResizeY v-if="layout === 'vertical'" :min="150" :max="550" :height="350" name="ws-info-y" tabindex="1"
        @dragStart="isVerticalDrag = true" @dragEnd="isVerticalDrag = false">
        <SWebSocketInfo></SWebSocketInfo>
      </SResizeY>
      <SResizeX 
        v-if="layout === 'horizontal'" 
        :min="500" 
        :max="750"
        :width="500" 
        name="ws-info" 
        bar-left
        class="info-layout" 
        tabindex="1"
      >
        <SWebSocketInfo></SWebSocketInfo>
      </SResizeX>
    </template>
    <template v-else>
      <SView></SView>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import SResizeX from '@/components/common/resize/g-resize-x.vue'
import SResizeY from '@/components/common/resize/g-resize-y.vue'
import SConnection from './connection/connection.vue'
import SMessages from './messages/messages.vue'
import SWebSocketInfo from './websocket-info/websocket-info.vue'
import SView from './view/view.vue'
import { useApidocBaseInfo } from '@/store/apidoc/base-info'

const apidocBaseInfoStore = useApidocBaseInfo();
const isVerticalDrag = ref(false);
const loading = ref(false);

const mode = computed(() => apidocBaseInfoStore.mode);
const layout = computed(() => apidocBaseInfoStore.layout);
</script>

<style lang="scss" scoped>
.websocket {
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

  // 连接编辑区域
  .connection-layout {
    flex: 1;
    overflow: hidden;
    border-right: 1px solid var(--gray-400);

    &.vertical {
      flex: 1;
      overflow-y: auto;
    }
  }

  // WebSocket信息区域
  .info-layout {
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
