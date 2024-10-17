<template>
  <div class="tab-a">
    <!-- 搜索条件 -->
    <div class="search-item d-flex a-center mb-3">
      <el-input v-model="projectName" :placeholder="t('项目名称')" :prefix-icon="SearchIcon" class="w-200px mr-3" clearable>
        <template #suffix>
          <el-icon :title="t('高级搜索')" class="cursor-pointer" :color="isShowAdvanceSearch ? '#409EFF' : '#aaa'"
            @click.stop.prevent="() => isShowAdvanceSearch = !isShowAdvanceSearch">
            <Tools />
          </el-icon>
        </template>
      </el-input>
      <el-button type="success" :icon="PlusIcon" @click="dialogVisible = true">{{ t("新建项目") }}</el-button>
      <el-button v-if="0" type="success" :icon="DownloadIcon" @click="dialogVisible3 = true">{{ t("导入项目") }}</el-button>
    </div>
    <!-- 高级搜索 -->
    <div v-if="isShowAdvanceSearch">
      <el-input 
        v-model="projectKeyword" 
        :prefix-icon="SearchIcon" 
        class="w-50 mr-3" 
        clearable
        :placeholder="t('输入接口url eg: 接口url')"  
        @change="() => { loading = true; debounceSearch() }"
        @input="() => { loading = true; debounceSearch() }">
      </el-input>
    </div>
    <!-- 项目列表 -->
    <Loading :loading="loading">
      <!-- 收藏的项目 -->
      <h2 v-show="starProjects.length > 0">{{ t("收藏的项目") }}</h2>
      <div v-show="starProjects.length > 0" class="project-wrap">
        <div v-for="(item, index) in starProjects" :key="index" class="project-list">
          <div class="project-header">
            <div :title="item.projectName" class="title theme-color text-ellipsis">
              <Emphasize :value="item.projectName" :keyword="projectName"></Emphasize>
            </div>
            <div class="operator">
              <div :title="t('编辑')" @click="handleOpenEditDialog(item)">
                <el-icon :size="16">
                  <EditIcon></EditIcon>
                </el-icon>
              </div>
              <div :title="t('成员管理')" @click="handleOpenPermissionDialog(item)">
                <el-icon :size="16">
                  <UserIcon></UserIcon>
                </el-icon>
              </div>
              <div v-if="!item.isStared" :title="t('收藏')" @click="handleStar(item)">
                <el-icon v-if="!starLoading" :size="16">
                  <star-icon></star-icon>
                </el-icon>
                <el-icon v-if="starLoading" :size="16" class="is-loading">
                  <LoadingIcon></LoadingIcon>
                </el-icon>
              </div>
              <div v-if="item.isStared" :title="t('取消收藏')" @click="handleUnStar(item)">
                <el-icon v-if="!unStarLoading" :size="19" class="yellow">
                  <StarFilledIcon></StarFilledIcon>
                </el-icon>
                <el-icon v-if="unStarLoading" :size="16" class="is-loading">
                  <LoadingIcon></LoadingIcon>
                </el-icon>
              </div>
              <div :title="t('删除')" @click="deleteProject(item._id)">
                <el-icon :size="16">
                  <DeleteIcon></DeleteIcon>
                </el-icon>
              </div>
            </div>
          </div>
          <div class="d-flex j-end a-center gray-500 mt-2">
            <span>{{ t("最新更新") }}:</span>
            <span>{{ formatDate(item.updatedAt) }}</span>&nbsp;&nbsp;
          </div>
          <div class="d-flex j-end a-center gray-500">
            <span>{{ t("创建者") }}:</span>
            <span>{{ item.owner.name }}</span>&nbsp;&nbsp;
          </div>
          <div class="project-bottom d-flex">
            <div>
              <span class="f-sm">{{ t("接口数") }}:</span>
              <span class="teal">{{ item.docNum }}</span>
            </div>
            <div class="ml-auto">
              <el-button type="primary" @click="handleJumpToProject(item)">{{ t("编辑") }}</el-button>
              <el-button type="primary" @click="handleJumpToView(item)">{{ t("预览") }}</el-button>
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
        <span>{{ t("全部项目") }}({{ projectList.length }})</span>
      </h2>
      <!-- 项目列表 -->
      <div v-show="!isFold" class="project-wrap">
        <div v-for="(item, index) in projectList" :key="index" class="project-list">
          <div class="project-header">
            <div :title="item.projectName" class="title theme-color text-ellipsis">
              <Emphasize :value="item.projectName" :keyword="projectName"></Emphasize>
            </div>
            <div class="operator">
              <div :title="t('编辑')" @click="handleOpenEditDialog(item)">
                <el-icon :size="16">
                  <EditIcon></EditIcon>
                </el-icon>
              </div>
              <div :title="t('成员管理')" @click="handleOpenPermissionDialog(item)">
                <el-icon :size="16">
                  <UserIcon></UserIcon>
                </el-icon>
              </div>
              <div v-if="!item.isStared" :title="t('收藏')" @click="handleStar(item)">
                <el-icon v-if="!starLoading" :size="16">
                  <star-icon></star-icon>
                </el-icon>
                <el-icon v-if="starLoading" :size="16" class="is-loading">
                  <LoadingIcon></LoadingIcon>
                </el-icon>
              </div>
              <div v-if="item.isStared" :title="t('取消收藏')" @click="handleUnStar(item)">
                <el-icon v-if="!unStarLoading" :size="19" class="yellow">
                  <StarFilledIcon></StarFilledIcon>
                </el-icon>
                <el-icon v-if="unStarLoading" :size="16" class="is-loading">
                  <LoadingIcon></LoadingIcon>
                </el-icon>
              </div>
              <div :title="t('删除')" @click="deleteProject(item._id)">
                <el-icon :size="16">
                  <DeleteIcon></DeleteIcon>
                </el-icon>
              </div>
            </div>
          </div>
          <div class="d-flex j-end a-center gray-600 mt-2">
            <span>{{ t("创建者") }}:</span>
            <span>{{ item.owner.name }}</span>&nbsp;&nbsp;
          </div>
          <div class="d-flex j-end a-center gray-600">
            <span>{{ t("最新更新") }}:</span>
            <span>{{ formatDate(item.updatedAt) }}</span>&nbsp;&nbsp;
          </div>
          <div class="project-bottom d-flex">
            <div>
              <span class="f-sm">{{ t("接口数") }}:</span>
              <span class="teal">{{ item.docNum }}</span>
            </div>
            <div class="ml-auto">
              <el-button type="primary" @click="handleJumpToProject(item)">{{ t("编辑") }}</el-button>
              <el-button type="primary" @click="handleJumpToView(item)">{{ t("预览") }}</el-button>
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
const projectList = computed(() => {
  const list = (projectKeyword.value.trim().length > 0 && !loading.value && isShowAdvanceSearch.value) ? projectListCopy2.value : projectListCopy.value;
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
  const list = (projectKeyword.value.trim().length > 0 && !loading.value && isShowAdvanceSearch.value) ? projectListCopy2.value : projectListCopy.value;
  const filteredProjectList = list.filter((val) => val.projectName.match(new RegExp(projectName.value, 'gi')))
  return filteredProjectList.filter((projectInfo) => starProjectIds.value.find((id) => id === projectInfo._id)).map((val) => {
    const isStared = starProjectIds.value.find((id) => id === val._id);
    return {
      ...val,
      isStared: !!isStared,
    };
  });
});

