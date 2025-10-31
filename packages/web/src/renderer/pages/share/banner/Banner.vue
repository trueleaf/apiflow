<template>
  <SResizeX :min="280" :max="450" :width="300" name="banner" class="banner" tabindex="1">
    <!-- 添加项目名称和搜索框 -->
    <div class="tool">
      <div class="d-flex a-center j-center">
        <h2 v-if="projectName" class="gray-700 f-lg text-center text-ellipsis" :title="projectName">{{ projectName }}</h2>
        <h2 v-else class="gray-700 f-lg text-center text-ellipsis" :title="projectName">/</h2>
      </div>
      <div class="p-relative">
        <el-input v-model="searchValue" size="large" class="doc-search" :placeholder="t('文档名称、文档url')" clearable></el-input>
      </div>
    </div>
    <div class="tree-wrap">
      <el-tree 
        ref="docTree" 
        :class="{ 'show-more': showMoreNodeInfo }" 
        :data="bannerData"
        node-key="_id" 
        :empty-text="t('暂无数据')"
        :default-expanded-keys="defaultExpandedKeys"
        :filter-node-method="filterNode">
        <template #default="scope">
          <div class="custom-tree-node" :class="{
            'active-node': activeNode && activeNode._id === scope.data._id,
            'readonly': scope.data.readonly
          }" tabindex="0"
            @click="handleClickNode($event, scope.data)"
            @dblclick="handleDbclickNode(scope.data)">
            <!-- http接口渲染 -->
            <template v-if="scope.data.type === 'http'">
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
            <!-- websocket接口渲染 -->
            <template v-if="scope.data.type === 'websocket'">
              <span class="file-icon">{{ scope.data.protocol }}</span>
              <div class="node-label-wrap">
                <SEmphasize class="node-top" :title="scope.data.name" :value="scope.data.name" :keyword="searchValue"></SEmphasize>
                <SEmphasize v-show="showMoreNodeInfo" class="node-bottom" :title="scope.data.url.path"
                  :value="scope.data.url.path" :keyword="searchValue"></SEmphasize>
              </div>
            </template>
            <!-- 文件夹渲染 -->
            <template v-if="scope.data.type === 'folder'">
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
    </div>
  </SResizeX>
</template>

<script lang="ts" setup>
import { computed, ref, Ref, watch } from 'vue'
import type { ApidocBanner } from '@src/types'
import type { ApidocTab } from '@src/types/share/tabs'
import SResizeX from '@/components/common/resize/GResizeX.vue'
import SEmphasize from '@/components/common/emphasize/GEmphasize.vue'
import { TreeNodeOptions } from 'element-plus/es/components/tree/src/tree.type.mjs'
import { useShareStore } from '../store/index'
import { defaultRequestMethods } from '../common'
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n'
/*
|--------------------------------------------------------------------------
| 变量定义
|--------------------------------------------------------------------------
*/
const route = useRoute();
const shareStore = useShareStore();
const shareId = route.query?.share_id as string || 'local_share';
const docTree: Ref<TreeNodeOptions['store'] | null | TreeNodeOptions> = ref(null);
const { t } = useI18n()

const showMoreNodeInfo = ref(false); //banner是否显示更多内容
// 添加项目名称和搜索相关变量
const searchValue = ref('');
const requestMethods = ref(defaultRequestMethods);
const bannerData = computed(() => shareStore.banner);
const activeNode = computed(() => shareStore.tabs[shareId]?.find((v: ApidocTab) => v.selected));
const projectName = computed(() => shareStore.project.projectName);
const defaultExpandedKeys = computed(() => activeNode.value ? [activeNode.value._id] : []);
/*
|--------------------------------------------------------------------------
| 初始化数据获取逻辑
|--------------------------------------------------------------------------
*/

//点击节点
const handleClickNode = (_: MouseEvent, data: ApidocBanner) => {
  if (data.type === 'http') {
    shareStore.addTab({
      _id: data._id,
      projectId: shareId,
      tabType: 'http',
      label: data.name,
      saved: true,
      fixed: false,
      selected: true,
      head: {
        icon: data.method,
        color: ""
      },
    })
  } else if (data.type === 'websocket') {
    shareStore.addTab({
      _id: data._id,
      projectId: shareId,
      tabType: 'websocket',
      label: data.name,
      saved: true,
      fixed: false,
      selected: true,
      head: {
        icon: data.protocol,
        color: ""
      },
    })
  }
}
//双击节点固定这个节点
const handleDbclickNode = (data: ApidocBanner) => {
  if (data.type === 'folder') {
    return;
  }
  shareStore.fixedTab({
    _id: data._id,
    shareId: shareId,
  })
}
//过滤节点
const filterNode = (value: string, data: Record<string, unknown>): boolean => {
  if (!value) {
    showMoreNodeInfo.value = false;
    return true;
  }
  const bannerData = data as ApidocBanner;
  const matchedUrl = bannerData.type === 'http' 
    ? bannerData.url?.toLowerCase().includes(value.toLowerCase())
    : bannerData.type === 'websocket'
      ? bannerData.url.path?.toLowerCase().includes(value.toLowerCase())
      : false;
  const matchedDocName = bannerData.name.toLowerCase().includes(value.toLowerCase());
  showMoreNodeInfo.value = true;
  return !!matchedUrl || !!matchedDocName;
}

// 监听搜索值变化，自动触发过滤
watch(searchValue, (newValue) => {
  if (docTree.value) {
    (docTree.value as any).filter(newValue);
  }
});
</script>

<style lang='scss'>
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
    padding: 0 20px;
    height: 120px;
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
    height: calc(100vh - 195px);
    overflow-y: auto;
  }

  // 自定义节点
  .custom-tree-node {
    display: flex;
    align-items: center;
    width: 100%;
    overflow: hidden;
    min-height: 30px;

    .file-icon {
      font-size: 14px;
      margin-right: 5px;
    }

    .folder-icon {
      color: var(--yellow);
      flex: 0 0 auto;
      width: 16px;
      height: 16px;
      margin-right: 5px;
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
      background-color: #a6d2ff;
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
        padding-top: 4px;
      }
    }

    .custom-tree-node {
      align-items: flex-start;
    }

    .file-icon {
      margin-top: 2px;
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
