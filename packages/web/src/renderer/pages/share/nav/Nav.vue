<template>
  <div class="nav">
    <div class="tab-wrap">
      <div ref="tabList" class="tab-list">
        <SDraggable ref="tabListWrap" v-model="tabs" animation="150" item-key="name" group="operation"
          class="d-flex drag-wrap">
          <template #item="{ element }">
            <div :title="element.label" class="item" :class="{ active: element.selected }"
              @click="selectCurrentTab(element)" @dblclick="fixCurrentTab(element)"
              @contextmenu.stop.prevent="handleContextmenu($event, element)">
              <!-- 接口文档 -->
              <template v-if="element.tabType === 'http'">
                <template v-for="(req) in requestMethods">
                  <span v-if="element.head.icon.toLowerCase() === req.value.toLowerCase()" :key="req.value" class="mr-2"
                    :style="{ color: req.iconColor, transform: `skewX(${element.fixed ? 0 : '-30deg'})` }">{{ req.name
                    }}</span>
                </template>
              </template>
              <span class="item-text" :class="{ unfixed: !element.fixed }">{{ element.label }}</span>
              <span class="operaion">
                <el-icon class="close" :size="15" @click.stop="handleCloseCurrentTab(element)">
                  <IconClose />
                </el-icon>
              </span>
            </div>
          </template>
        </SDraggable>
      </div>
    </div>
    <div class="d-flex a-center pl-1 border-left-gray-400">{{ ipAddress }}</div>
  </div>
  <teleport to="body">
    <!-- 单个节点操作 -->
    <SContextmenu v-if="showContextmenu" :left="contextmenuLeft" :top="contextmenuTop">
      <SContextmenuItem :label="t('关闭')" hot-key="Ctrl + W" @click="handleCloseCurrentTab()"></SContextmenuItem>
      <SContextmenuItem :label="t('关闭左侧')" @click="handleCloseLeftTab"></SContextmenuItem>
      <SContextmenuItem :label="t('关闭右侧')" @click="handleCloseRightTab"></SContextmenuItem>
      <SContextmenuItem :label="t('关闭其他')" @click="handleCloseOtherTab"></SContextmenuItem>
      <SContextmenuItem :label="t('全部关闭')" @click="handleCloseAllTab"></SContextmenuItem>
    </SContextmenu>
  </teleport>
</template>

<script lang="ts" setup>
import * as SDraggable from 'vuedraggable'
import {
  Close as IconClose,
} from '@element-plus/icons-vue';
import { ComponentPublicInstance, computed, onMounted, onUnmounted, ref } from 'vue';
import { ApidocTab } from '@src/types/share/tabs';
import { useShareStore } from '../store';
import { eventEmitter } from '@/helper';
import SContextmenu from '@/components/common/contextmenu/ClContextmenu.vue'
import SContextmenuItem from '@/components/common/contextmenu/ClContextmenuItem.vue'
import { defaultRequestMethods } from '../common';
import { useRoute } from 'vue-router';
// import { findNodeById, findParentById } from '@/helper';
;
// import { ApidocBanner } from '@src/types';
import { useI18n } from 'vue-i18n';

/*
|--------------------------------------------------------------------------
| 变量定义
|--------------------------------------------------------------------------
*/
const route = useRoute();
const { t } = useI18n()

const showContextmenu = ref(false); //是否显示contextmenu
const contextmenuLeft = ref(0); //鼠标右键x值
const contextmenuTop = ref(0); //鼠标右键y值
const currentOperationNode = ref<ApidocTab | null>(null); //当前被操作的节点信息
const tabListWrap = ref<ComponentPublicInstance | null>(null)
const shareStore = useShareStore();
const shareId = route.query?.share_id as string || 'local_share';
const tabs = computed({
  get: () => shareStore.tabs[shareId] || [],
  set: (val) => shareStore.updateAllTabs({ shareId, tabs: val })
});

const ipAddress = computed(() => window.electronAPI?.ip)

// 请求方法配置
const requestMethods = ref(defaultRequestMethods)

/*
|--------------------------------------------------------------------------
| 初始化数据获取逻辑
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| 事件绑定
|--------------------------------------------------------------------------
*/
const initViewTab = () => {
  setTimeout(() => {
    const tabWrap = tabListWrap.value?.$el;
    const activeNode = tabWrap?.querySelector('.item.active') as HTMLElement | null;
    activeNode?.scrollIntoView();
  })
  eventEmitter.on('apidoc/tabs/addOrDeleteTab', () => {
    setTimeout(() => {
      const tabWrap = tabListWrap.value?.$el;
      const activeNode = tabWrap?.querySelector('.item.active') as HTMLElement | null;
      activeNode?.scrollIntoView();
    })
  });
}

const bindGlobalClick = () => {
  showContextmenu.value = false;
}

