<template>
  <div class="tool">
    <div class="d-flex a-center j-center">
      <h2 v-if="projectName" class="gray-700 f-lg text-center text-ellipsis" :title="projectName">{{ projectName }}</h2>
      <h2 v-else class="gray-700 f-lg text-center text-ellipsis" :title="projectName">/</h2>
      <el-popover :visible="toggleProjectVisible" transition="none" placement="right"
        width="500px">
        <template #reference>
          <div class="toggle-btn" title="切换项目" @click.stop="handleToggleProjectModel">
            <el-icon>
              <Switch></Switch>
            </el-icon>
          </div>
        </template>
        <SLoading :loading="projectLoading" class="tool-toggle-project">
          <h3 v-if="startProjectList.length > 0">收藏的项目</h3>
          <div class="project-wrap">
            <div v-for="(item, index) in startProjectList" :key="index" class="item" @click="handleChangeProject(item)">
              <span class="item-title">{{ item.projectName }}</span>
              <span class="item-content gray-600">{{ item.owner.name }}</span>
            </div>
          </div>
          <h3>项目列表</h3>
          <div class="project-wrap">
            <div v-for="(item, index) in projectList" :key="index" class="item" @click="handleChangeProject(item)">
              <span class="item-title">{{ item.projectName }}</span>
              <span class="item-content gray-600">{{ item.owner.name }}</span>
            </div>
          </div>
        </SLoading>
      </el-popover>
    </div>
    <div class="p-relative">
      <el-input v-model="formInfo.iptValue" size="large" class="doc-search" :placeholder="t('文档名称、文档url')" clearable
        @change="handleFilterBanner"></el-input>
      <el-badge :is-dot="hasFilterCondition" class="badge">
        <el-popover placement="right-end" :hide-after="0" transition="none" width="50vw" trigger="click">
          <template #reference>
            <div class="advance" :title="t('高级筛选')">
              <i class="iconfont icongaojishaixuan"></i>
            </div>
          </template>
          <SFieldset title="过滤条件" class="search-panel">
            <!-- 操作人员 -->
            <div class="op-item a-center">
              <div class="flex0">{{ t("操作人员") }}：</div>
              <el-checkbox-group v-model="formInfo.maintainers">
                <el-checkbox v-for="(item, index) in maintainerEnum" :key="index" :value="item"></el-checkbox>
                <el-button link type="primary" text class="ml-2" @click="handleClearMaintainer">{{ t("清空")
                  }}</el-button>
              </el-checkbox-group>
            </div>
            <!-- 日期范围 -->
            <div class="op-item">
              <div class="flex0">
                <span>{{ t("录入日期") }}&nbsp;</span>
                <span>：</span>
              </div>
              <el-radio-group v-model="dateRange">
                <el-radio value="1d">{{ t("今天") }}</el-radio>
                <el-radio value="2d">{{ t("近两天") }}</el-radio>
                <el-radio value="3d">{{ t("近三天") }}</el-radio>
                <el-radio value="7d">{{ t("近七天") }}</el-radio>
                <el-radio value="自定义">{{ t("自定义") }}</el-radio>
                <el-date-picker v-if="dateRange === '自定义'" v-model="customDateRange" type="datetimerange"
                  :range-separator="t('至')" value-format="x" :start-placeholder="t('开始日期')" class="mr-1"
                  :end-placeholder="t('结束日期')">
                </el-date-picker>
                <el-button link type="primary" text @click="handleClearDate">{{ t("清空") }}</el-button>
              </el-radio-group>
            </div>
            <!-- 最近多少条数据 -->
            <div class="op-item">
              <div class="flex0">
                <span>{{ t("最近多少条") }}&nbsp;</span>
                <span>：</span>
              </div>
              <el-radio-group v-model="formInfo.recentNum">
                <el-radio :value="2">{{ t("2条") }}</el-radio>
                <el-radio :value="5">{{ t("5条") }}</el-radio>
                <el-radio :value="10">{{ t("10条") }}</el-radio>
                <el-radio :value="15">{{ t("15条") }}</el-radio>
                <el-button link type="primary" text @click="handleClearRecentNum">{{ t("清空") }}</el-button>
              </el-radio-group>
            </div>
          </SFieldset>
        </el-popover>
      </el-badge>
    </div>
    <!-- 工具栏 -->
    <div class="tool-icon mt-1">
      <!-- 固定的工具栏操作 -->
      <SDraggable v-model="pinOperations" animation="150" item-key="name" class="operation" group="operation">
        <template #item="{ element }">
          <div :title="t(element.name)" class="cursor-pointer"
            :class="{ 'cursor-not-allowed': isView && !element.viewOnly }">
            <template v-if="element.icon === 'variable'">
              <Variable :size="20" :stroke-width="1.5" class="lucide-icon" @click="handleEmit(element.op)" />
            </template>
            <template v-else-if="element.icon === 'arrowDownToLine'">
              <ArrowDownToLine :size="20" :stroke-width="1.5" class="lucide-icon" @click="handleEmit(element.op)" />
            </template>
            <template v-else-if="element.icon === 'arrowUpToLine'">
              <ArrowUpToLine :size="20" :stroke-width="1.5" class="lucide-icon" @click="handleEmit(element.op)" />
            </template>
            <svg v-else class="svg-icon" aria-hidden="true" @click="handleEmit(element.op)">
              <use :xlink:href="element.icon"></use>
            </svg>
          </div>
        </template>
      </SDraggable>
      <!-- 全部工具栏操作 -->
      <el-popover :visible="visible" popper-class="tool-panel" transition="none" placement="right" :width="320">
        <template #reference>
          <div class="more" @click.stop="visible = !visible">
            <el-icon :size="16" :title="t('更多操作')" class="more-op">
              <MoreFilled />
            </el-icon>
          </div>
        </template>
        <div class="toolbar-header py-2 px-2">{{ t("快捷操作") }}</div>
        <div class="toolbar-close" @click="visible = false">
          <el-icon :size="18" class="more-op">
            <Close />
          </el-icon>
        </div>
        <SDraggable v-model="operations" animation="150" item-key="name" group="operation2">
          <template #item="{ element }">
            <div class="dropdown-item cursor-pointer" :class="{ 'cursor-not-allowed': isView && !element.viewOnly }"
              @click="handleEmit(element.op)">
              <template v-if="element.icon === 'variable'">
                <Variable :size="20" :stroke-width="1.5" class="lucide-icon mr-2" />
              </template>
              <template v-else-if="element.icon === 'arrowDownToLine'">
                <ArrowDownToLine :size="20" :stroke-width="1.5" class="lucide-icon mr-2" />
              </template>
              <template v-else-if="element.icon === 'arrowUpToLine'">
                <ArrowUpToLine :size="20" :stroke-width="1.5" class="lucide-icon mr-2" />
              </template>
              <svg v-else class="svg-icon mr-2" aria-hidden="true">
                <use :xlink:href="element.icon"></use>
              </svg>
              <div class="label">{{ t(element.name) }}</div>
              <div class="shortcut">
                <span v-for="(item, index) in element.shortcut" :key="item">
                  <span>{{ item }}</span>
                  <span v-if="index !== element.shortcut.length - 1">+</span>
                </span>
              </div>
              <div class="pin iconfont iconpin" :class="{ active: element.pin }" @click.stop="togglePin(element)"></div>
            </div>
          </template>
        </SDraggable>
      </el-popover>
    </div>
  </div>
  <SAddFileDialog v-if="addFileDialogVisible" v-model="addFileDialogVisible" @success="handleAddFileAndFolderCb">
  </SAddFileDialog>
  <SAddFolderDialog v-if="addFolderDialogVisible" v-model="addFolderDialogVisible" @success="handleAddFileAndFolderCb">
  </SAddFolderDialog>
