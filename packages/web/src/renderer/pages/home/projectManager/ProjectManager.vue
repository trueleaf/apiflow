<template>
  <div class="project-manager">
    <!-- 搜索条件 -->
    <div class="search-item d-flex a-center mb-3">
      <el-input v-model="projectName" :placeholder="$t('搜索项目、文档、URL、创建者等')" :prefix-icon="SearchIcon"
        class="w-200px mr-3" @input="debounceSearch" @change="debounceSearch" @keyup.enter="debounceSearch">
        <template #suffix>
          <div class="d-flex a-center" style="gap: 8px;">
            <el-icon v-show="projectName.trim().length > 0" :title="$t('清空')" class="cursor-pointer"
              @click.stop="handleClearSearch">
              <CircleCloseIcon />
            </el-icon>
            <el-icon :title="$t('高级搜索')" class="cursor-pointer"
              :color="isShowAdvanceSearch ? 'var(--theme-color)' : 'var(--gray-400)'"
              @click.stop.prevent="() => isShowAdvanceSearch = !isShowAdvanceSearch">
              <Tools />
            </el-icon>
          </div>
        </template>
      </el-input>
      <el-button :icon="PlusIcon" @click="dialogVisible = true">{{ $t("新建项目") }}</el-button>
      <el-button v-if="0" type="success" :icon="DownloadIcon" @click="dialogVisible3 = true">{{ $t("导入项目")
        }}</el-button>
    </div>
    <!-- 高级搜索 -->
    <div v-if="isShowAdvanceSearch" class="advanced-search-panel mb-3">
      <!-- 搜索范围选择器 -->
      <div class="search-scope-selector">
        <div class="d-flex a-center mb-2">
          <span class="gray-600 f-sm mr-2">{{ $t("搜索范围") }}:</span>
          <el-button size="small" text @click="selectAllScopes">{{ $t("全选") }}</el-button>
          <el-button size="small" text @click="clearAllScopes">{{ $t("清空") }}</el-button>
        </div>
        <el-checkbox-group v-model="selectedSearchScopes" class="search-scope-checkboxes">
          <div class="search-scope-group">
            <div class="search-scope-group-label">{{ $t("基础信息") }}:</div>
            <div class="search-scope-group-items">
              <el-checkbox :value="MatchedFieldTypeEnum.ProjectName" :label="MatchedFieldTypeEnum.ProjectName">
                {{ $t("项目名称") }}
              </el-checkbox>
              <el-checkbox :value="MatchedFieldTypeEnum.DocumentName" :label="MatchedFieldTypeEnum.DocumentName">
                {{ $t("文档名称") }}
              </el-checkbox>
              <el-checkbox :value="MatchedFieldTypeEnum.URL" :label="MatchedFieldTypeEnum.URL">
                {{ $t("请求URL") }}
              </el-checkbox>
              <el-checkbox :value="MatchedFieldTypeEnum.Creator" :label="MatchedFieldTypeEnum.Creator">
                {{ $t("创建者") }}
              </el-checkbox>
              <el-checkbox :value="MatchedFieldTypeEnum.Maintainer" :label="MatchedFieldTypeEnum.Maintainer">
                {{ $t("维护者") }}
              </el-checkbox>
              <el-checkbox :value="MatchedFieldTypeEnum.HttpMethod" :label="MatchedFieldTypeEnum.HttpMethod">
                {{ $t("请求方法") }}
              </el-checkbox>
            </div>
          </div>
          <div class="search-scope-group">
            <div class="search-scope-group-label">{{ $t("文档属性") }}:</div>
            <div class="search-scope-group-items">
              <el-checkbox :value="MatchedFieldTypeEnum.Description" :label="MatchedFieldTypeEnum.Description">
                {{ $t("文档描述") }}
              </el-checkbox>
              <el-checkbox :value="MatchedFieldTypeEnum.Version" :label="MatchedFieldTypeEnum.Version">
                {{ $t("版本信息") }}
              </el-checkbox>
              <el-checkbox :value="MatchedFieldTypeEnum.ProjectRemark" :label="MatchedFieldTypeEnum.ProjectRemark">
                {{ $t("项目备注") }}
              </el-checkbox>
            </div>
          </div>
          <div class="search-scope-group">
            <div class="search-scope-group-label">{{ $t("接口参数") }}:</div>
            <div class="search-scope-group-items">
              <el-checkbox :value="MatchedFieldTypeEnum.QueryParam" :label="MatchedFieldTypeEnum.QueryParam">
                {{ $t("查询参数") }}
              </el-checkbox>
              <el-checkbox :value="MatchedFieldTypeEnum.Header" :label="MatchedFieldTypeEnum.Header">
                {{ $t("请求头") }}
              </el-checkbox>
              <el-checkbox :value="MatchedFieldTypeEnum.RequestBodyParam"
                :label="MatchedFieldTypeEnum.RequestBodyParam">
                {{ $t("请求参数") }}
              </el-checkbox>
              <el-checkbox :value="MatchedFieldTypeEnum.ResponseParam" :label="MatchedFieldTypeEnum.ResponseParam">
                {{ $t("返回参数") }}
              </el-checkbox>
            </div>
          </div>
        </el-checkbox-group>
      </div>
    </div>
    <!-- 项目列表 -->
    <Loading :loading="!isStandalone && (projectLoading || searchLoading)">
      <!-- 收藏的项目 -->
      <h2 v-show="starProjects.length > 0">
        <span class="cursor-pointer">{{ t("收藏的项目") }}</span>
      </h2>
      <div v-show="starProjects.length > 0" class="project-wrap">
        <div v-for="(item, index) in starProjects" :key="index" class="project-list"
          :class="{ 'is-searching': projectName.trim().length > 0 }">
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
              <div v-if="item.isStared" :title="$t('取消收藏')" @click="handleUnStar(item)">
                <el-icon v-if="!unStarLoading" :size="19" class="yellow">
                  <StarFilledIcon></StarFilledIcon>
                </el-icon>
                <el-icon v-if="unStarLoading" :size="16" class="is-loading">
                  <LoadingIcon></LoadingIcon>
                </el-icon>
              </div>
              <div :title="$t('删除')" @click="deleteProject(item._id)">
                <el-icon :size="16">
                  <DeleteIcon></DeleteIcon>
                </el-icon>
              </div>
            </div>
          </div>
          <div class="d-flex j-end a-center gray-500 mt-2">
            <span>{{ $t("最新更新") }}:</span>
            <span class="project-update-time">{{ formatDate(item.updatedAt) }}</span>&nbsp;&nbsp;
          </div>
          <div class="d-flex j-end a-center gray-500">
            <span>{{ $t("创建者") }}:</span>
            <span class="project-creator">{{ item.owner.name }}</span>&nbsp;&nbsp;
          </div>
          <!-- 高级搜索匹配详情 -->
          <div v-if="projectName.trim().length > 0 && isProjectWithMatchDetails(item)"
            class="match-details-section mt-3">
            <div class="match-header cursor-pointer d-flex a-center" @click="toggleMatchDetails(item._id)">
              <el-icon :size="14" class="mr-1">
                <CaretBottomIcon v-if="isMatchDetailsExpanded(item._id)" />
                <CaretRightIcon v-else />
              </el-icon>
              <span class="f-sm font-600">{{ $t("匹配详情") }} ({{ item.matchCount }}{{ $t("项匹配") }})</span>
            </div>
            <div v-show="isMatchDetailsExpanded(item._id)" class="match-content mt-2">
              <!-- 项目名匹配 -->
              <div v-if="item.matchedFields.includes(MatchedFieldTypeEnum.ProjectName)" class="match-item mb-2">
                <span class="gray-600 f-sm">{{ $t("项目名称") }}:</span>
                <SearchHighlight :text="item.projectName" :keyword="projectName" />
              </div>
              <!-- 匹配的文档列表 -->
              <div v-if="item.matchedDocuments.length > 0" class="matched-docs">
                <div class="gray-600 f-sm mb-2">{{ $t("匹配的文档") }} ({{ item.matchedDocuments.length }}{{ $t("个") }}):
                </div>
                <MatchedDocumentList :documents="item.matchedDocuments" :keyword="projectName" :project-id="item._id"
                  @doc-click="handleDocumentClick" />
              </div>
            </div>
          </div>
          <div class="project-bottom d-flex">
            <div class="project-api-count">
              <span class="f-sm">{{ $t("接口数") }}:</span>
              <span class="teal">{{ item.docNum || 0 }}</span>
            </div>
            <div class="ml-auto">
              <el-button type="default" @click="handleJumpToProject(item)">{{ $t("编辑") }}</el-button>
              <el-button v-if="!isStandalone" @click="handleJumpToView(item)">{{ $t("预览") }}</el-button>
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
      <div v-show="!isFold && !isEmptyState" class="project-wrap">
        <div v-for="(item, index) in projectList" :key="index" class="project-list"
          :class="{ 'is-searching': projectName.trim().length > 0 }">
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
              <div v-if="item.isStared" :title="$t('取消收藏')" @click="handleUnStar(item)">
                <el-icon v-if="!unStarLoading" :size="19" class="yellow">
                  <StarFilledIcon></StarFilledIcon>
                </el-icon>
                <el-icon v-if="unStarLoading" :size="16" class="is-loading">
                  <LoadingIcon></LoadingIcon>
                </el-icon>
              </div>
              <div :title="$t('删除')" @click="deleteProject(item._id)">
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
          <!-- 高级搜索匹配详情 -->
          <div v-if="projectName.trim().length > 0 && isProjectWithMatchDetails(item)"
            class="match-details-section mt-3">
            <div class="match-header cursor-pointer d-flex a-center" @click="toggleMatchDetails(item._id)">
              <el-icon :size="14" class="mr-1">
                <CaretBottomIcon v-if="isMatchDetailsExpanded(item._id)" />
                <CaretRightIcon v-else />
              </el-icon>
              <span class="f-sm font-600">{{ $t("匹配详情") }} ({{ item.matchCount }}{{ $t("项匹配") }})</span>
            </div>
            <div v-show="isMatchDetailsExpanded(item._id)" class="match-content mt-2">
              <!-- 项目名匹配 -->
              <div v-if="item.matchedFields.includes(MatchedFieldTypeEnum.ProjectName)" class="match-item mb-2">
                <span class="gray-600 f-sm">{{ $t("项目名称") }}:</span>
                <SearchHighlight :text="item.projectName" :keyword="projectName" />
              </div>
              <!-- 匹配的文档列表 -->
              <div v-if="item.matchedDocuments.length > 0" class="matched-docs">
                <div class="gray-600 f-sm mb-2">{{ $t("匹配的文档") }} ({{ item.matchedDocuments.length }}{{ $t("个") }}):
                </div>
                <MatchedDocumentList :documents="item.matchedDocuments" :keyword="projectName" :project-id="item._id"
                  @doc-click="handleDocumentClick" />
              </div>
            </div>
          </div>
          <div class="project-bottom d-flex">
            <div class="project-api-count">
              <span class="f-sm">{{ $t("接口数") }}:</span>
              <span class="teal">{{ item.docNum || 0 }}</span>
            </div>
            <div class="ml-auto">
              <el-button type="default" @click="handleJumpToProject(item)">{{ $t("编辑") }}</el-button>
              <el-button v-if="!isStandalone" @click="handleJumpToView(item)">{{ $t("预览") }}</el-button>
            </div>
          </div>
        </div>
      </div>
    </Loading>
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
  Download as DownloadIcon,
  Search as SearchIcon,
  CaretBottom as CaretBottomIcon,
  CaretRight as CaretRightIcon,
  Tools,
  CircleClose as CircleCloseIcon,
} from '@element-plus/icons-vue'
import Loading from '@/components/common/loading/ClLoading.vue'
import Emphasize from '@/components/common/emphasize/ClEmphasize.vue'
import SearchHighlight from '@/components/common/searchHighlight/SearchHighlight.vue'
import MatchedDocumentList from './components/MatchedDocumentList.vue'
import AddProjectDialog from '../dialog/addProject/AddProject.vue'
import EditProjectDialog from '../dialog/editProject/EditProject.vue'
import EditPermissionDialog from '../dialog/editPermission/EditPermission.vue'
import UndoNotification from '@/components/common/undoNotification/UndoNotification.vue'
import { useI18n } from 'vue-i18n'
import type { CommonResponse, ApidocProjectListInfo, ApidocProjectInfo, ProjectWithMatchDetails, MatchedFieldType, ApiNode } from '@src/types';
import { MatchedFieldType as MatchedFieldTypeEnum } from '@src/types';
import { computed, onMounted, ref, watch } from 'vue';
import { request } from '@/api/api';
import 'element-plus/es/components/message-box/style/css';
import { ElMessageBox } from 'element-plus';
import { router } from '@/router';
import { formatDate } from '@/helper';
import { debounce } from "lodash-es";
import { useApidocBaseInfo } from '@/store/apidoc/baseInfoStore'
import { projectCache } from '@/cache/project/projectCache'
import { apiNodesCache } from '@/cache/standalone/apiNodesCache'
import { useProjectStore } from '@/store/project/projectStore'
import { useRuntime } from '@/store/runtime/runtimeStore'
import { httpMockLogsCache } from '@/cache/mock/httpMock/httpMockLogsCache';
import { IPC_EVENTS } from '@src/types/ipc';

