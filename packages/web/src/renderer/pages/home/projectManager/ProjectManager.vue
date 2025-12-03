<template>
  <div class="project-manager">
    <!-- 搜索条件 -->
    <div class="search-item d-flex a-center mb-3">
      <el-input v-model="projectName" :placeholder="$t('搜索项目名称')" :prefix-icon="SearchIcon"
        class="w-200px mr-3" data-testid="home-project-search-input" @input="debounceSearch" @change="debounceSearch" @keyup.enter="debounceSearch">
        <template #suffix>
          <div class="d-flex a-center" style="gap: 8px;">
            <el-icon v-show="projectName.trim().length > 0" :title="$t('清空')" class="cursor-pointer"
              data-testid="home-search-clear-btn" @click.stop="handleClearSearch">
              <CircleCloseIcon />
            </el-icon>
            <el-icon :title="$t('高级搜索')" class="cursor-pointer" color="var(--gray-400)" data-testid="home-advanced-search-btn" @click.stop="toggleAdvancedSearch">
              <Tools />
            </el-icon>
          </div>
        </template>
      </el-input>
      <el-button :icon="PlusIcon" data-testid="home-add-project-btn" @click="dialogVisible = true">{{ $t("新建项目") }}</el-button>
    </div>
    <!-- 高级搜索面板 -->
    <AdvancedSearchPanel
      v-model="searchConditions"
      :is-standalone="isStandalone"
      :is-visible="showAdvancedSearch"
      @reset="handleResetSearch"
    />
    <!-- 搜索结果 -->
    <SearchResults
      v-if="searchMode === 'advanced'"
      :results="searchResults"
      :loading="isSearching"
      @jump-to-node="handleJumpToNode"
      @load-more="handleLoadMore"
    />
    <!-- 项目列表 -->
    <div v-if="searchMode === 'simple'">
    <Loading :loading="!isStandalone && projectLoading">
      <!-- 收藏的项目 -->
      <h2 v-show="starProjects.length > 0">
        <span class="cursor-pointer">{{ t("收藏的项目") }}</span>
      </h2>
      <div v-show="starProjects.length > 0" class="project-wrap" data-testid="home-star-projects-wrap">
        <div v-for="(item, index) in starProjects" :key="index" class="project-list" :data-testid="`home-star-project-card-${index}`">
          <div class="project-header">
            <div :title="item.projectName" class="title project-name theme-color text-ellipsis">
              <Emphasize :value="item.projectName" :keyword="projectName"></Emphasize>
            </div>
            <div class="operator">
              <div :title="$t('编辑')" @click="handleOpenEditDialog(item)">
                <el-icon :size="16">
                  <EditIcon></EditIcon>
                </el-icon>
              </div>
              <div v-if="!isStandalone" :title="$t('成员管理')" @click="handleOpenPermissionDialog(item)">
                <el-icon :size="16">
                  <UserIcon></UserIcon>
                </el-icon>
              </div>
              <div v-if="!item.isStared" :title="$t('收藏')" data-testid="home-star-project-star-btn" @click="handleStar(item)">
                <el-icon v-if="!starLoading" :size="16">
                  <star-icon></star-icon>
                </el-icon>
                <el-icon v-if="starLoading" :size="16" class="is-loading">
                  <LoadingIcon></LoadingIcon>
                </el-icon>
              </div>
              <div v-if="item.isStared" :title="$t('取消收藏')" data-testid="home-star-project-unstar-btn" @click="handleUnStar(item)">
                <el-icon v-if="!unStarLoading" :size="19" class="yellow">
                  <StarFilledIcon></StarFilledIcon>
                </el-icon>
                <el-icon v-if="unStarLoading" :size="16" class="is-loading">
                  <LoadingIcon></LoadingIcon>
                </el-icon>
              </div>
              <div :title="$t('删除')" data-testid="home-star-project-delete-btn" @click="deleteProject(item._id)">
                <el-icon :size="16">
                  <DeleteIcon></DeleteIcon>
                </el-icon>
              </div>
            </div>
          </div>
          <div class="d-flex j-end a-center gray-500 mt-2">
            <span>{{ $t("创建者") }}:</span>
            <span class="project-creator">{{ item.owner.name }}</span>&nbsp;&nbsp;
          </div>
          <div class="d-flex j-end a-center gray-500">
            <span>{{ $t("最新更新") }}:</span>
            <span class="project-update-time">{{ formatDate(item.updatedAt) }}</span>&nbsp;&nbsp;
          </div>
          <div class="project-bottom d-flex">
            <div class="project-api-count">
              <span class="f-sm">{{ $t("接口数") }}:</span>
              <span class="teal">{{ item.docNum || 0 }}</span>
            </div>
            <div class="ml-auto">
              <el-button type="default" data-testid="home-star-project-enter-btn" @click="handleJumpToProject(item)">{{ $t("编辑") }}</el-button>
            </div>
          </div>
        </div>
      </div>
      <h2>
        <span class="cursor-pointer" @click="toggleCollapse">
          <el-icon v-if="!isFold" class="mr-1" :size="16">
            <CaretBottomIcon />
          </el-icon>
          <el-icon v-if="isFold" class="mr-1" :size="16">
            <CaretRightIcon />
          </el-icon>
          <span>{{ $t("全部项目") }}({{ projectList.length }})</span>
        </span>
      </h2>
      <!-- 空状态 -->
      <div v-if="isEmptyState && !isFold" class="empty-container">
        <el-empty :description="$t('暂无项目，点击上方按钮创建第一个项目')"></el-empty>
      </div>
      <!-- 项目列表 -->
      <div v-show="!isFold && !isEmptyState" class="project-wrap" data-testid="home-projects-wrap">
        <div v-for="(item, index) in projectList" :key="index" class="project-list" :data-testid="`home-project-card-${index}`">
          <div class="project-header">
            <div :title="item.projectName" class="title project-name theme-color text-ellipsis">
              <Emphasize :value="item.projectName" :keyword="projectName"></Emphasize>
            </div>
            <div class="operator">
              <div :title="$t('编辑')" @click="handleOpenEditDialog(item)">
                <el-icon :size="16">
                  <EditIcon></EditIcon>
                </el-icon>
              </div>
              <div v-if="!isStandalone" :title="$t('成员管理')" @click="handleOpenPermissionDialog(item)">
                <el-icon :size="16">
                  <UserIcon></UserIcon>
                </el-icon>
              </div>
              <div v-if="!item.isStared" :title="$t('收藏')" @click="handleStar(item)">
                <el-icon v-if="!starLoading" :size="16">
                  <star-icon></star-icon>
                </el-icon>
                <el-icon v-if="starLoading" :size="16" class="is-loading">
                  <LoadingIcon></LoadingIcon>
                </el-icon>
              </div>
              <div v-if="item.isStared" :title="$t('取消收藏')" data-testid="home-project-unstar-btn" @click="handleUnStar(item)">
                <el-icon v-if="!unStarLoading" :size="19" class="yellow">
                  <StarFilledIcon></StarFilledIcon>
                </el-icon>
                <el-icon v-if="unStarLoading" :size="16" class="is-loading">
                  <LoadingIcon></LoadingIcon>
                </el-icon>
              </div>
              <div :title="$t('删除')" data-testid="home-project-delete-btn" @click="deleteProject(item._id)">
                <el-icon :size="16">
                  <DeleteIcon></DeleteIcon>
                </el-icon>
              </div>
            </div>
          </div>
          <div class="d-flex j-end a-center gray-600 mt-2">
            <span>{{ $t("创建者") }}:</span>
            <span class="project-creator">{{ item.owner.name }}</span>&nbsp;&nbsp;
          </div>
          <div class="d-flex j-end a-center gray-600">
            <span>{{ $t("最新更新") }}:</span>
            <span class="project-update-time">{{ formatDate(item.updatedAt) }}</span>&nbsp;&nbsp;
          </div>
          <div class="project-bottom d-flex">
            <div class="project-api-count">
              <span class="f-sm">{{ $t("接口数") }}:</span>
              <span class="teal">{{ item.docNum || 0 }}</span>
            </div>
            <div class="ml-auto">
              <el-button type="default" data-testid="home-project-enter-btn" @click="handleJumpToProject(item)">{{ $t("编辑") }}</el-button>
            </div>
          </div>
        </div>
      </div>
    </Loading>
    </div>
  </div>
  <AddProjectDialog v-if="dialogVisible" v-model="dialogVisible" @success="handleAddSuccess"></AddProjectDialog>
  <EditProjectDialog v-if="dialogVisible2" v-model="dialogVisible2" :project-id="currentEditProjectId"
    :project-name="currentEditProjectName" @success="handleEditSuccess"></EditProjectDialog>
  <EditPermissionDialog v-if="dialogVisible4" v-model="dialogVisible4" :project-id="currentEditProjectId"
    @leave="getProjectList"></EditPermissionDialog>
  <UndoNotification v-if="showUndoNotification" :message="undoMessage" :duration="60000" :show-progress="true"
    @undo="handleUndoDelete" @close="handleCloseUndo" />