</template>

<script lang="ts" setup>
import { ref, Ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import SDraggable from 'vuedraggable'
import { MoreFilled, Close, Switch } from '@element-plus/icons-vue'
import { Variable, ArrowDownToLine, ArrowUpToLine } from 'lucide-vue-next'
import type { ApidocBanner, ApidocOperations, ApidocProjectInfo } from '@src/types'
import { forEachForest } from '@/helper'
import { router } from '@/router/index'
import { useI18n } from 'vue-i18n'
import { request } from '@/api/api'
import { projectWorkbenchCache } from '@/cache/projectWorkbench/projectWorkbenchCache.ts'
import SAddFileDialog from '../../../dialog/addFile/AddFile.vue'
import SAddFolderDialog from '../../../dialog/addFolder/AddFolder.vue'
import { originOperaions } from './operations'
import { addFileAndFolderCb } from '../composables/curd-node'
import { useApidocBaseInfo } from '@/store/apidoc/baseInfoStore'
import { useApidocBanner } from '@/store/apidoc/bannerStore'
import { useApidocTas } from '@/store/apidoc/tabsStore'
import SLoading from '@/components/common/loading/ClLoading.vue'
import SFieldset from '@/components/common/fieldset/ClFieldset.vue'
import { useProjectStore } from '@/store/project/projectStore'
import { useRuntime } from '@/store/runtime/runtimeStore'
import { IPC_EVENTS } from '@src/types/ipc'


type Operation = {
  //操作名称
  name: string,
  //图标
  icon: string,
  //操作标识
  op: string,
  //快捷键
  shortcut: string[],
  //是否固定操作栏
  pin: boolean,
  //预览模式展示
  viewOnly?: boolean,
};

const apidocBaseInfoStore = useApidocBaseInfo();
const apidocBannerStore = useApidocBanner();
const apidocTabsStore = useApidocTas();
const { t } = useI18n()
const projectStore = useProjectStore();
const { projectList } = storeToRefs(projectStore);
const runtimeStore = useRuntime();
const projectLoading = ref(false);
const isStandalone = computed(() => runtimeStore.networkMode === 'offline');
const emits = defineEmits(['fresh', 'filter', 'changeProject']);
const isView = computed(() => apidocBaseInfoStore.mode === 'view') //当前工作区状态
const toggleProjectVisible = ref(false);
//新增文件或者文件夹成功回调
const handleAddFileAndFolderCb = (data: ApidocBanner) => {
  addFileAndFolderCb.call(this, ref(null), data)
};
//=====================================操作栏数据====================================//
const bannerData = computed(() => {
  const originBannerData = apidocBannerStore.banner;
  return originBannerData
})
const operations: Ref<Operation[]> = ref([]);
const pinOperations: Ref<Operation[]> = ref([]);
const visible = ref(false);
const addFileDialogVisible = ref(false);
const addFolderDialogVisible = ref(false);
const { projectName } = storeToRefs(apidocBaseInfoStore)
//=====================================操作相关数据====================================//
//初始化缓存数据
const initCacheOperation = () => {
  const localPinToolbarOperations = projectWorkbenchCache.getProjectWorkbenchPinToolbarOperations();
  const availableOperations = originOperaions.filter((v) => {
    if (isStandalone.value && v.op === 'generateLink') {
      return false;
    }
    return true;
  });
  operations.value = availableOperations;
  if (localPinToolbarOperations.length > 0) {
    const localData: Operation[] = localPinToolbarOperations
      .map((item) => ({ ...item }))
      .filter((item) => availableOperations.some((operation) => operation.op === item.op));
    availableOperations.forEach((data) => {
      const matchedData = localData.find((v: Operation) => v.op === data.op);
      if (matchedData) {
        matchedData.icon = data.icon;
        matchedData.name = data.name;
      }
    });
    if (localData.length > 0) {
      pinOperations.value = localData;
      return;
    }
  }
  pinOperations.value = availableOperations.filter((v) => v.pin);
}
//缓存工具栏操作
watch(pinOperations, (v) => {
  projectWorkbenchCache.setProjectWorkbenchPinToolbarOperations(v)
}, {
  deep: true
})
//=====================================工具栏操作====================================//
//切换固定操作
const togglePin = (element: Operation) => {
  element.pin = !element.pin;
  pinOperations.value = operations.value.filter((v) => v.pin);
}
//隐藏更多操作
const handleHidePopover = () => {
  visible.value = false;
  toggleProjectVisible.value = false;
}
onMounted(() => {
  document.documentElement.addEventListener('click', handleHidePopover);
  initCacheOperation();
});
onUnmounted(() => {
  document.documentElement.removeEventListener('click', handleHidePopover);
})
//点击操作按钮
const projectId = router.currentRoute.value.query.id as string;
const handleEmit = (op: ApidocOperations) => {
  if (isView.value && op !== 'freshBanner' && op !== 'history') {
    return
  }
  switch (op) {
    case 'addRootFolder': //新建文件夹
      addFolderDialogVisible.value = true;
      break;
    case 'addRootFile': //新建文件
      addFileDialogVisible.value = true;
      break;
    case 'freshBanner': //刷新页面
      emits('fresh');
      break;
    case 'generateLink': //项目分享
      apidocTabsStore.addTab({
        _id: 'onlineLink',
        projectId,
        tabType: 'onlineLink',
        label: t('项目分享'),
        head: {
          icon: '',
          color: ''
        },
        saved: true,
        fixed: true,
        selected: true,
      })
      break;
    case 'exportDoc': //导出文档
      apidocTabsStore.addTab({
        _id: 'exportDoc',
        projectId,
        tabType: 'exportDoc',
        label: t('导出文档'),
        head: {
          icon: '',
          color: ''
        },
        saved: true,
        fixed: true,
        selected: true,
      })
      break;
    case 'importDoc': //导入文档
      apidocTabsStore.addTab({
        _id: 'importDoc',
        projectId,
        tabType: 'importDoc',
        label: t('导入文档'),
        head: {
          icon: '',
          color: ''
        },
        saved: true,
        fixed: true,
        selected: true,
      })
      break;
    case 'recycler': //回收站
      apidocTabsStore.addTab({
        _id: 'recycler',
        projectId,
        tabType: 'recycler',
        label: t('回收站'),
        head: {
          icon: '',
          color: ''
        },
        saved: true,
        fixed: true,
        selected: true,
      })
      break;
    case 'history': //操作审计
      apidocTabsStore.addTab({
        _id: 'history',
        projectId,
        tabType: 'history',
        label: t('操作审计'),
        head: {
          icon: '',
          color: ''
        },
        saved: true,
        fixed: true,
        selected: true,
      })
      break;
    case 'commonHeader': //公共请求头
      apidocTabsStore.addTab({
        _id: 'commonHeader',
        projectId,
        tabType: 'commonHeader',
        label: t('公共请求头'),
        head: {
          icon: '',
          color: ''
        },
        saved: true,
        fixed: true,
        selected: true,
      })
      break;
    case 'variable': //接口编排
      apidocTabsStore.addTab({
        _id: 'variable',
        projectId,
        tabType: 'variable',
        label: t('变量'),
        head: {
          icon: '',
          color: ''
        },
        saved: true,
        fixed: true,
        selected: true,
      })
      break;
    case 'cookies': //cookies
      apidocTabsStore.addTab({
        _id: 'cookies',
        projectId,
        tabType: 'cookies',
        label: t('Cookies'),
        head: {
          icon: '',
          color: ''
        },
        saved: true,
        fixed: true,
        selected: true,
      })
      break;
    default:
      break;
  }
  visible.value = false;
}
/*
|--------------------------------------------------------------------------
| 数据过滤
|--------------------------------------------------------------------------
*/
const formInfo = ref({
  iptValue: '', //u
  startTime: null as null | number, //--起始日期
  endTime: null as null | number, //----结束日期
  maintainers: [] as string[], //----操作者信息
  recentNum: 0, //-显示最近多少条
})
//是否存在过滤条件
const hasFilterCondition = computed(() => {
  const hasTimeCondition = formInfo.value.startTime && formInfo.value.endTime;
  const hasOperatorCondition = formInfo.value.maintainers.length > 0;
  const hasRecentNumCondition = formInfo.value.recentNum;
  return !!(hasTimeCondition || hasOperatorCondition || hasRecentNumCondition);
})

//用户列表
const maintainerEnum = computed(() => {
  const { banner } = apidocBannerStore;
  const allBanner: string[] = [];
  forEachForest(banner, (bannerInfo) => {
    if (bannerInfo.maintainer && !allBanner.includes(bannerInfo.maintainer)) {
      allBanner.push(bannerInfo.maintainer);
    }
  })
  return allBanner;
});
//=====================================日期相关====================================//
//日期范围
const dateRange = ref('');
//自定义日期范围
const customDateRange = ref([]);
//清空日期
const handleClearDate = () => {
  dateRange.value = ''
}
//监听日起段变化
watch(() => dateRange.value, (val) => {
  let startTime: number | null = new Date(new Date().setHours(0, 0, 0, 0)).valueOf();
  let endTime = null;
  switch (val) {
    case '1d':
      endTime = Date.now();
      break;
    case '2d':
      endTime = Date.now();
      startTime = endTime - 86400000;
      break;
    case '3d':
      endTime = Date.now();
      startTime = endTime - 3 * 86400000;
      break;
    case '7d':
      endTime = Date.now();
      startTime = endTime - 7 * 86400000;
      break;
    case 'yesterday':
      endTime = startTime;
      startTime -= 86400000;
      break;
    default: //自定义
      startTime = null;
      endTime = null;
      customDateRange.value = [];
      break;
  }
  formInfo.value.startTime = startTime;
  formInfo.value.endTime = endTime;
})
//监听日期段变化
watch(() => customDateRange.value, (val) => {
  if (!val || val.length === 0) {
    formInfo.value.startTime = null;
    formInfo.value.endTime = null;
  } else {
    formInfo.value.startTime = val[0];
    formInfo.value.endTime = val[1];
  }
})
//=====================================维护者信息====================================//
//清除所有的维护者数据
const handleClearMaintainer = () => {
  formInfo.value.maintainers = [];
}
//=====================================最近数据条数====================================//
//清除最近新增条数条件
const handleClearRecentNum = () => {
  formInfo.value.recentNum = 0;
}
//=====================================监听数据变化====================================//
watch(() => formInfo.value, (formData) => {
  let plainBannerData: ApidocBanner[] = [];
  const { startTime, endTime, maintainers, recentNum } = formData;
  forEachForest(bannerData.value, (v) => {
    if (v.type !== 'folder') {
      plainBannerData.push(v);
    }
  })
  if (maintainers.length === 0 && !startTime && !recentNum) {
    emits('filter', {
      iptValue: formData.iptValue,
      recentNumIds: null,
    });
    return
  }

  //录入人员
  if (maintainers.length > 0) {
    plainBannerData = plainBannerData.filter(v => maintainers.find(v2 => v2 === v.maintainer))
  }
  //录入时间
  if (startTime && endTime) {
    plainBannerData = plainBannerData.filter(v => {
      const updateTimestamp = new Date(v.updatedAt).getTime();
      return updateTimestamp > startTime && updateTimestamp < endTime;
    })
  }
  //录入数据个数
  if (recentNum) {
    plainBannerData = plainBannerData.sort((a, b) => {
      const aTime = new Date(a.updatedAt).getTime();
      const bTime = new Date(b.updatedAt).getTime();
      return bTime - aTime;
    }).slice(0, recentNum)
  }
  emits('filter', {
    iptValue: formData.iptValue,
    recentNumIds: plainBannerData.map(v => v._id),
  });
}, {
  deep: true,
  immediate: true,
});
//banner数据过滤
const handleFilterBanner = () => {
  let plainBannerData: ApidocBanner[] = [];
  const { startTime, endTime, maintainers, recentNum } = formInfo.value;
  forEachForest(bannerData.value, (v) => {
    if (v.type !== 'folder') {
      plainBannerData.push(v);
    }
  })
  if (maintainers.length === 0 && !startTime && !recentNum) {
    emits('filter', {
      iptValue: formInfo.value.iptValue,
      recentNumIds: null,
    });
    return
  }
  //录入人员
  if (maintainers.length > 0) {
    plainBannerData = plainBannerData.filter(v => maintainers.find(v2 => v2 === v.maintainer))
  }
  //录入时间
  if (startTime && endTime) {
    plainBannerData = plainBannerData.filter(v => {
      const updateTimestamp = new Date(v.updatedAt).getTime();
      return updateTimestamp > startTime && updateTimestamp < endTime;
    })
  }
  //录入数据个数
  if (formInfo.value.recentNum) {
    plainBannerData.sort((a, b) => {
      const aTime = new Date(a.updatedAt).getTime();
      const bTime = new Date(b.updatedAt).getTime();
      return aTime - bTime;
    }).slice(0, formInfo.value.recentNum)
  }
  emits('filter', {
    iptValue: formInfo.value.iptValue,
    recentNumIds: plainBannerData.map(v => v._id),
  });
}
/*
|--------------------------------------------------------------------------
| 切换项目相关
|--------------------------------------------------------------------------
*/
const startProjectList = computed(() => projectList.value.filter((item) => item.isStared));
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
}
//改变项目列表
const handleChangeProject = (item: ApidocProjectInfo) => {
  if (item._id === router.currentRoute.value.query.id) {
    return;
  }
  if (!isStandalone.value) {
    request.put('/api/project/visited', { projectId: item._id }).catch((err) => {
      console.error(err);
    });
  }

  // 同步更新header tabs - 发送事件通知header添加或激活对应的项目tab
  window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.switchProject, {
    projectId: item._id,
    projectName: item.projectName
  });

  router.push({
    path: '/v1/apidoc/doc-edit',
    query: {
      id: item._id,
      mode: router.currentRoute.value.query.mode,
    },
  });
  apidocBaseInfoStore.initProjectBaseInfo({ projectId: item._id });
  apidocBaseInfoStore.getCommonHeaders()
  apidocBannerStore.changeBannerLoading(true)
  apidocBannerStore.getDocBanner({ projectId: item._id, }).finally(() => {
    apidocBannerStore.changeBannerLoading(false)
  });
  emits('changeProject', item._id)
}
//打开或者关闭项目列表切换
const handleToggleProjectModel = () => {
  if (!toggleProjectVisible.value) {
    getProjectList();
  }
  toggleProjectVisible.value = !toggleProjectVisible.value;
}
</script>

