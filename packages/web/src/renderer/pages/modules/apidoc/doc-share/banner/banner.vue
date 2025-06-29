<template>
  <SResizeX :min="280" :max="450" :width="300" name="banner" class="banner" tabindex="1">
    <!-- 添加项目名称和搜索框 -->
    <div class="tool">
      <div class="d-flex a-center j-center">
        <h2 v-if="projectName" class="gray-700 f-lg text-center text-ellipsis" :title="projectName">{{ projectName }}</h2>
        <h2 v-else class="gray-700 f-lg text-center text-ellipsis" :title="projectName">/</h2>
      </div>
      <div class="p-relative">
        <el-input v-model="searchValue" size="large" class="doc-search" :placeholder="t('文档名称、文档url')" clearable
          @change="handleFilterBanner"></el-input>
      </div>
    </div>
    <SLoading :loading="loading" class="tree-wrap">
      <el-tree 
        ref="docTree" 
        :class="{ 'show-more': showMoreNodeInfo }" 
        :data="bannerData"
        :default-expanded-keys="defaultExpandedKeys" 
        node-key="_id" 
        :empty-text="t('暂无数据')"
        :filter-node-method="filterNode">
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
              <template v-for="(req) in requestMethods">
                <span 
                  v-if="scope.data.method.toLowerCase() === req.value.toLowerCase()" :key="req.name"
                  class="file-icon" :style="{ color: req.iconColor }">{{ req.name }}</span>
              </template>
              <div class="node-label-wrap">
                <SEmphasize class="node-top" :title="scope.data.name" :value="scope.data.name" :keyword="filterString"></SEmphasize>
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
import { useApidocTas } from '@/store/apidoc/tabs'
import { useShareBannerData } from './composables/banner-data'

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
const apidocTabsStore = useApidocTas();

// 添加项目名称和搜索相关变量
const projectName = ref(router.currentRoute.value.query.projectName as string || '');
const searchValue = ref('');
const requestMethods = ref([
  {
    "name": "GET",
    "value": "GET",
    "iconColor": "#28a745",
  },
  {
    "name": "POST",
    "value": "POST",
    "iconColor": "#ffc107",
  },
  {
    "name": "PUT",
    "value": "PUT",
    "iconColor": "#409EFF",
  },
  {
    "name": "DEL",
    "value": "DELETE",
    "iconColor": "#f56c6c",
  },
  {
    "name": "PATCH",
    "value": "PATCH",
    "iconColor": "#17a2b8",
  },
  {
    "name": "HEAD",
    "value": "HEAD",
    "iconColor": "#17a2b8",
  },
  {
    "name": "OPTIONS",
    "value": "OPTIONS",
    "iconColor": "#17a2b8",
  },
  {
    "name": "Test",
    "value": "Test",
    "iconColor": "#17a2b8",
  }
])

// 使用分享banner数据composable
const { getBannerData, loading, bannerData } = useShareBannerData(shareId.value);

// 监听shareId变化，重新获取数据
watch(shareId, (newShareId) => {
  if (newShareId) {
    getBannerData();
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
const filterNode = (value: string, data: Record<string, unknown>): boolean => {
  if (!value) {
    showMoreNodeInfo.value = false;
    return true;
  }
  const matchedUrl = (data as ApidocBanner).url?.toLowerCase().includes(value.toLowerCase());
  const matchedDocName = (data as ApidocBanner).name.toLowerCase().includes(value.toLowerCase());
  showMoreNodeInfo.value = true;
  return !!matchedUrl || !!matchedDocName;
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

// 添加搜索过滤功能
const handleFilterBanner = () => {
  filterString.value = searchValue.value;
  // 使用 Element Plus Tree 组件的 filter 方法
  if (docTree.value) {
    (docTree.value as any).filter(searchValue.value);
  }
}

// 监听URL中的projectName变化
watch(() => router.currentRoute.value.query.projectName, (newProjectName) => {
  if (newProjectName) {
    projectName.value = newProjectName as string;
  }
});

// 监听搜索值变化，自动触发过滤
watch(searchValue, (newValue) => {
  if (docTree.value) {
    (docTree.value as any).filter(newValue);
  }
});

onMounted(() => {
  getBannerData();
  document.documentElement.addEventListener('click', handleGlobalClick);
})

onUnmounted(() => {
  document.documentElement.removeEventListener('click', handleGlobalClick);
})
</script>

<style lang='scss' scoped>
.banner {
  flex: 0 0 auto;
  height: 100%;
  border-right: 1px solid $gray-400;
  display: flex;
  flex-direction: column;
  position: relative;

  // 添加tool区域样式
  .tool {
    position: relative;
    padding: 0 size(20);
    height: size(120);
    background: $gray-200;
    flex: 0 0 auto;
    // 搜索框样式
    .doc-search {
      .el-input__wrapper {
        border-radius: 20px;
      }
    }
  }

  //树形组件包裹框
  .tree-wrap {
    height: calc(100vh - #{size(135)});
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
