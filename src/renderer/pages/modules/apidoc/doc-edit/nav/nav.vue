<template>
  <div class="nav">
    <div class="tab-wrap">
      <div v-if="0" class="btn left" @click="handleMoveLeft">
        <el-icon :size="16">
          <IconArrowLeft />
        </el-icon>
      </div>
      <!-- https://github.com/element-plus/element-plus/issues/2293 -->
      <div ref="tabList" class="tab-list">
        <SDraggable ref="tabListWrap" v-model="tabs" animation="150" item-key="name" group="operation"
          class="d-flex drag-wrap">
          <template #item="{ element }">
            <div :title="element.label" class="item" :class="{ active: element.selected }"
              @click="selectCurrentTab(element)" @dblclick="fixCurrentTab(element)"
              @contextmenu.stop.prevent="handleContextmenu($event, element)">
              <!-- 接口文档 -->
              <template v-if="element.tabType === 'doc'">
                <template v-for="(req) in requestMethods">
                  <span v-if="element.head.icon.toLowerCase() === req.value.toLowerCase()" :key="req.value" class="mr-2"
                    :style="{ color: req.iconColor, transform: `skewX(${element.fixed ? 0 : '-30deg'})` }">{{ req.name
                    }}</span>
                </template>
              </template>
              <!-- 其他 -->
              <template v-else>
                <!-- 配置 -->
                <el-icon v-if="element.tabType === 'config'" class="mr-2" :size="16">
                  <IconSetting />
                </el-icon>
                <!-- 参数模板 -->
                <el-icon v-if="element.tabType === 'paramsTemplate'" class="mr-2" :size="16">
                  <IconSetting />
                </el-icon>
                <!-- 链接 -->
                <el-icon v-if="element.tabType === 'onlineLink'" class="orange mr-2" :size="16">
                  <IconLink />
                </el-icon>
                <!-- 导出文档 -->
                <el-icon v-if="element.tabType === 'exportDoc'" class="green mr-2" :size="16">
                  <IconShare />
                </el-icon>
                <!-- 导入文档 -->
                <el-icon v-if="element.tabType === 'importDoc'" class="red mr-2" :size="16">
                  <IconDownload />
                </el-icon>
                <!-- 操作审计 -->
                <el-icon v-if="element.tabType === 'history'" class="blue mr-2" :size="16">
                  <IconTimer />
                </el-icon>
                <!-- 全局变量配置 -->
                <span v-if="element.tabType === 'variable'" class="iconfont iconvariable blue f-base mr-2"></span>
                <!-- 同步功能 -->
                <span v-if="element.tabType === 'sync'" class="iconfont icontongbu f-base mr-2"></span>
                <!-- 生成代码 -->
                <span v-if="element.tabType === 'hook'" class="iconfont iconshengchengdaima f-base mr-2"></span>
                <!-- 公共请求头 -->
                <span v-if="element.tabType === 'commonHeader'" class="iconfont icondaimakuai f-base mr-2"></span>
                <!-- mock管理 -->
                <el-icon v-if="element.tabType === 'mock'" class="teal mr-2" :size="16">
                  <IconCoffeeCup />
                </el-icon>
                <!-- 回收站管理 -->
                <el-icon v-if="element.tabType === 'recycler'" class="red mr-2" :size="16">
                  <IconDeleteFilled />
                </el-icon>
                <!-- 联想参数 -->
                <el-icon v-if="element.tabType === 'mindParams'" class="blue mr-2" :size="16">
                  <IconOpportunity />
                </el-icon>
                <!-- 安装包 -->
                <span v-if="element.tabType === 'package'" class="iconfont iconanzhuangbao f-base mr-2"></span>
                <!-- 接口编排 -->
                <span v-if="element.tabType === 'apiflow'" class="iconfont iconbianpaixin f-base mr-2"></span>
              </template>
              <span class="item-text" :class="{ unfixed: !element.fixed }">{{ element.label }}</span>
              <span class="operaion">
                <span v-show="!element.saved" class="has-change">
                  <span class="dot"></span>
                </span>
                <el-icon v-show="element.saved" class="close" :size="15" @click.stop="handleCloseCurrentTab(element)">
                  <IconClose />
                </el-icon>
              </span>
            </div>
          </template>
        </SDraggable>
      </div>
      <div class="add-tab">
        <el-icon :size="16" title="新增一个空白接口" color="#333" @click="handleAddNewTab">
          <IconPlus />
        </el-icon>
      </div>
      <div v-if="0" class="btn right" @click="handleMoveRight">
        <el-icon :size="16">
          <IconArrowRight />
        </el-icon>
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
      <SContextmenuItem v-if="!isView" :label="t('强制全部关闭')" @click="handleForceCloseAllTab"></SContextmenuItem>
      <!-- <SContextmenuItem v-if="currentOperationNode && currentOperationNode.tabType === 'doc'" type="divider"></SContextmenuItem> -->
      <!-- <SContextmenuItem v-if="currentOperationNode && currentOperationNode.tabType === 'doc'" :label="t('复制url')"></SContextmenuItem>
            <SContextmenuItem v-if="currentOperationNode && currentOperationNode.tabType === 'doc'" :label="t('刷新')"></SContextmenuItem> -->
    </SContextmenu>
  </teleport>