<style lang='scss' scoped>
.tool {
  position: relative;
  padding: 0 20px;
  height: var(--apiflow-banner-tool-height);
  background: var(--gray-200);
  flex: 0 0 auto;

  .toggle-btn {
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 30px;
    cursor: pointer;

    &:hover {
      color: var(--theme-color);
    }
  }

  .badge {
    width: 25px;
    height: 25px;
    position: absolute;
    top: 8px;
    right: 25px;
    display: flex;
    align-items: center;
    justify-content: center;

    .el-badge__content {
      transition: none;
    }
  }

  //高级筛选按钮
  .advance {
    &>i {
      font-size: 14px;
      cursor: pointer;
      color: var(--gray-600);
    }
  }

  // 搜索框样式
  .doc-search {
    .el-input__wrapper {
      border-radius: 20px;
    }
  }

  // 快捷方式样式
  .tool-icon {
    position: relative;
    align-items: center;
    display: flex;

    .item {
      outline: none;
    }

    .operation {
      width: 85%;
      display: flex;
      justify-content: space-between;
    }

    .more {
      display: flex;
      justify-content: center;
      margin-left: auto;
      width: 10%;
      position: relative;
    }

    .svg-icon {
      width: 25px;
      height: 25px;
      padding: 5px;

      &:hover {
        background: var(--gray-400);
      }
    }

    .lucide-icon {
      width: 25px;
      height: 25px;
      padding: 2px;
      cursor: pointer;

      &:hover {
        background: var(--gray-400);
      }
    }
  }

  .more-op {
    width: 25px;
    height: 25px;
    line-height: 25px;
    text-align: center;
    cursor: pointer;

    &:hover {
      background: var(--gray-400);
    }
  }
}

