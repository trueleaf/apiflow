<template>
  <SResizeX :min="280" :max="450" :width="300" name="banner" class="banner" tabindex="1">
    <STool @fresh="getBannerData" @filter="handleFilterNode" @changeProject="handleChangeProject"></STool>
    <SLoading :loading="loading" class="tree-wrap" @contextmenu.prevent="handleWrapContextmenu">
      <el-tree 
        ref="docTree" 
        :class="{ 'show-more': showMoreNodeInfo }" 
        :data="bannerData"
        :default-expanded-keys="defaultExpandedKeys" 
        node-key="_id" 
        :empty-text="t('点击工具栏按钮新建接口或者鼠标右键新增')"
        :draggable="enableDrag" 
        :allow-drop="handleCheckNodeCouldDrop" 
        :filter-node-method="filterNode"
        @node-drop="handleNodeDropSuccess" 
        @node-contextmenu="handleShowContextmenu">
        <template #default="scope">
          <div class="custom-tree-node" :class="{
            'select-node': selectNodes.find(v => v._id === scope.data._id) && !showContextmenu,
            'active-node': activeNode && activeNode._id === scope.data._id,
            'cut-node': cutNodes.find(v => v._id === scope.data._id),
            'readonly': scope.data.readonly
          }" tabindex="0"
            @keydown.stop="handleNodeKeydown($event)"
            @mouseenter.stop="handleNodeHover" 
            @click="handleClickNode($event, scope.data)"
            @dblclick="handleDbclickNode(scope.data)">
            <!-- file渲染 -->
            <template v-if="!scope.data.isFolder">
              <template v-for="(req) in projectInfo.rules.requestMethods">
                <span v-if="scope.data.method.toLowerCase() === req.value.toLowerCase()" :key="req.name"
                  class="file-icon" :style="{ color: req.iconColor }">{{ req.name }}</span>
              </template>
              <div v-if="editNode?._id !== scope.data._id" class="node-label-wrap">
                <SEmphasize class="node-top" :title="scope.data.name" :value="scope.data.name" :keyword="filterString">
                </SEmphasize>
                <SEmphasize v-show="showMoreNodeInfo" class="node-bottom" :title="scope.data.url"
                  :value="scope.data.url" :keyword="filterString"></SEmphasize>
              </div>
              <input 
                v-else 
                :value="scope.data.name" 
                :placeholder="t('不能为空')" 
                type="text" 
                class="rename-ipt"
                :class="{ error: scope.data.name.trim() === '' }" 
                @blur="handleChangeNodeName($event, scope.data)"
                @input="handleWatchNodeInput($event)" 
                @keydown.stop.enter="handleChangeNodeName($event, scope.data)"
              >
              <div class="more" @click.stop="handleShowContextmenu($event, scope.data)">
                <el-icon class="more-op" :title="t('更多操作')" :size="16">
                  <more-filled />
                </el-icon>
              </div>
            </template>
            <!-- 文件夹渲染 -->
            <template v-if="scope.data.isFolder">
              <i class="iconfont folder-icon iconweibiaoti-_huabanfuben"></i>
              <div v-if="editNode?._id !== scope.data._id" class="node-label-wrap">
                <SEmphasize class="node-top" :title="scope.data.name" :value="scope.data.name" :keyword="filterString">
                </SEmphasize>
                <div v-show="showMoreNodeInfo" class="node-bottom">{{ scope.data.url }}</div>
              </div>
              <input v-else :value="scope.data.name" :placeholder="t('不能为空')" type="text" class="rename-ipt"
                :class="{ error: scope.data.name.trim() === '' }" @blur="handleChangeNodeName($event, scope.data)"
                @input="handleWatchNodeInput($event)" @keydown.stop.enter="handleChangeNodeName($event, scope.data)">
              <div v-if="!isView" class="more" @click.stop="handleShowContextmenu($event, scope.data)">
                <el-icon class="more-op" :title="t('更多操作')" :size="16">
                  <more-filled />
                </el-icon>
              </div>
            </template>
          </div>
        </template>
      </el-tree>
    </SLoading>
    <!-- 鼠标右键 -->
    <teleport to="body">
      <!-- 单个节点操作 -->
      <SContextmenu v-if="!isView && showContextmenu && selectNodes.length <= 1" :left="contextmenuLeft"
        :top="contextmenuTop">
        <SContextmenuItem v-show="!currentOperationalNode || currentOperationalNode?.isFolder" :label="t('新建接口')"
          @click="handleOpenAddFileDialog"></SContextmenuItem>
        <SContextmenuItem v-show="!currentOperationalNode || currentOperationalNode?.isFolder" :label="t('新建文件夹')"
          @click="handleOpenAddFolderDialog"></SContextmenuItem>
        <SContextmenuItem v-show="!currentOperationalNode || currentOperationalNode?.isFolder" :label="t('设置公共请求头')"
          @click="handleJumpToCommonHeader"></SContextmenuItem>
        <!-- <SContextmenuItem v-show="!currentOperationalNode || currentOperationalNode?.isFolder" :label="t('以模板新建')"></SContextmenuItem> -->
        <SContextmenuItem v-show="currentOperationalNode && currentOperationalNode.isFolder" type="divider">
        </SContextmenuItem>
        <SContextmenuItem v-show="currentOperationalNode" :label="t('剪切')" hot-key="Ctrl + X" @click="handleCutNode">
        </SContextmenuItem>
        <SContextmenuItem v-show="currentOperationalNode" :label="t('复制')" hot-key="Ctrl + C" @click="handleCopyNode">
        </SContextmenuItem>
        <SContextmenuItem v-show="currentOperationalNode && !currentOperationalNode.isFolder" :label="t('生成副本')"
          hot-key="Ctrl + V" @click="handleForkNode"></SContextmenuItem>
        <SContextmenuItem v-show="!currentOperationalNode || currentOperationalNode?.isFolder" :label="t('粘贴')"
          hot-key="Ctrl + V" :disabled="!pasteValue" @click="handlePasteNode"></SContextmenuItem>
        <SContextmenuItem v-show="currentOperationalNode" type="divider"></SContextmenuItem>
        <SContextmenuItem v-show="currentOperationalNode && !currentOperationalNode.readonly" :label="t('重命名')"
          hot-key="F2" @click="handleRenameNode"></SContextmenuItem>
        <SContextmenuItem v-show="currentOperationalNode" :label="t('删除')" hot-key="Delete" @click="handleDeleteNodes">
        </SContextmenuItem>
      </SContextmenu>
      <!-- 多个节点操作 -->
      <SContextmenu v-if="!isView && showContextmenu && selectNodes.length > 1" :left="contextmenuLeft"
        :top="contextmenuTop">
        <SContextmenuItem :label="t('批量剪切')" hot-key="Ctrl + X" @click="handleCutNode"></SContextmenuItem>
        <SContextmenuItem :label="t('批量复制')" hot-key="Ctrl + C" @click="handleCopyNode"></SContextmenuItem>
        <SContextmenuItem :label="t('批量删除')" hot-key="Delete" @click="handleDeleteNodes"></SContextmenuItem>
      </SContextmenu>
    </teleport>
  </SResizeX>
  <SAddFileDialog v-if="addFileDialogVisible" v-model="addFileDialogVisible" :pid="currentOperationalNode?._id"
    @success="handleAddFileAndFolderCb"></SAddFileDialog>
  <SAddFolderDialog v-if="addFolderDialogVisible" v-model="addFolderDialogVisible" :pid="currentOperationalNode?._id"
    @success="handleAddFileAndFolderCb"></SAddFolderDialog>