//=====================================contextmenu====================================//
const handleContextmenu = (e: MouseEvent, item: ApidocTab) => {
  currentOperationNode.value = item;
  contextmenuLeft.value = e.clientX;
  contextmenuTop.value = e.clientY;
  showContextmenu.value = true;
}

//关闭当前tab
const handleCloseCurrentTab = (tab?: ApidocTab) => {
  const currentOperationNodeId = currentOperationNode.value?._id || ''
  const tabId: string = tab ? tab._id : currentOperationNodeId;
  shareStore.deleteTabByIds({
    shareId,
    ids: [tabId]
  });
  if (tab) {
    eventEmitter.emit('tabs/deleteTab', tab);
  }
}

//关闭其他
const handleCloseOtherTab = () => {
  const currentOperationNodeId = currentOperationNode.value?._id;
  const delTabs: string[] = [];
  tabs.value.forEach((tab: ApidocTab) => {
    if (tab._id !== currentOperationNodeId) {
      delTabs.push(tab._id);
    }
  })
  shareStore.deleteTabByIds({
    shareId,
    ids: delTabs
  })
}

//关闭左侧
const handleCloseLeftTab = () => {
  const currentOperationNodeId = currentOperationNode.value?._id;
  const delTabs: string[] = [];
  for (let i = 0; i < tabs.value.length; i += 1) {
    if (tabs.value[i]._id !== currentOperationNodeId) {
      delTabs.push(tabs.value[i]._id);
    } else {
      break;
    }
  }
  shareStore.deleteTabByIds({
    shareId,
    ids: delTabs
  })
}

//关闭右侧
const handleCloseRightTab = () => {
  const currentOperationNodeId = currentOperationNode.value?._id;
  const currentNodeIndex = tabs.value.findIndex((tab: ApidocTab) => tab._id === currentOperationNodeId);
  const delTabs: string[] = [];
  for (let i = currentNodeIndex + 1; i < tabs.value.length; i += 1) {
    delTabs.push(tabs.value[i]._id);
  }
  shareStore.deleteTabByIds({
    shareId,
    ids: delTabs
  })
}

//关闭全部
const handleCloseAllTab = () => {
  shareStore.deleteTabByIds({
    shareId,
    ids: tabs.value.map((v: ApidocTab) => v._id)
  })
}

//选中当前tab
const selectCurrentTab = (element: ApidocTab) => {
  shareStore.selectTabById({
    shareId,
    id: element._id
  });
}

//固定当前tab
const fixCurrentTab = (element: ApidocTab) => {
  shareStore.fixedTab({
    _id: element._id,
    shareId,
  })
}

/*
|--------------------------------------------------------------------------
| 生命周期
|--------------------------------------------------------------------------
*/
onMounted(() => {
  document.body.addEventListener('click', bindGlobalClick);
  document.body.addEventListener('contextmenu', bindGlobalClick);
  initViewTab();
})

onUnmounted(() => {
  document.body.removeEventListener('click', bindGlobalClick);
  document.body.removeEventListener('contextmenu', bindGlobalClick);
  eventEmitter.off('apidoc/tabs/addOrDeleteTab');
})
</script>

<style lang='scss' scoped>
.nav {
  width: 100%;
  height: 40px;
  background: #eee;
  display: flex;

  // tab包裹框
  .tab-wrap {
    width: 90%;
    min-width: 300px;
    overflow-x: hidden;
    overflow-y: hidden;
    display: flex;
    position: relative;
  }

  .tab-list {
    width: auto;
    max-width: calc(100% - 40px);
    line-height: 40px;
    display: flex;
    height: 40px;
    color: #5f6368;
    white-space: nowrap;
    transition: left .1s;
    overflow-x: auto;
    overflow-y: hidden;

    &:hover {
      &::-webkit-scrollbar {
        display: block;
      }
    }

    &::-webkit-scrollbar {
      width: 5px;
      height: 5px;
      display: none;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--gray-500);
    }

    .item {
      display: flex;
      align-items: center;
      position: relative;
      font-size: 13px;
      flex: 0 0 auto;
      width: 200px;
      cursor: default;
      padding: 0 10px;
      border-right: 1px solid var(--gray-400);
      background: rgb(222, 225, 230);

      .item-text {
        display: inline-block;
        width: 130px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        &.unfixed {
          transform: skewX(-10deg);
        }
      }

      &:hover {
        background: #e2e2e2;
      }

      &.active {
        background: #f0f3fa;
      }
    }

    .operaion {
      position: absolute;
      right: 0;
      width: 25px;
      height: 100%;
      cursor: pointer;

      .close {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        cursor: pointer;
        line-height: 1.5;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        z-index: 1;
        font-size: 16px;

        &:hover {
          background: #ccc;
        }
      }
    }
  }

  //滚动条样式
  .el-scrollbar__bar {
    bottom: 0;
  }
}
</style>