</template>

<script lang="ts" setup>
import {
  Edit as EditIcon,
  User as UserIcon,
  Loading as LoadingIcon,
  Star as StarIcon,
  StarFilled as StarFilledIcon,
  Delete as DeleteIcon,
  Plus as PlusIcon,
  Search as SearchIcon,
  CaretBottom as CaretBottomIcon,
  CaretRight as CaretRightIcon,
  Tools,
  CircleClose as CircleCloseIcon,
} from '@element-plus/icons-vue'
import Loading from '@/components/common/loading/ClLoading.vue'
import Emphasize from '@/components/common/emphasize/ClEmphasize.vue'
import AddProjectDialog from '../dialog/addProject/AddProject.vue'
import EditProjectDialog from '../dialog/editProject/EditProject.vue'
import EditPermissionDialog from '../dialog/editPermission/EditPermission.vue'
import UndoNotification from '@/components/common/undoNotification/UndoNotification.vue'
import AdvancedSearchPanel from './advancedSearch/AdvancedSearchPanel.vue'
import SearchResults from './advancedSearch/SearchResults.vue'
import { useI18n } from 'vue-i18n'
import type { ApidocProjectInfo, ApiNode } from '@src/types';
import type { AdvancedSearchConditions, GroupedSearchResults, SearchResultItem } from '@src/types/advancedSearch';
import { performAdvancedSearch } from '@/composables/useAdvancedSearch';
import { computed, onMounted, ref, watch } from 'vue';
import 'element-plus/es/components/message-box/style/css';
import { ElMessageBox } from 'element-plus';
import { router } from '@/router';
import { formatDate } from '@/helper';
import { debounce } from "lodash-es";
import { useProjectWorkbench } from '@/store/projectWorkbench/projectWorkbenchStore'
import { apiNodesCache } from '@/cache/nodes/nodesCache'
import { useProjectManagerStore } from '@/store/projectManager/projectManagerStore'
import { useRuntime } from '@/store/runtime/runtimeStore'
import { httpMockLogsCache } from '@/cache/mock/httpMock/httpMockLogsCache';
import { IPC_EVENTS } from '@src/types/ipc';

