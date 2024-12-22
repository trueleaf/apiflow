/*
    创建者：shuxiaokai
    创建时间：2021-07-21 21:00
    模块名称：
    备注：
*/
<template>
  <s-resize-x :min="280" :max="450" :width="300" name="banner" class="banner" tabindex="1">
    <s-tool @filter="handleFilterNode"></s-tool>
    <SLoading :loading="loading" class="tree-wrap">
      <el-tree
        ref="docTree"
        :class="{ 'show-more': showMoreNodeInfo }"
        :data="bannerData"
        :default-expanded-keys="defaultExpandedKeys"
        node-key="_id"
        :empty-text="t('点击工具栏按钮新建接口或者鼠标右键新增')"
        :filter-node-method="filterNode"
      >
        <template #default="scope">
          <div
            class="custom-tree-node"
            :class="{
              'active-node': activeNode && activeNode._id === scope.data._id,
            }"
            tabindex="0"
            @click="handleClickNode($event, scope.data)"
            @dblclick="handleDbclickNode(scope.data)"
          >
            <!-- file渲染 -->
            <template v-if="!scope.data.isFolder">
              <template v-for="(req) in projectInfo.rules.requestMethods">
                <span v-if="scope.data.method.toLowerCase() === req.value.toLowerCase()" :key="req.name" class="file-icon" :style="{color: req.iconColor}">{{ req.name }}</span>
              </template>
              <div v-if="editNode?._id !== scope.data._id" class="node-label-wrap">
                <s-emphasize class="node-top" :title="scope.data.name" :value="scope.data.name" :keyword="filterString"></s-emphasize>
                <s-emphasize v-show="showMoreNodeInfo" class="node-bottom" :title="scope.data.url" :value="scope.data.url" :keyword="filterString"></s-emphasize>
              </div>
            </template>
            <!-- 文件夹渲染 -->
            <template v-if="scope.data.isFolder">
              <i class="iconfont folder-icon iconweibiaoti-_huabanfuben"></i>
              <div v-if="editNode?._id !== scope.data._id" class="node-label-wrap">
                <s-emphasize class="node-top" :title="scope.data.name" :value="scope.data.name" :keyword="filterString"></s-emphasize>
                <div v-show="showMoreNodeInfo" class="node-bottom">{{ scope.data.url }}</div>
              </div>
            </template>
          </div>
        </template>
      </el-tree>
    </SLoading>
  </s-resize-x>
</template>

<script lang="ts" setup>
import { computed, ref, Ref } from 'vue'
import type { TreeNodeOptions } from 'element-plus/lib/components/tree/src/tree.type'
import type { ApidocBanner } from '@src/types/global'
import { useStore } from '../../store/index'
import { useBannerData } from './composables/banner-data'
import sTool from './tool/tool.vue'
import shareRouter from '../../router/index'

//搜索数据
type SearchData = {
  /**
     * 接口名称或者接口路径
     */
  iptValue: string,
  /**
     * 限制最近访问数据id集合
     */
  recentNumIds: string[] | null,
};

/*
|--------------------------------------------------------------------------
| 变量、函数等内容声明
| 获取banner数据
| 获取项目基本信息
|--------------------------------------------------------------------------
*/
const store = useStore();
const projectId = shareRouter.currentRoute.value.query.id as string;
const docTree: Ref<TreeNodeOptions['store'] | null | TreeNodeOptions> = ref(null);
const editNode: Ref<ApidocBanner | null> = ref(null); //正在编辑的节点
const showMoreNodeInfo = ref(false); //banner是否显示更多内容

const { loading } = useBannerData();
//默认展开节点
const defaultExpandedKeys = computed(() => store.state['apidoc/banner'].defaultExpandedKeys);
//点击节点，如果按住ctrl则可以多选
const handleClickNode = (e: MouseEvent, data: ApidocBanner) => {
  if (!data.isFolder) {
    store.commit('apidoc/tabs/addTab', {
      _id: data._id,
      projectId,
      tabType: 'doc',
      label: data.name,
      saved: true,
      fixed: false,
      selected: true,
      head: {
        icon: data.method,
      },
    })
  }
}
const projectInfo = computed(() => store.state['apidoc/baseInfo']);
const activeNode = computed(() => store.state['apidoc/tabs'].tabs[projectId]?.find((v) => v.selected));
const bannerData = computed(() => {
  const originBannerData = store.state['apidoc/banner'].banner;
  return originBannerData
})
//双击节点固定这个节点
const handleDbclickNode = (data: ApidocBanner) => {
  store.commit('apidoc/tabs/fixedTab', {
    _id: data._id,
    projectId,
  })
}

/*
|--------------------------------------------------------------------------
| 节点过滤
|--------------------------------------------------------------------------
*/
const filterString = ref('');
//调用过滤方法
const handleFilterNode = (filterInfo: SearchData) => {
  if (docTree.value) {
    (docTree.value as TreeNodeOptions['store']).filter(filterInfo)
  }
  filterString.value = filterInfo.iptValue;
}
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
</script>

<style lang='scss' scoped>
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
    //拖拽指示器样式
    .el-tree-node.is-drop-inner {
        background: mix($theme-color, $white, 70%);
        .custom-tree-node.select-node {
            background-color: mix($theme-color, $white, 70%);
        }
    }
    .el-tree__drop-indicator {
        height: size(3);
    }
    // 自定义节点
    .custom-tree-node {
        display: flex;
        align-items: center;
        width: 100%;
        overflow: hidden;
        min-height: size(30);
        &:hover {
            .more {
                display: block;
            }
        }
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
        //重命名输入框
        .rename-ipt {
            flex: 0 0 75%;
            height: size(22);
            border: 1px solid $theme-color;
            font-size: 1em;
            margin-left: -1px;
            &.error {
                border: 2px solid $red;
            }
        }
        .more {
            display: none;
            flex: 0 0 auto;
            margin-left: auto;
            padding: size(5) size(10);
        }
        &.active-node {
            background-color: lighten($theme-color, 30%);
        }
        &.select-node {
            background-color: lighten($theme-color, 20%);
        }
        &.cut-node {
            color: $gray-500;
            .file-icon {
                color: $gray-500!important;
            }
            .folder-icon {
                color: $gray-300!important;
            }
        }
    }
    // 禁用动画提高性能
    .el-collapse-transition {
        transition: none;
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
        height: 35px;
    }
    .el-tree-node__content>.el-tree-node__expand-icon {
        transition: none; //去除所有动画
        padding-top: 0;
        padding-bottom: 0;
        margin-top: -1px;
    }
}
.banner-popover {
    .op-item {
        @include contextmenu-item;
    }
}
</style>
