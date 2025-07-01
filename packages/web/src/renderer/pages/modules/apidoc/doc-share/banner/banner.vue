<template>
  <SResizeX :min="280" :max="450" :width="300" name="banner" class="banner" tabindex="1">
    <!-- 添加项目名称和搜索框 -->
    <div class="tool">
      <div class="d-flex a-center j-center">
        <h2 v-if="projectName" class="gray-700 f-lg text-center text-ellipsis" :title="projectName">{{ projectName }}</h2>
        <h2 v-else class="gray-700 f-lg text-center text-ellipsis" :title="projectName">/</h2>
      </div>
      <div class="p-relative">
        <el-input v-model="searchValue" size="large" class="doc-search" :placeholder="$t('文档名称、文档url')" clearable></el-input>
      </div>
    </div>
    <SLoading :loading="loading" class="tree-wrap">
      <el-tree 
        ref="docTree" 
        :class="{ 'show-more': showMoreNodeInfo }" 
        :data="bannerData"
        :default-expanded-keys="defaultExpandedKeys" 
        node-key="_id" 
        :empty-text="$t('暂无数据')"
        :filter-node-method="filterNode">
        <template #default="scope">
          <div class="custom-tree-node" :class="{
            'active-node': activeNode && activeNode._id === scope.data._id,
            'readonly': scope.data.readonly
          }" tabindex="0"
            @click="handleClickNode($event, scope.data)"
            @dblclick="handleDbclickNode(scope.data)">
            <!-- file渲染 -->
            <template v-if="!scope.data.isFolder">
              <template v-for="(req) in requestMethods">
                <span 
                  v-if="scope.data.method.toLowerCase() === req.value.toLowerCase()" :key="req.name"
                  class="file-icon" :style="{ color: req.iconColor }">{{ req.name }}</span>
              </template>
              <div class="node-label-wrap">
                <SEmphasize class="node-top" :title="scope.data.name" :value="scope.data.name" :keyword="searchValue"></SEmphasize>
                <SEmphasize v-show="showMoreNodeInfo" class="node-bottom" :title="scope.data.url"
                  :value="scope.data.url" :keyword="searchValue"></SEmphasize>
              </div>
            </template>
            <!-- 文件夹渲染 -->
            <template v-if="scope.data.isFolder">
              <i class="iconfont folder-icon iconweibiaoti-_huabanfuben"></i>
              <div class="node-label-wrap">
                <SEmphasize class="node-top" :title="scope.data.name" :value="scope.data.name" :keyword="searchValue">
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
import { computed, ref, Ref, onMounted, watch } from 'vue'
import type { ApidocBanner } from '@src/types/global'
import { router } from '@/router/index'
import SResizeX from '@/components/common/resize/g-resize-x.vue'
import SLoading from '@/components/common/loading/g-loading.vue'
import SEmphasize from '@/components/common/emphasize/g-emphasize.vue'
import { TreeNodeOptions } from 'element-plus/es/components/tree/src/tree.type.mjs'
import { useApidocTas } from '@/store/apidoc/tabs'
import { useShareBannerData } from './composables/banner-data'
import { $t } from '@/i18n/i18n'
import { defaultRequestMethods } from '../common'

/*
|--------------------------------------------------------------------------
| 变量、函数等内容声明
| 获取banner数据
| 获取项目基本信息
|--------------------------------------------------------------------------
*/
const shareId = ref(router.currentRoute.value.query.share_id as string);
const docTree: Ref<TreeNodeOptions['store'] | null | TreeNodeOptions> = ref(null);
const showMoreNodeInfo = ref(false); //banner是否显示更多内容
const defaultExpandedKeys = ref<string[]>([]);
const apidocTabsStore = useApidocTas();

// 添加项目名称和搜索相关变量
const projectName = ref(router.currentRoute.value.query.projectName as string || '');
const searchValue = ref('');
const requestMethods = ref(defaultRequestMethods);

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
| 节点点击和交互
|--------------------------------------------------------------------------
*/
//点击节点
const handleClickNode = (e: MouseEvent, data: ApidocBanner) => {
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
/*
|--------------------------------------------------------------------------
| 节点过滤
|--------------------------------------------------------------------------
*/
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
})

</script>

<style lang='scss' scoped>
.banner {
  flex: 0 0 auto;
  height: 100%;
  border-right: 1px solid var(--gray-400);
  display: flex;
  flex-direction: column;
  position: relative;

  // 添加tool区域样式
  .tool {
    position: relative;
    padding: 0 size(20);
    height: size(120);
    background: var(--gray-200);
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
      color: var(--yellow);
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
        color: var(--gray-500);
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    &.active-node {
      background-color: #a6d2ff;
    }

    &.select-node {
      background-color: #66b1ff;
    }

    &.readonly {
      color: var(--gray-600);

      .file-icon {
        color: var(--gray-600) !important;
      }

      .folder-icon {
        color: var(--gray-500) !important;
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
