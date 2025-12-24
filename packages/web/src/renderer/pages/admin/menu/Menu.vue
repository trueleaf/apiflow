<template>
  <SLeftRight :left-width="500">
    <template #left>
      <SLoading :loading="loading">
        <Card :title="t('菜单列表')" class="menu-tree">
          <template #operation>
            <el-button link type="primary" text @click="handleOpenAddDialog()">{{ t("新增") }}</el-button>
            <el-button link type="primary" text @click="getData">{{ t("刷新") }}</el-button>
          </template>
          <el-tree ref="tree" :data="treeData" node-key="id" :draggable="true" :empty-text="t('暂无数据')"
            :expand-on-click-node="false" :default-expanded-keys="defaultExpandKeys" @node-drop="handleNodeDropSuccess"
            @node-expand="clearContextNode" @node-collapse="clearContextNode" @current-change="clearContextNode"
            @node-click="handleNodeClick" @node-contextmenu="handleContextmenu">
            <template #default="{ data }">
              <div class="tree-node">
                <div class="label">
                  <img :src="fileUrl" width="14" height="14" class="mr-2" />
                  <span>{{ data.name }}</span>
                </div>
                <div class="ml-auto mr-2">
                  <el-button link type="primary" text @click.stop="handleOpenAddDialog(data)">{{ t("新增子菜单")
                    }}</el-button>
                  <el-divider direction="vertical"></el-divider>
                  <el-button link type="primary" text @click.stop="handleOpenEditDialog(data)">{{ t("编辑") }}</el-button>
                  <el-divider direction="vertical"></el-divider>
                  <el-button link type="primary" text @click.stop="handleDeleteCurrentNode(data)">{{ t("删除")
                    }}</el-button>
                </div>
              </div>
            </template>
          </el-tree>
        </Card>
      </SLoading>
    </template>
    <template #right>
      <ul>
        <li>{{ t("支持鼠标右键新增和编辑菜单") }}</li>
        <li>{{ t("菜单可以进行拖拽排序") }}</li>
      </ul>
    </template>
  </SLeftRight>
  <teleport to="body">
    <div v-if="currentCtxNode" ref="contextmenu" class="contextmenu"
      :style="{ left: ctxLeft + 'px', top: ctxTop + 'px' }">
      <div class="item-list" @click="handleOpenAddDialog(currentCtxNode)">{{ t("新增子菜单") }}</div>
      <div class="item-list" @click="handleOpenEditDialog(currentCtxNode)">{{ t("编辑") }}</div>
      <div class="item-list" @click="handleDeleteCurrentNode(currentCtxNode)">{{ t("删除") }}</div>
    </div>
  </teleport>
  <SAddMenuDialog v-if="addMenuDialogVisible" v-model="addMenuDialogVisible" :pid="parentId"
    @success="handleAddSuccess">
  </SAddMenuDialog>
  <SEditMenuDialog v-if="editMenuDialogVisible" v-model="editMenuDialogVisible" :data="currentEditNode"
    @success="getData"></SEditMenuDialog>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import type { CommonResponse, PermissionClientMenu } from '@src/types'
import type Node from 'element-plus/lib/components/tree/src/model/node'
import SAddMenuDialog from './add/Add.vue'
import SEditMenuDialog from './edit/Edit.vue'
import SLeftRight from '@/components/common/leftRight/ClLeftRight.vue'
import SLoading from '@/components/common/loading/ClLoading.vue'
import Card from '@/components/common/card/ClCard.vue'
import { onMounted, onUnmounted, ref } from 'vue'
import { request } from '@/api/api'
import { findParentById, forEachForest } from '@/helper'
import { ElMessageBox } from 'element-plus'
import { message } from '@/helper'


const fileUrl = new URL('@/assets/imgs/apidoc/file.png', import.meta.url).href;
const treeData = ref<PermissionClientMenu[]>([])
const defaultExpandKeys = ref<string[]>([])
const currentEditNode = ref<PermissionClientMenu | null>(null)
const { t } = useI18n()

const ctxLeft = ref(0)
const ctxTop = ref(0)
const currentCtxNode = ref<PermissionClientMenu | null>(null)
const parentId = ref('')
const addMenuDialogVisible = ref(false)
const editMenuDialogVisible = ref(false)
const loading = ref(false)

