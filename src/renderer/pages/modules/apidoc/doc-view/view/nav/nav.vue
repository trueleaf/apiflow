/*
    创建者：shuxiaokai
    创建时间：2021-07-21 22:30
    模块名称：导航栏
    备注：
*/
<template>
  <div class="nav">
    <div class="tab-wrap">
      <div class="btn left" @click="handleMoveLeft">
        <el-icon :size="16">
          <icon-arrow-left />
        </el-icon>
      </div>
      <!-- https://github.com/element-plus/element-plus/issues/2293 -->
      <div ref="tabList" class="tab-list">
        <s-draggable ref="tabListWrap" v-model="tabs" animation="150" item-key="name" group="operation" class="d-flex">
          <template #item="{ element }">
            <div
              :title="element.label"
              class="item"
              :class="{active: element.selected}"
              @click="selectCurrentTab(element)"
              @dblclick="fixCurrentTab(element)"
              @contextmenu.stop.prevent="handleContextmenu($event, element)"
            >
              <!-- 接口文档 -->
              <template v-if="element.tabType === 'doc'">
                <template v-for="(req) in requestMethods">
                  <span v-if="element.head.icon.toLowerCase() === req.value.toLowerCase()" :key="req.value" class="mr-2" :style="{color: req.iconColor}">{{ req.name }}</span>
                </template>
              </template>
              <!-- 其他 -->
              <template v-else>
                <!-- 配置 -->
                <el-icon v-if="element.tabType === 'config'" class="mr-2" :size="16">
                  <icon-setting />
                </el-icon>
                <!-- 参数模板 -->
                <el-icon v-if="element.tabType === 'paramsTemplate'" class="mr-2" :size="16">
                  <icon-setting />
                </el-icon>
                <!-- 链接 -->
                <el-icon v-if="element.tabType === 'onlineLink'" class="orange mr-2" :size="16">
                  <icon-link />
                </el-icon>
                <!-- 导出文档 -->
                <el-icon v-if="element.tabType === 'exportDoc'" class="green mr-2" :size="16">
                  <icon-share />
                </el-icon>
                <!-- 导入文档 -->
                <el-icon v-if="element.tabType === 'importDoc'" class="red mr-2" :size="16">
                  <icon-download />
                </el-icon>
                <!-- 操作审计 -->
                <el-icon v-if="element.tabType === 'history'" class="blue mr-2" :size="16">
                  <icon-timer />
                </el-icon>
                <!-- 全局变量配置 -->
                <span v-if="element.tabType === 'variable'" class="iconfont iconvariable blue f-base mr-2"></span>
                <!-- mock管理 -->
                <el-icon v-if="element.tabType === 'mock'" class="teal mr-2" :size="16">
                  <icon-coffee-cup />
                </el-icon>
                <!-- 回收站管理 -->
                <el-icon v-if="element.tabType === 'recycler'" class="red mr-2" :size="16">
                  <icon-delete-filled />
                </el-icon>
                <!-- 联想参数 -->
                <el-icon v-if="element.tabType === 'mindParams'" class="blue mr-2" :size="16">
                  <icon-opportunity />
                </el-icon>
              </template>
              <span class="item-text" :class="{ unfixed: !element.fixed }">{{ element.label }}</span>
              <span class="operaion">
                <span v-show="!element.saved" class="has-change">
                  <span class="dot"></span>
                </span>
                <el-icon v-show="element.saved" class="close" :size="16" @click.stop="handleCloseCurrentTab(element)">
                  <icon-close />
                </el-icon>
              </span>
            </div>
          </template>
        </s-draggable>
      </div>
      <!-- <el-scrollbar ref="scrollBar" view-style="display:inline-block;">
            </el-scrollbar> -->
      <div class="btn right" @click="handleMoveRight">
        <el-icon :size="16">
          <icon-arrow-right />
        </el-icon>
      </div>
    </div>
  </div>
  <teleport to="body">
    <!-- 单个节点操作 -->
    <s-contextmenu v-if="showContextmenu" :left="contextmenuLeft" :top="contextmenuTop">
      <s-contextmenu-item :label="t('关闭')" hot-key="Ctrl + W" @click="handleCloseCurrentTab"></s-contextmenu-item>
      <s-contextmenu-item :label="t('关闭左侧')" @click="handleCloseLeftTab"></s-contextmenu-item>
      <s-contextmenu-item :label="t('关闭右侧')" @click="handleCloseRightTab"></s-contextmenu-item>
      <s-contextmenu-item :label="t('关闭其他')" @click="handleCloseOtherTab"></s-contextmenu-item>
      <s-contextmenu-item :label="t('全部关闭')" @click="handleCloseAllTab"></s-contextmenu-item>
      <s-contextmenu-item v-if="!isView" :label="t('强制全部关闭')" @click="handleForceCloseAllTab"></s-contextmenu-item>
      <!-- <s-contextmenu-item v-if="currentOperationNode && currentOperationNode.tabType === 'doc'" type="divider"></s-contextmenu-item> -->
      <!-- <s-contextmenu-item v-if="currentOperationNode && currentOperationNode.tabType === 'doc'" :label="t('复制url')"></s-contextmenu-item>
            <s-contextmenu-item v-if="currentOperationNode && currentOperationNode.tabType === 'doc'" :label="t('刷新')"></s-contextmenu-item> -->
    </s-contextmenu>
  </teleport>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import draggable from 'vuedraggable'
