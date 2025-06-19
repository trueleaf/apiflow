<template>
  <div
    class="node"
    :style="{
      left: nodeInfo.styleInfo.offsetX * configStore.zoom + 'px',
      top: nodeInfo.styleInfo.offsetY * configStore.zoom + 'px',
      width: nodeInfo.styleInfo.width * configStore.zoom+ 'px',
      height: nodeInfo.styleInfo.height * configStore.zoom + 'px',
      zIndex: nodeInfo.styleInfo.zIndex,
      // border: (nodeStateStore.activeNodeId !== props.nodeId ? '1px solid #ccc' : '1px solid transparent'),
    }"
  >
    <template v-if="nodeStateStore.activeNodeId === props.nodeId">
      <div
        class="resize-dot lt"
        :style="{
          width: configStore.resizeDotSize + 'px',
          height: configStore.resizeDotSize + 'px',
          left: -configStore.resizeDotSize/2 + 'px',
          top: -configStore.resizeDotSize/2 + 'px',
        }"
      >
      </div>
      <div
        class="resize-dot rt"
        :style="{
          width: configStore.resizeDotSize + 'px',
          height: configStore.resizeDotSize + 'px',
          top: -configStore.resizeDotSize / 2 + 'px',
          right: -configStore.resizeDotSize / 2 + 'px',
        }"
      >
      </div>
      <div
        class="resize-dot lb"
        :style="{
          width: configStore.resizeDotSize + 'px',
          height: configStore.resizeDotSize + 'px',
          left: -configStore.resizeDotSize / 2 + 'px',
          bottom: -configStore.resizeDotSize / 2 + 'px',
        }"
      >
      </div>
      <div
        class="resize-dot rb"
        :style="{
          width: configStore.resizeDotSize + 'px',
          height: configStore.resizeDotSize + 'px',
          bottom: -configStore.resizeDotSize / 2 + 'px',
          right: -configStore.resizeDotSize / 2 + 'px',
        }"
      >
      </div>
    </template>
    <template v-if="nodeStateStore.hoverNodeId === props.nodeId || nodeStateStore.activeNodeId === props.nodeId">
      <div
        class="create-line-dot"
        :style="{
          width: configStore.createLineDotSize + 'px',
          height: configStore.createLineDotSize + 'px',
          left: -configStore.createLineDotSize / 2 + 'px',
          top: `calc(50% - ${configStore.createLineDotSize / 2}px)`,
        }"
      >
      </div>
      <div
        class="create-line-dot"
        :style="{
          width: configStore.createLineDotSize + 'px',
          height: configStore.createLineDotSize + 'px',
          right: -configStore.createLineDotSize / 2 + 'px',
          top: `calc(50% - ${configStore.createLineDotSize / 2}px)`,
        }"
      >
      </div>
      <div
        class="create-line-dot"
        :style="{
          width: configStore.createLineDotSize + 'px',
          height: configStore.createLineDotSize + 'px',
          top: -configStore.createLineDotSize / 2 + 'px',
          left: `calc(50% - ${configStore.createLineDotSize / 2}px)`,
        }"
      >
      </div>
      <div
        class="create-line-dot"
        :style="{
          width: configStore.createLineDotSize + 'px',
          height: configStore.createLineDotSize + 'px',
          bottom: -configStore.createLineDotSize / 2 + 'px',
          left: `calc(50% - ${configStore.createLineDotSize / 2}px)`,
        }"
      >
      </div>
    </template>
    <template v-if="nodeStateStore.activeNodeId === props.nodeId">
      <div className="resize-border"></div>
    </template>
    <template v-if="nodeStateStore.activeNodeId === props.nodeId && nodeStateStore.isMove">
      <div className="position-info">
        <span>X: {{ Math.ceil(nodeInfo.styleInfo.offsetX * configStore.zoom) }}&nbsp;&nbsp;&nbsp;</span>
        <span>Y: {{ Math.ceil(nodeInfo.styleInfo.offsetY * configStore.zoom) }}</span>
      </div>
    </template>
    <div class="node-inner">
      <div class="header">
        <div class="title">基础组件测试</div>
        <div class="operations">
          <div class="op-wrap">
            <el-icon class="op-icon" size="14" title="修改">
              <Edit />
            </el-icon>
          </div>
          <div class="op-wrap">
            <el-icon class="op-icon" size="14">
              <More />
            </el-icon>
          </div>
        </div>
      </div>
      <div class="req-url">
        <span class="method">POST&nbsp;&nbsp;</span>
        <span class="url">/api/test/foo/user_info/pages/demo</span>
      </div>
      <!-- <div class="empty">
        <i class="plus-icon" style="font-size: 22px;"></i>
        <div>添加接口</div>
      </div> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useFlowNodesStore } from '@/store/apiflow/nodes';
import { useFlowNodeStateStore } from '@/store/apiflow/node-state';
import { useFlowConfigStore } from '@/store/apiflow/config';
import { FlowNodeInfo } from '@src/types/apiflow';
import { computed } from 'vue';
import { Edit, More } from '@element-plus/icons-vue'

const props = defineProps({
  nodeId: {
    type: String,
    default: ''
  }
});

const nodesStore = useFlowNodesStore();
const nodeStateStore = useFlowNodeStateStore();
const configStore = useFlowConfigStore();
const nodeInfo = computed(() => {
  return nodesStore.nodeList.find(node => node.id === props.nodeId)as FlowNodeInfo
})

</script>

<style lang='scss' scoped>
.node {
    position: absolute;
    background-color: $white;
    border: 1px solid $gray-400;
    border-radius: $border-radius-xs;
    .resize-dot {
        border: 1px solid $theme-color;
        position: absolute;
        background-color: $white;
        z-index: 2;
    }
    .create-line-dot {
        border-radius: 50%;
        border: 1px solid $theme-color;
        position: absolute;
        background-color: $white;
        z-index: 2;
    }
    .resize-border {
        position: absolute;
        left: 0;
        top: 0;
        // z-index: 1;
        border: 1px solid $theme-color;
        width: 100%;
        height: 100%;
    }
    .position-info {
        position: absolute;
        left: 50%;
        transform: translate(-50%, 0);
        white-space: nowrap;
        bottom: -35px;
        padding: 5px 10px;
        border: 1px solid #d0d0d0;
        background-color: #f2f2f2;
    }
    .node-inner {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: $border-radius-sm;
      display: flex;
      flex-direction: column;
      .header {
        flex: 0 0 40px;
        display: flex;
        align-items: center;
        border-bottom: 1px solid rgba(0, 0, 0, 0.12);
        .title {
          width: 80%;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-weight: bolder;
          font-size: 13px;
          text-indent: 1em;
          user-select: none;
        }
        .operations {
          flex: 1;
          display: flex;
          align-items: center;
          .op-wrap {
            width: 25px;
            height: 25px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 5px;
            cursor: pointer;
            &:hover {
              background-color: rgba(0, 0, 0, 0.12);
            }
          }
        }
      }
      .req-url {
        height: 30px;
        display: flex;
        align-items: center;
        font-size: size(13);
        padding: 0 size(10);
        width: 100%;
        .method {
          color: #f90;
        }
        .url {
          font-size: size(14);
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }

      .content {
        flex: 1;
      }

      .empty {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
}
</style>
