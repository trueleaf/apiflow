<template>
  <SResizeX :min="280" :max="450" :width="300" name="banner" class="banner" tabindex="1">
    <SLoading :loading="loading" class="tree-wrap" @contextmenu.prevent="handleWrapContextmenu">
      <el-tree 
        ref="docTree" 
        :class="{ 'show-more': showMoreNodeInfo }" 
        :data="bannerData"
        :default-expanded-keys="defaultExpandedKeys" 
        node-key="_id" 
        :empty-text="t('暂无数据')"
        :filter-node-method="filterNode"
        @node-contextmenu="handleShowContextmenu">
        <template #default="scope">
          <div class="custom-tree-node" :class="{
            'select-node': selectNodes.find(v => v._id === scope.data._id),
            'active-node': activeNode && activeNode._id === scope.data._id,
            'readonly': scope.data.readonly
          }" tabindex="0" @keydown.stop="handleNodeKeydown($event)"
            @mouseenter.stop="handleNodeHover" @click="handleClickNode($event, scope.data)"
            @dblclick="handleDbclickNode(scope.data)">
            <!-- file渲染 -->
            <template v-if="!scope.data.isFolder">
              <template v-for="(req) in projectInfo.rules.requestMethods">
                <span v-if="scope.data.method.toLowerCase() === req.value.toLowerCase()" :key="req.name"
                  class="file-icon" :style="{ color: req.iconColor }">{{ req.name }}</span>
              </template>
              <div class="node-label-wrap">
                <SEmphasize class="node-top" :title="scope.data.name" :value="scope.data.name" :keyword="filterString">
                </SEmphasize>
                <SEmphasize v-show="showMoreNodeInfo" class="node-bottom" :title="scope.data.url"
                  :value="scope.data.url" :keyword="filterString"></SEmphasize>
              </div>
            </template>
            <!-- 文件夹渲染 -->
            <template v-if="scope.data.isFolder">
              <i class="iconfont folder-icon iconweibiaoti-_huabanfuben"></i>
              <div class="node-label-wrap">
                <SEmphasize class="node-top" :title="scope.data.name" :value="scope.data.name" :keyword="filterString">
                </SEmphasize>
                <div v-show="showMoreNodeInfo" class="node-bottom">{{ scope.data.url }}</div>
              </div>
            </template>
          </div>
        </template>
      </el-tree>
    </SLoading>
  </SResizeX>
</template>

<script lang="ts" setup>
import { computed, ref, Ref, onMounted, onUnmounted, watch } from 'vue'
import type { ApidocBanner } from '@src/types/global'
import { router } from '@/router/index'
import { t } from 'i18next'
import SResizeX from '@/components/common/resize/g-resize-x.vue'
import SLoading from '@/components/common/loading/g-loading.vue'
import SEmphasize from '@/components/common/emphasize/g-emphasize.vue'
import { TreeNodeOptions } from 'element-plus/es/components/tree/src/tree.type.mjs'
import { useApidocBaseInfo } from '@/store/apidoc/base-info'
import { useApidocBanner } from '@/store/apidoc/banner'
import { useApidocTas } from '@/store/apidoc/tabs'
import { useShareBannerData } from './composables/banner-data'

//搜索数据
type SearchData = {
  //接口名称或者接口路径
  iptValue: string,
  //限制最近访问数据id集合
  recentNumIds: string[] | null,
};
//带projectId的banner数据
type ApidocBannerWithProjectId = ApidocBanner & { projectId: string }

/*
|--------------------------------------------------------------------------
| 变量、函数等内容声明
| 获取banner数据
| 获取项目基本信息
|--------------------------------------------------------------------------
*/
const shareId = ref(router.currentRoute.value.query.share_id as string);
const docTree: Ref<TreeNodeOptions['store'] | null | TreeNodeOptions> = ref(null);
const selectNodes: Ref<ApidocBannerWithProjectId[]> = ref([]); //当前选中节点
const showMoreNodeInfo = ref(false); //banner是否显示更多内容
const defaultExpandedKeys = ref<string[]>([]);

const apidocBaseInfoStore = useApidocBaseInfo();
const apidocBannerStore = useApidocBanner();
const apidocTabsStore = useApidocTas();

// 使用分享banner数据composable
const { getBannerData, loading, bannerData } = useShareBannerData(shareId.value);

// 监听shareId变化，重新获取数据
watch(shareId, (newShareId) => {
  if (newShareId) {
    getBannerData();
  }
});

const projectInfo = computed(() => {
  return {
    _id: apidocBaseInfoStore._id,
    layout: apidocBaseInfoStore.layout,
    paramsTemplate: apidocBaseInfoStore.paramsTemplate,
    webProxy: apidocBaseInfoStore.webProxy,
    mode: apidocBaseInfoStore.mode,
    commonHeaders: apidocBaseInfoStore.commonHeaders,
    rules: apidocBaseInfoStore.rules,
    mindParams: apidocBaseInfoStore.mindParams,
    hosts: apidocBaseInfoStore.hosts,
    globalCookies: apidocBaseInfoStore.globalCookies,
  }
});

const activeNode = computed(() => apidocTabsStore.tabs[shareId.value]?.find((v) => v.selected));

/*
|--------------------------------------------------------------------------
| 鼠标移动到banner节点，显示更多操作。
| 鼠标右键显示更多操作
| 鼠标左键选中节点
|--------------------------------------------------------------------------
*/
const currentOperationalNode: Ref<ApidocBanner | null> = ref(null); //点击工具栏按钮或者空白处右键这个值为null
const showContextmenu = ref(false); //是否显示contextmenu
const contextmenuLeft = ref(0); //contextmenu left值
const contextmenuTop = ref(0); //contextmenu top值

