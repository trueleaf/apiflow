<template>
  <div class="tab-a">
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
      <el-button type="success" :icon="PlusIcon" @click="dialogVisible = true">{{ $t("新建项目") }}</el-button>
      <el-button v-if="0" type="success" :icon="DownloadIcon" @click="dialogVisible3 = true">{{ $t("导入项目") }}</el-button>
    </div>
    <!-- 高级搜索 -->
    <div v-if="isShowAdvanceSearch">
      <el-input v-model="projectKeyword" :prefix-icon="SearchIcon" class="w-50 mr-3" clearable
        :placeholder="$t('输入接口url eg: 接口url')" @keyup.enter="() => { debounceSearch() }"
        @change="() => { debounceSearch() }" @input="() => { debounceSearch() }">
        <template #append>
          <el-button type="primary" :loading="loading" @click="() => { debounceSearch() }">
            <el-icon class="el-icon--right">
              <SearchIcon />
            </el-icon>
            <span>搜索</span>
          </el-button>
        </template>
      </el-input>
    </div>
    <!-- 项目列表 -->
    <Loading :loading="!isStandalone && loading">
      <!-- 收藏的项目 -->
      <h2 v-show="starProjects.length > 0">{{ t("收藏的项目") }}</h2>
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
              <el-button type="primary" @click="handleJumpToProject(item)">{{ $t("编辑") }}</el-button>
              <el-button v-if="!isStandalone" type="primary" @click="handleJumpToView(item)">{{ $t("预览") }}</el-button>
            </div>
          </div>
        </div>
      </div>
      <h2 class="cursor-pointer" @click="toggleCollapse">
        <el-icon v-if="!isFold" class="mr-1" :size="16">
          <CaretBottomIcon />
        </el-icon>
        <el-icon v-if="isFold" class="mr-1" :size="16">
          <CaretRightIcon />
        </el-icon>
        <span>{{ $t("全部项目") }}({{ projectList.length }})</span>
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
              <el-button type="primary" @click="handleJumpToProject(item)">{{ $t("编辑") }}</el-button>
              <el-button v-if="!isStandalone" type="primary" @click="handleJumpToView(item)">{{ $t("预览") }}</el-button>
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
import Loading from '@/components/common/loading/g-loading.vue'
import Emphasize from '@/components/common/emphasize/g-emphasize.vue'
import AddProjectDialog from '../dialog/add-project/add-project.vue'
import EditProjectDialog from '../dialog/edit-project/edit-project.vue'
import EditPermissionDialog from '../dialog/permission/permission.vue'
import { t } from 'i18next'
import type { Response, ApidocProjectListInfo, ApidocProjectInfo } from '@src/types/global';
import { computed, onMounted, ref } from 'vue';
import { request } from '@/api/api';
import 'element-plus/es/components/message-box/style/css';
import { ElMessageBox } from 'element-plus';
import { router } from '@/router';
import { debounce, formatDate } from '@/helper';
import { useApidocBaseInfo } from '@/store/apidoc/base-info'
import { standaloneCache } from '@/cache/standalone'