</template>

<script lang="ts" setup>
import { computed, ref, Ref, onMounted, onUnmounted, watch } from 'vue'
import { MoreFilled } from '@element-plus/icons-vue'
import type { ApidocBanner } from '@src/types/global'
import { router } from '@/router/index'
import { useTranslation } from 'i18next-vue'
import SResizeX from '@/components/common/resize/g-resize-x.vue'
import SLoading from '@/components/common/loading/g-loading.vue'
import SEmphasize from '@/components/common/emphasize/g-emphasize.vue'
import SContextmenu from '@/components/common/contextmenu/g-contextmenu.vue'
import SContextmenuItem from '@/components/common/contextmenu/g-contextmenu-item.vue'
import SAddFileDialog from '../dialog/add-file/add-file.vue'
import SAddFolderDialog from '../dialog/add-folder/add-folder.vue'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import STool from './tool/tool.vue'
import { useBannerData } from './composables/banner-data'
import { deleteNode, addFileAndFolderCb, pasteNodes, forkNode, dragNode, renameNode } from './composables/curd-node'
import { TreeNodeOptions } from 'element-plus/es/components/tree/src/tree.type.mjs'
import { useApidocBaseInfo } from '@/store/apidoc/base-info'
import { useApidocBanner } from '@/store/apidoc/banner'
import { useApidocTas } from '@/store/apidoc/tabs'


