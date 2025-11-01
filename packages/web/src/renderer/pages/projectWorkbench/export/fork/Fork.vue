<template>
  <SFieldset :title="t('将当前项目指定文档导出到其他项目')" class="fork">
    <!-- 选择区域 -->
    <div class="fork-wrap">
      <div class="left">
        <span class="orange">
          <span>{{ t("从左侧拖拽文档到右侧，右侧也可以进行简单的拖拽") }}</span>
        </span>
        <el-divider></el-divider>
        <el-tree 
          ref="sourceTree" 
          class="mt-2" 
          :data="sourceTreeData" 
          node-key="_id" 
          draggable 
          :allow-drop="() => false"
          :expand-on-click-node="true" 
          @node-drag-start="handleSourceDragstart"
          @node-drag-over="handleSourceNodeDragOver" 
          @node-drag-end="handleSourceDragend">
          <template #default="scope">
            <div class="custom-tree-node" tabindex="0">
              <!-- file渲染 -->
              <template v-if="scope.data.type !== 'folder'">
                <template v-for="(req) in projectRules.requestMethods">
                  <span
                    v-if="scope.data && scope.data.method && scope.data.method.toLowerCase() === req.value.toLowerCase()"
                    :key="req.name" class="file-icon" :style="{ color: req.iconColor }">{{ req.name }}</span>
                </template>
                <div class="node-label-wrap">
                  <s-emphasize class="node-top" :title="scope.data.name" :value="scope.data.name"></s-emphasize>
                </div>
              </template>
              <!-- 文件夹渲染 -->
              <template v-if="scope.data.type === 'folder'">
                <i class="iconfont folder-icon iconweibiaoti-_huabanfuben"></i>
                <div class="node-label-wrap">
                  <s-emphasize class="node-top" :title="scope.data.name" :value="scope.data.name"></s-emphasize>
                </div>
              </template>
            </div>
          </template>
        </el-tree>
      </div>
      <div ref="target" class="right">
        <div>
          <div class="orange">
            <span>{{ t("鼠标右键可以新增文件夹或者删除文件夹") }}</span>
          </div>
          <el-radio-group v-if="projectEnum.length < 4" v-model="targetProjectId" class="mt-2"
            @change="handleChangeProject">
            <el-radio v-for="(item, index) in projectEnum" :key="index" :value="item._id">{{ item.projectName
              }}</el-radio>
          </el-radio-group>
          <el-select v-else v-model="targetProjectId" :size="config.renderConfig.layout.size" class="mt-2" filterable
            @change="() => handleChangeProject(targetProjectId)">
            <el-option v-for="(item, index) in projectEnum" :key="index" :value="item._id"
              :label="item.projectName"></el-option>
          </el-select>
          <el-divider></el-divider>
          <SLoading :loading="loading" class="project-nav mt-2">
            <el-tree ref="targetTree" :data="targetTreeData" node-key="_id" draggable :allow-drop="checkTargetCouldDrop"
              :expand-on-click-node="true" :empty-text="t('暂无文档，请在项目中添加至少一个文档')" 
              @node-drag-over="handleTargetNodeOver"
              @node-drag-start="handleTargetDragStart" 
              @node-drop="handleTargetDrop" 
              @node-expand="clearContextmenu"
              @node-collapse="clearContextmenu">
              <template #default="scope">
                <div class="custom-tree-node" tabindex="0">
                  <!-- file渲染 -->
                  <template v-if="scope.data.type !== 'folder'">
                    <template v-for="(req) in projectRules.requestMethods">
                      <span v-if="scope.data.method.toLowerCase() === req.value.toLowerCase()" :key="req.name"
                        class="file-icon" :style="{ color: req.iconColor }">{{ req.name }}</span>
                    </template>
                    <div class="node-label-wrap">
                      <s-emphasize class="node-top" :title="scope.data.name" :value="scope.data.name"></s-emphasize>
                    </div>
                  </template>
                  <!-- 文件夹渲染 -->
                  <template v-if="scope.data.type === 'folder'">
                    <i class="iconfont folder-icon iconweibiaoti-_huabanfuben"></i>
                    <div class="node-label-wrap">
                      <s-emphasize class="node-top" :title="scope.data.name" :value="scope.data.name"></s-emphasize>
                    </div>
                  </template>
                </div>
              </template>
            </el-tree>
          </SLoading>
        </div>
      </div>
    </div>
    <!-- <s-add-folder-dialog v-if="dialogVisible" :visible.sync="dialogVisible" :project-id="projectId" :pid="targetAddFolderMountedId" @success="handleAddFileAndFolderCb"></s-add-folder-dialog> -->
  </SFieldset>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted, computed, ComponentPublicInstance, nextTick } from 'vue'