/*
|--------------------------------------------------------------------------
| 项目列表增删改查
|--------------------------------------------------------------------------
*/
//获取项目列表
const getProjectList = () => {
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
//收藏项目
const handleStar = (item: ApidocProjectInfo) => {
  if (starLoading.value) {
    return;
  }
  starLoading.value = true;
  request.put('/api/project/star', { projectId: item._id }).then(() => {
    item.isStared = true;
    starProjectIds.value.push(item._id);
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    starLoading.value = false;
  });
}
//取消收藏项目
const handleUnStar = (item: ApidocProjectInfo) => {
  if (unStarLoading.value) {
    return;
  }
  unStarLoading.value = true;
  request.put('/api/project/unstar', { projectId: item._id }).then(() => {
    item.isStared = true;
    const delIndex = starProjectIds.value.findIndex((val) => val === item._id);
    starProjectIds.value.splice(delIndex, 1);
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    unStarLoading.value = false;
  });
}
//删除项目
const deleteProject = (_id: string) => {
  ElMessageBox.confirm(t('此操作将永久删除此条记录, 是否继续?'), t('提示'), {
    confirmButtonText: t('确定'),
    cancelButtonText: t('取消'),
    type: 'warning'
  }).then(() => {
    request.delete('/api/project/delete', { data: { _id } }).then(() => {
      getProjectList();
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
//初始化缓存
const initCahce = () => {
  isFold.value = localStorage.getItem('doc-list/isFold') === 'close';
}
//跳转到编辑
const handleJumpToProject = (item: ApidocProjectInfo) => {
  request.put('/api/project/visited', { projectId: item._id }).catch((err) => {
    console.error(err);
  });
  router.push({
    path: '/v1/apidoc/doc-edit',
    query: {
      id: item._id,
      mode: 'edit',
    },
  });
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
      mode: 'view',
    },
  });
}
//新增项目成功
const handleAddSuccess = (id: string) => {
  router.push({
    path: '/v1/apidoc/doc-edit',
    query: {
      id,
      mode: 'edit'
    }
  });
}
//编辑项目成功
const handleEditSuccess = () => {
  getProjectList()
}
//折叠打开项目列表
const toggleCollapse = () => {
  isFold.value = !isFold.value;
  localStorage.setItem('doc-list/isFold', isFold.value ? 'close' : 'open');
}
const debounceSearch = debounce(() => {
  if (projectKeyword.value?.trim().length === 0) {
    projectListCopy2.value = [];
    loading.value = false
    return
  }
  request.get<Response<ApidocProjectListInfo>, Response<ApidocProjectListInfo>>('/api/project/project_list_by_keyword', {
    params: { keyword: projectKeyword.value }
  }).then((res) => {
    recentVisitProjectIds.value = res.data.recentVisitProjects;
    starProjectIds.value = res.data.starProjects;
    projectListCopy2.value = res.data.list;
  }).catch((err) => {
    console.error(err);
  }).finally(() =>{ 
    loading.value = false;
  });
}, 1000)
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

<style lang="scss" scoped>
.tab-a {
  .project-wrap {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: size(20);

    @media only screen and (max-width: 720px) {
      justify-content: center;
    }
  }

  .advance-icon {
    cursor: pointer;
  }

  .project-list {
    width: size(300);
    border: 1px solid $gray-200;
    box-shadow: $box-shadow-sm;
    margin-right: size(30);
    margin-bottom: size(20);
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
        font-size: fz(16);
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
            background: $gray-200;
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
        background: $gray-200;
      }

      i {
        font-size: 18px;
      }
    }
  }
}
</style>