//树节点信息
type TreeNode = {
  data: ApidocBanner,
  nextSibling?: TreeNode
}
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
const { t } = useTranslation()
const projectId = ref(router.currentRoute.value.query.id as string);
const docTree: Ref<TreeNodeOptions['store'] | null | TreeNodeOptions> = ref(null);
const pasteValue: Ref<ApidocBanner[] | null> = ref(null); //需要粘贴的数据
const selectNodes: Ref<ApidocBannerWithProjectId[]> = ref([]); //当前选中节点
const editNode: Ref<ApidocBanner | null> = ref(null); //正在编辑的节点
const showMoreNodeInfo = ref(false); //banner是否显示更多内容
const enableDrag = ref(true);//是否允许拖拽
const apidocBaseInfoStore = useApidocBaseInfo();
const apidocBannerStore = useApidocBanner();
const apidocTabsStore = useApidocTas();
// const isStandalone = ref(__STANDALONE__)

//当前工作区状态
const isView = computed(() => apidocBaseInfoStore.mode === 'view')
const loading = computed(() => apidocBannerStore.loading)
const { getBannerData } = useBannerData();
//默认展开节点
const defaultExpandedKeys = computed(() => apidocBannerStore.defaultExpandedKeys);

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
const activeNode = computed(() => apidocTabsStore.tabs[projectId.value]?.find((v) => v.selected));
const bannerData = computed(() => {
  const originBannerData = apidocBannerStore.banner;
  return originBannerData
})
/*
|--------------------------------------------------------------------------
| 鼠标移动到banner节点，显示更多操作。
| 鼠标右键显示更多操作
| 鼠标左键选中节点
| 判断显示是否允许粘贴
| banner鼠标右键
|--------------------------------------------------------------------------
*/
const currentOperationalNode: Ref<ApidocBanner | null> = ref(null); //点击工具栏按钮或者空白处右键这个值为null
const showContextmenu = ref(false); //是否显示contextmenu
const contextmenuLeft = ref(0); //contextmenu left值
const contextmenuTop = ref(0); //contextmenu top值