import 'element-plus/es/components/message/style/css';
import { message } from '@/helper'
import type { ApidocBanner, ApidocProjectEnum, CommonResponse } from '@src/types'
import type TreeStore from 'element-plus/lib/components/tree/src/model/tree-store'
import type Node from 'element-plus/lib/components/tree/src/model/node'
import { request } from '@/api/api'
import { findParentById, findSiblingById, forEachForest } from '@/helper/tree'
import { nanoid } from 'nanoid/non-secure'
import { useI18n } from 'vue-i18n'
import { useApidocBaseInfo } from '@/store/share/baseInfoStore';
import { useApidocBanner } from '@/store/share/bannerStore';
import SFieldset from '@/components/common/fieldset/GFieldset.vue'
import SLoading from '@/components/common/loading/GLoading.vue'
import SEmphasize from '@/components/common/emphasize/GEmphasize.vue'
import { config } from '@src/config/config';
// import type { TreeComponentProps }  from "element-plus/lib/components/tree/src/tree.type"

type DragState = {
  dragState: {
    showDropIndicator: boolean,
    allowDrop: boolean,
    draggingNode: Node | null,
    dropNode: Node | null,
    dropType: 'before' | 'after' | 'inner' | 'none' | null,
  }
}
type TreeInstance = DragState & TreeStore & ComponentPublicInstance

/*
|--------------------------------------------------------------------------
| 全局参数，生命周期
|--------------------------------------------------------------------------
*/
const apidocBaseInfoStore = useApidocBaseInfo();
const apidocBannerStore = useApidocBanner();
const projectId = computed(() => apidocBaseInfoStore.projectId);
const projectRules = computed(() => apidocBaseInfoStore.rules);
//目标树数据加载
const { t } = useI18n()
//目标数实例
const targetTree: Ref<(TreeInstance) | null> = ref(null);
//源树组件实例
const sourceTree: Ref<(TreeInstance) | null> = ref(null);
const target: Ref<HTMLElement | null> = ref(null);
//计算并设置高度
const updateHeight = () => {
  if (target.value) {
    const offsetY = target.value.getBoundingClientRect().y;
    target.value.style.setProperty('--height', `${offsetY}px`);
  }
}
/*
|--------------------------------------------------------------------------
| 项目列表信息
|--------------------------------------------------------------------------
*/
const loading = ref(false);
//目标树数据
const targetTreeData: Ref<ApidocBanner[]> = ref([]);
//目标项目 项目id
const targetProjectId = ref('');
//根据id获取目标项目详情数据
const handleChangeProject = (pid: string | number | boolean | undefined) => {
  if (!pid) return;
  loading.value = true;
  const params = {
    projectId: pid,
  };
  request.get('/api/project/doc_tree_node', { params }).then((res) => {
    targetTreeData.value = res.data;
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    loading.value = false;
  });
}
//项目列表枚举
const projectEnum: Ref<ApidocProjectEnum[]> = ref([]);
const getProjectEnum = () => {
  request.get<CommonResponse<ApidocProjectEnum[]>, CommonResponse<ApidocProjectEnum[]>>('/api/project/project_enum').then((res) => {
    res.data.forEach((val) => {
      if (val._id !== projectId.value) { //过滤掉当前项目
        projectEnum.value.push(val);
      }
    })
    if (projectEnum.value.length > 0) {
      targetProjectId.value = projectEnum.value[0]._id;
      handleChangeProject(projectEnum.value[0]._id);
    }
  }).catch((err) => {
    console.error(err);
  });
}
onMounted(() => {
  getProjectEnum();
  nextTick(() => {
    updateHeight();
  });
})