/*
|--------------------------------------------------------------------------
| 变量
|--------------------------------------------------------------------------
*/
const projectName = ref('');
const projectKeyword = ref('')
const recentVisitProjectIds = ref<string[]>([]);
const starProjectIds = ref<string[]>([]);
const projectListCopy = ref<ApidocProjectInfo[]>([]);
const projectListCopy2 = ref<ApidocProjectInfo[]>([]);
const currentEditProjectId = ref('');
const currentEditProjectName = ref('');
const isShowAdvanceSearch = ref(false);
const isFold = ref(false);
const loading = ref(false);
const starLoading = ref(false);
const unStarLoading = ref(false);
const dialogVisible = ref(false);
const dialogVisible2 = ref(false);
const dialogVisible3 = ref(false);
const dialogVisible4 = ref(false);
const isStandalone = ref(__STANDALONE__)
const projectList = computed(() => {
  const list = (projectKeyword.value.trim().length > 0 && isShowAdvanceSearch.value) ? projectListCopy2.value : projectListCopy.value;
  const filteredProjectList = list.filter((val) => val.projectName.match(new RegExp(projectName.value, 'gi')))
  return filteredProjectList.map((val) => {
    const isStared = starProjectIds.value.find((id) => id === val._id);
    return {
      ...val,
      isStared: !!isStared,
    };
  });
});
const starProjects = computed(() => {
  const list = (projectKeyword.value.trim().length > 0 && isShowAdvanceSearch.value) ? projectListCopy2.value : projectListCopy.value;
  const filteredProjectList = list.filter((val) => val.projectName.match(new RegExp(projectName.value, 'gi')))
  return filteredProjectList.filter((projectInfo) => starProjectIds.value.find((id) => id === projectInfo._id)).map((val) => {
    const isStared = starProjectIds.value.find((id) => id === val._id);
    return {
      ...val,
      isStared: !!isStared,
    };
  });
});
const apidocBaseInfo = useApidocBaseInfo()
/*
|--------------------------------------------------------------------------
| 项目列表增删改查
|--------------------------------------------------------------------------
*/
//获取项目列表
const getProjectList = () => {
  if (__STANDALONE__) {
    standaloneCache.getProjectList().then((projectList) => {
      projectListCopy.value = projectList;
      projectListCopy2.value = projectList;
      recentVisitProjectIds.value = projectList.map((item) => item._id);
      starProjectIds.value = projectList.filter((item) => item.isStared).map((item) => item._id);

    }).catch((err) => {
      console.error(err);
    })
    return;
  }
  loading.value = true;
  request.get<Response<ApidocProjectListInfo>, Response<ApidocProjectListInfo>>('/api/project/project_list').then((res) => {
    recentVisitProjectIds.value = res.data.recentVisitProjects;
    starProjectIds.value = res.data.starProjects;
    projectListCopy.value = res.data.list;
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    loading.value = false;
  });
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
    // 发送IPC事件通知topBarView删除对应的tab
    const notifyProjectDeleted = () => {
      window.electronAPI?.sendToMain('apiflow-content-project-deleted', _id);
    }
    if (__STANDALONE__) {
      try {
        await standaloneCache.deleteProject(_id);
        getProjectList();
        notifyProjectDeleted();
      } catch (err) {
        console.error(err);
      }
      return;
    }
    request.delete('/api/project/delete_project', { data: { ids: [_id] } }).then(() => {
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
/*
|--------------------------------------------------------------------------
| 其他操作
|--------------------------------------------------------------------------
*/
//收藏项目
const handleStar = async (item: ApidocProjectInfo) => {
  if (starLoading.value) {
    return;
  }
  starLoading.value = true;
  try {
    if (__STANDALONE__) {
      const projectList = await standaloneCache.getProjectList();
      const project = projectList.find(p => p._id === item._id);
      if (project) {
        project.isStared = true;
        await standaloneCache.setProjectList(projectList);
        item.isStared = true;
        starProjectIds.value.push(item._id);
      }
      starLoading.value = false;
      return;
    }
    request.put('/api/project/star', { projectId: item._id }).then(() => {
      item.isStared = true;
      starProjectIds.value.push(item._id);
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
    if (__STANDALONE__) {
      const projectList = await standaloneCache.getProjectList();
      const project = projectList.find(p => p._id === item._id);
      if (project) {
        project.isStared = false;
        await standaloneCache.setProjectList(projectList);
        item.isStared = false;
        const delIndex = starProjectIds.value.findIndex((val) => val === item._id);
        starProjectIds.value.splice(delIndex, 1);
      }
      unStarLoading.value = false;
      return;
    }
    request.put('/api/project/unstar', { projectId: item._id }).then(() => {
      item.isStared = false;
      const delIndex = starProjectIds.value.findIndex((val) => val === item._id);
      starProjectIds.value.splice(delIndex, 1);
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
  if(!__STANDALONE__){
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
  if (__STANDALONE__) {
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

  // 如果有编辑数据，发送IPC事件通知topBarView更新tab名称
  if (data) {
    window.electronAPI?.sendToMain('apiflow-content-project-renamed', {
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
const debounceSearch = debounce(async () => {
  loading.value = true;
  if (projectKeyword.value?.trim().length === 0) {
    projectListCopy2.value = [];
    starProjectIds.value = projectListCopy.value.filter((item) => item.isStared).map((item) => item._id);
    setTimeout(() => {
      loading.value = false;
    }, 100)
    return
  }
  if (__STANDALONE__) {
    const keyword = projectKeyword.value.toLowerCase().trim();
    const docs = await standaloneCache.getDocsList();
    const projectList = await standaloneCache.getProjectList();
    const filteredDocs = docs.filter((doc) => {
      const urlMatch = doc.item.url.path.toLowerCase().includes(keyword);
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
    recentVisitProjectIds.value = filteredProjects.map((item) => item._id);
    starProjectIds.value = filteredProjects.filter((item) => item.isStared).map((item) => item._id);
    projectListCopy2.value = filteredProjects;
    setTimeout(() => {
      loading.value = false;
    }, 300)
    return;
  }
  request.get<Response<ApidocProjectListInfo>, Response<ApidocProjectListInfo>>('/api/project/project_list_by_keyword', {
    params: { keyword: projectKeyword.value }
  }).then((res) => {
    recentVisitProjectIds.value = res.data.recentVisitProjects;
    starProjectIds.value = res.data.starProjects;
    projectListCopy2.value = res.data.list;
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    loading.value = false;
  });
}, isStandalone.value ? 100 : 1000)
/*
|--------------------------------------------------------------------------
| 生命周期
|--------------------------------------------------------------------------
*/
onMounted(() => {
  getProjectList();
  initCahce();
})

</script>

<style lang='scss' scoped>
.tab-a {
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
      padding: 10px 0;
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