.dropdown-item {
  height: 40px;
  width: 100%;
  padding: 0 10px 0 20px;
  display: flex;
  align-items: center;

  // cursor: default;
  .label {
    width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
  }

  .shortcut {
    width: 100px;
    color: var(--gray-500);
  }

  .svg-icon {
    width: 25px;
    height: 25px;
    padding: 5px;
  }

  .lucide-icon {
    width: 25px;
    height: 25px;
    padding: 2px;
  }

  .pin {
    cursor: pointer;
    color: var(--gray-400);

    &.active {
      color: var(--theme-color);

      &:hover {
        color: var(--theme-color);
      }
    }
  }

  &:hover {
    background: var(--gray-200);
  }
}

.toolbar-close {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 5px;
  top: 5px;
  font-size: 18px;
  width: 22px;
  height: 22px;
  color: var(--el-color-danger);
  cursor: pointer;
  border-radius: 50%;
  &:hover {
    background: var(--bg-hover);
  }
}

.el-popover.el-popper.tool-panel {
  padding: 0;
}

.search-panel {
  flex: 0 0 auto;

  .el-checkbox,
  .el-radio {
    margin-right: 15px;
  }

  .el-checkbox-group {
    display: flex;
  }

  .op-item {
    min-height: 40px;
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    &:not(:last-of-type) {
      border-bottom: 1px dashed var(--gray-300);
    }

    .el-button--text {
      padding-top: 5px;
      padding-bottom: 5px;
    }

    .el-radio-group {
      display: flex;
      align-items: center;
    }
  }
}

.tool-toggle-project {
  min-height: 300px;

  h3 {
    margin-top: 5px;
    margin-bottom: 5px;
  }

  .project-wrap {
    padding: 0 10px 0 20px;
    max-height: 300px;
    overflow-y: auto;
  }

  .item {
    height: 35px;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .item-title {
      flex: 0 0 75%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-right: 25px;
    }

    &:hover {
      background-color: var(--theme-color);
      color: var(--white);
      cursor: pointer;

      .item-content {
        color: var(--white);
      }
    }
  }
  .toolbar-header {
    border-bottom: 1px solid var(--gray-300);
  }
}
</style>