</template>

<script lang="ts" setup>
import * as SDraggable from 'vuedraggable'
import { t } from 'i18next'
import {
  Setting as IconSetting,
  Plus as IconPlus,
  Link as IconLink,
  Share as IconShare,
  Download as IconDownload,
  Timer as IconTimer,
  CoffeeCup as IconCoffeeCup,
  DeleteFilled as IconDeleteFilled,
  Opportunity as IconOpportunity,
  Close as IconClose,
  ArrowRight as IconArrowRight,
  ArrowLeft as IconArrowLeft
} from '@element-plus/icons-vue';
import { ComponentPublicInstance, computed, onMounted, onUnmounted, ref } from 'vue';
import { ApidocTab } from '@src/types/apidoc/tabs';
import { router } from '@/router';
import { useApidocTas } from '@/store/apidoc/tabs';
import { event, uuid } from '@/helper'
import { useApidocBaseInfo } from '@/store/apidoc/base-info';
import SContextmenu from '@/components/common/contextmenu/g-contextmenu.vue'
import SContextmenuItem from '@/components/common/contextmenu/g-contextmenu-item.vue'
import { useApidocBanner } from '@/store/apidoc/banner';


/*
|--------------------------------------------------------------------------
| 变量定义
|--------------------------------------------------------------------------
*/
const tabIndex = ref(1);
const showContextmenu = ref(false); //是否显示contextmenu
const contextmenuLeft = ref(0); //鼠标右键x值
const contextmenuTop = ref(0); //鼠标右键y值
const currentOperationNode = ref<ApidocTab | null>(null); //当前被操作的节点信息
const apidocTabsStore = useApidocTas();
const apidocBaseInfoStore = useApidocBaseInfo()
const tabListWrap = ref<ComponentPublicInstance | null>(null)
const tabs = computed({
  get() {
    const projectId = router.currentRoute.value.query.id as string;
    return apidocTabsStore.tabs[projectId]
  },
  set(tabs: ApidocTab[]) { //拖拽tabs会导致数据写入
    apidocTabsStore.updateAllTabs({
      projectId: router.currentRoute.value.query.id as string,
      tabs,
    })
  }
})
const ipAddress = computed(() => {
  return window.electronAPI?.ip;
})
const requestMethods = computed(() => {
  return apidocBaseInfoStore.rules.requestMethods
})
const isView = computed(() => {
  return apidocBaseInfoStore.mode === 'view'
})
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
  event.on('apidoc/tabs/addOrDeleteTab', () => {
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
const handleMoveLeft = () => {
  console.log('left')
}
const handleMoveRight = () => {
  console.log('right')
}
//=====================================contextmenu====================================//
const handleContextmenu = (e: MouseEvent, item: ApidocTab) => {
  currentOperationNode.value = item;
  contextmenuLeft.value = e.clientX;
  contextmenuTop.value = e.clientY;
  showContextmenu.value = true;
}
//关闭当前tab
const handleCloseCurrentTab = (element?: ApidocTab) => {
  const projectId = router.currentRoute.value.query.id as string;
  const currentOperationNodeId = currentOperationNode.value?._id || ''
  const tabId: string = element ? element._id : currentOperationNodeId;
  apidocTabsStore.deleteTabByIds({
    projectId,
    ids: [tabId]
  });
}
//关闭其他
const handleCloseOtherTab = () => {
  const currentOperationNodeId = currentOperationNode.value?._id;
  const projectId: string = router.currentRoute.value.query.id as string;
  const delTabs: string[] = [];
  tabs.value.forEach((tab) => {
    if (tab._id !== currentOperationNodeId) {
      delTabs.push(tab._id);
    }
  })
  apidocTabsStore.deleteTabByIds({
    projectId,
    ids: delTabs
  })
}
//关闭左侧
const handleCloseLeftTab = () => {
  const currentOperationNodeId = currentOperationNode.value?._id;
  const projectId: string = router.currentRoute.value.query.id as string;
  const delTabs: string[] = [];
  for (let i = 0; i < tabs.value.length; i += 1) {
    if (tabs.value[i]._id !== currentOperationNodeId) {
      delTabs.push(tabs.value[i]._id);
    } else {
      break;
    }
  }
  apidocTabsStore.deleteTabByIds({
    projectId,
    ids: delTabs
  })
}
//关闭右侧
const handleCloseRightTab = () => {
  const currentOperationNodeId = currentOperationNode.value?._id;
  const projectId: string = router.currentRoute.value.query.id as string;
  const currentNodeIndex = tabs.value.findIndex((tab) => tab._id === currentOperationNodeId);
  const delTabs: string[] = [];
  for (let i = currentNodeIndex + 1; i < tabs.value.length; i += 1) {
    delTabs.push(tabs.value[i]._id);
  }
  apidocTabsStore.deleteTabByIds({
    projectId,
    ids: delTabs
  })
}
//关闭全部
const handleCloseAllTab = () => {
  const projectId: string = router.currentRoute.value.query.id as string;
  apidocTabsStore.deleteTabByIds({
    projectId,
    ids: tabs.value.map((v) => v._id)
  })
}
//不保存关闭全部
const handleForceCloseAllTab = () => {
  const projectId: string = router.currentRoute.value.query.id as string;
  apidocTabsStore.forceDeleteAllTab(projectId);
}
//选中当前tab
const selectCurrentTab = (element: ApidocTab) => {
  const { changeExpandItems } = useApidocBanner()
  const projectId = router.currentRoute.value.query.id as string;
  apidocTabsStore.selectTabById({
    projectId,
    id: element._id
  });
  changeExpandItems([element._id])
}
//固定当前tab
const fixCurrentTab = (element: ApidocTab) => {
  const projectId = router.currentRoute.value.query.id as string;
  apidocTabsStore.fixedTab({
    _id: element._id,
    projectId,
  })
}
//打开一个新的tab
const handleAddNewTab = () => {
  apidocTabsStore.addTab({
    _id: `local_${uuid()}`,
    projectId: router.currentRoute.value.query.id as string,
    tabType: 'doc',
    label: `未命名接口${tabIndex.value}`,
    saved: true,
    fixed: true,
    selected: true,
    head: {
      icon: 'GET',
      color: ''
    }
  })
  tabIndex.value += 1;
}

/*
|--------------------------------------------------------------------------
| 生命周期
|--------------------------------------------------------------------------
*/
onMounted(() => {
  document.body.addEventListener('click', bindGlobalClick);
  document.body.addEventListener('contextmenu', bindGlobalClick);
  apidocTabsStore.initLocalTabs({
    projectId: router.currentRoute.value.query.id as string
  })
  initViewTab();
})
onUnmounted(() => {
  document.body.removeEventListener('click', bindGlobalClick);
  document.body.removeEventListener('contextmenu', bindGlobalClick);
  event.off('apidoc/tabs/addOrDeleteTab');
})
</script>

<style lang='scss' scoped>
.nav {
  width: 100%;
  height: size(40);
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

    .btn {
      flex: 0 0 auto;
      height: size(40);
      width: size(25);
      z-index: $zIndex-tabs;
      background: $gray-200;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: $box-shadow-base;

      &:hover {
        background-color: $gray-300;
      }
    }
  }

  .tab-list {
    width: auto;
    max-width: calc(100% - 40px);
    line-height: size(40);
    display: flex;
    height: size(40);
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
      width: size(5);
      height: size(5);
      display: none;
    }

    &::-webkit-scrollbar-thumb {
      background: $gray-500;
    }

    .item {
      display: flex;
      align-items: center;
      position: relative;
      font-size: 12px;
      flex: 0 0 auto;
      width: 200px;
      cursor: default;
      padding: 0 size(10);
      border-right: 1px solid $gray-400;
      background: rgb(222, 225, 230);

      .item-text {
        display: inline-block;
        width: size(130);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        // font-size: fz(12);
        &.unfixed {
          // font-family: Verdana, sans-serif;
          // font-style: italic;
          transform: skewX(-10deg);
        }
      }

      &:hover {
        background: #e2e2e2;
      }

      .iconfont {
        font-size: 16px;
        display: flex;
        align-items: center;
      }

      &.active {
        background: #f0f3fa;
      }
    }

    .operaion {
      position: absolute;
      right: 0;
      width: size(25);
      height: 100%;
      cursor: pointer;

      &:hover>.has-change {
        display: none;
      }

      &:hover>.close {
        display: inline-flex !important;
      }

      .close {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        cursor: pointer;
        line-height: 1.5;
        width: size(20);
        height: size(20);
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        z-index: 1;
        font-size: fz(16);

        &:hover {
          background: #ccc;
        }
      }

      .has-change {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: size(20);
        height: size(20);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        z-index: 2;

        .dot {
          width: size(10);
          height: size(10);
          border-radius: 50%;
          background: mix($teal, $white, 90%);
        }
      }
    }
  }

  .add-tab {
    display: flex;
    align-items: center;
    justify-content: center;
    width: size(40);
    height: size(40);

    .el-icon {
      width: size(30);
      height: size(30);
      transition: background .3s;
      border-radius: 50%;

      &:hover {
        background-color: $gray-400;
      }
    }
  }

  //滚动条样式
  .el-scrollbar__bar {
    bottom: 0;
  }
}
</style>