//变量
const { t } = useI18n()
const projectStore = useProjectStore();
const runtimeStore = useRuntime();
const isStandalone = computed(() => runtimeStore.networkMode === 'offline');
const projectLoading = ref(false);
const starProjectIds = ref<string[]>([]);
const projectName = ref('');
const selectedSearchScopes = ref<MatchedFieldType[]>([
  MatchedFieldTypeEnum.ProjectName,
  MatchedFieldTypeEnum.DocumentName,
  MatchedFieldTypeEnum.URL,
  MatchedFieldTypeEnum.Creator,
  MatchedFieldTypeEnum.Maintainer,
  MatchedFieldTypeEnum.HttpMethod,
  MatchedFieldTypeEnum.Description,
  MatchedFieldTypeEnum.Version,
  MatchedFieldTypeEnum.QueryParam,
  MatchedFieldTypeEnum.Header,
  MatchedFieldTypeEnum.RequestBodyParam,
  MatchedFieldTypeEnum.ResponseParam,
  MatchedFieldTypeEnum.ProjectRemark
]);
const projectListCopy = ref<ApidocProjectInfo[]>([]);
const projectListCopy2 = ref<ProjectWithMatchDetails[]>([]);
watch(() => projectStore.projectList, (list) => {
  projectListCopy.value = list.slice();
  starProjectIds.value = list.filter((item) => item.isStared).map((item) => item._id);
  const isAdvancedSearch = projectName.value.trim().length > 0 && isShowAdvanceSearch.value;
  if (isStandalone.value && !isAdvancedSearch) {
    projectListCopy2.value = [];
  }
}, { deep: true, immediate: true });
//同步离线项目列表
const syncOfflineProjectList = (list: ApidocProjectInfo[]): void => {
  projectStore.projectList = list;
  starProjectIds.value = list.filter((item) => item.isStared).map((item) => item._id);
};
//确保项目收藏状态
const ensureProjectStarState = (projectId: string, isStared: boolean): void => {
  const projects = projectStore.projectList;
  const target = projects.find((project: ApidocProjectInfo) => project._id === projectId);
  if (target) {
    target.isStared = isStared;
  }
  const starIds = starProjectIds.value;
  const existIndex = starIds.findIndex((id: string) => id === projectId);
  if (isStared && existIndex === -1) {
    starIds.push(projectId);
  }
  if (!isStared && existIndex !== -1) {
    starIds.splice(existIndex, 1);
  }
};
const currentEditProjectId = ref('');
const currentEditProjectName = ref('');
const isShowAdvanceSearch = ref(false);
const isFold = ref(false);
const searchLoading = ref(false);
const starLoading = ref(false);
const unStarLoading = ref(false);
const expandedProjectIds = ref<Set<string>>(new Set());
const showUndoNotification = ref(false);
const undoMessage = ref('');
interface DeletedProjectData {
  project: ApidocProjectInfo
  apiNodes: ApiNode[]
}
const deletedProjectData = ref<DeletedProjectData | null>(null);
let deleteTimer: NodeJS.Timeout | null = null;
//全选搜索范围
const selectAllScopes = (): void => {
  selectedSearchScopes.value = [
    MatchedFieldTypeEnum.ProjectName,
    MatchedFieldTypeEnum.DocumentName,
    MatchedFieldTypeEnum.URL,
    MatchedFieldTypeEnum.Creator,
    MatchedFieldTypeEnum.Maintainer,
    MatchedFieldTypeEnum.HttpMethod,
    MatchedFieldTypeEnum.Description,
    MatchedFieldTypeEnum.Version,
    MatchedFieldTypeEnum.QueryParam,
    MatchedFieldTypeEnum.Header,
    MatchedFieldTypeEnum.RequestBodyParam,
    MatchedFieldTypeEnum.ResponseParam,
    MatchedFieldTypeEnum.ProjectRemark
  ];
};
//清空搜索范围
const clearAllScopes = (): void => {
  selectedSearchScopes.value = [];
};
//监听搜索范围变化,触发重新搜索
watch(selectedSearchScopes, () => {
  if (projectName.value.trim().length > 0 && isShowAdvanceSearch.value) {
    debounceSearch();
  }
}, { deep: true });
const dialogVisible = ref(false);
const dialogVisible2 = ref(false);
const dialogVisible3 = ref(false);
const dialogVisible4 = ref(false);
const projectList = computed<(ApidocProjectInfo | ProjectWithMatchDetails)[]>(() => {
  const hasKeyword = projectName.value.trim().length > 0;
  const list = hasKeyword ? projectListCopy2.value : projectListCopy.value;
  const filteredProjectList = hasKeyword
    ? list
    : list.filter((val) => val.projectName.match(new RegExp(projectName.value, 'gi')));
  return filteredProjectList.map((val) => {
    const isStared = starProjectIds.value.find((id: string) => id === val._id);
    return {
      ...val,
      isStared: !!isStared,
    };
  });
});
const starProjects = computed<(ApidocProjectInfo | ProjectWithMatchDetails)[]>(() => {
  const hasKeyword = projectName.value.trim().length > 0;
  const list = hasKeyword ? projectListCopy2.value : projectListCopy.value;
  const filteredProjectList = hasKeyword
    ? list
    : list.filter((val) => val.projectName.match(new RegExp(projectName.value, 'gi')));
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
const apidocBaseInfo = useApidocBaseInfo()
//获取项目列表
const getProjectList = async () => {
  if (projectLoading.value) {
    return;
  }
  projectLoading.value = true;
  try {
    await projectStore.getProjectList();
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
        const projectList = await projectCache.getProjectList();
        const project = projectList.find((p) => p._id === _id);
        if (!project) {
          console.error('项目不存在');
          return;
        }
        const apiNodes = await apiNodesCache.getAllNodes();
        const projectApiNodes = apiNodes.filter((node) => node.projectId === _id);
        const clonedProject = JSON.parse(JSON.stringify(project)) as ApidocProjectInfo;
        const clonedNodes: ApiNode[] = projectApiNodes.length > 0
          ? (JSON.parse(JSON.stringify(projectApiNodes)) as ApiNode[])
          : [];
        deletedProjectData.value = {
          project: clonedProject,
          apiNodes: clonedNodes
        };
        await projectCache.deleteProject(_id);
        await getProjectList();
        notifyProjectDeleted();
        undoMessage.value = t('已删除项目 "{name}"', { name: project.projectName });
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
    request.delete('/api/project/delete_project', { data: { ids: [_id] } }).then(async () => {
      await cleanupMockLogs();
      getProjectList();
      notifyProjectDeleted();
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
    const projectId = deletedProjectData.value.project._id;
    const restoredProject = JSON.parse(JSON.stringify(deletedProjectData.value.project)) as ApidocProjectInfo;
    restoredProject.isDeleted = false;
    const updateResult = await projectCache.updateProject(projectId, restoredProject);
    if (!updateResult) {
      await projectCache.addProject(restoredProject);
    }
    const savedNodes = deletedProjectData.value.apiNodes;
    if (savedNodes && savedNodes.length > 0) {
      const restorePromises = savedNodes.map((node) => {
        const clonedNode = JSON.parse(JSON.stringify(node)) as ApiNode;
        clonedNode.isDeleted = false;
        return apiNodesCache.addNode(clonedNode);
      });
      await Promise.all(restorePromises);
    }
    deletedProjectData.value = null;
    await getProjectList();
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
    if (isStandalone.value) {
      const projectList = await projectCache.getProjectList();
      const project = projectList.find((projectInfo) => projectInfo._id === item._id);
      if (project) {
        project.isStared = true;
        await projectCache.setProjectList(projectList);
        syncOfflineProjectList(projectList);
        item.isStared = true;
      }
      starLoading.value = false;
      return;
    }
    request.put('/api/project/star', { projectId: item._id }).then(() => {
      item.isStared = true;
      ensureProjectStarState(item._id, true);
    }).catch((err) => {
      console.error(err);
    }).finally(() => {
      starLoading.value = false;
    });
  } catch (err) {
    console.error(err);
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
    if (isStandalone.value) {
      const projectList = await projectCache.getProjectList();
      const project = projectList.find((projectInfo) => projectInfo._id === item._id);
      if (project) {
        project.isStared = false;
        await projectCache.setProjectList(projectList);
        syncOfflineProjectList(projectList);
        item.isStared = false;
      }
      unStarLoading.value = false;
      return;
    }
    request.put('/api/project/unstar', { projectId: item._id }).then(() => {
      item.isStared = false;
      ensureProjectStarState(item._id, false);
    }).catch((err) => {
      console.error(err);
    }).finally(() => {
      unStarLoading.value = false;
    });
  } catch (err) {
    console.error(err);
    unStarLoading.value = false;
  }
}
//初始化缓存
const initCahce = () => {
  isFold.value = localStorage.getItem('doc-list/isFold') === 'close';
}
//跳转到编辑
const handleJumpToProject = (item: ApidocProjectInfo) => {
  if (!isStandalone.value) {
    request.put('/api/project/visited', { projectId: item._id }).catch((err) => {
      console.error(err);
    });
  }
  router.push({
    path: '/v1/apidoc/doc-edit',
    query: {
      id: item._id,
      name: item.projectName,
      mode: 'edit',
    },
  });
  apidocBaseInfo.changeProjectId(item._id);
}
//跳转到预览
const handleJumpToView = (item: ApidocProjectInfo) => {
  request.put('/api/project/visited', { projectId: item._id }).catch((err) => {
    console.error(err);
  });
  router.push({
    path: '/v1/apidoc/doc-edit',
    query: {
      id: item._id,
      name: item.projectName,
      mode: 'view',
    },
  });
  apidocBaseInfo.changeProjectId(item._id);
}
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
//切换匹配详情展开状态
const toggleMatchDetails = (projectId: string) => {
  if (expandedProjectIds.value.has(projectId)) {
    expandedProjectIds.value.delete(projectId);
  } else {
    expandedProjectIds.value.add(projectId);
  }
}
//判断匹配详情是否展开
const isMatchDetailsExpanded = (projectId: string): boolean => {
  return expandedProjectIds.value.has(projectId);
}
//类型守卫：判断是否为带匹配详情的项目
const isProjectWithMatchDetails = (project: ApidocProjectInfo | ProjectWithMatchDetails): project is ProjectWithMatchDetails => {
  return 'matchCount' in project && project.matchCount > 0;
}
//处理文档点击跳转
const handleDocumentClick = (docId: string, projectId: string) => {
  const project = projectListCopy2.value.find((p) => p._id === projectId);
  if (!project) return;
  router.push({
    path: '/v1/apidoc/doc-edit',
    query: {
      id: projectId,
      name: project.projectName,
      mode: 'edit',
      docId: docId
    },
  });
  apidocBaseInfo.changeProjectId(projectId);
}
//清空搜索
const handleClearSearch = () => {
  projectName.value = '';
  debounceSearch();
}
//防抖搜索
const debounceSearch = debounce(async () => {
  searchLoading.value = true;
  if (projectName.value?.trim().length === 0) {
    projectListCopy2.value = [];
    expandedProjectIds.value.clear();
    setTimeout(() => {
      searchLoading.value = false;
    }, 100)
    return
  }
  if (isStandalone.value) {
    const keyword = projectName.value.toLowerCase().trim();
    const docs = await apiNodesCache.getAllNodes();
    const projectList = await projectCache.getProjectList();
    const projectMatchMap = new Map<string, ProjectWithMatchDetails>();
    const scopes = isShowAdvanceSearch.value ? selectedSearchScopes.value : [
      MatchedFieldTypeEnum.ProjectName,
      MatchedFieldTypeEnum.DocumentName,
      MatchedFieldTypeEnum.URL,
      MatchedFieldTypeEnum.Creator,
      MatchedFieldTypeEnum.Maintainer,
      MatchedFieldTypeEnum.HttpMethod,
      MatchedFieldTypeEnum.Description,
      MatchedFieldTypeEnum.Version,
      MatchedFieldTypeEnum.QueryParam,
      MatchedFieldTypeEnum.Header,
      MatchedFieldTypeEnum.RequestBodyParam,
      MatchedFieldTypeEnum.ResponseParam,
      MatchedFieldTypeEnum.ProjectRemark
    ];
    docs.forEach((doc) => {
      const hasItem = 'item' in doc && doc.item;
      const matchedFields: MatchedFieldType[] = [];
      let urlPath = '';
      let method = '';
      let nodeType: 'http' | 'httpMock' | 'websocket' | 'folder' = 'folder';
      if (hasItem) {
        if ('port' in doc.item && 'method' in doc.item) {
          nodeType = 'httpMock';
        } else if ('method' in doc.item) {
          nodeType = 'http';
        } else if ('protocol' in doc.item) {
          nodeType = 'websocket';
        }
      } else {
        nodeType = 'folder';
      }
      if (scopes.includes(MatchedFieldTypeEnum.URL) && hasItem && 'url' in doc.item && doc.item.url && 'path' in doc.item.url) {
        urlPath = doc.item.url.path;
        if (urlPath.toLowerCase().includes(keyword)) {
          matchedFields.push(MatchedFieldTypeEnum.URL);
        }
      }
      if (hasItem && 'method' in doc.item) {
        method = doc.item.method as string;
        if (scopes.includes(MatchedFieldTypeEnum.HttpMethod) && method.toLowerCase().includes(keyword)) {
          matchedFields.push(MatchedFieldTypeEnum.HttpMethod);
        }
      } else if (hasItem && 'protocol' in doc.item) {
        method = doc.item.protocol as string;
      }
      const docName = doc.info.name;
      if (scopes.includes(MatchedFieldTypeEnum.DocumentName) && docName.toLowerCase().includes(keyword)) {
        matchedFields.push(MatchedFieldTypeEnum.DocumentName);
      }
      const creator = doc.info.creator;
      if (scopes.includes(MatchedFieldTypeEnum.Creator) && creator.toLowerCase().includes(keyword)) {
        matchedFields.push(MatchedFieldTypeEnum.Creator);
      }
      const maintainer = doc.info.maintainer;
      if (scopes.includes(MatchedFieldTypeEnum.Maintainer) && maintainer.toLowerCase().includes(keyword)) {
        matchedFields.push(MatchedFieldTypeEnum.Maintainer);
      }
      const description = doc.info.description;
      if (scopes.includes(MatchedFieldTypeEnum.Description) && description.toLowerCase().includes(keyword)) {
        matchedFields.push(MatchedFieldTypeEnum.Description);
      }
      const version = doc.info.version;
      if (scopes.includes(MatchedFieldTypeEnum.Version) && version.toLowerCase().includes(keyword)) {
        matchedFields.push(MatchedFieldTypeEnum.Version);
      }
      if (scopes.includes(MatchedFieldTypeEnum.QueryParam) && hasItem && 'queryParams' in doc.item && Array.isArray(doc.item.queryParams)) {
        const hasQueryParamMatch = doc.item.queryParams.some((param) => param.key.toLowerCase().includes(keyword));
        if (hasQueryParamMatch) {
          matchedFields.push(MatchedFieldTypeEnum.QueryParam);
        }
      }
      if (scopes.includes(MatchedFieldTypeEnum.Header) && hasItem && 'headers' in doc.item && Array.isArray(doc.item.headers)) {
        const hasHeaderMatch = doc.item.headers.some((header) => header.key.toLowerCase().includes(keyword));
        if (hasHeaderMatch) {
          matchedFields.push(MatchedFieldTypeEnum.Header);
        }
      }
      if (scopes.includes(MatchedFieldTypeEnum.RequestBodyParam) && hasItem && 'requestBody' in doc.item && doc.item.requestBody) {
        const requestBody = doc.item.requestBody;
        let hasRequestBodyMatch = false;
        if ('formData' in requestBody && Array.isArray(requestBody.formData)) {
          hasRequestBodyMatch = requestBody.formData.some((param) => param.key.toLowerCase().includes(keyword));
        }
        if (!hasRequestBodyMatch && 'urlencoded' in requestBody && Array.isArray(requestBody.urlencoded)) {
          hasRequestBodyMatch = requestBody.urlencoded.some((param) => param.key.toLowerCase().includes(keyword));
        }
        if (hasRequestBodyMatch) {
          matchedFields.push(MatchedFieldTypeEnum.RequestBodyParam);
        }
      }
      if (scopes.includes(MatchedFieldTypeEnum.ResponseParam) && hasItem && 'responseParams' in doc.item && Array.isArray(doc.item.responseParams)) {
        const hasResponseMatch = doc.item.responseParams.some((response) => {
          if ('values' in response && Array.isArray(response.values)) {
            return response.values.some((param) => param.key.toLowerCase().includes(keyword));
          }
          return false;
        });
        if (hasResponseMatch) {
          matchedFields.push(MatchedFieldTypeEnum.ResponseParam);
        }
      }
      if (matchedFields.length > 0 && nodeType !== 'folder') {
        const projectId = doc.projectId;
        if (!projectMatchMap.has(projectId)) {
          const project = projectList.find((p) => p._id === projectId);
          if (project) {
            projectMatchMap.set(projectId, {
              ...project,
              matchedFields: [],
              matchedDocuments: [],
              matchCount: 0
            });
          }
        }
        const projectMatch = projectMatchMap.get(projectId);
        if (projectMatch) {
          projectMatch.matchedDocuments.push({
            _id: doc._id,
            name: docName,
            type: nodeType,
            method: method,
            url: urlPath,
            creator: creator,
            maintainer: maintainer,
            matchedFields: matchedFields
          });
          projectMatch.matchCount++;
        }
      }
    });
    projectList.forEach((project) => {
      const projectNameMatch = scopes.includes(MatchedFieldTypeEnum.ProjectName) && project.projectName.toLowerCase().includes(keyword);
      const projectRemarkMatch = scopes.includes(MatchedFieldTypeEnum.ProjectRemark) && project.remark.toLowerCase().includes(keyword);
      if (projectNameMatch || projectRemarkMatch) {
        if (!projectMatchMap.has(project._id)) {
          projectMatchMap.set(project._id, {
            ...project,
            matchedFields: [],
            matchedDocuments: [],
            matchCount: 0
          });
        }
        const existing = projectMatchMap.get(project._id);
        if (existing) {
          if (projectNameMatch && !existing.matchedFields.includes(MatchedFieldTypeEnum.ProjectName)) {
            existing.matchedFields.push(MatchedFieldTypeEnum.ProjectName);
            existing.matchCount++;
          }
          if (projectRemarkMatch && !existing.matchedFields.includes(MatchedFieldTypeEnum.ProjectRemark)) {
            existing.matchedFields.push(MatchedFieldTypeEnum.ProjectRemark);
            existing.matchCount++;
          }
        }
      }
    });
    projectListCopy2.value = Array.from(projectMatchMap.values());
    expandedProjectIds.value = new Set(projectMatchMap.keys());
    setTimeout(() => {
      searchLoading.value = false;
    }, 300)
    return;
  }
  request.get<CommonResponse<ApidocProjectListInfo>, CommonResponse<ApidocProjectListInfo>>('/api/project/project_list_by_keyword', {
    params: { keyword: projectName.value }
  }).then((res) => {
    projectListCopy2.value = res.data.list.map((project) => ({
      ...project,
      matchedFields: [],
      matchedDocuments: [],
      matchCount: 0
    }));
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    searchLoading.value = false;
  });
}, 300)
onMounted(() => {
  getProjectList();
  initCahce();
})

</script>

<style lang='scss' scoped>
.project-manager {
  .advanced-search-panel {
    .search-hint {
      line-height: 1.5;
    }

    .search-scope-selector {
      .search-scope-checkboxes {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .search-scope-group {
          display: flex;
          align-items: flex-start;
          margin-bottom: 0;

          .search-scope-group-label {
            width: 80px;
            flex-shrink: 0;
            text-align: right;
            font-size: 13px;
            color: var(--gray-600);
            font-weight: 500;
            padding-right: 12px;
            line-height: 32px;
          }

          .search-scope-group-items {
            flex: 1;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
        }

        :deep(.el-checkbox) {
          margin-right: 0;

          .el-checkbox__label {
            padding-left: 4px;
          }
        }
      }
    }
  }

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

  .advance-icon {
    cursor: pointer;
  }

  .project-list {
    width: 300px;
    border: 1px solid var(--gray-200);
    box-shadow: var(--box-shadow-sm);
    margin-right: 30px;
    margin-bottom: 20px;
    padding: 10px;
    position: relative;

    &.is-searching {
      width: 600px;
    }

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

    .match-details-section {
      padding: 12px;
      background-color: var(--gray-50);
      border: 1px solid var(--gray-200);
      border-radius: 4px;

      .match-header {
        color: var(--primary-color);

        &:hover {
          opacity: 0.8;
        }
      }

      .match-content {
        padding-left: 20px;

        .match-item {
          line-height: 1.8;
        }

        .matched-docs {
          margin-top: 8px;
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