//变量
const { t } = useI18n()
const projectManagerStore = useProjectManagerStore();
const runtimeStore = useRuntime();
const isStandalone = computed(() => runtimeStore.networkMode === 'offline');
const projectLoading = ref(false);
const starProjectIds = ref<string[]>([]);
const projectName = ref('');
const projectListCopy = ref<ApidocProjectInfo[]>([]);
watch(() => projectManagerStore.projectList, (list) => {
  projectListCopy.value = list.slice();
  starProjectIds.value = list.filter((item) => item.isStared).map((item) => item._id);
}, { deep: true, immediate: true });
const currentEditProjectId = ref('');
const currentEditProjectName = ref('');
const isFold = ref(false);
const starLoading = ref(false);
const unStarLoading = ref(false);
const showUndoNotification = ref(false);
const undoMessage = ref('');
const deletedProjectData = ref<{ project: ApidocProjectInfo; apiNodes: ApiNode[] } | null>(null);
let deleteTimer: NodeJS.Timeout | null = null;
const dialogVisible = ref(false);
const dialogVisible2 = ref(false);
const dialogVisible4 = ref(false);
const showAdvancedSearch = ref(false);
const searchMode = ref<'simple' | 'advanced'>('simple');
const searchConditions = ref<AdvancedSearchConditions>({
  keyword: '',
  searchScope: {
    projectName: true,
    docName: true,
    url: true,
    creator: true,
    maintainer: true,
    method: true,
    remark: true,
    folder: true,
    http: true,
    websocket: true,
    httpMock: true,
    query: true,
    path: true,
    headers: true,
    body: true,
    response: true,
    preScript: true,
    afterScript: true,
    wsMessage: true
  },
  dateRange: {
    type: 'unlimited'
  }
});
const searchResults = ref<GroupedSearchResults[]>([]);
const isSearching = ref(false);
const expandedProjects = ref<Set<string>>(new Set());
const allSearchResults = ref<Map<string, SearchResultItem[]>>(new Map());
const projectList = computed<ApidocProjectInfo[]>(() => {
  const filteredProjectList = projectListCopy.value.filter((val) => 
    val.projectName.match(new RegExp(projectName.value, 'gi'))
  );
  return filteredProjectList.map((val) => {
    const isStared = starProjectIds.value.find((id: string) => id === val._id);
    return {
      ...val,
      isStared: !!isStared,
    };
  });
});
const starProjects = computed<ApidocProjectInfo[]>(() => {
  const filteredProjectList = projectListCopy.value.filter((val) => 
    val.projectName.match(new RegExp(projectName.value, 'gi'))
  );
  return filteredProjectList.filter((projectInfo) => starProjectIds.value.find((id: string) => id === projectInfo._id)).map((val) => {
    const isStared = starProjectIds.value.find((id: string) => id === val._id);
    return {
      ...val,
      isStared: !!isStared,
    };
  });
});
//判断是否显示空状态
const isEmptyState = computed(() => {
  const hasSearchCondition = projectName.value.trim().length > 0;
  return !hasSearchCondition && projectList.value.length === 0;
});
const projectWorkbenchStore = useProjectWorkbench()
//获取项目列表
const getProjectList = async () => {
  if (projectLoading.value) {
    return;
  }
  projectLoading.value = true;
  try {
    await projectManagerStore.getProjectList();
  } catch (err) {
    console.error(err);
  } finally {
    projectLoading.value = false;
  }
};
//编辑项目弹窗
const handleOpenEditDialog = (item: ApidocProjectInfo) => {
  currentEditProjectId.value = item._id;
  currentEditProjectName.value = item.projectName;
  dialogVisible2.value = true;
}
//编辑权限弹窗
const handleOpenPermissionDialog = (item: ApidocProjectInfo) => {
  currentEditProjectId.value = item._id;
  dialogVisible4.value = true;
}
//删除项目
const deleteProject = (_id: string) => {
  ElMessageBox.confirm(t('确定要删除此项目吗?'), t('提示'), {
    confirmButtonText: t('确定'),
    cancelButtonText: t('取消'),
    type: 'warning'
  }).then(async () => {
    const notifyProjectDeleted = () => {
      window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.projectDeleted, _id);
    }
    const cleanupMockLogs = async () => {
      try {
        await httpMockLogsCache.clearLogsByProjectId(_id);
      } catch (err) {
        console.error('清理Mock日志失败:', err);
      }
    };
    if (isStandalone.value) {
      try {
        const project = projectManagerStore.projectList.find((p) => p._id === _id);
        if (!project) {
          console.error('项目不存在');
          return;
        }
        const projectName = project.projectName;
        const backupData = await projectManagerStore.deleteProject(_id);
        if (backupData) {
          deletedProjectData.value = backupData;
        }
        notifyProjectDeleted();
        undoMessage.value = t('已删除项目 "{name}"', { name: projectName });
        showUndoNotification.value = true;
        if (deleteTimer) {
          clearTimeout(deleteTimer);
        }
        deleteTimer = setTimeout(async () => {
          await cleanupMockLogs();
          deletedProjectData.value = null;
          deleteTimer = null;
        }, 60000);
      } catch (err) {
        console.error(err);
      }
      return;
    }
    await projectManagerStore.deleteProject(_id);
    await cleanupMockLogs();
    notifyProjectDeleted();
  }).catch((err: Error | string) => {
    if (err === 'cancel' || err === 'close') {
      return;
    }
    console.error(err);
  });
}
//撤回删除
const handleUndoDelete = async () => {
  if (!deletedProjectData.value) {
    return;
  }
  if (deleteTimer) {
    clearTimeout(deleteTimer);
    deleteTimer = null;
  }
  showUndoNotification.value = false;
  try {
    await projectManagerStore.restoreProjectFromBackup(deletedProjectData.value);
    deletedProjectData.value = null;
  } catch (err) {
    console.error('撤回删除失败:', err);
  }
}
//关闭撤回通知
const handleCloseUndo = async () => {
  showUndoNotification.value = false;
  if (deleteTimer) {
    clearTimeout(deleteTimer);
    deleteTimer = null;
  }
  if (deletedProjectData.value) {
    const projectId = deletedProjectData.value.project._id;
    try {
      await httpMockLogsCache.clearLogsByProjectId(projectId);
    } catch (err) {
      console.error('清理Mock日志失败:', err);
    }
    deletedProjectData.value = null;
  }
}
//收藏项目
const handleStar = async (item: ApidocProjectInfo) => {
  if (starLoading.value) {
    return;
  }
  starLoading.value = true;
  try {
    await projectManagerStore.starProject(item._id);
  } catch (err) {
    console.error(err);
  } finally {
    starLoading.value = false;
  }
}
//取消收藏项目
const handleUnStar = async (item: ApidocProjectInfo) => {
  if (unStarLoading.value) {
    return;
  }
  unStarLoading.value = true;
  try {
    await projectManagerStore.unstarProject(item._id);
  } catch (err) {
    console.error(err);
  } finally {
    unStarLoading.value = false;
  }
}
//初始化缓存
const initCahce = () => {
  isFold.value = localStorage.getItem('doc-list/isFold') === 'close';
}
//跳转到编辑
const handleJumpToProject = (item: ApidocProjectInfo) => {
  projectManagerStore.recordVisited(item._id);
  router.push({
    path: '/v1/apidoc/doc-edit',
    query: {
      id: item._id,
      name: item.projectName,
      mode: 'edit',
    },
  });
  projectWorkbenchStore.changeProjectId(item._id);
}
// (已删除) 跳转到预览逻辑已移除
//新增项目成功
const handleAddSuccess = async (data: { projectId: string, projectName: string }) => {
  if (isStandalone.value) {
    await getProjectList();
    dialogVisible.value = false;
  }
  router.push({
    path: '/v1/apidoc/doc-edit',
    query: {
      id: data.projectId,
      name: data.projectName,
      mode: 'edit'
    }
  });
}
//编辑项目成功
const handleEditSuccess = (data?: { id: string, name: string }) => {
  getProjectList();
  if (data) {
    window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.projectRenamed, {
      projectId: data.id,
      projectName: data.name
    });
  }
}
//折叠打开项目列表
const toggleCollapse = () => {
  isFold.value = !isFold.value;
  localStorage.setItem('doc-list/isFold', isFold.value ? 'close' : 'open');
}
//清空搜索
const handleClearSearch = () => {
  projectName.value = '';
}
//防抖搜索
const debounceSearch = debounce(() => {
  if (showAdvancedSearch.value) {
    searchConditions.value.keyword = projectName.value;
    debouncedAdvancedSearch();
  }
}, 300)
// 检查是否有任何搜索条件
const hasAnyCondition = (conditions: AdvancedSearchConditions): boolean => {
  const hasKeyword = conditions.keyword.trim().length > 0;
  const hasAnyScope = Object.values(conditions.searchScope).some(v => v === true);
  const hasDateRange = conditions.dateRange.type !== 'unlimited';
  return hasKeyword && hasAnyScope && (hasDateRange || true);
};
// 执行高级搜索
const debouncedAdvancedSearch = debounce(async () => {
  if (!hasAnyCondition(searchConditions.value)) {
    searchResults.value = [];
    searchMode.value = 'simple';
    return;
  }
  isSearching.value = true;
  try {
    const results = await performAdvancedSearch(searchConditions.value, isStandalone.value);
    searchResults.value = results;
    allSearchResults.value.clear();
    for (const group of results) {
      const projectId = group.projectId;
      const nodes = await apiNodesCache.getNodesByProjectId(projectId);
      const project = projectListCopy.value.find(p => p._id === projectId);
      if (project) {
        const matchedNodes: SearchResultItem[] = [];
        for (const node of nodes.filter(n => !n.isDeleted)) {
          const match = await matchNode(node, searchConditions.value, project);
          if (match) matchedNodes.push(match);
        }
        allSearchResults.value.set(projectId, matchedNodes);
      }
    }
    searchMode.value = 'advanced';
  } finally {
    isSearching.value = false;
  }
}, 300);
async function matchNode(node: ApiNode, conditions: AdvancedSearchConditions, project: ApidocProjectInfo): Promise<SearchResultItem | null> {
  const { performAdvancedSearch } = await import('@/composables/useAdvancedSearch');
  const tempResults = await performAdvancedSearch(conditions, isStandalone.value);
  for (const group of tempResults) {
    if (group.projectId === project._id) {
      const matchedNode = group.nodes.find(n => n.nodeId === node._id);
      if (matchedNode) return matchedNode;
    }
  }
  return null;
}
// 切换高级搜索面板
const toggleAdvancedSearch = () => {
  showAdvancedSearch.value = !showAdvancedSearch.value;
};
// 重置搜索
const handleResetSearch = () => {
  searchConditions.value = {
    keyword: '',
    searchScope: {
      projectName: true,
      docName: true,
      url: true,
      creator: true,
      maintainer: true,
      method: true,
      remark: true,
      folder: true,
      http: true,
      websocket: true,
      httpMock: true,
      query: true,
      path: true,
      headers: true,
      body: true,
      response: true,
      preScript: true,
      afterScript: true,
      wsMessage: true
    },
    dateRange: {
      type: 'unlimited'
    }
  };
  searchResults.value = [];
  searchMode.value = 'simple';
  expandedProjects.value.clear();
  allSearchResults.value.clear();
};
// 跳转到节点
const handleJumpToNode = (item: SearchResultItem) => {
  router.push({
    path: '/v1/apidoc/doc-edit',
    query: {
      id: item.projectId,
      name: item.projectName,
      mode: 'edit',
      nodeId: item.nodeId
    }
  });
};
// 加载更多
const handleLoadMore = async (projectId: string) => {
  expandedProjects.value.add(projectId);
  const allNodes = allSearchResults.value.get(projectId);
  if (allNodes) {
    const group = searchResults.value.find(g => g.projectId === projectId);
    if (group) {
      group.nodes = allNodes;
      group.displayCount = allNodes.length;
      group.hasMore = false;
    }
  }
};
// 监听搜索条件变化
watch(searchConditions, () => {
  debouncedAdvancedSearch();
}, { deep: true });
onMounted(() => {
  getProjectList();
  initCahce();
})

</script>

<style lang='scss' scoped>
.project-manager {
  .empty-container {
    min-height: 500px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .project-wrap {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 20px;

    @media only screen and (max-width: 720px) {
      justify-content: center;
    }
  }

  .project-list {
    width: 300px;
    border: 1px solid var(--gray-200);
    box-shadow: var(--box-shadow-sm);
    margin-right: 30px;
    margin-bottom: 20px;
    padding: 10px;
    position: relative;

    @media only screen and (max-width: 720px) {
      margin-right: 0;
      width: 100%;
    }

    .project-header {
      height: 40px;
      display: flex;
      align-items: center;

      .title {
        font-size: 16px;
        max-width: 150px;
      }

      .operator {
        margin-left: auto;
        display: flex;

        &>div {
          width: 25px;
          height: 25px;
          margin-right: 5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;

          &:hover {
            background: var(--gray-200);
          }
        }
      }
    }

    .project-bottom {
      width: 100%;
      padding: 10px 0 0;
      bottom: 10px;
      display: flex;
      align-items: center;
    }

    .start {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      bottom: 10px;
      right: 10px;
      cursor: pointer;

      &:hover {
        background: var(--gray-200);
      }

      i {
        font-size: 18px;
      }
    }
  }
}
</style>