import { Setting, Link, Share, Download, Timer, CoffeeCup, DeleteFilled, Opportunity, Close, ArrowRight, ArrowLeft } from '@element-plus/icons-vue'
import type { ApidocTab } from '@src/types/store'
import { event } from '@/helper/index'

export default defineComponent({
  components: {
    's-draggable': draggable,
    'icon-setting': Setting,
    'icon-link': Link,
    'icon-share': Share,
    'icon-download': Download,
    'icon-timer': Timer,
    'icon-coffee-cup': CoffeeCup,
    'icon-delete-filled': DeleteFilled,
    'icon-opportunity': Opportunity,
    'icon-close': Close,
    'icon-arrow-right': ArrowRight,
    'icon-arrow-left': ArrowLeft,
  },
  data() {
    return {
      moveLeft: 0,
      showContextmenu: false,
      contextmenuLeft: 0,
      contextmenuTop: 0,
      currentOperationNode: null as ApidocTab | null,
    };
  },
  computed: {
    tabs: {
      get(): ApidocTab[] {
        const projectId = this.$route.query.id as string;
        return this.$store.state['apidoc/tabs'].tabs[projectId]
      },
      set(val: ApidocTab) { //拖拽tabs会导致数据写入
        this.$store.commit('apidoc/tabs/updateAllTabs', {
          projectId: this.$route.query.id,
          tabs: val,
        });
      },
    },
    requestMethods() {
      return this.$store.state['apidoc/baseInfo'].rules.requestMethods
    },
    isView() {
      return this.$store.state['apidoc/baseInfo'].mode === 'view'
    },
  },
  mounted() {
    document.body.addEventListener('click', this.bindGlobalClick);
    document.body.addEventListener('contextmenu', this.bindGlobalClick);
    this.$store.commit('apidoc/tabs/initLocalTabs', {
      projectId: this.$route.query.id,
    });
    this.initViewTab();
  },
  beforeUnmount() {
    document.body.removeEventListener('click', this.bindGlobalClick);
    document.body.removeEventListener('contextmenu', this.bindGlobalClick);
    event.off('apidoc/tabs/addOrDeleteTab');
  },
  methods: {
    //初始化active的tab
    initViewTab() {
      setTimeout(() => {
        const tabWrap = (this.$refs.tabListWrap as { $el: HTMLLIElement}).$el;
        const activeNode = tabWrap.querySelector('.item.active') as HTMLElement | null;
        activeNode?.scrollIntoView();
      })
      event.on('apidoc/tabs/addOrDeleteTab', () => {
        setTimeout(() => {
          const tabWrap = (this.$refs.tabListWrap as { $el: HTMLLIElement}).$el;
          const activeNode = tabWrap.querySelector('.item.active') as HTMLElement | null;
          activeNode?.scrollIntoView();
        })
      });
    },
    //绑定全局点击
    bindGlobalClick() {
      this.showContextmenu = false;
    },
    handleMoveLeft() {
      console.log('left')
    },
    handleMoveRight() {
      console.log('right')
    },
    //=====================================contextmenu====================================//
    handleContextmenu(e: MouseEvent, item: ApidocTab) {
      this.currentOperationNode = item;
      this.contextmenuLeft = e.clientX;
      this.contextmenuTop = e.clientY;
      this.showContextmenu = true;
    },
    //关闭当前tab
    handleCloseCurrentTab(element: ApidocTab) {
      const projectId = this.$route.query.id;
      const currentOperationNodeId = this.currentOperationNode?._id || ''
      const tabId: string = element ? element._id : currentOperationNodeId;
      this.$store.dispatch('apidoc/tabs/deleteTabByIds', {
        projectId,
        ids: [tabId]
      });
    },
    //关闭其他
    handleCloseOtherTab() {
      const currentOperationNodeId = this.currentOperationNode?._id;
      const projectId: string = this.$route.query.id as string;
      const tabs = this.$store.state['apidoc/tabs'].tabs[projectId];
      const delTabs: string[] = [];
      tabs.forEach((tab) => {
        if (tab._id !== currentOperationNodeId) {
          delTabs.push(tab._id);
        }
      })
      this.$store.dispatch('apidoc/tabs/deleteTabByIds', {
        projectId,
        ids: delTabs
      });
    },
    //关闭左侧
    handleCloseLeftTab() {
      const currentOperationNodeId = this.currentOperationNode?._id;
      const projectId: string = this.$route.query.id as string;
      const tabs = this.$store.state['apidoc/tabs'].tabs[projectId];
      const delTabs: string[] = [];
      for (let i = 0; i < tabs.length; i += 1) {
        if (tabs[i]._id !== currentOperationNodeId) {
          delTabs.push(tabs[i]._id);
        } else {
          break;
        }
      }
      this.$store.dispatch('apidoc/tabs/deleteTabByIds', {
        projectId,
        ids: delTabs
      });
    },
    //关闭右侧
    handleCloseRightTab() {
      const currentOperationNodeId = this.currentOperationNode?._id;
      const projectId: string = this.$route.query.id as string;
      const tabs = this.$store.state['apidoc/tabs'].tabs[projectId];
      const currentNodeIndex = tabs.findIndex((tab) => tab._id === currentOperationNodeId);
      const delTabs: string[] = [];
      for (let i = currentNodeIndex + 1; i < tabs.length; i += 1) {
        delTabs.push(tabs[i]._id);
      }
      this.$store.dispatch('apidoc/tabs/deleteTabByIds', {
        projectId,
        ids: delTabs
      });
    },
    //关闭全部
    handleCloseAllTab() {
      const projectId: string = this.$route.query.id as string;
      const tabs = this.$store.state['apidoc/tabs'].tabs[projectId];
      this.$store.dispatch('apidoc/tabs/deleteTabByIds', {
        projectId,
        ids: tabs.map((v) => v._id)
      });
    },
    //不保存关闭全部
    handleForceCloseAllTab() {
      const projectId: string = this.$route.query.id as string;
      this.$store.commit('apidoc/tabs/forceDeleteAllTab', projectId);
    },
    //选中当前tab
    selectCurrentTab(element: ApidocTab) {
      const projectId = this.$route.query.id;
      this.$store.commit('apidoc/tabs/selectTabById', {
        projectId,
        id: element._id
      });
    },
    //固定当前tab
    fixCurrentTab(element: ApidocTab) {
      const projectId = this.$route.query.id;
      this.$store.commit('apidoc/tabs/fixedTab', {
        _id: element._id,
        projectId,
      })
    },
  },
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
        display: flex;
        overflow-x: hidden;
        overflow-y: hidden;
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
        width: 100%;
        line-height: 40px;
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
            width: size(5);
            height: size(5);
            display: none;
        }
        &::-webkit-scrollbar-thumb  {
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
            .item-text {
                display: inline-block;
                width: size(150);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                // font-size: fz(12);
                &.unfixed {
                    font-style: oblique;
                }
            }
            background: rgb(222, 225, 230);
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
            &:hover > .has-change {
                display: none;
            }
            &:hover > .close {
                display: inline-flex!important;
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
    //滚动条样式
    .el-scrollbar__bar {
        bottom: 0;
    }
}
</style>