const handleShowContextmenu = async (e: MouseEvent, data: ApidocBanner) => {
  showContextmenu.value = true;
  if (selectNodes.value.length < 2) { //处理单个节点
    selectNodes.value = [{
      ...data,
      projectId: projectId.value,
    }];
  }
  try {
    const copyData = await navigator.clipboard.readText();
    const copyDataJson = JSON.parse(copyData);
    if (copyDataJson.type !== 'apiflow-apidoc-node') {
      return
    }
    pasteValue.value = copyDataJson;
  } catch {
    pasteValue.value = null;
  }
  
  contextmenuLeft.value = e.clientX;
  contextmenuTop.value = e.clientY;
  currentOperationalNode.value = data;
}
const handleWrapContextmenu = async (e: MouseEvent) => {
  selectNodes.value = [];
  try {
    const copyData = await navigator.clipboard.readText();
    const copyDataJson = JSON.parse(copyData);
    if (copyDataJson.type !== 'apiflow-apidoc-node') {
      return
    }
    pasteValue.value = copyDataJson;
  } catch {
    pasteValue.value = null;
  }
  currentOperationalNode.value = null;
  showContextmenu.value = true;
  contextmenuLeft.value = e.clientX;
  contextmenuTop.value = e.clientY;
}
/*
|--------------------------------------------------------------------------
| 鼠标右键或则点击更多按钮，对节点的 新增、修改、删除、复制、粘贴、拷贝、批量操作
|--------------------------------------------------------------------------
*/
const addFileDialogVisible = ref(false); //新增接口弹窗
const addFolderDialogVisible = ref(false); //新增文件夹弹窗
const pressCtrl = ref(false); //是否按住ctrl建委
const handleNodeKeyUp = () => {
  pressCtrl.value = false;
}
//点击节点，如果按住ctrl则可以多选
const handleClickNode = (e: MouseEvent, data: ApidocBanner) => {
  showContextmenu.value = false;
  currentOperationalNode.value = data;
  if (pressCtrl.value) {
    e.stopPropagation(); //如果按住ctrl键则阻止冒泡，防止点击文件夹展开
    const delIndex = selectNodes.value.findIndex((val) => val._id === data._id);
    if (delIndex !== -1) {
      selectNodes.value.splice(delIndex, 1);
    } else {
      selectNodes.value.push({
        ...data,
        projectId: projectId.value,
      });
    }
  } else {
    selectNodes.value = [{
      ...data,
      projectId: projectId.value,
    }];
    if (!data.isFolder) {
      apidocTabsStore.addTab({
        _id: data._id,
        projectId: projectId.value,
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
}
//双击节点固定这个节点
const handleDbclickNode = (data: ApidocBanner) => {
  if (data.isFolder) {
    return;
  }
  apidocTabsStore.fixedTab({
    _id: data._id,
    projectId: projectId.value,
  })
}
//鼠标放到节点上面
const handleNodeHover = (e: MouseEvent) => {
  if (!editNode.value) { //防止focus导致输入框失焦
    (e.currentTarget as HTMLElement).focus({ preventScroll: true }); //使其能够触发keydown事件
  }
}
//打开新增文件弹窗
const handleOpenAddFileDialog = () => {
  const childFileNodeNum = currentOperationalNode.value?.children.filter((v) => !v.isFolder).length || 0;
  if (!currentOperationalNode.value) { //在根节点操作,不作限制
    addFileDialogVisible.value = true;
  } else if (childFileNodeNum >= projectInfo.value.rules.fileInFolderLimit) {
    ElMessage.warning(`${t('单个文件夹里面文档个数不超过')} ${childFileNodeNum}${t('个')} ${t('全局设置中可配置')}`);
  } else {
    addFileDialogVisible.value = true;
  }
}
//打开新增文件夹弹窗
const handleOpenAddFolderDialog = () => {
  addFolderDialogVisible.value = true;
};
//添加文件夹或文档成功回调函数
const handleAddFileAndFolderCb = (data: ApidocBanner) => {
  addFileAndFolderCb.call(this, currentOperationalNode, data);
  apidocBannerStore.addExpandItem(data._id);
};
//添加公共请求头
const handleJumpToCommonHeader = (e: MouseEvent) => {
  e.stopPropagation();
  showContextmenu.value = false;
  apidocTabsStore.addTab({
    _id: currentOperationalNode.value?._id || projectId.value,
    projectId: projectId.value,
    tabType: 'commonHeader',
    label: `【公共头】${currentOperationalNode.value ? currentOperationalNode.value.name : t('全局')}`,
    saved: true,
    fixed: true,
    selected: true,
    head: {
      icon: '',
      color: ''
    },
  })
}
//删除节点
const handleDeleteNodes = () => {
  deleteNode.call(this, selectNodes.value);
}
//剪切节点
const cutNodes: Ref<ApidocBannerWithProjectId[]> = ref([]);
//复制节点
const handleCopyNode = () => {
  cutNodes.value = [];
  // const buffer = Buffer.from(JSON.stringify(selectNodes.value), 'utf8')
  // window.electronAPI?.clipboard.writeBuffer('apiflow-apidoc-node', buffer)
  navigator.clipboard.writeText(JSON.stringify({
    type: "apiflow-apidoc-node",
    data: selectNodes.value
  }));
}
//针对文件生成一份拷贝
const handleForkNode = () => {
  forkNode.call(this, currentOperationalNode.value as ApidocBanner);
}
const handleCutNode = () => {
  cutNodes.value = JSON.parse(JSON.stringify(selectNodes.value));
  // const buffer = Buffer.from(JSON.stringify(selectNodes.value), 'utf8')
  // window.electronAPI?.clipboard.writeBuffer('apiflow-apidoc-node', buffer)
  navigator.clipboard.writeText(JSON.stringify({
    type: "apiflow-apidoc-node",
    data: selectNodes.value
  }));
}
//粘贴节点
const handlePasteNode = async () => {
  if (currentOperationalNode.value && !currentOperationalNode.value.isFolder) return //只允许根元素或者文件夹粘贴
  // const copyData = window.electronAPI?.clipboard.readBuffer('apiflow-apidoc-node')?.toString();
  try {
    const copyData = await navigator.clipboard.readText();
    const copyDataJson = JSON.parse(copyData);
    if (copyDataJson.type !== 'apiflow-apidoc-node') {
      return
    }
    pasteValue.value = copyDataJson.data;
    pasteNodes.call(this, currentOperationalNode, pasteValue.value as ApidocBannerWithProjectId[]).then(() => {
      if (cutNodes.value.length > 0) { //剪切节点
        deleteNode.call(this, cutNodes.value, true);
        cutNodes.value = [];
      }
      if (currentOperationalNode.value) {
        apidocBannerStore.changeExpandItems([currentOperationalNode.value._id])
      }
    })
  } catch{}
}
//判断是否允许拖拽节点
const handleCheckNodeCouldDrop = (draggingNode: TreeNode, dropNode: TreeNode, type: 'inner' | 'prev' | 'next') => {
  if (!draggingNode.data.isFolder && dropNode.nextSibling?.data.isFolder && (type === 'prev' || type === 'next')) { //不允许文件后面是文件夹
    return false;
  }
  if (!draggingNode.data.isFolder && dropNode.data.isFolder && type !== 'inner') { //不允许文件在文件夹前面
    return type !== 'prev';
  }
  if (draggingNode.data.isFolder && !dropNode.data.isFolder) {
    return false;
  }
  if (!dropNode.data.isFolder) {
    return type !== 'inner';
  }
  return true;
}
//拖拽节点
const handleNodeDropSuccess = (draggingNode: TreeNode, dropNode: TreeNode, type: 'before' | 'after' | 'inner') => {
  dragNode.call(this, draggingNode.data, dropNode.data, type);
  if (type === 'inner') {
    apidocBannerStore.changeExpandItems([dropNode.data._id])
  }
};
//重命名节点
const handleRenameNode = () => {
  editNode.value = currentOperationalNode.value;
  setTimeout(() => {
    (document.querySelector('.rename-ipt') as HTMLElement).focus();
    enableDrag.value = false;
  })
}
//处理enter和blur事件
const handleChangeNodeName = (e: FocusEvent | KeyboardEvent, data: ApidocBanner) => {
  renameNode.call(this, e, data);
  editNode.value = null;
  enableDrag.value = true;
}
//监听输入框，输入值为空时候添加error样式
const handleWatchNodeInput = (e: Event) => {
  const iptValue = (e.target as HTMLInputElement).value;
  if (iptValue.trim() === '') {
    (e.target as HTMLInputElement).classList.add('error');
  } else {
    (e.target as HTMLInputElement).classList.remove('error');
  }
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

/*
|--------------------------------------------------------------------------
| 其他操作
|--------------------------------------------------------------------------
| 1. 清空事件绑定
| 2. 处理全局点击某些弹窗隐藏
| 3. 快捷键处理
|
*/
//处理节点上面键盘事件
const handleNodeKeydown = (e: KeyboardEvent) => {
  if (e.code === 'ControlLeft' || e.code === 'ControlRight') {
    pressCtrl.value = true;
  }
  if (e.code === 'F2' && !currentOperationalNode.value?.readonly) {
    handleRenameNode()
  } else if (!editNode.value && e.ctrlKey && (e.key === 'D' || e.key === 'd')) {
    handleDeleteNodes();
  } else if (!editNode.value && e.ctrlKey && (e.key === 'C' || e.key === 'c')) {
    handleCopyNode();
  } else if (!editNode.value && e.ctrlKey && (e.key === 'V' || e.key === 'v')) {
    handlePasteNode();
  } else if (!editNode.value && e.ctrlKey && (e.key === 'X' || e.key === 'x')) {
    handleCutNode();
  }
}
//改变项目
const handleChangeProject = (id: string) => {
  projectId.value = id;
}
const handleGlobalClick = () => {
  showContextmenu.value = false;
  selectNodes.value = [];
}

/*
|--------------------------------------------------------------------------
| 监听路由变化，当项目切换时重新获取数据
|--------------------------------------------------------------------------
*/
watch(() => router.currentRoute.value.query.id, (newProjectId) => {
  if (newProjectId && newProjectId !== projectId.value) {
    projectId.value = newProjectId as string;
    getBannerData();
  }
}, { immediate: false });

onMounted(() => {
  getBannerData();
  document.documentElement.addEventListener('click', handleGlobalClick);
  document.addEventListener('keyup', handleNodeKeyUp);
})
onUnmounted(() => {
  document.documentElement.removeEventListener('click', handleGlobalClick);
  document.removeEventListener('keyup', handleNodeKeyUp);
})
</script>

<style lang='scss'>
.banner {
  flex: 0 0 auto;
  height: 100%;
  border-right: 1px solid var(--gray-400);
  display: flex;
  flex-direction: column;
  position: relative;

  //树形组件包裹框
  .tree-wrap {
    height: calc(100vh - var(--apiflow-banner-tool-height) - 15px);
    overflow-y: auto;
  }

  //拖拽指示器样式
  .el-tree-node.is-drop-inner {
    >.el-tree-node__content {
      background: #b3d6fd;
    }

    .custom-tree-node.select-node {
      background-color: #d6e7fc;
    }
  }

  .el-tree__drop-indicator {
    height: 3px;
  }

  // 自定义节点
  .custom-tree-node {
    display: flex;
    align-items: center;
    width: 100%;
    overflow: hidden;
    min-height: 30px;

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

    //重命名输入框
    .rename-ipt {
      flex: 0 0 75%;
      height: 22px;
      border: 1px solid var(--theme-color);
      font-size: 1em;
      margin-left: -1px;

      &.error {
        border: 2px solid var(--red);
      }
    }

    .more {
      display: none;
      flex: 0 0 auto;
      margin-left: auto;
      padding: 5px 10px;
    }

    &.active-node {
      background-color: #daeaff;
    }

    &.select-node {
      background-color: #a6d2ff;
    }

    &.cut-node {
      color: var(--gray-500);

      .file-icon {
        color: var(--gray-500) !important;
      }

      .folder-icon {
        color: var(--gray-300) !important;
      }
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

.banner-popover {
  .op-item {
    line-height: 2em;
    padding: 5px 25px;
    cursor: pointer;
    display: flex;
    &.disabled {
      color: #adb5bd;
      cursor: default;
      &:hover {
        background: inherit;
        color: #adb5bd;
      }
    }
    .hot-key {
      margin-left: auto;
      color: #adb5bd;
    }
    &:hover {
      background: rgb(244, 244, 244);
      color: #409EFF;
    }
  }
}
</style>