/*
|--------------------------------------------------------------------------
| 原树和目标树 基础数据
|--------------------------------------------------------------------------
|
*/
//源树数据
const sourceTreeData = computed(() => {
  const copyData: (ApidocBanner & { _isSource?: boolean })[] = JSON.parse(JSON.stringify(apidocBannerStore.banner));
  forEachForest(copyData, (data) => {
    data._isSource = true;
  });
  return copyData;
});
/*
|--------------------------------------------------------------------------
| 拖拽相关
|--------------------------------------------------------------------------
|
*/
//是否在源树中，如果在则取消拖拽到目标树事件
const isInSource = ref(false);
//判断目标树是否允许drop
const checkTargetCouldDrop = (_draggingNode: unknown, _dropNode: unknown, type: string) => {
  // let realDragNode = draggingNode || targetTree.value?.dragState.draggingNode
  // if (realDragNode.data.type !== 'folder' && dropNode.data.type === 'folder' && type !== "inner") { //不允许文件在文件夹前面
  //     return type !== "prev";
  // }
  // if (realDragNode.data.type === 'folder' && dropNode.data.type !== 'folder') {
  //     return false;
  // }
  // if (dropNode.data.type !== 'folder') {
  //     return type !== "inner";
  // }
  console.log(type)
  return true;
}

//目标树dragStart
const handleTargetDragStart = (event: Event, node: Node) => {
  console.log('target start', node, event)
  isInSource.value = false;
}
//在目标树上拖拽
const handleTargetNodeOver = () => {
  console.log('target over')
  isInSource.value = false;
}
//排序目标树
const sortTargetTree = (node: Node, _dropNode: unknown, type: string) => {
  const params = {
    _id: node.data._id, //当前节点id
    pid: '', //父元素
    sort: 0, //当前节点排序效果
    projectId,
  };
  const pData = findParentById(targetTreeData.value, node.data._id, { idKey: '_id' });
  params.pid = pData ? pData._id : '';
  if (type === 'inner') {
    params.sort = Date.now();
  } else {
    const nextSibling = findSiblingById(targetTreeData.value, node.data._id, 'next', { idKey: '_id' }) || { sort: 0 };
    const previousSibling = findSiblingById(targetTreeData.value, node.data._id, 'previous', { idKey: '_id' }) || { sort: 0 };
    const previousSiblingSort = previousSibling.sort || 0;
    const nextSiblingSort = nextSibling.sort || Date.now();
    params.sort = (nextSiblingSort + previousSiblingSort) / 2;
    node.data.sort = (nextSiblingSort + previousSiblingSort) / 2;
  }
  request.put('/api/project/change_doc_pos', params).catch((err) => {
    console.error(err)
  });
}
//目标树drop
const handleTargetDrop = (dragNode: Node, dropNode: Node, type: string) => {
  if (isInSource.value) { //拖拽到目标节点又拖拽回源节点代表取消
    targetTree.value?.remove(dragNode.data);
    return;
  }
  let targetNodeSort = Date.now();
  const { _isSource } = dragNode.data;
  if (_isSource) { //从源树拖拽到目标树
    let targetMountedId = null;
    const dropNodeId = dropNode.data._id2 || dropNode.data._id;
    const dragNodeId = dragNode.data._id2 || dragNode.data._id;
    if (type === 'inner') { //拖放至内部则选择dropNode
      targetMountedId = dropNodeId;
    } else {
      const dropNodeParentNode = findParentById(targetTreeData.value, dropNodeId, { idKey: '_id' });
      const nextSibling = findSiblingById(targetTreeData.value, dragNodeId, 'next', { idKey: '_id' }) || { sort: 0 };
      const previousSibling = findSiblingById(targetTreeData.value, dragNodeId, 'previous', { idKey: '_id' }) || { sort: 0 };
      const previousSiblingSort = previousSibling.sort || 0;
      const nextSiblingSort = nextSibling.sort || Date.now();
      targetNodeSort = (nextSiblingSort + previousSiblingSort) / 2;
      dropNode.data.sort = (nextSiblingSort + previousSiblingSort) / 2;
      if (dropNodeParentNode) { //非根节点
        targetMountedId = dropNodeParentNode._id;
      }
    }
    const selectedDocIds: string[] = [];
    forEachForest([dragNode.data], (data) => {
      selectedDocIds.push(data._id2 || data._id);
    });
    const params = {
      sourceRootId: dragNode.data._id2 || dragNode.data._id, //源节点根id
      selectedDocIds, //需要挂载的节点ids
      sourceProjectId: projectId, //源项目id
      targetProjectId: targetProjectId.value, //目标项目id
      targetMountedId, //目标挂载节点id
      targetNodeSort,
    };
    request.post('/api/project/export/fork', params).then((res) => {
      const docsIdMap = res.data;
      forEachForest(targetTreeData.value, (data) => {
        const { _id } = data;
        const newId = docsIdMap[_id]
        if (newId) {
          data._id = newId;
        }
      });
      message.success(t('导入成功'));
    }).catch((err) => {
      console.error(err);
    });
  } else { //目标树内自己拖拽，调用排序而不是新增
    // console.log("目标树内自己拖拽")
    sortTargetTree(dragNode, dropNode, type);
  }
  dragNode.data._isSource = false;
}