/*
|--------------------------------------------------------------------------
| 函数定义
|--------------------------------------------------------------------------
*/
//=====================================数据获取====================================//
//获取树形菜单结构
const getData = () => {
  loading.value = true;
  request.get<CommonResponse<PermissionClientMenu[]>, CommonResponse<PermissionClientMenu[]>>('/api/security/client_menu_tree').then((res) => {
    forEachForest(res.data, (val) => {
      val.id = val._id;
    })
    treeData.value = res.data;
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    loading.value = false;
  });
}
//=====================================节点增删改查====================================//
//打开修改弹窗
const handleOpenEditDialog = (data: PermissionClientMenu | null) => {
  if (data === null) {
    message.warning(t('参数值不能为null'));
    return
  }
  editMenuDialogVisible.value = true;
  currentEditNode.value = data;
}
//打开新增弹窗
const handleOpenAddDialog = (data?: PermissionClientMenu | null) => {
  parentId.value = data ? data._id : '';
  addMenuDialogVisible.value = true;
}
//删除节点
const handleDeleteCurrentNode = (data: PermissionClientMenu | null) => {
  if (data === null) {
    message.warning(t('参数值不能为null'));
    return
  }
  const cpData = JSON.parse(JSON.stringify(data));
  const ids = [cpData._id];
  forEachForest(cpData.children || [], (val) => {
    ids.push(val._id);
  })
  ElMessageBox.confirm(t('此操作将永久删除此条记录, 是否继续?'), t('提示'), {
    confirmButtonText: t('确定'),
    cancelButtonText: t('取消'),
    type: 'warning',
  }).then(() => {
    const params = {
      ids,
    };
    request.delete('/api/security/client_menu', { data: params }).then(() => {
      getData();
      // currentEditNode = null;
    }).catch((err) => {
      console.error(err);
    });
  }).catch((err: Error | string) => {
    if (err === 'cancel' || err === 'close') {
      return;
    }
    console.error(err);
  });
}
//=====================================节点操作====================================//
//拖拽成功
const handleNodeDropSuccess = (node: Node, dropNode: Node, type: 'inner' | 'before' | 'after') => {
  const nodeData = (node as unknown as Node).data as unknown as PermissionClientMenu;
  const dropData = (dropNode as unknown as Node).data as unknown as PermissionClientMenu;
  const params = {
    _id: nodeData._id, //当前节点id
    pid: '', //父元素
    sort: 0, //当前节点排序效果
  };
  const nodeIsSameLevel = node.level === dropNode.level;
  let pNode = null;
  if ((!nodeIsSameLevel) || (nodeIsSameLevel && type === 'inner')) { //将节点放入子节点中
    pNode = findParentById(treeData.value, nodeData._id);
    params.pid = pNode ? pNode._id : '';
    while (pNode != null) {
      pNode = findParentById(treeData.value, pNode._id);
    }
  } else if (nodeIsSameLevel && type !== 'inner') {
    params.pid = nodeData.pid || '';
    pNode = findParentById(treeData.value, nodeData._id);
    while (pNode != null) {
      pNode = findParentById(treeData.value, pNode._id);
    }
  }
  if (type === 'after') { //说明这个节点是第一个节点
    params.sort = dropData.sort - 1;
  } else if (type === 'before') {
    params.sort = dropData.sort + 1;
  } else if (type === 'inner') {
    params.sort = Date.now();
  }
  request.put('/api/security/client_menu_position', params).catch((err) => {
    console.error(err);
  });
} 
//点击节点
const handleNodeClick = (data: string) => {
  console.log(data)
  // currentEditNode = data;
  // defaultExpandKeys.push(data._id);
}
//处理contextmenu事件
const handleContextmenu = (evt: Event, data: any) => {
  const e = evt as MouseEvent;
  ctxLeft.value = e.clientX;
  ctxTop.value = e.clientY;
  currentCtxNode.value = data as PermissionClientMenu;
} 
//清除鼠标右键dom节点信息
const clearContextNode = () => {
  currentCtxNode.value = null;
}
//=========================================================================//
const handleAddSuccess = (id: string) => {
  defaultExpandKeys.value.push(id); //展开刚刚新增的元素
  getData();
}
//移除contextmenu
const removeContextmenu = () => {
  currentCtxNode.value = null;
}

onMounted(() => {
  getData();
  document.body.addEventListener('click', removeContextmenu);
})
onUnmounted(() => {
  document.body.removeEventListener('click', removeContextmenu);
})
</script>

<style lang='scss' scoped>
.menu-tree {
  min-height: 70vh;

  .el-tree-node__content {
    height: 30px;
  }

  .tree-node {
    width: 100%;
    height: 30px;
    display: flex;
    align-items: center;
    overflow: hidden;

    .label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.contextmenu {
  min-width: 240px;
  position: fixed;
  background: var(--bg-primary);
  border-radius: 4px;
  box-shadow: 0px 2px 8px 0px var(--bg-black-10);
  z-index: 1996;
  animation: ctx-fade .2s;
}
@keyframes ctx-fade {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
