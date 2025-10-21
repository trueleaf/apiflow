<template>
  <div class="project-manager">
    <!-- 搜索条件 -->
    <div class="search-item d-flex a-center mb-3">
      <el-input v-model="projectName" :placeholder="$t('项目名称')" :prefix-icon="SearchIcon" class="w-200px mr-3" clearable>
        <template #suffix>
          <el-icon :title="$t('高级搜索')" class="cursor-pointer" :color="isShowAdvanceSearch ? '#409EFF' : '#aaa'"
            @click.stop.prevent="() => isShowAdvanceSearch = !isShowAdvanceSearch">
            <Tools />
          </el-icon>
        </template>
      </el-input>
      <el-button :icon="PlusIcon" @click="dialogVisible = true">{{ $t("新建项目") }}</el-button>
      <el-button v-if="0" type="success" :icon="DownloadIcon" @click="dialogVisible3 = true">{{ $t("导入项目") }}</el-button>
    </div>
    <!-- 高级搜索 -->
    <div v-if="isShowAdvanceSearch">
      <el-input v-model="projectKeyword" :prefix-icon="SearchIcon" class="w-50 mr-3" clearable
        :placeholder="$t('输入接口url eg: 接口url')" @keyup.enter="() => { debounceSearch() }"
        @change="() => { debounceSearch() }" @input="() => { debounceSearch() }">
        <template #append>
          <el-button  :loading="projectLoading || searchLoading" @click="() => { debounceSearch() }">
            <el-icon class="el-icon--right">
              <SearchIcon />
            </el-icon>
            <span>搜索</span>
          </el-button>
        </template>
      </el-input>
    </div>
    <!-- 项目列表 -->
    <Loading :loading="!isStandalone && (projectLoading || searchLoading)">
      <!-- 收藏的项目 -->
      <h2 v-show="starProjects.length > 0">
        <span class="cursor-pointer">{{ t("收藏的项目") }}</span>
      </h2>
      <div v-show="starProjects.length > 0" class="project-wrap">
        <div v-for="(item, index) in starProjects" :key="index" class="project-list">
          <div class="project-header">
            <div :title="item.projectName" class="title theme-color text-ellipsis">
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
            <span>{{ formatDate(item.updatedAt) }}</span>&nbsp;&nbsp;
          </div>
          <div class="d-flex j-end a-center gray-500">
            <span>{{ $t("创建者") }}:</span>
            <span>{{ item.owner.name }}</span>&nbsp;&nbsp;
          </div>
          <div class="project-bottom d-flex">
            <div>
              <span class="f-sm">{{ $t("接口数") }}:</span>
              <span class="teal">{{ item.docNum || 0 }}</span>
            </div>
            <div class="ml-auto">
              <el-button type="default" @click="handleJumpToProject(item)">{{ $t("编辑") }}</el-button>
              <el-button v-if="!isStandalone"  @click="handleJumpToView(item)">{{ $t("预览") }}</el-button>
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
      <!-- 项目列表 -->
      <div v-show="!isFold" class="project-wrap">
        <div v-for="(item, index) in projectList" :key="index" class="project-list">
          <div class="project-header">
            <div :title="item.projectName" class="title theme-color text-ellipsis">
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
            <span>{{ item.owner.name }}</span>&nbsp;&nbsp;
          </div>
          <div class="d-flex j-end a-center gray-600">
            <span>{{ $t("最新更新") }}:</span>
            <span>{{ formatDate(item.updatedAt) }}</span>&nbsp;&nbsp;
          </div>
          <div class="project-bottom d-flex">
            <div>
              <span class="f-sm">{{ $t("接口数") }}:</span>
              <span class="teal">{{ item.docNum || 0 }}</span>
            </div>
            <div class="ml-auto">
              <el-button type="default" @click="handleJumpToProject(item)">{{ $t("编辑") }}</el-button>
              <el-button v-if="!isStandalone"  @click="handleJumpToView(item)">{{ $t("预览") }}</el-button>
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
} from '@element-plus/icons-vue'
import Loading from '@/components/common/loading/GLoading.vue'
import Emphasize from '@/components/common/emphasize/GEmphasize.vue'
import AddProjectDialog from '../dialog/addProject/AddProject.vue'
import EditProjectDialog from '../dialog/editProject/EditProject.vue'
import EditPermissionDialog from '../dialog/editPermission/EditPermission.vue'
import { useI18n } from 'vue-i18n'
import type { CommonResponse, ApidocProjectListInfo, ApidocProjectInfo } from '@src/types';
import { computed, onMounted, ref, watch } from 'vue';
import { request } from '@/api/api';
import 'element-plus/es/components/message-box/style/css';
import { ElMessageBox } from 'element-plus';
import { router } from '@/router';
import { formatDate } from '@/helper';
import { debounce } from "lodash-es";
import { useApidocBaseInfo } from '@/store/apidoc/baseInfoStore'
import { projectCache, apiNodesCache } from '@/cache/index'
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
const projectKeyword = ref('')
const projectListCopy = ref<ApidocProjectInfo[]>([]);
const projectListCopy2 = ref<ApidocProjectInfo[]>([]);
watch(() => projectStore.projectList, (list) => {
  projectListCopy.value = list.slice();
  starProjectIds.value = list.filter((item) => item.isStared).map((item) => item._id);
  const isAdvancedSearch = projectKeyword.value.trim().length > 0 && isShowAdvanceSearch.value;
  if (isStandalone.value && !isAdvancedSearch) {
    projectListCopy2.value = list.slice();
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
const dialogVisible = ref(false);
const dialogVisible2 = ref(false);
const dialogVisible3 = ref(false);
const dialogVisible4 = ref(false);
const projectList = computed(() => {
  const list = (projectKeyword.value.trim().length > 0 && isShowAdvanceSearch.value) ? projectListCopy2.value : projectListCopy.value;
  const filteredProjectList = list.filter((val) => val.projectName.match(new RegExp(projectName.value, 'gi')))
  return filteredProjectList.map((val) => {
    const isStared = starProjectIds.value.find((id: string) => id === val._id);
    return {
      ...val,
      isStared: !!isStared,
    };
  });
});
const starProjects = computed(() => {
  const list = (projectKeyword.value.trim().length > 0 && isShowAdvanceSearch.value) ? projectListCopy2.value : projectListCopy.value;
  const filteredProjectList = list.filter((val) => val.projectName.match(new RegExp(projectName.value, 'gi')))
  return filteredProjectList.filter((projectInfo) => starProjectIds.value.find((id: string) => id === projectInfo._id)).map((val) => {
    const isStared = starProjectIds.value.find((id: string) => id === val._id);
    return {
      ...val,
      isStared: !!isStared,
    };
  });
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
      window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.APIFLOW.CONTENT_TO_TOPBAR.PROJECT_DELETED, _id);
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
        await projectCache.deleteProject(_id);
        await cleanupMockLogs();
        getProjectList();
        notifyProjectDeleted();
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
  if(!isStandalone.value){
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
    window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.APIFLOW.CONTENT_TO_TOPBAR.PROJECT_RENAMED, {
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
//防抖搜索
const debounceSearch = debounce(async () => {
  searchLoading.value = true;
  if (projectKeyword.value?.trim().length === 0) {
    projectListCopy2.value = [];
    setTimeout(() => {
      searchLoading.value = false;
    }, 100)
    return
  }
  if (isStandalone.value) {
    const keyword = projectKeyword.value.toLowerCase().trim();
    const docs = await apiNodesCache.getNodeList();
    const projectList = await projectCache.getProjectList();
    const filteredDocs = docs.filter((doc) => {
      const hasItem = 'item' in doc && doc.item;
      const urlMatch = hasItem && 'url' in doc.item && doc.item.url && 
                      ('path' in doc.item.url ? doc.item.url.path.toLowerCase().includes(keyword) : false);
      const docNameMatch = doc.info.name.toLowerCase().includes(keyword);
      const creatorMatch = doc.info.creator.toLowerCase().includes(keyword);
      const lastModifierMatch = doc.info.maintainer.toLowerCase().includes(keyword);
      return (
        urlMatch || docNameMatch || creatorMatch || lastModifierMatch
      );
    });
    const filteredProjects = projectList.filter((project) => {
      const projectNameMatch = project.projectName.toLowerCase().includes(keyword);
      const hasMatchingDoc = filteredDocs.some((doc) => doc.projectId === project._id);
      return projectNameMatch || hasMatchingDoc;
    });
    projectListCopy2.value = filteredProjects;
    setTimeout(() => {
      searchLoading.value = false;
    }, 300)
    return;
  }
  request.get<CommonResponse<ApidocProjectListInfo>, CommonResponse<ApidocProjectListInfo>>('/api/project/project_list_by_keyword', {
    params: { keyword: projectKeyword.value }
  }).then((res) => {
    projectListCopy2.value = res.data.list;
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    searchLoading.value = false;
  });
}, isStandalone.value ? 100 : 1000)
onMounted(() => {
  getProjectList();
  initCahce();
})

</script>

<style lang='scss' scoped>
.project-manager {
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