//拖拽开始(源)
const handleSourceDragstart = (node: Node, event: Event) => {
  console.log('drag start', targetTree.value, event, node)
  console.log(targetTree.value?.$el);
  if (targetTree.value) {
    // targetTree.value.dragState.draggingNode = { node };
  }
}
//拖拽中(源)
const handleSourceNodeDragOver = () => {
  isInSource.value = true;
}
//拖拽完毕(源)
const handleSourceDragend = (draggingNode: Node, _dropNode: unknown, _position: unknown, _event: unknown) => {
  // 插入一个空节点用于占位
  const emptyData = {
    _id: nanoid(),
  };
  sourceTree.value?.insertBefore(emptyData, draggingNode);
  // targetTree.value?.$emits('node-drag-end', event);
  nextTick(() => {
    if (sourceTree.value?.getNode(draggingNode.data)) { //没有在挂载点完成拖拽
      sourceTree.value?.remove(emptyData);
    } else { //在挂载点完成拖拽
      const data = JSON.parse(JSON.stringify(draggingNode.data));
      data._id2 = data._id2 || data._id;
      data._id = nanoid();
      data._isSource = true; //当前节点还原为source
      sourceTree.value?.insertAfter(data, sourceTree.value?.getNode(emptyData));
      sourceTree.value?.remove(emptyData);
    }
  })
  // console.log(event, sourceTree.value, nextTick)
}

//清除contentmenu
const clearContextmenu = () => {
  // console.log(333)
}

</script>

<style lang='scss'>
.fork {
  .el-divider--horizontal {
    margin: 10px 0;
  }

  .fork-wrap {
    display: flex;

    .left {
      flex: 0 0 50%;
      border-right: 1px solid var(--gray-300);
      height: calc(100vh - var(--height, 0px) - 30px);
      overflow-y: auto;
    }

    .right {
      flex: 1;
      padding: 0 15px;
      border-bottom: 1px solid var(--gray-200);
      height: calc(100vh - var(--height, 0px) - 30px);
      overflow-y: auto;
    }

    .el-tree-node__content {
      height: 30px;
      display: flex;
      align-items: center;
    }

    .custom-tree-node {
      display: flex;
      align-items: center;
      width: 100%;
      overflow: hidden;
      height: 30px;

      &:hover {
        .more {
          display: block;
        }
      }

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
    }
  }

  //拖拽指示器样式
  .el-tree-node.is-drop-inner {
    background: #d6e7fc;

    .custom-tree-node.select-node {
      background-color: #a6d2ff;
    }
  }

  .el-tree__drop-indicator {
    height: 3px;
  }
}
</style>