const handleShowContextmenu = (e: MouseEvent, data: ApidocBanner) => {
  if (selectNodes.value.length < 2) { //处理单个节点
    selectNodes.value = [{
      ...data,
      projectId: shareId.value,
    }];
  }
  showContextmenu.value = true;
  contextmenuLeft.value = e.clientX;
  contextmenuTop.value = e.clientY;
  currentOperationalNode.value = data;
}

const handleWrapContextmenu = (e: MouseEvent) => {
  selectNodes.value = [];
  currentOperationalNode.value = null;
  showContextmenu.value = true;
  contextmenuLeft.value = e.clientX;
  contextmenuTop.value = e.clientY;
}

/*
|--------------------------------------------------------------------------
| 节点点击和交互
|--------------------------------------------------------------------------
*/
//点击节点
const handleClickNode = (e: MouseEvent, data: ApidocBanner) => {
  showContextmenu.value = false;
  currentOperationalNode.value = data;
  selectNodes.value = [{
    ...data,
    projectId: shareId.value,
  }];
  if (!data.isFolder) {
    apidocTabsStore.addTab({
      _id: data._id,
      projectId: shareId.value,
      tabType: 'doc',
      label: data.name,
      saved: true,
      fixed: false,
      selected: true,
      head: {
        icon: data.method,
        color: ""
      },
    })
  }
}

//双击节点固定这个节点
const handleDbclickNode = (data: ApidocBanner) => {
  if (data.isFolder) {
    return;
  }
  apidocTabsStore.fixedTab({
    _id: data._id,
    projectId: shareId.value,
  })
}

//鼠标放到节点上面
const handleNodeHover = (e: MouseEvent) => {
  (e.currentTarget as HTMLElement).focus({ preventScroll: true }); //使其能够触发keydown事件
}

/*
|--------------------------------------------------------------------------
| 节点过滤
|--------------------------------------------------------------------------
*/
const filterString = ref('');
//过滤节点
const filterNode = (filterInfo: SearchData, data: Record<string, unknown>): boolean => {
  if (!filterInfo.iptValue && !filterInfo.recentNumIds) {
    const treeRef = docTree.value as TreeNodeOptions;
    Object.keys(treeRef.store.nodesMap).map((key) => {
      treeRef.store.nodesMap[key].expanded = false
    })
    showMoreNodeInfo.value = false;
    return true;
  }
  const matchedUrl = filterInfo.iptValue ? (data as ApidocBanner).url?.match(filterInfo.iptValue) : false;
  const matchedDocName = filterInfo.iptValue ? (data as ApidocBanner).name.match(filterInfo.iptValue) : false;
  const matchedOthers = filterInfo.recentNumIds ? filterInfo.recentNumIds.find(v => v === (data as ApidocBanner)._id) : false;
  showMoreNodeInfo.value = true;
  return (!!matchedUrl || !!matchedDocName) || !!matchedOthers;
}

/*
|--------------------------------------------------------------------------
| 其他操作
|--------------------------------------------------------------------------
*/
//处理节点上面键盘事件
const handleNodeKeydown = (e: KeyboardEvent) => {
  // 分享模式下不处理编辑相关的快捷键
}

const handleGlobalClick = () => {
  showContextmenu.value = false;
  selectNodes.value = [];
}

onMounted(() => {
  getBannerData();
  document.documentElement.addEventListener('click', handleGlobalClick);
})

onUnmounted(() => {
  document.documentElement.removeEventListener('click', handleGlobalClick);
})
</script>

<style lang='scss'>
.banner {
  flex: 0 0 auto;
  height: 100%;
  border-right: 1px solid $gray-400;
  display: flex;
  flex-direction: column;
  position: relative;

  //树形组件包裹框
  .tree-wrap {
    height: calc(100vh - #{size(150)});
    overflow-y: auto;
  }

  // 自定义节点
  .custom-tree-node {
    display: flex;
    align-items: center;
    width: 100%;
    overflow: hidden;
    min-height: size(30);

    .file-icon {
      font-size: fz(14);
      margin-right: size(5);
    }

    .folder-icon {
      color: $yellow;
      flex: 0 0 auto;
      width: size(16);
      height: size(16);
      margin-right: size(5);
    }

    .node-label-wrap {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;

      .node-top {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .node-bottom {
        color: $gray-500;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    &.active-node {
      background-color: lighten($theme-color, 30%);
    }

    &.select-node {
      background-color: lighten($theme-color, 20%);
    }

    &.readonly {
      color: $gray-600;

      .file-icon {
        color: $gray-600 !important;
      }

      .folder-icon {
        color: $gray-500 !important;
      }
    }
  }

  // 禁用动画提高性能
  .el-collapse-transition-enter-active,
  .el-collapse-transition-leave-active {
    transition: none !important;
  }

  // 节点展示更多信息
  .show-more {
    .el-tree-node__content {
      align-items: flex-start;

      &>.el-tree-node__expand-icon {
        padding-top: size(4);
      }
    }

    .custom-tree-node {
      align-items: flex-start;
    }

    .file-icon {
      margin-top: size(2);
    }
  }

  .el-tree-node__content {
    height: auto;
    display: flex;
    align-items: center;
  }

  .el-tree-node__content>.el-tree-node__expand-icon {
    transition: none; //去除所有动画
    padding-top: 0;
    padding-bottom: 0;
    margin-top: -1px;
  }
}
</style>
